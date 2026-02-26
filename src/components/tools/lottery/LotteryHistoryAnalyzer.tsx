import React, { useState, useEffect } from "react";
import {
  BarChart3,
  Calendar,
  Download,
  Flame,
  Snowflake,
  Clock,
  InfoIcon,
  AlertTriangle,
} from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";

// Lottery Shared Components
import {
  LotteryBall,
  NumberGrid,
  FrequencyChart,
  PatternChart,
  DrawHistoryChart,
} from "./shared";

// Lottery Types and Utils
import {
  LotteryConfig,
  LotteryDraw,
  NumberFrequency,
} from "./shared/LotteryTypes";

import {
  LOTTERY_CONFIGS,
  getLotteryConfigList,
} from "./shared/LotteryConfigurations";

import { findNumberPatterns } from "./shared/LotteryStatistics";

// Demo Data
import {
  getLotteryDemoData,
  getLotteryDemoDataSync,
  calculateFrequencyFromDraws,
} from "./shared/LotteryDemoData";

const LotteryHistoryAnalyzer: React.FC = () => {
  // State variables
  const [selectedConfig, setSelectedConfig] = useState<string>("powerball");
  const [draws, setDraws] = useState<LotteryDraw[]>([]);
  const [filteredDraws, setFilteredDraws] = useState<LotteryDraw[]>([]);
  const [frequencyData, setFrequencyData] = useState<NumberFrequency[]>([]);
  const [bonusFrequencyData, setBonusFrequencyData] = useState<
    NumberFrequency[]
  >([]);
  const [patterns, setPatterns] = useState<Record<string, number>>({});
  const [activeTab, setActiveTab] = useState("frequency");
  const [dateRange, setDateRange] = useState<string>("all");
  const [sumHistory, setSumHistory] = useState<
    Array<{ date: Date; sum: number }>
  >([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dataSource, setDataSource] = useState<"real" | "demo">("demo");
  const [error, setError] = useState<string | null>(null);

  // Load data when configuration changes
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Get selected config key first
        if (!selectedConfig) {
          setError("Please select a lottery configuration");
          setIsLoading(false);
          return;
        }

        // Make sure the configuration exists
        const config = LOTTERY_CONFIGS[selectedConfig];
        if (!config) {
          setError(`Invalid lottery configuration: ${selectedConfig}`);
          setIsLoading(false);
          return;
        }

        // Start with demo data for immediate display (synchronous version)
        const initialData = getLotteryDemoDataSync(selectedConfig);
        setDraws(initialData);

        // Calculate frequency with initial data
        if (initialData.length > 0) {
          updateFrequencyData(initialData, config);
        }

        // Try to fetch real data (async version)
        try {
          const realData = await getLotteryDemoData(selectedConfig);
          if (realData && realData.length > 0) {
            setDraws(realData);
            updateFrequencyData(realData, config);
            setDataSource("real");
          } else {
            setDataSource("demo");
          }
        } catch (fetchError) {
          console.error("Error fetching lottery data:", fetchError);
          setDataSource("demo");
        }
      } catch (error) {
        console.error("Error loading lottery data:", error);
        setError("Failed to load lottery data. Please try again later.");
        setDataSource("demo");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedConfig]);

  // Filter draws by date range
  useEffect(() => {
    if (draws.length === 0) return;

    // Calculate filtered draws based on date range
    let filtered: LotteryDraw[];

    if (dateRange === "all") {
      // Use all draws
      filtered = [...draws];
    } else {
      // Parse the dateRange value
      const now = new Date();
      let cutoffDate = new Date();

      if (dateRange === "1y") {
        cutoffDate = new Date(
          now.getFullYear() - 1,
          now.getMonth(),
          now.getDate()
        );
      } else if (dateRange === "6m") {
        cutoffDate = new Date(
          now.getFullYear(),
          now.getMonth() - 6,
          now.getDate()
        );
      } else if (dateRange === "3m") {
        cutoffDate = new Date(
          now.getFullYear(),
          now.getMonth() - 3,
          now.getDate()
        );
      } else if (dateRange === "1m") {
        cutoffDate = new Date(
          now.getFullYear(),
          now.getMonth() - 1,
          now.getDate()
        );
      } else {
        // Try to parse as a number of days for backward compatibility
        try {
          const days = parseInt(dateRange);
          if (!isNaN(days)) {
            cutoffDate.setDate(cutoffDate.getDate() - days);
          }
        } catch (e) {
          console.error("Invalid date range", e);
        }
      }

      filtered = draws.filter((draw) => draw.date >= cutoffDate);
    }

    setFilteredDraws(filtered);

    // Calculate sum history
    const sumData = filtered.map((draw) => ({
      date: draw.date,
      sum: draw.mainNumbers.reduce((acc, n) => acc + n, 0),
    }));
    setSumHistory(sumData);
  }, [draws, dateRange]);

  // Helper function to calculate frequency data
  const updateFrequencyData = (
    drawsData: LotteryDraw[],
    config: LotteryConfig
  ) => {
    // Double-check that we have a valid config with mainNumbers
    if (!config || !config.mainNumbers) {
      console.error(
        "Invalid configuration - missing main numbers configuration",
        config
      );
      return;
    }

    // Calculate main number frequency
    const mainFreq = calculateFrequencyFromDraws(
      drawsData,
      config.mainNumbers.min,
      config.mainNumbers.max,
      false
    );
    setFrequencyData(mainFreq);

    // Calculate bonus number frequency if applicable
    if (config.bonusNumbers) {
      const bonusFreq = calculateFrequencyFromDraws(
        drawsData,
        config.bonusNumbers.min,
        config.bonusNumbers.max,
        true
      );
      setBonusFrequencyData(bonusFreq);
    } else {
      setBonusFrequencyData([]);
    }

    // Calculate patterns - add config param
    const patternData = findNumberPatterns(drawsData, config);
    setPatterns(patternData);
  };

  const handleConfigChange = (value: string) => {
    setSelectedConfig(value);
  };

  const handleDateRangeChange = (value: string) => {
    setDateRange(value);
  };

  const getHotNumbers = () => {
    return frequencyData
      .filter((item) => item.isHot)
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10);
  };

  const getColdNumbers = () => {
    return frequencyData
      .filter((item) => item.isCold)
      .sort((a, b) => a.frequency - b.frequency)
      .slice(0, 10);
  };

  const getOverdueNumbers = () => {
    return frequencyData
      .filter((item) => item.isOverdue)
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10);
  };

  const exportData = () => {
    // Create a CSV string
    const headers = ["Date", "Main Numbers", "Bonus Numbers", "Sum"];
    const rows = filteredDraws.map((draw) => [
      draw.date.toISOString().split("T")[0],
      draw.mainNumbers.join(" "),
      draw.bonusNumbers.join(" "),
      draw.mainNumbers.reduce((a, b) => a + b, 0),
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");

    // Create a blob and download
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedConfig}-history.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4">
      {/* Header with title and description */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Lottery History Analyzer</h1>
        <p className="text-muted-foreground mt-2">
          Analyze historical lottery draws to discover patterns, frequency
          trends, and statistical insights
        </p>
      </div>

      {/* Configuration Card */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <Card className="md:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Lottery Configuration
            </CardTitle>
            <CardDescription>
              Select a lottery game and time period to analyze
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="config" className="mb-2 block">
                  Lottery Game
                </Label>
                <Select
                  value={selectedConfig}
                  onValueChange={handleConfigChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select lottery" />
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
                <Label htmlFor="dateRange" className="mb-2 block">
                  Time Period
                </Label>
                <Select value={dateRange} onValueChange={handleDateRangeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="1y">Last Year</SelectItem>
                    <SelectItem value="6m">Last 6 Months</SelectItem>
                    <SelectItem value="3m">Last 3 Months</SelectItem>
                    <SelectItem value="1m">Last Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between pt-0">
            {dataSource === "real" ? (
              <Badge variant="outline" className="bg-green-100">
                Using real historical data
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-amber-100">
                Using demo data
              </Badge>
            )}

            <Button
              variant="outline"
              onClick={exportData}
              disabled={isLoading || filteredDraws.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </CardFooter>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center">
              <InfoIcon className="h-5 w-5 mr-2" />
              Analysis Summary
            </CardTitle>
            <CardDescription>Overview of your selected dataset</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Draws:</span>
                  <span className="font-medium">{filteredDraws.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date Range:</span>
                  <span className="font-medium">
                    {filteredDraws.length > 0 ? (
                      <>
                        {new Date(
                          Math.min(
                            ...filteredDraws.map((d) => d.date.getTime())
                          )
                        ).toLocaleDateString()}
                        {" to "}
                        {new Date(
                          Math.max(
                            ...filteredDraws.map((d) => d.date.getTime())
                          )
                        ).toLocaleDateString()}
                      </>
                    ) : (
                      "No data"
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Lottery Game:</span>
                  <span className="font-medium">
                    {LOTTERY_CONFIGS[selectedConfig]?.name || selectedConfig}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
          {error && (
            <CardFooter className="pt-0">
              <div className="text-red-500 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2" />
                {error}
              </div>
            </CardFooter>
          )}
        </Card>
      </div>

      {/* Main Analysis Content */}
      {isLoading ? (
        <div className="flex justify-center items-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : filteredDraws.length === 0 ? (
        <div className="bg-muted p-8 rounded-lg text-center">
          <div className="text-3xl mb-4">📊</div>
          <h3 className="text-xl font-semibold mb-2">No Data Available</h3>
          <p className="text-muted-foreground">
            No lottery draws found for the selected configuration and time
            period. Try selecting a different lottery game or extending the time
            period.
          </p>
        </div>
      ) : (
        <Tabs
          defaultValue="frequency"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-1 md:grid-cols-3 mb-4">
            <TabsTrigger value="frequency" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" /> Number Frequency
            </TabsTrigger>
            <TabsTrigger value="patterns" className="flex items-center gap-2">
              <Flame className="h-4 w-4" /> Pattern Analysis
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" /> Draw History
            </TabsTrigger>
          </TabsList>

          {/* Number Frequency Tab */}
          <TabsContent value="frequency" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Number Frequency Analysis</CardTitle>
                <CardDescription>
                  See how often each number has been drawn
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Hot Numbers */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center">
                      <Flame className="h-5 w-5 mr-2 text-red-500" /> Hot
                      Numbers
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      These numbers appear more frequently than others
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {getHotNumbers().map((item) => (
                        <LotteryBall
                          key={item.number}
                          number={item.number}
                          type="hot"
                          tooltip={`Drawn ${item.frequency} times`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Cold Numbers */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center">
                      <Snowflake className="h-5 w-5 mr-2 text-blue-500" /> Cold
                      Numbers
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      These numbers appear less frequently than others
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {getColdNumbers().map((item) => (
                        <LotteryBall
                          key={item.number}
                          number={item.number}
                          type="cold"
                          tooltip={`Drawn ${item.frequency} times`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Overdue Numbers */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center">
                      <Clock className="h-5 w-5 mr-2 text-amber-500" /> Overdue
                      Numbers
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      These numbers haven't been drawn in a while
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {getOverdueNumbers().map((item) => (
                        <LotteryBall
                          key={item.number}
                          number={item.number}
                          type="overdue"
                          tooltip={`Drawn ${item.frequency} times`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Complete Frequency Chart
                  </h3>
                  <div className="h-[300px]">
                    <FrequencyChart data={frequencyData} />
                  </div>
                </div>

                {bonusFrequencyData.length > 0 && (
                  <>
                    <Separator className="my-6" />
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold mb-4">
                        Bonus Number Frequency
                      </h3>
                      <div className="h-[300px]">
                        <FrequencyChart data={bonusFrequencyData} />
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Number Grid</CardTitle>
                <CardDescription>
                  Visual representation of all possible numbers and their
                  frequency
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4">Main Numbers</h3>
                  <NumberGrid
                    data={frequencyData}
                    rows={5}
                    columns={Math.ceil(frequencyData.length / 5)}
                  />
                </div>

                {bonusFrequencyData.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-4">
                      Bonus Numbers
                    </h3>
                    <NumberGrid
                      data={bonusFrequencyData}
                      rows={Math.min(
                        5,
                        Math.ceil(bonusFrequencyData.length / 5)
                      )}
                      columns={Math.ceil(bonusFrequencyData.length / 5)}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pattern Analysis Tab */}
          <TabsContent value="patterns" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pattern Analysis</CardTitle>
                <CardDescription>
                  Discover recurring patterns in lottery draws
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] mb-6">
                  <PatternChart data={patterns} />
                </div>

                <Accordion type="single" collapsible className="mt-6">
                  {Object.entries(patterns).map(([key, value]) => (
                    <AccordionItem key={key} value={key}>
                      <AccordionTrigger className="text-left py-4">
                        <div className="flex items-center">
                          <span className="font-medium">
                            {getPatternDescription(key, value)}
                          </span>
                          <Badge className="ml-2" variant="secondary">
                            {value} draws
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4">
                        <div className="text-muted-foreground">
                          {key === "consecutive" && (
                            <p>
                              Consecutive numbers appeared in{" "}
                              {Math.round((value / filteredDraws.length) * 100)}
                              % of draws. Examples include combinations like
                              5-6, 23-24, or 34-35-36.
                            </p>
                          )}
                          {key === "evenOddBalance" && (
                            <p>
                              {Math.round((value / filteredDraws.length) * 100)}
                              % of draws have a balanced mix of even and odd
                              numbers (approximately equal numbers of each).
                            </p>
                          )}
                          {key === "highLowBalance" && (
                            <p>
                              {Math.round((value / filteredDraws.length) * 100)}
                              % of draws have a balanced distribution between
                              high and low numbers in the range.
                            </p>
                          )}
                          {key === "sumInRange" && (
                            <p>
                              {Math.round((value / filteredDraws.length) * 100)}
                              % of draws have a sum of all numbers that falls
                              within the expected statistical range.
                            </p>
                          )}
                          {key === "repeatedPairs" && (
                            <p>
                              Pairs of numbers that appeared together in
                              previous draws were found in{" "}
                              {Math.round((value / filteredDraws.length) * 100)}
                              % of all draws.
                            </p>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Draw History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Sum Trend Over Time</CardTitle>
                <CardDescription>
                  The sum of all main numbers in each draw over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <DrawHistoryChart data={sumHistory} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Draws</CardTitle>
                <CardDescription>
                  The most recent lottery results
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Main Numbers</TableHead>
                        {filteredDraws.length > 0 &&
                          filteredDraws[0].bonusNumbers.length > 0 && (
                            <TableHead>Bonus Numbers</TableHead>
                          )}
                        <TableHead>Sum</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDraws.slice(0, 10).map((draw) => (
                        <TableRow key={draw.id}>
                          <TableCell>
                            {draw.date.toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {draw.mainNumbers.map((num) => (
                                <LotteryBall
                                  key={`${draw.id}-main-${num}`}
                                  number={num}
                                  type="default"
                                  size="sm"
                                />
                              ))}
                            </div>
                          </TableCell>
                          {draw.bonusNumbers.length > 0 && (
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {draw.bonusNumbers.map((num) => (
                                  <LotteryBall
                                    key={`${draw.id}-bonus-${num}`}
                                    number={num}
                                    type="bonus"
                                    size="sm"
                                  />
                                ))}
                              </div>
                            </TableCell>
                          )}
                          <TableCell>
                            {draw.mainNumbers.reduce((a, b) => a + b, 0)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {filteredDraws.length > 10 && (
                  <div className="text-center p-4 text-muted-foreground">
                    Showing 10 of {filteredDraws.length} draws. Export data to
                    see all results.
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button variant="outline" onClick={exportData}>
                  <Download className="h-4 w-4 mr-2" />
                  Export All Data
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Disclaimer */}
      <div className="mt-8 p-4 bg-muted rounded-lg text-sm text-muted-foreground">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium mb-1">Disclaimer:</p>
            <p>
              Past lottery results are not predictive of future draws. The
              analysis provided is for educational and entertainment purposes
              only. Lottery games are games of chance with random outcomes. The
              data displayed is{" "}
              {dataSource === "real"
                ? "based on historical draws"
                : "simulated for demonstration purposes"}
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const getPatternDescription = (key: string, _value: number): string => {
  switch (key) {
    case "consecutive":
      return "Consecutive Numbers";
    case "evenOddBalance":
      return "Even/Odd Balance";
    case "highLowBalance":
      return "High/Low Balance";
    case "sumInRange":
      return "Sum Within Expected Range";
    case "repeatedPairs":
      return "Repeated Number Pairs";
    default:
      return key;
  }
};

export default LotteryHistoryAnalyzer;
