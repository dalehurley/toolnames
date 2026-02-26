import { Card, CardContent } from "@/components/ui/card";
import { Assignment, getLetterGrade, getGradeColor } from "./gradeUtils";

interface GradeResultsProps {
  weightedGrade: number;
  assignments: Assignment[];
}

export const GradeResults = ({
  weightedGrade,
  assignments,
}: GradeResultsProps) => {
  const totalWeight = assignments.reduce((sum, a) => sum + a.weight, 0);
  const letterGrade = getLetterGrade(weightedGrade);
  const gradeColor = getGradeColor(weightedGrade);

  // Group assignments by category
  const categoryBreakdown = assignments.reduce(
    (acc, assignment) => {
      const category = assignment.category || "Uncategorized";
      if (!acc[category]) {
        acc[category] = { totalWeight: 0, weightedScore: 0 };
      }
      const percentage = (assignment.score / assignment.maxScore) * 100;
      acc[category].totalWeight += assignment.weight;
      acc[category].weightedScore += percentage * assignment.weight;
      return acc;
    },
    {} as Record<string, { totalWeight: number; weightedScore: number }>,
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="text-sm text-muted-foreground mb-2">
              Your Current Grade
            </div>
            <div className={`text-6xl font-bold ${gradeColor}`}>
              {weightedGrade.toFixed(2)}%
            </div>
            <div className={`text-3xl font-semibold mt-2 ${gradeColor}`}>
              {letterGrade}
            </div>
            {totalWeight < 100 && (
              <div className="mt-4 text-sm text-amber-600">
                ⚠️ Total weight is {totalWeight.toFixed(1)}%. You may want to
                add more assignments.
              </div>
            )}
            {totalWeight > 100 && (
              <div className="mt-4 text-sm text-red-600">
                ⚠️ Total weight exceeds 100% ({totalWeight.toFixed(1)}%)
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {assignments.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Grade Breakdown</h3>
            <div className="space-y-3">
              {assignments.map((assignment, index) => {
                const percentage =
                  (assignment.score / assignment.maxScore) * 100;
                const contribution =
                  (percentage * assignment.weight) / totalWeight;
                return (
                  <div key={index} className="border-b pb-3">
                    <div className="flex justify-between items-center mb-1">
                      <div>
                        <span className="font-medium">{assignment.name}</span>
                        {assignment.category && (
                          <span className="text-sm text-muted-foreground ml-2">
                            ({assignment.category})
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          {assignment.score}/{assignment.maxScore}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {percentage.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <div>Weight: {assignment.weight}%</div>
                      <div>Contribution: {contribution.toFixed(2)}%</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {Object.keys(categoryBreakdown).length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Category Performance</h3>
            <div className="space-y-3">
              {Object.entries(categoryBreakdown).map(([category, data]) => {
                const categoryAverage = data.weightedScore / data.totalWeight;
                return (
                  <div key={category} className="border-b pb-3">
                    <div className="flex justify-between items-center">
                      <div className="font-medium">{category}</div>
                      <div className="text-right">
                        <div
                          className={`font-semibold ${getGradeColor(categoryAverage)}`}
                        >
                          {categoryAverage.toFixed(2)}%
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Weight: {data.totalWeight}%
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
