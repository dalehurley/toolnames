import React, { useMemo } from "react";
import { format, startOfWeek, endOfWeek, isSameDay, subDays } from "date-fns";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { calculateDurationInMinutes } from "@/utils/timeUtils";
import { TimeBlock, Category } from "@/contexts/TimeBlockingContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChartIcon, BarChart3, TrendingUp } from "lucide-react";

interface AnalyticsDashboardProps {
  blocks: TimeBlock[];
  categories: Category[];
  selectedDate: Date;
  currentView: "day" | "week" | "month";
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  blocks,
  categories,
  selectedDate,
  currentView,
}) => {
  // Filter blocks based on the current view
  const filteredBlocks = useMemo(() => {
    if (currentView === "day") {
      return blocks.filter((block) => isSameDay(block.startTime, selectedDate));
    } else if (currentView === "week") {
      const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
      return blocks.filter(
        (block) => block.startTime >= weekStart && block.startTime <= weekEnd
      );
    } else {
      // For the month view, we could similarly filter by month
      return blocks;
    }
  }, [blocks, selectedDate, currentView]);

  // Calculate time by category
  const timeByCategory = useMemo(() => {
    const result: Record<string, number> = {};

    filteredBlocks.forEach((block) => {
      const categoryId = block.categoryId;
      const duration = calculateDurationInMinutes(
        block.startTime,
        block.endTime
      );

      if (!result[categoryId]) {
        result[categoryId] = 0;
      }
      result[categoryId] += duration;
    });

    // Convert to format for pie chart
    return categories
      .filter((category) => result[category.id])
      .map((category) => ({
        id: category.id,
        name: category.name,
        value: result[category.id],
        color: category.color,
      }));
  }, [filteredBlocks, categories]);

  // Calculate time by day for the past week
  const timeByDay = useMemo(() => {
    const today = new Date();
    const pastWeek = Array.from({ length: 7 }, (_, i) => subDays(today, 6 - i));

    const result = pastWeek.map((day) => {
      const dayBlocks = blocks.filter((block) =>
        isSameDay(block.startTime, day)
      );

      const dayData: Record<string, number> = { date: day.getTime() };

      // Initialize with 0 for all categories
      categories.forEach((category) => {
        dayData[category.id] = 0;
      });

      // Sum durations by category
      dayBlocks.forEach((block) => {
        const categoryId = block.categoryId;
        const duration = calculateDurationInMinutes(
          block.startTime,
          block.endTime
        );
        dayData[categoryId] += duration;
      });

      return dayData;
    });

    return result;
  }, [blocks, categories]);

  // Calculate completed vs planned tasks
  const completionStats = useMemo(() => {
    const completed = filteredBlocks.filter(
      (block) => block.isCompleted
    ).length;
    const total = filteredBlocks.length;
    const completionRate = total ? (completed / total) * 100 : 0;

    return { completed, total, completionRate };
  }, [filteredBlocks]);

  // Calculate total time by hour of day
  const timeByHour = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return hours.map((hour) => {
      const hourlyTotal = blocks.reduce((total, block) => {
        if (block.startTime.getHours() === hour) {
          return (
            total + calculateDurationInMinutes(block.startTime, block.endTime)
          );
        }
        return total;
      }, 0);

      return {
        hour,
        hour12:
          hour === 0
            ? "12 AM"
            : hour === 12
            ? "12 PM"
            : hour < 12
            ? `${hour} AM`
            : `${hour - 12} PM`,
        value: hourlyTotal,
      };
    });
  }, [blocks]);

  // Format minutes for display
  const formatMinutes = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours === 0) {
      return `${mins}m`;
    } else if (mins === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${mins}m`;
    }
  };

  // Customize tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-2 border border-gray-200 dark:border-gray-700 shadow-md rounded-md">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`tooltip-item-${index}`} style={{ color: entry.color }}>
              {entry.name}: {formatMinutes(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview" className="flex items-center">
            <PieChartIcon className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center">
            <TrendingUp className="w-4 h-4 mr-2" />
            Trends
          </TabsTrigger>
          <TabsTrigger value="breakdown" className="flex items-center">
            <BarChart3 className="w-4 h-4 mr-2" />
            Breakdown
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Total Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatMinutes(
                    filteredBlocks.reduce(
                      (total, block) =>
                        total +
                        calculateDurationInMinutes(
                          block.startTime,
                          block.endTime
                        ),
                      0
                    )
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {currentView === "day"
                    ? format(selectedDate, "EEEE, MMM d")
                    : currentView === "week"
                    ? `Week of ${format(selectedDate, "MMM d")}`
                    : `Month of ${format(selectedDate, "MMMM yyyy")}`}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Tasks Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {completionStats.completed} / {completionStats.total}
                </div>
                <div className="text-xs text-muted-foreground">
                  {completionStats.completionRate.toFixed(0)}% completion rate
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Top Category</CardTitle>
              </CardHeader>
              <CardContent>
                {timeByCategory.length > 0 && (
                  <>
                    <div className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: timeByCategory[0].color }}
                      />
                      <div className="text-lg font-bold">
                        {timeByCategory[0].name}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatMinutes(timeByCategory[0].value)} tracked
                    </div>
                  </>
                )}
                {timeByCategory.length === 0 && (
                  <div className="text-sm text-muted-foreground">
                    No data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Time by Category</CardTitle>
                <CardDescription>
                  Distribution of time across different categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={timeByCategory}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                        labelLine={{ stroke: "#888888", strokeWidth: 1 }}
                      >
                        {timeByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => formatMinutes(value)}
                        content={<CustomTooltip />}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Daily Time Allocation</CardTitle>
                <CardDescription>
                  Time spent on each category over the past week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={timeByDay}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(timestamp) =>
                          format(new Date(timestamp), "EEE")
                        }
                      />
                      <YAxis
                        tickFormatter={(minutes) =>
                          `${Math.floor(minutes / 60)}h`
                        }
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      {categories.map((category) => (
                        <Bar
                          key={category.id}
                          dataKey={category.id}
                          name={category.name}
                          stackId="a"
                          fill={category.color}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Productivity by Hour</CardTitle>
              <CardDescription>
                When you schedule most of your tasks during the day
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timeByHour}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour12" />
                    <YAxis
                      tickFormatter={(minutes) =>
                        `${Math.floor(minutes / 60)}h`
                      }
                    />
                    <Tooltip
                      formatter={(value: number) => formatMinutes(value)}
                      labelFormatter={(hour) => `Hour: ${hour}`}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      name="Time Spent"
                      stroke="#8884d8"
                      fill="url(#colorValue)"
                    />
                    <defs>
                      <linearGradient
                        id="colorValue"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#8884d8"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#8884d8"
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="breakdown" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Time Breakdown by Day</CardTitle>
              <CardDescription>
                Detailed view of your time allocation for each day
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={timeByDay} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      type="number"
                      tickFormatter={(minutes) =>
                        `${Math.floor(minutes / 60)}h`
                      }
                    />
                    <YAxis
                      type="category"
                      dataKey="date"
                      tickFormatter={(timestamp) =>
                        format(new Date(timestamp), "EEE, MMM d")
                      }
                      width={100}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    {categories.map((category) => (
                      <Bar
                        key={category.id}
                        dataKey={category.id}
                        name={category.name}
                        stackId="a"
                        fill={category.color}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;
