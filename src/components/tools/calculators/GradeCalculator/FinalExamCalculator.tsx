import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  calculateRequiredFinalScore,
  getLetterGrade,
  getGradeColor,
} from "./gradeUtils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

export const FinalExamCalculator = () => {
  const [currentGrade, setCurrentGrade] = useState<number>(85);
  const [currentWeight, setCurrentWeight] = useState<number>(70);
  const [desiredGrade, setDesiredGrade] = useState<number>(90);
  const [finalWeight, setFinalWeight] = useState<number>(30);

  const requiredScore = useMemo(() => {
    return calculateRequiredFinalScore(
      currentGrade,
      currentWeight,
      desiredGrade,
      finalWeight,
    );
  }, [currentGrade, currentWeight, desiredGrade, finalWeight]);

  const isAchievable = requiredScore <= 100;
  const isEasy = requiredScore <= 60;
  const requiredLetterGrade = getLetterGrade(requiredScore);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Final Exam Calculator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="current-grade">Current Grade (%)</Label>
              <Input
                id="current-grade"
                type="number"
                value={currentGrade}
                onChange={(e) =>
                  setCurrentGrade(parseFloat(e.target.value) || 0)
                }
                min={0}
                max={100}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Your grade before the final exam
              </p>
            </div>

            <div>
              <Label htmlFor="current-weight">Current Work Weight (%)</Label>
              <Input
                id="current-weight"
                type="number"
                value={currentWeight}
                onChange={(e) =>
                  setCurrentWeight(parseFloat(e.target.value) || 0)
                }
                min={0}
                max={100}
              />
              <p className="text-sm text-muted-foreground mt-1">
                How much your current work counts toward final grade
              </p>
            </div>

            <div>
              <Label htmlFor="desired-grade">Desired Final Grade (%)</Label>
              <Input
                id="desired-grade"
                type="number"
                value={desiredGrade}
                onChange={(e) =>
                  setDesiredGrade(parseFloat(e.target.value) || 0)
                }
                min={0}
                max={100}
              />
              <p className="text-sm text-muted-foreground mt-1">
                The grade you want to achieve in the course
              </p>
            </div>

            <div>
              <Label htmlFor="final-weight">Final Exam Weight (%)</Label>
              <Input
                id="final-weight"
                type="number"
                value={finalWeight}
                onChange={(e) =>
                  setFinalWeight(parseFloat(e.target.value) || 0)
                }
                min={0}
                max={100}
              />
              <p className="text-sm text-muted-foreground mt-1">
                How much the final exam counts toward final grade
              </p>
            </div>
          </div>

          {currentWeight + finalWeight !== 100 && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Note: Current weight ({currentWeight}%) + Final weight (
                {finalWeight}%) = {currentWeight + finalWeight}%. Typically
                these should sum to 100%.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="text-sm text-muted-foreground mb-2">
              Required Final Exam Score
            </div>
            <div
              className={`text-6xl font-bold ${getGradeColor(requiredScore)}`}
            >
              {requiredScore.toFixed(2)}%
            </div>
            <div
              className={`text-3xl font-semibold mt-2 ${getGradeColor(requiredScore)}`}
            >
              {requiredLetterGrade}
            </div>

            <div className="mt-6 space-y-2">
              {!isAchievable && (
                <Alert className="border-red-500">
                  <AlertDescription className="text-red-600">
                    ⚠️ This goal is not achievable. You would need to score more
                    than 100% on the final exam.
                  </AlertDescription>
                </Alert>
              )}

              {isAchievable && isEasy && (
                <Alert className="border-green-500">
                  <AlertDescription className="text-green-600">
                    ✓ Great news! You only need {requiredScore.toFixed(1)}% on
                    the final to achieve your goal.
                  </AlertDescription>
                </Alert>
              )}

              {isAchievable && !isEasy && requiredScore > 90 && (
                <Alert className="border-amber-500">
                  <AlertDescription className="text-amber-600">
                    You'll need a strong performance ({requiredScore.toFixed(1)}
                    %) on the final to reach your goal.
                  </AlertDescription>
                </Alert>
              )}

              {isAchievable && requiredScore >= 60 && requiredScore <= 90 && (
                <Alert className="border-blue-500">
                  <AlertDescription className="text-blue-600">
                    You need {requiredScore.toFixed(1)}% on the final exam to
                    achieve your desired grade.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-3">Scenario Analysis</h4>
            <div className="space-y-2 text-sm">
              {[100, 95, 90, 85, 80, 75, 70].map((score) => {
                const finalGrade =
                  currentGrade * (currentWeight / 100) +
                  score * (finalWeight / 100);
                return (
                  <div key={score} className="flex justify-between">
                    <span>If you score {score}% on final:</span>
                    <span
                      className={`font-semibold ${getGradeColor(finalGrade)}`}
                    >
                      {finalGrade.toFixed(1)}% ({getLetterGrade(finalGrade)})
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
