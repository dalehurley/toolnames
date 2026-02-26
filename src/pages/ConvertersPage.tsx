import React, { useEffect, useState } from "react";
import { useTools } from "@/contexts/ToolsContext";
import { getCategoryName } from "@/contexts/toolsData";
import { ToolGrid } from "@/components/ToolGrid";
import {
  ArrowLeftRight,
  MoveHorizontal,
  Scale,
  Ruler,
  Thermometer,
  Globe,
  Search,
  Star,
  Zap,
  Shield,
  Sparkles,
  Palette,
  Hash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const ConvertersPage: React.FC = () => {
  const { setFilterCategory, filteredTools } = useTools();
  const category = "converters";
  const [searchQuery, setSearchQuery] = useState("");

  // Filter tools based on search query
  const converterTools = filteredTools.filter(
    (tool) =>
      tool.category === "converters" &&
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
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-violet-50 via-indigo-50 to-purple-100 dark:from-violet-950/30 dark:via-indigo-950/20 dark:to-purple-950/30 rounded-xl overflow-hidden">
        {/* Background decorative elements */}
        <div
          className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-indigo-400/20 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"
          aria-hidden="true"
        ></div>
        <div
          className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-violet-400/20 to-transparent rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"
          aria-hidden="true"
        ></div>

        <div className="container py-16 px-4 md:px-6 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-sm font-medium mb-4">
                <Sparkles className="h-4 w-4 mr-2" />
                {converterTools.length}+ Free Conversion Tools
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Universal Unit Conversion Made Simple
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Convert between different units, colors, numbers, and more with
                our comprehensive suite of conversion tools—all running securely
                in your browser.
              </p>

              {/* Search Bar */}
              <div className="relative mb-8">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search conversion tools..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-3 text-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-violet-200 dark:border-violet-800 focus:border-violet-400 dark:focus:border-violet-600 rounded-lg shadow-sm"
                />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg p-4 text-center border border-violet-200/50 dark:border-violet-800/50">
                  <div className="flex items-center justify-center mb-2">
                    <Ruler className="h-5 w-5 text-violet-500" />
                  </div>
                  <div className="text-2xl font-bold text-violet-600 dark:text-violet-400">
                    3+
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Unit Types
                  </div>
                </div>
                <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg p-4 text-center border border-indigo-200/50 dark:border-indigo-800/50">
                  <div className="flex items-center justify-center mb-2">
                    <Palette className="h-5 w-5 text-indigo-500" />
                  </div>
                  <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                    2+
                  </div>
                  <div className="text-sm text-muted-foreground">Color</div>
                </div>
                <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg p-4 text-center border border-purple-200/50 dark:border-purple-800/50">
                  <div className="flex items-center justify-center mb-2">
                    <Hash className="h-5 w-5 text-purple-500" />
                  </div>
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    2+
                  </div>
                  <div className="text-sm text-muted-foreground">Number</div>
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center text-sm bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                  <Shield className="h-4 w-4 mr-3 text-green-500" />
                  <span>100% Privacy Protected</span>
                </div>
                <div className="flex items-center text-sm bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                  <Zap className="h-4 w-4 mr-3 text-yellow-500" />
                  <span>Instant Conversion</span>
                </div>
                <div className="flex items-center text-sm bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                  <Star className="h-4 w-4 mr-3 text-blue-500" />
                  <span>High Precision Results</span>
                </div>
                <div className="flex items-center text-sm bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                  <ArrowLeftRight className="h-4 w-4 mr-3 text-violet-500" />
                  <span>Bidirectional Conversion</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6">
              {/* Featured Converter Tools */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">
                      Popular Converters
                    </h3>
                    <Badge
                      variant="secondary"
                      className="bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300"
                    >
                      Most Used
                    </Badge>
                  </div>
                  <div className="space-y-4">
                    <Link
                      to="/converters/unit-converter"
                      className="block group"
                    >
                      <div className="flex items-center p-4 bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-900/20 dark:to-indigo-900/20 rounded-lg border border-violet-200/50 dark:border-violet-800/50 group-hover:shadow-md transition-all">
                        <div className="bg-violet-100 dark:bg-violet-900/30 rounded-lg p-3 mr-4">
                          <ArrowLeftRight className="h-6 w-6 text-violet-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            Unit Converter
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Length, weight, temperature & more
                          </p>
                        </div>
                        <div className="text-violet-500 group-hover:translate-x-1 transition-transform">
                          →
                        </div>
                      </div>
                    </Link>

                    <Link
                      to="/converters/color-converter"
                      className="block group"
                    >
                      <div className="flex items-center p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg border border-indigo-200/50 dark:border-indigo-800/50 group-hover:shadow-md transition-all">
                        <div className="bg-indigo-100 dark:bg-indigo-900/30 rounded-lg p-3 mr-4">
                          <Palette className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            Color Converter
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            HEX, RGB, HSL & CMYK formats
                          </p>
                        </div>
                        <div className="text-indigo-500 group-hover:translate-x-1 transition-transform">
                          →
                        </div>
                      </div>
                    </Link>

                    <Link
                      to="/converters/temperature-converter"
                      className="block group"
                    >
                      <div className="flex items-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200/50 dark:border-purple-800/50 group-hover:shadow-md transition-all">
                        <div className="bg-purple-100 dark:bg-purple-900/30 rounded-lg p-3 mr-4">
                          <Thermometer className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            Temperature Converter
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Celsius, Fahrenheit & Kelvin
                          </p>
                        </div>
                        <div className="text-purple-500 group-hover:translate-x-1 transition-transform">
                          →
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Quick Conversion Types */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 overflow-hidden">
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Quick Convert</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-4 bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-900/20 dark:to-indigo-900/20 rounded-lg border border-violet-200/50 dark:border-violet-800/50">
                      <Ruler className="h-8 w-8 text-violet-600 mx-auto mb-2" />
                      <div className="text-sm font-medium">Units</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg border border-indigo-200/50 dark:border-indigo-800/50">
                      <Palette className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
                      <div className="text-sm font-medium">Colors</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200/50 dark:border-purple-800/50">
                      <Hash className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <div className="text-sm font-medium">Numbers</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 rounded-lg border border-pink-200/50 dark:border-pink-800/50">
                      <Globe className="h-8 w-8 text-pink-600 mx-auto mb-2" />
                      <div className="text-sm font-medium">Time</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Converter Categories Section */}
      <section className="container">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">Conversion Categories</h2>
          <p className="text-muted-foreground">
            Browse conversion tools by type and purpose
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col items-center text-center hover:shadow-md transition-shadow">
            <div className="bg-violet-100 dark:bg-violet-900/30 rounded-full p-3 mb-4">
              <Ruler className="h-8 w-8 text-violet-600" />
            </div>
            <h3 className="font-medium mb-2">Units</h3>
            <p className="text-sm text-muted-foreground">
              Length, weight, volume
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col items-center text-center hover:shadow-md transition-shadow">
            <div className="bg-indigo-100 dark:bg-indigo-900/30 rounded-full p-3 mb-4">
              <Palette className="h-8 w-8 text-indigo-600" />
            </div>
            <h3 className="font-medium mb-2">Colors</h3>
            <p className="text-sm text-muted-foreground">
              HEX, RGB, HSL formats
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col items-center text-center hover:shadow-md transition-shadow">
            <div className="bg-purple-100 dark:bg-purple-900/30 rounded-full p-3 mb-4">
              <Hash className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="font-medium mb-2">Numbers</h3>
            <p className="text-sm text-muted-foreground">
              Binary, hex, decimal
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col items-center text-center hover:shadow-md transition-shadow">
            <div className="bg-pink-100 dark:bg-pink-900/30 rounded-full p-3 mb-4">
              <Globe className="h-8 w-8 text-pink-600" />
            </div>
            <h3 className="font-medium mb-2">Global</h3>
            <p className="text-sm text-muted-foreground">
              Time zones, encodings
            </p>
          </div>
        </div>
      </section>

      {/* Featured Tool Section */}
      <section className="container">
        <div className="bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-950/30 dark:to-violet-950/30 rounded-xl overflow-hidden py-8 px-6">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center mb-2">
                <ArrowLeftRight className="h-5 w-5 mr-2 text-violet-500" />
                <span className="text-sm font-medium text-violet-500">
                  FEATURED CONVERTER
                </span>
              </div>
              <h2 className="text-2xl font-bold mb-4">
                Universal Unit Converter
              </h2>
              <p className="text-muted-foreground mb-6">
                A powerful unit conversion tool that handles over 100 different
                unit types across multiple categories. Whether you need to
                convert length, weight, volume, temperature, or more, our
                converter has you covered.
              </p>
              <div className="space-y-3">
                <div className="flex items-start">
                  <MoveHorizontal className="h-5 w-5 mr-2 text-violet-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Multiple Categories</h4>
                    <p className="text-sm text-muted-foreground">
                      Convert units across 12+ categories including length,
                      weight, volume, and more
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Globe className="h-5 w-5 mr-2 text-violet-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">International Standards</h4>
                    <p className="text-sm text-muted-foreground">
                      Supports both metric and imperial units with high
                      precision conversions
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <ArrowLeftRight className="h-5 w-5 mr-2 text-violet-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Bidirectional Conversion</h4>
                    <p className="text-sm text-muted-foreground">
                      Convert in either direction with real-time updates as you
                      type
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <Link to="/converters/unit-converter">
                  <Button>Try Unit Converter</Button>
                </Link>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border">
              <div className="p-6">
                <div className="bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-900/20 dark:to-indigo-900/20 rounded-lg p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-medium">Length Converter</h3>
                    <div className="bg-white dark:bg-gray-800 px-3 py-1 rounded-full text-xs shadow-sm">
                      Metric ⟷ Imperial
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">
                        From
                      </div>
                      <div className="flex mb-2">
                        <div className="h-10 flex-1 bg-white dark:bg-gray-700 rounded-l-md border border-gray-200 dark:border-gray-600"></div>
                        <div className="h-10 w-20 bg-violet-100 dark:bg-violet-900/30 border-y border-r border-gray-200 dark:border-gray-600 rounded-r-md flex items-center justify-center text-sm">
                          meters
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">
                        To
                      </div>
                      <div className="flex mb-2">
                        <div className="h-10 flex-1 bg-white dark:bg-gray-700 rounded-l-md border border-gray-200 dark:border-gray-600"></div>
                        <div className="h-10 w-20 bg-indigo-100 dark:bg-indigo-900/30 border-y border-r border-gray-200 dark:border-gray-600 rounded-r-md flex items-center justify-center text-sm">
                          feet
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center justify-center text-center">
                      <div>
                        <div className="text-xl font-medium">1</div>
                        <div className="text-xs text-muted-foreground">
                          meter
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-center text-center">
                      <div>
                        <div className="text-xl font-medium">3.28084</div>
                        <div className="text-xs text-muted-foreground">
                          feet
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center mt-4">
                    <ArrowLeftRight className="h-6 w-6 text-violet-500" />
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <div className="text-xs bg-white dark:bg-gray-800 p-2 border border-gray-200 dark:border-gray-700 rounded text-center">
                      <div className="font-medium">100 cm</div>
                      <div className="text-muted-foreground">1 m</div>
                    </div>
                    <div className="text-xs bg-white dark:bg-gray-800 p-2 border border-gray-200 dark:border-gray-700 rounded text-center">
                      <div className="font-medium">1 km</div>
                      <div className="text-muted-foreground">1000 m</div>
                    </div>
                    <div className="text-xs bg-white dark:bg-gray-800 p-2 border border-gray-200 dark:border-gray-700 rounded text-center">
                      <div className="font-medium">1 mi</div>
                      <div className="text-muted-foreground">1609.34 m</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tools Grid Section */}
      <section>
        <div className="container">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  {searchQuery
                    ? `Search Results (${converterTools.length})`
                    : "All Converter Tools"}
                </h2>
                <p className="text-muted-foreground">
                  {searchQuery
                    ? `Found ${converterTools.length} conversion tools matching "${searchQuery}"`
                    : "All converters run entirely in your browser with no server dependencies. Your data never leaves your device, ensuring complete privacy."}
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
              {converterTools.map((tool) => (
                <Link
                  key={tool.id}
                  to={tool.url}
                  className="group block bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-200 hover:border-violet-300 dark:hover:border-violet-600"
                >
                  <div className="flex items-start space-x-4">
                    <div className="bg-violet-100 dark:bg-violet-900/30 rounded-lg p-3 group-hover:bg-violet-200 dark:group-hover:bg-violet-800/50 transition-colors">
                      <tool.icon className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                        {tool.title}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                        {tool.description}
                      </p>
                      <div className="mt-3 flex items-center text-violet-600 dark:text-violet-400 text-sm font-medium group-hover:translate-x-1 transition-transform">
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

          {searchQuery && converterTools.length === 0 && (
            <div className="text-center py-12">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No conversion tools found
              </h3>
              <p className="text-muted-foreground">
                Try searching for different terms or browse our conversion
                categories.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Conversion Reference Section */}
      <section className="bg-gray-50 dark:bg-gray-900/50 py-8 rounded-lg">
        <div className="container px-4 md:px-6">
          <h2 className="text-2xl font-bold mb-6">
            Quick Conversion Reference
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
              <h3 className="font-medium mb-3 flex items-center">
                <Ruler className="h-5 w-5 mr-2 text-violet-500" />
                Length Conversions
              </h3>
              <p className="text-sm text-muted-foreground">
                1 inch = 2.54 cm
                <br />
                1 foot = 30.48 cm
                <br />
                1 meter = 3.28 feet
                <br />1 mile = 1.61 kilometers
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
              <h3 className="font-medium mb-3 flex items-center">
                <Scale className="h-5 w-5 mr-2 text-indigo-500" />
                Weight Conversions
              </h3>
              <p className="text-sm text-muted-foreground">
                1 kg = 2.20462 pounds
                <br />
                1 pound = 453.592 grams
                <br />
                1 stone = 14 pounds
                <br />1 ounce = 28.3495 grams
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
              <h3 className="font-medium mb-3 flex items-center">
                <Thermometer className="h-5 w-5 mr-2 text-blue-500" />
                Temperature Conversions
              </h3>
              <p className="text-sm text-muted-foreground">
                °F to °C: (°F - 32) × 5/9
                <br />
                °C to °F: (°C × 9/5) + 32
                <br />
                Freezing point of water: 0°C / 32°F
                <br />
                Boiling point of water: 100°C / 212°F
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ConvertersPage;
