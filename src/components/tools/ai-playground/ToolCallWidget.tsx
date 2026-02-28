import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Download, ChevronDown, ChevronUp } from "lucide-react";
import { ClientToolResult } from "@/utils/clientTools";
import { ToolCallRecord } from "@/hooks/useStream";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ToolCallWidgetProps {
  toolCall: ToolCallRecord;
  className?: string;
}

export function ToolCallWidget({ toolCall, className }: ToolCallWidgetProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copy = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success("Copied!");
    setTimeout(() => setCopiedField(null), 2000);
  };

  const { result } = toolCall;

  return (
    <div className={cn("my-2 rounded-xl border overflow-hidden bg-background", className)}>
      {/* Header */}
      <button
        className="flex items-center gap-2 px-3 py-2 w-full bg-muted/30 hover:bg-muted/50 transition-colors border-b"
        onClick={() => setCollapsed((v) => !v)}
      >
        <span className="text-base">{getToolIcon(toolCall.name)}</span>
        <span className="text-xs font-semibold flex-1 text-left">{getToolLabel(toolCall.name)}</span>
        <Badge variant="outline" className="text-[9px] px-1.5 h-4">tool</Badge>
        {collapsed ? <ChevronDown className="w-3 h-3 text-muted-foreground" /> : <ChevronUp className="w-3 h-3 text-muted-foreground" />}
      </button>

      {!collapsed && (
        <div className="px-3 py-2.5">
          <ResultContent result={result} toolName={toolCall.name} copy={copy} copiedField={copiedField} />
        </div>
      )}
    </div>
  );
}

function ResultContent({
  result,
  toolName,
  copy,
  copiedField,
}: {
  result: ClientToolResult;
  toolName: string;
  copy: (text: string, field: string) => void;
  copiedField: string | null;
}) {
  if (result.type === "calculator" || toolName === "calculator") {
    const { expression, result: res, error } = result.data as Record<string, string>;
    if (error) {
      return <ErrorDisplay message={error} />;
    }
    return (
      <div className="space-y-1">
        <div className="text-xs text-muted-foreground font-mono">{expression}</div>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-primary font-mono">{res}</span>
          <button
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-muted text-muted-foreground"
            onClick={() => copy(res, "result")}
          >
            {copiedField === "result" ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
          </button>
        </div>
      </div>
    );
  }

  if (result.type === "unit_converter") {
    const { value, fromUnit, toUnit, result: res, error } = result.data as Record<string, string | number>;
    if (error) return <ErrorDisplay message={String(error)} />;
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <div className="px-3 py-1.5 bg-muted rounded-lg text-sm font-mono font-medium">
          {String(value)} {String(fromUnit)}
        </div>
        <span className="text-muted-foreground">→</span>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 rounded-lg text-sm font-mono font-medium text-primary">
          {String(res)} {String(toUnit)}
          <button onClick={() => copy(String(res), "unit")} className="ml-1 opacity-60 hover:opacity-100">
            {copiedField === "unit" ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
          </button>
        </div>
      </div>
    );
  }

  if (result.type === "qrcode") {
    const { text, dataURL, error } = result.data as Record<string, string>;
    if (error) return <ErrorDisplay message={error} />;
    return (
      <div className="flex gap-4 items-start">
        <img src={dataURL} alt="QR Code" className="w-32 h-32 rounded border" />
        <div className="flex-1 min-w-0">
          <div className="text-xs text-muted-foreground mb-2 break-all">{text}</div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs gap-1"
              onClick={() => {
                const a = document.createElement("a");
                a.href = dataURL;
                a.download = "qrcode.png";
                a.click();
                toast.success("QR code downloaded");
              }}
            >
              <Download className="w-3 h-3" />
              Download PNG
            </Button>
            <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => copy(text, "qr")}>
              {copiedField === "qr" ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
              Copy URL
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (result.type === "json_formatter") {
    const d = result.data as Record<string, string | boolean | undefined>;
    const formatted = d.formatted as string | undefined;
    const valid = d.valid as boolean | undefined;
    const summary = d.summary as string | undefined;
    const error = d.error as string | undefined;
    const raw = d.raw as string | undefined;
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant={valid ? "default" : "destructive"} className="text-[10px]">
            {valid ? `✓ Valid JSON · ${summary}` : `✗ Invalid JSON`}
          </Badge>
        </div>
        {error && <ErrorDisplay message={error} />}
        {valid && formatted && (
          <div className="relative">
            <pre className="text-xs bg-muted rounded-lg p-3 overflow-x-auto max-h-48 font-mono">
              {formatted}
            </pre>
            <button
              className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded bg-background/80 hover:bg-muted border"
              onClick={() => copy(formatted, "json")}
            >
              {copiedField === "json" ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
        )}
        {!valid && raw && (
          <div className="text-xs font-mono text-muted-foreground bg-muted p-2 rounded line-clamp-3">{raw}</div>
        )}
      </div>
    );
  }

  if (result.type === "password_generator") {
    const { password, entropy, length } = result.data as Record<string, unknown>;
    const strengthColor =
      Number(entropy) >= 80 ? "text-green-500" : Number(entropy) >= 50 ? "text-yellow-500" : "text-red-500";
    const strengthLabel =
      Number(entropy) >= 80 ? "Strong" : Number(entropy) >= 50 ? "Moderate" : "Weak";
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2 font-mono text-sm">
          <span className="flex-1 break-all tracking-widest">{String(password)}</span>
          <button onClick={() => copy(String(password), "pw")} className="flex-shrink-0">
            {copiedField === "pw" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-muted-foreground hover:text-foreground" />}
          </button>
        </div>
        <div className="flex gap-3 text-[11px] text-muted-foreground">
          <span>{String(length)} characters</span>
          <span>~{String(entropy)} bits entropy</span>
          <span className={cn("font-semibold", strengthColor)}>{strengthLabel}</span>
        </div>
      </div>
    );
  }

  if (result.type === "color_palette") {
    const { colors, scheme } = result.data as { colors: string[]; scheme: string };
    return (
      <div className="space-y-2">
        <div className="flex gap-1.5 flex-wrap">
          {colors.map((color: string) => (
            <button
              key={color}
              className="group relative flex flex-col items-center gap-1"
              onClick={() => copy(color, color)}
              title={`Copy ${color}`}
            >
              <div
                className="w-10 h-10 rounded-lg border shadow-sm transition-transform hover:scale-110"
                style={{ backgroundColor: color }}
              />
              <span className="text-[9px] text-muted-foreground font-mono">
                {copiedField === color ? "✓" : color}
              </span>
            </button>
          ))}
        </div>
        <div className="text-[11px] text-muted-foreground capitalize">{scheme} scheme</div>
      </div>
    );
  }

  if (result.type === "regex_tester") {
    const { pattern, flags, matches, count, error, text } = result.data as Record<string, unknown>;
    if (error) return <ErrorDisplay message={String(error)} />;
    const matchList = matches as Array<{ match: string; index: number }>;
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <code className="text-xs bg-muted px-2 py-1 rounded font-mono">/{String(pattern)}/{String(flags || "")}</code>
          <Badge variant={Number(count) > 0 ? "default" : "outline"} className="text-[10px]">
            {String(count)} match{Number(count) !== 1 ? "es" : ""}
          </Badge>
        </div>
        {matchList.slice(0, 8).map((m, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <Badge variant="outline" className="text-[9px] px-1">at {m.index}</Badge>
            <code className="bg-yellow-100 dark:bg-yellow-900/30 px-1.5 py-0.5 rounded font-mono text-yellow-800 dark:text-yellow-200">
              {m.match}
            </code>
          </div>
        ))}
        {matchList.length > 8 && (
          <div className="text-[11px] text-muted-foreground">…and {matchList.length - 8} more matches</div>
        )}
        {Number(count) === 0 && (
          <div className="text-xs text-muted-foreground italic">
            No matches found in: "{String(text).slice(0, 60)}…"
          </div>
        )}
      </div>
    );
  }

  if (result.type === "base64") {
    const { operation, output, error } = result.data as Record<string, string>;
    if (error) return <ErrorDisplay message={error} />;
    return (
      <div className="space-y-1.5">
        <div className="text-[11px] text-muted-foreground capitalize">{operation}d result:</div>
        <div className="flex items-start gap-2">
          <code className="flex-1 text-xs bg-muted px-2 py-1.5 rounded font-mono break-all">{output}</code>
          <button onClick={() => copy(output, "b64")} className="flex-shrink-0 mt-1">
            {copiedField === "b64" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-muted-foreground hover:text-foreground" />}
          </button>
        </div>
      </div>
    );
  }

  if (result.type === "ask_human") {
    const { question, answer } = result.data as Record<string, string>;
    return (
      <div className="space-y-1.5">
        <div className="text-[11px] text-muted-foreground">
          <span className="font-medium">Question:</span> {question}
        </div>
        <div className="flex items-center gap-2 bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800 rounded-lg px-3 py-2">
          <span className="text-sm">💬</span>
          <span className="text-xs font-medium text-violet-800 dark:text-violet-200 flex-1">{answer}</span>
          <button onClick={() => copy(answer, "human")} className="flex-shrink-0">
            {copiedField === "human" ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3 text-muted-foreground hover:text-foreground" />}
          </button>
        </div>
      </div>
    );
  }

  // Fallback: show raw text
  return (
    <div className="text-xs text-muted-foreground font-mono whitespace-pre-wrap max-h-32 overflow-y-auto">
      {result.text}
    </div>
  );
}

function ErrorDisplay({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">
      <span>⚠️</span>
      <span>{message}</span>
    </div>
  );
}

function getToolIcon(name: string): string {
  const icons: Record<string, string> = {
    calculator: "🧮",
    unit_converter: "🔄",
    generate_qr_code: "📱",
    format_json: "📋",
    generate_password: "🔑",
    generate_color_palette: "🎨",
    test_regex: "🔍",
    base64: "🔢",
    ask_human: "🙋",
  };
  return icons[name] || "⚙️";
}

function getToolLabel(name: string): string {
  const labels: Record<string, string> = {
    calculator: "Calculator",
    unit_converter: "Unit Converter",
    generate_qr_code: "QR Code Generator",
    format_json: "JSON Formatter",
    generate_password: "Password Generator",
    generate_color_palette: "Color Palette",
    test_regex: "Regex Tester",
    base64: "Base64 Encoder/Decoder",
    ask_human: "Human Input",
  };
  return labels[name] || name.replace(/_/g, " ");
}

// ── Inline tool call summary shown in message stream ──────────────────────────

interface ToolCallsSummaryProps {
  toolCalls: ToolCallRecord[];
}

export function ToolCallsSummary({ toolCalls }: ToolCallsSummaryProps) {
  return (
    <div className="space-y-2 mt-3">
      {toolCalls.map((tc) => (
        <ToolCallWidget key={tc.id} toolCall={tc} />
      ))}
    </div>
  );
}
