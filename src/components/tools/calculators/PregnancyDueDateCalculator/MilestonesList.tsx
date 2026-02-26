import { Badge } from "@/components/ui/badge";
import { Milestone } from "./pregnancyUtils";

interface MilestonesListProps {
  milestones: Milestone[];
  currentWeek: number;
}

export const MilestonesList = ({
  milestones,
  currentWeek,
}: MilestonesListProps) => {
  const reached = milestones.filter((milestone) => milestone.week <= currentWeek);
  const upcoming = milestones.filter((milestone) => milestone.week > currentWeek);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="bg-background border rounded-lg p-4 space-y-3">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">Reached milestones</h3>
          <Badge variant="secondary">{reached.length}</Badge>
        </div>
        <div className="space-y-3">
          {reached.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No milestones reached yet.
            </p>
          )}
          {reached.map((milestone) => (
            <div key={milestone.week}>
              <p className="text-sm font-medium">
                Week {milestone.week}: {milestone.event}
              </p>
              <p className="text-xs text-muted-foreground">
                {milestone.detail}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-background border rounded-lg p-4 space-y-3">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">Upcoming milestones</h3>
          <Badge variant="outline">{upcoming.length}</Badge>
        </div>
        <div className="space-y-3">
          {upcoming.length === 0 && (
            <p className="text-sm text-muted-foreground">
              You are at full term.
            </p>
          )}
          {upcoming.slice(0, 4).map((milestone) => (
            <div key={milestone.week}>
              <p className="text-sm font-medium">
                Week {milestone.week}: {milestone.event}
              </p>
              <p className="text-xs text-muted-foreground">
                {milestone.detail}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
