import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTools } from "@/contexts/ToolsContext";
import ToolView from "@/components/ToolView";

interface ToolPageProps {
  toolId: string;
}

const ToolPage = ({ toolId }: ToolPageProps) => {
  const { getToolById, setActiveTool, activeTool } = useTools();
  const navigate = useNavigate();

  // Set the active tool when the component mounts or tool ID changes
  useEffect(() => {
    // If tool doesn't exist, redirect to 404
    const tool = getToolById(toolId);
    if (!tool) {
      navigate("/not-found", { replace: true });
      return;
    }

    console.log(`ToolPage: Setting active tool to ${toolId}`);

    // Activate the tool
    setActiveTool(toolId);

    // Cleanup when unmounting
    return () => {
      // Only clear if we're the active tool
      if (activeTool?.id === toolId) {
        setActiveTool(null);
      }
    };
  }, [toolId, getToolById, setActiveTool, navigate, activeTool]);

  return <ToolView />;
};

export default ToolPage;
