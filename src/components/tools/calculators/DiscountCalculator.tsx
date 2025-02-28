import { useState } from "react";
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
import { DollarSign, Percent, RefreshCw } from "lucide-react";

export const DiscountCalculator = () => {
  const [activeTab, setActiveTab] = useState<string>("find-sale-price");
  const [originalPrice, setOriginalPrice] = useState<string>("");
  const [discountPercent, setDiscountPercent] = useState<string>("");
  const [salePrice, setSalePrice] = useState<string>("");
  const [savingAmount, setSavingAmount] = useState<string>("");

  // For "Find Discount" tab
  const [knownOriginalPrice, setKnownOriginalPrice] = useState<string>("");
  const [knownSalePrice, setKnownSalePrice] = useState<string>("");
  const [calculatedDiscount, setCalculatedDiscount] = useState<string>("");
  const [calculatedSaving, setCalculatedSaving] = useState<string>("");

  // Error states
  const [errors, setErrors] = useState<{
    originalPrice?: string;
    discountPercent?: string;
    salePrice?: string;
    knownOriginalPrice?: string;
    knownSalePrice?: string;
  }>({});

  // Clear form fields
  const handleClear = () => {
    if (activeTab === "find-sale-price") {
      setOriginalPrice("");
      setDiscountPercent("");
      setSalePrice("");
      setSavingAmount("");
    } else {
      setKnownOriginalPrice("");
      setKnownSalePrice("");
      setCalculatedDiscount("");
      setCalculatedSaving("");
    }

    setErrors({});
  };

  // Handle input changes for sale price tab
  const handleSalePriceChange = (field: string, value: string) => {
    // Update the corresponding state
    if (field === "originalPrice") {
      setOriginalPrice(value);
    } else if (field === "discountPercent") {
      setDiscountPercent(value);
    }

    // Validate inputs
    const newErrors: typeof errors = {};

    if (!value && field === "originalPrice") {
      newErrors.originalPrice = "Original price is required";
    } else if (Number(value) <= 0 && field === "originalPrice") {
      newErrors.originalPrice = "Original price must be greater than 0";
    }

    if (!value && field === "discountPercent") {
      newErrors.discountPercent = "Discount percentage is required";
    } else if (
      (Number(value) < 0 || Number(value) > 100) &&
      field === "discountPercent"
    ) {
      newErrors.discountPercent = "Discount must be between 0 and 100";
    }

    setErrors((prev) => ({ ...prev, ...newErrors }));

    // Calculate if we have both values and no errors
    if (
      originalPrice &&
      discountPercent &&
      (field === "originalPrice" ? value : originalPrice) &&
      (field === "discountPercent" ? value : discountPercent)
    ) {
      const priceValue = parseFloat(
        field === "originalPrice" ? value : originalPrice
      );
      const discountValue = parseFloat(
        field === "discountPercent" ? value : discountPercent
      );

      if (
        !isNaN(priceValue) &&
        !isNaN(discountValue) &&
        priceValue > 0 &&
        discountValue >= 0 &&
        discountValue <= 100
      ) {
        const calculatedSavings = priceValue * (discountValue / 100);
        const calculatedSalePrice = priceValue - calculatedSavings;

        // Update state
        setSalePrice(calculatedSalePrice.toFixed(2));
        setSavingAmount(calculatedSavings.toFixed(2));
      }
    }
  };

  // Handle input changes for discount tab
  const handleDiscountChange = (field: string, value: string) => {
    // Update the corresponding state
    if (field === "knownOriginalPrice") {
      setKnownOriginalPrice(value);
    } else if (field === "knownSalePrice") {
      setKnownSalePrice(value);
    }

    // Validate inputs
    const newErrors: typeof errors = {};

    if (!value && field === "knownOriginalPrice") {
      newErrors.knownOriginalPrice = "Original price is required";
    } else if (Number(value) <= 0 && field === "knownOriginalPrice") {
      newErrors.knownOriginalPrice = "Original price must be greater than 0";
    }

    if (!value && field === "knownSalePrice") {
      newErrors.knownSalePrice = "Sale price is required";
    } else if (Number(value) < 0 && field === "knownSalePrice") {
      newErrors.knownSalePrice = "Sale price must be 0 or greater";
    } else if (
      Number(value) > Number(knownOriginalPrice) &&
      field === "knownSalePrice"
    ) {
      newErrors.knownSalePrice =
        "Sale price cannot be higher than original price";
    }

    setErrors((prev) => ({ ...prev, ...newErrors }));

    // Calculate if we have both values and no errors
    if (
      knownOriginalPrice &&
      knownSalePrice &&
      (field === "knownOriginalPrice" ? value : knownOriginalPrice) &&
      (field === "knownSalePrice" ? value : knownSalePrice)
    ) {
      const originalPriceValue = parseFloat(
        field === "knownOriginalPrice" ? value : knownOriginalPrice
      );
      const salePriceValue = parseFloat(
        field === "knownSalePrice" ? value : knownSalePrice
      );

      if (
        !isNaN(originalPriceValue) &&
        !isNaN(salePriceValue) &&
        originalPriceValue > 0 &&
        salePriceValue >= 0 &&
        salePriceValue <= originalPriceValue
      ) {
        const savingAmount = originalPriceValue - salePriceValue;
        const discountPercentage = (savingAmount / originalPriceValue) * 100;

        // Update state
        setCalculatedDiscount(discountPercentage.toFixed(2));
        setCalculatedSaving(savingAmount.toFixed(2));
      }
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Percent className="h-6 w-6" />
          Discount Calculator
        </CardTitle>
        <CardDescription>
          Calculate sale prices, savings amounts, and discount percentages
        </CardDescription>
      </CardHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="px-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="find-sale-price">
              Calculate Sale Price
            </TabsTrigger>
            <TabsTrigger value="find-discount">Calculate Discount</TabsTrigger>
          </TabsList>
        </div>

        <CardContent className="pt-6">
          <TabsContent value="find-sale-price" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="original-price">Original Price ($)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="original-price"
                    type="number"
                    placeholder="100.00"
                    min="0"
                    step="0.01"
                    className="pl-8"
                    value={originalPrice}
                    onChange={(e) =>
                      handleSalePriceChange("originalPrice", e.target.value)
                    }
                  />
                </div>
                {errors.originalPrice && (
                  <p className="text-sm text-red-500">{errors.originalPrice}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="discount-percent">Discount (%)</Label>
                <div className="relative">
                  <Percent className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="discount-percent"
                    type="number"
                    placeholder="20"
                    min="0"
                    max="100"
                    step="0.1"
                    className="pl-8"
                    value={discountPercent}
                    onChange={(e) =>
                      handleSalePriceChange("discountPercent", e.target.value)
                    }
                  />
                </div>
                {errors.discountPercent && (
                  <p className="text-sm text-red-500">
                    {errors.discountPercent}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={handleClear}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Clear
              </Button>
            </div>

            {(salePrice || savingAmount) && (
              <div className="pt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-muted rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-1">
                      Sale Price
                    </p>
                    <p className="text-2xl font-semibold">${salePrice}</p>
                  </div>

                  <div className="bg-muted rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-1">
                      You Save
                    </p>
                    <p className="text-2xl font-semibold">${savingAmount}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-900">
                  <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <Percent className="h-4 w-4 text-green-700 dark:text-green-300" />
                  </div>
                  <div>
                    <p className="font-medium">
                      You save {discountPercent}% (
                      {savingAmount ? `$${savingAmount}` : ""})
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Original price: ${originalPrice} → Sale price: $
                      {salePrice}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="find-discount" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="known-original-price">Original Price ($)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="known-original-price"
                    type="number"
                    placeholder="100.00"
                    min="0"
                    step="0.01"
                    className="pl-8"
                    value={knownOriginalPrice}
                    onChange={(e) =>
                      handleDiscountChange("knownOriginalPrice", e.target.value)
                    }
                  />
                </div>
                {errors.knownOriginalPrice && (
                  <p className="text-sm text-red-500">
                    {errors.knownOriginalPrice}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="known-sale-price">Sale Price ($)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="known-sale-price"
                    type="number"
                    placeholder="80.00"
                    min="0"
                    step="0.01"
                    className="pl-8"
                    value={knownSalePrice}
                    onChange={(e) =>
                      handleDiscountChange("knownSalePrice", e.target.value)
                    }
                  />
                </div>
                {errors.knownSalePrice && (
                  <p className="text-sm text-red-500">
                    {errors.knownSalePrice}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={handleClear}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Clear
              </Button>
            </div>

            {(calculatedDiscount || calculatedSaving) && (
              <div className="pt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-muted rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-1">
                      Discount Percentage
                    </p>
                    <p className="text-2xl font-semibold">
                      {calculatedDiscount}%
                    </p>
                  </div>

                  <div className="bg-muted rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-1">
                      Amount Saved
                    </p>
                    <p className="text-2xl font-semibold">
                      ${calculatedSaving}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-900">
                  <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <Percent className="h-4 w-4 text-green-700 dark:text-green-300" />
                  </div>
                  <div>
                    <p className="font-medium">
                      The discount is {calculatedDiscount}% (${calculatedSaving}
                      )
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Original price: ${knownOriginalPrice} → Sale price: $
                      {knownSalePrice}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </CardContent>
      </Tabs>

      <CardFooter className="flex flex-col space-y-4">
        <div className="bg-muted p-4 rounded-lg w-full">
          <h3 className="font-semibold mb-2">How to use this calculator</h3>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-4">
            <li>
              <strong>Calculate Sale Price:</strong> Enter the original price
              and discount percentage to find the sale price and how much you
              save.
            </li>
            <li>
              <strong>Calculate Discount:</strong> Enter the original price and
              sale price to find the discount percentage and savings amount.
            </li>
          </ul>
        </div>
      </CardFooter>
    </Card>
  );
};

export default DiscountCalculator;
