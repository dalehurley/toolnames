import { useState } from "react";
import { ToolCard } from "@/components/layout/ToolCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calculator,
  FileType,
  RotateCcw,
  Shapes,
  Settings,
} from "lucide-react";
import { useTools } from "@/contexts/ToolsContext";

export const HomePage = () => {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const { getToolsByCategory, setActiveTool } = useTools();

  // Filter tools by category
  const filteredTools = getToolsByCategory(activeCategory);

  const handleToolClick = (toolId: string) => {
    setActiveTool(toolId);
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold">ToolNames.com</h1>
        <p className="text-xl text-muted-foreground">
          A collection of free, client-side tools for everyday tasks
        </p>
      </div>

      <Tabs
        defaultValue="all"
        value={activeCategory}
        onValueChange={setActiveCategory}
      >
        <TabsList className="w-full justify-start overflow-auto">
          <TabsTrigger value="all">All Tools</TabsTrigger>
          <TabsTrigger value="calculators">
            <Calculator className="h-4 w-4 mr-2" />
            Calculators
          </TabsTrigger>
          <TabsTrigger value="file-tools">
            <FileType className="h-4 w-4 mr-2" />
            File Tools
          </TabsTrigger>
          <TabsTrigger value="converters">
            <RotateCcw className="h-4 w-4 mr-2" />
            Converters
          </TabsTrigger>
          <TabsTrigger value="generators">
            <Shapes className="h-4 w-4 mr-2" />
            Generators
          </TabsTrigger>
          <TabsTrigger value="utilities">
            <Settings className="h-4 w-4 mr-2" />
            Utilities
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeCategory} className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTools.map((tool) => (
              <ToolCard
                key={tool.id}
                icon={tool.icon}
                title={tool.title}
                description={tool.description}
                onClick={() => handleToolClick(tool.id)}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
