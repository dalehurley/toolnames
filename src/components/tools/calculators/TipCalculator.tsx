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
import { Calculator, Users, CreditCard, Receipt } from "lucide-react";

export const TipCalculator = () => {
  const [billAmount, setBillAmount] = useState<string>("");
  const [tipPercentage, setTipPercentage] = useState<string>("15");
  const [numPeople, setNumPeople] = useState<string>("1");
  const [tipAmount, setTipAmount] = useState<number>(0);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [amountPerPerson, setAmountPerPerson] = useState<number>(0);

  const calculateTip = () => {
    const bill = parseFloat(billAmount);
    const tip = parseFloat(tipPercentage);
    const people = parseInt(numPeople);

    if (isNaN(bill) || bill <= 0) {
      return;
    }

    const validTip = isNaN(tip) || tip < 0 ? 0 : tip;
    const validPeople = isNaN(people) || people < 1 ? 1 : people;

    const calculatedTip = bill * (validTip / 100);
    const calculatedTotal = bill + calculatedTip;
    const calculatedPerPerson = calculatedTotal / validPeople;

    setTipAmount(calculatedTip);
    setTotalAmount(calculatedTotal);
    setAmountPerPerson(calculatedPerPerson);
  };

  useEffect(() => {
    calculateTip();
  }, [billAmount, tipPercentage, numPeople]);

  const handleBillChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and decimal point
    const val = e.target.value.replace(/[^0-9.]/g, "");
    // Ensure only one decimal point
    const decimalCount = val.split(".").length - 1;
    if (decimalCount <= 1) {
      setBillAmount(val);
    }
  };

  const handleNumPeopleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow positive integers
    const val = e.target.value.replace(/[^0-9]/g, "");
    setNumPeople(val === "" ? "1" : val);
  };

  const handleTipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and decimal point
    const val = e.target.value.replace(/[^0-9.]/g, "");
    // Ensure only one decimal point
    const decimalCount = val.split(".").length - 1;
    if (decimalCount <= 1) {
      setTipPercentage(val);
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });
  };

  const quickTips = [10, 15, 18, 20, 25];

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Tip Calculator</CardTitle>
        <CardDescription>
          Calculate the tip amount and split the bill among people
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="billAmount">
                <CreditCard className="h-4 w-4 inline mr-2" />
                Bill Amount
              </Label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  $
                </span>
                <Input
                  id="billAmount"
                  type="text"
                  placeholder="0.00"
                  value={billAmount}
                  onChange={handleBillChange}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipPercentage">
                <Calculator className="h-4 w-4 inline mr-2" />
                Tip Percentage
              </Label>
              <div className="relative">
                <Input
                  id="tipPercentage"
                  type="text"
                  placeholder="15"
                  value={tipPercentage}
                  onChange={handleTipChange}
                  className="pr-8"
                />
                <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">
                  %
                </span>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {quickTips.map((percent) => (
                  <Button
                    key={percent}
                    variant={
                      tipPercentage === percent.toString()
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    onClick={() => setTipPercentage(percent.toString())}
                  >
                    {percent}%
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="numPeople">
                <Users className="h-4 w-4 inline mr-2" />
                Number of People
              </Label>
              <Input
                id="numPeople"
                type="text"
                placeholder="1"
                value={numPeople}
                onChange={handleNumPeopleChange}
              />
            </div>
          </div>

          <div className="bg-muted p-6 rounded-lg space-y-5">
            <div className="text-center border-b pb-4">
              <Receipt className="h-6 w-6 mx-auto mb-2 text-primary" />
              <h3 className="text-lg font-medium">Summary</h3>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bill Amount:</span>
                <span className="font-medium">
                  {billAmount
                    ? formatCurrency(parseFloat(billAmount))
                    : "$0.00"}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">Tip Amount:</span>
                <span className="font-medium">{formatCurrency(tipAmount)}</span>
              </div>

              <div className="flex justify-between border-t pt-2">
                <span className="font-medium">Total:</span>
                <span className="font-semibold text-primary">
                  {formatCurrency(totalAmount)}
                </span>
              </div>

              {parseInt(numPeople) > 1 && (
                <div className="flex justify-between border-t pt-2 mt-4">
                  <span className="font-medium">Each Person Pays:</span>
                  <span className="font-semibold">
                    {formatCurrency(amountPerPerson)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-muted p-4 rounded-lg mt-6">
          <h3 className="font-medium mb-2">Tips for Tipping</h3>
          <ul className="text-sm space-y-1 list-disc pl-4 text-muted-foreground">
            <li>10-15% is standard for acceptable service</li>
            <li>15-20% is recommended for good service</li>
            <li>20-25% or more shows appreciation for exceptional service</li>
            <li>Check if a service charge is already included in your bill</li>
            <li>Some countries have different tipping customs</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
