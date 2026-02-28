import { useEffect, useMemo, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from "react-resizable-panels";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bot, Download, FileSpreadsheet, FileText, Image as ImageIcon, Mail, Mic, Paperclip, Pencil, Play, Plus, RotateCcw, Search, Send, Settings, Sparkles, Trash2, Volume2, Wand2, X } from "lucide-react";

type ProviderId =
  | "openai"
  | "anthropic"
  | "gemini"
  | "mistral"
  | "xai"
  | "groq"
  | "cohere"
  | "together"
  | "perplexity"
  | "ollama";

interface ProviderDef {
  id: ProviderId;
  label: string;
  baseURL: string;
  keyUrl: string;
  keyRequired: boolean;
  protocol?: "openai" | "anthropic";
  extraHeaders?: Record<string, string>;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  ts: string;
  media?: { kind: "image" | "audio"; url: string; mime?: string }[];
}

interface ChatThread {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  provider: ProviderId;
  model: string;
  systemPrompt: string;
  useSystemPrompt: boolean;
  pinned?: boolean;
  messages: ChatMessage[];
}

interface EmailDraft {
  to: string;
  cc?: string;
  subject: string;
  body: string;
}

interface AgentSkill {
  id: string;
  name: string;
  description: string;
  instructions: string;
  enabled: boolean;
}

interface ToolEvent {
  id: string;
  command: string;
  output: string;
  ts: string;
}

type AgenticMode = "direct" | "react" | "plan-execute" | "chain-thought" | "tree-thought";

interface AskHumanField {
  id: string;
  label: string;
  type: "text" | "select" | "radio" | "checkbox";
  options?: string[];
  required?: boolean;
}

interface AskHumanCard {
  id: string;
  title: string;
  prompt: string;
  fields: AskHumanField[];
}

interface ToolElicitCard {
  id: string;
  title: string;
  prompt: string;
  suggestedCommand: string;
}

interface LoopState {
  active: boolean;
  status: "idle" | "running" | "paused_human" | "paused_tool" | "ready_to_resume";
  note?: string;
}

interface Attachment {
  kind: "image" | "text";
  name: string;
  value: string;
  mime?: string;
}

const PROVIDERS: ProviderDef[] = [
  { id: "openai", label: "OpenAI", baseURL: "https://api.openai.com/v1", keyUrl: "https://platform.openai.com/api-keys", keyRequired: true },
  { id: "anthropic", label: "Anthropic", baseURL: "https://api.anthropic.com/v1", keyUrl: "https://console.anthropic.com/settings/keys", keyRequired: true, protocol: "anthropic", extraHeaders: { "anthropic-version": "2023-06-01" } },
  { id: "gemini", label: "Google Gemini", baseURL: "https://generativelanguage.googleapis.com/v1beta/openai", keyUrl: "https://aistudio.google.com/app/apikey", keyRequired: true },
  { id: "mistral", label: "Mistral", baseURL: "https://api.mistral.ai/v1", keyUrl: "https://console.mistral.ai/api-keys/", keyRequired: true },
  { id: "xai", label: "xAI", baseURL: "https://api.x.ai/v1", keyUrl: "https://console.x.ai/", keyRequired: true },
  { id: "groq", label: "Groq", baseURL: "https://api.groq.com/openai/v1", keyUrl: "https://console.groq.com/keys", keyRequired: true },
  { id: "cohere", label: "Cohere", baseURL: "https://api.cohere.com/compatibility/v1", keyUrl: "https://dashboard.cohere.com/api-keys", keyRequired: true },
  { id: "together", label: "Together AI", baseURL: "https://api.together.xyz/v1", keyUrl: "https://api.together.xyz/settings/api-keys", keyRequired: true },
  { id: "perplexity", label: "Perplexity", baseURL: "https://api.perplexity.ai", keyUrl: "https://www.perplexity.ai/settings/api", keyRequired: true },
  { id: "ollama", label: "Ollama (Local)", baseURL: "http://localhost:11434/v1", keyUrl: "https://ollama.com/download", keyRequired: false },
];

const FALLBACK_MODELS: Record<ProviderId, string[]> = {
  openai: ["gpt-4o", "gpt-4o-mini", "o1", "o3-mini", "gpt-image-1"],
  anthropic: ["claude-opus-4-1", "claude-sonnet-4", "claude-3-5-haiku-latest"],
  gemini: ["gemini-2.0-flash", "gemini-2.5-pro"],
  mistral: ["mistral-large-latest", "mistral-small-latest", "pixtral-large-latest"],
  xai: ["grok-3", "grok-3-mini", "grok-2-vision"],
  groq: ["llama-3.3-70b-versatile", "deepseek-r1-distill-llama-70b"],
  cohere: ["command-r", "command-r-plus", "command-a"],
  together: ["meta-llama/Llama-3.3-70B-Instruct-Turbo", "deepseek-ai/DeepSeek-R1"],
  perplexity: ["sonar", "sonar-pro", "sonar-reasoning"],
  ollama: ["llama3.2", "qwen2.5-coder", "deepseek-r1"],
};

const xor = (value: string) => value.split("").map((ch, i) => String.fromCharCode(ch.charCodeAt(0) ^ ((i % 5) + 11))).join("");
const encodeKey = (value: string) => btoa(xor(value));
const decodeKey = (value?: string | null) => {
  if (!value) return "";
  try { return xor(atob(value)); } catch { return ""; }
};

const messageId = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const threadId = () => `thread-${messageId()}`;

const toMailto = (draft: EmailDraft) => {
  const params = new URLSearchParams();
  if (draft.cc) params.set("cc", draft.cc);
  params.set("subject", draft.subject);
  params.set("body", draft.body);
  return `mailto:${encodeURIComponent(draft.to)}?${params.toString()}`;
};

const extractEmailDraft = (text: string): EmailDraft | null => {
  const to = text.match(/^to:\s*(.+)$/im)?.[1]?.trim() || "";
  const subject = text.match(/^subject:\s*(.+)$/im)?.[1]?.trim() || "";
  const cc = text.match(/^cc:\s*(.+)$/im)?.[1]?.trim();
  const body = text.match(/^body:\s*([\s\S]+)$/im)?.[1]?.trim() || "";
  if (!to || !subject || !body) return null;
  return { to, cc, subject, body };
};

const buildSheet = (rows = 12, cols = 6) => Array.from({ length: rows }, () => Array.from({ length: cols }, () => ""));

const toCsv = (rows: string[][]) => rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")).join("\n");

const fromCsv = (csv: string) => csv.split(/\r?\n/).filter(Boolean).map((line) => line.split(",").map((cell) => cell.replace(/^"|"$/g, "").replace(/""/g, '"')));

const colLabel = (idx: number) => String.fromCharCode(65 + idx);

const parseAskHumanCards = (text: string): AskHumanCard[] => {
  const blocks = [...text.matchAll(/```askhuman\n([\s\S]*?)```/gi)].map((m) => m[1]);
  return blocks.flatMap((block, idx) => {
    try {
      const parsed = JSON.parse(block);
      const items = Array.isArray(parsed) ? parsed : [parsed];
      return items.map((item: any, i: number) => ({
        id: item.id || `askhuman-${idx}-${i}`,
        title: item.title || "Question for you",
        prompt: item.prompt || "Please provide details.",
        fields: Array.isArray(item.fields) && item.fields.length
          ? item.fields.map((field: any, fieldIdx: number) => ({
            id: field.id || `field-${fieldIdx}`,
            label: field.label || `Field ${fieldIdx + 1}`,
            type: ["text", "select", "radio", "checkbox"].includes(field.type) ? field.type : "text",
            options: Array.isArray(field.options) ? field.options : undefined,
            required: !!field.required,
          }))
          : [{ id: "response", label: "Your response", type: "text", required: true }],
      }));
    } catch {
      return [];
    }
  });
};

const parseToolElicitCards = (text: string): ToolElicitCard[] => {
  const blocks = [...text.matchAll(/```tool_elicit\n([\s\S]*?)```/gi)].map((m) => m[1]);
  return blocks.flatMap((block, idx) => {
    try {
      const parsed = JSON.parse(block);
      const items = Array.isArray(parsed) ? parsed : [parsed];
      return items.map((item: any, i: number) => ({
        id: item.id || `tool-elicit-${idx}-${i}`,
        title: item.title || "Tool input needed",
        prompt: item.prompt || "Please run a tool and continue.",
        suggestedCommand: item.suggestedCommand || item.command || "/date",
      }));
    } catch {
      return [];
    }
  });
};

const agenticInstructionFor = (mode: AgenticMode) => {
  if (mode === "react") return "Use a ReAct-style loop: Thought (concise), Action, Observation, and Final Answer. Keep thoughts short and practical.";
  if (mode === "plan-execute") return "Use a Plan-Execute loop: provide a numbered plan, execute each step, and conclude with a compact outcome summary.";
  if (mode === "chain-thought") return "Provide a concise reasoning trace (key steps only), then the final answer.";
  if (mode === "tree-thought") return "Use Tree-of-Thoughts: propose 2-3 candidate approaches, briefly evaluate each, choose one, then provide the final answer.";
  return "";
};

const makeThread = (provider: ProviderId, model: string, systemPrompt: string, useSystemPrompt: boolean): ChatThread => ({
  id: threadId(),
  title: "New chat",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  provider,
  model,
  systemPrompt,
  useSystemPrompt,
  messages: [],
});

const artifactFrom = (text: string) => {
  const artifactTag = text.match(/<artifact[^>]*type="([^"]+)"[^>]*>([\s\S]*?)<\/artifact>/i);
  if (artifactTag) return { type: artifactTag[1].toLowerCase(), code: artifactTag[2].trim() };
  const fence = text.match(/```(html|jsx|tsx|svg|mermaid|python|csv|json)\n([\s\S]*?)```/i);
  if (!fence) return null;
  return { type: fence[1].toLowerCase(), code: fence[2].trim() };
};

const toAbsolute = (baseURL: string, path: string) => `${baseURL.replace(/\/$/, "")}${path}`;

export const UniversalAIPlayground = () => {
  const [provider, setProvider] = useState<ProviderId>("openai");
  const [keys, setKeys] = useState<Record<ProviderId, string>>({} as Record<ProviderId, string>);
  const [statuses, setStatuses] = useState<Record<ProviderId, "idle" | "ok" | "bad">>({} as Record<ProviderId, "idle" | "ok" | "bad">);
  const [models, setModels] = useState<Record<ProviderId, string[]>>(() => ({ ...FALLBACK_MODELS }));
  const [model, setModel] = useState(FALLBACK_MODELS.openai[0]);
  const [systemPrompt, setSystemPrompt] = useState("You are a coding assistant.");
  const [useSystemPrompt, setUseSystemPrompt] = useState(true);
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string>("");
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [artifactCode, setArtifactCode] = useState("");
  const [artifactType, setArtifactType] = useState("");
  const [showPreview, setShowPreview] = useState(true);
  const [livePreview, setLivePreview] = useState(true);
  const [speechEnabled, setSpeechEnabled] = useState(false);
  const [chatSearch, setChatSearch] = useState("");
  const [composerRows, setComposerRows] = useState(1);
  const [skills, setSkills] = useState<AgentSkill[]>([]);
  const [skillName, setSkillName] = useState("");
  const [skillDescription, setSkillDescription] = useState("");
  const [skillInstructions, setSkillInstructions] = useState("");
  const [toolEvents, setToolEvents] = useState<ToolEvent[]>([]);
  const [agenticMode, setAgenticMode] = useState<AgenticMode>("direct");
  const [askHumanAnswers, setAskHumanAnswers] = useState<Record<string, Record<string, string | string[]>>>({});
  const [loopState, setLoopState] = useState<LoopState>({ active: false, status: "idle" });
  const [wordDoc, setWordDoc] = useState("<h2>Project Notes</h2><p>Start writing your draft here...</p>");
  const [sheet, setSheet] = useState<string[][]>(() => buildSheet());
  const [csvBuffer, setCsvBuffer] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const providerDef = useMemo(() => PROVIDERS.find((p) => p.id === provider)!, [provider]);
  const activeThread = useMemo(() => threads.find((t) => t.id === activeThreadId), [threads, activeThreadId]);
  const messages = activeThread?.messages ?? [];
  const filteredThreads = useMemo(() => threads
    .filter((t) => `${t.title} ${t.model}`.toLowerCase().includes(chatSearch.toLowerCase()))
    .sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned) || new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()), [threads, chatSearch]);

  useEffect(() => {
    const next = {} as Record<ProviderId, string>;
    const state = {} as Record<ProviderId, "idle" | "ok" | "bad">;
    PROVIDERS.forEach((p) => {
      next[p.id] = decodeKey(localStorage.getItem(`apikey_${p.id}`));
      state[p.id] = next[p.id] || !p.keyRequired ? "ok" : "idle";
      const cache = localStorage.getItem(`models_${p.id}`);
      if (cache) {
        try { setModels((prev) => ({ ...prev, [p.id]: JSON.parse(cache) })); } catch { /* ignore */ }
      }
    });

    const storedSkills = localStorage.getItem("ai_playground_skills");
    if (storedSkills) {
      try { setSkills(JSON.parse(storedSkills)); } catch { /* ignore */ }
    }

    const storedThreads = localStorage.getItem("ai_playground_threads");
    const storedActive = localStorage.getItem("ai_playground_active_thread");
    if (storedThreads) {
      try {
        const parsed = JSON.parse(storedThreads) as ChatThread[];
        if (parsed.length) {
          setThreads(parsed);
          setActiveThreadId(storedActive && parsed.some((t) => t.id === storedActive) ? storedActive : parsed[0].id);
          const current = parsed.find((t) => t.id === (storedActive || parsed[0].id)) || parsed[0];
          setProvider(current.provider);
          setModel(current.model);
          setSystemPrompt(current.systemPrompt);
          setUseSystemPrompt(current.useSystemPrompt);
        }
      } catch {
        const initial = makeThread("openai", FALLBACK_MODELS.openai[0], "You are a coding assistant.", true);
        setThreads([initial]);
        setActiveThreadId(initial.id);
      }
    } else {
      const initial = makeThread("openai", FALLBACK_MODELS.openai[0], "You are a coding assistant.", true);
      setThreads([initial]);
      setActiveThreadId(initial.id);
    }

    setKeys(next);
    setStatuses(state);
  }, []);

  useEffect(() => {
    if (threads.length) localStorage.setItem("ai_playground_threads", JSON.stringify(threads));
  }, [threads]);

  useEffect(() => {
    if (activeThreadId) localStorage.setItem("ai_playground_active_thread", activeThreadId);
  }, [activeThreadId]);

  useEffect(() => {
    localStorage.setItem("ai_playground_skills", JSON.stringify(skills));
  }, [skills]);

  useEffect(() => {
    if (!models[provider]?.includes(model)) setModel(models[provider][0]);
  }, [provider, models, model]);

  const saveKey = (target: ProviderId, value: string) => {
    setKeys((prev) => ({ ...prev, [target]: value }));
    localStorage.setItem(`apikey_${target}`, encodeKey(value));
  };

  const persistThreadPatch = (patch: Partial<ChatThread>) => {
    if (!activeThreadId) return;
    setThreads((prev) => prev.map((thread) => thread.id === activeThreadId ? { ...thread, ...patch, updatedAt: new Date().toISOString() } : thread));
  };

  useEffect(() => { persistThreadPatch({ provider }); }, [provider]);
  useEffect(() => { if (model) persistThreadPatch({ model }); }, [model]);
  useEffect(() => { persistThreadPatch({ systemPrompt }); }, [systemPrompt]);
  useEffect(() => { persistThreadPatch({ useSystemPrompt }); }, [useSystemPrompt]);

  const updateMessages = (nextMessages: ChatMessage[]) => {
    const title = nextMessages.find((m) => m.role === "user")?.content.slice(0, 40) || "New chat";
    persistThreadPatch({ messages: nextMessages, title });
  };

  const deleteChat = (id: string) => {
    const remaining = threads.filter((t) => t.id !== id);
    if (!remaining.length) {
      const fallback = makeThread(provider, model, systemPrompt, useSystemPrompt);
      setThreads([fallback]);
      setActiveThreadId(fallback.id);
      return;
    }
    setThreads(remaining);
    if (id === activeThreadId) switchChat(remaining[0].id);
  };

  const exportActiveChat = () => {
    if (!activeThread) return;
    const blob = new Blob([JSON.stringify(activeThread, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${activeThread.title.replace(/\W+/g, "-").toLowerCase() || "chat"}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportTranscriptMarkdown = () => {
    if (!activeThread) return;
    const md = [`# ${activeThread.title}`, "", ...activeThread.messages.map((m) => `## ${m.role}\n\n${m.content}`)].join("\n");
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${activeThread.title.replace(/\W+/g, "-").toLowerCase() || "chat"}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearAllChats = () => {
    const initial = makeThread(provider, model, systemPrompt, useSystemPrompt);
    setThreads([initial]);
    setActiveThreadId(initial.id);
  };

  const retryLastPrompt = () => {
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUser || streaming) return;
    setInput(lastUser.content);
  };

  const appendAssistantToThread = (id: string, content: string) => {
    setThreads((prev) => prev.map((thread) => thread.id === id
      ? { ...thread, updatedAt: new Date().toISOString(), messages: [...thread.messages, { id: messageId(), role: "assistant", content, ts: new Date().toISOString() }] }
      : thread));
  };

  const executeClientTool = (raw: string) => {
    if (!raw.startsWith("/")) return null;
    const [command, ...rest] = raw.slice(1).split(" ");
    const arg = rest.join(" ").trim();
    try {
      switch (command.toLowerCase()) {
        case "calc": {
          if (!/^[0-9+\-*/().\s]+$/.test(arg)) throw new Error("Only simple numeric expressions are supported.");
          const result = Function(`\"use strict\"; return (${arg});`)();
          return `Result: ${result}`;
        }
        case "date":
          return `Current date/time: ${new Date().toLocaleString()}`;
        case "uuid":
          return `UUID: ${crypto.randomUUID()}`;
        case "wordcount":
          return `Word count: ${arg.split(/\s+/).filter(Boolean).length}`;
        case "slug":
          return `Slug: ${arg.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-")}`;
        case "jsonfmt":
          return JSON.stringify(JSON.parse(arg), null, 2);
        case "base64":
          return `Base64: ${btoa(arg)}`;
        case "timer": {
          const seconds = Number(arg);
          if (!Number.isFinite(seconds) || seconds <= 0) throw new Error("Usage: /timer <seconds>");
          const targetThreadId = activeThreadId;
          setTimeout(() => appendAssistantToThread(targetThreadId, `⏰ Timer complete (${seconds}s).`), seconds * 1000);
          return `Timer started for ${seconds} seconds.`;
        }
        default:
          return `Unknown tool: /${command}. Try /calc, /date, /uuid, /wordcount, /slug, /jsonfmt, /base64, /timer.`;
      }
    } catch (error: any) {
      return `Tool error: ${error.message || "failed"}`;
    }
  };

  const runClientToolIfNeeded = (raw: string, pendingMessages: ChatMessage[], assistantId: string) => {
    const output = executeClientTool(raw);
    if (output === null) return false;
    updateMessages(pendingMessages.map((m) => (m.id === assistantId ? { ...m, content: `🛠️ ${output}` } : m)));
    setToolEvents((prev) => [{ id: messageId(), command: raw, output, ts: new Date().toISOString() }, ...prev].slice(0, 30));
    return true;
  };

  const addSkill = () => {
    if (!skillName.trim() || !skillInstructions.trim()) return;
    const next: AgentSkill = {
      id: `skill-${messageId()}`,
      name: skillName.trim(),
      description: skillDescription.trim(),
      instructions: skillInstructions.trim(),
      enabled: true,
    };
    setSkills((prev) => [next, ...prev]);
    setSkillName("");
    setSkillDescription("");
    setSkillInstructions("");
  };

  const exportSkills = () => {
    const blob = new Blob([JSON.stringify(skills, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "agentskills.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadWordDoc = () => {
    const html = `<!doctype html><html><body>${wordDoc}</body></html>`;
    const blob = new Blob([html], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "aiplayground-document.doc";
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadSheetCsv = () => {
    const blob = new Blob([toCsv(sheet)], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "aiplayground-sheet.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const submitAskHuman = (card: AskHumanCard) => {
    const values = askHumanAnswers[card.id] || {};
    const missing = card.fields.some((field) => field.required && !values[field.id]);
    if (missing) return;
    const summary = card.fields.map((field) => {
      const raw = values[field.id];
      const value = Array.isArray(raw) ? raw.join(", ") : (raw || "(blank)");
      return `- ${field.label}: ${value}`;
    }).join("\n");
    const responseText = `Human response for \"${card.title}\":\n${summary}`;
    const message: ChatMessage = { id: messageId(), role: "user", content: responseText, ts: new Date().toISOString() };
    updateMessages([...messages, message]);
    setInput(`${responseText}\n\nContinue the ${agenticMode} loop from this point.`);
    if (loopState.active) setLoopState({ active: true, status: "ready_to_resume", note: "Human response captured. Resume when ready." });
  };

  const runToolElicit = (card: ToolElicitCard) => {
    const output = executeClientTool(card.suggestedCommand);
    if (output === null) return;
    const responseText = `Tool elicitation result for \"${card.title}\" using ${card.suggestedCommand}:\n${output}`;
    updateMessages([...messages, { id: messageId(), role: "user", content: responseText, ts: new Date().toISOString() }]);
    setToolEvents((prev) => [{ id: messageId(), command: card.suggestedCommand, output, ts: new Date().toISOString() }, ...prev].slice(0, 30));
    setInput(`${responseText}\n\nContinue the ${agenticMode} loop from this point.`);
    if (loopState.active) setLoopState({ active: true, status: "ready_to_resume", note: "Tool result captured. Resume when ready." });
  };

  const headersFor = (target: ProviderId, key: string) => {
    const def = PROVIDERS.find((p) => p.id === target)!;
    if (def.protocol === "anthropic") {
      return {
        "Content-Type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        ...def.extraHeaders,
      };
    }
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key || "ollama"}`,
      ...def.extraHeaders,
    };
  };

  const testProvider = async (target: ProviderId) => {
    const def = PROVIDERS.find((p) => p.id === target)!;
    try {
      const key = keys[target];
      const endpoint = def.protocol === "anthropic" ? toAbsolute(def.baseURL, "/models") : toAbsolute(def.baseURL, "/models");
      const res = await fetch(endpoint, { headers: headersFor(target, key) });
      if (!res.ok) throw new Error("Model fetch failed");
      const data = await res.json();
      const fetched = (data.data || data.models || []).map((m: any) => m.id).filter(Boolean);
      const merged = Array.from(new Set([...FALLBACK_MODELS[target], ...fetched]));
      setModels((prev) => ({ ...prev, [target]: merged }));
      localStorage.setItem(`models_${target}`, JSON.stringify(merged));
      setStatuses((prev) => ({ ...prev, [target]: "ok" }));
    } catch {
      setStatuses((prev) => ({ ...prev, [target]: "bad" }));
    }
  };

  const canUseSystemPrompt = !/^o[134]/.test(model);
  const enabledSkillInstructions = skills.filter((s) => s.enabled).map((s) => `Skill: ${s.name}\n${s.instructions}`).join("\n\n");
  const agenticInstruction = agenticInstructionFor(agenticMode);
  const effectiveSystemPrompt = [systemPrompt, enabledSkillInstructions, agenticInstruction].filter(Boolean).join("\n\n");

  const detectTags = (name: string) => {
    const n = name.toLowerCase();
    return {
      vision: /vision|4o|pixtral|gemini|grok-2|image/.test(n),
      reasoning: /o1|o3|r1|reason/.test(n),
      code: /code|codestral|coder/.test(n),
    };
  };

  const parseAssistant = (response: any) => {
    const choice = response?.choices?.[0]?.message;
    const textParts: string[] = [];
    const media: ChatMessage["media"] = [];

    if (typeof choice?.content === "string") textParts.push(choice.content);
    if (Array.isArray(choice?.content)) {
      choice.content.forEach((part: any) => {
        if (part?.type === "text" && part.text) textParts.push(part.text);
        if ((part?.type === "image_url" || part?.type === "output_image") && part.image_url?.url) media?.push({ kind: "image", url: part.image_url.url });
        if (part?.type === "audio" && part.audio?.data) media?.push({ kind: "audio", url: `data:${part.audio?.format ? `audio/${part.audio.format}` : "audio/wav"};base64,${part.audio.data}` });
      });
    }

    if (choice?.audio?.data) {
      media?.push({ kind: "audio", url: `data:audio/${choice.audio.format || "wav"};base64,${choice.audio.data}` });
    }

    if (response?.data?.[0]?.b64_json) {
      media?.push({ kind: "image", url: `data:image/png;base64,${response.data[0].b64_json}` });
      if (!textParts.length) textParts.push("Generated image.");
    }

    const text = textParts.join("\n").trim() || "(No text output)";
    return { text, media: media?.length ? media : undefined };
  };

  const send = async () => {
    if (!activeThreadId || (!input.trim() && !attachment)) return;
    setStreaming(true);
    if (agenticMode !== "direct") setLoopState({ active: true, status: "running", note: `Running ${agenticMode} loop...` });

    const userText = input.trim() || "Attachment analysis request";
    const userMessage: ChatMessage = { id: messageId(), role: "user", content: userText, ts: new Date().toISOString() };
    const assistantId = messageId();
    const pendingMessages = [...messages, userMessage, { id: assistantId, role: "assistant", content: "", ts: new Date().toISOString() } as ChatMessage];
    updateMessages(pendingMessages);
    setInput("");

    if (runClientToolIfNeeded(userText, pendingMessages, assistantId)) {
      setStreaming(false);
      setAttachment(null);
      return;
    }

    if (providerDef.keyRequired && !keys[provider]) {
      updateMessages(pendingMessages.map((m) => (m.id === assistantId ? { ...m, content: "Error: Missing API key for selected provider." } : m)));
      setStreaming(false);
      return;
    }

    const modelTags = detectTags(model);
    const content: any[] = [{ type: "text", text: userText }];
    if (attachment?.kind === "image" && modelTags.vision) {
      content.push({ type: "image_url", image_url: { url: attachment.value } });
    } else if (attachment?.kind === "text") {
      content[0].text += `\n\nAttached file (${attachment.name}):\n${attachment.value.slice(0, 20000)}`;
    }

    try {
      const key = keys[provider] || "ollama";
      let response: any;
      if (providerDef.protocol === "anthropic") {
        const anthropicMessages = messages
          .filter((m) => m.role !== "system")
          .map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: [{ type: "text", text: m.content }] }));
        anthropicMessages.push({ role: "user", content });

        const res = await fetch(toAbsolute(providerDef.baseURL, "/messages"), {
          method: "POST",
          headers: headersFor(provider, key),
          body: JSON.stringify({
            model,
            max_tokens: 2048,
            system: useSystemPrompt && canUseSystemPrompt ? effectiveSystemPrompt : undefined,
            messages: anthropicMessages,
          }),
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        response = {
          choices: [{ message: { content: (data.content || []).map((c: any) => c.text).join("\n") } }],
        };
      } else {
        const payloadMessages: any[] = [
          ...((useSystemPrompt && canUseSystemPrompt && effectiveSystemPrompt.trim()) ? [{ role: "system", content: effectiveSystemPrompt }] : []),
          ...messages.map((m) => ({ role: m.role, content: m.content })),
          { role: "user", content },
        ];
        const res = await fetch(toAbsolute(providerDef.baseURL, "/chat/completions"), {
          method: "POST",
          headers: headersFor(provider, key),
          body: JSON.stringify({ model, messages: payloadMessages, temperature: 0.7, stream: false }),
        });
        if (!res.ok) throw new Error(await res.text());
        response = await res.json();
      }

      const parsed = parseAssistant(response);
      updateMessages(pendingMessages.map((m) => m.id === assistantId ? { ...m, content: parsed.text, media: parsed.media } : m));

      const askCards = parseAskHumanCards(parsed.text);
      const toolCards = parseToolElicitCards(parsed.text);
      if (agenticMode !== "direct" && askCards.length) {
        setLoopState({ active: true, status: "paused_human", note: "Loop paused for AskHuman response." });
      } else if (agenticMode !== "direct" && toolCards.length) {
        setLoopState({ active: true, status: "paused_tool", note: "Loop paused for tool elicitation." });
      } else if (agenticMode !== "direct") {
        setLoopState({ active: true, status: "running", note: `Continue ${agenticMode} loop or finish with direct reply.` });
      } else {
        setLoopState({ active: false, status: "idle" });
      }

      const artifact = artifactFrom(parsed.text);
      if (artifact) {
        setArtifactCode(artifact.code);
        setArtifactType(artifact.type);
        setShowPreview(true);
      }

      if (speechEnabled) window.speechSynthesis.speak(new SpeechSynthesisUtterance(parsed.text.slice(0, 500)));
    } catch (error: any) {
      updateMessages(pendingMessages.map((m) => (m.id === assistantId ? { ...m, content: `Error: ${error.message || "Failed to get response."}` } : m)));
      if (agenticMode !== "direct") setLoopState({ active: true, status: "ready_to_resume", note: "Loop interrupted by error; adjust and resume." });
    } finally {
      setStreaming(false);
      setAttachment(null);
    }
  };

  const onFile = async (file?: File) => {
    if (!file) return;
    if (file.type.startsWith("image/")) {
      const url = await new Promise<string>((resolve) => {
        const fr = new FileReader();
        fr.onload = () => resolve(String(fr.result));
        fr.readAsDataURL(file);
      });
      setAttachment({ kind: "image", name: file.name, value: url, mime: file.type });
      return;
    }
    const text = await file.text();
    setAttachment({ kind: "text", name: file.name, value: text.slice(0, 50000), mime: file.type });
  };

  const artifactSrcDoc = useMemo(() => {
    if (artifactType === "html") return artifactCode;
    if (artifactType === "svg") return `<body style="margin:0">${artifactCode}</body>`;
    if (artifactType === "jsx" || artifactType === "tsx" || artifactType === "react") {
      return `<!doctype html><html><head><meta charset="utf-8"/><script src="https://unpkg.com/react@18/umd/react.development.js"></script><script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script><script src="https://unpkg.com/@babel/standalone/babel.min.js"></script><script src="https://cdn.tailwindcss.com"></script></head><body><div id="root"></div><script type="text/babel" data-presets="react,typescript">${artifactCode}\nconst root = ReactDOM.createRoot(document.getElementById('root')); root.render(typeof App !== 'undefined' ? <App /> : <div style={{padding:16}}>Define an App component to preview.</div>);</script></body></html>`;
    }
    return "";
  }, [artifactType, artifactCode]);

  const createNewChat = () => {
    const next = makeThread(provider, model, systemPrompt, useSystemPrompt);
    setThreads((prev) => [next, ...prev]);
    setActiveThreadId(next.id);
    setAttachment(null);
    setArtifactCode("");
    setArtifactType("");
  };

  const switchChat = (id: string) => {
    const target = threads.find((t) => t.id === id);
    if (!target) return;
    setActiveThreadId(id);
    setProvider(target.provider);
    setModel(target.model);
    setSystemPrompt(target.systemPrompt);
    setUseSystemPrompt(target.useSystemPrompt);
    setAttachment(null);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Bot className="h-5 w-5" /> Universal AI Playground</CardTitle>
          <CardDescription>
            🔒 Your data stays local. API keys and conversations are stored in your browser localStorage and sent directly to provider APIs.
          </CardDescription>
        </CardHeader>
      </Card>

      <PanelGroup direction="horizontal" className="min-h-[680px] rounded-xl border bg-background">
        <Panel defaultSize={showPreview && artifactCode ? 60 : 100}>
          <div className="flex h-full flex-col">
            <div className="border-b p-3 flex flex-wrap items-center gap-2">
              <Button size="sm" variant="outline" onClick={createNewChat}><Plus className="h-4 w-4" /> New chat</Button>
              <div className="relative">
                <Search className="h-3.5 w-3.5 absolute left-2 top-2 text-muted-foreground" />
                <Input className="pl-7 h-8 w-44" value={chatSearch} onChange={(e) => setChatSearch(e.target.value)} placeholder="Search chats" />
              </div>
              <select className="border rounded px-2 py-1 bg-background max-w-[220px]" value={activeThreadId} onChange={(e) => switchChat(e.target.value)}>
                {filteredThreads.map((t) => <option key={t.id} value={t.id}>{t.pinned ? "📌 " : ""}{t.title} · {new Date(t.updatedAt).toLocaleDateString()}</option>)}
              </select>
              <select className="border rounded px-2 py-1 bg-background" value={provider} onChange={(e) => setProvider(e.target.value as ProviderId)}>
                {PROVIDERS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
              <select className="border rounded px-2 py-1 bg-background max-w-[280px]" value={model} onChange={(e) => setModel(e.target.value)}>
                {(models[provider] || []).map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
              <select className="border rounded px-2 py-1 bg-background max-w-[200px]" value={agenticMode} onChange={(e) => setAgenticMode(e.target.value as AgenticMode)}>
                <option value="direct">Direct</option>
                <option value="react">ReAct Loop</option>
                <option value="plan-execute">Plan-Execute</option>
                <option value="chain-thought">Chain of Thought</option>
                <option value="tree-thought">Tree of Thoughts</option>
              </select>
              {detectTags(model).reasoning && <Badge>🧠 Reasoning</Badge>}
              {detectTags(model).vision && <Badge>👁 Vision</Badge>}
              {detectTags(model).code && <Badge>💻 Code</Badge>}

              <Button size="sm" variant="ghost" onClick={retryLastPrompt}><RotateCcw className="h-4 w-4" /> Retry prompt</Button>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm"><Sparkles className="h-4 w-4" /> Agent Skills ({skills.filter((s) => s.enabled).length})</Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <DialogHeader><DialogTitle>Agent Skills (agentskills.io style)</DialogTitle></DialogHeader>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Input placeholder="Skill name" value={skillName} onChange={(e) => setSkillName(e.target.value)} />
                      <Input placeholder="Short description" value={skillDescription} onChange={(e) => setSkillDescription(e.target.value)} />
                      <Textarea rows={5} placeholder="Instructions to inject into the system prompt..." value={skillInstructions} onChange={(e) => setSkillInstructions(e.target.value)} />
                      <div className="flex gap-2">
                        <Button onClick={addSkill}>Add skill</Button>
                        <Button variant="outline" onClick={exportSkills}>Export</Button>
                        <Button variant="outline" onClick={() => {
                          try {
                            const parsed = JSON.parse(skillInstructions) as AgentSkill[];
                            if (Array.isArray(parsed)) setSkills(parsed);
                          } catch {
                            /* ignore */
                          }
                        }}>Import from JSON in instructions</Button>
                      </div>
                    </div>
                    <ScrollArea className="h-72 rounded border p-2">
                      <div className="space-y-2">
                        {skills.map((skill) => (
                          <div key={skill.id} className="rounded border p-2 text-sm">
                            <div className="flex items-center justify-between">
                              <strong>{skill.name}</strong>
                              <div className="flex items-center gap-2">
                                <Switch checked={skill.enabled} onCheckedChange={(checked) => setSkills((prev) => prev.map((s) => s.id === skill.id ? { ...s, enabled: checked } : s))} />
                                <Button size="sm" variant="ghost" onClick={() => setSkills((prev) => prev.filter((s) => s.id !== skill.id))}><Trash2 className="h-3 w-3" /></Button>
                              </div>
                            </div>
                            {skill.description && <p className="text-muted-foreground">{skill.description}</p>}
                            <Textarea className="mt-2" rows={3} value={skill.instructions} onChange={(e) => setSkills((prev) => prev.map((s) => s.id === skill.id ? { ...s, instructions: e.target.value } : s))} />
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="ml-auto"><Settings className="h-4 w-4" /> Settings</Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <DialogHeader><DialogTitle>Provider Keys & Status</DialogTitle></DialogHeader>
                  <Tabs defaultValue="openai" className="w-full">
                    <TabsList className="flex flex-wrap h-auto">
                      {PROVIDERS.map((p) => (
                        <TabsTrigger key={p.id} value={p.id}>
                          {p.label} <span className={`ml-2 h-2 w-2 rounded-full inline-block ${statuses[p.id] === "ok" ? "bg-green-500" : statuses[p.id] === "bad" ? "bg-red-500" : "bg-zinc-400"}`} />
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    {PROVIDERS.map((p) => (
                      <TabsContent value={p.id} key={p.id} className="space-y-3">
                        <a className="text-sm underline" href={p.keyUrl} target="_blank" rel="noreferrer">Get API key</a>
                        <Input type="password" value={keys[p.id] || ""} placeholder={p.keyRequired ? "Paste key" : "Not required for Ollama"} onChange={(e) => saveKey(p.id, e.target.value)} />
                        <Button onClick={() => testProvider(p.id)}>Test Connection + Fetch Models</Button>
                      </TabsContent>
                    ))}
                  </Tabs>
                </DialogContent>
              </Dialog>
            </div>

            <div className="px-3 py-2 border-b space-y-2">
              <div className="flex items-center gap-2">
                <Switch checked={useSystemPrompt} onCheckedChange={setUseSystemPrompt} disabled={!canUseSystemPrompt} />
                <Label>System Prompt</Label>
                {!canUseSystemPrompt && <span className="text-xs text-muted-foreground">Disabled for reasoning model family (o1/o3/o4).</span>}
              </div>
              <Textarea value={systemPrompt} onChange={(e) => setSystemPrompt(e.target.value)} disabled={!useSystemPrompt || !canUseSystemPrompt} rows={2} />
              {!!enabledSkillInstructions && <p className="text-xs text-muted-foreground">{skills.filter((s) => s.enabled).length} skill(s) will be appended to the system prompt at send-time.</p>}
              {agenticMode !== "direct" && <p className="text-xs text-muted-foreground">Agentic mode active: <strong>{agenticMode}</strong> strategy instructions are appended to this thread.</p>}
              {loopState.active && <p className="text-xs text-muted-foreground">Loop status: <strong>{loopState.status}</strong>{loopState.note ? ` — ${loopState.note}` : ""}</p>}
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => setInput("Summarize this as action items with owners and due dates.")}>Action items</Button>
                <Button size="sm" variant="outline" onClick={() => setInput("Draft a concise follow-up email in To/Subject/Body format.")}>Draft email</Button>
                <Button size="sm" variant="outline" onClick={() => setInput("Turn this into a checklist and timeline.")}>Checklist</Button>
                <Button size="sm" variant="outline" onClick={() => setInput("If more information is needed, askhuman using ```askhuman JSON``` with text/select/radio/checkbox fields.")}>AskHuman template</Button>
                <Button size="sm" variant="outline" onClick={() => setInput("Use a ReAct loop to solve this task, and keep thoughts concise.")}>ReAct prompt</Button>
              </div>
            </div>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((m) => (
                  <div key={m.id} className={`rounded-lg border p-3 ${m.role === "assistant" ? "bg-muted/30" : "bg-background"}`}>
                    <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                      <span>{m.role}</span>
                      <div className="flex items-center gap-2">
                        <span>{new Date(m.ts).toLocaleTimeString()}</span>
                        {m.role === "assistant" && <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(m.content)}>Copy</Button>}
                        {m.role === "assistant" && <Button variant="ghost" size="sm" onClick={() => window.speechSynthesis.speak(new SpeechSynthesisUtterance(m.content))}><Volume2 className="h-3 w-3" /></Button>}
                      </div>
                    </div>
                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>{m.content}</ReactMarkdown>
                    {m.role === "assistant" && parseAskHumanCards(m.content).map((card) => {
                      const answers = askHumanAnswers[card.id] || {};
                      return (
                        <div key={card.id} className="mt-3 rounded-md border bg-background p-3 space-y-2">
                          <div className="text-sm font-semibold">🙋 {card.title}</div>
                          <p className="text-sm text-muted-foreground">{card.prompt}</p>
                          {card.fields.map((field) => (
                            <div key={field.id} className="space-y-1">
                              <Label className="text-xs">{field.label}{field.required ? " *" : ""}</Label>
                              {field.type === "text" && (
                                <Input value={String(answers[field.id] || "")} onChange={(e) => setAskHumanAnswers((prev) => ({ ...prev, [card.id]: { ...(prev[card.id] || {}), [field.id]: e.target.value } }))} />
                              )}
                              {field.type === "select" && (
                                <select className="w-full border rounded px-2 py-1 bg-background" value={String(answers[field.id] || "")} onChange={(e) => setAskHumanAnswers((prev) => ({ ...prev, [card.id]: { ...(prev[card.id] || {}), [field.id]: e.target.value } }))}>
                                  <option value="">Select an option</option>
                                  {(field.options || []).map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                              )}
                              {field.type === "radio" && (
                                <div className="flex flex-wrap gap-2">
                                  {(field.options || []).map((opt) => (
                                    <label key={opt} className="text-xs flex items-center gap-1 border rounded px-2 py-1">
                                      <input type="radio" name={`${card.id}-${field.id}`} checked={answers[field.id] === opt} onChange={() => setAskHumanAnswers((prev) => ({ ...prev, [card.id]: { ...(prev[card.id] || {}), [field.id]: opt } }))} />
                                      {opt}
                                    </label>
                                  ))}
                                </div>
                              )}
                              {field.type === "checkbox" && (
                                <div className="flex flex-wrap gap-2">
                                  {(field.options || []).map((opt) => {
                                    const selected = Array.isArray(answers[field.id]) ? answers[field.id] as string[] : [];
                                    return (
                                      <label key={opt} className="text-xs flex items-center gap-1 border rounded px-2 py-1">
                                        <input type="checkbox" checked={selected.includes(opt)} onChange={(e) => {
                                          const next = e.target.checked ? [...selected, opt] : selected.filter((v) => v !== opt);
                                          setAskHumanAnswers((prev) => ({ ...prev, [card.id]: { ...(prev[card.id] || {}), [field.id]: next } }));
                                        }} />
                                        {opt}
                                      </label>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          ))}
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => submitAskHuman(card)}>Submit answer</Button>
                            <Button size="sm" variant="outline" onClick={() => setAskHumanAnswers((prev) => ({ ...prev, [card.id]: {} }))}>Clear</Button>
                          </div>
                        </div>
                      );
                    })}
                    {m.role === "assistant" && parseToolElicitCards(m.content).map((card) => (
                      <div key={card.id} className="mt-3 rounded-md border bg-background p-3 space-y-2">
                        <div className="text-sm font-semibold">🧰 {card.title}</div>
                        <p className="text-sm text-muted-foreground">{card.prompt}</p>
                        <div className="rounded border p-2 font-mono text-xs">{card.suggestedCommand}</div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => runToolElicit(card)}>Run suggested tool</Button>
                          <Button size="sm" variant="outline" onClick={() => setInput(`${card.suggestedCommand}\n\nContinue the ${agenticMode} loop from this point.`)}>Copy to composer</Button>
                        </div>
                      </div>
                    ))}
                    {m.role === "assistant" && (() => {
                      const draft = extractEmailDraft(m.content);
                      if (!draft) return null;
                      return (
                        <div className="mt-3 rounded-md border bg-background p-3 text-sm space-y-2">
                          <div><strong>To:</strong> {draft.to}</div>
                          {draft.cc && <div><strong>CC:</strong> {draft.cc}</div>}
                          <div><strong>Subject:</strong> {draft.subject}</div>
                          <div className="whitespace-pre-wrap"><strong>Body:</strong> {draft.body}</div>
                          <a className="inline-flex items-center gap-1 text-primary underline" href={toMailto(draft)}>
                            <Mail className="h-4 w-4" /> Open in mail app
                          </a>
                        </div>
                      );
                    })()}
                    {!!m.media?.length && (
                      <div className="mt-3 space-y-2">
                        {m.media.map((item, idx) => item.kind === "image" ? (
                          <img key={idx} src={item.url} alt="AI output" className="max-h-80 rounded border" />
                        ) : (
                          <audio key={idx} controls src={item.url} className="w-full" />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="border-t p-3 space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{input.trim().split(/\s+/).filter(Boolean).length} words</span>
                <span>·</span>
                <span>{input.length} chars</span>
                <Button size="sm" variant="ghost" onClick={() => setComposerRows((r) => (r >= 6 ? 1 : r + 1))}><Pencil className="h-3 w-3" /> Expand composer</Button>
                <Button size="sm" variant="ghost" onClick={exportActiveChat}><Download className="h-3 w-3" /> Export JSON</Button>
                <Button size="sm" variant="ghost" onClick={exportTranscriptMarkdown}><Download className="h-3 w-3" /> Export MD</Button>
                {activeThread && <Button size="sm" variant="ghost" onClick={() => persistThreadPatch({ pinned: !activeThread.pinned })}>{activeThread.pinned ? "Unpin" : "Pin"}</Button>}
                {activeThread && <Button size="sm" variant="ghost" onClick={() => {
                  const next = prompt("Rename chat", activeThread.title);
                  if (next?.trim()) persistThreadPatch({ title: next.trim() });
                }}>Rename</Button>}
                {activeThread && <Button size="sm" variant="ghost" onClick={() => deleteChat(activeThread.id)}><Trash2 className="h-3 w-3" /> Delete</Button>}
                <Button size="sm" variant="ghost" onClick={clearAllChats}>Clear all</Button>
                {loopState.active && <Button size="sm" variant="ghost" onClick={() => setLoopState({ active: false, status: "idle", note: "Loop stopped by user." })}>Stop loop</Button>}
                {loopState.status === "ready_to_resume" && <Button size="sm" variant="ghost" onClick={send}>Resume loop</Button>}
              </div>
              {attachment && <p className="text-xs text-muted-foreground">Attached: {attachment.name} ({attachment.kind})</p>}
              <div className="flex gap-2 items-end">
                <Button variant="outline" size="icon" onClick={() => fileRef.current?.click()}><Paperclip className="h-4 w-4" /></Button>
                <Button variant="outline" size="icon" onClick={() => {
                  const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
                  if (!SR) return;
                  const rec = new SR();
                  rec.onresult = (e: any) => setInput((v) => `${v} ${e.results[0][0].transcript}`.trim());
                  rec.start();
                }}><Mic className="h-4 w-4" /></Button>
                <Textarea value={input} rows={composerRows} onChange={(e) => setInput(e.target.value)} placeholder="Message model..." onKeyDown={(e) => e.key === "Enter" && (e.metaKey || e.ctrlKey) && (e.preventDefault(), send())} />
                <Button onClick={send} disabled={streaming}><Send className="h-4 w-4" /></Button>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch checked={speechEnabled} onCheckedChange={setSpeechEnabled} />
                  <span className="text-xs text-muted-foreground">Auto-read assistant responses</span>
                </div>
                <div className="text-xs text-muted-foreground flex items-center gap-1"><ImageIcon className="h-3 w-3" /> Audio & image outputs supported.</div>
              </div>
              <input ref={fileRef} type="file" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
            </div>
          </div>
        </Panel>

        {showPreview && artifactCode && (
          <>
            <PanelResizeHandle className="w-1 bg-border" />
            <Panel defaultSize={40}>
              <Tabs defaultValue="preview" className="h-full">
                <div className="border-b p-2 flex items-center gap-2">
                  <TabsList>
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                    <TabsTrigger value="code">Code</TabsTrigger>
                    <TabsTrigger value="canvas">Canvas</TabsTrigger>
                  </TabsList>
                  <Badge variant="secondary">{artifactType}</Badge>
                  <Button size="sm" variant="ghost" className="ml-auto" onClick={() => setShowPreview(false)}><X className="h-4 w-4" /> Close</Button>
                </div>
                <TabsContent value="preview" className="h-[620px] m-0">
                  {(artifactSrcDoc && livePreview) ? <iframe title="artifact-preview" srcDoc={artifactSrcDoc} className="w-full h-full border-0" sandbox="allow-scripts" /> : <div className="p-4 text-sm">Preview unavailable for this artifact type.</div>}
                </TabsContent>
                <TabsContent value="code" className="h-[620px] m-0">
                  <Textarea value={artifactCode} onChange={(e) => setArtifactCode(e.target.value)} className="h-full font-mono" />
                </TabsContent>
                <TabsContent value="canvas" className="h-[620px] m-0 space-y-2 p-2">
                  <div className="flex gap-2 items-center">
                    <Switch checked={livePreview} onCheckedChange={setLivePreview} />
                    <span className="text-xs text-muted-foreground">Live preview</span>
                    <Button size="sm" variant="outline" onClick={() => setArtifactCode((c) => c)}><Play className="h-4 w-4" /> Run</Button>
                  </div>
                  <Editor height="560px" language={artifactType === "tsx" ? "typescript" : artifactType} value={artifactCode} onChange={(v) => setArtifactCode(v || "")} />
                </TabsContent>
              </Tabs>
            </Panel>
          </>
        )}
      </PanelGroup>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Wand2 className="h-5 w-5" /> Client Tool Calling + Docs Workspace</CardTitle>
          <CardDescription>Run slash-tools in real time (`/calc`, `/jsonfmt`, `/timer`) and edit Word/Excel-like files fully client-side.</CardDescription>
        </CardHeader>
        <div className="p-4 pt-0">
          <Tabs defaultValue="tools">
            <TabsList>
              <TabsTrigger value="tools">Tool Calls</TabsTrigger>
              <TabsTrigger value="agentic">Agentic</TabsTrigger>
              <TabsTrigger value="word"><FileText className="mr-1 h-4 w-4" />Word</TabsTrigger>
              <TabsTrigger value="excel"><FileSpreadsheet className="mr-1 h-4 w-4" />Excel</TabsTrigger>
            </TabsList>
            <TabsContent value="tools" className="mt-3">
              <div className="text-sm text-muted-foreground mb-2">{'Use commands like `/calc 12*(4+3)`, `/jsonfmt {"a":1}`, `/timer 10`, `/wordcount hello world` in chat.'}</div>
              <ScrollArea className="h-44 rounded border p-2">
                <div className="space-y-2 text-sm">
                  {toolEvents.length === 0 && <div className="text-muted-foreground">No tool calls yet.</div>}
                  {toolEvents.map((evt) => (
                    <div key={evt.id} className="rounded border p-2">
                      <div className="font-mono text-xs">{evt.command}</div>
                      <div className="whitespace-pre-wrap">{evt.output}</div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
            <TabsContent value="agentic" className="mt-3 space-y-3">
              <div className="rounded border p-3 text-sm space-y-2">
                <p><strong>Flow modes:</strong> Direct, ReAct, Plan-Execute, Chain-of-Thought, Tree-of-Thoughts.</p>
                <p className="text-muted-foreground">These strategies are injected into the effective system prompt to drive more agentic behavior.</p>
                <p className="text-muted-foreground">Loops can pause on <code>askhuman</code> or <code>tool_elicit</code>, then resume after human answers or tool outputs are captured.</p>
              </div>
              <Textarea
                rows={8}
                value={'```askhuman\n{\n  "id": "requirements-check",\n  "title": "Need input",\n  "prompt": "Please answer these questions",\n  "fields": [\n    {"id":"goal","label":"Main goal","type":"text","required":true},\n    {"id":"priority","label":"Priority","type":"radio","options":["Low","Medium","High"]},\n    {"id":"channels","label":"Channels","type":"checkbox","options":["Email","SMS","Push"]},\n    {"id":"region","label":"Region","type":"select","options":["US","EU","APAC"]}\n  ]\n}\n```'}
                readOnly
              />
            </TabsContent>
            <TabsContent value="word" className="mt-3 space-y-2">
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setWordDoc("<h2>Meeting Minutes</h2><ul><li>Attendees</li><li>Decisions</li><li>Actions</li></ul>")}>Minutes template</Button>
                <Button size="sm" variant="outline" onClick={downloadWordDoc}>Download .doc</Button>
              </div>
              <div contentEditable suppressContentEditableWarning className="min-h-44 rounded border p-3" dangerouslySetInnerHTML={{ __html: wordDoc }} onInput={(e) => setWordDoc((e.target as HTMLDivElement).innerHTML)} />
            </TabsContent>
            <TabsContent value="excel" className="mt-3 space-y-2">
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => setSheet(buildSheet())}>New sheet</Button>
                <Button size="sm" variant="outline" onClick={downloadSheetCsv}>Download CSV</Button>
                <Button size="sm" variant="outline" onClick={() => { if (!csvBuffer.trim()) return; setSheet(fromCsv(csvBuffer)); }}>Import CSV buffer</Button>
              </div>
              <Textarea rows={3} value={csvBuffer} onChange={(e) => setCsvBuffer(e.target.value)} placeholder="Paste CSV here to import into the grid" />
              <div className="overflow-auto rounded border">
                <table className="w-full text-xs">
                  <thead><tr><th className="border p-1"></th>{sheet[0]?.map((_, idx) => <th key={idx} className="border p-1">{colLabel(idx)}</th>)}</tr></thead>
                  <tbody>
                    {sheet.map((row, rIdx) => (
                      <tr key={rIdx}>
                        <td className="border p-1 font-medium">{rIdx + 1}</td>
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="border p-0">
                            <Input className="h-7 rounded-none border-0" value={cell} onChange={(e) => setSheet((prev) => prev.map((r, ri) => ri === rIdx ? r.map((c, ci) => ci === cIdx ? e.target.value : c) : r))} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </Card>
    </div>
  );
};
