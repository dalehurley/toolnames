import React from "react";
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
import { RefreshCw, GitCompare, Book, Split, Clipboard } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

// Use Diff Match Patch library for sophisticated diff calculation
// @ts-expect-error - diff-match-patch doesn't have TypeScript definitions
import { diff_match_patch } from "diff-match-patch";

interface DiffOptions {
  ignoreCase: boolean;
  ignoreWhitespace: boolean;
  ignoreNumbers: boolean;
  ignorePunctuation: boolean;
  comparisonLevel: "character" | "word" | "line";
  viewMode: "inline" | "split";
}

interface DiffStats {
  additions: number;
  deletions: number;
  changes: number;
  totalChars: number;
  similarityPercentage: number;
}

// Define type for diffs
type DiffType = [number, string]; // [type, text] where type is -1 (deletion), 0 (equal), or 1 (addition)

export const DiffChecker = () => {
  const [leftText, setLeftText] = useState<string>("");
  const [rightText, setRightText] = useState<string>("");
  const [diffResult, setDiffResult] = useState<React.ReactElement | null>(null);
  const [diffStats, setDiffStats] = useState<DiffStats | null>(null);
  const [activeTab, setActiveTab] = useState<string>("view");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const [options, setOptions] = useState<DiffOptions>({
    ignoreCase: false,
    ignoreWhitespace: false,
    ignoreNumbers: false,
    ignorePunctuation: false,
    comparisonLevel: "character",
    viewMode: "split",
  });

  // Create an instance of the diff_match_patch
  const dmp = new diff_match_patch();

  const preprocessText = (text: string): string => {
    let processed = text;

    if (options.ignoreCase) {
      processed = processed.toLowerCase();
    }

    if (options.ignoreWhitespace) {
      processed = processed.replace(/\s+/g, "");
    }

    if (options.ignoreNumbers) {
      processed = processed.replace(/\d+/g, "");
    }

    if (options.ignorePunctuation) {
      processed = processed.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");
    }

    return processed;
  };

  useEffect(() => {
    if (leftText && rightText) {
      calculateDiff();
    } else {
      setDiffResult(null);
      setDiffStats(null);
    }
  }, [leftText, rightText, options]);

  const calculateDiff = () => {
    setIsProcessing(true);

    try {
      // Process texts according to options
      const processedLeft = preprocessText(leftText);
      const processedRight = preprocessText(rightText);

      let renderedDiff: React.ReactElement;
      let stats: DiffStats;

      switch (options.comparisonLevel) {
        case "word":
          [renderedDiff, stats] = calculateWordLevelDiff(
            leftText,
            rightText,
            processedLeft,
            processedRight
          );
          break;
        case "line":
          [renderedDiff, stats] = calculateLineLevelDiff(
            leftText,
            rightText,
            processedLeft,
            processedRight
          );
          break;
        case "character":
        default:
          [renderedDiff, stats] = calculateCharacterLevelDiff(
            leftText,
            rightText,
            processedLeft,
            processedRight
          );
          break;
      }

      setDiffResult(renderedDiff);
      setDiffStats(stats);
    } catch (error) {
      console.error("Error calculating diff:", error);
      toast.error("Failed to calculate differences. Try with smaller text.");
    } finally {
      setIsProcessing(false);
    }
  };

  const calculateCharacterLevelDiff = (
    originalLeft: string,
    originalRight: string,
    processedLeft: string,
    processedRight: string
  ): [React.ReactElement, DiffStats] => {
    // Calculate the diff
    const diffs = dmp.diff_main(processedLeft, processedRight);
    dmp.diff_cleanupSemantic(diffs);

    // Stats
    let additions = 0;
    let deletions = 0;
    const totalChars = Math.max(processedLeft.length, processedRight.length);

    // Calculate statistics
    diffs.forEach((diff: DiffType) => {
      const [type, text] = diff;
      if (type === -1) {
        // Deletion
        deletions += text.length;
      } else if (type === 1) {
        // Addition
        additions += text.length;
      }
    });

    const changes = additions + deletions;
    const similarityPercentage =
      totalChars > 0
        ? Math.round(((totalChars - changes) / totalChars) * 100)
        : 100;

    // Rendering differs based on view mode
    if (options.viewMode === "split") {
      const diffView = renderSplitView(originalLeft, originalRight, diffs);
      return [
        diffView,
        { additions, deletions, changes, totalChars, similarityPercentage },
      ];
    } else {
      return [
        renderInlineView(diffs),
        { additions, deletions, changes, totalChars, similarityPercentage },
      ];
    }
  };

  const calculateWordLevelDiff = (
    originalLeft: string,
    originalRight: string,
    processedLeft: string,
    processedRight: string
  ): [React.ReactElement, DiffStats] => {
    // Split into words
    const leftWords = originalLeft.match(/\S+|\s+/g) || [];
    const rightWords = originalRight.match(/\S+|\s+/g) || [];
    const processedLeftWords = processedLeft.match(/\S+|\s+/g) || [];
    const processedRightWords = processedRight.match(/\S+|\s+/g) || [];

    // Create a map of processed words to original words (to preserve case, etc)
    const leftMap = new Map<string, string>();
    const rightMap = new Map<string, string>();

    for (
      let i = 0;
      i < Math.min(leftWords.length, processedLeftWords.length);
      i++
    ) {
      leftMap.set(processedLeftWords[i], leftWords[i]);
    }

    for (
      let i = 0;
      i < Math.min(rightWords.length, processedRightWords.length);
      i++
    ) {
      rightMap.set(processedRightWords[i], rightWords[i]);
    }

    // Join processed words with a special character that won't appear in the text
    const processedLeftJoined = processedLeftWords.join("\u0000");
    const processedRightJoined = processedRightWords.join("\u0000");

    // Calculate diff on processed text
    const diffs = dmp.diff_main(processedLeftJoined, processedRightJoined);
    dmp.diff_cleanupSemantic(diffs);

    // Stats
    let additions = 0;
    let deletions = 0;
    const totalWords = Math.max(
      processedLeftWords.length,
      processedRightWords.length
    );

    // Calculate statistics
    diffs.forEach((diff: DiffType) => {
      const [type, text] = diff;
      const wordCount = text.split("\u0000").length - 1;

      if (type === -1) {
        // Deletion
        deletions += wordCount;
      } else if (type === 1) {
        // Addition
        additions += wordCount;
      }
    });

    const changes = additions + deletions;
    const similarityPercentage =
      totalWords > 0
        ? Math.round(((totalWords - changes) / totalWords) * 100)
        : 100;

    // Convert word-level diffs to original text
    const formattedDiffs = diffs.map(([type, text]: DiffType) => {
      const words = text.split("\u0000").filter(Boolean);
      const originalWords = words.map((word: string) => {
        if (type === -1) return leftMap.get(word) || word;
        if (type === 1) return rightMap.get(word) || word;
        return word;
      });
      return [type, originalWords.join("")] as DiffType;
    });

    // Rendering
    if (options.viewMode === "split") {
      const diffView = renderSplitView(
        originalLeft,
        originalRight,
        formattedDiffs
      );
      return [
        diffView,
        {
          additions,
          deletions,
          changes,
          totalChars: totalWords,
          similarityPercentage,
        },
      ];
    } else {
      return [
        renderInlineView(formattedDiffs),
        {
          additions,
          deletions,
          changes,
          totalChars: totalWords,
          similarityPercentage,
        },
      ];
    }
  };

  const calculateLineLevelDiff = (
    originalLeft: string,
    originalRight: string,
    processedLeft: string,
    processedRight: string
  ): [React.ReactElement, DiffStats] => {
    // Split into lines
    const leftLines = originalLeft.split("\n");
    const rightLines = originalRight.split("\n");
    const processedLeftLines = processedLeft.split("\n");
    const processedRightLines = processedRight.split("\n");

    // Convert line arrays to maps for easy lookup
    const leftMap = new Map<string, string>();
    const rightMap = new Map<string, string>();

    for (let i = 0; i < leftLines.length; i++) {
      leftMap.set(processedLeftLines[i] || "", leftLines[i]);
    }

    for (let i = 0; i < rightLines.length; i++) {
      rightMap.set(processedRightLines[i] || "", rightLines[i]);
    }

    // Join lines with a unique separator that won't be in the text
    const separator = "\u0000";
    const processedLeftJoined = processedLeftLines.join(separator);
    const processedRightJoined = processedRightLines.join(separator);

    // Calculate diff
    const diffs = dmp.diff_main(processedLeftJoined, processedRightJoined);
    dmp.diff_cleanupSemantic(diffs);

    // Stats
    let additions = 0;
    let deletions = 0;
    const totalLines = Math.max(leftLines.length, rightLines.length);

    diffs.forEach((diff: DiffType) => {
      const [type, text] = diff;
      const lineCount = text.split(separator).length - 1;

      if (type === -1) {
        // Deletion
        deletions += lineCount || 1;
      } else if (type === 1) {
        // Addition
        additions += lineCount || 1;
      }
    });

    const changes = additions + deletions;
    const similarityPercentage =
      totalLines > 0
        ? Math.round(((totalLines - changes) / totalLines) * 100)
        : 100;

    // Render line by line comparison
    const lineDiffView = renderLineDiff(
      leftLines,
      rightLines,
      processedLeftLines,
      processedRightLines
    );
    return [
      lineDiffView,
      {
        additions,
        deletions,
        changes,
        totalChars: totalLines,
        similarityPercentage,
      },
    ];
  };

  const renderSplitView = (
    _leftOriginal: string,
    _rightOriginal: string,
    diffs: DiffType[]
  ): React.ReactElement => {
    // Create HTML for left and right sides
    let leftHtml = "";
    let rightHtml = "";

    diffs.forEach((diff) => {
      const [type, text] = diff;
      const escapedText = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\n/g, "<br/>");

      if (type === 0) {
        // Same text
        leftHtml += `<span class="text-foreground">${escapedText}</span>`;
        rightHtml += `<span class="text-foreground">${escapedText}</span>`;
      } else if (type === -1) {
        // Deletion
        leftHtml += `<span class="bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300">${escapedText}</span>`;
      } else if (type === 1) {
        // Addition
        rightHtml += `<span class="bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300">${escapedText}</span>`;
      }
    });

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <div className="font-medium text-sm mb-2">Original Text</div>
          <div
            className="bg-muted p-3 rounded text-sm font-mono overflow-auto max-h-[500px]"
            dangerouslySetInnerHTML={{ __html: leftHtml }}
          />
        </div>
        <div>
          <div className="font-medium text-sm mb-2">Modified Text</div>
          <div
            className="bg-muted p-3 rounded text-sm font-mono overflow-auto max-h-[500px]"
            dangerouslySetInnerHTML={{ __html: rightHtml }}
          />
        </div>
      </div>
    );
  };

  const renderInlineView = (diffs: DiffType[]): React.ReactElement => {
    let html = "";

    diffs.forEach((diff) => {
      const [type, text] = diff;
      const escapedText = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\n/g, "<br/>");

      if (type === 0) {
        // Same text
        html += `<span class="text-foreground">${escapedText}</span>`;
      } else if (type === -1) {
        // Deletion
        html += `<span class="bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 line-through">${escapedText}</span>`;
      } else if (type === 1) {
        // Addition
        html += `<span class="bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300">${escapedText}</span>`;
      }
    });

    return (
      <div className="mt-4">
        <div className="font-medium text-sm mb-2">Inline Diff</div>
        <div
          className="bg-muted p-3 rounded text-sm font-mono overflow-auto max-h-[500px]"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    );
  };

  const renderLineDiff = (
    leftLines: string[],
    rightLines: string[],
    processedLeftLines: string[],
    processedRightLines: string[]
  ): React.ReactElement => {
    // Create a line matching algorithm
    const lineMatches: [number, number][] = [];
    const leftMatched = new Set<number>();
    const rightMatched = new Set<number>();

    // First pass: find exact matches
    for (let i = 0; i < processedLeftLines.length; i++) {
      for (let j = 0; j < processedRightLines.length; j++) {
        if (
          processedLeftLines[i] === processedRightLines[j] &&
          !leftMatched.has(i) &&
          !rightMatched.has(j)
        ) {
          lineMatches.push([i, j]);
          leftMatched.add(i);
          rightMatched.add(j);
          break;
        }
      }
    }

    // Generate line-by-line HTML
    const leftHtml = leftLines
      .map((line, i) => {
        const escapedLine = line
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");

        if (leftMatched.has(i)) {
          return `<div class="py-1">${escapedLine || "&nbsp;"}</div>`;
        } else {
          return `<div class="py-1 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300">${
            escapedLine || "&nbsp;"
          }</div>`;
        }
      })
      .join("");

    const rightHtml = rightLines
      .map((line, i) => {
        const escapedLine = line
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");

        if (rightMatched.has(i)) {
          return `<div class="py-1">${escapedLine || "&nbsp;"}</div>`;
        } else {
          return `<div class="py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300">${
            escapedLine || "&nbsp;"
          }</div>`;
        }
      })
      .join("");

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <div className="font-medium text-sm mb-2">Original Text</div>
          <div
            className="bg-muted p-3 rounded text-sm font-mono overflow-auto max-h-[500px] whitespace-pre"
            dangerouslySetInnerHTML={{ __html: leftHtml }}
          />
        </div>
        <div>
          <div className="font-medium text-sm mb-2">Modified Text</div>
          <div
            className="bg-muted p-3 rounded text-sm font-mono overflow-auto max-h-[500px] whitespace-pre"
            dangerouslySetInnerHTML={{ __html: rightHtml }}
          />
        </div>
      </div>
    );
  };

  const clearTexts = () => {
    setLeftText("");
    setRightText("");
    setDiffResult(null);
    setDiffStats(null);
  };

  const swapTexts = () => {
    const temp = leftText;
    setLeftText(rightText);
    setRightText(temp);
  };

  const copyDiffToClipboard = () => {
    // Create a text representation of the diff
    let diffText = `DIFF COMPARISON\n`;
    diffText += `Similarity: ${diffStats?.similarityPercentage}%\n`;
    diffText += `Additions: ${diffStats?.additions}, Deletions: ${diffStats?.deletions}\n\n`;
    diffText += `--- ORIGINAL TEXT ---\n${leftText}\n\n`;
    diffText += `+++ MODIFIED TEXT +++\n${rightText}\n`;

    navigator.clipboard.writeText(diffText);
    toast.success("Diff comparison has been copied to your clipboard.");
  };

  const generateSampleTexts = () => {
    const original = `This is an example text with some differences.
It has multiple lines and some words that will be changed.
Some sentences might be completely different.
And we might add or remove entire paragraphs.
This is a paragraph that will stay the same.`;

    const modified = `This is an example text with a few differences.
It has multiple lines and several words that have been modified.
This sentence is completely different from the original.
This is a paragraph that will stay the same.
Here's a completely new paragraph that wasn't in the original.`;

    setLeftText(original);
    setRightText(modified);
  };

  const handleOptionChange = (
    key: keyof DiffOptions,
    value: boolean | string
  ) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Card className="w-full max-w-5xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <GitCompare className="h-6 w-6 text-primary" />
          <div>
            <CardTitle className="text-2xl">
              Diff Checker & Comparison Tool
            </CardTitle>
            <CardDescription>
              Compare two texts and highlight the differences between them
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={generateSampleTexts}>
            Load Sample Texts
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={swapTexts}
            disabled={!leftText && !rightText}
          >
            <Split className="h-4 w-4 mr-2" />
            Swap Texts
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={clearTexts}
            disabled={!leftText && !rightText}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Clear All
          </Button>
          {diffStats && (
            <Button variant="outline" size="sm" onClick={copyDiffToClipboard}>
              <Clipboard className="h-4 w-4 mr-2" />
              Copy Diff
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="leftText">Original Text</Label>
            <Textarea
              id="leftText"
              value={leftText}
              onChange={(e) => setLeftText(e.target.value)}
              placeholder="Type or paste the original text here"
              className="min-h-[200px] font-mono"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rightText">Modified Text</Label>
            <Textarea
              id="rightText"
              value={rightText}
              onChange={(e) => setRightText(e.target.value)}
              placeholder="Type or paste the modified text here"
              className="min-h-[200px] font-mono"
            />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="view">View Options</TabsTrigger>
            <TabsTrigger value="comparison">Comparison Options</TabsTrigger>
          </TabsList>

          <TabsContent value="view" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="viewMode">View Mode</Label>
                <Select
                  value={options.viewMode}
                  onValueChange={(value) =>
                    handleOptionChange("viewMode", value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select view mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="split">Split View</SelectItem>
                    <SelectItem value="inline">Inline View</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="comparisonLevel">Comparison Level</Label>
                <Select
                  value={options.comparisonLevel}
                  onValueChange={(value) =>
                    handleOptionChange(
                      "comparisonLevel",
                      value as "character" | "word" | "line"
                    )
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select comparison level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="character">Character Level</SelectItem>
                    <SelectItem value="word">Word Level</SelectItem>
                    <SelectItem value="line">Line Level</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="comparison" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="ignoreCase"
                  checked={options.ignoreCase}
                  onCheckedChange={(checked) =>
                    handleOptionChange("ignoreCase", !!checked)
                  }
                />
                <label
                  htmlFor="ignoreCase"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Ignore case
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="ignoreWhitespace"
                  checked={options.ignoreWhitespace}
                  onCheckedChange={(checked) =>
                    handleOptionChange("ignoreWhitespace", !!checked)
                  }
                />
                <label
                  htmlFor="ignoreWhitespace"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Ignore whitespace
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="ignoreNumbers"
                  checked={options.ignoreNumbers}
                  onCheckedChange={(checked) =>
                    handleOptionChange("ignoreNumbers", !!checked)
                  }
                />
                <label
                  htmlFor="ignoreNumbers"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Ignore numbers
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="ignorePunctuation"
                  checked={options.ignorePunctuation}
                  onCheckedChange={(checked) =>
                    handleOptionChange("ignorePunctuation", !!checked)
                  }
                />
                <label
                  htmlFor="ignorePunctuation"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Ignore punctuation
                </label>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {diffStats && (
          <div className="bg-muted rounded-md p-4">
            <h3 className="font-medium mb-2">Comparison Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="bg-card rounded-md p-3 border">
                <div className="text-2xl font-bold">
                  {diffStats.similarityPercentage}%
                </div>
                <div className="text-xs text-muted-foreground">Similarity</div>
              </div>
              <div className="bg-card rounded-md p-3 border">
                <div className="text-2xl font-bold text-red-500">
                  {diffStats.deletions}
                </div>
                <div className="text-xs text-muted-foreground">Deletions</div>
              </div>
              <div className="bg-card rounded-md p-3 border">
                <div className="text-2xl font-bold text-green-500">
                  {diffStats.additions}
                </div>
                <div className="text-xs text-muted-foreground">Additions</div>
              </div>
              <div className="bg-card rounded-md p-3 border">
                <div className="text-2xl font-bold">{diffStats.changes}</div>
                <div className="text-xs text-muted-foreground">
                  Total Changes
                </div>
              </div>
            </div>
          </div>
        )}

        {isProcessing ? (
          <div className="text-center p-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-2 text-muted-foreground">
              Calculating differences...
            </p>
          </div>
        ) : diffResult ? (
          <div className="border rounded-md">{diffResult}</div>
        ) : (
          leftText &&
          rightText && (
            <div className="text-center p-8 text-muted-foreground">
              No differences found or texts are identical.
            </div>
          )
        )}

        <div className="bg-muted p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <Book className="h-5 w-5 text-primary" />
            <h3 className="font-medium">About Diff Checker</h3>
          </div>
          <div className="mt-2 space-y-1 text-sm text-muted-foreground">
            <p>
              This tool allows you to compare two texts and see the differences
              between them. It highlights additions, deletions, and changes to
              help you identify what has changed.
            </p>
            <p>
              You can choose between character-level, word-level, or line-level
              comparison, and customize what should be ignored (case,
              whitespace, etc.) to focus on the differences that matter to you.
            </p>
            <p>
              Perfect for comparing versions of documents, code snippets, or any
              text where you need to identify changes.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
