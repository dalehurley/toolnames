import { useRef, useCallback } from "react";
import OpenAI from "openai";
import { PROVIDER_MAP, NO_SYSTEM_PROMPT_MODELS, NO_STREAMING_MODELS } from "@/providers/ai";
import { useAIPlaygroundStore, ChatMessage } from "@/store/aiPlayground";
import { toast } from "sonner";
import {
  CLIENT_TOOLS,
  TOOL_BY_NAME,
  toOpenAITools,
  ClientToolResult,
} from "@/utils/clientTools";

interface ToolCallAccumulator {
  id: string;
  name: string;
  arguments: string;
}

export interface ToolCallRecord {
  id: string;
  name: string;
  args: Record<string, unknown>;
  result: ClientToolResult;
}

export type AgenticMode =
  | "none"
  | "react"
  | "plan_execute"
  | "chain_of_thought"
  | "tree_of_thought";

interface StreamOptions {
  conversationId: string;
  providerId: string;
  modelId: string;
  messages: ChatMessage[];
  systemPrompt?: string;
  enabledToolNames?: string[];
  agenticMode?: AgenticMode;
  agenticMaxIterations?: number;
  onToken?: (token: string) => void;
  onDone?: (fullText: string, toolCalls?: ToolCallRecord[]) => void;
  onError?: (error: string) => void;
  onToolCall?: (toolCall: ToolCallRecord) => void;
  onAgentStep?: (step: number, thought: string) => void;
}

type ApiMessage = { role: string; content: unknown };

function buildApiMessages(opts: StreamOptions): ApiMessage[] {
  const supportsSystemPrompt = !NO_SYSTEM_PROMPT_MODELS.includes(opts.modelId);
  const apiMessages: ApiMessage[] = [];
  if (opts.systemPrompt && supportsSystemPrompt) {
    apiMessages.push({ role: "system", content: opts.systemPrompt });
  }
  for (const msg of opts.messages) {
    apiMessages.push({ role: msg.role, content: msg.content });
  }
  return apiMessages;
}

function parsePlanSteps(text: string): string[] {
  const steps: string[] = [];
  for (const line of text.split("\n")) {
    const m = line.match(/^\s*(\d+)[.)]\s+(.+)/);
    if (m) steps.push(m[2].trim());
  }
  return steps;
}

type StoreSettings = ReturnType<typeof useAIPlaygroundStore.getState>["settings"];

async function runSingleTurn(
  client: OpenAI,
  model: string,
  messages: ApiMessage[],
  settings: StoreSettings,
  openAITools: object[] | undefined,
  abortSignal: AbortSignal | undefined,
  providerId: string,
  addUsage: (p: string, n: number) => void,
  onToolCall?: (r: ToolCallRecord) => void,
  maxToolLoops = 4
): Promise<{ text: string; toolCalls: ToolCallRecord[] }> {
  const allToolCalls: ToolCallRecord[] = [];
  let apiMessages = [...messages];
  let finalText = "";

  for (let loop = 0; loop < maxToolLoops; loop++) {
    const completion = await client.chat.completions.create(
      {
        model,
        messages: apiMessages as Parameters<typeof client.chat.completions.create>[0]["messages"],
        stream: false,
        temperature: settings.params.temperature,
        max_tokens: settings.params.maxTokens,
        top_p: settings.params.topP,
        ...(openAITools
          ? { tools: openAITools as Parameters<typeof client.chat.completions.create>[0]["tools"] }
          : {}),
      },
      { signal: abortSignal }
    );

    finalText = completion.choices[0]?.message?.content || "";
    const finishReason = completion.choices[0]?.finish_reason;
    if (completion.usage) addUsage(providerId, completion.usage.total_tokens || 0);

    const ntc = completion.choices[0]?.message?.tool_calls;
    if (!ntc || ntc.length === 0 || finishReason !== "tool_calls") break;

    const toolCallApiObjects: object[] = [];
    const toolResultMessages: ApiMessage[] = [];

    for (const tc of ntc as Array<{
      id: string;
      function?: { name?: string; arguments?: string };
    }>) {
      let args: Record<string, unknown> = {};
      try {
        args = JSON.parse(tc.function?.arguments || "{}");
      } catch { /* ignore */ }

      const toolDef = TOOL_BY_NAME[tc.function?.name || ""];
      let result: ClientToolResult;
      if (toolDef) {
        result = await toolDef.execute(args);
      } else {
        result = {
          type: "calculator",
          data: { error: "Unknown tool" },
          text: `Tool "${tc.function?.name}" not found`,
        };
      }

      const record: ToolCallRecord = {
        id: tc.id,
        name: tc.function?.name || "",
        args,
        result,
      };
      allToolCalls.push(record);
      onToolCall?.(record);

      toolCallApiObjects.push({
        id: tc.id,
        type: "function",
        function: { name: tc.function?.name, arguments: tc.function?.arguments },
      });
      toolResultMessages.push({
        role: "tool",
        content: result.text,
        tool_call_id: tc.id,
      } as unknown as ApiMessage);
    }

    apiMessages = [
      ...apiMessages,
      {
        role: "assistant",
        content: finalText || null,
        tool_calls: toolCallApiObjects,
      } as unknown as ApiMessage,
      ...toolResultMessages,
    ];
  }

  return { text: finalText, toolCalls: allToolCalls };
}

async function runPlanExecute(
  opts: StreamOptions,
  client: OpenAI,
  settings: StoreSettings,
  apiMessages: ApiMessage[],
  assistantMsgId: string,
  openAITools: object[] | undefined,
  abortController: AbortController | null,
  addUsage: (p: string, n: number) => void,
  updateMessage: (cId: string, mId: string, content: string) => void
): Promise<{ fullText: string; toolCalls: ToolCallRecord[] }> {
  const allToolCalls: ToolCallRecord[] = [];
  const maxSteps = opts.agenticMaxIterations ?? 8;

  updateMessage(opts.conversationId, assistantMsgId, "📋 _Generating plan…_");

  const { text: planText, toolCalls: planTools } = await runSingleTurn(
    client,
    opts.modelId,
    apiMessages,
    settings,
    undefined,
    abortController?.signal,
    opts.providerId,
    addUsage,
    opts.onToolCall,
    1
  );
  allToolCalls.push(...planTools);

  const steps = parsePlanSteps(planText);

  if (steps.length === 0) {
    updateMessage(opts.conversationId, assistantMsgId, planText);
    return { fullText: planText, toolCalls: allToolCalls };
  }

  type StepState = "pending" | "running" | "done";
  const stepStates: StepState[] = steps.map(() => "pending");
  const stepResults: string[] = [];

  const renderDisplay = () => {
    let out = planText + "\n\n---\n\n";
    for (let i = 0; i < steps.length; i++) {
      const icon =
        stepStates[i] === "done" ? "✅" : stepStates[i] === "running" ? "⚡" : "⬜";
      out += `${icon} **Step ${i + 1}**: ${steps[i]}\n`;
      if (stepStates[i] === "done" && stepResults[i]) {
        const preview = stepResults[i].split("\n")[0].slice(0, 120);
        out += `   > ${preview}\n\n`;
      }
    }
    return out;
  };

  updateMessage(opts.conversationId, assistantMsgId, renderDisplay());

  let executionHistory: ApiMessage[] = [
    ...apiMessages,
    { role: "assistant", content: planText },
  ];

  for (let i = 0; i < Math.min(steps.length, maxSteps); i++) {
    stepStates[i] = "running";
    updateMessage(opts.conversationId, assistantMsgId, renderDisplay());

    const stepMessages: ApiMessage[] = [
      ...executionHistory,
      {
        role: "user",
        content: `Execute step ${i + 1}: "${steps[i]}"\n\nUse tools as needed. Provide a concise result for this step only.`,
      },
    ];

    const { text: stepText, toolCalls: stepTools } = await runSingleTurn(
      client,
      opts.modelId,
      stepMessages,
      settings,
      openAITools,
      abortController?.signal,
      opts.providerId,
      addUsage,
      opts.onToolCall
    );
    allToolCalls.push(...stepTools);

    stepStates[i] = "done";
    stepResults[i] = stepText;

    executionHistory = [
      ...executionHistory,
      { role: "user", content: `Execute step ${i + 1}: "${steps[i]}"` },
      { role: "assistant", content: stepText },
    ];

    opts.onAgentStep?.(i, stepText);
    updateMessage(opts.conversationId, assistantMsgId, renderDisplay());
  }

  const finalDisplay = renderDisplay() + "\n---\n\n✨ **All steps complete.**";
  updateMessage(opts.conversationId, assistantMsgId, finalDisplay);
  return { fullText: finalDisplay, toolCalls: allToolCalls };
}

export function useStream() {
  const abortRef = useRef<AbortController | null>(null);
  const { addMessage, updateMessage, getKey, addUsage } = useAIPlaygroundStore();

  const stop = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
  }, []);

  const sendStream = useCallback(
    async (opts: StreamOptions) => {
      const provider = PROVIDER_MAP[opts.providerId];
      if (!provider) {
        opts.onError?.("Unknown provider");
        return;
      }

      const apiKey = provider.requiresKey ? getKey(opts.providerId) : "ollama";
      if (provider.requiresKey && !apiKey) {
        const msg = `No API key for ${provider.name}. Open Settings (⚙) to add one.`;
        opts.onError?.(msg);
        toast.error(msg);
        return;
      }

      const client = new OpenAI({
        apiKey,
        baseURL: provider.baseURL,
        dangerouslyAllowBrowser: true,
        defaultHeaders: provider.extraHeaders,
      });

      const settings = useAIPlaygroundStore.getState().settings;
      const useStreaming = !NO_STREAMING_MODELS.includes(opts.modelId);

      const toolsToPass =
        opts.enabledToolNames && opts.enabledToolNames.length > 0
          ? CLIENT_TOOLS.filter((t) => opts.enabledToolNames!.includes(t.name))
          : [];
      const openAITools = toolsToPass.length > 0 ? toOpenAITools(toolsToPass) : undefined;

      const assistantMsgId = addMessage(opts.conversationId, {
        role: "assistant",
        content: "",
      });

      abortRef.current = new AbortController();

      // ── Plan-Execute: dedicated multi-phase orchestration ──────────────────
      if (opts.agenticMode === "plan_execute") {
        const apiMessages = buildApiMessages(opts);
        try {
          const { fullText, toolCalls } = await runPlanExecute(
            opts,
            client,
            settings,
            apiMessages,
            assistantMsgId,
            openAITools,
            abortRef.current,
            addUsage,
            updateMessage
          );
          opts.onDone?.(fullText, toolCalls.length > 0 ? toolCalls : undefined);
        } catch (err: unknown) {
          if ((err as { name?: string })?.name === "AbortError") return;
          const msg = err instanceof Error ? err.message : "An error occurred";
          updateMessage(opts.conversationId, assistantMsgId, `❌ Error: ${msg}`);
          opts.onError?.(msg);
          toast.error(msg);
        } finally {
          abortRef.current = null;
        }
        return;
      }

      // ── ReAct / CoT / ToT / Standard: streaming tool-call loop ────────────
      let apiMessages = buildApiMessages(opts);
      const allToolCallRecords: ToolCallRecord[] = [];

      try {
        let continueLoop = true;
        let fullText = "";
        let loopCount = 0;
        const maxLoops =
          opts.agenticMode && opts.agenticMode !== "none"
            ? (opts.agenticMaxIterations ?? 8)
            : 8;

        while (continueLoop && loopCount < maxLoops) {
          loopCount++;
          fullText = "";
          const toolCallsAccum: Record<number, ToolCallAccumulator> = {};
          let finishReason: string | null | undefined = null;

          if (useStreaming) {
            type StreamChunk = OpenAI.Chat.Completions.ChatCompletionChunk;
            const stream: AsyncIterable<StreamChunk> = await client.chat.completions.create(
              {
                model: opts.modelId,
                messages:
                  apiMessages as Parameters<
                    typeof client.chat.completions.create
                  >[0]["messages"],
                stream: true,
                temperature: settings.params.temperature,
                max_tokens: settings.params.maxTokens,
                top_p: settings.params.topP,
                frequency_penalty: settings.params.frequencyPenalty,
                presence_penalty: settings.params.presencePenalty,
                ...(openAITools
                  ? {
                      tools: openAITools as Parameters<
                        typeof client.chat.completions.create
                      >[0]["tools"],
                    }
                  : {}),
              },
              { signal: abortRef.current?.signal }
            ) as unknown as AsyncIterable<StreamChunk>;

            for await (const chunk of stream) {
              const delta = chunk.choices[0]?.delta;
              finishReason = chunk.choices[0]?.finish_reason;

              if (delta?.content) {
                fullText += delta.content;
                opts.onToken?.(delta.content);
                updateMessage(opts.conversationId, assistantMsgId, fullText);
              }

              if (delta?.tool_calls) {
                for (const tc of delta.tool_calls) {
                  const idx = tc.index ?? 0;
                  if (!toolCallsAccum[idx]) {
                    toolCallsAccum[idx] = { id: "", name: "", arguments: "" };
                  }
                  if (tc.id) toolCallsAccum[idx].id = tc.id;
                  if (tc.function?.name) toolCallsAccum[idx].name = tc.function.name;
                  if (tc.function?.arguments) {
                    toolCallsAccum[idx].arguments += tc.function.arguments;
                  }
                }
              }

              if (chunk.usage) {
                addUsage(opts.providerId, chunk.usage.total_tokens || 0);
              }
            }
          } else {
            const completion = await client.chat.completions.create(
              {
                model: opts.modelId,
                messages:
                  apiMessages as Parameters<
                    typeof client.chat.completions.create
                  >[0]["messages"],
                stream: false,
                max_tokens: settings.params.maxTokens,
                ...(openAITools
                  ? {
                      tools: openAITools as Parameters<
                        typeof client.chat.completions.create
                      >[0]["tools"],
                    }
                  : {}),
              },
              { signal: abortRef.current?.signal }
            );
            fullText = completion.choices[0]?.message?.content || "";
            finishReason = completion.choices[0]?.finish_reason;
            updateMessage(opts.conversationId, assistantMsgId, fullText);

            const ntc = completion.choices[0]?.message?.tool_calls;
            if (ntc) {
              (
                ntc as Array<{
                  id: string;
                  function?: { name?: string; arguments?: string };
                }>
              ).forEach((tc, idx) => {
                toolCallsAccum[idx] = {
                  id: tc.id,
                  name: tc.function?.name ?? "",
                  arguments: tc.function?.arguments ?? "",
                };
              });
            }
            if (completion.usage) {
              addUsage(opts.providerId, completion.usage.total_tokens || 0);
            }
          }

          // ── Handle tool calls ────────────────────────────────────────────
          const hasToolCalls =
            finishReason === "tool_calls" || Object.keys(toolCallsAccum).length > 0;

          if (hasToolCalls && Object.keys(toolCallsAccum).length > 0) {
            const toolNames = Object.values(toolCallsAccum)
              .map((tc) => tc.name)
              .join(", ");
            updateMessage(
              opts.conversationId,
              assistantMsgId,
              fullText + `\n\n⚙️ _Calling tools: ${toolNames}…_`
            );

            const toolResultMessages: Array<{
              role: string;
              content: unknown;
              tool_call_id: string;
            }> = [];
            const toolCallApiObjects = [];

            for (const [, tc] of Object.entries(toolCallsAccum)) {
              let args: Record<string, unknown> = {};
              try {
                args = JSON.parse(tc.arguments || "{}");
              } catch {
                // ignore parse errors
              }

              const toolDef = TOOL_BY_NAME[tc.name];
              let result: ClientToolResult;

              if (toolDef) {
                result = await toolDef.execute(args);
              } else {
                result = {
                  type: "calculator",
                  data: { error: "Unknown tool" },
                  text: `Tool "${tc.name}" not found`,
                };
              }

              const record: ToolCallRecord = { id: tc.id, name: tc.name, args, result };
              allToolCallRecords.push(record);
              opts.onToolCall?.(record);

              toolCallApiObjects.push({
                id: tc.id,
                type: "function" as const,
                function: { name: tc.name, arguments: tc.arguments },
              });
              toolResultMessages.push({
                role: "tool",
                content: result.text,
                tool_call_id: tc.id,
              });
            }

            apiMessages = [
              ...apiMessages,
              {
                role: "assistant" as const,
                content: fullText || null,
                tool_calls: toolCallApiObjects,
              } as unknown as { role: string; content: unknown },
              ...(toolResultMessages as unknown as Array<{ role: string; content: unknown }>),
            ];

            updateMessage(opts.conversationId, assistantMsgId, "");
            continueLoop = true;
            opts.onAgentStep?.(loopCount - 1, fullText);
          } else {
            continueLoop = false;
          }
        }

        updateMessage(opts.conversationId, assistantMsgId, fullText);
        opts.onDone?.(fullText, allToolCallRecords.length > 0 ? allToolCallRecords : undefined);
      } catch (err: unknown) {
        if ((err as { name?: string })?.name === "AbortError") {
          return;
        }
        let msg = "An error occurred";
        if (err instanceof Error) msg = err.message;
        if ((err as { status?: number })?.status === 401)
          msg = `Invalid API key for ${provider.name}`;
        if ((err as { status?: number })?.status === 429)
          msg = `Rate limited by ${provider.name}. Try again soon.`;
        if ((err as { status?: number })?.status === 404)
          msg = `Model ${opts.modelId} not found on ${provider.name}`;

        updateMessage(opts.conversationId, assistantMsgId, `❌ Error: ${msg}`);
        opts.onError?.(msg);
        toast.error(msg);
      } finally {
        abortRef.current = null;
      }
    },
    [addMessage, updateMessage, getKey, addUsage]
  );

  const testConnection = useCallback(
    async (providerId: string, apiKey: string): Promise<boolean> => {
      const provider = PROVIDER_MAP[providerId];
      if (!provider) return false;
      try {
        const client = new OpenAI({
          apiKey: apiKey || "test",
          baseURL: provider.baseURL,
          dangerouslyAllowBrowser: true,
          defaultHeaders: provider.extraHeaders,
        });
        if (provider.supportsModelsEndpoint) {
          await client.models.list();
          return true;
        } else {
          await client.chat.completions.create({
            model: provider.hardcodedModels[0]?.id || "test",
            messages: [{ role: "user", content: "Hi" }],
            max_tokens: 1,
            stream: false,
          });
          return true;
        }
      } catch (err: unknown) {
        if ((err as { status?: number })?.status === 401) return false;
        if ((err as { status?: number })?.status === 404) return true;
        if ((err as { status?: number })?.status === 400) return true;
        return false;
      }
    },
    []
  );

  const fetchModels = useCallback(async (providerId: string, apiKey: string) => {
    const provider = PROVIDER_MAP[providerId];
    if (!provider?.supportsModelsEndpoint) return null;
    try {
      const client = new OpenAI({
        apiKey: apiKey || "test",
        baseURL: provider.baseURL,
        dangerouslyAllowBrowser: true,
        defaultHeaders: provider.extraHeaders,
      });
      const response = await client.models.list();
      return response.data.map((m) => ({ id: m.id, name: m.id, tags: [] as [] }));
    } catch {
      return null;
    }
  }, []);

  return { sendStream, stop, testConnection, fetchModels, isStreaming: !!abortRef.current };
}
