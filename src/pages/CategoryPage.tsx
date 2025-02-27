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
      <ToolGrid />
    </div>
  );
};

export default CategoryPage;
