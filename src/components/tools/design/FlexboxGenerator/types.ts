// Container properties
export interface FlexContainerProps {
  display: 'flex' | 'inline-flex';
  flexDirection: 'row' | 'row-reverse' | 'column' | 'column-reverse';
  flexWrap: 'nowrap' | 'wrap' | 'wrap-reverse';
  justifyContent: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  alignItems: 'stretch' | 'flex-start' | 'flex-end' | 'center' | 'baseline';
  alignContent: 'normal' | 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'stretch';
  gap: string;
  rowGap?: string;
  columnGap?: string;
  padding?: string;
  backgroundColor?: string;
  width?: string;
  height?: string;
}

// Flex item properties
export interface FlexItemProps {
  id: string;
  order?: number;
  flexGrow?: number;
  flexShrink?: number;
  flexBasis?: string;
  alignSelf?: 'auto' | 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch';
  width?: string;
  height?: string;
  margin?: string;
  padding?: string;
  backgroundColor: string;
  content?: string;
}

// Template interface
export interface FlexboxTemplate {
  id: string;
  name: string;
  container: FlexContainerProps;
  items: FlexItemProps[];
  created: Date;
  lastModified: Date;
}

// Export format options
export type ExportFormat = 'css' | 'scss' | 'tailwind'; 