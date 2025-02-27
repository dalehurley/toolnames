import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTools } from "@/contexts/ToolsContext";
import { groupBy } from "lodash";
import { Tool } from "@/contexts/toolsData";

export const ToolGrid = () => {
  const { filteredTools, filterCategory } = useTools();

  // Debug logging
  useEffect(() => {
    console.log("ToolGrid: Filtering by", filterCategory);
    console.log("ToolGrid: Showing", filteredTools.length, "tools");
  }, [filterCategory, filteredTools]);

  // Group tools by category if we're showing all tools
  const groupedTools =
    filterCategory === "all"
      ? groupBy(filteredTools, "category")
      : { [filterCategory]: filteredTools };

  // Map category IDs to readable names
  const categoryNames: Record<string, string> = {
    calculators: "Calculators",
    converters: "Converters",
    generators: "Generators",
    utilities: "Utilities",
    "file-tools": "File Tools",
  };

  // Handle the case of no tools in a category
  if (filteredTools.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">No Tools Found</h2>
        <p className="text-muted-foreground">
          There are no tools available in this category yet.
        </p>
      </div>
    );
  }

  // Function to render a group of tools
  const renderToolGroup = (category: string, tools: Tool[]) => {
    // Skip rendering if the category has no tools
    if (!tools || tools.length === 0) return null;

    const title = categoryNames[category] || category;

    return (
      <div key={category} className="mb-8">
        {filterCategory === "all" && (
          <div className="mb-4">
            <h2 className="text-2xl font-semibold">{title}</h2>
            <div className="h-1 w-24 bg-primary mt-2 rounded-full"></div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <Link
              key={tool.id}
              to={tool.url}
              className="no-underline text-foreground"
            >
              <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <tool.icon className="h-8 w-8 text-primary mb-2" />
                    <Badge variant="outline">{title}</Badge>
                  </div>
                  <CardTitle>{tool.title}</CardTitle>
                  <CardDescription>{tool.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    Click to open tool
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div>
      {filterCategory === "all" ? (
        <div className="mb-6">
          <h2 className="text-3xl font-bold">All Tools</h2>
          <p className="text-muted-foreground">
            Select a tool or use the navigation to filter by category
          </p>
        </div>
      ) : (
        <div className="mb-6">
          <h2 className="text-3xl font-bold">
            {categoryNames[filterCategory] || filterCategory}
          </h2>
          <p className="text-muted-foreground">
            {filteredTools.length} tools available in this category
          </p>
        </div>
      )}

      {Object.entries(groupedTools).map(([category, tools]) =>
        renderToolGroup(category, tools as Tool[])
      )}
    </div>
  );
};

export default ToolGrid;
