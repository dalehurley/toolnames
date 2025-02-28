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
  RefreshCw,
  AlertCircle,
  Download,
  HelpCircle,
  Layout,
  CheckCircle2,
  XCircle,
  Globe,
} from "lucide-react";
import * as d3 from "d3";
import * as cheerio from "cheerio";
import { Switch } from "@/components/ui/switch";

// Define heading node structure
interface HeadingNode {
  id: string;
  text: string;
  level: number;
  tag: string;
  children: HeadingNode[];
  hasIssue: boolean;
  issueType?: string;
}

// Define overall analysis results
interface AnalysisResult {
  headingCount: number;
  h1Count: number;
  missingH1: boolean;
  multipleH1s: boolean;
  skippedLevels: boolean;
  emptyHeadings: boolean;
  longHeadings: boolean;
  issues: Array<{
    heading: string;
    level: number;
    issue: string;
  }>;
}

export const HeadingStructureVisualizer = () => {
  const [activeTab, setActiveTab] = useState<string>("paste-content");
  const [content, setContent] = useState<string>("");
  const [url, setUrl] = useState<string>("");
  const [htmlFile, setHtmlFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [headingData, setHeadingData] = useState<HeadingNode | null>(null);
  const [flatHeadings, setFlatHeadings] = useState<
    Array<{
      text: string;
      tag: string;
      level: number;
      hasIssue: boolean;
      issueType?: string;
    }>
  >([]);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [showRecommendations, setShowRecommendations] = useState<boolean>(true);
  const [maxHeadingLength, setMaxHeadingLength] = useState<number>(70);

  const visualizationRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Clear form and results
  const handleClear = () => {
    setContent("");
    setUrl("");
    setHtmlFile(null);
    setHeadingData(null);
    setFlatHeadings([]);
    setAnalysisResults(null);
    setError(null);

    // Clear visualization
    if (visualizationRef.current) {
      d3.select(visualizationRef.current).selectAll("*").remove();
    }
  };

  // Extract headings from HTML
  const extractHeadings = (html: string) => {
    const $ = cheerio.load(html);
    const headings: Array<{ tag: string; text: string; level: number }> = [];

    // Find all heading tags and extract their text
    $("h1, h2, h3, h4, h5, h6").each((_, elem) => {
      const tag = elem.name;
      const level = parseInt(tag.substring(1));
      const text = $(elem).text().trim();

      headings.push({ tag, text, level });
    });

    return headings;
  };

  // Build hierarchical structure from flat headings list
  const buildHeadingHierarchy = (
    headings: Array<{ tag: string; text: string; level: number }>
  ): [
    HeadingNode,
    Array<{
      text: string;
      tag: string;
      level: number;
      hasIssue: boolean;
      issueType?: string;
    }>
  ] => {
    // Create root node
    const root: HeadingNode = {
      id: "root",
      text: "Page Structure",
      level: 0,
      tag: "root",
      children: [],
      hasIssue: false,
    };

    // Keep track of the current parent at each level
    const parentStack: HeadingNode[] = [root];

    // Analyze for issues
    let prevLevel = 0;
    const flatWithIssues: Array<{
      text: string;
      tag: string;
      level: number;
      hasIssue: boolean;
      issueType?: string;
    }> = [];

    headings.forEach((heading, index) => {
      const { tag, text, level } = heading;
      const id = `heading-${index}`;

      // Check for issues
      let hasIssue = false;
      let issueType = "";

      // Check for empty headings
      if (!text) {
        hasIssue = true;
        issueType = "Empty heading";
      }
      // Check for very long headings
      else if (text.length > maxHeadingLength) {
        hasIssue = true;
        issueType = "Heading too long";
      }
      // Check for skipped levels (if not first heading and skips a level)
      else if (index > 0 && level > prevLevel + 1) {
        hasIssue = true;
        issueType = `Skipped heading level (${prevLevel} to ${level})`;
      }

      // Create new heading node
      const newNode: HeadingNode = {
        id,
        text: text || "(Empty heading)",
        level,
        tag,
        children: [],
        hasIssue,
        issueType,
      };

      // Find appropriate parent for this heading
      while (
        parentStack.length > 1 &&
        parentStack[parentStack.length - 1].level >= level
      ) {
        parentStack.pop();
      }

      // Add to parent's children
      const parent = parentStack[parentStack.length - 1];
      parent.children.push(newNode);

      // Add to stack for potential children
      parentStack.push(newNode);

      // Update prev level
      prevLevel = level;

      // Add to flat list with issues
      flatWithIssues.push({
        text: text || "(Empty heading)",
        tag,
        level,
        hasIssue,
        issueType,
      });
    });

    return [root, flatWithIssues];
  };

  // Analyze heading structure for common issues
  const analyzeHeadingStructure = (
    headings: Array<{ tag: string; text: string; level: number }>
  ): AnalysisResult => {
    const h1Headings = headings.filter((h) => h.tag === "h1");
    const emptyHeadings = headings.filter((h) => !h.text.trim());
    const longHeadings = headings.filter(
      (h) => h.text.length > maxHeadingLength
    );

    // Check for skipped levels
    let skippedLevels = false;
    let prevLevel = 0;

    for (let i = 0; i < headings.length; i++) {
      const level = headings[i].level;

      // Skip the first heading check
      if (i === 0) {
        prevLevel = level;
        continue;
      }

      // If jumping more than one level (e.g. h2 to h4)
      if (level > prevLevel + 1) {
        skippedLevels = true;
        break;
      }

      prevLevel = level;
    }

    // Build issues list
    const issues: Array<{ heading: string; level: number; issue: string }> = [];

    // Multiple H1s
    if (h1Headings.length > 1) {
      for (let i = 1; i < h1Headings.length; i++) {
        issues.push({
          heading: h1Headings[i].text,
          level: 1,
          issue: "Additional H1 tag (page should have only one H1)",
        });
      }
    }

    // Missing H1
    if (h1Headings.length === 0) {
      issues.push({
        heading: "(None)",
        level: 0,
        issue:
          "Missing H1 tag (page should have exactly one H1 as the main title)",
      });
    }

    // Empty headings
    emptyHeadings.forEach((h) => {
      issues.push({
        heading: "(Empty)",
        level: h.level,
        issue: `Empty ${h.tag} tag (headings should contain text)`,
      });
    });

    // Long headings
    longHeadings.forEach((h) => {
      issues.push({
        heading: h.text.substring(0, 30) + "...",
        level: h.level,
        issue: `${h.tag} too long (${h.text.length} chars, recommended: <${maxHeadingLength})`,
      });
    });

    // Skipped levels
    if (skippedLevels) {
      for (let i = 1; i < headings.length; i++) {
        const curr = headings[i];
        const prev = headings[i - 1];

        if (curr.level > prev.level + 1) {
          issues.push({
            heading: curr.text,
            level: curr.level,
            issue: `Skipped heading level (${prev.tag} to ${curr.tag})`,
          });
        }
      }
    }

    return {
      headingCount: headings.length,
      h1Count: h1Headings.length,
      missingH1: h1Headings.length === 0,
      multipleH1s: h1Headings.length > 1,
      skippedLevels,
      emptyHeadings: emptyHeadings.length > 0,
      longHeadings: longHeadings.length > 0,
      issues,
    };
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
      setContent(text);
      analyzeContent(text);
    } catch (err) {
      setError("Error processing HTML file. Please try again.");
      console.error(err);
    }
  };

  // Fetch HTML from URL
  const fetchUrl = async () => {
    if (!url) {
      setError("Please enter a URL");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Use a CORS proxy to fetch the URL
      const corsProxy = "https://api.allorigins.win/raw?url=";
      const response = await fetch(corsProxy + encodeURIComponent(url));

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const html = await response.text();
      setContent(html);
      analyzeContent(html);
    } catch (err) {
      setError("Error fetching URL: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Analyze content for heading structure
  const analyzeContent = (htmlContent: string = content) => {
    if (!htmlContent.trim()) {
      setError("Please enter or upload HTML content to analyze");
      setAnalyzing(false);
      return;
    }

    setError(null);
    setAnalyzing(true);

    try {
      // Extract headings from HTML
      const headings = extractHeadings(htmlContent);

      if (headings.length === 0) {
        setError("No headings found in the provided content");
        setAnalyzing(false);
        return;
      }

      // Build heading hierarchy
      const [hierarchyRoot, flatWithIssues] = buildHeadingHierarchy(headings);

      // Analyze for issues
      const results = analyzeHeadingStructure(headings);

      // Update state
      setHeadingData(hierarchyRoot);
      setFlatHeadings(flatWithIssues);
      setAnalysisResults(results);

      // Render visualization
      setTimeout(() => renderVisualization(hierarchyRoot), 0);
    } catch (err) {
      setError("Error analyzing content. Please try again.");
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  // Render D3 visualization of heading structure
  const renderVisualization = (data: HeadingNode) => {
    if (!visualizationRef.current) return;

    // Clear previous visualization
    d3.select(visualizationRef.current).selectAll("*").remove();

    // Set up dimensions
    const margin = { top: 40, right: 120, bottom: 40, left: 120 };
    const width =
      visualizationRef.current.clientWidth - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    // Create SVG
    const svg = d3
      .select(visualizationRef.current)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    svgRef.current = svg.node() as SVGSVGElement;

    // Create hierarchical layout
    const root = d3.hierarchy<HeadingNode>(data);

    // Tree layout
    const treeLayout = d3.tree<HeadingNode>().size([height, width]);

    // Apply layout
    const treeData = treeLayout(root);

    // Color scale for heading levels
    const colorScale = d3
      .scaleOrdinal<string>()
      .domain(["h1", "h2", "h3", "h4", "h5", "h6"])
      .range([
        "#f43f5e",
        "#3b82f6",
        "#10b981",
        "#f59e0b",
        "#8b5cf6",
        "#6b7280",
      ]);

    // Add links between nodes
    svg
      .selectAll(".link")
      .data(treeData.links())
      .enter()
      .append("path")
      .attr("class", "link")
      .attr(
        "d",
        d3
          .linkHorizontal<
            d3.HierarchyPointLink<HeadingNode>,
            d3.HierarchyPointNode<HeadingNode>
          >()
          .x((d) => d.y)
          .y((d) => d.x)
      )
      .attr("fill", "none")
      .attr("stroke", "#d1d5db")
      .attr("stroke-width", 1.5);

    // Create node groups
    const nodes = svg
      .selectAll(".node")
      .data(treeData.descendants())
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", (d) => `translate(${d.y},${d.x})`)
      .attr("data-heading-id", (d) => d.data.id);

    // Add circles for nodes
    nodes
      .append("circle")
      .attr("r", (d) => (d.data.tag === "root" ? 8 : 6))
      .attr("fill", (d) => {
        if (d.data.tag === "root") return "#64748b";
        return d.data.hasIssue ? "#ef4444" : colorScale(d.data.tag);
      })
      .attr("stroke", (d) => (d.data.hasIssue ? "#ef4444" : "white"))
      .attr("stroke-width", 2);

    // Add node labels
    nodes
      .append("text")
      .attr("dy", (d) => (d.children ? "-1.2em" : "0.3em"))
      .attr("x", (d) => (d.children ? 0 : 10))
      .attr("text-anchor", (d) => (d.children ? "middle" : "start"))
      .text((d) => {
        const text = d.data.text;
        return text.length > 25 ? text.substring(0, 25) + "..." : text;
      })
      .style("font-size", "12px")
      .style("font-weight", (d) => (d.data.tag === "h1" ? "bold" : "normal"))
      .style("fill", (d) => (d.data.hasIssue ? "#ef4444" : "#374151"));

    // Add tag labels
    nodes
      .append("text")
      .attr("dy", "1.8em")
      .attr("x", (d) => (d.children ? 0 : 10))
      .attr("text-anchor", (d) => (d.children ? "middle" : "start"))
      .text((d) => (d.data.tag === "root" ? "" : d.data.tag))
      .style("font-size", "10px")
      .style("fill", (d) => (d.data.hasIssue ? "#ef4444" : "#6b7280"));

    // Add issue markers
    nodes
      .filter((d) => d.data.hasIssue)
      .append("text")
      .attr("dy", "-1.2em")
      .attr("x", (d) => (d.children ? 15 : 10))
      .attr("text-anchor", "start")
      .text("⚠")
      .style("font-size", "14px")
      .style("fill", "#ef4444")
      .append("title")
      .text((d) => d.data.issueType || "Issue detected");
  };

  // Generate downloadable visualization
  const downloadVisualization = () => {
    if (!visualizationRef.current || !svgRef.current) return;

    try {
      // Get SVG element
      const svgElement = visualizationRef.current.querySelector("svg");
      if (!svgElement) return;

      // Clone the SVG to avoid modifying the displayed one
      const svgClone = svgElement.cloneNode(true) as SVGElement;

      // Serialize SVG
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svgClone);

      // Create blob
      const blob = new Blob([svgString], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);

      // Create download link
      const link = document.createElement("a");
      link.href = url;
      link.download = "heading-structure.svg";
      document.body.appendChild(link);
      link.click();

      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading visualization:", err);
      setError("Error downloading visualization. Please try again.");
    }
  };

  // Generate downloadable JSON report
  const downloadJsonReport = () => {
    if (!headingData || !analysisResults) return;

    try {
      const reportData = {
        analysisResults,
        headingStructure: headingData,
        flatHeadings,
        timestamp: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(reportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "heading-structure-report.json";
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading report:", err);
      setError("Error downloading report. Please try again.");
    }
  };

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (headingData) {
        renderVisualization(headingData);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [headingData]);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Layout className="h-6 w-6" />
          Heading Structure Visualizer
        </CardTitle>
        <CardDescription>
          Analyze heading hierarchy (H1-H6) to ensure proper semantic
          organization and identify structural issues
        </CardDescription>
      </CardHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="px-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="url-input">
              <Globe className="h-4 w-4 mr-2" />
              URL
            </TabsTrigger>
            <TabsTrigger value="paste-content">
              <FileText className="h-4 w-4 mr-2" />
              Paste HTML
            </TabsTrigger>
            <TabsTrigger value="upload-html">
              <Upload className="h-4 w-4 mr-2" />
              Upload File
            </TabsTrigger>
          </TabsList>
        </div>

        <CardContent className="pt-6 space-y-6">
          {/* URL Input Tab */}
          <TabsContent value="url-input" className="mt-0">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="url">URL to Analyze</Label>
                <div className="flex gap-2">
                  <Input
                    id="url"
                    placeholder="https://example.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                  <Button
                    onClick={fetchUrl}
                    disabled={loading}
                    className="whitespace-nowrap"
                  >
                    {loading ? (
                      "Loading..."
                    ) : (
                      <>
                        <Globe className="mr-2 h-4 w-4" />
                        Fetch URL
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Enter a website URL to analyze its heading structure.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <Button variant="outline" onClick={handleClear}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Clear
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Paste Content Tab */}
          <TabsContent value="paste-content" className="mt-0">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="content">HTML Content</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Paste your HTML content here..."
                  className="min-h-[200px] font-mono text-sm"
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
                  <Layout className="mr-2 h-4 w-4" />
                  {analyzing ? "Analyzing..." : "Analyze Structure"}
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
                  <Layout className="mr-2 h-4 w-4" />
                  {analyzing ? "Analyzing..." : "Analyze Structure"}
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Analysis Settings */}
          <div className="pt-4 border-t">
            <h3 className="font-medium mb-3">Analysis Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="max-heading-length">Max Heading Length</Label>
                <Input
                  id="max-heading-length"
                  type="number"
                  min="10"
                  step="5"
                  value={maxHeadingLength}
                  onChange={(e) =>
                    setMaxHeadingLength(parseInt(e.target.value) || 70)
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Maximum recommended heading length in characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="show-recommendations">Recommendations</Label>
                <div className="flex items-center space-x-2 pt-2">
                  <Switch
                    id="show-recommendations"
                    checked={showRecommendations}
                    onCheckedChange={setShowRecommendations}
                  />
                  <Label htmlFor="show-recommendations" className="text-sm">
                    Show recommendations and best practices
                  </Label>
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
          {headingData && (
            <div className="space-y-6 pt-4">
              {/* Source Info */}
              {url && (
                <div className="bg-muted p-3 rounded-md text-sm flex items-center">
                  <Globe className="h-4 w-4 mr-2" />
                  <span className="font-medium mr-2">Source:</span>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline truncate"
                  >
                    {url}
                  </a>
                </div>
              )}

              {/* Heading Structure Visualization */}
              <div className="bg-muted rounded-lg p-4">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-medium text-lg">
                    Heading Structure Visualization
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadVisualization}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download SVG
                  </Button>
                </div>

                <div
                  ref={visualizationRef}
                  className="w-full h-[600px] bg-white rounded-md overflow-auto border"
                ></div>

                <div className="mt-4 text-sm text-muted-foreground">
                  <p>
                    The visualization above shows the hierarchical structure of
                    your headings. Red nodes indicate potential issues.
                  </p>
                  <div className="flex flex-wrap gap-3 mt-2 items-center">
                    <span className="font-medium">Legend:</span>
                    {["h1", "h2", "h3", "h4", "h5", "h6"].map((tag) => (
                      <div key={tag} className="flex items-center">
                        <div
                          className="w-3 h-3 rounded-full mr-1"
                          style={{
                            backgroundColor:
                              tag === "h1"
                                ? "#f43f5e"
                                : tag === "h2"
                                ? "#3b82f6"
                                : tag === "h3"
                                ? "#10b981"
                                : tag === "h4"
                                ? "#f59e0b"
                                : tag === "h5"
                                ? "#8b5cf6"
                                : "#6b7280",
                          }}
                        ></div>
                        <span>{tag}</span>
                      </div>
                    ))}
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-1 bg-red-500"></div>
                      <span>Issue detected</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Analysis Summary */}
              {analysisResults && (
                <div className="bg-muted rounded-lg p-4">
                  <h3 className="font-medium text-lg mb-4">Analysis Summary</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-background rounded-md p-3">
                      <p className="text-sm text-muted-foreground">
                        Total Headings
                      </p>
                      <p className="text-2xl font-semibold">
                        {analysisResults.headingCount}
                      </p>
                    </div>
                    <div className="bg-background rounded-md p-3">
                      <p className="text-sm text-muted-foreground">H1 Tags</p>
                      <p className="text-2xl font-semibold flex items-center">
                        {analysisResults.h1Count}
                        {analysisResults.h1Count === 1 ? (
                          <CheckCircle2 className="ml-2 h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="ml-2 h-5 w-5 text-red-500" />
                        )}
                      </p>
                    </div>
                    <div className="bg-background rounded-md p-3">
                      <p className="text-sm text-muted-foreground">
                        Issues Found
                      </p>
                      <p className="text-2xl font-semibold flex items-center">
                        {analysisResults.issues.length}
                        {analysisResults.issues.length === 0 ? (
                          <CheckCircle2 className="ml-2 h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="ml-2 h-5 w-5 text-red-500" />
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Issue Details */}
                  {analysisResults.issues.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Detected Issues</h4>
                      <div className="border rounded-md overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-muted">
                              <tr>
                                <th className="px-4 py-2 text-left text-sm font-medium">
                                  Heading
                                </th>
                                <th className="px-4 py-2 text-left text-sm font-medium">
                                  Level
                                </th>
                                <th className="px-4 py-2 text-left text-sm font-medium">
                                  Issue
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y">
                              {analysisResults.issues.map((issue, index) => (
                                <tr
                                  key={index}
                                  className={
                                    index % 2 === 0
                                      ? "bg-background"
                                      : "bg-muted/30"
                                  }
                                >
                                  <td className="px-4 py-2 text-sm">
                                    {issue.heading}
                                  </td>
                                  <td className="px-4 py-2 text-sm">
                                    {issue.level > 0
                                      ? `H${issue.level}`
                                      : "N/A"}
                                  </td>
                                  <td className="px-4 py-2 text-sm">
                                    {issue.issue}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* All Headings Table */}
                  <div>
                    <h4 className="font-medium mb-2">All Headings</h4>
                    <div className="border rounded-md overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-muted">
                            <tr>
                              <th className="px-4 py-2 text-left text-sm font-medium">
                                Heading Text
                              </th>
                              <th className="px-4 py-2 text-left text-sm font-medium">
                                Tag
                              </th>
                              <th className="px-4 py-2 text-left text-sm font-medium">
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {flatHeadings.map((heading, index) => (
                              <tr
                                key={index}
                                className={
                                  index % 2 === 0
                                    ? "bg-background"
                                    : "bg-muted/30"
                                }
                              >
                                <td className="px-4 py-2 text-sm">
                                  {heading.text}
                                </td>
                                <td className="px-4 py-2 text-sm">
                                  {heading.tag}
                                </td>
                                <td className="px-4 py-2 text-sm">
                                  {heading.hasIssue ? (
                                    <div className="flex items-center text-red-500">
                                      <XCircle className="h-4 w-4 mr-1" />
                                      <span>{heading.issueType}</span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center text-green-500">
                                      <CheckCircle2 className="h-4 w-4 mr-1" />
                                      <span>Ok</span>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={downloadJsonReport}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Report
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* SEO Recommendations */}
              {showRecommendations && (
                <div className="bg-muted rounded-lg p-4">
                  <h3 className="font-medium text-lg flex items-center gap-2 mb-4">
                    <HelpCircle className="h-5 w-5" />
                    SEO Heading Structure Best Practices
                  </h3>

                  <div className="space-y-3">
                    <div className="p-3 bg-background rounded-md text-sm">
                      <p className="font-medium">Use a single H1 tag</p>
                      <p className="mt-1">
                        Each page should have exactly one H1 tag that describes
                        the main purpose of the page. Multiple H1 tags can
                        confuse search engines about the primary topic of your
                        page.
                      </p>
                    </div>

                    <div className="p-3 bg-background rounded-md text-sm">
                      <p className="font-medium">
                        Maintain proper heading hierarchy
                      </p>
                      <p className="mt-1">
                        Headings should follow a logical hierarchy without
                        skipping levels (e.g., don't jump from H2 to H4). This
                        helps both search engines and users understand the
                        structure and relationships between sections.
                      </p>
                    </div>

                    <div className="p-3 bg-background rounded-md text-sm">
                      <p className="font-medium">Keep headings concise</p>
                      <p className="mt-1">
                        Headings should be clear and descriptive but relatively
                        short (under 70 characters). Longer headings dilute the
                        focus and are less effective for both SEO and user
                        experience.
                      </p>
                    </div>

                    <div className="p-3 bg-background rounded-md text-sm">
                      <p className="font-medium">Include keywords naturally</p>
                      <p className="mt-1">
                        Incorporate relevant keywords in your headings,
                        especially H1 and H2, but keep them natural and
                        reader-friendly. Avoid keyword stuffing as it can
                        trigger search engine penalties.
                      </p>
                    </div>

                    <div className="p-3 bg-background rounded-md text-sm">
                      <p className="font-medium">
                        Use headings for structure, not styling
                      </p>
                      <p className="mt-1">
                        Heading tags should be used to indicate content
                        structure, not for visual styling purposes. Use CSS for
                        styling text that doesn't represent a section heading.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Tabs>

      <CardFooter className="flex flex-col space-y-4">
        <div className="bg-muted p-4 rounded-lg w-full">
          <h3 className="font-semibold mb-2">How to use this tool</h3>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-4">
            <li>
              <strong>Enter a URL</strong> - Analyze heading structure directly
              from any website URL
            </li>
            <li>
              <strong>Paste HTML</strong> - Copy and paste your web page's HTML
              content for analysis
            </li>
            <li>
              <strong>Upload HTML</strong> - Upload an HTML file from your
              computer
            </li>
            <li>
              Review the visualization to understand your page's heading
              structure and see how well headings are organized
            </li>
            <li>
              Check the analysis summary for common issues like missing H1 tags,
              multiple H1s, or skipped heading levels
            </li>
            <li>
              Use the recommendations to improve your page's semantic structure
              and SEO
            </li>
          </ul>
        </div>
      </CardFooter>
    </Card>
  );
};

export default HeadingStructureVisualizer;
