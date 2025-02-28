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
import { Package, RefreshCw } from "lucide-react";

export const ShippingCalculator = () => {
  // State for calculator inputs
  const [calculatorType, setCalculatorType] = useState<
    "standard" | "dimensional"
  >("standard");
  const [weight, setWeight] = useState<string>("");
  const [weightUnit, setWeightUnit] = useState<"lb" | "kg">("lb");
  const [length, setLength] = useState<string>("");
  const [width, setWidth] = useState<string>("");
  const [height, setHeight] = useState<string>("");
  const [dimensionUnit, setDimensionUnit] = useState<"in" | "cm">("in");
  const [shippingDistance, setShippingDistance] = useState<string>("");
  const [shippingDistanceUnit, setShippingDistanceUnit] = useState<"mi" | "km">(
    "mi"
  );
  const [shippingType, setShippingType] = useState<
    "standard" | "express" | "overnight"
  >("standard");

  // Results state
  const [estimatedCost, setEstimatedCost] = useState<number | null>(null);
  const [dimensionalWeight, setDimensionalWeight] = useState<number | null>(
    null
  );

  // Error handling
  const [errors, setErrors] = useState<{
    weight?: string;
    length?: string;
    width?: string;
    height?: string;
    shippingDistance?: string;
  }>({});

  // Handle clearing inputs
  const handleClear = () => {
    setWeight("");
    setLength("");
    setWidth("");
    setHeight("");
    setShippingDistance("");
    setEstimatedCost(null);
    setDimensionalWeight(null);
    setErrors({});
  };

  // Handle input changes and calculate shipping in real-time
  const handleShippingChange = (field: string, value: string) => {
    // Update the state for the changed field
    switch (field) {
      case "weight":
        setWeight(value);
        break;
      case "length":
        setLength(value);
        break;
      case "width":
        setWidth(value);
        break;
      case "height":
        setHeight(value);
        break;
      case "shippingDistance":
        setShippingDistance(value);
        break;
      case "calculatorType":
        setCalculatorType(value as "standard" | "dimensional");
        break;
      case "weightUnit":
        setWeightUnit(value as "lb" | "kg");
        break;
      case "dimensionUnit":
        setDimensionUnit(value as "in" | "cm");
        break;
      case "shippingDistanceUnit":
        setShippingDistanceUnit(value as "mi" | "km");
        break;
      case "shippingType":
        setShippingType(value as "standard" | "express" | "overnight");
        break;
      default:
        break;
    }

    // Prepare values for calculation
    const newWeight = field === "weight" ? value : weight;
    const newLength = field === "length" ? value : length;
    const newWidth = field === "width" ? value : width;
    const newHeight = field === "height" ? value : height;
    const newShippingDistance =
      field === "shippingDistance" ? value : shippingDistance;
    const newCalculatorType =
      field === "calculatorType"
        ? (value as "standard" | "dimensional")
        : calculatorType;
    const newWeightUnit =
      field === "weightUnit" ? (value as "lb" | "kg") : weightUnit;
    const newDimensionUnit =
      field === "dimensionUnit" ? (value as "in" | "cm") : dimensionUnit;
    const newShippingDistanceUnit =
      field === "shippingDistanceUnit"
        ? (value as "mi" | "km")
        : shippingDistanceUnit;
    const newShippingType =
      field === "shippingType"
        ? (value as "standard" | "express" | "overnight")
        : shippingType;

    // Validate inputs
    const newErrors: typeof errors = {};

    if (!newWeight) {
      newErrors.weight = "Weight is required";
    } else if (parseFloat(newWeight) <= 0) {
      newErrors.weight = "Weight must be greater than 0";
    }

    if (newCalculatorType === "dimensional") {
      if (!newLength) {
        newErrors.length = "Length is required";
      } else if (parseFloat(newLength) <= 0) {
        newErrors.length = "Length must be greater than 0";
      }

      if (!newWidth) {
        newErrors.width = "Width is required";
      } else if (parseFloat(newWidth) <= 0) {
        newErrors.width = "Width must be greater than 0";
      }

      if (!newHeight) {
        newErrors.height = "Height is required";
      } else if (parseFloat(newHeight) <= 0) {
        newErrors.height = "Height must be greater than 0";
      }
    }

    if (!newShippingDistance) {
      newErrors.shippingDistance = "Shipping distance is required";
    } else if (parseFloat(newShippingDistance) <= 0) {
      newErrors.shippingDistance = "Distance must be greater than 0";
    }

    setErrors(newErrors);

    // If there are errors, don't calculate
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    // Convert all measurements to standard units (lbs and inches)
    const weightInLbs = convertWeightToLbs(newWeight, newWeightUnit);
    const distanceInMiles = convertToMiles(
      newShippingDistance,
      newShippingDistanceUnit
    );

    // Base rate calculations
    const baseRatePerPound = 0.5; // $0.50 per pound
    const baseDistanceRate = 0.1; // $0.10 per mile

    // Shipping type multipliers
    const shippingTypeMultiplier =
      newShippingType === "express"
        ? 1.5
        : newShippingType === "overnight"
        ? 2.5
        : 1.0; // standard

    let calculatedCost = 0;
    let calculatedDimensionalWeight = 0;

    if (newCalculatorType === "dimensional") {
      const lengthInInches = convertToInches(newLength, newDimensionUnit);
      const widthInInches = convertToInches(newWidth, newDimensionUnit);
      const heightInInches = convertToInches(newHeight, newDimensionUnit);

      // Calculate dimensional weight (L × W × H / 166 = dimensional weight in lbs)
      calculatedDimensionalWeight =
        (lengthInInches * widthInInches * heightInInches) / 166;

      // Use the greater of actual weight or dimensional weight
      const billableWeight = Math.max(weightInLbs, calculatedDimensionalWeight);

      // Calculate cost
      calculatedCost =
        (billableWeight * baseRatePerPound +
          distanceInMiles * baseDistanceRate) *
        shippingTypeMultiplier;

      setDimensionalWeight(parseFloat(calculatedDimensionalWeight.toFixed(2)));
    } else {
      // Standard weight-based calculation
      calculatedCost =
        (weightInLbs * baseRatePerPound + distanceInMiles * baseDistanceRate) *
        shippingTypeMultiplier;
    }

    // Set the estimated cost (rounded to 2 decimal places)
    setEstimatedCost(parseFloat(calculatedCost.toFixed(2)));
  };

  // Convert weight to pounds
  const convertWeightToLbs = (value: string, unit: "lb" | "kg"): number => {
    const numValue = parseFloat(value);
    return unit === "lb" ? numValue : numValue * 2.20462;
  };

  // Convert dimensions to inches
  const convertToInches = (value: string, unit: "in" | "cm"): number => {
    const numValue = parseFloat(value);
    return unit === "in" ? numValue : numValue / 2.54;
  };

  // Convert distance to miles
  const convertToMiles = (value: string, unit: "mi" | "km"): number => {
    const numValue = parseFloat(value);
    return unit === "mi" ? numValue : numValue * 0.621371;
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Package className="h-6 w-6" />
          Shipping Cost Calculator
        </CardTitle>
        <CardDescription>
          Estimate shipping costs based on weight, dimensions, and distance
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <Tabs
          value={calculatorType}
          onValueChange={(val) =>
            setCalculatorType(val as "standard" | "dimensional")
          }
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="standard">Standard (Weight Only)</TabsTrigger>
            <TabsTrigger value="dimensional">Dimensional Weight</TabsTrigger>
          </TabsList>

          <TabsContent value="standard" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="weight">Package Weight</Label>
              <div className="flex space-x-2">
                <Input
                  id="weight"
                  type="number"
                  placeholder="10"
                  value={weight}
                  onChange={(e) =>
                    handleShippingChange("weight", e.target.value)
                  }
                  className="flex-1"
                />
                <Select
                  value={weightUnit}
                  onValueChange={(value: string) =>
                    handleShippingChange("weightUnit", value)
                  }
                >
                  <SelectTrigger className="w-[80px]">
                    <SelectValue placeholder="Unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lb">lb</SelectItem>
                    <SelectItem value="kg">kg</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {errors.weight && (
                <p className="text-sm text-red-500">{errors.weight}</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="dimensional" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="d-weight">Package Weight</Label>
              <div className="flex space-x-2">
                <Input
                  id="d-weight"
                  type="number"
                  placeholder="10"
                  value={weight}
                  onChange={(e) =>
                    handleShippingChange("weight", e.target.value)
                  }
                  className="flex-1"
                />
                <Select
                  value={weightUnit}
                  onValueChange={(value: string) =>
                    handleShippingChange("weightUnit", value)
                  }
                >
                  <SelectTrigger className="w-[80px]">
                    <SelectValue placeholder="Unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lb">lb</SelectItem>
                    <SelectItem value="kg">kg</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {errors.weight && (
                <p className="text-sm text-red-500">{errors.weight}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="length">Length</Label>
                <Input
                  id="length"
                  type="number"
                  placeholder="12"
                  value={length}
                  onChange={(e) =>
                    handleShippingChange("length", e.target.value)
                  }
                />
                {errors.length && (
                  <p className="text-sm text-red-500">{errors.length}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="width">Width</Label>
                <Input
                  id="width"
                  type="number"
                  placeholder="10"
                  value={width}
                  onChange={(e) =>
                    handleShippingChange("width", e.target.value)
                  }
                />
                {errors.width && (
                  <p className="text-sm text-red-500">{errors.width}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Height</Label>
                <Input
                  id="height"
                  type="number"
                  placeholder="8"
                  value={height}
                  onChange={(e) =>
                    handleShippingChange("height", e.target.value)
                  }
                />
                {errors.height && (
                  <p className="text-sm text-red-500">{errors.height}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dimension-unit">Dimension Unit</Label>
              <Select
                value={dimensionUnit}
                onValueChange={(value: string) =>
                  handleShippingChange("dimensionUnit", value)
                }
              >
                <SelectTrigger id="dimension-unit">
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in">inches</SelectItem>
                  <SelectItem value="cm">centimeters</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
        </Tabs>

        <div className="space-y-2">
          <Label htmlFor="shipping-distance">Shipping Distance</Label>
          <div className="flex space-x-2">
            <Input
              id="shipping-distance"
              type="number"
              placeholder="500"
              value={shippingDistance}
              onChange={(e) =>
                handleShippingChange("shippingDistance", e.target.value)
              }
              className="flex-1"
            />
            <Select
              value={shippingDistanceUnit}
              onValueChange={(value: string) =>
                handleShippingChange("shippingDistanceUnit", value)
              }
            >
              <SelectTrigger className="w-[80px]">
                <SelectValue placeholder="Unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mi">mi</SelectItem>
                <SelectItem value="km">km</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {errors.shippingDistance && (
            <p className="text-sm text-red-500">{errors.shippingDistance}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="shipping-type">Shipping Method</Label>
          <Select
            value={shippingType}
            onValueChange={(value: string) =>
              handleShippingChange("shippingType", value)
            }
          >
            <SelectTrigger id="shipping-type">
              <SelectValue placeholder="Select shipping method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="standard">Standard (3-5 days)</SelectItem>
              <SelectItem value="express">Express (2 days)</SelectItem>
              <SelectItem value="overnight">Overnight</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col sm:flex-row justify-between gap-4 pt-2">
          <Button variant="outline" onClick={handleClear}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Clear
          </Button>
        </div>

        {estimatedCost !== null && (
          <div className="bg-muted rounded-lg p-6">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-muted-foreground mb-1">
                Estimated Shipping Cost
              </h3>
              <p className="text-4xl font-bold mb-2">
                ${estimatedCost.toFixed(2)}
              </p>
              <p className="text-sm text-muted-foreground">
                {shippingType === "standard"
                  ? "Standard"
                  : shippingType === "express"
                  ? "Express"
                  : "Overnight"}{" "}
                shipping
              </p>
            </div>

            {dimensionalWeight !== null && (
              <div className="border-t pt-4 mt-2">
                <h4 className="font-semibold mb-2">Shipping Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Actual Weight</p>
                    <p className="text-sm text-muted-foreground">
                      {weight} {weightUnit}
                      {weightUnit === "kg" &&
                        ` (${convertWeightToLbs(weight, weightUnit).toFixed(
                          2
                        )} lb)`}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Dimensional Weight</p>
                    <p className="text-sm text-muted-foreground">
                      {dimensionalWeight.toFixed(2)} lb
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Billable Weight</p>
                    <p className="text-sm text-muted-foreground">
                      {Math.max(
                        convertWeightToLbs(weight, weightUnit),
                        dimensionalWeight
                      ).toFixed(2)}{" "}
                      lb
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Distance</p>
                    <p className="text-sm text-muted-foreground">
                      {shippingDistance} {shippingDistanceUnit}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col space-y-4">
        <div className="bg-muted p-4 rounded-lg w-full">
          <h3 className="font-semibold mb-2">About This Calculator</h3>
          <p className="text-sm text-muted-foreground">
            This calculator provides an estimate of shipping costs based on
            weight, dimensions, distance, and shipping method. For dimensional
            weight, the formula (L × W × H / 166) is used to calculate the
            volumetric weight in pounds.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            <strong>Note:</strong> Actual shipping costs may vary depending on
            carrier, special handling requirements, fuel surcharges, and other
            factors. This calculation is for estimation purposes only.
          </p>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ShippingCalculator;
