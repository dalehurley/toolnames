import { MortgageCalculator } from "@/components/tools/calculators/MortgageCalculator";
import { CompoundInterestCalculator } from "@/components/tools/calculators/CompoundInterestCalculator";
import { BMICalculator } from "@/components/tools/calculators/BMICalculator";
import { TipCalculator } from "@/components/tools/calculators/TipCalculator";
import { DiscountCalculator } from "@/components/tools/calculators/DiscountCalculator";
import { ImageConverter } from "@/components/tools/converters/ImageConverter";
import { UnitConverter } from "@/components/tools/converters/UnitConverter";
import { Base64ImageConverter } from "@/components/tools/converters/Base64ImageConverter";
import { NumberBaseConverter } from "@/components/tools/converters/NumberBaseConverter";
import { PasswordGenerator } from "@/components/tools/generators/PasswordGenerator";
import { QRCodeGenerator } from "@/components/tools/generators/QRCodeGenerator";
import { LoremIpsumGenerator } from "@/components/tools/generators/LoremIpsumGenerator";
import { HashGenerator } from "@/components/tools/generators/HashGenerator";
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
import { JSONSchemaCreator } from "@/components/tools/utilities/JSONSchemaCreator";
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
  Dices,
  FileJson,
  Calculator,
  Hash,
  Shield,
  Percent,
  Car,
  Timer,
  CalendarDays,
  HeartPulse,
  Utensils,
  Truck,
  Coins,
  BatteryCharging,
  CalendarClock,
  Search,
  Layout,
  Network,
} from "lucide-react";
import { NetworkLatencySimulator } from "@/components/tools/utilities/NetworkLatencySimulator";
import LotteryPickerGenerator from "@/components/tools/generators/LotteryPickerGenerator";
import { PercentageCalculator } from "@/components/tools/calculators/PercentageCalculator";
import { FuelCalculator } from "@/components/tools/calculators/FuelCalculator";
import { TimeCalculator } from "@/components/tools/calculators/TimeCalculator";
import { AgeCalculator } from "@/components/tools/calculators/AgeCalculator";
import { DateCalculator } from "@/components/tools/calculators/DateCalculator";
import { HealthCalculator } from "@/components/tools/calculators/HealthCalculator";
import { CalorieCalculator } from "@/components/tools/calculators/CalorieCalculator";
import { ShippingCalculator } from "@/components/tools/calculators/ShippingCalculator";
import { InvestmentCalculator } from "@/components/tools/calculators/InvestmentCalculator";
import { ElectricityCalculator } from "@/components/tools/calculators/ElectricityCalculator";
import { KeywordDensityAnalyzer } from "@/components/tools/seo/KeywordDensityAnalyzer";
import { MetaTagAnalyzer } from "@/components/tools/seo/MetaTagAnalyzer";
import { HeadingStructureVisualizer } from "@/components/tools/seo/HeadingStructureVisualizer";
import { InternalLinkMapper } from "@/components/tools/seo/InternalLinkMapper";

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
    id: "json-schema-creator",
    title: "JSON Schema Creator",
    description: "Generate JSON Schema from your JSON data for documentation and validation",
    icon: FileJson,
    category: "utilities",
    component: JSONSchemaCreator,
    url: "/utilities/json-schema-creator",
    pageTitle: "JSON Schema Creator - Generate Schema from JSON | ToolNames",
    metaDescription:
      "Generate JSON Schema from your JSON data with our free schema creator tool. Perfect for API documentation, data validation, and code generation.",
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
  {
    id: "lottery-picker",
    title: "Lottery Number Picker",
    description: "Generate random lottery numbers for various lottery games",
    icon: Dices,
    category: "generators",
    component: LotteryPickerGenerator,
    url: "/generators/lottery-picker",
    pageTitle: "Lottery Number Picker - Random Number Generator | ToolNames",
    metaDescription: "Generate random lottery numbers for various lottery games including Powerball, Mega Millions, and custom formats with our free lottery number picker tool.",
  },
  {
    id: "tip-calculator",
    title: "Tip Calculator",
    description: "Calculate tip amount and split bills among people",
    icon: Calculator,
    category: "calculators",
    component: TipCalculator,
    url: "/calculators/tip-calculator",
    pageTitle: "Tip Calculator - Calculate Tips & Split Bills | ToolNames",
    metaDescription: "Calculate tip amounts and split bills among people with our free, easy-to-use tip calculator. Perfect for dining out and sharing expenses.",
  },
  {
    id: "number-base-converter",
    title: "Number Base Converter",
    description: "Convert between binary, octal, decimal, and hexadecimal number systems",
    icon: Hash,
    category: "converters",
    component: NumberBaseConverter,
    url: "/converters/number-base-converter",
    pageTitle: "Number Base Converter - Binary, Octal, Decimal, Hex | ToolNames",
    metaDescription: "Convert between binary, octal, decimal, and hexadecimal number systems with our free number base converter tool. Perfect for programmers and students.",
  },
  {
    id: "hash-generator",
    title: "Hash Generator",
    description: "Generate secure cryptographic hashes from text using various algorithms",
    icon: Shield,
    category: "generators",
    component: HashGenerator,
    url: "/generators/hash-generator",
    pageTitle: "Hash Generator - SHA-1, SHA-256, SHA-384, SHA-512 | ToolNames",
    metaDescription: "Generate secure cryptographic hashes from text using SHA-1, SHA-256, SHA-384, and SHA-512 algorithms with our free hash generator tool.",
    baseUrl: "/generators/hash-generator",
  },
  {
    id: "discount-calculator",
    title: "Discount Calculator",
    description: "Calculate sale prices, savings, and discounts for shopping",
    icon: Percent,
    category: "calculators",
    component: DiscountCalculator,
    url: "/calculators/discount-calculator",
    pageTitle: "Discount Calculator - Calculate Sale Prices & Savings | ToolNames",
    metaDescription: "Calculate sale prices, savings amounts, and discount percentages with our free discount calculator tool. Perfect for shopping and deal evaluation.",
  },
  {
    id: "percentage-calculator",
    title: "Percentage Calculator",
    description: "Calculate percentages, increases, and decreases.",
    icon: Percent,
    category: "calculators",
    component: PercentageCalculator,
    url: "/calculators/percentage-calculator",
    pageTitle: "Percentage Calculator - Calculate Percentages & Proportions",
    metaDescription:
      "Calculate percentages with ease. Find what percentage one number is of another, calculate percentage increases or decreases, and solve other percentage-based problems.",
  },
  {
    id: "fuel-calculator",
    title: "Fuel Efficiency Calculator",
    description: "Calculate MPG and fuel costs for trips.",
    icon: Car,
    category: "calculators",
    component: FuelCalculator,
    url: "/calculators/fuel-calculator",
    pageTitle: "Fuel Efficiency Calculator - Calculate MPG & Trip Costs",
    metaDescription:
      "Easily calculate your vehicle's fuel efficiency in MPG or L/100km, estimate fuel costs for trips, and analyze your fuel consumption patterns with our user-friendly calculator.",
  },
  {
    id: "time-calculator",
    title: "Time Calculator",
    description: "Add and subtract time intervals.",
    icon: Timer,
    category: "calculators",
    component: TimeCalculator,
    url: "/calculators/time-calculator",
    pageTitle: "Time Calculator - Calculate Time Intervals",
    metaDescription:
      "Add or subtract time intervals, calculate duration between times, and convert between time formats with our easy-to-use time calculator.",
  },
  {
    id: "age-calculator",
    title: "Age Calculator",
    description: "Calculate your exact age in years, months, and days.",
    icon: CalendarClock,
    category: "calculators",
    component: AgeCalculator,
    url: "/calculators/age-calculator",
    pageTitle: "Age Calculator - Calculate Your Exact Age",
    metaDescription:
      "Calculate your exact age in years, months, and days. See how many days you've been alive and when your next birthday is with our precise age calculator.",
  },
  {
    id: "date-calculator",
    title: "Date Calculator",
    description: "Calculate days between dates and add/subtract days.",
    icon: CalendarDays,
    category: "calculators",
    component: DateCalculator,
    url: "/calculators/date-calculator",
    pageTitle: "Date Calculator - Calculate Days Between Dates",
    metaDescription:
      "Calculate the number of days between two dates or add/subtract days from a date with our easy-to-use date calculator.",
  },
  {
    id: "health-calculator",
    title: "Health Metrics Calculator",
    description: "Calculate BMI, BMR, TDEE, and ideal weight.",
    icon: HeartPulse,
    category: "calculators",
    component: HealthCalculator,
    url: "/calculators/health-calculator",
    pageTitle: "Health Metrics Calculator - BMI, BMR & Ideal Weight",
    metaDescription:
      "Calculate your BMI, BMR, TDEE, and ideal weight with our comprehensive health metrics calculator. Get insights into your body composition and calorie needs.",
  },
  {
    id: "calorie-calculator",
    title: "Calorie Calculator",
    description: "Calculate daily calorie needs and macronutrients.",
    icon: Utensils,
    category: "calculators",
    component: CalorieCalculator,
    url: "/calculators/calorie-calculator",
    pageTitle: "Calorie Calculator - Calculate Daily Calorie Needs",
    metaDescription:
      "Calculate your daily calorie needs based on your body metrics, activity level, and goals. Get personalized macronutrient recommendations for weight loss, maintenance, or gain.",
  },
  {
    id: "shipping-calculator",
    title: "Shipping Cost Calculator",
    description: "Calculate shipping costs based on weight, dimensions, and distance",
    icon: Truck,
    category: "calculators",
    component: ShippingCalculator,
    url: "/calculators/shipping-calculator",
    pageTitle: "Shipping Cost Calculator - Estimate Shipping Expenses | ToolNames",
    metaDescription: "Calculate shipping costs based on package weight, dimensions, and distance with our shipping cost calculator. Compare rates and estimate expenses for logistics planning.",
  },
  {
    id: "investment-calculator",
    title: "Investment Returns Calculator",
    description: "Calculate potential returns on investments with customizable parameters",
    icon: Coins,
    category: "calculators",
    component: InvestmentCalculator,
    url: "/calculators/investment-calculator",
    pageTitle: "Investment Returns Calculator - Project Investment Growth | ToolNames",
    metaDescription: "Calculate potential returns on investments with customizable parameters including initial investment, monthly contributions, interest rate, and investment horizon.",
  },
  {
    id: "electricity-calculator",
    title: "Electricity Cost Calculator",
    description: "Calculate electricity costs for appliances and devices",
    icon: BatteryCharging,
    category: "calculators",
    component: ElectricityCalculator,
    url: "/calculators/electricity-calculator",
    pageTitle: "Electricity Cost Calculator - Appliance Energy Usage | ToolNames",
    metaDescription: "Calculate electricity costs for household appliances and devices based on usage time and power consumption. Identify energy savings opportunities and reduce your bills.",
  },
  {
    id: "keyword-density-analyzer",
    title: "Keyword Density Analyzer",
    description: "Analyzes the frequency and distribution of keywords on a page, identifying potential keyword stuffing or optimization opportunities",
    icon: Search,
    category: "seo",
    component: KeywordDensityAnalyzer,
    url: "/seo/keyword-density-analyzer",
    pageTitle: "Keyword Density Analyzer - Optimize Content for SEO | ToolNames",
    metaDescription: "Analyze the keyword distribution on your web pages to improve SEO performance. Identify potential keyword stuffing and optimization opportunities with our free keyword density tool.",
  },
  {
    id: "meta-tag-analyzer",
    title: "Meta Tag Analyzer & Generator",
    description: "Analyze and optimize meta tags for better SEO and social sharing",
    icon: FileCode,
    category: "seo",
    component: MetaTagAnalyzer,
    url: "/seo/meta-tag-analyzer",
    pageTitle: "Meta Tag Analyzer & Generator - Optimize Meta Tags for SEO | ToolNames",
    metaDescription: "Analyze and optimize your website's meta tags for better SEO and social media sharing. Check titles, descriptions, Open Graph tags, and Twitter Cards with our comprehensive meta tag tool.",
  },
  {
    id: "heading-structure-visualizer",
    title: "Heading Structure Visualizer",
    description: "Creates a visual hierarchy of heading tags (H1-H6) to identify structural issues and ensure proper semantic organization",
    icon: Layout,
    category: "seo",
    component: HeadingStructureVisualizer,
    url: "/seo/heading-structure-visualizer",
    pageTitle: "Heading Structure Visualizer - Analyze HTML Heading Hierarchy | ToolNames",
    metaDescription: "Visualize your webpage's heading structure to ensure proper semantic organization and SEO-friendly hierarchy. Identify issues like missing H1 tags, skipped heading levels, and improper nesting.",
  },
  {
    id: "internal-link-mapper",
    title: "Internal Link Mapper",
    description: "Analyzes internal linking structure within HTML files, identifying orphaned content and optimization opportunities",
    icon: Network,
    category: "seo",
    component: InternalLinkMapper,
    url: "/seo/internal-link-mapper",
    pageTitle: "Internal Link Mapper - Analyze Website Structure | ToolNames",
    metaDescription: "Analyze your website's internal linking structure to identify orphaned content and optimization opportunities. Upload multiple HTML files or a site archive to visualize relationships between pages.",
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
    seo: "SEO Tools",
  };

  return categories[categoryId] || categoryId;
};
