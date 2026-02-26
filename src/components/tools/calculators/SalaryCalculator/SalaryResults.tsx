import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConvertedSalary } from "./types";

const formatCurrency = (val: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    val,
  );

export function SalaryResults({ amounts }: { amounts: ConvertedSalary }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      <ResultCard label="Annual" value={amounts.annual} highlight />
      <ResultCard label="Monthly" value={amounts.monthly} />
      <ResultCard label="Bi-Weekly" value={amounts.biweekly} />
      <ResultCard label="Weekly" value={amounts.weekly} />
      <ResultCard label="Daily" value={amounts.daily} />
      <ResultCard label="Hourly" value={amounts.hourly} />
    </div>
  );
}

function ResultCard({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <Card className={highlight ? "bg-primary/5 border-primary" : ""}>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div
          className={`text-xl md:text-2xl font-bold ${highlight ? "text-primary" : ""}`}
        >
          {formatCurrency(value)}
        </div>
      </CardContent>
    </Card>
  );
}
