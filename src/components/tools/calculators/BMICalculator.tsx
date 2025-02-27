import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Scale } from "lucide-react";

export const BMICalculator = () => {
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [weight, setWeight] = useState<string>("");
  const [height, setHeight] = useState<string>("");
  const [feet, setFeet] = useState<string>("");
  const [inches, setInches] = useState<string>("");
  const [bmi, setBmi] = useState<number | null>(null);
  const [category, setCategory] = useState<string>("");
  const [error, setError] = useState<string>("");

  const calculateBMI = () => {
    setError("");

    try {
      let bmiValue: number;

      if (unit === "metric") {
        // Validate inputs
        if (!weight || !height) {
          setError("Please enter both weight and height.");
          return;
        }

        const weightVal = parseFloat(weight);
        const heightVal = parseFloat(height) / 100; // Convert cm to meters

        if (weightVal <= 0 || heightVal <= 0) {
          setError("Weight and height must be positive numbers.");
          return;
        }

        // BMI = weight(kg) / height(m)²
        bmiValue = weightVal / (heightVal * heightVal);
      } else {
        // Validate inputs
        if (!weight || !feet) {
          setError("Please enter weight, feet, and inches (if applicable).");
          return;
        }

        const weightVal = parseFloat(weight);
        const feetVal = parseFloat(feet);
        const inchesVal = parseFloat(inches || "0");

        if (weightVal <= 0 || feetVal < 0 || inchesVal < 0) {
          setError("Weight and height must be positive numbers.");
          return;
        }

        // Height in inches
        const totalInches = feetVal * 12 + inchesVal;

        // BMI = 703 × weight(lb) / height(in)²
        bmiValue = (703 * weightVal) / (totalInches * totalInches);
      }

      // Round to 1 decimal place
      bmiValue = Math.round(bmiValue * 10) / 10;
      setBmi(bmiValue);

      // Determine BMI category
      if (bmiValue < 18.5) {
        setCategory("Underweight");
      } else if (bmiValue < 25) {
        setCategory("Normal weight");
      } else if (bmiValue < 30) {
        setCategory("Overweight");
      } else {
        setCategory("Obesity");
      }
    } catch (err) {
      setError(
        "An error occurred during calculation. Please check your inputs."
      );
    }
  };

  const clearInputs = () => {
    setWeight("");
    setHeight("");
    setFeet("");
    setInches("");
    setBmi(null);
    setCategory("");
    setError("");
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">BMI Calculator</CardTitle>
        <CardDescription>
          Calculate your Body Mass Index (BMI) to evaluate whether you're at a
          healthy weight
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <Label>Units</Label>
          <ToggleGroup
            type="single"
            value={unit}
            onValueChange={(value) => {
              if (value) setUnit(value as "metric" | "imperial");
              clearInputs();
            }}
            className="justify-start"
          >
            <ToggleGroupItem value="metric">Metric (kg, cm)</ToggleGroupItem>
            <ToggleGroupItem value="imperial">
              Imperial (lb, ft/in)
            </ToggleGroupItem>
          </ToggleGroup>

          <Tabs
            value={unit}
            onValueChange={(value) => setUnit(value as "metric" | "imperial")}
            className="mt-4"
          >
            <TabsContent value="metric" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight-kg">Weight (kg)</Label>
                  <Input
                    id="weight-kg"
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="Enter weight in kilograms"
                    min="0"
                    step="0.1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height-cm">Height (cm)</Label>
                  <Input
                    id="height-cm"
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder="Enter height in centimeters"
                    min="0"
                    step="0.1"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="imperial" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight-lb">Weight (lb)</Label>
                  <Input
                    id="weight-lb"
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="Enter weight in pounds"
                    min="0"
                    step="0.1"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Height</Label>
                  <div className="flex space-x-2">
                    <div className="w-1/2">
                      <Input
                        id="height-ft"
                        type="number"
                        value={feet}
                        onChange={(e) => setFeet(e.target.value)}
                        placeholder="Feet"
                        min="0"
                        step="1"
                      />
                    </div>
                    <div className="w-1/2">
                      <Input
                        id="height-in"
                        type="number"
                        value={inches}
                        onChange={(e) => setInches(e.target.value)}
                        placeholder="Inches"
                        min="0"
                        max="11"
                        step="1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-center pt-4 space-x-4">
            <Button onClick={calculateBMI}>Calculate BMI</Button>
            <Button variant="outline" onClick={clearInputs}>
              Clear
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {bmi !== null && (
          <>
            <Separator />
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold">{bmi.toFixed(1)}</div>
                <div className="text-xl font-medium mt-1">{category}</div>
              </div>

              <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden mt-4">
                <div className="absolute inset-0 flex">
                  <div className="w-1/4 bg-blue-500">
                    <div className="h-full flex items-center justify-center text-xs text-white font-medium">
                      Underweight
                    </div>
                  </div>
                  <div className="w-1/4 bg-green-500">
                    <div className="h-full flex items-center justify-center text-xs text-white font-medium">
                      Normal
                    </div>
                  </div>
                  <div className="w-1/4 bg-yellow-500">
                    <div className="h-full flex items-center justify-center text-xs text-white font-medium">
                      Overweight
                    </div>
                  </div>
                  <div className="w-1/4 bg-red-500">
                    <div className="h-full flex items-center justify-center text-xs text-white font-medium">
                      Obese
                    </div>
                  </div>
                </div>
                {/* Marker for current BMI */}
                <div
                  className="absolute top-0 h-full w-1 bg-black"
                  style={{
                    left: `${Math.min(
                      Math.max(((bmi - 10) / 30) * 100, 0),
                      100
                    )}%`,
                  }}
                ></div>
              </div>

              <div className="text-sm text-muted-foreground mt-6">
                <p className="mb-2">
                  <strong>BMI Categories:</strong>
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Underweight: BMI less than 18.5</li>
                  <li>Normal weight: BMI 18.5 to 24.9</li>
                  <li>Overweight: BMI 25 to 29.9</li>
                  <li>Obesity: BMI 30 or greater</li>
                </ul>
                <p className="mt-4 italic">
                  Note: BMI is a simple assessment tool and doesn't account for
                  muscle mass, bone density, or overall body composition.
                  Consult with a healthcare professional for a comprehensive
                  assessment.
                </p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
