import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { useTools } from "@/contexts/ToolsContext";
import { ChevronLeft } from "lucide-react";
import { useEffect } from "react";

export const ToolView = () => {
  const { activeTool } = useTools();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Debug logging
    console.log("ToolView: Active tool changed", activeTool?.id);
    console.log("ToolView: Current location", location.pathname);

    // Set document title if we have an active tool
    if (activeTool && activeTool.pageTitle) {
      document.title = activeTool.pageTitle;
    }
  }, [activeTool, location.pathname]);

  if (!activeTool) {
    return null;
  }

  const ToolComponent = activeTool.component;

  const handleBack = () => {
    console.log("Going back to category or home");

    // Determine where to navigate back to based on URL pattern
    const pathParts = location.pathname.split("/");
    if (pathParts.length > 2 && pathParts[1]) {
      // If we're in a path like /converters/unit-converter,
      // go back to the category page (/converters)
      navigate(`/${pathParts[1]}`);
    } else {
      // Default to homepage
      navigate("/");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handleBack}
          className="flex items-center space-x-2"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back</span>
        </Button>
      </div>

      <div className="pb-12">
        <ToolComponent />
      </div>
    </div>
  );
};

export default ToolView;
