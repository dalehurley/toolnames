import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Line, Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { RetirementResults } from "./retirementUtils";
import { formatCurrency } from "./retirementUtils";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

interface RetirementChartsProps {
  results: RetirementResults;
}

export function RetirementCharts({ results }: RetirementChartsProps) {
  // Savings Growth Chart Data
  const savingsGrowthData = {
    labels: results.savingsGrowth.map((item) => item.age.toString()),
    datasets: [
      {
        label: "Total Balance",
        data: results.savingsGrowth.map((item) => item.balance),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        fill: true,
        tension: 0.4,
      },
      {
        label: "Total Contributions",
        data: results.savingsGrowth.map((item) => item.contributions),
        borderColor: "rgb(34, 197, 94)",
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const savingsGrowthOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed.y !== null) {
              label += formatCurrency(context.parsed.y);
            }
            return label;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value: any) {
            return formatCurrency(value);
          },
        },
      },
      x: {
        title: {
          display: true,
          text: "Age",
        },
      },
    },
  };

  // Contribution Breakdown Pie Chart
  const contributionData = {
    labels: ["Your Contributions", "Employer Match", "Investment Growth"],
    datasets: [
      {
        data: [
          results.contributionBreakdown.totalContributions,
          results.contributionBreakdown.employerContributions,
          results.contributionBreakdown.totalGrowth,
        ],
        backgroundColor: [
          "rgba(59, 130, 246, 0.8)",
          "rgba(34, 197, 94, 0.8)",
          "rgba(168, 85, 247, 0.8)",
        ],
        borderColor: [
          "rgb(59, 130, 246)",
          "rgb(34, 197, 94)",
          "rgb(168, 85, 247)",
        ],
        borderWidth: 2,
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const label = context.label || "";
            const value = context.parsed;
            const total = context.dataset.data.reduce(
              (acc: number, val: number) => acc + val,
              0,
            );
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${formatCurrency(value)} (${percentage}%)`;
          },
        },
      },
    },
  };

  // Withdrawal Timeline Chart
  const withdrawalData = {
    labels: results.timeline.map((item) => `Year ${item.year}`),
    datasets: [
      {
        label: "Portfolio Balance",
        data: results.timeline.map((item) => item.balance),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const withdrawalOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            return `Balance: ${formatCurrency(context.parsed.y)}`;
          },
          afterLabel: function (context: any) {
            const withdrawal = results.timeline[context.dataIndex].withdrawal;
            return `Withdrawal: ${formatCurrency(withdrawal)}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value: any) {
            return formatCurrency(value);
          },
        },
      },
      x: {
        title: {
          display: true,
          text: "Years in Retirement",
        },
      },
    },
  };

  // Annual Growth Bar Chart
  const annualGrowthData = {
    labels: results.savingsGrowth
      .filter(
        (_, index) =>
          index % Math.max(1, Math.floor(results.savingsGrowth.length / 10)) ===
          0,
      )
      .map((item) => item.age.toString()),
    datasets: [
      {
        label: "Contributions",
        data: results.savingsGrowth
          .filter(
            (_, index) =>
              index %
                Math.max(1, Math.floor(results.savingsGrowth.length / 10)) ===
              0,
          )
          .map((item, index, arr) => {
            if (index === 0) return item.contributions;
            return item.contributions - arr[index - 1].contributions;
          }),
        backgroundColor: "rgba(34, 197, 94, 0.8)",
        borderColor: "rgb(34, 197, 94)",
        borderWidth: 1,
      },
      {
        label: "Investment Growth",
        data: results.savingsGrowth
          .filter(
            (_, index) =>
              index %
                Math.max(1, Math.floor(results.savingsGrowth.length / 10)) ===
              0,
          )
          .map((item, index, arr) => {
            if (index === 0) return item.interest;
            const prevInterest = arr[index - 1].interest;
            return item.interest - prevInterest;
          }),
        backgroundColor: "rgba(168, 85, 247, 0.8)",
        borderColor: "rgb(168, 85, 247)",
        borderWidth: 1,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
          },
        },
      },
    },
    scales: {
      x: {
        stacked: true,
        title: {
          display: true,
          text: "Age",
        },
      },
      y: {
        stacked: true,
        beginAtZero: true,
        ticks: {
          callback: function (value: any) {
            return formatCurrency(value);
          },
        },
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Savings Growth Over Time */}
      <Card>
        <CardHeader>
          <CardTitle>Savings Growth Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <Line data={savingsGrowthData} options={savingsGrowthOptions} />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contribution Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Savings Composition</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <Pie data={contributionData} options={pieOptions} />
            </div>
          </CardContent>
        </Card>

        {/* Annual Growth Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Annual Growth Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <Bar data={annualGrowthData} options={barOptions} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Withdrawal Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Retirement Portfolio Timeline (30 Years)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <Line data={withdrawalData} options={withdrawalOptions} />
          </div>
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              This chart shows how your portfolio balance changes during
              retirement, accounting for annual withdrawals and continued
              investment returns. The projection assumes withdrawals are
              adjusted for inflation each year.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
