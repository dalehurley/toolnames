import React, { useEffect, useState } from "react";
import { useTools } from "@/contexts/ToolsContext";
import { getCategoryName } from "@/contexts/toolsData";
import { ToolGrid } from "@/components/ToolGrid";
import {
  FileText,
  Key,
  QrCode,
  Wand2,
  Hash,
  Shuffle,
  Lock,
  Search,
  Star,
  Zap,
  Shield,
  Sparkles,
  Palette,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const GeneratorsPage: React.FC = () => {
  const { setFilterCategory, filteredTools } = useTools();
  const category = "generators";
  const [searchQuery, setSearchQuery] = useState("");

  // Filter tools based on search query
  const generatorTools = filteredTools.filter(
    (tool) =>
      tool.category === "generators" &&
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
      <section className="relative bg-gradient-to-br from-blue-50 via-cyan-50 to-emerald-100 dark:from-blue-950/30 dark:via-cyan-950/20 dark:to-emerald-950/30 rounded-xl overflow-hidden">
        {/* Background decorative elements */}
        <div
          className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-cyan-400/20 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"
          aria-hidden="true"
        ></div>
        <div
          className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-blue-400/20 to-transparent rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"
          aria-hidden="true"
        ></div>

        <div className="container py-16 px-4 md:px-6 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-4">
                <Sparkles className="h-4 w-4 mr-2" />
                {generatorTools.length}+ Free Generation Tools
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-cyan-600 to-emerald-600 bg-clip-text text-transparent">
                Generate Anything You Need Instantly
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Create secure passwords, QR codes, unique identifiers, color
                palettes, and more with our comprehensive suite of generation
                tools—all running securely in your browser.
              </p>

              {/* Search Bar */}
              <div className="relative mb-8">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search generation tools..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-3 text-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-blue-200 dark:border-blue-800 focus:border-blue-400 dark:focus:border-blue-600 rounded-lg shadow-sm"
                />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg p-4 text-center border border-blue-200/50 dark:border-blue-800/50">
                  <div className="flex items-center justify-center mb-2">
                    <Key className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    2+
                  </div>
                  <div className="text-sm text-muted-foreground">Security</div>
                </div>
                <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg p-4 text-center border border-cyan-200/50 dark:border-cyan-800/50">
                  <div className="flex items-center justify-center mb-2">
                    <QrCode className="h-5 w-5 text-cyan-500" />
                  </div>
                  <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                    2+
                  </div>
                  <div className="text-sm text-muted-foreground">Code</div>
                </div>
                <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg p-4 text-center border border-emerald-200/50 dark:border-emerald-800/50">
                  <div className="flex items-center justify-center mb-2">
                    <Palette className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    2+
                  </div>
                  <div className="text-sm text-muted-foreground">Creative</div>
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center text-sm bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                  <Shield className="h-4 w-4 mr-3 text-green-500" />
                  <span>Cryptographically Secure</span>
                </div>
                <div className="flex items-center text-sm bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                  <Zap className="h-4 w-4 mr-3 text-yellow-500" />
                  <span>Instant Generation</span>
                </div>
                <div className="flex items-center text-sm bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                  <Star className="h-4 w-4 mr-3 text-blue-500" />
                  <span>Professional Quality</span>
                </div>
                <div className="flex items-center text-sm bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                  <Lock className="h-4 w-4 mr-3 text-red-500" />
                  <span>Complete Privacy</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6">
              {/* Featured Generator Tools */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">
                      Popular Generators
                    </h3>
                    <Badge
                      variant="secondary"
                      className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                    >
                      Most Used
                    </Badge>
                  </div>
                  <div className="space-y-4">
                    <Link
                      to="/generators/password-generator"
                      className="block group"
                    >
                      <div className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg border border-blue-200/50 dark:border-blue-800/50 group-hover:shadow-md transition-all">
                        <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-3 mr-4">
                          <Lock className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            Password Generator
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Secure, customizable passwords
                          </p>
                        </div>
                        <div className="text-blue-500 group-hover:translate-x-1 transition-transform">
                          →
                        </div>
                      </div>
                    </Link>

                    <Link
                      to="/generators/qr-code-generator"
                      className="block group"
                    >
                      <div className="flex items-center p-4 bg-gradient-to-r from-cyan-50 to-emerald-50 dark:from-cyan-900/20 dark:to-emerald-900/20 rounded-lg border border-cyan-200/50 dark:border-cyan-800/50 group-hover:shadow-md transition-all">
                        <div className="bg-cyan-100 dark:bg-cyan-900/30 rounded-lg p-3 mr-4">
                          <QrCode className="h-6 w-6 text-cyan-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            QR Code Generator
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            URLs, text, contact info & more
                          </p>
                        </div>
                        <div className="text-cyan-500 group-hover:translate-x-1 transition-transform">
                          →
                        </div>
                      </div>
                    </Link>

                    <Link
                      to="/generators/hash-generator"
                      className="block group"
                    >
                      <div className="flex items-center p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-lg border border-emerald-200/50 dark:border-emerald-800/50 group-hover:shadow-md transition-all">
                        <div className="bg-emerald-100 dark:bg-emerald-900/30 rounded-lg p-3 mr-4">
                          <Hash className="h-6 w-6 text-emerald-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            Hash Generator
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            MD5, SHA-256, SHA-512 & more
                          </p>
                        </div>
                        <div className="text-emerald-500 group-hover:translate-x-1 transition-transform">
                          →
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Quick Generation Types */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 overflow-hidden">
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Quick Generate</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
                      <Lock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <div className="text-sm font-medium">Security</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-cyan-50 to-emerald-50 dark:from-cyan-900/20 dark:to-emerald-900/20 rounded-lg border border-cyan-200/50 dark:border-cyan-800/50">
                      <QrCode className="h-8 w-8 text-cyan-600 mx-auto mb-2" />
                      <div className="text-sm font-medium">Codes</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-lg border border-emerald-200/50 dark:border-emerald-800/50">
                      <FileText className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                      <div className="text-sm font-medium">Text</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-teal-50 to-indigo-50 dark:from-teal-900/20 dark:to-indigo-900/20 rounded-lg border border-teal-200/50 dark:border-teal-800/50">
                      <Hash className="h-8 w-8 text-teal-600 mx-auto mb-2" />
                      <div className="text-sm font-medium">Hashes</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Generator Categories Section */}
      <section className="container">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">Generation Categories</h2>
          <p className="text-muted-foreground">
            Browse generation tools by type and purpose
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col items-center text-center hover:shadow-md transition-shadow">
            <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-3 mb-4">
              <Lock className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="font-medium mb-2">Security</h3>
            <p className="text-sm text-muted-foreground">
              Passwords, hashes, UUIDs
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col items-center text-center hover:shadow-md transition-shadow">
            <div className="bg-cyan-100 dark:bg-cyan-900/30 rounded-full p-3 mb-4">
              <QrCode className="h-8 w-8 text-cyan-600" />
            </div>
            <h3 className="font-medium mb-2">Codes</h3>
            <p className="text-sm text-muted-foreground">QR codes, barcodes</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col items-center text-center hover:shadow-md transition-shadow">
            <div className="bg-emerald-100 dark:bg-emerald-900/30 rounded-full p-3 mb-4">
              <FileText className="h-8 w-8 text-emerald-600" />
            </div>
            <h3 className="font-medium mb-2">Text</h3>
            <p className="text-sm text-muted-foreground">
              Lorem ipsum, placeholder
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col items-center text-center hover:shadow-md transition-shadow">
            <div className="bg-indigo-100 dark:bg-indigo-900/30 rounded-full p-3 mb-4">
              <Palette className="h-8 w-8 text-indigo-600" />
            </div>
            <h3 className="font-medium mb-2">Creative</h3>
            <p className="text-sm text-muted-foreground">
              Colors, gradients, patterns
            </p>
          </div>
        </div>
      </section>

      {/* Featured Tool Section */}
      <section className="container">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl overflow-hidden py-8 px-6">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center mb-2">
                <Lock className="h-5 w-5 mr-2 text-blue-500" />
                <span className="text-sm font-medium text-blue-500">
                  FEATURED GENERATOR
                </span>
              </div>
              <h2 className="text-2xl font-bold mb-4">Password Generator</h2>
              <p className="text-muted-foreground mb-6">
                Create secure, random passwords with our advanced password
                generator. Customize length, character types, and generate
                multiple passwords at once. All generation happens in your
                browser for maximum security.
              </p>
              <div className="space-y-3">
                <div className="flex items-start">
                  <Shuffle className="h-5 w-5 mr-2 text-blue-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Customizable Complexity</h4>
                    <p className="text-sm text-muted-foreground">
                      Choose password length and which character types to
                      include
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Lock className="h-5 w-5 mr-2 text-blue-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">High Entropy Generation</h4>
                    <p className="text-sm text-muted-foreground">
                      Uses cryptographically secure random number generation
                      algorithms
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Wand2 className="h-5 w-5 mr-2 text-blue-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Password Strength Meter</h4>
                    <p className="text-sm text-muted-foreground">
                      Instantly see how strong your generated password is
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <Link to="/generators/password-generator">
                  <Button>Try Password Generator</Button>
                </Link>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border">
              <div className="p-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-medium">Password Generator</h3>
                    <div className="bg-white dark:bg-gray-800 px-3 py-1 rounded-full text-xs shadow-sm">
                      Security Level: High
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-md border border-gray-200 dark:border-gray-600 flex items-center justify-between">
                      <code className="text-sm font-mono text-blue-600 dark:text-blue-400">
                        X8q#2pL$7!mZ5vR9
                      </code>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Shuffle className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium">
                        Password Length
                      </label>
                      <div className="flex items-center">
                        <div className="h-2 flex-1 bg-gradient-to-r from-red-400 via-yellow-400 to-green-400 rounded-full"></div>
                        <span className="ml-2 text-sm font-medium">16</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center space-x-2">
                        <div className="h-4 w-4 rounded border border-gray-300 dark:border-gray-600 flex items-center justify-center bg-blue-500">
                          <svg
                            className="h-3 w-3 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                        <label className="text-sm">Uppercase</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="h-4 w-4 rounded border border-gray-300 dark:border-gray-600 flex items-center justify-center bg-blue-500">
                          <svg
                            className="h-3 w-3 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                        <label className="text-sm">Lowercase</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="h-4 w-4 rounded border border-gray-300 dark:border-gray-600 flex items-center justify-center bg-blue-500">
                          <svg
                            className="h-3 w-3 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                        <label className="text-sm">Numbers</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="h-4 w-4 rounded border border-gray-300 dark:border-gray-600 flex items-center justify-center bg-blue-500">
                          <svg
                            className="h-3 w-3 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                        <label className="text-sm">Symbols</label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Password Strength</span>
                      <span className="text-sm font-medium text-green-500">
                        Very Strong
                      </span>
                    </div>
                    <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: "90%" }}
                      ></div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Would take ~3 million years to crack with modern computing
                      power
                    </p>
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
                    ? `Search Results (${generatorTools.length})`
                    : "All Generator Tools"}
                </h2>
                <p className="text-muted-foreground">
                  {searchQuery
                    ? `Found ${generatorTools.length} generation tools matching "${searchQuery}"`
                    : "All generators run entirely in your browser. Your data never leaves your device, ensuring complete privacy."}
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
              {generatorTools.map((tool) => (
                <Link
                  key={tool.id}
                  to={tool.url}
                  className="group block bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-600"
                >
                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-3 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/50 transition-colors">
                      <tool.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {tool.title}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                        {tool.description}
                      </p>
                      <div className="mt-3 flex items-center text-blue-600 dark:text-blue-400 text-sm font-medium group-hover:translate-x-1 transition-transform">
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

          {searchQuery && generatorTools.length === 0 && (
            <div className="text-center py-12">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No generation tools found
              </h3>
              <p className="text-muted-foreground">
                Try searching for different terms or browse our generation
                categories.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Security Tips Section */}
      <section className="bg-gray-50 dark:bg-gray-900/50 py-8 rounded-lg">
        <div className="container px-4 md:px-6">
          <h2 className="text-2xl font-bold mb-6">Security Tips</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
              <h3 className="font-medium mb-3 flex items-center">
                <Lock className="h-5 w-5 mr-2 text-blue-500" />
                Password Best Practices
              </h3>
              <p className="text-sm text-muted-foreground">
                Use unique passwords for each account, at least 12 characters
                long, with a mix of uppercase, lowercase, numbers, and symbols.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
              <h3 className="font-medium mb-3 flex items-center">
                <Hash className="h-5 w-5 mr-2 text-indigo-500" />
                Hash Security
              </h3>
              <p className="text-sm text-muted-foreground">
                For security applications, use modern hash algorithms like
                SHA-256 or better. Never use MD5 or SHA-1 for securing sensitive
                data.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
              <h3 className="font-medium mb-3 flex items-center">
                <QrCode className="h-5 w-5 mr-2 text-cyan-500" />
                QR Code Safety
              </h3>
              <p className="text-sm text-muted-foreground">
                Before scanning a QR code, ensure it comes from a trusted
                source. Malicious QR codes can lead to phishing sites or
                download malware.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default GeneratorsPage;
