import { useState, useEffect } from "react";
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
import { Copy, ArrowRight } from "lucide-react";

// Unit conversion types and factors
type ConversionCategory =
  | "length"
  | "weight"
  | "temperature"
  | "volume"
  | "area"
  | "time";

interface UnitOption {
  value: string;
  label: string;
  factor: number;
  convertTo?: (value: number) => number;
  convertFrom?: (value: number) => number;
}

interface UnitGroup {
  name: string;
  units: UnitOption[];
}

interface UnitConverterProps {
  initialConversionType?: string;
  initialSourceUnit?: string;
  initialTargetUnit?: string;
}

export const UnitConverter = ({
  initialConversionType,
  initialSourceUnit,
  initialTargetUnit,
}: UnitConverterProps) => {
  const [inputValue, setInputValue] = useState<string>("1");
  const [outputValue, setOutputValue] = useState<string>("");
  const [sourceUnit, setSourceUnit] = useState<string>(initialSourceUnit || "");
  const [targetUnit, setTargetUnit] = useState<string>(initialTargetUnit || "");
  const [category, setCategory] = useState<ConversionCategory>(
    (initialConversionType as ConversionCategory) || "length"
  );
  const [copied, setCopied] = useState<boolean>(false);

  // Define unit conversions for each category
  const unitGroups: Record<ConversionCategory, UnitGroup> = {
    length: {
      name: "Length",
      units: [
        { value: "mm", label: "Millimeters (mm)", factor: 0.001 },
        { value: "cm", label: "Centimeters (cm)", factor: 0.01 },
        { value: "m", label: "Meters (m)", factor: 1 },
        { value: "km", label: "Kilometers (km)", factor: 1000 },
        { value: "in", label: "Inches (in)", factor: 0.0254 },
        { value: "ft", label: "Feet (ft)", factor: 0.3048 },
        { value: "yd", label: "Yards (yd)", factor: 0.9144 },
        { value: "mi", label: "Miles (mi)", factor: 1609.344 },
      ],
    },
    weight: {
      name: "Weight",
      units: [
        { value: "mg", label: "Milligrams (mg)", factor: 0.000001 },
        { value: "g", label: "Grams (g)", factor: 0.001 },
        { value: "kg", label: "Kilograms (kg)", factor: 1 },
        { value: "t", label: "Metric Tons (t)", factor: 1000 },
        { value: "oz", label: "Ounces (oz)", factor: 0.02834952 },
        { value: "lb", label: "Pounds (lb)", factor: 0.45359237 },
        { value: "st", label: "Stone (st)", factor: 6.35029 },
        { value: "ton", label: "US Tons (ton)", factor: 907.18474 },
      ],
    },
    temperature: {
      name: "Temperature",
      units: [
        {
          value: "c",
          label: "Celsius (°C)",
          factor: 1,
          convertTo: (c) => c,
          convertFrom: (c) => c,
        },
        {
          value: "f",
          label: "Fahrenheit (°F)",
          factor: 1,
          convertTo: (c) => (c * 9) / 5 + 32,
          convertFrom: (f) => ((f - 32) * 5) / 9,
        },
        {
          value: "k",
          label: "Kelvin (K)",
          factor: 1,
          convertTo: (c) => c + 273.15,
          convertFrom: (k) => k - 273.15,
        },
      ],
    },
    volume: {
      name: "Volume",
      units: [
        { value: "ml", label: "Milliliters (ml)", factor: 0.001 },
        { value: "l", label: "Liters (l)", factor: 1 },
        { value: "m3", label: "Cubic Meters (m³)", factor: 1000 },
        { value: "gal", label: "US Gallons (gal)", factor: 3.78541 },
        { value: "qt", label: "US Quarts (qt)", factor: 0.946353 },
        { value: "pt", label: "US Pints (pt)", factor: 0.473176 },
        { value: "fl-oz", label: "US Fluid Ounces (fl oz)", factor: 0.0295735 },
        { value: "cup", label: "US Cups", factor: 0.24 },
        { value: "tbsp", label: "Tablespoons", factor: 0.015 },
        { value: "tsp", label: "Teaspoons", factor: 0.005 },
      ],
    },
    area: {
      name: "Area",
      units: [
        { value: "mm2", label: "Square Millimeters (mm²)", factor: 0.000001 },
        { value: "cm2", label: "Square Centimeters (cm²)", factor: 0.0001 },
        { value: "m2", label: "Square Meters (m²)", factor: 1 },
        { value: "km2", label: "Square Kilometers (km²)", factor: 1000000 },
        { value: "ha", label: "Hectares (ha)", factor: 10000 },
        { value: "in2", label: "Square Inches (in²)", factor: 0.00064516 },
        { value: "ft2", label: "Square Feet (ft²)", factor: 0.092903 },
        { value: "yd2", label: "Square Yards (yd²)", factor: 0.836127 },
        { value: "ac", label: "Acres (ac)", factor: 4046.86 },
        { value: "mi2", label: "Square Miles (mi²)", factor: 2589988.11 },
      ],
    },
    time: {
      name: "Time",
      units: [
        { value: "ms", label: "Milliseconds (ms)", factor: 0.001 },
        { value: "s", label: "Seconds (s)", factor: 1 },
        { value: "min", label: "Minutes (min)", factor: 60 },
        { value: "h", label: "Hours (h)", factor: 3600 },
        { value: "d", label: "Days (d)", factor: 86400 },
        { value: "wk", label: "Weeks (wk)", factor: 604800 },
        { value: "mo", label: "Months (30 days)", factor: 2592000 },
        { value: "yr", label: "Years (365 days)", factor: 31536000 },
      ],
    },
  };

  // Set default units when category changes or when they aren't already set
  useEffect(() => {
    const units = unitGroups[category].units;

    // Only set default units if they aren't already set or if we're changing categories
    if (
      !sourceUnit ||
      !unitGroups[category].units.some((u) => u.value === sourceUnit)
    ) {
      setSourceUnit(initialSourceUnit || units[0].value);
    }

    if (
      !targetUnit ||
      !unitGroups[category].units.some((u) => u.value === targetUnit)
    ) {
      setTargetUnit(initialTargetUnit || units[1].value);
    }
  }, [category, initialSourceUnit, initialTargetUnit, sourceUnit, targetUnit]);

  // Perform conversion when input or units change
  useEffect(() => {
    if (!sourceUnit || !targetUnit) return;

    const inputNum = parseFloat(inputValue);
    if (isNaN(inputNum)) {
      setOutputValue("");
      return;
    }

    let result: number;

    // Handle temperature conversions separately
    if (category === "temperature") {
      const sourceUnitObj = unitGroups.temperature.units.find(
        (u) => u.value === sourceUnit
      );
      const targetUnitObj = unitGroups.temperature.units.find(
        (u) => u.value === targetUnit
      );

      if (
        sourceUnitObj &&
        targetUnitObj &&
        sourceUnitObj.convertFrom &&
        targetUnitObj.convertTo
      ) {
        // Convert to celsius first (our base unit for temperature)
        const inCelsius = sourceUnitObj.convertFrom(inputNum);
        // Then convert from celsius to target unit
        result = targetUnitObj.convertTo(inCelsius);
      } else {
        result = 0;
      }
    } else {
      // For other unit types, use the factor-based conversion
      const sourceUnitObj = unitGroups[category].units.find(
        (u) => u.value === sourceUnit
      );
      const targetUnitObj = unitGroups[category].units.find(
        (u) => u.value === targetUnit
      );

      if (sourceUnitObj && targetUnitObj) {
        // Convert to base unit, then to target unit
        const baseValue = inputNum * sourceUnitObj.factor;
        result = baseValue / targetUnitObj.factor;
      } else {
        result = 0;
      }
    }

    // Format the result based on its size
    if (Math.abs(result) >= 1000000 || Math.abs(result) < 0.001) {
      setOutputValue(result.toExponential(6));
    } else {
      // Use a reasonable number of decimal places
      setOutputValue(result.toPrecision(7).replace(/\.?0+$/, ""));
    }
  }, [inputValue, sourceUnit, targetUnit, category]);

  const handleCategoryChange = (value: string) => {
    setCategory(value as ConversionCategory);
  };

  const handleSwapUnits = () => {
    const temp = sourceUnit;
    setSourceUnit(targetUnit);
    setTargetUnit(temp);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(outputValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Unit Converter</CardTitle>
        <CardDescription>
          Convert between different units of measurement
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs
          defaultValue="length"
          value={category}
          onValueChange={handleCategoryChange}
          className="w-full"
        >
          <TabsList className="grid grid-cols-2 md:grid-cols-6 w-full">
            <TabsTrigger value="length">Length</TabsTrigger>
            <TabsTrigger value="weight">Weight</TabsTrigger>
            <TabsTrigger value="temperature">Temperature</TabsTrigger>
            <TabsTrigger value="volume">Volume</TabsTrigger>
            <TabsTrigger value="area">Area</TabsTrigger>
            <TabsTrigger value="time">Time</TabsTrigger>
          </TabsList>

          {Object.keys(unitGroups).map((cat) => (
            <TabsContent key={cat} value={cat} className="mt-4">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-end">
                <div className="space-y-2 lg:col-span-2">
                  <Label htmlFor="inputValue">From</Label>
                  <Input
                    id="inputValue"
                    type="text"
                    inputMode="decimal"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="text-right"
                  />
                </div>

                <div className="space-y-2 lg:col-span-2">
                  <Label htmlFor="sourceUnit">Source Unit</Label>
                  <select
                    id="sourceUnit"
                    value={sourceUnit}
                    onChange={(e) => setSourceUnit(e.target.value)}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    {unitGroups[cat as ConversionCategory].units.map((unit) => (
                      <option key={unit.value} value={unit.value}>
                        {unit.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-center items-center">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleSwapUnits}
                    className="rotate-90 lg:rotate-0"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2 lg:col-span-2">
                  <Label htmlFor="outputValue">To</Label>
                  <Input
                    id="outputValue"
                    value={outputValue}
                    readOnly
                    className="text-right"
                  />
                </div>

                <div className="space-y-2 lg:col-span-2">
                  <Label htmlFor="targetUnit">Target Unit</Label>
                  <select
                    id="targetUnit"
                    value={targetUnit}
                    onChange={(e) => setTargetUnit(e.target.value)}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    {unitGroups[cat as ConversionCategory].units.map((unit) => (
                      <option key={unit.value} value={unit.value}>
                        {unit.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="lg:col-span-1">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={copyToClipboard}
                    disabled={!outputValue}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {copied && (
          <div className="bg-green-100 text-green-800 p-2 rounded-md text-sm">
            Result copied to clipboard!
          </div>
        )}

        <div className="bg-muted p-4 rounded-lg">
          <h3 className="font-medium mb-2">Common Conversion Formulas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p>
                <strong>Length:</strong>
              </p>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li>1 inch = 2.54 centimeters</li>
                <li>1 foot = 0.3048 meters</li>
                <li>1 mile = 1.60934 kilometers</li>
              </ul>
            </div>
            <div>
              <p>
                <strong>Weight:</strong>
              </p>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li>1 pound = 0.453592 kilograms</li>
                <li>1 ounce = 28.3495 grams</li>
                <li>1 stone = 6.35029 kilograms</li>
              </ul>
            </div>
            <div>
              <p>
                <strong>Temperature:</strong>
              </p>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li>°F = (°C × 9/5) + 32</li>
                <li>°C = (°F - 32) × 5/9</li>
                <li>K = °C + 273.15</li>
              </ul>
            </div>
            <div>
              <p>
                <strong>Volume:</strong>
              </p>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li>1 gallon (US) = 3.78541 liters</li>
                <li>1 cup (US) = 240 milliliters</li>
                <li>1 cubic meter = 1000 liters</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
