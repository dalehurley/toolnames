import React, { useState, useEffect } from "react";
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useHabits } from "@/contexts/HabitContext";
import { formatDateString, getTodayString } from "@/utils/habitUtils";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  CheckCircle,
  XCircle,
} from "lucide-react";

const HabitCalendar: React.FC = () => {
  const { habits, entries, toggleHabitCompletion } = useHabits();
  const [selectedHabit, setSelectedHabit] = useState<string>("");
  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  useEffect(() => {
    if (
      habits.length > 0 &&
      (!selectedHabit || !habits.find((h) => h.id === selectedHabit))
    ) {
      const activeHabits = habits.filter((h) => !h.archivedAt);
      if (activeHabits.length > 0) {
        setSelectedHabit(activeHabits[0].id);
      } else if (habits.length > 0) {
        setSelectedHabit(habits[0].id);
      }
    }
  }, [habits, selectedHabit]);

  const habit = habits.find((h) => h.id === selectedHabit);
  const habitEntries = entries[selectedHabit || ""] || [];

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();

  const calendarDays: Array<{ date: Date; day: number } | null> = [];

  // Add empty cells for days before the first day of month
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }

  // Add days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({
      date: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i),
      day: i,
    });
  }

  const getCompletionStatus = (date: Date): boolean => {
    if (!selectedHabit) return false;

    const dateString = formatDateString(date);
    const entry = habitEntries.find((e) => e.date === dateString);
    return entry?.completed || false;
  };

  const handleToggleCompletion = (date: Date) => {
    if (!selectedHabit) return;

    const dateString = formatDateString(date);
    toggleHabitCompletion(selectedHabit, dateString);
  };

  const handlePreviousMonth = () => {
    setCurrentMonth((prevMonth) => {
      const newMonth = new Date(prevMonth);
      newMonth.setMonth(newMonth.getMonth() - 1);
      return newMonth;
    });
  };

  const handleNextMonth = () => {
    setCurrentMonth((prevMonth) => {
      const newMonth = new Date(prevMonth);
      newMonth.setMonth(newMonth.getMonth() + 1);
      return newMonth;
    });
  };

  const handleGoToCurrentMonth = () => {
    const today = new Date();
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
  };

  const todayString = getTodayString();
  const isCurrentMonth =
    currentMonth.getMonth() === new Date().getMonth() &&
    currentMonth.getFullYear() === new Date().getFullYear();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Habit Calendar</CardTitle>
          <CardDescription>
            Track your habits over time and visualize your progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
            <Select
              value={selectedHabit}
              onValueChange={(value) => setSelectedHabit(value)}
            >
              <SelectTrigger className="w-[240px]">
                <SelectValue placeholder="Select a habit to track" />
              </SelectTrigger>
              <SelectContent>
                {habits
                  .filter((h) => !h.archivedAt)
                  .map((habit) => (
                    <SelectItem key={habit.id} value={habit.id}>
                      {habit.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePreviousMonth}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="font-medium min-w-[140px] text-center">
                {currentMonth.toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </div>
              <Button variant="outline" size="icon" onClick={handleNextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              {!isCurrentMonth && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleGoToCurrentMonth}
                >
                  <CalendarDays className="mr-2 h-4 w-4" />
                  Today
                </Button>
              )}
            </div>
          </div>

          {!selectedHabit && (
            <div className="text-center py-12 text-muted-foreground">
              Select a habit to view its calendar
            </div>
          )}

          {selectedHabit && habit && (
            <>
              <div className="flex items-center mb-4">
                <div
                  className="w-4 h-4 rounded-full mr-2"
                  style={{ backgroundColor: habit.color }}
                />
                <span className="font-medium mr-2">{habit.name}</span>
                <Badge variant="outline">
                  {habit.frequency === "daily" && "Daily"}
                  {habit.frequency === "weekly" && "Weekdays"}
                  {habit.frequency === "custom" && "Custom days"}
                </Badge>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day) => (
                    <div key={day} className="font-medium text-sm py-1">
                      {day}
                    </div>
                  )
                )}
              </div>

              <div className="grid grid-cols-7 gap-1 min-h-[320px]">
                {calendarDays.map((dayData, i) => {
                  if (!dayData) {
                    return <div key={`empty-${i}`} className="p-1"></div>;
                  }

                  const { date, day } = dayData;
                  const dateString = formatDateString(date);
                  const isToday = dateString === todayString;
                  const isCompleted = getCompletionStatus(date);

                  return (
                    <button
                      key={dateString}
                      className={`
                        rounded-lg border p-2 flex flex-col items-center justify-center
                        transition-colors
                        ${isToday ? "border-primary" : "border-muted"}
                        ${isCompleted ? "bg-primary/10" : ""}
                        hover:bg-accent hover:text-accent-foreground
                      `}
                      onClick={() => handleToggleCompletion(date)}
                    >
                      <div
                        className={`text-sm font-medium ${
                          isToday ? "text-primary" : ""
                        }`}
                      >
                        {day}
                      </div>
                      <div className="mt-1">
                        {isCompleted ? (
                          <CheckCircle className="h-5 w-5 text-primary" />
                        ) : (
                          <div className="h-5 w-5 flex items-center justify-center">
                            {isToday && (
                              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                            )}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 flex items-center justify-end gap-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-primary mr-1" />
                  <span>Completed</span>
                </div>
                <div className="flex items-center">
                  <XCircle className="h-4 w-4 text-muted-foreground mr-1" />
                  <span>Not Completed</span>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HabitCalendar;
