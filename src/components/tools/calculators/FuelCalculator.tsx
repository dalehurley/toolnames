import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
      setDistanceUnit("miles");
      setFuelUnit("gallons");
      setMpgResult("");
      setErrors((prev) => ({
        ...prev,
        distance: "",
        fuel: "",
      }));
    } else {
      setTripDistance("");
      setFuelEfficiency("");
      setFuelPrice("");
      setTripDistanceUnit("miles");
      setEfficiencyUnit("mpg");
      setTripCostResult("");
      setErrors((prev) => ({
        ...prev,
        tripDistance: "",
        fuelEfficiency: "",
        fuelPrice: "",
      }));
    }
  };

  // Handle MPG Calculator Input Changes
  const handleMpgChange = (field: string, value: string | number) => {
    // Update field value
    switch (field) {
      case "distance":
        setDistance(value.toString());
        if (Number(value) <= 0) {
          setErrors((prev) => ({
            ...prev,
            distance: "Distance must be greater than 0",
          }));
        } else {
          setErrors((prev) => ({ ...prev, distance: "" }));
        }
        break;
      case "fuel":
        setFuel(value.toString());
        if (Number(value) <= 0) {
          setErrors((prev) => ({
            ...prev,
            fuel: "Fuel must be greater than 0",
          }));
        } else {
          setErrors((prev) => ({ ...prev, fuel: "" }));
        }
        break;
      case "distanceUnit":
        setDistanceUnit(value.toString());
        break;
      case "fuelUnit":
        setFuelUnit(value.toString());
        break;
    }

    // Calculate MPG result if both values are valid
    const distanceVal = field === "distance" ? Number(value) : Number(distance);
    const fuelVal = field === "fuel" ? Number(value) : Number(fuel);
    const distanceUnitVal =
      field === "distanceUnit" ? value.toString() : distanceUnit;
    const fuelUnitVal = field === "fuelUnit" ? value.toString() : fuelUnit;

    if (distanceVal > 0 && fuelVal > 0) {
      // Convert to standard units for calculation
      let standardDistance = distanceVal;
      if (distanceUnitVal === "kilometers") {
        standardDistance = distanceVal * 0.621371; // km to miles
      }

      let standardFuel = fuelVal;
      if (fuelUnitVal === "liters") {
        standardFuel = fuelVal * 0.264172; // liters to gallons
      }

      // Calculate MPG
      const mpg = standardDistance / standardFuel;

      // Format result based on output units
      if (distanceUnitVal === "miles" && fuelUnitVal === "gallons") {
        setMpgResult(mpg.toFixed(2));
        setMpgLabel("MPG");
      } else if (distanceUnitVal === "kilometers" && fuelUnitVal === "liters") {
        // Convert to L/100km
        const l100km = 100 / (mpg * 1.60934);
        setMpgResult(l100km.toFixed(2));
        setMpgLabel("L/100km");
      } else if (distanceUnitVal === "miles" && fuelUnitVal === "liters") {
        setMpgResult((mpg * 0.264172).toFixed(2));
        setMpgLabel("miles/L");
      } else {
        // km/gallon
        setMpgResult((mpg * 1.60934).toFixed(2));
        setMpgLabel("km/gallon");
      }
    } else {
      setMpgResult("");
    }
  };

  // Handle Trip Cost Calculator Input Changes
  const handleTripCostChange = (field: string, value: string | number) => {
    // Update field value
    switch (field) {
      case "tripDistance":
        setTripDistance(value.toString());
        if (Number(value) <= 0) {
          setErrors((prev) => ({
            ...prev,
            tripDistance: "Distance must be greater than 0",
          }));
        } else {
          setErrors((prev) => ({ ...prev, tripDistance: "" }));
        }
        break;
      case "fuelEfficiency":
        setFuelEfficiency(value.toString());
        if (Number(value) <= 0) {
          setErrors((prev) => ({
            ...prev,
            fuelEfficiency: "Efficiency must be greater than 0",
          }));
        } else {
          setErrors((prev) => ({ ...prev, fuelEfficiency: "" }));
        }
        break;
      case "fuelPrice":
        setFuelPrice(value.toString());
        if (Number(value) <= 0) {
          setErrors((prev) => ({
            ...prev,
            fuelPrice: "Price must be greater than 0",
          }));
        } else {
          setErrors((prev) => ({ ...prev, fuelPrice: "" }));
        }
        break;
      case "tripDistanceUnit":
        setTripDistanceUnit(value.toString());
        break;
      case "efficiencyUnit":
        setEfficiencyUnit(value.toString());
        break;
    }

    // Calculate trip cost if all values are valid
    const distanceVal =
      field === "tripDistance" ? Number(value) : Number(tripDistance);
    const efficiencyVal =
      field === "fuelEfficiency" ? Number(value) : Number(fuelEfficiency);
    const priceVal = field === "fuelPrice" ? Number(value) : Number(fuelPrice);
    const distanceUnitVal =
      field === "tripDistanceUnit" ? value.toString() : tripDistanceUnit;
    const efficiencyUnitVal =
      field === "efficiencyUnit" ? value.toString() : efficiencyUnit;

    if (distanceVal > 0 && efficiencyVal > 0 && priceVal > 0) {
      // Convert to standard units for calculation
      let standardDistance = distanceVal;
      if (distanceUnitVal === "kilometers") {
        standardDistance = distanceVal * 0.621371; // km to miles
      }

      let standardEfficiency = efficiencyVal;
      // For L/100km, convert to MPG
      if (efficiencyUnitVal === "l/100km") {
        standardEfficiency = 235.214 / efficiencyVal; // L/100km to MPG
      }

      // Calculate trip cost
      const gallonsNeeded = standardDistance / standardEfficiency;
      const cost = gallonsNeeded * priceVal;

      setTripCostResult(cost.toFixed(2));
    } else {
      setTripCostResult("");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">Fuel Calculator</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs
          defaultValue="mpg"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="mpg">Fuel Efficiency</TabsTrigger>
            <TabsTrigger value="trip-cost">Trip Cost</TabsTrigger>
          </TabsList>

          <CardContent className="pt-6">
            {/* Fuel Efficiency Tab */}
            <TabsContent value="mpg" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="distance">Distance</Label>
                  <div className="flex space-x-2">
                    <div className="flex-1">
                      <Input
                        id="distance"
                        type="number"
                        placeholder="Enter distance"
                        min="0"
                        step="0.1"
                        value={distance}
                        onChange={(e) =>
                          handleMpgChange("distance", e.target.value)
                        }
                      />
                      {errors.distance && (
                        <p className="text-sm text-red-500">
                          {errors.distance}
                        </p>
                      )}
                    </div>
                    <Select
                      value={distanceUnit}
                      onValueChange={(value) =>
                        handleMpgChange("distanceUnit", value)
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="miles">Miles</SelectItem>
                        <SelectItem value="kilometers">Kilometers</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fuel">Fuel Used</Label>
                  <div className="flex space-x-2">
                    <div className="flex-1">
                      <Input
                        id="fuel"
                        type="number"
                        placeholder="Enter fuel amount"
                        min="0"
                        step="0.1"
                        value={fuel}
                        onChange={(e) =>
                          handleMpgChange("fuel", e.target.value)
                        }
                      />
                      {errors.fuel && (
                        <p className="text-sm text-red-500">{errors.fuel}</p>
                      )}
                    </div>
                    <Select
                      value={fuelUnit}
                      onValueChange={(value) =>
                        handleMpgChange("fuelUnit", value)
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gallons">Gallons</SelectItem>
                        <SelectItem value="liters">Liters</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={handleClear}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Clear
                </Button>
              </div>

              {mpgResult && (
                <div className="pt-6">
                  <div className="bg-muted rounded-lg p-6 text-center">
                    <p className="text-sm text-muted-foreground mb-1">
                      Fuel Efficiency
                    </p>
                    <p className="text-3xl font-semibold">
                      {mpgResult} {mpgLabel}
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
                    <div className="flex-1">
                      <Input
                        id="trip-distance"
                        type="number"
                        placeholder="Enter distance"
                        min="0"
                        step="0.1"
                        value={tripDistance}
                        onChange={(e) =>
                          handleTripCostChange("tripDistance", e.target.value)
                        }
                      />
                      {errors.tripDistance && (
                        <p className="text-sm text-red-500">
                          {errors.tripDistance}
                        </p>
                      )}
                    </div>
                    <Select
                      value={tripDistanceUnit}
                      onValueChange={(value) =>
                        handleTripCostChange("tripDistanceUnit", value)
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="miles">Miles</SelectItem>
                        <SelectItem value="kilometers">Kilometers</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fuel-efficiency">Fuel Efficiency</Label>
                  <div className="flex space-x-2">
                    <div className="flex-1">
                      <Input
                        id="fuel-efficiency"
                        type="number"
                        placeholder="Enter fuel efficiency"
                        min="0"
                        step="0.1"
                        value={fuelEfficiency}
                        onChange={(e) =>
                          handleTripCostChange("fuelEfficiency", e.target.value)
                        }
                      />
                      {errors.fuelEfficiency && (
                        <p className="text-sm text-red-500">
                          {errors.fuelEfficiency}
                        </p>
                      )}
                    </div>
                    <Select
                      value={efficiencyUnit}
                      onValueChange={(value) =>
                        handleTripCostChange("efficiencyUnit", value)
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mpg">MPG</SelectItem>
                        <SelectItem value="l/100km">L/100km</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fuel-price">
                  Fuel Price (per gallon/liter)
                </Label>
                <Input
                  id="fuel-price"
                  type="number"
                  placeholder="Enter fuel price"
                  min="0"
                  step="0.01"
                  value={fuelPrice}
                  onChange={(e) =>
                    handleTripCostChange("fuelPrice", e.target.value)
                  }
                />
                {errors.fuelPrice && (
                  <p className="text-sm text-red-500">{errors.fuelPrice}</p>
                )}
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={handleClear}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Clear
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
                <strong>Trip Cost</strong> - Estimate the cost of a trip based
                on distance, fuel efficiency, and fuel price
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
      </CardContent>
    </Card>
  );
};

export default FuelCalculator;
