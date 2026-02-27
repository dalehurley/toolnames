import { lazy } from "react";
import { MortgageCalculator } from "@/components/tools/calculators/MortgageCalculator";
import { CompoundInterestCalculator } from "@/components/tools/calculators/CompoundInterestCalculator";
import { BMICalculator } from "@/components/tools/calculators/BMICalculator";
import { TipCalculator } from "@/components/tools/calculators/TipCalculator";
import { DiscountCalculator } from "@/components/tools/calculators/DiscountCalculator";
import { AdvancedMathCalculator } from "@/components/tools/calculators/AdvancedMathCalculator";
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
import { CountdownTimer } from "@/components/tools/utilities/CountdownTimer";
import { UuidGenerator } from "@/components/tools/generators/UuidGenerator";
import { TemperatureConverter } from "@/components/tools/converters/TemperatureConverter";
import { CharacterCounter } from "@/components/tools/utilities/CharacterCounter";
import { SchemaVisualizer } from "@/components/tools/utilities/SchemaVisualizer";
import { ChartBuilder } from "@/components/tools/utilities/ChartBuilder";
import CSVExplorer from "@/pages/CSVExplorer";
import { JSONSchemaCreator } from "@/components/tools/utilities/JSONSchemaCreator";
import { ColorPaletteExplorer } from "@/components/tools/design/ColorPaletteExplorer";
import { TimeZoneConverter } from "@/components/tools/converters/TimeZoneConverter";
import { FlexboxGenerator } from "@/components/tools/design/FlexboxGenerator";
import { CSSGridGenerator } from "@/components/tools/design/CSSGridGenerator";
import ResponsiveContainerBuilder from "@/components/tools/design/ResponsiveContainerBuilder";
import MarginPaddingVisualizer from "@/components/tools/design/MarginPaddingVisualizer";
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
  Dices,
  Hash,
  Percent,
  DollarSignIcon,
  FileSpreadsheet,
  Search,
  Clock,
  CalendarDays,
  NetworkIcon,
  LayoutGrid,
  Layout,
  GraduationCap,
  Car,
  Heart,
  Leaf,
  PiggyBank,
  Music,
  PenTool,
  Wand2,
  Timer,
  Binary,
  Accessibility,
  TextCursorInput,
  Database,
  Ratio,
  Clapperboard,
  BookOpenCheck,
  AlignLeft,
  ScanLine,
  Mic,
  MapPin,
  Smartphone,
  Sun,
  Clipboard,
  Activity,
  Bell,
  Paintbrush,
  Share2,
  Wifi,
  Globe,
  Shuffle,
  Braces,
  Lock,
  Bot,
} from "lucide-react";
import { NetworkLatencySimulator } from "@/components/tools/utilities/NetworkLatencySimulator";
import {
  LotteryPickerGenerator,
  LotteryHistoryAnalyzer,
  LotteryWheelGenerator,
  FrequencyDistributionVisualizer
} from "@/components/tools/lottery";
import { PercentageCalculator } from "@/components/tools/calculators/PercentageCalculator";
import { FuelCalculator } from "@/components/tools/calculators/FuelCalculator";
import { TimeCalculator } from "@/components/tools/calculators/TimeCalculator";
import { AgeCalculator } from "@/components/tools/calculators/AgeCalculator";
import { DateCalculator } from "@/components/tools/calculators/DateCalculator";
import { HealthCalculator } from "@/components/tools/calculators/HealthCalculator";
import { PregnancyDueDateCalculator } from "@/components/tools/calculators/PregnancyDueDateCalculator/PregnancyDueDateCalculator";
import { CalorieCalculator } from "@/components/tools/calculators/CalorieCalculator";
import { InvestmentCalculator } from "@/components/tools/calculators/InvestmentCalculator";
import { ElectricityCalculator } from "@/components/tools/calculators/ElectricityCalculator";
import { LoanPaymentCalculator } from "@/components/tools/calculators/LoanPaymentCalculator";
import { CarLoanCalculator } from "@/components/tools/calculators/CarLoanCalculator";
import { KeywordDensityAnalyzer } from "@/components/tools/seo/KeywordDensityAnalyzer";
import { MetaTagAnalyzer } from "@/components/tools/seo/MetaTagAnalyzer";
import { HeadingStructureVisualizer } from "@/components/tools/seo/HeadingStructureVisualizer";
import { InternalLinkMapper } from "@/components/tools/seo/InternalLinkMapper";
import AltTextAnalyzer from "@/components/tools/seo/AltTextAnalyzer";
import { FinancialGoalCalculator } from "@/components/tools/calculators/FinancialGoalCalculator";
import { InflationCalculator } from "@/components/tools/calculators/InflationCalculator";
import { LoanPayoffCalculator } from "@/components/tools/calculators/LoanPayoffCalculator";
import { MarkdownEditor } from "@/components/tools/utilities/MarkdownEditor";
import RegExTester from "@/components/tools/utilities/RegExTester";
import ColorPaletteGenerator from "@/components/tools/generators/ColorPaletteGenerator";
import { YAMLValidator } from "@/components/tools/utilities/YAMLValidator";
import LotteryOddsCalculator from "@/components/tools/calculators/LotteryOddsCalculator";
import { PomodoroTimer } from "@/components/tools/productivity/PomodoroTimer/PomodoroTimer";
import KanbanBoard from "@/components/tools/productivity/KanbanBoard";
import NoteTaking from "@/components/tools/productivity/NoteTaking";
import PatternGenerator from "@/components/tools/pattern-generator/PatternGenerator";
import HabitTracker from "@/components/tools/productivity/HabitTracker";
import { TextFormatter } from "@/components/tools/utilities/TextFormatter";
import { DiffChecker } from "@/components/tools/utilities/DiffChecker";
import { FileConverter } from "@/components/tools/converters/FileConverter";
import TimeBlockingCalendar from "@/components/tools/time-blocking/TimeBlockingCalendar";
import { TailwindComponentMaker } from "@/components/tools/design/TailwindComponentMaker";
import { PersonalDataDashboard } from "@/components/tools/productivity/PersonalDataDashboard";
import { GradeCalculator } from "@/components/tools/calculators/GradeCalculator/GradeCalculator";
import { BodyFatCalculator } from "@/components/tools/calculators/BodyFatCalculator";
import { CarbonFootprintCalculator } from "@/components/tools/calculators/CarbonFootprintCalculator/CarbonFootprintCalculator";
import { RetirementCalculator } from "@/components/tools/calculators/RetirementCalculator";
import { ROICalculator } from "@/components/tools/calculators/ROICalculator/ROICalculator";
import { SalaryCalculator } from "@/components/tools/calculators/SalaryCalculator/SalaryCalculator";
import { AudioFormatConverter } from "@/components/tools/converters/AudioFormatConverter/AudioFormatConverter";
import { CSSGradientGenerator } from "@/components/tools/design/CSSGradientGenerator";
import { CronExpressionBuilder } from "@/components/tools/utilities/CronExpressionBuilder";
import { JsonToTypeScript } from "@/components/tools/utilities/JsonToTypeScript";
import { MorseCodeTranslator } from "@/components/tools/converters/MorseCodeTranslator";
import { WordFrequencyAnalyzer } from "@/components/tools/utilities/WordFrequencyAnalyzer";
import { SqlFormatter } from "@/components/tools/utilities/SqlFormatter";
import { AspectRatioCalculator } from "@/components/tools/calculators/AspectRatioCalculator";
import { CSSAnimationGenerator } from "@/components/tools/design/CSSAnimationGenerator";
import { ReadingTimeEstimator } from "@/components/tools/utilities/ReadingTimeEstimator";
import { StopwatchTimer } from "@/components/tools/productivity/StopwatchTimer";
import { ColorBlindnessSimulator } from "@/components/tools/design/ColorBlindnessSimulator";
import { AsciiArtGenerator } from "@/components/tools/generators/AsciiArtGenerator";
import { NumberToWords } from "@/components/tools/converters/NumberToWords";
import { RandomNumberGenerator } from "@/components/tools/generators/RandomNumberGenerator";
import { HTMLEntityEncoder } from "@/components/tools/utilities/HTMLEntityEncoder";
import { JWTDecoder } from "@/components/tools/utilities/JWTDecoder";
import { TypographyScaleGenerator } from "@/components/tools/design/TypographyScaleGenerator";
import { ImageMetadataViewer } from "@/components/tools/file-tools/ImageMetadataViewer";
import { AudioWaveformAnalyzer } from "@/components/tools/html5-apis/AudioWaveformAnalyzer";
import { VoiceToText } from "@/components/tools/html5-apis/VoiceToText";
import { GeolocationTool } from "@/components/tools/html5-apis/GeolocationTool";
import { DeviceOrientationVisualizer } from "@/components/tools/html5-apis/DeviceOrientationVisualizer";
import { BrowserStorageInspector } from "@/components/tools/html5-apis/BrowserStorageInspector";
import { ScreenWakeLock } from "@/components/tools/html5-apis/ScreenWakeLock";
import { ClipboardInspector } from "@/components/tools/html5-apis/ClipboardInspector";
import { MediaRecorderTool } from "@/components/tools/html5-apis/MediaRecorderTool";
import { PerformanceMonitor } from "@/components/tools/html5-apis/PerformanceMonitor";
import { WebNotificationsBuilder } from "@/components/tools/html5-apis/WebNotificationsBuilder";
import { CanvasDrawingTool } from "@/components/tools/html5-apis/CanvasDrawingTool";
import { VibrationTester } from "@/components/tools/html5-apis/VibrationTester";
import { WebShareTool } from "@/components/tools/html5-apis/WebShareTool";
import { NetworkInfoMonitor } from "@/components/tools/html5-apis/NetworkInfoMonitor";
import { PWAManifestGenerator } from "@/components/tools/html5-apis/PWAManifestGenerator";
import { UniversalAIPlayground } from "@/components/tools/productivity/UniversalAIPlayground";

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
      "Estimate payments, interest, and amortization for your mortgage.",
    icon: DollarSign,
    category: "calculators",
    component: MortgageCalculator,
    url: "/calculators/mortgage-calculator",
    pageTitle:
      "Free Mortgage Calculator: Estimate Payments & Amortization | ToolNames",
    metaDescription:
      "Estimate monthly mortgage payments, total interest, and view a full amortization schedule with our easy-to-use, free Mortgage Calculator. Secure, client-side calculations.",
  },
  {
    id: "loan-payment-calculator",
    title: "Loan Payment Calculator",
    description:
      "Calculate payments and interest for auto, personal, or other loans.",
    icon: DollarSignIcon,
    category: "calculators",
    component: LoanPaymentCalculator,
    url: "/calculators/loan-payment-calculator",
    pageTitle: "Loan Payment Calculator: Auto, Mortgage, Personal Loans | ToolNames",
    metaDescription:
      "Free loan payment calculator to determine monthly payments and total interest for auto, mortgage, or personal loans. Includes detailed amortization schedule. Privacy-focused.",
  },
  {
    id: "car-loan-calculator",
    title: "Car Loan Calculator",
    description:
      "Calculate auto loan payments, compare financing options, and view amortization schedules.",
    icon: Car,
    category: "calculators",
    component: CarLoanCalculator,
    url: "/calculators/car-loan-calculator",
    pageTitle: "Car Loan Calculator: Auto Financing & Payment Estimator | ToolNames",
    metaDescription:
      "Free car loan calculator to estimate monthly payments, compare financing options, and view full amortization schedules. Calculate early payoff savings. Client-side, privacy-focused.",
  },
  {
    id: "compound-interest-calculator",
    title: "Compound Interest Calculator",
    description:
      "See how your investments can grow with the power of compound interest.",
    icon: TrendingUp,
    category: "calculators",
    component: CompoundInterestCalculator,
    url: "/calculators/compound-interest-calculator",
    pageTitle: "Compound Interest Calculator: Investment & Savings Growth | ToolNames",
    metaDescription:
      "Calculate the future value of your investments with our free Compound Interest Calculator. See how your savings grow over time with compounding. Secure and easy to use.",
  },
  {
    id: "bmi-calculator",
    title: "BMI Calculator",
    description:
      "Calculate your Body Mass Index (BMI) to assess your weight status.",
    icon: Scale,
    category: "calculators",
    component: BMICalculator,
    url: "/calculators/bmi-calculator",
    pageTitle: "BMI Calculator: Check Your Body Mass Index Online | ToolNames",
    metaDescription:
      "Calculate your Body Mass Index (BMI) quickly and easily with our free online BMI Calculator. Understand your weight category and health implications. Privacy assured.",
  },
  {
    id: "body-fat-calculator",
    title: "Body Fat Calculator",
    description:
      "Calculate body fat percentage using US Navy and Deurenberg methods.",
    icon: Scale,
    category: "calculators",
    component: BodyFatCalculator,
    url: "/calculators/body-fat-calculator",
    pageTitle: "Body Fat Calculator: US Navy & BMI Methods | ToolNames",
    metaDescription:
      "Calculate your body fat percentage using US Navy circumference method and Deurenberg BMI-based formula. View category, lean mass, and comparison charts.",
  },
  {
    id: "carbon-footprint-calculator",
    title: "Carbon Footprint Calculator",
    description:
      "Calculate your personal carbon emissions and find ways to reduce.",
    icon: Leaf,
    category: "calculators",
    component: CarbonFootprintCalculator,
    url: "/calculators/carbon-footprint-calculator",
    pageTitle: "Carbon Footprint Calculator: Calculate Your CO2 Emissions | ToolNames",
    metaDescription:
      "Free carbon footprint calculator to estimate your personal CO2 emissions from transportation, energy, food, and lifestyle choices. Get personalized reduction suggestions.",
  },
  {
    id: "advanced-math-calculator",
    title: "Advanced Math Calculator",
    description:
      "Solver for statistical analysis, equations, and data visualization.",
    icon: BarChart3,
    category: "calculators",
    component: AdvancedMathCalculator,
    url: "/calculators/advanced-math-calculator",
    pageTitle: "Advanced Math & Statistics Calculator Online | ToolNames",
    metaDescription:
      "Perform complex statistical analysis, solve equations, and visualize data with our Advanced Math Calculator. Features regression, descriptive statistics, and more. Free & private.",
  },
  {
    id: "image-converter",
    title: "Image Converter",
    description: "Convert images between JPG, PNG, WebP, GIF, and BMP formats.",
    icon: ImageIcon,
    category: "file-tools",
    component: ImageConverter,
    url: "/file-tools/image-converter",
    pageTitle: "Free Online Image Converter: JPG, PNG, WebP, GIF | ToolNames",
    metaDescription:
      "Easily convert images online between JPEG, PNG, WebP, GIF, and BMP formats. Our free, client-side image converter ensures privacy. No uploads, instant conversion.",
  },
  {
    id: "unit-converter",
    title: "Unit Converter",
    description: "Convert length, weight, temperature, volume, area, and more.",
    icon: Ruler,
    category: "converters",
    component: UnitConverter,
    url: "/converters/unit-converter",
    pageTitle:
      "Comprehensive Unit Converter: Length, Weight, Temp & More | ToolNames",
    metaDescription:
      "Free online unit converter for length, weight, temperature, volume, area, speed, and time. Quick, accurate, and easy-to-use for all your conversion needs. Client-side processing.",
    baseUrl: "/converters/unit-converter",
  },
  {
    id: "color-converter",
    title: "Color Code Converter",
    description: "Convert HEX, RGB, HSL, HSV, and CMYK color codes.",
    icon: Palette,
    category: "converters",
    component: ColorConverter,
    url: "/converters/color-converter",
    pageTitle: "Color Converter: HEX, RGB, HSL, HSV, CMYK Codes | ToolNames",
    metaDescription:
      "Convert color codes between HEX, RGB, HSL, HSV, and CMYK formats. Free online tool for web designers and developers. Includes color picker and live preview.",
  },
  {
    id: "base64-image-converter",
    title: "Base64 Image Converter",
    description: "Encode images to Base64 strings or decode Base64 back to images.",
    icon: FileImage,
    category: "converters",
    component: Base64ImageConverter,
    url: "/converters/base64-image-converter",
    pageTitle: "Base64 Image Converter: Encode to Base64 & Decode to Image | ToolNames",
    metaDescription:
      "Convert images to Base64 strings or decode Base64 data back to images with our free online tool. Supports JPG, PNG, GIF. Secure client-side processing.",
  },
  {
    id: "password-generator",
    title: "Password Generator",
    description: "Create strong, secure, random passwords with custom options.",
    icon: KeyRound,
    category: "generators",
    component: PasswordGenerator,
    url: "/generators/password-generator",
    pageTitle: "Secure Password Generator: Create Strong, Random Passwords | ToolNames",
    metaDescription:
      "Generate strong, secure, and random passwords with our customizable Password Generator. Adjust length, include symbols, numbers, and case options. Free and private.",
  },
  {
    id: "qr-code-generator",
    title: "QR Code Generator",
    description: "Generate QR codes for URLs, text, contact info, Wi-Fi, and more.",
    icon: QrCode,
    category: "generators",
    component: QRCodeGenerator,
    url: "/generators/qr-code-generator",
    pageTitle:
      "Free QR Code Generator: Create Custom QR Codes Online | ToolNames",
    metaDescription:
      "Generate custom QR codes online for URLs, text, vCards, Wi-Fi access, and more. Free, easy-to-use QR Code Generator with download options (PNG, SVG).",
  },
  {
    id: "lorem-ipsum-generator",
    title: "Lorem Ipsum Generator",
    description: "Generate customizable placeholder text for your designs.",
    icon: FileText,
    category: "generators",
    component: LoremIpsumGenerator,
    url: "/generators/lorem-ipsum-generator",
    pageTitle:
      "Lorem Ipsum Generator: Customizable Placeholder Text | ToolNames",
    metaDescription:
      "Generate Lorem Ipsum placeholder text for your design mockups and layouts. Customize paragraphs, sentences, and word counts. Free and instant.",
  },
  {
    id: "text-case-converter",
    title: "Text Case Converter",
    description: "Convert text to UPPERCASE, lowercase, Title Case, camelCase, etc.",
    icon: Type,
    category: "utilities",
    component: TextCaseConverter,
    url: "/utilities/text-case-converter",
    pageTitle: "Online Text Case Converter: Uppercase, Lowercase, Title Case | ToolNames",
    metaDescription: "Free online tool to convert text between various cases: UPPERCASE, lowercase, Title Case, Sentence case, camelCase, PascalCase, snake_case, and kebab-case.",
  },
  {
    id: "base64-tool",
    title: "Base64 Encoder & Decoder",
    description: "Encode text to Base64 or decode Base64 strings back to text.",
    icon: FileCode,
    category: "utilities",
    component: Base64Tool,
    url: "/utilities/base64-tool",
    pageTitle: "Base64 Encode & Decode Online Tool | ToolNames",
    metaDescription:
      "Easily encode text to Base64 or decode Base64 strings to plain text. Our free online Base64 tool works instantly in your browser for secure, client-side operations.",
  },
  {
    id: "json-formatter",
    title: "JSON Formatter & Validator",
    description: "Format, validate, beautify, and view your JSON data clearly.",
    icon: FileBadge,
    category: "utilities",
    component: JSONFormatter,
    url: "/utilities/json-formatter",
    pageTitle:
      "JSON Formatter & Validator: Beautify & Validate JSON Online | ToolNames",
    metaDescription:
      "Free online JSON Formatter and Validator. Easily beautify, format, minify, and validate your JSON data. Features syntax highlighting and error checking. Client-side processing.",
  },
  {
    id: "json-schema-creator",
    title: "JSON Schema Generator",
    description: "Automatically create JSON Schema from your JSON data.",
    icon: FileSpreadsheet,
    category: "utilities",
    component: JSONSchemaCreator,
    url: "/utilities/json-schema-creator",
    pageTitle: "JSON Schema Generator: Create from JSON Data Online | ToolNames",
    metaDescription:
      "Generate JSON Schema (Draft 7) from your JSON data automatically. Useful for API documentation, data validation, and code generation. Free and client-side.",
  },
  {
    id: "yaml-validator",
    title: "YAML Validator & Converter",
    description: "Validate, format YAML documents, and convert between YAML and JSON.",
    icon: FileCode,
    category: "utilities",
    component: YAMLValidator,
    url: "/utilities/yaml-validator",
    pageTitle: "YAML Validator: Validate & Format YAML Documents | ToolNames",
    metaDescription:
      "Free YAML validator and formatter. Validate YAML syntax, format YAML documents with options, and convert between YAML and JSON. Real-time error detection. Client-side.",
  },
  {
    id: "emoji-smuggler",
    title: "Emoji Smuggler",
    description:
      "Hide secret messages within emojis using invisible characters.",
    icon: MessageSquareMore,
    category: "utilities",
    component: EmojiSmuggler,
    url: "/utilities/emoji-smuggler",
    pageTitle: "Emoji Smuggler: Hide Secret Text in Emojis | ToolNames",
    metaDescription:
      "Encode secret messages within ordinary-looking emojis using zero-width Unicode characters. Our Emoji Smuggler tool provides a fun way for steganographic communication.",
  },
  {
    id: "url-encoder",
    title: "URL Encoder & Decoder",
    description: "Encode or decode URLs and URI components for web safety.",
    icon: Link,
    category: "utilities",
    component: UrlEncoder,
    url: "/utilities/url-encoder",
    pageTitle: "URL Encoder & Decoder: Online URI Component Tool | ToolNames",
    metaDescription:
      "Free online URL Encoder and Decoder. Percent-encode or decode URLs and URI components for safe use in web addresses. Supports UTF-8. Client-side processing.",
  },
  {
    id: "character-counter",
    title: "Character & Word Counter",
    description: "Count characters, words, sentences, paragraphs, and text stats.",
    icon: FileText,
    category: "utilities",
    component: CharacterCounter,
    url: "/utilities/character-counter",
    pageTitle: "Online Character Counter & Word Count Tool | ToolNames",
    metaDescription: "Free online tool to count characters, words, sentences, and paragraphs in your text. Also provides readability scores and keyword density. Ideal for writers and SEO.",
  },
  {
    id: "countdown-timer",
    title: "Countdown Timer",
    description: "Set multiple countdowns with alerts for events or tasks.",
    icon: Clock,
    category: "utilities",
    component: CountdownTimer,
    url: "/utilities/countdown-timer",
    pageTitle: "Online Countdown Timer: Set Multiple Timers with Alerts | ToolNames",
    metaDescription: "Create and manage multiple countdown timers with custom alerts for events, cooking, study sessions, or workouts. Features preset timers and fullscreen mode. Free and easy.",
  },
  {
    id: "schema-visualizer",
    title: "Data Schema Visualizer",
    description:
      "Generate interactive diagrams from JSON, YAML, or DB schemas.",
    icon: ActivitySquare,
    category: "utilities",
    component: SchemaVisualizer,
    url: "/utilities/schema-visualizer",
    pageTitle: "Schema Visualizer: JSON, YAML, Database Diagrams Online | ToolNames",
    metaDescription:
      "Visualize data relationships by generating interactive diagrams from JSON, YAML, or database schemas. Understand complex data structures easily with our free online tool.",
  },
  {
    id: "uuid-generator",
    title: "UUID Generator",
    description: "Generate universally unique identifiers (UUIDs) v1, v3, v4, v5.",
    icon: Fingerprint,
    category: "generators",
    component: UuidGenerator,
    url: "/generators/uuid-generator",
    pageTitle: "Online UUID Generator: Create v1, v3, v4, v5 UUIDs | ToolNames",
    metaDescription:
      "Generate single or multiple universally unique identifiers (UUIDs) in v1, v3, v4, and v5 formats. Free online UUID generator for all your development needs.",
  },
  {
    id: "temperature-converter",
    title: "Temperature Converter",
    description:
      "Convert temperatures between Celsius, Fahrenheit, and Kelvin.",
    icon: Thermometer,
    category: "converters",
    component: TemperatureConverter,
    url: "/converters/temperature-converter",
    pageTitle: "Temperature Converter: Celsius, Fahrenheit, Kelvin Online | ToolNames",
    metaDescription:
      "Free online temperature converter to easily switch between Celsius (°C), Fahrenheit (°F), and Kelvin (K) scales. Instant and accurate temperature conversions.",
  },
  {
    id: "csv-explorer",
    title: "CSV Data Explorer",
    description:
      "Analyze, visualize, filter, and manipulate CSV data interactively.",
    icon: Table,
    category: "file-tools",
    component: CSVExplorer,
    url: "/file-tools/csv-explorer",
    pageTitle: "CSV Explorer: Analyze & Visualize CSV Data Online | ToolNames",
    metaDescription:
      "Upload, explore, and analyze CSV files with our powerful online data tool. Clean data, create charts, filter, sort, and export results. Privacy-focused, client-side processing.",
  },
  {
    id: "chart-builder",
    title: "Online Chart Builder",
    description: "Create custom bar, line, pie, and scatter charts without code.",
    icon: BarChart3,
    category: "utilities",
    component: ChartBuilder,
    url: "/utilities/chart-builder",
    pageTitle:
      "Chart Builder: Create Custom Charts Online (No Coding) | ToolNames",
    metaDescription:
      "Build beautiful, customizable charts (bar, line, pie, scatter, radar) online without coding. Our free chart builder tool uses Chart.js and allows image export.",
  },
  {
    id: "network-latency-simulator",
    title: "Network Latency Simulator",
    description: "Test web app performance under various network conditions.",
    icon: NetworkIcon,
    category: "utilities",
    component: NetworkLatencySimulator,
    url: "/utilities/network-latency-simulator",
    pageTitle:
      "Network Latency & Condition Simulator Online | ToolNames",
    metaDescription:
      "Simulate different network conditions (latency, bandwidth, packet loss) to test your web application's performance. Free online tool for developers and QA engineers.",
  },
  {
    id: "lottery-picker",
    title: "Lottery Number Generator",
    description: "Generate random numbers for Powerball, Mega Millions, and more.",
    icon: Dices,
    category: "lottery",
    component: LotteryPickerGenerator,
    url: "/lottery/lottery-picker",
    pageTitle: "Lottery Number Generator: Powerball, Mega Millions & Custom | ToolNames",
    metaDescription: "Generate random lottery numbers for Powerball, Mega Millions, and custom lottery formats. Free tool with animations, strategies, and tracking features.",
  },
  {
    id: "lottery-odds-calculator",
    title: "Lottery Odds Calculator",
    description: "Calculate your chances of winning various lottery games.",
    icon: BarChart3,
    category: "lottery",
    component: LotteryOddsCalculator,
    url: "/lottery/lottery-odds-calculator",
    pageTitle: "Lottery Odds Calculator: Calculate Your Winning Chances | ToolNames",
    metaDescription: "Calculate your exact odds of winning Powerball, Mega Millions, and other lottery games. Our free lottery probability calculator visualizes chances for all prize tiers.",
  },
  {
    id: "lottery-analyzer",
    title: "Lottery History Analyzer",
    description: "Analyze historical draws for patterns, hot & cold numbers.",
    icon: BarChart3,
    category: "lottery",
    component: LotteryHistoryAnalyzer,
    url: "/lottery/lottery-analyzer",
    pageTitle: "Lottery History Analyzer: Find Patterns & Hot Numbers | ToolNames",
    metaDescription: "Analyze historical lottery draw data to identify patterns, hot numbers, cold numbers, and trends. Inform your number selection strategy with data-driven insights.",
  },
  {
    id: "lottery-wheel",
    title: "Lottery Wheeling System Generator",
    description: "Create wheeling systems to cover more number combinations.",
    icon: FileSpreadsheet,
    category: "lottery",
    component: LotteryWheelGenerator,
    url: "/lottery/lottery-wheel",
    pageTitle: "Lottery Wheeling System Generator: Improve Winning Odds | ToolNames",
    metaDescription: "Generate mathematical lottery wheeling systems (full, abbreviated, key number) to improve your chances of winning by covering more number combinations efficiently.",
  },
  {
    id: "lottery-frequency-visualizer",
    title: "Lottery Frequency Visualizer",
    description: "Visualize lottery number frequency with heatmaps and trends.",
    icon: BarChart3,
    category: "lottery",
    component: FrequencyDistributionVisualizer,
    url: "/lottery/frequency-visualizer",
    pageTitle: "Lottery Number Frequency Visualizer & Analyzer | ToolNames",
    metaDescription: "Analyze and visualize lottery number frequency distributions over time. Identify patterns, seasonal trends, and frequency shifts with interactive heatmaps and charts.",
  },
  {
    id: "tip-calculator",
    title: "Tip & Bill Split Calculator",
    description: "Calculate tip amounts and easily split bills among friends.",
    icon: BarChart3, // Consider a more specific icon if available, or keep if generic finance
    category: "calculators",
    component: TipCalculator,
    url: "/calculators/tip-calculator",
    pageTitle: "Tip Calculator: Calculate & Split Restaurant Bills Easily | ToolNames",
    metaDescription: "Free online tip calculator to quickly determine tip amounts and split bills among multiple people. Perfect for dining out and sharing expenses accurately.",
  },
  {
    id: "number-base-converter",
    title: "Number Base Converter",
    description: "Convert numbers between binary, octal, decimal, hexadecimal.",
    icon: Hash,
    category: "converters",
    component: NumberBaseConverter,
    url: "/converters/number-base-converter",
    pageTitle: "Number Base Converter: Binary, Octal, Decimal, Hex | ToolNames",
    metaDescription: "Convert numbers between different bases: binary (base-2), octal (base-8), decimal (base-10), and hexadecimal (base-16). Free online tool for programmers and students.",
  },
  {
    id: "hash-generator",
    title: "Online Hash Generator",
    description: "Generate MD5, SHA-1, SHA-256, SHA-512 hashes from text.",
    icon: FileSpreadsheet, // Consider Fingerprint or a lock icon
    category: "generators",
    component: HashGenerator,
    url: "/generators/hash-generator",
    pageTitle: "Hash Generator: MD5, SHA-1, SHA-256, SHA-512 Online | ToolNames",
    metaDescription: "Generate secure cryptographic hashes (MD5, SHA-1, SHA-256, SHA-384, SHA-512) from your text input. Free online hash calculator for data integrity and security.",
    baseUrl: "/generators/hash-generator",
  },
  {
    id: "discount-calculator",
    title: "Discount & Sale Price Calculator",
    description: "Calculate final prices after discounts and savings.",
    icon: Percent,
    category: "calculators",
    component: DiscountCalculator,
    url: "/calculators/discount-calculator",
    pageTitle: "Discount Calculator: Calculate Sale Prices & Savings | ToolNames",
    metaDescription: "Easily calculate sale prices, discount amounts, and percentage savings with our free online Discount Calculator. Perfect for shopping and finding the best deals.",
  },
  {
    id: "percentage-calculator",
    title: "Percentage Calculator",
    description: "Solve various percentage problems quickly and easily.",
    icon: Percent,
    category: "calculators",
    component: PercentageCalculator,
    url: "/calculators/percentage-calculator",
    pageTitle: "Online Percentage Calculator: Calculate Percentages Easily | ToolNames",
    metaDescription:
      "Free online percentage calculator to find percentages of numbers, percentage change (increase/decrease), and solve other common percentage problems. Quick and accurate.",
  },
  {
    id: "grade-calculator",
    title: "Grade Calculator",
    description: "Calculate weighted grades, GPA, and final exam requirements",
    icon: GraduationCap,
    category: "calculators",
    component: GradeCalculator,
    url: "/calculators/grade-calculator",
    pageTitle: "Grade Calculator: Calculate Weighted Grades & GPA | ToolNames",
    metaDescription: "Free grade calculator to calculate weighted grades, determine final exam scores needed, and calculate GPA. Perfect for students planning their academic success.",
  },
  {
    id: "fuel-calculator",
    title: "Fuel Efficiency & Cost Calculator",
    description: "Calculate MPG, L/100km, and fuel costs for trips.",
    icon: FileSpreadsheet, // Consider a car or gas pump icon
    category: "calculators",
    component: FuelCalculator,
    url: "/calculators/fuel-calculator",
    pageTitle: "Fuel Efficiency & Trip Cost Calculator (MPG, L/100km) | ToolNames",
    metaDescription:
      "Calculate your vehicle's fuel efficiency (MPG, L/100km) and estimate fuel costs for trips. Analyze fuel consumption with our user-friendly online calculator.",
  },
  {
    id: "time-calculator",
    title: "Time Duration Calculator",
    description: "Add, subtract, and calculate duration between time intervals.",
    icon: Clock,
    category: "calculators",
    component: TimeCalculator,
    url: "/calculators/time-calculator",
    pageTitle: "Time Calculator: Add, Subtract & Calculate Duration Online | ToolNames",
    metaDescription:
      "Free online time calculator to add or subtract time intervals, calculate duration between two times, and convert time units. Easy to use for hours, minutes, and seconds.",
  },
  {
    id: "pomodoro-timer",
    title: "Pomodoro Timer Online",
    description: "Boost focus with timed work & break sessions (Pomodoro Technique).",
    icon: Clock,
    category: "productivity",
    component: PomodoroTimer,
    url: "/productivity/pomodoro-timer",
    pageTitle: "Pomodoro Timer: Boost Focus & Productivity Online | ToolNames",
    metaDescription:
      "Improve your productivity with the Pomodoro Technique using our free online timer. Customizable work and break intervals, notifications, and visual progress tracking.",
  },
  {
    id: "age-calculator",
    title: "Age Calculator",
    description: "Calculate your exact age in years, months, days, and more.",
    icon: Clock, // Consider CalendarDays
    category: "calculators",
    component: AgeCalculator,
    url: "/calculators/age-calculator",
    pageTitle: "Online Age Calculator: Calculate Your Exact Age | ToolNames",
    metaDescription:
      "Calculate your exact age in years, months, and days from your birth date. See how many days you've lived and your next birthday with our precise online age calculator.",
  },
  {
    id: "date-calculator",
    title: "Date Calculator",
    description: "Calculate days between dates or add/subtract from a date.",
    icon: CalendarDays,
    category: "calculators",
    component: DateCalculator,
    url: "/calculators/date-calculator",
    pageTitle: "Date Calculator: Days Between Dates & Date Manipulation | ToolNames",
    metaDescription:
      "Free online date calculator to find the number of days between two dates, or add/subtract days, weeks, months, or years from a specific date. Easy and accurate.",
  },
  {
    id: "health-calculator",
    title: "Health Metrics Calculator",
    description: "Calculate BMI, BMR, TDEE, and ideal body weight.",
    icon: FileSpreadsheet, // Consider an icon related to health/heart
    category: "calculators",
    component: HealthCalculator,
    url: "/calculators/health-calculator",
    pageTitle: "Health Metrics Calculator: BMI, BMR, TDEE, Ideal Weight | ToolNames",
    metaDescription:
      "Comprehensive online health calculator for BMI, BMR (Basal Metabolic Rate), TDEE (Total Daily Energy Expenditure), and ideal body weight. Get key insights into your health.",
  },
  {
    id: "pregnancy-due-date-calculator",
    title: "Pregnancy Due Date Calculator",
    description: "Estimate due date, track pregnancy week, and milestones.",
    icon: Heart,
    category: "calculators",
    component: PregnancyDueDateCalculator,
    url: "/calculators/pregnancy-due-date-calculator",
    pageTitle:
      "Pregnancy Due Date Calculator: Calculate Due Date & Track Progress | ToolNames",
    metaDescription:
      "Free pregnancy due date calculator to estimate your due date, track pregnancy progress by week, and view important milestones.",
  },
  {
    id: "calorie-calculator",
    title: "Calorie Calculator (TDEE)",
    description: "Estimate daily calorie needs and macronutrient ratios.",
    icon: FileSpreadsheet, // Consider an apple or fitness icon
    category: "calculators",
    component: CalorieCalculator,
    url: "/calculators/calorie-calculator",
    pageTitle: "Daily Calorie Calculator: TDEE & Macronutrients Online | ToolNames",
    metaDescription:
      "Calculate your daily calorie needs (TDEE) based on your body metrics, activity level, and goals. Get personalized macronutrient recommendations. Free and online.",
  },
  {
    id: "investment-calculator",
    title: "Investment Returns Calculator",
    description: "Project potential returns on investments with various parameters.",
    icon: FileSpreadsheet, // Consider TrendingUp
    category: "calculators",
    component: InvestmentCalculator,
    url: "/calculators/investment-calculator",
    pageTitle: "Investment Returns Calculator: Project Growth & Future Value | ToolNames",
    metaDescription: "Calculate potential returns and future value of your investments. Customize initial investment, contributions, interest rate, and duration. Free online tool.",
  },
  {
    id: "retirement-calculator",
    title: "Retirement Calculator",
    description: "Plan your retirement savings and withdrawal strategy.",
    icon: PiggyBank,
    category: "calculators",
    component: RetirementCalculator,
    url: "/calculators/retirement-calculator",
    pageTitle: "Retirement Calculator: Plan Your Retirement Savings | ToolNames",
    metaDescription: "Calculate retirement savings needs, withdrawal strategies, and compare scenarios. Free online retirement planning calculator with 4% rule and more.",
  },
  {
    id: "electricity-calculator",
    title: "Electricity Cost Calculator",
    description: "Estimate electricity costs for appliances and devices.",
    icon: FileSpreadsheet, // Consider a lightbulb or power icon
    category: "calculators",
    component: ElectricityCalculator,
    url: "/calculators/electricity-calculator",
    pageTitle: "Electricity Cost Calculator: Appliance Energy Usage & Bill | ToolNames",
    metaDescription: "Calculate electricity costs for household appliances and devices based on wattage, usage time, and electricity rate. Identify energy savings and reduce your bills.",
  },
  {
    id: "keyword-density-analyzer",
    title: "Keyword Density Analyzer",
    description: "Analyze keyword frequency and distribution for SEO content.",
    icon: Search,
    category: "seo",
    component: KeywordDensityAnalyzer,
    url: "/seo/keyword-density-analyzer",
    pageTitle: "Keyword Density Analyzer: SEO Content Optimization Tool | ToolNames",
    metaDescription: "Free online Keyword Density Analyzer to check the frequency and distribution of keywords in your text or webpage. Optimize content for SEO and avoid keyword stuffing.",
  },
  {
    id: "meta-tag-analyzer",
    title: "Meta Tag Analyzer & Generator",
    description: "Analyze existing meta tags or generate new ones for SEO.",
    icon: FileCode,
    category: "seo",
    component: MetaTagAnalyzer,
    url: "/seo/meta-tag-analyzer",
    pageTitle: "Meta Tag Analyzer & Generator: Optimize for SEO & Social | ToolNames",
    metaDescription: "Analyze your website's meta tags (title, description, Open Graph, Twitter Cards) or generate optimized ones. Free tool to improve SEO and social media sharing.",
  },
  {
    id: "heading-structure-visualizer",
    title: "HTML Heading Structure Visualizer",
    description: "Visualize H1-H6 heading tag hierarchy for SEO & accessibility.",
    icon: FileSpreadsheet, // Consider an outline or structure icon
    category: "seo",
    component: HeadingStructureVisualizer,
    url: "/seo/heading-structure-visualizer",
    pageTitle: "Heading Structure Visualizer: Analyze HTML Headings (H1-H6) | ToolNames",
    metaDescription: "Visualize your webpage's HTML heading structure (H1-H6) to ensure proper semantic organization for SEO and accessibility. Identify issues and improve hierarchy.",
  },
  {
    id: "internal-link-mapper",
    title: "Internal Link Analyzer",
    description: "Analyze internal linking structure and identify opportunities.",
    icon: FileSpreadsheet, // Consider NetworkIcon
    category: "seo",
    component: InternalLinkMapper,
    url: "/seo/internal-link-mapper",
    pageTitle: "Internal Link Analyzer: Visualize & Optimize Site Structure | ToolNames",
    metaDescription: "Analyze your website's internal linking structure to identify orphaned content, link equity distribution, and optimization opportunities. Free online SEO tool.",
  },
  {
    id: "alt-text-analyzer",
    title: "Image Alt Text Analyzer",
    description: "Check and improve image alt text for SEO & accessibility.",
    icon: FileSpreadsheet, // Consider ImageIcon with a checkmark
    category: "seo",
    component: AltTextAnalyzer,
    url: "/seo/alt-text-analyzer",
    pageTitle: "Image Alt Text Analyzer: SEO & Accessibility Checker | ToolNames",
    metaDescription: "Analyze image alt text on your webpage to ensure it's descriptive and optimized for SEO and accessibility. Free tool to identify missing or poor alt attributes.",
  },
  {
    id: "salary-calculator",
    title: "Salary Calculator",
    description: "Convert salary between hourly, daily, weekly, and annual equivalents. Estimate take-home pay after federal taxes and deductions.",
    icon: DollarSign,
    category: "calculators",
    component: SalaryCalculator,
    url: "/calculators/salary-calculator",
    pageTitle: "Salary Calculator: Paycheck & Tax Estimator | ToolNames",
    metaDescription: "Convert your salary between hourly, annual, monthly formats and calculate take-home pay after federal & state taxes.",
  },
  {
    id: "financial-goal-calculator",
    title: "Financial Goal Planner",
    description: "Calculate savings needed to reach your financial targets.",
    icon: DollarSign,
    category: "calculators",
    component: FinancialGoalCalculator,
    url: "/calculators/financial-goal-calculator",
    pageTitle: "Financial Goal Calculator: Plan Your Savings & Investments | ToolNames",
    metaDescription: "Plan and calculate the savings or investments needed to reach your financial goals (e.g., retirement, down payment). Free online financial planning tool.",
  },
  {
    id: "inflation-calculator",
    title: "Inflation Calculator",
    description: "See how inflation impacts purchasing power over time.",
    icon: TrendingUp,
    category: "calculators",
    component: InflationCalculator,
    url: "/calculators/inflation-calculator",
    pageTitle: "Inflation Calculator: Calculate Purchasing Power Over Time | ToolNames",
    metaDescription: "Calculate the impact of inflation on money and purchasing power over different periods. See how the value of currency changes with our free online inflation calculator.",
  },
  {
    id: "loan-payoff-calculator",
    title: "Debt Payoff Calculator & Planner",
    description: "Strategize loan payoffs and plan your debt-free journey.",
    icon: DollarSign,
    category: "calculators",
    component: LoanPayoffCalculator,
    url: "/calculators/loan-payoff-calculator",
    pageTitle: "Loan & Debt Payoff Calculator: Plan to Become Debt-Free | ToolNames",
    metaDescription: "Compare debt payoff strategies (e.g., snowball, avalanche) and create a personalized payment plan to become debt-free faster. Free online calculator.",
  },
  {
    id: "markdown-editor",
    title: "Online Markdown Editor",
    description: "Write and preview Markdown with real-time rendering & HTML export.",
    icon: FileSpreadsheet, // Consider an edit icon
    category: "utilities",
    component: MarkdownEditor,
    url: "/utilities/markdown-editor",
    pageTitle: "Markdown Editor Online: Real-time Preview & HTML Export | ToolNames",
    metaDescription: "Free online Markdown editor with live preview. Write, edit, and format text using Markdown syntax, then export to HTML or copy Markdown. Simple and efficient.",
  },
  {
    id: "regex-tester",
    title: "RegEx Tester & Debugger",
    description: "Build, test, and debug regular expressions with live highlighting.",
    icon: FileSpreadsheet, // Consider a code or search icon
    category: "utilities",
    component: RegExTester,
    url: "/utilities/regex-tester",
    pageTitle: "Online RegEx Tester & Debugger: JavaScript Regex Tool | ToolNames",
    metaDescription: "Build, test, and debug regular expressions (JavaScript compatible) online. Features real-time highlighting, match explanations, and a common patterns library.",
  },
  {
    id: "color-palette-generator",
    title: "Color Palette Generator",
    description: "Create custom color palettes and export for web projects.",
    icon: Palette,
    category: "generators",
    component: ColorPaletteGenerator,
    url: "/generators/color-palette-generator",
    pageTitle: "Color Palette Generator: Create & Export Custom Palettes | ToolNames",
    metaDescription: "Generate beautiful color palettes for your web and design projects. Create harmonious schemes, explore variations, and export to CSS, SCSS, or Tailwind config.",
  },
  {
    id: "color-palette-explorer",
    title: "Color Palette Explorer",
    description:
      "Discover harmonious color palettes with accessibility checks.",
    icon: Palette,
    category: "design",
    component: ColorPaletteExplorer,
    url: "/design/color-palette-explorer",
    pageTitle: "Color Palette Explorer: Create Harmonious & Accessible Palettes | ToolNames",
    metaDescription:
      "Generate beautiful, accessible color palettes based on color theory. Preview combinations, check WCAG contrast ratios, and export in various formats. Free online tool.",
  },
  {
    id: "kanban-board",
    title: "Online Kanban Board",
    description:
      "Organize tasks with a drag-and-drop To Do, In Progress, Done board.",
    icon: FileSpreadsheet, // Consider LayoutGrid or a task list icon
    category: "productivity",
    component: KanbanBoard,
    url: "/productivity/kanban-board",
    pageTitle: "Kanban Board Online: Visual Task Management & Workflow | ToolNames",
    metaDescription:
      "Free online Kanban board to visualize your workflow and manage tasks. Drag-and-drop cards between customizable columns (e.g., To Do, In Progress, Done). Client-side storage.",
  },
  {
    id: "markdown-notes",
    title: "Markdown Notes App",
    description:
      "Create, organize, and manage notes with Markdown formatting.",
    icon: FileSpreadsheet, // Consider an edit/document icon
    category: "productivity",
    component: NoteTaking,
    url: "/productivity/markdown-notes",
    pageTitle: "Markdown Notes App: Private Online Note Taking | ToolNames",
    metaDescription:
      "Simple and private online Markdown notes app. Create, organize, and manage your notes with Markdown formatting. All data stored locally in your browser.",
  },
  {
    id: "css-pattern-generator",
    title: "CSS Background Pattern Generator",
    description: "Create custom CSS background patterns with live preview.",
    icon: FileSpreadsheet, // Consider Shapes or Palette
    category: "design",
    component: PatternGenerator,
    url: "/design/css-pattern-generator",
    pageTitle: "CSS Pattern Generator: Create Custom Background Patterns | ToolNames",
    metaDescription: "Generate seamless CSS background patterns (stripes, dots, grids, geometric) with our free online tool. Live preview and code export for your web projects.",
  },
  {
    id: "time-zone-converter",
    title: "Time Zone Converter",
    description: "Convert times between global time zones with a visual map.",
    icon: Clock,
    category: "converters",
    component: TimeZoneConverter,
    url: "/converters/time-zone-converter",
    pageTitle: "Time Zone Converter: Global Time Conversion Online | ToolNames",
    metaDescription: "Easily convert times between multiple time zones worldwide. Free online tool with an interactive map for quick and accurate global time conversions."
  },
  {
    id: "habit-tracker",
    title: "Online Habit Tracker",
    description: "Track daily habits, build streaks, and view progress statistics.",
    icon: FileSpreadsheet, // Consider a checkmark or calendar icon
    category: "productivity",
    component: HabitTracker,
    url: "/productivity/habit-tracker",
    pageTitle: "Habit Tracker: Build Habits & Track Progress Online | ToolNames",
    metaDescription: "Free online habit tracker to monitor your daily habits, build positive streaks, and visualize your progress with statistics. Achieve your goals one day at a time.",
  },
  {
    id: "time-blocking-calendar",
    title: "Time Blocking Calendar",
    description: "Visually plan your day with an interactive time blocking schedule.",
    icon: CalendarDays,
    category: "productivity",
    component: TimeBlockingCalendar,
    url: "/productivity/time-blocking-calendar",
    pageTitle: "Time Blocking Calendar: Visual Daily & Weekly Planner | ToolNames",
    metaDescription: "Plan your day effectively with our interactive time blocking calendar. Drag-and-drop tasks, track energy levels, and boost productivity. Free online scheduling tool.",
  },
  {
    id: "text-formatter",
    title: "Text Formatter & Cleaner",
    description: "Clean, format, and organize text with various utility options.",
    icon: FileSpreadsheet, // Consider a magic wand or clean icon
    category: "utilities",
    component: TextFormatter,
    url: "/utilities/text-formatter",
    pageTitle: "Online Text Formatter & Cleaner: Format & Organize Text | ToolNames",
    metaDescription: "Free online tool to format, clean, and organize your text. Options include removing extra spaces, trimming lines, sorting, case conversion, and more text utilities.",
  },
  {
    id: "diff-checker",
    title: "Text Diff Checker Online",
    description: "Compare two texts and highlight the differences between them.",
    icon: FileSpreadsheet, // Consider an icon showing two documents compared
    category: "utilities",
    component: DiffChecker,
    url: "/utilities/diff-checker",
    pageTitle: "Diff Checker: Compare Text & Find Differences Online | ToolNames",
    metaDescription: "Free online text comparison tool (Diff Checker) to find and highlight the differences between two text files or snippets. Supports character, word, and line-level diffs.",
  },
  {
    id: "file-converter",
    title: "Online File Converter",
    description: "Convert between CSV, JSON, XML, YAML, and Excel files.",
    icon: FileSpreadsheet, // Consider an icon showing file transformation
    category: "file-tools",
    component: FileConverter,
    url: "/file-tools/file-converter",
    pageTitle: "File Converter: CSV, JSON, XML, YAML, Excel Online | ToolNames",
    metaDescription:
      "Free online file converter to switch between common data formats: CSV, JSON, XML, YAML, and Excel (XLSX). Client-side processing for maximum privacy and speed.",
  },
  {
    id: "flexbox-generator",
    title: "CSS Flexbox Generator",
    description: "Visually build flexbox layouts and generate CSS/Tailwind code.",
    icon: LayoutGrid,
    category: "design",
    component: FlexboxGenerator,
    url: "/design/flexbox-generator",
    pageTitle: "CSS Flexbox Layout Generator: Visual Builder & Code | ToolNames",
    metaDescription: "Create CSS Flexbox layouts visually with our interactive online generator. Adjust properties, see live previews, and export to CSS, SCSS, or Tailwind CSS classes.",
  },
  {
    id: "css-grid-generator",
    title: "CSS Grid Layout Generator",
    description: "Visually design CSS grid layouts with drag-and-drop interface.",
    icon: LayoutGrid,
    category: "design",
    component: CSSGridGenerator,
    url: "/design/css-grid-generator",
    pageTitle: "CSS Grid Layout Generator: Visual Design Tool Online | ToolNames",
    metaDescription: "Create complex CSS grid layouts visually with our online generator. Features drag-and-drop area creation, responsive settings, and code export (CSS, SCSS, Tailwind).",
  },
  {
    id: "responsive-container-builder",
    title: "Responsive Container Builder",
    description: "Create fluid/fixed-width CSS container styles with preview.",
    icon: Layout,
    category: "design",
    component: ResponsiveContainerBuilder,
    url: "/design/responsive-container-builder",
    pageTitle: "Responsive CSS Container Builder Online | ToolNames",
    metaDescription: "Visually create and customize responsive container classes for your website. Set breakpoints, max-widths, and padding. Export to CSS, SCSS, or Tailwind.",
  },
  {
    id: "margin-padding-visualizer",
    title: "CSS Box Model Visualizer",
    description: "Interactively edit margins/paddings and generate spacing utilities.",
    icon: Ruler,
    category: "design",
    component: MarginPaddingVisualizer,
    url: "/design/margin-padding-visualizer",
    pageTitle: "CSS Margin & Padding Visualizer: Box Model Editor | ToolNames",
    metaDescription: "Visualize and edit CSS box model spacing (margin & padding) with our interactive online tool. Generate consistent spacing systems and export utility classes.",
  },
  {
    id: "tailwind-component-maker",
    title: "Tailwind CSS Component Builder",
    description: "Visually create and customize Tailwind CSS components, export code.",
    icon: Palette,
    category: "design",
    component: TailwindComponentMaker,
    url: "/design/tailwind-component-maker",
    pageTitle: "Tailwind CSS Component Builder: Visual Editor & Code | ToolNames",
    metaDescription: "Create and customize UI components with Tailwind CSS using our visual editor. Build cards, buttons, forms, and more. Download as React, Vue, or HTML code.",
  },
  {
    id: "personal-data-dashboard",
    title: "Personal Data Analytics Dashboard",
    description: "Import, visualize, and analyze your personal data with AI-powered insights",
    icon: BarChart3,
    category: "productivity",
    component: PersonalDataDashboard,
    url: "/productivity/personal-data-dashboard",
    pageTitle: "Personal Data Analytics Dashboard: Visualize & Analyze Data | ToolNames",
    metaDescription: "Upload and analyze your personal data with interactive charts, AI insights, and comprehensive dashboards. Privacy-focused analytics tool running entirely in your browser.",
  },
  {
    id: "roi-calculator",
    title: "ROI Calculator",
    description: "Calculate return on investment and compare investment scenarios with cash flows, detailed analytics, and growth visualizations.",
    icon: TrendingUp,
    category: "calculators",
    component: ROICalculator,
    url: "/calculators/roi-calculator",
    pageTitle: "ROI Calculator: Calculate Return on Investment | ToolNames",
    metaDescription: "Free ROI calculator to calculate return on investment percentage, annualized returns, and compare investment scenarios.",
  },
  {
    id: "audio-format-converter",
    title: "Audio Format Converter",
    description: "Convert audio files between different formats like WAV. Purely client-side for privacy.",
    icon: Music,
    category: "converters",
    component: AudioFormatConverter,
    url: "/converters/audio-format-converter",
    pageTitle: "Audio Format Converter: Convert MP3, WAV, OGG | ToolNames",
    metaDescription: "Free online audio converter. Convert audio files securely in your browser without uploading.",
  },
  {
    id: "css-gradient-generator",
    title: "CSS Gradient Generator",
    description: "Visually build linear, radial, and conic CSS gradients with live preview and code export.",
    icon: Palette,
    category: "design",
    component: CSSGradientGenerator,
    url: "/design/css-gradient-generator",
    pageTitle: "CSS Gradient Generator: Create Beautiful Gradients Online | ToolNames",
    metaDescription: "Create stunning linear, radial, and conic CSS gradients with our free visual generator. Adjust colors, direction, and positions, then copy the CSS code instantly.",
  },
  {
    id: "canvas-drawing",
    title: "Canvas Drawing Tool",
    description:
      "Full-featured drawing canvas with shapes, freehand, text, layers, undo/redo, and export to PNG/SVG.",
    icon: PenTool,
    category: "design",
    component: lazy(() =>
      import("@/components/tools/design/CanvasDrawing").then((m) => ({ default: m.CanvasDrawing }))
    ),
    url: "/design/canvas-drawing",
    pageTitle: "Canvas Drawing Tool: Free Online Whiteboard & Sketching App | ToolNames",
    metaDescription:
      "Free online canvas drawing tool. Draw freehand, add shapes, text, and images. Supports layers, undo/redo, zoom/pan, and export to PNG, JPG, or SVG. 100% client-side.",
  },
  {
    id: "cron-expression-builder",
    title: "Cron Expression Builder",
    description: "Build, validate, and visualize cron job schedules with next run time previews.",
    icon: Timer,
    category: "utilities",
    component: CronExpressionBuilder,
    url: "/utilities/cron-expression-builder",
    pageTitle: "Cron Expression Builder: Create & Validate Cron Schedules | ToolNames",
    metaDescription: "Build and validate cron expressions visually. See human-readable descriptions, preview the next 5 run times, and access common schedule presets. Free online cron tool.",
  },
  {
    id: "json-to-typescript",
    title: "JSON to TypeScript Converter",
    description: "Automatically generate TypeScript interfaces or type aliases from any JSON data.",
    icon: Binary,
    category: "utilities",
    component: JsonToTypeScript,
    url: "/utilities/json-to-typescript",
    pageTitle: "JSON to TypeScript Converter: Generate Interfaces Online | ToolNames",
    metaDescription: "Convert JSON data to TypeScript interfaces or type aliases instantly. Supports nested objects, arrays, and optional properties. Free online TypeScript code generator.",
  },
  {
    id: "morse-code-translator",
    title: "Morse Code Translator",
    description: "Encode text to Morse code or decode Morse code back to text, with audio playback.",
    icon: TextCursorInput,
    category: "converters",
    component: MorseCodeTranslator,
    url: "/converters/morse-code-translator",
    pageTitle: "Morse Code Translator: Encode & Decode Online | ToolNames",
    metaDescription: "Translate text to Morse code or decode Morse code back to text. Features audio playback at adjustable speeds and a full character reference chart. Free online tool.",
  },
  {
    id: "word-frequency-analyzer",
    title: "Word Frequency Analyzer",
    description: "Count word frequencies in text with bar charts, readability stats, and CSV export.",
    icon: BarChart3,
    category: "utilities",
    component: WordFrequencyAnalyzer,
    url: "/utilities/word-frequency-analyzer",
    pageTitle: "Word Frequency Analyzer: Text Statistics & Word Count | ToolNames",
    metaDescription: "Analyze word frequency and distribution in any text. Features frequency charts, stop word filtering, and CSV export. Great for content analysis and SEO research.",
  },
  {
    id: "sql-formatter",
    title: "SQL Formatter & Beautifier",
    description: "Format, beautify, and syntax-highlight SQL queries for better readability.",
    icon: Database,
    category: "utilities",
    component: SqlFormatter,
    url: "/utilities/sql-formatter",
    pageTitle: "SQL Formatter & Beautifier: Format SQL Queries Online | ToolNames",
    metaDescription: "Format, beautify, and syntax-highlight SQL queries online. Supports keyword casing, indentation, and minification. Free client-side SQL formatter for developers.",
  },
  {
    id: "aspect-ratio-calculator",
    title: "Aspect Ratio Calculator",
    description: "Calculate, scale, and convert image or video dimensions while maintaining aspect ratios.",
    icon: Ratio,
    category: "calculators",
    component: AspectRatioCalculator,
    url: "/calculators/aspect-ratio-calculator",
    pageTitle: "Aspect Ratio Calculator: Scale Image & Video Dimensions | ToolNames",
    metaDescription: "Calculate aspect ratios, scale dimensions proportionally, and find the right size for any screen or format. Includes presets for 16:9, 4:3, 1:1, and more.",
  },
  {
    id: "css-animation-generator",
    title: "CSS Animation Generator",
    description: "Create and preview CSS keyframe animations with a visual editor and code export.",
    icon: Clapperboard,
    category: "design",
    component: CSSAnimationGenerator,
    url: "/design/css-animation-generator",
    pageTitle: "CSS Animation Generator: Build Keyframe Animations Online | ToolNames",
    metaDescription: "Build CSS keyframe animations visually with live preview. Choose from presets like fade, bounce, spin, and shake. Export ready-to-use CSS animation code.",
  },
  {
    id: "reading-time-estimator",
    title: "Reading Time Estimator",
    description: "Estimate reading time and analyze text readability with Flesch-Kincaid scores.",
    icon: BookOpenCheck,
    category: "utilities",
    component: ReadingTimeEstimator,
    url: "/utilities/reading-time-estimator",
    pageTitle: "Reading Time Estimator: Calculate Text Reading Time & Readability | ToolNames",
    metaDescription: "Estimate how long it takes to read any text based on your reading speed. Includes Flesch-Kincaid readability scores, word count, sentence stats, and grade level.",
  },
  {
    id: "stopwatch-timer",
    title: "Stopwatch & Lap Timer",
    description: "Precision stopwatch with multi-lap tracking, best/worst lap stats, and CSV export.",
    icon: Timer,
    category: "productivity",
    component: StopwatchTimer,
    url: "/productivity/stopwatch-timer",
    pageTitle: "Online Stopwatch & Lap Timer: Precision Timing Tool | ToolNames",
    metaDescription: "Free online stopwatch with lap timer. Track multiple laps, view best and worst times, calculate averages, and export lap data as CSV. Works entirely in your browser.",
  },
  {
    id: "color-blindness-simulator",
    title: "Color Blindness Simulator",
    description: "Simulate how colors appear to people with different types of color vision deficiencies.",
    icon: Accessibility,
    category: "design",
    component: ColorBlindnessSimulator,
    url: "/design/color-blindness-simulator",
    pageTitle: "Color Blindness Simulator: Test Accessibility Online | ToolNames",
    metaDescription: "Simulate 7 types of color vision deficiency including protanopia, deuteranopia, and tritanopia. Test your designs and images for color accessibility. Free online tool.",
  },
  {
    id: "ascii-art-generator",
    title: "ASCII Art Generator",
    description: "Convert text into ASCII art with multiple fonts, styles, and character sets.",
    icon: AlignLeft,
    category: "generators",
    component: AsciiArtGenerator,
    url: "/generators/ascii-art-generator",
    pageTitle: "ASCII Art Generator: Convert Text to ASCII Art Online | ToolNames",
    metaDescription: "Convert text into ASCII art with big text, banner, and box styles. Choose from multiple character sets and download your creation. Free online ASCII art maker.",
  },
  {
    id: "number-to-words",
    title: "Number to Words Converter",
    description: "Convert numbers to English words, ordinals, Roman numerals, and currency text.",
    icon: Type,
    category: "converters",
    component: NumberToWords,
    url: "/converters/number-to-words",
    pageTitle: "Number to Words Converter: Write Numbers in English | ToolNames",
    metaDescription: "Convert any number to English words, ordinals, Roman numerals, and check-writing currency format. Supports numbers up to quadrillions. Free online converter.",
  },
  {
    id: "typography-scale-generator",
    title: "Typography Scale Generator",
    description: "Generate harmonious typographic scales using musical ratios for design systems.",
    icon: Wand2,
    category: "design",
    component: TypographyScaleGenerator,
    url: "/design/typography-scale-generator",
    pageTitle: "Typography Scale Generator: Create Type Systems Online | ToolNames",
    metaDescription: "Generate harmonious typographic scales using musical ratios (Minor Third, Perfect Fourth, Golden Ratio, etc.). Export to CSS variables, SCSS, Tailwind, or JSON.",
  },
  {
    id: "image-metadata-viewer",
    title: "Image Metadata & EXIF Viewer",
    description: "View image dimensions, file info, and EXIF metadata directly in your browser.",
    icon: ScanLine,
    category: "file-tools",
    component: ImageMetadataViewer,
    url: "/file-tools/image-metadata-viewer",
    pageTitle: "Image Metadata & EXIF Viewer: View Photo Information | ToolNames",
    metaDescription: "View image metadata including dimensions, file size, EXIF camera data (make, model, exposure settings). All processing is local — no uploads needed.",
  },
  // ── HTML5 API Tools ──────────────────────────────────────────────────────────
  {
    id: "audio-waveform-analyzer",
    title: "Audio Waveform Analyzer",
    description: "Visualize audio waveforms and frequency spectrum in real time. Upload files or use your microphone.",
    icon: Music,
    category: "html5-apis",
    component: AudioWaveformAnalyzer,
    url: "/html5-apis/audio-waveform-analyzer",
    pageTitle: "Audio Waveform Analyzer: Visualize Sound with Web Audio API | ToolNames",
    metaDescription: "Analyze and visualize audio waveforms and frequency spectra using the Web Audio API. Upload audio files or use your microphone. 100% client-side.",
  },
  {
    id: "voice-to-text",
    title: "Voice to Text Transcription",
    description: "Real-time speech recognition in 12+ languages using the Web Speech API.",
    icon: Mic,
    category: "html5-apis",
    component: VoiceToText,
    url: "/html5-apis/voice-to-text",
    pageTitle: "Voice to Text Transcription: Real-Time Speech Recognition | ToolNames",
    metaDescription: "Transcribe speech to text in real time using the Web Speech API. Supports 12+ languages. Download or copy your transcript. No server uploads.",
  },
  {
    id: "geolocation-tool",
    title: "Geolocation & Distance Calculator",
    description: "Capture GPS coordinates and calculate distances between multiple points.",
    icon: MapPin,
    category: "html5-apis",
    component: GeolocationTool,
    url: "/html5-apis/geolocation-tool",
    pageTitle: "Geolocation & Distance Calculator: GPS Coordinates Tool | ToolNames",
    metaDescription: "Get your GPS coordinates and calculate distances between multiple locations using the browser Geolocation API. Haversine formula. No server required.",
  },
  {
    id: "device-orientation-visualizer",
    title: "Device Orientation Visualizer",
    description: "Visualize device tilt, rotation, and acceleration in real time with a 3D cube.",
    icon: Smartphone,
    category: "html5-apis",
    component: DeviceOrientationVisualizer,
    url: "/html5-apis/device-orientation-visualizer",
    pageTitle: "Device Orientation & Motion Visualizer: Gyroscope & Accelerometer | ToolNames",
    metaDescription: "Visualize device orientation (alpha, beta, gamma) and linear acceleration using the Device Orientation API. Interactive 3D cube. Best on mobile.",
  },
  {
    id: "browser-storage-inspector",
    title: "Browser Storage Inspector",
    description: "View, edit, and manage localStorage & sessionStorage without DevTools.",
    icon: Database,
    category: "html5-apis",
    component: BrowserStorageInspector,
    url: "/html5-apis/browser-storage-inspector",
    pageTitle: "Browser Storage Inspector: View & Edit localStorage | ToolNames",
    metaDescription: "Inspect, add, edit, and delete localStorage and sessionStorage entries directly in your browser. Export as JSON. Developer debugging tool.",
  },
  {
    id: "screen-wake-lock",
    title: "Screen Wake Lock & Battery Monitor",
    description: "Prevent your screen from sleeping and monitor battery status in real time.",
    icon: Sun,
    category: "html5-apis",
    component: ScreenWakeLock,
    url: "/html5-apis/screen-wake-lock",
    pageTitle: "Screen Wake Lock & Battery Monitor: Keep Screen On | ToolNames",
    metaDescription: "Keep your screen awake using the Screen Wake Lock API. Monitor battery level, charging status, and estimated time using the Battery Status API.",
  },
  {
    id: "clipboard-inspector",
    title: "Clipboard Inspector",
    description: "Read, inspect, analyze, and write clipboard data with type detection.",
    icon: Clipboard,
    category: "html5-apis",
    component: ClipboardInspector,
    url: "/html5-apis/clipboard-inspector",
    pageTitle: "Clipboard Inspector: Read & Analyze Clipboard Data | ToolNames",
    metaDescription: "Inspect clipboard contents, detect data types (JSON, HTML, URL, UUID), view history, and write text to clipboard. Uses the Clipboard API.",
  },
  {
    id: "media-recorder",
    title: "Media Recorder",
    description: "Record audio, video from your webcam, or capture your screen with one click.",
    icon: Clapperboard,
    category: "html5-apis",
    component: MediaRecorderTool,
    url: "/html5-apis/media-recorder",
    pageTitle: "Media Recorder: Record Audio, Video & Screen | ToolNames",
    metaDescription: "Record audio, webcam video, or your entire screen using the MediaRecorder API and Screen Capture API. Download recordings locally. No server uploads.",
  },
  {
    id: "performance-monitor",
    title: "Performance Monitor",
    description: "Analyze page load timing, resource waterfall, FPS counter, and JS memory usage.",
    icon: Activity,
    category: "html5-apis",
    component: PerformanceMonitor,
    url: "/html5-apis/performance-monitor",
    pageTitle: "Browser Performance Monitor: FPS, Timing & Memory | ToolNames",
    metaDescription: "Monitor browser performance metrics: navigation timing, resource waterfall, real-time FPS counter, and JavaScript heap memory. Uses the Performance API.",
  },
  {
    id: "web-notifications-builder",
    title: "Web Notifications Builder",
    description: "Build, preview, and schedule native browser notifications with full control.",
    icon: Bell,
    category: "html5-apis",
    component: WebNotificationsBuilder,
    url: "/html5-apis/web-notifications-builder",
    pageTitle: "Web Notifications Builder: Test Browser Notifications | ToolNames",
    metaDescription: "Create and test native browser notifications using the Notifications API. Schedule delayed notifications, set silent/persistent options, and preview your notification.",
  },
  {
    id: "canvas-drawing-tool",
    title: "Canvas Drawing Tool",
    description: "Draw and sketch with pen, shapes, fill, and text. Export as PNG using Canvas API.",
    icon: Paintbrush,
    category: "html5-apis",
    component: CanvasDrawingTool,
    url: "/html5-apis/canvas-drawing-tool",
    pageTitle: "Canvas Drawing Tool: Online Sketch & Export PNG | ToolNames",
    metaDescription: "Draw freehand or use shapes, fill, and text tools on an HTML5 Canvas. Supports undo, opacity, brush size. Export your drawing as a PNG image.",
  },
  {
    id: "vibration-tester",
    title: "Vibration Pattern Tester",
    description: "Design and test vibration patterns using the Vibration API on mobile devices.",
    icon: Smartphone,
    category: "html5-apis",
    component: VibrationTester,
    url: "/html5-apis/vibration-tester",
    pageTitle: "Vibration Pattern Tester: Test & Design Haptic Patterns | ToolNames",
    metaDescription: "Design custom vibration patterns and test them on your device using the Vibration API. Visual timeline editor, presets, and raw pattern input.",
  },
  {
    id: "web-share-tool",
    title: "Web Share Tool",
    description: "Share content via native OS share sheet or generate platform-specific links.",
    icon: Share2,
    category: "html5-apis",
    component: WebShareTool,
    url: "/html5-apis/web-share-tool",
    pageTitle: "Web Share Tool: Native Share API & Social Links | ToolNames",
    metaDescription: "Share content using the native Web Share API or generate platform-specific share links for Twitter, Facebook, LinkedIn, WhatsApp, and more.",
  },
  {
    id: "network-info-monitor",
    title: "Network Info Monitor",
    description: "Monitor connection type, estimated speed, RTT, and run a client-side speed test.",
    icon: Wifi,
    category: "html5-apis",
    component: NetworkInfoMonitor,
    url: "/html5-apis/network-info-monitor",
    pageTitle: "Network Info Monitor: Connection Speed & Type | ToolNames",
    metaDescription: "View network connection type (2G/3G/4G), downlink speed, RTT, and data saver status using the Network Information API. Includes client-side speed test.",
  },
  {
    id: "pwa-manifest-generator",
    title: "PWA Manifest Generator",
    description: "Generate manifest.json, service worker, and HTML meta tags for Progressive Web Apps.",
    icon: Globe,
    category: "html5-apis",
    component: PWAManifestGenerator,
    url: "/html5-apis/pwa-manifest-generator",
    pageTitle: "PWA Manifest Generator: Create manifest.json & Service Worker | ToolNames",
    metaDescription: "Generate a complete manifest.json, service worker (Cache API), and HTML meta tags for your Progressive Web App. Includes PWA completeness scoring.",
  },
  {
    id: "universal-ai-playground",
    title: "Universal AI Playground",
    description: "A BYOK multi-provider AI chat workspace with streaming, markdown, attachments, and artifact canvas preview.",
    icon: Bot,
    category: "productivity",
    component: UniversalAIPlayground,
    url: "/productivity/universal-ai-playground",
    pageTitle: "Universal AI Playground: Multi-Provider BYOK AI Chat | ToolNames",
    metaDescription: "Chat with OpenAI, Anthropic, Gemini, Groq, Mistral, Ollama, and more in one local-first browser UI. BYOK, streaming, artifact canvas, and model switching.",
  },
  // ── Newly Added Tools ─────────────────────────────────────────────────────────
  {
    id: "random-number-generator",
    title: "Random Number Generator",
    description: "Generate one or multiple random numbers within any range. Supports unique (no-duplicate) mode and shows sum, min, and max.",
    icon: Shuffle,
    category: "generators",
    component: RandomNumberGenerator,
    url: "/generators/random-number-generator",
    pageTitle: "Random Number Generator: Free Online Random Number Tool | ToolNames",
    metaDescription: "Generate random numbers instantly. Set any min/max range, choose how many numbers, and optionally ensure uniqueness. Free, fast, and browser-based.",
  },
  {
    id: "html-entity-encoder",
    title: "HTML Entity Encoder / Decoder",
    description: "Encode special characters to HTML entities (&amp;, &lt;, &gt;, &copy;, etc.) or decode HTML entities back to plain text.",
    icon: Braces,
    category: "utilities",
    component: HTMLEntityEncoder,
    url: "/utilities/html-entity-encoder",
    pageTitle: "HTML Entity Encoder & Decoder: Escape Special Characters | ToolNames",
    metaDescription: "Encode special characters to HTML entities or decode HTML entities back to plain text. Supports all standard HTML entities. Free, instant, and private.",
  },
  {
    id: "jwt-decoder",
    title: "JWT Decoder",
    description: "Decode and inspect JSON Web Tokens (JWT). View header, payload, expiry status, and claims. No secret key needed for decoding.",
    icon: Lock,
    category: "utilities",
    component: JWTDecoder,
    url: "/utilities/jwt-decoder",
    pageTitle: "JWT Decoder: Decode & Inspect JSON Web Tokens | ToolNames",
    metaDescription: "Decode JWT tokens and inspect header, payload, and claims instantly in your browser. Check expiry, issued-at time, and all claims. 100% client-side and private.",
  },
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
    design: "Design Tools",
    productivity: "Productivity Tools",
    lottery: "Lottery Tools",
    "html5-apis": "HTML5 API Tools",
  };

  return categories[categoryId] || categoryId;
};
