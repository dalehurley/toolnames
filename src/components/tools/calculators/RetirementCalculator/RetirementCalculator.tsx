import { useState, useMemo, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PiggyBank, Save, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useSEO } from "@/hooks/useSEO";
import { RetirementInputs } from "./RetirementInputs";
import { RetirementResults } from "./RetirementResults";
import { RetirementCharts } from "./RetirementCharts";
import { ScenarioComparison } from "./ScenarioComparison";
import {
  RetirementInputs as RetirementInputsType,
  RetirementScenario,
  calculateRetirement,
  validateInputs,
} from "./retirementUtils";

const DEFAULT_INPUTS: RetirementInputsType = {
  currentAge: 30,
  retirementAge: 65,
  currentSavings: 50000,
  monthlyContribution: 500,
  annualReturn: 0.07,
  desiredIncome: 50000,
  inflationRate: 0.03,
  withdrawalStrategy: "four-percent",
  includeSocialSecurity: false,
  employerMatch: false,
};

export function RetirementCalculator() {
  const [inputs, setInputs] = useState<RetirementInputsType>(DEFAULT_INPUTS);
  const [scenarios, setScenarios] = useState<RetirementScenario[]>([]);
  const [scenarioName, setScenarioName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // SEO Configuration
  useSEO({
    title: "Retirement Calculator: Plan Your Retirement Savings | ToolNames",
    description:
      "Free retirement calculator to plan your savings, withdrawal strategies, and compare scenarios. Calculate how much you need to retire comfortably.",
    keywords:
      "retirement calculator, retirement planning, 401k calculator, retirement savings, withdrawal strategy, 4% rule, financial planning",
    canonical: window.location.href,
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "Retirement Calculator",
      description:
        "Calculate retirement savings needs, withdrawal strategies, and compare scenarios.",
      applicationCategory: "FinanceApplication",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
    },
  });

  // Load scenarios from localStorage
  useEffect(() => {
    const savedScenarios = localStorage.getItem("retirementScenarios");
    if (savedScenarios) {
      try {
        const parsed = JSON.parse(savedScenarios);
        setScenarios(parsed);
      } catch (error) {
        console.error("Failed to load scenarios:", error);
      }
    }
  }, []);

  // Save scenarios to localStorage
  useEffect(() => {
    if (scenarios.length > 0) {
      localStorage.setItem("retirementScenarios", JSON.stringify(scenarios));
    }
  }, [scenarios]);

  // Calculate results with memoization
  const results = useMemo(() => {
    const validation = validateInputs(inputs);
    setErrors(validation.errors);

    if (!validation.isValid) {
      return null;
    }

    try {
      return calculateRetirement(inputs);
    } catch (error) {
      console.error("Calculation error:", error);
      toast.error(
        error instanceof Error ? error.message : "Calculation failed",
      );
      return null;
    }
  }, [inputs]);

  // Handle adding a new scenario
  const handleAddScenario = () => {
    if (!results) {
      toast.error("Please fix validation errors before saving scenario");
      return;
    }

    if (scenarios.length >= 3) {
      toast.error("Maximum of 3 scenarios allowed");
      return;
    }

    setIsDialogOpen(true);
  };

  const confirmAddScenario = () => {
    if (!scenarioName.trim()) {
      toast.error("Please enter a scenario name");
      return;
    }

    if (!results) return;

    const newScenario: RetirementScenario = {
      id: Date.now().toString(),
      name: scenarioName.trim(),
      inputs: { ...inputs },
      results: { ...results },
      createdAt: new Date(),
    };

    setScenarios([...scenarios, newScenario]);
    setScenarioName("");
    setIsDialogOpen(false);
    toast.success(`Scenario "${newScenario.name}" saved`);
  };

  // Handle removing a scenario
  const handleRemoveScenario = (id: string) => {
    const scenario = scenarios.find((s) => s.id === id);
    setScenarios(scenarios.filter((s) => s.id !== id));
    toast.success(`Scenario "${scenario?.name}" removed`);
  };

  // Handle reset
  const handleReset = () => {
    setInputs(DEFAULT_INPUTS);
    setErrors({});
    toast.success("Calculator reset to default values");
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <PiggyBank className="w-10 h-10 text-primary" />
          <h1 className="text-4xl font-bold">Retirement Calculator</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Plan your retirement savings, explore withdrawal strategies, and
          compare different scenarios to achieve your retirement goals.
        </p>
      </div>

      <Tabs defaultValue="calculator" className="w-full">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
          <TabsTrigger value="calculator">Calculator</TabsTrigger>
          <TabsTrigger value="charts">Charts</TabsTrigger>
          <TabsTrigger value="scenarios">
            Scenarios ({scenarios.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left Column: Inputs */}
            <div className="lg:col-span-2">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    className="flex-1"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        onClick={handleAddScenario}
                        disabled={!results || scenarios.length >= 3}
                        className="flex-1"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save Scenario
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Save Retirement Scenario</DialogTitle>
                        <DialogDescription>
                          Give this scenario a name to compare it with other
                          retirement plans.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="scenarioName">Scenario Name</Label>
                          <Input
                            id="scenarioName"
                            placeholder="e.g., Conservative Plan, Aggressive Growth"
                            value={scenarioName}
                            onChange={(e) => setScenarioName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                confirmAddScenario();
                              }
                            }}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setIsDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button onClick={confirmAddScenario}>
                          Save Scenario
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                <RetirementInputs
                  inputs={inputs}
                  onChange={setInputs}
                  errors={errors}
                />
              </div>
            </div>

            {/* Right Column: Results */}
            <div className="lg:col-span-3">
              {results ? (
                <RetirementResults results={results} inputs={inputs} />
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Results</CardTitle>
                    <CardDescription>
                      Enter your retirement details to see projections
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="py-12">
                    <div className="text-center text-muted-foreground">
                      {Object.keys(errors).length > 0 ? (
                        <div className="space-y-2">
                          <p className="font-medium text-red-500">
                            Please fix the following errors:
                          </p>
                          <ul className="text-sm space-y-1">
                            {Object.values(errors).map((error, index) => (
                              <li key={index}>• {error}</li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <p>Configure your retirement plan to see results</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="charts" className="mt-6">
          {results ? (
            <RetirementCharts results={results} />
          ) : (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-muted-foreground">
                  <PiggyBank className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p>Complete the calculator form to view charts</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="scenarios" className="mt-6">
          <ScenarioComparison
            scenarios={scenarios}
            onAddScenario={handleAddScenario}
            onRemoveScenario={handleRemoveScenario}
          />
        </TabsContent>
      </Tabs>

      {/* Educational Content */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Retirement Planning Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">The 4% Rule</h3>
              <p className="text-sm text-muted-foreground">
                A widely-used retirement withdrawal strategy suggesting you can
                safely withdraw 4% of your retirement portfolio annually,
                adjusted for inflation, without running out of money for 30
                years.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Start Early</h3>
              <p className="text-sm text-muted-foreground">
                The power of compound interest means starting even small
                contributions early can have a massive impact on your retirement
                savings. Every year counts.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Maximize Employer Match</h3>
              <p className="text-sm text-muted-foreground">
                If your employer offers a 401(k) match, contribute enough to get
                the full match. It's essentially free money that can
                significantly boost your retirement savings.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Diversify Investments</h3>
              <p className="text-sm text-muted-foreground">
                Don't put all your eggs in one basket. A diversified portfolio
                across stocks, bonds, and other assets can help manage risk
                while maintaining growth potential.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
