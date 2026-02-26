import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { SalaryInputs, Deduction, PayPeriod } from "./types";
import { PERIODS } from "./salaryUtils";
import { Plus, Trash2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface SalaryInputsFormProps {
  inputs: SalaryInputs;
  onChange: (inputs: SalaryInputs) => void;
}

export function SalaryInputsForm({ inputs, onChange }: SalaryInputsFormProps) {
  const handleInputChange = (field: keyof SalaryInputs, value: any) => {
    onChange({ ...inputs, [field]: value });
  };

  const addDeduction = () => {
    const newDeduction: Deduction = {
      id: Math.random().toString(36).substr(2, 9),
      name: "New Deduction",
      amount: 0,
      type: "fixed",
      preTax: true,
    };
    onChange({ ...inputs, deductions: [...inputs.deductions, newDeduction] });
  };

  const updateDeduction = (id: string, field: keyof Deduction, value: any) => {
    const newDeductions = inputs.deductions.map((d) => {
      if (d.id === id) return { ...d, [field]: value };
      return d;
    });
    onChange({ ...inputs, deductions: newDeductions });
  };

  const removeDeduction = (id: string) => {
    onChange({
      ...inputs,
      deductions: inputs.deductions.filter((d) => d.id !== id),
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="amount">Salary Amount</Label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-muted-foreground">
              $
            </span>
            <Input
              id="amount"
              type="number"
              className="pl-7"
              value={inputs.amount}
              onChange={(e) =>
                handleInputChange("amount", parseFloat(e.target.value) || 0)
              }
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="period">Pay Period</Label>
          <Select
            value={inputs.period}
            onValueChange={(v: PayPeriod) => handleInputChange("period", v)}
          >
            <SelectTrigger id="period">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PERIODS.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="hoursPerWeek">Hours Per Week</Label>
          <Input
            id="hoursPerWeek"
            type="number"
            value={inputs.hoursPerWeek}
            onChange={(e) =>
              handleInputChange("hoursPerWeek", parseFloat(e.target.value) || 0)
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="filingStatus">Filing Status</Label>
          <Select
            value={inputs.filingStatus}
            onValueChange={(v: any) => handleInputChange("filingStatus", v)}
          >
            <SelectTrigger id="filingStatus">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="single">Single</SelectItem>
              <SelectItem value="married">Married Filing Jointly</SelectItem>
              <SelectItem value="head">Head of Household</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="stateTaxRate">State Tax Rate (%)</Label>
          <div className="relative">
            <Input
              id="stateTaxRate"
              type="number"
              value={inputs.stateTaxRate}
              onChange={(e) =>
                handleInputChange(
                  "stateTaxRate",
                  parseFloat(e.target.value) || 0,
                )
              }
              className="pr-7"
            />
            <span className="absolute right-3 top-2.5 text-muted-foreground">
              %
            </span>
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base">Deductions</Label>
          <Button variant="outline" size="sm" onClick={addDeduction}>
            <Plus className="h-4 w-4 mr-2" /> Add
          </Button>
        </div>

        {inputs.deductions.length === 0 && (
          <div className="text-sm text-muted-foreground italic text-center p-4 border border-dashed rounded">
            No deductions added. Add 401k, Insurance, etc.
          </div>
        )}

        <div className="space-y-3">
          {inputs.deductions.map((d) => (
            <div
              key={d.id}
              className="flex flex-wrap gap-2 items-end p-3 border rounded-md bg-muted/20"
            >
              <div className="grid gap-1 w-full md:w-auto md:flex-1">
                <Label className="text-xs">Name</Label>
                <Input
                  value={d.name}
                  onChange={(e) =>
                    updateDeduction(d.id, "name", e.target.value)
                  }
                  placeholder="e.g. 401k"
                />
              </div>
              <div className="grid gap-1 w-24">
                <Label className="text-xs">Type</Label>
                <Select
                  value={d.type}
                  onValueChange={(v: any) => updateDeduction(d.id, "type", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">$</SelectItem>
                    <SelectItem value="percentage">%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1 w-28">
                <Label className="text-xs">Amount</Label>
                <Input
                  type="number"
                  value={d.amount}
                  onChange={(e) =>
                    updateDeduction(
                      d.id,
                      "amount",
                      parseFloat(e.target.value) || 0,
                    )
                  }
                />
              </div>
              <div className="grid gap-1 w-28">
                <Label className="text-xs">Pre-Tax?</Label>
                <Select
                  value={d.preTax ? "yes" : "no"}
                  onValueChange={(v) =>
                    updateDeduction(d.id, "preTax", v === "yes")
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="mb-0.5 text-destructive"
                onClick={() => removeDeduction(d.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
