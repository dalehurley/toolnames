import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROIResult } from "./types";

export function ROIResults({ result }: { result: ROIResult }) {
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(val);

  const formatPercent = (val: number) =>
    new Intl.NumberFormat("en-US", {
      style: "percent",
      minimumFractionDigits: 2,
    }).format(val / 100);

  return (
    <div className="grid grid-cols-2 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total ROI
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${result.simpleROI >= 0 ? "text-green-600" : "text-red-600"}`}
          >
            {formatPercent(result.simpleROI)}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Annualized ROI
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatPercent(result.annualizedROI)}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Absolute Return
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${result.absoluteReturn >= 0 ? "text-green-600" : "text-red-600"}`}
          >
            {formatCurrency(result.absoluteReturn)}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Final Value
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">
            {formatCurrency(result.finalValue)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
