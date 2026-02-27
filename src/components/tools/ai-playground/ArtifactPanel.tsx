import { useState, useEffect, useRef, useCallback } from "react";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArtifactType } from "@/hooks/useArtifact";
import {
  Download,
  Maximize2,
  RefreshCw,
  ExternalLink,
  X,
  Code2,
  Eye,
  Terminal,
  Sparkles,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ArtifactPanelProps {
  code: string;
  language: string;
  type: ArtifactType;
  title?: string;
  onClose: () => void;
  onCodeChange?: (code: string) => void;
  onAskAI?: (instruction: string, currentCode: string) => Promise<string | null>;
}

function buildIframeSrc(code: string, type: ArtifactType): string {
  if (type === "html") {
    return code;
  }

  if (type === "react") {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script src="https://cdn.tailwindcss.com"></script>
  <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <style>body { margin: 0; font-family: system-ui, sans-serif; }</style>
</head>
<body>
  <div id="root"></div>
  <script>
    window.onerror = function(msg, src, line) {
      parent.postMessage({ type: 'error', message: msg + ' (line ' + line + ')' }, '*');
    };
    window.console.log = function() {
      parent.postMessage({ type: 'log', args: Array.from(arguments).map(String) }, '*');
    };
    window.console.error = function() {
      parent.postMessage({ type: 'error', args: Array.from(arguments).map(String) }, '*');
    };
  </script>
  <script type="text/babel">
    try {
      ${code}
      const rootEl = document.getElementById('root');
      if (typeof App !== 'undefined') {
        ReactDOM.render(React.createElement(App), rootEl);
      } else if (typeof Component !== 'undefined') {
        ReactDOM.render(React.createElement(Component), rootEl);
      }
    } catch(e) {
      document.getElementById('root').innerHTML = '<pre style="color:red;padding:1rem;">' + e.message + '</pre>';
    }
  </script>
</body>
</html>`;
  }

  if (type === "svg") {
    return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<style>body{margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#f8f8f8;}</style>
</head>
<body>${code}</body>
</html>`;
  }

  if (type === "mermaid") {
    return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
<style>body{margin:1rem;font-family:system-ui;}</style>
</head>
<body>
<div class="mermaid">${code}</div>
<script>mermaid.initialize({startOnLoad:true,theme:'default'});</script>
</body>
</html>`;
  }

  if (type === "python") {
    return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<script src="https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js"></script>
<style>
body{margin:0;font-family:monospace;}
#output{padding:1rem;white-space:pre-wrap;background:#1e1e1e;color:#d4d4d4;min-height:100vh;font-size:13px;}
#loading{padding:1rem;color:#888;}
</style>
</head>
<body>
<div id="loading">Loading Python runtime...</div>
<div id="output" style="display:none;"></div>
<script>
async function run() {
  const pyodide = await loadPyodide();
  document.getElementById('loading').style.display = 'none';
  const out = document.getElementById('output');
  out.style.display = 'block';
  try {
    pyodide.setStdout({batched: (text) => { out.textContent += text + '\\n'; }});
    pyodide.setStderr({batched: (text) => { out.textContent += '❌ ' + text + '\\n'; }});
    await pyodide.runPythonAsync(${JSON.stringify(code)});
  } catch(e) {
    out.textContent += '\\n❌ ' + e.message;
  }
}
run();
</script>
</body>
</html>`;
  }

  if (type === "json") {
    return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<style>
body{margin:0;font-family:monospace;font-size:13px;}
pre{padding:1rem;white-space:pre-wrap;word-break:break-all;}
.key{color:#9b59b6;}
.str{color:#27ae60;}
.num{color:#e67e22;}
.bool{color:#2980b9;}
.null{color:#7f8c8d;}
</style>
</head>
<body>
<pre id="out"></pre>
<script>
try {
  const json = JSON.parse(${JSON.stringify(code)});
  document.getElementById('out').textContent = JSON.stringify(json, null, 2);
} catch(e) {
  document.getElementById('out').textContent = 'Invalid JSON: ' + e.message;
}
</script>
</body>
</html>`;
  }

  if (type === "csv") {
    return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<style>
body{margin:0;font-family:system-ui;font-size:12px;}
table{border-collapse:collapse;width:100%;}
th{background:#f1f5f9;font-weight:600;padding:6px 10px;text-align:left;border:1px solid #e2e8f0;}
td{padding:5px 10px;border:1px solid #e2e8f0;}
tr:nth-child(even){background:#f8fafc;}
</style>
</head>
<body>
<div id="table"></div>
<script>
const csv = ${JSON.stringify(code)};
const rows = csv.trim().split('\\n').map(r => r.split(',').map(c => c.trim().replace(/^"|"$/g,'')));
const table = document.createElement('table');
const thead = table.createTHead();
const hrow = thead.insertRow();
(rows[0]||[]).forEach(h => { const th = document.createElement('th'); th.textContent = h; hrow.appendChild(th); });
const tbody = table.createTBody();
rows.slice(1).forEach(r => { const row = tbody.insertRow(); r.forEach(c => { row.insertCell().textContent = c; }); });
document.getElementById('table').appendChild(table);
</script>
</body>
</html>`;
  }

  return `<pre style="padding:1rem;font-family:monospace;">${code.replace(/</g, "&lt;")}</pre>`;
}

export function ArtifactPanel({
  code: initialCode,
  language,
  type,
  title,
  onClose,
  onCodeChange,
  onAskAI,
}: ArtifactPanelProps) {
  const [code, setCode] = useState(initialCode);
  const [activeTab, setActiveTab] = useState<"preview" | "code" | "console">("preview");
  const [iframeSrc, setIframeSrc] = useState(() => buildIframeSrc(initialCode, type));
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [fullscreen, setFullscreen] = useState(false);
  const [showAskAI, setShowAskAI] = useState(false);
  const [aiInstruction, setAiInstruction] = useState("");
  const [isAiEditing, setIsAiEditing] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const reloadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Listen for messages from iframe
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "log") {
        setConsoleLogs((prev) => [...prev, `> ${e.data.args?.join(" ") || ""}`]);
      } else if (e.data?.type === "error") {
        setConsoleLogs((prev) => [...prev, `❌ ${e.data.args?.join(" ") || e.data.message || ""}`]);
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  const refreshPreview = useCallback(() => {
    setConsoleLogs([]);
    setIframeSrc(buildIframeSrc(code, type));
  }, [code, type]);

  const handleCodeChange = useCallback(
    (value: string | undefined) => {
      const newCode = value || "";
      setCode(newCode);
      onCodeChange?.(newCode);

      // Debounced live preview
      if (reloadTimerRef.current) clearTimeout(reloadTimerRef.current);
      reloadTimerRef.current = setTimeout(() => {
        setIframeSrc(buildIframeSrc(newCode, type));
        setConsoleLogs([]);
      }, 500);
    },
    [onCodeChange, type]
  );

  const download = () => {
    const ext =
      type === "html"
        ? "html"
        : type === "react"
        ? "jsx"
        : type === "svg"
        ? "svg"
        : type === "python"
        ? "py"
        : type === "csv"
        ? "csv"
        : type === "json"
        ? "json"
        : "txt";
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `artifact.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const openInTab = () => {
    const src = buildIframeSrc(code, type);
    const blob = new Blob([src], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  const handleAskAI = useCallback(async () => {
    if (!aiInstruction.trim() || !onAskAI) return;
    setIsAiEditing(true);
    try {
      const newCode = await onAskAI(aiInstruction, code);
      if (newCode) {
        setCode(newCode);
        onCodeChange?.(newCode);
        setIframeSrc(buildIframeSrc(newCode, type));
        setAiInstruction("");
        setShowAskAI(false);
      }
    } finally {
      setIsAiEditing(false);
    }
  }, [aiInstruction, code, onAskAI, onCodeChange, type]);

  const monacoLanguage =
    language === "jsx" || language === "tsx"
      ? "typescript"
      : language === "mermaid"
      ? "markdown"
      : language || "text";

  return (
    <div
      className={cn(
        "flex flex-col bg-background border-l h-full",
        fullscreen && "fixed inset-0 z-50"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/30 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground capitalize">
            {type} artifact
          </span>
          {title && <span className="text-xs text-foreground">{title}</span>}
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={refreshPreview} title="Refresh">
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
          {(type === "html" || type === "react") && (
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={openInTab} title="Open in new tab">
              <ExternalLink className="w-3.5 h-3.5" />
            </Button>
          )}
          {onAskAI && (
            <Button
              variant={showAskAI ? "default" : "ghost"}
              size="icon"
              className="h-7 w-7"
              onClick={() => setShowAskAI(!showAskAI)}
              title="Ask AI to edit"
            >
              <Sparkles className="w-3.5 h-3.5" />
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={download} title="Download">
            <Download className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setFullscreen(!fullscreen)}
            title="Fullscreen"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose} title="Close">
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Ask AI to edit bar */}
      {showAskAI && (
        <div className="flex items-center gap-2 px-3 py-2 border-b bg-muted/10">
          <Sparkles className="w-3.5 h-3.5 text-primary flex-shrink-0" />
          <Input
            placeholder="Describe your edit… e.g. 'Add a dark mode toggle'"
            value={aiInstruction}
            onChange={(e) => setAiInstruction(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleAskAI()}
            className="h-7 text-xs flex-1"
            autoFocus
            disabled={isAiEditing}
          />
          <Button
            size="sm"
            className="h-7 px-3 text-xs"
            onClick={handleAskAI}
            disabled={!aiInstruction.trim() || isAiEditing}
          >
            {isAiEditing ? <Loader2 className="w-3 h-3 animate-spin" /> : "Apply"}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => { setShowAskAI(false); setAiInstruction(""); }}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      )}

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as typeof activeTab)}
        className="flex flex-col flex-1 min-h-0"
      >
        <TabsList className="flex-shrink-0 mx-3 mt-2 h-8 w-auto justify-start">
          <TabsTrigger value="preview" className="text-xs h-7 gap-1">
            <Eye className="w-3 h-3" />
            Preview
          </TabsTrigger>
          <TabsTrigger value="code" className="text-xs h-7 gap-1">
            <Code2 className="w-3 h-3" />
            Code
          </TabsTrigger>
          {(type === "react" || type === "html" || type === "python") && (
            <TabsTrigger value="console" className="text-xs h-7 gap-1">
              <Terminal className="w-3 h-3" />
              Console
              {consoleLogs.length > 0 && (
                <span className="bg-primary/20 text-primary rounded-full px-1 text-[10px]">
                  {consoleLogs.length}
                </span>
              )}
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="preview" className="flex-1 m-0 mt-2 min-h-0">
          <iframe
            ref={iframeRef}
            srcDoc={iframeSrc}
            sandbox="allow-scripts allow-same-origin allow-downloads"
            className="w-full h-full border-0"
            title="Artifact preview"
          />
        </TabsContent>

        <TabsContent value="code" className="flex-1 m-0 mt-2 min-h-0">
          <Editor
            value={code}
            language={monacoLanguage}
            theme="vs-dark"
            onChange={handleCodeChange}
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              lineNumbers: "on",
              wordWrap: "on",
              scrollBeyondLastLine: false,
              tabSize: 2,
            }}
            className="h-full"
          />
        </TabsContent>

        <TabsContent value="console" className="flex-1 m-0 mt-2 min-h-0 overflow-hidden">
          <div className="h-full bg-zinc-950 font-mono text-xs p-3 overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-zinc-500">Console output</span>
              <button
                className="text-zinc-500 hover:text-zinc-300 text-[10px]"
                onClick={() => setConsoleLogs([])}
              >
                Clear
              </button>
            </div>
            {consoleLogs.length === 0 ? (
              <p className="text-zinc-600">No output yet. Run the preview to see logs.</p>
            ) : (
              consoleLogs.map((log, i) => (
                <div
                  key={i}
                  className={cn(
                    "py-0.5 border-b border-zinc-900",
                    log.startsWith("❌") ? "text-red-400" : "text-zinc-300"
                  )}
                >
                  {log}
                </div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
