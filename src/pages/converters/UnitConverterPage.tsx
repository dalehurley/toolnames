import { useEffect } from "react";
import { useTools } from "@/contexts/ToolsContext";
import { UnitConverter } from "@/components/tools/converters/UnitConverter";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";

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
  const { setActiveTool } = useTools();

  // Set the tool to the unit converter
  useEffect(() => {
    setActiveTool("unit-converter");

    // For demonstration purposes, we'll log the conversion details
    console.log(
      `Converting from ${fromUnit} to ${toUnit} in ${category} category`
    );
    console.log(
      `Mapped units: ${unitMappings[category][fromUnit]} to ${unitMappings[category][toUnit]}`
    );

    // Set the document title
    const fromDisplay = fromUnit.replace(/-/g, " ");
    const toDisplay = toUnit.replace(/-/g, " ");
    document.title = `Convert ${fromDisplay} to ${toDisplay} | ${
      category.charAt(0).toUpperCase() + category.slice(1)
    } Unit Converter | ToolNames`;

    return () => {
      // No need to clear the active tool here, as the parent
      // route component will handle that
    };
  }, [fromUnit, toUnit, category, setActiveTool]);

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
          <Link to="/converters">
            <ChevronLeft className="h-4 w-4" />
            <span>Back</span>
          </Link>
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
