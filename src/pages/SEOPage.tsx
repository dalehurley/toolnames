import React, { useEffect, useState } from "react";
import { useTools } from "@/contexts/ToolsContext";
import { getCategoryName } from "@/contexts/toolsData";
import { ToolGrid } from "@/components/ToolGrid";
import {
  Search,
  LineChart,
  AlignLeft,
  Activity,
  Tags,
  Link2,
  Globe,
  CheckCircle2,
  TrendingUp,
  Zap,
  Shield,
  Star,
  Target,
  BarChart3,
  Eye,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

const SEOPage: React.FC = () => {
  const { setFilterCategory, filteredTools } = useTools();
  const category = "seo";
  const [searchQuery, setSearchQuery] = useState("");

  // Filter tools based on search query
  const seoTools = filteredTools.filter(
    (tool) =>
      tool.category === "seo" &&
      (tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Set the filter category when the component mounts
  useEffect(() => {
    setFilterCategory(category);

    // Set the document title
    document.title = getCategoryTitle();
  }, [setFilterCategory]);

  // Generate SEO title based on category
  const getCategoryTitle = () => {
    const categoryName = getCategoryName(category);
    return `${categoryName} - Free Online ${categoryName} Tools | ToolNames`;
  };

  return (
    <div className="space-y-12 pb-8">
      {/* Hero Section - Enhanced with modern design */}
      <section className="relative bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-cyan-950/30 rounded-xl overflow-hidden">
        {/* Background decorative elements */}
        <div
          className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-teal-400/20 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"
          aria-hidden="true"
        ></div>
        <div
          className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-emerald-400/20 to-transparent rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"
          aria-hidden="true"
        ></div>

        <div className="container py-16 px-4 md:px-6 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-medium mb-4">
                <TrendingUp className="h-4 w-4 mr-2" />
                {seoTools.length}+ SEO Tools
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                SEO Analysis Suite
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Professional SEO tools that run entirely in your browser.
                Analyze content, optimize meta tags, and boost your search
                rankings—no account required, complete privacy guaranteed.
              </p>

              {/* Search Bar */}
              <div className="relative mb-8">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search SEO tools..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-3 text-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-emerald-200 dark:border-emerald-800 focus:border-emerald-400 dark:focus:border-emerald-600 rounded-lg shadow-sm"
                />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg p-4 text-center border border-emerald-200/50 dark:border-emerald-800/50">
                  <div className="flex items-center justify-center mb-2">
                    <Tags className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    5+
                  </div>
                  <div className="text-sm text-muted-foreground">Tools</div>
                </div>
                <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg p-4 text-center border border-teal-200/50 dark:border-teal-800/50">
                  <div className="flex items-center justify-center mb-2">
                    <BarChart3 className="h-5 w-5 text-teal-500" />
                  </div>
                  <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                    100%
                  </div>
                  <div className="text-sm text-muted-foreground">Private</div>
                </div>
                <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg p-4 text-center border border-cyan-200/50 dark:border-cyan-800/50">
                  <div className="flex items-center justify-center mb-2">
                    <TrendingUp className="h-5 w-5 text-cyan-500" />
                  </div>
                  <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                    Pro
                  </div>
                  <div className="text-sm text-muted-foreground">Quality</div>
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center text-sm bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                  <Shield className="h-4 w-4 mr-3 text-green-500" />
                  <span>Privacy First</span>
                </div>
                <div className="flex items-center text-sm bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                  <Zap className="h-4 w-4 mr-3 text-yellow-500" />
                  <span>Real-time Analysis</span>
                </div>
                <div className="flex items-center text-sm bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                  <Star className="h-4 w-4 mr-3 text-blue-500" />
                  <span>Professional Grade</span>
                </div>
                <div className="flex items-center text-sm bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                  <Target className="h-4 w-4 mr-3 text-purple-500" />
                  <span>SEO Best Practices</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6">
              {/* Featured SEO Tools */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Popular Tools</h3>
                    <Badge
                      variant="secondary"
                      className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                    >
                      Most Used
                    </Badge>
                  </div>
                  <div className="space-y-4">
                    <Link to="/seo/meta-tag-analyzer" className="block group">
                      <div className="flex items-center p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-lg border border-emerald-200/50 dark:border-emerald-800/50 group-hover:shadow-md transition-all">
                        <div className="bg-emerald-100 dark:bg-emerald-900/30 rounded-lg p-3 mr-4">
                          <Tags className="h-6 w-6 text-emerald-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            Meta Tag Analyzer
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Analyze and optimize meta tags for better SEO
                          </p>
                        </div>
                        <div className="text-emerald-500 group-hover:translate-x-1 transition-transform">
                          →
                        </div>
                      </div>
                    </Link>

                    <Link
                      to="/seo/keyword-density-analyzer"
                      className="block group"
                    >
                      <div className="flex items-center p-4 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-lg border border-teal-200/50 dark:border-teal-800/50 group-hover:shadow-md transition-all">
                        <div className="bg-teal-100 dark:bg-teal-900/30 rounded-lg p-3 mr-4">
                          <BarChart3 className="h-6 w-6 text-teal-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            Keyword Density Analyzer
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Analyze keyword frequency and distribution
                          </p>
                        </div>
                        <div className="text-teal-500 group-hover:translate-x-1 transition-transform">
                          →
                        </div>
                      </div>
                    </Link>

                    <Link
                      to="/seo/heading-structure-visualizer"
                      className="block group"
                    >
                      <div className="flex items-center p-4 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-lg border border-cyan-200/50 dark:border-cyan-800/50 group-hover:shadow-md transition-all">
                        <div className="bg-cyan-100 dark:bg-cyan-900/30 rounded-lg p-3 mr-4">
                          <AlignLeft className="h-6 w-6 text-cyan-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            Heading Structure Visualizer
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Visualize H1-H6 hierarchy for better SEO
                          </p>
                        </div>
                        <div className="text-cyan-500 group-hover:translate-x-1 transition-transform">
                          →
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Quick SEO Categories */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 overflow-hidden">
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4">SEO Categories</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-lg border border-emerald-200/50 dark:border-emerald-800/50">
                      <Tags className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                      <div className="text-sm font-medium">Content</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-lg border border-teal-200/50 dark:border-teal-800/50">
                      <BarChart3 className="h-8 w-8 text-teal-600 mx-auto mb-2" />
                      <div className="text-sm font-medium">Analysis</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-lg border border-cyan-200/50 dark:border-cyan-800/50">
                      <Link2 className="h-8 w-8 text-cyan-600 mx-auto mb-2" />
                      <div className="text-sm font-medium">Links</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
                      <Eye className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <div className="text-sm font-medium">Audit</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEO Categories Section */}
      <section className="container">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">SEO Tool Categories</h2>
          <p className="text-muted-foreground">
            Professional SEO analysis tools organized by functionality
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col items-center text-center hover:shadow-md transition-shadow">
            <div className="bg-emerald-100 dark:bg-emerald-900/30 rounded-full p-3 mb-4">
              <AlignLeft className="h-8 w-8 text-emerald-600" />
            </div>
            <h3 className="font-medium mb-2">Content Analysis</h3>
            <p className="text-sm text-muted-foreground">
              Meta tags, headings, keyword density
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col items-center text-center hover:shadow-md transition-shadow">
            <div className="bg-teal-100 dark:bg-teal-900/30 rounded-full p-3 mb-4">
              <Search className="h-8 w-8 text-teal-600" />
            </div>
            <h3 className="font-medium mb-2">Keyword Research</h3>
            <p className="text-sm text-muted-foreground">
              Density analysis, distribution
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col items-center text-center hover:shadow-md transition-shadow">
            <div className="bg-cyan-100 dark:bg-cyan-900/30 rounded-full p-3 mb-4">
              <Link2 className="h-8 w-8 text-cyan-600" />
            </div>
            <h3 className="font-medium mb-2">Link Analysis</h3>
            <p className="text-sm text-muted-foreground">
              Internal links, structure mapping
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col items-center text-center hover:shadow-md transition-shadow">
            <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-3 mb-4">
              <LineChart className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="font-medium mb-2">Technical SEO</h3>
            <p className="text-sm text-muted-foreground">
              Structure, accessibility, images
            </p>
          </div>
        </div>
      </section>

      {/* Featured Tool Section - Enhanced */}
      <section className="container">
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-xl overflow-hidden py-8 px-6">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center mb-2">
                <Sparkles className="h-5 w-5 mr-2 text-emerald-500" />
                <span className="text-sm font-medium text-emerald-500">
                  FEATURED TOOL
                </span>
              </div>
              <h2 className="text-2xl font-bold mb-4">Meta Tag Analyzer</h2>
              <p className="text-muted-foreground mb-6">
                Create optimized meta tags that improve your search engine
                visibility and click-through rates. Our intelligent meta tag
                generator helps you craft titles and descriptions that follow
                SEO best practices.
              </p>
              <div className="space-y-3">
                <div className="flex items-start">
                  <Search className="h-5 w-5 mr-2 text-emerald-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">SEO Best Practices</h4>
                    <p className="text-sm text-muted-foreground">
                      Get real-time feedback on title and description length and
                      keyword usage
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Globe className="h-5 w-5 mr-2 text-emerald-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Social Media Preview</h4>
                    <p className="text-sm text-muted-foreground">
                      See how your page will appear on Google, Facebook,
                      Twitter, and more
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 mr-2 text-emerald-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">One-Click HTML Generation</h4>
                    <p className="text-sm text-muted-foreground">
                      Generate HTML code for your meta tags with a single click
                      to copy and paste
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <Link to="/seo/meta-tag-analyzer">
                  <Button className="bg-emerald-600 hover:bg-emerald-700">
                    Try Meta Tag Analyzer
                  </Button>
                </Link>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border">
              <div className="p-6">
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-lg p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-medium">Meta Tag Analyzer</h3>
                    <div className="bg-white dark:bg-gray-800 px-3 py-1 rounded-full text-xs shadow-sm">
                      Preview Mode
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="text-sm font-medium mb-1 block">
                        Page Title
                      </label>
                      <div className="bg-white dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600 p-3 text-sm">
                        Best SEO Tools for 2025 | Free Online SEO Toolkit
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-muted-foreground">
                          58 characters
                        </span>
                        <span className="text-xs text-green-500">
                          Optimal length
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-1 block">
                        Meta Description
                      </label>
                      <div className="bg-white dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600 p-3 text-sm">
                        Improve your website's search visibility with our
                        collection of free SEO tools. Analyze content, generate
                        meta tags, and optimize your keywords.
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-muted-foreground">
                          146 characters
                        </span>
                        <span className="text-xs text-green-500">
                          Optimal length
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
                    <div className="bg-gray-50 dark:bg-gray-800 p-2 border-b border-gray-200 dark:border-gray-700 text-xs font-medium">
                      Google Search Preview
                    </div>
                    <div className="p-3">
                      <div className="text-blue-600 dark:text-blue-400 text-base font-medium truncate">
                        Best SEO Tools for 2025 | Free Online SEO Toolkit
                      </div>
                      <div className="text-green-600 dark:text-green-400 text-xs truncate mt-1">
                        https://toolnames.com/seo-tools
                      </div>
                      <div className="text-sm mt-1 text-gray-600 dark:text-gray-300 line-clamp-2">
                        Improve your website's search visibility with our
                        collection of free SEO tools. Analyze content, generate
                        meta tags, and optimize your keywords.
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-between">
                    <button className="text-xs px-3 py-1 rounded bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                      Toggle Preview
                    </button>
                    <button className="text-xs px-3 py-1 rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                      Copy HTML
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tools Grid Section with Enhanced Search */}
      <section>
        <div className="container">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  {searchQuery
                    ? `Search Results (${seoTools.length})`
                    : "SEO Tools"}
                </h2>
                <p className="text-muted-foreground">
                  {searchQuery
                    ? `Found ${seoTools.length} SEO tools matching "${searchQuery}"`
                    : "All SEO tools run entirely in your browser. Your data never leaves your device, ensuring complete privacy."}
                </p>
              </div>
              {searchQuery && (
                <Button
                  variant="outline"
                  onClick={() => setSearchQuery("")}
                  className="ml-4"
                >
                  Clear Search
                </Button>
              )}
            </div>
          </div>

          {searchQuery ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {seoTools.map((tool) => (
                <Link
                  key={tool.id}
                  to={tool.url}
                  className="group block bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-200 hover:border-emerald-300 dark:hover:border-emerald-600"
                >
                  <div className="flex items-start space-x-4">
                    <div className="bg-emerald-100 dark:bg-emerald-900/30 rounded-lg p-3 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-800/50 transition-colors">
                      <tool.icon className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {tool.title}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                        {tool.description}
                      </p>
                      <div className="mt-3 flex items-center text-emerald-600 dark:text-emerald-400 text-sm font-medium group-hover:translate-x-1 transition-transform">
                        Try it now →
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <ToolGrid />
          )}

          {searchQuery && seoTools.length === 0 && (
            <div className="text-center py-12">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No SEO tools found
              </h3>
              <p className="text-muted-foreground">
                Try searching for different terms or browse our SEO categories.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* SEO Best Practices Section - Enhanced */}
      <section className="bg-gray-50 dark:bg-gray-900/50 py-8 rounded-lg">
        <div className="container px-4 md:px-6">
          <h2 className="text-2xl font-bold mb-6">SEO Best Practices</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border relative group hover:shadow-md transition-all overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-100 dark:bg-emerald-900/20 rounded-full -mt-10 -mr-10 group-hover:scale-110 transition-all duration-300"></div>
              <h3 className="font-medium mb-3 flex items-center relative z-10">
                <AlignLeft className="h-5 w-5 mr-2 text-emerald-500" />
                Content Quality
              </h3>
              <p className="text-sm text-muted-foreground relative z-10">
                Create comprehensive, unique content that provides value to
                users. Focus on addressing user intent and include relevant
                keywords naturally.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border relative group hover:shadow-md transition-all overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-teal-100 dark:bg-teal-900/20 rounded-full -mt-10 -mr-10 group-hover:scale-110 transition-all duration-300"></div>
              <h3 className="font-medium mb-3 flex items-center relative z-10">
                <Tags className="h-5 w-5 mr-2 text-teal-500" />
                Meta Tag Optimization
              </h3>
              <p className="text-sm text-muted-foreground relative z-10">
                Write compelling titles (50-60 characters) and meta descriptions
                (150-160 characters) that include target keywords and encourage
                click-throughs.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border relative group hover:shadow-md transition-all overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-100 dark:bg-cyan-900/20 rounded-full -mt-10 -mr-10 group-hover:scale-110 transition-all duration-300"></div>
              <h3 className="font-medium mb-3 flex items-center relative z-10">
                <Activity className="h-5 w-5 mr-2 text-cyan-500" />
                Page Speed
              </h3>
              <p className="text-sm text-muted-foreground relative z-10">
                Optimize images, leverage browser caching, and minimize code to
                improve page load speed, as it's a significant ranking factor
                for both desktop and mobile searches.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SEOPage;
