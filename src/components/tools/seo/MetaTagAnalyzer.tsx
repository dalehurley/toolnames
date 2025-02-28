import { useState } from "react";
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
  FileCode,
  Globe,
  RefreshCw,
  Check,
  AlertCircle,
  Download,
} from "lucide-react";
import * as cheerio from "cheerio";
import he from "he";

interface MetaTag {
  name: string;
  content: string;
  type: "name" | "property" | "title" | "description";
  characterCount?: number;
  status?: "ok" | "warning" | "error";
  message?: string;
}

interface PreviewData {
  google: {
    title: string;
    url: string;
    description: string;
  };
  facebook: {
    title: string;
    description: string;
    image?: string;
  };
  twitter: {
    title: string;
    description: string;
    image?: string;
  };
}

export const MetaTagAnalyzer = () => {
  const [activeTab, setActiveTab] = useState<string>("input");
  const [htmlInput, setHtmlInput] = useState<string>("");
  const [url, setUrl] = useState<string>("");
  const [metaTags, setMetaTags] = useState<MetaTag[]>([]);
  const [previewData, setPreviewData] = useState<PreviewData>({
    google: { title: "", url: "", description: "" },
    facebook: { title: "", description: "" },
    twitter: { title: "", description: "" },
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleClear = () => {
    setHtmlInput("");
    setUrl("");
    setMetaTags([]);
    setPreviewData({
      google: { title: "", url: "", description: "" },
      facebook: { title: "", description: "" },
      twitter: { title: "", description: "" },
    });
    setError(null);
  };

  const validateMetaTag = (tag: MetaTag): MetaTag => {
    const validatedTag = { ...tag };

    switch (tag.type) {
      case "title":
        validatedTag.characterCount = tag.content.length;
        if (tag.content.length < 30) {
          validatedTag.status = "error";
          validatedTag.message = "Title is too short (min 30 characters)";
        } else if (tag.content.length > 60) {
          validatedTag.status = "warning";
          validatedTag.message = "Title may be truncated in search results";
        } else {
          validatedTag.status = "ok";
          validatedTag.message = "Title length is optimal";
        }
        break;

      case "description":
        validatedTag.characterCount = tag.content.length;
        if (tag.content.length < 120) {
          validatedTag.status = "error";
          validatedTag.message =
            "Description is too short (min 120 characters)";
        } else if (tag.content.length > 160) {
          validatedTag.status = "warning";
          validatedTag.message =
            "Description may be truncated in search results";
        } else {
          validatedTag.status = "ok";
          validatedTag.message = "Description length is optimal";
        }
        break;

      default:
        validatedTag.status = "ok";
    }

    return validatedTag;
  };

  const analyzeHtml = (html: string) => {
    try {
      const $ = cheerio.load(html);
      const foundTags: MetaTag[] = [];

      // Get title
      const title = $("title").text();
      if (title) {
        foundTags.push(
          validateMetaTag({
            name: "title",
            content: he.decode(title),
            type: "title",
          })
        );
      }

      // Get meta description
      const description = $('meta[name="description"]').attr("content");
      if (description) {
        foundTags.push(
          validateMetaTag({
            name: "description",
            content: he.decode(description),
            type: "description",
          })
        );
      }

      // Get Open Graph tags
      $('meta[property^="og:"]').each((_, element) => {
        const property = $(element).attr("property");
        const content = $(element).attr("content");
        if (property && content) {
          foundTags.push(
            validateMetaTag({
              name: property,
              content: he.decode(content),
              type: "property",
            })
          );
        }
      });

      // Get Twitter Card tags
      $('meta[name^="twitter:"]').each((_, element) => {
        const name = $(element).attr("name");
        const content = $(element).attr("content");
        if (name && content) {
          foundTags.push(
            validateMetaTag({
              name: name,
              content: he.decode(content),
              type: "name",
            })
          );
        }
      });

      setMetaTags(foundTags);
      updatePreviews(foundTags);
    } catch (error) {
      setError("Error parsing HTML: " + (error as Error).message);
    }
  };

  const updatePreviews = (tags: MetaTag[]) => {
    const newPreviewData: PreviewData = {
      google: { title: "", url: "", description: "" },
      facebook: { title: "", description: "" },
      twitter: { title: "", description: "" },
    };

    // Update Google preview
    const title = tags.find((tag) => tag.type === "title")?.content || "";
    const description =
      tags.find((tag) => tag.type === "description")?.content || "";

    newPreviewData.google = {
      title,
      description,
      url: url || "example.com",
    };

    // Update Facebook preview
    newPreviewData.facebook = {
      title:
        tags.find((tag) => tag.name === "og:title")?.content || title || "",
      description:
        tags.find((tag) => tag.name === "og:description")?.content ||
        description ||
        "",
      image: tags.find((tag) => tag.name === "og:image")?.content,
    };

    // Update Twitter preview
    newPreviewData.twitter = {
      title:
        tags.find((tag) => tag.name === "twitter:title")?.content ||
        tags.find((tag) => tag.name === "og:title")?.content ||
        title ||
        "",
      description:
        tags.find((tag) => tag.name === "twitter:description")?.content ||
        tags.find((tag) => tag.name === "og:description")?.content ||
        description ||
        "",
      image:
        tags.find((tag) => tag.name === "twitter:image")?.content ||
        tags.find((tag) => tag.name === "og:image")?.content,
    };

    setPreviewData(newPreviewData);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      setHtmlInput(text);
      analyzeHtml(text);
    } catch (error) {
      setError("Error reading file: " + (error as Error).message);
    }
  };

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
      setHtmlInput(html);
      analyzeHtml(html);
    } catch (error) {
      setError("Error fetching URL: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    const report = {
      url: url || "Manual HTML Input",
      analyzedAt: new Date().toISOString(),
      metaTags: metaTags,
      previews: previewData,
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json",
    });
    const fileUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = fileUrl;
    a.download = "meta-tags-report.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(fileUrl);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <FileCode className="h-6 w-6" />
          Meta Tag Analyzer & Generator
        </CardTitle>
        <CardDescription>
          Analyze and optimize meta tags for better SEO and social sharing
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
              </div>

              <div className="space-y-2">
                <Label>Or Upload HTML File</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept=".html,.htm"
                    onChange={handleFileUpload}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="html">Or Paste HTML</Label>
                <Textarea
                  id="html"
                  placeholder="Paste your HTML here..."
                  value={htmlInput}
                  onChange={(e) => setHtmlInput(e.target.value)}
                  className="min-h-[200px] font-mono text-sm"
                />
              </div>

              {error && (
                <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={handleClear}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Clear
                </Button>

                <Button
                  onClick={() => {
                    if (url && !htmlInput) {
                      fetchUrl().then(() => setActiveTab("results"));
                    } else if (htmlInput) {
                      analyzeHtml(htmlInput);
                      setActiveTab("results");
                    } else {
                      setError("Please enter a URL or paste HTML content");
                    }
                  }}
                  disabled={loading || (!url && !htmlInput)}
                >
                  <FileCode className="mr-2 h-4 w-4" />
                  Analyze Meta Tags
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="results" className="space-y-6">
            {metaTags.length > 0 ? (
              <>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Meta Tags Analysis</h3>
                  <div className="space-y-4">
                    {metaTags.map((tag, index) => (
                      <div
                        key={index}
                        className="border rounded-lg p-4 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-medium">{tag.name}</div>
                          {tag.status && (
                            <div
                              className={`flex items-center gap-1 text-sm ${
                                tag.status === "ok"
                                  ? "text-green-500"
                                  : tag.status === "warning"
                                  ? "text-yellow-500"
                                  : "text-red-500"
                              }`}
                            >
                              {tag.status === "ok" ? (
                                <Check className="h-4 w-4" />
                              ) : (
                                <AlertCircle className="h-4 w-4" />
                              )}
                              {tag.status}
                            </div>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground break-all">
                          {tag.content}
                        </div>
                        {tag.characterCount && (
                          <div className="text-sm text-muted-foreground">
                            Character count: {tag.characterCount}
                          </div>
                        )}
                        {tag.message && (
                          <div
                            className={`text-sm ${
                              tag.status === "ok"
                                ? "text-green-500"
                                : tag.status === "warning"
                                ? "text-yellow-500"
                                : "text-red-500"
                            }`}
                          >
                            {tag.message}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Search Preview</h3>
                  <div className="border rounded-lg p-4 space-y-2">
                    <div className="text-blue-600 text-xl hover:underline cursor-pointer">
                      {previewData.google.title || "No title available"}
                    </div>
                    <div className="text-green-700 text-sm">
                      {previewData.google.url}
                    </div>
                    <div className="text-sm text-gray-600">
                      {previewData.google.description ||
                        "No description available"}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    Social Media Preview
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4 space-y-2">
                      <h4 className="font-medium">Facebook</h4>
                      <div className="bg-white rounded border">
                        {previewData.facebook.image && (
                          <div className="aspect-[1.91/1] bg-gray-100 rounded-t">
                            <img
                              src={previewData.facebook.image}
                              alt=""
                              className="w-full h-full object-cover rounded-t"
                            />
                          </div>
                        )}
                        <div className="p-3">
                          <div className="font-medium text-[13px] text-[#385898] hover:underline">
                            {previewData.facebook.title || "No title available"}
                          </div>
                          <div className="text-[12px] text-gray-500 line-clamp-2">
                            {previewData.facebook.description ||
                              "No description available"}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4 space-y-2">
                      <h4 className="font-medium">Twitter</h4>
                      <div className="bg-white rounded border">
                        {previewData.twitter.image && (
                          <div className="aspect-[2/1] bg-gray-100 rounded-t">
                            <img
                              src={previewData.twitter.image}
                              alt=""
                              className="w-full h-full object-cover rounded-t"
                            />
                          </div>
                        )}
                        <div className="p-3">
                          <div className="font-medium text-[15px]">
                            {previewData.twitter.title || "No title available"}
                          </div>
                          <div className="text-[13px] text-gray-500 line-clamp-2">
                            {previewData.twitter.description ||
                              "No description available"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={downloadReport}>
                    <Download className="mr-2 h-4 w-4" />
                    Download Report
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                No meta tags analyzed yet. Please input HTML or fetch a URL to
                begin analysis.
              </div>
            )}
          </TabsContent>
        </CardContent>
      </Tabs>

      <CardFooter className="flex flex-col space-y-4">
        <div className="bg-muted p-4 rounded-lg w-full">
          <h3 className="font-semibold mb-2">How to use this tool</h3>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-4">
            <li>Enter a URL to analyze meta tags from a live website</li>
            <li>Upload an HTML file or paste HTML code directly</li>
            <li>
              View detailed analysis of meta tags including titles,
              descriptions, and social media tags
            </li>
            <li>
              See previews of how your content will appear in search results and
              social media
            </li>
            <li>Download a detailed report of the analysis</li>
          </ul>
        </div>
      </CardFooter>
    </Card>
  );
};

export default MetaTagAnalyzer;
