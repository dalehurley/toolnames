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
import { Plus, Trash2 } from "lucide-react";
import { ROIInputs, CashFlow } from "./types";
import { format, isValid } from "date-fns";
import { Separator } from "@/components/ui/separator";

interface ROIInputsFormProps {
  inputs: ROIInputs;
  onChange: (inputs: ROIInputs) => void;
  mode: "simple" | "advanced";
}

export function ROIInputsForm({ inputs, onChange, mode }: ROIInputsFormProps) {
  const handleChange = (field: keyof ROIInputs, value: string | number) => {
    if (field === "finalValue" && (value === "" || isNaN(Number(value)))) {
      onChange({ ...inputs, [field]: 0 }); // Fallback to 0 if empty/invalid for numbers
      return;
    }
    onChange({ ...inputs, [field]: value });
  };

  const handleCashFlowAdd = () => {
    const newFlow: CashFlow = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date(),
      amount: 0,
      type: "contribution",
    };
    onChange({ ...inputs, cashFlows: [...(inputs.cashFlows || []), newFlow] });
  };

  const handleCashFlowChange = (
    id: string,
    field: keyof CashFlow,
    value: any,
  ) => {
    const newFlows = inputs.cashFlows.map((f) => {
      if (f.id === id) return { ...f, [field]: value };
      return f;
    });
    onChange({ ...inputs, cashFlows: newFlows });
  };

  const handleCashFlowRemove = (id: string) => {
    onChange({
      ...inputs,
      cashFlows: inputs.cashFlows.filter((f) => f.id !== id),
    });
  };

  const formatDateForInput = (date: Date) => {
    if (!isValid(date)) return "";
    return format(date, "yyyy-MM-dd");
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="initialInvestment">Initial Investment</Label>
        <div className="relative">
          <span className="absolute left-3 top-2.5 text-muted-foreground">
            $
          </span>
          <Input
            id="initialInvestment"
            type="number"
            value={inputs.initialInvestment}
            onChange={(e) =>
              handleChange("initialInvestment", parseFloat(e.target.value) || 0)
            }
            className="pl-7"
            placeholder="0.00"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="investmentPeriod">Period Length</Label>
          <Input
            id="investmentPeriod"
            type="number"
            value={inputs.investmentPeriod}
            onChange={(e) =>
              handleChange("investmentPeriod", parseFloat(e.target.value) || 0)
            }
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="periodUnit">Unit</Label>
          <Select
            value={inputs.periodUnit}
            onValueChange={(val: any) => handleChange("periodUnit", val)}
          >
            <SelectTrigger id="periodUnit">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="years">Years</SelectItem>
              <SelectItem value="months">Months</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="finalValue">Final Value</Label>
        <div className="relative">
          <span className="absolute left-3 top-2.5 text-muted-foreground">
            $
          </span>
          <Input
            id="finalValue"
            type="number"
            value={inputs.finalValue || ""}
            onChange={(e) =>
              handleChange("finalValue", parseFloat(e.target.value))
            }
            className="pl-7"
            placeholder="0.00"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Total value of the investment at the end of period.
        </p>
      </div>

      {mode === "advanced" && (
        <>
          <Separator className="my-4" />
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">Cash Flows</Label>
                <p className="text-xs text-muted-foreground">
                  Add deposits or withdrawals during the period
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={handleCashFlowAdd}>
                <Plus className="mr-2 h-4 w-4" /> Add Flow
              </Button>
            </div>

            {(!inputs.cashFlows || inputs.cashFlows.length === 0) && (
              <div className="text-sm text-muted-foreground italic border border-dashed rounded-md p-4 text-center">
                No additional cash flows added.
              </div>
            )}

            <div className="space-y-2">
              {inputs.cashFlows?.map((flow) => (
                <div key={flow.id} className="flex gap-2 items-end">
                  <div className="grid w-[120px] gap-1">
                    <Label className="text-xs">Type</Label>
                    <Select
                      value={flow.type}
                      onValueChange={(v: any) =>
                        handleCashFlowChange(flow.id, "type", v)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="contribution">Deposit</SelectItem>
                        <SelectItem value="withdrawal">Withdrawal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid flex-1 gap-1">
                    <Label className="text-xs">Amount</Label>
                    <Input
                      type="number"
                      value={flow.amount || ""}
                      onChange={(e) =>
                        handleCashFlowChange(
                          flow.id,
                          "amount",
                          parseFloat(e.target.value) || 0,
                        )
                      }
                      placeholder="0.00"
                    />
                  </div>

                  <div className="grid w-[140px] gap-1">
                    <Label className="text-xs">Date</Label>
                    <Input
                      type="date"
                      value={formatDateForInput(flow.date)}
                      onChange={(e) =>
                        handleCashFlowChange(
                          flow.id,
                          "date",
                          new Date(e.target.value),
                        )
                      }
                    />
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="mb-0.5"
                    onClick={() => handleCashFlowRemove(flow.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
