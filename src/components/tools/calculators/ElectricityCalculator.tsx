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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Zap, Calculator, RefreshCw, Plus, Trash2 } from "lucide-react";

interface ApplianceItem {
  id: string;
  name: string;
  watts: string;
  hoursPerDay: string;
  daysPerWeek: string;
}

export const ElectricityCalculator = () => {
  // State for general inputs
  const [electricityRate, setElectricityRate] = useState<string>("0.15");
  const [currency, setCurrency] = useState<string>("$");

  // Appliance list
  const [appliances, setAppliances] = useState<ApplianceItem[]>([
    {
      id: "appliance-1",
      name: "Refrigerator",
      watts: "150",
      hoursPerDay: "24",
      daysPerWeek: "7",
    },
  ]);

  // Results state
  const [results, setResults] = useState<{
    applianceCosts: Array<{
      id: string;
      name: string;
      dailyKWh: number;
      monthlyKWh: number;
      monthlyCost: number;
      yearlyCost: number;
    }>;
    totalDailyKWh: number;
    totalMonthlyKWh: number;
    totalMonthlyCost: number;
    totalYearlyCost: number;
  } | null>(null);

  // Error handling
  const [errors, setErrors] = useState<{
    electricityRate?: string;
    appliances?: Record<
      string,
      { watts?: string; hoursPerDay?: string; daysPerWeek?: string }
    >;
  }>({});

  // Handle clearing form
  const handleClear = () => {
    setElectricityRate("0.15");
    setCurrency("$");
    setAppliances([
      {
        id: "appliance-1",
        name: "Refrigerator",
        watts: "150",
        hoursPerDay: "24",
        daysPerWeek: "7",
      },
    ]);
    setResults(null);
    setErrors({});
  };

  // Add new appliance to the list
  const addAppliance = () => {
    const newId = `appliance-${Date.now()}`;
    setAppliances([
      ...appliances,
      {
        id: newId,
        name: "",
        watts: "",
        hoursPerDay: "",
        daysPerWeek: "",
      },
    ]);
  };

  // Remove appliance from the list
  const removeAppliance = (id: string) => {
    if (appliances.length > 1) {
      setAppliances(appliances.filter((appliance) => appliance.id !== id));
    }
  };

  // Update appliance data
  const updateAppliance = (
    id: string,
    field: keyof ApplianceItem,
    value: string
  ) => {
    setAppliances(
      appliances.map((appliance) =>
        appliance.id === id ? { ...appliance, [field]: value } : appliance
      )
    );
  };

  // Format currency display
  const formatCurrency = (value: number): string => {
    return `${currency}${value.toFixed(2)}`;
  };

  // Calculate electricity usage and cost
  const calculateElectricity = () => {
    const newErrors: typeof errors = {
      appliances: {},
    };

    // Validate electricity rate
    if (!electricityRate) {
      newErrors.electricityRate = "Electricity rate is required";
    } else if (parseFloat(electricityRate) <= 0) {
      newErrors.electricityRate = "Rate must be greater than 0";
    }

    // Validate appliances
    let hasErrors = false;
    appliances.forEach((appliance) => {
      newErrors.appliances![appliance.id] = {};

      if (!appliance.watts) {
        newErrors.appliances![appliance.id].watts = "Required";
        hasErrors = true;
      } else if (parseFloat(appliance.watts) <= 0) {
        newErrors.appliances![appliance.id].watts = "Must be > 0";
        hasErrors = true;
      }

      if (!appliance.hoursPerDay) {
        newErrors.appliances![appliance.id].hoursPerDay = "Required";
        hasErrors = true;
      } else if (
        parseFloat(appliance.hoursPerDay) <= 0 ||
        parseFloat(appliance.hoursPerDay) > 24
      ) {
        newErrors.appliances![appliance.id].hoursPerDay = "1-24";
        hasErrors = true;
      }

      if (!appliance.daysPerWeek) {
        newErrors.appliances![appliance.id].daysPerWeek = "Required";
        hasErrors = true;
      } else if (
        parseFloat(appliance.daysPerWeek) <= 0 ||
        parseFloat(appliance.daysPerWeek) > 7
      ) {
        newErrors.appliances![appliance.id].daysPerWeek = "1-7";
        hasErrors = true;
      }
    });

    if (hasErrors || newErrors.electricityRate) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    // Convert rate to number
    const rate = parseFloat(electricityRate);

    // Calculate costs for each appliance
    const applianceCosts = appliances.map((appliance) => {
      const watts = parseFloat(appliance.watts);
      const hoursPerDay = parseFloat(appliance.hoursPerDay);
      const daysPerWeek = parseFloat(appliance.daysPerWeek);

      // Daily usage in kWh (watts to kW, then multiply by hours)
      const dailyKWh = (watts / 1000) * hoursPerDay;

      // Monthly usage (assuming 4.33 weeks per month)
      const monthlyKWh = dailyKWh * daysPerWeek * 4.33;

      // Monthly cost
      const monthlyCost = monthlyKWh * rate;

      // Yearly cost
      const yearlyCost = monthlyCost * 12;

      return {
        id: appliance.id,
        name: appliance.name || "Unnamed Appliance",
        dailyKWh: parseFloat(dailyKWh.toFixed(2)),
        monthlyKWh: parseFloat(monthlyKWh.toFixed(2)),
        monthlyCost: parseFloat(monthlyCost.toFixed(2)),
        yearlyCost: parseFloat(yearlyCost.toFixed(2)),
      };
    });

    // Calculate totals
    const totalDailyKWh = applianceCosts.reduce(
      (sum, item) => sum + item.dailyKWh,
      0
    );
    const totalMonthlyKWh = applianceCosts.reduce(
      (sum, item) => sum + item.monthlyKWh,
      0
    );
    const totalMonthlyCost = applianceCosts.reduce(
      (sum, item) => sum + item.monthlyCost,
      0
    );
    const totalYearlyCost = applianceCosts.reduce(
      (sum, item) => sum + item.yearlyCost,
      0
    );

    setResults({
      applianceCosts,
      totalDailyKWh: parseFloat(totalDailyKWh.toFixed(2)),
      totalMonthlyKWh: parseFloat(totalMonthlyKWh.toFixed(2)),
      totalMonthlyCost: parseFloat(totalMonthlyCost.toFixed(2)),
      totalYearlyCost: parseFloat(totalYearlyCost.toFixed(2)),
    });
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Zap className="h-6 w-6" />
          Electricity Cost Calculator
        </CardTitle>
        <CardDescription>
          Calculate the cost of running your electrical appliances
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="electricity-rate">Electricity Rate (per kWh)</Label>
            <div className="flex space-x-2">
              <Select
                value={currency}
                onValueChange={(value: string) => setCurrency(value)}
              >
                <SelectTrigger className="w-[80px]">
                  <SelectValue placeholder="Currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="$">$</SelectItem>
                  <SelectItem value="€">€</SelectItem>
                  <SelectItem value="£">£</SelectItem>
                  <SelectItem value="¥">¥</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative flex-1">
                <Input
                  id="electricity-rate"
                  type="number"
                  step="0.01"
                  placeholder="0.15"
                  value={electricityRate}
                  onChange={(e) => setElectricityRate(e.target.value)}
                />
              </div>
            </div>
            {errors.electricityRate && (
              <p className="text-sm text-red-500">{errors.electricityRate}</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label>Appliances</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addAppliance}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Appliance
            </Button>
          </div>

          <div className="border rounded-md">
            <div className="grid grid-cols-12 gap-2 p-4 border-b text-sm font-medium bg-muted">
              <div className="col-span-3">Appliance</div>
              <div className="col-span-2 text-center">Power (Watts)</div>
              <div className="col-span-2 text-center">Hours/Day</div>
              <div className="col-span-2 text-center">Days/Week</div>
              <div className="col-span-3 text-right">Action</div>
            </div>

            {appliances.map((appliance) => (
              <div
                key={appliance.id}
                className="grid grid-cols-12 gap-2 p-4 border-b last:border-b-0 items-center"
              >
                <div className="col-span-3">
                  <Input
                    placeholder="Refrigerator"
                    value={appliance.name}
                    onChange={(e) =>
                      updateAppliance(appliance.id, "name", e.target.value)
                    }
                  />
                </div>

                <div className="col-span-2">
                  <Input
                    type="number"
                    placeholder="150"
                    value={appliance.watts}
                    onChange={(e) =>
                      updateAppliance(appliance.id, "watts", e.target.value)
                    }
                    className={
                      errors.appliances?.[appliance.id]?.watts
                        ? "border-red-500"
                        : ""
                    }
                  />
                  {errors.appliances?.[appliance.id]?.watts && (
                    <p className="text-xs text-red-500">
                      {errors.appliances[appliance.id].watts}
                    </p>
                  )}
                </div>

                <div className="col-span-2">
                  <Input
                    type="number"
                    placeholder="24"
                    min="0"
                    max="24"
                    value={appliance.hoursPerDay}
                    onChange={(e) =>
                      updateAppliance(
                        appliance.id,
                        "hoursPerDay",
                        e.target.value
                      )
                    }
                    className={
                      errors.appliances?.[appliance.id]?.hoursPerDay
                        ? "border-red-500"
                        : ""
                    }
                  />
                  {errors.appliances?.[appliance.id]?.hoursPerDay && (
                    <p className="text-xs text-red-500">
                      {errors.appliances[appliance.id].hoursPerDay}
                    </p>
                  )}
                </div>

                <div className="col-span-2">
                  <Input
                    type="number"
                    placeholder="7"
                    min="0"
                    max="7"
                    value={appliance.daysPerWeek}
                    onChange={(e) =>
                      updateAppliance(
                        appliance.id,
                        "daysPerWeek",
                        e.target.value
                      )
                    }
                    className={
                      errors.appliances?.[appliance.id]?.daysPerWeek
                        ? "border-red-500"
                        : ""
                    }
                  />
                  {errors.appliances?.[appliance.id]?.daysPerWeek && (
                    <p className="text-xs text-red-500">
                      {errors.appliances[appliance.id].daysPerWeek}
                    </p>
                  )}
                </div>

                <div className="col-span-3 text-right">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAppliance(appliance.id)}
                    disabled={appliances.length <= 1}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between gap-4 pt-2">
          <Button variant="outline" onClick={handleClear}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset Form
          </Button>

          <Button onClick={calculateElectricity}>
            <Calculator className="mr-2 h-4 w-4" />
            Calculate Costs
          </Button>
        </div>

        {results && (
          <div className="bg-muted rounded-lg p-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-muted-foreground mb-1">
                Total Electricity Cost
              </h3>
              <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-8">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Monthly</p>
                  <p className="text-3xl font-bold">
                    {formatCurrency(results.totalMonthlyCost)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Yearly</p>
                  <p className="text-3xl font-bold">
                    {formatCurrency(results.totalYearlyCost)}
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Total: {results.totalMonthlyKWh} kWh per month
              </p>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">
                Cost Breakdown by Appliance
              </h4>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 font-medium">Appliance</th>
                      <th className="text-right py-2 font-medium">
                        Daily Usage
                      </th>
                      <th className="text-right py-2 font-medium">
                        Monthly Usage
                      </th>
                      <th className="text-right py-2 font-medium">
                        Monthly Cost
                      </th>
                      <th className="text-right py-2 font-medium">
                        Yearly Cost
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.applianceCosts.map((item) => (
                      <tr key={item.id} className="border-b border-muted">
                        <td className="py-2">{item.name}</td>
                        <td className="text-right py-2">{item.dailyKWh} kWh</td>
                        <td className="text-right py-2">
                          {item.monthlyKWh} kWh
                        </td>
                        <td className="text-right py-2">
                          {formatCurrency(item.monthlyCost)}
                        </td>
                        <td className="text-right py-2 font-medium">
                          {formatCurrency(item.yearlyCost)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="text-center mt-6 text-sm text-muted-foreground">
              Based on electricity rate of{" "}
              {formatCurrency(parseFloat(electricityRate))} per kWh
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col space-y-4">
        <div className="bg-muted p-4 rounded-lg w-full">
          <h3 className="font-semibold mb-2">About This Calculator</h3>
          <p className="text-sm text-muted-foreground">
            This calculator estimates electricity costs based on the power
            consumption of your appliances, their usage patterns, and your
            electricity rate. For the most accurate results:
          </p>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-4 mt-2">
            <li>Use the actual wattage listed on your appliances</li>
            <li>For variable usage appliances, use an average value</li>
            <li>Check your electricity bill for your current rate per kWh</li>
          </ul>
          <p className="text-sm text-muted-foreground mt-2">
            <strong>Note:</strong> This calculator assumes a constant
            electricity rate and does not account for tiered pricing,
            time-of-use rates, or seasonal variations.
          </p>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ElectricityCalculator;
