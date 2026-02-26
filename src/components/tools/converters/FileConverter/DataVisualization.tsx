import React, { useState, useMemo, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, LineChart, BarChart2, PieChart, Network } from "lucide-react";
import { Bar, Line, Pie } from "react-chartjs-2";
import {
  ReactFlowProvider,
  ReactFlow,
  useNodesState,
  useEdgesState,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";

interface DataVisualizationProps {
  data: unknown;
  format: string;
  title?: string;
}

/**
 * DataVisualization component for visualizing different data formats
 */
export const DataVisualization: React.FC<DataVisualizationProps> = ({
  data,
  format,
  title = "Data Visualization",
}) => {
  const [chartType, setChartType] = useState<string>("bar");

  // Function to detect data type and recommend visualization
  const detectDataStructure = useMemo(() => {
    if (!data) return "unknown";

    try {
      // Parse data if it's a string
      const parsedData =
        typeof data === "string"
          ? format === "json"
            ? JSON.parse(data)
            : format === "csv"
            ? data.split("\n").map((line) => line.split(","))
            : data
          : data;

      // Array of objects (tabular data)
      if (
        Array.isArray(parsedData) &&
        parsedData.length > 0 &&
        typeof parsedData[0] === "object"
      ) {
        return "tabular";
      }

      // Simple array of values
      if (
        Array.isArray(parsedData) &&
        parsedData.length > 0 &&
        typeof parsedData[0] !== "object"
      ) {
        return "array";
      }

      // Nested object (tree/hierarchical data)
      if (
        !Array.isArray(parsedData) &&
        typeof parsedData === "object" &&
        parsedData !== null &&
        Object.keys(parsedData as object).some(
          (key) =>
            typeof (parsedData as Record<string, unknown>)[key] === "object" &&
            (parsedData as Record<string, unknown>)[key] !== null
        )
      ) {
        return "hierarchical";
      }

      // Simple key-value object
      if (!Array.isArray(parsedData) && typeof parsedData === "object") {
        return "key-value";
      }

      return "unknown";
    } catch (error) {
      void error; // Suppress unused variable warning
      return "unknown";
    }
  }, [data, format]);

  // Helper function to generate random colors
  const getRandomColor = (index: number): string => {
    const colors = [
      "rgba(255, 99, 132, 0.6)",
      "rgba(54, 162, 235, 0.6)",
      "rgba(255, 206, 86, 0.6)",
      "rgba(75, 192, 192, 0.6)",
      "rgba(153, 102, 255, 0.6)",
      "rgba(255, 159, 64, 0.6)",
      "rgba(199, 199, 199, 0.6)",
      "rgba(83, 102, 255, 0.6)",
      "rgba(40, 159, 64, 0.6)",
      "rgba(210, 199, 199, 0.6)",
    ];

    return colors[index % colors.length];
  };

  // Prepare chart data (for tabular and array data)
  const chartData = useMemo(() => {
    if (
      !data ||
      (detectDataStructure !== "tabular" &&
        detectDataStructure !== "array" &&
        detectDataStructure !== "key-value")
    )
      return null;

    try {
      let parsedData;
      const labels: string[] = [];
      const datasets: Array<{
        label: string;
        data: number[];
        backgroundColor: string | string[];
        borderColor: string | string[];
        borderWidth?: number;
      }> = [];

      // Parse data based on format
      if (typeof data === "string") {
        if (format === "json") {
          parsedData = JSON.parse(data);
        } else if (format === "csv") {
          // Parse CSV string to array
          const rows = data.split("\n").filter((row) => row.trim());
          const headers = rows[0].split(",").map((h) => h.trim());

          parsedData = rows.slice(1).map((row) => {
            const values = row.split(",").map((v) => v.trim());
            return headers.reduce<Record<string, string>>((obj, header, i) => {
              obj[header] = values[i];
              return obj;
            }, {});
          });
        } else {
          return null;
        }
      } else {
        parsedData = data;
      }

      // Handle different data structures
      if (detectDataStructure === "tabular") {
        // Use the first numeric column as data
        const firstItem = (parsedData as Record<string, unknown>[])[0];
        const keys = Object.keys(firstItem);

        // Find string column for labels and numeric columns for data
        const stringColumns = keys.filter(
          (key) =>
            typeof firstItem[key] === "string" ||
            (typeof firstItem[key] === "number" &&
              isNaN(Number(firstItem[key])))
        );

        const numericColumns = keys.filter(
          (key) => !isNaN(Number(firstItem[key]))
        );

        if (stringColumns.length && numericColumns.length) {
          (parsedData as Record<string, unknown>[]).forEach((item) => {
            labels.push(String(item[stringColumns[0]]));
          });

          numericColumns.forEach((column) => {
            datasets.push({
              label: column,
              data: (parsedData as Record<string, unknown>[]).map((item) =>
                Number(item[column])
              ),
              backgroundColor: getRandomColor(numericColumns.indexOf(column)),
              borderColor: getRandomColor(numericColumns.indexOf(column)),
            });
          });
        } else {
          // No suitable columns found
          (parsedData as unknown[]).forEach((_, i) =>
            labels.push(`Item ${i + 1}`)
          );
          datasets.push({
            label: "Values",
            data: (parsedData as unknown[]).map((_, i) => i + 1),
            backgroundColor: getRandomColor(0),
            borderColor: getRandomColor(0),
          });
        }
      } else if (detectDataStructure === "array") {
        // Simple array
        (parsedData as unknown[]).forEach((_, i) =>
          labels.push(`Item ${i + 1}`)
        );
        datasets.push({
          label: "Values",
          data: (parsedData as unknown[]).map((val) => Number(val) || 0),
          backgroundColor: getRandomColor(0),
          borderColor: getRandomColor(0),
        });
      } else if (detectDataStructure === "key-value") {
        // Key-value pairs
        Object.keys(parsedData as object).forEach((key) => labels.push(key));
        const values = Object.values(parsedData as object);

        datasets.push({
          label: "Values",
          data: values.map((val) =>
            typeof val === "number"
              ? val
              : !isNaN(Number(val))
              ? Number(val)
              : 0
          ),
          backgroundColor: labels.map((_, i) => getRandomColor(i)),
          borderColor: labels.map((_, i) => getRandomColor(i)),
        });
      }

      return {
        labels,
        datasets,
      };
    } catch (error) {
      void error; // Suppress unused variable warning
      console.error("Error preparing chart data:", error);
      return null;
    }
  }, [data, format, detectDataStructure]);

  // Tree data for hierarchical visualization
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Prepare hierarchical data for ReactFlow
  useEffect(() => {
    if (!data || detectDataStructure !== "hierarchical") return;

    try {
      const parsedData =
        typeof data === "string" && format === "json" ? JSON.parse(data) : data;

      // Process hierarchical data
      const newNodes: Array<{
        id: string;
        data: {
          label: string;
          value: unknown;
        };
        position: { x: number; y: number };
        style: React.CSSProperties;
      }> = [];

      const newEdges: Array<{
        id: string;
        source: string;
        target: string;
        markerEnd: {
          type: MarkerType;
        };
      }> = [];

      let nodeId = 0;

      const processObject = (
        obj: unknown,
        parentId: string | null = null,
        x = 0,
        y = 0,
        level = 0
      ) => {
        const currentId = `node-${nodeId++}`;
        const isRoot = parentId === null;

        // Add node
        newNodes.push({
          id: currentId,
          data: {
            label: isRoot ? "Root" : parentId!.split("-").pop() || "",
            value: typeof obj !== "object" ? obj : null,
          },
          position: { x: x * 250, y: y * 100 },
          style: {
            background: isRoot ? "#6366F1" : "#F59E0B",
            color: "white",
            border: "1px solid #e2e8f0",
            width: 180,
            padding: 10,
            borderRadius: 8,
          },
        });

        // Add edge from parent
        if (parentId !== null) {
          newEdges.push({
            id: `edge-${parentId}-${currentId}`,
            source: parentId,
            target: currentId,
            markerEnd: {
              type: MarkerType.ArrowClosed,
            },
          });
        }

        // Process children
        if (typeof obj === "object" && obj !== null) {
          const keys = Object.keys(obj as object);
          keys.forEach((key, i) => {
            const child = (obj as Record<string, unknown>)[key];
            const childNodeId = `node-${nodeId}`;

            // Add child node
            newNodes.push({
              id: childNodeId,
              data: {
                label: key,
                value: typeof child !== "object" ? String(child) : null,
              },
              position: {
                x: (x + i - keys.length / 2) * 200,
                y: (level + 1) * 100,
              },
              style: {
                background: typeof child === "object" ? "#8B5CF6" : "#10B981",
                color: "white",
                border: "1px solid #e2e8f0",
                width: typeof child === "object" ? 150 : 180,
                padding: 10,
                borderRadius: 8,
              },
            });

            // Add edge
            newEdges.push({
              id: `edge-${currentId}-${childNodeId}`,
              source: currentId,
              target: childNodeId,
              markerEnd: {
                type: MarkerType.ArrowClosed,
              },
            });

            // Recursively process nested objects
            if (typeof child === "object" && child !== null) {
              processObject(
                child,
                childNodeId,
                x + i - keys.length / 2,
                level + 2,
                level + 2
              );
            }
          });
        }
      };

      processObject(parsedData);
      setNodes(newNodes);
      setEdges(newEdges);
    } catch (error) {
      void error; // Suppress unused variable warning
      console.error("Error preparing hierarchical data:", error);
    }
  }, [data, format, detectDataStructure, setNodes, setEdges]);

  // Render appropriate visualization based on data type
  const renderVisualization = () => {
    if (!data)
      return (
        <div className="p-10 text-center text-muted-foreground">
          No data available for visualization
        </div>
      );

    const visType = detectDataStructure;

    switch (visType) {
      case "tabular":
      case "array":
      case "key-value": {
        if (!chartData)
          return (
            <div className="p-10 text-center text-muted-foreground">
              Cannot visualize this data structure
            </div>
          );

        switch (chartType) {
          case "bar":
            return (
              <div className="h-96 p-4">
                <Bar
                  data={chartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      title: {
                        display: true,
                        text: "Data Visualization",
                        font: { size: 16 },
                      },
                      legend: {
                        position: "top",
                      },
                    },
                  }}
                />
              </div>
            );
          case "line":
            return (
              <div className="h-96 p-4">
                <Line
                  data={chartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      title: {
                        display: true,
                        text: "Data Visualization",
                        font: { size: 16 },
                      },
                      legend: {
                        position: "top",
                      },
                    },
                  }}
                />
              </div>
            );
          case "pie": {
            // Adjust data for pie chart - use only first dataset
            const pieData = {
              labels: chartData.labels,
              datasets: [
                {
                  label: chartData.datasets[0]?.label || "Values",
                  data: chartData.datasets[0]?.data || [],
                  backgroundColor: chartData.datasets[0]?.backgroundColor || [],
                  borderWidth: 1,
                },
              ],
            };

            return (
              <div className="h-96 p-4">
                <Pie
                  data={pieData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      title: {
                        display: true,
                        text: "Data Distribution",
                        font: { size: 16 },
                      },
                      legend: {
                        position: "top",
                      },
                    },
                  }}
                />
              </div>
            );
          }
          default:
            return (
              <div className="p-10 text-center text-muted-foreground">
                Select a chart type
              </div>
            );
        }
      }

      case "hierarchical":
        return (
          <div className="h-[600px] border rounded-md bg-slate-50 dark:bg-slate-900">
            <ReactFlowProvider>
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                fitView
                attributionPosition="bottom-right"
                nodesDraggable={true}
              />
            </ReactFlowProvider>
          </div>
        );

      case "unknown":
      default:
        return (
          <div className="p-10 text-center text-muted-foreground">
            Cannot visualize this data structure
          </div>
        );
    }
  };

  // Determine available visualization types based on data structure
  const availableVisualizations = useMemo(() => {
    if (["tabular", "array", "key-value"].includes(detectDataStructure)) {
      return [
        {
          value: "bar",
          label: "Bar Chart",
          icon: <BarChart2 className="h-4 w-4" />,
        },
        {
          value: "line",
          label: "Line Chart",
          icon: <LineChart className="h-4 w-4" />,
        },
        {
          value: "pie",
          label: "Pie Chart",
          icon: <PieChart className="h-4 w-4" />,
        },
      ];
    }

    if (detectDataStructure === "hierarchical") {
      return [
        {
          value: "hierarchical",
          label: "Network Graph",
          icon: <Network className="h-4 w-4" />,
        },
      ];
    }

    return [];
  }, [detectDataStructure]);

  return (
    <Card>
      <CardHeader className="bg-slate-50 dark:bg-slate-900 border-b rounded-t-lg">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl flex items-center gap-2">
            <Eye className="h-5 w-5 text-indigo-500" />
            {title}
          </CardTitle>
          <div className="flex items-center space-x-2">
            {["tabular", "array", "key-value"].includes(
              detectDataStructure
            ) && (
              <Select value={chartType} onValueChange={setChartType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select chart type" />
                </SelectTrigger>
                <SelectContent>
                  {availableVisualizations.map((vis) => (
                    <SelectItem key={vis.value} value={vis.value}>
                      <div className="flex items-center gap-2">
                        {vis.icon}
                        <span>{vis.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
        <CardDescription>
          Visualizing data in {format.toUpperCase()} format
          {detectDataStructure !== "unknown" &&
            ` (detected as ${detectDataStructure} data)`}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">{renderVisualization()}</CardContent>
    </Card>
  );
};
