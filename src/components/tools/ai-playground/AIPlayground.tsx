import { useState, useRef, useEffect, useCallback } from "react";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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

import { useAIPlaygroundStore } from "@/store/aiPlayground";
import { useStream } from "@/hooks/useStream";
import { useVoice } from "@/hooks/useVoice";
import { detectArtifact, ArtifactType } from "@/hooks/useArtifact";
import { buildMessageContent, AttachedFile } from "@/utils/aiFileReader";
import { PROVIDER_MAP, NO_SYSTEM_PROMPT_MODELS } from "@/providers/ai";
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
} from "lucide-react";
import { cn } from "@/lib/utils";

interface OpenArtifact {
  code: string;
  language: string;
  type: ArtifactType;
  title?: string;
}

// Conversation starter templates
const STARTERS = [
  { icon: "💻", title: "Debug my code", prompt: "Help me debug this code: " },
  { icon: "📝", title: "Write an essay", prompt: "Write an essay about: " },
  { icon: "🔢", title: "Explain a concept", prompt: "Explain this concept in simple terms: " },
  { icon: "🎨", title: "Build a React component", prompt: "Build a React component that: " },
  { icon: "📊", title: "Analyze data", prompt: "Analyze this data and summarize key insights: " },
  { icon: "🌐", title: "Build a webpage", prompt: "Build a complete HTML page that: " },
];

// Keyboard shortcut definitions
const SHORTCUTS = [
  { key: "Ctrl+Enter", description: "Send message" },
  { key: "Esc", description: "Stop generation" },
  { key: "Ctrl+Shift+N", description: "New conversation" },
  { key: "Ctrl+/", description: "Toggle system prompt" },
  { key: "Ctrl+Shift+D", description: "Toggle dark mode" },
  { key: "Ctrl+Shift+P", description: "Toggle prompt library" },
  { key: "?", description: "Show keyboard shortcuts" },
];

export function AIPlayground() {
  const {
    conversations,
    activeConversationId,
    settings,
    updateSettings,
    createConversation,
    addMessage,
    updateMessage,
    getActiveConversation,
    sessionUsage,
    deleteMessagesAfter,
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
  const [showPromptLibrary, setShowPromptLibrary] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const activeConversation = getActiveConversation();
  const messages = activeConversation?.messages || [];

  const currentProvider = PROVIDER_MAP[settings.selectedProviderId];
  const noSystemPrompt = NO_SYSTEM_PROMPT_MODELS.includes(settings.selectedModelId);

  // Check if current model supports vision
  const visionSupported =
    currentProvider?.hardcodedModels
      .find((m) => m.id === settings.selectedModelId)
      ?.tags.includes("vision") ?? false;

  // Dark mode: apply to document root
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    updateSettings({ darkMode });
  }, [darkMode]);

  // Auto-scroll to bottom; track unread when scrolled away
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

  // Scroll detection
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
    setShowScrollBtn(!atBottom);
    if (atBottom) setUnreadCount(0);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't fire shortcuts when typing in an input/textarea
      const tag = (e.target as HTMLElement).tagName;
      const inInput = tag === "INPUT" || tag === "TEXTAREA";

      if (e.key === "Escape") {
        if (isStreamingActive) stop();
        if (showShortcuts) setShowShortcuts(false);
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
        setShowPromptLibrary((v) => !v);
      }
      if (e.key === "?" && !inInput) {
        setShowShortcuts((v) => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isStreamingActive, stop, createConversation, showShortcuts]);

  // Initialize conversation if none exists
  useEffect(() => {
    if (conversations.length === 0) {
      createConversation();
    }
  }, []);

  const handleSend = useCallback(
    async (text: string, attachments: AttachedFile[]) => {
      if (!text && attachments.length === 0) return;

      // Ensure we have an active conversation
      let convId = activeConversationId;
      if (!convId) {
        convId = createConversation();
      }

      // Build message content (text + optional attachments)
      const content = buildMessageContent(text, attachments);

      // Add user message
      addMessage(convId, { role: "user", content });

      setIsStreamingActive(true);

      // Get messages for API call (include the one we just added)
      const conv = useAIPlaygroundStore.getState().conversations.find((c) => c.id === convId);
      const apiMessages = conv?.messages || [];

      await sendStream({
        conversationId: convId,
        providerId: settings.selectedProviderId,
        modelId: settings.selectedModelId,
        messages: apiMessages,
        systemPrompt: noSystemPrompt ? undefined : settings.systemPrompt,
        onDone: (fullText) => {
          setIsStreamingActive(false);
          // Auto-detect artifact
          const detected = detectArtifact(fullText);
          if (detected) {
            setArtifact({
              code: detected.code,
              language: detected.language,
              type: detected.type,
            });
          }
          // Auto-read if enabled
          if (settings.autoRead) {
            const plainText = fullText.replace(/```[\s\S]*?```/g, "[code block]").trim();
            speak(plainText);
          }
        },
        onError: () => {
          setIsStreamingActive(false);
        },
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
    ]
  );

  const handleRegenerate = useCallback(() => {
    if (!activeConversationId) return;
    const conv = getActiveConversation();
    if (!conv) return;

    // Find last user message
    const msgs = conv.messages;
    const lastUserIdx = [...msgs].reverse().findIndex((m) => m.role === "user");
    if (lastUserIdx === -1) return;

    const apiMessages = msgs.slice(0, msgs.length - 1 - lastUserIdx + 1);

    setIsStreamingActive(true);
    sendStream({
      conversationId: activeConversationId,
      providerId: settings.selectedProviderId,
      modelId: settings.selectedModelId,
      messages: apiMessages,
      systemPrompt: noSystemPrompt ? undefined : settings.systemPrompt,
      onDone: () => setIsStreamingActive(false),
      onError: () => setIsStreamingActive(false),
    });
  }, [activeConversationId, getActiveConversation, sendStream, settings, noSystemPrompt]);

  // Edit & re-run: update message text, remove subsequent messages, re-send
  const handleEditAndRerun = useCallback(
    async (messageId: string, newContent: string) => {
      if (!activeConversationId) return;
      updateMessage(activeConversationId, messageId, newContent);
      deleteMessagesAfter(activeConversationId, messageId);

      // Wait for state update, then get fresh messages
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
        },
        onError: () => setIsStreamingActive(false),
      });
    },
    [activeConversationId, updateMessage, deleteMessagesAfter, sendStream, settings, noSystemPrompt]
  );

  const handleOpenArtifact = useCallback(
    (code: string, type: string, language: string) => {
      setArtifact({ code, type: type as ArtifactType, language });
    },
    []
  );

  // "Ask AI to edit" callback for ArtifactPanel
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
            // Extract code from fenced block
            const match = /```[\w]*\n?([\s\S]*?)```/.exec(fullText);
            resolve(match ? match[1].trim() : fullText.trim());
          },
          onError: () => resolve(null),
        });
      });
    },
    [activeConversationId, createConversation, addMessage, sendStream, settings]
  );

  const totalTokens = Object.values(sessionUsage).reduce((a, b) => a + b, 0);

  return (
    <TooltipProvider>
      <div className="flex flex-col h-[calc(100vh-120px)] min-h-[500px] border rounded-xl overflow-hidden bg-background">
        {/* Privacy Banner */}
        <div className="bg-blue-50 dark:bg-blue-950/50 border-b border-blue-100 dark:border-blue-900 px-4 py-1.5 text-xs text-blue-700 dark:text-blue-300 flex items-center justify-between">
          <span>
            🔒 <strong>Your data stays local.</strong> Keys and conversations stored in
            your browser only — never sent to toolnames.com servers.
          </span>
          <button
            className="text-blue-500 hover:text-blue-700"
            onClick={() => toast.info("Keys are XOR-obfuscated in localStorage. No server connection is made.")}
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
            {/* Token counter */}
            {totalTokens > 0 && (
              <Badge variant="outline" className="text-[10px] hidden md:flex">
                ~{totalTokens.toLocaleString()} tokens
              </Badge>
            )}

            {/* Prompt library */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={showPromptLibrary ? "default" : "ghost"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setShowPromptLibrary(!showPromptLibrary)}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Prompt library (Ctrl+Shift+P)</TooltipContent>
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

            {/* Dark mode toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setDarkMode((v) => !v)}
                  title="Toggle dark mode (Ctrl+Shift+D)"
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
                  title="Keyboard shortcuts (?)"
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
              <Label className="text-xs w-24 flex-shrink-0">
                Top P: {settings.params.topP}
              </Label>
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
        <div className="flex flex-1 min-h-0 relative">
          {/* Sidebar */}
          <Sidebar
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          />

          {/* Chat + Artifact + PromptLibrary */}
          <PanelGroup direction="horizontal" className="flex-1">
            {/* Chat Panel */}
            <Panel defaultSize={artifact || showPromptLibrary ? 55 : 100} minSize={30}>
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
                    // Empty state with starters
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
                        />
                      ))}
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

                {/* Input bar */}
                <InputBar
                  onSend={handleSend}
                  onStop={stop}
                  isStreaming={isStreamingActive}
                  visionSupported={visionSupported}
                />
              </div>
            </Panel>

            {/* Artifact panel */}
            {artifact && (
              <>
                <PanelResizeHandle className="w-1.5 bg-border hover:bg-primary/30 transition-colors" />
                <Panel defaultSize={45} minSize={25}>
                  <ArtifactPanel
                    code={artifact.code}
                    language={artifact.language}
                    type={artifact.type}
                    title={artifact.title}
                    onClose={() => setArtifact(null)}
                    onCodeChange={(code) =>
                      setArtifact((prev) => (prev ? { ...prev, code } : null))
                    }
                    onAskAI={handleAskAI}
                  />
                </Panel>
              </>
            )}

            {/* Prompt Library panel */}
            {showPromptLibrary && (
              <>
                <PanelResizeHandle className="w-1.5 bg-border hover:bg-primary/30 transition-colors" />
                <Panel defaultSize={35} minSize={25}>
                  <PromptLibrary
                    onUse={(prompt) => {
                      updateSettings({ systemPrompt: prompt, showSystemPrompt: true });
                      setShowSystemPrompt(true);
                      setShowPromptLibrary(false);
                      toast.success("Prompt applied as system prompt");
                    }}
                    onClose={() => setShowPromptLibrary(false)}
                  />
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
