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
import { Percent, Calculator, RefreshCw, ArrowDownUp } from "lucide-react";

export const PercentageCalculator = () => {
  const [activeTab, setActiveTab] = useState<string>("find-percentage");

  // Find Percentage tab
  const [percentageValue, setPercentageValue] = useState<string>("");
  const [totalValue, setTotalValue] = useState<string>("");
  const [resultPercentage, setResultPercentage] = useState<string>("");

  // Percentage of Value tab
  const [percentValue, setPercentValue] = useState<string>("");
  const [baseValue, setBaseValue] = useState<string>("");
  const [resultValue, setResultValue] = useState<string>("");

  // Percentage Change tab
  const [originalValue, setOriginalValue] = useState<string>("");
  const [newValue, setNewValue] = useState<string>("");
  const [percentageChange, setPercentageChange] = useState<string>("");
  const [changeDescription, setChangeDescription] = useState<string>("");

  // Error handling
  const [errors, setErrors] = useState<{
    percentageValue?: string;
    totalValue?: string;
    percentValue?: string;
    baseValue?: string;
    originalValue?: string;
    newValue?: string;
  }>({});

  // Handle clearing form fields
  const handleClear = () => {
    if (activeTab === "find-percentage") {
      setPercentageValue("");
      setTotalValue("");
      setResultPercentage("");
    } else if (activeTab === "find-value") {
      setPercentValue("");
      setBaseValue("");
      setResultValue("");
    } else if (activeTab === "find-change") {
      setOriginalValue("");
      setNewValue("");
      setPercentageChange("");
      setChangeDescription("");
    }

    setErrors({});
  };

  // Calculate what percentage X is of Y
  const calculatePercentage = () => {
    const newErrors: typeof errors = {};

    if (!percentageValue) {
      newErrors.percentageValue = "This value is required";
    } else if (Number(percentageValue) < 0) {
      newErrors.percentageValue = "Value must be 0 or greater";
    }

    if (!totalValue) {
      newErrors.totalValue = "This value is required";
    } else if (Number(totalValue) === 0) {
      newErrors.totalValue = "Value cannot be 0";
    } else if (Number(totalValue) < 0) {
      newErrors.totalValue = "Value must be greater than 0";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    const part = parseFloat(percentageValue);
    const total = parseFloat(totalValue);
    const percent = (part / total) * 100;

    setResultPercentage(percent.toFixed(2));
  };

  // Calculate X percent of Y
  const calculateValue = () => {
    const newErrors: typeof errors = {};

    if (!percentValue) {
      newErrors.percentValue = "Percentage is required";
    } else if (Number(percentValue) < 0) {
      newErrors.percentValue = "Percentage must be 0 or greater";
    }

    if (!baseValue) {
      newErrors.baseValue = "Value is required";
    } else if (Number(baseValue) < 0) {
      newErrors.baseValue = "Value must be 0 or greater";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    const percent = parseFloat(percentValue);
    const base = parseFloat(baseValue);
    const result = (percent / 100) * base;

    setResultValue(result.toFixed(2));
  };

  // Calculate percentage change between two values
  const calculateChange = () => {
    const newErrors: typeof errors = {};

    if (!originalValue) {
      newErrors.originalValue = "Original value is required";
    } else if (Number(originalValue) === 0) {
      newErrors.originalValue = "Original value cannot be 0";
    }

    if (!newValue) {
      newErrors.newValue = "New value is required";
    } else if (Number(newValue) < 0 && Number(originalValue) > 0) {
      newErrors.newValue =
        "New value cannot be negative when original is positive";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    const original = parseFloat(originalValue);
    const current = parseFloat(newValue);
    const change = ((current - original) / Math.abs(original)) * 100;

    setPercentageChange(Math.abs(change).toFixed(2));

    if (change > 0) {
      setChangeDescription("increase");
    } else if (change < 0) {
      setChangeDescription("decrease");
    } else {
      setChangeDescription("no change");
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Percent className="h-6 w-6" />
          Percentage Calculator
        </CardTitle>
        <CardDescription>
          Calculate percentages, percentage of a value, and percentage changes
        </CardDescription>
      </CardHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="px-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="find-percentage">X is what % of Y?</TabsTrigger>
            <TabsTrigger value="find-value">X% of Y is what?</TabsTrigger>
            <TabsTrigger value="find-change">% Change</TabsTrigger>
          </TabsList>
        </div>

        <CardContent className="pt-6">
          {/* First tab: What percentage is X of Y */}
          <TabsContent value="find-percentage" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="percentage-value">X (Value)</Label>
                <Input
                  id="percentage-value"
                  type="number"
                  placeholder="25"
                  step="any"
                  value={percentageValue}
                  onChange={(e) => setPercentageValue(e.target.value)}
                />
                {errors.percentageValue && (
                  <p className="text-sm text-red-500">
                    {errors.percentageValue}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="total-value">Y (Total)</Label>
                <Input
                  id="total-value"
                  type="number"
                  placeholder="100"
                  step="any"
                  value={totalValue}
                  onChange={(e) => setTotalValue(e.target.value)}
                />
                {errors.totalValue && (
                  <p className="text-sm text-red-500">{errors.totalValue}</p>
                )}
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={handleClear}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Clear
              </Button>

              <Button onClick={calculatePercentage}>
                <Calculator className="mr-2 h-4 w-4" />
                Calculate
              </Button>
            </div>

            {resultPercentage && (
              <div className="pt-6">
                <div className="bg-muted rounded-lg p-6 text-center">
                  <p className="text-sm text-muted-foreground mb-1">Result</p>
                  <p className="text-3xl font-semibold mb-2">
                    {resultPercentage}%
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {percentageValue} is {resultPercentage}% of {totalValue}
                  </p>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Second tab: X% of Y is what? */}
          <TabsContent value="find-value" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="percent-value">X (Percentage)</Label>
                <div className="relative">
                  <Input
                    id="percent-value"
                    type="number"
                    placeholder="20"
                    step="any"
                    value={percentValue}
                    onChange={(e) => setPercentValue(e.target.value)}
                  />
                  <div className="absolute right-3 top-2.5">%</div>
                </div>
                {errors.percentValue && (
                  <p className="text-sm text-red-500">{errors.percentValue}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="base-value">Y (Value)</Label>
                <Input
                  id="base-value"
                  type="number"
                  placeholder="250"
                  step="any"
                  value={baseValue}
                  onChange={(e) => setBaseValue(e.target.value)}
                />
                {errors.baseValue && (
                  <p className="text-sm text-red-500">{errors.baseValue}</p>
                )}
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={handleClear}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Clear
              </Button>

              <Button onClick={calculateValue}>
                <Calculator className="mr-2 h-4 w-4" />
                Calculate
              </Button>
            </div>

            {resultValue && (
              <div className="pt-6">
                <div className="bg-muted rounded-lg p-6 text-center">
                  <p className="text-sm text-muted-foreground mb-1">Result</p>
                  <p className="text-3xl font-semibold mb-2">{resultValue}</p>
                  <p className="text-sm text-muted-foreground">
                    {percentValue}% of {baseValue} is {resultValue}
                  </p>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Third tab: Percentage change between values */}
          <TabsContent value="find-change" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="original-value">Original Value</Label>
                <Input
                  id="original-value"
                  type="number"
                  placeholder="200"
                  step="any"
                  value={originalValue}
                  onChange={(e) => setOriginalValue(e.target.value)}
                />
                {errors.originalValue && (
                  <p className="text-sm text-red-500">{errors.originalValue}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-value">New Value</Label>
                <Input
                  id="new-value"
                  type="number"
                  placeholder="250"
                  step="any"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                />
                {errors.newValue && (
                  <p className="text-sm text-red-500">{errors.newValue}</p>
                )}
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={handleClear}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Clear
              </Button>

              <Button onClick={calculateChange}>
                <Calculator className="mr-2 h-4 w-4" />
                Calculate
              </Button>
            </div>

            {percentageChange && (
              <div className="pt-6">
                <div className="bg-muted rounded-lg p-6 text-center">
                  <p className="text-sm text-muted-foreground mb-1">
                    Percentage Change
                  </p>
                  <p className="text-3xl font-semibold mb-2">
                    {percentageChange}% {changeDescription}
                  </p>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <span>{originalValue}</span>
                    <ArrowDownUp className="h-4 w-4" />
                    <span>{newValue}</span>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </CardContent>
      </Tabs>

      <CardFooter className="flex flex-col space-y-4">
        <div className="bg-muted p-4 rounded-lg w-full">
          <h3 className="font-semibold mb-2">How to use this calculator</h3>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-4">
            <li>
              <strong>X is what % of Y?</strong> - Find what percentage X is of
              Y
            </li>
            <li>
              <strong>X% of Y is what?</strong> - Calculate X percent of a
              number
            </li>
            <li>
              <strong>% Change</strong> - Find the percentage increase or
              decrease between two values
            </li>
          </ul>
        </div>
      </CardFooter>
    </Card>
  );
};

export default PercentageCalculator;
