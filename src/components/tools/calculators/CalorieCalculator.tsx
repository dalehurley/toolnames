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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Utensils, RefreshCw } from "lucide-react";

export const CalorieCalculator = () => {
  // Form state
  const [age, setAge] = useState<string>("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [height, setHeight] = useState<string>("");
  const [weight, setWeight] = useState<string>("");
  const [heightUnit, setHeightUnit] = useState<"cm" | "in">("cm");
  const [weightUnit, setWeightUnit] = useState<"kg" | "lb">("kg");
  const [activityLevel, setActivityLevel] = useState<string>("moderate");
  const [goal, setGoal] = useState<"maintain" | "lose" | "gain">("maintain");

  // Results state
  const [calorieResult, setCalorieResult] = useState<{
    bmr: number;
    maintenance: number;
    target: number;
    protein: { min: number; max: number };
    carbs: { min: number; max: number };
    fat: { min: number; max: number };
  } | null>(null);

  // Error handling
  const [errors, setErrors] = useState<{
    age?: string;
    height?: string;
    weight?: string;
  }>({});

  // Handle clearing form fields
  const handleClear = () => {
    setAge("");
    setGender("male");
    setHeight("");
    setWeight("");
    setHeightUnit("cm");
    setWeightUnit("kg");
    setActivityLevel("moderate");
    setGoal("maintain");
    setCalorieResult(null);
    setErrors({});
  };

  // Handle input changes and calculate calories in real-time
  const handleCalorieChange = (field: string, value: string) => {
    // Update the state for the changed field
    switch (field) {
      case "age":
        setAge(value);
        break;
      case "gender":
        setGender(value as "male" | "female");
        break;
      case "height":
        setHeight(value);
        break;
      case "weight":
        setWeight(value);
        break;
      case "heightUnit":
        setHeightUnit(value as "cm" | "in");
        break;
      case "weightUnit":
        setWeightUnit(value as "kg" | "lb");
        break;
      case "activityLevel":
        setActivityLevel(value);
        break;
      case "goal":
        setGoal(value as "maintain" | "lose" | "gain");
        break;
      default:
        break;
    }

    // Prepare values for calculation
    const newAge = field === "age" ? value : age;
    const newGender =
      field === "gender" ? (value as "male" | "female") : gender;
    const newHeight = field === "height" ? value : height;
    const newWeight = field === "weight" ? value : weight;
    const newHeightUnit =
      field === "heightUnit" ? (value as "cm" | "in") : heightUnit;
    const newWeightUnit =
      field === "weightUnit" ? (value as "kg" | "lb") : weightUnit;
    const newActivityLevel = field === "activityLevel" ? value : activityLevel;
    const newGoal =
      field === "goal" ? (value as "maintain" | "lose" | "gain") : goal;

    // Validate inputs
    const newErrors: typeof errors = {};

    if (!newAge) {
      newErrors.age = "Age is required";
    } else if (parseInt(newAge, 10) <= 0 || parseInt(newAge, 10) > 120) {
      newErrors.age = "Age must be between 1 and 120";
    }

    if (!newHeight) {
      newErrors.height = "Height is required";
    } else if (parseFloat(newHeight) <= 0) {
      newErrors.height = "Height must be greater than 0";
    }

    if (!newWeight) {
      newErrors.weight = "Weight is required";
    } else if (parseFloat(newWeight) <= 0) {
      newErrors.weight = "Weight must be greater than 0";
    }

    setErrors(newErrors);

    // If there are errors, don't calculate
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    // Convert height and weight to metric
    const heightInCm = convertHeightToCm(newHeight, newHeightUnit);
    const weightInKg = convertWeightToKg(newWeight, newWeightUnit);
    const ageValue = parseInt(newAge, 10);

    // Calculate BMR using Mifflin-St Jeor Equation
    let bmr;
    if (newGender === "male") {
      bmr = 10 * weightInKg + 6.25 * heightInCm - 5 * ageValue + 5;
    } else {
      bmr = 10 * weightInKg + 6.25 * heightInCm - 5 * ageValue - 161;
    }

    // Calculate maintenance calories based on activity level
    let activityMultiplier;
    switch (newActivityLevel) {
      case "sedentary":
        activityMultiplier = 1.2;
        break;
      case "light":
        activityMultiplier = 1.375;
        break;
      case "moderate":
        activityMultiplier = 1.55;
        break;
      case "active":
        activityMultiplier = 1.725;
        break;
      case "very-active":
        activityMultiplier = 1.9;
        break;
      default:
        activityMultiplier = 1.55;
    }

    const maintenanceCalories = bmr * activityMultiplier;

    // Calculate target calories based on goal
    let targetCalories;
    switch (newGoal) {
      case "lose":
        targetCalories = maintenanceCalories * 0.8; // 20% deficit
        break;
      case "gain":
        targetCalories = maintenanceCalories * 1.15; // 15% surplus
        break;
      default:
        targetCalories = maintenanceCalories;
    }

    // Calculate macronutrient ranges
    // Protein: 1.6-2.2g per kg of bodyweight
    const minProtein = Math.round(weightInKg * 1.6);
    const maxProtein = Math.round(weightInKg * 2.2);

    // Fat: 20-35% of total calories
    const minFat = Math.round((targetCalories * 0.2) / 9);
    const maxFat = Math.round((targetCalories * 0.35) / 9);

    // Calculate protein calories
    const minProteinCalories = minProtein * 4;
    const maxProteinCalories = maxProtein * 4;

    // Calculate fat calories
    const minFatCalories = minFat * 9;
    const maxFatCalories = maxFat * 9;

    // Carbs: remaining calories
    const maxCarbCalories =
      targetCalories - minProteinCalories - minFatCalories;
    const minCarbCalories =
      targetCalories - maxProteinCalories - maxFatCalories;

    const minCarbs = Math.round(minCarbCalories / 4);
    const maxCarbs = Math.round(maxCarbCalories / 4);

    setCalorieResult({
      bmr: Math.round(bmr),
      maintenance: Math.round(maintenanceCalories),
      target: Math.round(targetCalories),
      protein: { min: minProtein, max: maxProtein },
      carbs: { min: minCarbs, max: maxCarbs },
      fat: { min: minFat, max: maxFat },
    });
  };

  // Convert height to cm
  const convertHeightToCm = (value: string, unit: "cm" | "in"): number => {
    if (unit === "cm") {
      return parseFloat(value);
    } else {
      return parseFloat(value) * 2.54; // inches to cm
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

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Utensils className="h-6 w-6" />
          Calorie Calculator
        </CardTitle>
        <CardDescription>
          Calculate your daily calorie needs based on your body metrics and
          goals
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              type="number"
              placeholder="30"
              min="1"
              max="120"
              value={age}
              onChange={(e) => handleCalorieChange("age", e.target.value)}
            />
            {errors.age && <p className="text-sm text-red-500">{errors.age}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <Select
              value={gender}
              onValueChange={(value: string) =>
                handleCalorieChange("gender", value)
              }
            >
              <SelectTrigger id="gender">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="height">Height</Label>
            <div className="flex space-x-2">
              <Input
                id="height"
                type="number"
                placeholder={heightUnit === "cm" ? "175" : "69"}
                step="any"
                value={height}
                onChange={(e) => handleCalorieChange("height", e.target.value)}
                className="flex-1"
              />
              <Select
                value={heightUnit}
                onValueChange={(value: string) =>
                  handleCalorieChange("heightUnit", value)
                }
              >
                <SelectTrigger className="w-[90px]">
                  <SelectValue placeholder="Unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cm">cm</SelectItem>
                  <SelectItem value="in">in</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {errors.height && (
              <p className="text-sm text-red-500">{errors.height}</p>
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
                onChange={(e) => handleCalorieChange("weight", e.target.value)}
                className="flex-1"
              />
              <Select
                value={weightUnit}
                onValueChange={(value: string) =>
                  handleCalorieChange("weightUnit", value)
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

        <div className="space-y-3">
          <Label>Activity Level</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <Button
              type="button"
              variant={activityLevel === "sedentary" ? "default" : "outline"}
              className="justify-start"
              onClick={() => handleCalorieChange("activityLevel", "sedentary")}
            >
              Sedentary (little or no exercise)
            </Button>
            <Button
              type="button"
              variant={activityLevel === "light" ? "default" : "outline"}
              className="justify-start"
              onClick={() => setActivityLevel("light")}
            >
              Lightly active (1-3 days/week)
            </Button>
            <Button
              type="button"
              variant={activityLevel === "moderate" ? "default" : "outline"}
              className="justify-start"
              onClick={() => setActivityLevel("moderate")}
            >
              Moderately active (3-5 days/week)
            </Button>
            <Button
              type="button"
              variant={activityLevel === "active" ? "default" : "outline"}
              className="justify-start"
              onClick={() => setActivityLevel("active")}
            >
              Very active (6-7 days/week)
            </Button>
            <Button
              type="button"
              variant={activityLevel === "very-active" ? "default" : "outline"}
              className="justify-start"
              onClick={() => setActivityLevel("very-active")}
            >
              Extra active (physical job or 2x training)
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <Label>Goal</Label>
          <div className="flex flex-col md:flex-row gap-2">
            <Button
              type="button"
              variant={goal === "lose" ? "default" : "outline"}
              className="flex-1"
              onClick={() => setGoal("lose")}
            >
              Lose Weight
            </Button>
            <Button
              type="button"
              variant={goal === "maintain" ? "default" : "outline"}
              className="flex-1"
              onClick={() => setGoal("maintain")}
            >
              Maintain Weight
            </Button>
            <Button
              type="button"
              variant={goal === "gain" ? "default" : "outline"}
              className="flex-1"
              onClick={() => setGoal("gain")}
            >
              Gain Weight
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between gap-4 pt-2">
          <Button variant="outline" onClick={handleClear}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Clear
          </Button>
        </div>

        {calorieResult && (
          <div className="bg-muted rounded-lg p-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-muted-foreground mb-1">
                Your Daily Calorie Needs
              </h3>
              <p className="text-4xl font-bold mb-2">
                {calorieResult.target} calories
              </p>
              <p className="text-sm text-muted-foreground">
                Based on your{" "}
                {goal === "maintain"
                  ? "maintenance"
                  : goal === "lose"
                  ? "weight loss"
                  : "weight gain"}{" "}
                goal
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-background rounded p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">BMR</p>
                <p className="text-xl font-semibold">
                  {calorieResult.bmr} calories
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Calories at complete rest
                </p>
              </div>

              <div className="bg-background rounded p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">
                  Maintenance
                </p>
                <p className="text-xl font-semibold">
                  {calorieResult.maintenance} calories
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  To maintain current weight
                </p>
              </div>

              <div className="bg-background rounded p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">Target</p>
                <p className="text-xl font-semibold">
                  {calorieResult.target} calories
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  For your{" "}
                  {goal === "maintain"
                    ? "maintenance"
                    : goal === "lose"
                    ? "weight loss"
                    : "weight gain"}{" "}
                  goal
                </p>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">Recommended Macronutrients</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="font-medium">Protein</p>
                  <p className="text-muted-foreground">
                    {calorieResult.protein.min}-{calorieResult.protein.max}g per
                    day
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {Math.round(calorieResult.protein.min * 4)}-
                    {Math.round(calorieResult.protein.max * 4)} calories
                  </p>
                </div>

                <div>
                  <p className="font-medium">Carbohydrates</p>
                  <p className="text-muted-foreground">
                    {calorieResult.carbs.min}-{calorieResult.carbs.max}g per day
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {Math.round(calorieResult.carbs.min * 4)}-
                    {Math.round(calorieResult.carbs.max * 4)} calories
                  </p>
                </div>

                <div>
                  <p className="font-medium">Fat</p>
                  <p className="text-muted-foreground">
                    {calorieResult.fat.min}-{calorieResult.fat.max}g per day
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {Math.round(calorieResult.fat.min * 9)}-
                    {Math.round(calorieResult.fat.max * 9)} calories
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col space-y-4">
        <div className="bg-muted p-4 rounded-lg w-full">
          <h3 className="font-semibold mb-2">About This Calculator</h3>
          <p className="text-sm text-muted-foreground">
            This calculator uses the Mifflin-St Jeor equation to estimate your
            Basal Metabolic Rate (BMR) and then applies an activity multiplier
            to determine your Total Daily Energy Expenditure (TDEE).
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            <strong>Note:</strong> These calculations provide estimates and
            should not replace professional medical or nutritional advice.
            Individual needs may vary.
          </p>
        </div>
      </CardFooter>
    </Card>
  );
};

export default CalorieCalculator;
