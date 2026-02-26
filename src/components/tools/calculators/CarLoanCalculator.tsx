import { useState, useEffect, Suspense } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Car, Plus, Trash2, RefreshCw } from "lucide-react";

// Chart.js types
interface TooltipItem {
  label: string;
  raw: number;
}

// Amortization entry for monthly breakdown
interface AmortizationEntry {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  extraPayment: number;
  totalPayment: number;
  balance: number;
  cumulativeInterest: number;
}

// Loan scenario for comparison feature
interface LoanScenario {
  id: string;
  name: string;
  vehiclePrice: number;
  downPayment: number;
  tradeInValue: number;
  salesTaxRate: number;
  interestRate: number;
  loanTerm: number;
  monthlyPayment: number;
  totalInterest: number;
  totalCost: number;
}

// Early payoff calculation results
interface EarlyPayoffResults {
  originalTerm: number;
  newTerm: number;
  monthsSaved: number;
  interestSaved: number;
  originalTotalInterest: number;
  newTotalInterest: number;
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

// Loan term options in months
const LOAN_TERM_OPTIONS = [
  { value: "24", label: "24 months (2 years)" },
  { value: "36", label: "36 months (3 years)" },
  { value: "48", label: "48 months (4 years)" },
  { value: "60", label: "60 months (5 years)" },
  { value: "72", label: "72 months (6 years)" },
  { value: "84", label: "84 months (7 years)" },
];

export const CarLoanCalculator = () => {
  // Chart state
  const [chartsEnabled, setChartsEnabled] = useState<boolean>(false);
  const [chartComponents, setChartComponents] = useState<Record<
    string,
    React.ComponentType<Record<string, unknown>>
  > | null>(null);

  // Calculator input state
  const [vehiclePrice, setVehiclePrice] = useState<number>(35000);
  const [downPayment, setDownPayment] = useState<number>(5000);
  const [tradeInValue, setTradeInValue] = useState<number>(0);
  const [salesTaxRate, setSalesTaxRate] = useState<number>(7);
  const [interestRate, setInterestRate] = useState<number>(6.5);
  const [loanTerm, setLoanTerm] = useState<number>(60);
  const [extraPayment, setExtraPayment] = useState<number>(0);

  // Results state
  const [loanAmount, setLoanAmount] = useState<number>(0);
  const [monthlyPayment, setMonthlyPayment] = useState<number>(0);
  const [totalInterest, setTotalInterest] = useState<number>(0);
  const [totalCost, setTotalCost] = useState<number>(0);
  const [amortizationSchedule, setAmortizationSchedule] = useState<
    AmortizationEntry[]
  >([]);
  const [earlyPayoff, setEarlyPayoff] = useState<EarlyPayoffResults | null>(
    null
  );

  // Comparison state
  const [scenarios, setScenarios] = useState<LoanScenario[]>([]);

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

  // Calculate monthly payment using amortization formula
  const calculateMonthlyPayment = (
    principal: number,
    annualRate: number,
    months: number
  ): number => {
    if (annualRate === 0) return principal / months;
    const monthlyRate = annualRate / 100 / 12;
    const x = Math.pow(1 + monthlyRate, months);
    return (principal * x * monthlyRate) / (x - 1);
  };

  // Generate amortization schedule
  const generateAmortizationSchedule = (
    principal: number,
    annualRate: number,
    months: number,
    extraMonthlyPayment: number
  ): AmortizationEntry[] => {
    const schedule: AmortizationEntry[] = [];
    const monthlyRate = annualRate / 100 / 12;
    const basePayment = calculateMonthlyPayment(principal, annualRate, months);

    let balance = principal;
    let cumulativeInterest = 0;
    let month = 1;

    while (balance > 0.01 && month <= months * 2) {
      const interestForMonth = balance * monthlyRate;
      const totalPayment = Math.min(
        basePayment + extraMonthlyPayment,
        balance + interestForMonth
      );
      const principalForMonth = totalPayment - interestForMonth;
      const actualExtra = Math.max(
        0,
        Math.min(extraMonthlyPayment, totalPayment - basePayment)
      );

      balance = Math.max(0, balance - principalForMonth);
      cumulativeInterest += interestForMonth;

      schedule.push({
        month,
        payment: basePayment,
        principal: principalForMonth,
        interest: interestForMonth,
        extraPayment: actualExtra,
        totalPayment,
        balance,
        cumulativeInterest,
      });

      month++;

      if (balance <= 0) break;
    }

    return schedule;
  };

  // Main calculation function
  const calculateLoan = () => {
    // Calculate loan amount with sales tax
    const taxableAmount = vehiclePrice - tradeInValue;
    const salesTax = taxableAmount * (salesTaxRate / 100);
    const netLoanAmount = vehiclePrice + salesTax - downPayment - tradeInValue;
    const finalLoanAmount = Math.max(0, netLoanAmount);

    setLoanAmount(finalLoanAmount);

    if (finalLoanAmount <= 0) {
      setMonthlyPayment(0);
      setTotalInterest(0);
      setTotalCost(0);
      setAmortizationSchedule([]);
      setEarlyPayoff(null);
      return;
    }

    // Calculate monthly payment
    const payment = calculateMonthlyPayment(
      finalLoanAmount,
      interestRate,
      loanTerm
    );
    setMonthlyPayment(payment);

    // Generate amortization schedule with extra payments
    const schedule = generateAmortizationSchedule(
      finalLoanAmount,
      interestRate,
      loanTerm,
      extraPayment
    );
    setAmortizationSchedule(schedule);

    // Calculate totals from schedule
    const interest = schedule.reduce((sum, e) => sum + e.interest, 0);
    setTotalInterest(interest);
    setTotalCost(finalLoanAmount + interest);

    // Calculate early payoff if extra payment specified
    if (extraPayment > 0) {
      const originalSchedule = generateAmortizationSchedule(
        finalLoanAmount,
        interestRate,
        loanTerm,
        0
      );
      const originalTotalInterest = originalSchedule.reduce(
        (sum, e) => sum + e.interest,
        0
      );

      setEarlyPayoff({
        originalTerm: loanTerm,
        newTerm: schedule.length,
        monthsSaved: loanTerm - schedule.length,
        interestSaved: originalTotalInterest - interest,
        originalTotalInterest,
        newTotalInterest: interest,
      });
    } else {
      setEarlyPayoff(null);
    }
  };

  // Auto-calculate on input change
  useEffect(() => {
    calculateLoan();
  }, [
    vehiclePrice,
    downPayment,
    tradeInValue,
    salesTaxRate,
    interestRate,
    loanTerm,
    extraPayment,
  ]);

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Format currency with cents
  const formatCurrencyPrecise = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Handle clear/reset
  const handleClear = () => {
    setVehiclePrice(35000);
    setDownPayment(5000);
    setTradeInValue(0);
    setSalesTaxRate(7);
    setInterestRate(6.5);
    setLoanTerm(60);
    setExtraPayment(0);
  };

  // Add current scenario to comparison
  const addScenario = () => {
    if (scenarios.length >= 3) return;

    const newScenario: LoanScenario = {
      id: Date.now().toString(),
      name: `Scenario ${scenarios.length + 1}`,
      vehiclePrice,
      downPayment,
      tradeInValue,
      salesTaxRate,
      interestRate,
      loanTerm,
      monthlyPayment,
      totalInterest,
      totalCost,
    };

    setScenarios([...scenarios, newScenario]);
  };

  // Remove scenario from comparison
  const removeScenario = (id: string) => {
    setScenarios(scenarios.filter((s) => s.id !== id));
  };

  // Find best scenario (lowest total cost)
  const getBestScenarioId = (): string | null => {
    if (scenarios.length === 0) return null;
    return scenarios.reduce((best, current) =>
      current.totalCost < best.totalCost ? current : best
    ).id;
  };

  // Generate yearly summary for charts
  const getYearlySummary = () => {
    const yearlyData: {
      year: number;
      principalPaid: number;
      interestPaid: number;
      remainingBalance: number;
    }[] = [];

    let yearlyPrincipal = 0;
    let yearlyInterest = 0;

    amortizationSchedule.forEach((entry, index) => {
      yearlyPrincipal += entry.principal;
      yearlyInterest += entry.interest;

      if ((index + 1) % 12 === 0 || index === amortizationSchedule.length - 1) {
        yearlyData.push({
          year: Math.ceil((index + 1) / 12),
          principalPaid: yearlyPrincipal,
          interestPaid: yearlyInterest,
          remainingBalance: entry.balance,
        });
        yearlyPrincipal = 0;
        yearlyInterest = 0;
      }
    });

    return yearlyData;
  };

  // Chart data
  const yearlySummary = getYearlySummary();

  const pieChartData = {
    labels: ["Principal", "Interest"],
    datasets: [
      {
        data: [loanAmount, totalInterest],
        backgroundColor: ["rgba(53, 162, 235, 0.8)", "rgba(255, 99, 132, 0.8)"],
        borderWidth: 1,
      },
    ],
  };

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
            const total = loanAmount + totalInterest;
            return `${label}: ${formatCurrency(value)} (${(
              (value / total) *
              100
            ).toFixed(1)}%)`;
          },
        },
      },
    },
  };

  const lineChartData = {
    labels: yearlySummary.map((y) => `Year ${y.year}`),
    datasets: [
      {
        label: "Remaining Balance",
        data: yearlySummary.map((y) => y.remainingBalance),
        borderColor: "rgba(75, 192, 192, 0.8)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.1,
        fill: true,
      },
    ],
  };

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

  const barChartData = {
    labels: yearlySummary.map((y) => `Year ${y.year}`),
    datasets: [
      {
        label: "Principal",
        data: yearlySummary.map((y) => y.principalPaid),
        backgroundColor: "rgba(53, 162, 235, 0.5)",
      },
      {
        label: "Interest",
        data: yearlySummary.map((y) => y.interestPaid),
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Yearly Principal vs Interest",
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

  const bestScenarioId = getBestScenarioId();

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Car className="h-6 w-6" />
          Car Loan Calculator
        </CardTitle>
        <CardDescription>
          Calculate monthly payments, compare loan options, and view
          amortization schedules for auto financing
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <Tabs defaultValue="calculator" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="calculator">Calculator</TabsTrigger>
            <TabsTrigger value="amortization">Amortization Schedule</TabsTrigger>
            <TabsTrigger value="compare">Compare Loans</TabsTrigger>
          </TabsList>

          {/* Calculator Tab */}
          <TabsContent value="calculator" className="space-y-6 mt-4">
            {/* Vehicle Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vehiclePrice">Vehicle Price</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    id="vehiclePrice"
                    type="number"
                    value={vehiclePrice}
                    onChange={(e) =>
                      setVehiclePrice(Number(e.target.value) || 0)
                    }
                    className="pl-7"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="downPayment">Down Payment</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    id="downPayment"
                    type="number"
                    value={downPayment}
                    onChange={(e) => setDownPayment(Number(e.target.value) || 0)}
                    className="pl-7"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tradeInValue">Trade-In Value</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    id="tradeInValue"
                    type="number"
                    value={tradeInValue}
                    onChange={(e) =>
                      setTradeInValue(Number(e.target.value) || 0)
                    }
                    className="pl-7"
                  />
                </div>
              </div>
            </div>

            {/* Loan Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salesTaxRate">Sales Tax Rate (%)</Label>
                <div className="relative">
                  <Input
                    id="salesTaxRate"
                    type="number"
                    step="0.1"
                    value={salesTaxRate}
                    onChange={(e) =>
                      setSalesTaxRate(Number(e.target.value) || 0)
                    }
                    className="pr-7"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    %
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="interestRate">Interest Rate (APR)</Label>
                <div className="relative">
                  <Input
                    id="interestRate"
                    type="number"
                    step="0.1"
                    value={interestRate}
                    onChange={(e) =>
                      setInterestRate(Number(e.target.value) || 0)
                    }
                    className="pr-7"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    %
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="loanTerm">Loan Term</Label>
                <Select
                  value={loanTerm.toString()}
                  onValueChange={(v) => setLoanTerm(Number(v))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select term" />
                  </SelectTrigger>
                  <SelectContent>
                    {LOAN_TERM_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Loan Amount Display */}
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground">
                Amount Financed (including tax)
              </div>
              <div className="text-xl font-bold">{formatCurrency(loanAmount)}</div>
              <div className="text-xs text-muted-foreground mt-1">
                = Vehicle Price + Tax - Down Payment - Trade-In
              </div>
            </div>

            <Separator />

            {/* Results Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="text-sm text-muted-foreground">
                  Monthly Payment
                </div>
                <div className="text-2xl font-bold text-primary">
                  {formatCurrencyPrecise(monthlyPayment)}
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-sm text-muted-foreground">
                  Total Interest
                </div>
                <div className="text-2xl font-bold">
                  {formatCurrency(totalInterest)}
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-sm text-muted-foreground">Total Cost</div>
                <div className="text-2xl font-bold">
                  {formatCurrency(totalCost)}
                </div>
              </div>
            </div>

            <Separator />

            {/* Early Payoff Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Early Payoff Calculator</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="extraPayment">Extra Monthly Payment</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      $
                    </span>
                    <Input
                      id="extraPayment"
                      type="number"
                      value={extraPayment}
                      onChange={(e) =>
                        setExtraPayment(Number(e.target.value) || 0)
                      }
                      className="pl-7"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Add extra payments to pay off your loan faster
                  </p>
                </div>

                {earlyPayoff && (
                  <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                    <div className="text-sm font-medium text-green-700 dark:text-green-300 mb-2">
                      With Extra Payments
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <div className="text-muted-foreground">Months Saved</div>
                        <div className="font-bold text-green-600 dark:text-green-400">
                          {earlyPayoff.monthsSaved}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Interest Saved</div>
                        <div className="font-bold text-green-600 dark:text-green-400">
                          {formatCurrency(earlyPayoff.interestSaved)}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">New Term</div>
                        <div className="font-bold">
                          {earlyPayoff.newTerm} months
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">New Total Interest</div>
                        <div className="font-bold">
                          {formatCurrency(earlyPayoff.newTotalInterest)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClear}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Reset
              </Button>
              <Button onClick={addScenario} disabled={scenarios.length >= 3}>
                <Plus className="mr-2 h-4 w-4" />
                Save for Comparison
              </Button>
            </div>

            <Separator />

            {/* Charts */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Visualizations</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-80">
                  <ChartWrapper
                    type="Pie"
                    options={pieChartOptions}
                    data={pieChartData}
                  />
                </div>
                <div className="h-80">
                  <ChartWrapper
                    type="Line"
                    options={lineChartOptions}
                    data={lineChartData}
                  />
                </div>
              </div>
              <div className="h-80">
                <ChartWrapper
                  type="Bar"
                  options={barChartOptions}
                  data={barChartData}
                />
              </div>
            </div>
          </TabsContent>

          {/* Amortization Schedule Tab */}
          <TabsContent value="amortization" className="mt-4">
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-sm">
                  <thead className="bg-muted sticky top-0">
                    <tr>
                      <th className="p-2 text-left">Month</th>
                      <th className="p-2 text-right">Payment</th>
                      <th className="p-2 text-right">Principal</th>
                      <th className="p-2 text-right">Interest</th>
                      {extraPayment > 0 && (
                        <th className="p-2 text-right">Extra</th>
                      )}
                      <th className="p-2 text-right">Balance</th>
                      <th className="p-2 text-right">Cumulative Interest</th>
                    </tr>
                  </thead>
                  <tbody>
                    {amortizationSchedule.map((entry) => (
                      <tr key={entry.month} className="border-t">
                        <td className="p-2 text-left">{entry.month}</td>
                        <td className="p-2 text-right">
                          {formatCurrencyPrecise(entry.payment)}
                        </td>
                        <td className="p-2 text-right">
                          {formatCurrencyPrecise(entry.principal)}
                        </td>
                        <td className="p-2 text-right">
                          {formatCurrencyPrecise(entry.interest)}
                        </td>
                        {extraPayment > 0 && (
                          <td className="p-2 text-right text-green-600">
                            {formatCurrencyPrecise(entry.extraPayment)}
                          </td>
                        )}
                        <td className="p-2 text-right">
                          {formatCurrencyPrecise(entry.balance)}
                        </td>
                        <td className="p-2 text-right">
                          {formatCurrencyPrecise(entry.cumulativeInterest)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Showing {amortizationSchedule.length} monthly payments
            </p>
          </TabsContent>

          {/* Compare Loans Tab */}
          <TabsContent value="compare" className="mt-4 space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Save up to 3 scenarios to compare different loan options
              </p>
              <Button
                onClick={addScenario}
                disabled={scenarios.length >= 3}
                size="sm"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Current
              </Button>
            </div>

            {scenarios.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Car className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No scenarios saved yet.</p>
                <p className="text-sm">
                  Configure a loan and click "Save for Comparison" to add it.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {scenarios.map((scenario) => (
                  <div
                    key={scenario.id}
                    className={`p-4 border rounded-lg relative ${
                      scenario.id === bestScenarioId
                        ? "border-green-500 bg-green-50 dark:bg-green-950"
                        : ""
                    }`}
                  >
                    {scenario.id === bestScenarioId && (
                      <div className="absolute -top-3 left-4 bg-green-500 text-white text-xs px-2 py-1 rounded">
                        Best Option
                      </div>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6"
                      onClick={() => removeScenario(scenario.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <h4 className="font-medium mb-3">{scenario.name}</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Vehicle Price</span>
                        <span>{formatCurrency(scenario.vehiclePrice)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Down Payment</span>
                        <span>{formatCurrency(scenario.downPayment)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Interest Rate</span>
                        <span>{scenario.interestRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Term</span>
                        <span>{scenario.loanTerm} months</span>
                      </div>
                      <Separator className="my-2" />
                      <div className="flex justify-between font-medium">
                        <span>Monthly Payment</span>
                        <span>{formatCurrencyPrecise(scenario.monthlyPayment)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Interest</span>
                        <span>{formatCurrency(scenario.totalInterest)}</span>
                      </div>
                      <div className="flex justify-between font-medium text-primary">
                        <span>Total Cost</span>
                        <span>{formatCurrency(scenario.totalCost)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {scenarios.length > 1 && (
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Comparison Summary</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="p-2 text-left">Metric</th>
                        {scenarios.map((s) => (
                          <th key={s.id} className="p-2 text-right">
                            {s.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="p-2">Monthly Payment</td>
                        {scenarios.map((s) => (
                          <td key={s.id} className="p-2 text-right">
                            {formatCurrencyPrecise(s.monthlyPayment)}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b">
                        <td className="p-2">Total Interest</td>
                        {scenarios.map((s) => (
                          <td key={s.id} className="p-2 text-right">
                            {formatCurrency(s.totalInterest)}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="p-2 font-medium">Total Cost</td>
                        {scenarios.map((s) => (
                          <td
                            key={s.id}
                            className={`p-2 text-right font-medium ${
                              s.id === bestScenarioId
                                ? "text-green-600 dark:text-green-400"
                                : ""
                            }`}
                          >
                            {formatCurrency(s.totalCost)}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>

      <CardFooter className="flex flex-col space-y-4">
        <div className="bg-muted p-4 rounded-lg w-full">
          <h3 className="font-semibold mb-2">Car Loan Tips</h3>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-4">
            <li>
              <strong>Shorter terms</strong> mean higher monthly payments but less
              total interest paid.
            </li>
            <li>
              <strong>A larger down payment</strong> reduces your loan amount and
              can help you get a better interest rate.
            </li>
            <li>
              <strong>Consider trade-in value</strong> as part of your down
              payment to reduce financing costs.
            </li>
            <li>
              <strong>Shop for rates</strong> from banks, credit unions, and
              dealerships to find the best APR.
            </li>
            <li>
              <strong>Extra payments</strong> applied to principal can
              significantly reduce your total interest.
            </li>
          </ul>
        </div>
      </CardFooter>
    </Card>
  );
};
