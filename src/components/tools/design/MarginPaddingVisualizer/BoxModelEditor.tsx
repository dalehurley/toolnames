import React, { useMemo, useEffect, useRef, useState } from "react";
import { useSpacing } from "./SpacingContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { HelpCircle, Grid } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BoxModel3D from "./BoxModel3D";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Simplify SVG dimensions
const SVG_WIDTH = 600;
const SVG_HEIGHT = 400;
const CONTENT_WIDTH = 200;
const CONTENT_HEIGHT = 120;

// Handle sizes and colors
const HANDLE_SIZE = 10;
const COLORS = {
  margin: {
    fill: "#e0f2fe",
    border: "#bae6fd",
    text: "#0369a1",
    handle: "#0ea5e9",
  },
  border: {
    fill: "#f0f9ff",
    border: "#e0f2fe",
    text: "#0c4a6e",
    handle: "#0284c7",
  },
  padding: {
    fill: "#bae6fd",
    border: "#7dd3fc",
    text: "#0284c7",
    handle: "#0284c7",
  },
  content: {
    fill: "#0ea5e9",
    border: "#0284c7",
    text: "#f0f9ff",
  },
  dark: {
    margin: {
      fill: "#164e63",
      border: "#155e75",
      text: "#67e8f9",
      handle: "#06b6d4",
    },
    border: {
      fill: "#083344",
      border: "#164e63",
      text: "#a5f3fc",
      handle: "#06b6d4",
    },
    padding: {
      fill: "#155e75",
      border: "#0e7490",
      text: "#06b6d4",
      handle: "#0891b2",
    },
    content: {
      fill: "#0e7490",
      border: "#155e75",
      text: "#ecfeff",
    },
  },
};

// Grid constants
const GRID_SIZE = 10;
const GRID_COLOR = "#e2e8f0";
const GRID_COLOR_DARK = "#334155";

// BoxModelEditor component
const BoxModelEditor: React.FC = () => {
  const spacing = useSpacing();
  const editorRef = useRef<HTMLDivElement>(null);
  const [showGrid, setShowGrid] = useState(false);
  const [viewMode, setViewMode] = useState<"2d" | "3d">("2d");

  // Get theme colors based on preview mode
  const themeColors = useMemo(() => {
    return spacing.previewMode === "dark" ? COLORS.dark : COLORS;
  }, [spacing.previewMode]);

  // Calculate positions and dimensions for the SVG elements - SIMPLIFIED!
  const positions = useMemo(() => {
    // Fixed center position
    const centerX = SVG_WIDTH / 2;
    const centerY = SVG_HEIGHT / 2;

    // Start with the content box at the center
    const contentWidth = CONTENT_WIDTH;
    const contentHeight = CONTENT_HEIGHT;

    const contentRect = {
      width: contentWidth,
      height: contentHeight,
      x: centerX - contentWidth / 2,
      y: centerY - contentHeight / 2,
    };

    // Padding box expands outward from content
    const paddingRect = {
      width: contentWidth + spacing.paddingLeft + spacing.paddingRight,
      height: contentHeight + spacing.paddingTop + spacing.paddingBottom,
      x: contentRect.x - spacing.paddingLeft,
      y: contentRect.y - spacing.paddingTop,
    };

    // Border box expands outward from padding
    const borderRect = {
      width: paddingRect.width + spacing.borderWidth * 2,
      height: paddingRect.height + spacing.borderWidth * 2,
      x: paddingRect.x - spacing.borderWidth,
      y: paddingRect.y - spacing.borderWidth,
    };

    // Margin box expands outward from border
    const marginRect = {
      width: borderRect.width + spacing.marginLeft + spacing.marginRight,
      height: borderRect.height + spacing.marginTop + spacing.marginBottom,
      x: borderRect.x - spacing.marginLeft,
      y: borderRect.y - spacing.marginTop,
    };

    return {
      center: { x: centerX, y: centerY },
      content: contentRect,
      padding: paddingRect,
      border: borderRect,
      margin: marginRect,
    };
  }, [
    spacing.paddingTop,
    spacing.paddingRight,
    spacing.paddingBottom,
    spacing.paddingLeft,
    spacing.marginTop,
    spacing.marginRight,
    spacing.marginBottom,
    spacing.marginLeft,
    spacing.borderWidth,
  ]);

  // Handle value changes
  const handleValueChange = (property: string, value: string) => {
    const val = parseInt(value, 10);
    if (!isNaN(val) && val >= 0) {
      spacing.setSpacing(property, val);
    }
  };

  // Simplified render grid function
  const renderGrid = () => {
    const gridLines = [];
    for (let x = 0; x <= SVG_WIDTH; x += GRID_SIZE) {
      gridLines.push(
        <line
          key={`vertical-${x}`}
          x1={x}
          y1={0}
          x2={x}
          y2={SVG_HEIGHT}
          stroke={spacing.previewMode === "dark" ? GRID_COLOR_DARK : GRID_COLOR}
          strokeWidth="1"
          opacity="0.5"
        />
      );
    }
    for (let y = 0; y <= SVG_HEIGHT; y += GRID_SIZE) {
      gridLines.push(
        <line
          key={`horizontal-${y}`}
          x1={0}
          y1={y}
          x2={SVG_WIDTH}
          y2={y}
          stroke={spacing.previewMode === "dark" ? GRID_COLOR_DARK : GRID_COLOR}
          strokeWidth="1"
          opacity="0.5"
        />
      );
    }
    return gridLines;
  };

  // Simplified render handle function
  const renderHandle = (
    x: number,
    y: number,
    _property: string,
    _value: number,
    direction: "top" | "right" | "bottom" | "left",
    color: string
  ) => {
    // Adjust handle positions based on direction
    if (direction === "right") {
      x = x - HANDLE_SIZE / 2;
    } else if (direction === "bottom") {
      y = y - HANDLE_SIZE / 2;
    } else if (direction === "left") {
      x = x - HANDLE_SIZE / 2;
    } else if (direction === "top") {
      y = y - HANDLE_SIZE / 2;
    }

    return (
      <rect
        x={x}
        y={y}
        width={HANDLE_SIZE}
        height={HANDLE_SIZE}
        fill={color}
        stroke="#fff"
        strokeWidth="1"
        className="cursor-move transition-all duration-300"
      />
    );
  };

  // Render control inputs for spacing values
  const renderControls = () => {
    return (
      <div className="grid grid-cols-3 gap-4 mt-4">
        {/* Margin controls */}
        <div className="space-y-2">
          <Label htmlFor="margin-top">Margin Top</Label>
          <div className="flex space-x-2">
            <Input
              id="margin-top"
              type="number"
              min={0}
              value={spacing.marginTop}
              onChange={(e) => handleValueChange("marginTop", e.target.value)}
              className="w-full"
            />
            <span className="flex items-center text-sm">{spacing.unit}</span>
          </div>
          <Slider
            value={[spacing.marginTop]}
            min={0}
            max={100}
            step={1}
            onValueChange={(values) =>
              spacing.setSpacing("marginTop", values[0])
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="margin-right">Margin Right</Label>
          <div className="flex space-x-2">
            <Input
              id="margin-right"
              type="number"
              min={0}
              value={spacing.marginRight}
              onChange={(e) => handleValueChange("marginRight", e.target.value)}
              className="w-full"
            />
            <span className="flex items-center text-sm">{spacing.unit}</span>
          </div>
          <Slider
            value={[spacing.marginRight]}
            min={0}
            max={100}
            step={1}
            onValueChange={(values) =>
              spacing.setSpacing("marginRight", values[0])
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="margin-bottom">Margin Bottom</Label>
          <div className="flex space-x-2">
            <Input
              id="margin-bottom"
              type="number"
              min={0}
              value={spacing.marginBottom}
              onChange={(e) =>
                handleValueChange("marginBottom", e.target.value)
              }
              className="w-full"
            />
            <span className="flex items-center text-sm">{spacing.unit}</span>
          </div>
          <Slider
            value={[spacing.marginBottom]}
            min={0}
            max={100}
            step={1}
            onValueChange={(values) =>
              spacing.setSpacing("marginBottom", values[0])
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="margin-left">Margin Left</Label>
          <div className="flex space-x-2">
            <Input
              id="margin-left"
              type="number"
              min={0}
              value={spacing.marginLeft}
              onChange={(e) => handleValueChange("marginLeft", e.target.value)}
              className="w-full"
            />
            <span className="flex items-center text-sm">{spacing.unit}</span>
          </div>
          <Slider
            value={[spacing.marginLeft]}
            min={0}
            max={100}
            step={1}
            onValueChange={(values) =>
              spacing.setSpacing("marginLeft", values[0])
            }
          />
        </div>

        {/* All margins at once */}
        <div className="space-y-2">
          <Label htmlFor="all-margins">All Margins</Label>
          <div className="flex space-x-2">
            <Input
              id="all-margins"
              type="number"
              min={0}
              placeholder="Set all"
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val) && val >= 0) {
                  spacing.setAllMargins(val);
                }
              }}
              className="w-full"
            />
            <span className="flex items-center text-sm">{spacing.unit}</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="border-width">Border Width</Label>
          <div className="flex space-x-2">
            <Input
              id="border-width"
              type="number"
              min={0}
              value={spacing.borderWidth}
              onChange={(e) => handleValueChange("borderWidth", e.target.value)}
              className="w-full"
            />
            <span className="flex items-center text-sm">{spacing.unit}</span>
          </div>
          <Slider
            value={[spacing.borderWidth]}
            min={0}
            max={20}
            step={1}
            onValueChange={(values) =>
              spacing.setSpacing("borderWidth", values[0])
            }
          />
        </div>

        {/* Padding controls */}
        <div className="space-y-2">
          <Label htmlFor="padding-top">Padding Top</Label>
          <div className="flex space-x-2">
            <Input
              id="padding-top"
              type="number"
              min={0}
              value={spacing.paddingTop}
              onChange={(e) => handleValueChange("paddingTop", e.target.value)}
              className="w-full"
            />
            <span className="flex items-center text-sm">{spacing.unit}</span>
          </div>
          <Slider
            value={[spacing.paddingTop]}
            min={0}
            max={100}
            step={1}
            onValueChange={(values) =>
              spacing.setSpacing("paddingTop", values[0])
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="padding-right">Padding Right</Label>
          <div className="flex space-x-2">
            <Input
              id="padding-right"
              type="number"
              min={0}
              value={spacing.paddingRight}
              onChange={(e) =>
                handleValueChange("paddingRight", e.target.value)
              }
              className="w-full"
            />
            <span className="flex items-center text-sm">{spacing.unit}</span>
          </div>
          <Slider
            value={[spacing.paddingRight]}
            min={0}
            max={100}
            step={1}
            onValueChange={(values) =>
              spacing.setSpacing("paddingRight", values[0])
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="padding-bottom">Padding Bottom</Label>
          <div className="flex space-x-2">
            <Input
              id="padding-bottom"
              type="number"
              min={0}
              value={spacing.paddingBottom}
              onChange={(e) =>
                handleValueChange("paddingBottom", e.target.value)
              }
              className="w-full"
            />
            <span className="flex items-center text-sm">{spacing.unit}</span>
          </div>
          <Slider
            value={[spacing.paddingBottom]}
            min={0}
            max={100}
            step={1}
            onValueChange={(values) =>
              spacing.setSpacing("paddingBottom", values[0])
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="padding-left">Padding Left</Label>
          <div className="flex space-x-2">
            <Input
              id="padding-left"
              type="number"
              min={0}
              value={spacing.paddingLeft}
              onChange={(e) => handleValueChange("paddingLeft", e.target.value)}
              className="w-full"
            />
            <span className="flex items-center text-sm">{spacing.unit}</span>
          </div>
          <Slider
            value={[spacing.paddingLeft]}
            min={0}
            max={100}
            step={1}
            onValueChange={(values) =>
              spacing.setSpacing("paddingLeft", values[0])
            }
          />
        </div>

        {/* All paddings at once */}
        <div className="space-y-2">
          <Label htmlFor="all-paddings">All Paddings</Label>
          <div className="flex space-x-2">
            <Input
              id="all-paddings"
              type="number"
              min={0}
              placeholder="Set all"
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val) && val >= 0) {
                  spacing.setAllPaddings(val);
                }
              }}
              className="w-full"
            />
            <span className="flex items-center text-sm">{spacing.unit}</span>
          </div>
        </div>
      </div>
    );
  };

  // Remove the keyboard event handlers
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Just keep the focus handling and remove all keyboard shortcut handling
      if (e.target !== editor) return;
    };

    editor.addEventListener("keydown", handleKeyDown);
    return () => {
      editor.removeEventListener("keydown", handleKeyDown);
    };
  }, [spacing]);

  // Remove the keyboard shortcuts dialog
  const renderKeyboardShortcuts = () => (
    <Dialog>
      <DialogTrigger asChild>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="text-slate-400 hover:text-slate-500 dark:text-slate-500 dark:hover:text-slate-400">
                <HelpCircle className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-sm">Help</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Box Model Editor Help</DialogTitle>
          <DialogDescription>
            Learn how to use the box model editor to visualize and adjust
            margins and padding.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          <p>
            This editor helps you visualize the CSS box model with margins,
            borders, padding, and content areas.
          </p>
          <p>
            Use the controls below to adjust values or click and drag the
            handles in the visual editor.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div ref={editorRef} className="relative" tabIndex={0}>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium">Box Model Editor</h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Switch
                checked={showGrid}
                onCheckedChange={setShowGrid}
                id="grid-toggle"
              />
              <Label
                htmlFor="grid-toggle"
                className="flex items-center cursor-pointer"
              >
                <Grid className="h-4 w-4 mr-1" />
                <span className="text-sm">Grid</span>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              {renderKeyboardShortcuts()}
            </div>
          </div>
        </div>

        <Tabs
          value={viewMode}
          onValueChange={(value) => setViewMode(value as "2d" | "3d")}
          className="w-full"
        >
          <div className="flex justify-end mb-4">
            <TabsList className="h-8">
              <TabsTrigger value="2d" className="h-7 px-2 text-xs">
                2D
              </TabsTrigger>
              <TabsTrigger value="3d" className="h-7 px-2 text-xs">
                3D
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex flex-col items-center">
            <TabsContent value="2d" className="mt-0 w-full">
              <svg
                width={SVG_WIDTH}
                height={SVG_HEIGHT}
                className="box-model-editor transition-all duration-300"
                viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
              >
                {showGrid && renderGrid()}

                {/* Margin layer */}
                <rect
                  x={positions.margin.x}
                  y={positions.margin.y}
                  width={positions.margin.width}
                  height={positions.margin.height}
                  fill={themeColors.margin.fill}
                  stroke={themeColors.margin.border}
                  strokeWidth="1"
                  className="transition-all duration-300"
                />

                {/* Border layer */}
                <rect
                  x={positions.border.x}
                  y={positions.border.y}
                  width={positions.border.width}
                  height={positions.border.height}
                  fill={themeColors.border.fill}
                  stroke={themeColors.border.border}
                  strokeWidth="1"
                  className="transition-all duration-300"
                />

                {/* Padding layer */}
                <rect
                  x={positions.padding.x}
                  y={positions.padding.y}
                  width={positions.padding.width}
                  height={positions.padding.height}
                  fill={themeColors.padding.fill}
                  stroke={themeColors.padding.border}
                  strokeWidth="1"
                  className="transition-all duration-300"
                />

                {/* Content layer */}
                <rect
                  x={positions.content.x}
                  y={positions.content.y}
                  width={positions.content.width}
                  height={positions.content.height}
                  fill={themeColors.content.fill}
                  stroke={themeColors.content.border}
                  strokeWidth="1"
                  className="transition-all duration-300"
                />

                {/* Content text */}
                <text
                  x={positions.center.x}
                  y={positions.center.y}
                  fill={themeColors.content.text}
                  fontSize="14"
                  fontWeight="600"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="pointer-events-none transition-all duration-300"
                >
                  Content
                </text>

                {/* Simplified labels */}
                {/* Top labels */}
                <text
                  x={positions.center.x}
                  y={positions.margin.y - 8}
                  fill={themeColors.margin.text}
                  fontSize="12"
                  fontWeight="500"
                  textAnchor="middle"
                  dominantBaseline="auto"
                  className="pointer-events-none"
                >
                  Margin Top: {spacing.marginTop}
                  {spacing.unit}
                </text>

                <text
                  x={positions.center.x}
                  y={positions.padding.y - 5}
                  fill={themeColors.padding.text}
                  fontSize="12"
                  fontWeight="500"
                  textAnchor="middle"
                  dominantBaseline="auto"
                  className="pointer-events-none"
                >
                  Padding Top: {spacing.paddingTop}
                  {spacing.unit}
                </text>

                {/* Bottom labels */}
                <text
                  x={positions.center.x}
                  y={positions.margin.y + positions.margin.height + 15}
                  fill={themeColors.margin.text}
                  fontSize="12"
                  fontWeight="500"
                  textAnchor="middle"
                  dominantBaseline="auto"
                  className="pointer-events-none"
                >
                  Margin Bottom: {spacing.marginBottom}
                  {spacing.unit}
                </text>

                <text
                  x={positions.center.x}
                  y={positions.padding.y + positions.padding.height + 12}
                  fill={themeColors.padding.text}
                  fontSize="12"
                  fontWeight="500"
                  textAnchor="middle"
                  dominantBaseline="auto"
                  className="pointer-events-none"
                >
                  Padding Bottom: {spacing.paddingBottom}
                  {spacing.unit}
                </text>

                {/* Right labels */}
                <text
                  x={positions.margin.x + positions.margin.width + 8}
                  y={positions.center.y}
                  fill={themeColors.margin.text}
                  fontSize="12"
                  fontWeight="500"
                  textAnchor="start"
                  dominantBaseline="middle"
                  className="pointer-events-none"
                >
                  Margin Right: {spacing.marginRight}
                  {spacing.unit}
                </text>

                <text
                  x={positions.padding.x + positions.padding.width + 8}
                  y={positions.center.y - 15}
                  fill={themeColors.padding.text}
                  fontSize="12"
                  fontWeight="500"
                  textAnchor="start"
                  dominantBaseline="middle"
                  className="pointer-events-none"
                >
                  Padding Right: {spacing.paddingRight}
                  {spacing.unit}
                </text>

                {/* Left labels */}
                <text
                  x={positions.margin.x - 8}
                  y={positions.center.y}
                  fill={themeColors.margin.text}
                  fontSize="12"
                  fontWeight="500"
                  textAnchor="end"
                  dominantBaseline="middle"
                  className="pointer-events-none"
                >
                  Margin Left: {spacing.marginLeft}
                  {spacing.unit}
                </text>

                <text
                  x={positions.padding.x - 8}
                  y={positions.center.y - 15}
                  fill={themeColors.padding.text}
                  fontSize="12"
                  fontWeight="500"
                  textAnchor="end"
                  dominantBaseline="middle"
                  className="pointer-events-none"
                >
                  Padding Left: {spacing.paddingLeft}
                  {spacing.unit}
                </text>

                {/* Simplified handles - only the most important ones */}
                {/* Top margin handle */}
                {renderHandle(
                  positions.margin.x + positions.margin.width / 2,
                  positions.margin.y,
                  "marginTop",
                  spacing.marginTop,
                  "top",
                  themeColors.margin.handle
                )}

                {/* Right margin handle */}
                {renderHandle(
                  positions.margin.x + positions.margin.width,
                  positions.margin.y + positions.margin.height / 2,
                  "marginRight",
                  spacing.marginRight,
                  "right",
                  themeColors.margin.handle
                )}

                {/* Bottom margin handle */}
                {renderHandle(
                  positions.margin.x + positions.margin.width / 2,
                  positions.margin.y + positions.margin.height,
                  "marginBottom",
                  spacing.marginBottom,
                  "bottom",
                  themeColors.margin.handle
                )}

                {/* Left margin handle */}
                {renderHandle(
                  positions.margin.x,
                  positions.margin.y + positions.margin.height / 2,
                  "marginLeft",
                  spacing.marginLeft,
                  "left",
                  themeColors.margin.handle
                )}

                {/* Top padding handle */}
                {renderHandle(
                  positions.padding.x + positions.padding.width / 2,
                  positions.padding.y,
                  "paddingTop",
                  spacing.paddingTop,
                  "top",
                  themeColors.padding.handle
                )}

                {/* Bottom padding handle */}
                {renderHandle(
                  positions.padding.x + positions.padding.width / 2,
                  positions.padding.y + positions.padding.height,
                  "paddingBottom",
                  spacing.paddingBottom,
                  "bottom",
                  themeColors.padding.handle
                )}
              </svg>
            </TabsContent>

            <TabsContent value="3d" className="mt-0 w-full">
              <BoxModel3D />
            </TabsContent>

            {renderControls()}
          </div>
        </Tabs>
      </Card>
    </div>
  );
};

export default BoxModelEditor;
