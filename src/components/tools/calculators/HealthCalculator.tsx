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
import { HeartPulse, Calculator, RefreshCw } from "lucide-react";

export const HealthCalculator = () => {
  // Active tab state
  const [activeTab, setActiveTab] = useState<string>("bmi");

  // BMI calculator states
  const [height, setHeight] = useState<string>("");
  const [weight, setWeight] = useState<string>("");
  const [heightUnit, setHeightUnit] = useState<"cm" | "ft">("cm");
  const [weightUnit, setWeightUnit] = useState<"kg" | "lb">("kg");
  const [bmiResult, setBmiResult] = useState<{
    bmi: number;
    category: string;
    healthyWeightRange: string;
  } | null>(null);

  // BMR calculator states
  const [bmrAge, setBmrAge] = useState<string>("");
  const [bmrHeight, setBmrHeight] = useState<string>("");
  const [bmrWeight, setBmrWeight] = useState<string>("");
  const [bmrGender, setBmrGender] = useState<"male" | "female">("male");
  const [bmrActivityLevel, setBmrActivityLevel] = useState<string>("sedentary");
  const [bmrResult, setBmrResult] = useState<{
    bmr: number;
    tdee: number;
  } | null>(null);

  // Ideal Weight calculator states
  const [idealHeight, setIdealHeight] = useState<string>("");
  const [idealGender, setIdealGender] = useState<"male" | "female">("male");
  const [idealHeightUnit, setIdealHeightUnit] = useState<"cm" | "ft">("cm");
  const [idealWeightResult, setIdealWeightResult] = useState<{
    miller: string;
    devine: string;
    hamwi: string;
    robinson: string;
  } | null>(null);

  // Error handling
  const [errors, setErrors] = useState<{
    height?: string;
    weight?: string;
    bmrAge?: string;
    bmrHeight?: string;
    bmrWeight?: string;
    idealHeight?: string;
  }>({});

  // Handle clearing form fields
  const handleClear = () => {
    if (activeTab === "bmi") {
      setHeight("");
      setWeight("");
      setBmiResult(null);
    } else if (activeTab === "bmr") {
      setBmrAge("");
      setBmrHeight("");
      setBmrWeight("");
      setBmrResult(null);
    } else if (activeTab === "ideal-weight") {
      setIdealHeight("");
      setIdealWeightResult(null);
    }

    setErrors({});
  };

  // Convert height to cm
  const convertHeightToCm = (value: string, unit: "cm" | "ft"): number => {
    if (unit === "cm") {
      return parseFloat(value);
    } else {
      // Convert feet and inches to cm
      const parts = value.split(".");
      const feet = parseInt(parts[0], 10) || 0;
      const inches = parts.length > 1 ? parseInt(parts[1], 10) || 0 : 0;
      return feet * 30.48 + inches * 2.54;
    }
  };

  // Convert weight to kg
  const convertWeightToKg = (value: string, unit: "kg" | "lb"): number => {
    if (unit === "kg") {
      return parseFloat(value);
    } else {
      return parseFloat(value) * 0.453592; // lb to kg
    }
  };

  // Calculate BMI
  const calculateBMI = () => {
    const newErrors: typeof errors = {};

    if (!height) {
      newErrors.height = "Height is required";
    } else if (parseFloat(height) <= 0) {
      newErrors.height = "Height must be greater than 0";
    }

    if (!weight) {
      newErrors.weight = "Weight is required";
    } else if (parseFloat(weight) <= 0) {
      newErrors.weight = "Weight must be greater than 0";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    // Convert height to meters and weight to kg
    const heightInCm = convertHeightToCm(height, heightUnit);
    const heightInMeters = heightInCm / 100;
    const weightInKg = convertWeightToKg(weight, weightUnit);

    // Calculate BMI
    const bmi = weightInKg / (heightInMeters * heightInMeters);

    // Determine BMI category
    let category = "";
    if (bmi < 18.5) {
      category = "Underweight";
    } else if (bmi >= 18.5 && bmi < 25) {
      category = "Normal weight";
    } else if (bmi >= 25 && bmi < 30) {
      category = "Overweight";
    } else {
      category = "Obesity";
    }

    // Calculate healthy weight range (BMI 18.5-24.9)
    const minHealthyWeight = 18.5 * (heightInMeters * heightInMeters);
    const maxHealthyWeight = 24.9 * (heightInMeters * heightInMeters);

    const healthyWeightRange =
      weightUnit === "kg"
        ? `${minHealthyWeight.toFixed(1)} - ${maxHealthyWeight.toFixed(1)} kg`
        : `${(minHealthyWeight * 2.20462).toFixed(1)} - ${(
            maxHealthyWeight * 2.20462
          ).toFixed(1)} lb`;

    setBmiResult({
      bmi: parseFloat(bmi.toFixed(1)),
      category,
      healthyWeightRange,
    });
  };

  // Calculate BMR and TDEE
  const calculateBMR = () => {
    const newErrors: typeof errors = {};

    if (!bmrAge) {
      newErrors.bmrAge = "Age is required";
    } else if (parseInt(bmrAge, 10) <= 0 || parseInt(bmrAge, 10) > 120) {
      newErrors.bmrAge = "Age must be between 1 and 120";
    }

    if (!bmrHeight) {
      newErrors.bmrHeight = "Height is required";
    } else if (parseFloat(bmrHeight) <= 0) {
      newErrors.bmrHeight = "Height must be greater than 0";
    }

    if (!bmrWeight) {
      newErrors.bmrWeight = "Weight is required";
    } else if (parseFloat(bmrWeight) <= 0) {
      newErrors.bmrWeight = "Weight must be greater than 0";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    const age = parseInt(bmrAge, 10);
    const heightInCm = parseFloat(bmrHeight);
    const weightInKg = parseFloat(bmrWeight);

    // Calculate BMR using Mifflin-St Jeor Equation
    let bmr;
    if (bmrGender === "male") {
      bmr = 10 * weightInKg + 6.25 * heightInCm - 5 * age + 5;
    } else {
      bmr = 10 * weightInKg + 6.25 * heightInCm - 5 * age - 161;
    }

    // Calculate TDEE based on activity level
    let tdee;
    switch (bmrActivityLevel) {
      case "sedentary":
        tdee = bmr * 1.2;
        break;
      case "light":
        tdee = bmr * 1.375;
        break;
      case "moderate":
        tdee = bmr * 1.55;
        break;
      case "active":
        tdee = bmr * 1.725;
        break;
      case "very-active":
        tdee = bmr * 1.9;
        break;
      default:
        tdee = bmr * 1.2;
    }

    setBmrResult({
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
    });
  };

  // Calculate Ideal Weight
  const calculateIdealWeight = () => {
    const newErrors: typeof errors = {};

    if (!idealHeight) {
      newErrors.idealHeight = "Height is required";
    } else if (parseFloat(idealHeight) <= 0) {
      newErrors.idealHeight = "Height must be greater than 0";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    // Convert height to cm
    const heightInCm = convertHeightToCm(idealHeight, idealHeightUnit);

    // Convert to inches for formulas
    const heightInInches = heightInCm / 2.54;

    // Calculate ideal weight using different formulas
    let devine, miller, hamwi, robinson;

    if (idealGender === "male") {
      // Male formulas
      devine = 50 + 2.3 * (heightInInches - 60);
      miller = 56.2 + 1.41 * (heightInInches - 60);
      hamwi = 48 + 2.7 * (heightInInches - 60);
      robinson = 52 + 1.9 * (heightInInches - 60);
    } else {
      // Female formulas
      devine = 45.5 + 2.3 * (heightInInches - 60);
      miller = 53.1 + 1.36 * (heightInInches - 60);
      hamwi = 45.5 + 2.2 * (heightInInches - 60);
      robinson = 49 + 1.7 * (heightInInches - 60);
    }

    // Ensure values are not negative (for very short heights)
    devine = Math.max(devine, 0);
    miller = Math.max(miller, 0);
    hamwi = Math.max(hamwi, 0);
    robinson = Math.max(robinson, 0);

    // Format results based on preferred unit
    const unit = "kg"; // Default to kg

    setIdealWeightResult({
      devine: `${devine.toFixed(1)} ${unit}`,
      miller: `${miller.toFixed(1)} ${unit}`,
      hamwi: `${hamwi.toFixed(1)} ${unit}`,
      robinson: `${robinson.toFixed(1)} ${unit}`,
    });
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <HeartPulse className="h-6 w-6" />
          Health Metrics Calculator
        </CardTitle>
        <CardDescription>
          Calculate BMI, BMR, TDEE, and ideal weight based on your body
          measurements
        </CardDescription>
      </CardHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="px-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="bmi">BMI</TabsTrigger>
            <TabsTrigger value="bmr">BMR & TDEE</TabsTrigger>
            <TabsTrigger value="ideal-weight">Ideal Weight</TabsTrigger>
          </TabsList>
        </div>

        <CardContent className="pt-6">
          {/* BMI Calculator Tab */}
          <TabsContent value="bmi" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="height">Height</Label>
                <div className="flex space-x-2">
                  <Input
                    id="height"
                    type="number"
                    placeholder={heightUnit === "cm" ? "175" : "5.9"}
                    step="any"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="flex-1"
                  />
                  <Select
                    value={heightUnit}
                    onValueChange={(value) =>
                      setHeightUnit(value as "cm" | "ft")
                    }
                  >
                    <SelectTrigger className="w-[90px]">
                      <SelectValue placeholder="Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cm">cm</SelectItem>
                      <SelectItem value="ft">ft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {errors.height && (
                  <p className="text-sm text-red-500">{errors.height}</p>
                )}
                {heightUnit === "ft" && (
                  <p className="text-xs text-muted-foreground">
                    Format: feet.inches (e.g., 5.9 for 5'9")
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight">Weight</Label>
                <div className="flex space-x-2">
                  <Input
                    id="weight"
                    type="number"
                    placeholder={weightUnit === "kg" ? "70" : "154"}
                    step="any"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="flex-1"
                  />
                  <Select
                    value={weightUnit}
                    onValueChange={(value) =>
                      setWeightUnit(value as "kg" | "lb")
                    }
                  >
                    <SelectTrigger className="w-[90px]">
                      <SelectValue placeholder="Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">kg</SelectItem>
                      <SelectItem value="lb">lb</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {errors.weight && (
                  <p className="text-sm text-red-500">{errors.weight}</p>
                )}
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={handleClear}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Clear
              </Button>

              <Button onClick={calculateBMI}>
                <Calculator className="mr-2 h-4 w-4" />
                Calculate BMI
              </Button>
            </div>

            {bmiResult && (
              <div className="pt-6">
                <div className="bg-muted rounded-lg p-6">
                  <div className="text-center mb-4">
                    <p className="text-sm text-muted-foreground mb-1">
                      Your BMI
                    </p>
                    <p className="text-4xl font-bold mb-1">{bmiResult.bmi}</p>
                    <p className="text-lg font-medium">{bmiResult.category}</p>
                  </div>

                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-medium">Healthy Weight Range:</span>{" "}
                      {bmiResult.healthyWeightRange}
                    </p>

                    <div className="mt-4 pt-4 border-t">
                      <h4 className="font-semibold mb-2">BMI Categories:</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>Underweight: BMI less than 18.5</li>
                        <li>Normal weight: BMI 18.5 to 24.9</li>
                        <li>Overweight: BMI 25 to 29.9</li>
                        <li>Obesity: BMI 30 or greater</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* BMR & TDEE Calculator Tab */}
          <TabsContent value="bmr" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="bmr-age">Age</Label>
                <Input
                  id="bmr-age"
                  type="number"
                  placeholder="30"
                  min="1"
                  max="120"
                  value={bmrAge}
                  onChange={(e) => setBmrAge(e.target.value)}
                />
                {errors.bmrAge && (
                  <p className="text-sm text-red-500">{errors.bmrAge}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bmr-gender">Gender</Label>
                <Select
                  value={bmrGender}
                  onValueChange={(value) =>
                    setBmrGender(value as "male" | "female")
                  }
                >
                  <SelectTrigger id="bmr-gender">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bmr-height">Height (cm)</Label>
                <Input
                  id="bmr-height"
                  type="number"
                  placeholder="175"
                  min="1"
                  value={bmrHeight}
                  onChange={(e) => setBmrHeight(e.target.value)}
                />
                {errors.bmrHeight && (
                  <p className="text-sm text-red-500">{errors.bmrHeight}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bmr-weight">Weight (kg)</Label>
                <Input
                  id="bmr-weight"
                  type="number"
                  placeholder="70"
                  min="1"
                  value={bmrWeight}
                  onChange={(e) => setBmrWeight(e.target.value)}
                />
                {errors.bmrWeight && (
                  <p className="text-sm text-red-500">{errors.bmrWeight}</p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="bmr-activity">Activity Level</Label>
                <Select
                  value={bmrActivityLevel}
                  onValueChange={setBmrActivityLevel}
                >
                  <SelectTrigger id="bmr-activity">
                    <SelectValue placeholder="Select activity level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedentary">
                      Sedentary (little or no exercise)
                    </SelectItem>
                    <SelectItem value="light">
                      Lightly active (light exercise 1-3 days/week)
                    </SelectItem>
                    <SelectItem value="moderate">
                      Moderately active (moderate exercise 3-5 days/week)
                    </SelectItem>
                    <SelectItem value="active">
                      Active (hard exercise 6-7 days/week)
                    </SelectItem>
                    <SelectItem value="very-active">
                      Very active (very hard exercise & physical job)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={handleClear}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Clear
              </Button>

              <Button onClick={calculateBMR}>
                <Calculator className="mr-2 h-4 w-4" />
                Calculate
              </Button>
            </div>

            {bmrResult && (
              <div className="pt-6">
                <div className="bg-muted rounded-lg p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-1">
                        Basal Metabolic Rate (BMR)
                      </p>
                      <p className="text-3xl font-bold mb-1">
                        {bmrResult.bmr} calories/day
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Calories your body needs at complete rest
                      </p>
                    </div>

                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-1">
                        Total Daily Energy Expenditure (TDEE)
                      </p>
                      <p className="text-3xl font-bold mb-1">
                        {bmrResult.tdee} calories/day
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Calories you burn daily with your activity level
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t">
                    <h4 className="font-semibold mb-2">Calorie Goals:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="font-medium">Weight Loss</p>
                        <p className="text-muted-foreground">
                          {Math.round(bmrResult.tdee * 0.8)} calories/day
                        </p>
                      </div>
                      <div>
                        <p className="font-medium">Maintenance</p>
                        <p className="text-muted-foreground">
                          {bmrResult.tdee} calories/day
                        </p>
                      </div>
                      <div>
                        <p className="font-medium">Weight Gain</p>
                        <p className="text-muted-foreground">
                          {Math.round(bmrResult.tdee * 1.15)} calories/day
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Ideal Weight Calculator Tab */}
          <TabsContent value="ideal-weight" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="ideal-height">Height</Label>
                <div className="flex space-x-2">
                  <Input
                    id="ideal-height"
                    type="number"
                    placeholder={idealHeightUnit === "cm" ? "175" : "5.9"}
                    step="any"
                    value={idealHeight}
                    onChange={(e) => setIdealHeight(e.target.value)}
                    className="flex-1"
                  />
                  <Select
                    value={idealHeightUnit}
                    onValueChange={(value) =>
                      setIdealHeightUnit(value as "cm" | "ft")
                    }
                  >
                    <SelectTrigger className="w-[90px]">
                      <SelectValue placeholder="Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cm">cm</SelectItem>
                      <SelectItem value="ft">ft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {errors.idealHeight && (
                  <p className="text-sm text-red-500">{errors.idealHeight}</p>
                )}
                {idealHeightUnit === "ft" && (
                  <p className="text-xs text-muted-foreground">
                    Format: feet.inches (e.g., 5.9 for 5'9")
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="ideal-gender">Gender</Label>
                <Select
                  value={idealGender}
                  onValueChange={(value) =>
                    setIdealGender(value as "male" | "female")
                  }
                >
                  <SelectTrigger id="ideal-gender">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={handleClear}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Clear
              </Button>

              <Button onClick={calculateIdealWeight}>
                <Calculator className="mr-2 h-4 w-4" />
                Calculate
              </Button>
            </div>

            {idealWeightResult && (
              <div className="pt-6">
                <div className="bg-muted rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4 text-center">
                    Ideal Weight Estimates
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-background rounded p-4">
                      <p className="font-medium">Devine Formula</p>
                      <p className="text-2xl font-bold mt-1">
                        {idealWeightResult.devine}
                      </p>
                    </div>

                    <div className="bg-background rounded p-4">
                      <p className="font-medium">Miller Formula</p>
                      <p className="text-2xl font-bold mt-1">
                        {idealWeightResult.miller}
                      </p>
                    </div>

                    <div className="bg-background rounded p-4">
                      <p className="font-medium">Robinson Formula</p>
                      <p className="text-2xl font-bold mt-1">
                        {idealWeightResult.robinson}
                      </p>
                    </div>

                    <div className="bg-background rounded p-4">
                      <p className="font-medium">Hamwi Formula</p>
                      <p className="text-2xl font-bold mt-1">
                        {idealWeightResult.hamwi}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t text-sm text-muted-foreground">
                    <p>
                      These formulas provide estimates based on height and
                      gender. Actual healthy weight varies by body composition,
                      age, and other factors.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </CardContent>
      </Tabs>

      <CardFooter className="flex flex-col space-y-4">
        <div className="bg-muted p-4 rounded-lg w-full">
          <h3 className="font-semibold mb-2">About These Calculators</h3>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-4">
            <li>
              <strong>BMI (Body Mass Index)</strong> - Measures body fat based
              on height and weight
            </li>
            <li>
              <strong>BMR (Basal Metabolic Rate)</strong> - Calories your body
              needs at complete rest
            </li>
            <li>
              <strong>TDEE (Total Daily Energy Expenditure)</strong> - Total
              calories burned daily based on activity level
            </li>
            <li>
              <strong>Ideal Weight</strong> - Estimated weight ranges based on
              height and gender using various formulas
            </li>
          </ul>
          <p className="mt-3 text-sm text-muted-foreground">
            <strong>Note:</strong> These calculations provide estimates and
            should not replace professional medical advice.
          </p>
        </div>
      </CardFooter>
    </Card>
  );
};

export default HealthCalculator;
