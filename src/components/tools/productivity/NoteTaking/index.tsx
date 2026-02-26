import React, { useEffect } from "react";
import { NotesProvider, useNotes } from "@/contexts/NotesContext";
import { NoteControls } from "./NoteControls";
import { ThemeToggle } from "./ThemeToggle";
import { ResizablePanels } from "./ResizablePanels";
import { AdvancedSearch } from "./AdvancedSearch";

// Inner component so it can access the NotesProvider context
const NoteTakingInner: React.FC = () => {
  const { addNote } = useNotes();

  // Global keyboard shortcut: Ctrl+N (or Cmd+N on Mac) → new note
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "n") {
        e.preventDefault();
        addNote();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [addNote]);

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold mr-4">Markdown Notes</h1>
          <div className="hidden md:block">
            <AdvancedSearch />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <ThemeToggle />
          <NoteControls />
        </div>
      </div>

      <div className="p-4 border-b md:hidden">
        <AdvancedSearch />
      </div>

      <ResizablePanels />
    </div>
  );
};

const NoteTaking: React.FC = () => {
  return (
    <NotesProvider>
      <NoteTakingInner />
    </NotesProvider>
  );
};

export default NoteTaking;
