// Spacing units available in the tool
export type SpacingUnit = 'px' | 'rem' | 'em' | '%' | 'vw' | 'vh';

// Scale types available for batch generation
export type ScaleType = 'linear' | 'fibonacci' | 'exponential' | 'custom';

// Export format types
export type ExportFormat = 'css' | 'scss' | 'tailwind';

// Interface for a spacing system definition (for comparison)
export interface SpacingSystem {
  name: string;
  scale: number[];
  unit: SpacingUnit;
  description: string;
}

// Interface for a saved snapshot
export interface SpacingSnapshot {
  id: string;
  name: string;
  description: string;
  date: string;
  state: Partial<SpacingState>;
}

// Interface for spacing state
export interface SpacingState {
  // Box model values
  marginTop: number;
  marginRight: number;
  marginBottom: number;
  marginLeft: number;
  paddingTop: number;
  paddingRight: number;
  paddingBottom: number;
  paddingLeft: number;
  borderWidth: number;
  
  // Units and configuration
  unit: SpacingUnit;
  baseUnit: number;
  
  // Scale generation
  scaleType: ScaleType;
  customScale: number[];
  scaleMultiplier: number;
  
  // Export configuration
  prefixMargin: string;
  prefixPadding: string;
  includeDirectionalClasses: boolean;
  includeResponsiveVariants: boolean;
  responsiveBreakpoints: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
    '2xl': number;
  };
  
  // Preview configuration
  previewMode: 'light' | 'dark';
  previewElementType: 'div' | 'button' | 'card' | 'text';
  previewContent: string;
  
  // Comparison settings
  comparisonSystems: SpacingSystem[];
  activeComparisonIndex: number;
  
  // Snapshots
  snapshots: SpacingSnapshot[];
}

// Interface for spacing context
export interface SpacingContextType extends SpacingState {
  // Utility functions
  setSpacing: (property: string, value: number | boolean | string | Record<string, number> | number[]) => void;
  setAllMargins: (value: number) => void;
  setAllPaddings: (value: number) => void;
  generateScale: () => number[];
  exportCSS: () => string;
  exportSCSS: () => string;
  exportTailwind: () => string;
  togglePreviewMode: () => void;
  updateScaleType: (type: ScaleType) => void;
  updateUnit: (unit: SpacingUnit) => void;
  updatePreviewElementType: (type: 'div' | 'button' | 'card' | 'text') => void;
  setActiveComparisonIndex: (index: number) => void;
  
  // Snapshot functions
  saveSnapshot: (name: string, description: string) => void;
  loadSnapshot: (id: string) => void;
  deleteSnapshot: (id: string) => void;
} 