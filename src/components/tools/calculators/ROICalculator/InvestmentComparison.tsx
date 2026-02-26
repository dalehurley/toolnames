import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ROIInputsForm } from "./ROIInputs";
import { calculateROI } from "./roiUtils";
import { ComparisonScenario, ROIInputs } from "./types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Plus, Trash2, Edit2, Check } from "lucide-react";

export function InvestmentComparison() {
  const defaultInputs: ROIInputs = {
    initialInvestment: 10000,
    finalValue: 0,
    roiPercentage: 7,
    investmentPeriod: 5,
    periodUnit: "years",
    cashFlows: [],
    variableRates: [],
    taxRate: 0,
    inflationRate: 0,
  };

  const [scenarios, setScenarios] = useState<ComparisonScenario[]>([
    {
      id: "1",
      name: "Scenario A",
      inputs: { ...defaultInputs, roiPercentage: 5, finalValue: undefined },
      result: calculateROI({
        ...defaultInputs,
        roiPercentage: 5,
        finalValue: undefined,
      }),
    },
    {
      id: "2",
      name: "Scenario B",
      inputs: { ...defaultInputs, roiPercentage: 8, finalValue: undefined },
      result: calculateROI({
        ...defaultInputs,
        roiPercentage: 8,
        finalValue: undefined,
      }),
    },
  ]);

  const [editingId, setEditingId] = useState<string | null>(null);

  const handleUpdateScenario = (id: string, inputs: ROIInputs) => {
    setScenarios(
      scenarios.map((s) => {
        if (s.id === id) {
          return { ...s, inputs, result: calculateROI(inputs) };
        }
        return s;
      }),
    );
  };

  const addScenario = () => {
    const newId = Math.random().toString(36).substr(2, 9);
    const newScenarioInputs = { ...defaultInputs };
    setScenarios([
      ...scenarios,
      {
        id: newId,
        name: `Scenario ${scenarios.length + 1}`,
        inputs: newScenarioInputs,
        result: calculateROI(newScenarioInputs),
      },
    ]);
    setEditingId(newId);
  };

  const removeScenario = (id: string) => {
    setScenarios(scenarios.filter((s) => s.id !== id));
    if (editingId === id) setEditingId(null);
  };

  const comparisonData = scenarios.map((s) => ({
    name: s.name,
    ROI: parseFloat(s.result.simpleROI.toFixed(2)),
    Profit: Math.round(s.result.absoluteReturn),
  }));

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={comparisonData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis
                  yAxisId="left"
                  orientation="left"
                  stroke="#22c55e"
                  label={{ value: "ROI %", angle: -90, position: "insideLeft" }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#3b82f6"
                  label={{
                    value: "Profit $",
                    angle: 90,
                    position: "insideRight",
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                    color: "hsl(var(--card-foreground))",
                  }}
                />
                <Legend />
                <Bar
                  yAxisId="left"
                  dataKey="ROI"
                  fill="#22c55e"
                  name="ROI %"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  yAxisId="right"
                  dataKey="Profit"
                  fill="#3b82f6"
                  name="Profit ($)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {scenarios.map((scenario) => (
          <Card
            key={scenario.id}
            className={`transition-all ${editingId === scenario.id ? "ring-2 ring-primary col-span-full md:col-span-2 lg:col-span-2" : ""}`}
          >
            <CardContent className="pt-4 space-y-4">
              <div className="flex justify-between items-center gap-2">
                <Input
                  value={scenario.name}
                  onChange={(e) => {
                    setScenarios(
                      scenarios.map((s) =>
                        s.id === scenario.id
                          ? { ...s, name: e.target.value }
                          : s,
                      ),
                    );
                  }}
                  className="font-bold border-none shadow-none p-0 h-auto text-lg focus-visible:ring-0 bg-transparent w-full"
                />
                <div className="flex gap-1 shrink-0">
                  <Button
                    variant={editingId === scenario.id ? "default" : "outline"}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() =>
                      setEditingId(
                        editingId === scenario.id ? null : scenario.id,
                      )
                    }
                  >
                    {editingId === scenario.id ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Edit2 className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => removeScenario(scenario.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2 text-sm bg-muted/50 p-3 rounded-md">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Net Invested:</span>
                  <span>${scenario.result.netInvested.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Annualized Return:
                  </span>
                  <span>{scenario.result.annualizedROI.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between border-t pt-2 mt-2">
                  <span className="font-semibold">Total Profit:</span>
                  <span className="font-bold text-primary">
                    ${scenario.result.absoluteReturn.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Total ROI:</span>
                  <span
                    className={`font-bold ${scenario.result.simpleROI >= 0 ? "text-green-600" : "text-red-500"}`}
                  >
                    {scenario.result.simpleROI.toFixed(2)}%
                  </span>
                </div>
              </div>

              {editingId === scenario.id && (
                <div className="pt-4 border-t mt-4 bg-background animate-in slide-in-from-top-2">
                  <p className="font-medium mb-4">Edit Scenario Parameters</p>
                  <ROIInputsForm
                    inputs={scenario.inputs}
                    onChange={(newInputs) =>
                      handleUpdateScenario(scenario.id, newInputs)
                    }
                    mode="simple"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        <Button
          variant="outline"
          className="h-[200px] border-dashed flex flex-col gap-2 hover:bg-muted/50"
          onClick={addScenario}
        >
          <Plus className="h-8 w-8 text-muted-foreground" />
          <span>Add Another Scenario</span>
        </Button>
      </div>
    </div>
  );
}
