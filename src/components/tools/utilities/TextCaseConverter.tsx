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
import { Copy, Sparkles, RefreshCw } from "lucide-react";

type CaseType =
  | "uppercase"
  | "lowercase"
  | "capitalize"
  | "title"
  | "camel"
  | "pascal"
  | "snake"
  | "kebab"
  | "constant";

export const TextCaseConverter = () => {
  const [inputText, setInputText] = useState<string>("");
  const [outputText, setOutputText] = useState<string>("");
  const [selectedCase, setSelectedCase] = useState<CaseType>("uppercase");
  const [copied, setCopied] = useState<boolean>(false);

  const convertCase = (text: string, caseType: CaseType): string => {
    if (!text) return "";

    switch (caseType) {
      case "uppercase":
        return text.toUpperCase();
      case "lowercase":
        return text.toLowerCase();
      case "capitalize":
        return text
          .toLowerCase()
          .replace(/(?:^|\s)\S/g, (match) => match.toUpperCase());
      case "title":
        return text
          .toLowerCase()
          .replace(/(?:^|\s|"|'|-|_|\.|\(|\[)(\S)/g, (match) =>
            match.toUpperCase()
          );
      case "camel":
        return text
          .toLowerCase()
          .replace(/[^a-zA-Z0-9]+(.)/g, (_, char) => char.toUpperCase())
          .replace(/^[A-Z]/, (match) => match.toLowerCase());
      case "pascal":
        return text
          .toLowerCase()
          .replace(/[^a-zA-Z0-9]+(.)/g, (_, char) => char.toUpperCase())
          .replace(/^[a-z]/, (match) => match.toUpperCase());
      case "snake":
        return text
          .toLowerCase()
          .replace(/[^a-zA-Z0-9]+/g, "_")
          .replace(/^_+|_+$/g, "");
      case "kebab":
        return text
          .toLowerCase()
          .replace(/[^a-zA-Z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");
      case "constant":
        return text
          .toUpperCase()
          .replace(/[^a-zA-Z0-9]+/g, "_")
          .replace(/^_+|_+$/g, "");
      default:
        return text;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newInput = e.target.value;
    setInputText(newInput);
    setOutputText(convertCase(newInput, selectedCase));
  };

  const handleCaseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCase = e.target.value as CaseType;
    setSelectedCase(newCase);
    setOutputText(convertCase(inputText, newCase));
  };

  const handleClear = () => {
    setInputText("");
    setOutputText("");
    setCopied(false);
  };

  const copyToClipboard = () => {
    if (!outputText) return;

    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const caseOptions: { value: CaseType; label: string; example: string }[] = [
    { value: "uppercase", label: "UPPERCASE", example: "EXAMPLE TEXT" },
    { value: "lowercase", label: "lowercase", example: "example text" },
    { value: "capitalize", label: "Capitalized", example: "Example Text" },
    {
      value: "title",
      label: "Title Case",
      example: "Example Text (with Title-Case)",
    },
    { value: "camel", label: "camelCase", example: "exampleText" },
    { value: "pascal", label: "PascalCase", example: "ExampleText" },
    { value: "snake", label: "snake_case", example: "example_text" },
    { value: "kebab", label: "kebab-case", example: "example-text" },
    { value: "constant", label: "CONSTANT_CASE", example: "EXAMPLE_TEXT" },
  ];

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Text Case Converter</CardTitle>
        <CardDescription>
          Convert text between different cases like uppercase, lowercase,
          camelCase, etc.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="inputText">Input Text</Label>
          <Textarea
            id="inputText"
            value={inputText}
            onChange={handleInputChange}
            placeholder="Type or paste your text here"
            className="min-h-[100px]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="caseType">Select Case</Label>
          <select
            id="caseType"
            value={selectedCase}
            onChange={handleCaseChange}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {caseOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="text-sm text-muted-foreground">
            Example:{" "}
            {caseOptions.find((o) => o.value === selectedCase)?.example}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="outputText">Result</Label>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                disabled={!outputText}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClear}
                disabled={!inputText}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>
          </div>
          <Textarea
            id="outputText"
            value={outputText}
            readOnly
            placeholder="Converted text will appear here"
            className="min-h-[100px]"
          />
        </div>

        {copied && (
          <div className="bg-green-100 text-green-800 p-2 rounded-md text-sm">
            Text copied to clipboard!
          </div>
        )}

        <div className="bg-muted p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="font-medium">Text Case Types</h3>
          </div>
          <div className="mt-2 space-y-1 text-sm">
            <p>
              <strong>UPPERCASE:</strong> All characters are capital letters
            </p>
            <p>
              <strong>lowercase:</strong> All characters are small letters
            </p>
            <p>
              <strong>Capitalized:</strong> First letter of each word is
              capitalized
            </p>
            <p>
              <strong>Title Case:</strong> First letter of each word is
              capitalized following title conventions
            </p>
            <p>
              <strong>camelCase:</strong> No spaces, first word starts with
              lowercase, subsequent words start with uppercase
            </p>
            <p>
              <strong>PascalCase:</strong> No spaces, each word starts with
              uppercase
            </p>
            <p>
              <strong>snake_case:</strong> Words separated by underscores, all
              lowercase
            </p>
            <p>
              <strong>kebab-case:</strong> Words separated by hyphens, all
              lowercase
            </p>
            <p>
              <strong>CONSTANT_CASE:</strong> Words separated by underscores,
              all uppercase
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
