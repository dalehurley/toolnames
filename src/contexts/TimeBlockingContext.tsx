import React, { createContext, useContext, useReducer, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { isSameDay } from "date-fns";

// Types
export interface TimeBlock {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  categoryId: string;
  energyLevel: number; // 1-5 scale
  isCompleted: boolean;
  isRecurring: boolean;
  recurrencePattern?: RecurrencePattern;
  actualStartTime?: Date;
  actualEndTime?: Date;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string; // Lucide icon name
  isVisible: boolean;
}

export interface RecurrencePattern {
  frequency: "daily" | "weekdays" | "weekly" | "monthly";
  endDate?: Date;
  daysOfWeek?: number[]; // 0-6, Sunday to Saturday
}

export interface EnergyPattern {
  timePoints: Array<{
    time: string; // HH:MM format
    level: number; // 1-5 scale
  }>;
}

export interface UserSettings {
  dayStartTime: string; // HH:MM format
  dayEndTime: string;
  timeIncrement: 5 | 15 | 30 | 60; // minutes
  defaultView: "day" | "week" | "month";
  showEnergyLevel: boolean;
  enableNotifications: boolean;
}

// Context state interface
interface TimeBlockingState {
  blocks: TimeBlock[];
  categories: Category[];
  energyPattern: EnergyPattern;
  settings: UserSettings;
  selectedDate: Date;
  currentView: "day" | "week" | "month";
  selectedBlockId: string | null;
  isAnalyticsVisible: boolean;
}

// Default values
const defaultCategories: Category[] = [
  {
    id: "work",
    name: "Work",
    color: "#4f46e5", // indigo-600
    icon: "Briefcase",
    isVisible: true,
  },
  {
    id: "personal",
    name: "Personal",
    color: "#10b981", // emerald-500
    icon: "User",
    isVisible: true,
  },
  {
    id: "health",
    name: "Health",
    color: "#ef4444", // red-500
    icon: "Heart",
    isVisible: true,
  },
  {
    id: "learning",
    name: "Learning",
    color: "#f59e0b", // amber-500
    icon: "BookOpen",
    isVisible: true,
  },
];

const defaultEnergyPattern: EnergyPattern = {
  timePoints: [
    { time: "06:00", level: 2 },
    { time: "09:00", level: 4 },
    { time: "12:00", level: 3 },
    { time: "15:00", level: 2 },
    { time: "18:00", level: 3 },
    { time: "21:00", level: 1 },
  ],
};

const defaultSettings: UserSettings = {
  dayStartTime: "06:00",
  dayEndTime: "22:00",
  timeIncrement: 30,
  defaultView: "day",
  showEnergyLevel: true,
  enableNotifications: true,
};

const initialState: TimeBlockingState = {
  blocks: [],
  categories: defaultCategories,
  energyPattern: defaultEnergyPattern,
  settings: defaultSettings,
  selectedDate: new Date(),
  currentView: "day",
  selectedBlockId: null,
  isAnalyticsVisible: false,
};

// Actions
type TimeBlockingAction =
  | { type: "ADD_BLOCK"; payload: TimeBlock }
  | { type: "UPDATE_BLOCK"; payload: TimeBlock }
  | { type: "DELETE_BLOCK"; payload: string }
  | { type: "SET_VIEW"; payload: "day" | "week" | "month" }
  | { type: "SET_DATE"; payload: Date }
  | { type: "ADD_CATEGORY"; payload: Category }
  | { type: "UPDATE_CATEGORY"; payload: Category }
  | { type: "DELETE_CATEGORY"; payload: string }
  | { type: "TOGGLE_CATEGORY_VISIBILITY"; payload: string }
  | { type: "UPDATE_ENERGY_PATTERN"; payload: EnergyPattern }
  | { type: "UPDATE_SETTINGS"; payload: Partial<UserSettings> }
  | { type: "SET_SELECTED_BLOCK"; payload: string | null }
  | { type: "TOGGLE_ANALYTICS"; payload?: boolean };

// Reducer
const timeBlockingReducer = (
  state: TimeBlockingState,
  action: TimeBlockingAction
): TimeBlockingState => {
  switch (action.type) {
    case "ADD_BLOCK":
      return {
        ...state,
        blocks: [...state.blocks, action.payload],
      };

    case "UPDATE_BLOCK":
      return {
        ...state,
        blocks: state.blocks.map((block) =>
          block.id === action.payload.id ? action.payload : block
        ),
      };

    case "DELETE_BLOCK":
      return {
        ...state,
        blocks: state.blocks.filter((block) => block.id !== action.payload),
        selectedBlockId:
          state.selectedBlockId === action.payload
            ? null
            : state.selectedBlockId,
      };

    case "SET_VIEW":
      return {
        ...state,
        currentView: action.payload,
      };

    case "SET_DATE":
      return {
        ...state,
        selectedDate: action.payload,
      };

    case "ADD_CATEGORY":
      return {
        ...state,
        categories: [...state.categories, action.payload],
      };

    case "UPDATE_CATEGORY":
      return {
        ...state,
        categories: state.categories.map((category) =>
          category.id === action.payload.id ? action.payload : category
        ),
      };

    case "DELETE_CATEGORY":
      return {
        ...state,
        categories: state.categories.filter(
          (category) => category.id !== action.payload
        ),
        blocks: state.blocks.map((block) => {
          if (block.categoryId === action.payload) {
            return {
              ...block,
              categoryId: state.categories[0]?.id || "default",
            };
          }
          return block;
        }),
      };

    case "TOGGLE_CATEGORY_VISIBILITY":
      return {
        ...state,
        categories: state.categories.map((category) =>
          category.id === action.payload
            ? { ...category, isVisible: !category.isVisible }
            : category
        ),
      };

    case "UPDATE_ENERGY_PATTERN":
      return {
        ...state,
        energyPattern: action.payload,
      };

    case "UPDATE_SETTINGS":
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      };

    case "SET_SELECTED_BLOCK":
      return {
        ...state,
        selectedBlockId: action.payload,
      };

    case "TOGGLE_ANALYTICS":
      return {
        ...state,
        isAnalyticsVisible:
          action.payload !== undefined
            ? action.payload
            : !state.isAnalyticsVisible,
      };

    default:
      return state;
  }
};

// Create storage keys
const STORAGE_KEY = "timeBlockingData";

// Context
interface TimeBlockingContextType {
  state: TimeBlockingState;
  dispatch: React.Dispatch<TimeBlockingAction>;
  createBlock: (blockData: Omit<TimeBlock, "id">) => void;
  updateBlock: (block: TimeBlock) => void;
  deleteBlock: (blockId: string) => void;
  getVisibleBlocks: () => TimeBlock[];
  toggleCategoryVisibility: (categoryId: string) => void;
  toggleAnalytics: () => void;
}

const TimeBlockingContext = createContext<TimeBlockingContextType | undefined>(
  undefined
);

export const TimeBlockingProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Load data from localStorage
  const loadInitialState = (): TimeBlockingState => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const parsedData = JSON.parse(savedData);

        // Convert string dates back to Date objects
        return {
          ...parsedData,
          blocks: parsedData.blocks.map(
            (block: {
              startTime: string;
              endTime: string;
              actualStartTime?: string;
              actualEndTime?: string;
              [key: string]: any;
            }) => ({
              ...block,
              startTime: new Date(block.startTime),
              endTime: new Date(block.endTime),
              actualStartTime: block.actualStartTime
                ? new Date(block.actualStartTime)
                : undefined,
              actualEndTime: block.actualEndTime
                ? new Date(block.actualEndTime)
                : undefined,
            })
          ),
          selectedDate: new Date(parsedData.selectedDate),
        };
      }
    } catch (error) {
      console.error("Error loading time blocking data:", error);
    }
    return initialState;
  };

  const [state, dispatch] = useReducer(timeBlockingReducer, loadInitialState());

  // Save data to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error("Error saving time blocking data:", error);
    }
  }, [state]);

  // Helper functions
  const createBlock = (blockData: Omit<TimeBlock, "id">) => {
    const newBlock: TimeBlock = {
      ...blockData,
      id: uuidv4(),
    };
    dispatch({ type: "ADD_BLOCK", payload: newBlock });
    return newBlock;
  };

  const updateBlock = (block: TimeBlock) => {
    dispatch({ type: "UPDATE_BLOCK", payload: block });
  };

  const deleteBlock = (blockId: string) => {
    dispatch({ type: "DELETE_BLOCK", payload: blockId });
  };

  const toggleCategoryVisibility = (categoryId: string) => {
    dispatch({ type: "TOGGLE_CATEGORY_VISIBILITY", payload: categoryId });
  };

  const toggleAnalytics = () => {
    dispatch({ type: "TOGGLE_ANALYTICS" });
  };

  // Get blocks filtered by current view and visible categories
  const getVisibleBlocks = () => {
    const visibleCategoryIds = state.categories
      .filter((category) => category.isVisible)
      .map((category) => category.id);

    let filteredBlocks = state.blocks.filter((block) =>
      visibleCategoryIds.includes(block.categoryId)
    );

    if (state.currentView === "day") {
      // For day view, get blocks for the selected day
      filteredBlocks = filteredBlocks.filter((block) =>
        isSameDay(block.startTime, state.selectedDate)
      );
    } else if (state.currentView === "week") {
      // For week view, get blocks from the week of selected date
      // This would require additional date-fns utility functions
      // to filter blocks for the week containing the selected date
    } else if (state.currentView === "month") {
      // For month view, get blocks from the month of selected date
      // This would require additional date-fns utility functions
      // to filter blocks for the month containing the selected date
    }

    return filteredBlocks;
  };

  const contextValue: TimeBlockingContextType = {
    state,
    dispatch,
    createBlock,
    updateBlock,
    deleteBlock,
    getVisibleBlocks,
    toggleCategoryVisibility,
    toggleAnalytics,
  };

  return (
    <TimeBlockingContext.Provider value={contextValue}>
      {children}
    </TimeBlockingContext.Provider>
  );
};

// Custom hook for using the TimeBlockingContext
export const useTimeBlocking = () => {
  const context = useContext(TimeBlockingContext);
  if (context === undefined) {
    throw new Error(
      "useTimeBlocking must be used within a TimeBlockingProvider"
    );
  }
  return context;
};
