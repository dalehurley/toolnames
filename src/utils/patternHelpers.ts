import { LayerConfig, OutputFormat, PatternConfig, PatternType } from '@/types/pattern';

/**
 * Generate CSS for a striped pattern
 */
export const generateStripePattern = (config: PatternConfig): string => {
  const { colors, size, spacing, rotation, opacity, direction = 'diagonal', stripeWidth = 10 } = config;
  const [color1, color2 = 'transparent'] = colors;
  
  const gradientType = 'linear-gradient';
  let gradientDirection = '90deg';
  
  // Set gradient direction based on the pattern direction
  switch (direction) {
    case 'horizontal':
      gradientDirection = '0deg';
      break;
    case 'vertical':
      gradientDirection = '90deg';
      break;
    case 'diagonal':
      gradientDirection = `${rotation}deg`;
      break;
  }
  
  // Create the stripe pattern
  const stripeSize = size;
  const totalSize = stripeSize * 2;
  
  const css = `background: ${gradientType}(
    ${gradientDirection},
    ${color1} 0%,
    ${color1} ${stripeWidth}px,
    ${color2} ${stripeWidth}px,
    ${color2} ${totalSize}px
  );
  background-size: ${totalSize + spacing}px ${totalSize + spacing}px;
  opacity: ${opacity};`;
  
  return css;
};

/**
 * Generate CSS for a dot pattern
 */
export const generateDotPattern = (config: PatternConfig): string => {
  const { colors, size, spacing, opacity, dotRadius = 5, staggered = false } = config;
  const [color1, color2 = 'transparent'] = colors;
  
  // Basic dot pattern
  let css = `background-color: ${color2};
  background-image: radial-gradient(
    circle at center,
    ${color1} 0,
    ${color1} ${dotRadius}px,
    transparent ${dotRadius}px,
    transparent 100%
  );
  background-size: ${size + spacing}px ${size + spacing}px;
  background-position: 0 0;
  opacity: ${opacity};`;
  
  // Add staggered positioning if enabled
  if (staggered) {
    css += `
    background-position: 0 0, ${(size + spacing) / 2}px ${(size + spacing) / 2}px;`;
  }
  
  return css;
};

/**
 * Generate CSS for a grid pattern
 */
export const generateGridPattern = (config: PatternConfig): string => {
  const { colors, size, spacing, opacity, gridLineWidth = 1, checkerboard = false } = config;
  const [color1, color2 = 'transparent'] = colors;
  
  if (checkerboard) {
    // Checkerboard pattern
    return `background-color: ${color2};
    background-image: 
      linear-gradient(45deg, ${color1} 25%, transparent 25%),
      linear-gradient(-45deg, ${color1} 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, ${color1} 75%),
      linear-gradient(-45deg, transparent 75%, ${color1} 75%);
    background-size: ${size * 2}px ${size * 2}px;
    background-position: 0 0, 0 ${size}px, ${size}px ${-size}px, ${-size}px 0px;
    opacity: ${opacity};`;
  } else {
    // Grid pattern
    return `background-color: ${color2};
    background-image:
      linear-gradient(to right, ${color1} ${gridLineWidth}px, transparent ${gridLineWidth}px),
      linear-gradient(to bottom, ${color1} ${gridLineWidth}px, transparent ${gridLineWidth}px);
    background-size: ${size + spacing}px ${size + spacing}px;
    opacity: ${opacity};`;
  }
};

/**
 * Generate CSS for a geometric pattern
 */
export const generateGeometricPattern = (config: PatternConfig): string => {
  const { colors, size, spacing, rotation, opacity, shape = 'triangle', density = 3 } = config;
  const [color1, color2 = 'transparent'] = colors;
  
  // Include spacing in size calculations
  const adjustedSize = size + spacing;
  
  switch (shape) {
    case 'triangle':
      return `background-color: ${color2};
      background-image: 
        linear-gradient(${rotation}deg, ${color1} 25%, transparent 25%),
        linear-gradient(${rotation + 90}deg, ${color1} 25%, transparent 25%);
      background-size: ${adjustedSize * density}px ${adjustedSize * density}px;
      opacity: ${opacity};`;
      
    case 'hexagon':
      // Simplified hexagon pattern using multiple gradients
      return `background-color: ${color2};
      background-image: 
        radial-gradient(circle at 100% 150%, ${color1} 24%, ${color2} 25%, ${color2} 28%, ${color1} 29%, ${color1} 36%, ${color2} 36%, ${color2} 40%, transparent 40%, transparent),
        radial-gradient(circle at 0 150%, ${color1} 24%, ${color2} 25%, ${color2} 28%, ${color1} 29%, ${color1} 36%, ${color2} 36%, ${color2} 40%, transparent 40%, transparent),
        radial-gradient(circle at 50% 100%, ${color2} 10%, ${color1} 11%, ${color1} 23%, ${color2} 24%, ${color2} 30%, ${color1} 31%, ${color1} 43%, ${color2} 44%, ${color2} 50%, ${color1} 51%, ${color1} 63%, ${color2} 64%, ${color2} 71%, transparent 71%, transparent);
      background-size: ${adjustedSize * density}px ${adjustedSize * density}px;
      background-position: 0 0;
      opacity: ${opacity};`;
      
    case 'chevron':
      return `background-color: ${color2};
      background-image: 
        linear-gradient(${rotation}deg, ${color1} 25%, transparent 25%),
        linear-gradient(${rotation + 90}deg, ${color1} 25%, transparent 25%);
      background-position: 0 0, ${adjustedSize}px ${adjustedSize}px;
      background-size: ${adjustedSize * 2}px ${adjustedSize * 2}px;
      opacity: ${opacity};`;
      
    case 'zigzag':
      return `background-color: ${color2};
      background-image: 
        linear-gradient(${rotation}deg, ${color1} 25%, transparent 25%),
        linear-gradient(${rotation + 90}deg, ${color1} 25%, transparent 25%),
        linear-gradient(${rotation + 180}deg, ${color1} 25%, transparent 25%),
        linear-gradient(${rotation + 270}deg, ${color1} 25%, transparent 25%);
      background-size: ${adjustedSize * density}px ${adjustedSize * density}px;
      opacity: ${opacity};`;
      
    default:
      return '';
  }
};

/**
 * Generate CSS for a wave pattern
 */
export const generateWavePattern = (config: PatternConfig): string => {
  const { 
    colors, 
    size, 
    spacing, 
    rotation, 
    opacity,
    waveHeight = 20,
    waveCount = 3,
    waveType = 'sine'
  } = config;
  
  const [color1, color2 = 'transparent'] = colors;
  const adjustedSize = size + spacing;
  
  // Different wave implementations based on wave type
  switch (waveType) {
    case 'sine':
      // Sine wave implementation using multiple gradients
      return `background-color: ${color2};
      background-image: 
        linear-gradient(${rotation}deg, 
          ${color1} 
            ${50 - waveHeight / 2}%, 
          transparent 
            ${50 + waveHeight / 2}%
        );
      background-size: ${adjustedSize * waveCount}px ${adjustedSize}px;
      opacity: ${opacity};`;
    
    case 'triangle':
      // Triangle wave implementation using zigzag patterns
      return `background-color: ${color2};
      background-image: 
        linear-gradient(${rotation}deg, transparent 0%, transparent 45%, 
          ${color1} 45%, ${color1} 55%, transparent 55%, transparent 100%),
        linear-gradient(${rotation + 90}deg, transparent 0%, transparent 45%, 
          ${color1} 45%, ${color1} 55%, transparent 55%, transparent 100%);
      background-size: ${adjustedSize}px ${adjustedSize}px;
      background-position: 0 0, ${adjustedSize / 2}px ${adjustedSize / 2}px;
      opacity: ${opacity};`;
    
    case 'bezier':
      // Bezier curve implementation (approximation using CSS)
      return `background-color: ${color2};
      background-image: 
        radial-gradient(circle at 50% ${50 - waveHeight}%, 
          ${color1} 20%, transparent 20.5%),
        radial-gradient(circle at 50% ${50 + waveHeight}%, 
          ${color1} 20%, transparent 20.5%);
      background-size: ${adjustedSize / waveCount}px ${adjustedSize}px;
      opacity: ${opacity};`;
      
    default:
      return '';
  }
};

/**
 * Generate CSS for layered patterns
 */
export const generateLayeredPattern = (config: PatternConfig): string => {
  if (!config.layers || config.layers.length === 0) {
    return '';
  }
  
  const layers = config.layers.filter(layer => layer.visible);
  
  if (layers.length === 0) {
    return '';
  }
  
  // Handle base layer
  const baseLayer = layers[0];
  const baseCSS = generatePatternCSS(baseLayer.type, baseLayer.config);
  
  // Extract background-color and background-image from base CSS
  const bgColorMatch = baseCSS.match(/background-color:\s+([^;]+);/);
  const backgroundColor = bgColorMatch ? bgColorMatch[1] : 'transparent';
  
  const bgImageMatch = baseCSS.match(/background-image:\s+([^;]+);/);
  const baseImage = bgImageMatch ? bgImageMatch[1] : '';
  
  if (layers.length === 1) {
    return baseCSS;
  }
  
  // Generate CSS for each additional layer
  const layerImages = layers.slice(1).map((layer) => {
    const layerCSS = generatePatternCSS(layer.type, layer.config);
    const bgImageMatch = layerCSS.match(/background-image:\s+([^;]+);/);
    
    if (!bgImageMatch) return '';
    
    // Apply blend mode and opacity
    return bgImageMatch[1].trim().replace(/\n\s+/g, ' ');
  }).filter(img => img !== '');
  
  if (layerImages.length === 0 && !baseImage) {
    return `background-color: ${backgroundColor}; opacity: ${config.opacity};`;
  }
  
  let allImages = [];
  if (baseImage) {
    allImages.push(baseImage);
  }
  if (layerImages.length > 0) {
    allImages = [...allImages, ...layerImages];
  }
  
  // Build layered CSS
  return `background-color: ${backgroundColor};
  background-image: ${allImages.join(',\n    ')};
  background-blend-mode: ${layers.slice(1).map(l => l.blendMode || 'normal').join(', ')};
  opacity: ${config.opacity};`;
};

/**
 * Main function to generate CSS based on pattern type and configuration
 */
export const generatePatternCSS = (type: PatternType, config: PatternConfig): string => {
  switch (type) {
    case 'stripes':
      return generateStripePattern(config);
    case 'dots':
      return generateDotPattern(config);
    case 'grid':
      return generateGridPattern(config);
    case 'geometric':
      return generateGeometricPattern(config);
    case 'waves':
      return generateWavePattern(config);
    case 'layered':
      return generateLayeredPattern(config);
    default:
      return '';
  }
};

/**
 * Generate a CSS class declaration from the pattern CSS
 */
export const generateCSSClass = (className: string, css: string): string => {
  return `.${className} {\n  ${css.replace(/\n/g, '\n  ')}\n}`;
};

/**
 * Convert CSS background properties to Tailwind classes
 */
export const generateTailwindClasses = (css: string): string => {
  const tailwindClasses: string[] = [];
  
  // Extract background color
  const bgColorMatch = css.match(/background-color:\s+([^;]+);/);
  if (bgColorMatch) {
    const color = bgColorMatch[1].trim();
    if (color.startsWith('#')) {
      tailwindClasses.push(`bg-[${color}]`);
    } else if (color !== 'transparent') {
      // Try to map to a Tailwind color if it's a named color
      tailwindClasses.push(`bg-${color}`);
    }
  }
  
  // Extract background size
  const bgSizeMatch = css.match(/background-size:\s+([^;]+);/);
  if (bgSizeMatch) {
    const size = bgSizeMatch[1].trim();
    tailwindClasses.push(`bg-[size:${size}]`);
  }
  
  // Extract background position
  const bgPosMatch = css.match(/background-position:\s+([^;]+);/);
  if (bgPosMatch) {
    const position = bgPosMatch[1].trim();
    tailwindClasses.push(`bg-[position:${position}]`);
  }
  
  // Extract opacity
  const opacityMatch = css.match(/opacity:\s+([^;]+);/);
  if (opacityMatch) {
    const opacity = parseFloat(opacityMatch[1].trim());
    const opacityPercentage = Math.round(opacity * 100);
    tailwindClasses.push(`opacity-${opacityPercentage}`);
  }
  
  // Extract background image (this is complex and will need a custom approach)
  const bgImageMatch = css.match(/background-image:\s+([^;]+);/);
  if (bgImageMatch) {
    const image = bgImageMatch[1].trim().replace(/\n\s+/g, ' ');
    tailwindClasses.push(`bg-[image:${image}]`);
  }
  
  return tailwindClasses.join(' ');
};

/**
 * Convert CSS to styled-components format
 */
export const generateStyledComponents = (css: string): string => {
  return `
import styled from 'styled-components';

export const StyledPattern = styled.div\`
  ${css}
\`;
`;
};

/**
 * Generate output based on desired format
 */
export const generateOutput = (css: string, format: OutputFormat = 'css', className: string = 'pattern'): string => {
  switch (format) {
    case 'tailwind':
      return generateTailwindClasses(css);
    case 'styled-components':
      return generateStyledComponents(css);
    case 'css':
    default:
      return generateCSSClass(className, css);
  }
};

/**
 * Helper to generate a unique ID
 */
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15);
};

/**
 * Create a default layer configuration
 */
export const createDefaultLayer = (type: PatternType): LayerConfig => {
  return {
    type,
    config: {
      colors: ['#3b82f6', '#ffffff'],
      size: 20,
      spacing: 20,
      rotation: 45,
      opacity: 1,
      ...(type === 'stripes' && { direction: 'diagonal', stripeWidth: 10 }),
      ...(type === 'dots' && { dotRadius: 5, staggered: false }),
      ...(type === 'grid' && { gridLineWidth: 1, checkerboard: false }),
      ...(type === 'geometric' && { shape: 'triangle', density: 3 }),
      ...(type === 'waves' && { waveHeight: 20, waveCount: 3, waveType: 'sine' }),
    },
    opacity: 1,
    blendMode: 'normal',
    visible: true,
  };
};

/**
 * Pattern presets
 */
export const patternPresets = [
  // STRIPE PATTERNS
  {
    id: 'preset-stripes-diagonal',
    name: 'Diagonal Stripes',
    category: 'stripes',
    type: 'stripes' as PatternType,
    config: {
      colors: ['#3b82f6', '#ffffff'],
      size: 20,
      spacing: 20,
      rotation: 45,
      opacity: 1,
      direction: 'diagonal',
      stripeWidth: 10,
    }
  },
  {
    id: 'preset-stripes-horizontal-candy',
    name: 'Candy Stripes',
    category: 'stripes',
    type: 'stripes' as PatternType,
    config: {
      colors: ['#f87171', '#ffffff'],
      size: 15,
      spacing: 5,
      rotation: 0,
      opacity: 1,
      direction: 'horizontal',
      stripeWidth: 8,
    }
  },
  {
    id: 'preset-stripes-vertical-subtle',
    name: 'Subtle Vertical',
    category: 'stripes',
    type: 'stripes' as PatternType,
    config: {
      colors: ['#94a3b8', '#f8fafc'],
      size: 30,
      spacing: 10,
      rotation: 0,
      opacity: 0.7,
      direction: 'vertical',
      stripeWidth: 2,
    }
  },
  {
    id: 'preset-stripes-bold-diagonal',
    name: 'Bold Diagonal',
    category: 'stripes',
    type: 'stripes' as PatternType,
    config: {
      colors: ['#fbbf24', '#7c2d12'],
      size: 40,
      spacing: 0,
      rotation: 135,
      opacity: 1,
      direction: 'diagonal',
      stripeWidth: 20,
    }
  },
  {
    id: 'preset-stripes-thin-pinstripe',
    name: 'Pinstripe',
    category: 'stripes',
    type: 'stripes' as PatternType,
    config: {
      colors: ['#1e293b', '#0f172a'],
      size: 10,
      spacing: 0,
      rotation: 90,
      opacity: 1,
      direction: 'vertical',
      stripeWidth: 1,
    }
  },
  
  // DOT PATTERNS
  {
    id: 'preset-dots-grid',
    name: 'Dotted Grid',
    category: 'dots',
    type: 'dots' as PatternType,
    config: {
      colors: ['#f87171', '#f8fafc'],
      size: 30,
      spacing: 15,
      rotation: 0,
      opacity: 1,
      dotRadius: 5,
      staggered: false,
    }
  },
  {
    id: 'preset-dots-tiny',
    name: 'Tiny Dots',
    category: 'dots',
    type: 'dots' as PatternType,
    config: {
      colors: ['#1e293b', '#f8fafc'],
      size: 10,
      spacing: 10,
      rotation: 0,
      opacity: 1,
      dotRadius: 1,
      staggered: false,
    }
  },
  {
    id: 'preset-dots-staggered-large',
    name: 'Staggered Large Dots',
    category: 'dots',
    type: 'dots' as PatternType,
    config: {
      colors: ['#84cc16', '#ecfccb'],
      size: 40,
      spacing: 20,
      rotation: 0,
      opacity: 1,
      dotRadius: 15,
      staggered: true,
    }
  },
  {
    id: 'preset-dots-confetti',
    name: 'Confetti Dots',
    category: 'dots',
    type: 'dots' as PatternType,
    config: {
      colors: ['#ec4899', '#f8fafc'],
      size: 40,
      spacing: 40,
      rotation: 0,
      opacity: 0.8,
      dotRadius: 4,
      staggered: true,
    }
  },
  {
    id: 'preset-dots-binary',
    name: 'Binary Dots',
    category: 'dots',
    type: 'dots' as PatternType,
    config: {
      colors: ['#0f172a', '#f8fafc'],
      size: 16,
      spacing: 16,
      rotation: 0,
      opacity: 1,
      dotRadius: 3,
      staggered: true,
    }
  },
  
  // GRID PATTERNS
  {
    id: 'preset-checkerboard',
    name: 'Checkerboard',
    category: 'grid',
    type: 'grid' as PatternType,
    config: {
      colors: ['#000000', '#ffffff'],
      size: 20,
      spacing: 0,
      rotation: 0,
      opacity: 1,
      checkerboard: true,
    }
  },
  {
    id: 'preset-grid-blueprint',
    name: 'Blueprint',
    category: 'grid',
    type: 'grid' as PatternType,
    config: {
      colors: ['#60a5fa', '#dbeafe'],
      size: 40,
      spacing: 0,
      rotation: 0,
      opacity: 1,
      gridLineWidth: 1,
      checkerboard: false,
    }
  },
  {
    id: 'preset-grid-graph-paper',
    name: 'Graph Paper',
    category: 'grid',
    type: 'grid' as PatternType,
    config: {
      colors: ['#d1d5db', '#ffffff'],
      size: 20,
      spacing: 0,
      rotation: 0,
      opacity: 1,
      gridLineWidth: 1,
      checkerboard: false,
    }
  },
  {
    id: 'preset-grid-windowpane',
    name: 'Windowpane',
    category: 'grid',
    type: 'grid' as PatternType,
    config: {
      colors: ['#1e293b', '#f8fafc'],
      size: 80,
      spacing: 0,
      rotation: 0,
      opacity: 1,
      gridLineWidth: 3,
      checkerboard: false,
    }
  },
  {
    id: 'preset-grid-pixel',
    name: 'Pixel Grid',
    category: 'grid',
    type: 'grid' as PatternType,
    config: {
      colors: ['#9ca3af', '#f9fafb'],
      size: 10,
      spacing: 0,
      rotation: 0,
      opacity: 0.8,
      gridLineWidth: 1,
      checkerboard: false,
    }
  },
  
  // GEOMETRIC PATTERNS
  {
    id: 'preset-zigzag',
    name: 'Zigzag Pattern',
    category: 'geometric',
    type: 'geometric' as PatternType,
    config: {
      colors: ['#84cc16', '#ecfccb'],
      size: 15,
      spacing: 5,
      rotation: 0,
      opacity: 1,
      shape: 'zigzag',
      density: 2,
    }
  },
  {
    id: 'preset-geometric-triangles',
    name: 'Triangles',
    category: 'geometric',
    type: 'geometric' as PatternType,
    config: {
      colors: ['#4f46e5', '#ffffff'],
      size: 30,
      spacing: 0,
      rotation: 0,
      opacity: 1,
      shape: 'triangle',
      density: 2,
    }
  },
  {
    id: 'preset-geometric-honeycomb',
    name: 'Honeycomb',
    category: 'geometric',
    type: 'geometric' as PatternType,
    config: {
      colors: ['#f59e0b', '#fffbeb'],
      size: 20,
      spacing: 5,
      rotation: 0,
      opacity: 1,
      shape: 'hexagon',
      density: 1,
    }
  },
  {
    id: 'preset-geometric-arrows',
    name: 'Arrows',
    category: 'geometric',
    type: 'geometric' as PatternType,
    config: {
      colors: ['#0f766e', '#f0fdfa'],
      size: 25,
      spacing: 5,
      rotation: 45,
      opacity: 1,
      shape: 'chevron',
      density: 2,
    }
  },
  {
    id: 'preset-geometric-complex-zigzag',
    name: 'Complex Zigzag',
    category: 'geometric',
    type: 'geometric' as PatternType,
    config: {
      colors: ['#7c3aed', '#f5f3ff'],
      size: 20,
      spacing: 0,
      rotation: 30,
      opacity: 1,
      shape: 'zigzag',
      density: 3,
    }
  },
  
  // WAVE PATTERNS
  {
    id: 'preset-sine-wave',
    name: 'Sine Wave',
    category: 'waves',
    type: 'waves' as PatternType,
    config: {
      colors: ['#8b5cf6', '#f5f3ff'],
      size: 40,
      spacing: 20,
      rotation: 0,
      opacity: 1,
      waveHeight: 20,
      waveCount: 3,
      waveType: 'sine',
    }
  },
  {
    id: 'preset-wave-ocean',
    name: 'Ocean Waves',
    category: 'waves',
    type: 'waves' as PatternType,
    config: {
      colors: ['#0ea5e9', '#e0f2fe'],
      size: 60,
      spacing: 10,
      rotation: 0,
      opacity: 0.8,
      waveHeight: 25,
      waveCount: 2,
      waveType: 'sine',
    }
  },
  {
    id: 'preset-wave-triangular',
    name: 'Triangular Waves',
    category: 'waves',
    type: 'waves' as PatternType,
    config: {
      colors: ['#dc2626', '#fef2f2'],
      size: 30,
      spacing: 0,
      rotation: 90,
      opacity: 1,
      waveHeight: 15,
      waveCount: 4,
      waveType: 'triangle',
    }
  },
  {
    id: 'preset-wave-bubbles',
    name: 'Bubble Waves',
    category: 'waves',
    type: 'waves' as PatternType,
    config: {
      colors: ['#10b981', '#ecfdf5'],
      size: 40,
      spacing: 20,
      rotation: 0,
      opacity: 0.9,
      waveHeight: 25,
      waveCount: 2,
      waveType: 'bezier',
    }
  },
  {
    id: 'preset-wave-subtle-pulse',
    name: 'Subtle Pulse',
    category: 'waves',
    type: 'waves' as PatternType,
    config: {
      colors: ['#6b7280', '#f9fafb'],
      size: 50,
      spacing: 0,
      rotation: 45,
      opacity: 0.3,
      waveHeight: 10,
      waveCount: 5,
      waveType: 'sine',
    }
  },
  
  // LAYERED PATTERNS
  {
    id: 'preset-layered-dots',
    name: 'Layered Dots',
    category: 'layered',
    type: 'layered' as PatternType,
    config: {
      colors: ['#ffffff', '#ffffff'],
      size: 20,
      spacing: 10,
      rotation: 0,
      opacity: 1,
      layers: [
        {
          type: 'dots',
          config: {
            colors: ['#4ade80', '#f0fdf4'],
            size: 20,
            spacing: 20,
            rotation: 0,
            opacity: 1,
            dotRadius: 5,
            staggered: false,
          },
          opacity: 1,
          blendMode: 'normal',
          visible: true,
        },
        {
          type: 'dots',
          config: {
            colors: ['#3b82f6', 'transparent'],
            size: 30,
            spacing: 30,
            rotation: 0,
            opacity: 0.7,
            dotRadius: 3,
            staggered: true,
          },
          opacity: 0.7,
          blendMode: 'multiply',
          visible: true,
        }
      ]
    }
  },
  {
    id: 'preset-layered-grid-dots',
    name: 'Grid with Dots',
    category: 'layered',
    type: 'layered' as PatternType,
    config: {
      colors: ['#ffffff', '#ffffff'],
      size: 20,
      spacing: 10,
      rotation: 0,
      opacity: 1,
      layers: [
        {
          type: 'grid',
          config: {
            colors: ['#d1d5db', '#ffffff'],
            size: 40,
            spacing: 0,
            rotation: 0,
            opacity: 1,
            gridLineWidth: 1,
            checkerboard: false,
          },
          opacity: 1,
          blendMode: 'normal',
          visible: true,
        },
        {
          type: 'dots',
          config: {
            colors: ['#3b82f6', 'transparent'],
            size: 40,
            spacing: 0,
            rotation: 0,
            opacity: 1,
            dotRadius: 4,
            staggered: false,
          },
          opacity: 1,
          blendMode: 'normal',
          visible: true,
        }
      ]
    }
  },
  {
    id: 'preset-layered-stripes-waves',
    name: 'Stripes & Waves',
    category: 'layered',
    type: 'layered' as PatternType,
    config: {
      colors: ['#ffffff', '#ffffff'],
      size: 20,
      spacing: 10,
      rotation: 0,
      opacity: 1,
      layers: [
        {
          type: 'stripes',
          config: {
            colors: ['#f1f5f9', '#ffffff'],
            size: 20,
            spacing: 0,
            rotation: 90,
            opacity: 1,
            direction: 'vertical',
            stripeWidth: 10,
          },
          opacity: 1,
          blendMode: 'normal',
          visible: true,
        },
        {
          type: 'waves',
          config: {
            colors: ['#8b5cf6', 'transparent'],
            size: 60,
            spacing: 0,
            rotation: 0,
            opacity: 0.6,
            waveHeight: 15,
            waveCount: 3,
            waveType: 'sine',
          },
          opacity: 0.6,
          blendMode: 'multiply',
          visible: true,
        }
      ]
    }
  },
  {
    id: 'preset-layered-geometric-grid',
    name: 'Geometric Grid',
    category: 'layered',
    type: 'layered' as PatternType,
    config: {
      colors: ['#ffffff', '#ffffff'],
      size: 20,
      spacing: 0,
      rotation: 0,
      opacity: 1,
      layers: [
        {
          type: 'grid',
          config: {
            colors: ['#cbd5e1', '#f8fafc'],
            size: 50,
            spacing: 0,
            rotation: 0,
            opacity: 1,
            gridLineWidth: 1,
            checkerboard: false,
          },
          opacity: 1,
          blendMode: 'normal',
          visible: true,
        },
        {
          type: 'geometric',
          config: {
            colors: ['#f97316', 'transparent'],
            size: 100,
            spacing: 0,
            rotation: 45,
            opacity: 0.5,
            shape: 'triangle',
            density: 1,
          },
          opacity: 0.5,
          blendMode: 'multiply',
          visible: true,
        }
      ]
    }
  },
  {
    id: 'preset-layered-complex',
    name: 'Complex Pattern',
    category: 'layered',
    type: 'layered' as PatternType,
    config: {
      colors: ['#ffffff', '#ffffff'],
      size: 20,
      spacing: 10,
      rotation: 0,
      opacity: 1,
      layers: [
        {
          type: 'grid',
          config: {
            colors: ['#e2e8f0', '#ffffff'],
            size: 40,
            spacing: 0,
            rotation: 0,
            opacity: 1,
            gridLineWidth: 1,
            checkerboard: false,
          },
          opacity: 1,
          blendMode: 'normal',
          visible: true,
        },
        {
          type: 'dots',
          config: {
            colors: ['#6366f1', 'transparent'],
            size: 80,
            spacing: 0,
            rotation: 0,
            opacity: 0.6,
            dotRadius: 5,
            staggered: true,
          },
          opacity: 0.6,
          blendMode: 'multiply',
          visible: true,
        },
        {
          type: 'waves',
          config: {
            colors: ['#f43f5e', 'transparent'],
            size: 120,
            spacing: 0,
            rotation: 30,
            opacity: 0.3,
            waveHeight: 20,
            waveCount: 2,
            waveType: 'sine',
          },
          opacity: 0.3,
          blendMode: 'screen',
          visible: true,
        }
      ]
    }
  },
  
  // SPECIAL DESIGN PRESETS
  {
    id: 'preset-special-blueprint',
    name: 'Blueprint Paper',
    category: 'special',
    type: 'layered' as PatternType,
    config: {
      colors: ['#ffffff', '#ffffff'],
      size: 20,
      spacing: 10,
      rotation: 0,
      opacity: 1,
      layers: [
        {
          type: 'grid',
          config: {
            colors: ['#93c5fd', '#dbeafe'],
            size: 40,
            spacing: 0,
            rotation: 0,
            opacity: 1,
            gridLineWidth: 1,
            checkerboard: false,
          },
          opacity: 1,
          blendMode: 'normal',
          visible: true,
        },
        {
          type: 'grid',
          config: {
            colors: ['#3b82f6', 'transparent'],
            size: 200,
            spacing: 0,
            rotation: 0,
            opacity: 1,
            gridLineWidth: 2,
            checkerboard: false,
          },
          opacity: 1,
          blendMode: 'normal',
          visible: true,
        },
        {
          type: 'dots',
          config: {
            colors: ['#2563eb', 'transparent'],
            size: 200,
            spacing: 0,
            rotation: 0,
            opacity: 1,
            dotRadius: 3,
            staggered: false,
          },
          opacity: 1,
          blendMode: 'normal',
          visible: true,
        }
      ]
    }
  },
  {
    id: 'preset-special-art-deco',
    name: 'Art Deco',
    category: 'special',
    type: 'layered' as PatternType,
    config: {
      colors: ['#ffffff', '#ffffff'],
      size: 20,
      spacing: 0,
      rotation: 0,
      opacity: 1,
      layers: [
        {
          type: 'stripes',
          config: {
            colors: ['#fcd34d', '#fffbeb'],
            size: 40,
            spacing: 0,
            rotation: 45,
            opacity: 1,
            direction: 'diagonal',
            stripeWidth: 4,
          },
          opacity: 1,
          blendMode: 'normal',
          visible: true,
        },
        {
          type: 'geometric',
          config: {
            colors: ['#0f172a', 'transparent'],
            size: 60,
            spacing: 0,
            rotation: 45,
            opacity: 0.8,
            shape: 'triangle',
            density: 1,
          },
          opacity: 0.8,
          blendMode: 'multiply',
          visible: true,
        }
      ]
    }
  },
  {
    id: 'preset-special-polka',
    name: 'Classic Polka Dots',
    category: 'special',
    type: 'dots' as PatternType,
    config: {
      colors: ['#f43f5e', '#fdf2f8'],
      size: 50,
      spacing: 30,
      rotation: 0,
      opacity: 1,
      dotRadius: 15,
      staggered: true,
    }
  },
  {
    id: 'preset-special-autumn',
    name: 'Autumn Leaves',
    category: 'special',
    type: 'layered' as PatternType,
    config: {
      colors: ['#ffffff', '#ffffff'],
      size: 20,
      spacing: 0,
      rotation: 0,
      opacity: 1,
      layers: [
        {
          type: 'stripes',
          config: {
            colors: ['#fff7ed', '#ffedd5'],
            size: 30,
            spacing: 10,
            rotation: 45,
            opacity: 1,
            direction: 'diagonal',
            stripeWidth: 15,
          },
          opacity: 1,
          blendMode: 'normal',
          visible: true,
        },
        {
          type: 'dots',
          config: {
            colors: ['#ea580c', 'transparent'],
            size: 60,
            spacing: 60,
            rotation: 0,
            opacity: 0.8,
            dotRadius: 10,
            staggered: true,
          },
          opacity: 0.8,
          blendMode: 'multiply',
          visible: true,
        },
        {
          type: 'dots',
          config: {
            colors: ['#b91c1c', 'transparent'],
            size: 120,
            spacing: 120,
            rotation: 0,
            opacity: 0.6,
            dotRadius: 25,
            staggered: true,
          },
          opacity: 0.6,
          blendMode: 'multiply',
          visible: true,
        }
      ]
    }
  },
  {
    id: 'preset-special-carbon-fiber',
    name: 'Carbon Fiber',
    category: 'special',
    type: 'layered' as PatternType,
    config: {
      colors: ['#ffffff', '#ffffff'],
      size: 20,
      spacing: 0,
      rotation: 0,
      opacity: 1,
      layers: [
        {
          type: 'grid',
          config: {
            colors: ['#1e293b', '#0f172a'],
            size: 12,
            spacing: 0,
            rotation: 0,
            opacity: 1,
            gridLineWidth: 1,
            checkerboard: true,
          },
          opacity: 1,
          blendMode: 'normal',
          visible: true,
        },
        {
          type: 'stripes',
          config: {
            colors: ['#0f172a', 'transparent'],
            size: 12,
            spacing: 0,
            rotation: 45,
            opacity: 0.7,
            direction: 'diagonal',
            stripeWidth: 6,
          },
          opacity: 0.7,
          blendMode: 'overlay',
          visible: true,
        }
      ]
    }
  }
]; 