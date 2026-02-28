import { useState, useRef, useEffect, useCallback } from "react";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";

import { ModelSelector } from "./ModelSelector";
import { SettingsPanel } from "./SettingsPanel";
import { Sidebar } from "./Sidebar";
import { MessageItem } from "./MessageItem";
import { InputBar } from "./InputBar";
import { ArtifactPanel } from "./ArtifactPanel";
import { PromptLibrary } from "./PromptLibrary";
import { BookmarksPanel } from "./BookmarksPanel";
import { ProfilesPanel } from "./ProfilesPanel";
import { AgentSkillsPanel, BUILTIN_SKILLS } from "./AgentSkillsPanel";
import { AgenticFlowPanel, AGENTIC_PROMPTS, AgenticConfig } from "./AgenticFlowPanel";
import { HumanInputCardContainer } from "./HumanInputCard";

import { useAIPlaygroundStore } from "@/store/aiPlayground";
import { useStream, ToolCallRecord } from "@/hooks/useStream";
import { useVoice } from "@/hooks/useVoice";
import { detectArtifact, ArtifactType } from "@/hooks/useArtifact";
import { buildMessageContent, AttachedFile } from "@/utils/aiFileReader";
import { PROVIDER_MAP, NO_SYSTEM_PROMPT_MODELS } from "@/providers/ai";
import { CLIENT_TOOLS } from "@/utils/clientTools";
import { toast } from "sonner";
import {
  Settings,
  ChevronDown,
  ChevronUp,
  Columns2,
  SlidersHorizontal,
  MessageSquarePlus,
  ArrowDown,
  Moon,
  Sun,
  Keyboard,
  BookOpen,
  Loader2,
  X,
  Search,
  Bookmark,
  User2,
  AlignJustify,
  AlignLeft,
  LayoutList,
  Sparkles,
  FileText,
  Wrench,
  Zap,
  Workflow,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface OpenArtifact {
  code: string;
  language: string;
  type: ArtifactType;
  title?: string;
}

type RightPanel = "artifact" | "prompts" | "bookmarks" | "profiles" | "skills" | "tools" | "agentic" | null;

const STARTERS = [
  { icon: "💻", title: "Debug my code", prompt: "Help me debug this code: " },
  { icon: "📝", title: "Write an essay", prompt: "Write an essay about: " },
  { icon: "🔢", title: "Explain a concept", prompt: "Explain this concept in simple terms: " },
  { icon: "🎨", title: "Build a React component", prompt: "Build a React component that: " },
  { icon: "📊", title: "Analyze data", prompt: "Analyze this data and summarize key insights: " },
  { icon: "🌐", title: "Build a webpage", prompt: "Build a complete HTML page that: " },
];

const SHORTCUTS = [
  { key: "Ctrl+Enter", description: "Send message" },
  { key: "Esc", description: "Stop generation" },
  { key: "Ctrl+Shift+N", description: "New conversation" },
  { key: "Ctrl+/", description: "Toggle system prompt" },
  { key: "Ctrl+Shift+D", description: "Toggle dark mode" },
  { key: "Ctrl+Shift+P", description: "Toggle prompt library" },
  { key: "Ctrl+F", description: "Search in conversation" },
  { key: "?", description: "Show keyboard shortcuts" },
];

const DENSITY_OPTIONS = [
  { value: "compact" as const, icon: AlignJustify, label: "Compact" },
  { value: "cozy" as const, icon: AlignLeft, label: "Cozy" },
  { value: "spacious" as const, icon: LayoutList, label: "Spacious" },
];

// Suggested follow-up prompts based on conversation context
function buildFollowUpSuggestions(lastAssistantText: string): string[] {
  const lower = lastAssistantText.toLowerCase();
  if (lower.includes("function") || lower.includes("```")) {
    return [
      "Can you add error handling to this?",
      "Write unit tests for this",
      "Explain how this works step by step",
    ];
  }
  if (lower.includes("email") || lower.includes("subject:")) {
    return [
      "Make this more formal",
      "Make this more concise",
      "Add a follow-up paragraph",
    ];
  }
  if (lower.includes("meeting") || lower.includes("calendar") || lower.includes("date:")) {
    return [
      "Write an invite email for this meeting",
      "Create an agenda for this meeting",
      "What should I prepare for this?",
    ];
  }
  return [
    "Can you explain that further?",
    "Give me a different approach",
    "Summarize the key points",
  ];
}

export function AIPlayground() {
  const {
    conversations,
    activeConversationId,
    settings,
    updateSettings,
    createConversation,
    addMessage,
    updateMessage,
    updateConversationTitle,
    getActiveConversation,
    sessionUsage,
    deleteMessagesAfter,
    setActiveConversation,
  } = useAIPlaygroundStore();

  const { sendStream, stop } = useStream();
  const { speak, stopSpeaking, isSpeaking } = useVoice();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showSystemPrompt, setShowSystemPrompt] = useState(false);
  const [showParams, setShowParams] = useState(false);
  const [artifact, setArtifact] = useState<OpenArtifact | null>(null);
  const [isStreamingActive, setIsStreamingActive] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [darkMode, setDarkMode] = useState(settings.darkMode);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [rightPanel, setRightPanel] = useState<RightPanel>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // In-chat search
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Tool calls per message (messageId -> ToolCallRecord[])
  const [messageToolCalls, setMessageToolCalls] = useState<Record<string, ToolCallRecord[]>>({});

  // Quote-reply
  const [quotedText, setQuotedText] = useState<string | null>(null);

  // Follow-up suggestions
  const [followUpSuggestions, setFollowUpSuggestions] = useState<string[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const activeConversation = getActiveConversation();
  const messages = activeConversation?.messages || [];

  const currentProvider = PROVIDER_MAP[settings.selectedProviderId];
  const noSystemPrompt = NO_SYSTEM_PROMPT_MODELS.includes(settings.selectedModelId);

  const visionSupported =
    currentProvider?.hardcodedModels
      .find((m) => m.id === settings.selectedModelId)
      ?.tags.includes("vision") ?? false;

  // Dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    updateSettings({ darkMode });
  }, [darkMode]);

  // Auto-scroll + unread tracking
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setUnreadCount(0);
  }, []);

  useEffect(() => {
    if (!isStreamingActive) return;
    const el = scrollAreaRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
    if (atBottom) {
      scrollToBottom();
    } else {
      setUnreadCount((n) => n + 1);
    }
  }, [messages, isStreamingActive, scrollToBottom]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
    setShowScrollBtn(!atBottom);
    if (atBottom) setUnreadCount(0);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      const inInput = tag === "INPUT" || tag === "TEXTAREA";

      if (e.key === "Escape") {
        if (isStreamingActive) stop();
        if (showShortcuts) setShowShortcuts(false);
        if (showSearch) { setShowSearch(false); setSearchQuery(""); }
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "N") {
        e.preventDefault();
        createConversation();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "/") {
        e.preventDefault();
        setShowSystemPrompt((v) => !v);
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "D") {
        e.preventDefault();
        setDarkMode((v) => !v);
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "P") {
        e.preventDefault();
        setRightPanel((v) => (v === "prompts" ? null : "prompts"));
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "f") {
        e.preventDefault();
        setShowSearch((v) => !v);
        setTimeout(() => searchInputRef.current?.focus(), 50);
      }
      if (e.key === "?" && !inInput) {
        setShowShortcuts((v) => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isStreamingActive, stop, createConversation, showShortcuts, showSearch]);

  // Initialize conversation
  useEffect(() => {
    if (conversations.length === 0) {
      createConversation();
    }
  }, []);

  // Auto-title conversation after first AI response
  const autoTitle = useCallback(
    async (convId: string, userText: string) => {
      const conv = useAIPlaygroundStore.getState().conversations.find((c) => c.id === convId);
      if (!conv || conv.title !== "New Conversation") return;

      const titleMessages = [
        {
          id: "x",
          role: "user" as const,
          content: `Generate a short, descriptive title (max 6 words) for a conversation that starts with: "${userText.slice(0, 200)}". Reply with ONLY the title, no quotes or punctuation.`,
          timestamp: Date.now(),
        },
      ];

      try {
        await sendStream({
          conversationId: `title-${convId}`,
          providerId: settings.selectedProviderId,
          modelId: settings.selectedModelId,
          messages: titleMessages,
          systemPrompt: undefined,
          onDone: (title) => {
            const cleaned = title.trim().replace(/^["']|["']$/g, "").slice(0, 60);
            if (cleaned) updateConversationTitle(convId, cleaned);
          },
          onError: () => {},
        });
      } catch {
        // silently fail — title generation is optional
      }
    },
    [sendStream, settings, updateConversationTitle]
  );

  // Compute system prompt additions from active skills + agentic mode
  const skillsSystemPromptAddition = useCallback((): string => {
    const activeSkills = BUILTIN_SKILLS.filter((s) =>
      settings.enabledSkillIds.includes(s.id)
    );
    const skillsText = activeSkills.length > 0
      ? "\n\n---\n" + activeSkills.map((s) => s.systemPromptAddition).join("\n\n")
      : "";
    const agenticText =
      settings.agenticMode !== "none"
        ? "\n\n---\n" + AGENTIC_PROMPTS[settings.agenticMode]
        : "";
    return skillsText + agenticText;
  }, [settings.enabledSkillIds, settings.agenticMode]);

  // Compute enabled tools from active skills + manual tool selections + agentic ask_human
  const computeEnabledTools = useCallback((): string[] => {
    const fromSkills = BUILTIN_SKILLS
      .filter((s) => settings.enabledSkillIds.includes(s.id))
      .flatMap((s) => s.enabledTools || []);
    const agenticTools =
      settings.agenticMode !== "none" && settings.agenticAutoAskHuman
        ? ["ask_human"]
        : [];
    return Array.from(new Set([...settings.enabledToolNames, ...fromSkills, ...agenticTools]));
  }, [settings.enabledSkillIds, settings.enabledToolNames, settings.agenticMode, settings.agenticAutoAskHuman]);

  const handleSend = useCallback(
    async (text: string, attachments: AttachedFile[]) => {
      const combinedText = quotedText ? `${quotedText}${text}` : text;
      if (!combinedText && attachments.length === 0) return;

      setQuotedText(null);
      setFollowUpSuggestions([]);

      let convId = activeConversationId;
      if (!convId) {
        convId = createConversation();
      }

      const content = buildMessageContent(combinedText, attachments);
      const isFirstMessage =
        useAIPlaygroundStore.getState().conversations.find((c) => c.id === convId)?.messages
          .length === 0;

      addMessage(convId, { role: "user", content });
      setIsStreamingActive(true);

      const conv = useAIPlaygroundStore.getState().conversations.find((c) => c.id === convId);
      const apiMessages = conv?.messages || [];

      const baseSystemPrompt = noSystemPrompt ? undefined : settings.systemPrompt;
      const skillsAddition = skillsSystemPromptAddition();
      const fullSystemPrompt = baseSystemPrompt
        ? baseSystemPrompt + skillsAddition
        : skillsAddition || undefined;
      const enabledTools = computeEnabledTools();

      // Track which assistant message ID gets the tool calls
      let assistantMsgIdForTools: string | null = null;

      await sendStream({
        conversationId: convId,
        providerId: settings.selectedProviderId,
        modelId: settings.selectedModelId,
        messages: apiMessages,
        systemPrompt: fullSystemPrompt,
        enabledToolNames: enabledTools,
        agenticMode: settings.agenticMode,
        agenticMaxIterations: settings.agenticMaxIterations,
        onDone: (fullText, toolCalls) => {
          setIsStreamingActive(false);

          // Store tool calls for the last assistant message
          if (toolCalls && toolCalls.length > 0) {
            const freshConv = useAIPlaygroundStore.getState().conversations.find((c) => c.id === convId);
            const lastAssistant = freshConv?.messages.filter((m) => m.role === "assistant").pop();
            if (lastAssistant) {
              setMessageToolCalls((prev) => ({
                ...prev,
                [lastAssistant.id]: toolCalls,
              }));
            }
          }
          void assistantMsgIdForTools; // avoid unused warning

          // Auto-detect artifact
          const detected = detectArtifact(fullText);
          if (detected) {
            setArtifact({ code: detected.code, language: detected.language, type: detected.type });
          }
          // Auto-read
          if (settings.autoRead) {
            const plainText = fullText.replace(/```[\s\S]*?```/g, "[code block]").trim();
            speak(plainText);
          }
          // Follow-up suggestions
          setFollowUpSuggestions(buildFollowUpSuggestions(fullText));
          // Auto-title
          if (isFirstMessage) {
            autoTitle(convId!, typeof content === "string" ? content : text);
          }
        },
        onError: () => setIsStreamingActive(false),
      });
    },
    [
      activeConversationId,
      createConversation,
      addMessage,
      sendStream,
      settings,
      noSystemPrompt,
      speak,
      quotedText,
      autoTitle,
      skillsSystemPromptAddition,
      computeEnabledTools,
    ]
  );

  const handleRegenerate = useCallback(() => {
    if (!activeConversationId) return;
    const conv = getActiveConversation();
    if (!conv) return;

    const msgs = conv.messages;
    const lastUserIdx = [...msgs].reverse().findIndex((m) => m.role === "user");
    if (lastUserIdx === -1) return;

    const apiMessages = msgs.slice(0, msgs.length - 1 - lastUserIdx + 1);

    setFollowUpSuggestions([]);
    setIsStreamingActive(true);
    sendStream({
      conversationId: activeConversationId,
      providerId: settings.selectedProviderId,
      modelId: settings.selectedModelId,
      messages: apiMessages,
      systemPrompt: noSystemPrompt ? undefined : settings.systemPrompt,
      onDone: (fullText) => {
        setIsStreamingActive(false);
        setFollowUpSuggestions(buildFollowUpSuggestions(fullText));
      },
      onError: () => setIsStreamingActive(false),
    });
  }, [activeConversationId, getActiveConversation, sendStream, settings, noSystemPrompt]);

  const handleEditAndRerun = useCallback(
    async (messageId: string, newContent: string) => {
      if (!activeConversationId) return;
      updateMessage(activeConversationId, messageId, newContent);
      deleteMessagesAfter(activeConversationId, messageId);
      setFollowUpSuggestions([]);

      await Promise.resolve();
      const conv = useAIPlaygroundStore.getState().conversations.find(
        (c) => c.id === activeConversationId
      );
      if (!conv) return;

      setIsStreamingActive(true);
      sendStream({
        conversationId: activeConversationId,
        providerId: settings.selectedProviderId,
        modelId: settings.selectedModelId,
        messages: conv.messages,
        systemPrompt: noSystemPrompt ? undefined : settings.systemPrompt,
        onDone: (fullText) => {
          setIsStreamingActive(false);
          const detected = detectArtifact(fullText);
          if (detected) {
            setArtifact({ code: detected.code, language: detected.language, type: detected.type });
          }
          setFollowUpSuggestions(buildFollowUpSuggestions(fullText));
        },
        onError: () => setIsStreamingActive(false),
      });
    },
    [activeConversationId, updateMessage, deleteMessagesAfter, sendStream, settings, noSystemPrompt]
  );

  const handleOpenArtifact = useCallback((code: string, type: string, language: string) => {
    setArtifact({ code, type: type as ArtifactType, language });
    setRightPanel("artifact");
  }, []);

  const handleAskAI = useCallback(
    async (instruction: string, currentCode: string): Promise<string | null> => {
      const convId = activeConversationId || createConversation();
      const prompt = `Edit the following code as instructed.\n\nInstruction: ${instruction}\n\nCurrent code:\n\`\`\`\n${currentCode}\n\`\`\`\n\nRespond with ONLY the updated code inside a single code block, no explanation.`;
      addMessage(convId, { role: "user", content: prompt });

      const conv = useAIPlaygroundStore.getState().conversations.find((c) => c.id === convId);
      const apiMessages = conv?.messages || [];

      return new Promise((resolve) => {
        sendStream({
          conversationId: convId,
          providerId: settings.selectedProviderId,
          modelId: settings.selectedModelId,
          messages: apiMessages,
          systemPrompt: undefined,
          onDone: (fullText) => {
            const match = /```[\w]*\n?([\s\S]*?)```/.exec(fullText);
            resolve(match ? match[1].trim() : fullText.trim());
          },
          onError: () => resolve(null),
        });
      });
    },
    [activeConversationId, createConversation, addMessage, sendStream, settings]
  );

  // Summarize conversation
  const handleSummarize = useCallback(async () => {
    if (!activeConversationId) return;
    const conv = getActiveConversation();
    if (!conv || conv.messages.length < 2) {
      toast.info("Add some messages first");
      return;
    }

    const summaryPrompt = `Summarize the key points and outcomes of this conversation in 3-5 bullet points. Be concise.`;
    handleSend(summaryPrompt, []);
  }, [activeConversationId, getActiveConversation, handleSend]);

  // Navigate to a starred message
  const handleNavigateToMessage = useCallback(
    (convId: string, _msgId: string) => {
      setActiveConversation(convId);
      setRightPanel(null);
      // Scroll happens naturally as conversation loads
    },
    [setActiveConversation]
  );

  const toggleRightPanel = (panel: Exclude<RightPanel, "artifact">) => {
    setRightPanel((v) => (v === panel ? null : panel));
  };

  const totalTokens = Object.values(sessionUsage).reduce((a, b) => a + b, 0);
  const showRightPanel =
    rightPanel !== null &&
    (rightPanel !== "artifact" || artifact !== null);

  return (
    <TooltipProvider>
      <div className="flex flex-col h-[calc(100vh-120px)] min-h-[500px] border rounded-xl overflow-hidden bg-background relative">
        {/* Privacy Banner */}
        <div className="bg-blue-50 dark:bg-blue-950/50 border-b border-blue-100 dark:border-blue-900 px-4 py-1.5 text-xs text-blue-700 dark:text-blue-300 flex items-center justify-between">
          <span>
            🔒 <strong>Your data stays local.</strong> Keys and conversations stored in
            your browser only — never sent to toolnames.com servers.
          </span>
          <button
            className="text-blue-500 hover:text-blue-700"
            onClick={() =>
              toast.info("Keys are XOR-obfuscated in localStorage. No server connection is made.")
            }
          >
            Learn more
          </button>
        </div>

        {/* Streaming status bar */}
        {isStreamingActive && (
          <div className="flex items-center gap-2 px-4 py-1 bg-primary/5 border-b text-xs text-muted-foreground">
            <Loader2 className="w-3 h-3 animate-spin text-primary" />
            <span>
              Generating with{" "}
              <span className="font-medium text-foreground">
                {currentProvider?.name} / {settings.selectedModelId}
              </span>
              …
            </span>
            <button
              className="ml-auto text-destructive hover:text-destructive/80 font-medium"
              onClick={stop}
            >
              Stop (Esc)
            </button>
          </div>
        )}

        {/* In-chat search bar */}
        {showSearch && (
          <div className="flex items-center gap-2 px-3 py-1.5 border-b bg-muted/10">
            <Search className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
            <Input
              ref={searchInputRef}
              placeholder="Search in conversation…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-7 text-xs border-0 bg-transparent px-0 focus-visible:ring-0 flex-1"
            />
            {searchQuery && (
              <span className="text-[10px] text-muted-foreground">
                {
                  messages.filter((m) => {
                    const t =
                      typeof m.content === "string"
                        ? m.content
                        : m.content
                            .filter((p) => p.type === "text")
                            .map((p) => p.text || "")
                            .join("");
                    return t.toLowerCase().includes(searchQuery.toLowerCase());
                  }).length
                }{" "}
                match(es)
              </span>
            )}
            <button
              onClick={() => { setShowSearch(false); setSearchQuery(""); }}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Top bar */}
        <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/20 flex-shrink-0 gap-2">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1 text-xs"
              onClick={createConversation}
              title="New conversation (Ctrl+Shift+N)"
            >
              <MessageSquarePlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New</span>
            </Button>
            <ModelSelector />
          </div>

          <div className="flex items-center gap-1">
            {totalTokens > 0 && (
              <Badge variant="outline" className="text-[10px] hidden md:flex">
                ~{totalTokens.toLocaleString()} tokens
              </Badge>
            )}

            {/* Density toggle */}
            <div className="hidden sm:flex items-center border rounded-md overflow-hidden h-8">
              {DENSITY_OPTIONS.map(({ value, icon: Icon, label }) => (
                <button
                  key={value}
                  onClick={() => updateSettings({ viewDensity: value })}
                  className={cn(
                    "w-7 h-8 flex items-center justify-center transition-colors",
                    settings.viewDensity === value
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted text-muted-foreground"
                  )}
                  title={`${label} view`}
                >
                  <Icon className="w-3 h-3" />
                </button>
              ))}
            </div>

            {/* Search */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={showSearch ? "default" : "ghost"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => { setShowSearch((v) => !v); setTimeout(() => searchInputRef.current?.focus(), 50); }}
                >
                  <Search className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Search messages (Ctrl+F)</TooltipContent>
            </Tooltip>

            {/* Summarize */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleSummarize}
                  disabled={isStreamingActive}
                >
                  <FileText className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Summarize conversation</TooltipContent>
            </Tooltip>

            {/* Prompt library */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={rightPanel === "prompts" ? "default" : "ghost"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => toggleRightPanel("prompts")}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Prompt library (Ctrl+Shift+P)</TooltipContent>
            </Tooltip>

            {/* Bookmarks */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={rightPanel === "bookmarks" ? "default" : "ghost"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => toggleRightPanel("bookmarks")}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Starred messages</TooltipContent>
            </Tooltip>

            {/* Profiles */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={rightPanel === "profiles" ? "default" : "ghost"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => toggleRightPanel("profiles")}
                >
                  <User2 className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Model profiles</TooltipContent>
            </Tooltip>

            {/* Agent Skills */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={rightPanel === "skills" ? "default" : "ghost"}
                  size="icon"
                  className="h-8 w-8 relative"
                  onClick={() => toggleRightPanel("skills")}
                >
                  <Zap className="w-3.5 h-3.5" />
                  {settings.enabledSkillIds.length > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-violet-500 text-white text-[8px] rounded-full flex items-center justify-center font-bold">
                      {settings.enabledSkillIds.length}
                    </span>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Agent Skills</TooltipContent>
            </Tooltip>

            {/* Tools */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={rightPanel === "tools" ? "default" : "ghost"}
                  size="icon"
                  className="h-8 w-8 relative"
                  onClick={() => toggleRightPanel("tools")}
                >
                  <Wrench className="w-3.5 h-3.5" />
                  {settings.enabledToolNames.length > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-orange-500 text-white text-[8px] rounded-full flex items-center justify-center font-bold">
                      {settings.enabledToolNames.length}
                    </span>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Client-side Tools</TooltipContent>
            </Tooltip>

            {/* Agentic Flow */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={rightPanel === "agentic" ? "default" : settings.agenticMode !== "none" ? "secondary" : "ghost"}
                  size="icon"
                  className="h-8 w-8 relative"
                  onClick={() => toggleRightPanel("agentic")}
                >
                  <Workflow className="w-3.5 h-3.5" />
                  {settings.agenticMode !== "none" && (
                    <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-orange-400 text-white text-[8px] rounded-full flex items-center justify-center font-bold">
                      ✓
                    </span>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Agentic Flow ({settings.agenticMode === "none" ? "off" : settings.agenticMode.replace("_", " ")})</TooltipContent>
            </Tooltip>

            {/* Compare mode */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={compareMode ? "default" : "ghost"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setCompareMode(!compareMode)}
                >
                  <Columns2 className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Compare mode</TooltipContent>
            </Tooltip>

            {/* Params */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={showParams ? "default" : "ghost"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setShowParams(!showParams)}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Model parameters</TooltipContent>
            </Tooltip>

            {/* Dark mode */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setDarkMode((v) => !v)}
                >
                  {darkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Toggle dark mode (Ctrl+Shift+D)</TooltipContent>
            </Tooltip>

            {/* Keyboard shortcuts */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setShowShortcuts((v) => !v)}
                >
                  <Keyboard className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Keyboard shortcuts (?)</TooltipContent>
            </Tooltip>

            {/* Settings */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setSettingsOpen(true)}
              title="Settings (API Keys)"
            >
              <Settings className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Model params panel */}
        {showParams && (
          <div className="border-b bg-muted/10 px-4 py-3 flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-2 min-w-[160px]">
              <Label className="text-xs w-24 flex-shrink-0">
                Temperature: {settings.params.temperature}
              </Label>
              <Slider
                min={0}
                max={2}
                step={0.1}
                value={[settings.params.temperature]}
                onValueChange={([v]) =>
                  updateSettings({ params: { ...settings.params, temperature: v } })
                }
                className="w-24"
              />
            </div>
            <div className="flex items-center gap-2 min-w-[160px]">
              <Label className="text-xs w-24 flex-shrink-0">
                Max tokens: {settings.params.maxTokens}
              </Label>
              <Slider
                min={256}
                max={8192}
                step={256}
                value={[settings.params.maxTokens]}
                onValueChange={([v]) =>
                  updateSettings({ params: { ...settings.params, maxTokens: v } })
                }
                className="w-24"
              />
            </div>
            <div className="flex items-center gap-2 min-w-[160px]">
              <Label className="text-xs w-24 flex-shrink-0">Top P: {settings.params.topP}</Label>
              <Slider
                min={0}
                max={1}
                step={0.05}
                value={[settings.params.topP]}
                onValueChange={([v]) =>
                  updateSettings({ params: { ...settings.params, topP: v } })
                }
                className="w-24"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-xs">Auto-read responses</Label>
              <Switch
                checked={settings.autoRead}
                onCheckedChange={(v) => updateSettings({ autoRead: v })}
              />
            </div>
          </div>
        )}

        {/* Keyboard shortcuts overlay */}
        {showShortcuts && (
          <div
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={() => setShowShortcuts(false)}
          >
            <div
              className="bg-background border rounded-xl shadow-xl p-5 w-80"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm">Keyboard Shortcuts</h3>
                <button
                  onClick={() => setShowShortcuts(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2">
                {SHORTCUTS.map((s) => (
                  <div key={s.key} className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{s.description}</span>
                    <kbd className="text-[10px] bg-muted px-1.5 py-0.5 rounded border font-mono">
                      {s.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="flex flex-1 min-h-0">
          {/* Sidebar */}
          <Sidebar
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          />

          {/* Chat + Right Panel */}
          <PanelGroup direction="horizontal" className="flex-1">
            {/* Chat Panel */}
            <Panel defaultSize={showRightPanel ? 60 : 100} minSize={30}>
              <div className="flex flex-col h-full">
                {/* System prompt */}
                <Collapsible open={showSystemPrompt} onOpenChange={setShowSystemPrompt}>
                  <CollapsibleTrigger asChild>
                    <button className="flex items-center gap-1 px-4 py-1.5 text-xs text-muted-foreground hover:text-foreground border-b w-full bg-muted/10">
                      System Prompt
                      {showSystemPrompt ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )}
                      {noSystemPrompt && (
                        <Badge variant="outline" className="ml-auto text-[10px]">
                          Not supported by this model
                        </Badge>
                      )}
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="px-4 py-2 border-b bg-muted/5">
                      <Textarea
                        placeholder={
                          noSystemPrompt
                            ? "This model doesn't support system prompts"
                            : "You are a helpful assistant..."
                        }
                        disabled={noSystemPrompt}
                        value={settings.systemPrompt}
                        onChange={(e) => updateSettings({ systemPrompt: e.target.value })}
                        className="text-xs min-h-[60px] max-h-[120px] resize-none"
                        rows={3}
                      />
                      <div className="flex gap-2 mt-1">
                        {["Coding assistant", "Data analyst", "Creative writer", "Teacher"].map(
                          (preset) => (
                            <button
                              key={preset}
                              className="text-[10px] px-2 py-0.5 rounded-full bg-muted hover:bg-muted/80"
                              onClick={() =>
                                updateSettings({
                                  systemPrompt: `You are a helpful ${preset.toLowerCase()}.`,
                                })
                              }
                            >
                              {preset}
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Messages */}
                <div
                  className="flex-1 overflow-y-auto relative"
                  onScroll={handleScroll}
                  ref={scrollAreaRef}
                >
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full px-4 py-8 gap-6">
                      <div className="text-center">
                        <h2 className="text-xl font-semibold mb-1">Universal AI Playground</h2>
                        <p className="text-sm text-muted-foreground max-w-sm">
                          Connect to 10+ AI providers with your own API keys. Switch models on the
                          fly.
                        </p>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full max-w-md">
                        {STARTERS.map((s) => (
                          <button
                            key={s.title}
                            className="flex flex-col items-start gap-1 p-3 rounded-xl border hover:border-primary/50 hover:bg-muted/50 text-left transition-colors"
                            onClick={() => handleSend(s.prompt, [])}
                          >
                            <span className="text-lg">{s.icon}</span>
                            <span className="text-xs font-medium">{s.title}</span>
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        No API key? Open{" "}
                        <button
                          className="underline text-primary"
                          onClick={() => setSettingsOpen(true)}
                        >
                          Settings
                        </button>{" "}
                        to add one.
                      </p>
                    </div>
                  ) : (
                    <div className="py-2">
                      {messages.map((msg, idx) => (
                        <MessageItem
                          key={msg.id}
                          message={msg}
                          conversationId={activeConversationId!}
                          isLast={idx === messages.length - 1}
                          isStreaming={
                            isStreamingActive &&
                            idx === messages.length - 1 &&
                            msg.role === "assistant"
                          }
                          onRegenerate={handleRegenerate}
                          onArtifactOpen={handleOpenArtifact}
                          onSpeak={(text) => speak(text)}
                          isSpeaking={isSpeaking}
                          onStopSpeak={stopSpeaking}
                          onEditAndRerun={handleEditAndRerun}
                          onRetry={handleRegenerate}
                          onQuote={(text) => setQuotedText(text)}
                          viewDensity={settings.viewDensity}
                          searchQuery={searchQuery}
                          toolCalls={messageToolCalls[msg.id]}
                        />
                      ))}

                      {/* Follow-up suggestions */}
                      {!isStreamingActive && followUpSuggestions.length > 0 && (
                        <div className="px-4 py-2 flex gap-2 flex-wrap">
                          {followUpSuggestions.map((s) => (
                            <button
                              key={s}
                              className="text-[11px] px-3 py-1.5 rounded-full border border-primary/30 hover:border-primary/60 hover:bg-primary/5 text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                              onClick={() => handleSend(s, [])}
                            >
                              <Sparkles className="w-3 h-3 text-primary/60" />
                              {s}
                            </button>
                          ))}
                        </div>
                      )}

                      <div ref={messagesEndRef} />
                    </div>
                  )}

                  {/* Scroll to bottom FAB with unread badge */}
                  {showScrollBtn && (
                    <button
                      className={cn(
                        "absolute bottom-4 right-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90",
                        unreadCount > 0 ? "w-auto px-3 h-8 gap-1.5" : "w-8 h-8"
                      )}
                      onClick={scrollToBottom}
                    >
                      <ArrowDown className="w-4 h-4 flex-shrink-0" />
                      {unreadCount > 0 && (
                        <span className="text-xs font-medium">{unreadCount}</span>
                      )}
                    </button>
                  )}
                </div>

                {/* Quote preview */}
                {quotedText && (
                  <div className="px-3 py-1.5 border-t bg-muted/20 flex items-start gap-2">
                    <div className="flex-1 text-[11px] text-muted-foreground border-l-2 border-primary/40 pl-2 line-clamp-2">
                      {quotedText.replace(/^> /gm, "")}
                    </div>
                    <button
                      className="text-muted-foreground hover:text-foreground flex-shrink-0"
                      onClick={() => setQuotedText(null)}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {/* Human input card — shown when AI calls ask_human */}
                <HumanInputCardContainer />

                {/* Input bar */}
                <InputBar
                  onSend={handleSend}
                  onStop={stop}
                  isStreaming={isStreamingActive}
                  visionSupported={visionSupported}
                />
              </div>
            </Panel>

            {/* Right panel (artifact / prompts / bookmarks / profiles) */}
            {showRightPanel && (
              <>
                <PanelResizeHandle className="w-1.5 bg-border hover:bg-primary/30 transition-colors" />
                <Panel defaultSize={40} minSize={25}>
                  {rightPanel === "artifact" && artifact && (
                    <ArtifactPanel
                      code={artifact.code}
                      language={artifact.language}
                      type={artifact.type}
                      title={artifact.title}
                      onClose={() => { setArtifact(null); setRightPanel(null); }}
                      onCodeChange={(code) =>
                        setArtifact((prev) => (prev ? { ...prev, code } : null))
                      }
                      onAskAI={handleAskAI}
                    />
                  )}
                  {rightPanel === "prompts" && (
                    <PromptLibrary
                      onUse={(prompt) => {
                        updateSettings({ systemPrompt: prompt });
                        setShowSystemPrompt(true);
                        setRightPanel(null);
                        toast.success("Prompt applied as system prompt");
                      }}
                      onClose={() => setRightPanel(null)}
                    />
                  )}
                  {rightPanel === "bookmarks" && (
                    <BookmarksPanel
                      onNavigate={handleNavigateToMessage}
                      onClose={() => setRightPanel(null)}
                    />
                  )}
                  {rightPanel === "profiles" && (
                    <ProfilesPanel onClose={() => setRightPanel(null)} />
                  )}
                  {rightPanel === "skills" && (
                    <AgentSkillsPanel
                      enabledSkillIds={settings.enabledSkillIds}
                      onToggleSkill={(id, enabled) => {
                        const next = enabled
                          ? [...settings.enabledSkillIds, id]
                          : settings.enabledSkillIds.filter((s) => s !== id);
                        updateSettings({ enabledSkillIds: next });
                      }}
                      onClose={() => setRightPanel(null)}
                    />
                  )}
                  {rightPanel === "agentic" && (
                    <AgenticFlowPanel
                      config={{
                        mode: settings.agenticMode,
                        maxIterations: settings.agenticMaxIterations,
                        showThoughts: settings.agenticShowThoughts,
                        autoAskHuman: settings.agenticAutoAskHuman,
                      }}
                      onChange={(patch: Partial<AgenticConfig>) => {
                        const next: Record<string, unknown> = {};
                        if (patch.mode !== undefined) next.agenticMode = patch.mode;
                        if (patch.maxIterations !== undefined) next.agenticMaxIterations = patch.maxIterations;
                        if (patch.showThoughts !== undefined) next.agenticShowThoughts = patch.showThoughts;
                        if (patch.autoAskHuman !== undefined) next.agenticAutoAskHuman = patch.autoAskHuman;
                        updateSettings(next as Parameters<typeof updateSettings>[0]);
                      }}
                      onClose={() => setRightPanel(null)}
                    />
                  )}
                  {rightPanel === "tools" && (
                    <div className="flex flex-col h-full border-l bg-background">
                      <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/20">
                        <div className="flex items-center gap-2">
                          <Wrench className="w-4 h-4 text-orange-500" />
                          <span className="text-sm font-medium">Client-side Tools</span>
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setRightPanel(null)}>
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                      <div className="p-2 text-[11px] text-muted-foreground bg-orange-50/30 dark:bg-orange-950/20 border-b px-3 py-1.5">
                        Enabled tools can be called by the AI in real-time. Results render as interactive widgets inline.
                      </div>
                      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
                        {CLIENT_TOOLS.map((tool) => {
                          const isOn = settings.enabledToolNames.includes(tool.name);
                          return (
                            <div
                              key={tool.name}
                              className={`flex items-start gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors ${isOn ? "border-orange-400/60 bg-orange-50/30 dark:bg-orange-950/20" : "hover:bg-muted/20"}`}
                              onClick={() => {
                                const next = isOn
                                  ? settings.enabledToolNames.filter((t) => t !== tool.name)
                                  : [...settings.enabledToolNames, tool.name];
                                updateSettings({ enabledToolNames: next });
                              }}
                            >
                              <span className="text-base flex-shrink-0">{tool.icon}</span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-medium">{tool.name.replace(/_/g, " ")}</span>
                                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${isOn ? "bg-orange-500 text-white" : "bg-muted text-muted-foreground"}`}>
                                    {isOn ? "ON" : "OFF"}
                                  </span>
                                </div>
                                <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{tool.description}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      {settings.enabledToolNames.length > 0 && (
                        <div className="p-2 border-t">
                          <button
                            className="text-[11px] text-destructive hover:underline w-full text-left px-1"
                            onClick={() => updateSettings({ enabledToolNames: [] })}
                          >
                            Disable all tools
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </Panel>
              </>
            )}
          </PanelGroup>
        </div>

        {/* Settings dialog */}
        <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      </div>
    </TooltipProvider>
  );
}
