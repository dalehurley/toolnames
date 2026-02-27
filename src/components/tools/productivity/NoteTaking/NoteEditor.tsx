import React, { useEffect, useState, useRef, useMemo } from "react";
import MDEditor from "@uiw/react-md-editor";
import { useNotes } from "@/contexts/NotesContext";
import { extractTags, extractTitle, countWords, estimateReadingTime } from "@/utils/markdownUtils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { MarkdownPreview } from "./MarkdownPreview";
import { MarkdownToolbar } from "./MarkdownToolbar";
import {
  FileIcon,
  TrashIcon,
  PinIcon,
  TagIcon,
  EyeIcon,
  EditIcon,
  CopyIcon,
  DownloadIcon,
  MaximizeIcon,
  MinimizeIcon,
  Columns2Icon,
} from "lucide-react";

export const NoteEditor: React.FC = () => {
  const {
    state: { notes, currentNoteId },
    updateNote,
    deleteNote,
    togglePinned,
    duplicateNote,
  } = useNotes();

  // Get the current note
  const currentNote = notes.find((note) => note.id === currentNoteId);

  // Local state for note content
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [isFullscreen, setIsFullscreen] = useState(false);

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
  }, [currentNote?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-save changes after a delay; auto-title from first H1 when title is "Untitled Note"
  useEffect(() => {
    if (!currentNote) return;

    const timerId = setTimeout(() => {
      const updatedTags = extractTags(content);
      const updates: Parameters<typeof updateNote>[1] = {
        content,
        tags: updatedTags,
      };

      // Auto-title: if title is still the default, pull from first heading
      if (title === "Untitled Note" || title === "") {
        const headingTitle = extractTitle(content);
        if (headingTitle) {
          updates.title = headingTitle;
          setTitle(headingTitle);
        } else {
          updates.title = title;
        }
      } else {
        updates.title = title;
      }

      updateNote(currentNote.id, updates);
    }, 1000);

    return () => clearTimeout(timerId);
  }, [title, content, currentNote?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Word / char stats (memoised so they don't recalc on every render)
  const wordCount = useMemo(() => countWords(content), [content]);
  const charCount = content.length;
  const readingTime = useMemo(() => estimateReadingTime(wordCount), [wordCount]);

  // Handle toolbar actions
  const handleMarkdownAction = (template: string) => {
    const textareaElement = document.querySelector(
      ".w-md-editor-text-input"
    ) as HTMLTextAreaElement;

    if (!textareaElement) return;

    const start = textareaElement.selectionStart;
    const end = textareaElement.selectionEnd;
    const selectedText = textareaElement.value.substring(start, end);

    const formattedTemplate = template.replace("$selection", selectedText || "");

    const newContent =
      textareaElement.value.substring(0, start) +
      formattedTemplate +
      textareaElement.value.substring(end);

    setContent(newContent);

    setTimeout(() => {
      textareaElement.focus();
      const newCursorPos =
        start + formattedTemplate.indexOf(selectedText) + selectedText.length;
      textareaElement.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  // Export the current note as a .md file
  const handleExportMarkdown = () => {
    if (!currentNote) return;
    const blob = new Blob([`# ${title}\n\n${content}`], {
      type: "text/markdown;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const safeTitle = title.replace(/[^a-z0-9]/gi, "-").toLowerCase() || "note";
    link.href = url;
    link.download = `${safeTitle}.md`;
    link.click();
    URL.revokeObjectURL(url);
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

  const editorContent = (
    <div className={`flex flex-col h-full ${isFullscreen ? "fixed inset-0 z-50 bg-background" : ""}`}>
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

        <div className="flex items-center space-x-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => togglePinned(currentNote.id)}
                >
                  <PinIcon
                    className={`h-4 w-4 ${currentNote.isPinned ? "text-amber-500" : ""}`}
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
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => duplicateNote(currentNote.id)}
                >
                  <CopyIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Duplicate note</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={handleExportMarkdown}>
                  <DownloadIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Export as .md</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsFullscreen((f) => !f)}
                >
                  {isFullscreen ? (
                    <MinimizeIcon className="h-4 w-4" />
                  ) : (
                    <MaximizeIcon className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isFullscreen ? "Exit fullscreen" : "Fullscreen mode"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <AlertDialog>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <TrashIcon className="h-4 w-4 text-destructive" />
                    </Button>
                  </AlertDialogTrigger>
                </TooltipTrigger>
                <TooltipContent>Delete note</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete note?</AlertDialogTitle>
                <AlertDialogDescription>
                  "{title}" will be permanently deleted. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => deleteNote(currentNote.id)}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
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

      {/* Editor / Preview / Split Tabs */}
      <Tabs defaultValue="editor" className="flex-1 flex flex-col min-h-0">
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
            <TabsTrigger value="split" className="flex items-center">
              <Columns2Icon className="h-4 w-4 mr-2" />
              Split
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Edit tab */}
        <TabsContent
          value="editor"
          className="flex-1 p-0 data-[state=active]:flex flex-col min-h-0"
        >
          <div className="p-2 border-b">
            <MarkdownToolbar onAction={handleMarkdownAction} />
          </div>
          <div className="flex-1 min-h-0">
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

        {/* Preview tab */}
        <TabsContent
          value="preview"
          className="flex-1 p-0 data-[state=active]:flex min-h-0"
        >
          <MarkdownPreview content={content} />
        </TabsContent>

        {/* Split tab — editor on left, preview on right */}
        <TabsContent
          value="split"
          className="flex-1 p-0 data-[state=active]:flex min-h-0"
        >
          <div className="flex flex-1 min-h-0 divide-x">
            <div className="flex flex-col flex-1 min-h-0 min-w-0">
              <div className="p-2 border-b">
                <MarkdownToolbar onAction={handleMarkdownAction} />
              </div>
              <div className="flex-1 min-h-0">
                <MDEditor
                  value={content}
                  onChange={(val) => setContent(val || "")}
                  preview="edit"
                  height="100%"
                  visibleDragbar={false}
                  hideToolbar={true}
                />
              </div>
            </div>
            <div className="flex-1 min-h-0 min-w-0 overflow-auto">
              <MarkdownPreview content={content} />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Status bar — word count, char count, reading time */}
      <div className="flex items-center justify-end gap-4 px-4 py-1 border-t text-xs text-muted-foreground select-none">
        <span>{wordCount.toLocaleString()} words</span>
        <span>{charCount.toLocaleString()} chars</span>
        <span>~{readingTime} min read</span>
      </div>
    </div>
  );

  return editorContent;
};
