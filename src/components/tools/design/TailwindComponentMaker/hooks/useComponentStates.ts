import { useState } from 'react';
import { CustomizationOptions } from './useComponentState';

export type ComponentState = 'default' | 'hover' | 'focus' | 'active' | 'disabled';

export interface StateCustomizations {
  [state: string]: Partial<CustomizationOptions>;
}

interface StatePrefixMap {
  hover: string;
  focus: string;
  active: string;
  disabled: string;
  [key: string]: string;
}

// Define a type with index signature for nested objects
interface IndexableObject {
  [key: string]: string | boolean | string[] | Record<string, unknown>;
}

export const useComponentStates = (defaultCustomization: CustomizationOptions) => {
  // Current active state for preview
  const [activeState, setActiveState] = useState<ComponentState>('default');
  
  // State-specific customizations
  const [stateCustomizations, setStateCustomizations] = useState<StateCustomizations>({
    default: defaultCustomization,
    hover: {},
    focus: {},
    active: {},
    disabled: {}
  });
  
  // Update customization for a specific state
  const updateStateCustomization = (
    state: ComponentState,
    category: keyof CustomizationOptions,
    property: string,
    value: string | boolean | string[]
  ) => {
    setStateCustomizations(prev => {
      // Create a new object for the state if it doesn't exist
      const stateObj = prev[state] || {} as Partial<CustomizationOptions>;
      
      // Handle nested properties (like spacing.padding.x)
      const propertyParts = property.split('.');
      
      if (propertyParts.length === 1) {
        // For simple properties
        return {
          ...prev,
          [state]: {
            ...stateObj,
            [category]: {
              ...(stateObj[category] as IndexableObject || {}),
              [property]: value
            }
          }
        };
      } else {
        // For nested properties
        const [mainProp, subProp] = propertyParts;
        const categoryObj = stateObj[category] as IndexableObject || {};
        const mainObj = categoryObj[mainProp] as Record<string, unknown> || {};
        
        return {
          ...prev,
          [state]: {
            ...stateObj,
            [category]: {
              ...categoryObj,
              [mainProp]: {
                ...mainObj,
                [subProp]: value
              }
            }
          }
        };
      }
    });
  };
  
  // Reset a specific state's customizations
  const resetStateCustomization = (state: ComponentState) => {
    setStateCustomizations(prev => ({
      ...prev,
      [state]: state === 'default' ? defaultCustomization : {}
    }));
  };
  
  // Get combined classes for a component based on state
  const getStateClasses = (
    _componentType: string, // Prefix with underscore to indicate it's unused
    baseClasses: string,
    state: ComponentState
  ): string => {
    if (state === 'default') {
      return baseClasses;
    }
    
    // Get the state-specific classes
    const statePrefix: StatePrefixMap = {
      hover: 'hover:',
      focus: 'focus:',
      active: 'active:',
      disabled: 'disabled:'
    };
    
    const prefix = statePrefix[state] || '';
    
    // Extract classes specific to this state
    const stateSpecificClasses = stateCustomizations[state];
    if (!stateSpecificClasses || Object.keys(stateSpecificClasses).length === 0) {
      return baseClasses;
    }
    
    // Build state-specific class string (simplified version)
    let stateClasses = '';
    
    // Add color classes
    if (stateSpecificClasses.colors?.background) {
      stateClasses += ` ${prefix}${stateSpecificClasses.colors.background}`;
    }
    if (stateSpecificClasses.colors?.text) {
      stateClasses += ` ${prefix}${stateSpecificClasses.colors.text}`;
    }
    if (stateSpecificClasses.colors?.border) {
      stateClasses += ` ${prefix}${stateSpecificClasses.colors.border}`;
    }
    
    // Add other state-specific classes as needed...
    
    return `${baseClasses}${stateClasses}`;
  };
  
  return {
    activeState,
    setActiveState,
    stateCustomizations,
    updateStateCustomization,
    resetStateCustomization,
    getStateClasses
  };
}; 