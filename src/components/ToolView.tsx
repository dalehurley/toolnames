import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTools } from "@/contexts/ToolsContext";
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  Heart,
  Home,
} from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const categoryNames: Record<string, string> = {
  calculators: "Calculators",
  converters: "Converters",
  generators: "Generators",
  utilities: "Utilities",
  "file-tools": "File Tools",
  seo: "SEO Tools",
};

const categoryPaths: Record<string, string> = {
  calculators: "/calculators",
  converters: "/converters",
  generators: "/generators",
  utilities: "/utilities",
  "file-tools": "/file-tools",
  seo: "/seo",
};

export const ToolView = () => {
  const { activeTool, tools, isFavorite, toggleFavorite, addRecentlyUsed } =
    useTools();
  const navigate = useNavigate();
  const location = useLocation();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (activeTool && activeTool.pageTitle) {
      document.title = activeTool.pageTitle;
    }
  }, [activeTool, location.pathname]);

  // Track recently used when a tool is viewed
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (activeTool) {
      addRecentlyUsed(activeTool.id);
    }
  }, [activeTool?.id]);

  if (!activeTool) {
    return null;
  }

  const ToolComponent = activeTool.component;
  const categoryLabel = categoryNames[activeTool.category] || activeTool.category;
  const categoryPath = categoryPaths[activeTool.category] || "/";
  const fav = isFavorite(activeTool.id);

  const handleBack = () => {
    const pathParts = location.pathname.split("/");
    if (pathParts.length > 2 && pathParts[1]) {
      navigate(`/${pathParts[1]}`);
    } else {
      navigate("/");
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore clipboard errors
    }
  };

  // Related tools: same category, excluding current tool (up to 3)
  const relatedTools = tools
    .filter((t) => t.category === activeTool.category && t.id !== activeTool.id)
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav
        className="flex items-center gap-1 text-sm text-muted-foreground"
        aria-label="Breadcrumb"
      >
        <Link to="/" className="flex items-center hover:text-foreground gap-1">
          <Home className="h-3.5 w-3.5" />
          <span>Home</span>
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link to={categoryPath} className="hover:text-foreground">
          {categoryLabel}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-medium truncate max-w-[200px]">
          {activeTool.title}
        </span>
      </nav>

      {/* Tool header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBack}
            className="flex items-center gap-1 shrink-0"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <activeTool.icon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{activeTool.title}</h1>
                {activeTool.isNew && (
                  <Badge className="bg-green-500 hover:bg-green-600 text-white text-xs">
                    New
                  </Badge>
                )}
                {activeTool.isPopular && !activeTool.isNew && (
                  <Badge className="bg-amber-500 hover:bg-amber-600 text-white text-xs">
                    Popular
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground text-sm">
                {activeTool.description}
              </p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleFavorite(activeTool.id)}
            aria-label={fav ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart
              className={`h-4 w-4 ${fav ? "fill-red-500 text-red-500" : ""}`}
            />
            <span className="ml-1.5 hidden sm:inline">
              {fav ? "Saved" : "Save"}
            </span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyUrl}
            aria-label="Copy link to this tool"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            <span className="ml-1.5 hidden sm:inline">
              {copied ? "Copied!" : "Share"}
            </span>
          </Button>
        </div>
      </div>

      {/* Tool component */}
      <div className="pb-8">
        <ToolComponent />
      </div>

      {/* Related tools */}
      {relatedTools.length > 0 && (
        <div className="border-t pt-8">
          <h2 className="text-xl font-semibold mb-4">Related Tools</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {relatedTools.map((tool) => (
              <Link
                key={tool.id}
                to={tool.url}
                className="no-underline text-foreground"
              >
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <tool.icon className="h-5 w-5 text-primary shrink-0" />
                      <div>
                        <CardTitle className="text-sm">{tool.title}</CardTitle>
                        <CardDescription className="text-xs mt-0.5">
                          {tool.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ToolView;
