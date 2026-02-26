import { FlexContainerProps, FlexItemProps } from './types';

// Generate a random pastel color
export const getRandomPastelColor = (): string => {
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue}, 70%, 80%)`;
};

// Convert pixel values to rem
export const pxToRem = (px: number): string => {
  return `${px / 16}rem`;
};

// Generate CSS code from Flexbox properties
export const generateCSSCode = (container: FlexContainerProps, items: FlexItemProps[]): string => {
  let code = `.flex-container {\n`;
  code += `  display: ${container.display};\n`;
  code += `  flex-direction: ${container.flexDirection};\n`;
  code += `  flex-wrap: ${container.flexWrap};\n`;
  code += `  justify-content: ${container.justifyContent};\n`;
  code += `  align-items: ${container.alignItems};\n`;
  
  if (container.alignContent !== 'normal') {
    code += `  align-content: ${container.alignContent};\n`;
  }
  
  if (container.gap) {
    code += `  gap: ${container.gap};\n`;
  }
  
  if (container.rowGap) {
    code += `  row-gap: ${container.rowGap};\n`;
  }
  
  if (container.columnGap) {
    code += `  column-gap: ${container.columnGap};\n`;
  }
  
  if (container.padding) {
    code += `  padding: ${container.padding};\n`;
  }
  
  if (container.backgroundColor) {
    code += `  background-color: ${container.backgroundColor};\n`;
  }
  
  if (container.width) {
    code += `  width: ${container.width};\n`;
  }
  
  if (container.height) {
    code += `  height: ${container.height};\n`;
  }
  
  code += `}\n\n`;
  
  // Generate rules for each flex item
  items.forEach((item, index) => {
    code += `.flex-item-${index + 1} {\n`;
    
    if (item.order !== undefined && item.order !== 0) {
      code += `  order: ${item.order};\n`;
    }
    
    if (item.flexGrow !== undefined && item.flexGrow !== 0) {
      code += `  flex-grow: ${item.flexGrow};\n`;
    }
    
    if (item.flexShrink !== undefined && item.flexShrink !== 1) {
      code += `  flex-shrink: ${item.flexShrink};\n`;
    }
    
    if (item.flexBasis && item.flexBasis !== 'auto') {
      code += `  flex-basis: ${item.flexBasis};\n`;
    }
    
    if (item.alignSelf && item.alignSelf !== 'auto') {
      code += `  align-self: ${item.alignSelf};\n`;
    }
    
    if (item.width) {
      code += `  width: ${item.width};\n`;
    }
    
    if (item.height) {
      code += `  height: ${item.height};\n`;
    }
    
    if (item.margin) {
      code += `  margin: ${item.margin};\n`;
    }
    
    if (item.padding) {
      code += `  padding: ${item.padding};\n`;
    }
    
    if (item.backgroundColor) {
      code += `  background-color: ${item.backgroundColor};\n`;
    }
    
    code += `}\n\n`;
  });
  
  return code;
};

// Generate SCSS code from Flexbox properties
export const generateSCSSCode = (container: FlexContainerProps, items: FlexItemProps[]): string => {
  let code = `@mixin flex-container {\n`;
  code += `  display: ${container.display};\n`;
  code += `  flex-direction: ${container.flexDirection};\n`;
  code += `  flex-wrap: ${container.flexWrap};\n`;
  code += `  justify-content: ${container.justifyContent};\n`;
  code += `  align-items: ${container.alignItems};\n`;
  
  if (container.alignContent !== 'normal') {
    code += `  align-content: ${container.alignContent};\n`;
  }
  
  if (container.gap) {
    code += `  gap: ${container.gap};\n`;
  }
  
  if (container.rowGap) {
    code += `  row-gap: ${container.rowGap};\n`;
  }
  
  if (container.columnGap) {
    code += `  column-gap: ${container.columnGap};\n`;
  }
  
  if (container.padding) {
    code += `  padding: ${container.padding};\n`;
  }
  
  if (container.backgroundColor) {
    code += `  background-color: ${container.backgroundColor};\n`;
  }
  
  if (container.width) {
    code += `  width: ${container.width};\n`;
  }
  
  if (container.height) {
    code += `  height: ${container.height};\n`;
  }
  
  code += `}\n\n`;
  
  code += `.flex-container {\n`;
  code += `  @include flex-container;\n`;
  code += `}\n\n`;
  
  // Generate mixins and rules for each flex item
  items.forEach((item, index) => {
    code += `@mixin flex-item-${index + 1} {\n`;
    
    if (item.order !== undefined && item.order !== 0) {
      code += `  order: ${item.order};\n`;
    }
    
    if (item.flexGrow !== undefined && item.flexGrow !== 0) {
      code += `  flex-grow: ${item.flexGrow};\n`;
    }
    
    if (item.flexShrink !== undefined && item.flexShrink !== 1) {
      code += `  flex-shrink: ${item.flexShrink};\n`;
    }
    
    if (item.flexBasis && item.flexBasis !== 'auto') {
      code += `  flex-basis: ${item.flexBasis};\n`;
    }
    
    if (item.alignSelf && item.alignSelf !== 'auto') {
      code += `  align-self: ${item.alignSelf};\n`;
    }
    
    if (item.width) {
      code += `  width: ${item.width};\n`;
    }
    
    if (item.height) {
      code += `  height: ${item.height};\n`;
    }
    
    if (item.margin) {
      code += `  margin: ${item.margin};\n`;
    }
    
    if (item.padding) {
      code += `  padding: ${item.padding};\n`;
    }
    
    if (item.backgroundColor) {
      code += `  background-color: ${item.backgroundColor};\n`;
    }
    
    code += `}\n\n`;
    
    code += `.flex-item-${index + 1} {\n`;
    code += `  @include flex-item-${index + 1};\n`;
    code += `}\n\n`;
  });
  
  return code;
};

// Convert flex property to Tailwind class
const flexDirectionToTailwind = (direction: string): string => {
  switch (direction) {
    case 'row': return 'flex-row';
    case 'row-reverse': return 'flex-row-reverse';
    case 'column': return 'flex-col';
    case 'column-reverse': return 'flex-col-reverse';
    default: return 'flex-row';
  }
};

const flexWrapToTailwind = (wrap: string): string => {
  switch (wrap) {
    case 'nowrap': return 'flex-nowrap';
    case 'wrap': return 'flex-wrap';
    case 'wrap-reverse': return 'flex-wrap-reverse';
    default: return 'flex-nowrap';
  }
};

const justifyContentToTailwind = (justify: string): string => {
  switch (justify) {
    case 'flex-start': return 'justify-start';
    case 'flex-end': return 'justify-end';
    case 'center': return 'justify-center';
    case 'space-between': return 'justify-between';
    case 'space-around': return 'justify-around';
    case 'space-evenly': return 'justify-evenly';
    default: return 'justify-start';
  }
};

const alignItemsToTailwind = (align: string): string => {
  switch (align) {
    case 'flex-start': return 'items-start';
    case 'flex-end': return 'items-end';
    case 'center': return 'items-center';
    case 'baseline': return 'items-baseline';
    case 'stretch': return 'items-stretch';
    default: return 'items-start';
  }
};

const alignContentToTailwind = (align: string): string => {
  switch (align) {
    case 'flex-start': return 'content-start';
    case 'flex-end': return 'content-end';
    case 'center': return 'content-center';
    case 'space-between': return 'content-between';
    case 'space-around': return 'content-around';
    case 'stretch': return 'content-stretch';
    default: return '';
  }
};

const gapToTailwind = (gap: string): string => {
  // Convert pixel values to Tailwind classes
  const numericGap = parseInt(gap);
  if (isNaN(numericGap)) return '';
  
  if (numericGap === 0) return 'gap-0';
  else if (numericGap <= 1) return 'gap-px';
  else if (numericGap <= 2) return 'gap-0.5';
  else if (numericGap <= 4) return 'gap-1';
  else if (numericGap <= 6) return 'gap-1.5';
  else if (numericGap <= 8) return 'gap-2';
  else if (numericGap <= 12) return 'gap-3';
  else if (numericGap <= 16) return 'gap-4';
  else if (numericGap <= 20) return 'gap-5';
  else if (numericGap <= 24) return 'gap-6';
  else if (numericGap <= 32) return 'gap-8';
  else if (numericGap <= 40) return 'gap-10';
  else if (numericGap <= 48) return 'gap-12';
  else if (numericGap <= 64) return 'gap-16';
  else if (numericGap <= 80) return 'gap-20';
  else if (numericGap <= 96) return 'gap-24';
  else return `gap-[${gap}]`;
};

// Generate Tailwind code from Flexbox properties
export const generateTailwindCode = (container: FlexContainerProps, items: FlexItemProps[]): string => {
  let containerClasses = ['flex'];
  
  if (container.display === 'inline-flex') {
    containerClasses = ['inline-flex'];
  }
  
  containerClasses.push(flexDirectionToTailwind(container.flexDirection));
  containerClasses.push(flexWrapToTailwind(container.flexWrap));
  containerClasses.push(justifyContentToTailwind(container.justifyContent));
  containerClasses.push(alignItemsToTailwind(container.alignItems));
  
  if (container.alignContent !== 'normal') {
    containerClasses.push(alignContentToTailwind(container.alignContent));
  }
  
  if (container.gap) {
    containerClasses.push(gapToTailwind(container.gap));
  }
  
  // Remove empty strings from the array
  const filteredClasses = containerClasses.filter(Boolean);
  
  let code = `<div class="${filteredClasses.join(' ')}">\n`;
  
  // Add each flex item
  items.forEach((item, index) => {
    const itemClasses = [];
    
    if (item.order !== undefined && item.order !== 0) {
      itemClasses.push(`order-${item.order}`);
    }
    
    if (item.flexGrow !== undefined && item.flexGrow !== 0) {
      itemClasses.push(`flex-grow-${item.flexGrow}`);
    }
    
    if (item.flexShrink !== undefined && item.flexShrink !== 1) {
      itemClasses.push(`flex-shrink-${item.flexShrink}`);
    }
    
    if (item.alignSelf && item.alignSelf !== 'auto') {
      switch (item.alignSelf) {
        case 'flex-start':
          itemClasses.push('self-start');
          break;
        case 'flex-end':
          itemClasses.push('self-end');
          break;
        case 'center':
          itemClasses.push('self-center');
          break;
        case 'baseline':
          itemClasses.push('self-baseline');
          break;
        case 'stretch':
          itemClasses.push('self-stretch');
          break;
      }
    }
    
    // Filter and join classes
    const filteredItemClasses = itemClasses.filter(Boolean);
    const classString = filteredItemClasses.length > 0 ? ` class="${filteredItemClasses.join(' ')}"` : '';
    
    code += `  <div${classString}>Item ${index + 1}</div>\n`;
  });
  
  code += `</div>`;
  
  return code;
}; 