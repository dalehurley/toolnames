import { useRef, useCallback } from "react";
import OpenAI from "openai";
import { PROVIDER_MAP, NO_SYSTEM_PROMPT_MODELS, NO_STREAMING_MODELS } from "@/providers/ai";
import { useAIPlaygroundStore, ChatMessage } from "@/store/aiPlayground";
import { toast } from "sonner";

interface StreamOptions {
  conversationId: string;
  providerId: string;
  modelId: string;
  messages: ChatMessage[];
  systemPrompt?: string;
  onToken?: (token: string) => void;
  onDone?: (fullText: string) => void;
  onError?: (error: string) => void;
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

  const sendStream = useCallback(async (opts: StreamOptions) => {
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

    // Build messages for API
    const supportsSystemPrompt = !NO_SYSTEM_PROMPT_MODELS.includes(opts.modelId);
    const apiMessages: Array<{ role: string; content: unknown }> = [];

    if (opts.systemPrompt && supportsSystemPrompt) {
      apiMessages.push({ role: "system", content: opts.systemPrompt });
    }

    for (const msg of opts.messages) {
      apiMessages.push({ role: msg.role, content: msg.content });
    }

    // Create client
    const client = new OpenAI({
      apiKey,
      baseURL: provider.baseURL,
      dangerouslyAllowBrowser: true,
      defaultHeaders: provider.extraHeaders,
    });

    const settings = useAIPlaygroundStore.getState().settings;
    const useStreaming = !NO_STREAMING_MODELS.includes(opts.modelId);

    // Add placeholder assistant message
    const assistantMsgId = addMessage(opts.conversationId, {
      role: "assistant",
      content: "",
    });

    abortRef.current = new AbortController();

    try {
      let fullText = "";

      if (useStreaming) {
        const stream = await client.chat.completions.create(
          {
            model: opts.modelId,
            messages: apiMessages as Parameters<typeof client.chat.completions.create>[0]["messages"],
            stream: true,
            temperature: settings.params.temperature,
            max_tokens: settings.params.maxTokens,
            top_p: settings.params.topP,
            frequency_penalty: settings.params.frequencyPenalty,
            presence_penalty: settings.params.presencePenalty,
          },
          { signal: abortRef.current.signal }
        );

        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta?.content || "";
          if (delta) {
            fullText += delta;
            opts.onToken?.(delta);
            updateMessage(opts.conversationId, assistantMsgId, fullText);
          }
          // Track usage
          if (chunk.usage) {
            addUsage(opts.providerId, chunk.usage.total_tokens || 0);
          }
        }
      } else {
        // Non-streaming fallback
        const completion = await client.chat.completions.create(
          {
            model: opts.modelId,
            messages: apiMessages as Parameters<typeof client.chat.completions.create>[0]["messages"],
            stream: false,
            max_tokens: settings.params.maxTokens,
          },
          { signal: abortRef.current.signal }
        );
        fullText = completion.choices[0]?.message?.content || "";
        updateMessage(opts.conversationId, assistantMsgId, fullText);
        if (completion.usage) {
          addUsage(opts.providerId, completion.usage.total_tokens || 0);
        }
      }

      opts.onDone?.(fullText);
    } catch (err: unknown) {
      if ((err as { name?: string })?.name === "AbortError") {
        // User cancelled — leave partial message
        return;
      }
      let msg = "An error occurred";
      if (err instanceof Error) msg = err.message;
      if ((err as { status?: number })?.status === 401) msg = `Invalid API key for ${provider.name}`;
      if ((err as { status?: number })?.status === 429) msg = `Rate limited by ${provider.name}. Try again soon.`;
      if ((err as { status?: number })?.status === 404) msg = `Model ${opts.modelId} not found on ${provider.name}`;

      updateMessage(opts.conversationId, assistantMsgId, `❌ Error: ${msg}`);
      opts.onError?.(msg);
      toast.error(msg);
    } finally {
      abortRef.current = null;
    }
  }, [addMessage, updateMessage, getKey, addUsage]);

  // Function to test a provider connection
  const testConnection = useCallback(async (providerId: string, apiKey: string): Promise<boolean> => {
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
        // Try a minimal chat completion
        await client.chat.completions.create({
          model: provider.hardcodedModels[0]?.id || "test",
          messages: [{ role: "user", content: "Hi" }],
          max_tokens: 1,
          stream: false,
        });
        return true;
      }
    } catch (err: unknown) {
      // 401 means invalid key (but connection worked)
      if ((err as { status?: number })?.status === 401) return false;
      // Other errors might mean the model doesn't exist but key is valid
      if ((err as { status?: number })?.status === 404) return true;
      if ((err as { status?: number })?.status === 400) return true;
      return false;
    }
  }, []);

  // Fetch available models from provider
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
