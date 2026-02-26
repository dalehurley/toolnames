import { useState, useEffect, useCallback } from 'react';
import { 
  GridState, 
  GridTrack, 
  GridArea, 
  ExportFormat, 
  GridTemplate, 
  Breakpoint,
  BreakpointDefinition
} from '../types';
import { 
  generateId, 
  createDefaultGridState, 
  defaultBreakpoints, 
  gridTemplates as defaultTemplates,
  saveToLocalStorage,
  loadFromLocalStorage
} from '../utils';

interface UseGridStateReturn {
  gridState: GridState;
  activeBreakpoint: string;
  breakpoints: Breakpoint[];
  exportFormat: ExportFormat;
  selectedAreaId: string | null;
  templates: GridTemplate[];
  
  setExportFormat: (format: ExportFormat) => void;
  setSelectedAreaId: (id: string | null) => void;
  updateGridState: (newState: Partial<GridState>) => void;
  updateBreakpointGridState: (breakpointId: string, newState: Partial<GridState>) => void;
  
  addColumn: () => void;
  removeColumn: (id: string) => void;
  updateColumn: (id: string, size: string) => void;
  
  addRow: () => void;
  removeRow: (id: string) => void;
  updateRow: (id: string, size: string) => void;
  
  addArea: (area: Omit<GridArea, 'id'>) => string;
  updateArea: (id: string, updates: Partial<Omit<GridArea, 'id'>>) => void;
  removeArea: (id: string) => void;
  
  updateGaps: (rowGap: string, columnGap: string) => void;
  updateContainerStyles: (styles: Partial<GridState['containerStyles']>) => void;
  
  saveTemplate: (name: string, category: string) => void;
  loadTemplate: (templateId: string) => void;
  deleteTemplate: (templateId: string) => void;
  
  setActiveBreakpoint: (breakpointId: string) => void;
  addBreakpoint: (breakpoint: BreakpointDefinition) => void;
  removeBreakpoint: (breakpointId: string) => void;
}

const LOCAL_STORAGE_KEYS = {
  GRID_STATE: 'css-grid-generator-state',
  BREAKPOINTS: 'css-grid-generator-breakpoints',
  TEMPLATES: 'css-grid-generator-templates',
  ACTIVE_BREAKPOINT: 'css-grid-generator-active-breakpoint',
  EXPORT_FORMAT: 'css-grid-generator-export-format'
};

export const useGridState = (): UseGridStateReturn => {
  const [gridState, setGridState] = useState<GridState>(createDefaultGridState());
  const [activeBreakpoint, setActiveBreakpoint] = useState<string>('desktop');
  const [breakpoints, setBreakpoints] = useState<Breakpoint[]>(
    defaultBreakpoints.map(bp => ({
      ...bp,
      gridState: bp.id === 'desktop' ? createDefaultGridState() : {}
    }))
  );
  const [exportFormat, setExportFormat] = useState<ExportFormat>('css');
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
  const [templates, setTemplates] = useState<GridTemplate[]>(defaultTemplates);

  // Load saved state from localStorage on initial mount
  useEffect(() => {
    const savedGridState = loadFromLocalStorage<GridState>(
      LOCAL_STORAGE_KEYS.GRID_STATE, 
      createDefaultGridState()
    );
    const savedBreakpoints = loadFromLocalStorage<Breakpoint[]>(
      LOCAL_STORAGE_KEYS.BREAKPOINTS,
      breakpoints
    );
    const savedTemplates = loadFromLocalStorage<GridTemplate[]>(
      LOCAL_STORAGE_KEYS.TEMPLATES,
      defaultTemplates
    );
    const savedActiveBreakpoint = loadFromLocalStorage<string>(
      LOCAL_STORAGE_KEYS.ACTIVE_BREAKPOINT,
      'desktop'
    );
    const savedExportFormat = loadFromLocalStorage<ExportFormat>(
      LOCAL_STORAGE_KEYS.EXPORT_FORMAT,
      'css'
    );

    setGridState(savedGridState);
    setBreakpoints(savedBreakpoints);
    setTemplates(savedTemplates);
    setActiveBreakpoint(savedActiveBreakpoint);
    setExportFormat(savedExportFormat as ExportFormat);
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    saveToLocalStorage(LOCAL_STORAGE_KEYS.GRID_STATE, gridState);
    saveToLocalStorage(LOCAL_STORAGE_KEYS.BREAKPOINTS, breakpoints);
    saveToLocalStorage(LOCAL_STORAGE_KEYS.TEMPLATES, templates);
    saveToLocalStorage(LOCAL_STORAGE_KEYS.ACTIVE_BREAKPOINT, activeBreakpoint);
    saveToLocalStorage(LOCAL_STORAGE_KEYS.EXPORT_FORMAT, exportFormat);
  }, [gridState, breakpoints, templates, activeBreakpoint, exportFormat]);

  // Update the main grid state
  const updateGridState = useCallback((newState: Partial<GridState>) => {
    setGridState(prevState => ({ ...prevState, ...newState }));
    
    // If we're in desktop mode, update the desktop breakpoint too
    if (activeBreakpoint === 'desktop') {
      setBreakpoints(prevBreakpoints => 
        prevBreakpoints.map(bp => 
          bp.id === 'desktop' 
            ? { ...bp, gridState: { ...bp.gridState, ...newState } }
            : bp
        )
      );
    }
  }, [activeBreakpoint]);

  // Update a breakpoint's grid state
  const updateBreakpointGridState = useCallback((breakpointId: string, newState: Partial<GridState>) => {
    setBreakpoints(prevBreakpoints => 
      prevBreakpoints.map(bp => 
        bp.id === breakpointId
          ? { ...bp, gridState: { ...bp.gridState, ...newState } }
          : bp
      )
    );
    
    // If updating desktop breakpoint, also update main state
    if (breakpointId === 'desktop') {
      setGridState(prevState => ({ ...prevState, ...newState }));
    }
  }, []);

  // Handle breakpoint switching
  const handleSetActiveBreakpoint = useCallback((breakpointId: string) => {
    setActiveBreakpoint(breakpointId);
    
    // If switching to desktop, load its state to the main grid state
    if (breakpointId === 'desktop') {
      const desktopBreakpoint = breakpoints.find(bp => bp.id === 'desktop');
      if (desktopBreakpoint && desktopBreakpoint.gridState) {
        setGridState(prevState => ({ 
          ...prevState, 
          ...desktopBreakpoint.gridState 
        }));
      }
    }
  }, [breakpoints]);

  // Add a new breakpoint
  const addBreakpoint = useCallback((breakpoint: BreakpointDefinition) => {
    const newBreakpoint: Breakpoint = {
      ...breakpoint,
      gridState: {}
    };
    
    setBreakpoints(prevBreakpoints => 
      [...prevBreakpoints, newBreakpoint]
        .sort((a, b) => a.minWidth - b.minWidth)
    );
  }, []);

  // Remove a breakpoint
  const removeBreakpoint = useCallback((breakpointId: string) => {
    // Don't allow removing the desktop breakpoint
    if (breakpointId === 'desktop') return;
    
    setBreakpoints(prevBreakpoints => 
      prevBreakpoints.filter(bp => bp.id !== breakpointId)
    );
    
    // If the active breakpoint is being removed, switch to desktop
    if (activeBreakpoint === breakpointId) {
      handleSetActiveBreakpoint('desktop');
    }
  }, [activeBreakpoint, handleSetActiveBreakpoint]);

  // Column operations
  const addColumn = useCallback(() => {
    setGridState(prevState => {
      const newColumn: GridTrack = {
        id: generateId(),
        size: '1fr'
      };
      return {
        ...prevState,
        columns: [...prevState.columns, newColumn]
      };
    });
  }, []);

  const removeColumn = useCallback((id: string) => {
    setGridState(prevState => {
      // Don't remove the last column
      if (prevState.columns.length <= 1) return prevState;
      
      // Remove any areas that span this column
      const columnIndex = prevState.columns.findIndex(col => col.id === id);
      if (columnIndex === -1) return prevState;
      
      const filteredAreas = prevState.areas.filter(area => 
        !(area.startColumn <= columnIndex && area.endColumn > columnIndex)
      );
      
      // Adjust areas that start after this column
      const adjustedAreas = filteredAreas.map(area => {
        if (area.startColumn > columnIndex) {
          return {
            ...area,
            startColumn: area.startColumn - 1,
            endColumn: area.endColumn - 1
          };
        }
        return area;
      });
      
      return {
        ...prevState,
        columns: prevState.columns.filter(col => col.id !== id),
        areas: adjustedAreas
      };
    });
  }, []);

  const updateColumn = useCallback((id: string, size: string) => {
    setGridState(prevState => {
      const updatedColumns = prevState.columns.map(col => 
        col.id === id ? { ...col, size } : col
      );
      return { ...prevState, columns: updatedColumns };
    });
  }, []);

  // Row operations
  const addRow = useCallback(() => {
    setGridState(prevState => {
      const newRow: GridTrack = {
        id: generateId(),
        size: 'auto'
      };
      return {
        ...prevState,
        rows: [...prevState.rows, newRow]
      };
    });
  }, []);

  const removeRow = useCallback((id: string) => {
    setGridState(prevState => {
      // Don't remove the last row
      if (prevState.rows.length <= 1) return prevState;
      
      // Remove any areas that span this row
      const rowIndex = prevState.rows.findIndex(row => row.id === id);
      if (rowIndex === -1) return prevState;
      
      const filteredAreas = prevState.areas.filter(area => 
        !(area.startRow <= rowIndex && area.endRow > rowIndex)
      );
      
      // Adjust areas that start after this row
      const adjustedAreas = filteredAreas.map(area => {
        if (area.startRow > rowIndex) {
          return {
            ...area,
            startRow: area.startRow - 1,
            endRow: area.endRow - 1
          };
        }
        return area;
      });
      
      return {
        ...prevState,
        rows: prevState.rows.filter(row => row.id !== id),
        areas: adjustedAreas
      };
    });
  }, []);

  const updateRow = useCallback((id: string, size: string) => {
    setGridState(prevState => {
      const updatedRows = prevState.rows.map(row => 
        row.id === id ? { ...row, size } : row
      );
      return { ...prevState, rows: updatedRows };
    });
  }, []);

  // Area operations
  const addArea = useCallback((area: Omit<GridArea, 'id'>) => {
    const newAreaId = generateId();
    setGridState(prevState => {
      const newArea: GridArea = { ...area, id: newAreaId };
      return {
        ...prevState,
        areas: [...prevState.areas, newArea]
      };
    });
    return newAreaId;
  }, []);

  const updateArea = useCallback((id: string, updates: Partial<Omit<GridArea, 'id'>>) => {
    setGridState(prevState => {
      const updatedAreas = prevState.areas.map(area => 
        area.id === id ? { ...area, ...updates } : area
      );
      return { ...prevState, areas: updatedAreas };
    });
  }, []);

  const removeArea = useCallback((id: string) => {
    setGridState(prevState => ({
      ...prevState,
      areas: prevState.areas.filter(area => area.id !== id)
    }));
  }, []);

  // Update gaps
  const updateGaps = useCallback((rowGap: string, columnGap: string) => {
    setGridState(prevState => ({
      ...prevState,
      gaps: { row: rowGap, column: columnGap }
    }));
  }, []);

  // Update container styles
  const updateContainerStyles = useCallback((styles: Partial<GridState['containerStyles']>) => {
    setGridState(prevState => ({
      ...prevState,
      containerStyles: { ...prevState.containerStyles, ...styles }
    }));
  }, []);

  // Template operations
  const saveTemplate = useCallback((name: string, category: string) => {
    const newTemplate: GridTemplate = {
      id: generateId(),
      name,
      category,
      gridState,
      breakpoints,
      custom: true
    };
    
    setTemplates(prevTemplates => [...prevTemplates, newTemplate]);
  }, [gridState, breakpoints]);

  const loadTemplate = useCallback((templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;
    
    setGridState(template.gridState);
    
    if (template.breakpoints) {
      setBreakpoints(template.breakpoints);
    }
  }, [templates]);

  const deleteTemplate = useCallback((templateId: string) => {
    // Only allow deleting custom templates
    setTemplates(prevTemplates => 
      prevTemplates.filter(t => t.id !== templateId || !t.custom)
    );
  }, []);

  return {
    gridState,
    activeBreakpoint,
    breakpoints,
    exportFormat,
    selectedAreaId,
    templates,
    
    setExportFormat,
    setSelectedAreaId,
    updateGridState,
    updateBreakpointGridState,
    
    addColumn,
    removeColumn,
    updateColumn,
    
    addRow,
    removeRow,
    updateRow,
    
    addArea,
    updateArea,
    removeArea,
    
    updateGaps,
    updateContainerStyles,
    
    saveTemplate,
    loadTemplate,
    deleteTemplate,
    
    setActiveBreakpoint: handleSetActiveBreakpoint,
    addBreakpoint,
    removeBreakpoint
  };
}; 