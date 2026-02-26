import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { Category, TimeBlock } from "@/contexts/TimeBlockingContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
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
import { Calendar } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import {
  Clock,
  Calendar as CalendarIcon,
  Trash2,
  BatteryMedium,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatTimeString } from "@/utils/timeUtils";

interface BlockEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  block: TimeBlock | null;
  categories: Category[];
  onSubmit: (block: TimeBlock | Omit<TimeBlock, "id">) => void;
  onDelete?: () => void;
}

const getTimesArray = () => {
  const times = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const h = hour.toString().padStart(2, "0");
      const m = minute.toString().padStart(2, "0");
      times.push(`${h}:${m}`);
    }
  }
  return times;
};

const BlockEditorDialog: React.FC<BlockEditorDialogProps> = ({
  open,
  onOpenChange,
  block,
  categories,
  onSubmit,
  onDelete,
}) => {
  const [formData, setFormData] = useState<Partial<TimeBlock>>({
    title: "",
    description: "",
    startTime: new Date(),
    endTime: new Date(),
    categoryId: "",
    energyLevel: 3,
    isCompleted: false,
    isRecurring: false,
  });

  const times = getTimesArray();

  // Initialize form data when block changes
  useEffect(() => {
    if (block) {
      setFormData({
        ...block,
      });
    }
  }, [block]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.title ||
      !formData.startTime ||
      !formData.endTime ||
      !formData.categoryId
    ) {
      return;
    }

    onSubmit(formData as TimeBlock);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {block?.id ? "Edit Time Block" : "Create Time Block"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title || ""}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="What are you working on?"
                autoFocus
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Add details about this task"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Start Time</Label>
                <div className="flex">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.startTime && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.startTime ? (
                          format(formData.startTime, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.startTime || undefined}
                        onSelect={(date) => {
                          if (date) {
                            const newStartTime = new Date(date);
                            if (formData.startTime) {
                              newStartTime.setHours(
                                formData.startTime.getHours(),
                                formData.startTime.getMinutes()
                              );
                            }
                            setFormData({
                              ...formData,
                              startTime: newStartTime,
                            });
                          }
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <Select
                  value={
                    formData.startTime
                      ? formatTimeString(formData.startTime)
                      : undefined
                  }
                  onValueChange={(value) => {
                    if (formData.startTime) {
                      const [hours, minutes] = value.split(":").map(Number);
                      const newStartTime = new Date(formData.startTime);
                      newStartTime.setHours(hours, minutes);
                      setFormData({ ...formData, startTime: newStartTime });
                    }
                  }}
                >
                  <SelectTrigger>
                    <Clock className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {times.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>End Time</Label>
                <div className="flex">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.endTime && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.endTime ? (
                          format(formData.endTime, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.endTime || undefined}
                        onSelect={(date) => {
                          if (date) {
                            const newEndTime = new Date(date);
                            if (formData.endTime) {
                              newEndTime.setHours(
                                formData.endTime.getHours(),
                                formData.endTime.getMinutes()
                              );
                            }
                            setFormData({ ...formData, endTime: newEndTime });
                          }
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <Select
                  value={
                    formData.endTime
                      ? formatTimeString(formData.endTime)
                      : undefined
                  }
                  onValueChange={(value) => {
                    if (formData.endTime) {
                      const [hours, minutes] = value.split(":").map(Number);
                      const newEndTime = new Date(formData.endTime);
                      newEndTime.setHours(hours, minutes);
                      setFormData({ ...formData, endTime: newEndTime });
                    }
                  }}
                >
                  <SelectTrigger>
                    <Clock className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {times.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) =>
                  setFormData({ ...formData, categoryId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center">
                        <div
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: category.color }}
                        />
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label className="flex items-center">
                <BatteryMedium className="mr-2 h-4 w-4" />
                Energy Level Required
              </Label>
              <div className="flex items-center">
                <span className="text-sm text-gray-500 w-6">Low</span>
                <Slider
                  min={1}
                  max={5}
                  step={1}
                  value={[formData.energyLevel || 3]}
                  onValueChange={([value]) =>
                    setFormData({ ...formData, energyLevel: value })
                  }
                  className="mx-4"
                />
                <span className="text-sm text-gray-500 w-6">High</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="completed"
                checked={formData.isCompleted}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isCompleted: checked })
                }
              />
              <Label htmlFor="completed">Mark as completed</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="recurring"
                checked={formData.isRecurring}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isRecurring: checked })
                }
              />
              <Label htmlFor="recurring">Make recurring</Label>
            </div>
          </div>

          <DialogFooter className="flex justify-between">
            <div>
              {onDelete && (
                <Button type="button" variant="destructive" onClick={onDelete}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              )}
            </div>
            <div className="flex space-x-2">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit">Save</Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BlockEditorDialog;
