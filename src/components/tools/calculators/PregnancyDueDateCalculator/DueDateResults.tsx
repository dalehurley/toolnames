import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface DueDateResultsProps {
  dueDate: Date;
  estimatedConceptionDate: Date;
  currentWeek: number;
  currentDay: number;
  trimester: number;
  daysRemaining: number;
  daysElapsed: number;
}

const trimesterDetails = {
  1: {
    label: "First trimester",
    range: "Weeks 1-12",
    development: "Rapid organ development and early growth.",
    symptoms: "Fatigue, nausea, breast tenderness.",
  },
  2: {
    label: "Second trimester",
    range: "Weeks 13-26",
    development: "Baby grows quickly, movements become noticeable.",
    symptoms: "Energy returns, belly growth, feeling movement.",
  },
  3: {
    label: "Third trimester",
    range: "Weeks 27-40",
    development: "Weight gain and organ maturation.",
    symptoms: "Shortness of breath, nesting, sleep changes.",
  },
};

export const DueDateResults = ({
  dueDate,
  estimatedConceptionDate,
  currentWeek,
  currentDay,
  trimester,
  daysRemaining,
  daysElapsed,
}: DueDateResultsProps) => {
  const trimesterInfo = trimesterDetails[trimester as 1 | 2 | 3];

  return (
    <div className="space-y-6">
      <div className="bg-muted rounded-lg p-6 text-center">
        <p className="text-sm text-muted-foreground mb-2">
          Estimated due date
        </p>
        <p className="text-3xl font-semibold mb-1">
          {format(dueDate, "MMMM d, yyyy")}
        </p>
        <p className="text-sm text-muted-foreground">
          {daysRemaining} days remaining
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-background border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Current week</p>
          <p className="text-2xl font-semibold">
            {currentWeek === 0 ? "Not started" : `Week ${currentWeek}`}
          </p>
          {currentWeek > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              Day {currentDay} of this week
            </p>
          )}
        </div>
        <div className="bg-background border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Trimester</p>
          <p className="text-2xl font-semibold">{trimesterInfo.label}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {trimesterInfo.range}
          </p>
        </div>
        <div className="bg-background border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Days completed</p>
          <p className="text-2xl font-semibold">{daysElapsed} days</p>
          <p className="text-xs text-muted-foreground mt-1">
            Since estimated LMP
          </p>
        </div>
      </div>

      <div className="bg-background border rounded-lg p-4 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{trimesterInfo.label}</Badge>
          <Badge variant="secondary">Development snapshot</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {trimesterInfo.development}
        </p>
        <p className="text-sm text-muted-foreground">
          Common symptoms: {trimesterInfo.symptoms}
        </p>
        <p className="text-sm text-muted-foreground">
          Estimated conception date:{" "}
          {format(estimatedConceptionDate, "MMMM d, yyyy")}
        </p>
      </div>
    </div>
  );
};
