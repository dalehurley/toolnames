import { FC, useState } from "react";
import { CustomizationOptions, ViewportSize } from "../hooks/useComponentState";
import { getTemplateById } from "../utils/componentTemplates";
import { combineClasses } from "../hooks/useCodeGenerator";
import { MoonIcon, SunIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ComponentCanvasProps {
  componentType: string;
  customizationOptions: CustomizationOptions;
  viewport: ViewportSize;
  fullScreen?: boolean;
}

export const ComponentCanvas: FC<ComponentCanvasProps> = ({
  componentType,
  customizationOptions,
  viewport,
  fullScreen = false,
}) => {
  // State for theme toggle
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Get component template
  const template = getTemplateById(componentType);

  // Generate tailwind classes based on customization
  const tailwindClasses = combineClasses(customizationOptions, componentType);

  // Determine the appropriate container styles based on viewport
  const containerClasses = {
    mobile: "w-full max-w-[375px]",
    tablet: "w-full max-w-[768px]",
    desktop: fullScreen ? "w-full" : "w-full max-w-[1200px]",
  };

  // Viewport dimension labels
  const viewportDimensions = {
    mobile: "375px",
    tablet: "768px",
    desktop: "1200px+",
  };

  return (
    <div className={`${containerClasses[viewport]} mx-auto`}>
      {/* Theme toggle control */}
      <div className="flex justify-end mb-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          className="text-xs flex items-center gap-1"
        >
          {theme === "light" ? <MoonIcon size={14} /> : <SunIcon size={14} />}
          {theme === "light" ? "Dark Mode" : "Light Mode"}
        </Button>
      </div>

      <div
        className={`p-8 rounded-md transition-colors duration-300 ${
          theme === "dark" ? "bg-gray-800" : "bg-gray-100"
        }`}
      >
        {/* Component display container */}
        <div className="flex justify-center items-center min-h-[200px]">
          {template ? (
            <div
              className={tailwindClasses}
              dangerouslySetInnerHTML={{ __html: template.defaultContent }}
            />
          ) : (
            <div
              className={`text-center ${
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              }`}
            >
              No template found for this component type
            </div>
          )}
        </div>

        {/* Viewport indicator */}
        <div
          className={`text-xs mt-4 text-center ${
            theme === "dark" ? "text-gray-400" : "text-gray-500"
          }`}
        >
          Viewport: {viewport.charAt(0).toUpperCase() + viewport.slice(1)} (
          {viewportDimensions[viewport]})
        </div>
      </div>
    </div>
  );
};
