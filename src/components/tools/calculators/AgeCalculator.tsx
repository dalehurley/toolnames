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
import { CalendarClock, Calculator, RefreshCw, Calendar } from "lucide-react";
import {
  format,
  differenceInDays,
  differenceInMonths,
  differenceInYears,
  addYears,
  addMonths,
  isValid,
} from "date-fns";

export const AgeCalculator = () => {
  const [birthDate, setBirthDate] = useState<string>("");
  const [asOfDate, setAsOfDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd")
  );
  const [ageResult, setAgeResult] = useState<{
    years: number;
    months: number;
    days: number;
    totalDays: number;
    nextBirthday?: {
      date: string;
      daysRemaining: number;
    };
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleClear = () => {
    setBirthDate("");
    setAsOfDate(format(new Date(), "yyyy-MM-dd"));
    setAgeResult(null);
    setError(null);
  };

  const calculateAge = () => {
    if (!birthDate) {
      setError("Please enter your birth date");
      return;
    }

    const birthDateObj = new Date(birthDate);
    const asOfDateObj = asOfDate ? new Date(asOfDate) : new Date();

    if (!isValid(birthDateObj)) {
      setError("Invalid birth date");
      return;
    }

    if (!isValid(asOfDateObj)) {
      setError("Invalid calculation date");
      return;
    }

    if (birthDateObj > asOfDateObj) {
      setError("Birth date cannot be in the future");
      return;
    }

    setError(null);

    // Calculate exact age
    const years = differenceInYears(asOfDateObj, birthDateObj);

    // Calculate age in months after subtracting years
    const remainingMonths = differenceInMonths(
      asOfDateObj,
      addYears(birthDateObj, years)
    );

    // Calculate remaining days after subtracting years and months
    const remainingDays = differenceInDays(
      asOfDateObj,
      addMonths(addYears(birthDateObj, years), remainingMonths)
    );

    // Calculate total days alive
    const totalDays = differenceInDays(asOfDateObj, birthDateObj);

    // Calculate next birthday
    let nextBirthdayYear = asOfDateObj.getFullYear();

    // If this year's birthday has already passed, calculate for next year
    const thisYearBirthday = new Date(
      nextBirthdayYear,
      birthDateObj.getMonth(),
      birthDateObj.getDate()
    );

    if (thisYearBirthday < asOfDateObj) {
      nextBirthdayYear += 1;
    }

    const nextBirthdayDate = new Date(
      nextBirthdayYear,
      birthDateObj.getMonth(),
      birthDateObj.getDate()
    );

    const daysUntilNextBirthday = differenceInDays(
      nextBirthdayDate,
      asOfDateObj
    );

    setAgeResult({
      years,
      months: remainingMonths,
      days: remainingDays,
      totalDays,
      nextBirthday: {
        date: format(nextBirthdayDate, "MMMM d, yyyy"),
        daysRemaining: daysUntilNextBirthday,
      },
    });
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <CalendarClock className="h-6 w-6" />
          Age Calculator
        </CardTitle>
        <CardDescription>
          Calculate your precise age in years, months, and days
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="birth-date">Birth Date</Label>
            <div className="relative">
              <Input
                id="birth-date"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="pl-10"
              />
              <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="as-of-date">As of Date (defaults to today)</Label>
            <div className="relative">
              <Input
                id="as-of-date"
                type="date"
                value={asOfDate}
                onChange={(e) => setAsOfDate(e.target.value)}
                className="pl-10"
              />
              <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between gap-4 pt-2">
          <Button variant="outline" onClick={handleClear}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Clear
          </Button>

          <Button onClick={calculateAge}>
            <Calculator className="mr-2 h-4 w-4" />
            Calculate Age
          </Button>
        </div>

        {ageResult && (
          <div className="bg-muted rounded-lg p-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-muted-foreground mb-1">
                Your Age
              </h3>
              <p className="text-4xl font-bold mb-2">
                {ageResult.years} <span className="text-lg">years</span>{" "}
                {ageResult.months} <span className="text-lg">months</span>{" "}
                {ageResult.days} <span className="text-lg">days</span>
              </p>
              <p className="text-sm text-muted-foreground">
                That's a total of {ageResult.totalDays.toLocaleString()} days!
              </p>
            </div>

            <div className="border-t pt-4 mt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-1">Other Units</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>
                      <span className="font-medium">
                        {Math.floor(ageResult.totalDays / 7).toLocaleString()}
                      </span>{" "}
                      weeks
                    </li>
                    <li>
                      <span className="font-medium">
                        {ageResult.totalDays.toLocaleString()}
                      </span>{" "}
                      days
                    </li>
                    <li>
                      <span className="font-medium">
                        {(ageResult.totalDays * 24).toLocaleString()}
                      </span>{" "}
                      hours
                    </li>
                  </ul>
                </div>

                {ageResult.nextBirthday && (
                  <div>
                    <h4 className="font-semibold mb-1">Next Birthday</h4>
                    <p className="text-sm text-muted-foreground">
                      {ageResult.nextBirthday.date}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">
                        {ageResult.nextBirthday.daysRemaining}
                      </span>{" "}
                      days from now
                    </p>
                    <p className="text-sm text-muted-foreground">
                      You'll be{" "}
                      <span className="font-medium">
                        {ageResult.years +
                          (ageResult.nextBirthday.daysRemaining > 0 ? 1 : 0)}
                      </span>{" "}
                      years old
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col space-y-4">
        <div className="bg-muted p-4 rounded-lg w-full">
          <h3 className="font-semibold mb-2">How to use this calculator</h3>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-4">
            <li>Enter your birth date in the format MM/DD/YYYY</li>
            <li>
              Optionally, change the "As of" date (defaults to today) to
              calculate your age at a specific point in time
            </li>
            <li>
              Click "Calculate Age" to see your exact age in years, months, and
              days, as well as information about your next birthday
            </li>
          </ul>
        </div>
      </CardFooter>
    </Card>
  );
};

export default AgeCalculator;
