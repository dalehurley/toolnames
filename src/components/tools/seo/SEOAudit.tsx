import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertCircle, Search } from "lucide-react";

interface SEOCheck {
  name: string;
  status: "pass" | "fail" | "warning";
  message: string;
  score: number;
}

export function SEOAudit() {
  const [url, setUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<SEOCheck[]>([]);
  const [overallScore, setOverallScore] = useState(0);

  const analyzeCurrentPage = () => {
    setIsAnalyzing(true);
    const checks: SEOCheck[] = [];

    // Title tag check
    const title = document.title;
    if (title) {
      if (title.length >= 30 && title.length <= 60) {
        checks.push({
          name: "Title Tag",
          status: "pass",
          message: `Good title length: ${title.length} characters`,
          score: 10,
        });
      } else if (title.length > 0) {
        checks.push({
          name: "Title Tag",
          status: "warning",
          message: `Title length should be 30-60 characters (current: ${title.length})`,
          score: 5,
        });
      } else {
        checks.push({
          name: "Title Tag",
          status: "fail",
          message: "Missing title tag",
          score: 0,
        });
      }
    }

    // Meta description check
    const metaDescription = document
      .querySelector('meta[name="description"]')
      ?.getAttribute("content");
    if (metaDescription) {
      if (metaDescription.length >= 120 && metaDescription.length <= 160) {
        checks.push({
          name: "Meta Description",
          status: "pass",
          message: `Good description length: ${metaDescription.length} characters`,
          score: 10,
        });
      } else if (metaDescription.length > 0) {
        checks.push({
          name: "Meta Description",
          status: "warning",
          message: `Description should be 120-160 characters (current: ${metaDescription.length})`,
          score: 5,
        });
      }
    } else {
      checks.push({
        name: "Meta Description",
        status: "fail",
        message: "Missing meta description",
        score: 0,
      });
    }

    // Heading structure check
    const h1Tags = document.querySelectorAll("h1");
    if (h1Tags.length === 1) {
      checks.push({
        name: "H1 Tag",
        status: "pass",
        message: "Single H1 tag found",
        score: 10,
      });
    } else if (h1Tags.length === 0) {
      checks.push({
        name: "H1 Tag",
        status: "fail",
        message: "No H1 tag found",
        score: 0,
      });
    } else {
      checks.push({
        name: "H1 Tag",
        status: "warning",
        message: `Multiple H1 tags found (${h1Tags.length})`,
        score: 5,
      });
    }

    // Open Graph tags check
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDescription = document.querySelector(
      'meta[property="og:description"]'
    );
    const ogImage = document.querySelector('meta[property="og:image"]');

    if (ogTitle && ogDescription) {
      checks.push({
        name: "Open Graph Tags",
        status: ogImage ? "pass" : "warning",
        message: ogImage ? "All essential OG tags present" : "Missing OG image",
        score: ogImage ? 10 : 7,
      });
    } else {
      checks.push({
        name: "Open Graph Tags",
        status: "fail",
        message: "Missing essential Open Graph tags",
        score: 0,
      });
    }

    // Canonical URL check
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      checks.push({
        name: "Canonical URL",
        status: "pass",
        message: "Canonical URL is set",
        score: 10,
      });
    } else {
      checks.push({
        name: "Canonical URL",
        status: "warning",
        message: "No canonical URL specified",
        score: 5,
      });
    }

    // Structured data check
    const structuredData = document.querySelector(
      'script[type="application/ld+json"]'
    );
    if (structuredData) {
      checks.push({
        name: "Structured Data",
        status: "pass",
        message: "JSON-LD structured data found",
        score: 10,
      });
    } else {
      checks.push({
        name: "Structured Data",
        status: "warning",
        message: "No structured data found",
        score: 5,
      });
    }

    // Viewport meta tag check
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      checks.push({
        name: "Mobile Viewport",
        status: "pass",
        message: "Viewport meta tag is set",
        score: 10,
      });
    } else {
      checks.push({
        name: "Mobile Viewport",
        status: "fail",
        message: "Missing viewport meta tag",
        score: 0,
      });
    }

    // Favicon check
    const favicon = document.querySelector('link[rel="icon"]');
    if (favicon) {
      checks.push({
        name: "Favicon",
        status: "pass",
        message: "Favicon is set",
        score: 5,
      });
    } else {
      checks.push({
        name: "Favicon",
        status: "warning",
        message: "No favicon found",
        score: 2,
      });
    }

    // Calculate overall score
    const totalScore = checks.reduce((sum, check) => sum + check.score, 0);
    const maxScore = checks.length * 10;
    const percentage = Math.round((totalScore / maxScore) * 100);

    setResults(checks);
    setOverallScore(percentage);
    setIsAnalyzing(false);
  };

  const analyzeExternalUrl = async () => {
    if (!url) return;

    setIsAnalyzing(true);
    // For external URLs, we'd need a backend service or CORS proxy
    // For now, show a message about limitations
    setResults([
      {
        name: "External URL Analysis",
        status: "warning",
        message:
          "External URL analysis requires a backend service due to CORS restrictions",
        score: 0,
      },
    ]);
    setOverallScore(0);
    setIsAnalyzing(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pass":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "fail":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>SEO Audit Tool</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Button
                onClick={analyzeCurrentPage}
                disabled={isAnalyzing}
                className="w-full"
              >
                {isAnalyzing ? "Analyzing..." : "Analyze Current Page"}
              </Button>
            </div>
            <div className="space-y-2">
              <Label htmlFor="url">Or analyze external URL:</Label>
              <div className="flex gap-2">
                <Input
                  id="url"
                  type="url"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
                <Button
                  onClick={analyzeExternalUrl}
                  disabled={isAnalyzing || !url}
                  variant="outline"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              SEO Audit Results
              <Badge variant="outline" className={getScoreColor(overallScore)}>
                Score: {overallScore}%
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.map((check, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 border rounded-lg"
                >
                  {getStatusIcon(check.status)}
                  <div className="flex-1">
                    <h4 className="font-medium">{check.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {check.message}
                    </p>
                  </div>
                  <Badge variant="outline">{check.score}/10</Badge>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">SEO Recommendations:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Ensure title tags are 30-60 characters long</li>
                <li>• Write meta descriptions between 120-160 characters</li>
                <li>• Use only one H1 tag per page</li>
                <li>• Include Open Graph tags for social sharing</li>
                <li>• Add structured data (JSON-LD) for rich snippets</li>
                <li>• Set canonical URLs to avoid duplicate content</li>
                <li>• Optimize for mobile with viewport meta tag</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
