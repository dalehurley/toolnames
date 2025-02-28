import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Clock, RefreshCw, Plus, Minus } from "lucide-react";

export const TimeCalculator = () => {
  // Active tab state
  const [activeTab, setActiveTab] = useState<string>("add-subtract");

  // Add/Subtract Time tab
  const [operation, setOperation] = useState<"add" | "subtract">("add");
  const [startHours, setStartHours] = useState<string>("");
  const [startMinutes, setStartMinutes] = useState<string>("");
  const [startPeriod, setStartPeriod] = useState<string>("AM");
  const [addHours, setAddHours] = useState<string>("");
  const [addMinutes, setAddMinutes] = useState<string>("");
  const [resultTime, setResultTime] = useState<string>("");

  // Duration tab
  const [startTimeHours, setStartTimeHours] = useState<string>("");
  const [startTimeMinutes, setStartTimeMinutes] = useState<string>("");
  const [startTimePeriod, setStartTimePeriod] = useState<string>("AM");
  const [endTimeHours, setEndTimeHours] = useState<string>("");
  const [endTimeMinutes, setEndTimeMinutes] = useState<string>("");
  const [endTimePeriod, setEndTimePeriod] = useState<string>("AM");
  const [durationResult, setDurationResult] = useState<{
    hours: number;
    minutes: number;
    totalMinutes: number;
  } | null>(null);

  // Error handling
  const [errors, setErrors] = useState<{
    startHours?: string;
    startMinutes?: string;
    addHours?: string;
    addMinutes?: string;
    startTimeHours?: string;
    startTimeMinutes?: string;
    endTimeHours?: string;
    endTimeMinutes?: string;
  }>({});

  // Handle clearing fields
  const handleClear = () => {
    if (activeTab === "add-subtract") {
      setStartHours("");
      setStartMinutes("");
      setStartPeriod("AM");
      setAddHours("");
      setAddMinutes("");
      setResultTime("");
    } else if (activeTab === "duration") {
      setStartTimeHours("");
      setStartTimeMinutes("");
      setStartTimePeriod("AM");
      setEndTimeHours("");
      setEndTimeMinutes("");
      setEndTimePeriod("AM");
      setDurationResult(null);
    }

    setErrors({});
  };

  // Validate time inputs
  const validateTimeInput = (
    hours: string,
    minutes: string,
    fieldPrefix: "start" | "end" | "add"
  ) => {
    const newErrors: typeof errors = {};

    if (!hours) {
      newErrors[`${fieldPrefix}Hours` as keyof typeof errors] =
        "Hours required";
    } else if (
      isNaN(Number(hours)) ||
      Number(hours) < 1 ||
      Number(hours) > 12
    ) {
      newErrors[`${fieldPrefix}Hours` as keyof typeof errors] =
        "Hours must be 1-12";
    }

    if (!minutes) {
      newErrors[`${fieldPrefix}Minutes` as keyof typeof errors] =
        "Minutes required";
    } else if (
      isNaN(Number(minutes)) ||
      Number(minutes) < 0 ||
      Number(minutes) > 59
    ) {
      newErrors[`${fieldPrefix}Minutes` as keyof typeof errors] =
        "Minutes must be 0-59";
    }

    return newErrors;
  };

  // Convert 12h time to minutes since midnight
  const timeToMinutes = (
    hours: string,
    minutes: string,
    period: string
  ): number => {
    let h = parseInt(hours, 10);
    const m = parseInt(minutes, 10);

    // Convert 12-hour to 24-hour
    if (period === "PM" && h < 12) {
      h += 12;
    } else if (period === "AM" && h === 12) {
      h = 0;
    }

    return h * 60 + m;
  };

  // Convert minutes since midnight to 12h time
  const minutesToTime = (totalMinutes: number): string => {
    // Ensure minutes are positive and wrap around correctly
    while (totalMinutes < 0) {
      totalMinutes += 24 * 60; // Add a full day
    }
    totalMinutes = totalMinutes % (24 * 60); // Wrap around

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    let period = "AM";
    let displayHours = hours;

    if (hours >= 12) {
      period = "PM";
      if (hours > 12) {
        displayHours = hours - 12;
      }
    }

    if (displayHours === 0) {
      displayHours = 12;
    }

    return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  // Handle time input changes for Add/Subtract tab
  const handleAddSubtractChange = (
    field:
      | "startHours"
      | "startMinutes"
      | "startPeriod"
      | "addHours"
      | "addMinutes"
      | "operation",
    value: string
  ) => {
    // Update the corresponding state
    switch (field) {
      case "startHours":
        setStartHours(value);
        break;
      case "startMinutes":
        setStartMinutes(value);
        break;
      case "startPeriod":
        setStartPeriod(value);
        break;
      case "addHours":
        setAddHours(value);
        break;
      case "addMinutes":
        setAddMinutes(value);
        break;
      case "operation":
        setOperation(value as "add" | "subtract");
        break;
    }

    // Validate and calculate if we have all required fields
    if (startHours && startMinutes && addHours && addMinutes) {
      const startErrors = validateTimeInput(startHours, startMinutes, "start");
      const addErrors = validateTimeInput(addHours, addMinutes, "add");

      setErrors({ ...startErrors, ...addErrors });

      if (
        Object.keys(startErrors).length === 0 &&
        Object.keys(addErrors).length === 0
      ) {
        const startTotalMinutes = timeToMinutes(
          startHours,
          startMinutes,
          startPeriod
        );
        const addTotalMinutes = Number(addHours) * 60 + Number(addMinutes);

        const resultTotalMinutes =
          operation === "add"
            ? startTotalMinutes + addTotalMinutes
            : startTotalMinutes - addTotalMinutes;

        setResultTime(minutesToTime(resultTotalMinutes));
      }
    }
  };

  // Handle time input changes for Duration tab
  const handleDurationChange = (
    field:
      | "startTimeHours"
      | "startTimeMinutes"
      | "startTimePeriod"
      | "endTimeHours"
      | "endTimeMinutes"
      | "endTimePeriod",
    value: string
  ) => {
    // Update the corresponding state
    switch (field) {
      case "startTimeHours":
        setStartTimeHours(value);
        break;
      case "startTimeMinutes":
        setStartTimeMinutes(value);
        break;
      case "startTimePeriod":
        setStartTimePeriod(value);
        break;
      case "endTimeHours":
        setEndTimeHours(value);
        break;
      case "endTimeMinutes":
        setEndTimeMinutes(value);
        break;
      case "endTimePeriod":
        setEndTimePeriod(value);
        break;
    }

    // Validate and calculate if we have all required fields
    if (startTimeHours && startTimeMinutes && endTimeHours && endTimeMinutes) {
      const startErrors = validateTimeInput(
        startTimeHours,
        startTimeMinutes,
        "start"
      );
      const endErrors = validateTimeInput(endTimeHours, endTimeMinutes, "end");

      setErrors({ ...startErrors, ...endErrors });

      if (
        Object.keys(startErrors).length === 0 &&
        Object.keys(endErrors).length === 0
      ) {
        const startTotalMinutes = timeToMinutes(
          startTimeHours,
          startTimeMinutes,
          startTimePeriod
        );
        const endTotalMinutes = timeToMinutes(
          endTimeHours,
          endTimeMinutes,
          endTimePeriod
        );

        let diffMinutes = endTotalMinutes - startTotalMinutes;
        if (diffMinutes < 0) {
          diffMinutes += 24 * 60; // Add 24 hours if end time is on next day
        }

        const hours = Math.floor(diffMinutes / 60);
        const minutes = diffMinutes % 60;

        setDurationResult({
          hours,
          minutes,
          totalMinutes: diffMinutes,
        });
      }
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Clock className="h-6 w-6" />
          Time Calculator
        </CardTitle>
        <CardDescription>
          Add or subtract time intervals, and calculate the duration between two
          times
        </CardDescription>
      </CardHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="px-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="add-subtract">Add / Subtract Time</TabsTrigger>
            <TabsTrigger value="duration">Calculate Duration</TabsTrigger>
          </TabsList>
        </div>

        <CardContent className="pt-6">
          {/* Add/Subtract Time Tab */}
          <TabsContent value="add-subtract" className="space-y-4">
            <div className="flex gap-4 items-center">
              <div className="space-y-2">
                <Label>Operation</Label>
                <div className="flex border rounded-md overflow-hidden">
                  <Button
                    type="button"
                    variant={operation === "add" ? "default" : "outline"}
                    className="rounded-none flex-1"
                    onClick={() => setOperation("add")}
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Add
                  </Button>
                  <Button
                    type="button"
                    variant={operation === "subtract" ? "default" : "outline"}
                    className="rounded-none flex-1"
                    onClick={() => setOperation("subtract")}
                  >
                    <Minus className="mr-1 h-4 w-4" />
                    Subtract
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <Label className="block mb-2">Start Time</Label>
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="start-hours" className="sr-only">
                      Hours
                    </Label>
                    <Input
                      id="start-hours"
                      type="number"
                      placeholder="HH"
                      min="1"
                      max="12"
                      value={startHours}
                      onChange={(e) =>
                        handleAddSubtractChange("startHours", e.target.value)
                      }
                    />
                    {errors.startHours && (
                      <p className="text-sm text-red-500">
                        {errors.startHours}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="start-minutes" className="sr-only">
                      Minutes
                    </Label>
                    <Input
                      id="start-minutes"
                      type="number"
                      placeholder="MM"
                      min="0"
                      max="59"
                      value={startMinutes}
                      onChange={(e) =>
                        handleAddSubtractChange("startMinutes", e.target.value)
                      }
                    />
                    {errors.startMinutes && (
                      <p className="text-sm text-red-500">
                        {errors.startMinutes}
                      </p>
                    )}
                  </div>

                  <div>
                    <Select
                      value={startPeriod}
                      onValueChange={(value) =>
                        handleAddSubtractChange("startPeriod", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="AM/PM" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AM">AM</SelectItem>
                        <SelectItem value="PM">PM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Label className="block mb-2">
                  Time to {operation === "add" ? "Add" : "Subtract"}
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="add-hours" className="sr-only">
                      Hours
                    </Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="add-hours"
                        type="number"
                        placeholder="HH"
                        min="0"
                        value={addHours}
                        onChange={(e) =>
                          handleAddSubtractChange("addHours", e.target.value)
                        }
                      />
                      <span className="text-sm">hrs</span>
                    </div>
                    {errors.addHours && (
                      <p className="text-sm text-red-500">{errors.addHours}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="add-minutes" className="sr-only">
                      Minutes
                    </Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="add-minutes"
                        type="number"
                        placeholder="MM"
                        min="0"
                        max="59"
                        value={addMinutes}
                        onChange={(e) =>
                          handleAddSubtractChange("addMinutes", e.target.value)
                        }
                      />
                      <span className="text-sm">min</span>
                    </div>
                    {errors.addMinutes && (
                      <p className="text-sm text-red-500">
                        {errors.addMinutes}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={handleClear}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Clear
              </Button>
            </div>

            {resultTime && (
              <div className="pt-6">
                <div className="bg-muted rounded-lg p-6 text-center">
                  <p className="text-sm text-muted-foreground mb-1">Result</p>
                  <p className="text-3xl font-semibold mb-2">{resultTime}</p>
                  <p className="text-sm text-muted-foreground">
                    {startHours}:{startMinutes.padStart(2, "0")} {startPeriod}{" "}
                    {operation === "add" ? "+" : "-"} {addHours || "0"}h{" "}
                    {addMinutes || "0"}m
                  </p>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Duration Tab */}
          <TabsContent value="duration" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Label className="block">Start Time</Label>
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="start-time-hours" className="sr-only">
                      Hours
                    </Label>
                    <Input
                      id="start-time-hours"
                      type="number"
                      placeholder="HH"
                      min="1"
                      max="12"
                      value={startTimeHours}
                      onChange={(e) =>
                        handleDurationChange("startTimeHours", e.target.value)
                      }
                    />
                    {errors.startTimeHours && (
                      <p className="text-sm text-red-500">
                        {errors.startTimeHours}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="start-time-minutes" className="sr-only">
                      Minutes
                    </Label>
                    <Input
                      id="start-time-minutes"
                      type="number"
                      placeholder="MM"
                      min="0"
                      max="59"
                      value={startTimeMinutes}
                      onChange={(e) =>
                        handleDurationChange("startTimeMinutes", e.target.value)
                      }
                    />
                    {errors.startTimeMinutes && (
                      <p className="text-sm text-red-500">
                        {errors.startTimeMinutes}
                      </p>
                    )}
                  </div>

                  <div>
                    <Select
                      value={startTimePeriod}
                      onValueChange={(value) =>
                        handleDurationChange("startTimePeriod", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="AM/PM" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AM">AM</SelectItem>
                        <SelectItem value="PM">PM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Label className="block">End Time</Label>
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="end-time-hours" className="sr-only">
                      Hours
                    </Label>
                    <Input
                      id="end-time-hours"
                      type="number"
                      placeholder="HH"
                      min="1"
                      max="12"
                      value={endTimeHours}
                      onChange={(e) =>
                        handleDurationChange("endTimeHours", e.target.value)
                      }
                    />
                    {errors.endTimeHours && (
                      <p className="text-sm text-red-500">
                        {errors.endTimeHours}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="end-time-minutes" className="sr-only">
                      Minutes
                    </Label>
                    <Input
                      id="end-time-minutes"
                      type="number"
                      placeholder="MM"
                      min="0"
                      max="59"
                      value={endTimeMinutes}
                      onChange={(e) =>
                        handleDurationChange("endTimeMinutes", e.target.value)
                      }
                    />
                    {errors.endTimeMinutes && (
                      <p className="text-sm text-red-500">
                        {errors.endTimeMinutes}
                      </p>
                    )}
                  </div>

                  <div>
                    <Select
                      value={endTimePeriod}
                      onValueChange={(value) =>
                        handleDurationChange("endTimePeriod", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="AM/PM" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AM">AM</SelectItem>
                        <SelectItem value="PM">PM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={handleClear}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Clear
              </Button>
            </div>

            {durationResult && (
              <div className="pt-6">
                <div className="bg-muted rounded-lg p-6 text-center">
                  <p className="text-sm text-muted-foreground mb-1">
                    Time Duration
                  </p>
                  <p className="text-3xl font-semibold mb-2">
                    {durationResult.hours} hr
                    {durationResult.hours !== 1 ? "s" : ""}{" "}
                    {durationResult.minutes} min
                    {durationResult.minutes !== 1 ? "s" : ""}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {durationResult.totalMinutes} total minutes
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    From {startTimeHours}:{startTimeMinutes.padStart(2, "0")}{" "}
                    {startTimePeriod} to {endTimeHours}:
                    {endTimeMinutes.padStart(2, "0")} {endTimePeriod}
                  </p>
                </div>
              </div>
            )}
          </TabsContent>
        </CardContent>
      </Tabs>

      <CardFooter className="flex flex-col space-y-4">
        <div className="bg-muted p-4 rounded-lg w-full">
          <h3 className="font-semibold mb-2">How to use this calculator</h3>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-4">
            <li>
              <strong>Add/Subtract Time</strong> - Add or subtract hours and
              minutes from a specific time
            </li>
            <li>
              <strong>Calculate Duration</strong> - Find the duration between
              two times in hours and minutes
            </li>
          </ul>
          <div className="mt-3 text-sm text-muted-foreground">
            <p>
              <strong>Note:</strong> The calculator handles wrapping around
              midnight. If the end time is earlier than the start time, it
              assumes the end time is on the next day.
            </p>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default TimeCalculator;
