import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Check, Copy, Download } from "lucide-react";
import { ContainerConfig, ExportFormat } from "./types";
import {
  generateCSSCode,
  generateSCSSCode,
  generateTailwindConfig,
} from "@/utils/containerCodeGenerator";

interface CodeExporterProps {
  containerConfig: ContainerConfig;
  exportFormat: ExportFormat;
  onFormatChange: (format: ExportFormat) => void;
}

const CodeExporter: React.FC<CodeExporterProps> = ({
  containerConfig,
  exportFormat,
  onFormatChange,
}) => {
  const [copied, setCopied] = useState(false);

  // Generate code based on the selected format
  const getCode = () => {
    switch (exportFormat) {
      case "css":
        return generateCSSCode(containerConfig);
      case "scss":
        return generateSCSSCode(containerConfig);
      case "tailwind":
        return generateTailwindConfig(containerConfig);
      default:
        return "";
    }
  };

  const code = getCode();

  // Copy code to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download code as file
  const downloadCode = () => {
    const fileName = `container-${containerConfig.name}.${getFileExtension()}`;
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getFileExtension = () => {
    switch (exportFormat) {
      case "css":
        return "css";
      case "scss":
        return "scss";
      case "tailwind":
        return "js";
      default:
        return "txt";
    }
  };

  return (
    <Card className="p-4">
      <h3 className="font-medium text-lg mb-4">Export Code</h3>

      <Tabs
        value={exportFormat}
        onValueChange={(value: string) => onFormatChange(value as ExportFormat)}
        className="mb-4"
      >
        <TabsList className="mb-4">
          <TabsTrigger value="css">CSS</TabsTrigger>
          <TabsTrigger value="scss">SCSS</TabsTrigger>
          <TabsTrigger value="tailwind">Tailwind</TabsTrigger>
        </TabsList>

        <TabsContent value="css">
          <p className="text-sm text-muted-foreground mb-4">
            Vanilla CSS with media queries and optional custom properties.
          </p>
        </TabsContent>
        <TabsContent value="scss">
          <p className="text-sm text-muted-foreground mb-4">
            SCSS variables and mixins for more maintainable container styles.
          </p>
        </TabsContent>
        <TabsContent value="tailwind">
          <p className="text-sm text-muted-foreground mb-4">
            Tailwind configuration object for the theme.container property.
          </p>
        </TabsContent>
      </Tabs>

      <div className="relative rounded-md overflow-hidden mb-4 border">
        <div className="absolute right-2 top-2 flex space-x-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={copyToClipboard}
            className="h-8 w-8 bg-background/90 hover:bg-background/70"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={downloadCode}
            className="h-8 w-8 bg-background/90 hover:bg-background/70"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>

        <pre className="p-4 text-sm overflow-x-auto bg-muted">
          <code>{code}</code>
        </pre>
      </div>

      <div className="text-sm text-muted-foreground">
        <h4 className="font-medium mb-2">Usage Instructions</h4>
        <p className="mb-2">
          {exportFormat === "css" &&
            "Add this CSS to your stylesheet and apply the container class to your element."}
          {exportFormat === "scss" &&
            "Import these SCSS variables and mixins into your main SCSS file."}
          {exportFormat === "tailwind" &&
            "Add this configuration to your tailwind.config.js file in the theme section."}
        </p>
      </div>
    </Card>
  );
};

export default CodeExporter;
