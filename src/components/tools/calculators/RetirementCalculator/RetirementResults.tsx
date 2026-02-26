import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Wallet,
  Calendar,
  DollarSign,
} from "lucide-react";
import { RetirementResults as RetirementResultsType } from "./retirementUtils";
import { formatCurrency } from "./retirementUtils";

interface RetirementResultsProps {
  results: RetirementResultsType;
  inputs: {
    desiredIncome: number;
    includeSocialSecurity: boolean;
    socialSecurityAmount?: number;
  };
}

export function RetirementResults({ results, inputs }: RetirementResultsProps) {
  const totalIncome = inputs.includeSocialSecurity
    ? results.annualWithdrawal + (inputs.socialSecurityAmount || 0)
    : results.annualWithdrawal;

  const getStatusBadge = () => {
    if (results.isSufficient) {
      return (
        <Badge className="bg-green-500 hover:bg-green-600">
          <CheckCircle2 className="w-4 h-4 mr-1" />
          On Track
        </Badge>
      );
    }

    const percentageOfGoal = (totalIncome / inputs.desiredIncome) * 100;
    if (percentageOfGoal >= 80) {
      return (
        <Badge className="bg-yellow-500 hover:bg-yellow-600">
          <AlertCircle className="w-4 h-4 mr-1" />
          Close
        </Badge>
      );
    }

    return (
      <Badge variant="destructive">
        <AlertCircle className="w-4 h-4 mr-1" />
        Shortfall
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Status Alert */}
      {!results.isSufficient ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Your projected retirement income falls short by{" "}
            <strong>{formatCurrency(results.shortfall || 0)}/year</strong>.
            Consider increasing contributions or adjusting your retirement age.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            Your retirement plan meets your income goals! You're on track for a
            comfortable retirement.
          </AlertDescription>
        </Alert>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Total Savings at Retirement */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              Projected Retirement Savings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {formatCurrency(results.totalSavings)}
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              At age {results.yearsToRetirement + 18}
            </div>
          </CardContent>
        </Card>

        {/* Annual Withdrawal */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Annual Retirement Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {formatCurrency(totalIncome)}
            </div>
            <div className="mt-2 flex items-center gap-2">
              {getStatusBadge()}
              <span className="text-sm text-muted-foreground">
                {((totalIncome / inputs.desiredIncome) * 100).toFixed(0)}% of
                goal
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Years to Retirement */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Years Until Retirement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {results.yearsToRetirement}
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              Retiring in {new Date().getFullYear() + results.yearsToRetirement}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Income */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Monthly Retirement Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {formatCurrency(totalIncome / 12)}
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              {formatCurrency(results.monthlyWithdrawal)} from savings
              {inputs.includeSocialSecurity && (
                <>
                  {" "}
                  + {formatCurrency((inputs.socialSecurityAmount || 0) / 12)} SS
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Savings Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-sm text-muted-foreground">
                Your Contributions
              </span>
              <span className="font-semibold">
                {formatCurrency(
                  results.contributionBreakdown.totalContributions,
                )}
              </span>
            </div>

            {results.contributionBreakdown.employerContributions > 0 && (
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-sm text-muted-foreground">
                  Employer Match
                </span>
                <span className="font-semibold text-green-600">
                  {formatCurrency(
                    results.contributionBreakdown.employerContributions,
                  )}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-sm text-muted-foreground">
                Investment Growth
              </span>
              <span className="font-semibold text-blue-600">
                {formatCurrency(results.contributionBreakdown.totalGrowth)}
              </span>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="font-semibold">Total at Retirement</span>
              <span className="text-xl font-bold text-primary">
                {formatCurrency(results.totalSavings)}
              </span>
            </div>
          </div>

          <div className="pt-4 border-t space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Return on Investment
              </span>
              <span className="font-medium">
                {(
                  (results.contributionBreakdown.totalGrowth /
                    (results.contributionBreakdown.totalContributions +
                      results.contributionBreakdown.employerContributions)) *
                  100
                ).toFixed(1)}
                %
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Years Money Will Last
              </span>
              <span className="font-medium">
                {results.yearsOfRetirement === 30
                  ? "30+ years"
                  : `${results.yearsOfRetirement} years`}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Income Sources */}
      {inputs.includeSocialSecurity && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Retirement Income Sources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Portfolio Withdrawals</span>
              <div className="text-right">
                <div className="font-semibold">
                  {formatCurrency(results.annualWithdrawal)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {((results.annualWithdrawal / totalIncome) * 100).toFixed(0)}%
                  of total
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Social Security Benefits</span>
              <div className="text-right">
                <div className="font-semibold">
                  {formatCurrency(inputs.socialSecurityAmount || 0)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {(
                    ((inputs.socialSecurityAmount || 0) / totalIncome) *
                    100
                  ).toFixed(0)}
                  % of total
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center pt-3 border-t">
              <span className="font-semibold">Total Annual Income</span>
              <span className="text-xl font-bold text-primary">
                {formatCurrency(totalIncome)}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {!results.isSufficient && (
        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800">
          <CardHeader>
            <CardTitle className="text-lg">Recommendations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm">
              To reach your retirement income goal, consider:
            </p>
            <ul className="space-y-2 text-sm list-disc list-inside">
              <li>
                Increase monthly contributions by approximately{" "}
                {formatCurrency(
                  (results.shortfall || 0) / results.yearsToRetirement / 12,
                )}
              </li>
              <li>Delay retirement by 2-3 years to allow more time to save</li>
              <li>
                Adjust your target retirement income to{" "}
                {formatCurrency(totalIncome)}
              </li>
              <li>
                Explore higher-yield investment options (with appropriate risk
                consideration)
              </li>
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
