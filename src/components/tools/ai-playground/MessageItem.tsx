import { useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAIPlaygroundStore, ChatMessage } from "@/store/aiPlayground";
import { detectArtifact } from "@/hooks/useArtifact";
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
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

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

  return (
    <div className="relative group my-2 rounded-lg overflow-hidden border bg-zinc-950 dark:bg-zinc-900">
      <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-800 dark:bg-zinc-800 border-b border-zinc-700">
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
      <pre className="p-3 overflow-x-auto text-sm text-zinc-100 leading-relaxed">
        <code>{code}</code>
      </pre>
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
}: MessageItemProps) {
  const [copied, setCopied] = useState(false);
  const [showTimestamp, setShowTimestamp] = useState(false);
  const { setThumbsRating, deleteMessage } = useAIPlaygroundStore();

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

  const copy = useCallback(async () => {
    await navigator.clipboard.writeText(textContent);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  }, [textContent]);

  const handleThumb = (rating: "up" | "down") => {
    setThumbsRating(
      conversationId,
      message.id,
      message.thumbs === rating ? null : rating
    );
  };

  const handleDelete = () => {
    deleteMessage(conversationId, message.id);
  };

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
        "group flex gap-3 px-4 py-3 hover:bg-muted/20 transition-colors",
        isUser && "flex-row-reverse"
      )}
      onMouseEnter={() => setShowTimestamp(true)}
      onMouseLeave={() => setShowTimestamp(false)}
    >
      {/* Avatar */}
      <div
        className={cn(
          "w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5",
          isUser
            ? "bg-primary text-primary-foreground"
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

        {/* Text */}
        {isUser ? (
          <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-lg text-sm whitespace-pre-wrap">
            {textContent}
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
              </div>
            ) : (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || "");
                    const isBlock = !props.style && match;
                    if (isBlock && match) {
                      return (
                        <CodeBlock
                          code={String(children).replace(/\n$/, "")}
                          language={match[1]}
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
                        <table className="w-full border-collapse text-sm border">{children}</table>
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
            )}
          </div>
        )}

        {/* Actions bar */}
        {(isAssistant || isUser) && (
          <div
            className={cn(
              "flex items-center gap-1 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity",
              isUser && "justify-end"
            )}
          >
            {showTimestamp && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                {format(message.timestamp, "HH:mm")}
              </Badge>
            )}

            <button
              className="w-6 h-6 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground"
              onClick={copy}
              title="Copy"
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            </button>

            {isAssistant && (
              <>
                {onSpeak && !isSpeaking && (
                  <button
                    className="w-6 h-6 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                    onClick={() => onSpeak(textContent)}
                    title="Read aloud"
                  >
                    <Volume2 className="w-3 h-3" />
                  </button>
                )}
                {isSpeaking && onStopSpeak && (
                  <button
                    className="w-6 h-6 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                    onClick={onStopSpeak}
                    title="Stop reading"
                  >
                    <VolumeX className="w-3 h-3" />
                  </button>
                )}
                <button
                  className={cn(
                    "w-6 h-6 flex items-center justify-center rounded hover:bg-muted",
                    message.thumbs === "up" ? "text-green-500" : "text-muted-foreground hover:text-foreground"
                  )}
                  onClick={() => handleThumb("up")}
                  title="Thumbs up"
                >
                  <ThumbsUp className="w-3 h-3" />
                </button>
                <button
                  className={cn(
                    "w-6 h-6 flex items-center justify-center rounded hover:bg-muted",
                    message.thumbs === "down" ? "text-red-500" : "text-muted-foreground hover:text-foreground"
                  )}
                  onClick={() => handleThumb("down")}
                  title="Thumbs down"
                >
                  <ThumbsDown className="w-3 h-3" />
                </button>
                {isLast && onRegenerate && (
                  <button
                    className="w-6 h-6 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                    onClick={onRegenerate}
                    title="Regenerate"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                )}
              </>
            )}

            <button
              className="w-6 h-6 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-red-500"
              onClick={handleDelete}
              title="Delete message"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
