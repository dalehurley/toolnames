import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RefreshCw, DollarSign } from "lucide-react";

interface Debt {
  id: string;
  name: string;
  balance: number;
  interestRate: number;
  minPayment: number;
}

interface PaymentPlan {
  month: number;
  remainingBalance: number;
  interestPaid: number;
  principalPaid: number;
  totalInterestPaid: number;
  totalPrincipalPaid: number;
  paymentAmount: number;
  debtDetails: {
    [id: string]: {
      balance: number;
      interestPaid: number;
      principalPaid: number;
      isPaidOff: boolean;
    };
  };
}

export const LoanPayoffCalculator = () => {
  // Form state
  const [debts, setDebts] = useState<Debt[]>([
    {
      id: "1",
      name: "Credit Card",
      balance: 5000,
      interestRate: 18,
      minPayment: 100,
    },
    {
      id: "2",
      name: "Car Loan",
      balance: 10000,
      interestRate: 5,
      minPayment: 250,
    },
  ]);
  const [monthlyPayment, setMonthlyPayment] = useState<string>("500");
  const [payoffStrategy, setPayoffStrategy] = useState<
    "avalanche" | "snowball"
  >("avalanche");

  // Results state
  const [paymentPlan, setPaymentPlan] = useState<PaymentPlan[]>([]);
  const [isCalculated, setIsCalculated] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("inputs");
  const [showFullSchedule, setShowFullSchedule] = useState<boolean>(false);

  // Add a new debt
  const handleAddDebt = () => {
    const newId = (parseInt(debts[debts.length - 1]?.id || "0") + 1).toString();
    setDebts([
      ...debts,
      {
        id: newId,
        name: `Debt ${newId}`,
        balance: 0,
        interestRate: 0,
        minPayment: 0,
      },
    ]);
  };

  // Remove a debt
  const handleRemoveDebt = (id: string) => {
    setDebts(debts.filter((debt) => debt.id !== id));
  };

  // Update debt field
  const handleDebtChange = (id: string, field: keyof Debt, value: string) => {
    setDebts(
      debts.map((debt) => {
        if (debt.id === id) {
          return {
            ...debt,
            [field]: field === "name" ? value : parseFloat(value) || 0,
          };
        }
        return debt;
      })
    );
  };

  // Calculate total debt
  const totalDebt = useMemo(() => {
    return debts.reduce((sum, debt) => sum + debt.balance, 0);
  }, [debts]);

  // Calculate minimum payment total
  const totalMinPayment = useMemo(() => {
    return debts.reduce((sum, debt) => sum + debt.minPayment, 0);
  }, [debts]);

  // Handle clear
  const handleClear = () => {
    setDebts([
      {
        id: "1",
        name: "Credit Card",
        balance: 5000,
        interestRate: 18,
        minPayment: 100,
      },
      {
        id: "2",
        name: "Car Loan",
        balance: 10000,
        interestRate: 5,
        minPayment: 250,
      },
    ]);
    setMonthlyPayment("500");
    setPayoffStrategy("avalanche");
    setPaymentPlan([]);
    setIsCalculated(false);
    setShowFullSchedule(false);
  };

  // Calculate payoff plan
  const calculatePayoffPlan = () => {
    const totalPayment = parseFloat(monthlyPayment) || 0;

    // Validate input
    if (totalPayment < totalMinPayment) {
      alert(
        "Total payment must be at least equal to the sum of all minimum payments."
      );
      return;
    }

    // Create a copy of the debts array for manipulation
    const debtsCopy = [...debts].sort((a, b) => {
      if (payoffStrategy === "avalanche") {
        return b.interestRate - a.interestRate;
      } else {
        return a.balance - b.balance;
      }
    });

    // Initialize payment plan
    const plan: PaymentPlan[] = [
      {
        month: 0,
        remainingBalance: totalDebt,
        interestPaid: 0,
        principalPaid: 0,
        totalInterestPaid: 0,
        totalPrincipalPaid: 0,
        paymentAmount: 0,
        debtDetails: debtsCopy.reduce((acc, debt) => {
          acc[debt.id] = {
            balance: debt.balance,
            interestPaid: 0,
            principalPaid: 0,
            isPaidOff: false,
          };
          return acc;
        }, {} as { [id: string]: { balance: number; interestPaid: number; principalPaid: number; isPaidOff: boolean } }),
      },
    ];

    let month = 1;
    let remainingBalance = totalDebt;
    let totalInterestPaid = 0;
    let totalPrincipalPaid = 0;

    // Continue paying until all debts are paid off
    while (remainingBalance > 0 && month <= 600) {
      // 50-year limit to prevent infinite loops
      let paymentLeft = totalPayment;
      let monthlyInterestPaid = 0;
      let monthlyPrincipalPaid = 0;

      const currentDebtDetails = { ...plan[month - 1].debtDetails };

      // Pay minimum payments first
      for (const debt of debtsCopy) {
        if (currentDebtDetails[debt.id].balance <= 0) {
          currentDebtDetails[debt.id].isPaidOff = true;
          continue;
        }

        const interestForMonth =
          (currentDebtDetails[debt.id].balance * (debt.interestRate / 100)) /
          12;

        const paymentForDebt = Math.min(
          debt.minPayment,
          currentDebtDetails[debt.id].balance + interestForMonth
        );
        paymentLeft -= paymentForDebt;

        const interestPaid = Math.min(interestForMonth, paymentForDebt);
        const principalPaid = paymentForDebt - interestPaid;

        currentDebtDetails[debt.id].balance = Math.max(
          0,
          currentDebtDetails[debt.id].balance - principalPaid
        );
        currentDebtDetails[debt.id].interestPaid += interestPaid;
        currentDebtDetails[debt.id].principalPaid += principalPaid;

        monthlyInterestPaid += interestPaid;
        monthlyPrincipalPaid += principalPaid;

        if (currentDebtDetails[debt.id].balance <= 0) {
          currentDebtDetails[debt.id].isPaidOff = true;
        }
      }

      // Apply remaining payment to highest priority debt that's not paid off
      for (const debt of debtsCopy) {
        if (paymentLeft <= 0 || currentDebtDetails[debt.id].isPaidOff) {
          continue;
        }

        const extraPayment = Math.min(
          paymentLeft,
          currentDebtDetails[debt.id].balance
        );
        paymentLeft -= extraPayment;

        currentDebtDetails[debt.id].balance = Math.max(
          0,
          currentDebtDetails[debt.id].balance - extraPayment
        );
        currentDebtDetails[debt.id].principalPaid += extraPayment;
        monthlyPrincipalPaid += extraPayment;

        if (currentDebtDetails[debt.id].balance <= 0) {
          currentDebtDetails[debt.id].isPaidOff = true;
        }
      }

      totalInterestPaid += monthlyInterestPaid;
      totalPrincipalPaid += monthlyPrincipalPaid;
      remainingBalance = Object.values(currentDebtDetails).reduce(
        (sum, detail) => sum + detail.balance,
        0
      );

      plan.push({
        month,
        remainingBalance,
        interestPaid: monthlyInterestPaid,
        principalPaid: monthlyPrincipalPaid,
        totalInterestPaid,
        totalPrincipalPaid,
        paymentAmount: monthlyInterestPaid + monthlyPrincipalPaid,
        debtDetails: currentDebtDetails,
      });

      month++;
    }

    setPaymentPlan(plan);
    setIsCalculated(true);

    // Switch to results tab after calculation
    setActiveTab("results");
  };

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Get results summary
  const getResultsSummary = () => {
    if (paymentPlan.length < 2) return null;

    const months = paymentPlan.length - 1; // Subtract initial state
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    const totalPaid =
      paymentPlan[paymentPlan.length - 1].totalInterestPaid + totalDebt;
    const totalInterest = paymentPlan[paymentPlan.length - 1].totalInterestPaid;
    const interestToDebtRatio = (totalInterest / totalDebt) * 100;

    return {
      payoffTime: `${
        years > 0 ? years + (years === 1 ? " year" : " years") : ""
      }${
        remainingMonths > 0
          ? (years > 0 ? " and " : "") +
            remainingMonths +
            (remainingMonths === 1 ? " month" : " months")
          : ""
      }`,
      totalPaid: formatCurrency(totalPaid),
      totalInterest: formatCurrency(totalInterest),
      interestSavingPercent: interestToDebtRatio.toFixed(1),
      monthlyPayment: formatCurrency(parseFloat(monthlyPayment)),
    };
  };

  return (
    <Card className="w-full max-w-5xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <DollarSign className="h-6 w-6" />
          Loan Payoff Calculator
        </CardTitle>
        <CardDescription>
          Compare debt payoff strategies and create a payment plan to become
          debt-free
        </CardDescription>
      </CardHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="px-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="inputs">Debt Information</TabsTrigger>
            <TabsTrigger value="results" disabled={!isCalculated}>
              Payoff Plan
            </TabsTrigger>
          </TabsList>
        </div>

        <CardContent className="pt-6">
          <TabsContent value="inputs" className="space-y-6">
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-lg">Your Debts</h3>
                  <Button variant="outline" size="sm" onClick={handleAddDebt}>
                    Add Debt
                  </Button>
                </div>

                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[200px]">Name</TableHead>
                        <TableHead>Balance</TableHead>
                        <TableHead>Interest Rate</TableHead>
                        <TableHead>Min Payment</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {debts.map((debt) => (
                        <TableRow key={debt.id}>
                          <TableCell>
                            <Input
                              value={debt.name}
                              onChange={(e) =>
                                handleDebtChange(
                                  debt.id,
                                  "name",
                                  e.target.value
                                )
                              }
                              className="h-8"
                            />
                          </TableCell>
                          <TableCell>
                            <div className="relative">
                              <DollarSign className="absolute left-2 top-1.5 h-4 w-4 text-muted-foreground" />
                              <Input
                                type="number"
                                value={debt.balance || ""}
                                onChange={(e) =>
                                  handleDebtChange(
                                    debt.id,
                                    "balance",
                                    e.target.value
                                  )
                                }
                                className="h-8 pl-8"
                              />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="relative">
                              <Input
                                type="number"
                                value={debt.interestRate || ""}
                                onChange={(e) =>
                                  handleDebtChange(
                                    debt.id,
                                    "interestRate",
                                    e.target.value
                                  )
                                }
                                className="h-8 pr-6"
                              />
                              <span className="absolute right-2 top-1.5 text-muted-foreground">
                                %
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="relative">
                              <DollarSign className="absolute left-2 top-1.5 h-4 w-4 text-muted-foreground" />
                              <Input
                                type="number"
                                value={debt.minPayment || ""}
                                onChange={(e) =>
                                  handleDebtChange(
                                    debt.id,
                                    "minPayment",
                                    e.target.value
                                  )
                                }
                                className="h-8 pl-8"
                              />
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleRemoveDebt(debt.id)}
                              disabled={debts.length === 1}
                            >
                              &times;
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="monthly-payment">Total Monthly Payment</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="monthly-payment"
                      type="number"
                      className="pl-8"
                      value={monthlyPayment}
                      onChange={(e) => setMonthlyPayment(e.target.value)}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Minimum required: {formatCurrency(totalMinPayment)} (sum of
                    minimum payments)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payoff-strategy">Payoff Strategy</Label>
                  <Select
                    value={payoffStrategy}
                    onValueChange={(value) =>
                      setPayoffStrategy(value as "avalanche" | "snowball")
                    }
                  >
                    <SelectTrigger id="payoff-strategy">
                      <SelectValue placeholder="Select strategy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="avalanche">
                        Debt Avalanche (Highest Interest First)
                      </SelectItem>
                      <SelectItem value="snowball">
                        Debt Snowball (Lowest Balance First)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {payoffStrategy === "avalanche"
                      ? "Avalanche saves more money by targeting high interest debts first"
                      : "Snowball builds momentum by paying off small debts first"}
                  </p>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row justify-between gap-4">
                <Button variant="outline" onClick={handleClear}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Clear
                </Button>
                <Button onClick={calculatePayoffPlan}>
                  Calculate Payoff Plan
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="results" className="space-y-6">
            {!isCalculated ? (
              <div className="text-center py-10">
                <p className="text-muted-foreground">
                  Enter your debt information and calculate a payment plan to
                  see results.
                </p>
              </div>
            ) : (
              <>
                {/* Results Summary */}
                <div className="bg-muted rounded-lg p-6">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold text-muted-foreground mb-1">
                      Debt Payoff Summary
                    </h3>
                    <p className="text-4xl font-bold mb-2">
                      {getResultsSummary()?.payoffTime}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Using the{" "}
                      {payoffStrategy === "avalanche"
                        ? "Debt Avalanche"
                        : "Debt Snowball"}{" "}
                      strategy
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-background rounded-lg p-4 text-center">
                      <p className="text-sm text-muted-foreground mb-1">
                        Total Debt
                      </p>
                      <p className="text-xl font-semibold">
                        {formatCurrency(totalDebt)}
                      </p>
                    </div>

                    <div className="bg-background rounded-lg p-4 text-center">
                      <p className="text-sm text-muted-foreground mb-1">
                        Total Interest
                      </p>
                      <p className="text-xl font-semibold">
                        {getResultsSummary()?.totalInterest}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {getResultsSummary()?.interestSavingPercent}% of
                        original debt
                      </p>
                    </div>

                    <div className="bg-background rounded-lg p-4 text-center">
                      <p className="text-sm text-muted-foreground mb-1">
                        Monthly Payment
                      </p>
                      <p className="text-xl font-semibold">
                        {getResultsSummary()?.monthlyPayment}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Payoff Progress */}
                <div className="space-y-4">
                  <h3 className="font-medium text-lg">Payoff Progress</h3>

                  <div className="space-y-4">
                    {debts.map((debt) => {
                      const finalPlan = paymentPlan[paymentPlan.length - 1];
                      const initialDebt = debt.balance;
                      const remaining = finalPlan.debtDetails[debt.id].balance;
                      const progress =
                        ((initialDebt - remaining) / initialDebt) * 100;

                      return (
                        <div key={debt.id} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{debt.name}</span>
                            <span>
                              {formatCurrency(initialDebt - remaining)} of{" "}
                              {formatCurrency(initialDebt)}
                            </span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Payoff Schedule */}
                <div className="space-y-4">
                  <h3 className="font-medium text-lg">Payoff Schedule</h3>

                  <div className="border rounded-md overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Month</TableHead>
                          <TableHead>Payment</TableHead>
                          <TableHead>Principal</TableHead>
                          <TableHead>Interest</TableHead>
                          <TableHead>Remaining</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(showFullSchedule
                          ? paymentPlan.slice(1) // Show all rows except the initial state
                          : paymentPlan.slice(1, 13)
                        ) // Show only first 12 rows
                          .map((month) => (
                            <TableRow key={month.month}>
                              <TableCell>{month.month}</TableCell>
                              <TableCell>
                                {formatCurrency(month.paymentAmount)}
                              </TableCell>
                              <TableCell>
                                {formatCurrency(month.principalPaid)}
                              </TableCell>
                              <TableCell>
                                {formatCurrency(month.interestPaid)}
                              </TableCell>
                              <TableCell>
                                {formatCurrency(month.remainingBalance)}
                              </TableCell>
                            </TableRow>
                          ))}
                        {!showFullSchedule && paymentPlan.length > 13 && (
                          <TableRow
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => setShowFullSchedule(true)}
                          >
                            <TableCell
                              colSpan={5}
                              className="text-center text-muted-foreground"
                            >
                              ... {paymentPlan.length - 13} more months ...
                              (click to expand)
                            </TableCell>
                          </TableRow>
                        )}
                        {showFullSchedule && paymentPlan.length > 13 && (
                          <TableRow
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => setShowFullSchedule(false)}
                          >
                            <TableCell
                              colSpan={5}
                              className="text-center text-muted-foreground"
                            >
                              Show less (click to collapse)
                            </TableCell>
                          </TableRow>
                        )}
                        {!showFullSchedule && paymentPlan.length > 1 && (
                          <TableRow>
                            <TableCell>
                              {paymentPlan[paymentPlan.length - 1].month}
                            </TableCell>
                            <TableCell>
                              {formatCurrency(
                                paymentPlan[paymentPlan.length - 1]
                                  .paymentAmount
                              )}
                            </TableCell>
                            <TableCell>
                              {formatCurrency(
                                paymentPlan[paymentPlan.length - 1]
                                  .principalPaid
                              )}
                            </TableCell>
                            <TableCell>
                              {formatCurrency(
                                paymentPlan[paymentPlan.length - 1].interestPaid
                              )}
                            </TableCell>
                            <TableCell>
                              {formatCurrency(
                                paymentPlan[paymentPlan.length - 1]
                                  .remainingBalance
                              )}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <div className="pt-4 flex justify-between gap-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setActiveTab("inputs");
                      setShowFullSchedule(false);
                    }}
                  >
                    Edit Inputs
                  </Button>
                </div>
              </>
            )}
          </TabsContent>
        </CardContent>
      </Tabs>

      <CardFooter className="flex flex-col space-y-4">
        <div className="bg-muted p-4 rounded-lg w-full">
          <h3 className="font-semibold mb-2">About Debt Payoff Strategies</h3>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              <strong>Debt Avalanche:</strong> Pay minimum payments on all
              debts, then put extra money toward the debt with the highest
              interest rate. This strategy saves the most money over time.
            </p>
            <p>
              <strong>Debt Snowball:</strong> Pay minimum payments on all debts,
              then put extra money toward the debt with the lowest balance. This
              strategy provides psychological wins by eliminating debts quickly.
            </p>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default LoanPayoffCalculator;
