import React, { useState, useEffect } from "react";
import { useSpacing } from "./SpacingContext";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { ScaleType, SpacingUnit } from "./types";

const BatchGenerator: React.FC = () => {
  const spacing = useSpacing();
  const [scale, setScale] = useState<number[]>([]);
  const [customScaleInput, setCustomScaleInput] = useState<string>(
    spacing.customScale.join(", ")
  );

  // Update scale when settings change
  useEffect(() => {
    setScale(spacing.generateScale());
  }, [
    spacing.scaleType,
    spacing.baseUnit,
    spacing.scaleMultiplier,
    spacing.customScale,
  ]);

  // Handle scale type change
  const handleScaleTypeChange = (value: string) => {
    spacing.updateScaleType(value as ScaleType);
  };

  // Handle base unit change
  const handleBaseUnitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value > 0) {
      spacing.setSpacing("baseUnit", value);
    }
  };

  // Handle multiplier change
  const handleMultiplierChange = (values: number[]) => {
    spacing.setSpacing("scaleMultiplier", values[0]);
  };

  // Handle custom scale input change
  const handleCustomScaleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomScaleInput(e.target.value);

    try {
      // Parse the comma-separated values into numbers
      const values = e.target.value
        .split(",")
        .map((val) => parseFloat(val.trim()))
        .filter((val) => !isNaN(val));

      if (values.length > 0) {
        spacing.setSpacing("customScale", values);
      }
    } catch (error) {
      // Keep the input value as is, but don't update the state
      console.error("Invalid custom scale input", error);
    }
  };

  // Handle unit change
  const handleUnitChange = (value: string) => {
    spacing.updateUnit(value as SpacingUnit);
  };

  // Handle prefix change
  const handlePrefixChange = (property: string, value: string) => {
    spacing.setSpacing(property, value);
  };

  // Handle directional classes toggle
  const handleDirectionalToggle = (checked: boolean) => {
    spacing.setSpacing("includeDirectionalClasses", checked);
  };

  // Handle responsive variants toggle
  const handleResponsiveToggle = (checked: boolean) => {
    spacing.setSpacing("includeResponsiveVariants", checked);
  };

  // Update a breakpoint value
  const handleBreakpointChange = (breakpoint: string, value: string) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue > 0) {
      spacing.setSpacing("responsiveBreakpoints", {
        ...spacing.responsiveBreakpoints,
        [breakpoint]: numValue,
      });
    }
  };

  // Render the scale visualization
  const renderScaleVisualization = () => {
    return (
      <div className="border rounded-md p-4 bg-slate-50 dark:bg-slate-900">
        <h4 className="text-sm font-medium mb-2">Generated Scale</h4>
        <div className="flex flex-wrap gap-2">
          {scale.map((value, index) => (
            <div key={index} className="flex flex-col items-center">
              <div
                className="bg-blue-500 dark:bg-blue-600 border border-blue-600 dark:border-blue-700"
                style={{
                  width: `${Math.min(value * 4, 100)}px`,
                  height: `${Math.min(value * 4, 100)}px`,
                }}
              />
              <span className="text-xs mt-1">
                {value}
                {spacing.unit} (scale-{index})
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render scale configuration controls
  const renderScaleConfiguration = () => {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Scale type selector */}
          <div className="space-y-2">
            <Label>Scale Type</Label>
            <RadioGroup
              defaultValue={spacing.scaleType}
              onValueChange={handleScaleTypeChange}
              className="flex flex-col space-y-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="linear" id="linear" />
                <Label htmlFor="linear" className="cursor-pointer">
                  Linear
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="fibonacci" id="fibonacci" />
                <Label htmlFor="fibonacci" className="cursor-pointer">
                  Fibonacci
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="exponential" id="exponential" />
                <Label htmlFor="exponential" className="cursor-pointer">
                  Exponential
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="custom" id="custom" />
                <Label htmlFor="custom" className="cursor-pointer">
                  Custom
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Base unit and multiplier */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="base-unit">Base Unit</Label>
              <div className="flex space-x-2">
                <Input
                  id="base-unit"
                  type="number"
                  min={0.1}
                  step={0.1}
                  value={spacing.baseUnit}
                  onChange={handleBaseUnitChange}
                  className="w-full"
                />
                <span className="flex items-center text-sm">
                  {spacing.unit}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="multiplier">
                  Scale Multiplier: {spacing.scaleMultiplier.toFixed(1)}
                </Label>
              </div>
              <Slider
                id="multiplier"
                value={[spacing.scaleMultiplier]}
                min={0.1}
                max={5}
                step={0.1}
                onValueChange={handleMultiplierChange}
              />
            </div>

            {spacing.scaleType === "custom" && (
              <div className="space-y-2">
                <Label htmlFor="custom-scale">
                  Custom Scale (comma-separated values)
                </Label>
                <Input
                  id="custom-scale"
                  value={customScaleInput}
                  onChange={handleCustomScaleChange}
                  placeholder="0, 1, 2, 4, 8, 16, 32"
                />
              </div>
            )}
          </div>
        </div>

        {/* Unit selector */}
        <div className="space-y-2">
          <Label>Unit</Label>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {(["px", "rem", "em", "%", "vw", "vh"] as SpacingUnit[]).map(
              (unit) => (
                <div
                  key={unit}
                  className={`cursor-pointer border rounded-md p-2 text-center hover:bg-slate-50 dark:hover:bg-slate-800 ${
                    spacing.unit === unit
                      ? "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900 dark:border-blue-800 dark:text-blue-200"
                      : "border-slate-200 dark:border-slate-700"
                  }`}
                  onClick={() => handleUnitChange(unit)}
                >
                  {unit}
                </div>
              )
            )}
          </div>
        </div>

        {/* Class naming configuration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="margin-prefix">Margin Class Prefix</Label>
            <Input
              id="margin-prefix"
              value={spacing.prefixMargin}
              onChange={(e) =>
                handlePrefixChange("prefixMargin", e.target.value)
              }
              placeholder="m"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="padding-prefix">Padding Class Prefix</Label>
            <Input
              id="padding-prefix"
              value={spacing.prefixPadding}
              onChange={(e) =>
                handlePrefixChange("prefixPadding", e.target.value)
              }
              placeholder="p"
            />
          </div>
        </div>

        {/* Include directional classes */}
        <div className="flex items-center space-x-2">
          <Switch
            id="directional-classes"
            checked={spacing.includeDirectionalClasses}
            onCheckedChange={handleDirectionalToggle}
          />
          <Label htmlFor="directional-classes">
            Include Directional Classes (top, right, bottom, left)
          </Label>
        </div>

        {/* Include responsive variants */}
        <div className="flex items-center space-x-2">
          <Switch
            id="responsive-variants"
            checked={spacing.includeResponsiveVariants}
            onCheckedChange={handleResponsiveToggle}
          />
          <Label htmlFor="responsive-variants">
            Include Responsive Variants
          </Label>
        </div>

        {/* Breakpoint configuration */}
        {spacing.includeResponsiveVariants && (
          <div className="space-y-2 border-t pt-4">
            <Label>Responsive Breakpoints</Label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(spacing.responsiveBreakpoints).map(
                ([breakpoint, value]) => (
                  <div key={breakpoint} className="space-y-1">
                    <Label
                      htmlFor={`breakpoint-${breakpoint}`}
                      className="text-xs"
                    >
                      {breakpoint}
                    </Label>
                    <div className="flex space-x-1">
                      <Input
                        id={`breakpoint-${breakpoint}`}
                        type="number"
                        min={0}
                        value={value}
                        onChange={(e) =>
                          handleBreakpointChange(breakpoint, e.target.value)
                        }
                        className="w-full"
                      />
                      <span className="flex items-center text-xs">px</span>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="p-4">
      <h3 className="text-lg font-medium mb-4">Spacing Scale Generator</h3>

      <Tabs defaultValue="config">
        <TabsList className="mb-4">
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="visualization">Visualization</TabsTrigger>
        </TabsList>

        <TabsContent value="config">{renderScaleConfiguration()}</TabsContent>

        <TabsContent value="visualization">
          {renderScaleVisualization()}
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default BatchGenerator;
