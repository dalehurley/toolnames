import { useState, useMemo } from "react";
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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Scale, RefreshCw, Info } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

// Body fat category definitions by gender
const BODY_FAT_CATEGORIES = {
  male: [
    { name: "Essential", min: 2, max: 6, color: "#3b82f6" },
    { name: "Athlete", min: 6, max: 14, color: "#22c55e" },
    { name: "Fitness", min: 14, max: 18, color: "#10b981" },
    { name: "Average", min: 18, max: 25, color: "#eab308" },
    { name: "Obese", min: 25, max: 40, color: "#ef4444" },
  ],
  female: [
    { name: "Essential", min: 10, max: 14, color: "#3b82f6" },
    { name: "Athlete", min: 14, max: 21, color: "#22c55e" },
    { name: "Fitness", min: 21, max: 25, color: "#10b981" },
    { name: "Average", min: 25, max: 32, color: "#eab308" },
    { name: "Obese", min: 32, max: 45, color: "#ef4444" },
  ],
};

interface BodyFatResults {
  navyBodyFat: number;
  deurenbergBodyFat: number;
  averageBodyFat: number;
  bmi: number;
  leanMass: number;
  fatMass: number;
  category: string;
}

interface ValidationErrors {
  age?: string;
  height?: string;
  weight?: string;
  waist?: string;
  neck?: string;
  hip?: string;
}

// Get body fat category based on percentage and gender
const getBodyFatCategory = (
  bodyFat: number,
  gender: "male" | "female"
): string => {
  const categories = BODY_FAT_CATEGORIES[gender];
  for (const cat of categories) {
    if (bodyFat < cat.max) {
      return cat.name;
    }
  }
  return "Obese";
};

// Get category color
const getCategoryColor = (
  bodyFat: number,
  gender: "male" | "female"
): string => {
  const categories = BODY_FAT_CATEGORIES[gender];
  for (const cat of categories) {
    if (bodyFat < cat.max) {
      return cat.color;
    }
  }
  return "#ef4444";
};

// Body Fat Gauge Component
const BodyFatGauge = ({
  bodyFat,
  gender,
}: {
  bodyFat: number;
  gender: "male" | "female";
}) => {
  const categories = BODY_FAT_CATEGORIES[gender];
  const maxRange = gender === "male" ? 40 : 45;
  const position = Math.min(Math.max((bodyFat / maxRange) * 100, 0), 100);

  return (
    <div className="mt-4">
      <div className="relative h-8 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div className="absolute inset-0 flex">
          {categories.map((cat) => {
            const width = ((cat.max - cat.min) / maxRange) * 100;
            return (
              <div
                key={cat.name}
                className="flex items-center justify-center text-white text-xs font-medium"
                style={{ width: `${width}%`, backgroundColor: cat.color }}
              >
                <span className="truncate px-1 hidden sm:inline">
                  {cat.name}
                </span>
              </div>
            );
          })}
        </div>
        {/* Current position marker */}
        <div
          className="absolute top-0 h-full w-1 bg-black dark:bg-white"
          style={{ left: `${position}%`, transform: "translateX(-50%)" }}
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground mt-1">
        <span>{gender === "male" ? "2%" : "10%"}</span>
        <span>{gender === "male" ? "40%" : "45%"}</span>
      </div>
    </div>
  );
};

// Method Comparison Chart
const MethodComparisonChart = ({
  navyResult,
  deurenbergResult,
}: {
  navyResult: number;
  deurenbergResult: number;
}) => {
  const data = [
    { method: "US Navy", bodyFat: navyResult, fill: "#3b82f6" },
    { method: "Deurenberg", bodyFat: deurenbergResult, fill: "#10b981" },
  ];

  return (
    <div className="bg-muted rounded-lg p-4">
      <h4 className="font-semibold mb-4">Method Comparison</h4>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" domain={[0, "auto"]} unit="%" />
            <YAxis type="category" dataKey="method" width={100} />
            <Tooltip
              formatter={(value: number) => [`${value.toFixed(1)}%`, "Body Fat"]}
            />
            <Bar dataKey="bodyFat" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Category Reference
const CategoryReference = ({ gender }: { gender: "male" | "female" }) => {
  const categories = BODY_FAT_CATEGORIES[gender];

  return (
    <div className="bg-muted rounded-lg p-4">
      <h4 className="font-semibold mb-3">Body Fat Categories ({gender === "male" ? "Male" : "Female"})</h4>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {categories.map((cat) => (
          <div key={cat.name} className="text-center">
            <div
              className="h-3 rounded mb-1"
              style={{ backgroundColor: cat.color }}
            />
            <p className="text-xs font-medium">{cat.name}</p>
            <p className="text-xs text-muted-foreground">
              {cat.min}-{cat.max}%
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export const BodyFatCalculator = () => {
  const [activeTab, setActiveTab] = useState("calculator");
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [age, setAge] = useState<string>("");
  const [height, setHeight] = useState<string>("");
  const [feet, setFeet] = useState<string>("");
  const [inches, setInches] = useState<string>("");
  const [weight, setWeight] = useState<string>("");
  const [waist, setWaist] = useState<string>("");
  const [neck, setNeck] = useState<string>("");
  const [hip, setHip] = useState<string>("");
  const [errors, setErrors] = useState<ValidationErrors>({});

  // Convert measurements to metric
  const getHeightCm = (): number => {
    if (unit === "metric") {
      return parseFloat(height) || 0;
    }
    const ft = parseFloat(feet) || 0;
    const inch = parseFloat(inches) || 0;
    return (ft * 12 + inch) * 2.54;
  };

  const getWeightKg = (): number => {
    const val = parseFloat(weight) || 0;
    return unit === "metric" ? val : val * 0.453592;
  };

  const getCircumferenceCm = (value: string): number => {
    const val = parseFloat(value) || 0;
    return unit === "metric" ? val : val * 2.54;
  };

  // Calculate results
  const results = useMemo((): BodyFatResults | null => {
    const ageVal = parseInt(age, 10);
    const heightCm = getHeightCm();
    const weightKg = getWeightKg();
    const waistCm = getCircumferenceCm(waist);
    const neckCm = getCircumferenceCm(neck);
    const hipCm = getCircumferenceCm(hip);

    // Validate required fields
    if (!ageVal || !heightCm || !weightKg || !waistCm || !neckCm) {
      return null;
    }
    if (gender === "female" && !hipCm) {
      return null;
    }
    if (waistCm <= neckCm) {
      return null;
    }

    // Calculate BMI
    const heightM = heightCm / 100;
    const bmi = weightKg / (heightM * heightM);

    // US Navy Method
    let navyBodyFat: number;
    if (gender === "male") {
      navyBodyFat =
        495 /
          (1.0324 -
            0.19077 * Math.log10(waistCm - neckCm) +
            0.15456 * Math.log10(heightCm)) -
        450;
    } else {
      navyBodyFat =
        495 /
          (1.29579 -
            0.35004 * Math.log10(waistCm + hipCm - neckCm) +
            0.221 * Math.log10(heightCm)) -
        450;
    }
    navyBodyFat = Math.max(2, Math.min(60, navyBodyFat));

    // Deurenberg Method
    const genderFactor = gender === "male" ? 1 : 0;
    let deurenbergBodyFat =
      1.2 * bmi + 0.23 * ageVal - 10.8 * genderFactor - 5.4;
    deurenbergBodyFat = Math.max(2, Math.min(60, deurenbergBodyFat));

    // Average of both methods
    const averageBodyFat = (navyBodyFat + deurenbergBodyFat) / 2;

    // Body composition
    const fatMass = (averageBodyFat / 100) * weightKg;
    const leanMass = weightKg - fatMass;

    // Convert back to imperial if needed
    const displayFatMass = unit === "metric" ? fatMass : fatMass * 2.20462;
    const displayLeanMass = unit === "metric" ? leanMass : leanMass * 2.20462;

    return {
      navyBodyFat,
      deurenbergBodyFat,
      averageBodyFat,
      bmi,
      leanMass: displayLeanMass,
      fatMass: displayFatMass,
      category: getBodyFatCategory(averageBodyFat, gender),
    };
  }, [age, height, feet, inches, weight, waist, neck, hip, gender, unit]);

  // Validate inputs
  const validateInputs = (): ValidationErrors => {
    const newErrors: ValidationErrors = {};

    if (age) {
      const ageVal = parseInt(age, 10);
      if (ageVal < 18 || ageVal > 100) {
        newErrors.age = "Age must be between 18 and 100";
      }
    }

    if (unit === "metric" && height) {
      const heightVal = parseFloat(height);
      if (heightVal < 100 || heightVal > 250) {
        newErrors.height = "Height must be between 100-250 cm";
      }
    }

    if (weight) {
      const weightVal = parseFloat(weight);
      if (unit === "metric" && (weightVal < 30 || weightVal > 300)) {
        newErrors.weight = "Weight must be between 30-300 kg";
      } else if (unit === "imperial" && (weightVal < 66 || weightVal > 660)) {
        newErrors.weight = "Weight must be between 66-660 lbs";
      }
    }

    if (waist && neck) {
      const waistCm = getCircumferenceCm(waist);
      const neckCm = getCircumferenceCm(neck);
      if (waistCm <= neckCm) {
        newErrors.waist = "Waist must be larger than neck";
      }
    }

    return newErrors;
  };

  // Handle input changes with validation
  const handleInputChange = (field: string, value: string) => {
    switch (field) {
      case "age":
        setAge(value);
        break;
      case "height":
        setHeight(value);
        break;
      case "feet":
        setFeet(value);
        break;
      case "inches":
        setInches(value);
        break;
      case "weight":
        setWeight(value);
        break;
      case "waist":
        setWaist(value);
        break;
      case "neck":
        setNeck(value);
        break;
      case "hip":
        setHip(value);
        break;
    }

    // Validate after state update
    setTimeout(() => {
      setErrors(validateInputs());
    }, 0);
  };

  const handleUnitChange = (value: string) => {
    if (value) {
      setUnit(value as "metric" | "imperial");
      // Clear all measurements when switching units
      setHeight("");
      setFeet("");
      setInches("");
      setWeight("");
      setWaist("");
      setNeck("");
      setHip("");
      setErrors({});
    }
  };

  const handleGenderChange = (value: string) => {
    setGender(value as "male" | "female");
    if (value === "male") {
      setHip("");
    }
  };

  const clearInputs = () => {
    setAge("");
    setHeight("");
    setFeet("");
    setInches("");
    setWeight("");
    setWaist("");
    setNeck("");
    setHip("");
    setErrors({});
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Scale className="h-6 w-6" />
          Body Fat Calculator
        </CardTitle>
        <CardDescription>
          Calculate your body fat percentage using US Navy and Deurenberg
          methods
        </CardDescription>
      </CardHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="px-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="calculator">Calculator</TabsTrigger>
            <TabsTrigger value="results">Results & Analysis</TabsTrigger>
          </TabsList>
        </div>

        <CardContent className="pt-6">
          <TabsContent value="calculator" className="space-y-6 mt-0">
            {/* Unit Toggle */}
            <div className="space-y-2">
              <Label>Units</Label>
              <ToggleGroup
                type="single"
                value={unit}
                onValueChange={handleUnitChange}
                className="justify-start"
              >
                <ToggleGroupItem value="metric">Metric (kg, cm)</ToggleGroupItem>
                <ToggleGroupItem value="imperial">
                  Imperial (lb, in)
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            {/* Personal Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="e.g., 30"
                  value={age}
                  onChange={(e) => handleInputChange("age", e.target.value)}
                  min={18}
                  max={100}
                />
                {errors.age && (
                  <p className="text-sm text-red-500">{errors.age}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Gender</Label>
                <Select value={gender} onValueChange={handleGenderChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Height & Weight */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {unit === "metric" ? (
                <div className="space-y-2">
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    placeholder="e.g., 175"
                    value={height}
                    onChange={(e) => handleInputChange("height", e.target.value)}
                  />
                  {errors.height && (
                    <p className="text-sm text-red-500">{errors.height}</p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>Height</Label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        type="number"
                        placeholder="Feet"
                        value={feet}
                        onChange={(e) =>
                          handleInputChange("feet", e.target.value)
                        }
                      />
                    </div>
                    <div className="flex-1">
                      <Input
                        type="number"
                        placeholder="Inches"
                        value={inches}
                        onChange={(e) =>
                          handleInputChange("inches", e.target.value)
                        }
                      />
                    </div>
                  </div>
                  {errors.height && (
                    <p className="text-sm text-red-500">{errors.height}</p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="weight">
                  Weight ({unit === "metric" ? "kg" : "lbs"})
                </Label>
                <Input
                  id="weight"
                  type="number"
                  placeholder={unit === "metric" ? "e.g., 70" : "e.g., 154"}
                  value={weight}
                  onChange={(e) => handleInputChange("weight", e.target.value)}
                />
                {errors.weight && (
                  <p className="text-sm text-red-500">{errors.weight}</p>
                )}
              </div>
            </div>

            {/* Circumference Measurements */}
            <div className="space-y-2">
              <Label className="text-base font-semibold">
                Body Measurements
              </Label>
              <p className="text-sm text-muted-foreground">
                Measure at the widest/narrowest point as appropriate
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="waist">
                  Waist ({unit === "metric" ? "cm" : "in"})
                </Label>
                <Input
                  id="waist"
                  type="number"
                  placeholder={unit === "metric" ? "e.g., 85" : "e.g., 33"}
                  value={waist}
                  onChange={(e) => handleInputChange("waist", e.target.value)}
                />
                {errors.waist && (
                  <p className="text-sm text-red-500">{errors.waist}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="neck">
                  Neck ({unit === "metric" ? "cm" : "in"})
                </Label>
                <Input
                  id="neck"
                  type="number"
                  placeholder={unit === "metric" ? "e.g., 38" : "e.g., 15"}
                  value={neck}
                  onChange={(e) => handleInputChange("neck", e.target.value)}
                />
                {errors.neck && (
                  <p className="text-sm text-red-500">{errors.neck}</p>
                )}
              </div>

              {gender === "female" && (
                <div className="space-y-2">
                  <Label htmlFor="hip">
                    Hip ({unit === "metric" ? "cm" : "in"})
                  </Label>
                  <Input
                    id="hip"
                    type="number"
                    placeholder={unit === "metric" ? "e.g., 95" : "e.g., 37"}
                    value={hip}
                    onChange={(e) => handleInputChange("hip", e.target.value)}
                  />
                  {errors.hip && (
                    <p className="text-sm text-red-500">{errors.hip}</p>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={clearInputs}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Clear
              </Button>
              {results && (
                <Button onClick={() => setActiveTab("results")}>
                  View Results
                </Button>
              )}
            </div>
          </TabsContent>

          <TabsContent value="results" className="space-y-6 mt-0">
            {results ? (
              <>
                {/* Primary Result Display */}
                <div className="bg-muted rounded-lg p-6">
                  <div className="text-center mb-4">
                    <p className="text-sm text-muted-foreground mb-1">
                      Average Body Fat
                    </p>
                    <p
                      className="text-5xl font-bold mb-2"
                      style={{ color: getCategoryColor(results.averageBodyFat, gender) }}
                    >
                      {results.averageBodyFat.toFixed(1)}%
                    </p>
                    <p className="text-lg font-medium">{results.category}</p>
                  </div>
                  <BodyFatGauge bodyFat={results.averageBodyFat} gender={gender} />
                </div>

                {/* Method Results */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">
                      US Navy Method
                    </h4>
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {results.navyBodyFat.toFixed(1)}%
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Based on circumference measurements
                    </p>
                  </div>

                  <div className="bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
                    <h4 className="font-semibold text-emerald-700 dark:text-emerald-300 mb-2">
                      Deurenberg Method
                    </h4>
                    <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                      {results.deurenbergBodyFat.toFixed(1)}%
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Based on BMI, age, and gender
                    </p>
                  </div>
                </div>

                {/* Body Composition */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-muted rounded-lg p-4 text-center">
                    <p className="text-sm text-muted-foreground">BMI</p>
                    <p className="text-2xl font-bold">{results.bmi.toFixed(1)}</p>
                  </div>
                  <div className="bg-muted rounded-lg p-4 text-center">
                    <p className="text-sm text-muted-foreground">Lean Mass</p>
                    <p className="text-2xl font-bold">
                      {results.leanMass.toFixed(1)}{" "}
                      {unit === "metric" ? "kg" : "lbs"}
                    </p>
                  </div>
                  <div className="bg-muted rounded-lg p-4 text-center">
                    <p className="text-sm text-muted-foreground">Fat Mass</p>
                    <p className="text-2xl font-bold">
                      {results.fatMass.toFixed(1)}{" "}
                      {unit === "metric" ? "kg" : "lbs"}
                    </p>
                  </div>
                </div>

                {/* Method Comparison Chart */}
                <MethodComparisonChart
                  navyResult={results.navyBodyFat}
                  deurenbergResult={results.deurenbergBodyFat}
                />

                {/* Category Reference */}
                <CategoryReference gender={gender} />
              </>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Scale className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Enter your measurements in the Calculator tab to see results</p>
              </div>
            )}
          </TabsContent>
        </CardContent>
      </Tabs>

      <CardFooter className="flex flex-col space-y-4">
        <div className="bg-muted p-4 rounded-lg w-full">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Info className="h-4 w-4" />
            About These Methods
          </h3>
          <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-4">
            <li>
              <strong>US Navy Method:</strong> Uses circumference measurements
              (waist, neck, and hip for females) along with height. Generally
              considered accurate for most body types.
            </li>
            <li>
              <strong>Deurenberg Method:</strong> Uses BMI, age, and gender to
              estimate body fat. May be less accurate for athletic individuals
              with high muscle mass.
            </li>
            <li>
              Results are estimates. For precise measurements, consider DEXA
              scans, hydrostatic weighing, or other clinical methods.
            </li>
          </ul>
        </div>
      </CardFooter>
    </Card>
  );
};

export default BodyFatCalculator;
