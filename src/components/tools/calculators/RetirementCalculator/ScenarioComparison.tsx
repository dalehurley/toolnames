import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus } from "lucide-react";
import {
  RetirementScenario,
  formatCurrency,
  formatPercentage,
} from "./retirementUtils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ScenarioComparisonProps {
  scenarios: RetirementScenario[];
  onAddScenario: () => void;
  onRemoveScenario: (id: string) => void;
  maxScenarios?: number;
}

export function ScenarioComparison({
  scenarios,
  onAddScenario,
  onRemoveScenario,
  maxScenarios = 3,
}: ScenarioComparisonProps) {
  if (scenarios.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              No scenarios saved yet. Configure your retirement plan and save it
              to compare different scenarios.
            </p>
            <Button
              onClick={onAddScenario}
              disabled={scenarios.length >= maxScenarios}
            >
              <Plus className="w-4 h-4 mr-2" />
              Save Current Scenario
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getBestScenario = () => {
    return scenarios.reduce((best, current) => {
      if (
        current.results.totalSavings > best.results.totalSavings &&
        current.results.isSufficient
      ) {
        return current;
      }
      return best;
    }, scenarios[0]);
  };

  const bestScenario = getBestScenario();

  return (
    <div className="space-y-6">
      {/* Add Scenario Button */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Saved Scenarios</h3>
          <p className="text-sm text-muted-foreground">
            Compare up to {maxScenarios} retirement scenarios
          </p>
        </div>
        <Button
          onClick={onAddScenario}
          disabled={scenarios.length >= maxScenarios}
        >
          <Plus className="w-4 h-4 mr-2" />
          Save Current Scenario
        </Button>
      </div>

      {/* Best Scenario Alert */}
      {scenarios.length > 1 && (
        <Alert className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
          <AlertDescription className="text-green-800 dark:text-green-200">
            <strong>{bestScenario.name}</strong> provides the highest retirement
            savings: {formatCurrency(bestScenario.results.totalSavings)}
          </AlertDescription>
        </Alert>
      )}

      {/* Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>Scenario Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Metric</TableHead>
                  {scenarios.map((scenario) => (
                    <TableHead key={scenario.id} className="text-center">
                      <div className="flex flex-col items-center gap-2">
                        <span className="font-semibold">{scenario.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemoveScenario(scenario.id)}
                          className="h-6 w-6 p-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Basic Info */}
                <TableRow className="bg-muted/50">
                  <TableCell
                    className="font-medium"
                    colSpan={scenarios.length + 1}
                  >
                    Basic Information
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Current Age</TableCell>
                  {scenarios.map((scenario) => (
                    <TableCell key={scenario.id} className="text-center">
                      {scenario.inputs.currentAge}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell>Retirement Age</TableCell>
                  {scenarios.map((scenario) => (
                    <TableCell key={scenario.id} className="text-center">
                      {scenario.inputs.retirementAge}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell>Years to Retirement</TableCell>
                  {scenarios.map((scenario) => (
                    <TableCell
                      key={scenario.id}
                      className="text-center font-medium"
                    >
                      {scenario.results.yearsToRetirement}
                    </TableCell>
                  ))}
                </TableRow>

                {/* Savings & Contributions */}
                <TableRow className="bg-muted/50">
                  <TableCell
                    className="font-medium"
                    colSpan={scenarios.length + 1}
                  >
                    Savings & Contributions
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Current Savings</TableCell>
                  {scenarios.map((scenario) => (
                    <TableCell key={scenario.id} className="text-center">
                      {formatCurrency(scenario.inputs.currentSavings)}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell>Monthly Contribution</TableCell>
                  {scenarios.map((scenario) => (
                    <TableCell key={scenario.id} className="text-center">
                      {formatCurrency(scenario.inputs.monthlyContribution)}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell>Employer Match</TableCell>
                  {scenarios.map((scenario) => (
                    <TableCell key={scenario.id} className="text-center">
                      {scenario.inputs.employerMatch ? (
                        <Badge variant="secondary">
                          {scenario.inputs.employerMatchPercentage}%
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">None</span>
                      )}
                    </TableCell>
                  ))}
                </TableRow>

                {/* Investment Returns */}
                <TableRow className="bg-muted/50">
                  <TableCell
                    className="font-medium"
                    colSpan={scenarios.length + 1}
                  >
                    Investment Returns
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Annual Return</TableCell>
                  {scenarios.map((scenario) => (
                    <TableCell key={scenario.id} className="text-center">
                      {formatPercentage(scenario.inputs.annualReturn)}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell>Inflation Rate</TableCell>
                  {scenarios.map((scenario) => (
                    <TableCell key={scenario.id} className="text-center">
                      {formatPercentage(scenario.inputs.inflationRate)}
                    </TableCell>
                  ))}
                </TableRow>

                {/* Results */}
                <TableRow className="bg-muted/50">
                  <TableCell
                    className="font-medium"
                    colSpan={scenarios.length + 1}
                  >
                    Projected Results
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-semibold">
                    Total Retirement Savings
                  </TableCell>
                  {scenarios.map((scenario) => (
                    <TableCell
                      key={scenario.id}
                      className={`text-center font-semibold ${
                        scenario.id === bestScenario.id
                          ? "text-green-600 dark:text-green-400"
                          : ""
                      }`}
                    >
                      {formatCurrency(scenario.results.totalSavings)}
                      {scenario.id === bestScenario.id && (
                        <Badge className="ml-2 bg-green-500">Best</Badge>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell>Annual Withdrawal</TableCell>
                  {scenarios.map((scenario) => (
                    <TableCell key={scenario.id} className="text-center">
                      {formatCurrency(scenario.results.annualWithdrawal)}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell>Monthly Income</TableCell>
                  {scenarios.map((scenario) => (
                    <TableCell key={scenario.id} className="text-center">
                      {formatCurrency(scenario.results.monthlyWithdrawal)}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell>Desired Income</TableCell>
                  {scenarios.map((scenario) => (
                    <TableCell key={scenario.id} className="text-center">
                      {formatCurrency(scenario.inputs.desiredIncome)}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell>Status</TableCell>
                  {scenarios.map((scenario) => (
                    <TableCell key={scenario.id} className="text-center">
                      {scenario.results.isSufficient ? (
                        <Badge className="bg-green-500">On Track</Badge>
                      ) : (
                        <Badge variant="destructive">
                          Shortfall:{" "}
                          {formatCurrency(scenario.results.shortfall || 0)}
                        </Badge>
                      )}
                    </TableCell>
                  ))}
                </TableRow>

                {/* Breakdown */}
                <TableRow className="bg-muted/50">
                  <TableCell
                    className="font-medium"
                    colSpan={scenarios.length + 1}
                  >
                    Contribution Breakdown
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Your Contributions</TableCell>
                  {scenarios.map((scenario) => (
                    <TableCell key={scenario.id} className="text-center">
                      {formatCurrency(
                        scenario.results.contributionBreakdown
                          .totalContributions,
                      )}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell>Employer Contributions</TableCell>
                  {scenarios.map((scenario) => (
                    <TableCell key={scenario.id} className="text-center">
                      {formatCurrency(
                        scenario.results.contributionBreakdown
                          .employerContributions,
                      )}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell>Investment Growth</TableCell>
                  {scenarios.map((scenario) => (
                    <TableCell
                      key={scenario.id}
                      className="text-center text-blue-600"
                    >
                      {formatCurrency(
                        scenario.results.contributionBreakdown.totalGrowth,
                      )}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell>Years Money Lasts</TableCell>
                  {scenarios.map((scenario) => (
                    <TableCell key={scenario.id} className="text-center">
                      {scenario.results.yearsOfRetirement === 30
                        ? "30+ years"
                        : `${scenario.results.yearsOfRetirement} years`}
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
