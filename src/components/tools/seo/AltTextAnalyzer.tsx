import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Image,
  AlertCircle,
  FileUp,
  Download,
  Maximize2,
  Volume2,
  Globe,
  Loader2,
  BarChart3,
  PieChart as PieChartIcon,
} from "lucide-react";
import * as cheerio from "cheerio";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  Pie,
  PieChart,
  Legend,
} from "recharts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

// Remove unused imports and interface
interface ImageData {
  id: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  fileSize: number;
  location: string;
  container: string;
  contextText?: string;
}

interface AltTextAnalysis {
  score: number;
  length: number;
  quality: "poor" | "good" | "excessive";
  issues: string[];
  suggestions: string[];
}

// Gallery Component
const ImageGallery = ({
  images,
  onEdit,
}: {
  images: ImageData[];
  onEdit: (id: string, newAlt: string) => void;
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {images.map((image) => (
        <Card key={image.id} className="overflow-hidden">
          <div className="relative aspect-video">
            <img
              src={image.src}
              alt={image.alt}
              className="object-cover w-full h-full"
            />
          </div>
          <CardContent className="p-4">
            <Input
              value={image.alt}
              onChange={(e) => onEdit(image.id, e.target.value)}
              placeholder="Enter alt text..."
              className="mb-2"
            />
            <div className="text-sm text-muted-foreground">
              <p>Size: {Math.round(image.fileSize / 1024)}KB</p>
              <p>
                Dimensions: {image.width}x{image.height}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Analysis Component
const AnalysisView = ({
  images,
  analysis,
}: {
  images: ImageData[];
  analysis: Record<string, AltTextAnalysis>;
}) => {
  const getOverallScore = () => {
    const scores = Object.values(analysis).map((a) => a.score);
    if (scores.length === 0) return 0;

    // Filter out any undefined or null scores
    const validScores = scores.filter(
      (score) => typeof score === "number" && !isNaN(score)
    );
    if (validScores.length === 0) return 0;

    return Math.round(
      validScores.reduce((a, b) => a + b, 0) / validScores.length
    );
  };

  const score = getOverallScore();
  const scoreColor =
    score >= 80
      ? "text-green-600"
      : score >= 50
      ? "text-yellow-600"
      : "text-red-600";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Overall Score</h3>
          <p className="text-sm text-muted-foreground">
            Based on alt text quality analysis
          </p>
        </div>
        <div className={`text-2xl font-bold ${scoreColor}`}>{score}%</div>
      </div>
      <div className="w-full h-2 bg-primary/20 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all ${
            score >= 80
              ? "bg-green-600"
              : score >= 50
              ? "bg-yellow-600"
              : "bg-red-600"
          }`}
          style={{ width: `${score}%` }}
        />
      </div>

      <div className="space-y-4">
        {images.map((image) => {
          const imageAnalysis = analysis[image.id];
          return (
            <Card key={image.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="w-24 h-24 relative">
                    <img
                      src={image.src}
                      alt={image.alt}
                      className="object-cover w-full h-full rounded"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge
                        variant={
                          imageAnalysis.quality === "good"
                            ? "default"
                            : imageAnalysis.quality === "poor"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {imageAnalysis.quality}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {imageAnalysis.length} characters
                      </span>
                    </div>
                    {imageAnalysis.issues.length > 0 && (
                      <Alert variant="destructive" className="mb-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Issues Found</AlertTitle>
                        <AlertDescription>
                          <ul className="list-disc pl-4">
                            {imageAnalysis.issues.map((issue, i) => (
                              <li key={i}>{issue}</li>
                            ))}
                          </ul>
                        </AlertDescription>
                      </Alert>
                    )}
                    {imageAnalysis.suggestions.length > 0 && (
                      <div className="text-sm text-muted-foreground">
                        <strong>Suggestions:</strong>
                        <ul className="list-disc pl-4">
                          {imageAnalysis.suggestions.map((suggestion, i) => (
                            <li key={i}>{suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

// Analytics Component
const AnalyticsView = ({
  analysis,
}: {
  analysis: Record<string, AltTextAnalysis>;
}) => {
  const prepareChartData = () => {
    const scores = Object.values(analysis).map((a) => a.score);

    // Create score distribution data
    const scoreDistribution = Array.from({ length: 5 }, (_, i) => {
      const min = i * 20;
      const max = (i + 1) * 20;
      const count = scores.filter(
        (score) => score >= min && score < max
      ).length;
      return {
        range: `${min}-${max}`,
        count,
      };
    });

    // Quality breakdown data
    const qualityCount = Object.values(analysis).reduce((acc, a) => {
      acc[a.quality] = (acc[a.quality] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const qualityBreakdown = Object.entries(qualityCount).map(
      ([quality, count]) => ({
        quality,
        count,
        color:
          quality === "good"
            ? "#22c55e"
            : quality === "poor"
            ? "#ef4444"
            : "#f59e0b",
      })
    );

    // Issues frequency data
    const issueFrequency = Object.values(analysis).reduce((acc, a) => {
      a.issues.forEach((issue) => {
        acc[issue] = (acc[issue] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    const issuesData = Object.entries(issueFrequency)
      .map(([issue, count]) => ({ issue, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Length distribution data
    const lengthRanges = [
      { min: 0, max: 20, label: "0-20" },
      { min: 21, max: 50, label: "21-50" },
      { min: 51, max: 100, label: "51-100" },
      { min: 101, max: Infinity, label: "100+" },
    ];

    const lengthDistribution = lengthRanges.map((range) => ({
      range: range.label,
      count: Object.values(analysis).filter(
        (a) => a.length >= range.min && a.length <= range.max
      ).length,
    }));

    return {
      scoreDistribution,
      qualityBreakdown,
      issuesData,
      lengthDistribution,
    };
  };

  const data = prepareChartData();
  const chartConfig = {
    good: { color: "#22c55e" },
    poor: { color: "#ef4444" },
    excessive: { color: "#f59e0b" },
    default: { color: "#4f46e5" },
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Score Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="w-full">
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart data={data.scoreDistribution} width={350} height={300}>
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip
                  content={({ active, payload }) => (
                    <ChartTooltipContent
                      active={active}
                      payload={payload}
                      labelFormatter={(value) => `Score Range: ${value}`}
                    />
                  )}
                />
                <Bar dataKey="count" fill="var(--color-default)" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <PieChartIcon className="h-4 w-4" />
              Quality Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="w-full">
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <PieChart width={350} height={300}>
                <Pie
                  data={data.qualityBreakdown}
                  dataKey="count"
                  nameKey="quality"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                >
                  {data.qualityBreakdown.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => (
                    <ChartTooltipContent
                      active={active}
                      payload={payload}
                      labelFormatter={(value) => `Quality: ${value}`}
                    />
                  )}
                />
                <Legend />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Common Issues
            </CardTitle>
          </CardHeader>
          <CardContent className="w-full">
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart
                data={data.issuesData}
                layout="vertical"
                width={350}
                height={300}
              >
                <XAxis type="number" />
                <YAxis type="category" dataKey="issue" width={150} />
                <Tooltip
                  content={({ active, payload }) => (
                    <ChartTooltipContent
                      active={active}
                      payload={payload}
                      labelFormatter={(value) => `Issue: ${value}`}
                    />
                  )}
                />
                <Bar dataKey="count" fill="var(--color-default)" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Alt Text Length Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="w-full">
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart data={data.lengthDistribution} width={350} height={300}>
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip
                  content={({ active, payload }) => (
                    <ChartTooltipContent
                      active={active}
                      payload={payload}
                      labelFormatter={(value) => `Length Range: ${value}`}
                    />
                  )}
                />
                <Bar dataKey="count" fill="var(--color-default)" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Dashboard Component
const AccessibilityDashboard = ({
  images,
  analysis,
  onUpdateAlt,
  onUpdateImages,
}: {
  images: ImageData[];
  analysis: Record<string, AltTextAnalysis>;
  onUpdateAlt: (id: string, newAlt: string) => void;
  onUpdateImages: (newImages: ImageData[]) => void;
}) => {
  const [showBulkEdit, setShowBulkEdit] = useState(false);
  const [showScreenReader, setShowScreenReader] = useState(false);
  const [bulkAltText, setBulkAltText] = useState("");

  const stats = {
    total: images.length,
    missing: images.filter((img) => !img.alt).length,
    poor: Object.values(analysis).filter((a) => a.quality === "poor").length,
    good: Object.values(analysis).filter((a) => a.quality === "good").length,
    excessive: Object.values(analysis).filter((a) => a.quality === "excessive")
      .length,
  };

  // Function to handle HTML file upload
  const handleHtmlUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const html = e.target?.result as string;
        const $ = cheerio.load(html);
        const newImages: ImageData[] = [];

        $("img").each((_, element) => {
          const $img = $(element);
          const $container = $img.parent();
          const contextText = $container.text().trim();

          const imageData: ImageData = {
            id: Math.random().toString(36).substr(2, 9),
            src: $img.attr("src") || "",
            alt: $img.attr("alt") || "",
            width: parseInt($img.attr("width") || "0", 10) || 0,
            height: parseInt($img.attr("height") || "0", 10) || 0,
            fileSize: 0,
            location: $img
              .parents()
              .slice(0, 2)
              .map((_, el) => $(el).prop("tagName"))
              .get()
              .join(" > "),
            container: $container.prop("tagName") || "div",
            contextText,
          };
          newImages.push(imageData);
        });

        // Handle the new images (pass to parent component)
        if (typeof onUpdateImages === "function") {
          onUpdateImages(newImages);
        }
      };
      reader.readAsText(file);
    }
  };

  // Function to export report
  const exportReport = () => {
    const report = {
      summary: {
        totalImages: stats.total,
        missingAltText: stats.missing,
        poorQuality: stats.poor,
        goodQuality: stats.good,
        excessiveLength: stats.excessive,
      },
      images: images.map((img) => ({
        src: img.src,
        alt: img.alt,
        analysis: analysis[img.id],
        location: img.location,
      })),
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "alt-text-analysis-report.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Function to apply bulk edit
  const applyBulkEdit = () => {
    images.forEach((img) => {
      if (bulkAltText) {
        onUpdateAlt(img.id, bulkAltText);
      }
    });
    setShowBulkEdit(false);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-sm text-muted-foreground">Total Images</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-destructive">
              {stats.missing}
            </div>
            <p className="text-sm text-muted-foreground">Missing Alt Text</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-green-600">
              {stats.good}
            </div>
            <p className="text-sm text-muted-foreground">Good Alt Text</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Label htmlFor="html-upload" className="w-full">
            <Button className="w-full justify-start" variant="outline" asChild>
              <div>
                <FileUp className="mr-2 h-4 w-4" />
                Upload HTML Files
              </div>
            </Button>
            <Input
              id="html-upload"
              type="file"
              accept=".html,.htm"
              className="hidden"
              onChange={handleHtmlUpload}
            />
          </Label>

          <Button
            className="w-full justify-start"
            variant="outline"
            onClick={exportReport}
          >
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>

          <Dialog open={showBulkEdit} onOpenChange={setShowBulkEdit}>
            <DialogTrigger asChild>
              <Button className="w-full justify-start" variant="outline">
                <Maximize2 className="mr-2 h-4 w-4" />
                Bulk Edit Mode
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Bulk Edit Alt Text</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Template Alt Text</Label>
                  <Textarea
                    placeholder="Enter alt text template..."
                    value={bulkAltText}
                    onChange={(e) => setBulkAltText(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    This text will be applied to all selected images
                  </p>
                </div>
                <Button onClick={applyBulkEdit}>Apply to All Images</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showScreenReader} onOpenChange={setShowScreenReader}>
            <DialogTrigger asChild>
              <Button className="w-full justify-start" variant="outline">
                <Volume2 className="mr-2 h-4 w-4" />
                Screen Reader Preview
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Screen Reader Preview</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Image</TableHead>
                      <TableHead>Alt Text</TableHead>
                      <TableHead>Preview</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {images.map((img) => (
                      <TableRow key={img.id}>
                        <TableCell>
                          <img
                            src={img.src}
                            alt={img.alt}
                            className="w-16 h-16 object-cover rounded"
                          />
                        </TableCell>
                        <TableCell>{img.alt || "(No alt text)"}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const utterance = new SpeechSynthesisUtterance(
                                img.alt || "Image without alternative text"
                              );
                              window.speechSynthesis.speak(utterance);
                            }}
                          >
                            <Volume2 className="h-4 w-4 mr-2" />
                            Listen
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
};

// URL Input Component
const UrlInput = ({
  onAnalyze,
}: {
  onAnalyze: (url: string) => Promise<void>;
}) => {
  const [url, setUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!url) {
      setError("Please enter a URL");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onAnalyze(url);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Input
          placeholder="Enter website URL..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1"
        />
        <Button onClick={handleAnalyze} disabled={loading}>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Globe className="h-4 w-4 mr-2" />
          )}
          Analyze
        </Button>
      </div>
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

// Main component for Alt Text Analyzer
const AltTextAnalyzer = () => {
  const [images, setImages] = useState<ImageData[]>([]);
  const [analysis, setAnalysis] = useState<Record<string, AltTextAnalysis>>({});
  const [activeTab, setActiveTab] = useState("gallery");

  // Function to analyze alt text with context
  const analyzeAltText = (
    alt: string,
    contextText?: string
  ): AltTextAnalysis => {
    const length = alt.length;
    const issues: string[] = [];
    const suggestions: string[] = [];

    // Initialize base score
    let score = 100;
    let bonusPoints = 0;

    // Basic analysis rules
    if (!alt) {
      issues.push("Missing alt text");
      suggestions.push("Add descriptive alt text");
      score = 0;
    } else {
      // Length analysis
      if (length < 5) {
        issues.push("Alt text is too short to be meaningful");
        suggestions.push("Add more descriptive details");
        score -= 50;
      } else if (length < 20) {
        issues.push("Alt text may be too short");
        suggestions.push("Add more descriptive details");
        score -= 25;
      } else if (length > 125) {
        issues.push("Alt text is too long");
        suggestions.push(
          "Consider shortening while maintaining key information"
        );
        score -= 25;
      } else if (length > 100) {
        issues.push("Alt text may be too long");
        suggestions.push(
          "Consider shortening while maintaining key information"
        );
        score -= 15;
      }

      // Content quality checks
      if (/^image of|^picture of|^photo of/i.test(alt)) {
        issues.push("Redundant prefix detected");
        suggestions.push(
          "Remove redundant prefix (image of, picture of, photo of)"
        );
        score -= 10;
      }

      if (/\.(jpg|jpeg|png|gif|webp)$/i.test(alt)) {
        issues.push("Alt text contains file extension");
        suggestions.push("Remove file extension from alt text");
        score -= 15;
      }

      // Check for placeholder text
      if (/^(img|image|picture|photo)\d*$/i.test(alt)) {
        issues.push("Generic placeholder text detected");
        suggestions.push("Replace placeholder with meaningful description");
        score -= 30;
      }

      // Check for non-descriptive text
      if (/^(untitled|no\s?name|test|temp)/i.test(alt)) {
        issues.push("Non-descriptive text detected");
        suggestions.push("Replace with meaningful description");
        score -= 30;
      }

      // Check for proper sentence structure
      if (alt.length > 10) {
        // Bonus for proper capitalization
        if (/^[A-Z]/.test(alt)) {
          bonusPoints += 5;
        }

        // Bonus for proper punctuation
        if (/[.!?]$/.test(alt)) {
          bonusPoints += 5;
        }

        // Check for overuse of capital letters
        if (alt === alt.toUpperCase() && alt.length > 10) {
          issues.push("All caps text detected");
          suggestions.push("Use proper capitalization");
          score -= 10;
        }
      }

      // Context analysis with more weight
      if (contextText && contextText.length > 0) {
        const contextWords = new Set(contextText.toLowerCase().split(/\s+/));
        const altWords = new Set(alt.toLowerCase().split(/\s+/));
        const commonWords = new Set(
          [...altWords].filter((x) => contextWords.has(x))
        );

        // More sophisticated context matching
        if (contextWords.size > 5) {
          if (commonWords.size === 0) {
            issues.push("Alt text doesn't match surrounding context");
            suggestions.push(
              "Incorporate relevant terms from surrounding content"
            );
            score -= 20;
          } else if (commonWords.size === 1) {
            issues.push("Alt text has minimal context relevance");
            suggestions.push("Add more context-relevant terms");
            score -= 10;
          } else if (commonWords.size >= 3) {
            bonusPoints += 10; // Bonus for good context matching
          }
        }
      }

      // Check for specific descriptive words
      const descriptiveWords =
        /colors?|shapes?|patterns?|sizes?|positions?|actions?|expressions?/i;
      if (descriptiveWords.test(alt)) {
        bonusPoints += 5; // Bonus for using descriptive terminology
      }

      // Add bonus points for optimal length (30-80 characters)
      if (length >= 30 && length <= 80) {
        bonusPoints += 5;
      }
    }

    // Apply bonus points and ensure score stays within 0-100 range
    score = Math.max(0, Math.min(100, score + bonusPoints));

    return {
      score,
      length,
      quality: score >= 80 ? "good" : score >= 40 ? "excessive" : "poor",
      issues,
      suggestions,
    };
  };

  // Function to fetch and analyze images from URL
  const analyzeUrl = async (url: string) => {
    // List of CORS proxies to try
    const corsProxies = [
      "https://api.allorigins.win/raw?url=",
      "https://corsproxy.io/?",
      "https://cors-anywhere.herokuapp.com/",
    ];

    let html = "";
    let proxySuccess = false;

    // Try each proxy until one works
    for (const proxy of corsProxies) {
      try {
        const response = await fetch(proxy + encodeURIComponent(url));
        if (response.ok) {
          html = await response.text();
          proxySuccess = true;
          break;
        }
      } catch (error) {
        console.warn(`Proxy ${proxy} failed:`, error);
        continue;
      }
    }

    if (!proxySuccess) {
      throw new Error(
        "Unable to fetch the URL. The website might be blocking access. Try downloading the HTML and uploading it directly."
      );
    }

    try {
      const $ = cheerio.load(html);
      const newImages: ImageData[] = [];

      // Process all img elements
      $("img").each((_, element) => {
        const $img = $(element);
        const $container = $img.parent();
        const contextText = $container.text().trim();

        // Resolve relative URLs to absolute
        let src = $img.attr("src") || "";
        try {
          // Handle data URLs
          if (src.startsWith("data:")) {
            // Skip processing for data URLs
          }
          // Handle protocol-relative URLs
          else if (src.startsWith("//")) {
            src = `https:${src}`;
          }
          // Handle relative URLs
          else if (!src.startsWith("http")) {
            const baseUrl = new URL(url);
            src = new URL(src, baseUrl.origin).href;
          }
        } catch (error) {
          console.warn(`Failed to resolve image URL: ${src}`, error);
          // Keep the original src if URL resolution fails
        }

        const imageData: ImageData = {
          id: Math.random().toString(36).substr(2, 9),
          src,
          alt: $img.attr("alt") || "",
          width: parseInt($img.attr("width") || "0", 10) || 0,
          height: parseInt($img.attr("height") || "0", 10) || 0,
          fileSize: 0,
          location: $img
            .parents()
            .slice(0, 2)
            .map((_, el) => $(el).prop("tagName"))
            .get()
            .join(" > "),
          container: $container.prop("tagName") || "div",
          contextText,
        };

        newImages.push(imageData);
      });

      if (newImages.length === 0) {
        throw new Error("No images found on the page");
      }

      handleUpdateImages(newImages);
      setActiveTab("gallery");
    } catch (error) {
      throw new Error(`Failed to analyze URL: ${(error as Error).message}`);
    }
  };

  // Function to handle alt text updates
  const handleAltTextUpdate = (id: string, newAlt: string) => {
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, alt: newAlt } : img))
    );
    setAnalysis((prev) => ({
      ...prev,
      [id]: analyzeAltText(newAlt),
    }));
  };

  // Function to update images from HTML upload
  const handleUpdateImages = (newImages: ImageData[]) => {
    const newAnalysis: Record<string, AltTextAnalysis> = {};
    newImages.forEach((img) => {
      newAnalysis[img.id] = analyzeAltText(img.alt, img.contextText);
    });
    setImages((prev) => [...prev, ...newImages]);
    setAnalysis((prev) => ({ ...prev, ...newAnalysis }));
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Image className="h-6 w-6" />
          Alt Text Analyzer
        </CardTitle>
        <CardDescription>
          Analyze and improve image accessibility with comprehensive alt text
          analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6 mb-4">
          <UrlInput onAnalyze={analyzeUrl} />
        </div>
        {images.length === 0 ? (
          <div className="text-center py-12 my-4">
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <Globe className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Enter a URL to Begin</h3>
                <p className="text-sm text-muted-foreground">
                  Enter a website URL above to analyze its images
                </p>
              </div>
            </div>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="gallery">Gallery</TabsTrigger>
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
            <ScrollArea className="h-[600px]">
              <TabsContent value="gallery">
                <ImageGallery images={images} onEdit={handleAltTextUpdate} />
              </TabsContent>
              <TabsContent value="analysis">
                <AnalysisView images={images} analysis={analysis} />
              </TabsContent>
              <TabsContent value="analytics">
                <AnalyticsView analysis={analysis} />
              </TabsContent>
            </ScrollArea>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};

export { ImageGallery, AnalysisView, AnalyticsView, AccessibilityDashboard };
export default AltTextAnalyzer;
