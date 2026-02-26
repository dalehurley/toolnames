import React, { useRef } from "react";
import { useNotes } from "@/contexts/NotesContext";
import { Button } from "@/components/ui/button";
import { DownloadIcon, UploadIcon, HelpCircleIcon } from "lucide-react";
import { Note } from "@/types/notes";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export const NoteControls: React.FC = () => {
  const { exportNotes, importNotes } = useNotes();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const notes = JSON.parse(e.target?.result as string) as Note[];
        if (Array.isArray(notes)) {
          importNotes(notes);
        } else {
          alert("Invalid notes format.");
        }
      } catch (error) {
        console.error("Error importing notes:", error);
        alert(
          "Error importing notes. Make sure the file is valid JSON format."
        );
      }
    };
    reader.readAsText(file);

    // Reset the input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        className="hidden"
      />

      <Button
        variant="outline"
        size="sm"
        onClick={exportNotes}
        className="flex items-center"
      >
        <DownloadIcon className="h-4 w-4 mr-2" />
        Export
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleImportClick}
        className="flex items-center"
      >
        <UploadIcon className="h-4 w-4 mr-2" />
        Import
      </Button>

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon">
            <HelpCircleIcon className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Markdown Notes Help</DialogTitle>
            <DialogDescription>Using the Notes app</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Creating Notes</h3>
              <p className="text-sm text-muted-foreground">
                Click the "New Note" button in the sidebar to create a new note.
              </p>
            </div>

            <div>
              <h3 className="font-medium">Markdown Formatting</h3>
              <p className="text-sm text-muted-foreground mb-2">
                This editor supports standard Markdown syntax:
              </p>
              <ul className="text-sm space-y-1 list-disc pl-5">
                <li># Heading 1, ## Heading 2, etc.</li>
                <li>**Bold** or __Bold__</li>
                <li>*Italic* or _Italic_</li>
                <li>- Bullet points</li>
                <li>1. Numbered lists</li>
                <li>[Link text](url)</li>
                <li>![Image alt](image-url)</li>
                <li>`code`</li>
                <li>```code block```</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium">Tags</h3>
              <p className="text-sm text-muted-foreground">
                Use #tag in your notes to automatically create tags. You can
                filter notes by tags in the sidebar.
              </p>
            </div>

            <div>
              <h3 className="font-medium">Keyboard Shortcuts</h3>
              <ul className="text-sm space-y-1 list-disc pl-5">
                <li>Ctrl+B: Bold</li>
                <li>Ctrl+I: Italic</li>
                <li>Ctrl+K: Insert link</li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
