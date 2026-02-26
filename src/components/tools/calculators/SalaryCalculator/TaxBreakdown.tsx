import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TakeHomePayResult } from "./types";

const formatCurrency = (val: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    val,
  );

// Helper to project monthly/bi-weekly for the report
const getPeriodAmounts = (annualAmount: number) => ({
  annual: annualAmount,
  monthly: annualAmount / 12,
  biweekly: annualAmount / 26,
});

export function TaxBreakdown({ result }: { result: TakeHomePayResult }) {
  const gross = getPeriodAmounts(result.grossPay);
  const federal = getPeriodAmounts(result.federalTax);
  const state = getPeriodAmounts(result.stateTax);
  const ss = getPeriodAmounts(result.socialSecurity);
  const medicare = getPeriodAmounts(result.medicare);
  const deductions = getPeriodAmounts(result.totalDeductions);
  const net = getPeriodAmounts(result.netPay);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detailed Breakdown</CardTitle>
        <CardDescription>
          Effective Tax Rate:{" "}
          <span className="font-bold text-foreground">
            {result.effectiveTaxRate.toFixed(2)}%
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Bi-Weekly</TableHead>
              <TableHead className="text-right">Monthly</TableHead>
              <TableHead className="text-right">Annual</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow className="font-medium">
              <TableCell>Gross Pay</TableCell>
              <TableCell className="text-right">
                {formatCurrency(gross.biweekly)}
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(gross.monthly)}
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(gross.annual)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="text-muted-foreground pl-4">
                Federal Tax
              </TableCell>
              <TableCell className="text-right text-destructive">
                {formatCurrency(federal.biweekly)}
              </TableCell>
              <TableCell className="text-right text-destructive">
                {formatCurrency(federal.monthly)}
              </TableCell>
              <TableCell className="text-right text-destructive">
                {formatCurrency(federal.annual)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="text-muted-foreground pl-4">
                State Tax
              </TableCell>
              <TableCell className="text-right text-destructive">
                {formatCurrency(state.biweekly)}
              </TableCell>
              <TableCell className="text-right text-destructive">
                {formatCurrency(state.monthly)}
              </TableCell>
              <TableCell className="text-right text-destructive">
                {formatCurrency(state.annual)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="text-muted-foreground pl-4">
                Social Security
              </TableCell>
              <TableCell className="text-right text-destructive">
                {formatCurrency(ss.biweekly)}
              </TableCell>
              <TableCell className="text-right text-destructive">
                {formatCurrency(ss.monthly)}
              </TableCell>
              <TableCell className="text-right text-destructive">
                {formatCurrency(ss.annual)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="text-muted-foreground pl-4">
                Medicare
              </TableCell>
              <TableCell className="text-right text-destructive">
                {formatCurrency(medicare.biweekly)}
              </TableCell>
              <TableCell className="text-right text-destructive">
                {formatCurrency(medicare.monthly)}
              </TableCell>
              <TableCell className="text-right text-destructive">
                {formatCurrency(medicare.annual)}
              </TableCell>
            </TableRow>
            {result.totalDeductions > 0 && (
              <TableRow>
                <TableCell className="text-muted-foreground pl-4">
                  Other Deductions
                </TableCell>
                <TableCell className="text-right text-destructive">
                  {formatCurrency(deductions.biweekly)}
                </TableCell>
                <TableCell className="text-right text-destructive">
                  {formatCurrency(deductions.monthly)}
                </TableCell>
                <TableCell className="text-right text-destructive">
                  {formatCurrency(deductions.annual)}
                </TableCell>
              </TableRow>
            )}
            <TableRow className="font-bold bg-muted/30">
              <TableCell>Net Pay</TableCell>
              <TableCell className="text-right text-green-600">
                {formatCurrency(net.biweekly)}
              </TableCell>
              <TableCell className="text-right text-green-600">
                {formatCurrency(net.monthly)}
              </TableCell>
              <TableCell className="text-right text-green-600">
                {formatCurrency(net.annual)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
