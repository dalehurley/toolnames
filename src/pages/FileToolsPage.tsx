import React, { useEffect, useState } from "react";
import { useTools } from "@/contexts/ToolsContext";
import { getCategoryName } from "@/contexts/toolsData";
import { ToolGrid } from "@/components/ToolGrid";
import {
  FileText,
  FileJson,
  FileSpreadsheet,
  FileImage,
  FilePlus,
  FileCode,
  FileMinus,
  FileArchive,
  Search,
  Star,
  Zap,
  Shield,
  Sparkles,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const FileToolsPage: React.FC = () => {
  const { setFilterCategory, filteredTools } = useTools();
  const category = "file-tools";
  const [searchQuery, setSearchQuery] = useState("");

  // Filter tools based on search query
  const fileTools = filteredTools.filter(
    (tool) =>
      tool.category === "file-tools" &&
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
      <section className="relative bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-100 dark:from-teal-950/30 dark:via-cyan-950/20 dark:to-blue-950/30 rounded-xl overflow-hidden">
        {/* Background decorative elements */}
        <div
          className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-cyan-400/20 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"
          aria-hidden="true"
        ></div>
        <div
          className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-teal-400/20 to-transparent rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"
          aria-hidden="true"
        ></div>

        <div className="container py-16 px-4 md:px-6 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 text-sm font-medium mb-4">
                <Sparkles className="h-4 w-4 mr-2" />
                {fileTools.length}+ Free File Tools
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent">
                Professional File Processing in Your Browser
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Convert, analyze, and manipulate files with complete privacy.
                All processing happens locally—your files never leave your
                device.
              </p>

              {/* Search Bar */}
              <div className="relative mb-8">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search file tools..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-3 text-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-teal-200 dark:border-teal-800 focus:border-teal-400 dark:focus:border-teal-600 rounded-lg shadow-sm"
                />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg p-4 text-center border border-teal-200/50 dark:border-teal-800/50">
                  <div className="flex items-center justify-center mb-2">
                    <FileJson className="h-5 w-5 text-teal-500" />
                  </div>
                  <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                    5+
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Data Tools
                  </div>
                </div>
                <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg p-4 text-center border border-cyan-200/50 dark:border-cyan-800/50">
                  <div className="flex items-center justify-center mb-2">
                    <FileImage className="h-5 w-5 text-cyan-500" />
                  </div>
                  <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                    3+
                  </div>
                  <div className="text-sm text-muted-foreground">Image</div>
                </div>
                <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg p-4 text-center border border-blue-200/50 dark:border-blue-800/50">
                  <div className="flex items-center justify-center mb-2">
                    <FileCode className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    4+
                  </div>
                  <div className="text-sm text-muted-foreground">Code</div>
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
                  <span>Instant Processing</span>
                </div>
                <div className="flex items-center text-sm bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                  <Star className="h-4 w-4 mr-3 text-blue-500" />
                  <span>Professional Quality</span>
                </div>
                <div className="flex items-center text-sm bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                  <Upload className="h-4 w-4 mr-3 text-teal-500" />
                  <span>No File Size Limits</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6">
              {/* Featured File Tools */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">
                      Popular File Tools
                    </h3>
                    <Badge
                      variant="secondary"
                      className="bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300"
                    >
                      Most Used
                    </Badge>
                  </div>
                  <div className="space-y-4">
                    <Link to="/file-tools/csv-explorer" className="block group">
                      <div className="flex items-center p-4 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-lg border border-teal-200/50 dark:border-teal-800/50 group-hover:shadow-md transition-all">
                        <div className="bg-teal-100 dark:bg-teal-900/30 rounded-lg p-3 mr-4">
                          <FileSpreadsheet className="h-6 w-6 text-teal-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            CSV Explorer
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Interactive data tables & analysis
                          </p>
                        </div>
                        <div className="text-teal-500 group-hover:translate-x-1 transition-transform">
                          →
                        </div>
                      </div>
                    </Link>

                    <Link
                      to="/file-tools/file-converter"
                      className="block group"
                    >
                      <div className="flex items-center p-4 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-lg border border-cyan-200/50 dark:border-cyan-800/50 group-hover:shadow-md transition-all">
                        <div className="bg-cyan-100 dark:bg-cyan-900/30 rounded-lg p-3 mr-4">
                          <FileText className="h-6 w-6 text-cyan-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            File Converter
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Convert between multiple formats
                          </p>
                        </div>
                        <div className="text-cyan-500 group-hover:translate-x-1 transition-transform">
                          →
                        </div>
                      </div>
                    </Link>

                    <Link
                      to="/file-tools/image-converter"
                      className="block group"
                    >
                      <div className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200/50 dark:border-blue-800/50 group-hover:shadow-md transition-all">
                        <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-3 mr-4">
                          <FileImage className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            Image Converter
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            JPG, PNG, WebP & more formats
                          </p>
                        </div>
                        <div className="text-blue-500 group-hover:translate-x-1 transition-transform">
                          →
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Quick Tools */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 overflow-hidden">
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Quick Tools</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-4 bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-lg border border-teal-200/50 dark:border-teal-800/50">
                      <FileSpreadsheet className="h-8 w-8 text-teal-600 mx-auto mb-2" />
                      <div className="text-sm font-medium">Data</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-lg border border-cyan-200/50 dark:border-cyan-800/50">
                      <FileImage className="h-8 w-8 text-cyan-600 mx-auto mb-2" />
                      <div className="text-sm font-medium">Images</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
                      <FileCode className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <div className="text-sm font-medium">Code</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg border border-indigo-200/50 dark:border-indigo-800/50">
                      <FileArchive className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
                      <div className="text-sm font-medium">Archive</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* File Categories Section */}
      <section className="container">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">
            File Processing Categories
          </h2>
          <p className="text-muted-foreground">
            Browse tools by file type and functionality
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col items-center text-center hover:shadow-md transition-shadow">
            <div className="bg-teal-100 dark:bg-teal-900/30 rounded-full p-3 mb-4">
              <FileSpreadsheet className="h-8 w-8 text-teal-600" />
            </div>
            <h3 className="font-medium mb-2">Data Files</h3>
            <p className="text-sm text-muted-foreground">
              CSV, JSON, XML processing
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col items-center text-center hover:shadow-md transition-shadow">
            <div className="bg-cyan-100 dark:bg-cyan-900/30 rounded-full p-3 mb-4">
              <FileImage className="h-8 w-8 text-cyan-600" />
            </div>
            <h3 className="font-medium mb-2">Image Files</h3>
            <p className="text-sm text-muted-foreground">
              Convert, resize, optimize
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col items-center text-center hover:shadow-md transition-shadow">
            <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-3 mb-4">
              <FileCode className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="font-medium mb-2">Code Files</h3>
            <p className="text-sm text-muted-foreground">
              Format, validate, convert
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col items-center text-center hover:shadow-md transition-shadow">
            <div className="bg-indigo-100 dark:bg-indigo-900/30 rounded-full p-3 mb-4">
              <FileArchive className="h-8 w-8 text-indigo-600" />
            </div>
            <h3 className="font-medium mb-2">Archives</h3>
            <p className="text-sm text-muted-foreground">
              Compress, extract files
            </p>
          </div>
        </div>
      </section>

      {/* Featured Tool Section */}
      <section className="container">
        <div className="bg-gradient-to-r from-cyan-50 to-teal-50 dark:from-cyan-950/30 dark:to-teal-950/30 rounded-xl overflow-hidden py-8 px-6">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center mb-2">
                <FileSpreadsheet className="h-5 w-5 mr-2 text-teal-500" />
                <span className="text-sm font-medium text-teal-500">
                  FEATURED TOOL
                </span>
              </div>
              <h2 className="text-2xl font-bold mb-4">CSV Explorer</h2>
              <p className="text-muted-foreground mb-6">
                Explore, analyze, and edit CSV data with our powerful CSV
                Explorer. Upload your CSV files and instantly view them in an
                interactive data table with searching, filtering, and editing
                capabilities.
              </p>
              <div className="space-y-3">
                <div className="flex items-start">
                  <FilePlus className="h-5 w-5 mr-2 text-teal-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Interactive Data Table</h4>
                    <p className="text-sm text-muted-foreground">
                      View, sort, filter, and edit your data with an intuitive
                      interface
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <FileText className="h-5 w-5 mr-2 text-teal-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Data Analysis</h4>
                    <p className="text-sm text-muted-foreground">
                      Get quick statistics and insights about your CSV data
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <FileMinus className="h-5 w-5 mr-2 text-teal-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Export Options</h4>
                    <p className="text-sm text-muted-foreground">
                      Save your data in various formats including CSV, JSON, and
                      Excel
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <Link to="/file-tools/csv-explorer">
                  <Button>Try CSV Explorer</Button>
                </Link>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border">
              <div className="p-6">
                <div className="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-lg p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-medium">CSV Explorer</h3>
                    <div className="bg-white dark:bg-gray-800 px-3 py-1 rounded-full text-xs shadow-sm">
                      538 rows × 12 columns
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm">
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                          <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                              <th
                                scope="col"
                                className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                              >
                                ID
                              </th>
                              <th
                                scope="col"
                                className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                              >
                                Name
                              </th>
                              <th
                                scope="col"
                                className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                              >
                                Category
                              </th>
                              <th
                                scope="col"
                                className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                              >
                                Value
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700 text-xs">
                            <tr>
                              <td className="px-4 py-2 whitespace-nowrap">
                                1001
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap">
                                Product A
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap">
                                Electronics
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap">
                                $299.99
                              </td>
                            </tr>
                            <tr className="bg-gray-50 dark:bg-gray-700/20">
                              <td className="px-4 py-2 whitespace-nowrap">
                                1002
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap">
                                Product B
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap">
                                Home & Kitchen
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap">
                                $149.50
                              </td>
                            </tr>
                            <tr>
                              <td className="px-4 py-2 whitespace-nowrap">
                                1003
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap">
                                Product C
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap">
                                Electronics
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap">
                                $399.00
                              </td>
                            </tr>
                            <tr className="bg-gray-50 dark:bg-gray-700/20">
                              <td className="px-4 py-2 whitespace-nowrap">
                                1004
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap">
                                Product D
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap">
                                Sports
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap">
                                $89.95
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex space-x-2">
                      <button className="px-2 py-1 bg-teal-100 dark:bg-teal-900/30 rounded text-xs text-teal-700 dark:text-teal-300">
                        Export
                      </button>
                      <button className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-700 dark:text-gray-300">
                        Filter
                      </button>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Showing 1-4 of 538 rows
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
                    ? `Search Results (${fileTools.length})`
                    : "All File Tools"}
                </h2>
                <p className="text-muted-foreground">
                  {searchQuery
                    ? `Found ${fileTools.length} file tools matching "${searchQuery}"`
                    : "All file processing happens in your browser. Your files never leave your device, ensuring complete privacy."}
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
              {fileTools.map((tool) => (
                <Link
                  key={tool.id}
                  to={tool.url}
                  className="group block bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-200 hover:border-teal-300 dark:hover:border-teal-600"
                >
                  <div className="flex items-start space-x-4">
                    <div className="bg-teal-100 dark:bg-teal-900/30 rounded-lg p-3 group-hover:bg-teal-200 dark:group-hover:bg-teal-800/50 transition-colors">
                      <tool.icon className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                        {tool.title}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                        {tool.description}
                      </p>
                      <div className="mt-3 flex items-center text-teal-600 dark:text-teal-400 text-sm font-medium group-hover:translate-x-1 transition-transform">
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

          {searchQuery && fileTools.length === 0 && (
            <div className="text-center py-12">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No file tools found
              </h3>
              <p className="text-muted-foreground">
                Try searching for different terms or browse our file categories.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* File Tips Section */}
      <section className="bg-gray-50 dark:bg-gray-900/50 py-8 rounded-lg">
        <div className="container px-4 md:px-6">
          <h2 className="text-2xl font-bold mb-6">File Handling Tips</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
              <h3 className="font-medium mb-3 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-teal-500" />
                CSV Best Practices
              </h3>
              <p className="text-sm text-muted-foreground">
                Always include a header row in CSV files to identify columns,
                and use consistent formatting for dates and numbers to ensure
                proper analysis.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
              <h3 className="font-medium mb-3 flex items-center">
                <FileImage className="h-5 w-5 mr-2 text-cyan-500" />
                Image Optimization
              </h3>
              <p className="text-sm text-muted-foreground">
                Resize images to the dimensions they'll be displayed at and use
                appropriate formats: JPEG for photos, PNG for graphics with
                transparency, SVG for icons.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
              <h3 className="font-medium mb-3 flex items-center">
                <FileArchive className="h-5 w-5 mr-2 text-indigo-500" />
                Compression Guidelines
              </h3>
              <p className="text-sm text-muted-foreground">
                Use ZIP compression for multiple files, but be aware that
                certain formats like JPEG and MP3 are already compressed, so
                compressing them further yields minimal benefits.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FileToolsPage;
