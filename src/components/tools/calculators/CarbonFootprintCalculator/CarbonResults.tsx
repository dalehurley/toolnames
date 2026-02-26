import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CarbonResults } from "./carbonUtils";
import { Leaf, TrendingUp, TrendingDown } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CarbonResultsProps {
  results: CarbonResults;
}

export const CarbonResultsDisplay: React.FC<CarbonResultsProps> = ({
  results,
}) => {
  const formatEmissions = (tonnes: number) => tonnes.toFixed(2);
  const formatPercentage = (percent: number) => percent.toFixed(1);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "transportation":
        return "text-blue-600 dark:text-blue-400";
      case "energy":
        return "text-yellow-600 dark:text-yellow-400";
      case "food":
        return "text-green-600 dark:text-green-400";
      case "shopping":
        return "text-purple-600 dark:text-purple-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  const getComparisonIcon = (percentage: number) => {
    if (percentage > 0) return <TrendingUp className="h-4 w-4 text-red-500" />;
    return <TrendingDown className="h-4 w-4 text-green-500" />;
  };

  const getComparisonText = (percentage: number) => {
    const abs = Math.abs(percentage);
    const direction = percentage > 0 ? "above" : "below";
    return `${formatPercentage(abs)}% ${direction} average`;
  };

  return (
    <div className="space-y-6">
      {/* Total Emissions */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Leaf className="h-6 w-6 text-green-600" />
            Your Carbon Footprint
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-5xl font-bold text-green-700 dark:text-green-400">
              {formatEmissions(results.totalEmissions)}
            </div>
            <div className="text-lg text-muted-foreground mt-2">
              tonnes CO₂ per year
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Emissions by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(results.categoryBreakdown).map(
              ([category, emissions]) => {
                const percentage =
                  results.percentages[
                    category as keyof typeof results.percentages
                  ];
                const emissionsTonnes = emissions / 1000;

                return (
                  <div key={category}>
                    <div className="flex justify-between items-center mb-2">
                      <span
                        className={`font-medium capitalize ${getCategoryColor(category)}`}
                      >
                        {category}
                      </span>
                      <div className="text-right">
                        <div className="font-semibold">
                          {formatEmissions(emissionsTonnes)} tonnes
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatPercentage(percentage)}%
                        </div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all duration-300 ${
                          category === "transportation"
                            ? "bg-blue-500"
                            : category === "energy"
                              ? "bg-yellow-500"
                              : category === "food"
                                ? "bg-green-500"
                                : "bg-purple-500"
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              },
            )}
          </div>
        </CardContent>
      </Card>

      {/* Comparison to Averages */}
      <Card>
        <CardHeader>
          <CardTitle>Comparison to Averages</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">National Average (USA)</div>
                <div className="text-sm text-muted-foreground">
                  {formatEmissions(results.comparison.nationalAverage)} tonnes
                  CO₂/year
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getComparisonIcon(results.comparison.vsNational)}
                <span className="font-semibold">
                  {getComparisonText(results.comparison.vsNational)}
                </span>
              </div>
            </div>
          </Alert>

          <Alert>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Global Average</div>
                <div className="text-sm text-muted-foreground">
                  {formatEmissions(results.comparison.globalAverage)} tonnes
                  CO₂/year
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getComparisonIcon(results.comparison.vsGlobal)}
                <span className="font-semibold">
                  {getComparisonText(results.comparison.vsGlobal)}
                </span>
              </div>
            </div>
          </Alert>

          {results.totalEmissions < results.comparison.nationalAverage && (
            <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
              <Leaf className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                Great job! Your carbon footprint is below the national average.
                Keep up the good work!
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
