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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Fuel, Calculator, RefreshCw } from "lucide-react";

export const FuelCalculator = () => {
  // Active tab state
  const [activeTab, setActiveTab] = useState<string>("mpg");

  // MPG calculator states
  const [distance, setDistance] = useState<string>("");
  const [fuel, setFuel] = useState<string>("");
  const [distanceUnit, setDistanceUnit] = useState<string>("miles");
  const [fuelUnit, setFuelUnit] = useState<string>("gallons");
  const [mpgResult, setMpgResult] = useState<string>("");
  const [mpgLabel, setMpgLabel] = useState<string>("MPG");

  // Trip cost calculator states
  const [tripDistance, setTripDistance] = useState<string>("");
  const [fuelEfficiency, setFuelEfficiency] = useState<string>("");
  const [fuelPrice, setFuelPrice] = useState<string>("");
  const [tripCostResult, setTripCostResult] = useState<string>("");
  const [efficiencyUnit, setEfficiencyUnit] = useState<string>("mpg");
  const [tripDistanceUnit, setTripDistanceUnit] = useState<string>("miles");

  // Error handling
  const [errors, setErrors] = useState<{
    distance?: string;
    fuel?: string;
    tripDistance?: string;
    fuelEfficiency?: string;
    fuelPrice?: string;
  }>({});

  // Clear form fields
  const handleClear = () => {
    if (activeTab === "mpg") {
      setDistance("");
      setFuel("");
      setMpgResult("");
    } else if (activeTab === "trip-cost") {
      setTripDistance("");
      setFuelEfficiency("");
      setFuelPrice("");
      setTripCostResult("");
    }
    setErrors({});
  };

  // Calculate MPG (or L/100km)
  const calculateMPG = () => {
    const newErrors: typeof errors = {};

    if (!distance) {
      newErrors.distance = "Distance is required";
    } else if (parseFloat(distance) <= 0) {
      newErrors.distance = "Distance must be greater than 0";
    }

    if (!fuel) {
      newErrors.fuel = "Fuel amount is required";
    } else if (parseFloat(fuel) <= 0) {
      newErrors.fuel = "Fuel amount must be greater than 0";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    const distanceValue = parseFloat(distance);
    const fuelValue = parseFloat(fuel);

    // Convert to standard units for calculation
    let standardDistance = distanceValue;
    if (distanceUnit === "kilometers") {
      standardDistance = distanceValue * 0.621371; // km to miles
    }

    let standardFuel = fuelValue;
    if (fuelUnit === "liters") {
      standardFuel = fuelValue * 0.264172; // liters to gallons
    }

    let result: number;

    // Calculate based on selected units
    if (distanceUnit === "kilometers" && fuelUnit === "liters") {
      // Calculate L/100km
      result = (fuelValue * 100) / distanceValue;
      setMpgLabel("L/100km");
    } else {
      // Calculate MPG or equivalent
      result = standardDistance / standardFuel;

      if (distanceUnit === "kilometers" && fuelUnit === "gallons") {
        setMpgLabel("KPG");
      } else if (distanceUnit === "miles" && fuelUnit === "liters") {
        setMpgLabel("MPL");
      } else {
        setMpgLabel("MPG");
      }
    }

    setMpgResult(result.toFixed(2));
  };

  // Calculate trip cost
  const calculateTripCost = () => {
    const newErrors: typeof errors = {};

    if (!tripDistance) {
      newErrors.tripDistance = "Distance is required";
    } else if (parseFloat(tripDistance) <= 0) {
      newErrors.tripDistance = "Distance must be greater than 0";
    }

    if (!fuelEfficiency) {
      newErrors.fuelEfficiency = "Fuel efficiency is required";
    } else if (parseFloat(fuelEfficiency) <= 0) {
      newErrors.fuelEfficiency = "Fuel efficiency must be greater than 0";
    }

    if (!fuelPrice) {
      newErrors.fuelPrice = "Fuel price is required";
    } else if (parseFloat(fuelPrice) <= 0) {
      newErrors.fuelPrice = "Fuel price must be greater than 0";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    const distance = parseFloat(tripDistance);
    const efficiency = parseFloat(fuelEfficiency);
    const price = parseFloat(fuelPrice);

    // Normalize to miles and MPG for calculation
    let standardDistance = distance;
    if (tripDistanceUnit === "kilometers") {
      standardDistance = distance * 0.621371; // km to miles
    }

    let standardEfficiency = efficiency;
    if (efficiencyUnit === "l/100km") {
      // Convert L/100km to MPG
      standardEfficiency = 235.215 / efficiency;
    } else if (efficiencyUnit === "km/l") {
      // Convert km/L to MPG
      standardEfficiency = efficiency * 2.35215;
    }

    // Calculate fuel needed
    const fuelNeeded = standardDistance / standardEfficiency;

    // Calculate total cost
    const cost = fuelNeeded * price;

    setTripCostResult(cost.toFixed(2));
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Fuel className="h-6 w-6" />
          Fuel Efficiency Calculator
        </CardTitle>
        <CardDescription>
          Calculate fuel efficiency (MPG), estimate trip costs, and analyze fuel
          consumption
        </CardDescription>
      </CardHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="px-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="mpg">Fuel Efficiency</TabsTrigger>
            <TabsTrigger value="trip-cost">Trip Cost</TabsTrigger>
          </TabsList>
        </div>

        <CardContent className="pt-6">
          {/* Fuel Efficiency Tab */}
          <TabsContent value="mpg" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="distance">Distance</Label>
                <div className="flex space-x-2">
                  <Input
                    id="distance"
                    type="number"
                    placeholder="250"
                    step="any"
                    value={distance}
                    onChange={(e) => setDistance(e.target.value)}
                    className="flex-1"
                  />
                  <Select value={distanceUnit} onValueChange={setDistanceUnit}>
                    <SelectTrigger className="w-[110px]">
                      <SelectValue placeholder="Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="miles">Miles</SelectItem>
                      <SelectItem value="kilometers">Kilometers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {errors.distance && (
                  <p className="text-sm text-red-500">{errors.distance}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="fuel">Fuel Used</Label>
                <div className="flex space-x-2">
                  <Input
                    id="fuel"
                    type="number"
                    placeholder="10"
                    step="any"
                    value={fuel}
                    onChange={(e) => setFuel(e.target.value)}
                    className="flex-1"
                  />
                  <Select value={fuelUnit} onValueChange={setFuelUnit}>
                    <SelectTrigger className="w-[110px]">
                      <SelectValue placeholder="Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gallons">Gallons</SelectItem>
                      <SelectItem value="liters">Liters</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {errors.fuel && (
                  <p className="text-sm text-red-500">{errors.fuel}</p>
                )}
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={handleClear}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Clear
              </Button>

              <Button onClick={calculateMPG}>
                <Calculator className="mr-2 h-4 w-4" />
                Calculate
              </Button>
            </div>

            {mpgResult && (
              <div className="pt-6">
                <div className="bg-muted rounded-lg p-6 text-center">
                  <p className="text-sm text-muted-foreground mb-1">
                    Fuel Efficiency
                  </p>
                  <p className="text-3xl font-semibold mb-2">
                    {mpgResult} {mpgLabel}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {distance} {distanceUnit} per {fuel} {fuelUnit}
                  </p>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Trip Cost Tab */}
          <TabsContent value="trip-cost" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="trip-distance">Trip Distance</Label>
                <div className="flex space-x-2">
                  <Input
                    id="trip-distance"
                    type="number"
                    placeholder="500"
                    step="any"
                    value={tripDistance}
                    onChange={(e) => setTripDistance(e.target.value)}
                    className="flex-1"
                  />
                  <Select
                    value={tripDistanceUnit}
                    onValueChange={setTripDistanceUnit}
                  >
                    <SelectTrigger className="w-[110px]">
                      <SelectValue placeholder="Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="miles">Miles</SelectItem>
                      <SelectItem value="kilometers">Kilometers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {errors.tripDistance && (
                  <p className="text-sm text-red-500">{errors.tripDistance}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="fuel-efficiency">Fuel Efficiency</Label>
                <div className="flex space-x-2">
                  <Input
                    id="fuel-efficiency"
                    type="number"
                    placeholder="25"
                    step="any"
                    value={fuelEfficiency}
                    onChange={(e) => setFuelEfficiency(e.target.value)}
                    className="flex-1"
                  />
                  <Select
                    value={efficiencyUnit}
                    onValueChange={setEfficiencyUnit}
                  >
                    <SelectTrigger className="w-[110px]">
                      <SelectValue placeholder="Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mpg">MPG</SelectItem>
                      <SelectItem value="l/100km">L/100km</SelectItem>
                      <SelectItem value="km/l">km/L</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {errors.fuelEfficiency && (
                  <p className="text-sm text-red-500">
                    {errors.fuelEfficiency}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="fuel-price">
                  Fuel Price (per gallon/liter)
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5">$</span>
                  <Input
                    id="fuel-price"
                    type="number"
                    placeholder="3.50"
                    step="any"
                    value={fuelPrice}
                    onChange={(e) => setFuelPrice(e.target.value)}
                    className="pl-7"
                  />
                </div>
                {errors.fuelPrice && (
                  <p className="text-sm text-red-500">{errors.fuelPrice}</p>
                )}
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={handleClear}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Clear
              </Button>

              <Button onClick={calculateTripCost}>
                <Calculator className="mr-2 h-4 w-4" />
                Calculate
              </Button>
            </div>

            {tripCostResult && (
              <div className="pt-6">
                <div className="bg-muted rounded-lg p-6 text-center">
                  <p className="text-sm text-muted-foreground mb-1">
                    Estimated Trip Cost
                  </p>
                  <p className="text-3xl font-semibold mb-2">
                    ${tripCostResult}
                  </p>
                  <div className="text-sm text-muted-foreground">
                    <p>
                      {tripDistance} {tripDistanceUnit} at {fuelEfficiency}{" "}
                      {efficiencyUnit}
                    </p>
                    <p>
                      Fuel price: ${fuelPrice} per{" "}
                      {fuelUnit === "gallons" ? "gallon" : "liter"}
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
              <strong>Fuel Efficiency</strong> - Calculate miles per gallon
              (MPG) or liters per 100km (L/100km)
            </li>
            <li>
              <strong>Trip Cost</strong> - Estimate the cost of a trip based on
              distance, fuel efficiency, and fuel price
            </li>
          </ul>
          <div className="mt-3 text-sm text-muted-foreground">
            <p>
              <strong>Note:</strong> For "Trip Cost" calculations, the
              calculator automatically converts between different units.
            </p>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default FuelCalculator;
