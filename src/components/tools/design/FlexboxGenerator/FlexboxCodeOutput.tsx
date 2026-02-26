import React, { FC, useState, lazy, Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExportFormat } from "./types";
import { toast } from "sonner";

// Lazy load the syntax highlighter only when needed
const LazyPrismHighlighter = lazy(() =>
  import("react-syntax-highlighter").then((module) => ({
    default: module.Prism,
  }))
);

interface FlexboxCodeOutputProps {
  cssCode: string;
  scssCode: string;
  tailwindCode: string;
  format: ExportFormat;
  onFormatChange: (format: ExportFormat) => void;
}

export const FlexboxCodeOutput: FC<FlexboxCodeOutputProps> = ({
  cssCode,
  scssCode,
  tailwindCode,
  format,
  onFormatChange,
}) => {
  const [isCodeTabActive, setIsCodeTabActive] = useState(false);
  const [vscDarkPlusStyle, setVscDarkPlusStyle] = useState<Record<
    string,
    React.CSSProperties
  > | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Code copied to clipboard!");
  };

  const downloadCode = (code: string, filename: string) => {
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Code downloaded!");
  };

  const getCurrentCode = () => {
    switch (format) {
      case "css":
        return cssCode;
      case "scss":
        return scssCode;
      case "tailwind":
        return tailwindCode;
      default:
        return cssCode;
    }
  };

  const getCurrentFilename = () => {
    switch (format) {
      case "css":
        return "flexbox-layout.css";
      case "scss":
        return "flexbox-layout.scss";
      case "tailwind":
        return "flexbox-layout.html";
      default:
        return "flexbox-layout.css";
    }
  };

  const getLanguage = () => {
    switch (format) {
      case "scss":
        return "scss";
      case "tailwind":
        return "html";
      default:
        return "css";
    }
  };

  // Load the style when syntax highlighter is activated
  const loadSyntaxHighlighter = async () => {
    if (!vscDarkPlusStyle) {
      const styleModule = await import(
        "react-syntax-highlighter/dist/esm/styles/prism"
      );
      setVscDarkPlusStyle(styleModule.vscDarkPlus);
    }
    setIsCodeTabActive(true);
  };

  // Component for syntax highlighted code
  const SyntaxHighlightedCode = () => (
    <Suspense
      fallback={
        <div className="p-4 bg-gray-900 text-gray-100 rounded-lg">
          <div className="animate-pulse">Loading syntax highlighter...</div>
          <pre className="mt-2 whitespace-pre-wrap font-mono text-sm">
            {getCurrentCode()}
          </pre>
        </div>
      }
    >
      <LazyPrismHighlighter
        language={getLanguage()}
        style={vscDarkPlusStyle}
        customStyle={{
          margin: 0,
          borderRadius: "0.5rem",
          fontSize: "0.875rem",
        }}
      >
        {getCurrentCode()}
      </LazyPrismHighlighter>
    </Suspense>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generated Code</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Tabs
            value={format}
            onValueChange={(value) => onFormatChange(value as ExportFormat)}
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="css">CSS</TabsTrigger>
              <TabsTrigger value="scss">SCSS</TabsTrigger>
              <TabsTrigger value="tailwind">Tailwind</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="relative">
            <div className="absolute top-2 right-2 z-10 flex gap-2">
              <Button
                onClick={() => copyToClipboard(getCurrentCode())}
                size="sm"
                variant="secondary"
              >
                Copy
              </Button>

              <Button
                onClick={() =>
                  downloadCode(getCurrentCode(), getCurrentFilename())
                }
                size="sm"
                variant="secondary"
              >
                Download
              </Button>
            </div>

            {/* Only load syntax highlighter when user interacts with code */}
            <div
              onClick={loadSyntaxHighlighter}
              onFocus={loadSyntaxHighlighter}
              className="min-h-[200px]"
            >
              {isCodeTabActive && vscDarkPlusStyle ? (
                <SyntaxHighlightedCode />
              ) : (
                <div className="p-4 bg-gray-900 text-gray-100 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors">
                  <div className="text-sm text-gray-400 mb-2">
                    Click to view syntax highlighted code
                  </div>
                  <pre className="whitespace-pre-wrap font-mono text-sm opacity-60">
                    {getCurrentCode()}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
