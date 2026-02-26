// Container configuration interfaces
export interface Breakpoint {
  id: string;
  name: string;
  minWidth: number;
  maxWidth?: number;
  containerWidth: number | string; // For both pixel and percentage values
  containerPadding: string;
  isFluid: boolean;
}

export interface ContainerConfig {
  name: string;
  breakpoints: Breakpoint[];
  centerContainer: boolean;
  useCustomProperties: boolean;
  customPropertyPrefix: string;
}

// Export format options
export type ExportFormat = 'css' | 'scss' | 'tailwind';

// UI state interfaces
export interface EditorState {
  activeBreakpoint: string;
  previewWidth: number;
  showGrid: boolean;
  editMode: 'visual' | 'code';
} 