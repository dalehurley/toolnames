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
export declare function generateJsonSchema(json: unknown): JSONSchema;
/**
 * Format the schema with indentation for display
 *
 * @param schema The schema object
 * @param spaces Number of spaces for indentation
 * @returns Formatted JSON string
 */
export declare function formatSchema(schema: JSONSchema, spaces?: number): string;
/**
 * Sample JSON for demonstration
 */
export declare const SAMPLE_JSON: {
    user: {
        id: number;
        name: string;
        email: string;
        profile: {
            avatar: string;
            bio: string;
        };
        posts: {
            id: number;
            title: string;
            content: string;
        }[];
        active: boolean;
        score: number;
    };
};
