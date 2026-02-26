import React from "react";
import { NotesProvider } from "@/contexts/NotesContext";
import { NoteControls } from "./NoteControls";
import { ThemeToggle } from "./ThemeToggle";
import { ResizablePanels } from "./ResizablePanels";
import { AdvancedSearch } from "./AdvancedSearch";

const NoteTaking: React.FC = () => {
  return (
    <NotesProvider>
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
    </NotesProvider>
  );
};

export default NoteTaking;
