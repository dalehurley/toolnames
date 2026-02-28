import { create } from "zustand";
import { persist } from "zustand/middleware";

const FAVORITES_KEY = "toolnames-favorites";
const RECENT_KEY = "toolnames-recent";
const MAX_RECENT = 5;

interface ToolsStore {
  favorites: string[];
  recentlyUsed: string[];
  searchQuery: string;
  filterCategory: string;
  toggleFavorite: (toolId: string) => void;
  isFavorite: (toolId: string) => boolean;
  addRecentlyUsed: (toolId: string) => void;
  setSearchQuery: (query: string) => void;
  setFilterCategory: (category: string) => void;
}

export const useToolsStore = create<ToolsStore>()(
  persist(
    (set, get) => ({
      favorites: [],
      recentlyUsed: [],
      searchQuery: "",
      filterCategory: "all",

      toggleFavorite: (toolId) =>
        set((s) => ({
          favorites: s.favorites.includes(toolId)
            ? s.favorites.filter((id) => id !== toolId)
            : [...s.favorites, toolId],
        })),

      isFavorite: (toolId) => get().favorites.includes(toolId),

      addRecentlyUsed: (toolId) =>
        set((s) => ({
          recentlyUsed: [
            toolId,
            ...s.recentlyUsed.filter((id) => id !== toolId),
          ].slice(0, MAX_RECENT),
        })),

      setSearchQuery: (query) => set({ searchQuery: query }),

      setFilterCategory: (category) => set({ filterCategory: category }),
    }),
    {
      name: "toolnames-zustand",
      // On first load, migrate from legacy separate localStorage keys
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        try {
          const legacyFavs = localStorage.getItem(FAVORITES_KEY);
          const legacyRecent = localStorage.getItem(RECENT_KEY);
          // Only migrate if Zustand store has empty data but legacy keys exist
          if (state.favorites.length === 0 && legacyFavs) {
            const parsed = JSON.parse(legacyFavs);
            if (Array.isArray(parsed) && parsed.length > 0) {
              useToolsStore.setState({ favorites: parsed });
            }
          }
          if (state.recentlyUsed.length === 0 && legacyRecent) {
            const parsed = JSON.parse(legacyRecent);
            if (Array.isArray(parsed) && parsed.length > 0) {
              useToolsStore.setState({ recentlyUsed: parsed });
            }
          }
        } catch {
          // ignore migration errors
        }
      },
    }
  )
);
