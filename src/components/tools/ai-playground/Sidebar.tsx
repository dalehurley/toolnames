import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAIPlaygroundStore } from "@/store/aiPlayground";
import { cn } from "@/lib/utils";
import {
  MessageSquarePlus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
} from "lucide-react";
import { format } from "date-fns";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { conversations, activeConversationId, createConversation, deleteConversation, setActiveConversation } =
    useAIPlaygroundStore();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const handleNew = () => {
    createConversation();
  };

  // Group conversations by date
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  const grouped = conversations.reduce<Record<string, typeof conversations>>((acc, conv) => {
    const d = new Date(conv.updatedAt).toDateString();
    const label = d === today ? "Today" : d === yesterday ? "Yesterday" : format(conv.updatedAt, "MMM d, yyyy");
    (acc[label] = acc[label] || []).push(conv);
    return acc;
  }, {});

  return (
    <div
      className={cn(
        "flex flex-col border-r bg-muted/30 transition-all duration-200 flex-shrink-0",
        collapsed ? "w-10" : "w-56"
      )}
    >
      {/* Toggle + New */}
      <div className="flex items-center justify-between p-2 border-b">
        {!collapsed && (
          <Button onClick={handleNew} size="sm" variant="ghost" className="flex-1 justify-start gap-1 h-7 text-xs">
            <MessageSquarePlus className="w-3 h-3" />
            New Chat
          </Button>
        )}
        <Button variant="ghost" size="icon" onClick={onToggle} className="h-7 w-7 flex-shrink-0">
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </Button>
      </div>

      {!collapsed && (
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-3">
            {Object.entries(grouped).map(([label, convs]) => (
              <div key={label}>
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1 px-1">
                  {label}
                </p>
                <div className="space-y-0.5">
                  {convs.map((conv) => (
                    <div
                      key={conv.id}
                      className={cn(
                        "group relative flex items-center gap-1 rounded-md px-2 py-1.5 cursor-pointer text-xs transition-colors",
                        conv.id === activeConversationId
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-muted"
                      )}
                      onClick={() => setActiveConversation(conv.id)}
                      onMouseEnter={() => setHoveredId(conv.id)}
                      onMouseLeave={() => setHoveredId(null)}
                    >
                      <MessageSquare className="w-3 h-3 flex-shrink-0 text-muted-foreground" />
                      <span className="flex-1 truncate">{conv.title || "Untitled"}</span>
                      {hoveredId === conv.id && (
                        <button
                          className="absolute right-1 text-muted-foreground hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteConversation(conv.id);
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {conversations.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">
                No conversations yet
              </p>
            )}
          </div>
        </ScrollArea>
      )}

      {collapsed && (
        <div className="flex-1 flex flex-col items-center py-2 gap-1">
          <button
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-muted"
            onClick={handleNew}
            title="New conversation"
          >
            <MessageSquarePlus className="w-3 h-3" />
          </button>
          {conversations.slice(0, 8).map((conv) => (
            <button
              key={conv.id}
              className={cn(
                "w-7 h-7 flex items-center justify-center rounded",
                conv.id === activeConversationId ? "bg-primary/10 text-primary" : "hover:bg-muted"
              )}
              onClick={() => setActiveConversation(conv.id)}
              title={conv.title}
            >
              <MessageSquare className="w-3 h-3" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
