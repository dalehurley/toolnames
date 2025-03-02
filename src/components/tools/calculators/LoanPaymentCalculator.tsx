import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { CreditCard, Percent, Calendar, RefreshCw } from "lucide-react";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface PaymentRow {
  payment: number;
  date: string;
  beginningBalance: number;
  principal: number;
  interest: number;
  endingBalance: number;
  totalInterest: number;
}

export const LoanPaymentCalculator = () => {
  // Form state
  const [loanAmount, setLoanAmount] = useState<number>(20000);
  const [interestRate, setInterestRate] = useState<number>(5);
  const [loanTerm, setLoanTerm] = useState<number>(5);
  const [termUnit, setTermUnit] = useState<"years" | "months">("years");
  const [paymentFrequency, setPaymentFrequency] = useState<string>("monthly");
  const [startDate, setStartDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [extraPayment, setExtraPayment] = useState<number>(0);

  // Results state
  const [monthlyPayment, setMonthlyPayment] = useState<number | null>(null);
  const [totalInterest, setTotalInterest] = useState<number | null>(null);
  const [totalPayment, setTotalPayment] = useState<number | null>(null);
  const [amortizationSchedule, setAmortizationSchedule] = useState<
    PaymentRow[]
  >([]);
  const [summaryData, setSummaryData] = useState<{
    payoffDate: string;
    originalPayoffDate: string;
    monthsSaved: number;
    interestSaved: number;
  } | null>(null);

  const handleInputChange = (field: string, value: string) => {
    // Convert inputs to correct types
    switch (field) {
      case "loanAmount":
        setLoanAmount(parseFloat(value) || 0);
        break;
      case "interestRate":
        setInterestRate(parseFloat(value) || 0);
        break;
      case "loanTerm":
        setLoanTerm(parseFloat(value) || 0);
        break;
      case "termUnit":
        setTermUnit(value as "years" | "months");
        break;
      case "paymentFrequency":
        setPaymentFrequency(value);
        break;
      case "startDate":
        setStartDate(value);
        break;
      case "extraPayment":
        setExtraPayment(parseFloat(value) || 0);
        break;
    }
  };

  const handleClear = () => {
    setLoanAmount(20000);
    setInterestRate(5);
    setLoanTerm(5);
    setTermUnit("years");
    setPaymentFrequency("monthly");
    setStartDate(new Date().toISOString().split("T")[0]);
    setExtraPayment(0);
    setMonthlyPayment(null);
    setTotalInterest(null);
    setTotalPayment(null);
    setAmortizationSchedule([]);
    setSummaryData(null);
  };

  // Calculate loan details when inputs change
  useEffect(() => {
    calculateLoan();
  }, [
    loanAmount,
    interestRate,
    loanTerm,
    termUnit,
    paymentFrequency,
    startDate,
    extraPayment,
  ]);

  const calculateLoan = () => {
    if (loanAmount <= 0 || interestRate <= 0 || loanTerm <= 0 || !startDate) {
      return;
    }

    // Convert term to months if in years
    const termMonths = termUnit === "years" ? loanTerm * 12 : loanTerm;

    // Calculate payments per year based on frequency
    let paymentsPerYear = 12;

    switch (paymentFrequency) {
      case "weekly":
        paymentsPerYear = 52;
        break;
      case "biweekly":
        paymentsPerYear = 26;
        break;
      case "monthly":
        paymentsPerYear = 12;
        break;
      case "quarterly":
        paymentsPerYear = 4;
        break;
      case "annually":
        paymentsPerYear = 1;
        break;
    }

    // Calculate period rate
    const periodRate = interestRate / 100 / paymentsPerYear;

    // Calculate total number of payments
    const totalPayments = termMonths / (12 / paymentsPerYear);

    // Calculate payment without extra payments (standard formula)
    const payment =
      (loanAmount * periodRate * Math.pow(1 + periodRate, totalPayments)) /
      (Math.pow(1 + periodRate, totalPayments) - 1);

    // Initialize amortization schedule
    const schedule: PaymentRow[] = [];
    let totalInterestPaid = 0;
    let balance = loanAmount;
    let date = new Date(startDate);

    // Calculate interval between payments in months
    const getNextPaymentDate = (currentDate: Date) => {
      const nextDate = new Date(currentDate);

      switch (paymentFrequency) {
        case "weekly":
          nextDate.setDate(nextDate.getDate() + 7);
          break;
        case "biweekly":
          nextDate.setDate(nextDate.getDate() + 14);
          break;
        case "monthly":
          nextDate.setMonth(nextDate.getMonth() + 1);
          break;
        case "quarterly":
          nextDate.setMonth(nextDate.getMonth() + 3);
          break;
        case "annually":
          nextDate.setFullYear(nextDate.getFullYear() + 1);
          break;
      }

      return nextDate;
    };

    // Generate amortization schedule
    let paymentNumber = 1;
    let actualPayment;

    // Calculate without extra payment for comparison
    let normalPayments = 0;
    let normalInterest = 0;
    let normalPayoffDate = new Date(startDate);

    for (let i = 0; i < totalPayments; i++) {
      normalPayments++;
      const periodInterest = balance * periodRate;
      normalInterest += periodInterest;
      const periodPrincipal = payment - periodInterest;
      balance -= periodPrincipal;

      if (i === totalPayments - 1 || balance <= 0) {
        normalPayoffDate = new Date(normalPayoffDate);
        break;
      }

      normalPayoffDate = getNextPaymentDate(normalPayoffDate);
    }

    // Reset for actual calculation with extra payments
    balance = loanAmount;
    let payoffDate = new Date(startDate);

    while (balance > 0) {
      const periodInterest = balance * periodRate;

      // Regular payment + extra payment, but don't pay more than remaining balance + interest
      actualPayment = Math.min(
        payment + extraPayment,
        balance + periodInterest
      );

      const periodPrincipal = actualPayment - periodInterest;
      const newBalance = balance - periodPrincipal;

      totalInterestPaid += periodInterest;

      schedule.push({
        payment: paymentNumber,
        date: date.toLocaleDateString(),
        beginningBalance: balance,
        principal: periodPrincipal,
        interest: periodInterest,
        endingBalance: newBalance,
        totalInterest: totalInterestPaid,
      });

      balance = newBalance;
      payoffDate = new Date(date);

      if (balance <= 0) {
        break;
      }

      date = getNextPaymentDate(date);
      paymentNumber++;
    }

    // Calculate months saved and interest saved
    const monthsSaved = normalPayments - paymentNumber;
    const interestSaved = normalInterest - totalInterestPaid;

    // Update state
    setMonthlyPayment(payment);
    setTotalInterest(totalInterestPaid);
    setTotalPayment(loanAmount + totalInterestPaid);
    setAmortizationSchedule(schedule);
    setSummaryData({
      payoffDate: payoffDate.toLocaleDateString(),
      originalPayoffDate: normalPayoffDate.toLocaleDateString(),
      monthsSaved: monthsSaved,
      interestSaved: interestSaved,
    });
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Chart data
  const chartData = {
    labels: amortizationSchedule
      .filter(
        (_, idx) => idx % Math.ceil(amortizationSchedule.length / 25) === 0
      )
      .map((row) => `${row.payment}`),
    datasets: [
      {
        label: "Principal",
        data: amortizationSchedule
          .filter(
            (_, idx) => idx % Math.ceil(amortizationSchedule.length / 25) === 0
          )
          .map((row) => row.beginningBalance),
        borderColor: "rgb(53, 162, 235)",
        backgroundColor: "rgba(53, 162, 235, 0.5)",
        tension: 0.1,
      },
      {
        label: "Total Interest",
        data: amortizationSchedule
          .filter(
            (_, idx) => idx % Math.ceil(amortizationSchedule.length / 25) === 0
          )
          .map((row) => row.totalInterest),
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
        tension: 0.1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Loan Balance & Interest Over Time",
      },
    },
    scales: {
      y: {
        ticks: {
          callback: function (value: number | string) {
            if (typeof value === "number") {
              return formatCurrency(value);
            }
            return value;
          },
        },
      },
    },
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <CreditCard className="h-6 w-6" />
          Loan Payment Calculator
        </CardTitle>
        <CardDescription>
          Calculate monthly payments, total interest, and amortization schedule
          for any loan
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="loan-amount">Loan Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-muted-foreground">
                  $
                </span>
                <Input
                  id="loan-amount"
                  type="number"
                  className="pl-6"
                  placeholder="20000"
                  value={loanAmount || ""}
                  onChange={(e) =>
                    handleInputChange("loanAmount", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="interest-rate">Interest Rate (%)</Label>
              <div className="relative">
                <Input
                  id="interest-rate"
                  type="number"
                  step="0.01"
                  className="pr-6"
                  placeholder="5.0"
                  value={interestRate || ""}
                  onChange={(e) =>
                    handleInputChange("interestRate", e.target.value)
                  }
                />
                <Percent className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="loan-term">Loan Term</Label>
              <div className="flex">
                <Input
                  id="loan-term"
                  type="number"
                  placeholder="5"
                  value={loanTerm || ""}
                  onChange={(e) =>
                    handleInputChange("loanTerm", e.target.value)
                  }
                  className="rounded-r-none"
                />
                <Select
                  value={termUnit}
                  onValueChange={(value) =>
                    handleInputChange("termUnit", value)
                  }
                >
                  <SelectTrigger className="w-[120px] rounded-l-none border-l-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="years">Years</SelectItem>
                    <SelectItem value="months">Months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment-frequency">Payment Frequency</Label>
              <Select
                value={paymentFrequency}
                onValueChange={(value) =>
                  handleInputChange("paymentFrequency", value)
                }
              >
                <SelectTrigger id="payment-frequency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="biweekly">Bi-weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="annually">Annually</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="start-date"
                  type="date"
                  className="pl-10"
                  value={startDate}
                  onChange={(e) =>
                    handleInputChange("startDate", e.target.value)
                  }
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="extra-payment">Extra Payment (Optional)</Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-muted-foreground">
                $
              </span>
              <Input
                id="extra-payment"
                type="number"
                className="pl-6"
                placeholder="0"
                value={extraPayment || ""}
                onChange={(e) =>
                  handleInputChange("extraPayment", e.target.value)
                }
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Additional amount to be paid each period to reduce total interest
              and loan duration
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="outline" onClick={handleClear}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>

        <Separator />

        {monthlyPayment !== null && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="text-sm text-muted-foreground">
                  {paymentFrequency.charAt(0).toUpperCase() +
                    paymentFrequency.slice(1)}{" "}
                  Payment
                </div>
                <div className="text-2xl font-bold">
                  {formatCurrency(monthlyPayment)}
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="text-sm text-muted-foreground">
                  Total Interest
                </div>
                <div className="text-2xl font-bold">
                  {formatCurrency(totalInterest || 0)}
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="text-sm text-muted-foreground">
                  Total Payment
                </div>
                <div className="text-2xl font-bold">
                  {formatCurrency(totalPayment || 0)}
                </div>
              </div>
            </div>

            {summaryData && extraPayment > 0 && (
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <h3 className="font-semibold">Extra Payment Summary</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Original Payoff Date
                    </p>
                    <p className="font-medium">
                      {summaryData.originalPayoffDate}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      New Payoff Date
                    </p>
                    <p className="font-medium">{summaryData.payoffDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Payments Saved
                    </p>
                    <p className="font-medium">{summaryData.monthsSaved}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Interest Saved
                    </p>
                    <p className="font-medium">
                      {formatCurrency(summaryData.interestSaved)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Separator />

            <Tabs defaultValue="chart">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="chart">Payment Chart</TabsTrigger>
                <TabsTrigger value="schedule">
                  Amortization Schedule
                </TabsTrigger>
              </TabsList>

              <TabsContent value="chart" className="mt-4 h-96">
                <Line options={chartOptions} data={chartData} />
              </TabsContent>

              <TabsContent value="schedule" className="mt-4">
                <div className="border rounded-lg overflow-hidden overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="p-2 text-left">#</th>
                        <th className="p-2 text-left">Date</th>
                        <th className="p-2 text-right">Beginning Balance</th>
                        <th className="p-2 text-right">Principal</th>
                        <th className="p-2 text-right">Interest</th>
                        <th className="p-2 text-right">Ending Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {amortizationSchedule
                        .filter((_, i) => {
                          // Only show a subset of rows if there are many payments
                          const totalRows = amortizationSchedule.length;
                          if (totalRows <= 12) return true;
                          if (i < 6) return true;
                          if (i > totalRows - 6) return true;
                          if (i % Math.ceil(totalRows / 12) === 0) return true;
                          return false;
                        })
                        .map((row) => (
                          <tr key={row.payment} className="border-t">
                            <td className="p-2 text-left">{row.payment}</td>
                            <td className="p-2 text-left">{row.date}</td>
                            <td className="p-2 text-right">
                              {formatCurrency(row.beginningBalance)}
                            </td>
                            <td className="p-2 text-right">
                              {formatCurrency(row.principal)}
                            </td>
                            <td className="p-2 text-right">
                              {formatCurrency(row.interest)}
                            </td>
                            <td className="p-2 text-right">
                              {formatCurrency(row.endingBalance)}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {amortizationSchedule.length > 12
                    ? "Showing sample payments. First and last payments are always included."
                    : ""}
                </p>
              </TabsContent>
            </Tabs>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default LoanPaymentCalculator;
