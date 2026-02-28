import { UnitConverter } from "@/components/tools/converters/UnitConverter";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

// Define mapping from URL-friendly names to actual unit values
const unitMappings: Record<string, Record<string, string>> = {
  length: {
    millimeters: "mm",
    centimeters: "cm",
    meters: "m",
    kilometers: "km",
    inches: "in",
    feet: "ft",
    yards: "yd",
    miles: "mi",
  },
  weight: {
    milligrams: "mg",
    grams: "g",
    kilograms: "kg",
    tons: "t",
    ounces: "oz",
    pounds: "lb",
    stones: "st",
  },
  temperature: {
    celsius: "c",
    fahrenheit: "f",
    kelvin: "k",
  },
  volume: {
    milliliters: "ml",
    liters: "l",
    "cubic-meters": "m3",
    gallons: "gal",
    quarts: "qt",
    pints: "pt",
    "fluid-ounces": "fl-oz",
    cups: "cup",
    tablespoons: "tbsp",
    teaspoons: "tsp",
  },
  area: {
    "square-millimeters": "mm2",
    "square-centimeters": "cm2",
    "square-meters": "m2",
    "square-kilometers": "km2",
    hectares: "ha",
    "square-inches": "in2",
    "square-feet": "ft2",
    "square-yards": "yd2",
    acres: "ac",
    "square-miles": "mi2",
  },
  time: {
    milliseconds: "ms",
    seconds: "s",
    minutes: "min",
    hours: "h",
    days: "d",
    weeks: "wk",
    months: "mo",
    years: "yr",
  },
};

interface UnitConverterPageProps {
  fromUnit: string;
  toUnit: string;
  category: string;
}

export const UnitConverterPage = ({
  fromUnit,
  toUnit,
  category,
}: UnitConverterPageProps) => {

  // Map the URL parameter values to the actual unit values used by the UnitConverter
  const mappedSourceUnit = unitMappings[category]?.[fromUnit] || "";
  const mappedTargetUnit = unitMappings[category]?.[toUnit] || "";

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          size="sm"
          asChild
          className="flex items-center space-x-2"
        >
          <a href="/converters">
            <ChevronLeft className="h-4 w-4" />
            <span>Back</span>
          </a>
        </Button>
      </div>

      <div className="pb-12">
        <UnitConverter
          initialConversionType={category}
          initialSourceUnit={mappedSourceUnit}
          initialTargetUnit={mappedTargetUnit}
        />
      </div>
    </div>
  );
};

export default UnitConverterPage;
