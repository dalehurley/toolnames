import { useEffect } from "react";
import { useTools } from "@/contexts/ToolsContext";
import { getCategoryName } from "@/contexts/toolsData";
import { ToolGrid } from "@/components/ToolGrid";

interface CategoryPageProps {
  category: string;
}

const categoryDescriptions: Record<string, string> = {
  calculators:
    "Solve everyday math problems — mortgages, BMI, compound interest, calories, and more. All calculations happen locally in your browser.",
  converters:
    "Convert units, colors, number bases, temperatures, and images between formats. Fast, private, and no sign-up required.",
  generators:
    "Generate passwords, QR codes, UUIDs, hashes, lorem ipsum text, and lottery numbers with a single click.",
  utilities:
    "Developer and power-user tools for formatting JSON, encoding/decoding data, counting characters, building charts, and more.",
  "file-tools":
    "Process images and CSV files entirely in your browser — no uploads, no cloud, complete privacy.",
  seo:
    "Analyze and improve your website's SEO with keyword density analysis, meta tag inspection, heading structure, and more.",
};

const CategoryPage = ({ category }: CategoryPageProps) => {
  const { setFilterCategory } = useTools();

  useEffect(() => {
    setFilterCategory(category);
    const categoryName = getCategoryName(category);
    document.title = `${categoryName} - Free Online ${categoryName} Tools | ToolNames`;
  }, [category, setFilterCategory]);

  const description = categoryDescriptions[category];

  return (
    <div className="space-y-4">
      {description && (
        <p className="text-muted-foreground max-w-2xl">{description}</p>
      )}
      <ToolGrid />
    </div>
  );
};

export default CategoryPage;
