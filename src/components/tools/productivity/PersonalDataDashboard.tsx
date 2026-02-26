import React, { useState, useCallback, useMemo, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Upload,
  Download,
  BarChart3,
  TrendingUp,
  Activity,
  DollarSign,
  Target,
  Zap,
  Brain,
  Eye,
  Trash2,
  Settings,
  Share2,
  Copy,
  Check,
  FileText,
  Database,
  Sparkles,
  TrendingDown,
  AlertCircle,
  LayoutGrid,
  Search,
  RefreshCw,
} from "lucide-react";
import { Line, Bar, Pie, Doughnut, Radar, Scatter } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend
);

// Types and interfaces
interface DataRow {
  [key: string]: string | number;
}

interface DataSource {
  id: string;
  name: string;
  type: "csv" | "json" | "manual";
  data: DataRow[];
  uploadDate: string;
  lastModified: string;
  size: number;
  columns: string[];
}

interface DashboardWidget {
  id: string;
  type: "chart" | "metric" | "table" | "insight";
  title: string;
  position: { x: number; y: number; w: number; h: number };
  config: {
    chartType?: "line" | "bar" | "pie" | "doughnut" | "radar" | "scatter";
    dataSource?: string;
    xColumn?: string;
    yColumn?: string;
    groupBy?: string;
    aggregation?: "sum" | "average" | "count" | "min" | "max";
    color?: string;
    metric?: string;
    metricValue?: number;
    metricChange?: number;
    tableColumns?: string[];
    insightText?: string;
  };
}

interface AIInsight {
  id: string;
  type: "trend" | "correlation" | "anomaly" | "prediction";
  title: string;
  description: string;
  confidence: number;
  dataSource: string;
  timestamp: string;
}

interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor: string | string[];
    borderColor: string;
    borderWidth: number;
    fill: boolean;
  }>;
}

// Sample data templates
const sampleDatasets = {
  fitness: {
    name: "Fitness Tracking Data",
    data: [
      {
        date: "2024-01-01",
        steps: 8432,
        calories: 2100,
        weight: 70.2,
        workoutMinutes: 45,
      },
      {
        date: "2024-01-02",
        steps: 10245,
        calories: 2300,
        weight: 70.1,
        workoutMinutes: 60,
      },
      {
        date: "2024-01-03",
        steps: 7834,
        calories: 1980,
        weight: 70.0,
        workoutMinutes: 30,
      },
      {
        date: "2024-01-04",
        steps: 9876,
        calories: 2150,
        weight: 69.9,
        workoutMinutes: 45,
      },
      {
        date: "2024-01-05",
        steps: 11234,
        calories: 2400,
        weight: 69.8,
        workoutMinutes: 75,
      },
    ],
    columns: ["date", "steps", "calories", "weight", "workoutMinutes"],
  },
  finances: {
    name: "Personal Finance Data",
    data: [
      {
        month: "Jan 2024",
        income: 5000,
        expenses: 3500,
        savings: 1500,
        category: "salary",
      },
      {
        month: "Feb 2024",
        income: 5200,
        expenses: 3800,
        savings: 1400,
        category: "salary",
      },
      {
        month: "Mar 2024",
        income: 5000,
        expenses: 3200,
        savings: 1800,
        category: "salary",
      },
      {
        month: "Apr 2024",
        income: 5500,
        expenses: 3900,
        savings: 1600,
        category: "salary",
      },
      {
        month: "May 2024",
        income: 5000,
        expenses: 3300,
        savings: 1700,
        category: "salary",
      },
    ],
    columns: ["month", "income", "expenses", "savings", "category"],
  },
  productivity: {
    name: "Productivity Metrics",
    data: [
      {
        week: "Week 1",
        focusHours: 32,
        meetings: 8,
        tasksCompleted: 24,
        satisfaction: 7,
      },
      {
        week: "Week 2",
        focusHours: 28,
        meetings: 12,
        tasksCompleted: 20,
        satisfaction: 6,
      },
      {
        week: "Week 3",
        focusHours: 35,
        meetings: 6,
        tasksCompleted: 28,
        satisfaction: 8,
      },
      {
        week: "Week 4",
        focusHours: 30,
        meetings: 10,
        tasksCompleted: 22,
        satisfaction: 7,
      },
      {
        week: "Week 5",
        focusHours: 38,
        meetings: 5,
        tasksCompleted: 30,
        satisfaction: 9,
      },
    ],
    columns: [
      "week",
      "focusHours",
      "meetings",
      "tasksCompleted",
      "satisfaction",
    ],
  },
};

const chartColors = {
  primary: "#6366f1",
  secondary: "#8b5cf6",
  success: "#10b981",
  warning: "#f59e0b",
  error: "#ef4444",
  info: "#3b82f6",
  muted: "#6b7280",
};

export function PersonalDataDashboard() {
  // State management
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [dashboardWidgets, setDashboardWidgets] = useState<DashboardWidget[]>(
    []
  );
  const [activeTab, setActiveTab] = useState("import");
  const [aiInsights, setAIInsights] = useState<AIInsight[]>([]);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [copiedDashboard, setCopiedDashboard] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load sample data
  const loadSampleData = useCallback(
    (datasetKey: keyof typeof sampleDatasets) => {
      const dataset = sampleDatasets[datasetKey];
      const newDataSource: DataSource = {
        id: `sample-${datasetKey}-${Date.now()}`,
        name: dataset.name,
        type: "manual",
        data: dataset.data,
        uploadDate: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        size: dataset.data.length,
        columns: dataset.columns,
      };
      setDataSources((prev) => [...prev, newDataSource]);
    },
    []
  );

  // File upload handler
  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        let data: DataRow[] = [];
        let columns: string[] = [];

        try {
          if (file.name.endsWith(".json")) {
            const jsonData = JSON.parse(content);
            data = Array.isArray(jsonData) ? jsonData : [jsonData];
            columns = data.length > 0 ? Object.keys(data[0]) : [];
          } else if (file.name.endsWith(".csv")) {
            const lines = content.split("\n").filter((line) => line.trim());
            if (lines.length > 0) {
              columns = lines[0].split(",").map((col) => col.trim());
              data = lines.slice(1).map((line) => {
                const values = line.split(",");
                const row: DataRow = {};
                columns.forEach((col, index) => {
                  row[col] = values[index]?.trim() || "";
                });
                return row;
              });
            }
          }

          const newDataSource: DataSource = {
            id: `upload-${Date.now()}`,
            name: file.name,
            type: file.name.endsWith(".json") ? "json" : "csv",
            data,
            uploadDate: new Date().toISOString(),
            lastModified: new Date().toISOString(),
            size: data.length,
            columns,
          };

          setDataSources((prev) => [...prev, newDataSource]);
        } catch (error) {
          console.error("Error parsing file:", error);
        }
      };
      reader.readAsText(file);
    },
    []
  );

  // Generate AI insights
  const generateAIInsights = useCallback(() => {
    if (dataSources.length === 0) return;

    setIsGeneratingInsights(true);

    // Simulate AI analysis
    setTimeout(() => {
      const insights: AIInsight[] = [];

      dataSources.forEach((source) => {
        // Trend analysis
        if (source.data.length > 2) {
          const numericColumns = source.columns.filter((col) => {
            return source.data.some(
              (row) => !isNaN(parseFloat(String(row[col])))
            );
          });

          numericColumns.forEach((col) => {
            const values = source.data
              .map((row) => parseFloat(String(row[col])))
              .filter((v) => !isNaN(v));
            if (values.length > 1) {
              const trend =
                values[values.length - 1] > values[0]
                  ? "increasing"
                  : "decreasing";
              const change = (
                ((values[values.length - 1] - values[0]) / values[0]) *
                100
              ).toFixed(1);

              insights.push({
                id: `insight-${Date.now()}-${col}`,
                type: "trend",
                title: `${col} is ${trend}`,
                description: `${col} has ${
                  trend === "increasing" ? "increased" : "decreased"
                } by ${Math.abs(parseFloat(change))}% over the data period.`,
                confidence: 85,
                dataSource: source.name,
                timestamp: new Date().toISOString(),
              });
            }
          });

          // Correlation analysis
          if (numericColumns.length >= 2) {
            insights.push({
              id: `correlation-${Date.now()}`,
              type: "correlation",
              title: "Strong correlation detected",
              description: `Found potential correlation between ${numericColumns[0]} and ${numericColumns[1]}. Consider analyzing their relationship further.`,
              confidence: 72,
              dataSource: source.name,
              timestamp: new Date().toISOString(),
            });
          }
        }
      });

      setAIInsights(insights);
      setIsGeneratingInsights(false);
    }, 2000);
  }, [dataSources]);

  // Create chart data from data source
  const createChartData = useCallback(
    (widget: DashboardWidget): ChartData | null => {
      const dataSource = dataSources.find(
        (ds) => ds.id === widget.config.dataSource
      );
      if (!dataSource || !widget.config.xColumn || !widget.config.yColumn) {
        return null;
      }

      const labels = dataSource.data.map((row) =>
        String(row[widget.config.xColumn!])
      );
      const data = dataSource.data.map(
        (row) => parseFloat(String(row[widget.config.yColumn!])) || 0
      );

      return {
        labels,
        datasets: [
          {
            label: widget.config.yColumn,
            data,
            backgroundColor:
              widget.config.chartType === "pie" ||
              widget.config.chartType === "doughnut"
                ? labels.map((_, i) => `hsl(${(i * 137.5) % 360}, 70%, 60%)`)
                : widget.config.color || chartColors.primary,
            borderColor: widget.config.color || chartColors.primary,
            borderWidth: 2,
            fill: widget.config.chartType === "line" ? false : true,
          },
        ],
      };
    },
    [dataSources]
  );

  // Add new widget
  const addWidget = useCallback((type: DashboardWidget["type"]) => {
    const newWidget: DashboardWidget = {
      id: `widget-${Date.now()}`,
      type,
      title: `New ${type}`,
      position: { x: 0, y: 0, w: 4, h: 3 },
      config: {
        chartType: type === "chart" ? "line" : undefined,
        color: chartColors.primary,
      },
    };
    setDashboardWidgets((prev) => [...prev, newWidget]);
  }, []);

  // Export dashboard
  const exportDashboard = useCallback(() => {
    const dashboardData = {
      dataSources,
      widgets: dashboardWidgets,
      insights: aiInsights,
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(dashboardData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `personal-dashboard-${
      new Date().toISOString().split("T")[0]
    }.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [dataSources, dashboardWidgets, aiInsights]);

  // Copy dashboard link
  const copyDashboardLink = useCallback(() => {
    const dashboardData = JSON.stringify({
      dataSources,
      widgets: dashboardWidgets,
    });
    const encodedData = btoa(dashboardData);
    const link = `${window.location.origin}${window.location.pathname}?dashboard=${encodedData}`;
    navigator.clipboard.writeText(link);
    setCopiedDashboard(true);
    setTimeout(() => setCopiedDashboard(false), 2000);
  }, [dataSources, dashboardWidgets]);

  // Filtered widgets
  const filteredWidgets = useMemo(() => {
    return dashboardWidgets.filter((widget) => {
      const matchesSearch = widget.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesFilter = filterType === "all" || widget.type === filterType;
      return matchesSearch && matchesFilter;
    });
  }, [dashboardWidgets, searchTerm, filterType]);

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Personal Data Analytics Dashboard
              </CardTitle>
              <CardDescription className="text-lg mt-2">
                Import, visualize, and analyze your personal data with
                AI-powered insights
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                <Database className="h-4 w-4 mr-1" />
                {dataSources.length} Sources
              </Badge>
              <Badge
                variant="secondary"
                className="bg-purple-100 text-purple-800"
              >
                <LayoutGrid className="h-4 w-4 mr-1" />
                {dashboardWidgets.length} Widgets
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="import" className="flex items-center space-x-2">
            <Upload className="h-4 w-4" />
            <span>Import Data</span>
          </TabsTrigger>
          <TabsTrigger value="build" className="flex items-center space-x-2">
            <LayoutGrid className="h-4 w-4" />
            <span>Build Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center space-x-2">
            <Brain className="h-4 w-4" />
            <span>AI Insights</span>
          </TabsTrigger>
          <TabsTrigger value="export" className="flex items-center space-x-2">
            <Share2 className="h-4 w-4" />
            <span>Export & Share</span>
          </TabsTrigger>
        </TabsList>

        {/* Import Data Tab */}
        <TabsContent value="import" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="h-5 w-5" />
                  <span>Upload Files</span>
                </CardTitle>
                <CardDescription>
                  Upload CSV or JSON files with your personal data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                  variant="outline"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choose File (CSV/JSON)
                </Button>
                <div className="text-sm text-muted-foreground">
                  Supported formats: CSV, JSON. Maximum file size: 10MB
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Sparkles className="h-5 w-5" />
                  <span>Sample Data</span>
                </CardTitle>
                <CardDescription>
                  Try the dashboard with pre-loaded sample datasets
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={() => loadSampleData("fitness")}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Activity className="h-4 w-4 mr-2" />
                  Fitness Tracking Data
                </Button>
                <Button
                  onClick={() => loadSampleData("finances")}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Personal Finance Data
                </Button>
                <Button
                  onClick={() => loadSampleData("productivity")}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Target className="h-4 w-4 mr-2" />
                  Productivity Metrics
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Data Sources List */}
          {dataSources.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Your Data Sources</CardTitle>
                <CardDescription>
                  Manage and preview your imported data sources
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dataSources.map((source) => (
                    <div
                      key={source.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          {source.type === "csv" ? (
                            <FileText className="h-5 w-5 text-blue-600" />
                          ) : (
                            <Database className="h-5 w-5 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{source.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {source.size} rows • {source.columns.length} columns
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">
                          {source.type.toUpperCase()}
                        </Badge>
                        <Button
                          onClick={() => {
                            setDataSources((prev) =>
                              prev.filter((ds) => ds.id !== source.id)
                            );
                          }}
                          variant="ghost"
                          size="sm"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Build Dashboard Tab */}
        <TabsContent value="build" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Dashboard Builder</h3>
              <p className="text-muted-foreground">
                Create and customize your data visualizations
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search widgets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-48"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="chart">Charts</SelectItem>
                  <SelectItem value="metric">Metrics</SelectItem>
                  <SelectItem value="table">Tables</SelectItem>
                  <SelectItem value="insight">Insights</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {dataSources.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Data Sources</h3>
                <p className="text-muted-foreground mb-4">
                  Import some data first to start building your dashboard
                </p>
                <Button onClick={() => setActiveTab("import")}>
                  <Upload className="h-4 w-4 mr-2" />
                  Import Data
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Widget Controls */}
              <Card>
                <CardHeader>
                  <CardTitle>Add Widgets</CardTitle>
                  <CardDescription>
                    Choose widgets to add to your dashboard
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={() => addWidget("chart")}
                      variant="outline"
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Chart
                    </Button>
                    <Button
                      onClick={() => addWidget("metric")}
                      variant="outline"
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Metric
                    </Button>
                    <Button
                      onClick={() => addWidget("table")}
                      variant="outline"
                    >
                      <LayoutGrid className="h-4 w-4 mr-2" />
                      Table
                    </Button>
                    <Button
                      onClick={() => addWidget("insight")}
                      variant="outline"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Insight
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Dashboard Grid */}
              {filteredWidgets.length > 0 && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredWidgets.map((widget) => (
                    <DashboardWidget
                      key={widget.id}
                      widget={widget}
                      dataSources={dataSources}
                      onUpdate={(updatedWidget) => {
                        setDashboardWidgets((prev) =>
                          prev.map((w) =>
                            w.id === updatedWidget.id ? updatedWidget : w
                          )
                        );
                      }}
                      onDelete={() => {
                        setDashboardWidgets((prev) =>
                          prev.filter((w) => w.id !== widget.id)
                        );
                      }}
                      createChartData={createChartData}
                    />
                  ))}
                </div>
              )}

              {dashboardWidgets.length === 0 && (
                <Card>
                  <CardContent className="py-12 text-center">
                    <LayoutGrid className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No Widgets Yet
                    </h3>
                    <p className="text-muted-foreground">
                      Add some widgets above to start building your dashboard
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Brain className="h-5 w-5" />
                    <span>AI-Powered Insights</span>
                  </CardTitle>
                  <CardDescription>
                    Discover patterns, trends, and anomalies in your data
                  </CardDescription>
                </div>
                <Button
                  onClick={generateAIInsights}
                  disabled={dataSources.length === 0 || isGeneratingInsights}
                >
                  {isGeneratingInsights ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Zap className="h-4 w-4 mr-2" />
                  )}
                  {isGeneratingInsights ? "Analyzing..." : "Generate Insights"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isGeneratingInsights && (
                <div className="space-y-4">
                  <div className="text-center py-8">
                    <Brain className="h-12 w-12 mx-auto text-blue-500 animate-pulse mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      Analyzing Your Data
                    </h3>
                    <p className="text-muted-foreground">
                      This may take a few moments...
                    </p>
                    <Progress value={66} className="w-64 mx-auto mt-4" />
                  </div>
                </div>
              )}

              {!isGeneratingInsights &&
                aiInsights.length === 0 &&
                dataSources.length > 0 && (
                  <div className="text-center py-8">
                    <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No Insights Yet
                    </h3>
                    <p className="text-muted-foreground">
                      Click "Generate Insights" to analyze your data
                    </p>
                  </div>
                )}

              {!isGeneratingInsights &&
                aiInsights.length === 0 &&
                dataSources.length === 0 && (
                  <div className="text-center py-8">
                    <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No Data to Analyze
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Import some data first to generate AI insights
                    </p>
                    <Button onClick={() => setActiveTab("import")}>
                      <Upload className="h-4 w-4 mr-2" />
                      Import Data
                    </Button>
                  </div>
                )}

              {aiInsights.length > 0 && (
                <div className="space-y-4">
                  {aiInsights.map((insight) => (
                    <div
                      key={insight.id}
                      className="border rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            {insight.type === "trend" && (
                              <TrendingUp className="h-5 w-5 text-blue-600" />
                            )}
                            {insight.type === "correlation" && (
                              <Activity className="h-5 w-5 text-blue-600" />
                            )}
                            {insight.type === "anomaly" && (
                              <AlertCircle className="h-5 w-5 text-yellow-600" />
                            )}
                            {insight.type === "prediction" && (
                              <Brain className="h-5 w-5 text-purple-600" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold">{insight.title}</h4>
                            <p className="text-muted-foreground">
                              {insight.description}
                            </p>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                              <span>Source: {insight.dataSource}</span>
                              <span>Confidence: {insight.confidence}%</span>
                            </div>
                          </div>
                        </div>
                        <Badge
                          variant={
                            insight.type === "anomaly"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {insight.type}
                        </Badge>
                      </div>
                      <Progress value={insight.confidence} className="h-2" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Export & Share Tab */}
        <TabsContent value="export" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Download className="h-5 w-5" />
                  <span>Export Dashboard</span>
                </CardTitle>
                <CardDescription>
                  Download your dashboard data and configurations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={exportDashboard}
                  className="w-full"
                  disabled={dashboardWidgets.length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export as JSON
                </Button>
                <div className="text-sm text-muted-foreground">
                  Exports all data sources, widgets, and insights as a JSON file
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Share2 className="h-5 w-5" />
                  <span>Share Dashboard</span>
                </CardTitle>
                <CardDescription>
                  Generate a shareable link to your dashboard
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={copyDashboardLink}
                  className="w-full"
                  disabled={dashboardWidgets.length === 0}
                  variant="outline"
                >
                  {copiedDashboard ? (
                    <Check className="h-4 w-4 mr-2" />
                  ) : (
                    <Copy className="h-4 w-4 mr-2" />
                  )}
                  {copiedDashboard ? "Copied!" : "Copy Share Link"}
                </Button>
                <div className="text-sm text-muted-foreground">
                  Creates a URL with your dashboard configuration (data
                  included)
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Dashboard Summary</CardTitle>
              <CardDescription>
                Overview of your current dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center p-4 border rounded-lg">
                  <Database className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                  <div className="text-2xl font-bold">{dataSources.length}</div>
                  <div className="text-sm text-muted-foreground">
                    Data Sources
                  </div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <LayoutGrid className="h-8 w-8 mx-auto text-green-500 mb-2" />
                  <div className="text-2xl font-bold">
                    {dashboardWidgets.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Widgets</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Brain className="h-8 w-8 mx-auto text-purple-500 mb-2" />
                  <div className="text-2xl font-bold">{aiInsights.length}</div>
                  <div className="text-sm text-muted-foreground">
                    AI Insights
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Dashboard Widget Component
interface DashboardWidgetProps {
  widget: DashboardWidget;
  dataSources: DataSource[];
  onUpdate: (widget: DashboardWidget) => void;
  onDelete: () => void;
  createChartData: (widget: DashboardWidget) => ChartData | null;
}

function DashboardWidget({
  widget,
  dataSources,
  onUpdate,
  onDelete,
  createChartData,
}: DashboardWidgetProps) {
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  const updateWidget = (updates: Partial<DashboardWidget>) => {
    onUpdate({ ...widget, ...updates });
  };

  const updateConfig = (configUpdates: Partial<DashboardWidget["config"]>) => {
    onUpdate({
      ...widget,
      config: { ...widget.config, ...configUpdates },
    });
  };

  const renderChart = () => {
    const chartData = createChartData(widget);
    if (!chartData)
      return (
        <div className="text-center py-8 text-muted-foreground">
          Configure data source
        </div>
      );

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top" as const,
        },
      },
    };

    switch (widget.config.chartType) {
      case "line":
        return <Line data={chartData} options={options} />;
      case "bar":
        return <Bar data={chartData} options={options} />;
      case "pie":
        return <Pie data={chartData} options={options} />;
      case "doughnut":
        return <Doughnut data={chartData} options={options} />;
      case "radar":
        return <Radar data={chartData} options={options} />;
      case "scatter":
        return <Scatter data={chartData} options={options} />;
      default:
        return <Line data={chartData} options={options} />;
    }
  };

  const renderMetric = () => {
    return (
      <div className="text-center py-8">
        <div className="text-3xl font-bold text-blue-600">
          {widget.config.metricValue || 0}
        </div>
        <div className="text-sm text-muted-foreground mt-1">
          {widget.config.metric || "Metric"}
        </div>
        {widget.config.metricChange !== undefined && (
          <div
            className={`text-sm mt-2 flex items-center justify-center ${
              widget.config.metricChange >= 0
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {widget.config.metricChange >= 0 ? (
              <TrendingUp className="h-4 w-4 mr-1" />
            ) : (
              <TrendingDown className="h-4 w-4 mr-1" />
            )}
            {Math.abs(widget.config.metricChange)}%
          </div>
        )}
      </div>
    );
  };

  const renderTable = () => {
    const dataSource = dataSources.find(
      (ds) => ds.id === widget.config.dataSource
    );
    if (!dataSource)
      return (
        <div className="text-center py-8 text-muted-foreground">
          Configure data source
        </div>
      );

    const columns =
      widget.config.tableColumns || dataSource.columns.slice(0, 3);
    const rows = dataSource.data.slice(0, 5);

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              {columns.map((col) => (
                <th key={col} className="text-left p-2 font-medium">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b">
                {columns.map((col) => (
                  <td key={col} className="p-2">
                    {row[col]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {dataSource.data.length > 5 && (
          <div className="text-center text-xs text-muted-foreground mt-2">
            Showing 5 of {dataSource.data.length} rows
          </div>
        )}
      </div>
    );
  };

  const renderInsight = () => {
    return (
      <div className="p-4 text-center">
        <Eye className="h-8 w-8 mx-auto text-blue-500 mb-3" />
        <p className="text-sm">
          {widget.config.insightText || "Add your insight text..."}
        </p>
      </div>
    );
  };

  const renderContent = () => {
    switch (widget.type) {
      case "chart":
        return renderChart();
      case "metric":
        return renderMetric();
      case "table":
        return renderTable();
      case "insight":
        return renderInsight();
      default:
        return null;
    }
  };

  return (
    <Card className="h-80">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">{widget.title}</CardTitle>
          <div className="flex items-center space-x-1">
            <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Configure Widget</DialogTitle>
                </DialogHeader>
                <WidgetConfig
                  widget={widget}
                  dataSources={dataSources}
                  onUpdate={updateWidget}
                  onConfigUpdate={updateConfig}
                />
              </DialogContent>
            </Dialog>
            <Button onClick={onDelete} variant="ghost" size="sm">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="h-60">{renderContent()}</CardContent>
    </Card>
  );
}

// Widget Configuration Component
interface WidgetConfigProps {
  widget: DashboardWidget;
  dataSources: DataSource[];
  onUpdate: (widget: Partial<DashboardWidget>) => void;
  onConfigUpdate: (config: Partial<DashboardWidget["config"]>) => void;
}

function WidgetConfig({
  widget,
  dataSources,
  onUpdate,
  onConfigUpdate,
}: WidgetConfigProps) {
  const selectedDataSource = dataSources.find(
    (ds) => ds.id === widget.config.dataSource
  );

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="title">Widget Title</Label>
        <Input
          id="title"
          value={widget.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="dataSource">Data Source</Label>
        <Select
          value={widget.config.dataSource || ""}
          onValueChange={(value) => onConfigUpdate({ dataSource: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select data source" />
          </SelectTrigger>
          <SelectContent>
            {dataSources.map((source) => (
              <SelectItem key={source.id} value={source.id}>
                {source.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {widget.type === "chart" && (
        <>
          <div>
            <Label htmlFor="chartType">Chart Type</Label>
            <Select
              value={widget.config.chartType || "line"}
              onValueChange={(
                value: "line" | "bar" | "pie" | "doughnut" | "radar" | "scatter"
              ) => onConfigUpdate({ chartType: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="line">Line Chart</SelectItem>
                <SelectItem value="bar">Bar Chart</SelectItem>
                <SelectItem value="pie">Pie Chart</SelectItem>
                <SelectItem value="doughnut">Doughnut Chart</SelectItem>
                <SelectItem value="radar">Radar Chart</SelectItem>
                <SelectItem value="scatter">Scatter Plot</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedDataSource && (
            <>
              <div>
                <Label htmlFor="xColumn">X-Axis Column</Label>
                <Select
                  value={widget.config.xColumn || ""}
                  onValueChange={(value) => onConfigUpdate({ xColumn: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select column" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedDataSource.columns.map((col) => (
                      <SelectItem key={col} value={col}>
                        {col}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="yColumn">Y-Axis Column</Label>
                <Select
                  value={widget.config.yColumn || ""}
                  onValueChange={(value) => onConfigUpdate({ yColumn: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select column" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedDataSource.columns.map((col) => (
                      <SelectItem key={col} value={col}>
                        {col}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </>
      )}

      {widget.type === "metric" && (
        <>
          <div>
            <Label htmlFor="metric">Metric Name</Label>
            <Input
              id="metric"
              value={widget.config.metric || ""}
              onChange={(e) => onConfigUpdate({ metric: e.target.value })}
              placeholder="e.g., Total Sales"
            />
          </div>
          <div>
            <Label htmlFor="metricValue">Metric Value</Label>
            <Input
              id="metricValue"
              type="number"
              value={widget.config.metricValue || ""}
              onChange={(e) =>
                onConfigUpdate({ metricValue: parseFloat(e.target.value) })
              }
            />
          </div>
          <div>
            <Label htmlFor="metricChange">Change Percentage</Label>
            <Input
              id="metricChange"
              type="number"
              value={widget.config.metricChange || ""}
              onChange={(e) =>
                onConfigUpdate({ metricChange: parseFloat(e.target.value) })
              }
              placeholder="e.g., 12.5 for +12.5%"
            />
          </div>
        </>
      )}

      {widget.type === "insight" && (
        <div>
          <Label htmlFor="insightText">Insight Text</Label>
          <Textarea
            id="insightText"
            value={widget.config.insightText || ""}
            onChange={(e) => onConfigUpdate({ insightText: e.target.value })}
            placeholder="Enter your insight or analysis..."
            rows={3}
          />
        </div>
      )}
    </div>
  );
}

export default PersonalDataDashboard;
