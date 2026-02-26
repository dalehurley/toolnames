import React, { useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NoteList } from "./NoteList";
import { NoteEditor } from "./NoteEditor";

export const ResizablePanels: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [previousWidth, setPreviousWidth] = useState(20); // Default sidebar width percentage

  const handleCollapse = () => {
    if (!isCollapsed) {
      // Save current width before collapsing
      setPreviousWidth(sidebarWidth);
      setSidebarWidth(0);
    } else {
      // Restore previous width when expanding
      setSidebarWidth(previousWidth);
    }
    setIsCollapsed(!isCollapsed);
  };

  const [sidebarWidth, setSidebarWidth] = useState(20);

  const handleResize = (sizes: number[]) => {
    if (sizes[0] > 0) {
      setSidebarWidth(sizes[0]);
    }
  };

  return (
    <div className="flex flex-1 overflow-hidden">
      <PanelGroup direction="horizontal" onLayout={handleResize}>
        <Panel
          id="sidebar"
          defaultSize={20}
          minSize={0}
          collapsible={true}
          order={1}
        >
          <div
            className={`h-full relative border-r ${
              isCollapsed ? "hidden" : "block"
            }`}
          >
            <NoteList />
          </div>
        </Panel>

        <PanelResizeHandle
          className={`w-1.5 bg-border hover:bg-primary/20 relative ${
            isCollapsed ? "hidden" : "block"
          }`}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-8 rounded-full bg-muted-foreground/20" />
        </PanelResizeHandle>

        <Panel id="content" minSize={30} order={2}>
          <div className="h-full relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCollapse}
              className="absolute top-4 left-0 z-10 h-6 w-6 bg-background/80 rounded-r-md shadow-sm"
            >
              {isCollapsed ? (
                <ChevronRightIcon className="h-4 w-4" />
              ) : (
                <ChevronLeftIcon className="h-4 w-4" />
              )}
            </Button>
            <NoteEditor />
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
};
