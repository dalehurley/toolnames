import { MortgageCalculator } from "@/components/tools/calculators/MortgageCalculator";
import { CompoundInterestCalculator } from "@/components/tools/calculators/CompoundInterestCalculator";
import { BMICalculator } from "@/components/tools/calculators/BMICalculator";
import { ImageConverter } from "@/components/tools/converters/ImageConverter";
import { UnitConverter } from "@/components/tools/converters/UnitConverter";
import { Base64ImageConverter } from "@/components/tools/converters/Base64ImageConverter";
import { PasswordGenerator } from "@/components/tools/generators/PasswordGenerator";
import { QRCodeGenerator } from "@/components/tools/generators/QRCodeGenerator";
import { LoremIpsumGenerator } from "@/components/tools/generators/LoremIpsumGenerator";
import { ColorConverter } from "@/components/tools/converters/ColorConverter";
import { TextCaseConverter } from "@/components/tools/utilities/TextCaseConverter";
import { Base64Tool } from "@/components/tools/utilities/Base64Tool";
import { JSONFormatter } from "@/components/tools/utilities/JSONFormatter";
import { EmojiSmuggler } from "@/components/tools/utilities/EmojiSmuggler";
import { UrlEncoder } from "@/components/tools/utilities/UrlEncoder";
import { UuidGenerator } from "@/components/tools/generators/UuidGenerator";
import { TemperatureConverter } from "@/components/tools/converters/TemperatureConverter";
import { CharacterCounter } from "@/components/tools/utilities/CharacterCounter";
import { SchemaVisualizer } from "@/components/tools/utilities/SchemaVisualizer";
import { ChartBuilder } from "@/components/tools/utilities/ChartBuilder";
import CSVExplorer from "@/pages/CSVExplorer";
import {
  LucideIcon,
  DollarSign,
  Image as ImageIcon,
  KeyRound,
  Palette,
  TrendingUp,
  QrCode,
  Type,
  FileCode,
  Ruler,
  Scale,
  FileText,
  FileBadge,
  FileImage,
  MessageSquareMore,
  Link,
  Fingerprint,
  Thermometer,
  ActivitySquare,
  Table,
  BarChart3,
  Wifi,
} from "lucide-react";
import { NetworkLatencySimulator } from "@/components/tools/utilities/NetworkLatencySimulator";

// Tool type definition
export interface Tool {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  category: string;
  component: React.ComponentType;
  url: string;
  pageTitle: string;
  metaDescription: string;
  baseUrl?: string; // For tools with sub-URLs like unit converter
}

// Define all available tools
export const availableTools: Tool[] = [
  {
    id: "mortgage-calculator",
    title: "Mortgage Calculator",
    description:
      "Calculate mortgage payments, interest, and amortization schedules",
    icon: DollarSign,
    category: "calculators",
    component: MortgageCalculator,
    url: "/calculators/mortgage-calculator",
    pageTitle:
      "Mortgage Calculator - Calculate Payments & Interest | ToolNames",
    metaDescription:
      "Calculate mortgage payments, interest, and amortization schedules with our free, privacy-focused mortgage calculator tool. Runs entirely in your browser.",
  },
  {
    id: "compound-interest-calculator",
    title: "Compound Interest Calculator",
    description:
      "Calculate compound interest and visualize investment growth over time",
    icon: TrendingUp,
    category: "calculators",
    component: CompoundInterestCalculator,
    url: "/calculators/compound-interest-calculator",
    pageTitle: "Compound Interest Calculator - Investment Growth | ToolNames",
    metaDescription:
      "Calculate compound interest and visualize investment growth over time with our free compound interest calculator. Plan your savings and investments.",
  },
  {
    id: "bmi-calculator",
    title: "BMI Calculator",
    description:
      "Calculate your Body Mass Index (BMI) to evaluate whether you're at a healthy weight",
    icon: Scale,
    category: "calculators",
    component: BMICalculator,
    url: "/calculators/bmi-calculator",
    pageTitle: "BMI Calculator - Body Mass Index Calculator | ToolNames",
    metaDescription:
      "Calculate your Body Mass Index (BMI) to evaluate whether you're at a healthy weight with our free BMI calculator tool. Get instant results.",
  },
  {
    id: "image-converter",
    title: "Image Converter",
    description: "Convert images between different formats (JPEG, PNG, WebP)",
    icon: ImageIcon,
    category: "file-tools",
    component: ImageConverter,
    url: "/file-tools/image-converter",
    pageTitle: "Image Converter - Convert Between JPEG, PNG, WebP | ToolNames",
    metaDescription:
      "Convert images between different formats including JPEG, PNG, and WebP with our free image converter tool. No uploads required - works locally in your browser.",
  },
  {
    id: "unit-converter",
    title: "Unit Converter",
    description: "Convert between different units of measurement",
    icon: Ruler,
    category: "converters",
    component: UnitConverter,
    url: "/converters/unit-converter",
    pageTitle:
      "Unit Converter - Convert Length, Weight, Temperature & More | ToolNames",
    metaDescription:
      "Convert between different units of measurement including length, weight, temperature, volume, area, and time with our free unit converter tool.",
    baseUrl: "/converters/unit-converter",
  },
  {
    id: "color-converter",
    title: "Color Converter",
    description: "Convert colors between HEX, RGB, HSL, HSV, and CMYK formats",
    icon: Palette,
    category: "converters",
    component: ColorConverter,
    url: "/converters/color-converter",
    pageTitle: "Color Converter - HEX, RGB, HSL, HSV, CMYK | ToolNames",
    metaDescription:
      "Convert colors between HEX, RGB, HSL, HSV, and CMYK formats with our free color converter tool. Perfect for web designers and developers.",
  },
  {
    id: "base64-image-converter",
    title: "Base64 Image Converter",
    description: "Convert images to Base64 encoding or decode Base64 to images",
    icon: FileImage,
    category: "converters",
    component: Base64ImageConverter,
    url: "/converters/base64-image-converter",
    pageTitle: "Base64 Image Converter - Encode & Decode Images | ToolNames",
    metaDescription:
      "Convert images to Base64 encoding or decode Base64 to images with our free converter tool. No data leaves your device - all processing is local.",
  },
  {
    id: "password-generator",
    title: "Password Generator",
    description: "Generate secure, random passwords with customizable options",
    icon: KeyRound,
    category: "generators",
    component: PasswordGenerator,
    url: "/generators/password-generator",
    pageTitle: "Password Generator - Secure, Random Passwords | ToolNames",
    metaDescription:
      "Generate secure, random passwords with customizable options including length, character sets, and more with our free password generator tool.",
  },
  {
    id: "qr-code-generator",
    title: "QR Code Generator",
    description: "Generate QR codes for URLs, text, and contact information",
    icon: QrCode,
    category: "generators",
    component: QRCodeGenerator,
    url: "/generators/qr-code-generator",
    pageTitle:
      "QR Code Generator - Create QR Codes for URLs & Text | ToolNames",
    metaDescription:
      "Generate QR codes for URLs, text, and contact information with our free QR code generator tool. Download as PNG images for print or digital use.",
  },
  {
    id: "lorem-ipsum-generator",
    title: "Lorem Ipsum Generator",
    description: "Generate placeholder text for design mockups and layouts",
    icon: FileText,
    category: "generators",
    component: LoremIpsumGenerator,
    url: "/generators/lorem-ipsum-generator",
    pageTitle:
      "Lorem Ipsum Generator - Placeholder Text for Design | ToolNames",
    metaDescription:
      "Generate placeholder text for design mockups and layouts with our free Lorem Ipsum generator tool. Customize paragraph count, word count, and format.",
  },
  {
    id: "text-case-converter",
    title: "Text Case Converter",
    description:
      "Convert text between different cases (upper, lower, camel, snake, etc.)",
    icon: Type,
    category: "utilities",
    component: TextCaseConverter,
    url: "/utilities/text-case-converter",
    pageTitle:
      "Text Case Converter - Upper, Lower, Camel, Snake Case | ToolNames",
    metaDescription:
      "Convert text between different cases including uppercase, lowercase, camel case, snake case, and more with our free text case converter tool.",
  },
  {
    id: "base64-tool",
    title: "Base64 Encoder/Decoder",
    description: "Encode text to Base64 or decode Base64 to text",
    icon: FileCode,
    category: "utilities",
    component: Base64Tool,
    url: "/utilities/base64-tool",
    pageTitle: "Base64 Encoder/Decoder - Free Online Tool | ToolNames",
    metaDescription:
      "Encode text to Base64 or decode Base64 to text with our free online Base64 encoder/decoder tool. Secure, client-side processing.",
  },
  {
    id: "json-formatter",
    title: "JSON Formatter & Validator",
    description: "Format, validate, and beautify your JSON data",
    icon: FileBadge,
    category: "utilities",
    component: JSONFormatter,
    url: "/utilities/json-formatter",
    pageTitle:
      "JSON Formatter & Validator - Format and Beautify JSON | ToolNames",
    metaDescription:
      "Format, validate, and beautify your JSON data with our free JSON formatter and validator tool. Copy formatted JSON directly to your clipboard.",
  },
  {
    id: "emoji-smuggler",
    title: "Emoji Smuggler",
    description:
      "Hide secret messages in emojis using invisible Unicode characters",
    icon: MessageSquareMore,
    category: "utilities",
    component: EmojiSmuggler,
    url: "/utilities/emoji-smuggler",
    pageTitle: "Emoji Smuggler - Hide Secret Messages in Emojis | ToolNames",
    metaDescription:
      "Hide secret messages in emojis using invisible Unicode characters with our free emoji smuggler tool. Send steganographic messages that look like normal emojis.",
  },
  {
    id: "url-encoder",
    title: "URL Encoder/Decoder",
    description: "Encode, decode, and parse URL components",
    icon: Link,
    category: "utilities",
    component: UrlEncoder,
    url: "/utilities/url-encoder",
    pageTitle: "URL Encoder/Decoder - Encode, Decode & Parse URLs | ToolNames",
    metaDescription:
      "Encode, decode, and parse URL components with our free URL encoder/decoder tool. Perfect for web developers and anyone working with URLs.",
  },
  {
    id: "character-counter",
    title: "Character Counter",
    description:
      "Count characters, words, sentences, and paragraphs in your text",
    icon: FileText,
    category: "utilities",
    component: CharacterCounter,
    url: "/utilities/character-counter",
    pageTitle: "Character Counter - Count Words & Characters | ToolNames",
    metaDescription:
      "Count characters, words, sentences, and paragraphs in your text with our free character counter tool. Perfect for writers and content creators.",
  },
  {
    id: "schema-visualizer",
    title: "Schema Visualizer",
    description:
      "Generate interactive visual diagrams from JSON, YAML, or database schema files",
    icon: ActivitySquare,
    category: "utilities",
    component: SchemaVisualizer,
    url: "/utilities/schema-visualizer",
    pageTitle: "Schema Visualizer - Visualize Data Relationships | ToolNames",
    metaDescription:
      "Generate interactive visual diagrams from JSON, YAML, or database schema files with our free schema visualizer tool. Understand complex data structures at a glance.",
  },
  {
    id: "uuid-generator",
    title: "UUID Generator",
    description: "Generate UUIDs in various formats (v1, v3, v4, v5)",
    icon: Fingerprint,
    category: "generators",
    component: UuidGenerator,
    url: "/generators/uuid-generator",
    pageTitle: "UUID Generator - Create UUIDs in Multiple Formats | ToolNames",
    metaDescription:
      "Generate universally unique identifiers (UUIDs) in v1, v3, v4, and v5 formats with our free UUID generator tool. Create single or multiple UUIDs at once.",
  },
  {
    id: "temperature-converter",
    title: "Temperature Converter",
    description:
      "Convert between Celsius, Fahrenheit, and Kelvin temperature scales",
    icon: Thermometer,
    category: "converters",
    component: TemperatureConverter,
    url: "/converters/temperature-converter",
    pageTitle: "Temperature Converter - Convert Between C, F, K | ToolNames",
    metaDescription:
      "Convert temperatures between Celsius, Fahrenheit, and Kelvin with our free, easy-to-use temperature converter tool. Get instant accurate conversions.",
  },
  {
    id: "csv-explorer",
    title: "CSV Explorer",
    description:
      "Analyze, visualize, clean, and export CSV data with interactive charts and data grid",
    icon: Table,
    category: "file-tools",
    component: CSVExplorer,
    url: "/file-tools/csv-explorer",
    pageTitle: "CSV Explorer - Analyze & Visualize CSV Data | ToolNames",
    metaDescription:
      "Upload and explore CSV files with our powerful data analysis tool. Clean data, create charts, and export results - all running directly in your browser for privacy.",
  },
  {
    id: "chart-builder",
    title: "Chart Builder",
    description: "Create and customize charts without coding using Chart.js",
    icon: BarChart3,
    category: "utilities",
    component: ChartBuilder,
    url: "/utilities/chart-builder",
    pageTitle:
      "Chart Builder - Create Custom Charts without Coding | ToolNames",
    metaDescription:
      "Create beautiful, customizable charts without coding using our free chart builder tool. Build bar, line, pie, scatter and radar charts with ease and export them as images.",
  },
  {
    id: "network-latency-simulator",
    title: "Network Latency Simulator",
    description: "Simulate network conditions for testing web applications",
    icon: Wifi,
    category: "utilities",
    component: NetworkLatencySimulator,
    url: "/utilities/network-latency-simulator",
    pageTitle:
      "Network Latency Simulator - Test Under Various Network Conditions | ToolNames",
    metaDescription:
      "Simulate different network conditions to test how your web applications perform under varying connection speeds, latency, and packet loss. Perfect for developers and QA engineers.",
  },
  // Add more tools here as they are created
];

// Utility function to get a category's readable name
export const getCategoryName = (categoryId: string): string => {
  const categories: Record<string, string> = {
    all: "All Tools",
    calculators: "Calculators",
    converters: "Converters",
    generators: "Generators",
    utilities: "Utilities",
    "file-tools": "File Tools",
  };

  return categories[categoryId] || categoryId;
};
