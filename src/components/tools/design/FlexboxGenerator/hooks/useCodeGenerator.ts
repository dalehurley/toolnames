import { useMemo } from 'react';
import { FlexContainerProps, FlexItemProps, ExportFormat } from '../types';
import { generateCSSCode, generateSCSSCode, generateTailwindCode } from '../utils';

export const useCodeGenerator = (
  container: FlexContainerProps,
  items: FlexItemProps[],
  format: ExportFormat
) => {
  return useMemo(() => {
    switch (format) {
      case 'css':
        return generateCSSCode(container, items);
      case 'scss':
        return generateSCSSCode(container, items);
      case 'tailwind':
        return generateTailwindCode(container, items);
      default:
        return generateCSSCode(container, items);
    }
  }, [container, items, format]);
}; 