import { useState, useEffect } from 'react';
import { ContainerConfig, Breakpoint, EditorState } from '@/components/tools/design/ResponsiveContainerBuilder/types';
import { generateContainerStyles } from '@/utils/containerCodeGenerator';

const useResponsiveContainer = (
  initialConfig: ContainerConfig,
  initialEditorState: EditorState
) => {
  const [containerConfig, setContainerConfig] = useState<ContainerConfig>(initialConfig);
  const [editorState, setEditorState] = useState<EditorState>(initialEditorState);
  
  // Find the active breakpoint based on the preview width
  const getActiveBreakpointForWidth = (width: number): string => {
    const sortedBreakpoints = [...containerConfig.breakpoints]
      .sort((a, b) => b.minWidth - a.minWidth);
    
    for (const bp of sortedBreakpoints) {
      if (width >= bp.minWidth) {
        return bp.id;
      }
    }
    
    return containerConfig.breakpoints[0].id;
  };
  
  // Update the active breakpoint when the preview width changes
  useEffect(() => {
    const activeId = getActiveBreakpointForWidth(editorState.previewWidth);
    if (activeId !== editorState.activeBreakpoint) {
      setEditorState(prev => ({
        ...prev,
        activeBreakpoint: activeId
      }));
    }
  }, [editorState.previewWidth, containerConfig.breakpoints]);
  
  // Get the computed styles for a specific width
  const getContainerStylesForWidth = (width: number) => {
    return generateContainerStyles(containerConfig, width);
  };
  
  // Add a new breakpoint
  const addBreakpoint = () => {
    const lastBreakpoint = containerConfig.breakpoints[containerConfig.breakpoints.length - 1];
    const newMinWidth = lastBreakpoint.minWidth + 200;
    
    const newBreakpoint: Breakpoint = {
      id: `custom-${Date.now()}`,
      name: `Custom (${newMinWidth}px)`,
      minWidth: newMinWidth,
      containerWidth: `${newMinWidth}px`,
      containerPadding: lastBreakpoint.containerPadding,
      isFluid: false,
    };
    
    setContainerConfig({
      ...containerConfig,
      breakpoints: [...containerConfig.breakpoints, newBreakpoint],
    });
    
    setEditorState({
      ...editorState,
      activeBreakpoint: newBreakpoint.id,
    });
  };
  
  // Update a breakpoint
  const updateBreakpoint = (id: string, updates: Partial<Breakpoint>) => {
    const updatedBreakpoints = containerConfig.breakpoints.map(bp => 
      bp.id === id ? { ...bp, ...updates } : bp
    );
    
    setContainerConfig({
      ...containerConfig,
      breakpoints: updatedBreakpoints,
    });
  };
  
  // Delete a breakpoint
  const deleteBreakpoint = (id: string) => {
    // Don't allow deleting if only one breakpoint remains
    if (containerConfig.breakpoints.length <= 1) {
      return;
    }
    
    const updatedBreakpoints = containerConfig.breakpoints.filter(bp => bp.id !== id);
    const newConfig = {
      ...containerConfig,
      breakpoints: updatedBreakpoints,
    };
    
    setContainerConfig(newConfig);
    
    // If the active breakpoint was deleted, select another one
    if (id === editorState.activeBreakpoint) {
      setEditorState({
        ...editorState,
        activeBreakpoint: updatedBreakpoints[0].id,
      });
    }
  };
  
  return {
    containerConfig,
    setContainerConfig,
    editorState,
    setEditorState,
    getActiveBreakpointForWidth,
    getContainerStylesForWidth,
    addBreakpoint,
    updateBreakpoint,
    deleteBreakpoint,
  };
};

export default useResponsiveContainer; 