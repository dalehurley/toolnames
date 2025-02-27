import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Copy, RefreshCw, Check, Thermometer } from "lucide-react";

type TemperatureUnit = "celsius" | "fahrenheit" | "kelvin";

interface ConversionResult {
  unit: TemperatureUnit;
  value: number;
  formatted: string;
}

export const TemperatureConverter = () => {
  const [inputValue, setInputValue] = useState<string>("");
  const [inputUnit, setInputUnit] = useState<TemperatureUnit>("celsius");
  const [results, setResults] = useState<ConversionResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedUnit, setCopiedUnit] = useState<TemperatureUnit | null>(null);

  useEffect(() => {
    if (inputValue.trim() === "") {
      setResults([]);
      setError(null);
      return;
    }

    const parsedValue = parseFloat(inputValue);

    if (isNaN(parsedValue)) {
      setError("Please enter a valid number");
      setResults([]);
      return;
    }

    setError(null);

    // Perform conversions
    const convertedResults: ConversionResult[] = [];

    // Start with input unit but save conversion for later
    const inputTemp: ConversionResult = {
      unit: inputUnit,
      value: parsedValue,
      formatted: formatTemperature(parsedValue, inputUnit),
    };

    // Convert to Celsius first (if not already celsius)
    let celsiusValue: number;
    if (inputUnit === "celsius") {
      celsiusValue = parsedValue;
    } else if (inputUnit === "fahrenheit") {
      celsiusValue = (parsedValue - 32) * (5 / 9);
    } else {
      // kelvin
      celsiusValue = parsedValue - 273.15;
    }

    // Now convert from celsius to all units
    if (inputUnit !== "celsius") {
      convertedResults.push({
        unit: "celsius",
        value: celsiusValue,
        formatted: formatTemperature(celsiusValue, "celsius"),
      });
    }

    if (inputUnit !== "fahrenheit") {
      const fahrenheitValue = celsiusValue * (9 / 5) + 32;
      convertedResults.push({
        unit: "fahrenheit",
        value: fahrenheitValue,
        formatted: formatTemperature(fahrenheitValue, "fahrenheit"),
      });
    }

    if (inputUnit !== "kelvin") {
      const kelvinValue = celsiusValue + 273.15;
      convertedResults.push({
        unit: "kelvin",
        value: kelvinValue,
        formatted: formatTemperature(kelvinValue, "kelvin"),
      });
    }

    // Now add the input unit at the beginning
    convertedResults.unshift(inputTemp);

    setResults(convertedResults);
  }, [inputValue, inputUnit]);

  const formatTemperature = (value: number, unit: TemperatureUnit): string => {
    const symbol = getTemperatureSymbol(unit);
    return `${value.toFixed(2)}${symbol}`;
  };

  const getTemperatureSymbol = (unit: TemperatureUnit): string => {
    switch (unit) {
      case "celsius":
        return "°C";
      case "fahrenheit":
        return "°F";
      case "kelvin":
        return "K";
      default:
        return "";
    }
  };

  const getUnitName = (unit: TemperatureUnit): string => {
    switch (unit) {
      case "celsius":
        return "Celsius";
      case "fahrenheit":
        return "Fahrenheit";
      case "kelvin":
        return "Kelvin";
      default:
        return "";
    }
  };

  const copyToClipboard = (result: ConversionResult) => {
    navigator.clipboard.writeText(result.formatted);
    setCopiedUnit(result.unit);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setCopiedUnit(null);
    }, 2000);
  };

  const clearAll = () => {
    setInputValue("");
    setResults([]);
    setError(null);
    setCopied(false);
    setCopiedUnit(null);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Thermometer className="h-6 w-6" />
          Temperature Converter
        </CardTitle>
        <CardDescription>
          Convert temperatures between Celsius, Fahrenheit, and Kelvin
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <Label htmlFor="temperature">Temperature</Label>
                <Input
                  id="temperature"
                  type="number"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Enter temperature"
                />
              </div>
              <div>
                <Label htmlFor="unit">Unit</Label>
                <Select
                  value={inputUnit}
                  onValueChange={(value) =>
                    setInputUnit(value as TemperatureUnit)
                  }
                >
                  <SelectTrigger id="unit">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="celsius">Celsius (°C)</SelectItem>
                    <SelectItem value="fahrenheit">Fahrenheit (°F)</SelectItem>
                    <SelectItem value="kelvin">Kelvin (K)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={clearAll}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>

            {error && (
              <div className="bg-red-100 text-red-800 p-3 rounded-md text-sm">
                {error}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <Label>Conversion Results</Label>
            {results.length > 0 ? (
              <div className="space-y-2">
                {results.map((result) => (
                  <div
                    key={result.unit}
                    className="flex justify-between items-center border p-3 rounded-md"
                  >
                    <div>
                      <div className="text-sm text-muted-foreground">
                        {getUnitName(result.unit)}
                      </div>
                      <div className="text-xl font-medium">
                        {result.formatted}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(result)}
                    >
                      {copied && copiedUnit === result.unit ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border border-dashed p-6 rounded-md flex items-center justify-center text-muted-foreground">
                Enter a temperature to see conversions
              </div>
            )}

            {copied && (
              <div className="bg-green-100 text-green-800 p-2 rounded-md text-sm">
                Value copied to clipboard!
              </div>
            )}
          </div>
        </div>

        <div className="bg-muted p-4 rounded-lg">
          <h3 className="font-medium mb-2">Temperature Scales</h3>
          <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
            <li>
              <strong>Celsius (°C)</strong> - Water freezes at 0°C and boils at
              100°C at standard atmospheric pressure.
            </li>
            <li>
              <strong>Fahrenheit (°F)</strong> - Water freezes at 32°F and boils
              at 212°F at standard atmospheric pressure.
            </li>
            <li>
              <strong>Kelvin (K)</strong> - The SI unit of temperature. 0K is
              absolute zero (-273.15°C), the theoretical temperature at which
              molecular motion stops.
            </li>
          </ul>
          <div className="mt-2 text-sm text-muted-foreground">
            <strong>Common Conversions:</strong>
            <ul className="list-disc pl-5 space-y-1 mt-1">
              <li>Room temperature: ~20-22°C / ~68-72°F / ~293-295K</li>
              <li>Body temperature: ~37°C / ~98.6°F / ~310K</li>
              <li>Boiling water: 100°C / 212°F / 373.15K</li>
              <li>Freezing water: 0°C / 32°F / 273.15K</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
