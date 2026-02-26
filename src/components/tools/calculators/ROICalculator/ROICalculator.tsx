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
import { TrendingUp } from "lucide-react";
import { ROIInputs } from "./types";
import { calculateROI } from "./roiUtils";
import { ROIInputsForm } from "./ROIInputs";
import { ROIResults } from "./ROIResults";
import { ROIVisualizations } from "./ROIVisualizations";
import { InvestmentComparison } from "./InvestmentComparison";

const INITIAL_STATE: ROIInputs = {
  initialInvestment: 10000,
  investmentPeriod: 5,
  periodUnit: "years",
  finalValue: 15000,
  cashFlows: [],
  variableRates: [],
  taxRate: 0,
  inflationRate: 0,
};

export function ROICalculator() {
  useSEO({
    title: "ROI Calculator: Calculate Return on Investment | ToolNames",
    description:
      "Free ROI calculator to calculate return on investment percentage, annualized returns, and compare investment scenarios.",
    keywords:
      "roi calculator, return on investment, investment return, calculator, investment",
  });

  const [inputs, setInputs] = useState<ROIInputs>(INITIAL_STATE);
  const [activeTab, setActiveTab] = useState("simple");

  const results = useMemo(() => {
    return calculateROI(inputs);
  }, [inputs]);

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            <CardTitle>ROI Calculator</CardTitle>
          </div>
          <CardDescription>
            Calculate your return on investment with simple and advanced
            options.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="simple">Simple ROI</TabsTrigger>
              <TabsTrigger value="advanced">Advanced ROI</TabsTrigger>
              <TabsTrigger value="comparison">Comparison</TabsTrigger>
            </TabsList>

            <TabsContent value="simple" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-6">
                  <ROIInputsForm
                    inputs={inputs}
                    onChange={setInputs}
                    mode="simple"
                  />
                </div>
                <div className="space-y-6">
                  <ROIResults result={results} />
                  <ROIVisualizations result={results} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-6">
                  <ROIInputsForm
                    inputs={inputs}
                    onChange={setInputs}
                    mode="advanced"
                  />
                </div>
                <div className="space-y-6">
                  <ROIResults result={results} />
                  <ROIVisualizations result={results} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="comparison">
              <InvestmentComparison />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
