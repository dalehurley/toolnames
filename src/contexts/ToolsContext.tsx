import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import { Tool, availableTools } from "@/contexts/toolsData";

const FAVORITES_KEY = "toolnames-favorites";
const RECENT_KEY = "toolnames-recent";
const MAX_RECENT = 5;

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
  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  // Favorites
  favorites: string[];
  toggleFavorite: (toolId: string) => void;
  isFavorite: (toolId: string) => boolean;
  favoriteTools: Tool[];
  // Recently used
  recentlyUsed: string[];
  addRecentlyUsed: (toolId: string) => void;
  recentTools: Tool[];
}

// Create context
const ToolsContext = createContext<ToolsContextType | undefined>(undefined);

// Provider component
export const ToolsProvider = ({ children }: { children: ReactNode }) => {
  const [activeToolId, setActiveToolId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [recentlyUsed, setRecentlyUsed] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(RECENT_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Persist favorites
  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }, [favorites]);

  // Persist recently used
  useEffect(() => {
    localStorage.setItem(RECENT_KEY, JSON.stringify(recentlyUsed));
  }, [recentlyUsed]);

  // Memoize the active tool to prevent unnecessary re-renders
  const activeTool = useMemo(() => {
    return activeToolId
      ? availableTools.find((tool) => tool.id === activeToolId) || null
      : null;
  }, [activeToolId]);

  // Create a stable callback for getting tools by category
  const getToolsByCategory = useCallback((category: string) => {
    return category === "all"
      ? availableTools
      : availableTools.filter((tool) => tool.category === category);
  }, []);

  // Create a function to get a tool by ID
  const getToolById = useCallback((id: string) => {
    return availableTools.find((tool) => tool.id === id) || null;
  }, []);

  // Memoize filtered tools - search overrides category filter
  const filteredTools = useMemo(() => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return availableTools.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
      );
    }
    return getToolsByCategory(filterCategory);
  }, [filterCategory, searchQuery, getToolsByCategory]);

  // Create a stable callback for setting the active tool
  const handleSetActiveTool = useCallback((toolId: string | null) => {
    setActiveToolId(toolId);
  }, []);

  // Create a stable callback for setting the filter category
  const handleSetFilterCategory = useCallback((category: string) => {
    setFilterCategory(category);
  }, []);

  // Favorites management
  const toggleFavorite = useCallback((toolId: string) => {
    setFavorites((prev) =>
      prev.includes(toolId) ? prev.filter((id) => id !== toolId) : [...prev, toolId]
    );
  }, []);

  const isFavorite = useCallback(
    (toolId: string) => favorites.includes(toolId),
    [favorites]
  );

  const favoriteTools = useMemo(
    () => availableTools.filter((t) => favorites.includes(t.id)),
    [favorites]
  );

  // Recently used management
  const addRecentlyUsed = useCallback((toolId: string) => {
    setRecentlyUsed((prev) => {
      const filtered = prev.filter((id) => id !== toolId);
      return [toolId, ...filtered].slice(0, MAX_RECENT);
    });
  }, []);

  const recentTools = useMemo(
    () =>
      recentlyUsed
        .map((id) => availableTools.find((t) => t.id === id))
        .filter((t): t is Tool => t !== undefined),
    [recentlyUsed]
  );

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
      searchQuery,
      setSearchQuery,
      favorites,
      toggleFavorite,
      isFavorite,
      favoriteTools,
      recentlyUsed,
      addRecentlyUsed,
      recentTools,
    }),
    [
      activeTool,
      handleSetActiveTool,
      getToolsByCategory,
      filterCategory,
      handleSetFilterCategory,
      filteredTools,
      getToolById,
      searchQuery,
      favorites,
      toggleFavorite,
      isFavorite,
      favoriteTools,
      recentlyUsed,
      addRecentlyUsed,
      recentTools,
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
