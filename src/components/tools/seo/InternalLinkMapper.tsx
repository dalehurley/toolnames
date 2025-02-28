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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Network,
  RefreshCw,
  AlertCircle,
  Download,
  Link as LinkIcon,
  ExternalLink,
} from "lucide-react";
import * as cheerio from "cheerio";
import cytoscape from "cytoscape";
import coseBilkent from "cytoscape-cose-bilkent";
import { Switch } from "@/components/ui/switch";

// Register the layout
cytoscape.use(coseBilkent);

interface PageNode {
  id: string;
  url: string;
  title: string;
  incomingLinks: number;
  outgoingLinks: number;
}

interface LinkEdge {
  source: string;
  target: string;
  label: string;
}

interface AnalysisResult {
  nodes: PageNode[];
  edges: LinkEdge[];
  stats: {
    totalPages: number;
    totalLinks: number;
    averageLinksPerPage: number;
    orphanedPages: PageNode[];
    mostLinkedPages: PageNode[];
    deadEndPages: PageNode[];
  };
}

// Update the layout options type
type CoseBilkentLayout = {
  name: string;
  animate?: boolean;
  animationDuration?: number;
  idealEdgeLength?: number;
  nodeRepulsion?: number;
  randomize?: boolean;
  nodeDimensionsIncludeLabels?: boolean;
};

const processHtmlContent = (html: string, baseUrl: string) => {
  const $ = cheerio.load(html);
  const title = $("title").text() || baseUrl;
  const links = new Set<string>();

  $("a[href]").each((_, element) => {
    const href = $(element).attr("href");
    if (href) {
      try {
        const url = new URL(href, baseUrl);
        if (url.protocol === "http:" || url.protocol === "https:") {
          links.add(url.href);
        }
      } catch {
        // Skip invalid URLs
      }
    }
  });

  return { links: Array.from(links), title };
};

export const InternalLinkMapper = () => {
  const [activeTab, setActiveTab] = useState<string>("input");
  const [url, setUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [filterOrphaned, setFilterOrphaned] = useState<boolean>(false);
  const [layoutType, setLayoutType] = useState<string>("cose-bilkent");
  const [crawlDepth, setCrawlDepth] = useState<number>(2);
  const [maxPages, setMaxPages] = useState<number>(50);

  const graphRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);

  // Add crawling functionality
  const crawlPage = async (
    pageUrl: string,
    depth: number,
    visited: Set<string>
  ): Promise<Map<string, { content: string; title: string }>> => {
    const pages = new Map<string, { content: string; title: string }>();

    if (depth < 0 || visited.has(pageUrl) || visited.size >= maxPages) {
      return pages;
    }

    visited.add(pageUrl);

    try {
      const corsProxy = "https://api.allorigins.win/raw?url=";
      const response = await fetch(corsProxy + encodeURIComponent(pageUrl));

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const html = await response.text();
      const { links, title } = processHtmlContent(html, pageUrl);
      pages.set(pageUrl, { content: html, title });

      // Recursively crawl linked pages
      for (const link of links) {
        if (!visited.has(link)) {
          const subPages = await crawlPage(link, depth - 1, visited);
          subPages.forEach((value, key) => pages.set(key, value));
        }
      }
    } catch (error) {
      console.warn(`Error crawling ${pageUrl}:`, error);
    }

    return pages;
  };

  // Analyze the link structure
  const analyzeStructure = async () => {
    if (!url) {
      setError("Please enter a URL to analyze");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const visited = new Set<string>();
      const pages = await crawlPage(url, crawlDepth, visited);

      // Build graph structure
      const nodes: PageNode[] = [];
      const edges: LinkEdge[] = [];
      const linkCounts = new Map<string, { in: number; out: number }>();

      // Initialize link counts
      pages.forEach((_, pageUrl) => {
        linkCounts.set(pageUrl, { in: 0, out: 0 });
      });

      // Process links and build edges
      pages.forEach((page, sourceUrl) => {
        const { links } = processHtmlContent(page.content, sourceUrl);

        links.forEach((targetUrl) => {
          if (pages.has(targetUrl)) {
            edges.push({
              source: sourceUrl,
              target: targetUrl,
              label: "links to",
            });

            // Update link counts
            const sourceCounts = linkCounts.get(sourceUrl)!;
            const targetCounts = linkCounts.get(targetUrl)!;
            sourceCounts.out++;
            targetCounts.in++;
          }
        });
      });

      // Create nodes with link counts
      pages.forEach((page, url) => {
        const counts = linkCounts.get(url)!;
        nodes.push({
          id: url,
          url,
          title: page.title,
          incomingLinks: counts.in,
          outgoingLinks: counts.out,
        });
      });

      // Calculate statistics
      const orphanedPages = nodes.filter((node) => node.incomingLinks === 0);
      const deadEndPages = nodes.filter((node) => node.outgoingLinks === 0);
      const mostLinkedPages = [...nodes]
        .sort((a, b) => b.incomingLinks - a.incomingLinks)
        .slice(0, 5);

      const result: AnalysisResult = {
        nodes,
        edges,
        stats: {
          totalPages: nodes.length,
          totalLinks: edges.length,
          averageLinksPerPage: edges.length / nodes.length,
          orphanedPages,
          mostLinkedPages,
          deadEndPages,
        },
      };

      setResult(result);
      renderGraph(result);
      setActiveTab("results");
    } catch (err) {
      setError("Error analyzing site structure: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Render the graph visualization using Cytoscape
  const renderGraph = (data: AnalysisResult) => {
    if (!graphRef.current) return;

    // Destroy existing graph
    if (cyRef.current) {
      cyRef.current.destroy();
    }

    // Filter nodes if orphaned filter is active
    const filteredNodes = filterOrphaned
      ? data.nodes.filter((node) => node.incomingLinks > 0)
      : data.nodes;

    const filteredEdges = filterOrphaned
      ? data.edges.filter(
          (edge) =>
            filteredNodes.some((n) => n.id === edge.source) &&
            filteredNodes.some((n) => n.id === edge.target)
        )
      : data.edges;

    // Update cytoscape initialization with typed layout options
    const layoutOptions: CoseBilkentLayout = {
      name: layoutType,
      animate: true,
      animationDuration: 500,
      nodeDimensionsIncludeLabels: true,
      idealEdgeLength: 100,
      nodeRepulsion: 4500,
      randomize: true,
    };

    // Initialize Cytoscape
    cyRef.current = cytoscape({
      container: graphRef.current,
      elements: {
        nodes: filteredNodes.map((node) => ({
          data: {
            id: node.id,
            label: node.title,
            incomingLinks: node.incomingLinks,
            outgoingLinks: node.outgoingLinks,
          },
        })),
        edges: filteredEdges.map((edge) => ({
          data: {
            source: edge.source,
            target: edge.target,
            label: edge.label,
          },
        })),
      },
      style: [
        {
          selector: "node",
          style: {
            "background-color": "#4f46e5",
            width: "30px",
            height: "30px",
            label: showLabels ? "data(label)" : "",
            color: "#1f2937",
            "font-size": "10px",
            "text-wrap": "wrap",
            "text-max-width": "100px",
            "text-valign": "bottom",
            "text-halign": "center",
          },
        },
        {
          selector: "edge",
          style: {
            width: 2,
            "line-color": "#9ca3af",
            "target-arrow-color": "#9ca3af",
            "target-arrow-shape": "triangle",
            "curve-style": "bezier",
          },
        },
        {
          selector: "node[incomingLinks = 0]",
          style: {
            "background-color": "#ef4444",
          },
        },
        {
          selector: "node[outgoingLinks = 0]",
          style: {
            "background-color": "#f59e0b",
          },
        },
      ],
      layout: layoutOptions,
    });

    // Add interaction handlers
    cyRef.current.on("tap", "node", (evt: cytoscape.EventObject) => {
      const node = evt.target.data();
      console.log("Node clicked:", node);
      // Could add node details panel here
    });

    cyRef.current.on("mouseover", "node", (evt: cytoscape.EventObject) => {
      evt.target.style({
        "border-width": "3px",
        "border-color": "#4f46e5",
      });
    });

    cyRef.current.on("mouseout", "node", (evt: cytoscape.EventObject) => {
      evt.target.style({
        "border-width": "0px",
      });
    });
  };

  // Re-render graph when filters change
  useEffect(() => {
    if (result) {
      renderGraph(result);
    }
  }, [showLabels, filterOrphaned, layoutType]);

  // Generate downloadable report
  const downloadReport = () => {
    if (!result) return;

    const report = {
      summary: {
        totalPages: result.stats.totalPages,
        totalLinks: result.stats.totalLinks,
        averageLinksPerPage: result.stats.averageLinksPerPage.toFixed(2),
        orphanedPagesCount: result.stats.orphanedPages.length,
        deadEndPagesCount: result.stats.deadEndPages.length,
      },
      orphanedPages: result.stats.orphanedPages.map((p) => ({
        url: p.url,
        title: p.title,
      })),
      mostLinkedPages: result.stats.mostLinkedPages.map((p) => ({
        url: p.url,
        title: p.title,
        incomingLinks: p.incomingLinks,
      })),
      deadEndPages: result.stats.deadEndPages.map((p) => ({
        url: p.url,
        title: p.title,
      })),
      allPages: result.nodes.map((n) => ({
        url: n.url,
        title: n.title,
        incomingLinks: n.incomingLinks,
        outgoingLinks: n.outgoingLinks,
      })),
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "internal-link-analysis.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Network className="h-6 w-6" />
          Internal Link Mapper
        </CardTitle>
        <CardDescription>
          Analyze internal linking structure to identify orphaned content and
          optimization opportunities
        </CardDescription>
      </CardHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="px-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="input">Input</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>
        </div>

        <CardContent className="space-y-6 pt-6">
          <TabsContent value="input" className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="url">Website URL</Label>
                <Input
                  id="url"
                  type="url"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Enter the URL of the website you want to analyze
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="crawl-depth">Crawl Depth</Label>
                  <Input
                    id="crawl-depth"
                    type="number"
                    min="1"
                    max="5"
                    value={crawlDepth}
                    onChange={(e) =>
                      setCrawlDepth(
                        Math.min(5, Math.max(1, parseInt(e.target.value) || 1))
                      )
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    How many levels deep to crawl (1-5)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max-pages">Max Pages</Label>
                  <Input
                    id="max-pages"
                    type="number"
                    min="10"
                    max="100"
                    value={maxPages}
                    onChange={(e) =>
                      setMaxPages(
                        Math.min(
                          100,
                          Math.max(10, parseInt(e.target.value) || 10)
                        )
                      )
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Maximum number of pages to analyze (10-100)
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setUrl("");
                    setError(null);
                    setResult(null);
                  }}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Clear
                </Button>
                <Button onClick={analyzeStructure} disabled={loading || !url}>
                  <Network className="mr-2 h-4 w-4" />
                  {loading ? "Analyzing..." : "Analyze Structure"}
                </Button>
              </div>

              {error && (
                <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  {error}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="results" className="space-y-6">
            {error && (
              <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                {error}
              </div>
            )}

            {result && (
              <div className="space-y-6">
                {/* Summary Statistics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-muted rounded-lg p-4">
                    <h4 className="text-sm font-medium mb-2">Total Pages</h4>
                    <p className="text-2xl font-semibold">
                      {result.stats.totalPages}
                    </p>
                  </div>
                  <div className="bg-muted rounded-lg p-4">
                    <h4 className="text-sm font-medium mb-2">Total Links</h4>
                    <p className="text-2xl font-semibold">
                      {result.stats.totalLinks}
                    </p>
                  </div>
                  <div className="bg-muted rounded-lg p-4">
                    <h4 className="text-sm font-medium mb-2">
                      Avg. Links/Page
                    </h4>
                    <p className="text-2xl font-semibold">
                      {result.stats.averageLinksPerPage.toFixed(1)}
                    </p>
                  </div>
                </div>

                {/* Visualization Controls */}
                <div className="flex flex-wrap gap-4 items-center bg-muted p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="show-labels">Show Labels</Label>
                    <Switch
                      id="show-labels"
                      checked={showLabels}
                      onCheckedChange={setShowLabels}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="filter-orphaned">Hide Orphaned Pages</Label>
                    <Switch
                      id="filter-orphaned"
                      checked={filterOrphaned}
                      onCheckedChange={setFilterOrphaned}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="layout-type">Layout</Label>
                    <select
                      id="layout-type"
                      value={layoutType}
                      onChange={(e) => setLayoutType(e.target.value)}
                      className="rounded-md border px-2 py-1 text-sm"
                    >
                      <option value="cose-bilkent">Force-Directed</option>
                      <option value="circle">Circular</option>
                      <option value="grid">Grid</option>
                      <option value="concentric">Concentric</option>
                    </select>
                  </div>
                </div>

                {/* Graph Visualization */}
                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-4">
                    Link Structure Visualization
                  </h3>
                  <div
                    ref={graphRef}
                    className="w-full h-[500px] bg-muted/30 rounded-lg"
                  />
                  <div className="mt-4 flex gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#4f46e5]" />
                      <span className="text-sm">Connected Pages</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#ef4444]" />
                      <span className="text-sm">Orphaned Pages</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#f59e0b]" />
                      <span className="text-sm">Dead End Pages</span>
                    </div>
                  </div>
                </div>

                {/* Issues and Recommendations */}
                <div className="space-y-4">
                  {result.stats.orphanedPages.length > 0 && (
                    <div className="bg-yellow-50 text-yellow-800 p-4 rounded-lg">
                      <h4 className="font-medium flex items-center gap-2">
                        <AlertCircle className="h-5 w-5" />
                        Orphaned Pages ({result.stats.orphanedPages.length})
                      </h4>
                      <p className="mt-2 text-sm">
                        These pages have no incoming links, making them hard to
                        discover:
                      </p>
                      <ul className="mt-2 space-y-1 text-sm">
                        {result.stats.orphanedPages
                          .slice(0, 5)
                          .map((page, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <LinkIcon className="h-4 w-4" />
                              {page.title || page.url}
                            </li>
                          ))}
                        {result.stats.orphanedPages.length > 5 && (
                          <li className="text-sm italic">
                            And {result.stats.orphanedPages.length - 5} more...
                          </li>
                        )}
                      </ul>
                    </div>
                  )}

                  {result.stats.deadEndPages.length > 0 && (
                    <div className="bg-orange-50 text-orange-800 p-4 rounded-lg">
                      <h4 className="font-medium flex items-center gap-2">
                        <AlertCircle className="h-5 w-5" />
                        Dead End Pages ({result.stats.deadEndPages.length})
                      </h4>
                      <p className="mt-2 text-sm">
                        These pages have no outgoing links, potentially trapping
                        users:
                      </p>
                      <ul className="mt-2 space-y-1 text-sm">
                        {result.stats.deadEndPages
                          .slice(0, 5)
                          .map((page, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <ExternalLink className="h-4 w-4" />
                              {page.title || page.url}
                            </li>
                          ))}
                        {result.stats.deadEndPages.length > 5 && (
                          <li className="text-sm italic">
                            And {result.stats.deadEndPages.length - 5} more...
                          </li>
                        )}
                      </ul>
                    </div>
                  )}

                  <div className="bg-green-50 text-green-800 p-4 rounded-lg">
                    <h4 className="font-medium">Most Linked Pages</h4>
                    <p className="mt-2 text-sm">
                      These pages receive the most internal links:
                    </p>
                    <ul className="mt-2 space-y-1">
                      {result.stats.mostLinkedPages.map((page, i) => (
                        <li key={i} className="text-sm flex items-center gap-2">
                          <LinkIcon className="h-4 w-4" />
                          {page.title || page.url}
                          <span className="text-xs">
                            ({page.incomingLinks} links)
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Export Button */}
                <div className="flex justify-end">
                  <Button variant="outline" onClick={downloadReport}>
                    <Download className="mr-2 h-4 w-4" />
                    Download Report
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </CardContent>
      </Tabs>

      <CardFooter className="flex flex-col space-y-4">
        <div className="bg-muted p-4 rounded-lg w-full">
          <h3 className="font-semibold mb-2">How to use this tool</h3>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-4">
            <li>Upload multiple HTML files from your website</li>
            <li>Optionally provide a base URL to resolve relative links</li>
            <li>
              View the interactive visualization of your site's link structure
            </li>
            <li>Identify orphaned pages and dead ends that need attention</li>
            <li>Analyze link distribution and optimize internal linking</li>
            <li>Export detailed reports for further analysis</li>
          </ul>
        </div>
      </CardFooter>
    </Card>
  );
};

export default InternalLinkMapper;
