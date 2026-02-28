import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink, Download, Loader2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface MermaidBlockProps {
  code: string;
  className?: string;
}

let mermaidLoaded = false;
let mermaidLoading = false;
const mermaidCallbacks: Array<() => void> = [];

/** Dynamically load mermaid from CDN once */
function loadMermaid(): Promise<void> {
  return new Promise((resolve) => {
    if (mermaidLoaded) {
      resolve();
      return;
    }
    mermaidCallbacks.push(resolve);
    if (mermaidLoading) return;
    mermaidLoading = true;

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js";
    script.onload = () => {
      // @ts-expect-error mermaid is loaded globally
      window.mermaid.initialize({
        startOnLoad: false,
        theme: document.documentElement.classList.contains("dark") ? "dark" : "default",
        securityLevel: "loose",
      });
      mermaidLoaded = true;
      mermaidCallbacks.forEach((cb) => cb());
      mermaidCallbacks.length = 0;
    };
    script.onerror = () => {
      mermaidLoading = false;
      mermaidCallbacks.forEach((cb) => cb());
      mermaidCallbacks.length = 0;
    };
    document.head.appendChild(script);
  });
}

let renderCounter = 0;

export function MermaidBlock({ code, className }: MermaidBlockProps) {
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const idRef = useRef<string>(`mermaid-${++renderCounter}`);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setSvg(null);
    setError(null);

    loadMermaid().then(async () => {
      if (cancelled) return;
      try {
        // @ts-expect-error mermaid global
        if (!window.mermaid) {
          setError("Mermaid failed to load");
          setLoading(false);
          return;
        }
        // @ts-expect-error mermaid global
        const { svg: result } = await window.mermaid.render(idRef.current, code);
        if (!cancelled) {
          setSvg(result);
          setLoading(false);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Diagram rendering failed");
          setLoading(false);
        }
      }
    });

    return () => { cancelled = true; };
  }, [code]);

  const liveEditorUrl = `https://mermaid.live/edit#base64:${btoa(unescape(encodeURIComponent(JSON.stringify({ code, mermaid: { theme: "default" } }))))}`;

  const downloadSVG = () => {
    if (!svg) return;
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "diagram.svg";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={cn("my-3 rounded-xl border overflow-hidden", className)}>
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 border-b">
        <span className="text-sm">📊</span>
        <span className="text-xs font-semibold flex-1">Diagram</span>
        <div className="flex gap-1">
          {svg && (
            <Button size="sm" variant="ghost" className="h-6 text-[10px] px-2 gap-1" onClick={downloadSVG}>
              <Download className="w-3 h-3" />
              SVG
            </Button>
          )}
          <Button size="sm" variant="ghost" className="h-6 text-[10px] px-2 gap-1" asChild>
            <a href={liveEditorUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-3 h-3" />
              Edit
            </a>
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 bg-white dark:bg-zinc-950 min-h-[80px] flex items-center justify-center">
        {loading && (
          <div className="flex items-center gap-2 text-muted-foreground text-xs">
            <Loader2 className="w-4 h-4 animate-spin" />
            Rendering diagram…
          </div>
        )}
        {error && (
          <div className="flex flex-col items-center gap-2 text-center">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            <p className="text-xs text-muted-foreground max-w-xs">{error}</p>
            <a
              href={liveEditorUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" />
              Open in Mermaid Live
            </a>
          </div>
        )}
        {svg && !loading && (
          <div
            ref={containerRef}
            className="w-full overflow-x-auto"
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        )}
      </div>
    </div>
  );
}
