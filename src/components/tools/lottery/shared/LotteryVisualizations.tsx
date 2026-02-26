import React from "react";
import { NumberFrequency } from "./LotteryTypes";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import { formatLargeNumber } from "./LotteryUtils";

interface LotteryBallProps {
  number: number;
  size?: "sm" | "md" | "lg";
  type?: "main" | "bonus";
  isHot?: boolean;
  isCold?: boolean;
  isOverdue?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  animationDelay?: number;
  is3D?: boolean;
}

/**
 * Lottery ball component with CSS animations
 */
export const LotteryBall: React.FC<LotteryBallProps> = ({
  number,
  size = "md",
  type = "main",
  isHot = false,
  isCold = false,
  isOverdue = false,
  isSelected = false,
  onClick,
  animationDelay = 0,
}) => {
  // Determine size class
  const sizeClass = {
    sm: "w-8 h-8 text-sm",
    md: "w-12 h-12 text-base",
    lg: "w-16 h-16 text-xl",
  }[size];

  // Determine color class based on type and status
  let colorClass = "";

  if (isSelected) {
    colorClass = "bg-primary text-primary-foreground";
  } else if (type === "main") {
    if (isHot) {
      colorClass = "bg-red-100 text-red-800 border-red-300";
    } else if (isCold) {
      colorClass = "bg-blue-100 text-blue-800 border-blue-300";
    } else if (isOverdue) {
      colorClass = "bg-amber-100 text-amber-800 border-amber-300";
    } else {
      colorClass = "bg-muted text-muted-foreground border-border";
    }
  } else {
    // Bonus ball
    colorClass = "bg-amber-100 text-amber-800 border-amber-300";
  }

  return (
    <div
      className={`${sizeClass} ${colorClass} rounded-full flex items-center justify-center font-bold border shadow-sm transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 ${
        onClick ? "cursor-pointer hover:opacity-80 hover:scale-105" : ""
      }`}
      style={{
        animationDelay: `${animationDelay}s`,
        animationFillMode: "both",
      }}
      onClick={onClick}
    >
      {number}
    </div>
  );
};

interface OddsVisualizationProps {
  odds: number;
  height?: number;
}

/**
 * Odds visualization component
 */
export const OddsVisualization: React.FC<OddsVisualizationProps> = ({
  odds,
  height = 300,
}) => {
  const chartData = [
    { name: "Win", value: 1, color: "#10b981" },
    { name: "Lose", value: odds - 1, color: "#ef4444" },
  ];

  return (
    <div style={{ height: `${height}px` }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            innerRadius={40}
            fill="#8884d8"
            dataKey="value"
            label={(entry) => {
              // Only show "Win" label, "Lose" would be too small
              if (entry.name === "Win") return entry.name;
              return "";
            }}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number, name: string) => {
              if (name === "Win") return ["1 ticket", "Win"];
              return [formatLargeNumber(value), "Lose"];
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
      <p className="text-xs text-center mt-2 text-muted-foreground">
        Note: This visualization is not to scale due to the extreme odds. The
        win segment is greatly exaggerated for visibility.
      </p>
    </div>
  );
};

interface FrequencyChartProps {
  data: NumberFrequency[];
  height?: number;
  showLabels?: boolean;
}

/**
 * Number frequency chart component
 */
export const FrequencyChart: React.FC<FrequencyChartProps> = ({
  data,
  height = 300,
  showLabels = true,
}) => {
  return (
    <div style={{ height: `${height}px` }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="number"
            interval={Math.ceil(data.length / 20)}
            fontSize={12}
          />
          <YAxis fontSize={12} />
          <Tooltip
            formatter={(value: number) => [`${value} times`, "Frequency"]}
            labelFormatter={(label) => `Number ${label}`}
          />
          {showLabels && <Legend />}
          <Bar
            dataKey="frequency"
            name="Frequency"
            fill="#8884d8"
            radius={[4, 4, 0, 0]}
          >
            {data.map((entry, index) => {
              let color = "#8884d8"; // Default
              if (entry.isHot) color = "#ef4444"; // Hot (red)
              if (entry.isCold) color = "#3b82f6"; // Cold (blue)
              if (entry.isOverdue) color = "#f59e0b"; // Overdue (amber)

              return <Cell key={`cell-${index}`} fill={color} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

interface PatternChartProps {
  data: Record<string, number>;
  height?: number;
}

/**
 * Pattern analysis radar chart
 */
export const PatternChart: React.FC<PatternChartProps> = ({
  data,
  height = 300,
}) => {
  const chartData = Object.entries(data).map(([key, value]) => ({
    pattern: key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase()),
    value,
    fullMark: 100,
  }));

  return (
    <div style={{ height: `${height}px` }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="pattern" />
          <PolarRadiusAxis angle={30} domain={[0, 100]} />
          <Radar
            name="Occurrence %"
            dataKey="value"
            stroke="#8884d8"
            fill="#8884d8"
            fillOpacity={0.6}
          />
          <Tooltip />
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

interface NumberGridProps {
  data: NumberFrequency[];
  rows: number;
  columns: number;
}

/**
 * Interactive number grid component
 */
export const NumberGrid: React.FC<NumberGridProps> = ({
  data,
  rows,
  columns,
}) => {
  // Create a grid of numbers
  const maxNumber = Math.max(...data.map((d) => d.number));
  const gridNumbers: (NumberFrequency | null)[] = [];

  for (let i = 1; i <= rows * columns; i++) {
    const numberData = data.find((d) => d.number === i);
    gridNumbers.push(numberData || null);
  }

  return (
    <div
      className="grid gap-1"
      style={{
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
      }}
    >
      {gridNumbers.map((numberData, index) => {
        const number = index + 1;

        if (number > maxNumber) {
          return <div key={index} className="w-8 h-8" />;
        }

        const isHot = numberData?.isHot || false;
        const isCold = numberData?.isCold || false;
        const isOverdue = numberData?.isOverdue || false;

        let className =
          "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors border ";

        if (isHot) {
          className +=
            "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700";
        } else if (isCold) {
          className +=
            "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700";
        } else if (isOverdue) {
          className +=
            "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700";
        } else {
          className +=
            "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600";
        }

        return (
          <div
            key={index}
            className={className}
            title={`Number ${number}${
              numberData ? ` (${numberData.frequency} times)` : ""
            }`}
          >
            {number}
          </div>
        );
      })}
    </div>
  );
};

interface DrawHistoryChartProps {
  data: Array<{ date: Date; sum: number }>;
  height?: number;
}

/**
 * Draw history chart component
 */
export const DrawHistoryChart: React.FC<DrawHistoryChartProps> = ({
  data,
  height = 300,
}) => {
  const chartData = data.map((item) => ({
    date: item.date.toLocaleDateString(),
    sum: item.sum,
  }));

  return (
    <div style={{ height: `${height}px` }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            interval={Math.ceil(chartData.length / 10)}
            fontSize={12}
          />
          <YAxis fontSize={12} />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="sum"
            name="Sum of Numbers"
            stroke="#8884d8"
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
