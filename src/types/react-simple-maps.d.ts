declare module 'react-simple-maps' {
  import * as React from 'react';

  export interface ComposableMapProps extends React.SVGProps<SVGSVGElement> {
    width?: number;
    height?: number;
    projection?: string | ((...args: any[]) => any);
    projectionConfig?: {
      scale?: number;
      center?: [number, number];
      rotate?: [number, number, number] | [number, number];
      parallels?: [number, number];
    };
    children?: React.ReactNode;
  }

  export interface ZoomableGroupProps extends React.SVGProps<SVGGElement> {
    center?: [number, number];
    zoom?: number;
    minZoom?: number;
    maxZoom?: number;
    onMoveEnd?: (position: { coordinates: [number, number]; zoom: number }) => void;
    children?: React.ReactNode;
  }

  export interface GeographiesProps {
    geography?: string | Record<string, any> | string[];
    children: (renderProps: {
      geographies: any[];
      outline?: any;
      borders?: any;
    }) => React.ReactNode;
    onError?: (error: any) => void;
  }

  export interface GeographyProps extends Omit<React.SVGProps<SVGPathElement>, 'style'> {
    geography: any;
    style?: {
      default?: React.CSSProperties;
      hover?: React.CSSProperties;
      pressed?: React.CSSProperties;
    };
  }

  export interface MarkerProps extends React.SVGProps<SVGGElement> {
    coordinates: [number, number];
    children?: React.ReactNode;
  }

  export const ComposableMap: React.FC<ComposableMapProps>;
  export const ZoomableGroup: React.FC<ZoomableGroupProps>;
  export const Geographies: React.FC<GeographiesProps>;
  export const Geography: React.FC<GeographyProps>;
  export const Marker: React.FC<MarkerProps>;
}
