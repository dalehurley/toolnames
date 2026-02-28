import { create } from "zustand";
import { persist } from "zustand/middleware";
import { loadKey, saveKey } from "@/utils/aiEncrypt";
import { ModelConfig } from "@/providers/ai";

export type MessageRole = "user" | "assistant" | "system" | "tool";

export type EmojiReaction = "🔥" | "💡" | "⭐" | "❤️" | "👀";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
  timestamp: number;
  thumbs?: "up" | "down" | null;
  tokens?: number;
  reactions?: EmojiReaction[];
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  providerId: string;
  modelId: string;
  messages: ChatMessage[];
  systemPrompt?: string;
}

export interface ModelParams {
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  reasoningEffort?: "low" | "medium" | "high";
}

export interface ModelProfile {
  id: string;
  name: string;
  providerId: string;
  modelId: string;
  systemPrompt: string;
  params: ModelParams;
  createdAt: number;
}

export type ViewDensity = "compact" | "cozy" | "spacious";
export type AgenticMode = "none" | "react" | "plan_execute" | "chain_of_thought" | "tree_of_thought";

export interface AIPlaygroundSettings {
  selectedProviderId: string;
  selectedModelId: string;
  systemPrompt: string;
  showSystemPrompt: boolean;
  params: ModelParams;
  autoRead: boolean;
  ttsVoice: string;
  darkMode: boolean;
  compareMode: boolean;
  compareProviderId: string;
  compareModelId: string;
  viewDensity: ViewDensity;
  enabledSkillIds: string[];
  enabledToolNames: string[];
  // Agentic flow
  agenticMode: AgenticMode;
  agenticMaxIterations: number;
  agenticShowThoughts: boolean;
  agenticAutoAskHuman: boolean;
}

interface CachedModels {
  [providerId: string]: ModelConfig[];
}

interface UsageTracker {
  [providerId: string]: number; // total tokens this session
}

interface AIPlaygroundStore {
  // Conversations
  conversations: Conversation[];
  activeConversationId: string | null;

  // Starred messages: conversationId -> messageId[]
  starred: Record<string, string[]>;

  // Saved model profiles
  profiles: ModelProfile[];

  // Settings
  settings: AIPlaygroundSettings;

  // Cached models from API
  cachedModels: CachedModels;

  // Session usage
  sessionUsage: UsageTracker;

  // Actions - conversations
  createConversation: () => string;
  deleteConversation: (id: string) => void;
  setActiveConversation: (id: string | null) => void;
  addMessage: (conversationId: string, message: Omit<ChatMessage, "id" | "timestamp">) => string;
  updateMessage: (conversationId: string, messageId: string, content: string) => void;
  deleteMessage: (conversationId: string, messageId: string) => void;
  setThumbsRating: (conversationId: string, messageId: string, rating: "up" | "down" | null) => void;
  updateConversationTitle: (id: string, title: string) => void;
  forkConversation: (conversationId: string, fromMessageId: string) => string;
  clearConversationMessages: (conversationId: string) => void;
  deleteMessagesAfter: (conversationId: string, messageId: string) => void;
  toggleReaction: (conversationId: string, messageId: string, emoji: EmojiReaction) => void;

  // Actions - starred messages
  starMessage: (conversationId: string, messageId: string) => void;
  unstarMessage: (conversationId: string, messageId: string) => void;
  isStarred: (conversationId: string, messageId: string) => boolean;

  // Actions - profiles
  saveProfile: (profile: Omit<ModelProfile, "id" | "createdAt">) => string;
  deleteProfile: (id: string) => void;
  applyProfile: (id: string) => void;

  // Actions - settings
  updateSettings: (patch: Partial<AIPlaygroundSettings>) => void;

  // Actions - models cache
  setCachedModels: (providerId: string, models: ModelConfig[]) => void;

  // Actions - usage
  addUsage: (providerId: string, tokens: number) => void;

  // Key management (not persisted in zustand, uses localStorage directly)
  getKey: (providerId: string) => string;
  setKey: (providerId: string, key: string) => void;

  // Active conversation helper
  getActiveConversation: () => Conversation | null;
}

const DEFAULT_SETTINGS: AIPlaygroundSettings = {
  selectedProviderId: "openai",
  selectedModelId: "gpt-4o",
  systemPrompt: "",
  showSystemPrompt: false,
  params: {
    temperature: 0.7,
    maxTokens: 2048,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
  },
  autoRead: false,
  ttsVoice: "nova",
  darkMode: false,
  compareMode: false,
  compareProviderId: "anthropic",
  compareModelId: "claude-sonnet-4-5",
  viewDensity: "cozy",
  enabledSkillIds: [],
  enabledToolNames: [],
  agenticMode: "none",
  agenticMaxIterations: 8,
  agenticShowThoughts: true,
  agenticAutoAskHuman: true,
};

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export const useAIPlaygroundStore = create<AIPlaygroundStore>()(
  persist(
    (set, get) => ({
      conversations: [],
      activeConversationId: null,
      starred: {},
      profiles: [],
      settings: DEFAULT_SETTINGS,
      cachedModels: {},
      sessionUsage: {},

      createConversation: () => {
        const id = genId();
        const { settings } = get();
        const conv: Conversation = {
          id,
          title: "New Conversation",
          createdAt: Date.now(),
          updatedAt: Date.now(),
          providerId: settings.selectedProviderId,
          modelId: settings.selectedModelId,
          messages: [],
          systemPrompt: settings.systemPrompt,
        };
        set((s) => ({
          conversations: [conv, ...s.conversations],
          activeConversationId: id,
        }));
        return id;
      },

      deleteConversation: (id) => {
        set((s) => {
          const remaining = s.conversations.filter((c) => c.id !== id);
          return {
            conversations: remaining,
            activeConversationId:
              s.activeConversationId === id
                ? (remaining[0]?.id ?? null)
                : s.activeConversationId,
          };
        });
      },

      setActiveConversation: (id) => {
        set({ activeConversationId: id });
      },

      addMessage: (conversationId, message) => {
        const id = genId();
        const msg: ChatMessage = {
          ...message,
          id,
          timestamp: Date.now(),
        };
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  messages: [...c.messages, msg],
                  updatedAt: Date.now(),
                  // Auto-title from first user message
                  title:
                    c.messages.length === 0 && message.role === "user"
                      ? typeof message.content === "string"
                        ? message.content.slice(0, 60)
                        : "New Conversation"
                      : c.title,
                }
              : c
          ),
        }));
        return id;
      },

      updateMessage: (conversationId, messageId, content) => {
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === messageId ? { ...m, content } : m
                  ),
                  updatedAt: Date.now(),
                }
              : c
          ),
        }));
      },

      deleteMessage: (conversationId, messageId) => {
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  messages: c.messages.filter((m) => m.id !== messageId),
                  updatedAt: Date.now(),
                }
              : c
          ),
        }));
      },

      setThumbsRating: (conversationId, messageId, rating) => {
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === messageId ? { ...m, thumbs: rating } : m
                  ),
                }
              : c
          ),
        }));
      },

      updateConversationTitle: (id, title) => {
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === id ? { ...c, title } : c
          ),
        }));
      },

      clearConversationMessages: (conversationId) => {
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === conversationId ? { ...c, messages: [], updatedAt: Date.now() } : c
          ),
        }));
      },

      deleteMessagesAfter: (conversationId, messageId) => {
        set((s) => ({
          conversations: s.conversations.map((c) => {
            if (c.id !== conversationId) return c;
            const idx = c.messages.findIndex((m) => m.id === messageId);
            if (idx === -1) return c;
            return { ...c, messages: c.messages.slice(0, idx + 1), updatedAt: Date.now() };
          }),
        }));
      },

      forkConversation: (conversationId, fromMessageId) => {
        const conv = get().conversations.find((c) => c.id === conversationId);
        if (!conv) return "";
        const idx = conv.messages.findIndex((m) => m.id === fromMessageId);
        const messages = idx >= 0 ? conv.messages.slice(0, idx + 1) : [...conv.messages];
        const id = genId();
        const forked: Conversation = {
          ...conv,
          id,
          title: `Fork: ${conv.title}`,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          messages: messages.map((m) => ({ ...m, id: genId() })),
        };
        set((s) => ({
          conversations: [forked, ...s.conversations],
          activeConversationId: id,
        }));
        return id;
      },

      toggleReaction: (conversationId, messageId, emoji) => {
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  messages: c.messages.map((m) => {
                    if (m.id !== messageId) return m;
                    const existing = m.reactions || [];
                    const has = existing.includes(emoji);
                    return {
                      ...m,
                      reactions: has
                        ? existing.filter((r) => r !== emoji)
                        : [...existing, emoji],
                    };
                  }),
                }
              : c
          ),
        }));
      },

      starMessage: (conversationId, messageId) => {
        set((s) => {
          const current = s.starred[conversationId] || [];
          if (current.includes(messageId)) return s;
          return {
            starred: { ...s.starred, [conversationId]: [...current, messageId] },
          };
        });
      },

      unstarMessage: (conversationId, messageId) => {
        set((s) => {
          const current = s.starred[conversationId] || [];
          return {
            starred: {
              ...s.starred,
              [conversationId]: current.filter((id) => id !== messageId),
            },
          };
        });
      },

      isStarred: (conversationId, messageId) => {
        return (get().starred[conversationId] || []).includes(messageId);
      },

      saveProfile: (profile) => {
        const id = genId();
        const newProfile: ModelProfile = { ...profile, id, createdAt: Date.now() };
        set((s) => ({ profiles: [...s.profiles, newProfile] }));
        return id;
      },

      deleteProfile: (id) => {
        set((s) => ({ profiles: s.profiles.filter((p) => p.id !== id) }));
      },

      applyProfile: (id) => {
        const profile = get().profiles.find((p) => p.id === id);
        if (!profile) return;
        get().updateSettings({
          selectedProviderId: profile.providerId,
          selectedModelId: profile.modelId,
          systemPrompt: profile.systemPrompt,
          params: profile.params,
        });
      },

      updateSettings: (patch) => {
        set((s) => ({ settings: { ...s.settings, ...patch } }));
      },

      setCachedModels: (providerId, models) => {
        set((s) => ({
          cachedModels: { ...s.cachedModels, [providerId]: models },
        }));
      },

      addUsage: (providerId, tokens) => {
        set((s) => ({
          sessionUsage: {
            ...s.sessionUsage,
            [providerId]: (s.sessionUsage[providerId] || 0) + tokens,
          },
        }));
      },

      getKey: (providerId) => loadKey(providerId),
      setKey: (providerId, key) => saveKey(providerId, key),

      getActiveConversation: () => {
        const { conversations, activeConversationId } = get();
        return conversations.find((c) => c.id === activeConversationId) ?? null;
      },
    }),
    {
      name: "ai-playground-store",
      partialize: (s) => ({
        conversations: s.conversations,
        activeConversationId: s.activeConversationId,
        starred: s.starred,
        profiles: s.profiles,
        settings: s.settings,
        cachedModels: s.cachedModels,
      }),
    }
  )
);
