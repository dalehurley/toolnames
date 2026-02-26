import React, { useState } from "react";
import { format, addDays } from "date-fns";
import { useTimeBlocking } from "@/contexts/TimeBlockingContext";
import { TimeBlockingProvider } from "@/contexts/TimeBlockingContext";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  BarChart,
  Calendar as CalendarIcon,
  Settings2,
} from "lucide-react";

import TimelineView from "./TimelineView";
import CategoryManager from "./CategoryManager";
import BlockEditorDialog from "./BlockEditorDialog";
import AnalyticsDashboard from "./AnalyticsDashboard";
import SettingsPanel from "./SettingsPanel";

const TimeBlockingCalendarInner: React.FC = () => {
  const {
    state,
    dispatch,
    createBlock,
    updateBlock,
    deleteBlock,
    getVisibleBlocks,
    toggleAnalytics,
  } = useTimeBlocking();

  const [isBlockEditorOpen, setIsBlockEditorOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentBlock, setCurrentBlock] = useState<null | any>(null);

  // Date navigation
  const navigateToToday = () => {
    dispatch({ type: "SET_DATE", payload: new Date() });
  };

  const navigateDay = (direction: number) => {
    const newDate = addDays(state.selectedDate, direction);
    dispatch({ type: "SET_DATE", payload: newDate });
  };

  // Block operations
  const handleCreateBlock = () => {
    // Set default times based on current time
    const now = new Date();
    const startTime = new Date(
      state.selectedDate.getFullYear(),
      state.selectedDate.getMonth(),
      state.selectedDate.getDate(),
      now.getHours(),
      Math.floor(now.getMinutes() / 30) * 30
    );

    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + 60); // Default 1-hour block

    setCurrentBlock({
      title: "",
      description: "",
      startTime,
      endTime,
      categoryId: state.categories[0]?.id || "",
      energyLevel: 3,
      isCompleted: false,
      isRecurring: false,
    });

    setIsBlockEditorOpen(true);
  };

  const handleEditBlock = (blockId: string) => {
    const block = state.blocks.find((b) => b.id === blockId);
    if (block) {
      setCurrentBlock(block);
      setIsBlockEditorOpen(true);
    }
  };

  const handleBlockSubmit = (blockData: any) => {
    if ("id" in blockData) {
      updateBlock(blockData);
    } else {
      createBlock(blockData);
    }
    setIsBlockEditorOpen(false);
    setCurrentBlock(null);
  };

  const visibleBlocks = getVisibleBlocks();

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-950 rounded-md shadow-sm">
      {/* Header with navigation controls */}
      <div className="flex items-center justify-between p-4 border-b bg-white dark:bg-gray-950">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={navigateToToday}>
            Today
          </Button>
          <Button variant="ghost" size="icon" onClick={() => navigateDay(-1)}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => navigateDay(1)}>
            <ChevronRight className="w-4 h-4" />
          </Button>
          <h2 className="text-xl font-bold">
            {format(state.selectedDate, "EEEE, MMMM d, yyyy")}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <Tabs
            defaultValue="day"
            value={state.currentView}
            onValueChange={(value) =>
              dispatch({
                type: "SET_VIEW",
                payload: value as "day" | "week" | "month",
              })
            }
          >
            <TabsList>
              <TabsTrigger value="day">Day</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
            </TabsList>
          </Tabs>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => toggleAnalytics()}
            className={state.isAnalyticsVisible ? "bg-accent" : ""}
          >
            <BarChart className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSettingsOpen(true)}
          >
            <Settings2 className="w-4 h-4" />
          </Button>

          <Button onClick={handleCreateBlock}>
            <Plus className="w-4 h-4 mr-2" />
            Block
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className=" w-80 p-4 border-r overflow-y-auto bg-white dark:bg-gray-950">
          <CategoryManager />

          <div className="mt-6">
            <div className="flex items-center mb-2">
              <CalendarIcon className="w-4 h-4 mr-2" />
              <h3 className="font-medium">Calendar</h3>
            </div>
            <Calendar
              mode="single"
              selected={state.selectedDate}
              onSelect={(date) =>
                date && dispatch({ type: "SET_DATE", payload: date })
              }
              className="rounded-md border"
            />
          </div>
        </div>

        {/* Timeline view */}
        <div className="flex-1 overflow-y-auto">
          <TimelineView
            blocks={visibleBlocks}
            date={state.selectedDate}
            onEditBlock={handleEditBlock}
            onDeleteBlock={deleteBlock}
            showEnergyLevel={state.settings.showEnergyLevel}
            energyPattern={state.energyPattern}
            dayStartTime={state.settings.dayStartTime}
            dayEndTime={state.settings.dayEndTime}
            timeIncrement={state.settings.timeIncrement}
          />
        </div>
      </div>

      {/* Analytics dashboard (expandable) */}
      {state.isAnalyticsVisible && (
        <div className="p-4 border-t bg-white dark:bg-gray-950">
          <AnalyticsDashboard
            blocks={state.blocks}
            categories={state.categories}
            selectedDate={state.selectedDate}
            currentView={state.currentView}
          />
        </div>
      )}

      {/* Block editor dialog */}
      <BlockEditorDialog
        open={isBlockEditorOpen}
        onOpenChange={setIsBlockEditorOpen}
        block={currentBlock}
        categories={state.categories}
        onSubmit={handleBlockSubmit}
        onDelete={
          currentBlock?.id ? () => deleteBlock(currentBlock.id) : undefined
        }
      />

      {/* Settings panel */}
      <SettingsPanel
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        settings={state.settings}
        energyPattern={state.energyPattern}
        onSettingsUpdate={(settings) =>
          dispatch({ type: "UPDATE_SETTINGS", payload: settings })
        }
        onEnergyPatternUpdate={(pattern) =>
          dispatch({ type: "UPDATE_ENERGY_PATTERN", payload: pattern })
        }
      />
    </div>
  );
};

// Wrap the component with the provider
const TimeBlockingCalendar: React.FC = () => {
  return (
    <TimeBlockingProvider>
      <TimeBlockingCalendarInner />
    </TimeBlockingProvider>
  );
};

export default TimeBlockingCalendar;
