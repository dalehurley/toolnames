import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useHabits } from "@/contexts/HabitContext";
import {
  Award,
  Trophy,
  Flame,
  Target,
  Medal,
  Star,
  Calendar,
  CheckCircle2,
} from "lucide-react";

const HabitAchievements: React.FC = () => {
  const { habits, achievements } = useHabits();
  const [selectedHabit, setSelectedHabit] = React.useState<string | "all">(
    "all"
  );

  // Set first habit as default if none selected
  React.useEffect(() => {
    if (
      habits.length > 0 &&
      selectedHabit !== "all" &&
      !habits.find((h) => h.id === selectedHabit)
    ) {
      setSelectedHabit("all");
    }
  }, [habits, selectedHabit]);

  const habitAchievements =
    selectedHabit === "all"
      ? achievements
      : achievements.filter((a) => a.habitId === selectedHabit);

  const habit = habits.find((h) => h.id === selectedHabit);

  // Group achievements by type
  const streakAchievements = habitAchievements.filter(
    (a) => a.type === "streak"
  );
  const completionAchievements = habitAchievements.filter(
    (a) => a.type === "completion"
  );
  const consistencyAchievements = habitAchievements.filter(
    (a) => a.type === "consistency"
  );

  // Sort achievements by milestone (ascending)
  streakAchievements.sort((a, b) => a.milestone - b.milestone);
  completionAchievements.sort((a, b) => a.milestone - b.milestone);
  consistencyAchievements.sort((a, b) => a.milestone - b.milestone);

  // Get achievement icon based on type and milestone
  const getAchievementIcon = (type: string, milestone: number) => {
    if (type === "streak") {
      if (milestone >= 100)
        return <Trophy className="h-10 w-10 text-amber-500" />;
      if (milestone >= 30)
        return <Flame className="h-10 w-10 text-amber-500" />;
      return <Flame className="h-10 w-10 text-orange-500" />;
    }

    if (type === "completion") {
      if (milestone >= 500)
        return <Medal className="h-10 w-10 text-amber-500" />;
      if (milestone >= 100)
        return <Target className="h-10 w-10 text-emerald-500" />;
      return <CheckCircle2 className="h-10 w-10 text-blue-500" />;
    }

    if (type === "consistency") {
      if (milestone >= 90)
        return <Star className="h-10 w-10 text-purple-500" />;
      return <Calendar className="h-10 w-10 text-indigo-500" />;
    }

    return <Award className="h-10 w-10 text-blue-500" />;
  };

  // Get achievement background color class based on type and milestone
  const getAchievementBackground = (type: string, milestone: number) => {
    if (type === "streak") {
      if (milestone >= 100) return "bg-amber-50 dark:bg-amber-950/30";
      if (milestone >= 30) return "bg-amber-50 dark:bg-amber-950/30";
      return "bg-orange-50 dark:bg-orange-950/30";
    }

    if (type === "completion") {
      if (milestone >= 500) return "bg-amber-50 dark:bg-amber-950/30";
      if (milestone >= 100) return "bg-emerald-50 dark:bg-emerald-950/30";
      return "bg-blue-50 dark:bg-blue-950/30";
    }

    if (type === "consistency") {
      if (milestone >= 90) return "bg-purple-50 dark:bg-purple-950/30";
      return "bg-indigo-50 dark:bg-indigo-950/30";
    }

    return "bg-blue-50 dark:bg-blue-950/30";
  };

  // Format achievement earned date
  const formatEarnedDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Check if user has any achievements
  const hasAchievements = habitAchievements.length > 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Achievements & Milestones</CardTitle>
          <CardDescription>
            Track your progress and celebrate your achievements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
            <Select
              value={selectedHabit}
              onValueChange={(value) =>
                setSelectedHabit(value as string | "all")
              }
            >
              <SelectTrigger className="w-[240px]">
                <SelectValue placeholder="Select a habit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Habits</SelectItem>
                {habits.map((habit) => (
                  <SelectItem key={habit.id} value={habit.id}>
                    {habit.name} {habit.archivedAt && "(Archived)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedHabit && habit && (
              <div className="flex items-center">
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: habit.color }}
                />
                <span className="text-sm font-medium">{habit.name}</span>
              </div>
            )}
          </div>

          {!hasAchievements ? (
            <div className="text-center py-12">
              <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Achievements Yet</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Keep tracking your habits consistently to earn achievements and
                unlock milestones.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {streakAchievements.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-3 flex items-center">
                    <Flame className="h-5 w-5 mr-2 text-amber-500" />
                    Streak Achievements
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {streakAchievements.map((achievement) => (
                      <div
                        key={achievement.id}
                        className={`rounded-lg border p-4 flex items-center space-x-4 ${getAchievementBackground(
                          "streak",
                          achievement.milestone
                        )}`}
                      >
                        {getAchievementIcon("streak", achievement.milestone)}
                        <div>
                          <h4 className="font-medium">
                            {achievement.description}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Earned on {formatEarnedDate(achievement.earnedAt)}
                          </p>
                          <Badge variant="outline" className="mt-2">
                            {achievement.milestone} day streak
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {completionAchievements.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-3 flex items-center">
                    <CheckCircle2 className="h-5 w-5 mr-2 text-emerald-500" />
                    Completion Achievements
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {completionAchievements.map((achievement) => (
                      <div
                        key={achievement.id}
                        className={`rounded-lg border p-4 flex items-center space-x-4 ${getAchievementBackground(
                          "completion",
                          achievement.milestone
                        )}`}
                      >
                        {getAchievementIcon(
                          "completion",
                          achievement.milestone
                        )}
                        <div>
                          <h4 className="font-medium">
                            {achievement.description}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Earned on {formatEarnedDate(achievement.earnedAt)}
                          </p>
                          <Badge variant="outline" className="mt-2">
                            {achievement.milestone} completions
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {consistencyAchievements.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-3 flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-indigo-500" />
                    Consistency Achievements
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {consistencyAchievements.map((achievement) => (
                      <div
                        key={achievement.id}
                        className={`rounded-lg border p-4 flex items-center space-x-4 ${getAchievementBackground(
                          "consistency",
                          achievement.milestone
                        )}`}
                      >
                        {getAchievementIcon(
                          "consistency",
                          achievement.milestone
                        )}
                        <div>
                          <h4 className="font-medium">
                            {achievement.description}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Earned on {formatEarnedDate(achievement.earnedAt)}
                          </p>
                          <Badge variant="outline" className="mt-2">
                            {achievement.milestone}% consistency
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HabitAchievements;
