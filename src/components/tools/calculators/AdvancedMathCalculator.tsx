import React, { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Calculator,
  BarChart3,
  TrendingUp,
  PieChart,
  FileText,
  Info,
  Upload,
  Lightbulb,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
} from "recharts";

// Statistical calculation functions
class StatisticalCalculator {
  static mean(data: number[]): number {
    return data.reduce((sum, val) => sum + val, 0) / data.length;
  }

  static median(data: number[]): number {
    const sorted = [...data].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
  }

  static mode(data: number[]): number[] {
    const frequency: { [key: number]: number } = {};
    data.forEach((num) => (frequency[num] = (frequency[num] || 0) + 1));
    const maxFreq = Math.max(...Object.values(frequency));
    return Object.keys(frequency)
      .filter((key) => frequency[Number(key)] === maxFreq)
      .map(Number);
  }

  static standardDeviation(data: number[]): number {
    const mean = this.mean(data);
    const variance =
      data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
    return Math.sqrt(variance);
  }

  static variance(data: number[]): number {
    const mean = this.mean(data);
    return (
      data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length
    );
  }

  static correlation(x: number[], y: number[]): number {
    if (x.length !== y.length) throw new Error("Arrays must have same length");
    const n = x.length;
    const meanX = this.mean(x);
    const meanY = this.mean(y);

    let numerator = 0;
    let sumXSquared = 0;
    let sumYSquared = 0;

    for (let i = 0; i < n; i++) {
      const deltaX = x[i] - meanX;
      const deltaY = y[i] - meanY;
      numerator += deltaX * deltaY;
      sumXSquared += deltaX * deltaX;
      sumYSquared += deltaY * deltaY;
    }

    return numerator / Math.sqrt(sumXSquared * sumYSquared);
  }

  static linearRegression(
    x: number[],
    y: number[]
  ): { slope: number; intercept: number; rSquared: number } {
    if (x.length !== y.length) throw new Error("Arrays must have same length");
    const n = x.length;
    const meanX = this.mean(x);
    const meanY = this.mean(y);

    let numerator = 0;
    let denominator = 0;

    for (let i = 0; i < n; i++) {
      numerator += (x[i] - meanX) * (y[i] - meanY);
      denominator += (x[i] - meanX) * (x[i] - meanX);
    }

    const slope = numerator / denominator;
    const intercept = meanY - slope * meanX;

    // Calculate R-squared
    let totalVariation = 0;
    let residualVariation = 0;

    for (let i = 0; i < n; i++) {
      const predicted = slope * x[i] + intercept;
      totalVariation += (y[i] - meanY) * (y[i] - meanY);
      residualVariation += (y[i] - predicted) * (y[i] - predicted);
    }

    const rSquared = 1 - residualVariation / totalVariation;

    return { slope, intercept, rSquared };
  }

  static normalDistribution(
    x: number,
    mean: number = 0,
    stdDev: number = 1
  ): number {
    return (
      (1 / (stdDev * Math.sqrt(2 * Math.PI))) *
      Math.exp(-0.5 * Math.pow((x - mean) / stdDev, 2))
    );
  }

  static zScore(value: number, mean: number, stdDev: number): number {
    return (value - mean) / stdDev;
  }

  static confidenceInterval(data: number[]): { lower: number; upper: number } {
    const n = data.length;
    const mean = this.mean(data);
    const stdDev = this.standardDeviation(data);
    const stdError = stdDev / Math.sqrt(n);

    // Using t-distribution approximation for simplicity
    const tValue = 1.96; // Approximate for 95% confidence
    const margin = tValue * stdError;

    return {
      lower: mean - margin,
      upper: mean + margin,
    };
  }
}

// Equation solver functions
class EquationSolver {
  static solveLinear(
    a: number,
    b: number
  ): { solution: number; steps: string[] } {
    // Solve ax + b = 0
    const steps = [
      `Given equation: ${a}x + ${b} = 0`,
      `Subtract ${b} from both sides: ${a}x = ${-b}`,
      `Divide both sides by ${a}: x = ${-b}/${a}`,
      `Solution: x = ${-b / a}`,
    ];
    return { solution: -b / a, steps };
  }

  static solveQuadratic(
    a: number,
    b: number,
    c: number
  ): { solutions: number[]; steps: string[]; discriminant: number } {
    // Solve ax² + bx + c = 0
    const discriminant = b * b - 4 * a * c;
    const steps = [
      `Given equation: ${a}x² + ${b}x + ${c} = 0`,
      `Using quadratic formula: x = (-b ± √(b² - 4ac)) / 2a`,
      `Calculate discriminant: b² - 4ac = ${b}² - 4(${a})(${c}) = ${discriminant}`,
    ];

    if (discriminant < 0) {
      steps.push("Since discriminant < 0, there are no real solutions");
      return { solutions: [], steps, discriminant };
    } else if (discriminant === 0) {
      const solution = -b / (2 * a);
      steps.push(`One solution: x = ${-b}/(2·${a}) = ${solution}`);
      return { solutions: [solution], steps, discriminant };
    } else {
      const sqrt = Math.sqrt(discriminant);
      const x1 = (-b + sqrt) / (2 * a);
      const x2 = (-b - sqrt) / (2 * a);
      steps.push(`Two solutions:`);
      steps.push(`x₁ = (${-b} + √${discriminant})/(2·${a}) = ${x1}`);
      steps.push(`x₂ = (${-b} - √${discriminant})/(2·${a}) = ${x2}`);
      return { solutions: [x1, x2], steps, discriminant };
    }
  }

  static solveSystemLinear(
    a1: number,
    b1: number,
    c1: number,
    a2: number,
    b2: number,
    c2: number
  ): {
    solution: { x: number; y: number } | null;
    steps: string[];
    type: "unique" | "infinite" | "none";
  } {
    // Solve system: a1*x + b1*y = c1, a2*x + b2*y = c2
    const steps = [
      `System of equations:`,
      `${a1}x + ${b1}y = ${c1}`,
      `${a2}x + ${b2}y = ${c2}`,
    ];

    const determinant = a1 * b2 - a2 * b1;

    if (determinant === 0) {
      // Check if consistent (infinite solutions) or inconsistent (no solution)
      const ratio1 = c1 / a1;
      const ratio2 = c2 / a2;
      if (Math.abs(ratio1 - ratio2) < 1e-10) {
        steps.push("System has infinite solutions (dependent equations)");
        return { solution: null, steps, type: "infinite" };
      } else {
        steps.push("System has no solution (inconsistent equations)");
        return { solution: null, steps, type: "none" };
      }
    }

    const x = (c1 * b2 - c2 * b1) / determinant;
    const y = (a1 * c2 - a2 * c1) / determinant;

    steps.push(`Using Cramer's rule:`);
    steps.push(`Determinant = ${a1}·${b2} - ${a2}·${b1} = ${determinant}`);
    steps.push(`x = (${c1}·${b2} - ${c2}·${b1})/${determinant} = ${x}`);
    steps.push(`y = (${a1}·${c2} - ${a2}·${c1})/${determinant} = ${y}`);

    return { solution: { x, y }, steps, type: "unique" };
  }
}

// Sample datasets for demonstration
const sampleDatasets = {
  heights: [
    165, 170, 175, 168, 172, 169, 171, 173, 166, 174, 167, 170, 172, 168, 169,
  ],
  weights: [60, 65, 70, 62, 68, 64, 66, 69, 61, 71, 63, 65, 67, 62, 64],
  sales: [
    1200, 1500, 1800, 1600, 2000, 1700, 1900, 2200, 1400, 1650, 1750, 1850,
    1950, 1550, 1800,
  ],
  temperature: [20, 22, 25, 23, 28, 26, 24, 27, 21, 29, 25, 23, 26, 24, 22],
  scores: [85, 92, 78, 88, 95, 82, 90, 87, 83, 91, 89, 86, 84, 93, 79],
};

interface StatsResults {
  count: number;
  mean: number;
  median: number;
  mode: number[];
  standardDeviation: number;
  variance: number;
  min: number;
  max: number;
  range: number;
  confidenceInterval: { lower: number; upper: number };
  regression?: {
    correlation: number;
    slope: number;
    intercept: number;
    rSquared: number;
    equation: string;
  };
}

export const AdvancedMathCalculator: React.FC = () => {
  // Statistical Analysis State
  const [dataInput, setDataInput] = useState<string>("");
  const [data, setData] = useState<number[]>([]);
  const [dataForRegression, setDataForRegression] = useState<{
    x: number[];
    y: number[];
  }>({ x: [], y: [] });
  const [regressionInputs, setRegressionInputs] = useState<{
    x: string;
    y: string;
  }>({ x: "", y: "" });
  const [selectedDataset, setSelectedDataset] = useState<string>("");

  // Equation Solver State
  const [equationType, setEquationType] = useState<
    "linear" | "quadratic" | "system"
  >("linear");
  const [linearCoeffs, setLinearCoeffs] = useState({ a: 1, b: 0 });
  const [quadraticCoeffs, setQuadraticCoeffs] = useState({ a: 1, b: 0, c: 0 });
  const [systemCoeffs, setSystemCoeffs] = useState({
    a1: 1,
    b1: 1,
    c1: 1,
    a2: 1,
    b2: -1,
    c2: 1,
  });

  // Results State
  const [statsResults, setStatsResults] = useState<StatsResults | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [equationResults, setEquationResults] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("statistics");
  const [error, setError] = useState<string>("");

  // Parse data input
  const parseData = useCallback((input: string): number[] => {
    try {
      const cleaned = input.replace(/[^\d.,\-\s]/g, "");
      const numbers = cleaned
        .split(/[,\s]+/)
        .filter((s) => s.length > 0)
        .map(Number);
      return numbers.filter((n) => !isNaN(n));
    } catch {
      return [];
    }
  }, []);

  // Calculate statistics
  const calculateStatistics = useCallback(() => {
    setError("");
    try {
      const numbers = parseData(dataInput);
      if (numbers.length === 0) {
        setError("Please enter valid numerical data");
        return;
      }

      const results = {
        count: numbers.length,
        mean: StatisticalCalculator.mean(numbers),
        median: StatisticalCalculator.median(numbers),
        mode: StatisticalCalculator.mode(numbers),
        standardDeviation: StatisticalCalculator.standardDeviation(numbers),
        variance: StatisticalCalculator.variance(numbers),
        min: Math.min(...numbers),
        max: Math.max(...numbers),
        range: Math.max(...numbers) - Math.min(...numbers),
        confidenceInterval: StatisticalCalculator.confidenceInterval(numbers),
      };

      setStatsResults(results);
      setData(numbers);
    } catch (err) {
      setError("Error calculating statistics: " + (err as Error).message);
    }
  }, [dataInput, parseData]);

  // Calculate regression analysis
  const calculateRegression = useCallback(() => {
    setError("");
    console.log("Calculate Regression clicked!", {
      x: dataForRegression.x,
      y: dataForRegression.y,
      xLength: dataForRegression.x.length,
      yLength: dataForRegression.y.length,
    });

    try {
      if (
        dataForRegression.x.length === 0 ||
        dataForRegression.y.length === 0
      ) {
        setError("Please enter both X and Y data for regression analysis");
        return;
      }

      if (dataForRegression.x.length !== dataForRegression.y.length) {
        setError("X and Y data must have the same number of values");
        return;
      }

      console.log("Starting regression calculations...");

      const correlation = StatisticalCalculator.correlation(
        dataForRegression.x,
        dataForRegression.y
      );
      const regression = StatisticalCalculator.linearRegression(
        dataForRegression.x,
        dataForRegression.y
      );

      console.log("Regression calculated:", { correlation, regression });

      const regressionResults = {
        correlation,
        slope: regression.slope,
        intercept: regression.intercept,
        rSquared: regression.rSquared,
        equation: `y = ${regression.slope.toFixed(
          4
        )}x + ${regression.intercept.toFixed(4)}`,
      };

      setStatsResults((prevResults) => {
        if (!prevResults) {
          // Create a basic stats result if none exists
          console.log("Creating new stats result with regression");
          return {
            count: dataForRegression.x.length,
            mean: StatisticalCalculator.mean(dataForRegression.x),
            median: StatisticalCalculator.median(dataForRegression.x),
            mode: StatisticalCalculator.mode(dataForRegression.x),
            standardDeviation: StatisticalCalculator.standardDeviation(
              dataForRegression.x
            ),
            variance: StatisticalCalculator.variance(dataForRegression.x),
            min: Math.min(...dataForRegression.x),
            max: Math.max(...dataForRegression.x),
            range:
              Math.max(...dataForRegression.x) -
              Math.min(...dataForRegression.x),
            confidenceInterval: StatisticalCalculator.confidenceInterval(
              dataForRegression.x
            ),
            regression: regressionResults,
          };
        }

        console.log("Adding regression to existing stats result");
        return {
          ...prevResults,
          regression: regressionResults,
        };
      });
    } catch (err) {
      console.error("Regression calculation error:", err);
      setError("Error calculating regression: " + (err as Error).message);
    }
  }, [dataForRegression]);

  // Solve equations
  const solveEquation = useCallback(() => {
    setError("");
    try {
      let result;

      switch (equationType) {
        case "linear":
          result = EquationSolver.solveLinear(linearCoeffs.a, linearCoeffs.b);
          break;
        case "quadratic":
          result = EquationSolver.solveQuadratic(
            quadraticCoeffs.a,
            quadraticCoeffs.b,
            quadraticCoeffs.c
          );
          break;
        case "system":
          result = EquationSolver.solveSystemLinear(
            systemCoeffs.a1,
            systemCoeffs.b1,
            systemCoeffs.c1,
            systemCoeffs.a2,
            systemCoeffs.b2,
            systemCoeffs.c2
          );
          break;
        default:
          throw new Error("Unknown equation type");
      }

      setEquationResults(result);
    } catch (err) {
      setError("Error solving equation: " + (err as Error).message);
    }
  }, [equationType, linearCoeffs, quadraticCoeffs, systemCoeffs]);

  // Load sample dataset
  const loadSampleDataset = (datasetName: string) => {
    if (datasetName in sampleDatasets) {
      setDataInput(
        sampleDatasets[datasetName as keyof typeof sampleDatasets].join(", ")
      );
      setSelectedDataset(datasetName);
    }
  };

  // Load sample regression data
  const loadSampleRegressionData = () => {
    const sampleX = "1, 2, 3, 4, 5, 6, 7, 8, 9, 10";
    const sampleY = "2.1, 3.9, 6.2, 7.8, 10.1, 12.3, 13.8, 16.2, 18.1, 20.3";

    setRegressionInputs({ x: sampleX, y: sampleY });
    setDataForRegression({
      x: parseData(sampleX),
      y: parseData(sampleY),
    });
  };

  // Chart data for visualization
  const chartData = useMemo(() => {
    if (!data.length) return [];
    return data.map((value, index) => ({ index: index + 1, value }));
  }, [data]);

  const regressionChartData = useMemo(() => {
    if (!dataForRegression.x.length || !dataForRegression.y.length) return [];
    return dataForRegression.x.map((x, index) => ({
      x,
      y: dataForRegression.y[index],
    }));
  }, [dataForRegression]);

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">
          Advanced Math & Statistical Calculator
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Perform statistical analysis, solve equations, and visualize
          mathematical data with our comprehensive calculator suite.
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-600">{error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="statistics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Statistical Analysis
          </TabsTrigger>
          <TabsTrigger value="equations" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Equation Solver
          </TabsTrigger>
          <TabsTrigger value="formulas" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Formula Reference
          </TabsTrigger>
        </TabsList>

        {/* Statistical Analysis Tab */}
        <TabsContent value="statistics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Data Input
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="sample-datasets">Load Sample Dataset</Label>
                  <Select
                    value={selectedDataset}
                    onValueChange={loadSampleDataset}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a sample dataset..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="heights">Heights (cm)</SelectItem>
                      <SelectItem value="weights">Weights (kg)</SelectItem>
                      <SelectItem value="sales">Monthly Sales ($)</SelectItem>
                      <SelectItem value="temperature">
                        Temperature (°C)
                      </SelectItem>
                      <SelectItem value="scores">Test Scores</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="data-input">
                    Enter Data (comma or space separated)
                  </Label>
                  <Textarea
                    id="data-input"
                    placeholder="Enter numbers: 1, 2, 3, 4, 5 or 1 2 3 4 5"
                    value={dataInput}
                    onChange={(e) => setDataInput(e.target.value)}
                    className="min-h-[120px]"
                  />
                </div>

                <Button onClick={calculateStatistics} className="w-full">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Calculate Statistics
                </Button>
              </CardContent>
            </Card>

            {/* Results Section */}
            {statsResults && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Statistical Results
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Count:</span>
                        <Badge variant="secondary">{statsResults.count}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Mean:</span>
                        <Badge variant="secondary">
                          {statsResults.mean.toFixed(4)}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Median:</span>
                        <Badge variant="secondary">
                          {statsResults.median.toFixed(4)}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Mode:</span>
                        <Badge variant="secondary">
                          {statsResults.mode.join(", ")}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Std Dev:</span>
                        <Badge variant="secondary">
                          {statsResults.standardDeviation.toFixed(4)}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Variance:</span>
                        <Badge variant="secondary">
                          {statsResults.variance.toFixed(4)}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Range:</span>
                        <Badge variant="secondary">
                          {statsResults.range.toFixed(4)}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Min/Max:</span>
                        <Badge variant="secondary">
                          {statsResults.min}/{statsResults.max}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-2">
                      95% Confidence Interval
                    </h4>
                    <Badge variant="outline">
                      [{statsResults.confidenceInterval.lower.toFixed(4)},{" "}
                      {statsResults.confidenceInterval.upper.toFixed(4)}]
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Data Visualization */}
          {data.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Data Visualization
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-4">Line Chart</h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="index" />
                        <YAxis />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#8884d8"
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div>
                    <h4 className="font-medium mb-4">Bar Chart</h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="index" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Regression Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Regression Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Enter X and Y values for linear regression analysis
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadSampleRegressionData}
                  className="text-xs"
                >
                  Load Sample Data
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="x-data">
                    X Values (independent variable)
                  </Label>
                  <Textarea
                    id="x-data"
                    placeholder="1, 2, 3, 4, 5"
                    value={regressionInputs.x}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      setRegressionInputs((prev) => ({ ...prev, x: newValue }));
                      setDataForRegression((prev) => ({
                        ...prev,
                        x: parseData(newValue),
                      }));
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="y-data">Y Values (dependent variable)</Label>
                  <Textarea
                    id="y-data"
                    placeholder="2, 4, 6, 8, 10"
                    value={regressionInputs.y}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      setRegressionInputs((prev) => ({ ...prev, y: newValue }));
                      setDataForRegression((prev) => ({
                        ...prev,
                        y: parseData(newValue),
                      }));
                    }}
                  />
                </div>
              </div>

              <Button onClick={calculateRegression} className="w-full">
                Calculate Regression
              </Button>

              {statsResults?.regression && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Correlation (r):</span>
                        <Badge variant="secondary">
                          {statsResults.regression.correlation.toFixed(4)}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>R-squared:</span>
                        <Badge variant="secondary">
                          {statsResults.regression.rSquared.toFixed(4)}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Slope:</span>
                        <Badge variant="secondary">
                          {statsResults.regression.slope.toFixed(4)}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Intercept:</span>
                        <Badge variant="secondary">
                          {statsResults.regression.intercept.toFixed(4)}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Regression Equation</h4>
                    <Badge variant="outline" className="text-lg p-2">
                      {statsResults.regression.equation}
                    </Badge>
                  </div>

                  {regressionChartData.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-4">
                        Scatter Plot with Regression Line
                      </h4>
                      <ResponsiveContainer width="100%" height={300}>
                        <ScatterChart data={regressionChartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="x" name="X" />
                          <YAxis dataKey="y" name="Y" />
                          <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                          <Scatter
                            name="Data Points"
                            dataKey="y"
                            fill="#8884d8"
                          />
                        </ScatterChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Equation Solver Tab */}
        <TabsContent value="equations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Equation Solver
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Equation Type</Label>
                <Select
                  value={equationType}
                  onValueChange={(value: "linear" | "quadratic" | "system") =>
                    setEquationType(value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="linear">
                      Linear Equation (ax + b = 0)
                    </SelectItem>
                    <SelectItem value="quadratic">
                      Quadratic Equation (ax² + bx + c = 0)
                    </SelectItem>
                    <SelectItem value="system">
                      System of Linear Equations
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Linear Equation Inputs */}
              {equationType === "linear" && (
                <div className="space-y-4">
                  <h3 className="font-medium">Linear Equation: ax + b = 0</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="linear-a">Coefficient a</Label>
                      <Input
                        id="linear-a"
                        type="number"
                        value={linearCoeffs.a}
                        onChange={(e) =>
                          setLinearCoeffs((prev) => ({
                            ...prev,
                            a: Number(e.target.value),
                          }))
                        }
                        placeholder="1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="linear-b">Constant b</Label>
                      <Input
                        id="linear-b"
                        type="number"
                        value={linearCoeffs.b}
                        onChange={(e) =>
                          setLinearCoeffs((prev) => ({
                            ...prev,
                            b: Number(e.target.value),
                          }))
                        }
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm">
                      Equation Preview:{" "}
                      <code>
                        {linearCoeffs.a}x + {linearCoeffs.b} = 0
                      </code>
                    </p>
                  </div>
                </div>
              )}

              {/* Quadratic Equation Inputs */}
              {equationType === "quadratic" && (
                <div className="space-y-4">
                  <h3 className="font-medium">
                    Quadratic Equation: ax² + bx + c = 0
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="quad-a">Coefficient a</Label>
                      <Input
                        id="quad-a"
                        type="number"
                        value={quadraticCoeffs.a}
                        onChange={(e) =>
                          setQuadraticCoeffs((prev) => ({
                            ...prev,
                            a: Number(e.target.value),
                          }))
                        }
                        placeholder="1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="quad-b">Coefficient b</Label>
                      <Input
                        id="quad-b"
                        type="number"
                        value={quadraticCoeffs.b}
                        onChange={(e) =>
                          setQuadraticCoeffs((prev) => ({
                            ...prev,
                            b: Number(e.target.value),
                          }))
                        }
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="quad-c">Constant c</Label>
                      <Input
                        id="quad-c"
                        type="number"
                        value={quadraticCoeffs.c}
                        onChange={(e) =>
                          setQuadraticCoeffs((prev) => ({
                            ...prev,
                            c: Number(e.target.value),
                          }))
                        }
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm">
                      Equation Preview:{" "}
                      <code>
                        {quadraticCoeffs.a}x² + {quadraticCoeffs.b}x +{" "}
                        {quadraticCoeffs.c} = 0
                      </code>
                    </p>
                  </div>
                </div>
              )}

              {/* System of Equations Inputs */}
              {equationType === "system" && (
                <div className="space-y-4">
                  <h3 className="font-medium">System of Linear Equations</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>First Equation: a₁x + b₁y = c₁</Label>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        <Input
                          type="number"
                          value={systemCoeffs.a1}
                          onChange={(e) =>
                            setSystemCoeffs((prev) => ({
                              ...prev,
                              a1: Number(e.target.value),
                            }))
                          }
                          placeholder="a₁"
                        />
                        <Input
                          type="number"
                          value={systemCoeffs.b1}
                          onChange={(e) =>
                            setSystemCoeffs((prev) => ({
                              ...prev,
                              b1: Number(e.target.value),
                            }))
                          }
                          placeholder="b₁"
                        />
                        <Input
                          type="number"
                          value={systemCoeffs.c1}
                          onChange={(e) =>
                            setSystemCoeffs((prev) => ({
                              ...prev,
                              c1: Number(e.target.value),
                            }))
                          }
                          placeholder="c₁"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Second Equation: a₂x + b₂y = c₂</Label>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        <Input
                          type="number"
                          value={systemCoeffs.a2}
                          onChange={(e) =>
                            setSystemCoeffs((prev) => ({
                              ...prev,
                              a2: Number(e.target.value),
                            }))
                          }
                          placeholder="a₂"
                        />
                        <Input
                          type="number"
                          value={systemCoeffs.b2}
                          onChange={(e) =>
                            setSystemCoeffs((prev) => ({
                              ...prev,
                              b2: Number(e.target.value),
                            }))
                          }
                          placeholder="b₂"
                        />
                        <Input
                          type="number"
                          value={systemCoeffs.c2}
                          onChange={(e) =>
                            setSystemCoeffs((prev) => ({
                              ...prev,
                              c2: Number(e.target.value),
                            }))
                          }
                          placeholder="c₂"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="p-3 bg-muted rounded-lg space-y-1">
                    <p className="text-sm">System Preview:</p>
                    <code className="text-sm block">
                      {systemCoeffs.a1}x + {systemCoeffs.b1}y ={" "}
                      {systemCoeffs.c1}
                    </code>
                    <code className="text-sm block">
                      {systemCoeffs.a2}x + {systemCoeffs.b2}y ={" "}
                      {systemCoeffs.c2}
                    </code>
                  </div>
                </div>
              )}

              <Button onClick={solveEquation} className="w-full">
                <Calculator className="h-4 w-4 mr-2" />
                Solve Equation
              </Button>

              {/* Equation Results */}
              {equationResults && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5" />
                      Solution
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Display solutions based on equation type */}
                    {equationType === "linear" &&
                      equationResults.solution !== undefined && (
                        <div>
                          <h4 className="font-medium mb-2">Solution:</h4>
                          <Badge variant="secondary" className="text-lg p-2">
                            x = {Number(equationResults.solution).toFixed(4)}
                          </Badge>
                        </div>
                      )}

                    {equationType === "quadratic" &&
                      equationResults.solutions && (
                        <div>
                          <h4 className="font-medium mb-2">Solutions:</h4>
                          {equationResults.solutions.length === 0 && (
                            <Badge variant="destructive">
                              No real solutions
                            </Badge>
                          )}
                          {equationResults.solutions.length === 1 && (
                            <Badge variant="secondary" className="text-lg p-2">
                              x = {equationResults.solutions[0].toFixed(4)}{" "}
                              (double root)
                            </Badge>
                          )}
                          {equationResults.solutions.length === 2 && (
                            <div className="space-y-2">
                              <Badge
                                variant="secondary"
                                className="text-lg p-2"
                              >
                                x₁ = {equationResults.solutions[0].toFixed(4)}
                              </Badge>
                              <Badge
                                variant="secondary"
                                className="text-lg p-2"
                              >
                                x₂ = {equationResults.solutions[1].toFixed(4)}
                              </Badge>
                            </div>
                          )}
                          {equationResults.discriminant !== undefined && (
                            <div className="mt-2">
                              <span className="text-sm text-muted-foreground">
                                Discriminant:{" "}
                                {equationResults.discriminant.toFixed(4)}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                    {equationType === "system" && (
                      <div>
                        <h4 className="font-medium mb-2">Solution:</h4>
                        {equationResults.type === "unique" &&
                          equationResults.solution && (
                            <div className="space-y-2">
                              <Badge
                                variant="secondary"
                                className="text-lg p-2"
                              >
                                x = {equationResults.solution.x.toFixed(4)}
                              </Badge>
                              <Badge
                                variant="secondary"
                                className="text-lg p-2"
                              >
                                y = {equationResults.solution.y.toFixed(4)}
                              </Badge>
                            </div>
                          )}
                        {equationResults.type === "infinite" && (
                          <Badge variant="outline">
                            Infinite solutions (dependent equations)
                          </Badge>
                        )}
                        {equationResults.type === "none" && (
                          <Badge variant="destructive">
                            No solution (inconsistent equations)
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Step-by-step solution */}
                    {equationResults.steps && (
                      <div>
                        <h4 className="font-medium mb-2">
                          Step-by-step Solution:
                        </h4>
                        <div className="space-y-2">
                          {equationResults.steps.map(
                            (step: string, index: number) => (
                              <div
                                key={index}
                                className="p-2 bg-muted rounded text-sm"
                              >
                                <span className="font-medium text-primary">
                                  Step {index + 1}:
                                </span>{" "}
                                {step}
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Formula Reference Tab */}
        <TabsContent value="formulas" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Mathematical Formulas Reference
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Statistics Formulas */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">
                    Statistics
                  </h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-muted rounded-lg">
                      <h4 className="font-medium">Mean (Average)</h4>
                      <code className="text-sm">μ = Σx / n</code>
                      <p className="text-xs text-muted-foreground mt-1">
                        Sum of all values divided by count
                      </p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <h4 className="font-medium">Standard Deviation</h4>
                      <code className="text-sm">σ = √(Σ(x - μ)² / n)</code>
                      <p className="text-xs text-muted-foreground mt-1">
                        Measure of data spread
                      </p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <h4 className="font-medium">Correlation</h4>
                      <code className="text-sm">
                        r = Σ(x - x̄)(y - ȳ) / √(Σ(x - x̄)²Σ(y - ȳ)²)
                      </code>
                      <p className="text-xs text-muted-foreground mt-1">
                        Measures linear relationship strength
                      </p>
                    </div>
                  </div>
                </div>

                {/* Geometry Formulas */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">
                    Geometry
                  </h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-muted rounded-lg">
                      <h4 className="font-medium">Circle Area</h4>
                      <code className="text-sm">A = πr²</code>
                      <p className="text-xs text-muted-foreground mt-1">
                        Area of a circle with radius r
                      </p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <h4 className="font-medium">Sphere Volume</h4>
                      <code className="text-sm">V = (4/3)πr³</code>
                      <p className="text-xs text-muted-foreground mt-1">
                        Volume of a sphere with radius r
                      </p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <h4 className="font-medium">Pythagorean Theorem</h4>
                      <code className="text-sm">c² = a² + b²</code>
                      <p className="text-xs text-muted-foreground mt-1">
                        Relationship in right triangles
                      </p>
                    </div>
                  </div>
                </div>

                {/* Algebra Formulas */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">
                    Algebra
                  </h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-muted rounded-lg">
                      <h4 className="font-medium">Quadratic Formula</h4>
                      <code className="text-sm">
                        x = (-b ± √(b² - 4ac)) / 2a
                      </code>
                      <p className="text-xs text-muted-foreground mt-1">
                        Solves ax² + bx + c = 0
                      </p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <h4 className="font-medium">Slope Formula</h4>
                      <code className="text-sm">m = (y₂ - y₁) / (x₂ - x₁)</code>
                      <p className="text-xs text-muted-foreground mt-1">
                        Slope between two points
                      </p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <h4 className="font-medium">Distance Formula</h4>
                      <code className="text-sm">
                        d = √((x₂ - x₁)² + (y₂ - y₁)²)
                      </code>
                      <p className="text-xs text-muted-foreground mt-1">
                        Distance between two points
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Quick Tips</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-900 dark:text-blue-100">
                          Statistical Significance
                        </h4>
                        <p className="text-sm text-blue-700 dark:text-blue-200">
                          A correlation of 0.7 or higher indicates a strong
                          relationship between variables.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Info className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-green-900 dark:text-green-100">
                          Sample Size
                        </h4>
                        <p className="text-sm text-green-700 dark:text-green-200">
                          For reliable statistics, aim for at least 30 data
                          points when possible.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
