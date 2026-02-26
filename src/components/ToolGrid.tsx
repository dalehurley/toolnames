import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Search, Star } from "lucide-react";
import { useTools } from "@/contexts/ToolsContext";
import { groupBy } from "lodash";
import { Tool } from "@/contexts/toolsData";

// Map category IDs to readable names (used throughout)
const categoryNames: Record<string, string> = {
  calculators: "Calculators",
  converters: "Converters",
  generators: "Generators",
  utilities: "Utilities",
  "file-tools": "File Tools",
  seo: "SEO Tools",
  productivity: "Productivity",
  design: "Design",
  lottery: "Lottery",
};

interface ToolCardProps {
  tool: Tool;
  isFav: boolean;
  onToggleFav: (e: React.MouseEvent) => void;
}

const ToolCard = ({ tool, isFav, onToggleFav }: ToolCardProps) => {
  const categoryLabel = categoryNames[tool.category] || tool.category;

  return (
    <div className="relative group">
      <Link to={tool.url} className="no-underline text-foreground block h-full">
        <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <tool.icon className="h-8 w-8 text-primary mb-2" />
              <div className="flex items-center gap-1">
                <Badge variant="outline" className="text-xs">
                  {categoryLabel}
                </Badge>
              </div>
            </div>
            <CardTitle className="text-base">{tool.title}</CardTitle>
            <CardDescription className="text-sm">{tool.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">Click to open tool</div>
          </CardContent>
        </Card>
      </Link>
      {/* Favorite button overlay */}
      <button
        onClick={onToggleFav}
        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10 p-1 rounded-full hover:bg-muted"
        aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
        title={isFav ? "Remove from favorites" : "Add to favorites"}
      >
        <Heart
          className={`h-4 w-4 ${isFav ? "fill-red-500 text-red-500" : "text-muted-foreground"}`}
        />
      </button>
    </div>
  );
};

export const ToolGrid = () => {
  const {
    filteredTools,
    filterCategory,
    searchQuery,
    isFavorite,
    toggleFavorite,
    favoriteTools,
    recentTools,
  } = useTools();

  const handleToggleFav = (e: React.MouseEvent, toolId: string) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(toolId);
  };

  // When searching, show all results flat with a "search results" heading
  if (searchQuery.trim()) {
    if (filteredTools.length === 0) {
      return (
        <div className="text-center py-16">
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">No results for "{searchQuery}"</h2>
          <p className="text-muted-foreground">Try a different search term or browse by category.</p>
        </div>
      );
    }

    return (
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold">
            Search results for "{searchQuery}"
          </h2>
          <p className="text-muted-foreground">
            {filteredTools.length} tool{filteredTools.length !== 1 ? "s" : ""} found
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.map((tool) => (
            <ToolCard
              key={tool.id}
              tool={tool}
              isFav={isFavorite(tool.id)}
              onToggleFav={(e) => handleToggleFav(e, tool.id)}
            />
          ))}
        </div>
      </div>
    );
  }

  // Group tools by category if we're showing all tools
  const groupedTools =
    filterCategory === "all"
      ? groupBy(filteredTools, "category")
      : { [filterCategory]: filteredTools };

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
    if (!tools || tools.length === 0) return null;
    const title = categoryNames[category] || category;

    return (
      <div key={category} className="mb-8">
        {filterCategory === "all" && (
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">{title}</h2>
              <div className="h-1 w-24 bg-primary mt-2 rounded-full" />
            </div>
            <Link
              to={`/${category}`}
              className="text-sm text-primary hover:underline"
            >
              View all {tools.length} →
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <ToolCard
              key={tool.id}
              tool={tool}
              isFav={isFavorite(tool.id)}
              onToggleFav={(e) => handleToggleFav(e, tool.id)}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div>
      {filterCategory === "all" ? (
        <>
          {/* Favorites section */}
          {favoriteTools.length > 0 && (
            <div className="mb-8">
              <div className="mb-4 flex items-center gap-2">
                <Heart className="h-5 w-5 fill-red-500 text-red-500" />
                <h2 className="text-2xl font-semibold">Favorites</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {favoriteTools.map((tool) => (
                  <ToolCard
                    key={tool.id}
                    tool={tool}
                    isFav={true}
                    onToggleFav={(e) => handleToggleFav(e, tool.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Recently used section */}
          {recentTools.length > 0 && (
            <div className="mb-8">
              <div className="mb-4 flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-500" />
                <h2 className="text-2xl font-semibold">Recently Used</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentTools.map((tool) => (
                  <ToolCard
                    key={tool.id}
                    tool={tool}
                    isFav={isFavorite(tool.id)}
                    onToggleFav={(e) => handleToggleFav(e, tool.id)}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="mb-6">
            <h2 className="text-3xl font-bold">All Tools</h2>
            <p className="text-muted-foreground">
              Browse our collection of {filteredTools.length} free browser-based tools including
              calculators, converters, generators, and utilities — all running
              locally for your privacy
            </p>
          </div>
        </>
      ) : (
        <div className="mb-6">
          <h2 className="text-3xl font-bold">
            {categoryNames[filterCategory] || filterCategory}
          </h2>
          <p className="text-muted-foreground">
            {filteredTools.length} tools available in the{" "}
            {categoryNames[filterCategory] || filterCategory} category
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
