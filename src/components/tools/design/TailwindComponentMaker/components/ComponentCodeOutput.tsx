import React, { FC, useState, lazy, Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Lazy load syntax highlighter only when needed
const LazyPrismHighlighter = lazy(() =>
  import("react-syntax-highlighter").then((module) => ({
    default: module.Prism,
  }))
);

interface ComponentCodeOutputProps {
  code: string;
  language: string;
  title?: string;
}

export const ComponentCodeOutput: FC<ComponentCodeOutputProps> = ({
  code,
  language,
  title,
}) => {
  const [copied, setCopied] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [showSyntaxHighlighting, setShowSyntaxHighlighting] = useState(false);
  const [highlighterStyle, setHighlighterStyle] = useState<Record<
    string,
    React.CSSProperties
  > | null>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("Code copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy code");
    }
  };

  const loadSyntaxHighlighter = async () => {
    if (!highlighterStyle) {
      // Load the appropriate style based on theme
      const styleModule = await import(
        "react-syntax-highlighter/dist/esm/styles/prism"
      );
      setHighlighterStyle(
        theme === "dark" ? styleModule.vscDarkPlus : styleModule.vs
      );
    }
    setShowSyntaxHighlighting(true);
  };

  const SyntaxHighlightedContent = () => (
    <Suspense
      fallback={
        <div className="p-4 bg-gray-900 text-gray-100 rounded">
          <div className="animate-pulse mb-2">
            Loading syntax highlighter...
          </div>
          <pre className="whitespace-pre-wrap font-mono text-sm">{code}</pre>
        </div>
      }
    >
      <LazyPrismHighlighter
        language={language}
        style={highlighterStyle}
        customStyle={{
          margin: 0,
          borderRadius: "0.375rem",
          fontSize: "0.875rem",
        }}
        wrapLongLines
      >
        {code}
      </LazyPrismHighlighter>
    </Suspense>
  );

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title || `${language.toUpperCase()} Code`}
        </CardTitle>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? "Light" : "Dark"}
          </Button>
          <Button variant="outline" size="sm" onClick={handleCopy}>
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div
          onClick={loadSyntaxHighlighter}
          onFocus={loadSyntaxHighlighter}
          className="min-h-[200px]"
        >
          {showSyntaxHighlighting && highlighterStyle ? (
            <SyntaxHighlightedContent />
          ) : (
            <div className="p-4 bg-gray-900 text-gray-100 rounded cursor-pointer hover:bg-gray-800 transition-colors">
              <div className="text-sm text-gray-400 mb-2">
                Click to view syntax highlighted {language.toUpperCase()} code
              </div>
              <pre className="whitespace-pre-wrap font-mono text-sm opacity-60">
                {code}
              </pre>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
