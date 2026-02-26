import { FC, useState, useRef } from "react";
import { GridState, ExportFormat, Breakpoint } from "./types";
import { generateGridCode } from "./utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  CopyIcon,
  CheckIcon,
  Download,
  ExternalLink,
  Code,
  Terminal,
} from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CodeExportProps {
  gridState: GridState;
  breakpoints: Breakpoint[];
  exportFormat: ExportFormat;
  onExportFormatChange: (format: string) => void;
}

export const CodeExport: FC<CodeExportProps> = ({
  gridState,
  breakpoints,
  exportFormat,
  onExportFormatChange,
}) => {
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLPreElement>(null);
  const isMobile = useMediaQuery("(max-width: 640px)");

  // Generate code based on current format
  const generatedCode = generateGridCode(gridState, exportFormat, breakpoints);

  // Copy code to clipboard
  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    toast.success("Code copied to clipboard");

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  // Download code as file
  const handleDownloadCode = () => {
    let fileExtension = ".css";
    let mimeType = "text/css";

    if (exportFormat === "scss") {
      fileExtension = ".scss";
      mimeType = "text/x-scss";
    } else if (exportFormat === "tailwind") {
      fileExtension = ".html";
      mimeType = "text/html";
    }

    const blob = new Blob([generatedCode], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `grid-layout${fileExtension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success(`Downloaded as grid-layout${fileExtension}`);
  };

  // Format class names for active and inactive states
  const getTabClass = (isActive: boolean) => {
    return `flex items-center gap-1 ${
      isActive ? "font-medium text-primary" : "text-muted-foreground"
    }`;
  };

  // Get a user-friendly name for the export format
  const getFormatDisplayName = (format: ExportFormat) => {
    switch (format) {
      case "css":
        return "CSS";
      case "scss":
        return "SCSS/SASS";
      case "tailwind":
        return "Tailwind CSS";
      default:
        // This should never happen with our defined type, but handle it just in case
        return String(format).toUpperCase();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <div>
          <h3 className="text-lg font-semibold">Export Code</h3>
          <p className="text-sm text-gray-500">
            Choose your preferred format and copy or download the generated code
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Tabs
            value={exportFormat}
            onValueChange={onExportFormatChange}
            className="w-full sm:w-auto"
          >
            <TabsList
              className={
                isMobile
                  ? "grid grid-cols-3 w-full"
                  : "bg-white dark:bg-gray-900 p-1 border"
              }
            >
              <TabsTrigger
                value="css"
                className={`${getTabClass(exportFormat === "css")} px-3 py-1.5`}
              >
                <Code className="h-4 w-4 mr-1.5" />
                CSS
              </TabsTrigger>
              <TabsTrigger
                value="scss"
                className={`${getTabClass(
                  exportFormat === "scss"
                )} px-3 py-1.5`}
              >
                <Terminal className="h-4 w-4 mr-1.5" />
                SCSS
              </TabsTrigger>
              <TabsTrigger
                value="tailwind"
                className={`${getTabClass(
                  exportFormat === "tailwind"
                )} px-3 py-1.5`}
              >
                <svg
                  className="h-4 w-4 mr-1.5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12.001,4.8c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624 C13.666,10.618,15.027,12,18.001,12c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624 C16.337,6.182,14.976,4.8,12.001,4.8z M6.001,12c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624 c1.177,1.194,2.538,2.576,5.512,2.576c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624 C10.337,13.382,8.976,12,6.001,12z" />
                </svg>
                Tailwind
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <Card className="relative overflow-hidden border-2 border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
        <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-850 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <span className="font-mono text-xs font-medium py-1 px-2 rounded bg-gray-200 dark:bg-gray-700">
              {getFormatDisplayName(exportFormat)}
            </span>
            <span className="text-xs text-gray-500 ml-3 hidden sm:inline-block">
              {exportFormat === "css"
                ? "style.css"
                : exportFormat === "scss"
                ? "_grid.scss"
                : "grid.html"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadCode}
                    className="h-8 px-2 bg-white dark:bg-gray-800"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Download</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Download as{" "}
                  {exportFormat === "css"
                    ? ".css"
                    : exportFormat === "scss"
                    ? ".scss"
                    : ".html"}{" "}
                  file
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyCode}
                    className="h-8 px-2 bg-white dark:bg-gray-800"
                  >
                    {copied ? (
                      <CheckIcon className="h-4 w-4 mr-1 text-green-500" />
                    ) : (
                      <CopyIcon className="h-4 w-4 mr-1" />
                    )}
                    <span className="hidden sm:inline">
                      {copied ? "Copied" : "Copy"}
                    </span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {copied ? "Copied to clipboard!" : "Copy to clipboard"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <pre
          ref={codeRef}
          className="p-4 rounded-b-lg bg-gray-950 text-gray-50 font-mono text-sm overflow-auto max-h-[500px] whitespace-pre"
        >
          <code>{generatedCode}</code>
        </pre>
      </Card>

      <div className="mt-6">
        <div className="flex items-center mb-3">
          <h4 className="text-sm font-medium mr-2">Format Details:</h4>
          <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-medium">
            {getFormatDisplayName(exportFormat)}
          </span>
        </div>

        <Card className="p-4">
          {exportFormat === "css" && (
            <div className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
              <p className="mb-2">
                This CSS code can be added directly to your stylesheet and
                includes:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Grid container setup with all defined properties</li>
                <li>Named grid areas with appropriate selectors</li>
                <li>Media queries for responsive breakpoints</li>
              </ul>

              <Separator className="my-3" />

              <div className="flex items-center pt-1">
                <span className="text-xs text-gray-500">
                  Implementation example:
                </span>
                <a
                  href="https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout/Basic_concepts_of_grid_layout"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-500 flex items-center ml-auto"
                >
                  CSS Grid Documentation
                  <ExternalLink className="h-3 w-3 ml-0.5" />
                </a>
              </div>
            </div>
          )}

          {exportFormat === "scss" && (
            <div className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
              <p className="mb-2">
                This SCSS code includes reusable mixins that you can include in
                your Sass stylesheet:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>
                  <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">
                    @mixin grid-container
                  </code>
                  <span className="ml-1">- Main grid container styles</span>
                </li>
                <li>
                  <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">
                    @mixin grid-areas
                  </code>
                  <span className="ml-1">- Named grid area selectors</span>
                </li>
                <li>
                  <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">
                    @mixin grid-[breakpoint]
                  </code>
                  <span className="ml-1">
                    - Responsive styles for each breakpoint
                  </span>
                </li>
              </ul>

              <Separator className="my-3" />

              <div className="pt-1 flex items-center">
                <span className="text-xs text-gray-500">
                  Usage instruction included in the code
                </span>
                <a
                  href="https://sass-lang.com/documentation/at-rules/mixin/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-500 flex items-center ml-auto"
                >
                  Sass Mixins Documentation
                  <ExternalLink className="h-3 w-3 ml-0.5" />
                </a>
              </div>
            </div>
          )}

          {exportFormat === "tailwind" && (
            <div className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
              <p className="mb-2">
                This code shows how to implement your grid using Tailwind CSS
                utility classes:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Uses standard Tailwind grid classes where possible</li>
                <li>
                  Uses custom values with bracket notation for non-standard
                  sizes
                </li>
                <li>Includes responsive variants for your breakpoints</li>
                <li>Ready to paste directly into your HTML</li>
              </ul>

              <Separator className="my-3" />

              <div className="pt-1 flex items-center">
                <span className="text-xs text-gray-500">
                  Compatible with Tailwind CSS v3.x
                </span>
                <a
                  href="https://tailwindcss.com/docs/grid-template-columns"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-500 flex items-center ml-auto"
                >
                  Tailwind Grid Documentation
                  <ExternalLink className="h-3 w-3 ml-0.5" />
                </a>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
