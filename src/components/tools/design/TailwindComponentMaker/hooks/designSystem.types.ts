export type TokenCategory = 'color' | 'typography' | 'spacing' | 'border' | 'shadow' | 'breakpoint';

export interface DesignToken {
  id: string;
  name: string;
  value: string;
  category: TokenCategory;
  description?: string;
}

export interface ThemeDefinition {
  id: string;
  name: string;
  tokens: DesignToken[];
  isDefault?: boolean;
}

export interface DesignSystem {
  id: string;
  name: string;
  description?: string;
  themes: ThemeDefinition[];
  components: string[]; // IDs of components in this design system
  createdAt: number;
  updatedAt: number;
}

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

export interface UseDesignSystemReturn {
  designSystems: DesignSystem[];
  activeDesignSystemId: string | null;
  activeThemeId: string | null;
  setActiveDesignSystemId: (id: string) => void;
  setActiveThemeId: (id: string) => void;
  getActiveDesignSystem: () => DesignSystem | null;
  getActiveTheme: () => ThemeDefinition | null;
  createDesignSystem: (name: string, description?: string) => string;
  createTheme: (name: string, basedOnThemeId?: string) => string | null;
  addToken: (themeId: string, name: string, value: string, category: TokenCategory, description?: string) => string | null;
  updateToken: (themeId: string, tokenId: string, updates: Partial<Omit<DesignToken, 'id'>>) => boolean;
  deleteToken: (themeId: string, tokenId: string) => boolean;
  addComponentToSystem: (componentId: string) => boolean;
  generateComponentVariants: (baseComponentId: string, variantNames: string[]) => string[];
  exportDesignSystem: (systemId: string) => boolean;
  importDesignSystem: (file: File) => Promise<boolean>;
  generateTailwindConfig: (systemId?: string) => string;
  // New token-component mapping methods
  tokenMappings: TokenMapping[];
  applyTokenToComponent: (componentId: string, componentType: ComponentType, property: ComponentProperty, tokenId: string) => boolean;
  removeTokenMapping: (mappingId: string) => boolean;
  getTokenMappingsByTheme: (themeId: string) => TokenMapping[];
  getTokenMappingsByComponent: (componentId: string) => TokenMapping[];
} 