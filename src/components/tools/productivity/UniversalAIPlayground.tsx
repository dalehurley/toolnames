import { useEffect, useMemo, useRef, useState } from "react";
import OpenAI from "openai";
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
import { Bot, Paperclip, Settings, Send, Play, Mic, Volume2 } from "lucide-react";

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
  extraHeaders?: Record<string, string>;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  ts: string;
}

interface Attachment {
  kind: "image" | "text";
  name: string;
  value: string;
  mime?: string;
}

const PROVIDERS: ProviderDef[] = [
  { id: "openai", label: "OpenAI", baseURL: "https://api.openai.com/v1", keyUrl: "https://platform.openai.com/api-keys", keyRequired: true },
  { id: "anthropic", label: "Anthropic", baseURL: "https://api.anthropic.com/v1", keyUrl: "https://console.anthropic.com/settings/keys", keyRequired: true, extraHeaders: { "anthropic-version": "2023-06-01" } },
  { id: "gemini", label: "Google Gemini", baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/", keyUrl: "https://aistudio.google.com/app/apikey", keyRequired: true },
  { id: "mistral", label: "Mistral", baseURL: "https://api.mistral.ai/v1", keyUrl: "https://console.mistral.ai/api-keys/", keyRequired: true },
  { id: "xai", label: "xAI", baseURL: "https://api.x.ai/v1", keyUrl: "https://console.x.ai/", keyRequired: true },
  { id: "groq", label: "Groq", baseURL: "https://api.groq.com/openai/v1", keyUrl: "https://console.groq.com/keys", keyRequired: true },
  { id: "cohere", label: "Cohere", baseURL: "https://api.cohere.com/compatibility/v1", keyUrl: "https://dashboard.cohere.com/api-keys", keyRequired: true },
  { id: "together", label: "Together AI", baseURL: "https://api.together.xyz/v1", keyUrl: "https://api.together.xyz/settings/api-keys", keyRequired: true },
  { id: "perplexity", label: "Perplexity", baseURL: "https://api.perplexity.ai", keyUrl: "https://www.perplexity.ai/settings/api", keyRequired: true },
  { id: "ollama", label: "Ollama (Local)", baseURL: "http://localhost:11434/v1", keyUrl: "https://ollama.com/download", keyRequired: false },
];

const FALLBACK_MODELS: Record<ProviderId, string[]> = {
  openai: ["gpt-4o", "gpt-4o-mini", "o1", "o1-mini", "o3", "o3-mini", "o4-mini", "gpt-4.1", "gpt-4.1-mini", "gpt-4.1-nano", "gpt-image-1"],
  anthropic: ["claude-opus-4-5", "claude-sonnet-4-5", "claude-haiku-4-5"],
  gemini: ["gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-2.5-pro", "gemini-nano (not API-available)"],
  mistral: ["mistral-large-latest", "mistral-small-latest", "codestral-latest", "pixtral-large-latest"],
  xai: ["grok-3", "grok-3-mini", "grok-2-vision"],
  groq: ["llama-3.3-70b-versatile", "deepseek-r1-distill-llama-70b", "mixtral-8x7b-32768"],
  cohere: ["command-r", "command-r-plus", "command-a"],
  together: ["meta-llama/Llama-3.3-70B-Instruct-Turbo", "deepseek-ai/DeepSeek-R1"],
  perplexity: ["sonar", "sonar-pro", "sonar-reasoning"],
  ollama: ["llama3.2", "qwen2.5-coder", "deepseek-r1"],
};

const xor = (value: string) =>
  value
    .split("")
    .map((ch, i) => String.fromCharCode(ch.charCodeAt(0) ^ ((i % 5) + 11)))
    .join("");

const encodeKey = (value: string) => btoa(xor(value));
const decodeKey = (value?: string | null) => {
  if (!value) return "";
  try {
    return xor(atob(value));
  } catch {
    return "";
  }
};

const messageId = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const artifactFrom = (text: string) => {
  const artifactTag = text.match(/<artifact[^>]*type="([^"]+)"[^>]*>([\s\S]*?)<\/artifact>/i);
  if (artifactTag) return { type: artifactTag[1].toLowerCase(), code: artifactTag[2].trim() };
  const fence = text.match(/```(html|jsx|tsx|svg|mermaid|python|csv|json)\n([\s\S]*?)```/i);
  if (!fence) return null;
  return { type: fence[1].toLowerCase(), code: fence[2].trim() };
};

export const UniversalAIPlayground = () => {
  const [provider, setProvider] = useState<ProviderId>("openai");
  const [keys, setKeys] = useState<Record<ProviderId, string>>({} as Record<ProviderId, string>);
  const [statuses, setStatuses] = useState<Record<ProviderId, "idle" | "ok" | "bad">>({} as Record<ProviderId, "idle" | "ok" | "bad">);
  const [models, setModels] = useState<Record<ProviderId, string[]>>(() => ({ ...FALLBACK_MODELS }));
  const [model, setModel] = useState(FALLBACK_MODELS.openai[0]);
  const [systemPrompt, setSystemPrompt] = useState("You are a coding assistant.");
  const [useSystemPrompt, setUseSystemPrompt] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const raw = localStorage.getItem("ai_playground_messages");
    return raw ? JSON.parse(raw) : [];
  });
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [artifactCode, setArtifactCode] = useState("");
  const [artifactType, setArtifactType] = useState("");
  const [livePreview, setLivePreview] = useState(true);
  const [speechEnabled, setSpeechEnabled] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const next = {} as Record<ProviderId, string>;
    const state = {} as Record<ProviderId, "idle" | "ok" | "bad">;
    PROVIDERS.forEach((p) => {
      next[p.id] = decodeKey(localStorage.getItem(`apikey_${p.id}`));
      state[p.id] = next[p.id] || !p.keyRequired ? "ok" : "idle";
      const cache = localStorage.getItem(`models_${p.id}`);
      if (cache) {
        try {
          setModels((prev) => ({ ...prev, [p.id]: JSON.parse(cache) }));
        } catch {
          // ignore bad cache
        }
      }
    });
    setKeys(next);
    setStatuses(state);
  }, []);

  useEffect(() => {
    localStorage.setItem("ai_playground_messages", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (!models[provider]?.includes(model)) setModel(models[provider][0]);
  }, [provider, models, model]);

  const providerDef = useMemo(() => PROVIDERS.find((p) => p.id === provider)!, [provider]);

  const testProvider = async (target: ProviderId) => {
    const def = PROVIDERS.find((p) => p.id === target)!;
    try {
      const client = new OpenAI({
        apiKey: keys[target] || "ollama",
        baseURL: def.baseURL,
        dangerouslyAllowBrowser: true,
        defaultHeaders: def.extraHeaders,
      });
      const list = await client.models.list();
      const fetched = list.data.map((m) => m.id).filter(Boolean);
      const merged = Array.from(new Set([...FALLBACK_MODELS[target], ...fetched]));
      setModels((prev) => ({ ...prev, [target]: merged }));
      localStorage.setItem(`models_${target}`, JSON.stringify(merged));
      setStatuses((prev) => ({ ...prev, [target]: "ok" }));
    } catch {
      setStatuses((prev) => ({ ...prev, [target]: "bad" }));
    }
  };

  const saveKey = (target: ProviderId, value: string) => {
    setKeys((prev) => ({ ...prev, [target]: value }));
    localStorage.setItem(`apikey_${target}`, encodeKey(value));
  };

  const canUseSystemPrompt = !/^o[134]/.test(model);

  const detectTags = (name: string) => {
    const n = name.toLowerCase();
    return {
      vision: /vision|4o|pixtral|gemini|grok-2/.test(n),
      reasoning: /o1|o3|r1|reason/.test(n),
      code: /code|codestral|coder/.test(n),
    };
  };

  const send = async () => {
    if (!input.trim() && !attachment) return;
    if (providerDef.keyRequired && !keys[provider]) return;
    setStreaming(true);

    const userText = input.trim() || "Attachment analysis request";
    const userMessage: ChatMessage = { id: messageId(), role: "user", content: userText, ts: new Date().toISOString() };
    const assistantId = messageId();
    setMessages((prev) => [...prev, userMessage, { id: assistantId, role: "assistant", content: "", ts: new Date().toISOString() }]);
    setInput("");

    const modelTags = detectTags(model);
    const content: any = [{ type: "text", text: userText }];
    if (attachment?.kind === "image" && modelTags.vision) {
      content.push({ type: "image_url", image_url: { url: attachment.value } });
    } else if (attachment?.kind === "text") {
      content[0].text += `\n\nAttached file (${attachment.name}):\n${attachment.value.slice(0, 20000)}`;
    }

    try {
      const client = new OpenAI({
        apiKey: keys[provider] || "ollama",
        baseURL: providerDef.baseURL,
        dangerouslyAllowBrowser: true,
        defaultHeaders: providerDef.extraHeaders,
      });
      const payloadMessages: any[] = [
        ...((useSystemPrompt && canUseSystemPrompt && systemPrompt.trim()) ? [{ role: "system", content: systemPrompt }] : []),
        ...messages.map((m) => ({ role: m.role, content: m.content })),
        { role: "user", content },
      ];

      const stream = await client.chat.completions.create({
        model,
        messages: payloadMessages,
        stream: true,
        temperature: 0.7,
      });

      let full = "";
      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content ?? "";
        if (!delta) continue;
        full += delta;
        setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, content: full } : m)));
      }

      const artifact = artifactFrom(full);
      if (artifact) {
        setArtifactCode(artifact.code);
        setArtifactType(artifact.type);
      }

      if (speechEnabled) window.speechSynthesis.speak(new SpeechSynthesisUtterance(full.slice(0, 500)));
    } catch (error: any) {
      setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, content: `Error: ${error.message || "Failed to stream response."}` } : m)));
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
      return `<!doctype html><html><head><script src="https://unpkg.com/react@18/umd/react.development.js"></script><script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script><script src="https://unpkg.com/@babel/standalone/babel.min.js"></script><script src="https://cdn.tailwindcss.com"></script></head><body><div id="root"></div><script type="text/babel">${artifactCode}\nReactDOM.render(<App />, document.getElementById('root'));</script></body></html>`;
    }
    return "";
  }, [artifactType, artifactCode]);

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
        <Panel defaultSize={artifactCode ? 60 : 100}>
          <div className="flex h-full flex-col">
            <div className="border-b p-3 flex flex-wrap items-center gap-2">
              <select className="border rounded px-2 py-1 bg-background" value={provider} onChange={(e) => setProvider(e.target.value as ProviderId)}>
                {PROVIDERS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
              <select className="border rounded px-2 py-1 bg-background max-w-[280px]" value={model} onChange={(e) => setModel(e.target.value)}>
                {(models[provider] || []).map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
              {detectTags(model).reasoning && <Badge>🧠 Reasoning</Badge>}
              {detectTags(model).vision && <Badge>👁 Vision</Badge>}
              {detectTags(model).code && <Badge>💻 Code</Badge>}

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
                  <p className="text-xs text-muted-foreground">Keys are obfuscated with simple XOR for readability protection only (not encryption).</p>
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
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="border-t p-3 space-y-2">
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
                <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Message model..." onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())} />
                <Button onClick={send} disabled={streaming}><Send className="h-4 w-4" /></Button>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={speechEnabled} onCheckedChange={setSpeechEnabled} />
                <span className="text-xs text-muted-foreground">Auto-read assistant responses</span>
              </div>
              <input ref={fileRef} type="file" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
            </div>
          </div>
        </Panel>

        {artifactCode && (
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
    </div>
  );
};
