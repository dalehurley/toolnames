// Types for CSV Explorer

export type DataType = 'string' | 'number' | 'boolean' | 'date' | 'unknown';
export type DataValue = string | number | boolean | Date | null | undefined;

export interface Column {
  id: string;
  name: string;
  type: DataType;
  originalType: DataType;
  format?: string;
  uniqueValues?: Set<DataValue>;
  stats?: ColumnStats;
}

export interface ColumnStats {
  count: number;
  nullCount: number;
  uniqueCount: number;
  min?: number | Date;
  max?: number | Date;
  mean?: number;
  median?: number;
  mode?: DataValue;
  standardDeviation?: number;
}

export interface CSVData {
  fields: string[];
  data: Record<string, DataValue>[];
  originalData: Record<string, DataValue>[];
}

export interface ParseResult {
  data: Record<string, DataValue>[];
  errors: ParseError[];
  meta: {
    delimiter: string;
    linebreak: string;
    aborted: boolean;
    truncated: boolean;
    cursor: number;
    fields: string[];
  };
  name?: string;
}

export interface ParseError {
  type: string;
  code: string;
  message: string;
  row: number;
  index: number;
}

export interface ChartData {
  type: string;
  data: Record<string, unknown>;
  options: Record<string, unknown>;
}

export interface CleaningOperation {
  type: 'deduplication' | 'nullHandling' | 'outlierDetection' | 'filter' | 'transform';
  field?: string;
  value?: DataValue;
  operation?: string;
}

export interface ExportOptions {
  format: 'csv' | 'excel' | 'image';
  includeColumns: string[];
  filename: string;
} 