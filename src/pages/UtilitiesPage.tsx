import React, { useEffect, useState } from "react";
import { useTools } from "@/contexts/ToolsContext";
import { getCategoryName } from "@/contexts/toolsData";
import { ToolGrid } from "@/components/ToolGrid";
import {
  Clock,
  BookOpen,
  Wrench,
  Settings,
  Sparkles,
  Search,
  Star,
  Zap,
  Shield,
  FileText,
  Hash,
  Code,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const UtilitiesPage: React.FC = () => {
  const { setFilterCategory, filteredTools } = useTools();
  const category = "utilities";
  const [searchQuery, setSearchQuery] = useState("");

  // Filter tools based on search query
  const utilityTools = filteredTools.filter(
    (tool) =>
      tool.category === "utilities" &&
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
                <Sparkles className="h-4 w-4 mr-2" />
                {utilityTools.length}+ Essential Utilities
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                Everyday Utilities, Simplified
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Practical online tools to help with daily tasks, text
                processing, data formatting, and productivity. All utilities run
                directly in your browser with complete privacy.
              </p>

              {/* Search Bar */}
              <div className="relative mb-8">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search utility tools..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-3 text-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-emerald-200 dark:border-emerald-800 focus:border-emerald-400 dark:focus:border-emerald-600 rounded-lg shadow-sm"
                />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg p-4 text-center border border-emerald-200/50 dark:border-emerald-800/50">
                  <div className="flex items-center justify-center mb-2">
                    <FileText className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    5+
                  </div>
                  <div className="text-sm text-muted-foreground">Text</div>
                </div>
                <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg p-4 text-center border border-teal-200/50 dark:border-teal-800/50">
                  <div className="flex items-center justify-center mb-2">
                    <Clock className="h-5 w-5 text-teal-500" />
                  </div>
                  <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                    3+
                  </div>
                  <div className="text-sm text-muted-foreground">Time</div>
                </div>
                <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg p-4 text-center border border-cyan-200/50 dark:border-cyan-800/50">
                  <div className="flex items-center justify-center mb-2">
                    <Code className="h-5 w-5 text-cyan-500" />
                  </div>
                  <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                    4+
                  </div>
                  <div className="text-sm text-muted-foreground">Dev</div>
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center text-sm bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                  <Shield className="h-4 w-4 mr-3 text-green-500" />
                  <span>Privacy-First Processing</span>
                </div>
                <div className="flex items-center text-sm bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                  <Zap className="h-4 w-4 mr-3 text-yellow-500" />
                  <span>Instant Results</span>
                </div>
                <div className="flex items-center text-sm bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                  <Star className="h-4 w-4 mr-3 text-blue-500" />
                  <span>Professional Quality</span>
                </div>
                <div className="flex items-center text-sm bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                  <Wrench className="h-4 w-4 mr-3 text-orange-500" />
                  <span>Easy to Use</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6">
              {/* Featured Utility Tools */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Popular Utilities</h3>
                    <Badge
                      variant="secondary"
                      className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                    >
                      Most Used
                    </Badge>
                  </div>
                  <div className="space-y-4">
                    <Link
                      to="/utilities/text-case-converter"
                      className="block group"
                    >
                      <div className="flex items-center p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-lg border border-emerald-200/50 dark:border-emerald-800/50 group-hover:shadow-md transition-all">
                        <div className="bg-emerald-100 dark:bg-emerald-900/30 rounded-lg p-3 mr-4">
                          <FileText className="h-6 w-6 text-emerald-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            Text Case Converter
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            UPPERCASE, lowercase, Title Case, etc.
                          </p>
                        </div>
                        <div className="text-emerald-500 group-hover:translate-x-1 transition-transform">
                          →
                        </div>
                      </div>
                    </Link>

                    <Link
                      to="/utilities/countdown-timer"
                      className="block group"
                    >
                      <div className="flex items-center p-4 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-lg border border-teal-200/50 dark:border-teal-800/50 group-hover:shadow-md transition-all">
                        <div className="bg-teal-100 dark:bg-teal-900/30 rounded-lg p-3 mr-4">
                          <Clock className="h-6 w-6 text-teal-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            Countdown Timer
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Custom timers with alerts
                          </p>
                        </div>
                        <div className="text-teal-500 group-hover:translate-x-1 transition-transform">
                          →
                        </div>
                      </div>
                    </Link>

                    <Link
                      to="/utilities/json-formatter"
                      className="block group"
                    >
                      <div className="flex items-center p-4 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-lg border border-cyan-200/50 dark:border-cyan-800/50 group-hover:shadow-md transition-all">
                        <div className="bg-cyan-100 dark:bg-cyan-900/30 rounded-lg p-3 mr-4">
                          <Code className="h-6 w-6 text-cyan-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            JSON Formatter
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Format & validate JSON data
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

              {/* Quick Utility Types */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 overflow-hidden">
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Quick Tools</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-lg border border-emerald-200/50 dark:border-emerald-800/50">
                      <FileText className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                      <div className="text-sm font-medium">Text</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-lg border border-teal-200/50 dark:border-teal-800/50">
                      <Clock className="h-8 w-8 text-teal-600 mx-auto mb-2" />
                      <div className="text-sm font-medium">Time</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-lg border border-cyan-200/50 dark:border-cyan-800/50">
                      <Code className="h-8 w-8 text-cyan-600 mx-auto mb-2" />
                      <div className="text-sm font-medium">Dev</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
                      <Hash className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <div className="text-sm font-medium">Data</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Utility Categories Section */}
      <section className="container">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">Utility Categories</h2>
          <p className="text-muted-foreground">
            Browse utility tools by type and purpose
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col items-center text-center hover:shadow-md transition-shadow">
            <div className="bg-emerald-100 dark:bg-emerald-900/30 rounded-full p-3 mb-4">
              <FileText className="h-8 w-8 text-emerald-600" />
            </div>
            <h3 className="font-medium mb-2">Text Processing</h3>
            <p className="text-sm text-muted-foreground">
              Case conversion, formatting, counting
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col items-center text-center hover:shadow-md transition-shadow">
            <div className="bg-teal-100 dark:bg-teal-900/30 rounded-full p-3 mb-4">
              <Clock className="h-8 w-8 text-teal-600" />
            </div>
            <h3 className="font-medium mb-2">Time & Productivity</h3>
            <p className="text-sm text-muted-foreground">Timers, counters</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col items-center text-center hover:shadow-md transition-shadow">
            <div className="bg-cyan-100 dark:bg-cyan-900/30 rounded-full p-3 mb-4">
              <Code className="h-8 w-8 text-cyan-600" />
            </div>
            <h3 className="font-medium mb-2">Developer Tools</h3>
            <p className="text-sm text-muted-foreground">
              JSON, URL encoding, RegEx
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col items-center text-center hover:shadow-md transition-shadow">
            <div className="bg-indigo-100 dark:bg-indigo-900/30 rounded-full p-3 mb-4">
              <Hash className="h-8 w-8 text-indigo-600" />
            </div>
            <h3 className="font-medium mb-2">Data Analysis</h3>
            <p className="text-sm text-muted-foreground">
              Charts, schemas, comparisons
            </p>
          </div>
        </div>
      </section>

      {/* Featured Tool Section */}
      <section className="container">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-xl overflow-hidden py-8 px-6">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center mb-2">
                <Clock className="h-5 w-5 mr-2 text-emerald-500" />
                <span className="text-sm font-medium text-emerald-500">
                  FEATURED UTILITY
                </span>
              </div>
              <h2 className="text-2xl font-bold mb-4">Pomodoro Timer</h2>
              <p className="text-muted-foreground mb-6">
                Boost your productivity with our customizable Pomodoro Timer.
                The Pomodoro Technique is a time management method that uses
                alternating work and break periods to improve focus and
                productivity.
              </p>
              <div className="space-y-3">
                <div className="flex items-start">
                  <Settings className="h-5 w-5 mr-2 text-emerald-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Customizable Intervals</h4>
                    <p className="text-sm text-muted-foreground">
                      Set your preferred work and break durations to match your
                      workflow
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Sparkles className="h-5 w-5 mr-2 text-emerald-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Audio Notifications</h4>
                    <p className="text-sm text-muted-foreground">
                      Get alerted when your work or break period ends with
                      customizable sound options
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Wrench className="h-5 w-5 mr-2 text-emerald-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Session Tracking</h4>
                    <p className="text-sm text-muted-foreground">
                      Keep track of completed pomodoro sessions with visual
                      progress indicators
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <Link to="/utilities/pomodoro-timer">
                  <Button>Try Pomodoro Timer</Button>
                </Link>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border">
              <div className="p-6">
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-lg p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-medium">Pomodoro Timer</h3>
                    <div className="bg-white dark:bg-gray-800 px-3 py-1 rounded-full text-xs shadow-sm">
                      Work Session
                    </div>
                  </div>

                  <div className="flex justify-center mb-6">
                    <div className="w-48 h-48 relative flex items-center justify-center rounded-full bg-white dark:bg-gray-800 shadow-md">
                      <div
                        className="absolute inset-0 rounded-full border-8 border-emerald-500"
                        style={{
                          clipPath: "polygon(0% 0%, 100% 0%, 100% 35%, 0% 35%)",
                        }}
                      ></div>
                      <div className="text-4xl font-bold text-gray-900 dark:text-white">
                        21:37
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center space-x-4 mb-6">
                    <button className="p-3 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                      </svg>
                    </button>
                    <button className="p-3 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect
                          x="4"
                          y="4"
                          width="16"
                          height="16"
                          rx="2"
                          ry="2"
                        ></rect>
                      </svg>
                    </button>
                    <button className="p-3 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                      </svg>
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Session</span>
                      <span className="font-medium">2/4</span>
                    </div>
                    <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: "50%" }}
                      ></div>
                    </div>
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      <div className="h-2 bg-emerald-500 rounded-full"></div>
                      <div className="h-2 bg-emerald-500 rounded-full"></div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
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
                    ? `Search Results (${utilityTools.length})`
                    : "All Utility Tools"}
                </h2>
                <p className="text-muted-foreground">
                  {searchQuery
                    ? `Found ${utilityTools.length} utility tools matching "${searchQuery}"`
                    : "All utilities run entirely in your browser. Your data never leaves your device, ensuring complete privacy."}
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
              {utilityTools.map((tool) => (
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

          {searchQuery && utilityTools.length === 0 && (
            <div className="text-center py-12">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No utility tools found
              </h3>
              <p className="text-muted-foreground">
                Try searching for different terms or browse our utility
                categories.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Productivity Tips Section */}
      <section className="bg-gray-50 dark:bg-gray-900/50 py-8 rounded-lg">
        <div className="container px-4 md:px-6">
          <h2 className="text-2xl font-bold mb-6">Productivity Tips</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
              <h3 className="font-medium mb-3 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-emerald-500" />
                Pomodoro Technique
              </h3>
              <p className="text-sm text-muted-foreground">
                Work in focused 25-minute intervals with short breaks in
                between. Complete four sessions, then take a longer break to
                maintain productivity.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
              <h3 className="font-medium mb-3 flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-teal-500" />
                Eat That Frog
              </h3>
              <p className="text-sm text-muted-foreground">
                Start your day by tackling the most challenging or important
                task first. This builds momentum and makes the rest of your
                tasks seem easier.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
              <h3 className="font-medium mb-3 flex items-center">
                <Wrench className="h-5 w-5 mr-2 text-green-500" />
                2-Minute Rule
              </h3>
              <p className="text-sm text-muted-foreground">
                If a task takes less than two minutes to complete, do it
                immediately rather than putting it off. This prevents small
                tasks from piling up.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default UtilitiesPage;
