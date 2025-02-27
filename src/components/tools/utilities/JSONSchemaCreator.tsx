import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Copy, RefreshCw, Check, FileJson, Download } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  generateJsonSchema,
  formatSchema,
  SAMPLE_JSON,
} from "@/utils/schemaUtils";
import Editor from "@monaco-editor/react";

export const JSONSchemaCreator = () => {
  const [input, setInput] = useState<string>("");
  const [schema, setSchema] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Generate JSON Schema from input
  const generateSchema = () => {
    if (!input.trim()) {
      setError("Please enter JSON to analyze");
      setSchema("");
      return;
    }

    try {
      // Parse the input JSON
      const parsedJson = JSON.parse(input);

      // Generate schema
      const jsonSchema = generateJsonSchema(parsedJson);

      // Format the schema for display
      setSchema(formatSchema(jsonSchema));
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Invalid JSON";
      setError(`JSON parsing error: ${errorMessage}`);
      setSchema("");
    }
  };

  // Copy schema to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(schema);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Clear all fields
  const clearAll = () => {
    setInput("");
    setSchema("");
    setError(null);
    setCopied(false);
  };

  // Download schema as JSON file
  const downloadSchema = () => {
    const blob = new Blob([schema], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "schema.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Load sample data
  const loadSampleData = () => {
    setInput(JSON.stringify(SAMPLE_JSON, null, 2));
    setSchema("");
    setError(null);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">JSON Schema Creator</CardTitle>
        <CardDescription>
          Generate JSON Schema from your JSON data for documentation and
          validation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="jsonInput">JSON Input</Label>
            <div className="space-x-2">
              <Button variant="outline" size="sm" onClick={loadSampleData}>
                Load Sample
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearAll}
                disabled={!input && !schema}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            </div>
          </div>
          <div className="border rounded-md">
            <Editor
              height="200px"
              defaultLanguage="json"
              value={input}
              onChange={(value) => setInput(value || "")}
              options={{
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                fontSize: 14,
                tabSize: 2,
              }}
            />
          </div>
        </div>

        <div className="flex justify-center">
          <Button
            variant="default"
            onClick={generateSchema}
            disabled={!input.trim()}
          >
            <FileJson className="h-4 w-4 mr-2" />
            Generate Schema
          </Button>
        </div>

        {error && (
          <div className="p-3 rounded-md bg-red-100 text-red-800 text-sm">
            {error}
          </div>
        )}

        {schema && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="jsonSchema">Generated JSON Schema</Label>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyToClipboard}
                    className="flex items-center"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </>
                    )}
                  </Button>
                  <Button variant="outline" size="sm" onClick={downloadSchema}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
              <div className="border rounded-md">
                <Editor
                  height="300px"
                  defaultLanguage="json"
                  value={schema}
                  options={{
                    readOnly: true,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    fontSize: 14,
                    tabSize: 2,
                  }}
                />
              </div>
            </div>
          </>
        )}

        <div className="bg-muted p-4 rounded-lg mt-4">
          <h3 className="font-medium mb-2">About JSON Schema</h3>
          <p className="text-sm text-muted-foreground">
            JSON Schema is a vocabulary that allows you to annotate and validate
            JSON documents. It's useful for API documentation, data validation,
            and generating code. This tool creates a basic schema that describes
            the structure of your JSON data, including types and nested objects.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default JSONSchemaCreator;
