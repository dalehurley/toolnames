import { useCallback } from 'react';
import { CustomizationOptions, ExportFormat } from './useComponentState';

// Define component templates interface
export interface ComponentTemplate {
  id: string;
  name: string;
  category: string;
  generateReactCode: (customization: CustomizationOptions, componentName?: string) => string;
  generateVueCode: (customization: CustomizationOptions, componentName?: string) => string;
  generateHtmlCode: (customization: CustomizationOptions) => string;
}

// Helper to combine Tailwind classes from customization
export const combineClasses = (customization: CustomizationOptions, type: string): string => {
  const classes: string[] = [];
  
  // Base classes based on component type
  if (type.startsWith('button')) {
    classes.push('inline-flex items-center justify-center');
    
    // Only add transition if not an outline button
    if (!type.includes('outline')) {
      classes.push('transition-colors');
    }
  }
  
  if (type.startsWith('card')) {
    classes.push('overflow-hidden');
  }
  
  // Add color classes
  classes.push(customization.colors.background);
  classes.push(customization.colors.text);
  
  // Add border if specified
  if (customization.borders.width !== 'border-0') {
    classes.push(customization.borders.width);
    classes.push(customization.colors.border);
    classes.push(customization.borders.style);
  }
  
  // Add border radius
  classes.push(customization.borders.radius);
  
  // Add typography
  classes.push(customization.typography.size);
  classes.push(customization.typography.weight);
  classes.push(customization.typography.family);
  classes.push(customization.typography.alignment);
  
  // Add padding
  if (customization.spacing.padding.x !== 'px-0') classes.push(customization.spacing.padding.x);
  if (customization.spacing.padding.y !== 'py-0') classes.push(customization.spacing.padding.y);
  if (customization.spacing.padding.t !== 'pt-0') classes.push(customization.spacing.padding.t);
  if (customization.spacing.padding.r !== 'pr-0') classes.push(customization.spacing.padding.r);
  if (customization.spacing.padding.b !== 'pb-0') classes.push(customization.spacing.padding.b);
  if (customization.spacing.padding.l !== 'pl-0') classes.push(customization.spacing.padding.l);
  
  // Add margin
  if (customization.spacing.margin.x !== 'mx-0') classes.push(customization.spacing.margin.x);
  if (customization.spacing.margin.y !== 'my-0') classes.push(customization.spacing.margin.y);
  if (customization.spacing.margin.t !== 'mt-0') classes.push(customization.spacing.margin.t);
  if (customization.spacing.margin.r !== 'mr-0') classes.push(customization.spacing.margin.r);
  if (customization.spacing.margin.b !== 'mb-0') classes.push(customization.spacing.margin.b);
  if (customization.spacing.margin.l !== 'ml-0') classes.push(customization.spacing.margin.l);
  
  // Add shadow
  if (customization.shadows.type !== 'shadow-none') {
    classes.push(customization.shadows.size);
  }
  
  // Add responsive classes
  if (customization.responsive.hidden.includes('mobile')) {
    classes.push('hidden sm:block');
  }
  
  if (customization.responsive.hidden.includes('tablet')) {
    classes.push('sm:hidden md:block');
  }
  
  if (customization.responsive.hidden.includes('desktop')) {
    classes.push('md:hidden');
  }
  
  if (customization.responsive.flex) {
    classes.push('flex-1');
  }
  
  // Return combined classes, filtering out any empty strings
  return classes.filter(Boolean).join(' ');
};

// Hook for generating component code
export const useCodeGenerator = (
  componentType: string,
  customization: CustomizationOptions
) => {
  // Generate different code formats based on component type and customization
  const generateCode = useCallback(
    (format: ExportFormat, componentName = 'MyComponent'): string => {
      const tailwindClasses = combineClasses(customization, componentType);
      
      // React/TSX code
      if (format === 'react') {
        if (componentType.startsWith('button')) {
          return `import React from 'react';

export const ${componentName} = () => {
  return (
    <button
      className="${tailwindClasses}"
      onClick={() => console.log('Button clicked')}
    >
      Button Text
    </button>
  );
};`;
        }
        
        if (componentType.startsWith('card')) {
          return `import React from 'react';

export const ${componentName} = () => {
  return (
    <div className="${tailwindClasses}">
      <div className="p-4">
        <h3 className="text-lg font-medium">Card Title</h3>
        <p className="mt-2 text-gray-600">Card content goes here...</p>
      </div>
      <div className="border-t p-4">
        <button className="px-4 py-2 bg-blue-500 text-white rounded-md">
          Action
        </button>
      </div>
    </div>
  );
};`;
        }
        
        // Default component template
        return `import React from 'react';

export const ${componentName} = () => {
  return (
    <div className="${tailwindClasses}">
      Component Content
    </div>
  );
};`;
      }
      
      // Vue code
      if (format === 'vue') {
        if (componentType.startsWith('button')) {
          return `<template>
  <button
    class="${tailwindClasses}"
    @click="handleClick"
  >
    Button Text
  </button>
</template>

<script setup>
const handleClick = () => {
  console.log('Button clicked');
};
</script>`;
        }
        
        if (componentType.startsWith('card')) {
          return `<template>
  <div class="${tailwindClasses}">
    <div class="p-4">
      <h3 class="text-lg font-medium">Card Title</h3>
      <p class="mt-2 text-gray-600">Card content goes here...</p>
    </div>
    <div class="border-t p-4">
      <button class="px-4 py-2 bg-blue-500 text-white rounded-md" @click="handleAction">
        Action
      </button>
    </div>
  </div>
</template>

<script setup>
const handleAction = () => {
  console.log('Action clicked');
};
</script>`;
        }
        
        // Default component template
        return `<template>
  <div class="${tailwindClasses}">
    Component Content
  </div>
</template>

<script setup>
// Component logic goes here
</script>`;
      }
      
      // HTML code
      if (componentType.startsWith('button')) {
        return `<button class="${tailwindClasses}">
  Button Text
</button>`;
      }
      
      if (componentType.startsWith('card')) {
        return `<div class="${tailwindClasses}">
  <div class="p-4">
    <h3 class="text-lg font-medium">Card Title</h3>
    <p class="mt-2 text-gray-600">Card content goes here...</p>
  </div>
  <div class="border-t p-4">
    <button class="px-4 py-2 bg-blue-500 text-white rounded-md">
      Action
    </button>
  </div>
</div>`;
      }
      
      // Default HTML template
      return `<div class="${tailwindClasses}">
  Component Content
</div>`;
    },
    [componentType, customization]
  );
  
  return {
    generateCode,
  };
}; 