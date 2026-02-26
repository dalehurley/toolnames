import { useState, useMemo } from "react";
import { useSEO } from "@/hooks/useSEO";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign } from "lucide-react";
import { SalaryInputs, TakeHomePayResult, ConvertedSalary } from "./types";
import { convertSalary, calculateTakeHomePay } from "./salaryUtils";
import { SalaryInputsForm } from "./SalaryInputs";
import { SalaryResults } from "./SalaryResults";
import { TaxBreakdown } from "./TaxBreakdown";
import { SalaryVisualizations } from "./SalaryVisualizations";

const INITIAL_STATE: SalaryInputs = {
  amount: 60000,
  period: "annual",
  hoursPerWeek: 40,
  stateTaxRate: 0,
  filingStatus: "single",
  deductions: [],
};

export function SalaryCalculator() {
  useSEO({
    title: "Salary Calculator: Paycheck & Tax Estimator | ToolNames",
    description:
      "Convert your salary between hourly, annual, monthly formats and calculate take-home pay after federal & state taxes.",
    keywords:
      "salary calculator, paycheck calculator, take home pay, tax calculator, hourly to salary",
  });

  const [inputs, setInputs] = useState<SalaryInputs>(INITIAL_STATE);
  const [activeTab, setActiveTab] = useState("overview");

  const convertedSalary: ConvertedSalary = useMemo(() => {
    return convertSalary(inputs.amount, inputs.period, inputs.hoursPerWeek);
  }, [inputs.amount, inputs.period, inputs.hoursPerWeek]);

  const takeHomeResult: TakeHomePayResult = useMemo(() => {
    // Calculate based on ANNUAL amount always
    return calculateTakeHomePay(
      convertedSalary.annual,
      inputs.stateTaxRate,
      inputs.filingStatus,
      inputs.deductions,
    );
  }, [
    convertedSalary.annual,
    inputs.stateTaxRate,
    inputs.filingStatus,
    inputs.deductions,
  ]);

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-5xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-primary" />
            <CardTitle>Salary Calculator</CardTitle>
          </div>
          <CardDescription>
            Convert your salary and estimate your exact take-home pay after
            taxes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid lg:grid-cols-[350px_1fr] gap-8">
            {/* Left Column: Inputs */}
            <div className="space-y-6">
              <Card className="border-muted bg-muted/10">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Your Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <SalaryInputsForm inputs={inputs} onChange={setInputs} />
                </CardContent>
              </Card>

              {/* Quick Stats Summary for Mobile/Sidebar mainly */}
              <Card className="bg-primary text-primary-foreground border-none shadow-md">
                <CardContent className="pt-6">
                  <div className="text-sm font-medium opacity-90">
                    Estimated Net Pay
                  </div>
                  <div className="text-3xl font-bold mt-1">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                      maximumFractionDigits: 0,
                    }).format(takeHomeResult.netPay)}
                    <span className="text-sm font-normal opacity-75 ml-1">
                      /yr
                    </span>
                  </div>
                  <div className="text-sm mt-1 opacity-80">
                    ~
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                      maximumFractionDigits: 0,
                    }).format(takeHomeResult.netPay / 26)}{" "}
                    bi-weekly
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Results */}
            <div className="space-y-6">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="breakdown">
                    Detailed Breakdown
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-6 space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">
                      Gross Income Equivalents
                    </h3>
                    <SalaryResults amounts={convertedSalary} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-3">
                      Tax & Deduction Analysis
                    </h3>
                    <SalaryVisualizations result={takeHomeResult} />
                  </div>
                </TabsContent>

                <TabsContent value="breakdown" className="mt-6">
                  <TaxBreakdown result={takeHomeResult} />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
