import { useCallback } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { ExportFormat, CustomizationOptions } from './useComponentState';
import { useCodeGenerator } from './useCodeGenerator';

interface ExportOptions {
  componentName: string;
  format: ExportFormat;
  includeReadme: boolean;
  includeTypes: boolean;
  includeExample: boolean;
}

// Generate TypeScript types for React components
const generateTypeDefs = (componentName: string): string => {
  return `import React from 'react';

export interface ${componentName}Props {
  className?: string;
  children?: React.ReactNode;
  onClick?: () => void;
}

export const ${componentName}: React.FC<${componentName}Props>;
`;
};

// Generate README file
const generateReadme = (
  componentName: string,
  format: ExportFormat,
  classes: string
): string => {
  return `# ${componentName}

A Tailwind CSS component generated with the Tailwind Component Maker tool.

## Usage

\`\`\`${format === 'html' ? 'html' : format === 'vue' ? 'vue' : 'tsx'}
${format === 'react' 
  ? `import { ${componentName} } from './${componentName}';

// Use in your component
<${componentName} />`
  : format === 'vue'
  ? `<script setup>
import ${componentName} from './${componentName}.vue';
</script>

<template>
  <${componentName} />
</template>`
  : `<!-- Include in your HTML file -->
<link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">

<!-- Use the component -->
<!-- Copy the component code from ${componentName}.html -->`
}
\`\`\`

## Tailwind Classes

\`\`\`
${classes}
\`\`\`

## Customization

You can customize this component by modifying the Tailwind CSS classes to fit your design needs.
`;
};

// Generate example usage file
const generateExample = (
  componentName: string,
  format: ExportFormat,
  componentCode: string
): string => {
  if (format === 'react') {
    return `import React from 'react';
import { ${componentName} } from './${componentName}';

export const Example = () => {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Example Usage: ${componentName}</h1>
      <${componentName} />
    </div>
  );
};
`;
  }
  
  if (format === 'vue') {
    return `<template>
  <div class="p-8">
    <h1 class="text-2xl font-bold mb-4">Example Usage: ${componentName}</h1>
    <${componentName} />
  </div>
</template>

<script setup>
import ${componentName} from './${componentName}.vue';
</script>
`;
  }
  
  // HTML example
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Example: ${componentName}</title>
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
</head>
<body class="p-8">
  <h1 class="text-2xl font-bold mb-4">Example Usage: ${componentName}</h1>
  
  <!-- Component starts here -->
  ${componentCode}
  <!-- Component ends here -->
</body>
</html>
`;
};

// Hook for exporting components
export const useExporter = (
  componentType: string,
  customization: CustomizationOptions
) => {
  const { generateCode } = useCodeGenerator(componentType, customization);
  
  // Export as a single file (copy to clipboard)
  const copyToClipboard = useCallback(
    async (format: ExportFormat, componentName: string) => {
      const code = generateCode(format, componentName);
      
      try {
        await navigator.clipboard.writeText(code);
        return true;
      } catch (error) {
        console.error('Failed to copy to clipboard:', error);
        return false;
      }
    },
    [generateCode]
  );
  
  // Download as a single file
  const downloadSingleFile = useCallback(
    (format: ExportFormat, componentName: string) => {
      const code = generateCode(format, componentName);
      const extension = format === 'react' ? 'tsx' : format === 'vue' ? 'vue' : 'html';
      const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
      
      saveAs(blob, `${componentName}.${extension}`);
    },
    [generateCode]
  );
  
  // Export as ZIP package
  const exportAsZip = useCallback(
    async (options: ExportOptions) => {
      const {
        componentName,
        format,
        includeReadme,
        includeTypes,
        includeExample
      } = options;
      
      const zip = new JSZip();
      const code = generateCode(format, componentName);
      const extension = format === 'react' ? 'tsx' : format === 'vue' ? 'vue' : 'html';
      
      // Add main component file
      zip.file(`${componentName}.${extension}`, code);
      
      // Add TypeScript definitions if React and includeTypes is true
      if (format === 'react' && includeTypes) {
        const typeDefs = generateTypeDefs(componentName);
        zip.file(`${componentName}.d.ts`, typeDefs);
      }
      
      // Add README if requested
      if (includeReadme) {
        const tailwindClasses = code.match(/className="([^"]+)"/)?.[1] || 
                               code.match(/class="([^"]+)"/)?.[1] || '';
        const readme = generateReadme(componentName, format, tailwindClasses);
        zip.file('README.md', readme);
      }
      
      // Add example if requested
      if (includeExample) {
        const example = generateExample(componentName, format, code);
        zip.file(`Example.${extension}`, example);
      }
      
      // Generate ZIP file
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `${componentName}.zip`);
    },
    [generateCode]
  );
  
  return {
    copyToClipboard,
    downloadSingleFile,
    exportAsZip,
  };
}; 