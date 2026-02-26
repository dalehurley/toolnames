import React, { useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTools } from "@/contexts/ToolsContext";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dices,
  BarChart3,
  Calculator,
  LineChart,
  Target,
  TrendingUp,
  Shield,
  ArrowRight,
} from "lucide-react";
import { availableTools, Tool } from "@/contexts/toolsData";
import { LotteryBall } from "@/components/tools/lottery/shared/LotteryBall";
import { generateRandomNumbers } from "@/components/tools/lottery/shared/LotteryUtils";

// Create a custom version of ToolGrid that takes tools as props
interface CustomToolGridProps {
  tools: Tool[];
}

const CustomToolGrid: React.FC<CustomToolGridProps> = ({ tools }) => {
  // If no tools, show a message
  if (tools.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">No Tools Found</h2>
        <p className="text-muted-foreground">
          There are no tools available in this category yet.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {tools.map((tool) => (
        <Link
          key={tool.id}
          to={tool.url}
          className="no-underline text-foreground group"
          aria-label={`Open ${tool.title} tool`}
        >
          <Card className="cursor-pointer hover:shadow-md transition-all duration-200 h-full group-hover:border-primary">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <tool.icon className="h-8 w-8 text-primary mb-2" />
                  <Badge
                    variant="outline"
                    className="group-hover:bg-primary/10"
                  >
                    Lottery
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
              <CardTitle className="group-hover:text-primary transition-colors">
                {tool.title}
              </CardTitle>
              <CardDescription>{tool.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <span>Click to open tool</span>
                <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
};

const LotteryPage: React.FC = () => {
  const { setFilterCategory } = useTools();
  const [quickNumbers, setQuickNumbers] = React.useState<number[]>([]);

  // Set the filter category when the component mounts
  useEffect(() => {
    // Setting to 'all' because we'll filter manually
    setFilterCategory("all");

    // Set the document title
    document.title =
      "Lottery Tools - Number Generators, Statistics & Analysis | ToolNames";

    // Set meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "Free lottery tools for generating numbers, checking odds, analyzing historical data and creating wheeling systems. All lottery tools run in your browser with no data sent to servers."
      );
    }
  }, [setFilterCategory]);

  // Filter lottery tools
  const lotteryTools = useMemo(() => {
    return availableTools.filter((tool) => tool.category === "lottery");
  }, []);

  const generateQuickNumbers = () => {
    setQuickNumbers(generateRandomNumbers(6, 1, 49));
  };

  return (
    <div className="space-y-12 pb-8">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-xl overflow-hidden">
        <div className="container py-12 px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                Lottery Tools & Analysis
              </h1>
              <p className="text-lg text-muted-foreground mb-6">
                Comprehensive tools for lottery players to generate numbers,
                analyze patterns, and calculate odds. All tools run in your
                browser with complete privacy.
              </p>
              <div className="flex flex-wrap gap-4 mb-8">
                <div className="flex items-center text-sm">
                  <Dices className="h-4 w-4 mr-2 text-purple-500" />
                  <span>Number Generation</span>
                </div>
                <div className="flex items-center text-sm">
                  <BarChart3 className="h-4 w-4 mr-2 text-blue-500" />
                  <span>Pattern Analysis</span>
                </div>
                <div className="flex items-center text-sm">
                  <Calculator className="h-4 w-4 mr-2 text-green-500" />
                  <span>Odds Calculation</span>
                </div>
                <div className="flex items-center text-sm">
                  <LineChart className="h-4 w-4 mr-2 text-amber-500" />
                  <span>Historical Data</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" onClick={generateQuickNumbers}>
                  <Dices className="mr-2 h-4 w-4" />
                  Generate Quick Numbers
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/lottery/lottery-picker">
                    Try All Tools
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm flex flex-col items-center text-center border hover:shadow-md transition-shadow">
                <Dices className="h-12 w-12 text-purple-500 mb-4" />
                <h3 className="font-medium mb-2">Number Generator</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Generate random numbers based on various strategies.
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {quickNumbers.map((num, i) => (
                    <LotteryBall key={i} number={num} size="sm" />
                  ))}
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm flex flex-col items-center text-center border hover:shadow-md transition-shadow">
                <BarChart3 className="h-12 w-12 text-blue-500 mb-4" />
                <h3 className="font-medium mb-2">Pattern Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Analyze historical patterns and trends.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm flex flex-col items-center text-center border hover:shadow-md transition-shadow">
                <Calculator className="h-12 w-12 text-green-500 mb-4" />
                <h3 className="font-medium mb-2">Odds Calculator</h3>
                <p className="text-sm text-muted-foreground">
                  Calculate winning probabilities and odds.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm flex flex-col items-center text-center border hover:shadow-md transition-shadow">
                <LineChart className="h-12 w-12 text-amber-500 mb-4" />
                <h3 className="font-medium mb-2">Historical Data</h3>
                <p className="text-sm text-muted-foreground">
                  View and analyze past lottery results.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tools Grid Section */}
      <section>
        <div className="container">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Available Lottery Tools</h2>
            <p className="text-muted-foreground mb-6">
              All tools run directly in your browser with no server
              dependencies. Your data stays on your device for complete privacy.
            </p>
            <div className="flex flex-wrap gap-2 mb-6">
              <Badge variant="secondary" className="text-sm">
                <Shield className="h-3 w-3 mr-1" />
                Privacy-Focused
              </Badge>
              <Badge variant="secondary" className="text-sm">
                <Calculator className="h-3 w-3 mr-1" />
                Real-Time Calculations
              </Badge>
              <Badge variant="secondary" className="text-sm">
                <BarChart3 className="h-3 w-3 mr-1" />
                Data Analysis
              </Badge>
            </div>
          </div>
          <CustomToolGrid tools={lotteryTools} />
        </div>
      </section>

      {/* Lottery Tips Section */}
      <section className="bg-gray-50 dark:bg-gray-900/50 py-8 rounded-lg">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h2 className="text-2xl font-bold">Lottery Tips & Strategies</h2>
            <p className="text-sm text-muted-foreground mt-2 md:mt-0">
              Expert advice to improve your lottery experience
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border hover:shadow-md transition-all duration-200 group">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Target className="h-5 w-5 text-purple-500" />
                </div>
                <h3 className="font-medium">Smart Number Selection</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Use historical data analysis to identify patterns and make
                informed number selections based on past results.
              </p>
              <Link
                to="/lottery/lottery-analyzer"
                className="text-sm text-primary hover:underline inline-flex items-center gap-1"
              >
                Learn more
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border hover:shadow-md transition-all duration-200 group">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                </div>
                <h3 className="font-medium">Wheeling Systems</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Implement wheeling systems to increase your chances of winning
                by covering more number combinations.
              </p>
              <Link
                to="/lottery/lottery-wheel"
                className="text-sm text-primary hover:underline inline-flex items-center gap-1"
              >
                Learn more
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border hover:shadow-md transition-all duration-200 group">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Shield className="h-5 w-5 text-green-500" />
                </div>
                <h3 className="font-medium">Responsible Play</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Set a budget, stick to it, and remember that lottery is a form
                of entertainment, not a guaranteed way to make money.
              </p>
              <Link
                to="/lottery/lottery-odds-calculator"
                className="text-sm text-primary hover:underline inline-flex items-center gap-1"
              >
                Learn more
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
          <div className="mt-8 p-4 bg-primary/5 rounded-lg border border-primary/10">
            <h3 className="font-medium mb-2">Important Note</h3>
            <p className="text-sm text-muted-foreground">
              While our tools can help you make informed decisions, remember
              that lottery games are games of chance. No strategy can guarantee
              a win. Always play responsibly and within your means.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LotteryPage;
