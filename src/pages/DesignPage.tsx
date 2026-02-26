import React, { useEffect, useState } from "react";
import { useTools } from "@/contexts/ToolsContext";
import { getCategoryName } from "@/contexts/toolsData";
import {
  Palette,
  Grid,
  Layers,
  PenTool,
  Image as ImageIcon,
  Copy,
  Check,
  Layout,
  Box,
  Maximize,
  Columns,
  Code,
  Search,
  Star,
  Zap,
  Shield,
  Sparkles,
  Wand2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

// Define color inspiration palettes with their Tailwind classes
interface ColorPalette {
  name: string;
  tailwindClasses: string;
  gradientClasses: string;
  category: "vibrant" | "pastel" | "monochromatic" | "earth" | "dark";
}

const colorPalettes: ColorPalette[] = [
  // Vibrant Palettes
  {
    name: "Vibrant Purples",
    tailwindClasses: "bg-gradient-to-r from-purple-500 to-pink-500",
    gradientClasses: "from-purple-500 to-pink-500",
    category: "vibrant",
  },
  {
    name: "Ocean Blues",
    tailwindClasses: "bg-gradient-to-r from-blue-500 to-teal-500",
    gradientClasses: "from-blue-500 to-teal-500",
    category: "vibrant",
  },
  {
    name: "Sunset Tones",
    tailwindClasses: "bg-gradient-to-r from-amber-500 to-red-500",
    gradientClasses: "from-amber-500 to-red-500",
    category: "vibrant",
  },
  {
    name: "Natural Greens",
    tailwindClasses: "bg-gradient-to-r from-green-500 to-emerald-500",
    gradientClasses: "from-green-500 to-emerald-500",
    category: "vibrant",
  },
  {
    name: "Bright Citrus",
    tailwindClasses: "bg-gradient-to-r from-yellow-400 to-orange-500",
    gradientClasses: "from-yellow-400 to-orange-500",
    category: "vibrant",
  },
  {
    name: "Berry Blast",
    tailwindClasses: "bg-gradient-to-r from-fuchsia-600 to-pink-600",
    gradientClasses: "from-fuchsia-600 to-pink-600",
    category: "vibrant",
  },
  {
    name: "Electric Blue",
    tailwindClasses: "bg-gradient-to-r from-blue-600 to-indigo-500",
    gradientClasses: "from-blue-600 to-indigo-500",
    category: "vibrant",
  },
  // New Vibrant Palettes
  {
    name: "Tropical Fusion",
    tailwindClasses: "bg-gradient-to-r from-green-400 to-cyan-500",
    gradientClasses: "from-green-400 to-cyan-500",
    category: "vibrant",
  },
  {
    name: "Hot Flame",
    tailwindClasses: "bg-gradient-to-r from-orange-500 to-red-600",
    gradientClasses: "from-orange-500 to-red-600",
    category: "vibrant",
  },
  {
    name: "Purple Haze",
    tailwindClasses: "bg-gradient-to-r from-indigo-500 to-purple-600",
    gradientClasses: "from-indigo-500 to-purple-600",
    category: "vibrant",
  },
  {
    name: "Neon Dreams",
    tailwindClasses: "bg-gradient-to-r from-pink-500 to-violet-500",
    gradientClasses: "from-pink-500 to-violet-500",
    category: "vibrant",
  },

  // Pastel Palettes
  {
    name: "Soft Peach",
    tailwindClasses: "bg-gradient-to-r from-orange-200 to-rose-200",
    gradientClasses: "from-orange-200 to-rose-200",
    category: "pastel",
  },
  {
    name: "Lavender Dreams",
    tailwindClasses: "bg-gradient-to-r from-purple-200 to-indigo-200",
    gradientClasses: "from-purple-200 to-indigo-200",
    category: "pastel",
  },
  {
    name: "Mint Breeze",
    tailwindClasses: "bg-gradient-to-r from-green-200 to-teal-200",
    gradientClasses: "from-green-200 to-teal-200",
    category: "pastel",
  },
  {
    name: "Baby Blue",
    tailwindClasses: "bg-gradient-to-r from-blue-200 to-cyan-200",
    gradientClasses: "from-blue-200 to-cyan-200",
    category: "pastel",
  },
  {
    name: "Sandy Beach",
    tailwindClasses: "bg-gradient-to-r from-amber-200 to-yellow-200",
    gradientClasses: "from-amber-200 to-yellow-200",
    category: "pastel",
  },
  {
    name: "Cotton Candy",
    tailwindClasses: "bg-gradient-to-r from-pink-200 to-purple-200",
    gradientClasses: "from-pink-200 to-purple-200",
    category: "pastel",
  },
  // New Pastel Palettes
  {
    name: "Soft Sage",
    tailwindClasses: "bg-gradient-to-r from-gray-200 to-green-200",
    gradientClasses: "from-gray-200 to-green-200",
    category: "pastel",
  },
  {
    name: "Blush Rose",
    tailwindClasses: "bg-gradient-to-r from-red-200 to-pink-100",
    gradientClasses: "from-red-200 to-pink-100",
    category: "pastel",
  },
  {
    name: "Lilac Mist",
    tailwindClasses: "bg-gradient-to-r from-purple-100 to-blue-100",
    gradientClasses: "from-purple-100 to-blue-100",
    category: "pastel",
  },
  {
    name: "Creamy Lemon",
    tailwindClasses: "bg-gradient-to-r from-yellow-100 to-amber-100",
    gradientClasses: "from-yellow-100 to-amber-100",
    category: "pastel",
  },

  // Monochromatic Palettes
  {
    name: "Blue Shades",
    tailwindClasses: "bg-gradient-to-r from-blue-700 to-blue-300",
    gradientClasses: "from-blue-700 to-blue-300",
    category: "monochromatic",
  },
  {
    name: "Green Shades",
    tailwindClasses: "bg-gradient-to-r from-green-700 to-green-300",
    gradientClasses: "from-green-700 to-green-300",
    category: "monochromatic",
  },
  {
    name: "Purple Shades",
    tailwindClasses: "bg-gradient-to-r from-purple-700 to-purple-300",
    gradientClasses: "from-purple-700 to-purple-300",
    category: "monochromatic",
  },
  {
    name: "Red Shades",
    tailwindClasses: "bg-gradient-to-r from-red-700 to-red-300",
    gradientClasses: "from-red-700 to-red-300",
    category: "monochromatic",
  },
  {
    name: "Gray Scale",
    tailwindClasses: "bg-gradient-to-r from-gray-800 to-gray-300",
    gradientClasses: "from-gray-800 to-gray-300",
    category: "monochromatic",
  },
  // New Monochromatic Palettes
  {
    name: "Teal Gradient",
    tailwindClasses: "bg-gradient-to-r from-teal-700 to-teal-300",
    gradientClasses: "from-teal-700 to-teal-300",
    category: "monochromatic",
  },
  {
    name: "Indigo Flow",
    tailwindClasses: "bg-gradient-to-r from-indigo-800 to-indigo-400",
    gradientClasses: "from-indigo-800 to-indigo-400",
    category: "monochromatic",
  },
  {
    name: "Amber Tones",
    tailwindClasses: "bg-gradient-to-r from-amber-600 to-amber-300",
    gradientClasses: "from-amber-600 to-amber-300",
    category: "monochromatic",
  },
  {
    name: "Pink Spectrum",
    tailwindClasses: "bg-gradient-to-r from-pink-700 to-pink-300",
    gradientClasses: "from-pink-700 to-pink-300",
    category: "monochromatic",
  },

  // Earth Tones
  {
    name: "Forest Blend",
    tailwindClasses: "bg-gradient-to-r from-green-900 to-emerald-700",
    gradientClasses: "from-green-900 to-emerald-700",
    category: "earth",
  },
  {
    name: "Desert Sand",
    tailwindClasses: "bg-gradient-to-r from-yellow-700 to-amber-500",
    gradientClasses: "from-yellow-700 to-amber-500",
    category: "earth",
  },
  {
    name: "Terracotta",
    tailwindClasses: "bg-gradient-to-r from-orange-800 to-red-700",
    gradientClasses: "from-orange-800 to-red-700",
    category: "earth",
  },
  {
    name: "Moss & Stone",
    tailwindClasses: "bg-gradient-to-r from-stone-700 to-lime-800",
    gradientClasses: "from-stone-700 to-lime-800",
    category: "earth",
  },
  {
    name: "Clay & Soil",
    tailwindClasses: "bg-gradient-to-r from-amber-800 to-stone-600",
    gradientClasses: "from-amber-800 to-stone-600",
    category: "earth",
  },
  // New Earth Tones Palettes
  {
    name: "Autumn Leaves",
    tailwindClasses: "bg-gradient-to-r from-yellow-800 to-red-800",
    gradientClasses: "from-yellow-800 to-red-800",
    category: "earth",
  },
  {
    name: "Olive Grove",
    tailwindClasses: "bg-gradient-to-r from-stone-600 to-olive-700",
    gradientClasses: "from-stone-600 to-olive-700",
    category: "earth",
  },
  {
    name: "Cedar & Pine",
    tailwindClasses: "bg-gradient-to-r from-emerald-800 to-green-900",
    gradientClasses: "from-emerald-800 to-green-900",
    category: "earth",
  },
  {
    name: "Mountain Range",
    tailwindClasses: "bg-gradient-to-r from-slate-700 to-gray-800",
    gradientClasses: "from-slate-700 to-gray-800",
    category: "earth",
  },

  // Dark Themes
  {
    name: "Midnight",
    tailwindClasses: "bg-gradient-to-r from-gray-900 to-slate-800",
    gradientClasses: "from-gray-900 to-slate-800",
    category: "dark",
  },
  {
    name: "Deep Ocean",
    tailwindClasses: "bg-gradient-to-r from-blue-900 to-slate-900",
    gradientClasses: "from-blue-900 to-slate-900",
    category: "dark",
  },
  {
    name: "Dark Forest",
    tailwindClasses: "bg-gradient-to-r from-green-900 to-emerald-900",
    gradientClasses: "from-green-900 to-emerald-900",
    category: "dark",
  },
  {
    name: "Dark Cherry",
    tailwindClasses: "bg-gradient-to-r from-red-900 to-rose-900",
    gradientClasses: "from-red-900 to-rose-900",
    category: "dark",
  },
  {
    name: "Dark Violet",
    tailwindClasses: "bg-gradient-to-r from-indigo-900 to-purple-900",
    gradientClasses: "from-indigo-900 to-purple-900",
    category: "dark",
  },
  // New Dark Themes Palettes
  {
    name: "Cosmic Void",
    tailwindClasses: "bg-gradient-to-r from-slate-950 to-purple-950",
    gradientClasses: "from-slate-950 to-purple-950",
    category: "dark",
  },
  {
    name: "Deep Crimson",
    tailwindClasses: "bg-gradient-to-r from-gray-900 to-red-950",
    gradientClasses: "from-gray-900 to-red-950",
    category: "dark",
  },
  {
    name: "Abyss Blue",
    tailwindClasses: "bg-gradient-to-r from-slate-900 to-blue-950",
    gradientClasses: "from-slate-900 to-blue-950",
    category: "dark",
  },
  {
    name: "Emerald Night",
    tailwindClasses: "bg-gradient-to-r from-gray-950 to-emerald-950",
    gradientClasses: "from-gray-950 to-emerald-950",
    category: "dark",
  },
];

const DesignPage: React.FC = () => {
  const { setFilterCategory, filteredTools } = useTools();
  const category = "design";
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copyMessage, setCopyMessage] = useState<string>("");
  const [showCopyMessage, setShowCopyMessage] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("layout");

  // Filter tools based on search query
  const designTools = filteredTools.filter(
    (tool) =>
      tool.category === "design" &&
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

  // Handle copying Tailwind CSS classes
  const handleCopyTailwind = (palette: ColorPalette, index: number) => {
    // Copy the Tailwind classes to clipboard
    navigator.clipboard.writeText(palette.tailwindClasses);

    // Set the copied index for visual feedback
    setCopiedIndex(index);

    // Set copy message with the copied classes
    setCopyMessage(`Copied: ${palette.tailwindClasses}`);

    // Show the copy message
    setShowCopyMessage(true);

    // Reset the copied state after a delay
    setTimeout(() => {
      setCopiedIndex(null);
      setShowCopyMessage(false);
    }, 2000);
  };

  // Filter tools by subcategory
  const layoutTools = filteredTools.filter(
    (tool) =>
      tool.url.includes("container-builder") ||
      tool.url.includes("grid-generator") ||
      tool.url.includes("flexbox-generator")
  );

  const colorTools = filteredTools.filter(
    (tool) => tool.url.includes("color") || tool.url.includes("palette")
  );

  const otherTools = filteredTools.filter(
    (tool) => !layoutTools.includes(tool) && !colorTools.includes(tool)
  );

  return (
    <div className="space-y-12 pb-8">
      {/* Hero Section - Enhanced with modern design */}
      <section className="relative bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100 dark:from-purple-950/30 dark:via-pink-950/20 dark:to-indigo-950/30 rounded-xl overflow-hidden">
        {/* Background decorative elements */}
        <div
          className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-pink-400/20 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"
          aria-hidden="true"
        ></div>
        <div
          className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-purple-400/20 to-transparent rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"
          aria-hidden="true"
        ></div>

        <div className="container py-16 px-4 md:px-6 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium mb-4">
                <Sparkles className="h-4 w-4 mr-2" />
                {designTools.length}+ Design Tools
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
                Design Tools Collection
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Free, powerful design tools that run in your browser. Create
                layouts, color palettes, and visual assets with
                professional-grade tools—no account or installation required.
              </p>

              {/* Search Bar */}
              <div className="relative mb-8">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search design tools..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-3 text-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-purple-200 dark:border-purple-800 focus:border-purple-400 dark:focus:border-purple-600 rounded-lg shadow-sm"
                />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg p-4 text-center border border-purple-200/50 dark:border-purple-800/50">
                  <div className="flex items-center justify-center mb-2">
                    <Layout className="h-5 w-5 text-purple-500" />
                  </div>
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    4+
                  </div>
                  <div className="text-sm text-muted-foreground">Layout</div>
                </div>
                <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg p-4 text-center border border-pink-200/50 dark:border-pink-800/50">
                  <div className="flex items-center justify-center mb-2">
                    <Palette className="h-5 w-5 text-pink-500" />
                  </div>
                  <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">
                    1+
                  </div>
                  <div className="text-sm text-muted-foreground">Color</div>
                </div>
                <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg p-4 text-center border border-indigo-200/50 dark:border-indigo-800/50">
                  <div className="flex items-center justify-center mb-2">
                    <Code className="h-5 w-5 text-indigo-500" />
                  </div>
                  <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                    50+
                  </div>
                  <div className="text-sm text-muted-foreground">Palettes</div>
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center text-sm bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                  <Shield className="h-4 w-4 mr-3 text-green-500" />
                  <span>No Account Required</span>
                </div>
                <div className="flex items-center text-sm bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                  <Zap className="h-4 w-4 mr-3 text-yellow-500" />
                  <span>Professional Quality</span>
                </div>
                <div className="flex items-center text-sm bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                  <Star className="h-4 w-4 mr-3 text-blue-500" />
                  <span>Export Ready Code</span>
                </div>
                <div className="flex items-center text-sm bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                  <Wand2 className="h-4 w-4 mr-3 text-purple-500" />
                  <span>Visual Editors</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6">
              {/* Featured Design Tools */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Popular Tools</h3>
                    <Badge
                      variant="secondary"
                      className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                    >
                      Most Used
                    </Badge>
                  </div>
                  <div className="space-y-4">
                    <Link
                      to="/design/responsive-container-builder"
                      className="block group"
                    >
                      <div className="flex items-center p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg border border-purple-200/50 dark:border-purple-800/50 group-hover:shadow-md transition-all">
                        <div className="bg-purple-100 dark:bg-purple-900/30 rounded-lg p-3 mr-4">
                          <Maximize className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                            Container Builder
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Responsive containers for any screen size
                          </p>
                        </div>
                        <div className="text-purple-500 group-hover:translate-x-1 transition-transform">
                          →
                        </div>
                      </div>
                    </Link>

                    <Link
                      to="/design/color-palette-explorer"
                      className="block group"
                    >
                      <div className="flex items-center p-4 bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 rounded-lg border border-pink-200/50 dark:border-pink-800/50 group-hover:shadow-md transition-all">
                        <div className="bg-pink-100 dark:bg-pink-900/30 rounded-lg p-3 mr-4">
                          <Palette className="h-6 w-6 text-pink-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            Color Palette Explorer
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Harmonious color schemes & accessibility
                          </p>
                        </div>
                        <div className="text-pink-500 group-hover:translate-x-1 transition-transform">
                          →
                        </div>
                      </div>
                    </Link>

                    <Link
                      to="/design/flexbox-generator"
                      className="block group"
                    >
                      <div className="flex items-center p-4 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-lg border border-indigo-200/50 dark:border-indigo-800/50 group-hover:shadow-md transition-all">
                        <div className="bg-indigo-100 dark:bg-indigo-900/30 rounded-lg p-3 mr-4">
                          <Columns className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            Flexbox Generator
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Visual flexbox layout builder
                          </p>
                        </div>
                        <div className="text-indigo-500 group-hover:translate-x-1 transition-transform">
                          →
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Quick Design Categories */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 overflow-hidden">
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Tool Categories
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg border border-purple-200/50 dark:border-purple-800/50">
                      <Layout className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <div className="text-sm font-medium">Layout</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 rounded-lg border border-pink-200/50 dark:border-pink-800/50">
                      <Palette className="h-8 w-8 text-pink-600 mx-auto mb-2" />
                      <div className="text-sm font-medium">Color</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-lg border border-indigo-200/50 dark:border-indigo-800/50">
                      <Code className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
                      <div className="text-sm font-medium">CSS</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
                      <ImageIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <div className="text-sm font-medium">Assets</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Design Categories Section */}
      <section className="container">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">Design Categories</h2>
          <p className="text-muted-foreground">
            Browse design tools by type and functionality
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col items-center text-center hover:shadow-md transition-shadow">
            <div className="bg-purple-100 dark:bg-purple-900/30 rounded-full p-3 mb-4">
              <Layout className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="font-medium mb-2">Layout Tools</h3>
            <p className="text-sm text-muted-foreground">
              Grid, flexbox, container builders
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col items-center text-center hover:shadow-md transition-shadow">
            <div className="bg-pink-100 dark:bg-pink-900/30 rounded-full p-3 mb-4">
              <Palette className="h-8 w-8 text-pink-600" />
            </div>
            <h3 className="font-medium mb-2">Color Tools</h3>
            <p className="text-sm text-muted-foreground">Palettes, gradients</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col items-center text-center hover:shadow-md transition-shadow">
            <div className="bg-indigo-100 dark:bg-indigo-900/30 rounded-full p-3 mb-4">
              <Code className="h-8 w-8 text-indigo-600" />
            </div>
            <h3 className="font-medium mb-2">CSS Generators</h3>
            <p className="text-sm text-muted-foreground">
              Animations, transitions, effects
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col items-center text-center hover:shadow-md transition-shadow">
            <div className="bg-emerald-100 dark:bg-emerald-900/30 rounded-full p-3 mb-4">
              <ImageIcon className="h-8 w-8 text-emerald-600" />
            </div>
            <h3 className="font-medium mb-2">Visual Assets</h3>
            <p className="text-sm text-muted-foreground">
              Icons, patterns, graphics
            </p>
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
                    ? `Search Results (${designTools.length})`
                    : "Design Tools"}
                </h2>
                <p className="text-muted-foreground">
                  {searchQuery
                    ? `Found ${designTools.length} design tools matching "${searchQuery}"`
                    : "Powerful browser-based tools for designers and developers"}
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
              {designTools.map((tool) => (
                <Link
                  key={tool.id}
                  to={tool.url}
                  className="group block bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-200 hover:border-purple-300 dark:hover:border-purple-600"
                >
                  <div className="flex items-start space-x-4">
                    <div className="bg-purple-100 dark:bg-purple-900/30 rounded-lg p-3 group-hover:bg-purple-200 dark:group-hover:bg-purple-800/50 transition-colors">
                      <tool.icon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {tool.title}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                        {tool.description}
                      </p>
                      <div className="mt-3 flex items-center text-purple-600 dark:text-purple-400 text-sm font-medium group-hover:translate-x-1 transition-transform">
                        Try it now →
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <Tabs
              defaultValue="layout"
              className="mb-8"
              onValueChange={setActiveTab}
            >
              <TabsList className="mb-4 bg-muted/30 p-1 rounded-xl">
                <TabsTrigger
                  value="layout"
                  className={cn(
                    "rounded-lg data-[state=active]:shadow-sm transition-all",
                    activeTab === "layout" && "bg-white dark:bg-gray-800"
                  )}
                >
                  <Box className="h-4 w-4 mr-2" />
                  Layout Tools
                </TabsTrigger>
                <TabsTrigger
                  value="color"
                  className={cn(
                    "rounded-lg data-[state=active]:shadow-sm transition-all",
                    activeTab === "color" && "bg-white dark:bg-gray-800"
                  )}
                >
                  <Palette className="h-4 w-4 mr-2" />
                  Color Tools
                </TabsTrigger>
                <TabsTrigger
                  value="other"
                  className={cn(
                    "rounded-lg data-[state=active]:shadow-sm transition-all",
                    activeTab === "other" && "bg-white dark:bg-gray-800"
                  )}
                >
                  <PenTool className="h-4 w-4 mr-2" />
                  Other Tools
                </TabsTrigger>
              </TabsList>

              <TabsContent value="layout" className="p-1">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Link
                    to="/design/responsive-container-builder"
                    className="block group"
                  >
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-indigo-100 dark:border-indigo-900/30 overflow-hidden h-full hover:shadow-md transition-all">
                      <div className="h-40 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 p-6 flex items-center justify-center">
                        <div className="relative w-full max-w-[220px]">
                          <div className="absolute inset-0 grid grid-cols-6 opacity-20">
                            {Array.from({ length: 6 }).map((_, i) => (
                              <div
                                key={i}
                                className="border-r border-indigo-500 h-full"
                              ></div>
                            ))}
                          </div>
                          <div className="bg-white/80 dark:bg-gray-800/80 h-24 mx-auto w-3/4 border-2 border-dashed border-indigo-400 rounded flex items-center justify-center">
                            <Maximize className="h-8 w-8 text-indigo-500" />
                          </div>
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">
                            Responsive Container Builder
                          </h3>
                          <div className="bg-green-100 dark:bg-green-900/60 text-green-800 dark:text-green-100 text-xs px-2 py-0.5 rounded-full">
                            NEW
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          Create fluid and fixed-width container classes with a
                          visual editor
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <div className="text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200 px-2 py-1 rounded-full">
                            Multiple export formats
                          </div>
                          <div className="text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200 px-2 py-1 rounded-full">
                            Responsive breakpoints
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>

                  <Link to="/design/css-grid-generator" className="block group">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-violet-100 dark:border-violet-900/30 overflow-hidden h-full hover:shadow-md transition-all">
                      <div className="h-40 bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-950/30 dark:to-indigo-950/30 p-6 flex items-center justify-center">
                        <div className="grid grid-cols-3 grid-rows-3 gap-2 w-40 h-40">
                          {Array.from({ length: 9 }).map((_, i) => (
                            <div
                              key={i}
                              className="bg-white/80 dark:bg-gray-800/80 border border-violet-300 dark:border-violet-700 rounded-md flex items-center justify-center"
                            >
                              {i === 4 && (
                                <Grid className="h-6 w-6 text-violet-500" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">CSS Grid Generator</h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          Create complex grid layouts with a visual editor
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <div className="text-xs bg-violet-50 dark:bg-violet-900/30 text-violet-800 dark:text-violet-200 px-2 py-1 rounded-full">
                            Visual grid editor
                          </div>
                          <div className="text-xs bg-violet-50 dark:bg-violet-900/30 text-violet-800 dark:text-violet-200 px-2 py-1 rounded-full">
                            CSS & Tailwind export
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>

                  <Link to="/design/flexbox-generator" className="block group">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-blue-100 dark:border-blue-900/30 overflow-hidden h-full hover:shadow-md transition-all">
                      <div className="h-40 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 p-6 flex items-center justify-center">
                        <div className="flex flex-wrap gap-2 items-center justify-center w-full">
                          {Array.from({ length: 3 }).map((_, i) => (
                            <div
                              key={i}
                              className="w-20 h-16 bg-white/80 dark:bg-gray-800/80 border border-blue-300 dark:border-blue-700 rounded-md flex items-center justify-center"
                            >
                              <Columns className="h-6 w-6 text-blue-500" />
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">Flexbox Generator</h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          Create flexible layouts with a visual editor
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <div className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
                            Interactive preview
                          </div>
                          <div className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
                            CSS code generation
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>

                  <Link
                    to="/design/margin-padding-visualizer"
                    className="block group"
                  >
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-blue-100 dark:border-blue-900/30 overflow-hidden h-full hover:shadow-md transition-all">
                      <div className="h-40 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 p-6 flex items-center justify-center">
                        <div className="relative w-40 h-40">
                          {/* Margin layer */}
                          <div className="absolute inset-0 bg-blue-100 dark:bg-blue-900/30 rounded-lg"></div>
                          {/* Border layer */}
                          <div className="absolute inset-8 bg-blue-200 dark:bg-blue-800/50 rounded-md"></div>
                          {/* Padding layer */}
                          <div className="absolute inset-10 bg-blue-300 dark:bg-blue-700/70 rounded-sm"></div>
                          {/* Content layer */}
                          <div className="absolute inset-16 bg-blue-500 dark:bg-blue-600 rounded-sm flex items-center justify-center">
                            <Box className="h-6 w-6 text-white" />
                          </div>
                          {/* Labels */}
                          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-xs font-medium text-blue-700 dark:text-blue-300">
                            Margin
                          </div>
                          <div className="absolute top-12 left-1/2 transform -translate-x-1/2 text-xs font-medium text-blue-700 dark:text-blue-300">
                            Padding
                          </div>
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">
                            Margin/Padding Visualizer
                          </h3>
                          <Box className="h-5 w-5 text-blue-500" />
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Interactive box model editor with batch spacing
                          utility generation and export options.
                        </p>
                      </div>
                    </div>
                  </Link>
                </div>
              </TabsContent>

              <TabsContent value="color" className="p-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Link
                    to="/design/color-palette-explorer"
                    className="block group"
                  >
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-pink-100 dark:border-pink-900/30 overflow-hidden h-full hover:shadow-md transition-all">
                      <div className="h-40 bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-950/30 dark:to-purple-950/30 p-6 flex items-center justify-center">
                        <div className="flex gap-2 items-center justify-center">
                          {[
                            "bg-pink-500",
                            "bg-purple-500",
                            "bg-indigo-500",
                            "bg-blue-500",
                          ].map((color, i) => (
                            <div
                              key={i}
                              className={`w-16 h-24 ${color} rounded-md transform ${
                                i % 2 === 0 ? "translate-y-2" : "-translate-y-2"
                              }`}
                            ></div>
                          ))}
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">
                            Color Palette Explorer
                          </h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          Create harmonious color schemes with accessibility
                          checks
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <div className="text-xs bg-pink-50 dark:bg-pink-900/30 text-pink-800 dark:text-pink-200 px-2 py-1 rounded-full">
                            Color theory tools
                          </div>
                          <div className="text-xs bg-pink-50 dark:bg-pink-900/30 text-pink-800 dark:text-pink-200 px-2 py-1 rounded-full">
                            Multiple export formats
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>

                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-amber-100 dark:border-amber-900/30 overflow-hidden h-full opacity-70">
                    <div className="h-40 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 p-6 flex items-center justify-center">
                      <div className="relative">
                        <div className="w-32 h-32 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg shadow-lg"></div>
                        <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-20 h-20 bg-gradient-to-r from-orange-400 to-red-400 rounded-lg shadow-lg"></div>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">Gradient Generator</h3>
                        <div className="bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-100 text-xs px-2 py-0.5 rounded-full">
                          COMING SOON
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Create beautiful gradients for your web projects
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <div className="text-xs bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 px-2 py-1 rounded-full">
                          Multiple gradient types
                        </div>
                        <div className="text-xs bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 px-2 py-1 rounded-full">
                          CSS code generation
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="other" className="p-1">
                {otherTools.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {otherTools.map((tool) => (
                      <Link key={tool.id} to={tool.url} className="block group">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden h-full hover:shadow-md transition-all">
                          <div className="h-40 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6 flex items-center justify-center">
                            <tool.icon className="h-16 w-16 text-gray-500" />
                          </div>
                          <div className="p-6">
                            <h3 className="font-medium mb-2">{tool.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {tool.description}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="bg-muted/30 rounded-xl p-8 text-center">
                    <div className="mx-auto w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                      <PenTool className="h-8 w-8 text-muted-foreground/70" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">
                      More tools coming soon
                    </h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      We're working on additional design tools to help with your
                      creative process. Check back soon for more updates.
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}

          {searchQuery && designTools.length === 0 && (
            <div className="text-center py-12">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No design tools found
              </h3>
              <p className="text-muted-foreground">
                Try searching for different terms or browse our design
                categories.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Design Principles - Preserved */}
      <section className="container">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Design Principles</h2>
          <p className="text-muted-foreground">
            Useful concepts to elevate your design skills
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border relative group hover:shadow-md transition-all overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-purple-100 dark:bg-purple-900/20 rounded-full -mt-10 -mr-10 group-hover:scale-110 transition-all duration-300"></div>
            <h3 className="font-medium mb-3 flex items-center relative z-10">
              <Palette className="h-5 w-5 mr-2 text-purple-500" />
              Color Theory Basics
            </h3>
            <p className="text-sm text-muted-foreground relative z-10">
              Understanding color theory helps create visually appealing designs
              that convey the right emotions and improve user experience.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border relative group hover:shadow-md transition-all overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-100 dark:bg-blue-900/20 rounded-full -mt-10 -mr-10 group-hover:scale-110 transition-all duration-300"></div>
            <h3 className="font-medium mb-3 flex items-center relative z-10">
              <Grid className="h-5 w-5 mr-2 text-blue-500" />
              Rule of Thirds
            </h3>
            <p className="text-sm text-muted-foreground relative z-10">
              Divide your canvas into a 3×3 grid to create balanced compositions
              by placing important elements along the lines or at their
              intersections.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border relative group hover:shadow-md transition-all overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-100 dark:bg-indigo-900/20 rounded-full -mt-10 -mr-10 group-hover:scale-110 transition-all duration-300"></div>
            <h3 className="font-medium mb-3 flex items-center relative z-10">
              <Layers className="h-5 w-5 mr-2 text-indigo-500" />
              Visual Hierarchy
            </h3>
            <p className="text-sm text-muted-foreground relative z-10">
              Guide users through your design by emphasizing important elements
              with size, color, contrast, and spacing to create a clear focal
              point.
            </p>
          </div>
        </div>
      </section>

      {/* Updated Color Inspiration Section - Preserved */}
      <section className="container">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Color Inspiration</h2>
          <div className="text-sm text-muted-foreground hidden md:block">
            Click on any gradient to copy Tailwind CSS classes
          </div>
        </div>

        <Tabs defaultValue="vibrant" className="mb-8">
          <TabsList className="mb-2 bg-muted/30 p-1 rounded-xl">
            <TabsTrigger
              value="vibrant"
              className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm transition-all"
            >
              <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mr-2"></div>
              Vibrant
            </TabsTrigger>
            <TabsTrigger
              value="pastel"
              className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm transition-all"
            >
              <div className="w-3 h-3 bg-gradient-to-r from-pink-200 to-blue-200 rounded-full mr-2"></div>
              Pastel
            </TabsTrigger>
            <TabsTrigger
              value="monochromatic"
              className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm transition-all"
            >
              <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-700 rounded-full mr-2"></div>
              Monochromatic
            </TabsTrigger>
            <TabsTrigger
              value="earth"
              className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm transition-all"
            >
              <div className="w-3 h-3 bg-gradient-to-r from-amber-700 to-amber-900 rounded-full mr-2"></div>
              Earth
            </TabsTrigger>
            <TabsTrigger
              value="dark"
              className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm transition-all"
            >
              <div className="w-3 h-3 bg-gradient-to-r from-gray-700 to-gray-900 rounded-full mr-2"></div>
              Dark
            </TabsTrigger>
          </TabsList>

          {/* Copy notification message - improved position and style */}
          {showCopyMessage && (
            <div className="mt-2 bg-green-50 text-green-800 dark:bg-green-900/50 dark:text-green-100 px-4 py-3 rounded-lg text-sm transition-all duration-200 flex items-center space-x-2 border border-green-100 dark:border-green-900">
              <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
              <span>{copyMessage}</span>
            </div>
          )}

          {/* Mobile notice */}
          <div className="md:hidden mt-2 mb-4 text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
            Tap on any gradient to copy Tailwind CSS classes
          </div>

          {/* Map through each category - keeping existing implementation */}
          {(
            ["vibrant", "pastel", "monochromatic", "earth", "dark"] as const
          ).map((categoryName) => (
            <TabsContent
              key={categoryName}
              value={categoryName}
              className="mt-4"
            >
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {colorPalettes
                  .filter((palette) => palette.category === categoryName)
                  .map((palette, index) => {
                    const globalIndex = colorPalettes.findIndex(
                      (p) => p === palette
                    );
                    return (
                      <button
                        key={index}
                        className={`h-24 rounded-lg ${palette.tailwindClasses} relative group transition-transform hover:scale-[1.02] hover:shadow-lg`}
                        onClick={() => handleCopyTailwind(palette, globalIndex)}
                        aria-label={`Copy ${palette.name} Tailwind gradient classes`}
                      >
                        {/* Display name at bottom */}
                        <div className="absolute inset-x-0 bottom-0 bg-black/20 backdrop-blur-sm p-2 rounded-b-lg transition-opacity duration-200 group-hover:opacity-0">
                          <span className="text-xs font-medium text-white">
                            {palette.name}
                          </span>
                        </div>

                        {/* Copy overlay on hover */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg">
                          <div className="bg-white dark:bg-gray-800 rounded-md px-3 py-2 flex items-center gap-2 shadow-lg transform transition-transform group-hover:scale-105">
                            {copiedIndex === globalIndex ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                            <span className="text-xs font-medium">
                              {copiedIndex === globalIndex
                                ? "Copied!"
                                : "Copy Tailwind"}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6 text-sm text-muted-foreground border border-gray-100 dark:border-gray-800">
          <h3 className="font-medium mb-2 flex items-center">
            <Code className="h-4 w-4 mr-2 text-blue-500" />
            Using These Gradients
          </h3>
          <p className="mb-3">
            These gradients use Tailwind's gradient utilities. To use them in
            your project, apply the copied classes to your elements:
          </p>
          <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-xs overflow-x-auto mb-3 border border-gray-200 dark:border-gray-700">
            &lt;div className="
            <span className="text-emerald-500 font-medium">
              bg-gradient-to-r from-purple-500 to-pink-500
            </span>
            "&gt;Your content&lt;/div&gt;
          </pre>
          <p className="mb-2">
            You can also apply these gradients to text by replacing
            "bg-gradient-to-r" with "bg-clip-text text-transparent
            bg-gradient-to-r":
          </p>
          <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-xs overflow-x-auto border border-gray-200 dark:border-gray-700">
            &lt;h1 className="
            <span className="text-emerald-500 font-medium">
              bg-clip-text text-transparent bg-gradient-to-r from-blue-500
              to-teal-500
            </span>
            "&gt;Gradient Text&lt;/h1&gt;
          </pre>
        </div>
      </section>
    </div>
  );
};

export default DesignPage;
