import React, { useEffect, useState, useRef } from "react";
import MDEditor from "@uiw/react-md-editor";
import { useNotes } from "@/contexts/NotesContext";
import { extractTags } from "@/utils/markdownUtils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MarkdownPreview } from "./MarkdownPreview";
import { MarkdownToolbar } from "./MarkdownToolbar";
import {
  FileIcon,
  TrashIcon,
  PinIcon,
  TagIcon,
  EyeIcon,
  EditIcon,
} from "lucide-react";

export const NoteEditor: React.FC = () => {
  const {
    state: { notes, currentNoteId },
    updateNote,
    deleteNote,
    togglePinned,
  } = useNotes();

  // Get the current note
  const currentNote = notes.find((note) => note.id === currentNoteId);

  // Local state for note content
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");

  // Reference to the editor
  const editorRef = useRef<HTMLTextAreaElement | null>(null);

  // Update local state when current note changes
  useEffect(() => {
    if (currentNote) {
      setTitle(currentNote.title);
      setContent(currentNote.content);
    } else {
      setTitle("");
      setContent("");
    }
  }, [currentNote]);

  // Auto-save changes after a delay
  useEffect(() => {
    if (!currentNote) return;

    const timerId = setTimeout(() => {
      const updatedTags = extractTags(content);
      updateNote(currentNote.id, {
        title,
        content,
        tags: updatedTags,
      });
    }, 1000);

    return () => clearTimeout(timerId);
  }, [title, content, currentNote, updateNote]);

  // Handle toolbar actions
  const handleMarkdownAction = (template: string) => {
    // Find the textarea element inside MDEditor
    const textareaElement = document.querySelector(
      ".w-md-editor-text-input"
    ) as HTMLTextAreaElement;

    if (!textareaElement) return;

    // Save current selection
    const start = textareaElement.selectionStart;
    const end = textareaElement.selectionEnd;
    const selectedText = textareaElement.value.substring(start, end);

    // Replace $selection placeholder with actual selection
    const formattedTemplate = template.replace(
      "$selection",
      selectedText || ""
    );

    // Insert the template at cursor position
    const newContent =
      textareaElement.value.substring(0, start) +
      formattedTemplate +
      textareaElement.value.substring(end);

    // Update content state
    setContent(newContent);

    // Set focus back to the editor after state update
    setTimeout(() => {
      textareaElement.focus();
      const newCursorPos =
        start + formattedTemplate.indexOf(selectedText) + selectedText.length;
      textareaElement.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  // Handle note deletion
  const handleDelete = () => {
    if (
      currentNote &&
      window.confirm("Are you sure you want to delete this note?")
    ) {
      deleteNote(currentNote.id);
    }
  };

  if (!currentNote) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 bg-muted/20">
        <FileIcon className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-xl font-medium mb-2">No Note Selected</h3>
        <p className="text-muted-foreground text-center">
          Select a note from the sidebar or create a new one to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Note Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex-1 mr-4">
          <Input
            className="text-lg font-medium"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title"
          />
        </div>

        <div className="flex items-center space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => togglePinned(currentNote.id)}
                >
                  <PinIcon
                    className={`h-4 w-4 ${
                      currentNote.isPinned ? "text-amber-500" : ""
                    }`}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {currentNote.isPinned ? "Unpin note" : "Pin note"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={handleDelete}>
                  <TrashIcon className="h-4 w-4 text-destructive" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete note</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Tags Display */}
      {currentNote.tags.length > 0 && (
        <div className="px-4 py-2 border-b flex items-center text-sm text-muted-foreground">
          <TagIcon className="h-3 w-3 mr-2" />
          <span>
            {currentNote.tags.map((tag, i) => (
              <React.Fragment key={tag}>
                {i > 0 && ", "}#{tag}
              </React.Fragment>
            ))}
          </span>
        </div>
      )}

      {/* Editor / Preview Tabs */}
      <Tabs defaultValue="editor" className="flex-1 flex flex-col">
        <div className="border-b px-4">
          <TabsList className="h-10">
            <TabsTrigger value="editor" className="flex items-center">
              <EditIcon className="h-4 w-4 mr-2" />
              Edit
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center">
              <EyeIcon className="h-4 w-4 mr-2" />
              Preview
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent
          value="editor"
          className="flex-1 p-0 data-[state=active]:flex flex-col"
        >
          {/* Markdown Toolbar */}
          <div className="p-2 border-b">
            <MarkdownToolbar onAction={handleMarkdownAction} />
          </div>

          <div className="flex-1">
            <MDEditor
              ref={editorRef}
              value={content}
              onChange={(val) => setContent(val || "")}
              preview="edit"
              height="100%"
              visibleDragbar={false}
              hideToolbar={true}
            />
          </div>
        </TabsContent>

        <TabsContent
          value="preview"
          className="flex-1 p-0 data-[state=active]:flex"
        >
          <MarkdownPreview content={content} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
