/**
 * ToolElicitCard — renders a tool-elicit request block emitted by the AI.
 *
 * Format the AI should output:
 * ```tool_elicit
 * {
 *   "tool": "calculator",
 *   "params": { "expression": "2 + 2" },
 *   "reason": "I need to compute 2 + 2"
 * }
 * ```
 *
 * When the user clicks "Run", we execute the client tool and display the result.
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TOOL_BY_NAME } from "@/utils/clientTools";
import { Wrench, Play, X, CheckCircle2, Loader2 } from "lucide-react";

interface ToolElicitRequest {
  tool: string;
  params?: Record<string, unknown>;
  reason?: string;
}

/** Parse all ```tool_elicit ... ``` blocks from an assistant message */
export function parseToolElicitBlocks(text: string): ToolElicitRequest[] {
  const results: ToolElicitRequest[] = [];
  const pattern = /```tool_elicit\n([\s\S]*?)```/g;
  let match;
  while ((match = pattern.exec(text)) !== null) {
    try {
      const parsed = JSON.parse(match[1].trim());
      if (parsed && typeof parsed.tool === "string") {
        results.push(parsed as ToolElicitRequest);
      }
    } catch {
      // Ignore malformed JSON
    }
  }
  return results;
}

interface ToolElicitCardProps {
  request: ToolElicitRequest;
  /** Called with formatted result string after execution */
  onResult?: (result: string) => void;
}

export function ToolElicitCard({ request, onResult }: ToolElicitCardProps) {
  const [status, setStatus] = useState<"idle" | "running" | "done" | "dismissed">("idle");
  const [resultText, setResultText] = useState<string | null>(null);

  const tool = TOOL_BY_NAME[request.tool];

  if (status === "dismissed") return null;

  const handleRun = async () => {
    if (!tool) return;
    setStatus("running");
    try {
      const result = await tool.execute(request.params ?? {});
      const formatted = JSON.stringify(result.data, null, 2);
      setResultText(formatted);
      setStatus("done");
      onResult?.(formatted);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Tool execution failed";
      setResultText(msg);
      setStatus("done");
    }
  };

  return (
    <div className="my-2 rounded-lg border border-amber-300/60 bg-amber-50/30 dark:bg-amber-950/20 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 bg-amber-100/40 dark:bg-amber-900/20 border-b border-amber-300/40">
        <Wrench className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
        <span className="text-xs font-semibold text-amber-700 dark:text-amber-300 flex-1">
          Tool Request
        </span>
        <Badge variant="outline" className="text-[10px] px-1.5 h-4 border-amber-400/60 text-amber-700 dark:text-amber-300">
          {tool?.icon ?? "🔧"} {request.tool}
        </Badge>
        {status === "idle" && (
          <button
            className="text-muted-foreground hover:text-foreground"
            onClick={() => setStatus("dismissed")}
            title="Dismiss"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Body */}
      <div className="px-3 py-2 space-y-1.5">
        {/* Tool description */}
        {tool && (
          <p className="text-[11px] text-muted-foreground">{tool.description}</p>
        )}
        {!tool && (
          <p className="text-[11px] text-red-500">Unknown tool: <code>{request.tool}</code></p>
        )}

        {/* Reason */}
        {request.reason && (
          <p className="text-[11px] text-foreground/80 italic">"{request.reason}"</p>
        )}

        {/* Params preview */}
        {request.params && Object.keys(request.params).length > 0 && (
          <div className="bg-muted/40 rounded px-2 py-1.5 font-mono text-[10px] text-muted-foreground whitespace-pre-wrap">
            {JSON.stringify(request.params, null, 2)}
          </div>
        )}

        {/* Result */}
        {resultText && (
          <div className="bg-muted/60 rounded px-2 py-1.5 font-mono text-[10px] text-foreground whitespace-pre-wrap">
            {resultText}
          </div>
        )}

        {/* Actions */}
        {status === "idle" && tool && (
          <div className="flex gap-2 pt-0.5">
            <Button size="sm" className="h-6 text-xs gap-1 bg-amber-600 hover:bg-amber-700 text-white" onClick={handleRun}>
              <Play className="w-3 h-3" />
              Run {request.tool}
            </Button>
            <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={() => setStatus("dismissed")}>
              Dismiss
            </Button>
          </div>
        )}
        {status === "running" && (
          <div className="flex items-center gap-1.5 text-[11px] text-amber-600">
            <Loader2 className="w-3 h-3 animate-spin" />
            Running…
          </div>
        )}
        {status === "done" && (
          <div className="flex items-center gap-1.5 text-[11px] text-green-600 dark:text-green-400">
            <CheckCircle2 className="w-3 h-3" />
            Done
          </div>
        )}
      </div>
    </div>
  );
}
