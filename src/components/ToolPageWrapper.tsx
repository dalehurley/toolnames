import { Suspense, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
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
import { availableTools } from "@/contexts/toolsData";
import { useToolsStore } from "@/stores/toolsStore";

const categoryNames: Record<string, string> = {
  calculators: "Calculators",
  converters: "Converters",
  generators: "Generators",
  utilities: "Utilities",
  "file-tools": "File Tools",
  seo: "SEO Tools",
  design: "Design",
  productivity: "Productivity",
  lottery: "Lottery",
  "html5-apis": "HTML5 APIs",
  "color-theory": "Color Theory",
};

const categoryPaths: Record<string, string> = {
  calculators: "/calculators",
  converters: "/converters",
  generators: "/generators",
  utilities: "/utilities",
  "file-tools": "/file-tools",
  seo: "/seo",
  design: "/design",
  productivity: "/productivity",
  lottery: "/lottery",
  "html5-apis": "/html5-apis",
  "color-theory": "/color-theory",
};

interface Props {
  toolId: string;
}

const Spinner = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
  </div>
);

export default function ToolPageWrapper({ toolId }: Props) {
  const { isFavorite, toggleFavorite, addRecentlyUsed } = useToolsStore();
  const [copied, setCopied] = useState(false);

  const tool = availableTools.find((t) => t.id === toolId);

  useEffect(() => {
    if (tool) {
      addRecentlyUsed(tool.id);
    }
  }, [tool?.id]);

  if (!tool) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Tool not found.</p>
        <a href="/" className="text-primary hover:underline mt-4 block">
          Return home
        </a>
      </div>
    );
  }

  const ToolComponent = tool.component;
  const categoryLabel = categoryNames[tool.category] || tool.category;
  const categoryPath = categoryPaths[tool.category] || "/";
  const fav = isFavorite(tool.id);

  const handleBack = () => {
    window.history.back();
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

  const relatedTools = availableTools
    .filter((t) => t.category === tool.category && t.id !== tool.id)
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav
        className="flex items-center gap-1 text-sm text-muted-foreground"
        aria-label="Breadcrumb"
      >
        <a href="/" className="flex items-center hover:text-foreground gap-1">
          <Home className="h-3.5 w-3.5" />
          <span>Home</span>
        </a>
        <ChevronRight className="h-3.5 w-3.5" />
        <a href={categoryPath} className="hover:text-foreground">
          {categoryLabel}
        </a>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-medium truncate max-w-[200px]">
          {tool.title}
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
              <tool.icon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{tool.title}</h1>
              <p className="text-muted-foreground text-sm">{tool.description}</p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleFavorite(tool.id)}
            aria-label={fav ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart className={`h-4 w-4 ${fav ? "fill-red-500 text-red-500" : ""}`} />
            <span className="ml-1.5 hidden sm:inline">{fav ? "Saved" : "Save"}</span>
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
            <span className="ml-1.5 hidden sm:inline">{copied ? "Copied!" : "Share"}</span>
          </Button>
        </div>
      </div>

      {/* Tool component */}
      <div className="pb-8">
        <Suspense fallback={<Spinner />}>
          <ToolComponent />
        </Suspense>
      </div>

      {/* Related tools */}
      {relatedTools.length > 0 && (
        <div className="border-t pt-8">
          <h2 className="text-xl font-semibold mb-4">Related Tools</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {relatedTools.map((related) => (
              <a
                key={related.id}
                href={related.url}
                className="no-underline text-foreground"
              >
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <related.icon className="h-5 w-5 text-primary shrink-0" />
                      <div>
                        <CardTitle className="text-sm">{related.title}</CardTitle>
                        <CardDescription className="text-xs mt-0.5">
                          {related.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
