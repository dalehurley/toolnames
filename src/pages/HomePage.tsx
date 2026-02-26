import React from "react";
import { useEffect, useState, useCallback, memo, useRef } from "react";
import { useTools } from "@/contexts/ToolsContext";
import { useSEO } from "@/hooks/useSEO";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Tool } from "@/contexts/toolsData";

// Import only the icons we need
import {
  Calculator,
  RotateCcw,
  Shapes,
  Settings,
  Search,
  Filter,
  ChevronRight,
  Dices,
  ArrowUp,
  KeyRound,
  FileType,
  Clock,
  Palette,
} from "lucide-react";

// Memoized Tool Card component for better performance
const ToolCard = memo(({ tool, index }: { tool: Tool; index: number }) => (
  <div
    key={tool.id}
    className="animate-in fade-in slide-in-from-bottom-4 hover:scale-105 transition-all duration-300 ease-out"
    style={{
      animationDelay: `${0.2 + index * 0.15}s`,
      animationFillMode: "both",
    }}
  >
    <Link
      to={tool.url}
      className="bg-white dark:bg-slate-800 rounded-xl p-5 flex flex-col items-center justify-center text-center gap-2 h-full shadow-sm hover:shadow-md transition-all border border-slate-100 dark:border-slate-700"
      aria-label={`Open ${tool.title} tool`}
    >
      <div className="bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-700 dark:to-slate-800 p-4 rounded-full">
        <tool.icon className="h-7 w-7 text-indigo-500" aria-hidden="true" />
      </div>
      <span className="font-medium mt-2 text-slate-900 dark:text-white">
        {tool.title}
      </span>
    </Link>
  </div>
));

ToolCard.displayName = "ToolCard";

// Memoized Category Card component
const CategoryCard = memo(
  ({
    category,
    icon: Icon,
    color,
    description,
    delay,
    toolCount,
  }: {
    category: string;
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
    color: string;
    description: string;
    delay: number;
    toolCount: number;
  }) => (
    <div
      className="animate-in fade-in slide-in-from-bottom-4 hover:-translate-y-1 transition-all duration-300"
      style={{
        animationDelay: `${delay}s`,
        animationFillMode: "both",
      }}
    >
      <Link to={`/${category.toLowerCase()}`} className="group block">
        <div
          className={`border border-${color}/10 rounded-lg p-6 h-full hover:shadow-lg transition-all duration-300 hover:border-${color} text-center group-hover:bg-gradient-to-br group-hover:from-${color}/5 group-hover:to-${color}/10`}
        >
          <div
            className={`bg-gradient-to-br from-${color}/20 to-${color}/5 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 transform group-hover:scale-110 transition-transform duration-300`}
          >
            <Icon className={`h-8 w-8 text-${color}`} aria-hidden="true" />
          </div>
          <h3
            className={`font-medium mb-1 group-hover:text-${color} transition-colors`}
          >
            {category.replace("-", " ")}
          </h3>
          <p className="text-sm text-muted-foreground mb-2">{description}</p>
          {toolCount > 0 && (
            <span className={`text-xs font-medium text-${color} bg-${color}/10 px-2 py-0.5 rounded-full`}>
              {toolCount} tools
            </span>
          )}
        </div>
      </Link>
    </div>
  )
);

CategoryCard.displayName = "CategoryCard";

// Memoized Search Result component
const SearchResult = memo(
  ({
    tool,
    index,
    onSelect,
  }: {
    tool: Tool;
    index: number;
    onSelect: () => void;
  }) => (
    <div
      key={tool.id}
      className="animate-in fade-in slide-in-from-top-2 transition-all duration-200"
      style={{
        animationDelay: `${index * 0.05}s`,
        animationFillMode: "both",
      }}
    >
      <Link
        to={tool.url}
        className="block p-4 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 flex items-center border-b border-indigo-100 dark:border-indigo-800/20 last:border-0 transition-colors"
        onClick={onSelect}
      >
        <div className="bg-gradient-to-br from-indigo-100 to-indigo-50 dark:from-indigo-900/30 dark:to-indigo-800/10 p-2 rounded-full mr-3">
          <tool.icon className="h-5 w-5 text-indigo-500" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium">{tool.title}</div>
          <div className="text-sm text-muted-foreground truncate">
            {tool.description}
          </div>
        </div>
      </Link>
    </div>
  )
);

SearchResult.displayName = "SearchResult";

const HomePage = () => {
  const { setFilterCategory, tools } = useTools();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Tool[]>([]);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [greeting, setGreeting] = useState("Welcome to ToolNames");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // SEO configuration for homepage
  useSEO({
    title: "ToolNames: Your Hub for Free, Privacy-Focused Online Tools",
    description:
      "Discover a comprehensive suite of 50+ free, browser-based online tools designed for productivity, development, and everyday tasks. Explore calculators, converters, generators, text utilities, SEO tools, design aids, and more. All tools run locally in your browser, ensuring complete data privacy and security. No sign-ups required.",
    keywords:
      "free online tools, browser tools, privacy tools, calculators, converters, generators, text utilities, SEO tools, design tools, developer utilities, productivity software, local processing, no sign-up tools, ToolNames",
    ogTitle: "ToolNames: Free & Private Online Tools for Every Need",
    ogDescription:
      "Boost your productivity with over 50 free, secure, and browser-based tools. Calculators, converters, generators, and more - all private and ready to use instantly.",
    ogType: "website",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "ToolNames",
      url: window.location.origin,
      description:
        "A comprehensive collection of free, browser-based online tools for various tasks, prioritizing user privacy and client-side processing.",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${window.location.origin}/search?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
      provider: {
        "@type": "Organization",
        name: "ToolNames",
        url: window.location.origin,
        logo: `${window.location.origin}/logo.png`, // Assuming you have a logo.png in public
      },
      about: [
        {
          "@type": "Thing",
          name: "Online Calculators",
          description:
            "Financial, mathematical, health, and utility calculators.",
        },
        {
          "@type": "Thing",
          name: "Data Converters",
          description:
            "Tools for converting units, file formats, and data encodings.",
        },
        {
          "@type": "Thing",
          name: "Content Generators",
          description:
            "Generate passwords, QR codes, Lorem Ipsum, UUIDs, and more.",
        },
        {
          "@type": "Thing",
          name: "Text Utilities",
          description: "Tools for text manipulation, formatting, and analysis.",
        },
        {
          "@type": "Thing",
          name: "SEO Tools",
          description: "Utilities for analyzing and optimizing website SEO.",
        },
        {
          "@type": "Thing",
          name: "Design Tools",
          description:
            "Tools for color palettes, CSS generation, and layout design.",
        },
      ],
      mentions: [
        // Mentions can refer to the categories or types of tools offered
        { "@type": "Thing", name: "Calculators" },
        { "@type": "Thing", name: "Converters" },
        { "@type": "Thing", name: "Generators" },
        { "@type": "Thing", name: "Utilities" },
        { "@type": "Thing", name: "File Tools" },
        { "@type": "Thing", name: "SEO Tools" },
        { "@type": "Thing", name: "Design Tools" },
        { "@type": "Thing", name: "Productivity Tools" },
        { "@type": "Thing", name: "Lottery Tools" },
      ],
    },
  });

  // Get popular/featured tools (mix of different categories)
  const featuredTools = [
    tools.find((t) => t.id === "password-generator"),
    tools.find((t) => t.id === "qr-code-generator"),
    tools.find((t) => t.id === "mortgage-calculator"),
    tools.find((t) => t.id === "unit-converter"),
    tools.find((t) => t.id === "color-converter"),
    tools.find((t) => t.id === "json-formatter"),
  ].filter(Boolean) as Tool[];

  useEffect(() => {
    // Reset the filter category when the homepage loads
    setFilterCategory("all");

    // Set greeting based on time of day
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setGreeting("Good Morning from ToolNames");
    } else if (hour >= 12 && hour < 18) {
      setGreeting("Good Afternoon from ToolNames");
    } else {
      setGreeting("Good Evening from ToolNames");
    }

    // Add CSS for grid patterns
    const style = document.createElement("style");
    style.innerHTML = `
      .bg-grid-slate-200\\50 {
        background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(226 232 240 / 0.5)'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e");
      }
      .bg-grid-slate-700\\25 {
        background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(51 65 85 / 0.25)'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e");
      }
    `;
    document.head.appendChild(style);

    // Add scroll event listener for the back to top button
    const handleScroll = () => {
      if (window.scrollY > 500) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    // Global "/" keyboard shortcut to focus search
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("keydown", handleKeyDown);
      // Clean up the injected style element
      if (style && document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, [setFilterCategory]);

  // Handle search functionality with debounce
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchQuery.trim() === "") {
        setSearchResults([]);
        return;
      }

      const query = searchQuery.toLowerCase();
      const results = tools
        .filter(
          (tool) =>
            tool.title.toLowerCase().includes(query) ||
            tool.description.toLowerCase().includes(query) ||
            tool.category.toLowerCase().includes(query)
        )
        .slice(0, 8); // Limit to 8 results

      setSearchResults(results);
    }, 150); // Small debounce for better performance

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, tools]);

  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  // Category configuration
  const categories = [
    {
      name: "Calculators",
      icon: Calculator,
      color: "indigo-500",
      description:
        "Free online calculators for finance, math, health, and daily problem-solving. Includes mortgage, BMI, compound interest tools, and more.",
      delay: 0.1,
    },
    {
      name: "Converters",
      icon: RotateCcw,
      color: "violet-500",
      description:
        "Versatile converters for units (length, weight, temp), data formats (JSON, Base64), colors (HEX, RGB), and number bases.",
      delay: 0.2,
    },
    {
      name: "Generators",
      icon: Shapes,
      color: "blue-500",
      description:
        "Generate secure passwords, QR codes for URLs/text, Lorem Ipsum placeholder text, UUIDs, and cryptographic hashes.",
      delay: 0.3,
    },
    {
      name: "Utilities",
      icon: Settings,
      color: "emerald-500",
      description:
        "Handy text manipulation tools, URL encoders/decoders, JSON formatters, character counters, and other web utilities.",
      delay: 0.4,
    },
    {
      name: "File-Tools",
      icon: FileType,
      color: "teal-500",
      description:
        "Convert images, explore CSV data, and handle file format conversions entirely in your browser — no uploads needed.",
      delay: 0.5,
    },
    {
      name: "Design",
      icon: Palette,
      color: "amber-500",
      description:
        "Visual tools for CSS flexbox/grid generation, color palettes, spacing visualizers, and responsive layout builders.",
      delay: 0.6,
    },
    {
      name: "SEO",
      icon: Search,
      color: "rose-500",
      description:
        "Analyze keyword density, meta tags, heading structure, alt text, and internal links to improve your site's SEO.",
      delay: 0.7,
    },
    {
      name: "Productivity",
      icon: Clock,
      color: "purple-500",
      description:
        "Boost your workflow with a Pomodoro timer, Kanban board, habit tracker, notes, time-blocking calendar, and more.",
      delay: 0.8,
    },
    {
      name: "Lottery",
      icon: Dices,
      color: "green-500",
      description:
        "Explore lottery number generators, odds calculators, historical data analyzers, and wheeling systems.",
      delay: 0.9,
    },
  ];

  // Get category colors for tool sections
  const categoryColors: Record<string, string> = {
    calculators: "indigo-500",
    converters: "violet-500",
    generators: "blue-500",
    utilities: "emerald-500",
    "file-tools": "teal-500",
    seo: "rose-500",
    productivity: "purple-500",
    design: "amber-500",
    lottery: "green-500",
  };

  return (
    <>
      <div className="space-y-12">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-200 dark:from-slate-900 dark:to-slate-800 rounded-xl p-10 shadow-xl relative overflow-hidden">
          {/* Decorative elements with subtle animations */}
          <div
            className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 mix-blend-multiply dark:mix-blend-soft-light"
            aria-hidden="true"
          ></div>
          <div
            className="absolute bottom-0 left-0 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 mix-blend-multiply dark:mix-blend-soft-light"
            aria-hidden="true"
          ></div>
          <div
            className="absolute top-1/2 left-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-soft-light"
            aria-hidden="true"
          ></div>

          {/* Grid pattern background */}
          <div
            className="absolute inset-0 bg-grid-slate-200\\50 dark:bg-grid-slate-700\\25 bg-[center_top_-1px] [mask-image:linear-gradient(to_bottom,white,transparent_60%)] dark:[mask-image:linear-gradient(to_bottom,white,transparent_75%)]"
            aria-hidden="true"
          ></div>

          <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-12 relative z-10">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-6xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
                  <span className="inline-block bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">
                    {greeting}
                  </span>
                </h1>
                <h2 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
                  Free Online Tools to Boost Your Productivity.
                </h2>
              </div>

              <p className="text-xl text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed">
                Access <strong>{tools.length}+ powerful tools</strong> that run
                entirely in your browser. No sign-ups, no data sharing –
                everything processes locally for maximum privacy and security.
              </p>

              {/* Stats inline */}
              <div className="flex flex-wrap gap-6 text-sm">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="font-medium">
                    {tools.length}+ Free Tools
                  </span>
                </div>
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="font-medium">100% Privacy Focused</span>
                </div>
                <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400">
                  <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse"></div>
                  <span className="font-medium">No Registration Required</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 pt-4">
                <Button
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-lg rounded-xl px-8 h-14 text-base font-semibold transform hover:scale-105 transition-all focus:ring-2 focus:ring-indigo-500/50"
                >
                  <Link to="/generators/password-generator">
                    <KeyRound className="mr-2 h-5 w-5" aria-hidden="true" />
                    Try Password Generator
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl px-8 h-14 text-base font-semibold transform hover:scale-105 transition-all focus:ring-2 focus:ring-indigo-500/50"
                  onClick={() => {
                    document.getElementById("featured-tools")?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  <Search className="mr-2 h-5 w-5" aria-hidden="true" />
                  Browse Popular Tools
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent mb-2">
                  ✨ Quick Start
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Popular tools to get you started
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {featuredTools.slice(0, 4).map((tool, index) => (
                  <div
                    key={tool.id}
                    className="animate-in fade-in slide-in-from-right-4 hover:scale-105 transition-all duration-300 ease-out"
                    style={{
                      animationDelay: `${0.3 + index * 0.1}s`,
                      animationFillMode: "both",
                    }}
                  >
                    <Link
                      to={tool.url}
                      className="bg-white/80 backdrop-blur-sm dark:bg-slate-800/80 rounded-xl p-4 flex flex-col items-center justify-center text-center gap-2 h-24 shadow-sm hover:shadow-lg transition-all border border-slate-200/50 dark:border-slate-700/50 group"
                      aria-label={`Open ${tool.title} tool`}
                    >
                      <div className="bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-700 dark:to-slate-800 p-2 rounded-lg group-hover:scale-110 transition-transform">
                        <tool.icon
                          className="h-5 w-5 text-indigo-500"
                          aria-hidden="true"
                        />
                      </div>
                      <span className="font-medium text-xs text-slate-900 dark:text-white leading-tight">
                        {tool.title}
                      </span>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
            <div className="animate-bounce">
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
                className="text-slate-400 dark:text-slate-500"
              >
                <path d="M12 5v14M5 12l7 7 7-7" />
              </svg>
            </div>
            <span className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Scroll down
            </span>
          </div>
        </div>

        {/* Quick Search Section */}
        <div className="bg-gradient-to-br from-indigo-50 via-violet-50 to-indigo-50 dark:from-indigo-900/20 dark:via-violet-900/10 dark:to-indigo-900/10 rounded-lg p-8 shadow-md relative overflow-hidden">
          {/* Decorative elements */}
          <div
            className="absolute -top-16 -right-16 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl"
            aria-hidden="true"
          ></div>
          <div
            className="absolute -bottom-16 -left-16 w-32 h-32 bg-violet-500/10 rounded-full blur-2xl"
            aria-hidden="true"
          ></div>

          <div className="max-w-2xl mx-auto relative z-10">
            <h2 className="text-2xl font-bold tracking-tight mb-6 text-center bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">
              Find The Tool You Need
            </h2>
            <div className="relative">
              <Input
                ref={searchInputRef}
                type="text"
                placeholder="Search for calculators, converters, generators..."
                className="w-full pl-12 pr-24 py-6 text-lg border-indigo-200 dark:border-indigo-800/50 focus-visible:ring-indigo-400 shadow-md hover:shadow-lg transition-shadow rounded-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search tools"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-full">
                <Search
                  className="h-5 w-5 text-indigo-500"
                  aria-hidden="true"
                />
              </div>
              {!searchQuery && (
                <kbd className="absolute right-4 top-1/2 transform -translate-y-1/2 hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs font-mono text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded">
                  /
                </kbd>
              )}
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
                  aria-label="Clear search"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M15 5L5 15M5 5L15 15"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              )}
            </div>

            {searchResults.length > 0 && (
              <div
                className="absolute z-10 w-full mt-2 bg-background/90 backdrop-blur-sm rounded-lg shadow-lg border border-indigo-100 dark:border-indigo-800/20 overflow-hidden"
                role="listbox"
              >
                {searchResults.map((tool, index) => (
                  <SearchResult
                    key={tool.id}
                    tool={tool}
                    index={index}
                    onSelect={clearSearch}
                  />
                ))}

                <div className="p-3 bg-muted/50 border-t border-indigo-100 dark:border-indigo-800/20 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Found {searchResults.length} results
                  </span>
                  <button
                    onClick={() => {
                      const q = searchQuery.trim();
                      clearSearch();
                      navigate(`/sitemap?q=${encodeURIComponent(q)}`);
                    }}
                    className="text-indigo-500 hover:text-indigo-700 font-medium flex items-center gap-1"
                  >
                    View all <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            )}

            <div className="text-center mt-3 text-sm text-muted-foreground">
              <p>
                Try searching for "calculator", "convert", "password", or browse
                categories below
              </p>
            </div>
          </div>
        </div>

        {/* Category Navigation */}
        {/* Featured Tools Section */}
        <section id="featured-tools" className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">
              🔥 Most Popular Tools
            </h2>
            <p className="text-muted-foreground text-lg">
              The tools our users love most – try them now!
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredTools.map((tool, index) => (
              <div
                key={tool.id}
                className="animate-in fade-in slide-in-from-bottom-4 hover:scale-105 transition-all duration-300 ease-out"
                style={{
                  animationDelay: `${0.1 + index * 0.1}s`,
                  animationFillMode: "both",
                }}
              >
                <Link
                  to={tool.url}
                  className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-xl p-6 flex flex-col items-center justify-center text-center gap-4 h-full shadow-md hover:shadow-xl transition-all border border-slate-200/50 dark:border-slate-700/50 group relative overflow-hidden"
                  aria-label={`Open ${tool.title} tool`}
                >
                  {index < 3 && (
                    <div className="absolute top-2 right-2 bg-gradient-to-r from-orange-400 to-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                      Hot
                    </div>
                  )}
                  <div className="bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-900/30 dark:to-violet-900/30 p-4 rounded-full group-hover:scale-110 transition-transform">
                    <tool.icon
                      className="h-8 w-8 text-indigo-500"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {tool.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {tool.description}
                    </p>
                  </div>
                  <div className="mt-auto pt-4 text-xs text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                    Try it now{" "}
                    <ChevronRight className="h-3 w-3 ml-1" aria-hidden="true" />
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Categories Section */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">
              Browse by Category
            </h2>
            <p className="text-muted-foreground text-lg">
              Find the perfect tool for your specific needs
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {categories.map((category) => (
              <CategoryCard
                key={category.name}
                category={category.name}
                icon={category.icon}
                color={category.color}
                description={category.description}
                delay={category.delay}
                toolCount={tools.filter((t) => t.category === category.name.toLowerCase().replace(" ", "-")).length}
              />
            ))}
          </div>
        </section>

        {/* Enhanced Statistics Section */}
        <div className="bg-gradient-to-br from-indigo-50 via-violet-50 to-slate-100 dark:from-indigo-900/20 dark:via-violet-900/10 dark:to-slate-800/30 rounded-2xl p-12 shadow-xl relative overflow-hidden">
          {/* Enhanced decorative elements */}
          <div
            className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-violet-500/15 to-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 animate-pulse"
            aria-hidden="true"
          ></div>
          <div
            className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-indigo-500/15 to-blue-500/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 animate-pulse"
            aria-hidden="true"
          ></div>
          <div
            className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-violet-300/5 to-indigo-300/5 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2"
            aria-hidden="true"
          ></div>

          <div className="text-center mb-12 relative z-10">
            <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent mb-4">
              🚀 Why Choose ToolNames?
            </h2>
            <p className="text-muted-foreground text-xl max-w-2xl mx-auto leading-relaxed">
              Join thousands of users who trust ToolNames for their daily
              productivity needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10 mb-8">
            <div className="bg-white/60 backdrop-blur-sm dark:bg-slate-800/60 p-8 rounded-2xl border border-indigo-200/50 dark:border-indigo-700/30 shadow-lg hover:shadow-2xl transition-all duration-300 text-center space-y-4 group hover:border-indigo-300/70 dark:hover:border-indigo-600/50 hover:-translate-y-2">
              <div className="relative">
                <div className="text-indigo-500 text-6xl font-bold bg-gradient-to-br from-indigo-500 to-violet-500 bg-clip-text text-transparent group-hover:scale-110 transform transition-transform duration-300">
                  {tools.length}+
                </div>
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-emerald-400 to-emerald-500 text-white text-xs px-2 py-1 rounded-full font-medium animate-bounce">
                  Growing
                </div>
              </div>
              <h3 className="font-semibold text-xl text-slate-900 dark:text-white">
                Free Tools
              </h3>
              <div className="w-20 h-1.5 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full mx-auto group-hover:w-24 transition-all duration-300"></div>
              <p className="text-muted-foreground leading-relaxed">
                A comprehensive library of tools that covers everything from
                calculators to generators
              </p>
            </div>

            <div className="bg-white/60 backdrop-blur-sm dark:bg-slate-800/60 p-8 rounded-2xl border border-violet-200/50 dark:border-violet-700/30 shadow-lg hover:shadow-2xl transition-all duration-300 text-center space-y-4 group hover:border-violet-300/70 dark:hover:border-violet-600/50 hover:-translate-y-2">
              <div className="relative">
                <div className="text-violet-500 text-6xl font-bold bg-gradient-to-br from-violet-500 to-purple-500 bg-clip-text text-transparent group-hover:scale-110 transform transition-transform duration-300">
                  100%
                </div>
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-green-400 to-green-500 text-white text-xs px-2 py-1 rounded-full font-medium animate-bounce">
                  Private
                </div>
              </div>
              <h3 className="font-semibold text-xl text-slate-900 dark:text-white">
                Client-Side Processing
              </h3>
              <div className="w-20 h-1.5 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full mx-auto group-hover:w-24 transition-all duration-300"></div>
              <p className="text-muted-foreground leading-relaxed">
                Your data never leaves your device. Everything runs locally for
                maximum privacy
              </p>
            </div>

            <div className="bg-white/60 backdrop-blur-sm dark:bg-slate-800/60 p-8 rounded-2xl border border-blue-200/50 dark:border-blue-700/30 shadow-lg hover:shadow-2xl transition-all duration-300 text-center space-y-4 group hover:border-blue-300/70 dark:hover:border-blue-600/50 hover:-translate-y-2">
              <div className="relative">
                <div className="text-blue-500 text-6xl font-bold bg-gradient-to-br from-blue-500 to-indigo-500 bg-clip-text text-transparent group-hover:scale-110 transform transition-transform duration-300">
                  24/7
                </div>
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-400 to-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium animate-bounce">
                  Ready
                </div>
              </div>
              <h3 className="font-semibold text-xl text-slate-900 dark:text-white">
                Always Available
              </h3>
              <div className="w-20 h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mx-auto group-hover:w-24 transition-all duration-300"></div>
              <p className="text-muted-foreground leading-relaxed">
                Access tools anytime, anywhere. Works offline once loaded in
                your browser
              </p>
            </div>
          </div>

          {/* Additional benefits */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
            <div className="text-center space-y-2 p-4 rounded-xl bg-white/30 dark:bg-slate-800/30 backdrop-blur-sm">
              <div className="text-2xl">⚡</div>
              <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Lightning Fast
              </div>
            </div>
            <div className="text-center space-y-2 p-4 rounded-xl bg-white/30 dark:bg-slate-800/30 backdrop-blur-sm">
              <div className="text-2xl">🔒</div>
              <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Secure & Private
              </div>
            </div>
            <div className="text-center space-y-2 p-4 rounded-xl bg-white/30 dark:bg-slate-800/30 backdrop-blur-sm">
              <div className="text-2xl">📱</div>
              <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Mobile Friendly
              </div>
            </div>
            <div className="text-center space-y-2 p-4 rounded-xl bg-white/30 dark:bg-slate-800/30 backdrop-blur-sm">
              <div className="text-2xl">🆓</div>
              <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Always Free
              </div>
            </div>
          </div>
        </div>

        {/* Quick Access to Popular Tools */}
        <section className="space-y-8" id="popular-by-category">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">
              🎯 Popular by Category
            </h2>
            <p className="text-muted-foreground text-lg">
              Quick access to the most used tools in each category
            </p>
          </div>

          {/* Show top tools from each category */}
          <div className="space-y-10">
            {[
              "calculators",
              "converters",
              "generators",
              "utilities",
              "productivity",
              "design",
            ].map((category) => {
              const categoryTools = tools
                .filter((tool) => tool.category === category)
                .slice(0, 6); // Show only top 6 per category

              const color = categoryColors[category] || "indigo-500";
              const colorClass = color;

              if (categoryTools.length === 0) return null;

              return (
                <div key={category} className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <h3
                        className={`text-2xl font-bold capitalize text-${colorClass}`}
                      >
                        {category.replace("-", " ")}
                      </h3>
                      <div
                        className={`px-3 py-1 bg-${colorClass}/10 text-${colorClass} text-sm font-medium rounded-full`}
                      >
                        {tools.filter((t) => t.category === category).length}{" "}
                        tools
                      </div>
                    </div>

                    <Link
                      to={`/${category}`}
                      className={`text-sm font-medium text-${colorClass} hover:text-${colorClass}/80 flex items-center group transition-colors bg-${colorClass}/5 hover:bg-${colorClass}/10 px-4 py-2 rounded-full`}
                    >
                      View all {category}
                      <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categoryTools.map((tool, toolIndex) => (
                      <div
                        key={tool.id}
                        className="animate-in fade-in slide-in-from-bottom-2 transition-all duration-300"
                        style={{
                          animationDelay: `${0.05 + toolIndex * 0.03}s`,
                          animationFillMode: "both",
                        }}
                      >
                        <Link
                          to={tool.url}
                          className="group block h-full"
                          aria-label={`Open ${tool.title} tool`}
                        >
                          <div
                            className={`border border-${colorClass}/10 hover:border-${colorClass}/30 rounded-xl p-6 hover:shadow-lg transition-all h-full flex flex-col bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-800/50 dark:to-slate-900/50 group-hover:bg-gradient-to-br group-hover:from-${colorClass}/5 group-hover:to-${colorClass}/10`}
                          >
                            <div className="flex items-start mb-4">
                              <div
                                className={`bg-${colorClass}/10 p-3 rounded-xl mr-3 group-hover:scale-110 group-hover:bg-${colorClass}/20 transition-all duration-300`}
                              >
                                <tool.icon
                                  className={`h-6 w-6 text-${colorClass}`}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4
                                  className={`font-semibold text-lg mb-1 group-hover:text-${colorClass} transition-colors leading-tight`}
                                >
                                  {tool.title}
                                </h4>
                              </div>
                            </div>
                            <p className="text-muted-foreground text-sm leading-relaxed flex-grow mb-4">
                              {tool.description}
                            </p>
                            <div
                              className={`text-xs text-${colorClass} opacity-0 group-hover:opacity-100 transition-opacity flex items-center font-medium`}
                            >
                              Try this tool{" "}
                              <ChevronRight className="h-3 w-3 ml-1" />
                            </div>
                          </div>
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA to view all tools */}
          <div className="text-center pt-8">
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-xl px-8 py-6 text-base font-semibold border-2 hover:scale-105 transition-all"
            >
              <Link to="/sitemap">
                <Filter className="mr-2 h-5 w-5" />
                Browse All {tools.length}+ Tools
              </Link>
            </Button>
          </div>
        </section>
      </div>

      {/* Back to Top Button */}
      {showBackToTop && (
        <Button
          className="fixed bottom-6 right-6 rounded-full w-12 h-12 p-0 shadow-lg bg-gradient-to-tr from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 hover:shadow-md hover:shadow-indigo-500/20 transform hover:scale-110 transition-all duration-300 border-none"
          onClick={scrollToTop}
          aria-label="Back to top"
        >
          <ArrowUp className="h-5 w-5 text-white" aria-hidden="true" />
        </Button>
      )}
    </>
  );
};

export default HomePage;
