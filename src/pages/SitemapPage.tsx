import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { availableTools, Tool } from "@/contexts/ToolsContext";
import { groupBy } from "lodash";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

// Define an interface for converter routes
interface ConverterRoute {
  url: string;
  title: string;
  description: string;
  category: string;
  pageTitle?: string;
  metaDescription?: string;
}

// Handle unit converter specific routes
const generateUnitConverterRoutes = (): ConverterRoute[] => {
  const routes: ConverterRoute[] = [];

  // Define the full list of all conversions (same as in router.tsx)
  const conversions = [
    // Length converters
    { from: "millimeters", to: "centimeters", category: "length" },
    { from: "millimeters", to: "meters", category: "length" },
    { from: "millimeters", to: "kilometers", category: "length" },
    { from: "millimeters", to: "inches", category: "length" },
    { from: "millimeters", to: "feet", category: "length" },
    { from: "centimeters", to: "millimeters", category: "length" },
    { from: "centimeters", to: "meters", category: "length" },
    { from: "centimeters", to: "kilometers", category: "length" },
    { from: "centimeters", to: "inches", category: "length" },
    { from: "centimeters", to: "feet", category: "length" },
    { from: "meters", to: "millimeters", category: "length" },
    { from: "meters", to: "centimeters", category: "length" },
    { from: "meters", to: "kilometers", category: "length" },
    { from: "meters", to: "feet", category: "length" },
    { from: "meters", to: "miles", category: "length" },
    { from: "kilometers", to: "meters", category: "length" },
    { from: "kilometers", to: "miles", category: "length" },
    { from: "inches", to: "centimeters", category: "length" },
    { from: "inches", to: "millimeters", category: "length" },
    { from: "inches", to: "feet", category: "length" },
    { from: "feet", to: "inches", category: "length" },
    { from: "feet", to: "meters", category: "length" },
    { from: "miles", to: "kilometers", category: "length" },

    // Weight converters
    { from: "grams", to: "kilograms", category: "weight" },
    { from: "grams", to: "ounces", category: "weight" },
    { from: "grams", to: "pounds", category: "weight" },
    { from: "kilograms", to: "grams", category: "weight" },
    { from: "kilograms", to: "pounds", category: "weight" },
    { from: "kilograms", to: "stones", category: "weight" },
    { from: "ounces", to: "grams", category: "weight" },
    { from: "ounces", to: "pounds", category: "weight" },
    { from: "pounds", to: "kilograms", category: "weight" },
    { from: "pounds", to: "ounces", category: "weight" },
    { from: "pounds", to: "stones", category: "weight" },

    // Temperature converters
    { from: "celsius", to: "fahrenheit", category: "temperature" },
    { from: "celsius", to: "kelvin", category: "temperature" },
    { from: "fahrenheit", to: "celsius", category: "temperature" },
    { from: "fahrenheit", to: "kelvin", category: "temperature" },
    { from: "kelvin", to: "celsius", category: "temperature" },
    { from: "kelvin", to: "fahrenheit", category: "temperature" },

    // Volume converters
    { from: "milliliters", to: "liters", category: "volume" },
    { from: "milliliters", to: "gallons", category: "volume" },
    { from: "liters", to: "milliliters", category: "volume" },
    { from: "liters", to: "gallons", category: "volume" },
    { from: "liters", to: "cubic-meters", category: "volume" },
    { from: "gallons", to: "liters", category: "volume" },
    { from: "quarts", to: "liters", category: "volume" },
    { from: "cups", to: "milliliters", category: "volume" },

    // Area converters
    { from: "square-meters", to: "square-feet", category: "area" },
    { from: "square-feet", to: "square-meters", category: "area" },
    { from: "square-kilometers", to: "square-miles", category: "area" },
    { from: "acres", to: "hectares", category: "area" },
    { from: "hectares", to: "acres", category: "area" },

    // Time converters
    { from: "seconds", to: "minutes", category: "time" },
    { from: "minutes", to: "hours", category: "time" },
    { from: "hours", to: "days", category: "time" },
    { from: "days", to: "weeks", category: "time" },
    { from: "weeks", to: "months", category: "time" },
    { from: "months", to: "years", category: "time" },
  ];

  conversions.forEach(({ from, to, category }) => {
    const url = `/converters/unit-converter/${category}/${from}-to-${to}`;
    const title = `Convert ${from.replace(/-/g, " ")} to ${to.replace(
      /-/g,
      " "
    )}`;
    const description = `Free online ${category} converter. Convert ${from.replace(
      /-/g,
      " "
    )} to ${to.replace(/-/g, " ")} instantly with our unit conversion tool.`;

    const pageTitle = `Convert ${from.replace(/-/g, " ")} to ${to.replace(
      /-/g,
      " "
    )} | ${
      category.charAt(0).toUpperCase() + category.slice(1)
    } Unit Converter`;

    const metaDescription = `Free online tool to convert ${from.replace(
      /-/g,
      " "
    )} to ${to.replace(
      /-/g,
      " "
    )}. Fast, accurate ${category} conversion calculator with no downloads required.`;

    routes.push({
      url,
      title,
      description,
      category: `${
        category.charAt(0).toUpperCase() + category.slice(1)
      } Converter`,
      pageTitle,
      metaDescription,
    });
  });

  return routes;
};

// Define a type for the combined pages
type SitemapItem = Tool | ConverterRoute;

const SitemapPage = () => {
  // Set document title
  useEffect(() => {
    document.title = "Sitemap - Complete List of All Tools | ToolNames";
  }, []);

  // Get all tools and add category pages
  const allPages: SitemapItem[] = [
    ...availableTools,
    {
      id: "home",
      title: "Home",
      description:
        "Free online tools and utilities that run entirely in your browser.",
      category: "Pages",
      url: "/",
      pageTitle: "ToolNames - Free Browser-Based Tools and Utilities",
      metaDescription:
        "Free online tools and utilities that run entirely in your browser. Calculators, converters, generators and more - no downloads required.",
    } as SitemapItem,
    {
      id: "calculators",
      title: "Calculators",
      description: "Browse our collection of free calculator tools.",
      category: "Pages",
      url: "/calculators",
      pageTitle: "Calculators - Free Online Calculator Tools | ToolNames",
      metaDescription:
        "Free online calculator tools including mortgage calculator, compound interest calculator, BMI calculator and more. All tools run directly in your browser.",
    } as SitemapItem,
    {
      id: "converters",
      title: "Converters",
      description: "Browse our collection of free converter tools.",
      category: "Pages",
      url: "/converters",
      pageTitle: "Converters - Free Online Conversion Tools | ToolNames",
      metaDescription:
        "Free online conversion tools including unit converter, color converter, temperature converter and more. Convert between different units and formats easily.",
    } as SitemapItem,
    {
      id: "generators",
      title: "Generators",
      description: "Browse our collection of free generator tools.",
      category: "Pages",
      url: "/generators",
      pageTitle: "Generators - Free Online Generator Tools | ToolNames",
      metaDescription:
        "Free online generator tools including password generator, QR code generator, lorem ipsum generator and more. Generate secure passwords, QR codes and placeholder text.",
    } as SitemapItem,
    {
      id: "utilities",
      title: "Utilities",
      description: "Browse our collection of free utility tools.",
      category: "Pages",
      url: "/utilities",
      pageTitle: "Utilities - Free Online Utility Tools | ToolNames",
      metaDescription:
        "Free online utility tools including text case converter, base64 encoder/decoder, JSON formatter, URL encoder and more. Practical tools for everyday tasks.",
    } as SitemapItem,
    {
      id: "file-tools",
      title: "File Tools",
      description: "Browse our collection of free file tools.",
      category: "Pages",
      url: "/file-tools",
      pageTitle: "File Tools - Free Online File Utilities | ToolNames",
      metaDescription:
        "Free online file tools including image converter, file compressor, and more. Convert and manipulate files directly in your browser.",
    } as SitemapItem,
    {
      id: "sitemap",
      title: "Sitemap",
      description: "Complete list of all tools and pages on ToolNames.",
      category: "Pages",
      url: "/sitemap",
      pageTitle: "Sitemap - Complete List of All Tools | ToolNames",
      metaDescription:
        "Complete list of all tools and pages available on ToolNames. Browse our calculators, converters, generators, utilities and more.",
    } as SitemapItem,
    ...generateUnitConverterRoutes(),
  ];

  // Group pages by category
  const pagesByCategory = groupBy(allPages, "category");
  const categories = Object.keys(pagesByCategory).sort();

  return (
    <div className="space-y-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Sitemap</h1>
        <p className="text-muted-foreground">
          Complete list of all tools and pages on ToolNames
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Navigation</CardTitle>
            <CardDescription>
              Quick links to each category on this page
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-6 space-y-2">
              {categories.map((category) => (
                <li key={category}>
                  <a
                    href={`#${category.toLowerCase().replace(/\s+/g, "-")}`}
                    className="text-primary hover:underline"
                  >
                    {category === "Pages" ? "Main Pages" : category}
                  </a>
                  <span className="ml-2 text-muted-foreground">
                    ({pagesByCategory[category].length}{" "}
                    {pagesByCategory[category].length === 1 ? "item" : "items"})
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {categories.map((category) => (
          <section
            key={category}
            id={category.toLowerCase().replace(/\s+/g, "-")}
            className="pt-4"
          >
            <h2 className="text-2xl font-semibold mb-4">
              {category === "Pages" ? "Main Pages" : category}
            </h2>

            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pagesByCategory[category].map((page) => (
                    <Link
                      key={page.url}
                      to={page.url}
                      className="block p-3 rounded-md border hover:border-primary hover:bg-primary/5 transition-colors"
                    >
                      <div className="font-medium text-primary">
                        {page.title}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {page.description.substring(0, 100)}
                        {page.description.length > 100 ? "..." : ""}
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>
        ))}
      </div>
    </div>
  );
};

export default SitemapPage;
