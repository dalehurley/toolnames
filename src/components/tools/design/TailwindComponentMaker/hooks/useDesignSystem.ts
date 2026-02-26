import { useState, useEffect } from 'react';
import { TokenCategory, DesignToken, ThemeDefinition, DesignSystem, UseDesignSystemReturn } from './designSystem.types';

// Component property types
export type ComponentProperty = 
  | "text-color" 
  | "background-color" 
  | "border-color" 
  | "border-radius" 
  | "padding" 
  | "margin" 
  | "font-size" 
  | "font-family" 
  | "shadow" 
  | "width" 
  | "height";

// Component types
export type ComponentType = 
  | "button" 
  | "card" 
  | "input" 
  | "badge" 
  | "alert" 
  | "avatar" 
  | "dialog";

// Token mapping for components
export interface TokenMapping {
  id: string;
  componentType: ComponentType;
  componentId: string;
  property: ComponentProperty;
  tokenId: string;
  themeId: string;
  appliedAt: number;
}

// The updated hook interface
export const useDesignSystem = (): UseDesignSystemReturn => {
  // Current design system
  const [designSystems, setDesignSystems] = useState<DesignSystem[]>([]);
  const [activeDesignSystemId, setActiveDesignSystemId] = useState<string | null>(null);
  const [activeThemeId, setActiveThemeId] = useState<string | null>(null);
  const [tokenMappings, setTokenMappings] = useState<TokenMapping[]>([]);
  
  // Load design systems from localStorage
  useEffect(() => {
    const storedSystems = localStorage.getItem('tailwind-component-maker-design-systems');
    if (storedSystems) {
      try {
        const parsed = JSON.parse(storedSystems);
        setDesignSystems(parsed);
        
        // Set active design system to the first one if exists
        if (parsed.length > 0 && !activeDesignSystemId) {
          setActiveDesignSystemId(parsed[0].id);
          
          // Set active theme to the default theme
          const defaultTheme = parsed[0].themes.find((theme: ThemeDefinition) => theme.isDefault);
          setActiveThemeId(defaultTheme?.id || parsed[0].themes[0]?.id || null);
        }
      } catch (error) {
        console.error('Failed to parse design systems', error);
      }
    }

    // Load token mappings from localStorage
    const storedMappings = localStorage.getItem('tailwind-component-maker-token-mappings');
    if (storedMappings) {
      try {
        const parsed = JSON.parse(storedMappings);
        setTokenMappings(parsed);
      } catch (error) {
        console.error('Failed to parse token mappings', error);
      }
    }
  }, []);
  
  // Save design systems to localStorage when updated
  useEffect(() => {
    if (designSystems.length > 0) {
      localStorage.setItem('tailwind-component-maker-design-systems', JSON.stringify(designSystems));
    }
  }, [designSystems]);

  // Save token mappings to localStorage when updated
  useEffect(() => {
    if (tokenMappings.length > 0) {
      localStorage.setItem('tailwind-component-maker-token-mappings', JSON.stringify(tokenMappings));
    }
  }, [tokenMappings]);
  
  // Get the active design system
  const getActiveDesignSystem = (): DesignSystem | null => {
    if (!activeDesignSystemId) return null;
    return designSystems.find(system => system.id === activeDesignSystemId) || null;
  };
  
  // Get the active theme
  const getActiveTheme = (): ThemeDefinition | null => {
    const system = getActiveDesignSystem();
    if (!system || !activeThemeId) return null;
    return system.themes.find(theme => theme.id === activeThemeId) || null;
  };
  
  // Create a new design system
  const createDesignSystem = (name: string, description?: string): string => {
    const newSystem: DesignSystem = {
      id: Date.now().toString(),
      name,
      description,
      themes: [
        {
          id: `${Date.now()}-default`,
          name: 'Default',
          tokens: [],
          isDefault: true
        },
        {
          id: `${Date.now() + 1}-dark`,
          name: 'Dark',
          tokens: [],
          isDefault: false
        }
      ],
      components: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    setDesignSystems(prev => [...prev, newSystem]);
    setActiveDesignSystemId(newSystem.id);
    setActiveThemeId(newSystem.themes[0].id);
    
    return newSystem.id;
  };
  
  // Create a new theme in the active design system
  const createTheme = (name: string, basedOnThemeId?: string): string | null => {
    const system = getActiveDesignSystem();
    if (!system) return null;
    
    let tokens: DesignToken[] = [];
    
    // Copy tokens from base theme if specified
    if (basedOnThemeId) {
      const baseTheme = system.themes.find(theme => theme.id === basedOnThemeId);
      if (baseTheme) {
        tokens = [...baseTheme.tokens];
      }
    }
    
    const newTheme: ThemeDefinition = {
      id: `${Date.now()}-${name.toLowerCase().replace(/\s+/g, '-')}`,
      name,
      tokens,
      isDefault: false
    };
    
    setDesignSystems(prev => 
      prev.map(sys => 
        sys.id === system.id 
          ? { ...sys, themes: [...sys.themes, newTheme], updatedAt: Date.now() } 
          : sys
      )
    );
    
    return newTheme.id;
  };
  
  // Add a token to a theme
  const addToken = (
    themeId: string, 
    name: string, 
    value: string, 
    category: TokenCategory,
    description?: string
  ): string | null => {
    const system = getActiveDesignSystem();
    if (!system) return null;
    
    const newToken: DesignToken = {
      id: `${Date.now()}-${name.toLowerCase().replace(/\s+/g, '-')}`,
      name,
      value,
      category,
      description
    };
    
    setDesignSystems(prev => 
      prev.map(sys => {
        if (sys.id !== system.id) return sys;
        
        return {
          ...sys,
          themes: sys.themes.map(theme => 
            theme.id === themeId 
              ? { ...theme, tokens: [...theme.tokens, newToken] } 
              : theme
          ),
          updatedAt: Date.now()
        };
      })
    );
    
    return newToken.id;
  };
  
  // Update a token
  const updateToken = (
    themeId: string,
    tokenId: string,
    updates: Partial<Omit<DesignToken, 'id'>>
  ): boolean => {
    const system = getActiveDesignSystem();
    if (!system) return false;
    
    let success = false;
    
    setDesignSystems(prev => 
      prev.map(sys => {
        if (sys.id !== system.id) return sys;
        
        return {
          ...sys,
          themes: sys.themes.map(theme => {
            if (theme.id !== themeId) return theme;
            
            const updatedTokens = theme.tokens.map(token => {
              if (token.id !== tokenId) return token;
              success = true;
              return { ...token, ...updates };
            });
            
            return { ...theme, tokens: updatedTokens };
          }),
          updatedAt: Date.now()
        };
      })
    );
    
    return success;
  };
  
  // Delete a token
  const deleteToken = (themeId: string, tokenId: string): boolean => {
    const system = getActiveDesignSystem();
    if (!system) return false;
    
    let success = false;
    
    setDesignSystems(prev => 
      prev.map(sys => {
        if (sys.id !== system.id) return sys;
        
        return {
          ...sys,
          themes: sys.themes.map(theme => {
            if (theme.id !== themeId) return theme;
            
            const filteredTokens = theme.tokens.filter(token => {
              if (token.id === tokenId) {
                success = true;
                return false;
              }
              return true;
            });
            
            return { ...theme, tokens: filteredTokens };
          }),
          updatedAt: Date.now()
        };
      })
    );

    // Remove any token mappings that use this token
    if (success) {
      setTokenMappings(prev => prev.filter(mapping => mapping.tokenId !== tokenId));
    }
    
    return success;
  };
  
  // Add a component to the design system
  const addComponentToSystem = (componentId: string): boolean => {
    const system = getActiveDesignSystem();
    if (!system) return false;
    
    // Check if component already exists in the system
    if (system.components.includes(componentId)) return true;
    
    setDesignSystems(prev => 
      prev.map(sys => 
        sys.id === system.id 
          ? { 
              ...sys, 
              components: [...sys.components, componentId],
              updatedAt: Date.now()
            } 
          : sys
      )
    );
    
    return true;
  };

  // Apply a token to a component property
  const applyTokenToComponent = (
    componentId: string,
    componentType: ComponentType,
    property: ComponentProperty,
    tokenId: string
  ): boolean => {
    if (!activeThemeId) return false;

    // Check if token exists
    const activeTheme = getActiveTheme();
    if (!activeTheme || !activeTheme.tokens.some(token => token.id === tokenId)) {
      return false;
    }

    // Check if mapping already exists
    const existingMapping = tokenMappings.find(
      mapping => 
        mapping.componentId === componentId && 
        mapping.property === property && 
        mapping.themeId === activeThemeId
    );

    // If exists, update it
    if (existingMapping) {
      setTokenMappings(prev => 
        prev.map(mapping => 
          mapping.id === existingMapping.id 
            ? { ...mapping, tokenId, appliedAt: Date.now() } 
            : mapping
        )
      );
      return true;
    }

    // Otherwise, create a new mapping
    const newMapping: TokenMapping = {
      id: `mapping-${Date.now()}`,
      componentType,
      componentId,
      property,
      tokenId,
      themeId: activeThemeId,
      appliedAt: Date.now()
    };

    setTokenMappings(prev => [...prev, newMapping]);
    return true;
  };

  // Remove a token mapping
  const removeTokenMapping = (mappingId: string): boolean => {
    const mappingExists = tokenMappings.some(mapping => mapping.id === mappingId);
    if (!mappingExists) return false;

    setTokenMappings(prev => prev.filter(mapping => mapping.id !== mappingId));
    return true;
  };

  // Get token mappings for a specific theme
  const getTokenMappingsByTheme = (themeId: string): TokenMapping[] => {
    return tokenMappings.filter(mapping => mapping.themeId === themeId);
  };

  // Get token mappings for a specific component
  const getTokenMappingsByComponent = (componentId: string): TokenMapping[] => {
    return tokenMappings.filter(mapping => mapping.componentId === componentId);
  };
  
  // Generate component variants based on a component
  const generateComponentVariants = (
    baseComponentId: string, 
    variantNames: string[]
  ): string[] => {
    // This is a placeholder - in a real implementation, this would create
    // new component variants based on a base component
    // For now, we'll just return an empty array
    // TODO: Implement variant generation using baseComponentId and variantNames
    void baseComponentId; // Acknowledge parameter to avoid unused warning
    void variantNames; // Acknowledge parameter to avoid unused warning
    return [];
  };
  
  // Export the design system as a JSON file
  const exportDesignSystem = (systemId: string): boolean => {
    const system = systemId 
      ? designSystems.find(sys => sys.id === systemId)
      : getActiveDesignSystem();
      
    if (!system) return false;
    
    try {
      // Create a formatted JSON string
      const jsonString = JSON.stringify(system, null, 2);
      
      // Create a blob and download link
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${system.name.toLowerCase().replace(/\s+/g, '-')}-design-system.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      console.error('Failed to export design system', error);
      return false;
    }
  };
  
  // Import a design system from a JSON file
  const importDesignSystem = async (file: File): Promise<boolean> => {
    try {
      const text = await file.text();
      const importedSystem = JSON.parse(text) as DesignSystem;
      
      // Validate the imported data (basic validation)
      if (!importedSystem.id || !importedSystem.name || !Array.isArray(importedSystem.themes)) {
        throw new Error('Invalid design system data');
      }
      
      // Check if a system with this ID already exists
      const existingIndex = designSystems.findIndex(sys => sys.id === importedSystem.id);
      
      if (existingIndex >= 0) {
        // Update existing system
        setDesignSystems(prev => 
          prev.map((sys, index) => 
            index === existingIndex ? { ...importedSystem, updatedAt: Date.now() } : sys
          )
        );
      } else {
        // Add new system
        setDesignSystems(prev => [...prev, { ...importedSystem, updatedAt: Date.now() }]);
      }
      
      setActiveDesignSystemId(importedSystem.id);
      
      const defaultTheme = importedSystem.themes.find(theme => theme.isDefault);
      setActiveThemeId(defaultTheme?.id || importedSystem.themes[0]?.id || null);
      
      return true;
    } catch (error) {
      console.error('Failed to import design system', error);
      return false;
    }
  };
  
  // Convert design tokens to Tailwind config
  const generateTailwindConfig = (systemId?: string): string => {
    const system = systemId 
      ? designSystems.find(sys => sys.id === systemId)
      : getActiveDesignSystem();
      
    if (!system) return '';
    
    // Get the default theme
    const defaultTheme = system.themes.find(theme => theme.isDefault) || system.themes[0];
    if (!defaultTheme) return '';
    
    // Group tokens by category
    const colorTokens = defaultTheme.tokens.filter(token => token.category === 'color');
    const spacingTokens = defaultTheme.tokens.filter(token => token.category === 'spacing');
    const borderTokens = defaultTheme.tokens.filter(token => token.category === 'border');
    const shadowTokens = defaultTheme.tokens.filter(token => token.category === 'shadow');
    const typographyTokens = defaultTheme.tokens.filter(token => token.category === 'typography');
    const breakpointTokens = defaultTheme.tokens.filter(token => token.category === 'breakpoint');
    
    // Generate Tailwind config sections
    let config = `/** 
 * Tailwind CSS configuration generated from ${system.name} design system
 * Generated on: ${new Date().toISOString()}
 */
module.exports = {
  theme: {
    extend: {\n`;
    
    // Add colors
    if (colorTokens.length > 0) {
      config += `      colors: {
`;
      colorTokens.forEach(token => {
        config += `        '${token.name}': '${token.value}',\n`;
      });
      config += `      },\n`;
    }
    
    // Add spacing
    if (spacingTokens.length > 0) {
      config += `      spacing: {
`;
      spacingTokens.forEach(token => {
        config += `        '${token.name}': '${token.value}',\n`;
      });
      config += `      },\n`;
    }
    
    // Add border radius
    const borderRadiusTokens = borderTokens.filter(token => token.name.includes('radius'));
    if (borderRadiusTokens.length > 0) {
      config += `      borderRadius: {
`;
      borderRadiusTokens.forEach(token => {
        config += `        '${token.name.replace('radius-', '')}': '${token.value}',\n`;
      });
      config += `      },\n`;
    }
    
    // Add shadows
    if (shadowTokens.length > 0) {
      config += `      boxShadow: {
`;
      shadowTokens.forEach(token => {
        config += `        '${token.name}': '${token.value}',\n`;
      });
      config += `      },\n`;
    }
    
    // Add font families, sizes, weights
    const fontFamilyTokens = typographyTokens.filter(token => token.name.includes('family'));
    if (fontFamilyTokens.length > 0) {
      config += `      fontFamily: {
`;
      fontFamilyTokens.forEach(token => {
        config += `        '${token.name.replace('family-', '')}': '${token.value}',\n`;
      });
      config += `      },\n`;
    }
    
    // Add breakpoints
    if (breakpointTokens.length > 0) {
      config += `      screens: {
`;
      breakpointTokens.forEach(token => {
        config += `        '${token.name}': '${token.value}',\n`;
      });
      config += `      },\n`;
    }
    
    config += `    },
  },
  plugins: [],
}
`;
    
    return config;
  };
  
  return {
    designSystems,
    activeDesignSystemId,
    activeThemeId,
    setActiveDesignSystemId,
    setActiveThemeId,
    getActiveDesignSystem,
    getActiveTheme,
    createDesignSystem,
    createTheme,
    addToken,
    updateToken,
    deleteToken,
    addComponentToSystem,
    generateComponentVariants,
    exportDesignSystem,
    importDesignSystem,
    generateTailwindConfig,
    // New token-component mapping methods
    tokenMappings,
    applyTokenToComponent,
    removeTokenMapping,
    getTokenMappingsByTheme,
    getTokenMappingsByComponent
  };
}; 