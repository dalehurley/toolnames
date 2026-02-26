import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ScatterChart,
  Scatter,
  Cell,
} from "recharts";
import { format, startOfMonth, endOfMonth, subYears } from "date-fns";

// UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Icons
import {
  BarChart,
  AlertTriangle,
  Download,
  HelpCircle,
  RefreshCw,
  Filter,
  Info,
  Calendar,
} from "lucide-react";

// Lottery Types and Utils
import { LotteryDraw } from "./shared/LotteryTypes";
import {
  LOTTERY_CONFIGS,
  getLotteryConfigList,
} from "./shared/LotteryConfigurations";
import {
  getLotteryDemoData,
  getLotteryDemoDataSync,
} from "./shared/LotteryDemoData";

/**
 * Represents a time segment of lottery draws
 */
interface TimeSegment {
  startDate: Date;
  endDate: Date;
  frequencies: { [key: number]: number };
  totalDraws: number;
}

/**
 * Represents a cell in the heatmap visualization
 */
interface HeatmapCell {
  number: number;
  segment: string;
  frequency: number;
  normalizedFrequency: number;
  startDate: Date;
  endDate: Date;
  totalDraws: number;
}

/**
 * Date range filter options
 */
type DateRangeFilter = "1year" | "3years" | "5years" | "all";

const FrequencyDistributionVisualizer: React.FC = () => {
  // State for lottery configuration
  const [selectedConfig, setSelectedConfig] = useState<string>("powerball");
  const [draws, setDraws] = useState<LotteryDraw[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // State for visualization settings
  const [segmentType, setSegmentType] = useState<
    "monthly" | "quarterly" | "yearly"
  >("quarterly");
  const [displayMode, setDisplayMode] = useState<"absolute" | "relative">(
    "relative"
  );
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [dateFilter, setDateFilter] = useState<DateRangeFilter>("all");
  const [activeTab, setActiveTab] = useState<string>("heatmap");

  // Load lottery data
  const fetchData = useCallback(
    async (refresh: boolean = false) => {
      if (refresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        // Get selected config
        const config = LOTTERY_CONFIGS[selectedConfig];
        if (!config) {
          setError(`Invalid lottery configuration: ${selectedConfig}`);
          setIsLoading(false);
          setIsRefreshing(false);
          return;
        }

        // Start with demo data for immediate display
        const initialData = getLotteryDemoDataSync(selectedConfig);
        setDraws(initialData);

        // Try to fetch real data
        try {
          const realData = await getLotteryDemoData(selectedConfig);
          if (realData && realData.length > 0) {
            setDraws(realData);
          }
        } catch (fetchError) {
          console.error("Error fetching lottery data:", fetchError);
          if (initialData.length === 0) {
            setError("Failed to load lottery data. Please try again later.");
          }
        }
      } catch (error) {
        console.error("Error loading lottery data:", error);
        setError("Failed to load lottery data. Please try again later.");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [selectedConfig]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter draws by date range
  const filteredDraws = useMemo(() => {
    if (dateFilter === "all" || !draws.length) return draws;

    const cutoffDate = subYears(
      new Date(),
      dateFilter === "1year" ? 1 : dateFilter === "3years" ? 3 : 5
    );

    return draws.filter((draw) => draw.date >= cutoffDate);
  }, [draws, dateFilter]);

  // Process data into time segments
  const timeSegments = useMemo(() => {
    if (!filteredDraws.length) return [];

    // Sort draws by date
    const sortedDraws = [...filteredDraws].sort(
      (a, b) => a.date.getTime() - b.date.getTime()
    );

    // Get date range
    const startDate = sortedDraws[0].date;
    const endDate = sortedDraws[sortedDraws.length - 1].date;

    // Generate segments based on selected type
    const segments: TimeSegment[] = [];
    let currentStart = startOfMonth(startDate);

    while (currentStart < endDate) {
      let segmentEnd: Date;

      if (segmentType === "monthly") {
        segmentEnd = endOfMonth(currentStart);
      } else if (segmentType === "quarterly") {
        segmentEnd = endOfMonth(
          new Date(currentStart.getFullYear(), currentStart.getMonth() + 2, 1)
        );
      } else {
        segmentEnd = endOfMonth(new Date(currentStart.getFullYear(), 11, 31));
      }

      // Filter draws for this segment
      const segmentDraws = sortedDraws.filter(
        (draw) => draw.date >= currentStart && draw.date <= segmentEnd
      );

      // Calculate frequencies for this segment
      const frequencies: { [key: number]: number } = {};
      segmentDraws.forEach((draw) => {
        draw.mainNumbers.forEach((num) => {
          frequencies[num] = (frequencies[num] || 0) + 1;
        });
      });

      segments.push({
        startDate: currentStart,
        endDate: segmentEnd,
        frequencies,
        totalDraws: segmentDraws.length,
      });

      // Move to next segment
      if (segmentType === "monthly") {
        currentStart = new Date(
          currentStart.getFullYear(),
          currentStart.getMonth() + 1,
          1
        );
      } else if (segmentType === "quarterly") {
        currentStart = new Date(
          currentStart.getFullYear(),
          currentStart.getMonth() + 3,
          1
        );
      } else {
        currentStart = new Date(currentStart.getFullYear() + 1, 0, 1);
      }
    }

    return segments;
  }, [filteredDraws, segmentType]);

  // Convert segments to heatmap data
  const heatmapData = useMemo(() => {
    if (!timeSegments.length) return [];

    const data: HeatmapCell[] = [];
    const allFrequencies = timeSegments.flatMap((segment) =>
      Object.values(segment.frequencies)
    );

    const maxFreq = Math.max(...allFrequencies, 1); // Ensure non-zero

    const config = LOTTERY_CONFIGS[selectedConfig];
    if (!config) return [];

    for (
      let number = config.mainNumbers.min;
      number <= config.mainNumbers.max;
      number++
    ) {
      timeSegments.forEach((segment) => {
        const frequency = segment.frequencies[number] || 0;
        const normalizedFrequency =
          displayMode === "relative"
            ? segment.totalDraws > 0
              ? frequency / segment.totalDraws
              : 0
            : frequency / maxFreq;

        data.push({
          number,
          segment: format(
            segment.startDate,
            segmentType === "monthly"
              ? "MMM yyyy"
              : segmentType === "quarterly"
              ? "QQ yyyy"
              : "yyyy"
          ),
          frequency,
          normalizedFrequency,
          startDate: segment.startDate,
          endDate: segment.endDate,
          totalDraws: segment.totalDraws,
        });
      });
    }

    return data;
  }, [timeSegments, selectedConfig, displayMode]);

  // Function to export data as CSV
  const exportToCsv = useCallback(() => {
    if (!heatmapData.length) return;

    // Create a map of segments
    const segments = [...new Set(heatmapData.map((cell) => cell.segment))];

    // Create header row
    const headers = ["Number", ...segments];

    // Create rows
    const config = LOTTERY_CONFIGS[selectedConfig];
    const rows: string[][] = [];

    for (
      let number = config.mainNumbers.min;
      number <= config.mainNumbers.max;
      number++
    ) {
      const row = [number.toString()];

      segments.forEach((segment) => {
        const cell = heatmapData.find(
          (cell) => cell.number === number && cell.segment === segment
        );

        if (cell) {
          row.push(
            displayMode === "relative"
              ? (cell.normalizedFrequency * 100).toFixed(2) + "%"
              : cell.frequency.toString()
          );
        } else {
          row.push("0");
        }
      });

      rows.push(row);
    }

    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `lottery-frequency-${selectedConfig}-${segmentType}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [heatmapData, selectedConfig, segmentType, displayMode]);

  // Get total statistics
  const stats = useMemo(() => {
    if (!filteredDraws.length) return { totalDraws: 0, dateRange: "" };

    const sortedDraws = [...filteredDraws].sort(
      (a, b) => a.date.getTime() - b.date.getTime()
    );

    return {
      totalDraws: filteredDraws.length,
      dateRange: `${format(sortedDraws[0].date, "MMM d, yyyy")} - ${format(
        sortedDraws[sortedDraws.length - 1].date,
        "MMM d, yyyy"
      )}`,
    };
  }, [filteredDraws]);

  // Enhanced heatmap color function
  const getEnhancedHeatmapColor = (normalizedValue: number): string => {
    // More visually distinct color scale (blue-purple gradient)
    if (normalizedValue < 0.2) {
      return `rgb(240, 249, 255)`; // Very light blue
    } else if (normalizedValue < 0.4) {
      return `rgb(189, 224, 254)`;
    } else if (normalizedValue < 0.6) {
      return `rgb(107, 174, 250)`;
    } else if (normalizedValue < 0.8) {
      return `rgb(50, 115, 220)`;
    } else {
      return `rgb(30, 58, 138)`; // Dark blue
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Frequency Distribution Over Time</CardTitle>
          <CardDescription>
            Loading frequency distribution data...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-[400px] w-full" />
            <div className="flex gap-4">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>
            Failed to load frequency distribution data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex items-center text-red-500">
              <AlertTriangle className="h-5 w-5 mr-2" />
              {error}
            </div>
            <Button
              onClick={() => fetchData(true)}
              variant="outline"
              className="w-fit"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // No data state
  if (!filteredDraws.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Frequency Distribution Over Time</CardTitle>
          <CardDescription>
            No data available for the selected period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <BarChart className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Select a different time period or lottery configuration to view
              the frequency distribution.
            </p>
            <Button
              onClick={() => {
                setDateFilter("all");
                fetchData(true);
              }}
              variant="outline"
              className="mt-4"
            >
              Reset Filters
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4">
      {/* Configuration Card */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle>Lottery Frequency Analysis</CardTitle>
              <CardDescription>
                Analyze number frequency patterns over time
              </CardDescription>
            </div>
            {stats.totalDraws > 0 && (
              <Badge variant="outline" className="flex gap-1">
                <Calendar className="h-3.5 w-3.5" />
                <span className="text-xs">{stats.dateRange}</span>
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="lottery-select">Lottery Game</Label>
              <Select
                value={selectedConfig}
                onValueChange={setSelectedConfig}
                disabled={isRefreshing}
              >
                <SelectTrigger id="lottery-select" className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getLotteryConfigList().map((config) => (
                    <SelectItem key={config.id} value={config.id}>
                      {config.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="date-filter">Time Period</Label>
              <Select
                value={dateFilter}
                onValueChange={(value: DateRangeFilter) => setDateFilter(value)}
                disabled={isRefreshing}
              >
                <SelectTrigger id="date-filter" className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="5years">Last 5 Years</SelectItem>
                  <SelectItem value="3years">Last 3 Years</SelectItem>
                  <SelectItem value="1year">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                onClick={() => fetchData(true)}
                variant="outline"
                disabled={isRefreshing}
                className="mb-0.5 w-full"
              >
                {isRefreshing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Refreshing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Data
                  </>
                )}
              </Button>
            </div>
          </div>

          {stats.totalDraws > 0 && (
            <div className="flex items-center mt-4 text-sm text-muted-foreground">
              <Info className="h-4 w-4 mr-1.5" />
              Analyzing {stats.totalDraws} draws{" "}
              {dateFilter !== "all" &&
                `from the past ${dateFilter
                  .replace("years", " years")
                  .replace("year", " year")}`}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              <CardTitle>Frequency Distribution Visualization</CardTitle>
            </div>
            <div className="flex gap-2">
              <TooltipProvider>
                <UITooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={exportToCsv}
                      disabled={!heatmapData.length}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Export data as CSV</p>
                  </TooltipContent>
                </UITooltip>
              </TooltipProvider>

              <TooltipProvider>
                <UITooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-9 w-9 p-0"
                      aria-label="View help information"
                    >
                      <HelpCircle className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>
                      Click on any cell to track a specific number across time
                      periods. Click again to deselect.
                    </p>
                  </TooltipContent>
                </UITooltip>
              </TooltipProvider>
            </div>
          </div>
          <CardDescription>
            Analyze how number frequencies change over different time periods
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs
            defaultValue="heatmap"
            value={activeTab}
            onValueChange={setActiveTab}
            className="mb-6"
          >
            <TabsList>
              <TabsTrigger value="heatmap">Heatmap View</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="heatmap" className="pt-4">
              {selectedNumber && (
                <div className="mb-4">
                  <Badge variant="secondary" className="text-base px-3 py-1.5">
                    Tracking Number: {selectedNumber}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0 ml-2"
                      onClick={() => setSelectedNumber(null)}
                    >
                      ×
                    </Button>
                  </Badge>
                </div>
              )}

              <div
                className="h-[400px] mt-4"
                role="figure"
                aria-label={`Frequency distribution heatmap for ${
                  LOTTERY_CONFIGS[selectedConfig]?.name || selectedConfig
                } numbers`}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart
                    margin={{ top: 20, right: 20, bottom: 60, left: 30 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="segment"
                      type="category"
                      allowDuplicatedCategory={false}
                      interval={segmentType === "monthly" ? 2 : 0}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      tick={{ fontSize: 12 }}
                      aria-label="Time period"
                    />
                    <YAxis
                      dataKey="number"
                      type="number"
                      domain={[
                        LOTTERY_CONFIGS[selectedConfig].mainNumbers.min,
                        LOTTERY_CONFIGS[selectedConfig].mainNumbers.max,
                      ]}
                      interval={0}
                      tick={{ fontSize: 12 }}
                      aria-label="Lottery number"
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload as HeatmapCell;
                          return (
                            <div className="bg-background border rounded-lg shadow-lg p-3">
                              <p className="font-medium">
                                Number {data.number}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {format(data.startDate, "MMM d, yyyy")} -{" "}
                                {format(data.endDate, "MMM d, yyyy")}
                              </p>
                              <p className="text-sm">
                                Frequency: {data.frequency} times
                                {displayMode === "relative" &&
                                  ` (${(data.normalizedFrequency * 100).toFixed(
                                    1
                                  )}%)`}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Total draws in period: {data.totalDraws}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Scatter
                      data={heatmapData}
                      shape="square"
                      aria-label="Frequency heatmap"
                    >
                      {heatmapData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={getEnhancedHeatmapColor(
                            entry.normalizedFrequency
                          )}
                          stroke={
                            selectedNumber === entry.number ? "#000" : "none"
                          }
                          strokeWidth={selectedNumber === entry.number ? 2 : 0}
                          style={{ cursor: "pointer" }}
                          onClick={() =>
                            setSelectedNumber(
                              entry.number === selectedNumber
                                ? null
                                : entry.number
                            )
                          }
                          aria-label={`Number ${entry.number}, frequency ${
                            entry.frequency
                          } (${(entry.normalizedFrequency * 100).toFixed(1)}%)`}
                        />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>

              {/* Legend */}
              <div className="mt-8">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">Frequency Scale</div>
                  <div className="text-sm text-muted-foreground">
                    {displayMode === "absolute"
                      ? "Number of occurrences"
                      : "Percentage of draws"}
                  </div>
                </div>
                <div className="h-6 w-full flex rounded mt-2 overflow-hidden">
                  <div
                    className="w-1/5 bg-[rgb(240,249,255)]"
                    aria-label="Very low frequency"
                  ></div>
                  <div
                    className="w-1/5 bg-[rgb(189,224,254)]"
                    aria-label="Low frequency"
                  ></div>
                  <div
                    className="w-1/5 bg-[rgb(107,174,250)]"
                    aria-label="Medium frequency"
                  ></div>
                  <div
                    className="w-1/5 bg-[rgb(50,115,220)]"
                    aria-label="High frequency"
                  ></div>
                  <div
                    className="w-1/5 bg-[rgb(30,58,138)]"
                    aria-label="Very high frequency"
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Low Frequency</span>
                  <span>High Frequency</span>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <Label
                    htmlFor="segment-select"
                    className="flex items-center gap-1.5"
                  >
                    <Filter className="h-4 w-4" />
                    Time Segmentation
                  </Label>
                  <Select
                    value={segmentType}
                    onValueChange={(
                      value: "monthly" | "quarterly" | "yearly"
                    ) => setSegmentType(value)}
                  >
                    <SelectTrigger id="segment-select" className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1.5">
                    Determines how data is grouped over time
                  </p>
                </div>

                <div>
                  <Label
                    htmlFor="display-select"
                    className="flex items-center gap-1.5"
                  >
                    <BarChart className="h-4 w-4" />
                    Display Mode
                  </Label>
                  <Select
                    value={displayMode}
                    onValueChange={(value: "absolute" | "relative") =>
                      setDisplayMode(value)
                    }
                  >
                    <SelectTrigger id="display-select" className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="absolute">
                        Absolute (Counts)
                      </SelectItem>
                      <SelectItem value="relative">Relative (%)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1.5">
                    Absolute shows counts, relative shows percentages of draws
                  </p>
                </div>
              </div>

              <Button onClick={() => setActiveTab("heatmap")} className="mt-6">
                Apply Settings
              </Button>
            </TabsContent>
          </Tabs>

          {/* Disclaimer */}
          <div className="mt-8 p-4 bg-muted rounded-lg text-sm">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5 text-amber-500" />
              <div>
                <p className="font-medium">Important Disclaimer:</p>
                <p className="text-muted-foreground">
                  This visualization helps identify patterns in number frequency
                  over time. However, past patterns do not predict future
                  outcomes as lottery draws are random events. This tool is
                  meant for informational and entertainment purposes only.
                </p>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="border-t pt-6 flex flex-wrap justify-between text-sm text-muted-foreground">
          <div>Data source: Lottery historical records</div>
          <div>
            {stats.totalDraws} draws analyzed | {timeSegments.length} time
            segments
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default FrequencyDistributionVisualizer;
