import { useState, useEffect } from 'react';

// Component template types
export type ComponentCategory = 'button' | 'card' | 'form' | 'navigation' | 'layout' | 'data';
export type ExportFormat = 'react' | 'vue' | 'html';
export type ViewportSize = 'mobile' | 'tablet' | 'desktop';

// Interface for saved component
export interface SavedComponent {
  id: string;
  name: string;
  componentType: string;
  customization: CustomizationOptions;
  createdAt: number;
}

// Customization options interface
export interface CustomizationOptions {
  colors: {
    background: string;
    text: string;
    border: string;
    accent: string;
  };
  typography: {
    size: string;
    weight: string;
    family: string;
    alignment: string;
  };
  spacing: {
    padding: {
      x: string;
      y: string;
      t: string;
      r: string;
      b: string;
      l: string;
    };
    margin: {
      x: string;
      y: string;
      t: string;
      r: string;
      b: string;
      l: string;
    };
  };
  borders: {
    width: string;
    radius: string;
    style: string;
  };
  shadows: {
    type: string;
    size: string;
  };
  responsive: {
    hidden: ViewportSize[];
    flex: boolean;
  };
}

// Default customization options
const defaultCustomizationOptions: CustomizationOptions = {
  colors: {
    background: 'bg-blue-500',
    text: 'text-white',
    border: 'border-blue-600',
    accent: 'bg-blue-600',
  },
  typography: {
    size: 'text-base',
    weight: 'font-medium',
    family: 'font-sans',
    alignment: 'text-center',
  },
  spacing: {
    padding: {
      x: 'px-4',
      y: 'py-2',
      t: 'pt-0',
      r: 'pr-0',
      b: 'pb-0',
      l: 'pl-0',
    },
    margin: {
      x: 'mx-0',
      y: 'my-0',
      t: 'mt-0',
      r: 'mr-0',
      b: 'mb-0',
      l: 'ml-0',
    },
  },
  borders: {
    width: 'border',
    radius: 'rounded-md',
    style: 'border-solid',
  },
  shadows: {
    type: 'shadow',
    size: 'shadow-md',
  },
  responsive: {
    hidden: [],
    flex: false,
  },
};

// Hook for managing component state
export const useComponentState = () => {
  // State for selected component type
  const [selectedComponentType, setSelectedComponentType] = useState<string>('button-primary');
  
  // State for customization options
  const [customizationOptions, setCustomizationOptions] = useState<CustomizationOptions>(
    defaultCustomizationOptions
  );
  
  // State for active viewport
  const [activeViewport, setActiveViewport] = useState<ViewportSize>('desktop');
  
  // State for export format
  const [exportFormat, setExportFormat] = useState<ExportFormat>('react');
  
  // State for saved components
  const [savedComponents, setSavedComponents] = useState<SavedComponent[]>([]);

  // Load saved components from localStorage
  useEffect(() => {
    const savedComponentsFromStorage = localStorage.getItem('tailwind-component-maker-saved');
    if (savedComponentsFromStorage) {
      try {
        const parsed = JSON.parse(savedComponentsFromStorage);
        setSavedComponents(parsed);
      } catch (error) {
        console.error('Failed to parse saved components', error);
      }
    }
  }, []);

  // Save components to localStorage when updated
  useEffect(() => {
    if (savedComponents.length > 0) {
      localStorage.setItem('tailwind-component-maker-saved', JSON.stringify(savedComponents));
    }
  }, [savedComponents]);

  // Update a specific customization option
  const updateCustomization = (
    category: keyof CustomizationOptions,
    property: string,
    value: string | boolean | ViewportSize[]
  ) => {
    setCustomizationOptions((prev) => {
      // Handle nested properties (like spacing.padding.x)
      const propertyParts = property.split('.');
      
      if (propertyParts.length === 1) {
        // Type assertion to handle dynamic property access
        const updatedCategory = {
          ...prev[category],
          [property]: value,
        };
        
        return {
          ...prev,
          [category]: updatedCategory,
        };
      } else {
        // Handle nested property (e.g., spacing.padding.x)
        const [mainProp, subProp] = propertyParts;
        // Use more specific typing for the category object
        const categoryObj = prev[category] as Record<string, Record<string, string | boolean | ViewportSize[]>>;
        const updatedNestedObj = {
          ...categoryObj[mainProp],
          [subProp]: value,
        };
        
        return {
          ...prev,
          [category]: {
            ...categoryObj,
            [mainProp]: updatedNestedObj,
          },
        };
      }
    });
  };

  // Reset customization to defaults
  const resetCustomization = () => {
    setCustomizationOptions(defaultCustomizationOptions);
  };

  // Save current component
  const saveComponent = (name: string) => {
    const newComponent: SavedComponent = {
      id: Date.now().toString(),
      name,
      componentType: selectedComponentType,
      customization: customizationOptions,
      createdAt: Date.now(),
    };
    
    setSavedComponents((prev) => [newComponent, ...prev]);
    return newComponent.id;
  };

  // Load a saved component
  const loadComponent = (id: string) => {
    const component = savedComponents.find((c) => c.id === id);
    if (component) {
      setSelectedComponentType(component.componentType);
      setCustomizationOptions(component.customization);
      return true;
    }
    return false;
  };

  // Delete a saved component
  const deleteComponent = (id: string) => {
    setSavedComponents((prev) => prev.filter((c) => c.id !== id));
  };

  return {
    selectedComponentType,
    setSelectedComponentType,
    customizationOptions,
    updateCustomization,
    resetCustomization,
    activeViewport,
    setActiveViewport,
    exportFormat,
    setExportFormat,
    savedComponents,
    saveComponent,
    loadComponent,
    deleteComponent,
  };
}; 