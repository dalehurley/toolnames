import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import {
  SpacingContextType,
  SpacingState,
  SpacingSystem,
  ScaleType,
  SpacingUnit,
  SpacingSnapshot,
} from "./types";

// Predefined spacing systems for comparison
const predefinedSystems: Record<string, SpacingSystem> = {
  tailwind: {
    name: "Tailwind CSS",
    scale: [
      0, 0.25, 0.5, 0.75, 1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10, 12, 14, 16, 20, 24,
      28, 32,
    ],
    unit: "rem",
    description:
      "Tailwind's spacing scale is used for padding, margin, width, height, etc.",
  },
  material: {
    name: "Material Design",
    scale: [0, 4, 8, 12, 16, 24, 32, 40, 48, 56, 64, 72, 80, 88, 96],
    unit: "px",
    description:
      "Material Design uses an 8pt grid system with 4pt allowance for specific cases.",
  },
  bootstrap: {
    name: "Bootstrap 5",
    scale: [0, 0.25, 0.5, 1, 1.5, 3],
    unit: "rem",
    description: "Bootstrap 5 uses a smaller spacing scale with rem units.",
  },
};

// Default spacing state
const defaultSpacingState: SpacingState = {
  marginTop: 16,
  marginRight: 16,
  marginBottom: 16,
  marginLeft: 16,
  paddingTop: 8,
  paddingRight: 8,
  paddingBottom: 8,
  paddingLeft: 8,
  borderWidth: 1,
  unit: "px",
  baseUnit: 4,
  scaleType: "linear",
  customScale: [0, 1, 2, 4, 8, 12, 16, 24, 32, 48, 64],
  scaleMultiplier: 1,
  prefixMargin: "m",
  prefixPadding: "p",
  includeDirectionalClasses: true,
  includeResponsiveVariants: false,
  responsiveBreakpoints: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    "2xl": 1536,
  },
  previewMode: "light",
  previewElementType: "div",
  previewContent: "Preview content",
  comparisonSystems: [
    predefinedSystems.tailwind,
    predefinedSystems.material,
    predefinedSystems.bootstrap,
    {
      name: "Custom",
      scale: [],
      unit: "px",
      description: "Your custom spacing system.",
    },
  ],
  activeComparisonIndex: 0,
  snapshots: [],
};

// Create context with a default undefined value
const SpacingContext = createContext<SpacingContextType | undefined>(undefined);

// Helper function to generate spacing scale based on the selected type
const generateSpacingScale = (
  type: ScaleType,
  base: number,
  multiplier: number,
  custom: number[]
): number[] => {
  switch (type) {
    case "linear":
      return Array.from({ length: 10 }, (_, i) => base * (i + 1) * multiplier);
    case "fibonacci":
      return [0, 1, 2, 3, 5, 8, 13, 21, 34, 55].map(
        (n) => n * base * multiplier
      );
    case "exponential":
      return Array.from(
        { length: 10 },
        (_, i) => base * Math.pow(2, i) * multiplier
      );
    case "custom":
      return custom.map((n) => n * multiplier);
    default:
      return [];
  }
};

// Provider component for Spacing context
export const SpacingProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [spacingState, setSpacingState] = useState<SpacingState>(() => {
    // Try to load state from localStorage
    const savedState = localStorage.getItem("spacingState");
    if (savedState) {
      try {
        return JSON.parse(savedState);
      } catch (e) {
        console.error("Failed to parse saved spacing state:", e);
      }
    }
    return defaultSpacingState;
  });

  // Save state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("spacingState", JSON.stringify(spacingState));
  }, [spacingState]);

  // Update a single spacing property
  const setSpacing = (
    property: string,
    value: number | boolean | string | Record<string, number> | number[]
  ) => {
    // Special handling for customScale which accepts number[]
    if (property === "customScale" && Array.isArray(value)) {
      setSpacingState((prev) => ({ ...prev, [property]: value }));
      return;
    }
    setSpacingState((prev) => ({ ...prev, [property]: value }));
  };

  // Update all margin values at once
  const setAllMargins = (value: number) => {
    setSpacingState((prev) => ({
      ...prev,
      marginTop: value,
      marginRight: value,
      marginBottom: value,
      marginLeft: value,
    }));
  };

  // Update all padding values at once
  const setAllPaddings = (value: number) => {
    setSpacingState((prev) => ({
      ...prev,
      paddingTop: value,
      paddingRight: value,
      paddingBottom: value,
      paddingLeft: value,
    }));
  };

  // Generate scale based on current settings
  const generateScale = (): number[] => {
    return generateSpacingScale(
      spacingState.scaleType,
      spacingState.baseUnit,
      spacingState.scaleMultiplier,
      spacingState.customScale
    );
  };

  // Toggle between light and dark preview mode
  const togglePreviewMode = () => {
    setSpacingState((prev) => ({
      ...prev,
      previewMode: prev.previewMode === "light" ? "dark" : "light",
    }));
  };

  // Update scale type
  const updateScaleType = (type: ScaleType) => {
    setSpacingState((prev) => ({ ...prev, scaleType: type }));
  };

  // Update unit
  const updateUnit = (unit: SpacingUnit) => {
    setSpacingState((prev) => ({ ...prev, unit }));
  };

  // Update preview element type
  const updatePreviewElementType = (
    type: "div" | "button" | "card" | "text"
  ) => {
    setSpacingState((prev) => ({ ...prev, previewElementType: type }));
  };

  // Set active comparison index
  const setActiveComparisonIndex = (index: number) => {
    setSpacingState((prev) => ({ ...prev, activeComparisonIndex: index }));
  };

  // Generate vanilla CSS code
  const exportCSS = (): string => {
    const scale = generateScale();
    const { prefixMargin, prefixPadding, unit } = spacingState;

    let css = ":root {\n";
    scale.forEach((value, index) => {
      css += `  --space-${index + 1}: ${value}${unit};\n`;
    });
    css += "}\n\n";

    // Generate margin classes
    scale.forEach((value, index) => {
      css += `.${prefixMargin}-${index + 1} { margin: ${value}${unit}; }\n`;

      if (spacingState.includeDirectionalClasses) {
        css += `.${prefixMargin}t-${
          index + 1
        } { margin-top: ${value}${unit}; }\n`;
        css += `.${prefixMargin}r-${
          index + 1
        } { margin-right: ${value}${unit}; }\n`;
        css += `.${prefixMargin}b-${
          index + 1
        } { margin-bottom: ${value}${unit}; }\n`;
        css += `.${prefixMargin}l-${
          index + 1
        } { margin-left: ${value}${unit}; }\n`;
        css += `.${prefixMargin}x-${
          index + 1
        } { margin-left: ${value}${unit}; margin-right: ${value}${unit}; }\n`;
        css += `.${prefixMargin}y-${
          index + 1
        } { margin-top: ${value}${unit}; margin-bottom: ${value}${unit}; }\n`;
      }
    });

    // Generate padding classes
    scale.forEach((value, index) => {
      css += `.${prefixPadding}-${index + 1} { padding: ${value}${unit}; }\n`;

      if (spacingState.includeDirectionalClasses) {
        css += `.${prefixPadding}t-${
          index + 1
        } { padding-top: ${value}${unit}; }\n`;
        css += `.${prefixPadding}r-${
          index + 1
        } { padding-right: ${value}${unit}; }\n`;
        css += `.${prefixPadding}b-${
          index + 1
        } { padding-bottom: ${value}${unit}; }\n`;
        css += `.${prefixPadding}l-${
          index + 1
        } { padding-left: ${value}${unit}; }\n`;
        css += `.${prefixPadding}x-${
          index + 1
        } { padding-left: ${value}${unit}; padding-right: ${value}${unit}; }\n`;
        css += `.${prefixPadding}y-${
          index + 1
        } { padding-top: ${value}${unit}; padding-bottom: ${value}${unit}; }\n`;
      }
    });

    // Add responsive variants if enabled
    if (spacingState.includeResponsiveVariants) {
      const { responsiveBreakpoints } = spacingState;

      Object.entries(responsiveBreakpoints).forEach(([breakpoint, size]) => {
        css += `\n@media (min-width: ${size}px) {\n`;

        // Add margin and padding classes for this breakpoint
        scale.forEach((value, index) => {
          css += `  .${breakpoint}:${prefixMargin}-${
            index + 1
          } { margin: ${value}${unit}; }\n`;
          css += `  .${breakpoint}:${prefixPadding}-${
            index + 1
          } { padding: ${value}${unit}; }\n`;

          if (spacingState.includeDirectionalClasses) {
            // Margin directional
            css += `  .${breakpoint}:${prefixMargin}t-${
              index + 1
            } { margin-top: ${value}${unit}; }\n`;
            css += `  .${breakpoint}:${prefixMargin}r-${
              index + 1
            } { margin-right: ${value}${unit}; }\n`;
            css += `  .${breakpoint}:${prefixMargin}b-${
              index + 1
            } { margin-bottom: ${value}${unit}; }\n`;
            css += `  .${breakpoint}:${prefixMargin}l-${
              index + 1
            } { margin-left: ${value}${unit}; }\n`;
            css += `  .${breakpoint}:${prefixMargin}x-${
              index + 1
            } { margin-left: ${value}${unit}; margin-right: ${value}${unit}; }\n`;
            css += `  .${breakpoint}:${prefixMargin}y-${
              index + 1
            } { margin-top: ${value}${unit}; margin-bottom: ${value}${unit}; }\n`;

            // Padding directional
            css += `  .${breakpoint}:${prefixPadding}t-${
              index + 1
            } { padding-top: ${value}${unit}; }\n`;
            css += `  .${breakpoint}:${prefixPadding}r-${
              index + 1
            } { padding-right: ${value}${unit}; }\n`;
            css += `  .${breakpoint}:${prefixPadding}b-${
              index + 1
            } { padding-bottom: ${value}${unit}; }\n`;
            css += `  .${breakpoint}:${prefixPadding}l-${
              index + 1
            } { padding-left: ${value}${unit}; }\n`;
            css += `  .${breakpoint}:${prefixPadding}x-${
              index + 1
            } { padding-left: ${value}${unit}; padding-right: ${value}${unit}; }\n`;
            css += `  .${breakpoint}:${prefixPadding}y-${
              index + 1
            } { padding-top: ${value}${unit}; padding-bottom: ${value}${unit}; }\n`;
          }
        });

        css += `}\n`;
      });
    }

    return css;
  };

  // Generate SCSS/SASS code
  const exportSCSS = (): string => {
    const scale = generateScale();
    const { prefixMargin, prefixPadding, unit } = spacingState;

    let scss = "// Spacing Variables\n";
    scale.forEach((value, index) => {
      scss += `$space-${index + 1}: ${value}${unit};\n`;
    });

    scss += "\n// Spacing Map\n";
    scss += "$spacing-scale: (\n";
    scale.forEach((value, index) => {
      scss += `  ${index + 1}: ${value}${unit},\n`;
    });
    scss += ");\n\n";

    scss += "// Spacing Mixins\n";
    scss += "@mixin generate-spacing($property, $shorthand, $scales) {\n";
    scss += "  @each $scale, $value in $scales {\n";
    scss += "    .#{$shorthand}-#{$scale} { #{$property}: $value; }\n";
    scss += "    \n";

    if (spacingState.includeDirectionalClasses) {
      scss += "    // Directional classes\n";
      scss += "    .#{$shorthand}t-#{$scale} { #{$property}-top: $value; }\n";
      scss += "    .#{$shorthand}r-#{$scale} { #{$property}-right: $value; }\n";
      scss +=
        "    .#{$shorthand}b-#{$scale} { #{$property}-bottom: $value; }\n";
      scss += "    .#{$shorthand}l-#{$scale} { #{$property}-left: $value; }\n";
      scss += "    .#{$shorthand}x-#{$scale} { \n";
      scss += "      #{$property}-left: $value; \n";
      scss += "      #{$property}-right: $value; \n";
      scss += "    }\n";
      scss += "    .#{$shorthand}y-#{$scale} { \n";
      scss += "      #{$property}-top: $value; \n";
      scss += "      #{$property}-bottom: $value; \n";
      scss += "    }\n";
    }

    if (spacingState.includeResponsiveVariants) {
      scss += "\n    // Responsive variants\n";
      scss += "    @each $breakpoint, $width in $breakpoints {\n";
      scss += "      @media (min-width: $width) {\n";
      scss +=
        "        .#{$breakpoint}\\:#{$shorthand}-#{$scale} { #{$property}: $value; }\n";

      if (spacingState.includeDirectionalClasses) {
        scss +=
          "        .#{$breakpoint}\\:#{$shorthand}t-#{$scale} { #{$property}-top: $value; }\n";
        scss +=
          "        .#{$breakpoint}\\:#{$shorthand}r-#{$scale} { #{$property}-right: $value; }\n";
        scss +=
          "        .#{$breakpoint}\\:#{$shorthand}b-#{$scale} { #{$property}-bottom: $value; }\n";
        scss +=
          "        .#{$breakpoint}\\:#{$shorthand}l-#{$scale} { #{$property}-left: $value; }\n";
        scss += "        .#{$breakpoint}\\:#{$shorthand}x-#{$scale} { \n";
        scss += "          #{$property}-left: $value; \n";
        scss += "          #{$property}-right: $value; \n";
        scss += "        }\n";
        scss += "        .#{$breakpoint}\\:#{$shorthand}y-#{$scale} { \n";
        scss += "          #{$property}-top: $value; \n";
        scss += "          #{$property}-bottom: $value; \n";
        scss += "        }\n";
      }

      scss += "      }\n";
      scss += "    }\n";
    }

    scss += "  }\n";
    scss += "}\n\n";

    // Add breakpoints if responsive
    if (spacingState.includeResponsiveVariants) {
      const { responsiveBreakpoints } = spacingState;

      scss += "// Breakpoints\n";
      scss += "$breakpoints: (\n";
      Object.entries(responsiveBreakpoints).forEach(([breakpoint, size]) => {
        scss += `  ${breakpoint}: ${size}px,\n`;
      });
      scss += ");\n\n";
    }

    scss += "// Generate Spacing Classes\n";
    scss += `@include generate-spacing('margin', '${prefixMargin}', $spacing-scale);\n`;
    scss += `@include generate-spacing('padding', '${prefixPadding}', $spacing-scale);\n`;

    return scss;
  };

  // Generate Tailwind config
  const exportTailwind = (): string => {
    const scale = generateScale();

    let tailwind = "// tailwind.config.js\n";
    tailwind += "module.exports = {\n";
    tailwind += "  theme: {\n";
    tailwind += "    extend: {\n";
    tailwind += "      spacing: {\n";

    scale.forEach((value, index) => {
      tailwind += `        '${index}': '${value}${spacingState.unit}',\n`;
    });

    tailwind += "      },\n";
    tailwind += "    },\n";
    tailwind += "  },\n";
    tailwind += "};\n";

    return tailwind;
  };

  // Save current state as a snapshot
  const saveSnapshot = (name: string, description: string) => {
    const newSnapshot: SpacingSnapshot = {
      id: `snapshot-${Date.now()}`,
      name: name.trim() || `Snapshot ${spacingState.snapshots.length + 1}`,
      description: description.trim(),
      date: new Date().toISOString(),
      state: {
        marginTop: spacingState.marginTop,
        marginRight: spacingState.marginRight,
        marginBottom: spacingState.marginBottom,
        marginLeft: spacingState.marginLeft,
        paddingTop: spacingState.paddingTop,
        paddingRight: spacingState.paddingRight,
        paddingBottom: spacingState.paddingBottom,
        paddingLeft: spacingState.paddingLeft,
        borderWidth: spacingState.borderWidth,
        unit: spacingState.unit,
        baseUnit: spacingState.baseUnit,
        scaleType: spacingState.scaleType,
        customScale: [...spacingState.customScale],
        scaleMultiplier: spacingState.scaleMultiplier,
        previewMode: spacingState.previewMode,
        previewElementType: spacingState.previewElementType,
      },
    };

    setSpacingState((prev) => ({
      ...prev,
      snapshots: [...prev.snapshots, newSnapshot],
    }));
  };

  // Load a saved snapshot
  const loadSnapshot = (id: string) => {
    const snapshot = spacingState.snapshots.find((s) => s.id === id);
    if (snapshot) {
      setSpacingState((prev) => ({
        ...prev,
        ...snapshot.state,
      }));
    }
  };

  // Delete a snapshot
  const deleteSnapshot = (id: string) => {
    setSpacingState((prev) => ({
      ...prev,
      snapshots: prev.snapshots.filter((s) => s.id !== id),
    }));
  };

  const contextValue: SpacingContextType = {
    ...spacingState,
    setSpacing,
    setAllMargins,
    setAllPaddings,
    generateScale,
    exportCSS,
    exportSCSS,
    exportTailwind,
    togglePreviewMode,
    updateScaleType,
    updateUnit,
    updatePreviewElementType,
    setActiveComparisonIndex,
    saveSnapshot,
    loadSnapshot,
    deleteSnapshot,
  };

  return (
    <SpacingContext.Provider value={contextValue}>
      {children}
    </SpacingContext.Provider>
  );
};

// Custom hook to use the Spacing context
export const useSpacing = (): SpacingContextType => {
  const context = useContext(SpacingContext);
  if (context === undefined) {
    throw new Error("useSpacing must be used within a SpacingProvider");
  }
  return context;
};

export default SpacingContext;
