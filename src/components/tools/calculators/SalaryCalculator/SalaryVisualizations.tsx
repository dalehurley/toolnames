import { TakeHomePayResult } from "./types";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SalaryVisualizations({
  result,
}: {
  result: TakeHomePayResult;
}) {
  const data = [
    { name: "Net Pay", value: result.netPay, color: "#22c55e" }, // green-500
    { name: "Federal Tax", value: result.federalTax, color: "#ef4444" }, // red-500
    { name: "State Tax", value: result.stateTax, color: "#f97316" }, // orange-500
    {
      name: "FICA (SS & Med)",
      value: result.socialSecurity + result.medicare,
      color: "#eab308",
    }, // yellow-500
    { name: "Deductions", value: result.totalDeductions, color: "#6366f1" }, // indigo-500
  ].filter((d) => d.value > 0);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);

  return (
    <div className="grid md:grid-cols-1 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Where Your Money Goes</CardTitle>
        </CardHeader>
        <CardContent className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={110}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
