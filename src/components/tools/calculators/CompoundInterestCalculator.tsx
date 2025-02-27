import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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

interface YearlyData {
  year: number;
  balance: number;
  interest: number;
  contribution: number;
}

export const CompoundInterestCalculator = () => {
  const [principal, setPrincipal] = useState<number>(10000);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(500);
  const [annualInterestRate, setAnnualInterestRate] = useState<number>(7);
  const [years, setYears] = useState<number>(20);
  const [compoundFrequency, setCompoundFrequency] = useState<string>("monthly");
  const [futureValue, setFutureValue] = useState<number>(0);
  const [totalContributions, setTotalContributions] = useState<number>(0);
  const [totalInterest, setTotalInterest] = useState<number>(0);
  const [yearlyData, setYearlyData] = useState<YearlyData[]>([]);

  const calculateCompoundInterest = () => {
    let balance = principal;
    let totalContributed = principal;
    const yearlyResults: YearlyData[] = [];

    // Determine compounding frequency multiplier
    let periodsPerYear: number;
    switch (compoundFrequency) {
      case "annually":
        periodsPerYear = 1;
        break;
      case "semiannually":
        periodsPerYear = 2;
        break;
      case "quarterly":
        periodsPerYear = 4;
        break;
      case "monthly":
        periodsPerYear = 12;
        break;
      case "daily":
        periodsPerYear = 365;
        break;
      default:
        periodsPerYear = 12;
    }

    const periodicRate = annualInterestRate / 100 / periodsPerYear;
    const monthlyContributionPerPeriod =
      compoundFrequency === "monthly"
        ? monthlyContribution
        : monthlyContribution * (12 / periodsPerYear);

    let yearlyInterest = 0;
    let yearlyContribution = 0;

    for (let year = 1; year <= years; year++) {
      const periodsThisYear = year === 1 ? periodsPerYear : periodsPerYear;

      yearlyInterest = 0;
      yearlyContribution = 0;

      for (let period = 1; period <= periodsThisYear; period++) {
        // Calculate interest for this period
        const interestThisPeriod = balance * periodicRate;
        yearlyInterest += interestThisPeriod;

        // Add monthly contribution
        balance += monthlyContributionPerPeriod;
        yearlyContribution += monthlyContributionPerPeriod;

        // Add interest
        balance += interestThisPeriod;
      }

      totalContributed += yearlyContribution;

      yearlyResults.push({
        year,
        balance,
        interest: yearlyInterest,
        contribution: yearlyContribution,
      });
    }

    setFutureValue(balance);
    setTotalContributions(totalContributed);
    setTotalInterest(balance - totalContributed);
    setYearlyData(yearlyResults);
  };

  useEffect(() => {
    calculateCompoundInterest();
  }, [
    principal,
    monthlyContribution,
    annualInterestRate,
    years,
    compoundFrequency,
  ]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Chart data
  const chartData = {
    labels: yearlyData.map((data) => `Year ${data.year}`),
    datasets: [
      {
        label: "Balance",
        data: yearlyData.map((data) => data.balance),
        borderColor: "rgb(53, 162, 235)",
        backgroundColor: "rgba(53, 162, 235, 0.5)",
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
        text: "Growth Over Time",
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
        <CardTitle className="text-2xl">Compound Interest Calculator</CardTitle>
        <CardDescription>
          Calculate how your investments can grow over time with compound
          interest
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="principal">Initial Investment</Label>
              <Input
                id="principal"
                type="number"
                value={principal}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPrincipal(Number(e.target.value) || 0)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthlyContribution">Monthly Contribution</Label>
              <Input
                id="monthlyContribution"
                type="number"
                value={monthlyContribution}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setMonthlyContribution(Number(e.target.value) || 0)
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="interestRate">Annual Interest Rate (%)</Label>
              <Input
                id="interestRate"
                type="number"
                step="0.1"
                value={annualInterestRate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setAnnualInterestRate(Number(e.target.value) || 0)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="years">Years to Grow</Label>
              <Input
                id="years"
                type="number"
                value={years}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setYears(Number(e.target.value) || 0)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="compoundFrequency">Compound Frequency</Label>
              <select
                id="compoundFrequency"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={compoundFrequency}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setCompoundFrequency(e.target.value)
                }
              >
                <option value="annually">Annually</option>
                <option value="semiannually">Semi-Annually</option>
                <option value="quarterly">Quarterly</option>
                <option value="monthly">Monthly</option>
                <option value="daily">Daily</option>
              </select>
            </div>
          </div>

          <Button onClick={calculateCompoundInterest} className="w-full">
            Calculate
          </Button>
        </div>

        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border rounded-lg">
            <div className="text-sm text-muted-foreground">Future Value</div>
            <div className="text-2xl font-bold">
              {formatCurrency(futureValue)}
            </div>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="text-sm text-muted-foreground">
              Total Contributions
            </div>
            <div className="text-2xl font-bold">
              {formatCurrency(totalContributions)}
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
            <TabsTrigger value="chart">Growth Chart</TabsTrigger>
            <TabsTrigger value="table">Yearly Breakdown</TabsTrigger>
          </TabsList>
          <TabsContent value="chart" className="mt-4 h-96">
            <Line options={chartOptions} data={chartData} />
          </TabsContent>
          <TabsContent value="table" className="mt-4">
            <div className="border rounded-lg overflow-hidden overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="p-2 text-left">Year</th>
                    <th className="p-2 text-right">Yearly Contribution</th>
                    <th className="p-2 text-right">Yearly Interest</th>
                    <th className="p-2 text-right">End Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {yearlyData.map((item) => (
                    <tr key={item.year} className="border-t">
                      <td className="p-2 text-left">{item.year}</td>
                      <td className="p-2 text-right">
                        {formatCurrency(item.contribution)}
                      </td>
                      <td className="p-2 text-right">
                        {formatCurrency(item.interest)}
                      </td>
                      <td className="p-2 text-right">
                        {formatCurrency(item.balance)}
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
