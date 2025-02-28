import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Upload,
  Percent,
  BarChart3,
  RefreshCw,
  AlertCircle,
  Download,
  HelpCircle,
} from "lucide-react";
// @ts-expect-error - compromise doesn't have type definitions, but it's OK to use
import nlp from "compromise";
import * as d3 from "d3";

interface KeywordResult {
  keyword: string;
  count: number;
  density: number;
}

export const KeywordDensityAnalyzer = () => {
  const [activeTab, setActiveTab] = useState<string>("paste-content");
  const [content, setContent] = useState<string>("");
  const [htmlFile, setHtmlFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [results, setResults] = useState<KeywordResult[]>([]);
  const [totalWords, setTotalWords] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [minFrequency, setMinFrequency] = useState<number>(2);
  const [minWordLength, setMinWordLength] = useState<number>(3);
  const [excludeCommonWords, setExcludeCommonWords] = useState<boolean>(true);

  const chartRef = useRef<HTMLDivElement>(null);

  // Common words to exclude (stop words)
  const commonWords = [
    "the",
    "be",
    "to",
    "of",
    "and",
    "a",
    "in",
    "that",
    "have",
    "I",
    "it",
    "for",
    "not",
    "on",
    "with",
    "he",
    "as",
    "you",
    "do",
    "at",
    "this",
    "but",
    "his",
    "by",
    "from",
    "they",
    "we",
    "say",
    "her",
    "she",
    "or",
    "an",
    "will",
    "my",
    "one",
    "all",
    "would",
    "there",
    "their",
    "what",
    "so",
    "up",
    "out",
    "if",
    "about",
    "who",
    "get",
    "which",
    "go",
    "me",
    "when",
    "make",
    "can",
    "like",
    "time",
    "no",
    "just",
    "him",
    "know",
    "take",
    "people",
    "into",
    "year",
    "your",
    "good",
    "some",
    "could",
    "them",
    "see",
    "other",
    "than",
    "then",
    "now",
    "look",
    "only",
    "come",
    "its",
    "over",
    "think",
    "also",
    "back",
    "after",
    "use",
    "two",
    "how",
    "our",
    "work",
    "first",
    "well",
    "way",
    "even",
    "new",
    "want",
    "because",
    "any",
    "these",
    "give",
    "day",
    "most",
    "us",
    "is",
    "are",
    "was",
    "were",
    "has",
    "had",
    "been",
    "being",
  ];

  // Clear form and results
  const handleClear = () => {
    setContent("");
    setHtmlFile(null);
    setResults([]);
    setTotalWords(0);
    setError(null);
  };

  // Extract text from HTML
  const extractTextFromHtml = (html: string): string => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    // Remove scripts, styles, and other non-content elements
    const scripts = doc.getElementsByTagName("script");
    const styles = doc.getElementsByTagName("style");

    for (let i = scripts.length - 1; i >= 0; i--) {
      scripts[i].parentNode?.removeChild(scripts[i]);
    }

    for (let i = styles.length - 1; i >= 0; i--) {
      styles[i].parentNode?.removeChild(styles[i]);
    }

    return doc.body.textContent || "";
  };

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.type !== "text/html" && !file.name.endsWith(".html")) {
      setError("Please upload an HTML file (.html)");
      return;
    }

    setHtmlFile(file);
    setError(null);
  };

  // Process uploaded HTML file
  const processHtmlFile = async () => {
    if (!htmlFile) {
      setError("Please upload an HTML file");
      return;
    }

    try {
      const text = await htmlFile.text();
      const extractedText = extractTextFromHtml(text);
      setContent(extractedText);
      analyzeContent(extractedText);
    } catch (err) {
      setError("Error processing HTML file. Please try again.");
      console.error(err);
    }
  };

  // Analyze content for keyword density
  const analyzeContent = (textContent: string = content) => {
    if (!textContent.trim()) {
      setError("Please enter or upload content to analyze");
      return;
    }

    setError(null);
    setAnalyzing(true);

    try {
      // Process text with compromise
      const doc = nlp(textContent);

      // Get all terms (words)
      // Exclude punctuation and whitespace
      const allText = doc.terms().out("array");
      const words = allText.filter(
        (word: string) =>
          word.length >= minWordLength &&
          /^[a-zA-Z-]+$/.test(word) &&
          (!excludeCommonWords || !commonWords.includes(word.toLowerCase()))
      );

      setTotalWords(words.length);

      // Count occurrences of each word
      const wordCounts: Record<string, number> = {};
      words.forEach((word: string) => {
        const lowerWord = word.toLowerCase();
        wordCounts[lowerWord] = (wordCounts[lowerWord] || 0) + 1;
      });

      // Create results array
      const keywordResults: KeywordResult[] = Object.entries(wordCounts)
        .filter(([, count]) => count >= minFrequency)
        .map(([keyword, count]) => ({
          keyword,
          count,
          density: (count / words.length) * 100,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 50); // Top 50 keywords

      setResults(keywordResults);

      // Update chart after state is updated
      setTimeout(() => renderChart(keywordResults), 0);
    } catch (err) {
      setError("Error analyzing content. Please try again.");
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  // Render chart using D3.js
  const renderChart = (data: KeywordResult[]) => {
    if (!chartRef.current || data.length === 0) return;

    // Clear previous chart
    d3.select(chartRef.current).selectAll("*").remove();

    // Top 15 keywords for visualization
    const chartData = data.slice(0, 15);

    // Set up dimensions
    const margin = { top: 20, right: 30, bottom: 90, left: 60 };
    const width = chartRef.current.clientWidth - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Create SVG
    const svg = d3
      .select(chartRef.current)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // X scale
    const x = d3
      .scaleBand()
      .domain(chartData.map((d) => d.keyword))
      .range([0, width])
      .padding(0.2);

    // Y scale
    const y = d3
      .scaleLinear()
      .domain([0, d3.max(chartData, (d) => d.count) || 0])
      .nice()
      .range([height, 0]);

    // Add X axis
    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end")
      .attr("font-size", "12px");

    // Add Y axis
    svg.append("g").call(d3.axisLeft(y)).attr("font-size", "12px");

    // Color scale
    const color = d3
      .scaleLinear<string>()
      .domain([0, d3.max(chartData, (d) => d.density) || 0])
      .range(["#818cf8", "#4f46e5"]);

    // Add bars
    svg
      .selectAll(".bar")
      .data(chartData)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => x(d.keyword) || 0)
      .attr("width", x.bandwidth())
      .attr("y", (d) => y(d.count))
      .attr("height", (d) => height - y(d.count))
      .attr("fill", (d) => color(d.density))
      .append("title")
      .text(
        (d) => `${d.keyword}: ${d.count} occurrences (${d.density.toFixed(2)}%)`
      );

    // Add X axis label
    svg
      .append("text")
      .attr(
        "transform",
        `translate(${width / 2}, ${height + margin.bottom - 10})`
      )
      .style("text-anchor", "middle")
      .text("Keywords")
      .attr("font-size", "14px");

    // Add Y axis label
    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - height / 2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Frequency")
      .attr("font-size", "14px");
  };

  // Generate downloadable CSV of results
  const downloadCsv = () => {
    if (results.length === 0) return;

    const csvContent = [
      "Keyword,Count,Density (%)",
      ...results.map(
        (r) => `"${r.keyword}",${r.count},${r.density.toFixed(2)}`
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "keyword-density-analysis.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Redraw chart on window resize
  useEffect(() => {
    const handleResize = () => {
      if (results.length > 0) {
        renderChart(results);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [results]);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Percent className="h-6 w-6" />
          Keyword Density Analyzer
        </CardTitle>
        <CardDescription>
          Analyze keyword frequency and distribution on a webpage to identify
          optimization opportunities
        </CardDescription>
      </CardHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="px-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="paste-content">
              <FileText className="h-4 w-4 mr-2" />
              Paste Content
            </TabsTrigger>
            <TabsTrigger value="upload-html">
              <Upload className="h-4 w-4 mr-2" />
              Upload HTML
            </TabsTrigger>
          </TabsList>
        </div>

        <CardContent className="pt-6 space-y-6">
          {/* Paste Content Tab */}
          <TabsContent value="paste-content" className="mt-0">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="content">Page Content</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Paste your website content or HTML here..."
                  className="min-h-[200px]"
                />
              </div>

              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <Button variant="outline" onClick={handleClear}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Clear
                </Button>
                <Button
                  onClick={() => analyzeContent()}
                  disabled={analyzing || !content.trim()}
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  {analyzing ? "Analyzing..." : "Analyze Content"}
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Upload HTML Tab */}
          <TabsContent value="upload-html" className="mt-0">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="html-file">Upload HTML File</Label>
                <Input
                  id="html-file"
                  type="file"
                  accept=".html"
                  onChange={handleFileUpload}
                  className="cursor-pointer"
                />
                {htmlFile && (
                  <p className="text-sm text-muted-foreground">
                    File: {htmlFile.name} ({(htmlFile.size / 1024).toFixed(2)}{" "}
                    KB)
                  </p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <Button variant="outline" onClick={handleClear}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Clear
                </Button>
                <Button
                  onClick={processHtmlFile}
                  disabled={analyzing || !htmlFile}
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  {analyzing ? "Analyzing..." : "Analyze HTML"}
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Analysis Settings */}
          <div className="pt-4 border-t">
            <h3 className="font-medium mb-3">Analysis Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="min-frequency">Min. Frequency</Label>
                <Input
                  id="min-frequency"
                  type="number"
                  min="1"
                  step="1"
                  value={minFrequency}
                  onChange={(e) =>
                    setMinFrequency(parseInt(e.target.value) || 1)
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Minimum number of occurrences
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="min-word-length">Min. Word Length</Label>
                <Input
                  id="min-word-length"
                  type="number"
                  min="1"
                  step="1"
                  value={minWordLength}
                  onChange={(e) =>
                    setMinWordLength(parseInt(e.target.value) || 1)
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Minimum characters per word
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="exclude-common">Common Words</Label>
                <div className="flex items-center pt-2">
                  <input
                    id="exclude-common"
                    type="checkbox"
                    checked={excludeCommonWords}
                    onChange={(e) => setExcludeCommonWords(e.target.checked)}
                    className="mr-2 h-4 w-4"
                  />
                  <label htmlFor="exclude-common" className="text-sm">
                    Exclude common words (the, and, etc.)
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              {error}
            </div>
          )}

          {/* Results */}
          {results.length > 0 && (
            <div className="space-y-6 pt-4">
              <div className="bg-muted rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium text-lg">Analysis Results</h3>
                  <Button variant="outline" size="sm" onClick={downloadCsv}>
                    <Download className="h-4 w-4 mr-2" />
                    Download CSV
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-background rounded-md p-3">
                    <p className="text-sm text-muted-foreground">Total Words</p>
                    <p className="text-2xl font-semibold">
                      {totalWords.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-background rounded-md p-3">
                    <p className="text-sm text-muted-foreground">
                      Unique Keywords
                    </p>
                    <p className="text-2xl font-semibold">
                      {results.length.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Keyword Density Chart */}
                <div className="mb-6">
                  <h4 className="font-medium mb-2">Keyword Frequency Chart</h4>
                  <div ref={chartRef} className="w-full h-[400px]"></div>
                </div>

                {/* Keyword Table */}
                <div>
                  <h4 className="font-medium mb-2">Keyword Density Table</h4>
                  <div className="border rounded-md overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-muted">
                          <tr>
                            <th className="px-4 py-2 text-left text-sm font-medium">
                              Keyword
                            </th>
                            <th className="px-4 py-2 text-left text-sm font-medium">
                              Count
                            </th>
                            <th className="px-4 py-2 text-left text-sm font-medium">
                              Density
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {results.map((result, index) => (
                            <tr
                              key={index}
                              className={
                                index % 2 === 0
                                  ? "bg-background"
                                  : "bg-muted/30"
                              }
                            >
                              <td className="px-4 py-2 text-sm">
                                {result.keyword}
                              </td>
                              <td className="px-4 py-2 text-sm">
                                {result.count}
                              </td>
                              <td className="px-4 py-2 text-sm">
                                {result.density.toFixed(2)}%
                                {result.density > 5 && (
                                  <span className="ml-2 text-yellow-500 text-xs">
                                    High
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              {/* SEO Insights */}
              <div className="bg-muted rounded-lg p-4">
                <h3 className="font-medium text-lg flex items-center gap-2 mb-4">
                  <HelpCircle className="h-5 w-5" />
                  SEO Insights
                </h3>

                <div className="space-y-3">
                  {results.some((r) => r.density > 5) && (
                    <div className="p-3 bg-yellow-50 text-yellow-800 rounded-md text-sm">
                      <p className="font-medium">
                        Potential Keyword Stuffing Detected
                      </p>
                      <p className="mt-1">
                        Some keywords appear with high frequency (over 5%
                        density). This could be seen as keyword stuffing by
                        search engines.
                      </p>
                    </div>
                  )}

                  <div className="p-3 bg-background rounded-md text-sm">
                    <p className="font-medium">Optimal Keyword Density</p>
                    <p className="mt-1">
                      For most content, aim for main keywords to have a density
                      between 0.5% and 2.5%. Focus on natural language and
                      readability rather than specific density targets.
                    </p>
                  </div>

                  <div className="p-3 bg-background rounded-md text-sm">
                    <p className="font-medium">Content Balance</p>
                    <p className="mt-1">
                      A good distribution of keywords indicates naturally
                      written content. Ensure your content covers related terms
                      and semantic variations, not just exact keywords.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Tabs>

      <CardFooter className="flex flex-col space-y-4">
        <div className="bg-muted p-4 rounded-lg w-full">
          <h3 className="font-semibold mb-2">How to use this tool</h3>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-4">
            <li>
              <strong>Paste Content</strong> - Copy and paste your page content
              or HTML directly into the text area
            </li>
            <li>
              <strong>Upload HTML</strong> - Upload an HTML file to analyze
              (content will be extracted automatically)
            </li>
            <li>
              Adjust analysis settings to fine-tune your results by changing
              minimum word frequency, word length, or excluding common words
            </li>
            <li>
              Review the keyword frequency chart and density table to identify
              optimization opportunities
            </li>
            <li>
              Download the results as CSV for further analysis or reporting
            </li>
          </ul>
        </div>
      </CardFooter>
    </Card>
  );
};

export default KeywordDensityAnalyzer;
