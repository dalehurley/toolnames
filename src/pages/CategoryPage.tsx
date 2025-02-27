import { useEffect } from "react";
import { useTools } from "@/contexts/ToolsContext";
import { getCategoryName } from "@/contexts/toolsData";
import { ToolGrid } from "@/components/ToolGrid";

interface CategoryPageProps {
  category: string;
}

const CategoryPage = ({ category }: CategoryPageProps) => {
  const { setFilterCategory } = useTools();

  // Set the filter category when the component mounts or category changes
  useEffect(() => {
    setFilterCategory(category);

    // Set the document title directly
    document.title = getCategoryTitle();
  }, [category, setFilterCategory]);

  // Generate SEO title based on category
  const getCategoryTitle = () => {
    const categoryName = getCategoryName(category);
    return `${categoryName} - Free Online ${categoryName} Tools | ToolNames`;
  };

  return (
    <div className="space-y-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{getCategoryName(category)}</h1>
        <p className="text-muted-foreground">
          Browse all tools in the {getCategoryName(category).toLowerCase()}{" "}
          category
        </p>
      </div>

      <ToolGrid />
    </div>
  );
};

export default CategoryPage;
