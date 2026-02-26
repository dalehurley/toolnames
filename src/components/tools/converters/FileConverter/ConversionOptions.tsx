import React, { forwardRef } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import {
  CsvOptions,
  JsonOptions,
  XmlOptions,
  YamlOptions,
} from "./utils/converters";

interface ConversionOptionsProps extends React.HTMLAttributes<HTMLDivElement> {
  sourceFormat: string;
  targetFormat: string;
  options: Record<string, unknown>;
  onOptionsChange: (options: Record<string, unknown>) => void;
}

const ConversionOptionsComponent = forwardRef<
  HTMLDivElement,
  ConversionOptionsProps
>(({ sourceFormat, targetFormat, options, onOptionsChange, ...props }, ref) => {
  const handleOptionChange = (key: string, value: unknown) => {
    onOptionsChange({
      ...options,
      [key]: value,
    });
  };

  // CSV Options
  const renderCsvOptions = () => {
    const csvOptions = options as Partial<CsvOptions>;

    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="hasHeader"
            checked={csvOptions.hasHeader !== false}
            onCheckedChange={(checked) =>
              handleOptionChange("hasHeader", checked)
            }
          />
          <Label htmlFor="hasHeader">First row is header</Label>
        </div>

        <div className="space-y-2">
          <Label htmlFor="delimiter">Delimiter</Label>
          <Select
            value={csvOptions.delimiter || ","}
            onValueChange={(value) => handleOptionChange("delimiter", value)}
          >
            <SelectTrigger id="delimiter">
              <SelectValue placeholder="Select delimiter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value=",">Comma (,)</SelectItem>
              <SelectItem value=";">Semicolon (;)</SelectItem>
              <SelectItem value="\t">Tab</SelectItem>
              <SelectItem value="|">Pipe (|)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="dynamicTyping"
            checked={csvOptions.dynamicTyping !== false}
            onCheckedChange={(checked) =>
              handleOptionChange("dynamicTyping", checked)
            }
          />
          <Label htmlFor="dynamicTyping">
            Convert values to numbers when possible
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="skipEmptyLines"
            checked={csvOptions.skipEmptyLines !== false}
            onCheckedChange={(checked) =>
              handleOptionChange("skipEmptyLines", checked)
            }
          />
          <Label htmlFor="skipEmptyLines">Skip empty lines</Label>
        </div>
      </div>
    );
  };

  // JSON Options
  const renderJsonOptions = () => {
    const jsonOptions = options as Partial<JsonOptions>;

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="indentation">Indentation</Label>
          <Select
            value={String(jsonOptions.indentation || 2)}
            onValueChange={(value) =>
              handleOptionChange("indentation", parseInt(value))
            }
          >
            <SelectTrigger id="indentation">
              <SelectValue placeholder="Select indentation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">No indentation</SelectItem>
              <SelectItem value="2">2 spaces</SelectItem>
              <SelectItem value="4">4 spaces</SelectItem>
              <SelectItem value="8">8 spaces</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="sortKeys"
            checked={jsonOptions.sortKeys === true}
            onCheckedChange={(checked) =>
              handleOptionChange("sortKeys", checked)
            }
          />
          <Label htmlFor="sortKeys">Sort object keys alphabetically</Label>
        </div>
      </div>
    );
  };

  // XML Options
  const renderXmlOptions = () => {
    const xmlOptions = options as Partial<XmlOptions>;

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="xmlIndentation">Indentation</Label>
          <Select
            value={String(xmlOptions.indentation || 2)}
            onValueChange={(value) =>
              handleOptionChange("indentation", parseInt(value))
            }
          >
            <SelectTrigger id="xmlIndentation">
              <SelectValue placeholder="Select indentation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">No indentation</SelectItem>
              <SelectItem value="2">2 spaces</SelectItem>
              <SelectItem value="4">4 spaces</SelectItem>
              <SelectItem value="8">8 spaces</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="ignoreAttributes"
            checked={xmlOptions.ignoreAttributes === true}
            onCheckedChange={(checked) =>
              handleOptionChange("ignoreAttributes", checked)
            }
          />
          <Label htmlFor="ignoreAttributes">Ignore XML attributes</Label>
        </div>
      </div>
    );
  };

  // YAML Options
  const renderYamlOptions = () => {
    const yamlOptions = options as Partial<YamlOptions>;

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="yamlIndentation">Indentation</Label>
          <Select
            value={String(yamlOptions.indentation || 2)}
            onValueChange={(value) =>
              handleOptionChange("indentation", parseInt(value))
            }
          >
            <SelectTrigger id="yamlIndentation">
              <SelectValue placeholder="Select indentation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2">2 spaces</SelectItem>
              <SelectItem value="4">4 spaces</SelectItem>
              <SelectItem value="8">8 spaces</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="flowLevel">Flow Level</Label>
          <Select
            value={String(yamlOptions.flowLevel || -1)}
            onValueChange={(value) =>
              handleOptionChange("flowLevel", parseInt(value))
            }
          >
            <SelectTrigger id="flowLevel">
              <SelectValue placeholder="Select flow level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="-1">Default (Block Style)</SelectItem>
              <SelectItem value="0">Flow Style Level 0</SelectItem>
              <SelectItem value="1">Flow Style Level 1</SelectItem>
              <SelectItem value="2">Flow Style Level 2</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  };

  // Determine which options to show based on source and target formats
  const getOptionsToShow = () => {
    if (sourceFormat === "csv") {
      return ["csv"];
    }

    if (targetFormat === "csv") {
      return ["csv"];
    }

    if (sourceFormat === "json" || targetFormat === "json") {
      return ["json"];
    }

    if (sourceFormat === "xml" || targetFormat === "xml") {
      return ["xml"];
    }

    if (sourceFormat === "yaml" || targetFormat === "yaml") {
      return ["yaml"];
    }

    return [];
  };

  const optionsToShow = getOptionsToShow();

  if (optionsToShow.length === 0) {
    return null;
  }

  return (
    <Card ref={ref} {...props}>
      <CardContent className="pt-6">
        <Tabs defaultValue={optionsToShow[0]}>
          <TabsList className="mb-4">
            {optionsToShow.includes("csv") && (
              <TabsTrigger value="csv">CSV Options</TabsTrigger>
            )}
            {optionsToShow.includes("json") && (
              <TabsTrigger value="json">JSON Options</TabsTrigger>
            )}
            {optionsToShow.includes("xml") && (
              <TabsTrigger value="xml">XML Options</TabsTrigger>
            )}
            {optionsToShow.includes("yaml") && (
              <TabsTrigger value="yaml">YAML Options</TabsTrigger>
            )}
          </TabsList>

          {optionsToShow.includes("csv") && (
            <TabsContent value="csv">{renderCsvOptions()}</TabsContent>
          )}

          {optionsToShow.includes("json") && (
            <TabsContent value="json">{renderJsonOptions()}</TabsContent>
          )}

          {optionsToShow.includes("xml") && (
            <TabsContent value="xml">{renderXmlOptions()}</TabsContent>
          )}

          {optionsToShow.includes("yaml") && (
            <TabsContent value="yaml">{renderYamlOptions()}</TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
});

ConversionOptionsComponent.displayName = "ConversionOptions";

export const ConversionOptions = ConversionOptionsComponent;
