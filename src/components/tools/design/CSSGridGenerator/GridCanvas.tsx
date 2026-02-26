import React, { FC, useState, useRef, useEffect } from "react";
import { GridState, GridArea } from "./types";
import { getAreaAtPosition } from "./utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Copy, Move } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Badge } from "@/components/ui/badge";

interface GridCanvasProps {
  gridState: GridState;
  selectedAreaId: string | null;
  onAreaSelect: (id: string | null) => void;
  onUpdateArea: (id: string, updates: Partial<Omit<GridArea, "id">>) => void;
  onRemoveArea: (id: string) => void;
  onAddArea: (area: Omit<GridArea, "id">) => string;
}

interface DragState {
  isDragging: boolean;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

export const GridCanvas: FC<GridCanvasProps> = ({
  gridState,
  selectedAreaId,
  onAreaSelect,
  onUpdateArea,
  onRemoveArea,
  onAddArea,
}) => {
  const { columns, rows, areas, gaps, containerStyles } = gridState;
  const canvasRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
  });

  // Show helper instruction when the grid is empty
  const showGridHelp = areas.length === 0;

  // Reset selection state when grid changes
  useEffect(() => {
    setIsSelecting(false);
  }, [columns.length, rows.length]);

  // Calculate selection bounds
  const selectionBounds = isSelecting
    ? {
        startRow: Math.min(dragState.startX, dragState.currentX),
        endRow: Math.max(dragState.startX, dragState.currentX) + 1,
        startCol: Math.min(dragState.startY, dragState.currentY),
        endCol: Math.max(dragState.startY, dragState.currentY) + 1,
      }
    : null;

  // Get area at position (for hover effects)
  const getAreaStylesAt = (rowIndex: number, colIndex: number) => {
    const area = getAreaAtPosition(areas, rowIndex, colIndex);
    if (!area) return {};

    // Return a slightly different color if this is a selected area
    const isSelected = area.id === selectedAreaId;
    return {
      backgroundColor: isSelected
        ? "rgba(99, 102, 241, 0.3)"
        : "rgba(99, 102, 241, 0.1)",
      border: isSelected
        ? "2px solid rgb(99, 102, 241)"
        : "1px solid rgba(99, 102, 241, 0.5)",
      cursor: "pointer",
    };
  };

  // Check if selection overlaps any existing area
  const selectionOverlapsArea = () => {
    if (!selectionBounds) return false;

    return areas.some(
      (area) =>
        // Check if selection and area overlap
        !(
          area.endRow <= selectionBounds.startRow ||
          area.startRow >= selectionBounds.endRow ||
          area.endColumn <= selectionBounds.startCol ||
          area.startColumn >= selectionBounds.endCol
        )
    );
  };

  // Create new area from selection
  const createAreaFromSelection = () => {
    if (!selectionBounds || selectionOverlapsArea()) return;

    const newAreaName = `area-${areas.length + 1}`;
    const newArea: Omit<GridArea, "id"> = {
      name: newAreaName,
      startRow: selectionBounds.startRow,
      endRow: selectionBounds.endRow,
      startColumn: selectionBounds.startCol,
      endColumn: selectionBounds.endCol,
    };

    const newId = onAddArea(newArea);
    onAreaSelect(newId);

    // Reset selection
    setIsSelecting(false);
    setDragState({
      isDragging: false,
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
    });
  };

  // Handle mouse events for area selection
  const handleMouseDown = (
    e: React.MouseEvent,
    rowIndex: number,
    colIndex: number
  ) => {
    if (e.button !== 0) return; // Only handle left mouse button

    // Check if clicking on an existing area
    const area = getAreaAtPosition(areas, rowIndex, colIndex);
    if (area) {
      onAreaSelect(area.id);
      return;
    }

    // Otherwise start selection
    setIsSelecting(true);
    setDragState({
      isDragging: true,
      startX: rowIndex,
      startY: colIndex,
      currentX: rowIndex,
      currentY: colIndex,
    });
    onAreaSelect(null);
  };

  const handleMouseMove = (rowIndex: number, colIndex: number) => {
    if (isSelecting) {
      setDragState({
        isDragging: true,
        startX: dragState.startX,
        startY: dragState.startY,
        currentX: rowIndex,
        currentY: colIndex,
      });
    }
  };

  const handleMouseUp = () => {
    if (isSelecting && selectionBounds) {
      if (
        selectionBounds.startRow !== selectionBounds.endRow - 1 ||
        selectionBounds.startCol !== selectionBounds.endCol - 1
      ) {
        // Only show create option if selection is more than one cell
        createAreaFromSelection();
      } else {
        // Single cell selection, just reset
        setIsSelecting(false);
        setDragState({
          isDragging: false,
          startX: 0,
          startY: 0,
          currentX: 0,
          currentY: 0,
        });
      }
    }
  };

  // Handle area deletion
  const handleDeleteArea = (areaId: string) => {
    onRemoveArea(areaId);
    if (selectedAreaId === areaId) {
      onAreaSelect(null);
    }
  };

  // Calculate selection overlay position
  const getSelectionStyle = (): React.CSSProperties => {
    if (!selectionBounds || !gridRef.current) return {};

    const { startRow, endRow, startCol, endCol } = selectionBounds;

    // Check if the selection spans multiple cells
    const isValidSelection = startRow !== endRow - 1 || startCol !== endCol - 1;

    return {
      gridRowStart: startRow + 1,
      gridRowEnd: endRow + 1,
      gridColumnStart: startCol + 1,
      gridColumnEnd: endCol + 1,
      backgroundColor: selectionOverlapsArea()
        ? "rgba(239, 68, 68, 0.2)"
        : isValidSelection
        ? "rgba(16, 185, 129, 0.2)"
        : "transparent",
      border: selectionOverlapsArea()
        ? "2px dashed rgb(239, 68, 68)"
        : isValidSelection
        ? "2px dashed rgb(16, 185, 129)"
        : "none",
      zIndex: 10,
      pointerEvents: "none" as const,
      position: "absolute" as const,
    };
  };

  return (
    <Card className="relative p-4 overflow-auto" ref={canvasRef}>
      <div className="flex flex-col mb-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Grid Canvas</h3>
          <Badge variant="outline" className="text-xs">
            {columns.length} × {rows.length} grid
          </Badge>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Click and drag to create grid areas. Right-click on areas for more
          options.
        </p>
      </div>

      <div
        className="grid relative border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden"
        style={{
          gridTemplateColumns: columns.map((col) => col.size).join(" "),
          gridTemplateRows: rows.map((row) => row.size).join(" "),
          gap: `${gaps.row} ${gaps.column}`,
          width: containerStyles.width,
          height:
            containerStyles.height !== "auto"
              ? containerStyles.height
              : undefined,
          justifyItems: containerStyles.justifyItems,
          alignItems: containerStyles.alignItems,
          justifyContent: containerStyles.justifyContent,
          alignContent: containerStyles.alignContent,
          minHeight: "400px",
          backgroundColor: "rgba(229, 231, 235, 0.3)",
          position: "relative",
        }}
        ref={gridRef}
      >
        {/* Grid Help Overlay - shown when the grid is empty */}
        {showGridHelp && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50/50 dark:bg-gray-800/50 z-20 pointer-events-none">
            <div className="text-center p-6 rounded-lg bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 max-w-md">
              <div className="mb-4 text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mx-auto"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M3 9h18" />
                  <path d="M3 15h18" />
                  <path d="M9 3v18" />
                  <path d="M15 3v18" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">Create Grid Areas</h3>
              <p className="text-sm text-gray-500 mb-4">
                Click and drag across multiple cells to create a grid area
              </p>
              <div className="flex justify-center">
                <Badge variant="secondary" className="mx-auto animate-pulse">
                  Start by dragging on the grid
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Grid lines */}
        <div
          className="absolute pointer-events-none"
          style={{
            inset: 0,
            display: "grid",
            gridTemplateColumns: `repeat(${columns.length}, 1fr)`,
            gridTemplateRows: `repeat(${rows.length}, 1fr)`,
            gap: `${gaps.row} ${gaps.column}`,
          }}
        >
          {Array.from({ length: rows.length }).map((_, rowIndex) =>
            Array.from({ length: columns.length }).map((_, colIndex) => (
              <div
                key={`cell-${rowIndex}-${colIndex}`}
                className="border border-dashed border-gray-200 dark:border-gray-700"
              />
            ))
          )}
        </div>

        {/* Grid coordinates (for better usability) */}
        <div className="absolute top-0 left-0 z-20 pointer-events-none">
          {columns.map((_, index) => (
            <div
              key={`col-label-${index}`}
              className="absolute text-[10px] font-mono text-gray-400 dark:text-gray-500"
              style={{
                left: `calc(${index * (100 / columns.length)}% + ${
                  index === 0 ? 2 : 7
                }px)`,
                top: "2px",
              }}
            >
              {index + 1}
            </div>
          ))}
        </div>
        <div className="absolute top-0 left-0 z-20 pointer-events-none">
          {rows.map((_, index) => (
            <div
              key={`row-label-${index}`}
              className="absolute text-[10px] font-mono text-gray-400 dark:text-gray-500"
              style={{
                top: `calc(${index * (100 / rows.length)}% + ${
                  index === 0 ? 2 : 7
                }px)`,
                left: "2px",
              }}
            >
              {index + 1}
            </div>
          ))}
        </div>

        {/* Areas */}
        {areas.map((area) => (
          <ContextMenu key={area.id}>
            <ContextMenuTrigger>
              <div
                style={{
                  gridRowStart: area.startRow + 1,
                  gridRowEnd: area.endRow + 1,
                  gridColumnStart: area.startColumn + 1,
                  gridColumnEnd: area.endColumn + 1,
                  padding: "0.5rem",
                  backgroundColor:
                    area.id === selectedAreaId
                      ? "rgba(99, 102, 241, 0.3)"
                      : "rgba(99, 102, 241, 0.1)",
                  border:
                    area.id === selectedAreaId
                      ? "2px solid rgb(99, 102, 241)"
                      : "1px solid rgba(99, 102, 241, 0.5)",
                  borderRadius: "0.25rem",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  position: "relative",
                  zIndex: area.id === selectedAreaId ? 5 : 1,
                  transition: "all 0.2s ease",
                }}
                onClick={() => onAreaSelect(area.id)}
                className="hover:shadow-md group"
              >
                <div className="text-xs font-medium text-center">
                  {area.name}
                </div>
                <div className="text-[10px] text-gray-500 mt-1 opacity-70 group-hover:opacity-100">
                  {area.startRow + 1}:{area.endRow + 1} / {area.startColumn + 1}
                  :{area.endColumn + 1}
                </div>
                {area.id === selectedAreaId && (
                  <Badge
                    variant="secondary"
                    className="absolute -top-2 -right-2 text-[10px]"
                  >
                    Selected
                  </Badge>
                )}
              </div>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem
                onClick={() => {
                  onAreaSelect(area.id);
                }}
              >
                <Copy className="h-4 w-4 mr-2" />
                Select
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() => {
                  const newName = prompt("Area name:", area.name);
                  if (newName && newName.trim() !== "") {
                    onUpdateArea(area.id, { name: newName.trim() });
                  }
                }}
              >
                <Move className="h-4 w-4 mr-2" />
                Rename
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() => handleDeleteArea(area.id)}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        ))}

        {/* Cell overlay for mouse events */}
        <div
          className="absolute inset-0 grid"
          style={{
            gridTemplateColumns: `repeat(${columns.length}, 1fr)`,
            gridTemplateRows: `repeat(${rows.length}, 1fr)`,
            gap: `${gaps.row} ${gaps.column}`,
          }}
        >
          {Array.from({ length: rows.length }).map((_, rowIndex) =>
            Array.from({ length: columns.length }).map((_, colIndex) => (
              <div
                key={`overlay-${rowIndex}-${colIndex}`}
                className="transition-colors duration-100 hover:bg-gray-100/40 dark:hover:bg-gray-700/40"
                style={{
                  ...getAreaStylesAt(rowIndex, colIndex),
                }}
                onMouseDown={(e) => handleMouseDown(e, rowIndex, colIndex)}
                onMouseMove={() => handleMouseMove(rowIndex, colIndex)}
                onMouseUp={handleMouseUp}
              />
            ))
          )}
        </div>

        {/* Selection overlay */}
        {isSelecting && selectionBounds && (
          <div
            className="absolute animate-pulse"
            style={{
              ...getSelectionStyle(),
            }}
          />
        )}
      </div>

      {/* Instructions and controls */}
      <div className="mt-6 flex justify-between items-center">
        <div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-sm text-gray-500 flex items-center gap-1 cursor-help">
                  <span className="i-lucide-info h-4 w-4" />
                  <span>
                    <span className="font-medium">Tip:</span> Click and drag to
                    create a grid area
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-[300px]">
                <p className="text-xs">
                  To create a grid area, click and drag across multiple cells.
                  Grid areas must be rectangular and cannot overlap with
                  existing areas.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        {selectedAreaId && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteArea(selectedAreaId)}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete Area
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete selected area</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </Card>
  );
};
