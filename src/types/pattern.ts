export type PatternType = 'stripes' | 'dots' | 'grid' | 'geometric' | 'waves' | 'layered';

export type OutputFormat = 'css' | 'tailwind' | 'styled-components';

export interface PatternConfig {
  colors: string[];
  size: number;
  spacing: number;
  rotation: number;
  opacity: number;
  // Optional pattern-specific properties
  direction?: 'horizontal' | 'vertical' | 'diagonal';
  stripeWidth?: number;
  dotRadius?: number;
  staggered?: boolean;
  gridLineWidth?: number;
  checkerboard?: boolean;
  shape?: 'triangle' | 'hexagon' | 'chevron' | 'zigzag';
  density?: number;
  // Wave pattern properties
  waveHeight?: number;
  waveCount?: number;
  waveType?: 'sine' | 'triangle' | 'bezier';
  // Layered pattern properties
  layers?: LayerConfig[];
  // Output options
  outputFormat?: OutputFormat;
  // Allow for other properties
  [key: string]: string | number | boolean | string[] | object | undefined;
}

export interface LayerConfig {
  type: PatternType;
  config: PatternConfig;
  opacity: number;
  blendMode: string;
  visible: boolean;
}

export interface StripePatternConfig extends PatternConfig {
  direction: 'horizontal' | 'vertical' | 'diagonal';
  stripeWidth: number;
}

export interface DotPatternConfig extends PatternConfig {
  dotRadius: number;
  staggered: boolean;
}

export interface GridPatternConfig extends PatternConfig {
  gridLineWidth: number;
  checkerboard: boolean;
}

export interface GeometricPatternConfig extends PatternConfig {
  shape: 'triangle' | 'hexagon' | 'chevron' | 'zigzag';
  density: number;
}

export interface WavePatternConfig extends PatternConfig {
  waveHeight: number;
  waveCount: number;
  waveType: 'sine' | 'triangle' | 'bezier';
}

export interface LayeredPatternConfig extends PatternConfig {
  layers: LayerConfig[];
}

export interface SavedPattern {
  id: string;
  name: string;
  type: PatternType;
  config: PatternConfig;
  css: string;
  createdAt: number;
}

export interface PatternPreset {
  id: string;
  name: string;
  category: string;
  type: PatternType;
  config: PatternConfig;
  thumbnail?: string;
} 