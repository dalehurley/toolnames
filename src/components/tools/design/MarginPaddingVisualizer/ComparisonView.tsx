import React, { useState } from "react";
import { useSpacing } from "./SpacingContext";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { SpacingSystem } from "./types";

const ComparisonView: React.FC = () => {
  const spacing = useSpacing();
  const [systemA, setSystemA] = useState<string>("tailwind");
  const [systemB, setSystemB] = useState<string>("material");

  // Get a spacing system by name
  const getSpacingSystem = (systemName: string): SpacingSystem => {
    if (systemName === "custom") {
      // Use the current custom spacing system from the context
      return {
        name: "Your Custom System",
        scale: spacing.generateScale(),
        unit: spacing.unit,
        description: "Your custom spacing system based on current settings.",
      };
    }

    // Find the specified system in the comparison systems
    const system = spacing.comparisonSystems.find((sys) =>
      sys.name.toLowerCase().includes(systemName.toLowerCase())
    );

    if (!system) {
      // Return a default system if not found
      return spacing.comparisonSystems[0];
    }

    return system;
  };

  // Handle system A selection
  const handleSystemAChange = (value: string) => {
    setSystemA(value);
  };

  // Handle system B selection
  const handleSystemBChange = (value: string) => {
    setSystemB(value);
  };

  // Apply system to current spacing
  const applySystem = (systemName: string) => {
    const system = getSpacingSystem(systemName);

    // Update the spacing context with the values from the selected system
    if (system.scale.length > 0) {
      spacing.updateUnit(system.unit);
      spacing.updateScaleType("custom");
      spacing.setSpacing("customScale", system.scale);
    }
  };

  // Render a spacing system preview
  const renderSystemPreview = (systemName: string) => {
    const system = getSpacingSystem(systemName);

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-medium">{system.name}</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {system.description}
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => applySystem(systemName)}
          >
            Apply
          </Button>
        </div>

        <div className="border rounded-md p-4 bg-slate-50 dark:bg-slate-900">
          <div className="grid grid-cols-1 gap-2">
            {system.scale.slice(0, 15).map((value, index) => (
              <div key={index} className="flex items-center">
                <div
                  className="bg-blue-500 dark:bg-blue-600 h-4 border border-blue-600 dark:border-blue-700"
                  style={{
                    width: `${Math.min(
                      value * (system.unit === "rem" ? 40 : 2),
                      300
                    )}px`,
                  }}
                />
                <span className="text-xs ml-2 min-w-[70px]">
                  {value}
                  {system.unit} (scale-{index})
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Render a UI element with the specified system
  const renderUIPreview = (systemName: string) => {
    const system = getSpacingSystem(systemName);
    // Choose some representative values from the system
    const values = {
      sm: system.scale[Math.min(2, system.scale.length - 1)],
      md: system.scale[Math.min(4, system.scale.length - 1)],
      lg: system.scale[Math.min(6, system.scale.length - 1)],
      xl: system.scale[Math.min(8, system.scale.length - 1)],
    };

    return (
      <div className="border rounded-md p-4 bg-white dark:bg-slate-950 shadow-sm">
        <h5 className="text-sm font-medium mb-2">{system.name} UI Preview</h5>
        <div
          className="bg-blue-500 dark:bg-blue-600 text-white p-2 rounded-md mb-2"
          style={{ padding: `${values.md}${system.unit}` }}
        >
          Button with padding: {values.md}
          {system.unit}
        </div>

        <div className="space-y-2">
          <div
            className="bg-slate-100 dark:bg-slate-800 rounded-md"
            style={{
              padding: `${values.md}${system.unit}`,
              marginBottom: `${values.sm}${system.unit}`,
            }}
          >
            <p
              className="text-sm"
              style={{ marginBottom: `${values.sm}${system.unit}` }}
            >
              Card with padding: {values.md}
              {system.unit}
            </p>
            <p className="text-sm">
              And margin-bottom: {values.sm}
              {system.unit}
            </p>
          </div>

          <div
            className="flex items-center space-x-2"
            style={{ gap: `${values.sm}${system.unit}` }}
          >
            <div className="bg-green-500 p-2 rounded-md">Item 1</div>
            <div className="bg-green-500 p-2 rounded-md">Item 2</div>
            <div className="bg-green-500 p-2 rounded-md">Item 3</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="p-4">
      <h3 className="text-lg font-medium mb-4">Compare Spacing Systems</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
        {/* System selectors */}
        <div className="space-y-2">
          <label className="text-sm font-medium">System A</label>
          <Select value={systemA} onValueChange={handleSystemAChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select a system" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="tailwind">Tailwind CSS</SelectItem>
                <SelectItem value="material">Material Design</SelectItem>
                <SelectItem value="bootstrap">Bootstrap 5</SelectItem>
                <SelectItem value="custom">Your Custom System</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">System B</label>
          <Select value={systemB} onValueChange={handleSystemBChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select a system" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="tailwind">Tailwind CSS</SelectItem>
                <SelectItem value="material">Material Design</SelectItem>
                <SelectItem value="bootstrap">Bootstrap 5</SelectItem>
                <SelectItem value="custom">Your Custom System</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* System scale visualizations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>{renderSystemPreview(systemA)}</div>

        <div>{renderSystemPreview(systemB)}</div>
      </div>

      {/* UI previews */}
      <h4 className="text-md font-medium mb-4">UI Element Comparison</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>{renderUIPreview(systemA)}</div>

        <div>{renderUIPreview(systemB)}</div>
      </div>

      <div className="mt-6 text-sm text-slate-600 dark:text-slate-400">
        <p>
          Compare how different spacing systems look when applied to real UI
          elements. This can help you decide which system best fits your design
          needs.
        </p>
      </div>
    </Card>
  );
};

export default ComparisonView;
