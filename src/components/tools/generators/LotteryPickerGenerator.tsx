import { useState } from "react";
import {
  generateRandomNumbers,
  LOTTERY_CONFIGS,
  LotteryConfig,
} from "../../../utils/lotteryUtils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RefreshCw, Ticket, HelpCircle } from "lucide-react";

const LotteryPickerGenerator = () => {
  const [selectedConfig, setSelectedConfig] = useState<string>("powerball");
  const [customConfig, setCustomConfig] = useState<LotteryConfig>({
    name: "Custom",
    mainNumbers: {
      count: 5,
      min: 1,
      max: 50,
    },
  });
  const [mainNumbers, setMainNumbers] = useState<number[]>([]);
  const [bonusNumbers, setBonusNumbers] = useState<number[]>([]);
  const [isCustom, setIsCustom] = useState(false);

  const handleConfigChange = (configKey: string) => {
    setSelectedConfig(configKey);
    setIsCustom(configKey === "custom");
    // Clear previously generated numbers
    setMainNumbers([]);
    setBonusNumbers([]);
  };

  const handleCustomConfigChange = (
    field: "count" | "min" | "max",
    value: number,
    numberType: "main" | "bonus"
  ) => {
    if (numberType === "main") {
      setCustomConfig({
        ...customConfig,
        mainNumbers: {
          ...customConfig.mainNumbers,
          [field]: value,
        },
      });
    } else {
      setCustomConfig({
        ...customConfig,
        bonusNumbers: {
          ...(customConfig.bonusNumbers || { count: 1, min: 1, max: 10 }),
          [field]: value,
        },
      });
    }
  };

  const generateNumbers = () => {
    const config = isCustom ? customConfig : LOTTERY_CONFIGS[selectedConfig];

    // Generate main numbers
    const main = generateRandomNumbers(
      config.mainNumbers.count,
      config.mainNumbers.min,
      config.mainNumbers.max
    );
    setMainNumbers(main);

    // Generate bonus numbers if applicable
    if (config.bonusNumbers) {
      const bonus = generateRandomNumbers(
        config.bonusNumbers.count,
        config.bonusNumbers.min,
        config.bonusNumbers.max
      );
      setBonusNumbers(bonus);
    } else {
      setBonusNumbers([]);
    }
  };

  const toggleBonusNumbers = () => {
    if (customConfig.bonusNumbers) {
      // Create a new object without the bonusNumbers property
      const newConfig = { ...customConfig };
      delete newConfig.bonusNumbers;
      setCustomConfig(newConfig);
    } else {
      setCustomConfig({
        ...customConfig,
        bonusNumbers: {
          count: 1,
          min: 1,
          max: 10,
        },
      });
    }
  };

  const clearNumbers = () => {
    setMainNumbers([]);
    setBonusNumbers([]);
  };

  const getLotteryDisplayName = () => {
    const config = isCustom ? customConfig : LOTTERY_CONFIGS[selectedConfig];
    return config.name;
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Lottery Number Generator</CardTitle>
        <CardDescription>
          Generate random numbers for various lottery games or create your own
          custom configuration
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="lotteryType">Lottery Type</Label>
            <Select value={selectedConfig} onValueChange={handleConfigChange}>
              <SelectTrigger id="lotteryType">
                <SelectValue placeholder="Select a lottery type" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(LOTTERY_CONFIGS).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isCustom && (
            <div className="space-y-4 p-4 border rounded-md">
              <h3 className="font-medium">Custom Configuration</h3>

              <div>
                <h4 className="text-sm font-medium mb-2">Main Numbers</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="main-count" className="text-xs">
                      Count
                    </Label>
                    <Input
                      id="main-count"
                      type="number"
                      value={customConfig.mainNumbers.count}
                      onChange={(e) =>
                        handleCustomConfigChange(
                          "count",
                          parseInt(e.target.value),
                          "main"
                        )
                      }
                      min="1"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="main-min" className="text-xs">
                      Min
                    </Label>
                    <Input
                      id="main-min"
                      type="number"
                      value={customConfig.mainNumbers.min}
                      onChange={(e) =>
                        handleCustomConfigChange(
                          "min",
                          parseInt(e.target.value),
                          "main"
                        )
                      }
                      min="1"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="main-max" className="text-xs">
                      Max
                    </Label>
                    <Input
                      id="main-max"
                      type="number"
                      value={customConfig.mainNumbers.max}
                      onChange={(e) =>
                        handleCustomConfigChange(
                          "max",
                          parseInt(e.target.value),
                          "main"
                        )
                      }
                      min={
                        customConfig.mainNumbers.min +
                        customConfig.mainNumbers.count -
                        1
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasBonusNumbers"
                  checked={!!customConfig.bonusNumbers}
                  onCheckedChange={() => toggleBonusNumbers()}
                />
                <Label htmlFor="hasBonusNumbers">Include Bonus Numbers</Label>
              </div>

              {customConfig.bonusNumbers && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Bonus Numbers</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="bonus-count" className="text-xs">
                        Count
                      </Label>
                      <Input
                        id="bonus-count"
                        type="number"
                        value={customConfig.bonusNumbers.count}
                        onChange={(e) =>
                          handleCustomConfigChange(
                            "count",
                            parseInt(e.target.value),
                            "bonus"
                          )
                        }
                        min="1"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="bonus-min" className="text-xs">
                        Min
                      </Label>
                      <Input
                        id="bonus-min"
                        type="number"
                        value={customConfig.bonusNumbers.min}
                        onChange={(e) =>
                          handleCustomConfigChange(
                            "min",
                            parseInt(e.target.value),
                            "bonus"
                          )
                        }
                        min="1"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="bonus-max" className="text-xs">
                        Max
                      </Label>
                      <Input
                        id="bonus-max"
                        type="number"
                        value={customConfig.bonusNumbers.max}
                        onChange={(e) =>
                          handleCustomConfigChange(
                            "max",
                            parseInt(e.target.value),
                            "bonus"
                          )
                        }
                        min={
                          customConfig.bonusNumbers.min +
                          customConfig.bonusNumbers.count -
                          1
                        }
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-center space-x-4 pt-2">
            <Button onClick={generateNumbers}>
              <Ticket className="h-4 w-4 mr-2" />
              Generate Numbers
            </Button>
            <Button
              variant="outline"
              onClick={clearNumbers}
              disabled={mainNumbers.length === 0 && bonusNumbers.length === 0}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        </div>

        {(mainNumbers.length > 0 || bonusNumbers.length > 0) && (
          <div className="space-y-4 pt-4">
            <div>
              <h3 className="font-medium mb-3">
                Your {getLotteryDisplayName()} Numbers
              </h3>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Main Numbers:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {mainNumbers.map((number, index) => (
                      <div
                        key={index}
                        className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary"
                      >
                        {number}
                      </div>
                    ))}
                  </div>
                </div>

                {bonusNumbers.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Bonus Numbers:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {bonusNumbers.map((number, index) => (
                        <div
                          key={index}
                          className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center font-bold text-amber-800"
                        >
                          {number}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="bg-muted p-4 rounded-lg mt-4">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            <h3 className="font-medium">About Lottery Numbers</h3>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            This generator creates random numbers based on the rules of various
            lottery games. Remember that all lottery drawings are completely
            random, and no system can predict winning numbers. Play responsibly
            and for entertainment purposes only.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default LotteryPickerGenerator;
