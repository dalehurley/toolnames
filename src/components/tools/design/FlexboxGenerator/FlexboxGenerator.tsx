import { FC, useState, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { FlexboxCanvas } from "./FlexboxCanvas";
import { FlexboxControls } from "./FlexboxControls";
import { FlexboxItemControls } from "./FlexboxItemControls";
import { FlexboxCodeOutput } from "./FlexboxCodeOutput";
import { FlexboxTemplateManager } from "./FlexboxTemplateManager";
import { FlexboxCheatsheet } from "./FlexboxCheatsheet";
import { useFlexboxState } from "./hooks/useFlexboxState";
import { useCodeGenerator } from "./hooks/useCodeGenerator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { BookOpen, X, Keyboard } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export const FlexboxGenerator: FC = () => {
  const {
    container,
    items,
    selectedItemId,
    templates,
    exportFormat,
    setSelectedItemId,
    setExportFormat,
    addItem,
    removeItem,
    updateItem,
    updateContainer,
    saveTemplate,
    loadTemplate,
    deleteTemplate,
  } = useFlexboxState();

  const cssCode = useCodeGenerator(container, items, "css");
  const scssCode = useCodeGenerator(container, items, "scss");
  const tailwindCode = useCodeGenerator(container, items, "tailwind");

  const selectedItem = selectedItemId
    ? items.find((item) => item.id === selectedItemId)
    : null;

  const [showCheatsheet, setShowCheatsheet] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [activeTab, setActiveTab] = useState<"editor" | "code">("editor");

  const handleItemResize = (id: string, width: string, height: string) => {
    updateItem(id, { width, height });
  };

  const handleItemMove = (id: string, newIndex: number) => {
    // Get the current index of the item
    const currentIndex = items.findIndex((item) => item.id === id);
    if (currentIndex === -1) return;

    // Create a new array with the item moved to the new position
    const newItems = [...items];
    const [movedItem] = newItems.splice(currentIndex, 1);
    newItems.splice(newIndex, 0, movedItem);

    // Update the state with the new items array
    updateItem(id, { order: newIndex });
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle shortcuts if no input/textarea is focused
      if (
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement ||
        document.activeElement instanceof HTMLSelectElement
      ) {
        return;
      }

      // Add new item: Ctrl/Cmd + N
      if ((e.ctrlKey || e.metaKey) && e.key === "n") {
        e.preventDefault();
        addItem();
        toast.success("New item added");
      }

      // Delete selected item: Delete key
      if (e.key === "Delete" && selectedItemId) {
        e.preventDefault();
        removeItem(selectedItemId);
        toast.success("Item removed");
      }

      // Toggle cheatsheet: Ctrl/Cmd + H
      if ((e.ctrlKey || e.metaKey) && e.key === "h") {
        e.preventDefault();
        setShowCheatsheet((prev) => !prev);
      }

      // Switch tabs: Ctrl/Cmd + 1 (Editor) or Ctrl/Cmd + 2 (Code)
      if ((e.ctrlKey || e.metaKey) && e.key === "1") {
        e.preventDefault();
        setActiveTab("editor");
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "2") {
        e.preventDefault();
        setActiveTab("code");
      }

      // Show keyboard shortcuts: Ctrl/Cmd + K
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setShowKeyboardShortcuts(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [addItem, removeItem, selectedItemId]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 gap-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Flexbox Generator</h2>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowKeyboardShortcuts(true)}
              >
                <Keyboard className="mr-1 h-4 w-4" /> Shortcuts
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCheatsheet(!showCheatsheet)}
              >
                {showCheatsheet ? (
                  <>
                    <X className="mr-1 h-4 w-4" /> Close Cheatsheet
                  </>
                ) : (
                  <>
                    <BookOpen className="mr-1 h-4 w-4" /> Flexbox Cheatsheet
                  </>
                )}
              </Button>
            </div>
          </div>

          {showCheatsheet && <FlexboxCheatsheet />}

          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as "editor" | "code")}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="editor">Visual Editor</TabsTrigger>
              <TabsTrigger value="code">Generated Code</TabsTrigger>
            </TabsList>

            <TabsContent value="editor" className="space-y-6">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Left column - Canvas */}
                <div className="flex-1">
                  <FlexboxCanvas
                    container={container}
                    items={items}
                    selectedItemId={selectedItemId}
                    onSelectItem={setSelectedItemId}
                    onItemResize={handleItemResize}
                    onItemMove={handleItemMove}
                  />
                </div>

                {/* Right column - Controls */}
                <div className="lg:w-1/3 space-y-6">
                  <FlexboxControls
                    container={container}
                    onUpdateContainer={updateContainer}
                    onAddItem={addItem}
                  />

                  {selectedItem && (
                    <FlexboxItemControls
                      item={selectedItem}
                      onUpdateItem={(props) =>
                        updateItem(selectedItem.id, props)
                      }
                      onRemoveItem={() => removeItem(selectedItem.id)}
                    />
                  )}

                  <FlexboxTemplateManager
                    templates={templates}
                    onSaveTemplate={saveTemplate}
                    onLoadTemplate={loadTemplate}
                    onDeleteTemplate={deleteTemplate}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="code">
              <FlexboxCodeOutput
                cssCode={cssCode}
                scssCode={scssCode}
                tailwindCode={tailwindCode}
                format={exportFormat}
                onFormatChange={setExportFormat}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Keyboard shortcuts dialog */}
      <Dialog
        open={showKeyboardShortcuts}
        onOpenChange={setShowKeyboardShortcuts}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Keyboard Shortcuts</DialogTitle>
            <DialogDescription>
              Use these keyboard shortcuts to work more efficiently
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Add new item</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs">
                  Ctrl/⌘ + N
                </kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Delete selected item</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs">Delete</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Toggle cheatsheet</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs">
                  Ctrl/⌘ + H
                </kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Switch to Editor tab</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs">
                  Ctrl/⌘ + 1
                </kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Switch to Code tab</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs">
                  Ctrl/⌘ + 2
                </kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Show this dialog</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs">
                  Ctrl/⌘ + K
                </kbd>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DndProvider>
  );
};
