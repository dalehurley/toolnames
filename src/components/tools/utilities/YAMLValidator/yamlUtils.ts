import * as yaml from 'js-yaml';

export interface ValidationError {
  line: number;
  column: number;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  parsed: any;
}

export interface FormatOptions {
  indent: number;
  lineWidth: number;
  sortKeys: boolean;
}

/**
 * Validates YAML string and returns detailed error information
 */
export const validateYAML = (yamlString: string): ValidationResult => {
  if (!yamlString.trim()) {
    return {
      valid: false,
      errors: [
        {
          line: 1,
          column: 1,
          message: 'YAML input is empty',
        },
      ],
      parsed: null,
    };
  }

  try {
    const parsed = yaml.load(yamlString);
    return {
      valid: true,
      errors: [],
      parsed,
    };
  } catch (error) {
    const yamlError = error as any;
    return {
      valid: false,
      errors: [
        {
          line: yamlError.mark?.line ? yamlError.mark.line + 1 : 1,
          column: yamlError.mark?.column ? yamlError.mark.column + 1 : 1,
          message: yamlError.message || 'Invalid YAML',
        },
      ],
      parsed: null,
    };
  }
};

/**
 * Formats YAML with specified options
 */
export const formatYAML = (
  yamlString: string,
  options: FormatOptions
): string => {
  try {
    const parsed = yaml.load(yamlString);
    return yaml.dump(parsed, {
      indent: options.indent,
      lineWidth: options.lineWidth,
      sortKeys: options.sortKeys,
      noRefs: true,
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Converts YAML to JSON
 */
export const yamlToJSON = (yamlString: string): string => {
  try {
    const parsed = yaml.load(yamlString);
    return JSON.stringify(parsed, null, 2);
  } catch (error) {
    throw error;
  }
};

/**
 * Converts JSON to YAML
 */
export const jsonToYAML = (jsonString: string): string => {
  try {
    const parsed = JSON.parse(jsonString);
    return yaml.dump(parsed, {
      indent: 2,
      lineWidth: 80,
      sortKeys: false,
      noRefs: true,
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Highlights error line in YAML text
 */
export const getErrorContext = (
  yamlString: string,
  line: number
): { context: string; lineNumber: number } => {
  const lines = yamlString.split('\n');
  const errorLine = Math.min(Math.max(line - 1, 0), lines.length - 1);
  return {
    context: lines[errorLine] || '',
    lineNumber: errorLine + 1,
  };
};

/**
 * Get all lines of YAML with line numbers
 */
export const getYAMLLines = (yamlString: string): Array<{ line: number; content: string }> => {
  return yamlString.split('\n').map((content, index) => ({
    line: index + 1,
    content,
  }));
};

/**
 * Sample YAML content for quick start
 */
export const SAMPLE_YAML = `# Sample YAML Document
name: John Doe
age: 30
email: john@example.com

address:
  street: 123 Main St
  city: Springfield
  state: IL
  zip: 62701

skills:
  - JavaScript
  - TypeScript
  - React
  - Node.js

employment:
  - company: Tech Corp
    position: Senior Developer
    years: 5
  - company: StartUp Inc
    position: Full Stack Developer
    years: 2

active: true`;
