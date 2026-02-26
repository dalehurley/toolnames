import React, { useState, useRef, useEffect } from "react";
import { format, isSameDay } from "date-fns";
import {
  DndContext,
  useSensors,
  useSensor,
  PointerSensor,
  DragEndEvent,
} from "@dnd-kit/core";
import type { Modifier } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  calculateTimeSlots,
  formatTimeString,
  calculateTimePosition,
  generateEnergyPoints,
} from "@/utils/timeUtils";
import { TimeBlock, EnergyPattern } from "@/contexts/TimeBlockingContext";
import { useTimeBlocking } from "@/contexts/TimeBlockingContext";
import { GripVertical, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TimelineViewProps {
  blocks: TimeBlock[];
  date: Date;
  onEditBlock: (blockId: string) => void;
  onDeleteBlock: (blockId: string) => void;
  showEnergyLevel: boolean;
  energyPattern: EnergyPattern;
  dayStartTime: string;
  dayEndTime: string;
  timeIncrement: number;
}

// Create a simple vertical axis restriction modifier
const restrictToVerticalAxis: Modifier = ({ transform }) => {
  return {
    ...transform,
    x: 0,
  };
};

const TimelineView: React.FC<TimelineViewProps> = ({
  blocks,
  date,
  onEditBlock,
  onDeleteBlock,
  showEnergyLevel,
  energyPattern,
  dayStartTime,
  dayEndTime,
  timeIncrement,
}) => {
  const { createBlock, updateBlock } = useTimeBlocking();
  const timelineRef = useRef<HTMLDivElement>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [createStartY, setCreateStartY] = useState(0);
  const [createEndY, setCreateEndY] = useState(0);

  // Configure DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Calculate time slots
  const timeSlots = calculateTimeSlots(
    dayStartTime,
    dayEndTime,
    timeIncrement,
    date
  );

  // Calculate total height of the timeline
  const timelineHeight = timeSlots.length * 30; // 30px per time slot

  // Generate energy points for the curve
  const energyPoints = showEnergyLevel
    ? generateEnergyPoints(energyPattern, dayStartTime, dayEndTime, date)
    : [];

  // Handle drag end (for moving blocks)
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const blockId = active.id as string;
    const block = blocks.find((b) => b.id === blockId);

    if (!block) return;

    // Calculate the time difference based on the change in vertical position
    // This is a simplified calculation that you might need to adjust
    const activeIndex = blocks.findIndex((block) => block.id === active.id);
    const overIndex = blocks.findIndex((block) => block.id === over.id);

    // If blocks are the same or no movement
    if (activeIndex === overIndex) return;

    // Calculate the time difference between source and destination
    const timeDiff = (overIndex - activeIndex) * timeIncrement;

    // Update block times
    const newStartTime = new Date(block.startTime);
    newStartTime.setMinutes(newStartTime.getMinutes() + timeDiff);

    const newEndTime = new Date(block.endTime);
    newEndTime.setMinutes(newEndTime.getMinutes() + timeDiff);

    updateBlock({
      ...block,
      startTime: newStartTime,
      endTime: newEndTime,
    });
  };

  // Handle mouse down (for creating blocks)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!timelineRef.current) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top;

    setIsCreating(true);
    setCreateStartY(y);
    setCreateEndY(y);

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  // Handle mouse move (for resizing while creating)
  const handleMouseMove = (e: MouseEvent) => {
    if (!isCreating || !timelineRef.current) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top;

    setCreateEndY(y);
  };

  // Extract the TimeBlocking context for use in handleMouseUp
  const timeBlockingContext = useTimeBlocking();

  // Handle mouse up (finish creating)
  const handleMouseUp = () => {
    if (!isCreating || !timelineRef.current) return;

    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);

    const rect = timelineRef.current.getBoundingClientRect();
    const totalHeight = rect.height;

    // Calculate start and end positions
    const minY = Math.min(createStartY, createEndY);
    const maxY = Math.max(createStartY, createEndY);

    // If the drag was too small, treat it as a click and don't create a block
    if (Math.abs(maxY - minY) < 15) {
      setIsCreating(false);
      return;
    }

    // Convert positions to times
    const startPercent = minY / totalHeight;
    const endPercent = maxY / totalHeight;

    const totalMinutes = timeSlots.length * timeIncrement;
    const startMinutes = Math.floor(startPercent * totalMinutes);
    const endMinutes = Math.floor(endPercent * totalMinutes);

    // Create start and end times
    const startTime = new Date(date);
    startTime.setHours(
      parseInt(dayStartTime.split(":")[0]),
      parseInt(dayStartTime.split(":")[1]) + startMinutes
    );

    const endTime = new Date(date);
    endTime.setHours(
      parseInt(dayStartTime.split(":")[0]),
      parseInt(dayStartTime.split(":")[1]) + endMinutes
    );

    // Create the new block
    createBlock({
      title: "New Block",
      description: "",
      startTime,
      endTime,
      categoryId: timeBlockingContext.state.categories[0].id,
      energyLevel: 3,
      isCompleted: false,
      isRecurring: false,
    });

    setIsCreating(false);
  };

  // Cleanup event listeners
  useEffect(() => {
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isCreating]);

  // Render block with @dnd-kit/sortable
  const renderBlock = (block: TimeBlock) => {
    // Use the context outside the render function
    const { state } = timeBlockingContext;
    const category = state.categories.find((c) => c.id === block.categoryId);

    if (!category) return null;

    // Calculate position and height
    const startPosition = calculateTimePosition(
      block.startTime,
      dayStartTime,
      dayEndTime,
      date
    );

    const endPosition = calculateTimePosition(
      block.endTime,
      dayStartTime,
      dayEndTime,
      date
    );

    const height = endPosition - startPosition;

    // Calculate duration
    const durationMs = block.endTime.getTime() - block.startTime.getTime();
    const durationMins = Math.round(durationMs / (1000 * 60));
    const hours = Math.floor(durationMins / 60);
    const minutes = durationMins % 60;
    const durationText = `${hours > 0 ? `${hours}h ` : ""}${
      minutes > 0 ? `${minutes}m` : ""
    }`;

    return (
      <SortableBlockItem
        key={block.id}
        id={block.id}
        block={block}
        category={category}
        startPosition={startPosition}
        height={height}
        durationText={durationText}
        onEditBlock={onEditBlock}
        onDeleteBlock={onDeleteBlock}
        updateBlock={updateBlock}
      />
    );
  };

  // Render the energy level curve
  const renderEnergyCurve = () => {
    if (!showEnergyLevel || energyPoints.length === 0) return null;

    // Convert points to SVG path
    let path = `M0,${100 - energyPoints[0].y}`;

    for (let i = 1; i < energyPoints.length; i++) {
      path += ` L${energyPoints[i].x},${100 - energyPoints[i].y}`;
    }

    return (
      <div
        className="absolute top-0 left-0 w-full h-full pointer-events-none z-0"
        style={{ opacity: 0.15 }}
      >
        <svg width="100%" height="100%" preserveAspectRatio="none">
          <defs>
            <linearGradient id="energyGradient" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>
          <path
            d={path}
            fill="none"
            stroke="url(#energyGradient)"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      </div>
    );
  };

  // Render the creation overlay
  const renderCreationOverlay = () => {
    if (!isCreating) return null;

    const top = Math.min(createStartY, createEndY);
    const height = Math.abs(createEndY - createStartY);

    return (
      <div
        className="absolute bg-blue-500/30 border-2 border-blue-500 rounded"
        style={{
          top,
          left: 60,
          width: "calc(100% - 75px)",
          height,
        }}
      />
    );
  };

  // Render time slots
  const renderTimeSlots = () => {
    return timeSlots.map((slot, index) => (
      <div
        key={index}
        className="flex items-center h-[30px] border-t border-gray-100 dark:border-gray-800"
      >
        <div className="w-[60px] pr-2 text-right text-xs text-gray-500 dark:text-gray-400">
          {format(slot, "h:mm a")}
        </div>
        <div className="flex-1 h-full" />
      </div>
    ));
  };

  // Add current time indicator
  const renderCurrentTimeIndicator = () => {
    const now = new Date();

    // Only show for today
    if (!isSameDay(now, date)) return null;

    const position = calculateTimePosition(now, dayStartTime, dayEndTime, date);

    return (
      <div
        className="absolute left-0 right-0 border-t-2 border-red-500 z-10 pointer-events-none"
        style={{
          top: `${position}%`,
        }}
      >
        <div className="absolute -top-2 -left-1 w-3 h-3 rounded-full bg-red-500" />
      </div>
    );
  };

  return (
    <DndContext
      sensors={sensors}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToVerticalAxis]}
    >
      <div
        className="relative h-full overflow-y-auto"
        ref={timelineRef}
        onMouseDown={handleMouseDown}
      >
        <div className="relative" style={{ height: `${timelineHeight}px` }}>
          {renderTimeSlots()}
          {renderEnergyCurve()}
          {renderCurrentTimeIndicator()}
          {renderCreationOverlay()}

          <div className="absolute top-0 left-0 w-full h-full">
            <SortableContext
              items={blocks.map((block) => block.id)}
              strategy={verticalListSortingStrategy}
            >
              {blocks.map((block) => renderBlock(block))}
            </SortableContext>
          </div>
        </div>
      </div>
    </DndContext>
  );
};

// Sortable block item component
interface SortableBlockItemProps {
  id: string;
  block: TimeBlock;
  category: {
    id: string;
    name: string;
    color: string;
  };
  startPosition: number;
  height: number;
  durationText: string;
  onEditBlock: (id: string) => void;
  onDeleteBlock: (id: string) => void;
  updateBlock: (block: TimeBlock) => void;
}

const SortableBlockItem = ({
  id,
  block,
  category,
  startPosition,
  height,
  durationText,
  onEditBlock,
  onDeleteBlock,
  updateBlock,
}: SortableBlockItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    position: "absolute" as const,
    top: `${startPosition}%`,
    left: "60px",
    width: "calc(100% - 75px)",
    height: `${height}%`,
    backgroundColor: category.color,
    borderRadius: "4px",
    padding: "8px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)",
    cursor: "pointer",
    opacity: block.isCompleted ? 0.7 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => onEditBlock(id)}
      {...attributes}
    >
      <div className="flex justify-between items-start h-full">
        <div className="flex-1 overflow-hidden">
          <div className="font-medium truncate">{block.title}</div>
          <div className="text-xs opacity-90">
            {formatTimeString(block.startTime)} -{" "}
            {formatTimeString(block.endTime)} ({durationText})
          </div>
          {block.description && (
            <div className="text-xs mt-1 text-white/80 line-clamp-2">
              {block.description}
            </div>
          )}
        </div>
        <div className="flex flex-col space-y-1">
          <div className="handle cursor-grab" {...listeners}>
            <GripVertical className="w-4 h-4 opacity-70" />
          </div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 text-white/70 hover:text-white hover:bg-white/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    updateBlock({
                      ...block,
                      isCompleted: !block.isCompleted,
                    });
                  }}
                >
                  <Check className="w-3 h-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Mark as {block.isCompleted ? "incomplete" : "complete"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 text-white/70 hover:text-white hover:bg-white/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteBlock(id);
                  }}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Delete block</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
};

export default TimelineView;
