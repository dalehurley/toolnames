import Papa from 'papaparse';
import * as yaml from 'js-yaml';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';

// Type definitions
export interface ConversionOptions {
  source: string;
  target: string;
  // Allow specific option types
  hasHeader?: boolean;
  delimiter?: string;
  dynamicTyping?: boolean;
  skipEmptyLines?: boolean;
  indentation?: number;
  sortKeys?: boolean;
  ignoreAttributes?: boolean;
  flowLevel?: number;
  [key: string]: unknown;
}

export interface ConversionResult {
  success: boolean;
  data?: unknown;
  text?: string;
  error?: string;
  meta?: unknown;
}

export interface CsvOptions {
  hasHeader: boolean;
  delimiter: string;
  dynamicTyping: boolean;
  skipEmptyLines: boolean;
}

export interface JsonOptions {
  indentation: number;
  sortKeys: boolean;
}

export interface XmlOptions {
  indentation: number;
  ignoreAttributes: boolean;
}

export interface YamlOptions {
  indentation: number;
  flowLevel: number;
}

// Format detection utilities
export const detectFormat = (
  content: string,
  fileName?: string
): string | null => {
  // Try to detect from file extension first
  if (fileName) {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext) {
      if (['csv', 'tsv'].includes(ext)) return 'csv';
      if (['json'].includes(ext)) return 'json';
      if (['yml', 'yaml'].includes(ext)) return 'yaml';
      if (['xml'].includes(ext)) return 'xml';
    }
  }

  // Try to detect from content
  try {
    // Try JSON
    JSON.parse(content);
    return 'json';
  } catch {
    // Not JSON
  }

  // Try XML
  if (content.trim().startsWith('<') && content.trim().endsWith('>')) {
    return 'xml';
  }

  // Try YAML
  try {
    yaml.load(content);
    // If it loaded but is an object, it might be YAML
    // This is a bit tricky as valid JSON is also valid YAML
    if (
      content.includes(':') &&
      !content.includes('{') &&
      !content.includes('[')
    ) {
      return 'yaml';
    }
  } catch {
    // Not YAML
  }

  // Check for CSV (simplistic check)
  const lines = content.trim().split('\n');
  if (lines.length > 1) {
    // Check if all lines have the same number of delimiters
    const commaCount = lines[0].split(',').length;
    const tabCount = lines[0].split('\t').length;
    const semicolonCount = lines[0].split(';').length;

    // Use the delimiter that creates most consistent columns
    if (commaCount > 1 && lines.every(line => line.split(',').length === commaCount)) {
      return 'csv';
    }
    if (tabCount > 1 && lines.every(line => line.split('\t').length === tabCount)) {
      return 'tsv';
    }
    if (semicolonCount > 1 && lines.every(line => line.split(';').length === semicolonCount)) {
      return 'csv'; // CSV with semicolon delimiter
    }
  }

  return null; // Unknown format
};

// CSV to JSON Conversion
export const convertCsvToJson = (
  content: string,
  options: Partial<CsvOptions> = {}
): ConversionResult => {
  try {
    const result = Papa.parse(content, {
      header: options.hasHeader !== false,
      delimiter: options.delimiter || '',
      dynamicTyping: options.dynamicTyping !== false,
      skipEmptyLines: options.skipEmptyLines !== false
    });

    if (result.errors.length > 0) {
      return {
        success: false,
        error: result.errors[0].message
      };
    }

    return {
      success: true,
      data: result.data,
      meta: result.meta
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

// JSON to CSV Conversion
export const convertJsonToCsv = (
  content: string,
  options: Partial<CsvOptions> = {}
): ConversionResult => {
  try {
    const jsonData = JSON.parse(content);
    
    // Handle different JSON structures
    const data = Array.isArray(jsonData) 
      ? jsonData 
      : [jsonData]; // Convert object to array with one element
    
    const csv = Papa.unparse(data, {
      delimiter: options.delimiter || ',',
      header: options.hasHeader !== false
    });
    
    return {
      success: true,
      text: csv
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

// JSON to YAML Conversion
export const convertJsonToYaml = (
  content: string,
  options: Partial<YamlOptions> = {}
): ConversionResult => {
  try {
    const jsonData = JSON.parse(content);
    const yamlText = yaml.dump(jsonData, {
      indent: options.indentation || 2,
      flowLevel: options.flowLevel
    });
    
    return {
      success: true,
      text: yamlText
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

// YAML to JSON Conversion
export const convertYamlToJson = (
  content: string,
  options: Partial<JsonOptions> = {}
): ConversionResult => {
  try {
    const yamlData = yaml.load(content);
    const jsonText = JSON.stringify(
      yamlData, 
      null, 
      options.indentation || 2
    );
    
    return {
      success: true,
      text: jsonText,
      data: yamlData
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

// XML to JSON Conversion
export const convertXmlToJson = (
  content: string,
  options: Partial<XmlOptions> = {}
): ConversionResult => {
  try {
    const parser = new XMLParser({
      ignoreAttributes: options.ignoreAttributes === true,
      parseAttributeValue: true,
      parseTagValue: true
    });
    
    const jsonData = parser.parse(content);
    const jsonText = JSON.stringify(
      jsonData, 
      null, 
      options.indentation || 2
    );
    
    return {
      success: true,
      text: jsonText,
      data: jsonData
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

// JSON to XML Conversion
export const convertJsonToXml = (
  content: string,
  options: Partial<XmlOptions> = {}
): ConversionResult => {
  try {
    const jsonData = JSON.parse(content);
    
    // XML needs a root element, so we ensure there's one
    const dataWithRoot = typeof jsonData === 'object' && !Array.isArray(jsonData) 
      ? jsonData 
      : { root: jsonData };
    
    const builder = new XMLBuilder({
      ignoreAttributes: options.ignoreAttributes === true,
      format: true,
      indentBy: ' '.repeat(options.indentation || 2)
    });
    
    const xmlText = builder.build(dataWithRoot);
    
    return {
      success: true,
      text: xmlText
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

// Central conversion function
export const convertData = (
  content: string | ArrayBuffer,
  sourceFormat: string,
  targetFormat: string,
  options: ConversionOptions
): ConversionResult => {
  try {
    // Handle text-based formats only
    if (typeof content !== 'string') {
      return {
        success: false,
        error: 'Binary formats are not supported'
      };
    }

    // CSV conversions
    if (sourceFormat === 'csv' && targetFormat === 'json') {
      return convertCsvToJson(content, {
        hasHeader: options.hasHeader,
        delimiter: options.delimiter,
        dynamicTyping: options.dynamicTyping,
        skipEmptyLines: options.skipEmptyLines
      });
    }

    // JSON conversions
    if (sourceFormat === 'json') {
      if (targetFormat === 'csv') {
        return convertJsonToCsv(content, {
          hasHeader: options.hasHeader,
          delimiter: options.delimiter
        });
      } else if (targetFormat === 'yaml') {
        return convertJsonToYaml(content, {
          indentation: options.indentation,
          flowLevel: options.flowLevel
        });
      } else if (targetFormat === 'xml') {
        return convertJsonToXml(content, {
          indentation: options.indentation,
          ignoreAttributes: options.ignoreAttributes
        });
      }
    }

    // YAML conversions
    if (sourceFormat === 'yaml' && targetFormat === 'json') {
      return convertYamlToJson(content, {
        indentation: options.indentation,
        sortKeys: options.sortKeys
      });
    }

    // XML conversions
    if (sourceFormat === 'xml' && targetFormat === 'json') {
      return convertXmlToJson(content, {
        indentation: options.indentation,
        ignoreAttributes: options.ignoreAttributes
      });
    }

    return {
      success: false,
      error: `Conversion from ${sourceFormat} to ${targetFormat} is not supported`
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}; 