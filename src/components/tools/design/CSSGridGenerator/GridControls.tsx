import { FC, useState } from "react";
import { GridState, GridArea } from "./types";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Trash2,
  ChevronDown,
  Grid,
  Box,
  AlertCircle,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface GridControlsProps {
  gridState: GridState;
  selectedAreaId: string | null;
  onAddColumn: () => void;
  onRemoveColumn: (id: string) => void;
  onUpdateColumn: (id: string, size: string) => void;
  onAddRow: () => void;
  onRemoveRow: (id: string) => void;
  onUpdateRow: (id: string, size: string) => void;
  onUpdateArea: (id: string, updates: Partial<Omit<GridArea, "id">>) => void;
  onUpdateGaps: (rowGap: string, columnGap: string) => void;
  onUpdateContainerStyles: (
    styles: Partial<GridState["containerStyles"]>
  ) => void;
}

export const GridControls: FC<GridControlsProps> = ({
  gridState,
  selectedAreaId,
  onAddColumn,
  onRemoveColumn,
  onUpdateColumn,
  onAddRow,
  onRemoveRow,
  onUpdateRow,
  onUpdateArea,
  onUpdateGaps,
  onUpdateContainerStyles,
}) => {
  const { columns, rows, areas, gaps, containerStyles } = gridState;
  const selectedArea = selectedAreaId
    ? areas.find((area) => area.id === selectedAreaId)
    : null;

  // Tips for grid values with descriptions
  const columnSizeTips = [
    { value: "1fr", label: "1fr - Flexible fraction" },
    { value: "auto", label: "auto - Based on content" },
    { value: "min-content", label: "min-content - Minimum size" },
    { value: "max-content", label: "max-content - Maximum size" },
    { value: "200px", label: "200px - Fixed size" },
    { value: "50%", label: "50% - Percentage size" },
    {
      value: "minmax(100px, 1fr)",
      label: "minmax(100px, 1fr) - Min/max bounds",
    },
  ];

  const rowSizeTips = [
    { value: "auto", label: "auto - Based on content" },
    { value: "1fr", label: "1fr - Flexible fraction" },
    { value: "min-content", label: "min-content - Minimum size" },
    { value: "max-content", label: "max-content - Maximum size" },
    { value: "200px", label: "200px - Fixed size" },
    { value: "50%", label: "50% - Percentage size" },
    {
      value: "minmax(100px, auto)",
      label: "minmax(100px, auto) - Min/max bounds",
    },
  ];

  const [hoveredTip, setHoveredTip] = useState<string | null>(null);

  // Helper for common control styling
  const controlItemClass = "flex items-center justify-between mb-3 last:mb-0";
  const controlLabelClass = "text-sm font-medium flex-shrink-0 mr-2";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Grid Controls</h3>
        <Badge variant="outline" className="text-xs">
          {areas.length} areas
        </Badge>
      </div>

      <Tabs defaultValue="grid">
        <TabsList className="grid grid-cols-3 mb-2">
          <TabsTrigger
            value="grid"
            className="flex items-center gap-1 text-xs sm:text-sm"
          >
            <Grid className="h-4 w-4" />
            <span>Grid</span>
          </TabsTrigger>
          <TabsTrigger
            value="tracks"
            className="flex items-center gap-1 text-xs sm:text-sm"
          >
            <div className="flex flex-col h-4 w-4 justify-between items-center">
              <div className="h-0.5 w-full bg-current"></div>
              <div className="h-0.5 w-full bg-current"></div>
              <div className="h-0.5 w-full bg-current"></div>
            </div>
            <span>Tracks</span>
          </TabsTrigger>
          <TabsTrigger
            value="areas"
            className="flex items-center gap-1 text-xs sm:text-sm"
          >
            <Box className="h-4 w-4" />
            <span>Areas</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="space-y-4">
          {/* Grid Container Styles */}
          <Card className="p-4">
            <h4 className="text-sm font-semibold mb-3 flex items-center">
              Container Dimensions
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <AlertCircle className="h-3.5 w-3.5 ml-1 text-gray-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[200px]">
                    Set the overall dimensions of your grid container
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </h4>

            <div className={controlItemClass}>
              <Label htmlFor="container-width" className={controlLabelClass}>
                Width:
              </Label>
              <Input
                id="container-width"
                className="flex-1 h-8"
                value={containerStyles.width}
                onChange={(e) =>
                  onUpdateContainerStyles({ width: e.target.value })
                }
                placeholder="100%"
              />
            </div>

            <div className={controlItemClass}>
              <Label htmlFor="container-height" className={controlLabelClass}>
                Height:
              </Label>
              <Input
                id="container-height"
                className="flex-1 h-8"
                value={containerStyles.height}
                onChange={(e) =>
                  onUpdateContainerStyles({ height: e.target.value })
                }
                placeholder="auto"
              />
            </div>
          </Card>

          {/* Gap controls */}
          <Card className="p-4">
            <h4 className="text-sm font-semibold mb-3 flex items-center">
              Grid Gaps
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <AlertCircle className="h-3.5 w-3.5 ml-1 text-gray-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[200px]">
                    Set spacing between rows and columns
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </h4>

            <div className={controlItemClass}>
              <Label htmlFor="row-gap" className={controlLabelClass}>
                Row Gap:
              </Label>
              <Input
                id="row-gap"
                className="flex-1 h-8"
                value={gaps.row}
                onChange={(e) => onUpdateGaps(e.target.value, gaps.column)}
                placeholder="1rem"
              />
            </div>

            <div className={controlItemClass}>
              <Label htmlFor="column-gap" className={controlLabelClass}>
                Column Gap:
              </Label>
              <Input
                id="column-gap"
                className="flex-1 h-8"
                value={gaps.column}
                onChange={(e) => onUpdateGaps(gaps.row, e.target.value)}
                placeholder="1rem"
              />
            </div>
          </Card>

          {/* Alignment controls */}
          <Card className="p-4">
            <h4 className="text-sm font-semibold mb-3 flex items-center">
              Content Alignment
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <AlertCircle className="h-3.5 w-3.5 ml-1 text-gray-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[250px]">
                    Control how items are positioned and aligned within the grid
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label
                  htmlFor="justify-items"
                  className="text-xs text-gray-500 mb-1 block"
                >
                  Justify Items:
                </Label>
                <Select
                  value={containerStyles.justifyItems}
                  onValueChange={(value) =>
                    onUpdateContainerStyles({ justifyItems: value })
                  }
                >
                  <SelectTrigger id="justify-items" className="w-full h-8">
                    <SelectValue placeholder="stretch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stretch">stretch</SelectItem>
                    <SelectItem value="start">start</SelectItem>
                    <SelectItem value="center">center</SelectItem>
                    <SelectItem value="end">end</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label
                  htmlFor="align-items"
                  className="text-xs text-gray-500 mb-1 block"
                >
                  Align Items:
                </Label>
                <Select
                  value={containerStyles.alignItems}
                  onValueChange={(value) =>
                    onUpdateContainerStyles({ alignItems: value })
                  }
                >
                  <SelectTrigger id="align-items" className="w-full h-8">
                    <SelectValue placeholder="stretch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stretch">stretch</SelectItem>
                    <SelectItem value="start">start</SelectItem>
                    <SelectItem value="center">center</SelectItem>
                    <SelectItem value="end">end</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label
                  htmlFor="justify-content"
                  className="text-xs text-gray-500 mb-1 block"
                >
                  Justify Content:
                </Label>
                <Select
                  value={containerStyles.justifyContent}
                  onValueChange={(value) =>
                    onUpdateContainerStyles({ justifyContent: value })
                  }
                >
                  <SelectTrigger id="justify-content" className="w-full h-8">
                    <SelectValue placeholder="start" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="start">start</SelectItem>
                    <SelectItem value="center">center</SelectItem>
                    <SelectItem value="end">end</SelectItem>
                    <SelectItem value="space-between">space-between</SelectItem>
                    <SelectItem value="space-around">space-around</SelectItem>
                    <SelectItem value="space-evenly">space-evenly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label
                  htmlFor="align-content"
                  className="text-xs text-gray-500 mb-1 block"
                >
                  Align Content:
                </Label>
                <Select
                  value={containerStyles.alignContent}
                  onValueChange={(value) =>
                    onUpdateContainerStyles({ alignContent: value })
                  }
                >
                  <SelectTrigger id="align-content" className="w-full h-8">
                    <SelectValue placeholder="start" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="start">start</SelectItem>
                    <SelectItem value="center">center</SelectItem>
                    <SelectItem value="end">end</SelectItem>
                    <SelectItem value="space-between">space-between</SelectItem>
                    <SelectItem value="space-around">space-around</SelectItem>
                    <SelectItem value="space-evenly">space-evenly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="tracks" className="space-y-4">
          {/* Columns */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold flex items-center">
                Columns ({columns.length})
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <AlertCircle className="h-3.5 w-3.5 ml-1 text-gray-400 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[250px]">
                      Define the number and size of columns in your grid
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </h4>
              <Button
                variant="outline"
                size="sm"
                onClick={onAddColumn}
                className="h-8 px-2"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>

            <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
              {columns.map((column, index) => (
                <div
                  key={column.id}
                  className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-900 rounded-md p-1.5"
                >
                  <div className="min-w-[24px] h-[24px] rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs text-gray-700 dark:text-gray-300">
                    {index + 1}
                  </div>
                  <div className="relative flex-1">
                    <Input
                      className="h-8 pr-8"
                      value={column.size}
                      onChange={(e) =>
                        onUpdateColumn(column.id, e.target.value)
                      }
                      placeholder="1fr"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <ChevronDown
                              className="h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600"
                              onClick={() => setHoveredTip(column.id)}
                            />
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            Show common sizes
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>

                    {hoveredTip === column.id && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 z-10 p-2">
                        <div className="text-xs mb-1 font-medium">
                          Common sizes:
                        </div>
                        <div className="grid grid-cols-2 gap-1">
                          {columnSizeTips.map((tip) => (
                            <Button
                              key={tip.value}
                              variant="ghost"
                              size="sm"
                              className="h-auto py-1 justify-start text-xs"
                              onClick={() => {
                                onUpdateColumn(column.id, tip.value);
                                setHoveredTip(null);
                              }}
                              title={tip.label}
                            >
                              <span className="font-mono">{tip.value}</span>
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveColumn(column.id)}
                    className="h-8 w-8 p-0"
                    disabled={columns.length <= 1}
                    title="Remove column"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          {/* Rows */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold flex items-center">
                Rows ({rows.length})
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <AlertCircle className="h-3.5 w-3.5 ml-1 text-gray-400 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[250px]">
                      Define the number and size of rows in your grid
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </h4>
              <Button
                variant="outline"
                size="sm"
                onClick={onAddRow}
                className="h-8 px-2"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>

            <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
              {rows.map((row, index) => (
                <div
                  key={row.id}
                  className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-900 rounded-md p-1.5"
                >
                  <div className="min-w-[24px] h-[24px] rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs text-gray-700 dark:text-gray-300">
                    {index + 1}
                  </div>
                  <div className="relative flex-1">
                    <Input
                      className="h-8 pr-8"
                      value={row.size}
                      onChange={(e) => onUpdateRow(row.id, e.target.value)}
                      placeholder="auto"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <ChevronDown
                              className="h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600"
                              onClick={() => setHoveredTip(row.id)}
                            />
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            Show common sizes
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>

                    {hoveredTip === row.id && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 z-10 p-2">
                        <div className="text-xs mb-1 font-medium">
                          Common sizes:
                        </div>
                        <div className="grid grid-cols-2 gap-1">
                          {rowSizeTips.map((tip) => (
                            <Button
                              key={tip.value}
                              variant="ghost"
                              size="sm"
                              className="h-auto py-1 justify-start text-xs"
                              onClick={() => {
                                onUpdateRow(row.id, tip.value);
                                setHoveredTip(null);
                              }}
                              title={tip.label}
                            >
                              <span className="font-mono">{tip.value}</span>
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveRow(row.id)}
                    className="h-8 w-8 p-0"
                    disabled={rows.length <= 1}
                    title="Remove row"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="areas" className="space-y-4">
          {selectedArea ? (
            <Card className="p-4">
              <h4 className="text-sm font-semibold mb-3 flex items-center">
                <Badge className="mr-2">{selectedArea.name}</Badge>
                Selected Area
              </h4>

              <div className={controlItemClass}>
                <Label htmlFor="area-name" className={controlLabelClass}>
                  Name:
                </Label>
                <Input
                  id="area-name"
                  className="flex-1 h-8"
                  value={selectedArea.name}
                  onChange={(e) =>
                    onUpdateArea(selectedArea.id, { name: e.target.value })
                  }
                  placeholder="area-name"
                />
              </div>

              <Separator className="my-3" />

              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <Label className="text-xs text-gray-500 mb-1 block font-medium">
                    Start Position
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label
                        htmlFor="area-start-row"
                        className="text-xs mb-1 block"
                      >
                        Row
                      </Label>
                      <Input
                        id="area-start-row"
                        className="h-8"
                        type="number"
                        min={0}
                        max={rows.length - 1}
                        value={selectedArea.startRow}
                        onChange={(e) =>
                          onUpdateArea(selectedArea.id, {
                            startRow: parseInt(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="area-start-col"
                        className="text-xs mb-1 block"
                      >
                        Column
                      </Label>
                      <Input
                        id="area-start-col"
                        className="h-8"
                        type="number"
                        min={0}
                        max={columns.length - 1}
                        value={selectedArea.startColumn}
                        onChange={(e) =>
                          onUpdateArea(selectedArea.id, {
                            startColumn: parseInt(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-gray-500 mb-1 block font-medium">
                    End Position
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label
                        htmlFor="area-end-row"
                        className="text-xs mb-1 block"
                      >
                        Row
                      </Label>
                      <Input
                        id="area-end-row"
                        className="h-8"
                        type="number"
                        min={selectedArea.startRow + 1}
                        max={rows.length}
                        value={selectedArea.endRow}
                        onChange={(e) =>
                          onUpdateArea(selectedArea.id, {
                            endRow: parseInt(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="area-end-col"
                        className="text-xs mb-1 block"
                      >
                        Column
                      </Label>
                      <Input
                        id="area-end-col"
                        className="h-8"
                        type="number"
                        min={selectedArea.startColumn + 1}
                        max={columns.length}
                        value={selectedArea.endColumn}
                        onChange={(e) =>
                          onUpdateArea(selectedArea.id, {
                            endColumn: parseInt(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-2 border-t">
                <div className="text-xs text-gray-500 mb-2">
                  Visual representation:
                </div>
                <div
                  className="border border-gray-200 dark:border-gray-700 rounded-md p-2 grid bg-gray-50 dark:bg-gray-900"
                  style={{
                    gridTemplateColumns: `repeat(${columns.length}, 1fr)`,
                    gridTemplateRows: `repeat(${rows.length}, 20px)`,
                    gap: "2px",
                  }}
                >
                  {Array.from({ length: rows.length * columns.length }).map(
                    (_, index) => {
                      const row = Math.floor(index / columns.length);
                      const col = index % columns.length;
                      const isInArea =
                        row >= selectedArea.startRow &&
                        row < selectedArea.endRow &&
                        col >= selectedArea.startColumn &&
                        col < selectedArea.endColumn;

                      return (
                        <div
                          key={`cell-${index}`}
                          className={`border ${
                            isInArea
                              ? "bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700"
                              : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                          }`}
                        />
                      );
                    }
                  )}
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-4 flex items-center justify-center text-center h-40">
              <div className="text-gray-500">
                <Box className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p className="text-sm">No area selected.</p>
                <p className="text-xs mt-1">
                  Click and drag on the grid to create an area.
                </p>
              </div>
            </Card>
          )}

          <Card className="p-4">
            <h4 className="text-sm font-semibold mb-2 flex items-center">
              All Areas
              <Badge variant="secondary" className="ml-2">
                {areas.length}
              </Badge>
            </h4>

            {areas.length === 0 ? (
              <div className="py-8 flex flex-col items-center justify-center text-center border border-dashed border-gray-300 dark:border-gray-700 rounded-md">
                <Box className="h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">No areas defined yet.</p>
                <p className="text-xs text-gray-500 mt-1">
                  Click and drag on the grid to create areas.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[250px] overflow-y-auto">
                {areas.map((area) => (
                  <div
                    key={area.id}
                    onClick={() => onUpdateArea(area.id, {})}
                    className={`p-2 rounded text-sm ${
                      area.id === selectedAreaId
                        ? "bg-blue-100 dark:bg-blue-900 border border-blue-300 dark:border-blue-700"
                        : "bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700"
                    } cursor-pointer transition-colors duration-100`}
                  >
                    <div className="font-medium">{area.name}</div>
                    <div className="text-xs text-gray-500 mt-1 flex justify-between items-center">
                      <span>
                        Row {area.startRow + 1}:{area.endRow + 1} / Column{" "}
                        {area.startColumn + 1}:{area.endColumn + 1}
                      </span>
                      <Badge variant="outline" className="text-[10px] h-4">
                        {area.endRow - area.startRow} ×{" "}
                        {area.endColumn - area.startColumn}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
