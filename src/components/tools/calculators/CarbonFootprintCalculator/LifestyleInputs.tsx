import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CarbonInputs } from "./carbonUtils";
import {
  Car,
  Plane,
  Bus,
  Zap,
  Flame,
  Utensils,
  ShoppingBag,
} from "lucide-react";

interface LifestyleInputsProps {
  inputs: CarbonInputs;
  onChange: (inputs: CarbonInputs) => void;
}

export const LifestyleInputs: React.FC<LifestyleInputsProps> = ({
  inputs,
  onChange,
}) => {
  const handleChange =
    (field: keyof CarbonInputs) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseFloat(e.target.value) || 0;
      onChange({ ...inputs, [field]: value });
    };

  return (
    <div className="space-y-6">
      {/* Transportation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Transportation
          </CardTitle>
          <CardDescription>Annual travel distances</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="carKm" className="flex items-center gap-2">
              <Car className="h-4 w-4" />
              Car (km per year)
            </Label>
            <Input
              id="carKm"
              type="number"
              min="0"
              value={inputs.carKmPerYear}
              onChange={handleChange("carKmPerYear")}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="flightKm" className="flex items-center gap-2">
              <Plane className="h-4 w-4" />
              Flights (km per year)
            </Label>
            <Input
              id="flightKm"
              type="number"
              min="0"
              value={inputs.flightKmPerYear}
              onChange={handleChange("flightKmPerYear")}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="transitKm" className="flex items-center gap-2">
              <Bus className="h-4 w-4" />
              Public Transit (km per year)
            </Label>
            <Input
              id="transitKm"
              type="number"
              min="0"
              value={inputs.transitKmPerYear}
              onChange={handleChange("transitKmPerYear")}
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Energy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Home Energy
          </CardTitle>
          <CardDescription>Monthly energy consumption</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="electricity" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Electricity (kWh per month)
            </Label>
            <Input
              id="electricity"
              type="number"
              min="0"
              value={inputs.electricityKwhPerMonth}
              onChange={handleChange("electricityKwhPerMonth")}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="gas" className="flex items-center gap-2">
              <Flame className="h-4 w-4" />
              Natural Gas (kWh per month)
            </Label>
            <Input
              id="gas"
              type="number"
              min="0"
              value={inputs.gasKwhPerMonth}
              onChange={handleChange("gasKwhPerMonth")}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="oil" className="flex items-center gap-2">
              <Flame className="h-4 w-4" />
              Heating Oil (kWh per month)
            </Label>
            <Input
              id="oil"
              type="number"
              min="0"
              value={inputs.heatingOilKwhPerMonth}
              onChange={handleChange("heatingOilKwhPerMonth")}
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Food */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Utensils className="h-5 w-5" />
            Diet
          </CardTitle>
          <CardDescription>Weekly food consumption</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="meat">Meat (kg per week)</Label>
            <Input
              id="meat"
              type="number"
              min="0"
              step="0.1"
              value={inputs.meatKgPerWeek}
              onChange={handleChange("meatKgPerWeek")}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="dairy">Dairy (kg per week)</Label>
            <Input
              id="dairy"
              type="number"
              min="0"
              step="0.1"
              value={inputs.dairyKgPerWeek}
              onChange={handleChange("dairyKgPerWeek")}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="vegetables">
              Vegetables & Grains (kg per week)
            </Label>
            <Input
              id="vegetables"
              type="number"
              min="0"
              step="0.1"
              value={inputs.vegetablesKgPerWeek}
              onChange={handleChange("vegetablesKgPerWeek")}
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Shopping */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Shopping & Consumption
          </CardTitle>
          <CardDescription>Monthly spending (USD)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="clothing">Clothing ($ per month)</Label>
            <Input
              id="clothing"
              type="number"
              min="0"
              value={inputs.clothingPerMonth}
              onChange={handleChange("clothingPerMonth")}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="electronics">Electronics ($ per month)</Label>
            <Input
              id="electronics"
              type="number"
              min="0"
              value={inputs.electronicsPerMonth}
              onChange={handleChange("electronicsPerMonth")}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="otherShopping">Other Shopping ($ per month)</Label>
            <Input
              id="otherShopping"
              type="number"
              min="0"
              value={inputs.otherShoppingPerMonth}
              onChange={handleChange("otherShoppingPerMonth")}
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
