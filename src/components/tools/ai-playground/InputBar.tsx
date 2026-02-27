import { useState, useRef, useCallback, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { readFile, AttachedFile } from "@/utils/aiFileReader";
import { useVoice } from "@/hooks/useVoice";
import {
  Paperclip,
  Mic,
  MicOff,
  Send,
  Square,
  X,
  Image as ImageIcon,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface InputBarProps {
  onSend: (text: string, attachments: AttachedFile[]) => void;
  onStop: () => void;
  isStreaming: boolean;
  disabled?: boolean;
  visionSupported?: boolean;
}

export function InputBar({ onSend, onStop, isStreaming, disabled, visionSupported }: InputBarProps) {
  const [text, setText] = useState("");
  const [attachments, setAttachments] = useState<AttachedFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { isListening, transcript, startListening, stopListening, supported: voiceSupported } = useVoice();

  // Update text with transcript when listening ends
  const prevTranscript = useRef("");
  if (isListening && transcript !== prevTranscript.current) {
    prevTranscript.current = transcript;
    setText(transcript);
  }

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed && attachments.length === 0) return;
    onSend(trimmed, attachments);
    setText("");
    setAttachments([]);
    prevTranscript.current = "";
    textareaRef.current?.focus();
  }, [text, attachments, onSend]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFiles = async (files: File[]) => {
    const toProcess = files.slice(0, 5 - attachments.length); // max 5 attachments
    const processed = await Promise.all(toProcess.map(readFile));

    // Check vision constraint
    const imageFiles = processed.filter((f) => f.type === "image");
    if (imageFiles.length > 0 && !visionSupported) {
      toast.warning("Current model doesn't support images. Only text content will be attached.");
    }

    setAttachments((prev) => [...prev, ...processed]);
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    await handleFiles(Array.from(e.target.files));
    e.target.value = "";
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files);
    await handleFiles(files);
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const toggleVoice = () => {
    if (isListening) {
      stopListening();
    } else {
      setText("");
      startListening();
    }
  };

  return (
    <div
      className={cn(
        "border-t bg-background p-3",
        dragging && "ring-2 ring-primary ring-inset"
      )}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      {/* Attachments preview */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {attachments.map((att) => (
            <div
              key={att.id}
              className="flex items-center gap-1.5 bg-muted rounded-lg px-2 py-1 text-xs max-w-[150px]"
            >
              {att.type === "image" ? (
                <ImageIcon className="w-3 h-3 flex-shrink-0 text-blue-500" />
              ) : (
                <FileText className="w-3 h-3 flex-shrink-0 text-muted-foreground" />
              )}
              <span className="truncate flex-1">{att.name}</span>
              <button
                className="hover:text-destructive flex-shrink-0"
                onClick={() => removeAttachment(att.id)}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Voice listening indicator */}
      {isListening && (
        <div className="flex items-center gap-2 mb-2 text-xs text-red-500">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          Listening... speak now
        </div>
      )}

      {/* Input row */}
      <div className="flex items-end gap-2">
        {/* File attach */}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 flex-shrink-0 text-muted-foreground hover:text-foreground"
          onClick={() => fileInputRef.current?.click()}
          disabled={isStreaming || disabled}
          title="Attach file"
        >
          <Paperclip className="w-4 h-4" />
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.txt,.md,.csv,.js,.ts,.tsx,.jsx,.py,.html,.css,.json,.yaml,.yml,.xml,.sql,.sh"
          className="hidden"
          onChange={handleFileInput}
        />

        {/* Voice */}
        {voiceSupported && (
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-9 w-9 flex-shrink-0",
              isListening
                ? "text-red-500 hover:text-red-600 bg-red-50 dark:bg-red-950"
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={toggleVoice}
            disabled={isStreaming || disabled}
            title={isListening ? "Stop listening" : "Voice input"}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </Button>
        )}

        {/* Text input */}
        <Textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            dragging
              ? "Drop files here..."
              : isStreaming
              ? "Streaming response..."
              : "Message... (Ctrl+Enter to send)"
          }
          disabled={isStreaming || disabled}
          className="flex-1 min-h-[40px] max-h-[200px] resize-none text-sm py-2.5"
          rows={1}
        />

        {/* Send / Stop */}
        {isStreaming ? (
          <Button
            variant="destructive"
            size="icon"
            className="h-9 w-9 flex-shrink-0"
            onClick={onStop}
            title="Stop generation (Esc)"
          >
            <Square className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            size="icon"
            className="h-9 w-9 flex-shrink-0"
            onClick={handleSend}
            disabled={(!text.trim() && attachments.length === 0) || disabled}
            title="Send (Ctrl+Enter)"
          >
            <Send className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Token count hint */}
      <div className="flex justify-between items-center mt-1.5">
        <p className="text-[10px] text-muted-foreground">
          Ctrl+Enter to send · Esc to stop
        </p>
        {text.length > 0 && (
          <Badge variant="outline" className="text-[10px] h-4 px-1">
            ~{Math.ceil(text.split(/\s+/).length * 1.3)} tokens
          </Badge>
        )}
      </div>
    </div>
  );
}
