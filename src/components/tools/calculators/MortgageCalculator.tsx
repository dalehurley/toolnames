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
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

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
  const [monthlyPayment, setMonthlyPayment] = useState<number>(0);
  const [totalPayment, setTotalPayment] = useState<number>(0);
  const [totalInterest, setTotalInterest] = useState<number>(0);
  const [amortizationSchedule, setAmortizationSchedule] = useState<
    AmortizationItem[]
  >([]);

  const handleInputChange = (field: string, value: number) => {
    switch (field) {
      case "loanAmount":
        setLoanAmount(value);
        break;
      case "interestRate":
        setInterestRate(value);
        break;
      case "loanTerm":
        setLoanTerm(value);
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

      setMonthlyPayment(monthly);
      setTotalPayment(monthly * termMonths);
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  // Chart data
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
        <CardTitle className="text-2xl">Mortgage Calculator</CardTitle>
        <CardDescription>
          Calculate your monthly mortgage payments based on loan amount,
          interest rate, and term.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="loanAmount">Loan Amount</Label>
              <Input
                id="loanAmount"
                type="number"
                value={loanAmount}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleInputChange("loanAmount", Number(e.target.value) || 0)
                }
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
                  handleInputChange("interestRate", Number(e.target.value) || 0)
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
        </div>

        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border rounded-lg">
            <div className="text-sm text-muted-foreground">Monthly Payment</div>
            <div className="text-2xl font-bold">
              {formatCurrency(monthlyPayment)}
            </div>
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
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="chart">Amortization Chart</TabsTrigger>
            <TabsTrigger value="table">Amortization Table</TabsTrigger>
          </TabsList>
          <TabsContent value="chart" className="mt-4 h-96">
            <Bar options={chartOptions} data={chartData} />
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
