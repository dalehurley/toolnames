export interface GridTrack {
  id: string;
  size: string; // e.g., "1fr", "200px", "minmax(100px, 1fr)"
  name?: string; // For named grid lines
}

export interface GridArea {
  id: string;
  name: string;
  startRow: number;
  endRow: number;
  startColumn: number;
  endColumn: number;
}

export interface GridCell {
  id: string;
  content: string;
  areaId?: string;
  styles?: CellStyles;
}

export interface CellStyles {
  backgroundColor?: string;
  color?: string;
  padding?: string;
  justifySelf?: string;
  alignSelf?: string;
}

export interface GridState {
  columns: GridTrack[];
  rows: GridTrack[];
  areas: GridArea[];
  cells: GridCell[];
  gaps: { row: string; column: string };
  containerStyles: {
    width: string;
    height: string;
    justifyItems: string;
    alignItems: string;
    justifyContent: string;
    alignContent: string;
  };
}

export interface Breakpoint {
  id: string;
  name: string;
  minWidth: number;
  gridState: Partial<GridState>;
}

export interface BreakpointDefinition {
  id: string;
  name: string;
  minWidth: number;
}

export type ExportFormat = 'css' | 'scss' | 'tailwind';

export interface GridTemplate {
  id: string;
  name: string;
  category: string;
  gridState: GridState;
  breakpoints?: Breakpoint[];
  custom?: boolean;
} 