import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Copy, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";

function toPascalCase(str: string): string {
  return str.replace(/(?:^|[\s_-])(\w)/g, (_, c) => c.toUpperCase());
}

function inferType(value: unknown, interfaces: Map<string, string>, rootName: string, depth: number = 0): string {
  if (value === null) return "null";
  if (value === undefined) return "undefined";

  const type = typeof value;

  if (type === "boolean") return "boolean";
  if (type === "number") return Number.isInteger(value as number) ? "number" : "number";
  if (type === "string") return "string";

  if (Array.isArray(value)) {
    if (value.length === 0) return "unknown[]";
    const itemTypes = [...new Set(value.map(item => inferType(item, interfaces, rootName, depth + 1)))];
    const itemType = itemTypes.length === 1 ? itemTypes[0] : `(${itemTypes.join(" | ")})`;
    return `${itemType}[]`;
  }

  if (type === "object") {
    const obj = value as Record<string, unknown>;
    const keys = Object.keys(obj);
    if (keys.length === 0) return "Record<string, unknown>";

    // Generate interface name from context
    const interfaceName = depth === 0 ? rootName : toPascalCase(rootName) + "Item";

    const props = keys.map(key => {
      const val = obj[key];
      const propType = inferType(val, interfaces, toPascalCase(key), depth + 1);
      const safePropKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : `"${key}"`;
      const optional = val === null || val === undefined ? "?" : "";
      return `  ${safePropKey}${optional}: ${propType};`;
    }).join("\n");

    const interfaceStr = `interface ${interfaceName} {\n${props}\n}`;
    interfaces.set(interfaceName, interfaceStr);
    return interfaceName;
  }

  return "unknown";
}

function jsonToTypeScript(json: string, rootName: string, useInterface: boolean, exportTypes: boolean): { result: string; error: string | null } {
  try {
    const parsed = JSON.parse(json);
    const interfaces = new Map<string, string>();
    const cleanRoot = toPascalCase(rootName || "Root");

    inferType(parsed, interfaces, cleanRoot);

    // Collect all interfaces
    const allInterfaces = [...interfaces.values()];

    // Add export keyword if requested
    const output = allInterfaces
      .map(iface => {
        if (!useInterface) {
          // Convert to type alias
          iface = iface.replace(/^interface (\w+) \{/, "type $1 = {");
        }
        if (exportTypes) {
          iface = iface.replace(/^(interface|type) /, "export $1 ");
        }
        return iface;
      })
      .reverse() // Put root type at bottom
      .join("\n\n");

    return { result: output, error: null };
  } catch (e) {
    return { result: "", error: (e as Error).message };
  }
}

const SAMPLE_JSON = `{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "isActive": true,
    "age": 30,
    "tags": ["admin", "user"],
    "address": {
      "street": "123 Main St",
      "city": "Springfield",
      "zip": "12345"
    }
  },
  "posts": [
    {
      "id": 1,
      "title": "Hello World",
      "published": true
    }
  ]
}`;

export const JsonToTypeScript = () => {
  const [input, setInput] = useState(SAMPLE_JSON);
  const [rootName, setRootName] = useState("Root");
  const [useInterface, setUseInterface] = useState(true);
  const [exportTypes, setExportTypes] = useState(true);
  const [copied, setCopied] = useState(false);

  const { result, error } = useCallback(
    () => jsonToTypeScript(input, rootName, useInterface, exportTypes),
    [input, rootName, useInterface, exportTypes]
  )();

  const copy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadSample = () => setInput(SAMPLE_JSON);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">JSON to TypeScript Converter</CardTitle>
          <CardDescription>Automatically generate TypeScript interfaces or type aliases from any JSON data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Options Row */}
          <div className="flex flex-wrap gap-6">
            <div className="space-y-1">
              <Label htmlFor="rootName">Root Type Name</Label>
              <Input
                id="rootName"
                value={rootName}
                onChange={(e) => setRootName(e.target.value)}
                className="w-40"
                placeholder="Root"
              />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <Switch id="useInterface" checked={useInterface} onCheckedChange={setUseInterface} />
              <Label htmlFor="useInterface">Use {useInterface ? "interface" : "type"}</Label>
            </div>
            <div className="flex items-center gap-2 pt-6">
              <Switch id="exportTypes" checked={exportTypes} onCheckedChange={setExportTypes} />
              <Label htmlFor="exportTypes">Export types</Label>
            </div>
          </div>

          {/* Editor */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">JSON Input</Label>
                <Button variant="ghost" size="sm" onClick={loadSample}>
                  <RefreshCw className="h-3 w-3 mr-1" /> Sample
                </Button>
              </div>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="font-mono text-sm min-h-[400px] resize-none"
                placeholder='{"key": "value"}'
                spellCheck={false}
              />
              {error && (
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* Output */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">TypeScript Output</Label>
                <div className="flex items-center gap-2">
                  {!error && result && (
                    <div className="flex items-center gap-1 text-xs text-green-600">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Valid</span>
                    </div>
                  )}
                  <Button variant="outline" size="sm" onClick={copy} disabled={!result}>
                    <Copy className="h-3 w-3 mr-1" /> Copy
                  </Button>
                </div>
              </div>
              <Textarea
                value={result}
                readOnly
                className="font-mono text-sm min-h-[400px] resize-none bg-muted/50"
                placeholder="TypeScript interfaces will appear here..."
              />
              {copied && <p className="text-xs text-green-600">Copied to clipboard!</p>}
            </div>
          </div>

          {/* Info */}
          <div className="rounded-md bg-muted p-4 text-sm space-y-1 text-muted-foreground">
            <p className="font-medium text-foreground">How it works</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Nested objects become separate named interfaces/types</li>
              <li>Arrays are typed based on their element types</li>
              <li><code className="text-xs bg-background px-1 rounded">null</code> values result in optional properties</li>
              <li>Property names with special characters are quoted</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
