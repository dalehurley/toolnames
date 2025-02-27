import React, { useState, useRef, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  PieController,
  ArcElement,
  DoughnutController,
  RadarController,
  RadialLinearScale,
  ScatterController,
  Title,
  Tooltip,
  Legend,
  ChartType,
  ChartData,
  ChartOptions,
} from "chart.js";
import { toPng } from "html-to-image";
import { Chart } from "react-chartjs-2";
import { saveAs } from "file-saver";
import Papa from "papaparse";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  BarChart3,
  LineChart,
  PieChart,
  Radar,
  LayoutDashboard,
  Download,
  Upload,
  RefreshCw,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  Settings,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  PieController,
  DoughnutController,
  RadarController,
  RadialLinearScale,
  ScatterController,
  Title,
  Tooltip,
  Legend
);

// Define default chart colors
const DEFAULT_COLORS = [
  "#4361ee",
  "#3a0ca3",
  "#7209b7",
  "#f72585",
  "#4cc9f0",
  "#4895ef",
  "#560bad",
  "#f15bb5",
  "#fee440",
  "#00bbf9",
];

// Define chart types with icons
const CHART_TYPES: { [key: string]: { label: string; icon: React.ReactNode } } =
  {
    bar: { label: "Bar Chart", icon: <BarChart3 className="h-4 w-4" /> },
    line: { label: "Line Chart", icon: <LineChart className="h-4 w-4" /> },
    pie: { label: "Pie Chart", icon: <PieChart className="h-4 w-4" /> },
    doughnut: {
      label: "Doughnut Chart",
      icon: <PieChart className="h-4 w-4" />,
    },
    radar: { label: "Radar Chart", icon: <Radar className="h-4 w-4" /> },
    scatter: {
      label: "Scatter Plot",
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
  };

// Interface for dataset
interface Dataset {
  id: string;
  label: string;
  data: number[];
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  fill?: boolean;
  tension?: number;
}

// Interface for chart configuration
interface ChartConfig {
  type: ChartType;
  labels: string[];
  datasets: Dataset[];
  options: ChartOptions<ChartType>;
  title: string;
}

// Default chart configuration
const defaultChartConfig: ChartConfig = {
  type: "bar",
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  datasets: [
    {
      id: "dataset-1",
      label: "Dataset 1",
      data: [65, 59, 80, 81, 56, 55],
      backgroundColor: DEFAULT_COLORS[0],
      borderColor: DEFAULT_COLORS[0],
      borderWidth: 1,
      fill: false,
      tension: 0.1,
    },
  ],
  options: {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      title: {
        display: true,
        text: "My Chart",
        font: {
          size: 16,
        },
      },
      legend: {
        display: true,
        position: "top",
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Month",
        },
      },
      y: {
        title: {
          display: true,
          text: "Value",
        },
        beginAtZero: true,
      },
    },
  },
  title: "My Chart",
};

// Example data for quick start
const exampleDatasets = {
  sales: {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        id: "dataset-1",
        label: "2023 Sales",
        data: [65, 59, 80, 81, 56, 55],
      },
      {
        id: "dataset-2",
        label: "2022 Sales",
        data: [28, 48, 40, 19, 86, 27],
      },
    ],
  },
  weather: {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        id: "dataset-1",
        label: "Temperature (°C)",
        data: [22, 24, 27, 23, 20, 18, 19],
      },
      {
        id: "dataset-2",
        label: "Precipitation (mm)",
        data: [0, 5, 10, 2, 0, 0, 1],
      },
    ],
  },
  satisfaction: {
    labels: ["Product A", "Product B", "Product C", "Product D", "Product E"],
    datasets: [
      {
        id: "dataset-1",
        label: "Customer Satisfaction",
        data: [4.5, 3.8, 4.2, 3.9, 4.7],
      },
    ],
  },
};

export function ChartBuilder() {
  const [chartConfig, setChartConfig] = useState<ChartConfig>({
    ...defaultChartConfig,
  });
  const [rawData, setRawData] = useState("");
  const [currentTab, setCurrentTab] = useState("chart");
  const [selectedDatasetIndex, setSelectedDatasetIndex] = useState(0);
  const chartRef = useRef<HTMLDivElement>(null);

  // Handle chart type change
  const handleChartTypeChange = (type: ChartType) => {
    setChartConfig((prev) => ({
      ...prev,
      type,
    }));
  };

  // Handle chart title change
  const handleTitleChange = (title: string) => {
    setChartConfig((prev) => ({
      ...prev,
      title,
      options: {
        ...prev.options,
        plugins: {
          ...prev.options.plugins,
          title: {
            ...prev.options.plugins?.title,
            text: title,
            display: true,
          },
        },
      },
    }));
  };

  // Add new dataset
  const addDataset = () => {
    const newDataset: Dataset = {
      id: `dataset-${chartConfig.datasets.length + 1}`,
      label: `Dataset ${chartConfig.datasets.length + 1}`,
      data: Array(chartConfig.labels.length).fill(0),
      backgroundColor:
        DEFAULT_COLORS[chartConfig.datasets.length % DEFAULT_COLORS.length],
      borderColor:
        DEFAULT_COLORS[chartConfig.datasets.length % DEFAULT_COLORS.length],
      borderWidth: 1,
      fill: false,
      tension: 0.1,
    };

    setChartConfig((prev) => ({
      ...prev,
      datasets: [...prev.datasets, newDataset],
    }));
    setSelectedDatasetIndex(chartConfig.datasets.length);
  };

  // Remove dataset
  const removeDataset = (index: number) => {
    if (chartConfig.datasets.length <= 1) {
      return; // Keep at least one dataset
    }

    setChartConfig((prev) => ({
      ...prev,
      datasets: prev.datasets.filter((_, i) => i !== index),
    }));

    if (selectedDatasetIndex >= index && selectedDatasetIndex > 0) {
      setSelectedDatasetIndex(selectedDatasetIndex - 1);
    }
  };

  // Update dataset property
  const updateDatasetProperty = (
    index: number,
    property: string,
    value: unknown
  ) => {
    setChartConfig((prev) => ({
      ...prev,
      datasets: prev.datasets.map((dataset, i) => {
        if (i === index) {
          return {
            ...dataset,
            [property]: value,
          };
        }
        return dataset;
      }),
    }));
  };

  // Handle labels change
  const handleLabelsChange = (labelsString: string) => {
    const newLabels = labelsString.split(",").map((label) => label.trim());

    // Resize all datasets to match new label count
    const resizedDatasets = chartConfig.datasets.map((dataset) => {
      const currentData = [...dataset.data];
      const newData = Array(newLabels.length).fill(0);

      // Copy existing data values
      for (let i = 0; i < Math.min(currentData.length, newLabels.length); i++) {
        newData[i] = currentData[i];
      }

      return {
        ...dataset,
        data: newData,
      };
    });

    setChartConfig((prev) => ({
      ...prev,
      labels: newLabels,
      datasets: resizedDatasets,
    }));
  };

  // Handle dataset data change
  const handleDataChange = (index: number, dataString: string) => {
    const newData = dataString
      .split(",")
      .map((value) => parseFloat(value.trim()))
      .filter((value) => !isNaN(value));

    updateDatasetProperty(index, "data", newData);
  };

  // Export chart as PNG
  const exportChart = async () => {
    if (chartRef.current) {
      try {
        const dataUrl = await toPng(chartRef.current);
        saveAs(
          dataUrl,
          `${chartConfig.title.toLowerCase().replace(/\s+/g, "-")}.png`
        );
      } catch (error) {
        console.error("Error exporting chart:", error);
      }
    }
  };

  // Parse CSV or TSV data
  const parseData = () => {
    if (!rawData.trim()) return;

    Papa.parse(rawData, {
      complete: (results) => {
        if (results.data && results.data.length > 1) {
          const dataSets: Dataset[] = [];

          // First row is labels (x-axis)
          const labels = (results.data[0] as string[]).slice(1);

          // Each subsequent row is a dataset
          for (let i = 1; i < results.data.length; i++) {
            const row = results.data[i] as string[];
            if (row.length > 1) {
              const label = row[0];
              const data = row.slice(1).map((val) => parseFloat(val) || 0);

              dataSets.push({
                id: `dataset-${i}`,
                label,
                data,
                backgroundColor:
                  DEFAULT_COLORS[(i - 1) % DEFAULT_COLORS.length],
                borderColor: DEFAULT_COLORS[(i - 1) % DEFAULT_COLORS.length],
                borderWidth: 1,
                fill: false,
                tension: 0.1,
              });
            }
          }

          setChartConfig((prev) => ({
            ...prev,
            labels,
            datasets: dataSets,
          }));
        }
      },
    });
  };

  // Load example data
  const loadExampleData = (exampleKey: keyof typeof exampleDatasets) => {
    const example = exampleDatasets[exampleKey];

    const formattedDatasets = example.datasets.map((dataset, index) => ({
      ...dataset,
      backgroundColor: DEFAULT_COLORS[index % DEFAULT_COLORS.length],
      borderColor: DEFAULT_COLORS[index % DEFAULT_COLORS.length],
      borderWidth: 1,
      fill: false,
      tension: 0.1,
    }));

    setChartConfig((prev) => ({
      ...prev,
      labels: example.labels,
      datasets: formattedDatasets,
    }));
  };

  // Toggle legend display
  const toggleLegend = (display: boolean) => {
    setChartConfig((prev) => ({
      ...prev,
      options: {
        ...prev.options,
        plugins: {
          ...prev.options.plugins,
          legend: {
            ...prev.options.plugins?.legend,
            display,
          },
        },
      },
    }));
  };

  // Set legend position
  const setLegendPosition = (position: "top" | "bottom" | "left" | "right") => {
    setChartConfig((prev) => ({
      ...prev,
      options: {
        ...prev.options,
        plugins: {
          ...prev.options.plugins,
          legend: {
            ...prev.options.plugins?.legend,
            position,
          },
        },
      },
    }));
  };

  // Toggle axis titles
  const toggleAxisTitle = (axis: "x" | "y", display: boolean) => {
    setChartConfig((prev) => ({
      ...prev,
      options: {
        ...prev.options,
        scales: {
          ...prev.options.scales,
          [axis]: {
            ...prev.options.scales?.[axis],
            title: {
              ...prev.options.scales?.[axis]?.title,
              display,
            },
          },
        },
      },
    }));
  };

  // Set axis title text
  const setAxisTitleText = (axis: "x" | "y", text: string) => {
    setChartConfig((prev) => ({
      ...prev,
      options: {
        ...prev.options,
        scales: {
          ...prev.options.scales,
          [axis]: {
            ...prev.options.scales?.[axis],
            title: {
              ...prev.options.scales?.[axis]?.title,
              text,
              display: true,
            },
          },
        },
      },
    }));
  };

  // Get chart data in Chart.js format
  const getChartData = (): ChartData<ChartType> => {
    return {
      labels: chartConfig.labels,
      datasets: chartConfig.datasets,
    };
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Chart Builder</CardTitle>
        <CardDescription>
          Create and customize charts without coding using Chart.js
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="chart" onValueChange={setCurrentTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="chart">Chart</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="export">Export</TabsTrigger>
          </TabsList>

          {/* Chart View Tab */}
          <TabsContent value="chart" className="space-y-4">
            <div className="flex justify-between mb-4">
              <div className="w-full">
                <Input
                  value={chartConfig.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Chart Title"
                  className="text-lg font-semibold mb-2"
                />
              </div>
            </div>

            <div
              className="border rounded-lg p-4 bg-white dark:bg-gray-950 max-w-full max-h-[500px]"
              ref={chartRef}
            >
              <Chart
                type={chartConfig.type}
                data={getChartData()}
                options={chartConfig.options}
                className="max-w-full"
              />
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              {Object.entries(CHART_TYPES).map(([type, chartType]) => (
                <Button
                  key={type}
                  variant={chartConfig.type === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleChartTypeChange(type as ChartType)}
                  className="flex items-center gap-1"
                >
                  {chartType.icon}
                  {chartType.label}
                </Button>
              ))}
            </div>
          </TabsContent>

          {/* Data Tab */}
          <TabsContent value="data" className="space-y-4">
            <div className="grid gap-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="labels">Labels (X-Axis)</Label>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => loadExampleData("sales")}
                    >
                      Sales Example
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => loadExampleData("weather")}
                    >
                      Weather Example
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => loadExampleData("satisfaction")}
                    >
                      Satisfaction Example
                    </Button>
                  </div>
                </div>
                <Input
                  id="labels"
                  placeholder="Label 1, Label 2, Label 3, ..."
                  value={chartConfig.labels.join(", ")}
                  onChange={(e) => handleLabelsChange(e.target.value)}
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label>Datasets</Label>
                  <Button size="sm" onClick={addDataset}>
                    <Plus className="h-4 w-4 mr-1" /> Add Dataset
                  </Button>
                </div>

                <div className="space-y-4 mt-2">
                  {chartConfig.datasets.map((dataset, index) => (
                    <Accordion
                      key={dataset.id}
                      type="single"
                      collapsible
                      defaultValue={
                        index === selectedDatasetIndex ? dataset.id : undefined
                      }
                      onValueChange={(value) => {
                        if (value === dataset.id) {
                          setSelectedDatasetIndex(index);
                        }
                      }}
                    >
                      <AccordionItem value={dataset.id}>
                        <AccordionTrigger>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{
                                backgroundColor:
                                  dataset.backgroundColor as string,
                              }}
                            />
                            {dataset.label}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-3 pt-2">
                            <div className="grid grid-cols-[1fr_auto] gap-2">
                              <Input
                                placeholder="Dataset Name"
                                value={dataset.label}
                                onChange={(e) =>
                                  updateDatasetProperty(
                                    index,
                                    "label",
                                    e.target.value
                                  )
                                }
                              />
                              <Button
                                variant="destructive"
                                size="icon"
                                disabled={chartConfig.datasets.length <= 1}
                                onClick={() => removeDataset(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>

                            <div>
                              <Label htmlFor={`dataset-color-${index}`}>
                                Color
                              </Label>
                              <div className="flex gap-2 mt-1">
                                <Input
                                  id={`dataset-color-${index}`}
                                  type="color"
                                  value={dataset.backgroundColor as string}
                                  onChange={(e) => {
                                    updateDatasetProperty(
                                      index,
                                      "backgroundColor",
                                      e.target.value
                                    );
                                    updateDatasetProperty(
                                      index,
                                      "borderColor",
                                      e.target.value
                                    );
                                  }}
                                  className="w-12 h-8 p-1"
                                />
                                <Input
                                  value={dataset.backgroundColor as string}
                                  onChange={(e) => {
                                    updateDatasetProperty(
                                      index,
                                      "backgroundColor",
                                      e.target.value
                                    );
                                    updateDatasetProperty(
                                      index,
                                      "borderColor",
                                      e.target.value
                                    );
                                  }}
                                  className="flex-1"
                                />
                              </div>
                            </div>

                            <div>
                              <Label htmlFor={`data-values-${index}`}>
                                Values
                              </Label>
                              <Textarea
                                id={`data-values-${index}`}
                                value={dataset.data.join(", ")}
                                onChange={(e) =>
                                  handleDataChange(index, e.target.value)
                                }
                                placeholder="Value 1, Value 2, Value 3, ..."
                                rows={3}
                              />
                              <div className="text-xs text-muted-foreground mt-1">
                                Enter numeric values separated by commas
                              </div>
                            </div>

                            {(chartConfig.type === "line" ||
                              chartConfig.type === "radar") && (
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Switch
                                    id={`fill-${index}`}
                                    checked={dataset.fill}
                                    onCheckedChange={(checked) =>
                                      updateDatasetProperty(
                                        index,
                                        "fill",
                                        checked
                                      )
                                    }
                                  />
                                  <Label htmlFor={`fill-${index}`}>
                                    Fill Area
                                  </Label>
                                </div>

                                <div>
                                  <div className="flex justify-between">
                                    <Label htmlFor={`tension-${index}`}>
                                      Line Curve
                                    </Label>
                                    <span className="text-xs text-muted-foreground">
                                      {Math.round((dataset.tension || 0) * 100)}
                                      %
                                    </span>
                                  </div>
                                  <Slider
                                    id={`tension-${index}`}
                                    min={0}
                                    max={1}
                                    step={0.1}
                                    value={[dataset.tension || 0]}
                                    onValueChange={([value]) =>
                                      updateDatasetProperty(
                                        index,
                                        "tension",
                                        value
                                      )
                                    }
                                  />
                                </div>
                              </div>
                            )}

                            {(chartConfig.type === "bar" ||
                              chartConfig.type === "line") && (
                              <div>
                                <div className="flex justify-between">
                                  <Label htmlFor={`border-width-${index}`}>
                                    Border Width
                                  </Label>
                                  <span className="text-xs text-muted-foreground">
                                    {dataset.borderWidth}px
                                  </span>
                                </div>
                                <Slider
                                  id={`border-width-${index}`}
                                  min={0}
                                  max={10}
                                  step={1}
                                  value={[dataset.borderWidth || 1]}
                                  onValueChange={([value]) =>
                                    updateDatasetProperty(
                                      index,
                                      "borderWidth",
                                      value
                                    )
                                  }
                                />
                              </div>
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="csv-data">Import CSV/TSV Data</Label>
                <Textarea
                  id="csv-data"
                  placeholder="Paste CSV or TSV data here..."
                  value={rawData}
                  onChange={(e) => setRawData(e.target.value)}
                  rows={6}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={parseData}
                >
                  <Upload className="h-4 w-4 mr-1" /> Parse Data
                </Button>
                <div className="text-xs text-muted-foreground mt-1">
                  First row should contain labels, first column should contain
                  dataset names
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <div className="grid gap-4">
              <div>
                <Label className="text-base font-medium">Legend</Label>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="legend-display"
                      checked={chartConfig.options.plugins?.legend?.display}
                      onCheckedChange={toggleLegend}
                    />
                    <Label htmlFor="legend-display">Show Legend</Label>
                  </div>

                  {chartConfig.options.plugins?.legend?.display && (
                    <div>
                      <Label>Legend Position</Label>
                      <Select
                        value={
                          chartConfig.options.plugins?.legend
                            ?.position as string
                        }
                        onValueChange={(value) =>
                          setLegendPosition(
                            value as "top" | "bottom" | "left" | "right"
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Legend Position" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="top">Top</SelectItem>
                          <SelectItem value="bottom">Bottom</SelectItem>
                          <SelectItem value="left">Left</SelectItem>
                          <SelectItem value="right">Right</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </div>

              {(chartConfig.type === "bar" ||
                chartConfig.type === "line" ||
                chartConfig.type === "scatter") && (
                <div className="grid gap-4">
                  <div>
                    <Label className="text-base font-medium">X-Axis</Label>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center gap-2">
                        <Switch
                          id="x-axis-title-display"
                          checked={
                            chartConfig.options.scales?.x?.title?.display
                          }
                          onCheckedChange={(checked) =>
                            toggleAxisTitle("x", checked)
                          }
                        />
                        <Label htmlFor="x-axis-title-display">
                          Show X-Axis Title
                        </Label>
                      </div>

                      {chartConfig.options.scales?.x?.title?.display && (
                        <div>
                          <Input
                            placeholder="X-Axis Title"
                            value={
                              (chartConfig.options.scales?.x?.title
                                ?.text as string) || ""
                            }
                            onChange={(e) =>
                              setAxisTitleText("x", e.target.value)
                            }
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label className="text-base font-medium">Y-Axis</Label>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center gap-2">
                        <Switch
                          id="y-axis-title-display"
                          checked={
                            chartConfig.options.scales?.y?.title?.display
                          }
                          onCheckedChange={(checked) =>
                            toggleAxisTitle("y", checked)
                          }
                        />
                        <Label htmlFor="y-axis-title-display">
                          Show Y-Axis Title
                        </Label>
                      </div>

                      {chartConfig.options.scales?.y?.title?.display && (
                        <div>
                          <Input
                            placeholder="Y-Axis Title"
                            value={
                              (chartConfig.options.scales?.y?.title
                                ?.text as string) || ""
                            }
                            onChange={(e) =>
                              setAxisTitleText("y", e.target.value)
                            }
                          />
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <Switch
                          id="y-axis-zero"
                          checked={chartConfig.options.scales?.y?.beginAtZero}
                          onCheckedChange={(checked) => {
                            setChartConfig((prev) => ({
                              ...prev,
                              options: {
                                ...prev.options,
                                scales: {
                                  ...prev.options.scales,
                                  y: {
                                    ...prev.options.scales?.y,
                                    beginAtZero: checked,
                                  },
                                },
                              },
                            }));
                          }}
                        />
                        <Label htmlFor="y-axis-zero">
                          Begin Y-Axis at Zero
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <Label className="text-base font-medium">Appearance</Label>
                <div className="mt-2 space-y-2">
                  <div>
                    <Label>Font Size</Label>
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">
                        {chartConfig.options.plugins?.title?.font?.size}px
                      </span>
                    </div>
                    <Slider
                      min={10}
                      max={32}
                      step={1}
                      value={[
                        (chartConfig.options.plugins?.title?.font
                          ?.size as number) || 16,
                      ]}
                      onValueChange={([value]) => {
                        setChartConfig((prev) => ({
                          ...prev,
                          options: {
                            ...prev.options,
                            plugins: {
                              ...prev.options.plugins,
                              title: {
                                ...prev.options.plugins?.title,
                                font: {
                                  ...prev.options.plugins?.title?.font,
                                  size: value,
                                },
                              },
                            },
                          },
                        }));
                      }}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      id="maintain-aspect"
                      checked={chartConfig.options.maintainAspectRatio}
                      onCheckedChange={(checked) => {
                        setChartConfig((prev) => ({
                          ...prev,
                          options: {
                            ...prev.options,
                            maintainAspectRatio: checked,
                          },
                        }));
                      }}
                    />
                    <Label htmlFor="maintain-aspect">
                      Maintain Aspect Ratio
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Export Tab */}
          <TabsContent value="export" className="space-y-4">
            <div className="space-y-4">
              <div className="border rounded-lg p-4 bg-muted/20">
                <h3 className="text-lg font-medium mb-2">Export Options</h3>
                <Button onClick={exportChart} className="w-full">
                  <Download className="h-4 w-4 mr-2" /> Export as PNG
                </Button>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Preview</h3>
                <div className="border rounded-lg p-4 bg-white dark:bg-gray-950 max-w-full max-h-[300px] overflow-auto">
                  <Chart
                    type={chartConfig.type}
                    data={getChartData()}
                    options={chartConfig.options}
                    className="max-w-full"
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
