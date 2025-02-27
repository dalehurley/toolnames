import React, { useState, useEffect } from "react";
import { CSVData, Column, DataValue } from "@/types/csv-explorer";
import { Bar, Line, Pie, Scatter } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  ChartData,
  ChartOptions,
} from "chart.js";
import "chart.js/auto";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

interface DataAnalyticsProps {
  data: CSVData | null;
  columns: Column[];
}

type ChartType = "bar" | "line" | "pie" | "scatter";

interface ChartConfig {
  type: ChartType;
  xAxis: string;
  yAxis: string;
  aggregation?: "count" | "sum" | "average" | "min" | "max";
  filter?: string;
}

export const DataAnalytics: React.FC<DataAnalyticsProps> = ({
  data,
  columns,
}) => {
  const [chartConfig, setChartConfig] = useState<ChartConfig>({
    type: "bar",
    xAxis: "",
    yAxis: "",
    aggregation: "count",
  });

  const [chartData, setChartData] = useState<ChartData<any> | null>(null);
  const [suggestedCharts, setSuggestedCharts] = useState<ChartConfig[]>([]);

  // Effect to set initial x and y axis based on columns
  useEffect(() => {
    if (columns.length > 0) {
      const categoricalColumns = columns.filter(
        (col) => col.type === "string" || col.type === "boolean"
      );
      const numericColumns = columns.filter((col) => col.type === "number");
      const dateColumns = columns.filter((col) => col.type === "date");

      // Default to first categorical column for x-axis and first numeric for y-axis
      const defaultConfig: ChartConfig = {
        type: "bar",
        xAxis:
          categoricalColumns.length > 0
            ? categoricalColumns[0].id
            : columns[0].id,
        yAxis:
          numericColumns.length > 0
            ? numericColumns[0].id
            : columns.length > 1
            ? columns[1].id
            : columns[0].id,
        aggregation: "count",
      };

      setChartConfig(defaultConfig);

      // Generate suggested chart configurations
      const suggestions: ChartConfig[] = [];

      // If we have date and numeric columns, suggest a line chart
      if (dateColumns.length > 0 && numericColumns.length > 0) {
        suggestions.push({
          type: "line",
          xAxis: dateColumns[0].id,
          yAxis: numericColumns[0].id,
        });
      }

      // If we have categorical and numeric columns, suggest a bar chart
      if (categoricalColumns.length > 0 && numericColumns.length > 0) {
        suggestions.push({
          type: "bar",
          xAxis: categoricalColumns[0].id,
          yAxis: numericColumns[0].id,
          aggregation: "sum",
        });
      }

      // If we have a categorical column, suggest a pie chart for distribution
      if (categoricalColumns.length > 0) {
        suggestions.push({
          type: "pie",
          xAxis: categoricalColumns[0].id,
          yAxis: "count",
        });
      }

      // If we have two numeric columns, suggest a scatter plot
      if (numericColumns.length >= 2) {
        suggestions.push({
          type: "scatter",
          xAxis: numericColumns[0].id,
          yAxis: numericColumns[1].id,
        });
      }

      setSuggestedCharts(suggestions);
    }
  }, [columns]);

  // Effect to generate chart data whenever the configuration changes
  useEffect(() => {
    if (
      !data ||
      !data.data.length ||
      !chartConfig.xAxis ||
      !chartConfig.yAxis
    ) {
      setChartData(null);
      return;
    }

    generateChartData();
  }, [data, chartConfig]);

  const generateChartData = () => {
    if (!data || !data.data.length) return;

    const { type, xAxis, yAxis, aggregation } = chartConfig;

    // Get column types
    const xColumn = columns.find((col) => col.id === xAxis);
    const yColumn =
      yAxis !== "count" ? columns.find((col) => col.id === yAxis) : null;

    if (!xColumn) return;

    // Group data by x-axis values
    const groupedData: Record<string, DataValue[]> = {};

    data.data.forEach((row) => {
      const xValue = row[xAxis];
      if (xValue === null || xValue === undefined) return;

      const xKey = String(xValue);

      if (!groupedData[xKey]) {
        groupedData[xKey] = [];
      }

      if (yAxis === "count") {
        groupedData[xKey].push(1); // Just counting
      } else {
        const yValue = row[yAxis];
        if (yValue !== null && yValue !== undefined) {
          groupedData[xKey].push(yValue);
        }
      }
    });

    // Calculate aggregated values
    const labels = Object.keys(groupedData);
    let values: number[] = [];

    if (aggregation === "count" || !aggregation) {
      values = labels.map((label) => groupedData[label].length);
    } else {
      values = labels.map((label) => {
        const groupValues = groupedData[label]
          .map((val) => (typeof val === "number" ? val : Number(val)))
          .filter((val) => !isNaN(val));

        if (groupValues.length === 0) return 0;

        switch (aggregation) {
          case "sum":
            return groupValues.reduce((sum, val) => sum + val, 0);
          case "average":
            return (
              groupValues.reduce((sum, val) => sum + val, 0) /
              groupValues.length
            );
          case "min":
            return Math.min(...groupValues);
          case "max":
            return Math.max(...groupValues);
          default:
            return groupValues.length;
        }
      });
    }

    // Format data for Chart.js
    const chartJsData = {
      labels,
      datasets: [
        {
          label:
            yAxis === "count"
              ? "Count"
              : `${aggregation || "Value"} of ${yColumn?.name || yAxis}`,
          data: values,
          backgroundColor: "rgba(75, 192, 192, 0.5)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
      ],
    };

    // For scatter plot, we need a different data format
    if (type === "scatter" && yAxis !== "count") {
      const scatterData = data.data
        .filter((row) => row[xAxis] !== null && row[yAxis] !== null)
        .map((row) => ({
          x: typeof row[xAxis] === "number" ? row[xAxis] : Number(row[xAxis]),
          y: typeof row[yAxis] === "number" ? row[yAxis] : Number(row[yAxis]),
        }))
        .filter((point) => !isNaN(point.x) && !isNaN(point.y));

      // Override the dataset for scatter charts
      chartJsData.datasets[0].data = scatterData as unknown as number[];
    }

    setChartData(chartJsData);
  };

  const renderChart = () => {
    if (!chartData) return null;

    const options: ChartOptions<any> = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top" as const,
        },
        title: {
          display: true,
          text: `${
            chartConfig.type.charAt(0).toUpperCase() + chartConfig.type.slice(1)
          } Chart: ${chartConfig.xAxis} vs ${chartConfig.yAxis}`,
        },
      },
    };

    switch (chartConfig.type) {
      case "bar":
        return <Bar data={chartData} options={options} />;
      case "line":
        return <Line data={chartData} options={options} />;
      case "pie":
        return <Pie data={chartData} options={options} />;
      case "scatter":
        return <Scatter data={chartData} options={options} />;
      default:
        return null;
    }
  };

  if (!data || !data.data.length) {
    return (
      <div className="p-8 text-center text-gray-500">
        No data available for analysis
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border rounded-md p-4 bg-white">
        <h3 className="text-lg font-medium mb-4">Chart Configuration</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chart Type
            </label>
            <select
              className="w-full border rounded p-2"
              value={chartConfig.type}
              onChange={(e) =>
                setChartConfig({
                  ...chartConfig,
                  type: e.target.value as ChartType,
                })
              }
            >
              <option value="bar">Bar Chart</option>
              <option value="line">Line Chart</option>
              <option value="pie">Pie Chart</option>
              <option value="scatter">Scatter Plot</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              X-Axis
            </label>
            <select
              className="w-full border rounded p-2"
              value={chartConfig.xAxis}
              onChange={(e) =>
                setChartConfig({ ...chartConfig, xAxis: e.target.value })
              }
            >
              <option value="">Select Column</option>
              {columns.map((column) => (
                <option key={column.id} value={column.id}>
                  {column.name} ({column.type})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Y-Axis
            </label>
            <select
              className="w-full border rounded p-2"
              value={chartConfig.yAxis}
              onChange={(e) =>
                setChartConfig({ ...chartConfig, yAxis: e.target.value })
              }
            >
              <option value="count">Count (Frequency)</option>
              {columns
                .filter((col) => col.type === "number")
                .map((column) => (
                  <option key={column.id} value={column.id}>
                    {column.name}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Aggregation
            </label>
            <select
              className="w-full border rounded p-2"
              value={chartConfig.aggregation}
              onChange={(e) =>
                setChartConfig({
                  ...chartConfig,
                  aggregation: e.target.value as
                    | "count"
                    | "sum"
                    | "average"
                    | "min"
                    | "max",
                })
              }
              disabled={
                chartConfig.yAxis === "count" || chartConfig.type === "scatter"
              }
            >
              <option value="count">Count</option>
              <option value="sum">Sum</option>
              <option value="average">Average</option>
              <option value="min">Minimum</option>
              <option value="max">Maximum</option>
            </select>
          </div>
        </div>
      </div>

      {suggestedCharts.length > 0 && (
        <div className="border rounded-md p-4 bg-white">
          <h3 className="text-lg font-medium mb-2">Suggested Charts</h3>
          <p className="text-sm text-gray-600 mb-3">
            Based on your data, these chart types might provide useful insights:
          </p>

          <div className="flex flex-wrap gap-2">
            {suggestedCharts.map((config, index) => (
              <button
                key={index}
                className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm rounded border border-blue-200"
                onClick={() => setChartConfig(config)}
              >
                {config.type.charAt(0).toUpperCase() + config.type.slice(1)}:{" "}
                {config.xAxis} vs{" "}
                {config.yAxis === "count" ? "Count" : config.yAxis}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="border rounded-md p-4 bg-white">
        <h3 className="text-lg font-medium mb-4">Chart Visualization</h3>

        <div className="h-96">
          {renderChart() || (
            <div className="h-full flex items-center justify-center text-gray-500">
              Select chart configuration options to generate a visualization
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
