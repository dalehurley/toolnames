import React, { forwardRef, useState, lazy, Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Lazy load syntax highlighter only when needed
const LazySyntaxHighlighter = lazy(() =>
  import("react-syntax-highlighter").then((module) => ({
    default: module.Light,
  }))
);

// Lazy load language modules
const loadLanguage = async (format: string) => {
  switch (format) {
    case "json":
      return (
        await import("react-syntax-highlighter/dist/esm/languages/hljs/json")
      ).default;
    case "xml":
      return (
        await import("react-syntax-highlighter/dist/esm/languages/hljs/xml")
      ).default;
    case "yaml":
      return (
        await import("react-syntax-highlighter/dist/esm/languages/hljs/yaml")
      ).default;
    default:
      return (
        await import(
          "react-syntax-highlighter/dist/esm/languages/hljs/plaintext"
        )
      ).default;
  }
};

interface FormatPreviewProps extends React.HTMLAttributes<HTMLDivElement> {
  content: string;
  format: string;
  title?: string;
  maxHeight?: string;
}

const FormatPreviewComponent = forwardRef<HTMLDivElement, FormatPreviewProps>(
  (
    { content, format, title = "Preview", maxHeight = "400px", ...props },
    ref
  ) => {
    const [showSyntaxHighlighting, setShowSyntaxHighlighting] = useState(false);
    const [highlighterStyle, setHighlighterStyle] = useState<Record<
      string,
      React.CSSProperties
    > | null>(null);
    const [languageLoaded, setLanguageLoaded] = useState(false);

    // Map format to language for syntax highlighting
    const getLanguageForFormat = (fmt: string): string => {
      switch (fmt.toLowerCase()) {
        case "json":
          return "json";
        case "xml":
        case "html":
          return "xml";
        case "yaml":
        case "yml":
          return "yaml";
        case "csv":
        case "txt":
        default:
          return "plaintext";
      }
    };

    const loadSyntaxHighlighter = async () => {
      if (!highlighterStyle) {
        // Load both the style and language
        const [styleModule, language] = await Promise.all([
          import("react-syntax-highlighter/dist/esm/styles/hljs"),
          loadLanguage(getLanguageForFormat(format)),
        ]);

        setHighlighterStyle(styleModule.vs2015);

        // Register the language with the highlighter
        const { Light } = await import("react-syntax-highlighter");
        Light.registerLanguage(getLanguageForFormat(format), language);
        setLanguageLoaded(true);
      }
      setShowSyntaxHighlighting(true);
    };

    const SyntaxHighlightedContent = () => {
      if (!languageLoaded || !highlighterStyle) {
        return (
          <div className="p-4 bg-gray-900 text-gray-100 rounded">
            <div className="animate-pulse mb-2">
              Loading syntax highlighter...
            </div>
            <pre className="whitespace-pre-wrap font-mono text-sm">
              {content}
            </pre>
          </div>
        );
      }

      return (
        <Suspense
          fallback={
            <div className="p-4 bg-gray-900 text-gray-100 rounded">
              <div className="animate-pulse">Loading...</div>
            </div>
          }
        >
          <LazySyntaxHighlighter
            language={getLanguageForFormat(format)}
            style={highlighterStyle}
            customStyle={{
              margin: 0,
              borderRadius: "0.375rem",
              maxHeight,
              overflow: "auto",
            }}
            wrapLongLines
          >
            {content}
          </LazySyntaxHighlighter>
        </Suspense>
      );
    };

    return (
      <Card ref={ref} {...props}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            style={{ maxHeight }}
            className="overflow-auto"
            onClick={loadSyntaxHighlighter}
            onFocus={loadSyntaxHighlighter}
          >
            {showSyntaxHighlighting ? (
              <SyntaxHighlightedContent />
            ) : (
              <div className="p-4 bg-gray-900 text-gray-100 rounded cursor-pointer hover:bg-gray-800 transition-colors">
                <div className="text-sm text-gray-400 mb-2">
                  Click to view syntax highlighted {format.toUpperCase()}
                </div>
                <pre
                  className="whitespace-pre-wrap font-mono text-sm opacity-60"
                  style={{
                    maxHeight: `calc(${maxHeight} - 2rem)`,
                    overflow: "hidden",
                  }}
                >
                  {content}
                </pre>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }
);

FormatPreviewComponent.displayName = "FormatPreview";

export const FormatPreview = FormatPreviewComponent;
