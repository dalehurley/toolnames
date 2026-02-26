import React, { useState } from "react";
import { useHabits } from "@/contexts/HabitContext";
import { getTodayString } from "@/utils/habitUtils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  MoreHorizontal,
  Edit,
  Archive,
  Trash,
  Plus,
  ChevronUp,
  ChevronDown,
  Flame,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import HabitForm from "./HabitForm";

interface HabitListProps {
  onAddHabit: () => void;
}

const HabitList: React.FC<HabitListProps> = ({ onAddHabit }) => {
  const {
    habits,
    entries,
    statistics,
    toggleHabitCompletion,
    archiveHabit,
    deleteHabit,
    updateHabit,
  } = useHabits();

  const [editingHabit, setEditingHabit] = useState<string | null>(null);
  const [deleteConfirmHabit, setDeleteConfirmHabit] = useState<string | null>(
    null
  );
  const [filterArchived, setFilterArchived] = useState(false);
  const [sortBy, setSortBy] = useState<"name" | "category" | "streak">("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const todayString = getTodayString();

  // Filter active or archived habits
  const filteredHabits = habits.filter((habit) => {
    if (filterArchived) {
      return habit.archivedAt !== undefined;
    } else {
      return habit.archivedAt === undefined;
    }
  });

  // Sort habits
  const sortedHabits = [...filteredHabits].sort((a, b) => {
    if (sortBy === "name") {
      return sortDirection === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    } else if (sortBy === "category") {
      return sortDirection === "asc"
        ? a.category.localeCompare(b.category)
        : b.category.localeCompare(a.category);
    } else if (sortBy === "streak") {
      const streakA = statistics[a.id]?.currentStreak || 0;
      const streakB = statistics[b.id]?.currentStreak || 0;
      return sortDirection === "asc" ? streakA - streakB : streakB - streakA;
    }
    return 0;
  });

  const getHabitCompletionStatus = (habitId: string) => {
    const habitEntries = entries[habitId] || [];
    const todayEntry = habitEntries.find((entry) => entry.date === todayString);
    return todayEntry?.completed || false;
  };

  const handleSort = (newSortBy: "name" | "category" | "streak") => {
    if (sortBy === newSortBy) {
      // Toggle direction if same sort field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Set new sort field and reset direction to ascending
      setSortBy(newSortBy);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: "name" | "category" | "streak") => {
    if (sortBy === field) {
      return sortDirection === "asc" ? (
        <ChevronUp className="h-4 w-4" />
      ) : (
        <ChevronDown className="h-4 w-4" />
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilterArchived(!filterArchived)}
          >
            {filterArchived ? "Show Active Habits" : "Show Archived Habits"}
          </Button>

          <div className="flex items-center gap-2 ml-4">
            <span className="text-sm text-muted-foreground">Sort by:</span>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1"
              onClick={() => handleSort("name")}
            >
              Name {getSortIcon("name")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1"
              onClick={() => handleSort("category")}
            >
              Category {getSortIcon("category")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1"
              onClick={() => handleSort("streak")}
            >
              Streak {getSortIcon("streak")}
            </Button>
          </div>
        </div>

        {!filterArchived && (
          <Button onClick={onAddHabit}>
            <Plus className="h-4 w-4 mr-2" /> Add Habit
          </Button>
        )}
      </div>

      {sortedHabits.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            {filterArchived
              ? "You don't have any archived habits yet."
              : "You don't have any habits to track yet. Add your first habit to get started!"}
          </p>
          {!filterArchived && (
            <Button onClick={onAddHabit}>
              <Plus className="h-4 w-4 mr-2" /> Add Your First Habit
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {sortedHabits.map((habit) => {
            const isCompleted = getHabitCompletionStatus(habit.id);
            const habitStats = statistics[habit.id];

            return (
              <Card
                key={habit.id}
                className={`overflow-hidden transition-all duration-200 ${
                  habit.archivedAt ? "opacity-70" : ""
                }`}
                style={{ borderTopColor: habit.color, borderTopWidth: "4px" }}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{habit.name}</CardTitle>
                      <CardDescription>{habit.description}</CardDescription>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-5 w-5" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {!habit.archivedAt && (
                          <>
                            <DropdownMenuItem
                              onClick={() => setEditingHabit(habit.id)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => archiveHabit(habit.id)}
                            >
                              <Archive className="mr-2 h-4 w-4" />
                              Archive
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setDeleteConfirmHabit(habit.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="outline">{habit.category}</Badge>
                    <Badge variant="outline">
                      {habit.frequency === "daily" && "Daily"}
                      {habit.frequency === "weekly" && "Weekdays"}
                      {habit.frequency === "custom" && "Custom days"}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center">
                      <Flame className="h-5 w-5 mr-1 text-amber-500" />
                      <span className="font-semibold">
                        {habitStats?.currentStreak || 0}
                      </span>
                      <span className="text-muted-foreground ml-1 text-sm">
                        day streak
                      </span>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      Best: {habitStats?.longestStreak || 0} days
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="border-t pt-4">
                  {!habit.archivedAt && (
                    <div className="flex w-full justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={`habit-${habit.id}`}
                          checked={isCompleted}
                          onCheckedChange={() =>
                            toggleHabitCompletion(habit.id, todayString)
                          }
                          className="h-5 w-5"
                        />
                        <label
                          htmlFor={`habit-${habit.id}`}
                          className="text-sm font-medium cursor-pointer"
                        >
                          Mark as completed today
                        </label>
                      </div>

                      <span className="text-xs text-muted-foreground">
                        {isCompleted ? "Completed" : "Not completed"} today
                      </span>
                    </div>
                  )}

                  {habit.archivedAt && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() =>
                        updateHabit(habit.id, { archivedAt: undefined })
                      }
                    >
                      Unarchive
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {editingHabit && (
        <HabitForm
          habit={habits.find((h) => h.id === editingHabit)}
          onClose={() => setEditingHabit(null)}
          onSave={() => setEditingHabit(null)}
        />
      )}

      <AlertDialog
        open={!!deleteConfirmHabit}
        onOpenChange={() => setDeleteConfirmHabit(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this habit and all its tracking data.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteConfirmHabit) {
                  deleteHabit(deleteConfirmHabit);
                  setDeleteConfirmHabit(null);
                }
              }}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default HabitList;
