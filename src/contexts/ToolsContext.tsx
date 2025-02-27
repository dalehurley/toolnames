import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useMemo,
} from "react";
import { Tool, availableTools } from "@/contexts/toolsData";

// Context type
interface ToolsContextType {
  activeTool: Tool | null;
  setActiveTool: (toolId: string | null) => void;
  tools: Tool[];
  getToolsByCategory: (category: string) => Tool[];
  filterCategory: string;
  setFilterCategory: (category: string) => void;
  filteredTools: Tool[];
  getToolById: (id: string) => Tool | null;
}

// Create context
const ToolsContext = createContext<ToolsContextType | undefined>(undefined);

// Provider component
export const ToolsProvider = ({ children }: { children: ReactNode }) => {
  const [activeToolId, setActiveToolId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");

  // Memoize the active tool to prevent unnecessary re-renders
  const activeTool = useMemo(() => {
    return activeToolId
      ? availableTools.find((tool) => tool.id === activeToolId) || null
      : null;
  }, [activeToolId]);

  // Create a stable callback for getting tools by category
  const getToolsByCategory = useCallback((category: string) => {
    console.log("Filtering by category:", category);
    return category === "all"
      ? availableTools
      : availableTools.filter((tool) => tool.category === category);
  }, []);

  // Create a function to get a tool by ID
  const getToolById = useCallback((id: string) => {
    return availableTools.find((tool) => tool.id === id) || null;
  }, []);

  // Memoize filtered tools to prevent unnecessary re-renders
  const filteredTools = useMemo(() => {
    return getToolsByCategory(filterCategory);
  }, [filterCategory, getToolsByCategory]);

  // Create a stable callback for setting the active tool
  const handleSetActiveTool = useCallback((toolId: string | null) => {
    console.log("Setting active tool:", toolId);
    setActiveToolId(toolId);
  }, []);

  // Create a stable callback for setting the filter category
  const handleSetFilterCategory = useCallback((category: string) => {
    console.log("Setting filter category:", category);
    setFilterCategory(category);
  }, []);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      activeTool,
      setActiveTool: handleSetActiveTool,
      tools: availableTools,
      getToolsByCategory,
      filterCategory,
      setFilterCategory: handleSetFilterCategory,
      filteredTools,
      getToolById,
    }),
    [
      activeTool,
      handleSetActiveTool,
      getToolsByCategory,
      filterCategory,
      handleSetFilterCategory,
      filteredTools,
      getToolById,
    ]
  );

  return (
    <ToolsContext.Provider value={contextValue}>
      {children}
    </ToolsContext.Provider>
  );
};

// Custom hook for consuming the context
// eslint-disable-next-line react-refresh/only-export-components
export const useTools = () => {
  const context = useContext(ToolsContext);
  if (context === undefined) {
    throw new Error("useTools must be used within a ToolsProvider");
  }
  return context;
};
