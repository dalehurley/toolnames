import { useState } from "react";
import { Brain, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ThoughtBlockProps {
  content: string;
  isStreaming?: boolean;
  /** Label override: "Reasoning" | "Planning" | "Exploring" etc. */
  label?: string;
  className?: string;
}

/** Collapsible block for <thinking>…</thinking> content.
 *  Starts expanded while streaming, collapses when done. */
export function ThoughtBlock({
  content,
  isStreaming = false,
  label = "Reasoning",
  className,
}: ThoughtBlockProps) {
  const [expanded, setExpanded] = useState(isStreaming);

  return (
    <div
      className={cn(
        "my-2 rounded-lg border border-violet-200 dark:border-violet-800 bg-violet-50/60 dark:bg-violet-950/30 overflow-hidden",
        className
      )}
    >
      {/* Header — always visible */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-violet-100/50 dark:hover:bg-violet-900/30 transition-colors"
      >
        <Brain className="w-3.5 h-3.5 text-violet-500 flex-shrink-0" />
        <span className="text-xs font-medium text-violet-700 dark:text-violet-300 flex-1">
          {isStreaming ? `${label}…` : label}
        </span>
        {isStreaming && (
          <Loader2 className="w-3 h-3 text-violet-400 animate-spin" />
        )}
        <span className="text-violet-400">
          {expanded ? (
            <ChevronUp className="w-3 h-3" />
          ) : (
            <ChevronDown className="w-3 h-3" />
          )}
        </span>
      </button>

      {/* Collapsible body */}
      {expanded && content && (
        <div className="px-3 pb-3 pt-1 border-t border-violet-200 dark:border-violet-800">
          <div className="text-xs text-violet-700 dark:text-violet-300 leading-relaxed prose prose-xs dark:prose-invert max-w-none prose-p:my-1 prose-headings:text-violet-700">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          </div>
        </div>
      )}

      {expanded && !content && isStreaming && (
        <div className="px-3 pb-3 pt-1 border-t border-violet-200 dark:border-violet-800">
          <div className="text-xs text-violet-400 italic">Thinking…</div>
        </div>
      )}
    </div>
  );
}

// ── Step indicator for Plan-Execute mode ──────────────────────────────────────

export type PlanStep = {
  index: number;
  text: string;
  status: "pending" | "running" | "done";
  result?: string;
};

interface PlanProgressProps {
  steps: PlanStep[];
  className?: string;
}

export function PlanProgress({ steps, className }: PlanProgressProps) {
  const [expanded, setExpanded] = useState(true);

  const done = steps.filter((s) => s.status === "done").length;

  return (
    <div
      className={cn(
        "my-2 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50/60 dark:bg-blue-950/30 overflow-hidden",
        className
      )}
    >
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-blue-100/50 dark:hover:bg-blue-900/30 transition-colors"
      >
        <span className="text-sm">📋</span>
        <span className="text-xs font-medium text-blue-700 dark:text-blue-300 flex-1">
          Execution Plan · {done}/{steps.length} steps
        </span>
        {steps.some((s) => s.status === "running") && (
          <Loader2 className="w-3 h-3 text-blue-400 animate-spin" />
        )}
        <span className="text-blue-400">
          {expanded ? (
            <ChevronUp className="w-3 h-3" />
          ) : (
            <ChevronDown className="w-3 h-3" />
          )}
        </span>
      </button>

      {expanded && (
        <div className="px-3 pb-3 pt-1 border-t border-blue-200 dark:border-blue-800 space-y-1.5">
          {steps.map((step) => (
            <div key={step.index} className="flex items-start gap-2">
              <span className="text-sm flex-shrink-0 mt-0.5">
                {step.status === "done"
                  ? "✅"
                  : step.status === "running"
                  ? "⚡"
                  : "⬜"}
              </span>
              <div className="flex-1 min-w-0">
                <div
                  className={cn(
                    "text-xs",
                    step.status === "done"
                      ? "text-blue-800 dark:text-blue-200"
                      : step.status === "running"
                      ? "text-blue-600 dark:text-blue-400 font-medium"
                      : "text-blue-400 dark:text-blue-500"
                  )}
                >
                  <span className="font-medium">Step {step.index + 1}:</span>{" "}
                  {step.text}
                </div>
                {step.result && step.status === "done" && (
                  <div className="text-[10px] text-blue-500 dark:text-blue-400 mt-0.5 line-clamp-2 font-mono">
                    → {step.result}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Utility: parse <thinking> blocks from AI text ────────────────────────────

export type ParsedSegment =
  | { type: "text"; content: string }
  | { type: "thinking"; content: string; label?: string };

/** Split text into alternating text and <thinking> blocks. */
export function parseThinkingBlocks(text: string): ParsedSegment[] {
  const parts: ParsedSegment[] = [];
  // Also handle <think> (some models use shorter tag)
  const regex = /<(thinking|think)>([\s\S]*?)<\/\1>/gi;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      const before = text.slice(lastIndex, match.index);
      if (before.trim()) parts.push({ type: "text", content: before });
    }
    parts.push({ type: "thinking", content: match[2] });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    const after = text.slice(lastIndex);
    if (after.trim()) parts.push({ type: "text", content: after });
  }

  // If nothing parsed, return whole text as-is
  if (parts.length === 0) {
    parts.push({ type: "text", content: text });
  }

  return parts;
}

/** Check if text contains any <thinking> or <think> blocks */
export function hasThinkingBlocks(text: string): boolean {
  return /<(thinking|think)>[\s\S]*?<\/\1>/i.test(text);
}
