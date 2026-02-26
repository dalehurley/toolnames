import React, { createContext, useContext, useReducer, ReactNode } from "react";
import {
  OutputFormat,
  PatternConfig,
  PatternType,
  SavedPattern,
} from "@/types/pattern";
import { createDefaultLayer } from "@/utils/patternHelpers";

// State interface
interface PatternState {
  type: PatternType;
  config: PatternConfig;
  generatedCSS: string;
  outputFormat: OutputFormat;
  history: PatternConfig[];
  savedPatterns: SavedPattern[];
}

// Action types
type PatternAction =
  | { type: "SET_PATTERN_TYPE"; payload: PatternType }
  | { type: "UPDATE_CONFIG"; payload: Partial<PatternConfig> }
  | { type: "SET_GENERATED_CSS"; payload: string }
  | { type: "SET_OUTPUT_FORMAT"; payload: OutputFormat }
  | {
      type: "SAVE_PATTERN";
      payload: { id: string; name: string; config: PatternConfig };
    }
  | { type: "LOAD_PATTERN"; payload: PatternConfig }
  | { type: "RESET_PATTERN" }
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "DELETE_SAVED_PATTERN"; payload: string }; // pattern id

// Initial state
const initialState: PatternState = {
  type: "stripes",
  config: {
    colors: ["#3b82f6", "#ffffff"],
    size: 20,
    spacing: 20,
    rotation: 45,
    opacity: 1,
    direction: "diagonal",
    stripeWidth: 10,
  },
  generatedCSS: "",
  outputFormat: "css",
  history: [],
  savedPatterns: [],
};

// Helper to create type-specific default properties
const getTypeSpecificConfig = (type: PatternType): Partial<PatternConfig> => {
  switch (type) {
    case "stripes":
      return { direction: "diagonal", stripeWidth: 10 };
    case "dots":
      return { dotRadius: 5, staggered: false };
    case "grid":
      return { gridLineWidth: 1, checkerboard: false };
    case "geometric":
      return { shape: "triangle", density: 3 };
    case "waves":
      return { waveHeight: 20, waveCount: 3, waveType: "sine" };
    case "layered":
      return {
        layers: [createDefaultLayer("stripes"), createDefaultLayer("dots")],
      };
    default:
      return {};
  }
};

// Reducer function
const patternReducer = (
  state: PatternState,
  action: PatternAction
): PatternState => {
  let newPattern: SavedPattern;
  let previousConfig: PatternConfig;
  let newHistory: PatternConfig[];

  switch (action.type) {
    case "SET_PATTERN_TYPE": {
      const typeSpecificConfig = getTypeSpecificConfig(action.payload);
      return {
        ...state,
        type: action.payload,
        config: {
          ...state.config,
          ...typeSpecificConfig,
        },
        history: [...state.history, state.config].slice(-10), // Keep last 10 configs
      };
    }
    case "UPDATE_CONFIG":
      return {
        ...state,
        config: { ...state.config, ...action.payload },
        history: [...state.history, state.config].slice(-10), // Keep last 10 configs
      };
    case "SET_GENERATED_CSS":
      return {
        ...state,
        generatedCSS: action.payload,
      };
    case "SET_OUTPUT_FORMAT":
      return {
        ...state,
        outputFormat: action.payload,
      };
    case "SAVE_PATTERN":
      newPattern = {
        id: action.payload.id,
        name: action.payload.name,
        type: state.type,
        config: action.payload.config,
        css: state.generatedCSS,
        createdAt: Date.now(),
      };
      return {
        ...state,
        savedPatterns: [...state.savedPatterns, newPattern],
      };
    case "LOAD_PATTERN":
      return {
        ...state,
        config: action.payload,
        history: [...state.history, state.config].slice(-10), // Keep last 10 configs
      };
    case "RESET_PATTERN":
      return {
        ...initialState,
        savedPatterns: state.savedPatterns, // Keep saved patterns
      };
    case "UNDO":
      if (state.history.length === 0) return state;

      previousConfig = state.history[state.history.length - 1];
      newHistory = state.history.slice(0, -1);

      return {
        ...state,
        config: previousConfig,
        history: newHistory,
      };
    case "REDO":
      // Redo functionality would need an additional redo history stack
      // This is a placeholder for future implementation
      return state;
    case "DELETE_SAVED_PATTERN":
      return {
        ...state,
        savedPatterns: state.savedPatterns.filter(
          (pattern) => pattern.id !== action.payload
        ),
      };
    default:
      return state;
  }
};

// Context
const PatternContext = createContext<
  | {
      state: PatternState;
      dispatch: React.Dispatch<PatternAction>;
    }
  | undefined
>(undefined);

// Provider component
export const PatternProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(patternReducer, initialState);

  return (
    <PatternContext.Provider value={{ state, dispatch }}>
      {children}
    </PatternContext.Provider>
  );
};

// Custom hook to use the pattern context
export const usePattern = () => {
  const context = useContext(PatternContext);
  if (context === undefined) {
    throw new Error("usePattern must be used within a PatternProvider");
  }
  return context;
};
