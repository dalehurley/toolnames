/**
 * Utility functions for JSON Schema generation
 */

/**
 * Interface for JSON Schema
 */
export interface JSONSchema {
  type: string;
  properties?: Record<string, JSONSchema>;
  items?: JSONSchema;
  [key: string]: unknown;
}

/**
 * Generate a JSON Schema from a JSON object
 * 
 * @param json The JSON object to analyze
 * @returns A JSON Schema object representing the structure
 */
export function generateJsonSchema(json: unknown): JSONSchema {
  return buildSchema(json);
}

/**
 * Recursively build schema for any value
 */
function buildSchema(value: unknown): JSONSchema {
  // Handle null values
  if (value === null) {
    return { type: "null" };
  }

  // Handle different types
  switch (typeof value) {
    case "string":
      return { type: "string" };
    case "number":
      // Check if it's an integer
      return Number.isInteger(value) ? { type: "integer" } : { type: "number" };
    case "boolean":
      return { type: "boolean" };
    case "object":
      if (Array.isArray(value)) {
        // Handle arrays
        if (value.length === 0) {
          // Empty array - can't determine item type
          return {
            type: "array",
            items: { type: "object" } // Use object as default type for empty arrays
          };
        } else {
          // For simplicity, assume all items in array have same schema
          // For more complex cases, we would analyze all items and merge schemas
          return {
            type: "array",
            items: buildSchema(value[0])
          };
        }
      } else {
        // Handle objects
        const properties: Record<string, JSONSchema> = {};
        for (const key in value) {
          if (Object.prototype.hasOwnProperty.call(value, key)) {
            properties[key] = buildSchema((value as Record<string, unknown>)[key]);
          }
        }
        return {
          type: "object",
          properties
        };
      }
    default:
      return { type: "unknown" };
  }
}

/**
 * Format the schema with indentation for display
 * 
 * @param schema The schema object
 * @param spaces Number of spaces for indentation
 * @returns Formatted JSON string
 */
export function formatSchema(schema: JSONSchema, spaces: number = 2): string {
  return JSON.stringify(schema, null, spaces);
}

/**
 * Sample JSON for demonstration
 */
export const SAMPLE_JSON = {
  user: {
    id: 123,
    name: "John Doe",
    email: "john@example.com",
    profile: {
      avatar: "https://example.com/avatar.jpg",
      bio: "Software developer"
    },
    posts: [
      {
        id: 1,
        title: "First Post",
        content: "Hello world"
      }
    ],
    active: true,
    score: 85.5
  }
}; 