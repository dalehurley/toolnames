import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RetirementInputs as RetirementInputsType } from "./retirementUtils";

interface RetirementInputsProps {
  inputs: RetirementInputsType;
  onChange: (inputs: RetirementInputsType) => void;
  errors?: Record<string, string>;
}

export function RetirementInputs({
  inputs,
  onChange,
  errors = {},
}: RetirementInputsProps) {
  const updateInput = (field: keyof RetirementInputsType, value: any) => {
    onChange({ ...inputs, [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currentAge">Current Age</Label>
              <Input
                id="currentAge"
                type="number"
                min="18"
                max="100"
                value={inputs.currentAge}
                onChange={(e) =>
                  updateInput("currentAge", parseInt(e.target.value) || 0)
                }
                className={errors.currentAge ? "border-red-500" : ""}
              />
              {errors.currentAge && (
                <p className="text-sm text-red-500">{errors.currentAge}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="retirementAge">Retirement Age</Label>
              <Input
                id="retirementAge"
                type="number"
                min={inputs.currentAge}
                max="100"
                value={inputs.retirementAge}
                onChange={(e) =>
                  updateInput("retirementAge", parseInt(e.target.value) || 0)
                }
                className={errors.retirementAge ? "border-red-500" : ""}
              />
              {errors.retirementAge && (
                <p className="text-sm text-red-500">{errors.retirementAge}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Savings & Contributions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Savings & Contributions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentSavings">Current Retirement Savings</Label>
            <Input
              id="currentSavings"
              type="number"
              min="0"
              step="1000"
              value={inputs.currentSavings}
              onChange={(e) =>
                updateInput("currentSavings", parseFloat(e.target.value) || 0)
              }
              className={errors.currentSavings ? "border-red-500" : ""}
            />
            {errors.currentSavings && (
              <p className="text-sm text-red-500">{errors.currentSavings}</p>
            )}
            <p className="text-sm text-muted-foreground">
              Total amount currently saved for retirement
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="monthlyContribution">
              Monthly Contribution ($)
            </Label>
            <Input
              id="monthlyContribution"
              type="number"
              min="0"
              step="50"
              value={inputs.monthlyContribution}
              onChange={(e) =>
                updateInput(
                  "monthlyContribution",
                  parseFloat(e.target.value) || 0,
                )
              }
              className={errors.monthlyContribution ? "border-red-500" : ""}
            />
            {errors.monthlyContribution && (
              <p className="text-sm text-red-500">
                {errors.monthlyContribution}
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              Amount you plan to contribute each month
            </p>
          </div>

          {/* Employer Match */}
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="employerMatch">Employer Match</Label>
                <p className="text-sm text-muted-foreground">
                  Does your employer match contributions?
                </p>
              </div>
              <Switch
                id="employerMatch"
                checked={inputs.employerMatch}
                onCheckedChange={(checked) =>
                  updateInput("employerMatch", checked)
                }
              />
            </div>

            {inputs.employerMatch && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4">
                <div className="space-y-2">
                  <Label htmlFor="employerMatchPercentage">
                    Match Percentage (%)
                  </Label>
                  <Input
                    id="employerMatchPercentage"
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={inputs.employerMatchPercentage || 0}
                    onChange={(e) =>
                      updateInput(
                        "employerMatchPercentage",
                        parseFloat(e.target.value) || 0,
                      )
                    }
                  />
                  <p className="text-sm text-muted-foreground">
                    e.g., 50% means employer matches $0.50 per $1.00
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employerMatchLimit">
                    Annual Match Limit ($)
                  </Label>
                  <Input
                    id="employerMatchLimit"
                    type="number"
                    min="0"
                    step="100"
                    value={inputs.employerMatchLimit || 0}
                    onChange={(e) =>
                      updateInput(
                        "employerMatchLimit",
                        parseFloat(e.target.value) || 0,
                      )
                    }
                  />
                  <p className="text-sm text-muted-foreground">
                    Maximum annual employer contribution
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Investment Returns & Inflation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Returns & Inflation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="annualReturn">Expected Annual Return</Label>
              <span className="text-sm font-medium">
                {(inputs.annualReturn * 100).toFixed(1)}%
              </span>
            </div>
            <Slider
              id="annualReturn"
              min={0}
              max={20}
              step={0.5}
              value={[inputs.annualReturn * 100]}
              onValueChange={([value]) =>
                updateInput("annualReturn", value / 100)
              }
              className="py-4"
            />
            <p className="text-sm text-muted-foreground">
              Typical stock market returns: 7-10% annually
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="inflationRate">Inflation Rate</Label>
              <span className="text-sm font-medium">
                {(inputs.inflationRate * 100).toFixed(1)}%
              </span>
            </div>
            <Slider
              id="inflationRate"
              min={0}
              max={10}
              step={0.1}
              value={[inputs.inflationRate * 100]}
              onValueChange={([value]) =>
                updateInput("inflationRate", value / 100)
              }
              className="py-4"
            />
            <p className="text-sm text-muted-foreground">
              Historical average: 2-3% annually
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Retirement Income Goals */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Retirement Income Goals</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="desiredIncome">Desired Annual Income ($)</Label>
            <Input
              id="desiredIncome"
              type="number"
              min="0"
              step="1000"
              value={inputs.desiredIncome}
              onChange={(e) =>
                updateInput("desiredIncome", parseFloat(e.target.value) || 0)
              }
              className={errors.desiredIncome ? "border-red-500" : ""}
            />
            {errors.desiredIncome && (
              <p className="text-sm text-red-500">{errors.desiredIncome}</p>
            )}
            <p className="text-sm text-muted-foreground">
              Annual income needed in retirement (in today's dollars)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="withdrawalStrategy">Withdrawal Strategy</Label>
            <Select
              value={inputs.withdrawalStrategy}
              onValueChange={(value: any) =>
                updateInput("withdrawalStrategy", value)
              }
            >
              <SelectTrigger id="withdrawalStrategy">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="four-percent">
                  4% Rule (Recommended)
                </SelectItem>
                <SelectItem value="fixed">Fixed Dollar Amount</SelectItem>
                <SelectItem value="percentage">Fixed Percentage</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              {inputs.withdrawalStrategy === "four-percent" &&
                "Withdraw 4% of initial portfolio annually (adjusted for inflation)"}
              {inputs.withdrawalStrategy === "fixed" &&
                "Withdraw a fixed dollar amount each year"}
              {inputs.withdrawalStrategy === "percentage" &&
                "Withdraw a fixed percentage of remaining balance"}
            </p>
          </div>

          {inputs.withdrawalStrategy === "fixed" && (
            <div className="space-y-2">
              <Label htmlFor="withdrawalAmount">
                Annual Withdrawal Amount ($)
              </Label>
              <Input
                id="withdrawalAmount"
                type="number"
                min="0"
                step="1000"
                value={inputs.withdrawalAmount || 0}
                onChange={(e) =>
                  updateInput(
                    "withdrawalAmount",
                    parseFloat(e.target.value) || 0,
                  )
                }
              />
            </div>
          )}

          {inputs.withdrawalStrategy === "percentage" && (
            <div className="space-y-2">
              <Label htmlFor="withdrawalPercentage">
                Withdrawal Percentage (%)
              </Label>
              <Input
                id="withdrawalPercentage"
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={inputs.withdrawalPercentage || 0}
                onChange={(e) =>
                  updateInput(
                    "withdrawalPercentage",
                    parseFloat(e.target.value) || 0,
                  )
                }
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Social Security */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Additional Income</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="includeSocialSecurity">
                Include Social Security
              </Label>
              <p className="text-sm text-muted-foreground">
                Add expected Social Security benefits
              </p>
            </div>
            <Switch
              id="includeSocialSecurity"
              checked={inputs.includeSocialSecurity}
              onCheckedChange={(checked) =>
                updateInput("includeSocialSecurity", checked)
              }
            />
          </div>

          {inputs.includeSocialSecurity && (
            <div className="space-y-2 pl-4">
              <Label htmlFor="socialSecurityAmount">
                Annual Social Security Amount ($)
              </Label>
              <Input
                id="socialSecurityAmount"
                type="number"
                min="0"
                step="100"
                value={inputs.socialSecurityAmount || 0}
                onChange={(e) =>
                  updateInput(
                    "socialSecurityAmount",
                    parseFloat(e.target.value) || 0,
                  )
                }
              />
              <p className="text-sm text-muted-foreground">
                Average Social Security benefit: $20,000 - $35,000/year
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
