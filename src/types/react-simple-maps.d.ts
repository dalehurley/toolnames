declare module 'react-simple-maps' {
  import type { ComponentType, ReactNode } from 'react';

  interface ComposableMapProps {
    projectionConfig?: { scale: number };
    [key: string]: unknown;
  }

  interface GeographiesProps {
    geography: string | object;
    children: (props: { geographies: unknown[] }) => ReactNode;
    [key: string]: unknown;
  }

  interface GeographyProps {
    geography: unknown;
    [key: string]: unknown;
  }

  interface MarkerProps {
    coordinates: [number, number];
    [key: string]: unknown;
  }

  interface ZoomableGroupProps {
    center?: [number, number];
    zoom?: number;
    [key: string]: unknown;
  }

  export const ComposableMap: ComponentType<ComposableMapProps>;
  export const Geographies: ComponentType<GeographiesProps>;
  export const Geography: ComponentType<GeographyProps>;
  export const Marker: ComponentType<MarkerProps>;
  export const ZoomableGroup: ComponentType<ZoomableGroupProps>;
}
