import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CarbonResults } from "./carbonUtils";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

interface CarbonVisualizationsProps {
  results: CarbonResults;
}

export const CarbonVisualizations: React.FC<CarbonVisualizationsProps> = ({
  results,
}) => {
  const COLORS = {
    transportation: "#3B82F6", // blue
    energy: "#EAB308", // yellow
    food: "#22C55E", // green
    shopping: "#A855F7", // purple
  };

  // Prepare data for pie chart
  const pieData = Object.entries(results.categoryBreakdown).map(
    ([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value: value / 1000, // Convert to tonnes
      percentage: results.percentages[name as keyof typeof results.percentages],
    }),
  );

  // Prepare data for bar chart comparison
  const comparisonData = [
    {
      name: "You",
      emissions: results.totalEmissions,
      fill: "#22C55E",
    },
    {
      name: "USA Avg",
      emissions: results.comparison.nationalAverage,
      fill: "#94A3B8",
    },
    {
      name: "Global Avg",
      emissions: results.comparison.globalAverage,
      fill: "#64748B",
    },
  ];

  interface TooltipProps {
    active?: boolean;
    payload?: Array<{
      name: string;
      value: number;
      payload: { percentage?: number };
    }>;
  }

  const CustomTooltip = ({ active, payload }: TooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-semibold">{payload[0].name}</p>
          <p className="text-sm">{payload[0].value.toFixed(2)} tonnes CO₂</p>
          {payload[0].payload.percentage && (
            <p className="text-sm text-muted-foreground">
              {payload[0].payload.percentage.toFixed(1)}%
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  interface LabelProps {
    cx: number;
    cy: number;
    midAngle: number;
    innerRadius: number;
    outerRadius: number;
    percentage: number;
  }

  const renderCustomizedLabel = (entry: LabelProps) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percentage } = entry;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        className="text-sm font-semibold"
      >
        {`${percentage.toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="space-y-6">
      {/* Emissions Breakdown Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Emissions Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      COLORS[entry.name.toLowerCase() as keyof typeof COLORS]
                    }
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value) => <span className="text-sm">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Comparison Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Comparison to Averages</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={comparisonData}>
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-gray-200 dark:stroke-gray-700"
              />
              <XAxis
                dataKey="name"
                className="text-xs"
                tick={{ fill: "currentColor" }}
              />
              <YAxis
                label={{
                  value: "Tonnes CO₂/year",
                  angle: -90,
                  position: "insideLeft",
                }}
                className="text-xs"
                tick={{ fill: "currentColor" }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="emissions" radius={[8, 8, 0, 0]}>
                {comparisonData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
