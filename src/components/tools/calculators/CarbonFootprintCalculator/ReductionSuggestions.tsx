import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReductionSuggestion } from "./carbonUtils";
import { Lightbulb, TrendingDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ReductionSuggestionsProps {
  suggestions: ReductionSuggestion[];
}

export const ReductionSuggestions: React.FC<ReductionSuggestionsProps> = ({
  suggestions,
}) => {
  const formatImpact = (kg: number) => {
    if (kg >= 1000) {
      return `${(kg / 1000).toFixed(2)} tonnes`;
    }
    return `${kg.toFixed(0)} kg`;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "transportation":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "energy":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "food":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "shopping":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  if (suggestions.length === 0) {
    return (
      <Card className="bg-green-50 dark:bg-green-950">
        <CardContent className="pt-6">
          <div className="text-center">
            <Lightbulb className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
              Excellent Carbon Footprint!
            </h3>
            <p className="text-green-700 dark:text-green-300">
              Your carbon footprint is already quite low. Keep maintaining these
              sustainable habits!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-600" />
          Reduction Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="border rounded-lg p-4 hover:border-green-500 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-lg">{suggestion.title}</h4>
                <Badge className={getCategoryColor(suggestion.category)}>
                  {suggestion.category}
                </Badge>
              </div>
              <p className="text-muted-foreground mb-3">
                {suggestion.description}
              </p>
              <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-medium">
                <TrendingDown className="h-4 w-4" />
                <span>Save {formatImpact(suggestion.impact)} CO₂/year</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
          <h4 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">
            Total Potential Reduction
          </h4>
          <p className="text-blue-800 dark:text-blue-200">
            By implementing all suggestions, you could save approximately{" "}
            <span className="font-bold">
              {formatImpact(suggestions.reduce((sum, s) => sum + s.impact, 0))}
            </span>{" "}
            of CO₂ per year.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
