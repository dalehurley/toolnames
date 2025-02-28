declare module 'cytoscape-cose-bilkent' {
  import type { LayoutOptions, Ext } from 'cytoscape';
  
  interface CoseBilkentLayout extends LayoutOptions {
    name: 'cose-bilkent';
    // CoSE-Bilkent specific options
    animate?: boolean;
    animationDuration?: number;
    idealEdgeLength?: number;
    nodeRepulsion?: number;
    randomize?: boolean;
    nodeDimensionsIncludeLabels?: boolean;
    // Additional layout parameters
    gravity?: number;
    gravityRange?: number;
    gravityCompound?: number;
    gravityRangeCompound?: number;
    nestingFactor?: number;
    numIter?: number;
    tile?: boolean;
    tilingPaddingVertical?: number;
    tilingPaddingHorizontal?: number;
    initialEnergyOnIncremental?: number;
  }

  const extension: Ext;
  export default extension;
} 