import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useHabits } from "@/contexts/HabitContext";
import {
  Habit,
  DEFAULT_HABIT_CATEGORIES,
  DEFAULT_HABIT_COLORS,
} from "@/types/habit";
import { Check, AlertCircle } from "lucide-react";

interface HabitFormProps {
  habit?: Habit;
  onClose: () => void;
  onSave: () => void;
}

const HabitForm: React.FC<HabitFormProps> = ({ habit, onClose, onSave }) => {
  const { addHabit, updateHabit } = useHabits();
  const [formError, setFormError] = useState<string | null>(null);

  // Default values or existing habit values
  const [name, setName] = useState(habit?.name || "");
  const [description, setDescription] = useState(habit?.description || "");
  const [category, setCategory] = useState(
    habit?.category || DEFAULT_HABIT_CATEGORIES[0]
  );
  const [color, setColor] = useState(habit?.color || DEFAULT_HABIT_COLORS[0]);
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "custom">(
    habit?.frequency || "daily"
  );
  const [customDays, setCustomDays] = useState<number[]>(
    habit?.customDays || []
  );

  const daysOfWeek = [
    { value: 0, label: "Sunday" },
    { value: 1, label: "Monday" },
    { value: 2, label: "Tuesday" },
    { value: 3, label: "Wednesday" },
    { value: 4, label: "Thursday" },
    { value: 5, label: "Friday" },
    { value: 6, label: "Saturday" },
  ];

  const handleSave = () => {
    // Validate form
    if (!name.trim()) {
      setFormError("Habit name is required");
      return;
    }

    // Make sure customDays is set if frequency is custom
    if (frequency === "custom" && customDays.length === 0) {
      setFormError("Please select at least one day of the week");
      return;
    }

    const habitData = {
      name,
      description,
      category,
      color,
      frequency,
      customDays: frequency === "custom" ? customDays : undefined,
    };

    if (habit) {
      // Update existing habit
      updateHabit(habit.id, habitData);
    } else {
      // Create new habit
      addHabit(habitData);
    }

    onSave();
  };

  const toggleCustomDay = (dayValue: number) => {
    setCustomDays((prev) => {
      if (prev.includes(dayValue)) {
        return prev.filter((day) => day !== dayValue);
      } else {
        return [...prev, dayValue].sort();
      }
    });
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{habit ? "Edit Habit" : "Add New Habit"}</DialogTitle>
          <DialogDescription>
            {habit
              ? "Update your habit details below"
              : "Create a new habit to track. Fill in the details below."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {formError && (
            <div className="flex items-center p-3 text-sm rounded-md bg-destructive/10 text-destructive">
              <AlertCircle className="h-4 w-4 mr-2" />
              {formError}
            </div>
          )}

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              placeholder="Meditation, Reading, Exercise..."
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
              placeholder="Optional description of your habit"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Category
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category" className="col-span-3">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {DEFAULT_HABIT_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Color</Label>
            <div className="col-span-3 flex flex-wrap gap-2">
              {DEFAULT_HABIT_COLORS.map((colorOption) => (
                <button
                  key={colorOption}
                  type="button"
                  onClick={() => setColor(colorOption)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    color === colorOption
                      ? "ring-2 ring-offset-2 ring-primary"
                      : ""
                  }`}
                  style={{ backgroundColor: colorOption }}
                >
                  {color === colorOption && (
                    <Check className="h-4 w-4 text-white" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="frequency" className="text-right">
              Frequency
            </Label>
            <Select
              value={frequency}
              onValueChange={(value: "daily" | "weekly" | "custom") =>
                setFrequency(value)
              }
            >
              <SelectTrigger id="frequency" className="col-span-3">
                <SelectValue placeholder="How often?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekdays (Mon-Fri)</SelectItem>
                <SelectItem value="custom">Custom days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {frequency === "custom" && (
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">Days</Label>
              <div className="col-span-3 grid grid-cols-2 gap-2">
                {daysOfWeek.map((day) => (
                  <div key={day.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`day-${day.value}`}
                      checked={customDays.includes(day.value)}
                      onCheckedChange={() => toggleCustomDay(day.value)}
                    />
                    <Label htmlFor={`day-${day.value}`}>{day.label}</Label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {habit ? "Update Habit" : "Create Habit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default HabitForm;
