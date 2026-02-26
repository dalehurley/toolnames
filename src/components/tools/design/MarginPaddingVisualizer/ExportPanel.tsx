import React, { useState } from "react";
import { useSpacing } from "./SpacingContext";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Copy, Check, Download } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ExportFormat type with new design tokens option
type ExportFormat = "css" | "scss" | "tailwind" | "designTokens";

const ExportPanel: React.FC = () => {
  const spacing = useSpacing();
  const [copied, setCopied] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>("css");
  const [tokenFormat, setTokenFormat] = useState<"json" | "js">("json");

  // Get the export content based on selected format
  const getExportContent = () => {
    switch (exportFormat) {
      case "css":
        return spacing.exportCSS();
      case "scss":
        return spacing.exportSCSS();
      case "tailwind":
        return spacing.exportTailwind();
      case "designTokens":
        return generateDesignTokens();
      default:
        return "";
    }
  };

  // Generate design tokens for design systems
  const generateDesignTokens = () => {
    const scale = spacing.generateScale();
    const scaleTokens = scale.reduce((acc, value, index) => {
      acc[index] = `${value}${spacing.unit}`;
      return acc;
    }, {} as Record<string, string>);

    const spacingTokens = {
      spacing: {
        scale: scaleTokens,
        margin: {
          top: `${spacing.marginTop}${spacing.unit}`,
          right: `${spacing.marginRight}${spacing.unit}`,
          bottom: `${spacing.marginBottom}${spacing.unit}`,
          left: `${spacing.marginLeft}${spacing.unit}`,
        },
        padding: {
          top: `${spacing.paddingTop}${spacing.unit}`,
          right: `${spacing.paddingRight}${spacing.unit}`,
          bottom: `${spacing.paddingBottom}${spacing.unit}`,
          left: `${spacing.paddingLeft}${spacing.unit}`,
        },
        border: {
          width: `${spacing.borderWidth}${spacing.unit}`,
        },
      },
    };

    if (tokenFormat === "json") {
      return JSON.stringify(spacingTokens, null, 2);
    } else {
      return `// Design system spacing tokens
export const spacingTokens = ${JSON.stringify(spacingTokens, null, 2)};

// Example usage:
// import { spacingTokens } from './tokens';
// 
// const myComponent = styled.div\`
//   margin-top: \${spacingTokens.spacing.margin.top};
//   padding: \${spacingTokens.spacing.padding.top} \${spacingTokens.spacing.padding.right};
// \`;
`;
    }
  };

  // Copy to clipboard function
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(getExportContent());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  // Download as file
  const downloadAsFile = () => {
    const content = getExportContent();
    let filename = "spacing";
    let mimetype = "text/plain";

    switch (exportFormat) {
      case "css":
        filename += ".css";
        mimetype = "text/css";
        break;
      case "scss":
        filename += ".scss";
        mimetype = "text/x-scss";
        break;
      case "tailwind":
        filename += "-tailwind-config.js";
        mimetype = "application/javascript";
        break;
      case "designTokens":
        filename += tokenFormat === "json" ? "-tokens.json" : "-tokens.js";
        mimetype =
          tokenFormat === "json"
            ? "application/json"
            : "application/javascript";
        break;
    }

    const blob = new Blob([content], { type: mimetype });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="p-6">
      <h2 className="text-lg font-medium mb-4">Export Code</h2>

      <div className="space-y-4">
        <div>
          <Label className="mb-2 block">Export Format</Label>
          <RadioGroup
            value={exportFormat}
            onValueChange={(value) => setExportFormat(value as ExportFormat)}
            className="flex flex-wrap gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="css" id="css" />
              <Label htmlFor="css">CSS</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="scss" id="scss" />
              <Label htmlFor="scss">SCSS</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="tailwind" id="tailwind" />
              <Label htmlFor="tailwind">Tailwind</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="designTokens" id="designTokens" />
              <Label htmlFor="designTokens">Design Tokens</Label>
            </div>
          </RadioGroup>
        </div>

        {exportFormat === "designTokens" && (
          <div>
            <Label htmlFor="token-format">Token Format</Label>
            <Select
              value={tokenFormat}
              onValueChange={(value: "json" | "js") => setTokenFormat(value)}
            >
              <SelectTrigger id="token-format">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="js">JavaScript</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500 mt-1">
              JSON format works well with design tools, JavaScript format is
              ready for import in code.
            </p>
          </div>
        )}

        <Tabs defaultValue="preview" className="w-full">
          <TabsList>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="options">Options</TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="mt-4">
            <div className="relative">
              <Textarea
                value={getExportContent()}
                readOnly
                className="font-mono text-sm h-[300px] resize-none bg-slate-50 dark:bg-slate-900"
              />
              <div className="absolute top-2 right-2 flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                  className="h-8 px-2"
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  <span className="ml-1">{copied ? "Copied" : "Copy"}</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadAsFile}
                  className="h-8 px-2"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="options" className="mt-4">
            <div className="space-y-4">
              {(exportFormat === "css" || exportFormat === "scss") && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="margin-prefix">Margin Prefix</Label>
                      <Input
                        id="margin-prefix"
                        value={spacing.prefixMargin}
                        onChange={(e) =>
                          spacing.setSpacing("prefixMargin", e.target.value)
                        }
                        placeholder="m"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="padding-prefix">Padding Prefix</Label>
                      <Input
                        id="padding-prefix"
                        value={spacing.prefixPadding}
                        onChange={(e) =>
                          spacing.setSpacing("prefixPadding", e.target.value)
                        }
                        placeholder="p"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="directional-classes"
                      checked={spacing.includeDirectionalClasses}
                      onCheckedChange={(checked) =>
                        spacing.setSpacing(
                          "includeDirectionalClasses",
                          checked === true
                        )
                      }
                    />
                    <Label htmlFor="directional-classes">
                      Include directional classes (top, right, bottom, left)
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="responsive-variants"
                      checked={spacing.includeResponsiveVariants}
                      onCheckedChange={(checked) =>
                        spacing.setSpacing(
                          "includeResponsiveVariants",
                          checked === true
                        )
                      }
                    />
                    <Label htmlFor="responsive-variants">
                      Include responsive variants (sm, md, lg, xl, 2xl)
                    </Label>
                  </div>
                </>
              )}

              {exportFormat === "tailwind" && (
                <div className="space-y-2">
                  <Label>
                    This will generate a compatible tailwind.config.js spacing
                    section.
                  </Label>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    You can copy this directly into your theme configuration.
                  </p>
                </div>
              )}

              {exportFormat === "designTokens" && (
                <div className="space-y-2">
                  <Label>Integration Options</Label>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Design tokens can be used with:
                  </p>
                  <ul className="list-disc pl-5 text-sm text-slate-600 dark:text-slate-400 space-y-1">
                    <li>Figma (via Tokens Studio plugin)</li>
                    <li>Style Dictionary</li>
                    <li>Amazon Style Dictionary</li>
                    <li>Styled Components / Emotion</li>
                    <li>CSS-in-JS libraries</li>
                    <li>Design systems</li>
                  </ul>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  );
};

export default ExportPanel;
