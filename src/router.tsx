import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import HomePage from "@/pages/HomePage";
import ToolPage from "@/pages/ToolPage";
import NotFoundPage from "@/pages/NotFoundPage";
import CSVExplorer from "@/pages/CSVExplorer";
import { availableTools } from "@/contexts/toolsData";
import { UnitConverterPage } from "@/pages/converters/UnitConverterPage";
import { HashGeneratorPage } from "@/components/pages/HashGeneratorPage";
import ColorTheoryPage from "@/pages/ColorTheoryPage";
import ToolView from "@/components/ToolView";

// Lazy load heavy category pages
const CalculatorsPage = lazy(() => import("@/pages/CalculatorsPage"));
const ConvertersPage = lazy(() => import("@/pages/ConvertersPage"));
const GeneratorsPage = lazy(() => import("@/pages/GeneratorsPage"));
const UtilitiesPage = lazy(() => import("@/pages/UtilitiesPage"));
const DesignPage = lazy(() => import("@/pages/DesignPage"));
const SEOPage = lazy(() => import("@/pages/SEOPage"));
const ProductivityPage = lazy(() => import("@/pages/ProductivityPage"));
const FileToolsPage = lazy(() => import("@/pages/FileToolsPage"));
const LotteryPage = lazy(() => import("@/pages/LotteryPage"));
const LazySitemapPage = lazy(() => import("@/pages/SitemapPage"));

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

// Create an array of hash algorithm routes
const hashGeneratorRoutes = [
  { algorithm: "sha1" },
  { algorithm: "sha256" },
  { algorithm: "sha384" },
  { algorithm: "sha512" },
];

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

// Wrapper for lazy loaded pages
const LazyWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<PageLoader />}>{children}</Suspense>
);

// Create the router
export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    errorElement: <NotFoundPage />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      // Category routes
      {
        path: "calculators",
        element: (
          <LazyWrapper>
            <CalculatorsPage />
          </LazyWrapper>
        ),
      },
      {
        path: "converters",
        element: (
          <LazyWrapper>
            <ConvertersPage />
          </LazyWrapper>
        ),
      },
      {
        path: "generators",
        element: (
          <LazyWrapper>
            <GeneratorsPage />
          </LazyWrapper>
        ),
      },
      {
        path: "utilities",
        element: (
          <LazyWrapper>
            <UtilitiesPage />
          </LazyWrapper>
        ),
      },
      {
        path: "design",
        element: (
          <LazyWrapper>
            <DesignPage />
          </LazyWrapper>
        ),
      },
      {
        path: "seo",
        element: (
          <LazyWrapper>
            <SEOPage />
          </LazyWrapper>
        ),
      },
      {
        path: "productivity",
        element: (
          <LazyWrapper>
            <ProductivityPage />
          </LazyWrapper>
        ),
      },
      {
        path: "file-tools",
        element: (
          <LazyWrapper>
            <FileToolsPage />
          </LazyWrapper>
        ),
      },
      {
        path: "lottery",
        element: (
          <LazyWrapper>
            <LotteryPage />
          </LazyWrapper>
        ),
      },
      {
        path: "sitemap",
        element: (
          <LazyWrapper>
            <LazySitemapPage />
          </LazyWrapper>
        ),
      },

      // CSV Explorer route
      {
        path: "/file-tools/csv-explorer",
        element: <CSVExplorer />,
      },

      // File Converter route
      {
        path: "/file-tools/file-converter",
        element: <ToolView />,
      },

      // Color Theory route
      {
        path: "/color-theory",
        element: <ColorTheoryPage />,
      },

      // Dynamic tool routes
      ...availableTools.map((tool) => ({
        path: tool.url,
        element: (
          <Suspense fallback={<PageLoader />}>
            <ToolPage toolId={tool.id} />
          </Suspense>
        ),
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

      // Special routes for hash generator with specific algorithms
      {
        path: "/generators/hash-generator/:algorithm",
        element: <HashGeneratorPage />,
      },
      ...hashGeneratorRoutes.map((route) => ({
        path: `/generators/hash-generator/${route.algorithm}`,
        element: <HashGeneratorPage algorithm={route.algorithm} />,
      })),

      // Catch-all for 404
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);
