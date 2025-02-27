import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, RefreshCw, Check, FileBadge, Download } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export const JSONFormatter = () => {
  const [input, setInput] = useState<string>("");
  const [output, setOutput] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [formatType, setFormatType] = useState<"pretty" | "minify">("pretty");
  const [copied, setCopied] = useState<boolean>(false);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    message?: string;
  } | null>(null);

  // Parse and format JSON
  const formatJSON = () => {
    if (!input.trim()) {
      setError("Please enter JSON to format");
      setOutput("");
      setValidationResult(null);
      return;
    }

    try {
      // First parse to validate
      const parsed = JSON.parse(input);
      setValidationResult({ valid: true, message: "JSON is valid" });
      setError(null);

      // Then format according to preference
      if (formatType === "pretty") {
        setOutput(JSON.stringify(parsed, null, 2));
      } else {
        setOutput(JSON.stringify(parsed));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Invalid JSON";
      setError(`JSON parsing error: ${errorMessage}`);
      setOutput("");
      setValidationResult({ valid: false, message: errorMessage });
    }
  };

  // Validate JSON without formatting
  const validateJSON = () => {
    if (!input.trim()) {
      setValidationResult({
        valid: false,
        message: "Please enter JSON to validate",
      });
      return;
    }

    try {
      JSON.parse(input);
      setValidationResult({ valid: true, message: "JSON is valid" });
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Invalid JSON";
      setValidationResult({ valid: false, message: errorMessage });
    }
  };

  // Copy formatted JSON to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Clear all fields
  const clearAll = () => {
    setInput("");
    setOutput("");
    setError(null);
    setValidationResult(null);
    setCopied(false);
  };

  // Download JSON file
  const downloadJSON = () => {
    const blob = new Blob([output], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "formatted.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Sample data for quick start
  const loadSampleData = () => {
    const sampleJSON = {
      id: 1,
      name: "Product Example",
      price: 29.99,
      tags: ["electronics", "gadget", "new"],
      details: {
        manufacturer: "Tech Company",
        model: "X100",
        dimensions: {
          height: 10,
          width: 5,
          depth: 2,
        },
      },
      inStock: true,
      variants: [
        {
          id: 101,
          color: "Black",
          price: 29.99,
        },
        {
          id: 102,
          color: "Silver",
          price: 34.99,
        },
      ],
    };

    setInput(JSON.stringify(sampleJSON));
    setOutput("");
    setError(null);
    setValidationResult(null);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">JSON Formatter & Validator</CardTitle>
        <CardDescription>
          Format, validate, and beautify your JSON data
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
                disabled={!input && !output}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            </div>
          </div>
          <Textarea
            id="jsonInput"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setValidationResult(null);
            }}
            placeholder="Paste your JSON here..."
            className="min-h-[200px] font-mono text-sm"
          />
        </div>

        <div className="flex flex-wrap gap-3 justify-center">
          <Tabs
            value={formatType}
            onValueChange={(value) =>
              setFormatType(value as "pretty" | "minify")
            }
            className="w-auto"
          >
            <TabsList>
              <TabsTrigger value="pretty">Pretty Print</TabsTrigger>
              <TabsTrigger value="minify">Minify</TabsTrigger>
            </TabsList>
          </Tabs>

          <Button
            variant="default"
            onClick={formatJSON}
            disabled={!input.trim()}
          >
            Format JSON
          </Button>

          <Button
            variant="outline"
            onClick={validateJSON}
            disabled={!input.trim()}
          >
            Validate Only
          </Button>
        </div>

        {validationResult && (
          <div
            className={`p-3 rounded-md text-sm flex items-center ${
              validationResult.valid
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {validationResult.valid ? (
              <Check className="h-4 w-4 mr-2" />
            ) : (
              <FileBadge className="h-4 w-4 mr-2" />
            )}
            {validationResult.message}
          </div>
        )}

        {output && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="jsonOutput">Formatted JSON</Label>
                <div className="space-x-2">
                  <Button variant="outline" size="sm" onClick={copyToClipboard}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button variant="outline" size="sm" onClick={downloadJSON}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
              <Textarea
                id="jsonOutput"
                value={output}
                readOnly
                className="min-h-[200px] font-mono text-sm"
              />
              {copied && (
                <div className="bg-green-100 text-green-800 p-2 rounded-md text-sm">
                  Copied to clipboard!
                </div>
              )}
            </div>
          </>
        )}

        <div className="bg-muted p-4 rounded-lg">
          <h3 className="font-medium mb-2">JSON Formatting Tips</h3>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
            <li>
              Use pretty print for better readability, minify to save space
            </li>
            <li>
              Ensure property names and strings are enclosed in double quotes
            </li>
            <li>Arrays should be enclosed in square brackets [ ]</li>
            <li>Objects should be enclosed in curly braces {}</li>
            <li>
              Values can be strings, numbers, booleans, null, arrays, or objects
            </li>
            <li>Commas separate items in arrays and properties in objects</li>
            <li>
              The last item in an array or object should not have a trailing
              comma
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
