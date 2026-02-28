import { useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAIPlaygroundStore, ChatMessage, EmojiReaction } from "@/store/aiPlayground";
import { detectArtifact } from "@/hooks/useArtifact";
import { EmailCard, parseEmail } from "./EmailCard";
import { CalendarCard, parseCalendarEvent } from "./CalendarCard";
import { ToolCallsSummary } from "./ToolCallWidget";
import { SpreadsheetWidget, extractMarkdownTable, parseMarkdownTable } from "./SpreadsheetWidget";
import { MermaidBlock } from "./MermaidBlock";
import { buildAndDownloadDocx } from "@/utils/docxBuilder";
import type { ToolCallRecord } from "@/hooks/useStream";
import {
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  Volume2,
  VolumeX,
  Trash2,
  RotateCcw,
  Code2,
  Play,
  Pencil,
  X,
  RefreshCw,
  Star,
  Quote,
  GitFork,
  FileText,
  Sheet,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, format } from "date-fns";

const REACTIONS: EmojiReaction[] = ["🔥", "💡", "⭐", "❤️", "👀"];

interface MessageItemProps {
  message: ChatMessage;
  conversationId: string;
  isLast?: boolean;
  isStreaming?: boolean;
  onRegenerate?: () => void;
  onArtifactOpen?: (code: string, type: string, language: string) => void;
  onSpeak?: (text: string) => void;
  isSpeaking?: boolean;
  onStopSpeak?: () => void;
  onEditAndRerun?: (messageId: string, newContent: string) => void;
  onRetry?: () => void;
  onQuote?: (text: string) => void;
  viewDensity?: "compact" | "cozy" | "spacious";
  searchQuery?: string;
  toolCalls?: ToolCallRecord[];
}

function highlight(text: string, query: string): React.ReactNode {
  if (!query) return text;
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={i} className="bg-yellow-300 dark:bg-yellow-600 rounded px-0.5">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

function CodeBlock({
  code,
  language,
  onArtifactOpen,
}: {
  code: string;
  language: string;
  onArtifactOpen?: (code: string, type: string, language: string) => void;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const artifact = detectArtifact("```" + language + "\n" + code + "\n```");
  const canRun = artifact !== null;
  const lines = code.split("\n");

  return (
    <div className="relative group my-2 rounded-lg overflow-hidden border bg-zinc-950 dark:bg-zinc-900">
      <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-800 border-b border-zinc-700">
        <span className="text-xs text-zinc-400 font-mono">{language || "code"}</span>
        <div className="flex gap-1">
          {canRun && onArtifactOpen && (
            <>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 px-2 text-xs text-zinc-400 hover:text-white hover:bg-zinc-700"
                onClick={() => onArtifactOpen(code, artifact!.type || "html", language)}
              >
                <Play className="w-3 h-3 mr-1" />
                Run
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 px-2 text-xs text-zinc-400 hover:text-white hover:bg-zinc-700"
                onClick={() => onArtifactOpen(code, artifact!.type || "html", language)}
              >
                <Code2 className="w-3 h-3 mr-1" />
                Canvas
              </Button>
            </>
          )}
          <Button
            size="sm"
            variant="ghost"
            className="h-6 px-2 text-xs text-zinc-400 hover:text-white hover:bg-zinc-700"
            onClick={copy}
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          </Button>
        </div>
      </div>
      <div className="flex overflow-x-auto text-sm leading-relaxed">
        <div
          className="select-none text-right pr-3 pl-3 py-3 text-zinc-600 font-mono text-xs border-r border-zinc-800 flex-shrink-0"
          aria-hidden="true"
        >
          {lines.map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>
        <pre className="p-3 text-zinc-100 flex-1 min-w-0">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}

export function MessageItem({
  message,
  conversationId,
  isLast,
  isStreaming,
  onRegenerate,
  onArtifactOpen,
  onSpeak,
  isSpeaking,
  onStopSpeak,
  onEditAndRerun,
  onRetry,
  onQuote,
  viewDensity = "cozy",
  searchQuery = "",
  toolCalls,
}: MessageItemProps) {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState("");

  const {
    setThumbsRating,
    deleteMessage,
    toggleReaction,
    starMessage,
    unstarMessage,
    isStarred,
    forkConversation,
    setActiveConversation,
  } = useAIPlaygroundStore();

  const starred = isStarred(conversationId, message.id);
  const isUser = message.role === "user";
  const isAssistant = message.role === "assistant";

  const textContent =
    typeof message.content === "string"
      ? message.content
      : message.content
          .filter((p) => p.type === "text")
          .map((p) => p.text || "")
          .join("\n");

  const imageContent =
    typeof message.content === "string"
      ? []
      : message.content.filter((p) => p.type === "image_url");

  const isError = isAssistant && textContent.startsWith("❌ Error:");

  // Detect email or calendar in assistant messages
  const detectedEmail = isAssistant && !isStreaming ? parseEmail(textContent) : null;
  const detectedEvent = isAssistant && !isStreaming && !detectedEmail ? parseCalendarEvent(textContent) : null;

  // Detect markdown tables for spreadsheet widget
  const tableMarkdown = isAssistant && !isStreaming ? extractMarkdownTable(textContent) : null;
  const parsedTable = tableMarkdown ? parseMarkdownTable(tableMarkdown) : null;
  const [showSpreadsheet, setShowSpreadsheet] = useState(false);

  // Detect if message is long enough to offer docx export
  const isDocumentLength = isAssistant && textContent.length > 300;

  const copy = useCallback(async () => {
    await navigator.clipboard.writeText(textContent);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  }, [textContent]);

  const handleThumb = (rating: "up" | "down") => {
    setThumbsRating(conversationId, message.id, message.thumbs === rating ? null : rating);
  };

  const handleDelete = () => deleteMessage(conversationId, message.id);

  const startEdit = () => {
    setEditText(textContent);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditText("");
  };

  const submitEdit = () => {
    const trimmed = editText.trim();
    if (!trimmed) return;
    onEditAndRerun?.(message.id, trimmed);
    setIsEditing(false);
    setEditText("");
  };

  const handleStar = () => {
    if (starred) {
      unstarMessage(conversationId, message.id);
      toast.success("Removed from starred");
    } else {
      starMessage(conversationId, message.id);
      toast.success("Message starred");
    }
  };

  const handleQuote = () => {
    const quoted = textContent
      .split("\n")
      .map((line) => `> ${line}`)
      .join("\n");
    onQuote?.(quoted + "\n\n");
  };

  const handleFork = () => {
    const newId = forkConversation(conversationId, message.id);
    setActiveConversation(newId);
    toast.success("Forked conversation from this message");
  };

  const handleReaction = (emoji: EmojiReaction) => {
    toggleReaction(conversationId, message.id, emoji);
  };

  const paddingClass =
    viewDensity === "compact"
      ? "px-3 py-1.5"
      : viewDensity === "spacious"
      ? "px-6 py-5"
      : "px-4 py-3";

  if (message.role === "system") {
    return (
      <div className="flex justify-center py-2">
        <div className="text-xs text-muted-foreground bg-muted/50 rounded-full px-3 py-1 italic max-w-md text-center">
          System: {textContent.slice(0, 100)}
          {textContent.length > 100 ? "…" : ""}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group flex gap-3 hover:bg-muted/20 transition-colors",
        paddingClass,
        isUser && "flex-row-reverse",
        searchQuery &&
          textContent.toLowerCase().includes(searchQuery.toLowerCase()) &&
          "ring-1 ring-yellow-400/50 bg-yellow-50/20 dark:bg-yellow-900/10"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5",
          isUser
            ? "bg-primary text-primary-foreground"
            : isError
            ? "bg-red-500 text-white"
            : "bg-gradient-to-br from-purple-500 to-pink-500 text-white"
        )}
      >
        {isUser ? "U" : "AI"}
      </div>

      {/* Content */}
      <div className={cn("flex-1 min-w-0", isUser && "flex flex-col items-end")}>
        {/* Images */}
        {imageContent.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-2">
            {imageContent.map((img, i) => (
              <img
                key={i}
                src={img.image_url?.url}
                alt="attachment"
                className="max-h-40 max-w-xs rounded-lg border object-cover"
              />
            ))}
          </div>
        )}

        {/* Inline edit mode for user messages */}
        {isUser && isEditing ? (
          <div className="w-full max-w-lg">
            <Textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === "Enter") submitEdit();
                if (e.key === "Escape") cancelEdit();
              }}
              className="text-sm min-h-[80px] mb-2"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <Button size="sm" variant="ghost" onClick={cancelEdit} className="h-7 text-xs">
                <X className="w-3 h-3 mr-1" />
                Cancel
              </Button>
              <Button size="sm" onClick={submitEdit} className="h-7 text-xs">
                <RefreshCw className="w-3 h-3 mr-1" />
                Send & re-run
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Timestamp (always shown in relative form, full on hover) */}
            <div className={cn("flex items-center gap-1 mb-1", isUser && "justify-end")}>
              <span
                className="text-[10px] text-muted-foreground/60"
                title={format(message.timestamp, "PPpp")}
              >
                {formatDistanceToNow(message.timestamp, { addSuffix: true })}
              </span>
              {starred && (
                <Star className="w-2.5 h-2.5 text-amber-400 fill-current" />
              )}
            </div>

            {/* Text */}
            {isUser ? (
              <div
                className={cn(
                  "bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-lg text-sm whitespace-pre-wrap",
                  viewDensity === "compact" && "text-xs py-1.5 px-3"
                )}
              >
                {searchQuery ? highlight(textContent, searchQuery) : textContent}
              </div>
            ) : (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                {isStreaming && !textContent ? (
                  <div className="flex items-center gap-1.5 py-1">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0ms]" />
                      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:150ms]" />
                      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:300ms]" />
                    </div>
                    <span className="text-xs text-muted-foreground">Generating…</span>
                  </div>
                ) : (
                  <>
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code({ className, children, ...props }) {
                          const match = /language-(\w+)/.exec(className || "");
                          const isBlock = !props.style && match;
                          if (isBlock && match) {
                            const lang = match[1].toLowerCase();
                            const codeStr = String(children).replace(/\n$/, "");
                            // Render Mermaid diagrams inline
                            if (lang === "mermaid") {
                              return <MermaidBlock code={codeStr} />;
                            }
                            return (
                              <CodeBlock
                                code={codeStr}
                                language={lang}
                                onArtifactOpen={onArtifactOpen}
                              />
                            );
                          }
                          return (
                            <code
                              className="bg-muted text-foreground px-1 py-0.5 rounded text-xs font-mono"
                              {...props}
                            >
                              {children}
                            </code>
                          );
                        },
                        table({ children }) {
                          return (
                            <div className="overflow-x-auto my-2">
                              <table className="w-full border-collapse text-sm border">
                                {children}
                              </table>
                            </div>
                          );
                        },
                        th({ children }) {
                          return (
                            <th className="border px-3 py-2 bg-muted text-left font-medium text-xs">
                              {children}
                            </th>
                          );
                        },
                        td({ children }) {
                          return <td className="border px-3 py-2 text-xs">{children}</td>;
                        },
                        a({ href, children }) {
                          return (
                            <a
                              href={href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:underline"
                            >
                              {children}
                            </a>
                          );
                        },
                        blockquote({ children }) {
                          return (
                            <blockquote className="border-l-4 border-primary/40 pl-4 my-2 text-muted-foreground italic">
                              {children}
                            </blockquote>
                          );
                        },
                      }}
                    >
                      {textContent}
                    </ReactMarkdown>

                    {/* Email card */}
                    {detectedEmail && <EmailCard email={detectedEmail} />}

                    {/* Calendar card */}
                    {detectedEvent && <CalendarCard event={detectedEvent} />}

                    {/* Tool call results */}
                    {toolCalls && toolCalls.length > 0 && (
                      <ToolCallsSummary toolCalls={toolCalls} />
                    )}

                    {/* Spreadsheet / table view */}
                    {parsedTable && (
                      <div className="mt-2">
                        {!showSpreadsheet ? (
                          <button
                            className="flex items-center gap-1.5 text-[11px] text-green-700 dark:text-green-400 hover:underline"
                            onClick={() => setShowSpreadsheet(true)}
                          >
                            <Sheet className="w-3.5 h-3.5" />
                            Open as editable spreadsheet
                          </button>
                        ) : (
                          <SpreadsheetWidget
                            initialHeaders={parsedTable.headers}
                            initialRows={parsedTable.rows}
                          />
                        )}
                      </div>
                    )}

                    {/* Document export buttons */}
                    {isDocumentLength && !isStreaming && (
                      <div className="flex gap-2 mt-3 pt-3 border-t border-dashed border-border/50">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-[11px] gap-1.5"
                          onClick={() => {
                            const title = textContent.split("\n")[0].replace(/^#+\s*/, "").slice(0, 60) || "Document";
                            buildAndDownloadDocx(textContent, title);
                            toast.success("Word document downloaded");
                          }}
                        >
                          <FileText className="w-3 h-3" />
                          Export as Word (.docx)
                        </Button>
                        {parsedTable && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-[11px] gap-1.5 text-green-700 border-green-300"
                            onClick={async () => {
                              const XLSX = await import("xlsx");
                              const ws = XLSX.utils.aoa_to_sheet([parsedTable.headers, ...parsedTable.rows]);
                              const wb = XLSX.utils.book_new();
                              XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
                              XLSX.writeFile(wb, "data.xlsx");
                              toast.success("Excel file downloaded");
                            }}
                          >
                            <Sheet className="w-3 h-3" />
                            Export as Excel (.xlsx)
                          </Button>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Emoji reactions */}
            {(message.reactions?.length ?? 0) > 0 && (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {REACTIONS.filter((e) => message.reactions?.includes(e)).map((emoji) => (
                  <button
                    key={emoji}
                    className="text-sm bg-muted rounded-full px-2 py-0.5 hover:bg-muted/80 border"
                    onClick={() => handleReaction(emoji)}
                    title="Remove reaction"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {/* Actions bar */}
        {(isAssistant || isUser) && !isEditing && (
          <div
            className={cn(
              "flex items-center gap-0.5 mt-1.5 flex-wrap",
              isUser && "justify-end",
              // Always show star; others on hover
            )}
          >
            {/* Reaction picker (on hover) */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-0.5 mr-1">
              {REACTIONS.map((emoji) => (
                <button
                  key={emoji}
                  className={cn(
                    "w-6 h-6 flex items-center justify-center rounded text-xs hover:bg-muted",
                    message.reactions?.includes(emoji) && "bg-muted"
                  )}
                  onClick={() => handleReaction(emoji)}
                  title={`React with ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>

            {/* Divider on hover */}
            <div className="opacity-0 group-hover:opacity-100 w-px h-4 bg-border mx-0.5 transition-opacity" />

            {/* Copy */}
            <button
              className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground"
              onClick={copy}
              title="Copy"
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            </button>

            {/* Star (always visible when starred) */}
            <button
              className={cn(
                "w-6 h-6 flex items-center justify-center rounded hover:bg-muted transition-opacity",
                starred
                  ? "text-amber-400 opacity-100"
                  : "text-muted-foreground opacity-0 group-hover:opacity-100"
              )}
              onClick={handleStar}
              title={starred ? "Remove star" : "Star message"}
            >
              <Star className={cn("w-3 h-3", starred && "fill-current")} />
            </button>

            {/* Quote (only if onQuote provided) */}
            {onQuote && (
              <button
                className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                onClick={handleQuote}
                title="Quote in reply"
              >
                <Quote className="w-3 h-3" />
              </button>
            )}

            {/* Fork */}
            <button
              className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground"
              onClick={handleFork}
              title="Fork conversation from here"
            >
              <GitFork className="w-3 h-3" />
            </button>

            {/* Edit button for user messages */}
            {isUser && onEditAndRerun && (
              <button
                className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                onClick={startEdit}
                title="Edit & re-run"
              >
                <Pencil className="w-3 h-3" />
              </button>
            )}

            {isAssistant && (
              <>
                {/* Retry button for error messages */}
                {isError && onRetry && (
                  <button
                    className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 flex items-center justify-center rounded hover:bg-muted text-orange-500 hover:text-orange-600"
                    onClick={onRetry}
                    title="Retry request"
                  >
                    <RefreshCw className="w-3 h-3" />
                  </button>
                )}

                {onSpeak && !isSpeaking && (
                  <button
                    className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                    onClick={() => onSpeak(textContent)}
                    title="Read aloud"
                  >
                    <Volume2 className="w-3 h-3" />
                  </button>
                )}
                {isSpeaking && onStopSpeak && (
                  <button
                    className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                    onClick={onStopSpeak}
                    title="Stop reading"
                  >
                    <VolumeX className="w-3 h-3" />
                  </button>
                )}
                <button
                  className={cn(
                    "opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 flex items-center justify-center rounded hover:bg-muted",
                    message.thumbs === "up"
                      ? "text-green-500 !opacity-100"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  onClick={() => handleThumb("up")}
                  title="Thumbs up"
                >
                  <ThumbsUp className="w-3 h-3" />
                </button>
                <button
                  className={cn(
                    "opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 flex items-center justify-center rounded hover:bg-muted",
                    message.thumbs === "down"
                      ? "text-red-500 !opacity-100"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  onClick={() => handleThumb("down")}
                  title="Thumbs down"
                >
                  <ThumbsDown className="w-3 h-3" />
                </button>
                {isLast && onRegenerate && !isError && (
                  <button
                    className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                    onClick={onRegenerate}
                    title="Regenerate"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                )}
              </>
            )}

            {/* Export as Word */}
            {isAssistant && isDocumentLength && (
              <button
                className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-blue-500"
                onClick={() => {
                  const title = textContent.split("\n")[0].replace(/^#+\s*/, "").slice(0, 60) || "Document";
                  buildAndDownloadDocx(textContent, title);
                  toast.success("Word document downloaded");
                }}
                title="Export as Word (.docx)"
              >
                <FileText className="w-3 h-3" />
              </button>
            )}

            <button
              className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-red-500"
              onClick={handleDelete}
              title="Delete message"
            >
              <Trash2 className="w-3 h-3" />
            </button>

            {/* Timestamp badge */}
            <Badge
              variant="outline"
              className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] px-1.5 py-0 h-4 ml-1"
              title={format(message.timestamp, "PPpp")}
            >
              {format(message.timestamp, "HH:mm")}
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
}
