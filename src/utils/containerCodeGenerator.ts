import { ContainerConfig, Breakpoint } from '@/components/tools/design/ResponsiveContainerBuilder/types';

// Default configuration as starting point
export const defaultContainerConfig: ContainerConfig = {
  name: 'container',
  breakpoints: [
    {
      id: 'default',
      name: 'Mobile (Default)',
      minWidth: 0,
      containerWidth: '100%',
      containerPadding: '1rem',
      isFluid: true,
    },
    {
      id: 'sm',
      name: 'Small',
      minWidth: 640,
      containerWidth: '640px',
      containerPadding: '1rem',
      isFluid: false,
    },
    {
      id: 'md',
      name: 'Medium',
      minWidth: 768,
      containerWidth: '768px',
      containerPadding: '1.5rem',
      isFluid: false,
    },
    {
      id: 'lg',
      name: 'Large',
      minWidth: 1024,
      containerWidth: '1024px',
      containerPadding: '2rem',
      isFluid: false,
    },
    {
      id: 'xl',
      name: 'Extra Large',
      minWidth: 1280,
      containerWidth: '1280px',
      containerPadding: '2rem',
      isFluid: false,
    },
  ],
  centerContainer: true,
  useCustomProperties: false,
  customPropertyPrefix: 'container',
};

// Generate Vanilla CSS
export const generateCSSCode = (config: ContainerConfig): string => {
  const { name, breakpoints, centerContainer, useCustomProperties, customPropertyPrefix } = config;
  
  let css = '';
  
  // Add CSS Custom Properties if enabled
  if (useCustomProperties) {
    css += ':root {\n';
    breakpoints.forEach((bp) => {
      css += `  --${customPropertyPrefix}-width-${bp.id}: ${bp.containerWidth};\n`;
      css += `  --${customPropertyPrefix}-padding-${bp.id}: ${bp.containerPadding};\n`;
    });
    css += '}\n\n';
  }
  
  // Base container styles
  css += `.${name} {\n`;
  css += '  width: 100%;\n';
  
  if (centerContainer) {
    css += '  margin-left: auto;\n';
    css += '  margin-right: auto;\n';
  }
  
  // Add default padding (using the first breakpoint)
  const defaultBp = breakpoints[0];
  if (useCustomProperties) {
    css += `  padding-left: var(--${customPropertyPrefix}-padding-${defaultBp.id});\n`;
    css += `  padding-right: var(--${customPropertyPrefix}-padding-${defaultBp.id});\n`;
  } else {
    css += `  padding-left: ${defaultBp.containerPadding};\n`;
    css += `  padding-right: ${defaultBp.containerPadding};\n`;
  }
  
  css += '}\n\n';
  
  // Media queries for each breakpoint (skip the first/default one)
  breakpoints.slice(1).forEach((bp) => {
    css += `@media (min-width: ${bp.minWidth}px) {\n`;
    css += `  .${name} {\n`;
    
    // Container width (only if it's not fluid)
    if (!bp.isFluid) {
      if (useCustomProperties) {
        css += `    max-width: var(--${customPropertyPrefix}-width-${bp.id});\n`;
      } else {
        css += `    max-width: ${bp.containerWidth};\n`;
      }
    }
    
    // Container padding if different from default
    if (bp.containerPadding !== defaultBp.containerPadding) {
      if (useCustomProperties) {
        css += `    padding-left: var(--${customPropertyPrefix}-padding-${bp.id});\n`;
        css += `    padding-right: var(--${customPropertyPrefix}-padding-${bp.id});\n`;
      } else {
        css += `    padding-left: ${bp.containerPadding};\n`;
        css += `    padding-right: ${bp.containerPadding};\n`;
      }
    }
    
    css += '  }\n';
    css += '}\n\n';
  });
  
  return css.trim();
};

// Generate SCSS code with variables and mixins
export const generateSCSSCode = (config: ContainerConfig): string => {
  const { name, breakpoints, centerContainer } = config;
  
  let scss = '// Container variables\n';
  
  // Variables for each breakpoint
  breakpoints.forEach((bp) => {
    scss += `$container-width-${bp.id}: ${bp.containerWidth};\n`;
    scss += `$container-padding-${bp.id}: ${bp.containerPadding};\n`;
  });
  
  scss += `$container-breakpoints: (\n`;
  breakpoints.slice(1).forEach((bp, index, array) => {
    scss += `  ${bp.id}: ${bp.minWidth}px${index < array.length - 1 ? ',' : ''}\n`;
  });
  scss += ');\n\n';
  
  // Container mixin
  scss += '// Container mixin\n';
  scss += '@mixin container {\n';
  scss += '  width: 100%;\n';
  
  if (centerContainer) {
    scss += '  margin-left: auto;\n';
    scss += '  margin-right: auto;\n';
  }
  
  const defaultBp = breakpoints[0];
  scss += `  padding-left: $container-padding-${defaultBp.id};\n`;
  scss += `  padding-right: $container-padding-${defaultBp.id};\n\n`;
  
  // Media queries within the mixin
  breakpoints.slice(1).forEach((bp) => {
    scss += `  @media (min-width: #{map-get($container-breakpoints, ${bp.id})}) {\n`;
    
    if (!bp.isFluid) {
      scss += `    max-width: $container-width-${bp.id};\n`;
    }
    
    if (bp.containerPadding !== defaultBp.containerPadding) {
      scss += `    padding-left: $container-padding-${bp.id};\n`;
      scss += `    padding-right: $container-padding-${bp.id};\n`;
    }
    
    scss += '  }\n';
  });
  
  scss += '}\n\n';
  
  // Usage example
  scss += '// Usage\n';
  scss += `.${name} {\n`;
  scss += '  @include container;\n';
  scss += '}\n';
  
  return scss;
};

// Generate Tailwind config
export const generateTailwindConfig = (config: ContainerConfig): string => {
  const { breakpoints, centerContainer } = config;
  
  // Build the screens object
  const screens: Record<string, string> = {};
  const padding: Record<string, string> = {};
  
  breakpoints.forEach((bp) => {
    if (bp.id !== 'default') {
      screens[bp.id] = `${bp.minWidth}px`;
    }
    padding[bp.id === 'default' ? 'DEFAULT' : bp.id] = bp.containerPadding;
  });
  
  // Format the object for code display
  const formatObject = (obj: Record<string, string | boolean>): string => {
    return JSON.stringify(obj, null, 2)
      .replace(/"([^"]+)":/g, '$1:') // Remove quotes from keys
      .replace(/"/g, "'"); // Change double quotes to single quotes for values
  };
  
  const tailwindConfig = `// tailwind.config.js
module.exports = {
  theme: {
    container: {
      center: ${centerContainer},
      padding: ${formatObject(padding)},
      screens: ${formatObject(screens)},
    },
  },
  // Other Tailwind configuration...
}`;
  
  return tailwindConfig;
};

// Generate styles for preview
export const generateContainerStyles = (
  config: ContainerConfig,
  width: number
): React.CSSProperties => {
  const { breakpoints, centerContainer } = config;
  
  // Find the active breakpoint based on the preview width
  const sortedBreakpoints = [...breakpoints].sort((a, b) => b.minWidth - a.minWidth);
  let activeBreakpoint: Breakpoint | undefined;
  
  for (const bp of sortedBreakpoints) {
    if (width >= bp.minWidth) {
      activeBreakpoint = bp;
      break;
    }
  }
  
  // If no active breakpoint found, use the default one
  if (!activeBreakpoint) {
    activeBreakpoint = breakpoints[0];
  }
  
  // Build styles
  const styles: React.CSSProperties = {
    width: '100%',
    paddingLeft: activeBreakpoint.containerPadding,
    paddingRight: activeBreakpoint.containerPadding,
  };
  
  if (centerContainer) {
    styles.marginLeft = 'auto';
    styles.marginRight = 'auto';
  }
  
  if (!activeBreakpoint.isFluid) {
    styles.maxWidth = typeof activeBreakpoint.containerWidth === 'number'
      ? `${activeBreakpoint.containerWidth}px`
      : activeBreakpoint.containerWidth;
  }
  
  return styles;
}; 