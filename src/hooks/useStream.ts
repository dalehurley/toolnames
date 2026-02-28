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

interface StreamOptions {
  conversationId: string;
  providerId: string;
  modelId: string;
  messages: ChatMessage[];
  systemPrompt?: string;
  enabledToolNames?: string[]; // subset of CLIENT_TOOLS to pass to AI
  onToken?: (token: string) => void;
  onDone?: (fullText: string, toolCalls?: ToolCallRecord[]) => void;
  onError?: (error: string) => void;
  onToolCall?: (toolCall: ToolCallRecord) => void;
}

function buildApiMessages(
  opts: StreamOptions
): Array<{ role: string; content: unknown }> {
  const supportsSystemPrompt = !NO_SYSTEM_PROMPT_MODELS.includes(opts.modelId);
  const apiMessages: Array<{ role: string; content: unknown }> = [];
  if (opts.systemPrompt && supportsSystemPrompt) {
    apiMessages.push({ role: "system", content: opts.systemPrompt });
  }
  for (const msg of opts.messages) {
    // Include tool results that were stored in messages
    apiMessages.push({ role: msg.role, content: msg.content });
  }
  return apiMessages;
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

      // Build tools list
      const toolsToPass =
        opts.enabledToolNames && opts.enabledToolNames.length > 0
          ? CLIENT_TOOLS.filter((t) => opts.enabledToolNames!.includes(t.name))
          : [];
      const openAITools = toolsToPass.length > 0 ? toOpenAITools(toolsToPass) : undefined;

      // Add placeholder assistant message
      const assistantMsgId = addMessage(opts.conversationId, {
        role: "assistant",
        content: "",
      });

      abortRef.current = new AbortController();

      // We may need to loop if the AI makes tool calls
      let apiMessages = buildApiMessages(opts);
      const allToolCallRecords: ToolCallRecord[] = [];

      try {
        let continueLoop = true;
        let fullText = "";
        let loopCount = 0;

        while (continueLoop && loopCount < 8) {
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
                ...(openAITools ? { tools: openAITools as Parameters<typeof client.chat.completions.create>[0]["tools"] } : {}),
              },
              { signal: abortRef.current?.signal }
            ) as unknown as AsyncIterable<StreamChunk>;

            for await (const chunk of stream) {
              const delta = chunk.choices[0]?.delta;
              finishReason = chunk.choices[0]?.finish_reason;

              // Content token
              if (delta?.content) {
                fullText += delta.content;
                opts.onToken?.(delta.content);
                updateMessage(opts.conversationId, assistantMsgId, fullText);
              }

              // Tool call accumulation
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
                ...(openAITools ? { tools: openAITools as Parameters<typeof client.chat.completions.create>[0]["tools"] } : {}),
              },
              { signal: abortRef.current?.signal }
            );
            fullText = completion.choices[0]?.message?.content || "";
            finishReason = completion.choices[0]?.finish_reason;
            updateMessage(opts.conversationId, assistantMsgId, fullText);

            // Non-streaming tool calls
            const ntc = completion.choices[0]?.message?.tool_calls;
            if (ntc) {
              (ntc as Array<{ id: string; function?: { name?: string; arguments?: string } }>)
                .forEach((tc, idx) => {
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

          // ── Handle tool calls ──────────────────────────────────────────────
          const hasToolCalls =
            finishReason === "tool_calls" || Object.keys(toolCallsAccum).length > 0;

          if (hasToolCalls && Object.keys(toolCallsAccum).length > 0) {
            // Show "calling tools…" in the placeholder
            const toolNames = Object.values(toolCallsAccum)
              .map((tc) => tc.name)
              .join(", ");
            updateMessage(
              opts.conversationId,
              assistantMsgId,
              fullText + `\n\n⚙️ _Calling tools: ${toolNames}…_`
            );

            // Execute each tool
            const toolResultMessages: Array<{ role: string; content: unknown; tool_call_id: string }> = [];
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

            // Build next round of messages: previous + assistant with tool_calls + tool results
            apiMessages = [
              ...apiMessages,
              {
                role: "assistant" as const,
                content: fullText || null,
                tool_calls: toolCallApiObjects,
              } as unknown as { role: string; content: unknown },
              ...(toolResultMessages as unknown as Array<{ role: string; content: unknown }>),
            ];

            // Clear placeholder and continue
            updateMessage(opts.conversationId, assistantMsgId, "");
            continueLoop = true;
          } else {
            // Done with tool calling loop
            continueLoop = false;
          }
        }

        // Update final message
        updateMessage(opts.conversationId, assistantMsgId, fullText);
        opts.onDone?.(fullText, allToolCallRecords.length > 0 ? allToolCallRecords : undefined);
      } catch (err: unknown) {
        if ((err as { name?: string })?.name === "AbortError") {
          return;
        }
        let msg = "An error occurred";
        if (err instanceof Error) msg = err.message;
        if ((err as { status?: number })?.status === 401) msg = `Invalid API key for ${provider.name}`;
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
