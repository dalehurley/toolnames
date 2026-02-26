import { useState, useEffect, Suspense } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";

// Chart.js types
interface TooltipItem {
  label: string;
  raw: number;
}

// Lazy load Chart.js registration and components
const loadChartJS = async () => {
  const chartModule = await import("chart.js");
  const {
    Chart: ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
  } = chartModule;

  // Register Chart.js components
  ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
  );

  const reactChartModule = await import("react-chartjs-2");
  return {
    Bar: reactChartModule.Bar,
    Pie: reactChartModule.Pie,
    Line: reactChartModule.Line,
  };
};

interface AmortizationItem {
  year: number;
  principalPayment: number;
  interestPayment: number;
  remainingBalance: number;
}

export const MortgageCalculator = () => {
  const [loanAmount, setLoanAmount] = useState<number>(300000);
  const [interestRate, setInterestRate] = useState<number>(4.5);
  const [loanTerm, setLoanTerm] = useState<number>(30);
  const [downPayment, setDownPayment] = useState<number>(60000);
  const [homePrice, setHomePrice] = useState<number>(360000);
  const [propertyTax, setPropertyTax] = useState<number>(2400);
  const [homeInsurance, setHomeInsurance] = useState<number>(1200);
  const [pmi, setPmi] = useState<number>(0);
  const [includeTaxesInsurance, setIncludeTaxesInsurance] =
    useState<boolean>(false);
  const [monthlyPayment, setMonthlyPayment] = useState<number>(0);
  const [totalPayment, setTotalPayment] = useState<number>(0);
  const [totalInterest, setTotalInterest] = useState<number>(0);
  const [amortizationSchedule, setAmortizationSchedule] = useState<
    AmortizationItem[]
  >([]);
  const [comparisonMode, setComparisonMode] = useState<boolean>(false);
  const [comparisonRate, setComparisonRate] = useState<number>(
    interestRate + 1
  );
  const [comparisonPayment, setComparisonPayment] = useState<number>(0);
  const [affordabilityIncome, setAffordabilityIncome] =
    useState<number>(100000);
  const [affordabilityPercentage, setAffordabilityPercentage] =
    useState<number>(28);
  const [maxAffordablePayment, setMaxAffordablePayment] = useState<number>(0);
  const [chartsEnabled, setChartsEnabled] = useState<boolean>(false);
  const [chartComponents, setChartComponents] = useState<Record<
    string,
    React.ComponentType<Record<string, unknown>>
  > | null>(null);

  // Load charts when user requests them
  const enableCharts = async () => {
    if (!chartsEnabled && !chartComponents) {
      const components = await loadChartJS();
      setChartComponents(
        components as unknown as Record<
          string,
          React.ComponentType<Record<string, unknown>>
        >
      );
    }
    setChartsEnabled(true);
  };

  // Chart wrapper component
  const ChartWrapper: React.FC<{
    type: "Bar" | "Pie" | "Line";
    options: Record<string, unknown>;
    data: Record<string, unknown>;
    height?: string;
  }> = ({ type, options, data, height = "h-80" }) => {
    if (!chartsEnabled) {
      return (
        <div
          className={`${height} border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors`}
          onClick={enableCharts}
        >
          <div className="text-center">
            <div className="text-gray-500 mb-2">Click to load {type} chart</div>
            <div className="text-sm text-gray-400">
              Charts will load on demand for better performance
            </div>
          </div>
        </div>
      );
    }

    if (!chartComponents) {
      return (
        <div className={`${height} flex items-center justify-center`}>
          <div className="animate-pulse">Loading chart...</div>
        </div>
      );
    }

    const ChartComponent = chartComponents[type];
    return (
      <Suspense
        fallback={
          <div className={`${height} flex items-center justify-center`}>
            <div className="animate-pulse">Loading chart...</div>
          </div>
        }
      >
        <div className={height}>
          {ChartComponent && <ChartComponent {...{ options, data }} />}
        </div>
      </Suspense>
    );
  };

  // Calculate PMI automatically when down payment or home price changes
  useEffect(() => {
    const downPaymentPercent = (downPayment / homePrice) * 100;
    // PMI is typically required when down payment is less than 20%
    if (downPaymentPercent < 20) {
      // Typical PMI is 0.5-1% of loan amount annually
      const annualPmi = (homePrice - downPayment) * 0.005;
      setPmi(annualPmi);
    } else {
      setPmi(0);
    }

    // Update loan amount when home price or down payment changes
    setLoanAmount(homePrice - downPayment);
  }, [homePrice, downPayment]);

  const handleInputChange = (field: string, value: number | boolean) => {
    switch (field) {
      case "homePrice":
        setHomePrice(value as number);
        break;
      case "downPayment":
        setDownPayment(value as number);
        break;
      case "loanAmount":
        setLoanAmount(value as number);
        break;
      case "interestRate":
        setInterestRate(value as number);
        break;
      case "loanTerm":
        setLoanTerm(value as number);
        break;
      case "propertyTax":
        setPropertyTax(value as number);
        break;
      case "homeInsurance":
        setHomeInsurance(value as number);
        break;
      case "pmi":
        setPmi(value as number);
        break;
      case "includeTaxesInsurance":
        setIncludeTaxesInsurance(value as boolean);
        break;
    }
  };

  const calculateMortgage = () => {
    // Convert annual rate to monthly rate
    const monthlyRate = interestRate / 100 / 12;
    // Convert years to months
    const termMonths = loanTerm * 12;

    if (monthlyRate === 0) {
      // Simple division if no interest
      const payment = loanAmount / termMonths;
      setMonthlyPayment(payment);
      setTotalPayment(loanAmount);
      setTotalInterest(0);
      calculateAmortizationSchedule(payment, 0, termMonths);
    } else {
      // Standard mortgage calculation formula
      const x = Math.pow(1 + monthlyRate, termMonths);
      const monthly = (loanAmount * x * monthlyRate) / (x - 1);

      // Calculate total monthly payment with taxes and insurance if included
      let totalMonthly = monthly;
      if (includeTaxesInsurance) {
        const monthlyPropertyTax = propertyTax / 12;
        const monthlyHomeInsurance = homeInsurance / 12;
        const monthlyPmi = pmi / 12;
        totalMonthly += monthlyPropertyTax + monthlyHomeInsurance + monthlyPmi;
      }

      setMonthlyPayment(totalMonthly);
      setTotalPayment(
        monthly * termMonths +
          (includeTaxesInsurance ? propertyTax + homeInsurance + pmi : 0) *
            loanTerm
      );
      setTotalInterest(monthly * termMonths - loanAmount);
      calculateAmortizationSchedule(monthly, monthlyRate, termMonths);
    }
  };

  const calculateAmortizationSchedule = (
    payment: number,
    monthlyRate: number,
    totalMonths: number
  ) => {
    const schedule: AmortizationItem[] = [];
    let remainingBalance = loanAmount;
    let yearlyPrincipal = 0;
    let yearlyInterest = 0;

    for (let month = 1; month <= totalMonths; month++) {
      const interestForMonth = remainingBalance * monthlyRate;
      const principalForMonth = payment - interestForMonth;

      yearlyPrincipal += principalForMonth;
      yearlyInterest += interestForMonth;

      remainingBalance -= principalForMonth;

      if (month % 12 === 0 || month === totalMonths) {
        schedule.push({
          year: Math.ceil(month / 12),
          principalPayment: yearlyPrincipal,
          interestPayment: yearlyInterest,
          remainingBalance: Math.max(0, remainingBalance),
        });

        yearlyPrincipal = 0;
        yearlyInterest = 0;
      }
    }

    setAmortizationSchedule(schedule);
  };

  useEffect(() => {
    calculateMortgage();
  }, [loanAmount, interestRate, loanTerm]);

  // Add new useEffect for affordability calculation
  useEffect(() => {
    // General rule: housing costs should not exceed 28-36% of gross monthly income
    const monthlyIncome = affordabilityIncome / 12;
    const affordable = (monthlyIncome * affordabilityPercentage) / 100;
    setMaxAffordablePayment(affordable);
  }, [affordabilityIncome, affordabilityPercentage]);

  // Calculate comparison mortgage payment
  const calculateComparisonMortgage = () => {
    // Convert annual rate to monthly rate
    const monthlyRate = comparisonRate / 100 / 12;
    // Convert years to months
    const termMonths = loanTerm * 12;

    if (monthlyRate === 0) {
      // Simple division if no interest
      const payment = loanAmount / termMonths;
      setComparisonPayment(payment);
    } else {
      // Standard mortgage calculation formula
      const x = Math.pow(1 + monthlyRate, termMonths);
      const monthly = (loanAmount * x * monthlyRate) / (x - 1);

      // Calculate total monthly payment with taxes and insurance if included
      let totalMonthly = monthly;
      if (includeTaxesInsurance) {
        const monthlyPropertyTax = propertyTax / 12;
        const monthlyHomeInsurance = homeInsurance / 12;
        const monthlyPmi = pmi / 12;
        totalMonthly += monthlyPropertyTax + monthlyHomeInsurance + monthlyPmi;
      }

      setComparisonPayment(totalMonthly);
    }
  };

  // Call comparison calculation when relevant values change
  useEffect(() => {
    if (comparisonMode) {
      calculateComparisonMortgage();
    }
  }, [
    comparisonMode,
    comparisonRate,
    loanAmount,
    loanTerm,
    includeTaxesInsurance,
    propertyTax,
    homeInsurance,
    pmi,
  ]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  // Existing chart data
  const chartData = {
    labels: amortizationSchedule.map((item) => `Year ${item.year}`),
    datasets: [
      {
        label: "Principal",
        data: amortizationSchedule.map((item) => item.principalPayment),
        backgroundColor: "rgba(53, 162, 235, 0.5)",
      },
      {
        label: "Interest",
        data: amortizationSchedule.map((item) => item.interestPayment),
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
    ],
  };

  // Payment breakdown pie chart data
  const paymentBreakdownData = {
    labels: [
      "Principal",
      "Interest",
      ...(includeTaxesInsurance ? ["Property Tax", "Home Insurance"] : []),
      ...(pmi > 0 && includeTaxesInsurance ? ["PMI"] : []),
    ],
    datasets: [
      {
        data: [
          loanAmount,
          totalInterest,
          ...(includeTaxesInsurance
            ? [propertyTax * loanTerm, homeInsurance * loanTerm]
            : []),
          ...(pmi > 0 && includeTaxesInsurance ? [pmi * loanTerm] : []),
        ],
        backgroundColor: [
          "rgba(53, 162, 235, 0.8)",
          "rgba(255, 99, 132, 0.8)",
          "rgba(75, 192, 192, 0.8)",
          "rgba(255, 206, 86, 0.8)",
          "rgba(153, 102, 255, 0.8)",
        ],
        borderWidth: 1,
      },
    ],
  };

  // Balance over time line chart data with comparison
  const balanceOverTimeData = {
    labels: amortizationSchedule.map((item) => `Year ${item.year}`),
    datasets: [
      {
        label: "Remaining Balance",
        data: amortizationSchedule.map((item) => item.remainingBalance),
        borderColor: "rgba(75, 192, 192, 0.8)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.1,
        fill: true,
      },
      ...(comparisonMode
        ? [
            {
              label: `Remaining Balance (${comparisonRate}%)`,
              data: amortizationSchedule.map(
                (item, idx) =>
                  // Simple approximation of remaining balance at different rate
                  item.remainingBalance *
                  (1 +
                    ((comparisonRate - interestRate) / 100) *
                      0.5 *
                      (loanTerm - idx))
              ),
              borderColor: "rgba(255, 159, 64, 0.8)",
              backgroundColor: "rgba(255, 159, 64, 0.2)",
              tension: 0.1,
              borderDash: [5, 5],
              fill: false,
            },
          ]
        : []),
    ],
  };

  // Define the bar chart options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Yearly Amortization",
      },
    },
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
        ticks: {
          callback: function (value: string | number) {
            if (typeof value === "number") {
              return formatCurrency(value);
            }
            return value;
          },
        },
      },
    },
  };

  // Update the pie chart options to use the proper Chart.js typing
  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "right" as const,
      },
      title: {
        display: true,
        text: "Total Payment Breakdown",
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem: TooltipItem) {
            const label = tooltipItem.label || "";
            const value = tooltipItem.raw || 0;
            return `${label}: ${formatCurrency(value)} (${(
              (value / totalPayment) *
              100
            ).toFixed(1)}%)`;
          },
        },
      },
    },
  };

  // Line chart options for balance over time
  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Loan Balance Over Time",
      },
    },
    scales: {
      y: {
        ticks: {
          callback: function (value: string | number) {
            if (typeof value === "number") {
              return formatCurrency(value);
            }
            return value;
          },
        },
      },
    },
  };

  // Modify the tabs section for visualization
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Mortgage Calculator</CardTitle>
        <CardDescription>
          Calculate your monthly mortgage payments based on loan amount,
          interest rate, term, and additional costs.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basic Options</TabsTrigger>
            <TabsTrigger value="advanced">Advanced Options</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="homePrice">Home Price</Label>
                <Input
                  id="homePrice"
                  type="number"
                  value={homePrice}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleInputChange("homePrice", Number(e.target.value) || 0)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="downPayment">Down Payment</Label>
                <Input
                  id="downPayment"
                  type="number"
                  value={downPayment}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleInputChange(
                      "downPayment",
                      Number(e.target.value) || 0
                    )
                  }
                />
                <div className="text-xs text-muted-foreground">
                  {downPayment > 0 &&
                    homePrice > 0 &&
                    `${((downPayment / homePrice) * 100).toFixed(
                      1
                    )}% of home price`}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="loanAmount">Loan Amount</Label>
                <Input
                  id="loanAmount"
                  type="number"
                  value={loanAmount}
                  readOnly
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="interestRate">Interest Rate (%)</Label>
                <Input
                  id="interestRate"
                  type="number"
                  step="0.01"
                  value={interestRate}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleInputChange(
                      "interestRate",
                      Number(e.target.value) || 0
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="loanTerm">Loan Term (years)</Label>
                <Input
                  id="loanTerm"
                  type="number"
                  value={loanTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleInputChange("loanTerm", Number(e.target.value) || 0)
                  }
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeTaxesInsurance"
                checked={includeTaxesInsurance}
                onCheckedChange={(checked) =>
                  handleInputChange("includeTaxesInsurance", checked === true)
                }
              />
              <Label htmlFor="includeTaxesInsurance">
                Include taxes, insurance & PMI in payment calculation
              </Label>
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="propertyTax">Annual Property Tax</Label>
                <Input
                  id="propertyTax"
                  type="number"
                  value={propertyTax}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleInputChange(
                      "propertyTax",
                      Number(e.target.value) || 0
                    )
                  }
                  disabled={!includeTaxesInsurance}
                  className={!includeTaxesInsurance ? "bg-muted" : ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="homeInsurance">Annual Home Insurance</Label>
                <Input
                  id="homeInsurance"
                  type="number"
                  value={homeInsurance}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleInputChange(
                      "homeInsurance",
                      Number(e.target.value) || 0
                    )
                  }
                  disabled={!includeTaxesInsurance}
                  className={!includeTaxesInsurance ? "bg-muted" : ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pmi">Annual PMI</Label>
                <Input
                  id="pmi"
                  type="number"
                  value={pmi}
                  readOnly
                  className="bg-muted"
                />
                <div className="text-xs text-muted-foreground">
                  {pmi > 0
                    ? "PMI required (down payment < 20%)"
                    : "No PMI required"}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border rounded-lg">
            <div className="text-sm text-muted-foreground">Monthly Payment</div>
            <div className="text-2xl font-bold">
              {formatCurrency(monthlyPayment)}
            </div>
            {includeTaxesInsurance && (
              <div className="text-xs text-muted-foreground mt-1">
                Includes principal, interest{pmi > 0 ? ", PMI" : ""}, taxes &
                insurance
              </div>
            )}
          </div>
          <div className="p-4 border rounded-lg">
            <div className="text-sm text-muted-foreground">Total Payment</div>
            <div className="text-2xl font-bold">
              {formatCurrency(totalPayment)}
            </div>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="text-sm text-muted-foreground">Total Interest</div>
            <div className="text-2xl font-bold">
              {formatCurrency(totalInterest)}
            </div>
          </div>
        </div>

        <Separator />

        <Tabs defaultValue="chart">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="chart">Amortization Chart</TabsTrigger>
            <TabsTrigger value="breakdown">Payment Breakdown</TabsTrigger>
            <TabsTrigger value="table">Amortization Table</TabsTrigger>
          </TabsList>
          <TabsContent value="chart" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-80">
                <ChartWrapper
                  type="Bar"
                  options={chartOptions}
                  data={chartData}
                />
              </div>
              <div className="h-80">
                <ChartWrapper
                  type="Line"
                  options={lineChartOptions}
                  data={balanceOverTimeData}
                />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="breakdown" className="mt-4">
            <div className="h-96 flex justify-center">
              <div className="w-full max-w-md">
                <ChartWrapper
                  type="Pie"
                  options={pieChartOptions}
                  data={paymentBreakdownData}
                />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="table" className="mt-4">
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="p-2 text-left">Year</th>
                    <th className="p-2 text-right">Principal Payment</th>
                    <th className="p-2 text-right">Interest Payment</th>
                    <th className="p-2 text-right">Remaining Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {amortizationSchedule.map((item) => (
                    <tr key={item.year} className="border-t">
                      <td className="p-2 text-left">{item.year}</td>
                      <td className="p-2 text-right">
                        {formatCurrency(item.principalPayment)}
                      </td>
                      <td className="p-2 text-right">
                        {formatCurrency(item.interestPayment)}
                      </td>
                      <td className="p-2 text-right">
                        {formatCurrency(item.remainingBalance)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>

        {/* Add Affordability Section */}
        <Separator />
        <div className="bg-muted p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-2">Affordability Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="affordabilityIncome">
                Annual Household Income
              </Label>
              <Input
                id="affordabilityIncome"
                type="number"
                value={affordabilityIncome}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setAffordabilityIncome(Number(e.target.value) || 0)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="affordabilityPercentage">
                Target Housing Budget (% of Income)
              </Label>
              <Input
                id="affordabilityPercentage"
                type="number"
                min="1"
                max="50"
                value={affordabilityPercentage}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setAffordabilityPercentage(Number(e.target.value) || 0)
                }
              />
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 border rounded-md">
              <div className="text-sm text-muted-foreground">
                Maximum Affordable Monthly Payment
              </div>
              <div className="text-xl font-bold">
                {formatCurrency(maxAffordablePayment)}
              </div>
            </div>
            <div className="p-3 border rounded-md">
              <div className="text-sm text-muted-foreground">
                Affordability Status
              </div>
              <div
                className={`text-xl font-bold ${
                  monthlyPayment <= maxAffordablePayment
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {monthlyPayment <= maxAffordablePayment
                  ? `Affordable (${(
                      (monthlyPayment / maxAffordablePayment) *
                      100
                    ).toFixed(1)}% of budget)`
                  : `Exceeds budget by ${formatCurrency(
                      monthlyPayment - maxAffordablePayment
                    )}`}
              </div>
            </div>
          </div>
        </div>

        {/* Rate Comparison Toggle */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="comparisonMode"
            checked={comparisonMode}
            onCheckedChange={(checked) => setComparisonMode(checked === true)}
          />
          <Label htmlFor="comparisonMode">
            Compare with different interest rate
          </Label>
        </div>

        {comparisonMode && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="comparisonRate">
                Comparison Interest Rate (%)
              </Label>
              <Input
                id="comparisonRate"
                type="number"
                step="0.01"
                value={comparisonRate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setComparisonRate(Number(e.target.value) || 0)
                }
              />
            </div>
            <div className="col-span-2 p-4 border rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">
                    Current Rate: {interestRate}%
                  </div>
                  <div className="text-lg font-bold">
                    {formatCurrency(monthlyPayment)}/mo
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">
                    Comparison Rate: {comparisonRate}%
                  </div>
                  <div className="text-lg font-bold">
                    {formatCurrency(comparisonPayment)}/mo
                  </div>
                </div>
              </div>
              <div className="mt-2 text-sm">
                <span
                  className={
                    comparisonPayment > monthlyPayment
                      ? "text-red-500"
                      : "text-green-500"
                  }
                >
                  {comparisonPayment > monthlyPayment
                    ? `Costs ${formatCurrency(
                        comparisonPayment - monthlyPayment
                      )} more per month`
                    : `Saves ${formatCurrency(
                        monthlyPayment - comparisonPayment
                      )} per month`}
                </span>{" "}
                ({comparisonPayment > monthlyPayment ? "+" : ""}
                {(
                  ((comparisonPayment - monthlyPayment) / monthlyPayment) *
                  100
                ).toFixed(1)}
                %)
              </div>
            </div>
          </div>
        )}

        <Separator />

        <Tabs defaultValue="chart">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="chart">Amortization Chart</TabsTrigger>
            <TabsTrigger value="breakdown">Payment Breakdown</TabsTrigger>
            <TabsTrigger value="table">Amortization Table</TabsTrigger>
          </TabsList>
          <TabsContent value="chart" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-80">
                <ChartWrapper
                  type="Bar"
                  options={chartOptions}
                  data={chartData}
                />
              </div>
              <div className="h-80">
                <ChartWrapper
                  type="Line"
                  options={lineChartOptions}
                  data={balanceOverTimeData}
                />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="breakdown" className="mt-4">
            <div className="h-96 flex justify-center">
              <div className="w-full max-w-md">
                <ChartWrapper
                  type="Pie"
                  options={pieChartOptions}
                  data={paymentBreakdownData}
                />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="table" className="mt-4">
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="p-2 text-left">Year</th>
                    <th className="p-2 text-right">Principal Payment</th>
                    <th className="p-2 text-right">Interest Payment</th>
                    <th className="p-2 text-right">Remaining Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {amortizationSchedule.map((item) => (
                    <tr key={item.year} className="border-t">
                      <td className="p-2 text-left">{item.year}</td>
                      <td className="p-2 text-right">
                        {formatCurrency(item.principalPayment)}
                      </td>
                      <td className="p-2 text-right">
                        {formatCurrency(item.interestPayment)}
                      </td>
                      <td className="p-2 text-right">
                        {formatCurrency(item.remainingBalance)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
