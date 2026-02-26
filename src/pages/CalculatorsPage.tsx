import React, { useEffect, useState } from "react";
import { useTools } from "@/contexts/ToolsContext";
import { getCategoryName } from "@/contexts/toolsData";
import { ToolGrid } from "@/components/ToolGrid";
import {
  Calculator,
  Percent,
  Clock,
  Ruler,
  Scale,
  TrendingUp,
  Sigma,
  CreditCard,
  Calendar,
  Heart,
  Copy,
  Check,
  PieChart,
  Coins,
  Backpack,
  AreaChart,
  Search,
  Star,
  Zap,
  Shield,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

// Define calculator formula types with their data
interface CalculatorFormula {
  name: string;
  formula: string;
  description: string;
  example: string;
  category: "financial" | "mathematics" | "health" | "conversion" | "everyday";
}

const calculatorFormulas: CalculatorFormula[] = [
  // Financial Formulas
  {
    name: "Compound Interest",
    formula: "A = P(1 + r/n)^(nt)",
    description:
      "Calculate the future value of an investment with compound interest",
    example:
      "For $1,000 at 5% for 5 years compounded quarterly: $1,000(1 + 0.05/4)^(4×5) = $1,282.85",
    category: "financial",
  },
  {
    name: "Rule of 72",
    formula: "Years to double = 72 / r",
    description: "Estimate years needed to double an investment",
    example: "At 6% interest: 72 ÷ 6 = 12 years to double your money",
    category: "financial",
  },
  {
    name: "Loan Payment",
    formula: "PMT = P × r(1 + r)^n/((1 + r)^n - 1)",
    description: "Calculate monthly payment for a loan",
    example: "$200,000 loan, 4% annual rate, 30 years: $955 monthly payment",
    category: "financial",
  },
  {
    name: "Net Present Value",
    formula: "NPV = ∑(Ct/(1+r)^t) - C0",
    description: "Calculate the current value of future cash flows",
    example: "For cash flows of $100, $200, $300 with 5% discount: $549.18",
    category: "financial",
  },
  {
    name: "Return on Investment",
    formula: "ROI = (Net Profit / Cost of Investment) × 100%",
    description: "Measure the return on an investment relative to its cost",
    example:
      "$1,000 investment with $1,500 return: (500 ÷ 1000) × 100% = 50% ROI",
    category: "financial",
  },

  // Mathematics Formulas
  {
    name: "Pythagorean Theorem",
    formula: "c² = a² + b²",
    description: "Find the length of a triangle's hypotenuse",
    example: "If a = 3 and b = 4, then c = √(3² + 4²) = √25 = 5",
    category: "mathematics",
  },
  {
    name: "Quadratic Formula",
    formula: "x = (-b ± √(b² - 4ac)) / 2a",
    description: "Find roots of a quadratic equation ax² + bx + c = 0",
    example: "For 2x² + 5x + 2 = 0: x = (-5 ± √(25 - 16)) / 4 = -2 or -0.5",
    category: "mathematics",
  },
  {
    name: "Slope Formula",
    formula: "m = (y₂ - y₁) / (x₂ - x₁)",
    description: "Calculate the slope between two points",
    example: "For points (2,3) and (5,7): m = (7 - 3) / (5 - 2) = 4/3",
    category: "mathematics",
  },
  {
    name: "Area of a Circle",
    formula: "A = πr²",
    description: "Calculate the area of a circle with radius r",
    example: "For a circle with radius 5: A = π × 5² = 78.54",
    category: "mathematics",
  },
  {
    name: "Volume of a Sphere",
    formula: "V = (4/3)πr³",
    description: "Calculate the volume of a sphere with radius r",
    example: "For a sphere with radius 3: V = (4/3) × π × 3³ = 113.1",
    category: "mathematics",
  },

  // Health Formulas
  {
    name: "Body Mass Index",
    formula: "BMI = weight(kg) / height(m)²",
    description: "Measure body fat based on weight and height",
    example: "For a person weighing 70kg at 1.75m: BMI = 70 ÷ (1.75)² = 22.9",
    category: "health",
  },
  {
    name: "Basal Metabolic Rate",
    formula:
      "BMR (men) = 88.362 + (13.397 × weight) + (4.799 × height) - (5.677 × age)",
    description: "Calculate the calories you burn at rest",
    example: "For a 30-year-old man, 80kg, 180cm: 1,882 calories/day",
    category: "health",
  },
  {
    name: "Target Heart Rate",
    formula: "THR = ((220 - age) - RHR) × intensity + RHR",
    description:
      "Calculate target heart rate for exercise based on age and resting heart rate",
    example: "For a 35-year-old with RHR of 70 at 70% intensity: 169 BPM",
    category: "health",
  },
  {
    name: "Daily Calorie Needs",
    formula: "Calories = BMR × Activity Factor",
    description: "Estimate daily calorie needs based on activity level",
    example: "BMR of 1,600 × 1.55 (moderate activity) = 2,480 calories",
    category: "health",
  },
  {
    name: "Body Fat Percentage",
    formula:
      "BF% (men) = (495 / (1.0324 - 0.19077(log waist) + 0.15456(log height))) - 450",
    description: "Estimate body fat percentage using measurements",
    example: "For waist of 85cm and height of 180cm: 15.3% body fat",
    category: "health",
  },

  // Conversion Formulas
  {
    name: "Fahrenheit to Celsius",
    formula: "°C = (°F - 32) × 5/9",
    description: "Convert Fahrenheit to Celsius",
    example: "68°F = (68 - 32) × 5/9 = 20°C",
    category: "conversion",
  },
  {
    name: "Miles to Kilometers",
    formula: "km = mi × 1.60934",
    description: "Convert miles to kilometers",
    example: "10 miles = 10 × 1.60934 = 16.09 kilometers",
    category: "conversion",
  },
  {
    name: "Pounds to Kilograms",
    formula: "kg = lb × 0.453592",
    description: "Convert pounds to kilograms",
    example: "150 pounds = 150 × 0.453592 = 68.04 kilograms",
    category: "conversion",
  },
  {
    name: "Gallons to Liters",
    formula: "L = gal × 3.78541",
    description: "Convert gallons to liters",
    example: "5 gallons = 5 × 3.78541 = 18.93 liters",
    category: "conversion",
  },
  {
    name: "Square Feet to Square Meters",
    formula: "m² = ft² × 0.092903",
    description: "Convert square feet to square meters",
    example: "500 sq ft = 500 × 0.092903 = 46.45 sq meters",
    category: "conversion",
  },

  // Everyday Formulas
  {
    name: "Tip Calculation",
    formula: "Tip = Bill × Tip%",
    description: "Calculate tip amount for a restaurant bill",
    example: "$50 bill with 18% tip: $50 × 0.18 = $9 tip",
    category: "everyday",
  },
  {
    name: "Sale Price",
    formula: "Sale Price = Original Price × (1 - Discount%)",
    description: "Calculate price after a percentage discount",
    example: "$80 item with 25% off: $80 × (1 - 0.25) = $60",
    category: "everyday",
  },
  {
    name: "Distance Formula",
    formula: "d = rt",
    description: "Calculate distance based on rate and time",
    example: "Traveling at 60 mph for 2.5 hours: d = 60 × 2.5 = 150 miles",
    category: "everyday",
  },
  {
    name: "Price Per Unit",
    formula: "Unit Price = Price / Quantity",
    description: "Calculate price per unit for comparison shopping",
    example: "$3.99 for 12 oz = $3.99 ÷ 12 = $0.33 per oz",
    category: "everyday",
  },
  {
    name: "Split Bill",
    formula: "Share = (Bill + Tip) / Number of People",
    description: "Calculate how much each person pays when splitting a bill",
    example: "$60 bill + $12 tip with 4 people: $72 ÷ 4 = $18 per person",
    category: "everyday",
  },
];

const CalculatorsPage: React.FC = () => {
  const { setFilterCategory, filteredTools } = useTools();
  const category = "calculators";
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copyMessage, setCopyMessage] = useState<string>("");
  const [showCopyMessage, setShowCopyMessage] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter tools based on search query
  const calculatorTools = filteredTools.filter(
    (tool) =>
      tool.category === "calculators" &&
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

  // Handle copying formula
  const handleCopyFormula = (formula: CalculatorFormula, index: number) => {
    // Copy the formula to clipboard
    navigator.clipboard.writeText(formula.formula);

    // Set the copied index for visual feedback
    setCopiedIndex(index);

    // Set copy message with the copied classes
    setCopyMessage(`Copied: ${formula.formula}`);

    // Show the copy message
    setShowCopyMessage(true);

    // Reset the copied state after a delay
    setTimeout(() => {
      setCopiedIndex(null);
      setShowCopyMessage(false);
    }, 2000);
  };

  return (
    <div className="space-y-12 pb-8">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-indigo-50 via-purple-50 to-violet-100 dark:from-indigo-950/30 dark:via-purple-950/20 dark:to-violet-950/30 rounded-xl overflow-hidden">
        {/* Background decorative elements */}
        <div
          className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-violet-400/20 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"
          aria-hidden="true"
        ></div>
        <div
          className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-indigo-400/20 to-transparent rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"
          aria-hidden="true"
        ></div>

        <div className="container py-16 px-4 md:px-6 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-medium mb-4">
                <Sparkles className="h-4 w-4 mr-2" />
                {calculatorTools.length}+ Free Calculator Tools
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 bg-clip-text text-transparent">
                Professional Calculators for Every Need
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                From simple arithmetic to complex financial modeling—discover
                our comprehensive suite of calculator tools designed for
                accuracy and ease of use.
              </p>

              {/* Search Bar */}
              <div className="relative mb-8">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search calculators..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-3 text-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-indigo-200 dark:border-indigo-800 focus:border-indigo-400 dark:focus:border-indigo-600 rounded-lg shadow-sm"
                />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg p-4 text-center border border-indigo-200/50 dark:border-indigo-800/50">
                  <div className="flex items-center justify-center mb-2">
                    <Calculator className="h-5 w-5 text-indigo-500" />
                  </div>
                  <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                    15+
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Math Tools
                  </div>
                </div>
                <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg p-4 text-center border border-violet-200/50 dark:border-violet-800/50">
                  <div className="flex items-center justify-center mb-2">
                    <TrendingUp className="h-5 w-5 text-violet-500" />
                  </div>
                  <div className="text-2xl font-bold text-violet-600 dark:text-violet-400">
                    10+
                  </div>
                  <div className="text-sm text-muted-foreground">Financial</div>
                </div>
                <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg p-4 text-center border border-purple-200/50 dark:border-purple-800/50">
                  <div className="flex items-center justify-center mb-2">
                    <Heart className="h-5 w-5 text-purple-500" />
                  </div>
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    8+
                  </div>
                  <div className="text-sm text-muted-foreground">Health</div>
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center text-sm bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                  <Shield className="h-4 w-4 mr-3 text-green-500" />
                  <span>100% Privacy Protected</span>
                </div>
                <div className="flex items-center text-sm bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                  <Zap className="h-4 w-4 mr-3 text-yellow-500" />
                  <span>Instant Results</span>
                </div>
                <div className="flex items-center text-sm bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                  <Star className="h-4 w-4 mr-3 text-blue-500" />
                  <span>Professional Accuracy</span>
                </div>
                <div className="flex items-center text-sm bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                  <Calculator className="h-4 w-4 mr-3 text-indigo-500" />
                  <span>No Installation Required</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6">
              {/* Featured Calculator Cards */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">
                      Popular Calculators
                    </h3>
                    <Badge
                      variant="secondary"
                      className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                    >
                      Most Used
                    </Badge>
                  </div>
                  <div className="space-y-4">
                    <Link
                      to="/calculators/percentage-calculator"
                      className="block group"
                    >
                      <div className="flex items-center p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg border border-indigo-200/50 dark:border-indigo-800/50 group-hover:shadow-md transition-all">
                        <div className="bg-indigo-100 dark:bg-indigo-900/30 rounded-lg p-3 mr-4">
                          <Percent className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            Percentage Calculator
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Calculate percentages and changes
                          </p>
                        </div>
                        <div className="text-indigo-500 group-hover:translate-x-1 transition-transform">
                          →
                        </div>
                      </div>
                    </Link>

                    <Link
                      to="/calculators/mortgage-calculator"
                      className="block group"
                    >
                      <div className="flex items-center p-4 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-lg border border-violet-200/50 dark:border-violet-800/50 group-hover:shadow-md transition-all">
                        <div className="bg-violet-100 dark:bg-violet-900/30 rounded-lg p-3 mr-4">
                          <TrendingUp className="h-6 w-6 text-violet-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            Mortgage Calculator
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Monthly payments & amortization
                          </p>
                        </div>
                        <div className="text-violet-500 group-hover:translate-x-1 transition-transform">
                          →
                        </div>
                      </div>
                    </Link>

                    <Link
                      to="/calculators/bmi-calculator"
                      className="block group"
                    >
                      <div className="flex items-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200/50 dark:border-purple-800/50 group-hover:shadow-md transition-all">
                        <div className="bg-purple-100 dark:bg-purple-900/30 rounded-lg p-3 mr-4">
                          <Heart className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            BMI Calculator
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Body mass index & health insights
                          </p>
                        </div>
                        <div className="text-purple-500 group-hover:translate-x-1 transition-transform">
                          →
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Quick Tools */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 overflow-hidden">
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Quick Tools</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-lg border border-emerald-200/50 dark:border-emerald-800/50">
                      <Calculator className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                      <div className="text-sm font-medium">Math</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
                      <Coins className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <div className="text-sm font-medium">Finance</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 rounded-lg border border-rose-200/50 dark:border-rose-800/50">
                      <Heart className="h-8 w-8 text-rose-600 mx-auto mb-2" />
                      <div className="text-sm font-medium">Health</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg border border-amber-200/50 dark:border-amber-800/50">
                      <Ruler className="h-8 w-8 text-amber-600 mx-auto mb-2" />
                      <div className="text-sm font-medium">Convert</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Tool Section */}
      <section className="container">
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 rounded-xl overflow-hidden py-8 px-6">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center mb-2">
                <Calculator className="h-5 w-5 mr-2 text-purple-500" />
                <span className="text-sm font-medium text-purple-500">
                  FEATURED CALCULATOR
                </span>
              </div>
              <h2 className="text-2xl font-bold mb-4">BMI Calculator</h2>
              <p className="text-muted-foreground mb-6">
                Calculate your Body Mass Index (BMI) to understand your weight
                in relation to your height. Our BMI calculator includes
                personalized insights and recommendations based on your results.
              </p>
              <div className="space-y-3">
                <div className="flex items-start">
                  <Scale className="h-5 w-5 mr-2 text-purple-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Metric & Imperial Units</h4>
                    <p className="text-sm text-muted-foreground">
                      Calculate using either metric (kg/cm) or imperial (lb/in)
                      measurements
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <TrendingUp className="h-5 w-5 mr-2 text-purple-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Visual Results</h4>
                    <p className="text-sm text-muted-foreground">
                      See where your BMI falls on the health scale with
                      easy-to-read visuals
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Calculator className="h-5 w-5 mr-2 text-purple-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Health Insights</h4>
                    <p className="text-sm text-muted-foreground">
                      Get personalized recommendations based on your BMI
                      calculation
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <Link to="/calculators/bmi-calculator">
                  <Button>Try BMI Calculator</Button>
                </Link>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border">
              <div className="p-6">
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-medium">BMI Calculator</h3>
                    <div className="bg-white dark:bg-gray-800 px-3 py-1 rounded-full text-xs shadow-sm">
                      Metric
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">
                        Height (cm)
                      </div>
                      <div className="h-10 bg-white dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600"></div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">
                        Weight (kg)
                      </div>
                      <div className="h-10 bg-white dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600"></div>
                    </div>
                  </div>

                  <div className="h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-md mb-4"></div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Your BMI:
                    </div>
                    <div className="text-lg font-medium">22.5</div>
                  </div>

                  <div className="mt-4 h-4 bg-gradient-to-r from-green-200 via-yellow-200 to-red-200 dark:from-green-900/50 dark:via-yellow-900/50 dark:to-red-900/50 rounded-full relative">
                    <div className="absolute h-6 w-6 bg-white dark:bg-gray-800 rounded-full border-2 border-indigo-500 shadow-md top-1/2 -translate-y-1/2 left-[40%] -translate-x-1/2"></div>
                  </div>
                  <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                    <span>Underweight</span>
                    <span>Normal</span>
                    <span>Overweight</span>
                    <span>Obese</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Calculator Categories Section */}
      <section className="container">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">
            Popular Calculator Categories
          </h2>
          <p className="text-muted-foreground">
            Explore our most popular calculator types
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col items-center text-center hover:shadow-md transition-shadow">
            <div className="bg-indigo-100 dark:bg-indigo-900/30 rounded-full p-3 mb-4">
              <Coins className="h-8 w-8 text-indigo-600" />
            </div>
            <h3 className="font-medium mb-2">Financial</h3>
            <p className="text-sm text-muted-foreground">
              Interest, loans, investments
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col items-center text-center hover:shadow-md transition-shadow">
            <div className="bg-violet-100 dark:bg-violet-900/30 rounded-full p-3 mb-4">
              <Sigma className="h-8 w-8 text-violet-600" />
            </div>
            <h3 className="font-medium mb-2">Mathematics</h3>
            <p className="text-sm text-muted-foreground">
              Formulas, geometry, statistics
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col items-center text-center hover:shadow-md transition-shadow">
            <div className="bg-red-100 dark:bg-red-900/30 rounded-full p-3 mb-4">
              <Heart className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="font-medium mb-2">Health & Fitness</h3>
            <p className="text-sm text-muted-foreground">
              BMI, calories, macros
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col items-center text-center hover:shadow-md transition-shadow">
            <div className="bg-emerald-100 dark:bg-emerald-900/30 rounded-full p-3 mb-4">
              <Backpack className="h-8 w-8 text-emerald-600" />
            </div>
            <h3 className="font-medium mb-2">Everyday</h3>
            <p className="text-sm text-muted-foreground">
              Tips, discounts, conversions
            </p>
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
                    ? `Search Results (${calculatorTools.length})`
                    : "All Calculator Tools"}
                </h2>
                <p className="text-muted-foreground">
                  {searchQuery
                    ? `Found ${calculatorTools.length} calculators matching "${searchQuery}"`
                    : "All calculators run entirely in your browser. Your data never leaves your device, ensuring complete privacy."}
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
              {calculatorTools.map((tool) => (
                <Link
                  key={tool.id}
                  to={tool.url}
                  className="group block bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-200 hover:border-indigo-300 dark:hover:border-indigo-600"
                >
                  <div className="flex items-start space-x-4">
                    <div className="bg-indigo-100 dark:bg-indigo-900/30 rounded-lg p-3 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-800/50 transition-colors">
                      <tool.icon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {tool.title}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                        {tool.description}
                      </p>
                      <div className="mt-3 flex items-center text-indigo-600 dark:text-indigo-400 text-sm font-medium group-hover:translate-x-1 transition-transform">
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

          {searchQuery && calculatorTools.length === 0 && (
            <div className="text-center py-12">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No calculators found
              </h3>
              <p className="text-muted-foreground">
                Try searching for different terms or browse our categories
                below.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Formula Reference Section */}
      <section className="container">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Calculator Formula Reference</h2>
          <div className="text-sm text-muted-foreground">
            Click on any formula to copy it
          </div>
        </div>

        <Tabs defaultValue="financial" className="mb-8">
          <TabsList className="mb-2">
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="mathematics">Mathematics</TabsTrigger>
            <TabsTrigger value="health">Health</TabsTrigger>
            <TabsTrigger value="conversion">Conversions</TabsTrigger>
            <TabsTrigger value="everyday">Everyday</TabsTrigger>
          </TabsList>

          {/* Copy notification message */}
          {showCopyMessage && (
            <div className="mt-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 px-3 py-2 rounded-md text-sm transition-all duration-200 flex items-center space-x-2">
              <Check className="h-4 w-4" />
              <span>{copyMessage}</span>
            </div>
          )}

          {/* Map through each category */}
          {(
            [
              "financial",
              "mathematics",
              "health",
              "conversion",
              "everyday",
            ] as const
          ).map((categoryName) => (
            <TabsContent
              key={categoryName}
              value={categoryName}
              className="mt-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {calculatorFormulas
                  .filter((formula) => formula.category === categoryName)
                  .map((formula, index) => {
                    const globalIndex = calculatorFormulas.findIndex(
                      (f) => f === formula
                    );
                    return (
                      <button
                        key={index}
                        className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700 text-left transition-all hover:shadow-md relative group"
                        onClick={() => handleCopyFormula(formula, globalIndex)}
                        aria-label={`Copy ${formula.name} formula`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-medium text-base">
                            {formula.name}
                          </h3>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            {copiedIndex === globalIndex ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4 text-gray-400" />
                            )}
                          </div>
                        </div>
                        <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-md p-3 mb-3 font-mono text-sm overflow-x-auto">
                          {formula.formula}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {formula.description}
                        </p>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          <span className="font-medium">Example: </span>
                          {formula.example}
                        </div>
                      </button>
                    );
                  })}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6 text-sm text-muted-foreground">
          <h3 className="font-medium mb-2">Using These Formulas</h3>
          <p className="mb-3">
            The formulas above are commonly used in various calculations. You
            can copy any formula and use it in our calculators or your own
            spreadsheets.
          </p>
          <div className="grid md:grid-cols-2 gap-6 mt-4">
            <div className="flex items-start">
              <Calculator className="h-5 w-5 mr-2 text-indigo-500 mt-0.5" />
              <div>
                <h4 className="font-medium">Make Better Financial Decisions</h4>
                <p className="text-sm text-muted-foreground">
                  Use our financial calculators to plan investments, loans, and
                  retirement with confidence.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <PieChart className="h-5 w-5 mr-2 text-violet-500 mt-0.5" />
              <div>
                <h4 className="font-medium">Visualize Your Results</h4>
                <p className="text-sm text-muted-foreground">
                  Many of our calculators include charts and graphs to help you
                  understand the results at a glance.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <Clock className="h-5 w-5 mr-2 text-emerald-500 mt-0.5" />
              <div>
                <h4 className="font-medium">
                  Save Time with Quick Calculations
                </h4>
                <p className="text-sm text-muted-foreground">
                  No need to remember complex formulas—our tools handle the math
                  for you.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <AreaChart className="h-5 w-5 mr-2 text-amber-500 mt-0.5" />
              <div>
                <h4 className="font-medium">Track Progress Over Time</h4>
                <p className="text-sm text-muted-foreground">
                  Use our calculators regularly to monitor your financial
                  health, fitness goals, or project metrics.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Calculator Tips Section */}
      <section className="bg-gray-50 dark:bg-gray-900/50 py-8 rounded-lg">
        <div className="container px-4 md:px-6">
          <h2 className="text-2xl font-bold mb-6">Calculation Tips</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
              <h3 className="font-medium mb-3 flex items-center">
                <Percent className="h-5 w-5 mr-2 text-indigo-500" />
                Percentage Shortcuts
              </h3>
              <p className="text-sm text-muted-foreground">
                To find 10% of a number, simply move the decimal point one place
                to the left. For 1%, move it two places left.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
              <h3 className="font-medium mb-3 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-violet-500" />
                Compound Interest
              </h3>
              <p className="text-sm text-muted-foreground">
                The Rule of 72: Divide 72 by the annual interest rate to
                estimate how many years it will take for your investment to
                double.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
              <h3 className="font-medium mb-3 flex items-center">
                <Calculator className="h-5 w-5 mr-2 text-purple-500" />
                Unit Consistency
              </h3>
              <p className="text-sm text-muted-foreground">
                Always ensure you're using consistent units when performing
                calculations. Convert all measurements to the same unit system
                first.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Calculators Section */}
      <section className="container">
        <h2 className="text-2xl font-bold mb-6">Coming Soon</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-6 border border-dashed border-gray-300 dark:border-gray-700">
            <div className="flex items-center mb-4">
              <CreditCard className="h-6 w-6 mr-3 text-blue-500" />
              <h3 className="font-medium">Loan Comparison Tool</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Compare multiple loan options side by side with interactive charts
              to visualize total interest and payment schedules.
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-6 border border-dashed border-gray-300 dark:border-gray-700">
            <div className="flex items-center mb-4">
              <Calendar className="h-6 w-6 mr-3 text-purple-500" />
              <h3 className="font-medium">Retirement Planner</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Plan your retirement with our comprehensive calculator that
              accounts for inflation, investment returns, and withdrawal
              strategies.
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-6 border border-dashed border-gray-300 dark:border-gray-700">
            <div className="flex items-center mb-4">
              <Heart className="h-6 w-6 mr-3 text-red-500" />
              <h3 className="font-medium">Health Metrics Dashboard</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Track multiple health metrics in one place with trend analysis and
              personalized recommendations.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CalculatorsPage;
