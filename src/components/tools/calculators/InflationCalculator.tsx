import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { RefreshCw, TrendingUp, DollarSign } from "lucide-react";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Pre-defined inflation rates
const INFLATION_PRESETS = {
  conservative: 2,
  moderate: 3,
  aggressive: 4,
  historical: 3.22, // Average US inflation rate over the past century
  custom: 0,
};

// Historical inflation data by decade (average per decade)
const HISTORICAL_INFLATION = {
  "1950s": 2.2,
  "1960s": 2.5,
  "1970s": 7.1,
  "1980s": 5.6,
  "1990s": 3.0,
  "2000s": 2.6,
  "2010s": 1.8,
  "Recent (2020+)": 4.9,
};

export const InflationCalculator = () => {
  // Form state
  const [startAmount, setStartAmount] = useState<string>("1000");
  const [startYear, setStartYear] = useState<string>(new Date().getFullYear().toString());
  const [years, setYears] = useState<string>("10");
  const [inflationRate, setInflationRate] = useState<string>("3");
  const [inflationPreset, setInflationPreset] = useState<string>("moderate");

  // Results state
  const [results, setResults] = useState<{
    startAmount: number;
    endAmount: number;
    startYear: number;
    endYear: number;
    percentageChange: number;
    yearlyBreakdown: Array<{ year: number; amount: number }>;
  } | null>(null);

  // Update inflation rate when preset changes
  const handlePresetChange = (preset: string) => {
    setInflationPreset(preset);
    if (preset !== "custom") {
      setInflationRate(INFLATION_PRESETS[preset as keyof typeof INFLATION_PRESETS].toString());
    }
  };

  // Handle custom inflation rate
  const handleInflationRateChange = (value: string) => {
    setInflationRate(value);
    setInflationPreset("custom");
  };

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Format percentage
  const formatPercentage = (value: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "percent",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value / 100);
  };

  // Handle clear
  const handleClear = () => {
    setStartAmount("1000");
    setStartYear(new Date().getFullYear().toString());
    setYears("10");
    setInflationRate("3");
    setInflationPreset("moderate");
    setResults(null);
  };

  // Calculate inflation effect
  const calculateInflation = () => {
    const amount = parseFloat(startAmount) || 0;
    const start = parseInt(startYear) || new Date().getFullYear();
    const duration = parseInt(years) || 10;
    const rate = parseFloat(inflationRate) || 3;

    if (amount <= 0 || duration <= 0 || rate < 0) {
      alert("Please enter valid values. Amount and years must be positive.");
      return;
    }

    const yearlyBreakdown = [];
    let currentAmount = amount;

    for (let i = 0; i <= duration; i++) {
      yearlyBreakdown.push({
        year: start + i,
        amount: currentAmount,
      });

      currentAmount = currentAmount * (1 + rate / 100);
    }

    // The final value is actually the value after the last full year
    const endAmount = yearlyBreakdown[duration].amount;
    const percentageChange = ((endAmount - amount) / amount) * 100;

    setResults({
      startAmount: amount,
      endAmount,
      startYear: start,
      endYear: start + duration,
      percentageChange,
      yearlyBreakdown,
    });
  };

  // Prepare chart data if results exist
  const chartData = results
    ? {
        labels: results.yearlyBreakdown.map((item) => item.year.toString()),
        datasets: [
          {
            label: "Value Over Time",
            data: results.yearlyBreakdown.map((item) => item.amount),
            borderColor: "rgb(53, 162, 235)",
            backgroundColor: "rgba(53, 162, 235, 0.5)",
            tension: 0.1,
          },
        ],
      }
    : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Inflation Impact Over Time",
      },
    },
    scales: {
      y: {
        ticks: {
          callback: function (value: number | string) {
            if (typeof value === "number") {
              return formatCurrency(value);
            }
            return value;
          },
        },
      },
    },
  };

  // Calculate purchasing power values for display
  const getPurchasingPowerExamples = (startAmount: number, endAmount: number) => {
    const ratio = startAmount / endAmount;
    
    return [
      { item: "Coffee", startPrice: 5, endPrice: 5 / ratio },
      { item: "Movie Ticket", startPrice: 15, endPrice: 15 / ratio },
      { item: "Restaurant Meal", startPrice: 50, endPrice: 50 / ratio },
      { item: "Groceries (weekly)", startPrice: 200, endPrice: 200 / ratio },
    ];
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <TrendingUp className="h-6 w-6" />
          Inflation Calculator
        </CardTitle>
        <CardDescription>
          Calculate how inflation affects purchasing power over time and see the future value of money
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="start-amount">Current Amount</Label>
              <div className="relative">
                <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="start-amount"
                  type="number"
                  placeholder="1000"
                  value={startAmount}
                  onChange={(e) => setStartAmount(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="start-year">Starting Year</Label>
              <Input
                id="start-year"
                type="number"
                placeholder={new Date().getFullYear().toString()}
                value={startYear}
                onChange={(e) => setStartYear(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="years">Number of Years</Label>
              <Input
                id="years"
                type="number"
                placeholder="10"
                value={years}
                onChange={(e) => setYears(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="inflation-preset">Inflation Rate Preset</Label>
              <Select 
                value={inflationPreset}
                onValueChange={handlePresetChange}
              >
                <SelectTrigger id="inflation-preset">
                  <SelectValue placeholder="Select an inflation rate" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="conservative">Conservative (2%)</SelectItem>
                  <SelectItem value="moderate">Moderate (3%)</SelectItem>
                  <SelectItem value="aggressive">Aggressive (4%)</SelectItem>
                  <SelectItem value="historical">Historical Average (3.22%)</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="inflation-rate">Annual Inflation Rate (%)</Label>
              <div className="relative">
                <Input
                  id="inflation-rate"
                  type="number"
                  step="0.1"
                  value={inflationRate}
                  onChange={(e) => handleInflationRateChange(e.target.value)}
                  className="pr-6"
                />
                <span className="absolute right-2 top-2.5 text-muted-foreground">%</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Enter your expected annual inflation rate
              </p>
            </div>

            <div className="pt-4">
              <Button onClick={calculateInflation}>
                Calculate Inflation Impact
              </Button>
            </div>
          </div>
        </div>

        {/* Historical inflation rates info */}
        <div className="bg-muted p-4 rounded-lg text-sm">
          <h3 className="font-medium mb-2">Historical Average Inflation Rates by Decade</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {Object.entries(HISTORICAL_INFLATION).map(([decade, rate]) => (
              <div key={decade} className="border-l pl-2">
                <span className="font-medium">{decade}:</span> {rate}%
              </div>
            ))}
          </div>
        </div>

        {/* Results Display */}
        {results && (
          <div className="pt-4 space-y-6">
            <div className="bg-muted rounded-lg p-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-muted-foreground mb-1">
                  Inflation Impact Summary
                </h3>
                <p className="text-4xl font-bold mb-2">
                  {formatCurrency(results.endAmount)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(results.startAmount)} in {results.startYear} will be worth {formatCurrency(results.endAmount)} in {results.endYear}
                  <br />
                  That's a {formatPercentage(results.percentageChange)} decrease in purchasing power
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-background rounded-lg p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-1">Original Value</p>
                  <p className="text-xl font-semibold">
                    {formatCurrency(results.startAmount)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    In {results.startYear}
                  </p>
                </div>

                <div className="bg-background rounded-lg p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-1">
                    Future Value
                  </p>
                  <p className="text-xl font-semibold">
                    {formatCurrency(results.endAmount)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    In {results.endYear}
                  </p>
                </div>

                <div className="bg-background rounded-lg p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-1">Value Change</p>
                  <p className="text-xl font-semibold text-destructive">
                    {formatPercentage(results.percentageChange)} less buying power
                  </p>
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="bg-card border rounded-lg p-4">
              <h3 className="font-medium mb-4">Value Over Time</h3>
              <div className="h-64">
                {chartData && <Line options={chartOptions} data={chartData} />}
              </div>
            </div>

            {/* Purchasing power examples */}
            <div className="space-y-3">
              <h3 className="font-medium">Purchasing Power Examples</h3>
              <p className="text-sm text-muted-foreground">
                Here's what common items might cost in {results.endYear} compared to {results.startYear}:
              </p>
              
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Price in {results.startYear}</TableHead>
                      <TableHead>Equivalent Price in {results.endYear}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getPurchasingPowerExamples(results.startAmount, results.endAmount).map(
                      (example) => (
                        <TableRow key={example.item}>
                          <TableCell>{example.item}</TableCell>
                          <TableCell>{formatCurrency(example.startPrice)}</TableCell>
                          <TableCell>{formatCurrency(example.endPrice)}</TableCell>
                        </TableRow>
                      )
                    )}
                  </TableBody>
                </Table>
              </div>

              <p className="text-sm text-muted-foreground mt-2">
                This table shows how the same items will cost more in the future due to inflation.
              </p>
            </div>

            {/* Year by year breakdown */}
            <div className="space-y-3">
              <h3 className="font-medium">Year by Year Breakdown</h3>
              
              <div className="border rounded-md overflow-auto max-h-64">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Year</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Cumulative Change</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.yearlyBreakdown.map((row) => {
                      const changePercent = ((row.amount - results.startAmount) / results.startAmount) * 100;
                      return (
                        <TableRow key={row.year}>
                          <TableCell>{row.year}</TableCell>
                          <TableCell>{formatCurrency(row.amount)}</TableCell>
                          <TableCell>
                            {row.year === results.startYear
                              ? "-"
                              : `${formatPercentage(changePercent)} change`}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-start pt-4">
          <Button variant="outline" onClick={handleClear}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Clear
          </Button>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col space-y-4">
        <div className="bg-muted p-4 rounded-lg w-full">
          <h3 className="font-semibold mb-2">About Inflation</h3>
          <p className="text-sm text-muted-foreground">
            Inflation is the rate at which the general level of prices for goods and services rises, eroding purchasing power. This calculator uses the compound interest formula to calculate how inflation affects the value of money over time.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            For long-term financial planning, accounting for inflation is crucial. Even moderate inflation rates can significantly reduce purchasing power over decades, which is why investments should aim to outpace inflation to preserve wealth.
          </p>
        </div>
      </CardFooter>
    </Card>
  );
};

export default InflationCalculator;