import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Copy,
  RefreshCw,
  FileText,
  Book,
  Download,
  History,
  Check,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

interface FormatterOptions {
  removeExtraSpaces: boolean;
  removeEmptyLines: boolean;
  trimLines: boolean;
  removeDuplicateLines: boolean;
  sortLines: "none" | "ascending" | "descending";
  removeSpecialChars: boolean;
  convertNewlines: boolean;
  smartQuotes: boolean;
  normalizeWhitespace: boolean;
}

interface ActionHistory {
  inputText: string;
  outputText: string;
  options: FormatterOptions;
  timestamp: number;
  description: string;
}

export const TextFormatter = () => {
  const [inputText, setInputText] = useState<string>("");
  const [outputText, setOutputText] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [actionHistory, setActionHistory] = useState<ActionHistory[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [showDiff, setShowDiff] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("options");

  const [options, setOptions] = useState<FormatterOptions>({
    removeExtraSpaces: false,
    removeEmptyLines: false,
    trimLines: false,
    removeDuplicateLines: false,
    sortLines: "none",
    removeSpecialChars: false,
    convertNewlines: false,
    smartQuotes: false,
    normalizeWhitespace: false,
  });

  // Process text whenever input or options change
  useEffect(() => {
    if (inputText) {
      formatText();
    } else {
      setOutputText("");
    }
  }, [inputText, options]);

  const formatText = () => {
    if (!inputText) return;
    setIsProcessing(true);

    let formattedText = inputText;

    // Apply each selected formatting option
    if (options.removeExtraSpaces) {
      formattedText = formattedText.replace(/[ \t]+/g, " ");
    }

    if (options.removeEmptyLines) {
      formattedText = formattedText
        .split("\n")
        .filter((line) => line.trim() !== "")
        .join("\n");
    }

    if (options.trimLines) {
      formattedText = formattedText
        .split("\n")
        .map((line) => line.trim())
        .join("\n");
    }

    if (options.removeDuplicateLines) {
      const uniqueLines = new Set(formattedText.split("\n"));
      formattedText = Array.from(uniqueLines).join("\n");
    }

    if (options.sortLines !== "none") {
      const lines = formattedText.split("\n");
      if (options.sortLines === "ascending") {
        lines.sort((a, b) => a.localeCompare(b));
      } else {
        lines.sort((a, b) => b.localeCompare(a));
      }
      formattedText = lines.join("\n");
    }

    if (options.removeSpecialChars) {
      formattedText = formattedText.replace(/[^\w\s]/gi, "");
    }

    if (options.convertNewlines) {
      // Convert all types of line breaks to \n
      formattedText = formattedText.replace(/\r\n|\r/g, "\n");
    }

    if (options.smartQuotes) {
      // Convert straight quotes to curly quotes
      formattedText = formattedText
        .replace(/(^|[-\u2014\s(["])'/g, "$1\u2018") // opening singles
        .replace(/'/g, "\u2019") // closing singles & apostrophes
        .replace(/(^|[-\u2014/[(]\u2018\s])"/g, "$1\u201c") // opening doubles
        .replace(/"/g, "\u201d"); // closing doubles
    }

    if (options.normalizeWhitespace) {
      // Normalize spaces, tabs, etc
      formattedText = formattedText.replace(/\s+/g, " ").trim();
    }

    setOutputText(formattedText);
    setIsProcessing(false);

    // Only add to history if the output is different from input
    if (formattedText !== inputText) {
      const description = getOperationDescription();
      addToHistory(inputText, formattedText, options, description);
    }
  };

  const getOperationDescription = (): string => {
    const activeOptions = [];
    if (options.removeExtraSpaces) activeOptions.push("removed extra spaces");
    if (options.removeEmptyLines) activeOptions.push("removed empty lines");
    if (options.trimLines) activeOptions.push("trimmed lines");
    if (options.removeDuplicateLines)
      activeOptions.push("removed duplicate lines");
    if (options.sortLines !== "none")
      activeOptions.push(`sorted lines ${options.sortLines}`);
    if (options.removeSpecialChars)
      activeOptions.push("removed special characters");
    if (options.convertNewlines) activeOptions.push("converted newlines");
    if (options.smartQuotes) activeOptions.push("added smart quotes");
    if (options.normalizeWhitespace)
      activeOptions.push("normalized whitespace");

    return activeOptions.length > 0
      ? `${activeOptions.join(", ")}`
      : "No operations performed";
  };

  const addToHistory = (
    input: string,
    output: string,
    appliedOptions: FormatterOptions,
    description: string
  ) => {
    setActionHistory((prev) => [
      {
        inputText: input,
        outputText: output,
        options: { ...appliedOptions },
        timestamp: Date.now(),
        description,
      },
      ...prev.slice(0, 9), // Keep only 10 most recent actions
    ]);
  };

  const resetOptions = () => {
    setOptions({
      removeExtraSpaces: false,
      removeEmptyLines: false,
      trimLines: false,
      removeDuplicateLines: false,
      sortLines: "none",
      removeSpecialChars: false,
      convertNewlines: false,
      smartQuotes: false,
      normalizeWhitespace: false,
    });
  };

  const clearText = () => {
    setInputText("");
    setOutputText("");
    setCopied(false);
  };

  const copyToClipboard = () => {
    if (!outputText) return;

    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Copied to clipboard!");
  };

  const downloadOutput = () => {
    const blob = new Blob([outputText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "formatted-text.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("File downloaded successfully!");
  };

  const restoreFromHistory = (entry: ActionHistory) => {
    setInputText(entry.inputText);
    setOptions(entry.options);
    setOutputText(entry.outputText);
  };

  const handleOptionChange = (
    key: keyof FormatterOptions,
    value: boolean | string
  ) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
  };

  // Function to highlight differences between input and output for the diff view
  const renderDiff = () => {
    if (!inputText || !outputText) return null;

    // Very simple diff highlighting - not as sophisticated as a real diff algorithm
    const inputLines = inputText.split("\n");
    const outputLines = outputText.split("\n");

    return (
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <div className="font-medium text-sm mb-2">Original Text</div>
          <div className="bg-muted p-3 rounded text-sm font-mono overflow-auto max-h-[300px]">
            {inputLines.map((line, idx) => (
              <div
                key={`input-${idx}`}
                className={
                  outputLines[idx] !== line
                    ? "bg-red-100 dark:bg-red-900/20"
                    : ""
                }
              >
                {line || <span className="text-gray-400">&nbsp;</span>}
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="font-medium text-sm mb-2">Formatted Text</div>
          <div className="bg-muted p-3 rounded text-sm font-mono overflow-auto max-h-[300px]">
            {outputLines.map((line, idx) => (
              <div
                key={`output-${idx}`}
                className={
                  inputLines[idx] !== line
                    ? "bg-green-100 dark:bg-green-900/20"
                    : ""
                }
              >
                {line || <span className="text-gray-400">&nbsp;</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          <div>
            <CardTitle className="text-2xl">Text Formatter & Cleaner</CardTitle>
            <CardDescription>
              Format, clean, and organize your text with various options
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="inputText">Input Text</Label>
          <Textarea
            id="inputText"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type or paste your text here"
            className="min-h-[150px] font-mono"
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="options">Formatting Options</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="presets">Presets</TabsTrigger>
          </TabsList>

          <TabsContent value="options" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="removeExtraSpaces" className="cursor-pointer">
                    Remove extra spaces
                  </Label>
                  <Switch
                    id="removeExtraSpaces"
                    checked={options.removeExtraSpaces}
                    onCheckedChange={(checked) =>
                      handleOptionChange("removeExtraSpaces", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="removeEmptyLines" className="cursor-pointer">
                    Remove empty lines
                  </Label>
                  <Switch
                    id="removeEmptyLines"
                    checked={options.removeEmptyLines}
                    onCheckedChange={(checked) =>
                      handleOptionChange("removeEmptyLines", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="trimLines" className="cursor-pointer">
                    Trim whitespace from lines
                  </Label>
                  <Switch
                    id="trimLines"
                    checked={options.trimLines}
                    onCheckedChange={(checked) =>
                      handleOptionChange("trimLines", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="removeDuplicateLines"
                    className="cursor-pointer"
                  >
                    Remove duplicate lines
                  </Label>
                  <Switch
                    id="removeDuplicateLines"
                    checked={options.removeDuplicateLines}
                    onCheckedChange={(checked) =>
                      handleOptionChange("removeDuplicateLines", checked)
                    }
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="removeSpecialChars"
                    className="cursor-pointer"
                  >
                    Remove special characters
                  </Label>
                  <Switch
                    id="removeSpecialChars"
                    checked={options.removeSpecialChars}
                    onCheckedChange={(checked) =>
                      handleOptionChange("removeSpecialChars", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="convertNewlines" className="cursor-pointer">
                    Normalize line endings
                  </Label>
                  <Switch
                    id="convertNewlines"
                    checked={options.convertNewlines}
                    onCheckedChange={(checked) =>
                      handleOptionChange("convertNewlines", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="smartQuotes" className="cursor-pointer">
                    Convert to smart quotes
                  </Label>
                  <Switch
                    id="smartQuotes"
                    checked={options.smartQuotes}
                    onCheckedChange={(checked) =>
                      handleOptionChange("smartQuotes", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="normalizeWhitespace"
                    className="cursor-pointer"
                  >
                    Normalize all whitespace
                  </Label>
                  <Switch
                    id="normalizeWhitespace"
                    checked={options.normalizeWhitespace}
                    onCheckedChange={(checked) =>
                      handleOptionChange("normalizeWhitespace", checked)
                    }
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Label htmlFor="sortLines" className="block mb-2">
                Sort Lines
              </Label>
              <Select
                value={options.sortLines}
                onValueChange={(value) =>
                  handleOptionChange("sortLines", value)
                }
              >
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Sort options" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Don't sort</SelectItem>
                  <SelectItem value="ascending">Ascending (A-Z)</SelectItem>
                  <SelectItem value="descending">Descending (Z-A)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={resetOptions}
                disabled={
                  !Object.values(options).some(
                    (val) => val === true || val !== "none"
                  )
                }
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset Options
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDiff(!showDiff)}
                disabled={!outputText || outputText === inputText}
              >
                {showDiff ? "Hide Diff" : "Show Diff"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="history">
            {actionHistory.length > 0 ? (
              <ScrollArea className="h-[200px]">
                <div className="space-y-2">
                  {actionHistory.map((entry, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center p-2 bg-muted rounded-md hover:bg-accent cursor-pointer"
                      onClick={() => restoreFromHistory(entry)}
                    >
                      <div>
                        <div className="text-sm font-medium">
                          {entry.description}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(entry.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <History className="h-4 w-4 mr-1" />
                        Restore
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center p-4 text-muted-foreground">
                No formatting history yet. Try formatting some text!
              </div>
            )}
          </TabsContent>

          <TabsContent value="presets">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setOptions({
                    ...options,
                    removeExtraSpaces: true,
                    trimLines: true,
                    removeEmptyLines: true,
                  });
                }}
              >
                Clean Text
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  setOptions({
                    ...options,
                    removeExtraSpaces: true,
                    trimLines: true,
                    sortLines: "ascending",
                    removeDuplicateLines: true,
                  });
                }}
              >
                Organize Lines
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  setOptions({
                    ...options,
                    removeSpecialChars: true,
                    normalizeWhitespace: true,
                  });
                }}
              >
                Plain Text
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  setOptions({
                    ...options,
                    smartQuotes: true,
                    convertNewlines: true,
                    trimLines: true,
                    removeExtraSpaces: true,
                  });
                }}
              >
                Typographic Cleanup
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {showDiff && renderDiff()}

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="outputText">Formatted Text</Label>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                disabled={!outputText}
              >
                {copied ? (
                  <Check className="h-4 w-4 mr-2" />
                ) : (
                  <Copy className="h-4 w-4 mr-2" />
                )}
                {copied ? "Copied!" : "Copy"}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={downloadOutput}
                disabled={!outputText}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={clearText}
                disabled={!inputText}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            </div>
          </div>

          <Textarea
            id="outputText"
            value={outputText}
            readOnly
            placeholder="Formatted text will appear here"
            className="min-h-[150px] font-mono"
          />

          {isProcessing && (
            <div className="text-sm text-muted-foreground">Processing...</div>
          )}
        </div>

        <div className="bg-muted p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <Book className="h-5 w-5 text-primary" />
            <h3 className="font-medium">About Text Formatter</h3>
          </div>
          <div className="mt-2 space-y-1 text-sm text-muted-foreground">
            <p>
              This tool helps you clean and format text in various ways. Select
              the formatting options you need and see the results in real-time.
            </p>
            <p>
              You can remove extra spaces, trim whitespace, sort lines
              alphabetically, remove duplicate lines, and more. Useful for
              cleaning up copied text, preparing content for publishing, or
              organizing data.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
