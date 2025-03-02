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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { RefreshCw, Target, DollarSign, ArrowRight } from "lucide-react";

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

type GoalType = "emergency" | "retirement" | "house" | "education" | "custom";

interface GoalPreset {
  name: string;
  description: string;
  defaultAmount: number;
  defaultTimeframe: number;
  defaultInterestRate: number;
  defaultStartingAmount: number;
  contributionFrequency: string;
  icon: React.ReactNode;
}

// Preset goals data
const GOAL_PRESETS: Record<GoalType, GoalPreset> = {
  emergency: {
    name: "Emergency Fund",
    description: "Build an emergency fund to cover 3-6 months of expenses",
    defaultAmount: 10000,
    defaultTimeframe: 12,
    defaultInterestRate: 2,
    defaultStartingAmount: 1000,
    contributionFrequency: "monthly",
    icon: <span className="text-amber-500">💰</span>,
  },
  retirement: {
    name: "Retirement",
    description: "Save for a comfortable retirement",
    defaultAmount: 1000000,
    defaultTimeframe: 360,
    defaultInterestRate: 7,
    defaultStartingAmount: 10000,
    contributionFrequency: "monthly",
    icon: <span className="text-emerald-500">🏝️</span>,
  },
  house: {
    name: "Home Down Payment",
    description: "Save for a down payment on a house",
    defaultAmount: 60000,
    defaultTimeframe: 60,
    defaultInterestRate: 3,
    defaultStartingAmount: 5000,
    contributionFrequency: "monthly",
    icon: <span className="text-blue-500">🏠</span>,
  },
  education: {
    name: "Education",
    description: "Save for college or other educational expenses",
    defaultAmount: 50000,
    defaultTimeframe: 120,
    defaultInterestRate: 5,
    defaultStartingAmount: 2000,
    contributionFrequency: "monthly",
    icon: <span className="text-indigo-500">🎓</span>,
  },
  custom: {
    name: "Custom Goal",
    description: "Define your own financial goal",
    defaultAmount: 25000,
    defaultTimeframe: 36,
    defaultInterestRate: 4,
    defaultStartingAmount: 2500,
    contributionFrequency: "monthly",
    icon: <span className="text-purple-500">🎯</span>,
  },
};

export const FinancialGoalCalculator = () => {
  // State for form inputs
  const [goalType, setGoalType] = useState<GoalType>("custom");
  const [goalName, setGoalName] = useState<string>("Custom Goal");
  const [targetAmount, setTargetAmount] = useState<string>("25000");
  const [timeframe, setTimeframe] = useState<string>("36");
  const [timeframeUnit, setTimeframeUnit] = useState<string>("months");
  const [interestRate, setInterestRate] = useState<string>("4");
  const [startingAmount, setStartingAmount] = useState<string>("2500");
  const [contributionFrequency, setContributionFrequency] =
    useState<string>("monthly");
  const [extraContributions, setExtraContributions] = useState<string>("");

  // Results state
  const [results, setResults] = useState<{
    requiredContribution: number;
    totalContributions: number;
    interestEarned: number;
    milestones: Array<{
      period: number;
      balance: number;
      contributions: number;
      interest: number;
    }>;
  } | null>(null);

  // Handle preset goal selection
  const handleGoalTypeChange = (type: GoalType) => {
    const preset = GOAL_PRESETS[type];
    setGoalType(type);
    setGoalName(preset.name);
    setTargetAmount(preset.defaultAmount.toString());
    setTimeframe(preset.defaultTimeframe.toString());
    setTimeframeUnit(type === "retirement" ? "months" : "months");
    setInterestRate(preset.defaultInterestRate.toString());
    setStartingAmount(preset.defaultStartingAmount.toString());
    setContributionFrequency(preset.contributionFrequency);
    setExtraContributions("");
    setResults(null);
  };

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format currency with decimals
  const formatCurrencyWithDecimals = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Clear form
  const handleClear = () => {
    handleGoalTypeChange("custom");
  };

  // Convert timeframe to number of periods based on contribution frequency
  const getNumberOfPeriods = (): number => {
    const monthsInTimeframe =
      timeframeUnit === "years"
        ? parseInt(timeframe) * 12
        : parseInt(timeframe);

    switch (contributionFrequency) {
      case "weekly":
        return monthsInTimeframe * 4.33; // Approximate weeks in a month
      case "biweekly":
        return monthsInTimeframe * 2.17; // Approximate bi-weekly periods in a month
      case "monthly":
        return monthsInTimeframe;
      case "quarterly":
        return monthsInTimeframe / 3;
      case "annually":
        return monthsInTimeframe / 12;
      default:
        return monthsInTimeframe;
    }
  };

  // Get period name based on contribution frequency
  const getPeriodName = (plural: boolean = true): string => {
    switch (contributionFrequency) {
      case "weekly":
        return plural ? "weeks" : "week";
      case "biweekly":
        return plural ? "biweekly periods" : "biweekly period";
      case "monthly":
        return plural ? "months" : "month";
      case "quarterly":
        return plural ? "quarters" : "quarter";
      case "annually":
        return plural ? "years" : "year";
      default:
        return plural ? "periods" : "period";
    }
  };

  // Convert annual interest rate to rate per period
  const getInterestRatePerPeriod = (): number => {
    const annualRate = parseFloat(interestRate) / 100;

    switch (contributionFrequency) {
      case "weekly":
        return Math.pow(1 + annualRate, 1 / 52) - 1;
      case "biweekly":
        return Math.pow(1 + annualRate, 1 / 26) - 1;
      case "monthly":
        return Math.pow(1 + annualRate, 1 / 12) - 1;
      case "quarterly":
        return Math.pow(1 + annualRate, 1 / 4) - 1;
      case "annually":
        return annualRate;
      default:
        return Math.pow(1 + annualRate, 1 / 12) - 1;
    }
  };

  // Calculate required contribution
  const calculateRequiredContribution = () => {
    const goal = parseFloat(targetAmount) || 0;
    const initial = parseFloat(startingAmount) || 0;
    const extra = parseFloat(extraContributions) || 0;
    const periods = getNumberOfPeriods();
    const ratePerPeriod = getInterestRatePerPeriod();

    // Handle edge cases
    if (goal <= initial) {
      alert("Your starting amount is already equal to or more than your goal!");
      return;
    }

    if (periods <= 0) {
      alert("Please enter a valid timeframe.");
      return;
    }

    let requiredContribution = 0;
    let milestones = [];

    // If we have interest, use the standard formula for future value of series of payments
    if (ratePerPeriod > 0) {
      // PMT = (FV - PV*(1+r)^n) / (((1+r)^n - 1)/r)
      const futureValueOfInitial =
        initial * Math.pow(1 + ratePerPeriod, periods);
      const seriesFactor =
        (Math.pow(1 + ratePerPeriod, periods) - 1) / ratePerPeriod;

      if (extra > 0) {
        // If there are extra contributions, adjust the target amount
        const futureValueOfExtra = extra * seriesFactor;
        requiredContribution =
          (goal - futureValueOfInitial - futureValueOfExtra) / seriesFactor;
      } else {
        requiredContribution = (goal - futureValueOfInitial) / seriesFactor;
      }
    } else {
      // If no interest, simple division
      requiredContribution = (goal - initial - extra * periods) / periods;
    }

    // Generate milestone data
    let currentBalance = initial;
    let totalContributions = initial;
    let totalInterest = 0;

    const trackingPeriods = Math.min(periods, 240); // Cap at 240 periods for display
    const milestoneInterval = Math.max(1, Math.floor(trackingPeriods / 20)); // Show about 20 milestones

    milestones.push({
      period: 0,
      balance: currentBalance,
      contributions: initial,
      interest: 0,
    });

    for (let i = 1; i <= trackingPeriods; i++) {
      const interestEarned = currentBalance * ratePerPeriod;
      currentBalance += interestEarned + requiredContribution + (extra || 0);
      totalContributions += requiredContribution + (extra || 0);
      totalInterest += interestEarned;

      if (i % milestoneInterval === 0 || i === trackingPeriods) {
        milestones.push({
          period: i,
          balance: currentBalance,
          contributions: totalContributions,
          interest: totalInterest,
        });
      }
    }

    setResults({
      requiredContribution: Math.max(0, requiredContribution),
      totalContributions: totalContributions,
      interestEarned: totalInterest,
      milestones: milestones,
    });
  };

  // Chart data
  const chartData = results
    ? {
        labels: results.milestones.map((m) => m.period.toString()),
        datasets: [
          {
            label: "Total Balance",
            data: results.milestones.map((m) => m.balance),
            borderColor: "rgb(99, 102, 241)",
            backgroundColor: "rgba(99, 102, 241, 0.2)",
            fill: true,
          },
          {
            label: "Total Contributions",
            data: results.milestones.map((m) => m.contributions),
            borderColor: "rgb(34, 197, 94)",
            backgroundColor: "rgba(34, 197, 94, 0.1)",
            fill: true,
          },
        ],
      }
    : null;

  // Chart options - use a more permissive type to avoid TypeScript errors
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed.y !== null) {
              label += formatCurrency(context.parsed.y);
            }
            return label;
          },
        },
      },
    },
    scales: {
      y: {
        ticks: {
          callback: function (value: any) {
            return formatCurrency(value);
          },
        },
      },
      x: {
        title: {
          display: true,
          text: getPeriodName(true),
        },
      },
    },
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Target className="h-6 w-6" />
          Financial Goal Calculator
        </CardTitle>
        <CardDescription>
          Plan how much to save to reach your financial goals on time
        </CardDescription>
      </CardHeader>

      <Tabs defaultValue="calculator">
        <div className="px-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="calculator">Calculator</TabsTrigger>
            <TabsTrigger value="chart" disabled={!results}>
              Results Chart
            </TabsTrigger>
          </TabsList>
        </div>

        <CardContent className="pt-6">
          <TabsContent value="calculator" className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {(Object.keys(GOAL_PRESETS) as GoalType[]).map((type) => (
                <div
                  key={type}
                  className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                    goalType === type
                      ? "border-primary bg-primary/10"
                      : "hover:border-primary/50"
                  }`}
                  onClick={() => handleGoalTypeChange(type)}
                >
                  <div className="flex items-center gap-2">
                    <div className="text-xl">{GOAL_PRESETS[type].icon}</div>
                    <h3 className="font-medium">{GOAL_PRESETS[type].name}</h3>
                  </div>
                  <p className="text-muted-foreground text-xs mt-1">
                    {GOAL_PRESETS[type].description}
                  </p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="goal-name">Goal Name</Label>
                  <Input
                    id="goal-name"
                    value={goalName}
                    onChange={(e) => setGoalName(e.target.value)}
                    placeholder="My Financial Goal"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="target-amount">Target Amount</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="target-amount"
                      type="number"
                      value={targetAmount}
                      onChange={(e) => setTargetAmount(e.target.value)}
                      className="pl-8"
                      placeholder="10000"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="starting-amount">Starting Amount</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="starting-amount"
                      type="number"
                      value={startingAmount}
                      onChange={(e) => setStartingAmount(e.target.value)}
                      className="pl-8"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="timeframe">Timeframe</Label>
                    <Input
                      id="timeframe"
                      type="number"
                      value={timeframe}
                      onChange={(e) => setTimeframe(e.target.value)}
                      placeholder="36"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timeframe-unit">Unit</Label>
                    <Select
                      value={timeframeUnit}
                      onValueChange={setTimeframeUnit}
                    >
                      <SelectTrigger id="timeframe-unit">
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="months">Months</SelectItem>
                        <SelectItem value="years">Years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="interest-rate">
                    Annual Interest Rate (%)
                  </Label>
                  <div className="relative">
                    <Input
                      id="interest-rate"
                      type="number"
                      value={interestRate}
                      onChange={(e) => setInterestRate(e.target.value)}
                      className="pr-8"
                      placeholder="5"
                      step="0.1"
                    />
                    <span className="absolute right-2 top-2.5 text-muted-foreground">
                      %
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Expected annual return on your savings or investments
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contribution-frequency">
                    Contribution Frequency
                  </Label>
                  <Select
                    value={contributionFrequency}
                    onValueChange={setContributionFrequency}
                  >
                    <SelectTrigger id="contribution-frequency">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="biweekly">Biweekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="annually">Annually</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Optional extra contributions */}
            <div className="space-y-2 pt-2">
              <Label htmlFor="extra-contribution">
                Additional {contributionFrequency} Contribution (Optional)
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="extra-contribution"
                  type="number"
                  value={extraContributions}
                  onChange={(e) => setExtraContributions(e.target.value)}
                  className="pl-8"
                  placeholder="0"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                An additional fixed amount you plan to contribute each period
                (not calculated as part of the minimum required contribution)
              </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-between gap-4 pt-4">
              <Button variant="outline" onClick={handleClear}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Reset
              </Button>
              <Button onClick={calculateRequiredContribution}>
                Calculate Required Savings
              </Button>
            </div>

            {results && (
              <div className="pt-6">
                <div className="bg-muted rounded-lg p-6">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold text-muted-foreground mb-1">
                      Required{" "}
                      {contributionFrequency.charAt(0).toUpperCase() +
                        contributionFrequency.slice(1)}{" "}
                      Contribution
                    </h3>
                    <p className="text-4xl font-bold mb-2">
                      {formatCurrencyWithDecimals(results.requiredContribution)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {extraContributions && parseFloat(extraContributions) > 0
                        ? `Plus your additional ${formatCurrencyWithDecimals(
                            parseFloat(extraContributions)
                          )} each ${getPeriodName(false)}`
                        : `To reach your goal of ${formatCurrency(
                            parseFloat(targetAmount)
                          )} in ${timeframe} ${timeframeUnit}`}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-background rounded-lg p-4 text-center">
                      <p className="text-sm text-muted-foreground mb-1">
                        Total Amount
                      </p>
                      <p className="text-xl font-semibold">
                        {formatCurrency(
                          results.milestones[results.milestones.length - 1]
                            .balance
                        )}
                      </p>
                    </div>

                    <div className="bg-background rounded-lg p-4 text-center">
                      <p className="text-sm text-muted-foreground mb-1">
                        Total Contributions
                      </p>
                      <p className="text-xl font-semibold">
                        {formatCurrency(results.totalContributions)}
                      </p>
                    </div>

                    <div className="bg-background rounded-lg p-4 text-center">
                      <p className="text-sm text-muted-foreground mb-1">
                        Interest Earned
                      </p>
                      <p className="text-xl font-semibold">
                        {formatCurrency(results.interestEarned)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Growth chart container - chart displayed in chart tab */}
                <div className="pt-4">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      const element = document.querySelector('[value="chart"]');
                      if (element instanceof HTMLElement) {
                        element.click();
                      }
                    }}
                  >
                    <ArrowRight className="mr-2 h-4 w-4" />
                    View Savings Growth Chart
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="chart" className="space-y-6">
            {results && (
              <>
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-4">
                    {goalName}: Savings Growth Over Time
                  </h3>
                  <div className="h-80">
                    {chartData && (
                      <Line options={chartOptions} data={chartData} />
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-medium">Milestones</h3>
                  <div className="border rounded-lg overflow-auto max-h-64">
                    <table className="min-w-full divide-y divide-border">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            {getPeriodName(true)}
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Balance
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Contribution
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Interest
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-background divide-y divide-border">
                        {results.milestones.map((milestone) => (
                          <tr key={milestone.period}>
                            <td className="px-4 py-2 whitespace-nowrap text-sm">
                              {milestone.period}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                              {formatCurrency(milestone.balance)}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm">
                              {formatCurrency(milestone.contributions)}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm">
                              {formatCurrency(milestone.interest)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <Button
                  onClick={() => {
                    const element = document.querySelector(
                      '[value="calculator"]'
                    );
                    if (element instanceof HTMLElement) {
                      element.click();
                    }
                  }}
                >
                  Back to Calculator
                </Button>
              </>
            )}
          </TabsContent>
        </CardContent>
      </Tabs>

      <CardFooter className="flex flex-col space-y-4">
        <div className="bg-muted p-4 rounded-lg w-full">
          <h3 className="font-semibold mb-2">How This Calculator Works</h3>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              This calculator uses the time value of money formula to determine
              how much you need to save regularly to reach your financial goal.
              It factors in your starting amount, timeframe, and expected
              interest rate.
            </p>
            <p>
              <strong>Tip:</strong> For retirement planning, consider using a
              longer timeframe and more conservative interest rates. For
              shorter-term goals like an emergency fund, use lower interest
              rates that reflect savings accounts or short-term investments.
            </p>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default FinancialGoalCalculator;
