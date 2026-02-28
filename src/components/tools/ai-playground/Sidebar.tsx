import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useAIPlaygroundStore, Conversation } from "@/store/aiPlayground";
import { cn } from "@/lib/utils";
import {
  MessageSquarePlus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Download,
  FileCode2,
  Eraser,
  Search,
  Pencil,
  Check,
  X,
} from "lucide-react";
import { format } from "date-fns";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

function exportAsHTML(conv: Conversation): void {
  const rows = conv.messages
    .map((msg) => {
      const text =
        typeof msg.content === "string"
          ? msg.content
          : msg.content
              .filter((p) => p.type === "text")
              .map((p) => p.text || "")
              .join("");
      const escaped = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\n/g, "<br/>");
      const bg = msg.role === "user" ? "#e0f2fe" : "#f0fdf4";
      const label = msg.role === "user" ? "You" : "AI";
      return `<div style="margin:12px 0;padding:12px 16px;border-radius:12px;background:${bg};"><strong>${label}:</strong><br/>${escaped}</div>`;
    })
    .join("\n");

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>${conv.title || "Conversation"}</title>
<style>body{font-family:system-ui,sans-serif;max-width:800px;margin:40px auto;padding:0 20px;color:#1a1a1a;}</style>
</head><body>
<h1>${conv.title || "Conversation"}</h1>
${rows}
</body></html>`;

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${(conv.title || "conversation").replace(/[^a-z0-9]/gi, "-")}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportAsMarkdown(conv: Conversation): void {
  const lines: string[] = [`# ${conv.title || "Conversation"}`, ""];
  for (const msg of conv.messages) {
    const role =
      msg.role === "user" ? "**You**" : msg.role === "assistant" ? "**AI**" : `**${msg.role}**`;
    const text =
      typeof msg.content === "string"
        ? msg.content
        : msg.content
            .filter((p) => p.type === "text")
            .map((p) => p.text || "")
            .join("");
    lines.push(`${role}\n\n${text}`, "");
  }
  const blob = new Blob([lines.join("\n")], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${(conv.title || "conversation").replace(/[^a-z0-9]/gi, "-")}.md`;
  a.click();
  URL.revokeObjectURL(url);
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const {
    conversations,
    activeConversationId,
    createConversation,
    deleteConversation,
    setActiveConversation,
    clearConversationMessages,
    updateConversationTitle,
  } = useAIPlaygroundStore();

  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const editInputRef = useRef<HTMLInputElement>(null);

  const startRename = useCallback((conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditTitle(conv.title);
    setTimeout(() => editInputRef.current?.focus(), 50);
  }, []);

  const commitRename = useCallback(() => {
    if (editingId && editTitle.trim()) {
      updateConversationTitle(editingId, editTitle.trim());
    }
    setEditingId(null);
    setEditTitle("");
  }, [editingId, editTitle, updateConversationTitle]);

  const cancelRename = useCallback(() => {
    setEditingId(null);
    setEditTitle("");
  }, []);

  // Filter + group by date
  const filtered = search
    ? conversations.filter((c) => c.title.toLowerCase().includes(search.toLowerCase()))
    : conversations;

  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  const grouped = filtered.reduce<Record<string, typeof conversations>>((acc, conv) => {
    const d = new Date(conv.updatedAt).toDateString();
    const label =
      d === today ? "Today" : d === yesterday ? "Yesterday" : format(conv.updatedAt, "MMM d, yyyy");
    (acc[label] = acc[label] || []).push(conv);
    return acc;
  }, {});

  return (
    <div
      className={cn(
        "flex flex-col border-r bg-muted/30 transition-all duration-200 flex-shrink-0",
        collapsed ? "w-10" : "w-60"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-2 border-b gap-1">
        {!collapsed && (
          <Button
            onClick={createConversation}
            size="sm"
            variant="ghost"
            className="flex-1 justify-start gap-1 h-7 text-xs"
          >
            <MessageSquarePlus className="w-3 h-3" />
            New Chat
          </Button>
        )}
        <Button variant="ghost" size="icon" onClick={onToggle} className="h-7 w-7 flex-shrink-0">
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </Button>
      </div>

      {!collapsed && (
        <>
          {/* Search */}
          <div className="px-2 pt-2 pb-1">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
              <Input
                placeholder="Search chats…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-6 h-7 text-xs"
              />
              {search && (
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setSearch("")}
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

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
                        onClick={() => {
                          if (editingId !== conv.id) setActiveConversation(conv.id);
                        }}
                        onMouseEnter={() => setHoveredId(conv.id)}
                        onMouseLeave={() => setHoveredId(null)}
                      >
                        <MessageSquare className="w-3 h-3 flex-shrink-0 text-muted-foreground" />

                        {/* Inline rename input */}
                        {editingId === conv.id ? (
                          <input
                            ref={editInputRef}
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") commitRename();
                              if (e.key === "Escape") cancelRename();
                            }}
                            onBlur={commitRename}
                            onClick={(e) => e.stopPropagation()}
                            className="flex-1 bg-transparent border-b border-primary outline-none text-xs min-w-0"
                          />
                        ) : (
                          <span
                            className="flex-1 truncate"
                            onDoubleClick={(e) => startRename(conv, e)}
                            title="Double-click to rename"
                          >
                            {conv.title || "Untitled"}
                          </span>
                        )}

                        {/* Message count — shown when not hovered */}
                        {conv.messages.length > 0 &&
                          hoveredId !== conv.id &&
                          editingId !== conv.id && (
                            <Badge variant="outline" className="text-[9px] px-1 h-3.5 flex-shrink-0">
                              {conv.messages.length}
                            </Badge>
                          )}

                        {/* Action buttons on hover */}
                        {hoveredId === conv.id && editingId !== conv.id && (
                          <div
                            className="absolute right-1 flex items-center gap-0.5 bg-muted/80 rounded"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              className="w-5 h-5 flex items-center justify-center rounded text-muted-foreground hover:text-foreground"
                              onClick={(e) => startRename(conv, e)}
                              title="Rename"
                            >
                              <Pencil className="w-2.5 h-2.5" />
                            </button>
                            <button
                              className="w-5 h-5 flex items-center justify-center rounded text-muted-foreground hover:text-blue-500"
                              onClick={() => exportAsMarkdown(conv)}
                              title="Export as Markdown"
                            >
                              <Download className="w-2.5 h-2.5" />
                            </button>
                            <button
                              className="w-5 h-5 flex items-center justify-center rounded text-muted-foreground hover:text-violet-500"
                              onClick={() => exportAsHTML(conv)}
                              title="Export as HTML"
                            >
                              <FileCode2 className="w-2.5 h-2.5" />
                            </button>
                            <button
                              className="w-5 h-5 flex items-center justify-center rounded text-muted-foreground hover:text-yellow-600"
                              onClick={() => clearConversationMessages(conv.id)}
                              title="Clear messages"
                            >
                              <Eraser className="w-2.5 h-2.5" />
                            </button>
                            <button
                              className="w-5 h-5 flex items-center justify-center rounded text-muted-foreground hover:text-destructive"
                              onClick={() => deleteConversation(conv.id)}
                              title="Delete conversation"
                            >
                              <Trash2 className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        )}

                        {/* Rename confirm/cancel */}
                        {editingId === conv.id && (
                          <div
                            className="absolute right-1 flex items-center gap-0.5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              className="w-5 h-5 flex items-center justify-center rounded text-green-500 hover:bg-muted/80"
                              onClick={commitRename}
                              title="Save"
                            >
                              <Check className="w-2.5 h-2.5" />
                            </button>
                            <button
                              className="w-5 h-5 flex items-center justify-center rounded text-muted-foreground hover:bg-muted/80"
                              onClick={cancelRename}
                              title="Cancel"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {filtered.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">
                  {search ? "No matching chats" : "No conversations yet"}
                </p>
              )}
            </div>
          </ScrollArea>
        </>
      )}

      {collapsed && (
        <div className="flex-1 flex flex-col items-center py-2 gap-1">
          <button
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-muted"
            onClick={createConversation}
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
