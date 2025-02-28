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
import { TrendingUp, RefreshCw, BarChart2 } from "lucide-react";

export const InvestmentCalculator = () => {
  // State for initial investment
  const [initialAmount, setInitialAmount] = useState<string>("");

  // State for regular contributions
  const [contributionAmount, setContributionAmount] = useState<string>("");
  const [contributionFrequency, setContributionFrequency] = useState<
    "monthly" | "quarterly" | "annually"
  >("monthly");

  // State for investment details
  const [interestRate, setInterestRate] = useState<string>("");
  const [compoundingFrequency, setCompoundingFrequency] = useState<
    "daily" | "monthly" | "quarterly" | "annually"
  >("annually");
  const [investmentDuration, setInvestmentDuration] = useState<string>("");

  // Results state
  const [results, setResults] = useState<{
    futureValue: number;
    totalContributions: number;
    totalInterest: number;
    annualBreakdown: Array<{
      year: number;
      principal: number;
      contributions: number;
      interest: number;
      balance: number;
    }>;
  } | null>(null);

  // Error handling
  const [errors, setErrors] = useState<{
    initialAmount?: string;
    contributionAmount?: string;
    interestRate?: string;
    investmentDuration?: string;
  }>({});

  // Handle clearing form fields
  const handleClear = () => {
    setInitialAmount("");
    setContributionAmount("");
    setContributionFrequency("monthly");
    setInterestRate("");
    setCompoundingFrequency("annually");
    setInvestmentDuration("");
    setResults(null);
    setErrors({});
  };

  // Handle input changes and calculate investment in real-time
  const handleInvestmentChange = (field: string, value: string) => {
    // Update the state for the changed field
    switch (field) {
      case "initialAmount":
        setInitialAmount(value);
        break;
      case "contributionAmount":
        setContributionAmount(value);
        break;
      case "contributionFrequency":
        setContributionFrequency(value as "monthly" | "quarterly" | "annually");
        break;
      case "interestRate":
        setInterestRate(value);
        break;
      case "compoundingFrequency":
        setCompoundingFrequency(
          value as "daily" | "monthly" | "quarterly" | "annually"
        );
        break;
      case "investmentDuration":
        setInvestmentDuration(value);
        break;
      default:
        break;
    }

    // Prepare values for calculation
    const newInitialAmount = field === "initialAmount" ? value : initialAmount;
    const newContributionAmount =
      field === "contributionAmount" ? value : contributionAmount;
    const newContributionFrequency =
      field === "contributionFrequency"
        ? (value as "monthly" | "quarterly" | "annually")
        : contributionFrequency;
    const newInterestRate = field === "interestRate" ? value : interestRate;
    const newCompoundingFrequency =
      field === "compoundingFrequency"
        ? (value as "daily" | "monthly" | "quarterly" | "annually")
        : compoundingFrequency;
    const newInvestmentDuration =
      field === "investmentDuration" ? value : investmentDuration;

    // Validate inputs
    const newErrors: typeof errors = {};

    // Validate initial amount
    if (!newInitialAmount) {
      newErrors.initialAmount = "Initial investment amount is required";
    } else if (parseFloat(newInitialAmount) < 0) {
      newErrors.initialAmount = "Initial amount cannot be negative";
    }

    // Validate contribution amount (optional)
    if (newContributionAmount && parseFloat(newContributionAmount) < 0) {
      newErrors.contributionAmount = "Contribution amount cannot be negative";
    }

    // Validate interest rate
    if (!newInterestRate) {
      newErrors.interestRate = "Annual interest rate is required";
    } else if (parseFloat(newInterestRate) < 0) {
      newErrors.interestRate = "Interest rate cannot be negative";
    }

    // Validate investment duration
    if (!newInvestmentDuration) {
      newErrors.investmentDuration = "Investment duration is required";
    } else if (parseInt(newInvestmentDuration, 10) <= 0) {
      newErrors.investmentDuration = "Duration must be greater than 0";
    } else if (parseInt(newInvestmentDuration, 10) > 100) {
      newErrors.investmentDuration = "Duration must be 100 years or less";
    }

    setErrors(newErrors);

    // If there are errors, don't calculate
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    // Convert inputs to numbers
    const principal = parseFloat(newInitialAmount) || 0;
    const annualRate = parseFloat(newInterestRate) / 100;
    const years = parseInt(newInvestmentDuration, 10);
    const contribution = parseFloat(newContributionAmount) || 0;

    // Calculate compounds per year based on frequency
    let compoundsPerYear = 1; // annually
    if (newCompoundingFrequency === "daily") compoundsPerYear = 365;
    else if (newCompoundingFrequency === "monthly") compoundsPerYear = 12;
    else if (newCompoundingFrequency === "quarterly") compoundsPerYear = 4;

    // Calculate contributions per year based on frequency
    let contributionsPerYear = 12; // monthly
    if (newContributionFrequency === "quarterly") contributionsPerYear = 4;
    else if (newContributionFrequency === "annually") contributionsPerYear = 1;

    // Calculate periodic interest rate
    const periodicRate = annualRate / compoundsPerYear;

    // Create annual breakdown
    const annualBreakdown = [];
    let balance = principal;
    let totalContributions = principal;

    for (let year = 1; year <= years; year++) {
      const startBalance = balance;
      const yearlyContribution = contribution * contributionsPerYear;
      let yearlyInterest = 0;

      // Simulate each compounding period within the year
      for (let period = 0; period < compoundsPerYear; period++) {
        // For simplicity, distribute contributions evenly across compounding periods
        const periodicContribution =
          period < contributionsPerYear
            ? contribution * (contributionsPerYear / compoundsPerYear)
            : 0;

        // Apply interest to current balance
        const interestEarned = balance * periodicRate;
        balance += interestEarned;
        yearlyInterest += interestEarned;

        // Add contribution
        balance += periodicContribution;
        totalContributions += periodicContribution;
      }

      annualBreakdown.push({
        year,
        principal: startBalance,
        contributions: yearlyContribution,
        interest: parseFloat(yearlyInterest.toFixed(2)),
        balance: parseFloat(balance.toFixed(2)),
      });
    }

    // Calculate total interest earned
    const totalInterest = balance - totalContributions;

    setResults({
      futureValue: parseFloat(balance.toFixed(2)),
      totalContributions: parseFloat(totalContributions.toFixed(2)),
      totalInterest: parseFloat(totalInterest.toFixed(2)),
      annualBreakdown,
    });
  };

  // Format currency display
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <TrendingUp className="h-6 w-6" />
          Investment Returns Calculator
        </CardTitle>
        <CardDescription>
          Calculate future value of investments with compound interest and
          regular contributions
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="initial-amount">Initial Investment</Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-muted-foreground">
                $
              </span>
              <Input
                id="initial-amount"
                type="number"
                placeholder="10000"
                value={initialAmount}
                onChange={(e) =>
                  handleInvestmentChange("initialAmount", e.target.value)
                }
                className="pl-7"
              />
            </div>
            {errors.initialAmount && (
              <p className="text-sm text-red-500">{errors.initialAmount}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="interest-rate">Annual Interest Rate (%)</Label>
            <div className="relative">
              <Input
                id="interest-rate"
                type="number"
                placeholder="7"
                step="0.01"
                value={interestRate}
                onChange={(e) =>
                  handleInvestmentChange("interestRate", e.target.value)
                }
                className="pr-7"
              />
              <span className="absolute right-3 top-2.5 text-muted-foreground">
                %
              </span>
            </div>
            {errors.interestRate && (
              <p className="text-sm text-red-500">{errors.interestRate}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="contribution-amount">
              Regular Contribution (Optional)
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-muted-foreground">
                $
              </span>
              <Input
                id="contribution-amount"
                type="number"
                placeholder="500"
                value={contributionAmount}
                onChange={(e) =>
                  handleInvestmentChange("contributionAmount", e.target.value)
                }
                className="pl-7"
              />
            </div>
            {errors.contributionAmount && (
              <p className="text-sm text-red-500">
                {errors.contributionAmount}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contribution-frequency">
              Contribution Frequency
            </Label>
            <Select
              value={contributionFrequency}
              onValueChange={(value: string) =>
                handleInvestmentChange("contributionFrequency", value)
              }
              disabled={!contributionAmount}
            >
              <SelectTrigger id="contribution-frequency">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="annually">Annually</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="compounding-frequency">Compounding Frequency</Label>
            <Select
              value={compoundingFrequency}
              onValueChange={(value: string) =>
                handleInvestmentChange("compoundingFrequency", value)
              }
            >
              <SelectTrigger id="compounding-frequency">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="annually">Annually</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="investment-duration">
              Investment Duration (Years)
            </Label>
            <Input
              id="investment-duration"
              type="number"
              placeholder="30"
              value={investmentDuration}
              onChange={(e) =>
                handleInvestmentChange("investmentDuration", e.target.value)
              }
            />
            {errors.investmentDuration && (
              <p className="text-sm text-red-500">
                {errors.investmentDuration}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between gap-4 pt-2">
          <Button variant="outline" onClick={handleClear}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Clear
          </Button>
        </div>

        {results && (
          <div className="bg-muted rounded-lg p-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-muted-foreground mb-1">
                Future Value after {investmentDuration} years
              </h3>
              <p className="text-4xl font-bold mb-2">
                {formatCurrency(results.futureValue)}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-background rounded p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">
                  Initial Investment
                </p>
                <p className="text-xl font-semibold">
                  {formatCurrency(parseFloat(initialAmount) || 0)}
                </p>
              </div>

              <div className="bg-background rounded p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">
                  Total Contributions
                </p>
                <p className="text-xl font-semibold">
                  {formatCurrency(
                    results.totalContributions - parseFloat(initialAmount)
                  )}
                </p>
              </div>

              <div className="bg-background rounded p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">
                  Total Interest
                </p>
                <p className="text-xl font-semibold">
                  {formatCurrency(results.totalInterest)}
                </p>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3 flex items-center">
                <BarChart2 className="mr-2 h-4 w-4" />
                Investment Growth
              </h4>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 font-medium">Year</th>
                      <th className="text-right py-2 font-medium">
                        Starting Balance
                      </th>
                      <th className="text-right py-2 font-medium">
                        Contributions
                      </th>
                      <th className="text-right py-2 font-medium">Interest</th>
                      <th className="text-right py-2 font-medium">
                        End Balance
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.annualBreakdown.slice(0, 10).map((year) => (
                      <tr key={year.year} className="border-b border-muted">
                        <td className="py-2">{year.year}</td>
                        <td className="text-right py-2">
                          {formatCurrency(year.principal)}
                        </td>
                        <td className="text-right py-2">
                          {formatCurrency(year.contributions)}
                        </td>
                        <td className="text-right py-2">
                          {formatCurrency(year.interest)}
                        </td>
                        <td className="text-right py-2 font-medium">
                          {formatCurrency(year.balance)}
                        </td>
                      </tr>
                    ))}
                    {results.annualBreakdown.length > 10 && (
                      <>
                        <tr>
                          <td
                            colSpan={5}
                            className="text-center py-2 text-muted-foreground"
                          >
                            ...
                          </td>
                        </tr>
                        <tr className="border-b border-muted">
                          <td className="py-2">
                            {
                              results.annualBreakdown[
                                results.annualBreakdown.length - 1
                              ].year
                            }
                          </td>
                          <td className="text-right py-2">
                            {formatCurrency(
                              results.annualBreakdown[
                                results.annualBreakdown.length - 1
                              ].principal
                            )}
                          </td>
                          <td className="text-right py-2">
                            {formatCurrency(
                              results.annualBreakdown[
                                results.annualBreakdown.length - 1
                              ].contributions
                            )}
                          </td>
                          <td className="text-right py-2">
                            {formatCurrency(
                              results.annualBreakdown[
                                results.annualBreakdown.length - 1
                              ].interest
                            )}
                          </td>
                          <td className="text-right py-2 font-medium">
                            {formatCurrency(
                              results.annualBreakdown[
                                results.annualBreakdown.length - 1
                              ].balance
                            )}
                          </td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col space-y-4">
        <div className="bg-muted p-4 rounded-lg w-full">
          <h3 className="font-semibold mb-2">About This Calculator</h3>
          <p className="text-sm text-muted-foreground">
            This calculator helps you estimate the future value of your
            investments, accounting for:
          </p>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-4 mt-2">
            <li>Initial investment amount</li>
            <li>Regular contributions (monthly, quarterly, or annual)</li>
            <li>Compound interest at your specified rate and frequency</li>
            <li>Investment timeframe in years</li>
          </ul>
          <p className="text-sm text-muted-foreground mt-2">
            <strong>Note:</strong> This calculator provides estimates based on
            constant returns. Actual investment returns will vary over time and
            may be affected by taxes, fees, and market fluctuations.
          </p>
        </div>
      </CardFooter>
    </Card>
  );
};

export default InvestmentCalculator;
