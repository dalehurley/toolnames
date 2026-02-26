import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Heart } from "lucide-react";
import { addDays, differenceInDays, format, startOfDay } from "date-fns";
import { DateInputs } from "./DateInputs";
import { DueDateResults } from "./DueDateResults";
import { MilestonesList } from "./MilestonesList";
import { PregnancyTimeline } from "./PregnancyTimeline";
import {
  TOTAL_DAYS,
  calculateCurrentWeek,
  calculateDueDate,
  getMilestones,
  getTrimester,
  parseInputDate,
} from "./pregnancyUtils";

export const PregnancyDueDateCalculator = () => {
  const today = startOfDay(new Date());
  const [lmpDate, setLmpDate] = useState<string>(format(today, "yyyy-MM-dd"));
  const [conceptionDate, setConceptionDate] = useState<string>("");
  const [useConceptionDate, setUseConceptionDate] = useState(false);

  const calculation = useMemo(() => {
    const baseLmp = parseInputDate(lmpDate);
    const conception = parseInputDate(conceptionDate);

    if (useConceptionDate) {
      if (!conception) {
        return { error: "Please enter a valid conception date." };
      }
      const derivedLmp = addDays(conception, -14);
      return { baseDate: derivedLmp };
    }

    if (!baseLmp) {
      return { error: "Please enter a valid LMP date." };
    }

    return { baseDate: baseLmp };
  }, [lmpDate, conceptionDate, useConceptionDate]);

  const results = useMemo(() => {
    if ("error" in calculation) {
      return null;
    }

    const baseDate = calculation.baseDate;
    if (baseDate > today) {
      return { error: "The LMP date cannot be in the future." };
    }

    const dueDate = calculateDueDate(baseDate);
    const current = calculateCurrentWeek(baseDate, today);
    if (current.daysDiff < 0) {
      return { error: "The LMP date cannot be in the future." };
    }

    const trimester = getTrimester(current.week);
    const daysRemaining = differenceInDays(dueDate, today);
    const progressPercent = Math.min(
      Math.max((current.daysDiff / TOTAL_DAYS) * 100, 0),
      100
    );

    return {
      baseDate,
      dueDate,
      currentWeek: current.week,
      currentDay: current.day,
      trimester,
      daysRemaining,
      daysElapsed: current.daysDiff,
      estimatedConceptionDate: addDays(baseDate, 14),
      milestones: getMilestones(),
      progressPercent,
    };
  }, [calculation, today]);

  const handleClear = () => {
    setLmpDate(format(today, "yyyy-MM-dd"));
    setConceptionDate("");
    setUseConceptionDate(false);
  };

  const currentError =
    "error" in calculation ? calculation.error : results && "error" in results ? results.error : null;

  return (
    <Card className="w-full max-w-5xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Heart className="h-6 w-6 text-rose-500" />
          Pregnancy Due Date Calculator
        </CardTitle>
        <CardDescription>
          Estimate your due date, track weekly progress, and view key milestones.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <DateInputs
          lmpDate={lmpDate}
          conceptionDate={conceptionDate}
          useConceptionDate={useConceptionDate}
          onLmpChange={setLmpDate}
          onConceptionChange={setConceptionDate}
          onToggleMode={setUseConceptionDate}
        />

        {currentError && (
          <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {currentError}
          </div>
        )}

        {results && !("error" in results) && (
          <>
            <DueDateResults
              dueDate={results.dueDate}
              estimatedConceptionDate={results.estimatedConceptionDate}
              currentWeek={results.currentWeek}
              currentDay={results.currentDay}
              trimester={results.trimester}
              daysRemaining={results.daysRemaining}
              daysElapsed={results.daysElapsed}
            />

            <PregnancyTimeline
              baseDate={results.baseDate}
              currentWeek={results.currentWeek}
              progressPercent={results.progressPercent}
            />

            <MilestonesList
              milestones={results.milestones}
              currentWeek={results.currentWeek}
            />
          </>
        )}

        <div className="flex flex-col sm:flex-row justify-between gap-4 pt-2">
          <Button variant="outline" onClick={handleClear}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </div>
      </CardContent>
      <CardFooter>
        <div className="w-full rounded-lg bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          All calculations run locally in your browser. Dates are never stored or shared.
        </div>
      </CardFooter>
    </Card>
  );
};
