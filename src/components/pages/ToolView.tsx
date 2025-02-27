import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useTools } from "@/contexts/ToolsContext";

export const ToolView = () => {
  const { activeTool, setActiveTool } = useTools();

  if (!activeTool) {
    return null;
  }

  const ToolComponent = activeTool.component;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setActiveTool(null)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{activeTool.title}</h1>
          <p className="text-muted-foreground">{activeTool.description}</p>
        </div>
      </div>

      <div className="mt-6">
        <ToolComponent />
      </div>
    </div>
  );
};
