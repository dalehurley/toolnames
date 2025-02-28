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
import { CalendarDays, RefreshCw, Plus, Minus } from "lucide-react";
import { format, addDays, subDays, differenceInDays, isValid } from "date-fns";

export const DateCalculator = () => {
  // Active tab state
  const [activeTab, setActiveTab] = useState<string>("date-difference");

  // Date Difference tab
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [dateDifferenceResult, setDateDifferenceResult] = useState<{
    days: number;
    weeks: number;
    months: number;
  } | null>(null);

  // Add/Subtract Days tab
  const [baseDate, setBaseDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd")
  );
  const [daysToChange, setDaysToChange] = useState<string>("");
  const [operation, setOperation] = useState<"add" | "subtract">("add");
  const [dateResult, setDateResult] = useState<string | null>(null);

  // Error handling
  const [errors, setErrors] = useState<{
    startDate?: string;
    endDate?: string;
    baseDate?: string;
    daysToChange?: string;
  }>({});

  // Handle clearing fields
  const handleClear = () => {
    if (activeTab === "date-difference") {
      setStartDate("");
      setEndDate("");
      setDateDifferenceResult(null);
    } else if (activeTab === "add-subtract") {
      setBaseDate(format(new Date(), "yyyy-MM-dd"));
      setDaysToChange("");
      setDateResult(null);
    }

    setErrors({});
  };

  // Handle date difference input changes
  const handleDateDifferenceChange = (field: string, value: string) => {
    if (field === "startDate") {
      setStartDate(value);
      if (!value) {
        setErrors((prev) => ({ ...prev, startDate: "Start date is required" }));
      } else if (!isValid(new Date(value))) {
        setErrors((prev) => ({ ...prev, startDate: "Invalid start date" }));
      } else {
        setErrors((prev) => ({ ...prev, startDate: "" }));
      }
    } else if (field === "endDate") {
      setEndDate(value);
      if (!value) {
        setErrors((prev) => ({ ...prev, endDate: "End date is required" }));
      } else if (!isValid(new Date(value))) {
        setErrors((prev) => ({ ...prev, endDate: "Invalid end date" }));
      } else {
        setErrors((prev) => ({ ...prev, endDate: "" }));
      }
    }

    // Calculate if both dates are valid
    if (
      startDate &&
      endDate &&
      (field === "startDate" ? value : startDate) &&
      (field === "endDate" ? value : endDate) &&
      isValid(new Date(field === "startDate" ? value : startDate)) &&
      isValid(new Date(field === "endDate" ? value : endDate))
    ) {
      const start = new Date(field === "startDate" ? value : startDate);
      const end = new Date(field === "endDate" ? value : endDate);

      // Calculate days difference
      const daysDiff = Math.abs(differenceInDays(end, start));

      // Calculate weeks and remaining days
      const weeksDiff = Math.floor(daysDiff / 7);

      // Approximate months (not exact due to varying month lengths)
      const monthsDiff = daysDiff / 30.44; // Average days in a month

      setDateDifferenceResult({
        days: daysDiff,
        weeks: weeksDiff,
        months: parseFloat(monthsDiff.toFixed(1)),
      });
    } else {
      setDateDifferenceResult(null);
    }
  };

  // Handle add/subtract date input changes
  const handleAddSubtractChange = (field: string, value: string) => {
    if (field === "baseDate") {
      setBaseDate(value);
      if (!value) {
        setErrors((prev) => ({ ...prev, baseDate: "Base date is required" }));
      } else if (!isValid(new Date(value))) {
        setErrors((prev) => ({ ...prev, baseDate: "Invalid base date" }));
      } else {
        setErrors((prev) => ({ ...prev, baseDate: "" }));
      }
    } else if (field === "daysToChange") {
      setDaysToChange(value);
      if (!value) {
        setErrors((prev) => ({
          ...prev,
          daysToChange: "Number of days is required",
        }));
      } else if (isNaN(Number(value)) || Number(value) < 0) {
        setErrors((prev) => ({
          ...prev,
          daysToChange: "Days must be a positive number",
        }));
      } else {
        setErrors((prev) => ({ ...prev, daysToChange: "" }));
      }
    } else if (field === "operation") {
      setOperation(value as "add" | "subtract");
    }

    // Calculate if both inputs are valid
    if (
      (field === "baseDate" ? value : baseDate) &&
      (field === "daysToChange" ? value : daysToChange) &&
      isValid(new Date(field === "baseDate" ? value : baseDate)) &&
      !isNaN(Number(field === "daysToChange" ? value : daysToChange)) &&
      Number(field === "daysToChange" ? value : daysToChange) >= 0
    ) {
      const date = new Date(field === "baseDate" ? value : baseDate);
      const days = parseInt(
        field === "daysToChange" ? value : daysToChange,
        10
      );
      const op = field === "operation" ? value : operation;

      let resultDate;
      if (op === "add") {
        resultDate = addDays(date, days);
      } else {
        resultDate = subDays(date, days);
      }

      setDateResult(format(resultDate, "EEEE, MMMM d, yyyy"));
    } else {
      setDateResult(null);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <CalendarDays className="h-6 w-6" />
          Date Calculator
        </CardTitle>
        <CardDescription>
          Calculate the difference between dates or add/subtract days from a
          date
        </CardDescription>
      </CardHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="px-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="date-difference">Date Difference</TabsTrigger>
            <TabsTrigger value="add-subtract">Add/Subtract Days</TabsTrigger>
          </TabsList>
        </div>

        <CardContent className="pt-6">
          {/* Date Difference Tab */}
          <TabsContent value="date-difference" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) =>
                    handleDateDifferenceChange("startDate", e.target.value)
                  }
                />
                {errors.startDate && (
                  <p className="text-sm text-red-500">{errors.startDate}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) =>
                    handleDateDifferenceChange("endDate", e.target.value)
                  }
                />
                {errors.endDate && (
                  <p className="text-sm text-red-500">{errors.endDate}</p>
                )}
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={handleClear}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Clear
              </Button>
            </div>

            {dateDifferenceResult && (
              <div className="pt-6">
                <div className="bg-muted rounded-lg p-6 text-center">
                  <p className="text-sm text-muted-foreground mb-1">
                    Date Difference
                  </p>
                  <p className="text-3xl font-semibold mb-2">
                    {dateDifferenceResult.days} days
                  </p>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>
                      {dateDifferenceResult.weeks} weeks and{" "}
                      {dateDifferenceResult.days % 7} days
                    </p>
                    <p>Approximately {dateDifferenceResult.months} months</p>
                    <p className="mt-3">
                      From {format(new Date(startDate), "MMMM d, yyyy")} to{" "}
                      {format(new Date(endDate), "MMMM d, yyyy")}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Add/Subtract Days Tab */}
          <TabsContent value="add-subtract" className="space-y-4">
            <div className="flex gap-4 items-center">
              <div className="space-y-2">
                <Label>Operation</Label>
                <div className="flex border rounded-md overflow-hidden">
                  <Button
                    type="button"
                    variant={operation === "add" ? "default" : "outline"}
                    className="rounded-none flex-1"
                    onClick={() => handleAddSubtractChange("operation", "add")}
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Add
                  </Button>
                  <Button
                    type="button"
                    variant={operation === "subtract" ? "default" : "outline"}
                    className="rounded-none flex-1"
                    onClick={() =>
                      handleAddSubtractChange("operation", "subtract")
                    }
                  >
                    <Minus className="mr-1 h-4 w-4" />
                    Subtract
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="base-date">Base Date</Label>
                <Input
                  id="base-date"
                  type="date"
                  value={baseDate}
                  onChange={(e) =>
                    handleAddSubtractChange("baseDate", e.target.value)
                  }
                />
                {errors.baseDate && (
                  <p className="text-sm text-red-500">{errors.baseDate}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="days-to-change">Number of Days</Label>
                <Input
                  id="days-to-change"
                  type="number"
                  min="0"
                  placeholder="30"
                  value={daysToChange}
                  onChange={(e) =>
                    handleAddSubtractChange("daysToChange", e.target.value)
                  }
                />
                {errors.daysToChange && (
                  <p className="text-sm text-red-500">{errors.daysToChange}</p>
                )}
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={handleClear}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Clear
              </Button>
            </div>

            {dateResult && (
              <div className="pt-6">
                <div className="bg-muted rounded-lg p-6 text-center">
                  <p className="text-sm text-muted-foreground mb-1">
                    Result Date
                  </p>
                  <p className="text-3xl font-semibold mb-2">{dateResult}</p>
                  <p className="text-sm text-muted-foreground">
                    {operation === "add" ? "Added" : "Subtracted"}{" "}
                    {daysToChange} days {operation === "add" ? "to" : "from"}{" "}
                    {format(new Date(baseDate), "MMMM d, yyyy")}
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
              <strong>Date Difference</strong> - Calculate the number of days,
              weeks, and approximate months between two dates
            </li>
            <li>
              <strong>Add/Subtract Days</strong> - Add or subtract a specific
              number of days from a date to find a future or past date
            </li>
          </ul>
        </div>
      </CardFooter>
    </Card>
  );
};

export default DateCalculator;
