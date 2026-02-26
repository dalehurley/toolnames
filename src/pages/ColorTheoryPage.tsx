import React, { useEffect } from "react";
import {
  Palette,
  RefreshCw,
  Heart,
  Activity,
  PieChart,
  ArrowRight,
  Grid as LucideGrid,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";

const ColorTheoryPage: React.FC = () => {
  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <div className="container mx-auto py-8 px-4 space-y-12 max-w-5xl">
        {/* Hero Section */}
        <div className="space-y-6">
          <div className="inline-block bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 px-3 py-1 rounded-full text-sm font-medium">
            Design Resources
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Color Theory Basics
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            Understanding color theory helps create visually appealing designs
            that convey the right emotions and improve user experience.
          </p>
        </div>

        <Separator />

        {/* Table of Contents */}
        <div className="rounded-lg border p-4 bg-card text-card-foreground shadow-sm">
          <h2 className="text-lg font-medium mb-3">In this guide</h2>
          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-purple-500"></div>
              <a href="#color-wheel" className="text-sm hover:underline">
                The Color Wheel
              </a>
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
              <a href="#color-harmonies" className="text-sm hover:underline">
                Color Harmonies
              </a>
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-red-500"></div>
              <a href="#color-psychology" className="text-sm hover:underline">
                Color Psychology
              </a>
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
              <a href="#accessibility" className="text-sm hover:underline">
                Color Accessibility
              </a>
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-amber-500"></div>
              <a href="#practical-tips" className="text-sm hover:underline">
                Practical Tips
              </a>
            </li>
          </ul>
        </div>

        {/* Main Content */}
        <section id="color-wheel" className="scroll-mt-20 space-y-6">
          <div className="flex items-center gap-2">
            <Palette className="text-purple-500 h-6 w-6" />
            <h2 className="text-2xl md:text-3xl font-bold">The Color Wheel</h2>
          </div>

          <p className="text-muted-foreground">
            The color wheel is the foundation of color theory. It organizes
            colors in a circular format, showing their relationships to one
            another and helping designers create harmonious color schemes.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-medium mb-3">Primary Colors</h3>
              <p className="mb-4">
                Red, yellow, and blue are the three primary colors. They cannot
                be created by mixing other colors together.
              </p>
              <div className="flex gap-2">
                <div
                  className="h-12 w-12 rounded-full bg-red-600"
                  title="Red"
                ></div>
                <div
                  className="h-12 w-12 rounded-full bg-yellow-500"
                  title="Yellow"
                ></div>
                <div
                  className="h-12 w-12 rounded-full bg-blue-600"
                  title="Blue"
                ></div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-medium mb-3">Secondary Colors</h3>
              <p className="mb-4">
                Secondary colors are created by mixing two primary colors
                together.
              </p>
              <div className="flex gap-2">
                <div
                  className="h-12 w-12 rounded-full bg-orange-500"
                  title="Orange (Red + Yellow)"
                ></div>
                <div
                  className="h-12 w-12 rounded-full bg-green-500"
                  title="Green (Yellow + Blue)"
                ></div>
                <div
                  className="h-12 w-12 rounded-full bg-purple-500"
                  title="Purple (Blue + Red)"
                ></div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-medium mb-3">Tertiary Colors</h3>
              <p className="mb-4">
                Tertiary colors are created by mixing a primary color with its
                nearest secondary color.
              </p>
              <div className="flex flex-wrap gap-2">
                <div
                  className="h-10 w-10 rounded-full bg-red-orange-500"
                  style={{ backgroundColor: "#FF4500" }}
                  title="Red-Orange"
                ></div>
                <div
                  className="h-10 w-10 rounded-full bg-yellow-orange-500"
                  style={{ backgroundColor: "#FFB347" }}
                  title="Yellow-Orange"
                ></div>
                <div
                  className="h-10 w-10 rounded-full bg-yellow-green-500"
                  style={{ backgroundColor: "#9ACD32" }}
                  title="Yellow-Green"
                ></div>
                <div
                  className="h-10 w-10 rounded-full bg-blue-green-500"
                  style={{ backgroundColor: "#088F8F" }}
                  title="Blue-Green"
                ></div>
                <div
                  className="h-10 w-10 rounded-full bg-blue-purple-500"
                  style={{ backgroundColor: "#800080" }}
                  title="Blue-Purple"
                ></div>
                <div
                  className="h-10 w-10 rounded-full bg-red-purple-500"
                  style={{ backgroundColor: "#B22222" }}
                  title="Red-Purple"
                ></div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-medium mb-3">
                Tints, Tones, and Shades
              </h3>
              <p className="mb-4">
                Tints are created by adding white, tones by adding gray, and
                shades by adding black.
              </p>
              <div className="flex gap-1">
                <div className="h-10 flex-1 bg-blue-100" title="Tint"></div>
                <div className="h-10 flex-1 bg-blue-300" title="Tint"></div>
                <div
                  className="h-10 flex-1 bg-blue-500"
                  title="Pure Color"
                ></div>
                <div className="h-10 flex-1 bg-blue-700" title="Shade"></div>
                <div className="h-10 flex-1 bg-blue-900" title="Shade"></div>
              </div>
            </div>
          </div>
        </section>

        <Separator />

        <section id="color-harmonies" className="scroll-mt-20 space-y-6">
          <div className="flex items-center gap-2">
            <RefreshCw className="text-blue-500 h-6 w-6" />
            <h2 className="text-2xl md:text-3xl font-bold">Color Harmonies</h2>
          </div>

          <p className="text-muted-foreground">
            Color harmonies are specific combinations of colors based on their
            positions on the color wheel. They help create balanced and
            aesthetically pleasing designs.
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Complementary Colors</CardTitle>
                <CardDescription>
                  Colors opposite each other on the color wheel
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="flex h-16 rounded-md overflow-hidden">
                    <div className="flex-1 bg-blue-500"></div>
                    <div className="flex-1 bg-orange-500"></div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Create high contrast and vibrant designs. Great for
                  call-to-action buttons, logos, and designs that need to stand
                  out.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Analogous Colors</CardTitle>
                <CardDescription>
                  Colors adjacent to each other on the color wheel
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="flex h-16 rounded-md overflow-hidden">
                    <div className="flex-1 bg-blue-500"></div>
                    <div className="flex-1 bg-indigo-500"></div>
                    <div className="flex-1 bg-purple-500"></div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Create harmonious, unified designs with low contrast. Perfect
                  for backgrounds, natural scenes, and designs that need a
                  cohesive feel.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Triadic Colors</CardTitle>
                <CardDescription>
                  Three colors equally spaced on the color wheel
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="flex h-16 rounded-md overflow-hidden">
                    <div className="flex-1 bg-blue-500"></div>
                    <div className="flex-1 bg-yellow-500"></div>
                    <div className="flex-1 bg-red-500"></div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Create vibrant and balanced designs. Great for playful
                  designs, children's content, and creative projects that need
                  energy.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Monochromatic Colors</CardTitle>
                <CardDescription>
                  Different tints, tones, and shades of a single color
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="flex h-16 rounded-md overflow-hidden">
                    <div className="flex-1 bg-blue-100"></div>
                    <div className="flex-1 bg-blue-300"></div>
                    <div className="flex-1 bg-blue-500"></div>
                    <div className="flex-1 bg-blue-700"></div>
                    <div className="flex-1 bg-blue-900"></div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Create elegant, cohesive designs. Perfect for minimal,
                  sophisticated interfaces and designs that need a unified look.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator />

        <section id="color-psychology" className="scroll-mt-20 space-y-6">
          <div className="flex items-center gap-2">
            <Heart className="text-red-500 h-6 w-6" />
            <h2 className="text-2xl md:text-3xl font-bold">Color Psychology</h2>
          </div>

          <p className="text-muted-foreground">
            Colors evoke emotions and associations. Understanding color
            psychology helps designers choose colors that convey the right
            message and emotion for their target audience.
          </p>

          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2 bg-red-50 dark:bg-red-950/30">
                <CardTitle className="text-red-600 dark:text-red-400">
                  Red
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm">
                  Evokes passion, energy, excitement, and urgency. Can increase
                  heart rate and create a sense of urgency.
                </p>
                <p className="text-sm mt-2 font-medium">
                  Used for: Calls to action, sales, food, emergency services
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2 bg-blue-50 dark:bg-blue-950/30">
                <CardTitle className="text-blue-600 dark:text-blue-400">
                  Blue
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm">
                  Conveys trust, security, stability, and professionalism. One
                  of the most widely preferred colors globally.
                </p>
                <p className="text-sm mt-2 font-medium">
                  Used for: Banking, technology, healthcare, corporate brands
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2 bg-green-50 dark:bg-green-950/30">
                <CardTitle className="text-green-600 dark:text-green-400">
                  Green
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm">
                  Represents growth, health, nature, and wealth. Creates a sense
                  of balance and harmony.
                </p>
                <p className="text-sm mt-2 font-medium">
                  Used for: Environmental brands, health products, financial
                  services
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2 bg-yellow-50 dark:bg-yellow-950/30">
                <CardTitle className="text-yellow-600 dark:text-yellow-400">
                  Yellow
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm">
                  Signals optimism, happiness, warmth, and attention. The most
                  visible color to the human eye.
                </p>
                <p className="text-sm mt-2 font-medium">
                  Used for: Caution signs, cheerful brands, children's products
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2 bg-purple-50 dark:bg-purple-950/30">
                <CardTitle className="text-purple-600 dark:text-purple-400">
                  Purple
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm">
                  Associated with luxury, creativity, wisdom, and royalty.
                  Combines the stability of blue and energy of red.
                </p>
                <p className="text-sm mt-2 font-medium">
                  Used for: Luxury brands, creative industries, spiritual
                  content
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2 bg-orange-50 dark:bg-orange-950/30">
                <CardTitle className="text-orange-600 dark:text-orange-400">
                  Orange
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm">
                  Communicates enthusiasm, creativity, determination, and
                  playfulness. A warm, energetic color.
                </p>
                <p className="text-sm mt-2 font-medium">
                  Used for: Food, entertainment, children's products, calls to
                  action
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator />

        <section id="accessibility" className="scroll-mt-20 space-y-6">
          <div className="flex items-center gap-2">
            <Activity className="text-green-500 h-6 w-6" />
            <h2 className="text-2xl md:text-3xl font-bold">
              Color Accessibility
            </h2>
          </div>

          <p className="text-muted-foreground">
            Ensuring your color choices are accessible to all users, including
            those with color vision deficiencies, is a crucial aspect of design.
            WCAG guidelines recommend a minimum contrast ratio of 4.5:1 for
            normal text.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-medium mb-3">
                Good Contrast Examples
              </h3>
              <div className="space-y-2">
                <div className="p-4 bg-slate-900 text-white rounded-md">
                  <p className="text-sm">
                    Dark background with white text (21:1 ratio) ✓
                  </p>
                </div>
                <div className="p-4 bg-blue-600 text-white rounded-md">
                  <p className="text-sm">
                    Blue background with white text (4.5:1 ratio) ✓
                  </p>
                </div>
                <div className="p-4 bg-white border text-slate-900 rounded-md">
                  <p className="text-sm">
                    White background with black text (21:1 ratio) ✓
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-medium mb-3">
                Poor Contrast Examples
              </h3>
              <div className="space-y-2">
                <div className="p-4 bg-yellow-200 text-yellow-500 rounded-md">
                  <p className="text-sm">
                    Yellow on light yellow (1.5:1 ratio) ✗
                  </p>
                </div>
                <div className="p-4 bg-blue-200 text-blue-400 rounded-md">
                  <p className="text-sm">
                    Light blue on blue background (2:1 ratio) ✗
                  </p>
                </div>
                <div className="p-4 bg-gray-200 text-gray-400 rounded-md">
                  <p className="text-sm">
                    Light gray on gray background (1.8:1 ratio) ✗
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-2">
              Color Vision Deficiency Considerations
            </h3>
            <p className="text-sm mb-4">
              About 8% of men and 0.5% of women have some form of color vision
              deficiency. When designing, avoid relying solely on color to
              convey information.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div className="p-2 bg-white border rounded-md text-center">
                <div className="h-8 bg-red-500 mb-2 rounded"></div>
                <p className="text-xs">Normal Vision</p>
              </div>
              <div className="p-2 bg-white border rounded-md text-center">
                <div className="h-8 bg-amber-700 mb-2 rounded"></div>
                <p className="text-xs">Protanopia</p>
              </div>
              <div className="p-2 bg-white border rounded-md text-center">
                <div className="h-8 bg-amber-600 mb-2 rounded"></div>
                <p className="text-xs">Deuteranopia</p>
              </div>
              <div className="p-2 bg-white border rounded-md text-center">
                <div className="h-8 bg-blue-800 mb-2 rounded"></div>
                <p className="text-xs">Tritanopia</p>
              </div>
            </div>
          </div>
        </section>

        <Separator />

        <section id="practical-tips" className="scroll-mt-20 space-y-6">
          <div className="flex items-center gap-2">
            <PieChart className="text-amber-500 h-6 w-6" />
            <h2 className="text-2xl md:text-3xl font-bold">Practical Tips</h2>
          </div>

          <p className="text-muted-foreground">
            Implementing color theory effectively in your designs requires
            practice. Here are some practical tips to help you use color theory
            in real-world applications.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>The 60-30-10 Rule</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-8 flex rounded-md overflow-hidden mb-4">
                  <div className="w-[60%] bg-blue-100"></div>
                  <div className="w-[30%] bg-blue-500"></div>
                  <div className="w-[10%] bg-red-500"></div>
                </div>
                <p className="text-sm">
                  Use your dominant color for 60% of the design (usually
                  backgrounds), a secondary color for 30% (major elements), and
                  an accent color for 10% (highlights and calls to action).
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Color for Hierarchy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <p className="font-bold text-slate-900 dark:text-white">
                    Primary Heading
                  </p>
                  <p className="font-medium text-slate-700 dark:text-slate-300">
                    Secondary Heading
                  </p>
                  <p className="text-slate-500 dark:text-slate-400">
                    Normal body text
                  </p>
                  <p className="text-slate-400 dark:text-slate-500">
                    Less important text
                  </p>
                </div>
                <p className="text-sm">
                  Use color intensity to establish hierarchy in your designs.
                  The most important elements should have the highest contrast.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Limited Palette</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4">
                  <div className="h-10 w-10 rounded-full bg-blue-600"></div>
                  <div className="h-10 w-10 rounded-full bg-blue-400"></div>
                  <div className="h-10 w-10 rounded-full bg-amber-500"></div>
                  <div className="h-10 w-10 rounded-full bg-slate-800"></div>
                  <div className="h-10 w-10 rounded-full bg-white border"></div>
                </div>
                <p className="text-sm">
                  Limit your palette to 3-5 colors for most designs. This
                  creates cohesion and prevents the design from feeling chaotic
                  or overwhelming.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Test in Context</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-4">
                  <div className="flex-1 p-2 bg-white border rounded">
                    <div className="h-6 w-20 bg-blue-500 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-1"></div>
                    <div className="h-4 bg-gray-200 rounded mb-1"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                  <div className="flex-1 p-2 bg-gray-900 rounded border border-gray-700">
                    <div className="h-6 w-20 bg-blue-500 rounded mb-2"></div>
                    <div className="h-4 bg-gray-700 rounded mb-1"></div>
                    <div className="h-4 bg-gray-700 rounded mb-1"></div>
                    <div className="h-4 bg-gray-700 rounded w-2/3"></div>
                  </div>
                </div>
                <p className="text-sm">
                  Always test your color choices in context and in different
                  environments (light mode/dark mode, different devices). Colors
                  can appear differently based on surrounding elements.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator />

        {/* Tools Section */}
        <section className="bg-purple-50 dark:bg-purple-950/20 p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">
            Tools to Help You Apply Color Theory
          </h2>
          <p className="text-muted-foreground mb-6">
            Use our design tools to help you create beautiful color combinations
            based on color theory principles:
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            <Link to="/design/css-pattern-generator">
              <div className="bg-white dark:bg-gray-800 rounded-lg border p-4 h-full hover:border-purple-400 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <LucideGrid className="h-5 w-5 text-purple-500" />
                  <h3 className="font-medium">CSS Pattern Generator</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Create beautiful background patterns using color harmonies and
                  principles from color theory.
                </p>
              </div>
            </Link>

            <Link to="/design/color-palette-explorer">
              <div className="bg-white dark:bg-gray-800 rounded-lg border p-4 h-full hover:border-purple-400 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <Palette className="h-5 w-5 text-purple-500" />
                  <h3 className="font-medium">Color Palette Explorer</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Generate color schemes based on color theory principles like
                  complementary, analogous, or triadic color relationships.
                </p>
              </div>
            </Link>
          </div>

          <div className="mt-6">
            <Link to="/design">
              <Button variant="outline">
                <ArrowRight className="mr-2 h-4 w-4" />
                Explore All Design Tools
              </Button>
            </Link>
          </div>
        </section>

        {/* Related Resources */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Related Design Resources</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Link to="/design-resources/rule-of-thirds">
              <div className="rounded-lg border p-4 hover:border-blue-400 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <LucideGrid className="h-5 w-5 text-blue-500" />
                  <h3 className="font-medium">Rule of Thirds</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Learn how to create balanced compositions by placing important
                  elements along the lines or at their intersections.
                </p>
              </div>
            </Link>

            <Link to="/design-resources/visual-hierarchy">
              <div className="rounded-lg border p-4 hover:border-blue-400 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <Layers className="h-5 w-5 text-blue-500" />
                  <h3 className="font-medium">Visual Hierarchy</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Guide users through your design by emphasizing important
                  elements with size, color, contrast, and spacing.
                </p>
              </div>
            </Link>
          </div>
        </section>
      </div>
    </>
  );
};

export default ColorTheoryPage;
