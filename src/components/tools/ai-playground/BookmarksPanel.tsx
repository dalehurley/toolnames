import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useAIPlaygroundStore } from "@/store/aiPlayground";
import { Bookmark, X, MessageSquare, ArrowRight, Star } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface BookmarksPanelProps {
  onNavigate: (conversationId: string, messageId: string) => void;
  onClose: () => void;
}

export function BookmarksPanel({ onNavigate, onClose }: BookmarksPanelProps) {
  const { conversations, starred, unstarMessage } = useAIPlaygroundStore();

  // Flatten all starred messages
  const starredItems = Object.entries(starred).flatMap(([convId, msgIds]) => {
    const conv = conversations.find((c) => c.id === convId);
    if (!conv) return [];
    return msgIds
      .map((msgId) => {
        const msg = conv.messages.find((m) => m.id === msgId);
        if (!msg) return null;
        const text =
          typeof msg.content === "string"
            ? msg.content
            : msg.content
                .filter((p) => p.type === "text")
                .map((p) => p.text || "")
                .join(" ");
        return {
          convId,
          convTitle: conv.title,
          msgId,
          role: msg.role,
          text,
          timestamp: msg.timestamp,
        };
      })
      .filter(Boolean) as {
      convId: string;
      convTitle: string;
      msgId: string;
      role: string;
      text: string;
      timestamp: number;
    }[];
  });

  // Sort newest first
  starredItems.sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="flex flex-col h-full border-l bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/20">
        <div className="flex items-center gap-2">
          <Bookmark className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-medium">Starred Messages</span>
          <Badge variant="outline" className="text-[10px] px-1.5 h-4">
            {starredItems.length}
          </Badge>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
          <X className="w-3.5 h-3.5" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        {starredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center gap-2">
            <Star className="w-8 h-8 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No starred messages yet</p>
            <p className="text-xs text-muted-foreground/70">
              Star important messages by clicking the ★ icon on any message.
            </p>
          </div>
        ) : (
          <div className="p-2 space-y-2">
            {starredItems.map((item) => (
              <div
                key={`${item.convId}-${item.msgId}`}
                className="group rounded-lg border p-3 hover:border-amber-400/50 hover:bg-amber-50/30 dark:hover:bg-amber-950/20 transition-colors"
              >
                {/* Conversation title */}
                <div className="flex items-center gap-1.5 mb-1.5">
                  <MessageSquare className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                  <span className="text-[10px] text-muted-foreground truncate flex-1">
                    {item.convTitle}
                  </span>
                  <span className="text-[10px] text-muted-foreground flex-shrink-0">
                    {formatDistanceToNow(item.timestamp, { addSuffix: true })}
                  </span>
                </div>

                {/* Role badge + text */}
                <div className="flex gap-2 items-start">
                  <Badge
                    variant={item.role === "user" ? "default" : "secondary"}
                    className="text-[9px] px-1.5 h-4 flex-shrink-0 mt-0.5"
                  >
                    {item.role === "user" ? "You" : "AI"}
                  </Badge>
                  <p className="text-xs text-foreground line-clamp-3 flex-1 leading-relaxed">
                    {item.text}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 text-[10px] px-2 gap-1 flex-1"
                    onClick={() => onNavigate(item.convId, item.msgId)}
                  >
                    <ArrowRight className="w-3 h-3" />
                    Go to message
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className={cn("h-6 text-[10px] px-2 text-amber-500 hover:text-amber-600")}
                    onClick={() => unstarMessage(item.convId, item.msgId)}
                    title="Remove star"
                  >
                    <Star className="w-3 h-3 fill-current" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
