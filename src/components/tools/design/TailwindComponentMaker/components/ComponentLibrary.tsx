import { FC, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SavedComponent } from "../hooks/useComponentState";
import { formatDistanceToNow } from "date-fns";
import {
  Search,
  Grid2X2,
  List,
  CheckCircle2,
  Trash2,
  ArrowUpRight,
} from "lucide-react";
import { combineClasses } from "../hooks/useCodeGenerator";
import { getTemplateById } from "../utils/componentTemplates";

interface ComponentLibraryProps {
  savedComponents: SavedComponent[];
  loadComponent: (id: string) => boolean;
  deleteComponent: (id: string) => void;
  setActiveTab: (tab: string) => void;
}

export const ComponentLibrary: FC<ComponentLibraryProps> = ({
  savedComponents,
  loadComponent,
  deleteComponent,
  setActiveTab,
}) => {
  // State for filtering and view options
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"newest" | "name">("newest");

  // Format date
  const formatDate = (timestamp: number): string => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  // Filter and sort components
  const filteredComponents = savedComponents
    .filter((component) => {
      if (!searchTerm) return true;
      return (
        component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        component.componentType.toLowerCase().includes(searchTerm.toLowerCase())
      );
    })
    .sort((a, b) => {
      if (sortBy === "newest") {
        return b.createdAt - a.createdAt;
      } else {
        return a.name.localeCompare(b.name);
      }
    });

  // Get component preview HTML
  const getComponentPreview = (component: SavedComponent): string => {
    const template = getTemplateById(component.componentType);
    return template?.defaultContent || "No preview available";
  };

  // Handle component load
  const handleLoadComponent = (id: string) => {
    const success = loadComponent(id);
    if (success) {
      setActiveTab("design");
    }
  };

  // If no saved components, show empty state
  if (savedComponents.length === 0) {
    return (
      <div className="text-center py-16 border rounded-md bg-gray-50">
        <div className="w-16 h-16 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={32} />
        </div>
        <h3 className="text-xl font-medium mb-2">No saved components</h3>
        <p className="text-gray-500 mb-6 max-w-md mx-auto">
          Save your components to build a reusable component library. Your saved
          components will appear here.
        </p>
        <Button onClick={() => setActiveTab("design")}>
          Create a Component
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and filter controls */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div className="relative w-full md:w-72">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={16}
          />
          <Input
            type="text"
            placeholder="Search components..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-3">
          <div>
            <Label htmlFor="sortBy" className="mr-2 text-sm">
              Sort by:
            </Label>
            <select
              id="sortBy"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "newest" | "name")}
              className="text-sm border rounded-md px-2 py-1"
            >
              <option value="newest">Newest</option>
              <option value="name">Name</option>
            </select>
          </div>

          <div className="flex border rounded-md overflow-hidden">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="icon"
              onClick={() => setViewMode("grid")}
              className="h-8 w-8 rounded-none"
            >
              <Grid2X2 size={16} />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="icon"
              onClick={() => setViewMode("list")}
              className="h-8 w-8 rounded-none"
            >
              <List size={16} />
            </Button>
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-500">
        {filteredComponents.length}{" "}
        {filteredComponents.length === 1 ? "component" : "components"} found
      </div>

      {/* Component grid */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredComponents.map((component) => (
            <Card key={component.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center justify-between">
                  {component.name}
                </CardTitle>
                <CardDescription className="flex items-center text-xs">
                  {formatDate(component.createdAt)}
                </CardDescription>
              </CardHeader>

              <CardContent className="p-0">
                <div className="p-4 bg-gray-50 border-y flex items-center justify-center h-32 overflow-hidden">
                  <div
                    className={combineClasses(
                      component.customization,
                      component.componentType
                    )}
                    dangerouslySetInnerHTML={{
                      __html: getComponentPreview(component),
                    }}
                  />
                </div>

                <div className="p-3">
                  <div className="text-xs text-gray-500 mb-1">
                    <span className="font-medium">Type:</span>{" "}
                    {component.componentType
                      .split("-")
                      .map(
                        (word) => word.charAt(0).toUpperCase() + word.slice(1)
                      )
                      .join(" ")}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(component.customization.colors).map(
                      ([key, value]) => (
                        <div
                          key={key}
                          className="text-xs px-2 py-0.5 bg-gray-100 rounded-full"
                          title={`${key}: ${value}`}
                        >
                          {value.replace(/^(bg|text|border)-/, "")}
                        </div>
                      )
                    )}
                  </div>
                </div>
              </CardContent>

              <CardFooter className="pt-2 flex justify-between border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteComponent(component.id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 size={16} className="mr-1" />
                  Delete
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleLoadComponent(component.id)}
                >
                  <ArrowUpRight size={16} className="mr-1" />
                  Load
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        // List view
        <div className="space-y-2">
          {filteredComponents.map((component) => (
            <div
              key={component.id}
              className="border rounded-md p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="font-medium">{component.name}</div>
                <div className="text-xs text-gray-500 flex flex-wrap gap-x-3">
                  <span>Created {formatDate(component.createdAt)}</span>
                  <span>
                    Type:{" "}
                    {component.componentType
                      .split("-")
                      .map(
                        (word) => word.charAt(0).toUpperCase() + word.slice(1)
                      )
                      .join(" ")}
                  </span>
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteComponent(component.id)}
                >
                  <Trash2 size={16} className="mr-1" />
                  Delete
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleLoadComponent(component.id)}
                >
                  <ArrowUpRight size={16} className="mr-1" />
                  Load
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
