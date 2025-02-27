import { useEffect } from "react";
import { useTools } from "@/contexts/ToolsContext";
import { ToolGrid } from "@/components/ToolGrid";

const HomePage = () => {
  const { setFilterCategory } = useTools();

  useEffect(() => {
    // Reset the filter category when the homepage loads
    setFilterCategory("all");

    // Set the document title directly
    document.title = "ToolNames - Free Browser-Based Tools and Utilities";
  }, [setFilterCategory]);

  return (
    <div className="space-y-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">All Tools</h1>
        <p className="text-muted-foreground">
          Browse our collection of free tools and utilities
        </p>
      </div>

      <ToolGrid />
    </div>
  );
};

export default HomePage;
