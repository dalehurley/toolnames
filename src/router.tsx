import { createBrowserRouter, Navigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import HomePage from "@/pages/HomePage";
import CategoryPage from "@/pages/CategoryPage";
import ToolPage from "@/pages/ToolPage";
import NotFoundPage from "@/pages/NotFoundPage";
import SitemapPage from "@/pages/SitemapPage";
import { availableTools } from "@/contexts/ToolsContext";
import { UnitConverterPage } from "@/pages/converters/UnitConverterPage";

// Create an array of all unit conversion routes
const unitConverterRoutes = [
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

// Create the router
export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    errorElement: <NotFoundPage />,
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      // Category routes
      {
        path: "/calculators",
        element: <CategoryPage category="calculators" />,
      },
      {
        path: "/converters",
        element: <CategoryPage category="converters" />,
      },
      {
        path: "/generators",
        element: <CategoryPage category="generators" />,
      },
      {
        path: "/utilities",
        element: <CategoryPage category="utilities" />,
      },
      {
        path: "/file-tools",
        element: <CategoryPage category="file-tools" />,
      },

      // Sitemap route
      {
        path: "/sitemap",
        element: <SitemapPage />,
      },

      // Tool routes - dynamically generate routes for each tool
      ...availableTools.map((tool) => ({
        path: tool.url,
        element: <ToolPage toolId={tool.id} />,
      })),

      // Special routes for unit converter with specific conversions
      ...unitConverterRoutes.map((route) => ({
        path: `/converters/unit-converter/${route.category}/${route.from}-to-${route.to}`,
        element: (
          <UnitConverterPage
            fromUnit={route.from}
            toUnit={route.to}
            category={route.category}
          />
        ),
      })),

      // Redirect legacy paths
      {
        path: "/app",
        element: <Navigate to="/" replace />,
      },

      // Catch-all for 404
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);
