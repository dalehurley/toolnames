import { addDays, format } from "date-fns";
import { Progress } from "@/components/ui/progress";

interface PregnancyTimelineProps {
  baseDate: Date;
  currentWeek: number;
  progressPercent: number;
}

const trimesterRanges = [
  { label: "Trimester 1", range: "Weeks 1-12" },
  { label: "Trimester 2", range: "Weeks 13-26" },
  { label: "Trimester 3", range: "Weeks 27-40" },
];

export const PregnancyTimeline = ({
  baseDate,
  currentWeek,
  progressPercent,
}: PregnancyTimelineProps) => {
  const weeks = Array.from({ length: 40 }, (_, index) => {
    const weekNumber = index + 1;
    const weekStart = addDays(baseDate, index * 7);
    const weekEnd = addDays(weekStart, 6);
    return { weekNumber, weekStart, weekEnd };
  });

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Pregnancy progress</span>
          <span>{Math.round(progressPercent)}%</span>
        </div>
        <Progress value={progressPercent} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {trimesterRanges.map((trimester, index) => {
          const trimesterNumber = index + 1;
          const isActive =
            currentWeek > 0 &&
            ((trimesterNumber === 1 && currentWeek <= 12) ||
              (trimesterNumber === 2 && currentWeek >= 13 && currentWeek <= 26) ||
              (trimesterNumber === 3 && currentWeek >= 27));

          return (
            <div
              key={trimester.label}
              className={`rounded-lg border p-4 ${
                isActive ? "bg-muted" : "bg-background"
              }`}
            >
              <p className="text-sm text-muted-foreground">{trimester.label}</p>
              <p className="text-lg font-semibold">{trimester.range}</p>
              {isActive && (
                <p className="text-xs text-muted-foreground mt-1">
                  You are here
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Week-by-week calendar</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-h-72 overflow-y-auto pr-2">
          {weeks.map((week) => {
            const isCurrent = week.weekNumber === currentWeek;
            return (
              <div
                key={week.weekNumber}
                className={`rounded-lg border p-3 text-sm ${
                  isCurrent ? "bg-muted" : "bg-background"
                }`}
              >
                <p className="font-medium">Week {week.weekNumber}</p>
                <p className="text-xs text-muted-foreground">
                  {format(week.weekStart, "MMM d")} -{" "}
                  {format(week.weekEnd, "MMM d")}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
