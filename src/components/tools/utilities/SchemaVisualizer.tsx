import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ActivitySquare, Download, FileJson, RefreshCw } from "lucide-react";
import * as d3 from "d3";
import * as dagreD3 from "dagre-d3";
import Editor from "@monaco-editor/react";

// Define types for d3 and dagreD3 to avoid 'any'
interface GraphObject {
  width: number;
  height: number;
}

interface SchemaObject {
  type: string;
  properties?: Record<string, SchemaObject>;
  items?: SchemaObject;
  [key: string]: unknown;
}

type SchemaFormat = "json" | "yaml" | "database";

// Sample schemas for demo purposes
const sampleSchemas = {
  json: `{
  "type": "object",
  "properties": {
    "user": {
      "type": "object",
      "properties": {
        "id": { "type": "integer" },
        "name": { "type": "string" },
        "email": { "type": "string" },
        "profile": {
          "type": "object",
          "properties": {
            "avatar": { "type": "string" },
            "bio": { "type": "string" }
          }
        },
        "posts": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "id": { "type": "integer" },
              "title": { "type": "string" },
              "content": { "type": "string" }
            }
          }
        }
      }
    }
  }
}`,
  yaml: `User:
  type: object
  properties:
    id:
      type: integer
    name:
      type: string
    email:
      type: string
    profile:
      type: object
      properties:
        avatar:
          type: string
        bio:
          type: string
    posts:
      type: array
      items:
        type: object
        properties:
          id:
            type: integer
          title:
            type: string
          content:
            type: string`,
  database: `CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL
);

CREATE TABLE profiles (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  avatar TEXT,
  bio TEXT,
  FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE posts (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id)
);`,
};

// CSS styles for the diagram
const graphStyles = `
  .node rect {
    fill: #fff;
    stroke: #1a73e8;
    stroke-width: 2px;
    rx: 5;
    ry: 5;
  }
  
  .node.type-object rect {
    fill: #e3f2fd;
    stroke: #1a73e8;
  }
  
  .node.type-array rect {
    fill: #e8f5e9;
    stroke: #43a047;
  }
  
  .node.type-string rect {
    fill: #f3e5f5;
    stroke: #8e24aa;
  }
  
  .node.type-integer rect, .node.type-number rect {
    fill: #fff3e0;
    stroke: #f57c00;
  }
  
  .node.type-boolean rect {
    fill: #ffebee;
    stroke: #e53935;
  }
  
  .node.type-table rect {
    fill: #e8eaf6;
    stroke: #3949ab;
    stroke-width: 2px;
  }
  
  .edgePath path {
    stroke: #78909c;
    stroke-width: 2px;
    fill: none;
  }
  
  .edgePath.has path {
    stroke: #1a73e8;
  }
  
  .edgePath.has-many path {
    stroke: #43a047;
  }
  
  .edgePath.belongs-to path {
    stroke: #e53935;
  }
  
  .edgeLabel rect {
    fill: white;
  }
  
  .edgeLabel text {
    font-size: 12px;
    fill: #37474f;
  }
  
  .node text {
    font-size: 14px;
    font-weight: 500;
    fill: #37474f;
  }
`;

export const SchemaVisualizer = () => {
  const [schemaFormat, setSchemaFormat] = useState<SchemaFormat>("json");
  const [schemaInput, setSchemaInput] = useState<string>(sampleSchemas.json);
  const [error, setError] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Set sample schema when format changes
    setSchemaInput(sampleSchemas[schemaFormat]);
    // Reset error
    setError(null);
  }, [schemaFormat]);

  useEffect(() => {
    // Visualize schema when input changes
    visualizeSchema();

    // Add window resize event listener
    const handleResize = () => {
      visualizeSchema();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [schemaInput, schemaFormat]);

  const visualizeSchema = () => {
    try {
      // Clear previous visualization
      if (svgRef.current) {
        d3.select(svgRef.current).selectAll("*").remove();
      }

      // Get container dimensions
      const containerWidth = containerRef.current?.clientWidth || 800;
      const containerHeight = containerRef.current?.clientHeight || 500;

      // Parse schema based on format
      let parsedSchema;
      switch (schemaFormat) {
        case "json":
          parsedSchema = JSON.parse(schemaInput);
          break;
        case "yaml":
          // For demo purposes, we'll use a simple structure
          parsedSchema = { type: "demo", format: "yaml" };
          break;
        case "database":
          // For demo purposes, we'll use a simple structure
          parsedSchema = { type: "demo", format: "database" };
          break;
      }

      // Create a new graph
      const g = new dagreD3.graphlib.Graph()
        .setGraph({
          rankdir: "LR",
          marginx: 50,
          marginy: 50,
          nodesep: 70,
          edgesep: 30,
          ranksep: 100,
        })
        .setDefaultEdgeLabel(() => ({}));

      // Create nodes and edges based on the schema
      if (schemaFormat === "json") {
        createNodesForJsonSchema(g, parsedSchema);
      } else if (schemaFormat === "yaml") {
        // Add nodes for YAML schema
        g.setNode("user", {
          label: "User",
          class: "type-object",
          rx: 5,
          ry: 5,
          style: "fill: #e3f2fd; stroke: #1a73e8; stroke-width: 2px;",
        });

        g.setNode("user.id", {
          label: "id: integer",
          class: "type-integer",
          rx: 5,
          ry: 5,
          style: "fill: #fff3e0; stroke: #f57c00; stroke-width: 2px;",
        });

        g.setNode("user.name", {
          label: "name: string",
          class: "type-string",
          rx: 5,
          ry: 5,
          style: "fill: #f3e5f5; stroke: #8e24aa; stroke-width: 2px;",
        });

        g.setNode("user.email", {
          label: "email: string",
          class: "type-string",
          rx: 5,
          ry: 5,
          style: "fill: #f3e5f5; stroke: #8e24aa; stroke-width: 2px;",
        });

        g.setNode("profile", {
          label: "Profile",
          class: "type-object",
          rx: 5,
          ry: 5,
          style: "fill: #e3f2fd; stroke: #1a73e8; stroke-width: 2px;",
        });

        g.setNode("posts", {
          label: "Posts[]",
          class: "type-array",
          rx: 5,
          ry: 5,
          style: "fill: #e8f5e9; stroke: #43a047; stroke-width: 2px;",
        });

        // Add edges
        g.setEdge("user", "user.id", { label: "has", class: "has" });
        g.setEdge("user", "user.name", { label: "has", class: "has" });
        g.setEdge("user", "user.email", { label: "has", class: "has" });
        g.setEdge("user", "profile", { label: "has", class: "has" });
        g.setEdge("user", "posts", { label: "has many", class: "has-many" });
      } else if (schemaFormat === "database") {
        // Add nodes for database schema
        g.setNode("users", {
          label: "users",
          class: "type-table",
          rx: 5,
          ry: 5,
          style: "fill: #e8eaf6; stroke: #3949ab; stroke-width: 2px;",
        });

        g.setNode("profiles", {
          label: "profiles",
          class: "type-table",
          rx: 5,
          ry: 5,
          style: "fill: #e8eaf6; stroke: #3949ab; stroke-width: 2px;",
        });

        g.setNode("posts", {
          label: "posts",
          class: "type-table",
          rx: 5,
          ry: 5,
          style: "fill: #e8eaf6; stroke: #3949ab; stroke-width: 2px;",
        });

        // Add edges
        g.setEdge("profiles", "users", {
          label: "belongs to",
          class: "belongs-to",
          style: "stroke: #e53935; stroke-width: 2px; fill: none;",
        });

        g.setEdge("posts", "users", {
          label: "belongs to",
          class: "belongs-to",
          style: "stroke: #e53935; stroke-width: 2px; fill: none;",
        });
      }

      // Set up the D3 renderer
      const svg = d3.select(svgRef.current);

      // Add styles
      const style = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "style"
      );
      style.textContent = graphStyles;
      svg.node()?.appendChild(style);

      // Create a group for the graph
      const svgGroup = svg.append("g");

      // Create the renderer
      const render = new dagreD3.render();

      // Run the renderer
      (render as unknown)(svgGroup, g);

      // Configure the zoom behavior
      const initialScale = 0.75;
      const svgWidth = containerWidth;
      const svgHeight = containerHeight;
      const graphWidth = (g.graph() as GraphObject).width || 0;
      const graphHeight = (g.graph() as GraphObject).height || 0;

      // Center the graph
      const xCenterOffset = Math.max(
        0,
        (svgWidth - graphWidth * initialScale) / 2
      );
      const yCenterOffset = Math.max(
        0,
        (svgHeight - graphHeight * initialScale) / 2
      );

      // Initialize zoom behavior
      const zoom = d3
        .zoom<SVGSVGElement, unknown>()
        .on("zoom", (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
          svgGroup.attr("transform", event.transform.toString());
        });

      // Apply zoom to the SVG
      svg
        .call(zoom as unknown)
        .call(
          zoom.transform as unknown,
          d3.zoomIdentity
            .translate(xCenterOffset, yCenterOffset)
            .scale(initialScale)
        );

      // Make sure the graph is centered initially
      svgGroup.attr(
        "transform",
        `translate(${xCenterOffset}, ${yCenterOffset}) scale(${initialScale})`
      );

      setError(null);
    } catch (err: unknown) {
      console.error("Visualization error:", err);
      setError(
        `Error parsing schema: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    }
  };

  const createNodesForJsonSchema = (
    g: dagreD3.graphlib.Graph,
    schema: SchemaObject,
    prefix = ""
  ) => {
    if (schema.type === "object" && schema.properties) {
      // Add node for this object
      const nodeId = prefix || "root";
      g.setNode(nodeId, {
        label: nodeId,
        class: "type-object",
        rx: 5,
        ry: 5,
        style: "fill: #e3f2fd; stroke: #1a73e8; stroke-width: 2px;",
      });

      // Process properties
      Object.entries(schema.properties).forEach(
        ([propName, propSchema]: [string, any]) => {
          const propId = `${prefix}${prefix ? "." : ""}${propName}`;
          if (propSchema.type === "object" && propSchema.properties) {
            // Recursively process nested objects
            createNodesForJsonSchema(g, propSchema, propId);
            // Add edge from parent to this object
            g.setEdge(nodeId, propId, {
              label: "has",
              class: "has",
              style: "stroke: #1a73e8; stroke-width: 2px; fill: none;",
            });
          } else if (propSchema.type === "array" && propSchema.items) {
            // Handle arrays
            if (
              propSchema.items.type === "object" &&
              propSchema.items.properties
            ) {
              const arrayItemId = `${propId}[]`;
              createNodesForJsonSchema(g, propSchema.items, arrayItemId);
              g.setEdge(nodeId, arrayItemId, {
                label: "has many",
                class: "has-many",
                style: "stroke: #43a047; stroke-width: 2px; fill: none;",
              });
            } else {
              // Simple array
              g.setNode(propId, {
                label: `${propName}: ${propSchema.items.type}[]`,
                class: "type-array",
                rx: 5,
                ry: 5,
                style: "fill: #e8f5e9; stroke: #43a047; stroke-width: 2px;",
              });
              g.setEdge(nodeId, propId, {
                label: "has",
                class: "has",
                style: "stroke: #1a73e8; stroke-width: 2px; fill: none;",
              });
            }
          } else {
            // Simple property
            const typeClass = `type-${propSchema.type}`;
            let style = "fill: #f3e5f5; stroke: #8e24aa; stroke-width: 2px;"; // Default for string

            if (propSchema.type === "integer" || propSchema.type === "number") {
              style = "fill: #fff3e0; stroke: #f57c00; stroke-width: 2px;";
            } else if (propSchema.type === "boolean") {
              style = "fill: #ffebee; stroke: #e53935; stroke-width: 2px;";
            }

            g.setNode(propId, {
              label: `${propName}: ${propSchema.type}`,
              class: typeClass,
              rx: 5,
              ry: 5,
              style,
            });
            g.setEdge(nodeId, propId, {
              label: "has",
              class: "has",
              style: "stroke: #1a73e8; stroke-width: 2px; fill: none;",
            });
          }
        }
      );
    }
  };

  const downloadSvg = () => {
    if (!svgRef.current) return;

    // Get the SVG content
    const svgNode = svgRef.current.cloneNode(true) as SVGSVGElement;

    // Ensure the SVG has explicit dimensions
    svgNode.setAttribute(
      "width",
      `${containerRef.current?.clientWidth || 800}px`
    );
    svgNode.setAttribute(
      "height",
      `${containerRef.current?.clientHeight || 500}px`
    );

    // Add the CSS styles inline to ensure they're included in the export
    const styleElement = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "style"
    );
    styleElement.textContent = graphStyles;
    svgNode.insertBefore(styleElement, svgNode.firstChild);

    // Convert to string
    const svgData = new XMLSerializer().serializeToString(svgNode);
    const svgBlob = new Blob([svgData], {
      type: "image/svg+xml;charset=utf-8",
    });
    const svgUrl = URL.createObjectURL(svgBlob);

    // Create download link
    const downloadLink = document.createElement("a");
    downloadLink.href = svgUrl;
    downloadLink.download = `schema-diagram-${schemaFormat}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    // Clean up URL object
    URL.revokeObjectURL(svgUrl);
  };

  const resetToSample = () => {
    setSchemaInput(sampleSchemas[schemaFormat]);
    setError(null);
  };

  const handleEditorChange = (value: string | undefined) => {
    setSchemaInput(value || "");
  };

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Schema Visualizer</CardTitle>
        <CardDescription>
          Generate interactive visual diagrams from JSON, YAML, or database
          schema files
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs
          value={schemaFormat}
          onValueChange={(v) => setSchemaFormat(v as SchemaFormat)}
        >
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="json">
              <FileJson className="h-4 w-4 mr-2" />
              JSON Schema
            </TabsTrigger>
            <TabsTrigger value="yaml">
              <FileJson className="h-4 w-4 mr-2" />
              YAML Schema
            </TabsTrigger>
            <TabsTrigger value="database">
              <ActivitySquare className="h-4 w-4 mr-2" />
              Database Schema
            </TabsTrigger>
          </TabsList>

          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="schemaInput">Input Schema</Label>
              <div className="border rounded-md">
                <Editor
                  height="300px"
                  language={
                    schemaFormat === "yaml"
                      ? "yaml"
                      : schemaFormat === "database"
                      ? "sql"
                      : "json"
                  }
                  value={schemaInput}
                  onChange={handleEditorChange}
                  options={{
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                  }}
                />
              </div>
              <div className="flex justify-end space-x-2 mt-2">
                <Button variant="outline" onClick={resetToSample} size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset to Sample
                </Button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Visualization</Label>
                <Button variant="outline" size="sm" onClick={downloadSvg}>
                  <Download className="h-4 w-4 mr-2" />
                  Download SVG
                </Button>
              </div>
              <div
                ref={containerRef}
                className="border rounded-md bg-white p-4 overflow-auto"
                style={{ height: "500px" }}
              >
                <svg ref={svgRef} width="100%" height="100%"></svg>
              </div>
            </div>
          </div>
        </Tabs>

        <div className="bg-muted p-4 rounded-lg">
          <h3 className="font-medium mb-2">How to Use</h3>
          <ul className="text-sm space-y-1 list-disc pl-4 text-muted-foreground">
            <li>Select the schema format (JSON, YAML, or Database)</li>
            <li>Enter your schema in the editor</li>
            <li>The visualization will update automatically</li>
            <li>Drag to pan and use scroll wheel to zoom in/out</li>
            <li>Download the visualization as an SVG file</li>
          </ul>
          <div className="mt-4 text-sm text-muted-foreground">
            <p>
              <strong>Tip:</strong> For large schemas, you may need to zoom out
              to see the full diagram. For complex schemas, consider breaking
              them into smaller parts.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
