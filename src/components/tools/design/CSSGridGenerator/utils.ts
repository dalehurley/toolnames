import { v4 as uuidv4 } from 'uuid';
import {
  GridState,
  ExportFormat,
  GridArea,
  GridCell,
  GridTemplate,
  Breakpoint
} from './types';

// Helper function to generate unique IDs
export const generateId = (): string => uuidv4();

// Initialize a default empty grid state
export const createDefaultGridState = (): GridState => ({
  columns: [
    { id: generateId(), size: '1fr' },
    { id: generateId(), size: '1fr' },
    { id: generateId(), size: '1fr' }
  ],
  rows: [
    { id: generateId(), size: 'auto' },
    { id: generateId(), size: 'auto' },
    { id: generateId(), size: 'auto' }
  ],
  areas: [],
  cells: [],
  gaps: { row: '1rem', column: '1rem' },
  containerStyles: {
    width: '100%',
    height: 'auto',
    justifyItems: 'stretch',
    alignItems: 'stretch',
    justifyContent: 'start',
    alignContent: 'start'
  }
});

// Default breakpoint definitions
export const defaultBreakpoints = [
  { id: 'mobile', name: 'Mobile', minWidth: 0 },
  { id: 'tablet', name: 'Tablet', minWidth: 640 },
  { id: 'desktop', name: 'Desktop', minWidth: 1024 }
];

// Pre-defined templates
export const gridTemplates: GridTemplate[] = [
  {
    id: 'holy-grail',
    name: 'Holy Grail Layout',
    category: 'layout',
    gridState: {
      columns: [
        { id: generateId(), size: '1fr' },
        { id: generateId(), size: '3fr' },
        { id: generateId(), size: '1fr' }
      ],
      rows: [
        { id: generateId(), size: 'auto' },
        { id: generateId(), size: '1fr' },
        { id: generateId(), size: 'auto' }
      ],
      areas: [
        { id: generateId(), name: 'header', startRow: 0, endRow: 1, startColumn: 0, endColumn: 3 },
        { id: generateId(), name: 'nav', startRow: 1, endRow: 2, startColumn: 0, endColumn: 1 },
        { id: generateId(), name: 'main', startRow: 1, endRow: 2, startColumn: 1, endColumn: 2 },
        { id: generateId(), name: 'aside', startRow: 1, endRow: 2, startColumn: 2, endColumn: 3 },
        { id: generateId(), name: 'footer', startRow: 2, endRow: 3, startColumn: 0, endColumn: 3 }
      ],
      cells: [],
      gaps: { row: '1rem', column: '1rem' },
      containerStyles: {
        width: '100%',
        height: '100vh',
        justifyItems: 'stretch',
        alignItems: 'stretch',
        justifyContent: 'start',
        alignContent: 'start'
      }
    }
  },
  {
    id: 'dashboard',
    name: 'Dashboard Layout',
    category: 'layout',
    gridState: {
      columns: [
        { id: generateId(), size: '250px' },
        { id: generateId(), size: '1fr' },
        { id: generateId(), size: '1fr' }
      ],
      rows: [
        { id: generateId(), size: 'auto' },
        { id: generateId(), size: '1fr' },
        { id: generateId(), size: '1fr' }
      ],
      areas: [
        { id: generateId(), name: 'header', startRow: 0, endRow: 1, startColumn: 0, endColumn: 3 },
        { id: generateId(), name: 'sidebar', startRow: 1, endRow: 3, startColumn: 0, endColumn: 1 },
        { id: generateId(), name: 'main', startRow: 1, endRow: 2, startColumn: 1, endColumn: 3 },
        { id: generateId(), name: 'widget1', startRow: 2, endRow: 3, startColumn: 1, endColumn: 2 },
        { id: generateId(), name: 'widget2', startRow: 2, endRow: 3, startColumn: 2, endColumn: 3 }
      ],
      cells: [],
      gaps: { row: '1rem', column: '1rem' },
      containerStyles: {
        width: '100%',
        height: '100vh',
        justifyItems: 'stretch',
        alignItems: 'stretch',
        justifyContent: 'start',
        alignContent: 'start'
      }
    }
  },
  {
    id: 'card-grid',
    name: 'Card Grid',
    category: 'layout',
    gridState: {
      columns: Array.from({ length: 3 }).map(() => ({ id: generateId(), size: '1fr' })),
      rows: Array.from({ length: 2 }).map(() => ({ id: generateId(), size: 'auto' })),
      areas: [],
      cells: [],
      gaps: { row: '1.5rem', column: '1.5rem' },
      containerStyles: {
        width: '100%',
        height: 'auto',
        justifyItems: 'stretch',
        alignItems: 'stretch',
        justifyContent: 'start',
        alignContent: 'start'
      }
    }
  },
  {
    id: 'photo-gallery',
    name: 'Photo Gallery',
    category: 'layout',
    gridState: {
      columns: Array.from({ length: 4 }).map(() => ({ id: generateId(), size: '1fr' })),
      rows: Array.from({ length: 3 }).map(() => ({ id: generateId(), size: '200px' })),
      areas: [],
      cells: [],
      gaps: { row: '0.5rem', column: '0.5rem' },
      containerStyles: {
        width: '100%',
        height: 'auto',
        justifyItems: 'stretch',
        alignItems: 'stretch',
        justifyContent: 'start',
        alignContent: 'start'
      }
    }
  },
  {
    id: 'responsive-columns',
    name: 'Responsive Columns',
    category: 'responsive',
    gridState: {
      columns: Array.from({ length: 4 }).map(() => ({ id: generateId(), size: 'minmax(250px, 1fr)' })),
      rows: Array.from({ length: 1 }).map(() => ({ id: generateId(), size: 'auto' })),
      areas: [],
      cells: [],
      gaps: { row: '1rem', column: '1rem' },
      containerStyles: {
        width: '100%',
        height: 'auto',
        justifyItems: 'stretch',
        alignItems: 'stretch',
        justifyContent: 'start',
        alignContent: 'start'
      }
    }
  }
];

// Save to localStorage
export const saveToLocalStorage = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

// Load from localStorage
export const loadFromLocalStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return defaultValue;
  }
};

// Find cell by grid area
export const findCellByArea = (cells: GridCell[], areaId: string): GridCell | undefined => {
  return cells.find(cell => cell.areaId === areaId);
};

// Get grid area by position
export const getAreaAtPosition = (areas: GridArea[], row: number, column: number): GridArea | undefined => {
  return areas.find(
    area => 
      row >= area.startRow && 
      row < area.endRow && 
      column >= area.startColumn && 
      column < area.endColumn
  );
};

// Generate CSS Grid code
export const generateGridCode = (
  gridState: GridState,
  format: ExportFormat,
  breakpoints?: Breakpoint[]
): string => {
  const { columns, rows, areas, gaps, containerStyles } = gridState;
  
  // Helper function to generate grid-template-areas string
  const generateGridTemplateAreas = (areas: GridArea[], rowCount: number, columnCount: number): string => {
    const grid = Array.from({ length: rowCount }, () => 
      Array.from({ length: columnCount }, () => '.'));
    
    areas.forEach(area => {
      for (let r = area.startRow; r < area.endRow; r++) {
        for (let c = area.startColumn; c < area.endColumn; c++) {
          if (grid[r] && grid[r][c]) {
            grid[r][c] = area.name;
          }
        }
      }
    });
    
    return grid.map(row => `"${row.join(' ')}"`).join(' ');
  };

  switch (format) {
    case 'css': {
      let css = `.grid-container {\n`;
      css += `  display: grid;\n`;
      css += `  grid-template-columns: ${columns.map(c => c.size).join(' ')};\n`;
      css += `  grid-template-rows: ${rows.map(r => r.size).join(' ')};\n`;
      css += `  gap: ${gaps.row} ${gaps.column};\n`;
      
      if (areas.length > 0) {
        css += `  grid-template-areas: ${generateGridTemplateAreas(areas, rows.length, columns.length)};\n`;
      }
      
      // Container styles
      Object.entries(containerStyles).forEach(([key, value]) => {
        if (value) {
          css += `  ${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value};\n`;
        }
      });
      
      css += `}\n\n`;
      
      // Add area selectors
      if (areas.length > 0) {
        areas.forEach(area => {
          css += `.grid-area-${area.name} {\n  grid-area: ${area.name};\n}\n\n`;
        });
      }
      
      // Add media queries for breakpoints
      if (breakpoints && breakpoints.length > 0) {
        breakpoints.forEach((bp) => {
          if (bp.id !== 'desktop' && bp.gridState) { // Skip the default/desktop
            css += `@media (max-width: ${bp.minWidth - 1}px) {\n`;
            css += `  .grid-container {\n`;
            
            if (bp.gridState.columns?.length) {
              css += `    grid-template-columns: ${bp.gridState.columns.map(c => c.size).join(' ')};\n`;
            }
            
            if (bp.gridState.rows?.length) {
              css += `    grid-template-rows: ${bp.gridState.rows.map(r => r.size).join(' ')};\n`;
            }
            
            if (bp.gridState.gaps) {
              css += `    gap: ${bp.gridState.gaps.row} ${bp.gridState.gaps.column};\n`;
            }
            
            if (bp.gridState.areas?.length) {
              const rowCount = bp.gridState.rows?.length || rows.length;
              const columnCount = bp.gridState.columns?.length || columns.length;
              css += `    grid-template-areas: ${generateGridTemplateAreas(bp.gridState.areas, rowCount, columnCount)};\n`;
            }
            
            css += `  }\n`;
            css += `}\n\n`;
          }
        });
      }
      
      return css;
    }
    
    case 'scss': {
      let scss = `// Grid Container Mixin\n`;
      scss += `@mixin grid-container {\n`;
      scss += `  display: grid;\n`;
      scss += `  grid-template-columns: ${columns.map(c => c.size).join(' ')};\n`;
      scss += `  grid-template-rows: ${rows.map(r => r.size).join(' ')};\n`;
      scss += `  gap: ${gaps.row} ${gaps.column};\n`;
      
      if (areas.length > 0) {
        scss += `  grid-template-areas: ${generateGridTemplateAreas(areas, rows.length, columns.length)};\n`;
      }
      
      // Container styles
      Object.entries(containerStyles).forEach(([key, value]) => {
        if (value) {
          scss += `  ${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value};\n`;
        }
      });
      
      scss += `}\n\n`;
      
      // Add area mixins
      if (areas.length > 0) {
        scss += `// Grid Areas Mixin\n`;
        scss += `@mixin grid-areas {\n`;
        areas.forEach(area => {
          scss += `  .grid-area-${area.name} {\n    grid-area: ${area.name};\n  }\n\n`;
        });
        scss += `}\n\n`;
      }
      
      // Add media query mixins for breakpoints
      if (breakpoints && breakpoints.length > 0) {
        scss += `// Responsive Grid Mixins\n`;
        breakpoints.forEach((bp) => {
          if (bp.id !== 'desktop' && bp.gridState) { // Skip the default/desktop
            scss += `@mixin grid-${bp.id} {\n`;
            scss += `  @media (max-width: ${bp.minWidth - 1}px) {\n`;
            scss += `    .grid-container {\n`;
            
            if (bp.gridState.columns?.length) {
              scss += `      grid-template-columns: ${bp.gridState.columns.map(c => c.size).join(' ')};\n`;
            }
            
            if (bp.gridState.rows?.length) {
              scss += `      grid-template-rows: ${bp.gridState.rows.map(r => r.size).join(' ')};\n`;
            }
            
            if (bp.gridState.gaps) {
              scss += `      gap: ${bp.gridState.gaps.row} ${bp.gridState.gaps.column};\n`;
            }
            
            if (bp.gridState.areas?.length) {
              const rowCount = bp.gridState.rows?.length || rows.length;
              const columnCount = bp.gridState.columns?.length || columns.length;
              scss += `      grid-template-areas: ${generateGridTemplateAreas(bp.gridState.areas, rowCount, columnCount)};\n`;
            }
            
            scss += `    }\n`;
            scss += `  }\n`;
            scss += `}\n\n`;
          }
        });
        
        // Usage example
        scss += `// Usage Example\n`;
        scss += `.grid-container {\n`;
        scss += `  @include grid-container;\n`;
        scss += `}\n\n`;
        
        if (areas.length > 0) {
          scss += `@include grid-areas;\n\n`;
        }
        
        breakpoints.forEach((bp) => {
          if (bp.id !== 'desktop' && bp.gridState) {
            scss += `@include grid-${bp.id};\n`;
          }
        });
      }
      
      return scss;
    }
    
    case 'tailwind': {
      // Generate basic Tailwind grid classes
      let tailwind = `<!-- Grid Container -->\n`;
      tailwind += `<div class="grid `;
      
      // Grid template columns
      if (columns.length <= 12) {
        tailwind += `grid-cols-${columns.length} `;
      } else {
        tailwind += `grid-cols-[${columns.map(c => c.size).join('_')}] `;
      }
      
      // Grid template rows (if not all auto)
      if (!rows.every(r => r.size === 'auto')) {
        tailwind += `grid-rows-[${rows.map(r => r.size).join('_')}] `;
      }
      
      // Gap
      const commonGaps = ['0', '0.5', '1', '1.5', '2', '3', '4', '5', '6', '8', '10', '12'];
      const rowGapValue = gaps.row.replace('rem', '');
      const colGapValue = gaps.column.replace('rem', '');
      
      if (rowGapValue === colGapValue && commonGaps.includes(rowGapValue)) {
        tailwind += `gap-${rowGapValue} `;
      } else {
        if (commonGaps.includes(rowGapValue)) {
          tailwind += `gap-y-${rowGapValue} `;
        } else {
          tailwind += `gap-y-[${gaps.row}] `;
        }
        
        if (commonGaps.includes(colGapValue)) {
          tailwind += `gap-x-${colGapValue} `;
        } else {
          tailwind += `gap-x-[${gaps.column}] `;
        }
      }
      
      // Container width and height
      if (containerStyles.width !== '100%') {
        tailwind += `w-[${containerStyles.width}] `;
      } else {
        tailwind += `w-full `;
      }
      
      if (containerStyles.height !== 'auto') {
        tailwind += `h-[${containerStyles.height}] `;
      }
      
      // Alignment properties
      if (containerStyles.justifyItems !== 'stretch') {
        tailwind += `justify-items-${containerStyles.justifyItems} `;
      }
      
      if (containerStyles.alignItems !== 'stretch') {
        tailwind += `items-${containerStyles.alignItems} `;
      }
      
      if (containerStyles.justifyContent !== 'start') {
        tailwind += `justify-${containerStyles.justifyContent} `;
      }
      
      if (containerStyles.alignContent !== 'start') {
        tailwind += `content-${containerStyles.alignContent} `;
      }
      
      tailwind = tailwind.trim() + `">\n`;
      
      // Grid items based on areas
      if (areas.length > 0) {
        areas.forEach(area => {
          tailwind += `  <!-- ${area.name} -->\n`;
          tailwind += `  <div class="`;
          
          if (area.startColumn !== area.endColumn - 1) {
            tailwind += `col-span-${area.endColumn - area.startColumn} `;
          }
          
          if (area.startRow !== area.endRow - 1) {
            tailwind += `row-span-${area.endRow - area.startRow} `;
          }
          
          if (area.startColumn > 0) {
            tailwind += `col-start-${area.startColumn + 1} `;
          }
          
          if (area.startRow > 0) {
            tailwind += `row-start-${area.startRow + 1} `;
          }
          
          tailwind = tailwind.trim() + `">${area.name}</div>\n`;
        });
      } else {
        // Placeholder for grid items if no areas defined
        tailwind += `  <!-- Grid Items -->\n`;
        tailwind += `  <div>Item 1</div>\n`;
        tailwind += `  <div>Item 2</div>\n`;
        tailwind += `  <div>Item 3</div>\n`;
      }
      
      tailwind += `</div>\n\n`;
      
      // Add responsive examples if breakpoints exist
      if (breakpoints && breakpoints.length > 0) {
        tailwind += `<!-- Responsive Example -->\n`;
        tailwind += `<div class="grid `;
        
        // Generate responsive classes for each breakpoint
        const breakpointPrefixes: Record<string, string> = {
          mobile: '',
          tablet: 'sm:',
          desktop: 'lg:'
        };
        
        breakpoints.forEach(bp => {
          const prefix = breakpointPrefixes[bp.id] || `${bp.id}:`;
          
          if (bp.gridState.columns?.length) {
            if (bp.gridState.columns.length <= 12) {
              tailwind += `${prefix}grid-cols-${bp.gridState.columns.length} `;
            } else {
              tailwind += `${prefix}grid-cols-[${bp.gridState.columns.map(c => c.size).join('_')}] `;
            }
          }
          
          if (bp.gridState.gaps) {
            const rowGapValue = bp.gridState.gaps.row.replace('rem', '');
            const colGapValue = bp.gridState.gaps.column.replace('rem', '');
            
            if (rowGapValue === colGapValue && commonGaps.includes(rowGapValue)) {
              tailwind += `${prefix}gap-${rowGapValue} `;
            } else {
              if (commonGaps.includes(rowGapValue)) {
                tailwind += `${prefix}gap-y-${rowGapValue} `;
              } else {
                tailwind += `${prefix}gap-y-[${bp.gridState.gaps.row}] `;
              }
              
              if (commonGaps.includes(colGapValue)) {
                tailwind += `${prefix}gap-x-${colGapValue} `;
              } else {
                tailwind += `${prefix}gap-x-[${bp.gridState.gaps.column}] `;
              }
            }
          }
        });
        
        tailwind = tailwind.trim() + `">\n`;
        tailwind += `  <!-- Responsive Grid Items -->\n`;
        tailwind += `  <div>Item 1</div>\n`;
        tailwind += `  <div>Item 2</div>\n`;
        tailwind += `  <div>Item 3</div>\n`;
        tailwind += `</div>`;
      }
      
      return tailwind;
    }
    
    default:
      return '/* Unsupported format */';
  }
}; 