import { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Ticket, Calculator, ChevronDown, ChevronUp } from "lucide-react";
import { LOTTERY_CONFIGS, LotteryConfig } from "@/utils/lotteryUtils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

interface OddsResult {
  mainNumbersOdds: number;
  bonusNumbersOdds: number;
  totalOdds: number;
  additionalPrizes: OddsCalculation[];
}

interface OddsCalculation {
  description: string;
  odds: number;
  matches: string;
}

export const LotteryOddsCalculator = () => {
  const [selectedConfig, setSelectedConfig] = useState<string>("powerball");
  const [customConfig, setCustomConfig] = useState<LotteryConfig>({
    name: "Custom",
    mainNumbers: {
      count: 5,
      min: 1,
      max: 69,
    },
    bonusNumbers: {
      count: 1,
      min: 1,
      max: 26,
    },
  });
  const [isCustom, setIsCustom] = useState(false);
  const [oddsResult, setOddsResult] = useState<OddsResult | null>(null);
  const [showVisualization, setShowVisualization] = useState(false);

  // Calculate odds whenever configuration changes
  useEffect(() => {
    calculateOdds();
  }, [selectedConfig, customConfig, isCustom]);

  const handleConfigChange = (configKey: string) => {
    setSelectedConfig(configKey);
    setIsCustom(configKey === "custom");
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

  // Calculate combinations: n! / (r! * (n-r)!)
  const calculateCombinations = (n: number, r: number): number => {
    if (r > n) return 0;
    if (r === 0 || r === n) return 1;

    // Use logarithms for large numbers to avoid overflows
    if (n > 100) {
      let result = 0;
      for (let i = n - r + 1; i <= n; i++) {
        result += Math.log(i);
      }
      for (let i = 1; i <= r; i++) {
        result -= Math.log(i);
      }
      return Math.round(Math.exp(result));
    }

    // Direct calculation for smaller numbers
    let result = 1;
    for (let i = 1; i <= r; i++) {
      result *= (n - (i - 1)) / i;
    }
    return Math.round(result);
  };

  const calculateOdds = () => {
    const config = isCustom ? customConfig : LOTTERY_CONFIGS[selectedConfig];

    // Calculate main numbers odds
    const mainTotal = config.mainNumbers.max - config.mainNumbers.min + 1;
    const mainCombinations = calculateCombinations(
      mainTotal,
      config.mainNumbers.count
    );

    // Calculate bonus numbers odds if applicable
    let bonusCombinations = 1;
    if (config.bonusNumbers) {
      const bonusTotal = config.bonusNumbers.max - config.bonusNumbers.min + 1;
      bonusCombinations = calculateCombinations(
        bonusTotal,
        config.bonusNumbers.count
      );
    }

    // Calculate total odds
    const totalOdds = mainCombinations * bonusCombinations;

    // Calculate additional prize tiers
    const additionalPrizes: OddsCalculation[] = [];

    // Only calculate additional prizes for known lottery types
    if (!isCustom) {
      if (selectedConfig === "powerball" || selectedConfig === "megaMillions") {
        // 5 main numbers, 0 bonus
        additionalPrizes.push({
          description: "Match 5 (no Powerball)",
          odds:
            calculateCombinations(5, 5) *
            calculateCombinations(mainTotal - 5, 0) *
            calculateCombinations(bonusCombinations - 1, 1),
          matches: "5 + 0",
        });

        // 4 main numbers, 1 bonus
        additionalPrizes.push({
          description: "Match 4 + Powerball",
          odds:
            calculateCombinations(5, 4) *
            calculateCombinations(mainTotal - 5, 1) *
            calculateCombinations(1, 1),
          matches: "4 + 1",
        });

        // 4 main numbers, 0 bonus
        additionalPrizes.push({
          description: "Match 4 (no Powerball)",
          odds:
            calculateCombinations(5, 4) *
            calculateCombinations(mainTotal - 5, 1) *
            calculateCombinations(bonusCombinations - 1, 1),
          matches: "4 + 0",
        });

        // 3 main numbers, 1 bonus
        additionalPrizes.push({
          description: "Match 3 + Powerball",
          odds:
            calculateCombinations(5, 3) *
            calculateCombinations(mainTotal - 5, 2) *
            calculateCombinations(1, 1),
          matches: "3 + 1",
        });

        // 3 main numbers, 0 bonus
        additionalPrizes.push({
          description: "Match 3 (no Powerball)",
          odds:
            calculateCombinations(5, 3) *
            calculateCombinations(mainTotal - 5, 2) *
            calculateCombinations(bonusCombinations - 1, 1),
          matches: "3 + 0",
        });

        // 2 main numbers, 1 bonus
        additionalPrizes.push({
          description: "Match 2 + Powerball",
          odds:
            calculateCombinations(5, 2) *
            calculateCombinations(mainTotal - 5, 3) *
            calculateCombinations(1, 1),
          matches: "2 + 1",
        });

        // 1 main numbers, 1 bonus
        additionalPrizes.push({
          description: "Match 1 + Powerball",
          odds:
            calculateCombinations(5, 1) *
            calculateCombinations(mainTotal - 5, 4) *
            calculateCombinations(1, 1),
          matches: "1 + 1",
        });

        // 0 main numbers, 1 bonus
        additionalPrizes.push({
          description: "Match Powerball only",
          odds:
            calculateCombinations(5, 0) *
            calculateCombinations(mainTotal - 5, 5) *
            calculateCombinations(1, 1),
          matches: "0 + 1",
        });
      }
    }

    setOddsResult({
      mainNumbersOdds: mainCombinations,
      bonusNumbersOdds: bonusCombinations,
      totalOdds,
      additionalPrizes,
    });
  };

  const formatOdds = (odds: number): string => {
    if (odds === 0) return "N/A";

    if (odds < 1000) {
      return `1 in ${odds.toLocaleString()}`;
    } else {
      return `1 in ${odds.toLocaleString()}`;
    }
  };

  const chartData = useMemo(() => {
    if (!oddsResult) return [];

    // Create data for the pie chart - just for visual representation, not mathematically precise
    return [
      { name: "Win", value: 1, color: "#10b981" },
      { name: "Lose", value: oddsResult.totalOdds - 1, color: "#ef4444" },
    ];
  }, [oddsResult]);

  const formatLargeNumber = (value: number): string => {
    if (value >= 1e9) {
      return `${(value / 1e9).toFixed(2)} billion`;
    } else if (value >= 1e6) {
      return `${(value / 1e6).toFixed(2)} million`;
    } else if (value >= 1e3) {
      return `${(value / 1e3).toFixed(2)} thousand`;
    }
    return value.toString();
  };

  const getComparison = (odds: number): string => {
    if (odds >= 1e8) {
      return "Being struck by lightning multiple times in your lifetime";
    } else if (odds >= 1e7) {
      return "Being struck by lightning in your lifetime";
    } else if (odds >= 1e6) {
      return "Being dealt a royal flush in poker";
    } else if (odds >= 1e5) {
      return "Being in a plane crash";
    } else if (odds >= 1e4) {
      return "Being born with extra fingers or toes";
    } else if (odds >= 1e3) {
      return "Finding a four-leaf clover on your first try";
    } else {
      return "Flipping a coin and getting 10 heads in a row";
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl flex items-center">
          <Calculator className="mr-2 h-6 w-6 text-primary" />
          Lottery Odds Calculator
        </CardTitle>
        <CardDescription>
          Calculate the mathematical probability of winning various lottery
          games
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
            <div className="space-y-4 p-4 border rounded-md bg-muted/30">
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
                      value={customConfig.bonusNumbers?.count || 1}
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
                      value={customConfig.bonusNumbers?.min || 1}
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
                      value={customConfig.bonusNumbers?.max || 10}
                      onChange={(e) =>
                        handleCustomConfigChange(
                          "max",
                          parseInt(e.target.value),
                          "bonus"
                        )
                      }
                      min={
                        (customConfig.bonusNumbers?.min || 1) +
                        (customConfig.bonusNumbers?.count || 1) -
                        1
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {oddsResult && (
            <div className="space-y-4 mt-6">
              <div className="p-4 border rounded-md bg-muted/30">
                <h3 className="font-medium text-center text-lg mb-4">
                  Odds of Winning{" "}
                  {isCustom
                    ? customConfig.name
                    : LOTTERY_CONFIGS[selectedConfig].name}
                </h3>

                <div className="mb-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-1">
                      {formatOdds(oddsResult.totalOdds)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      That's similar to {getComparison(oddsResult.totalOdds)}
                    </div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={() => setShowVisualization(!showVisualization)}
                  className="w-full"
                >
                  {showVisualization ? (
                    <>
                      <ChevronUp className="h-4 w-4 mr-2" />
                      Hide visualization
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4 mr-2" />
                      Show visualization
                    </>
                  )}
                </Button>

                {showVisualization && (
                  <div className="mt-4 h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          innerRadius={40}
                          fill="#8884d8"
                          dataKey="value"
                          label={(entry) => {
                            // Only show "Win" label, "Lose" would be too small
                            if (entry.name === "Win") return entry.name;
                            return "";
                          }}
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number, name: string) => {
                            if (name === "Win") return ["1 ticket", "Win"];
                            return [formatLargeNumber(value), "Lose"];
                          }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                    <p className="text-xs text-center mt-2 text-muted-foreground">
                      Note: This visualization is not to scale due to the
                      extreme odds. The win segment is greatly exaggerated for
                      visibility.
                    </p>
                  </div>
                )}
              </div>

              {oddsResult.additionalPrizes.length > 0 && (
                <Accordion type="single" collapsible className="mt-4">
                  <AccordionItem value="item-1">
                    <AccordionTrigger className="hover:no-underline">
                      <span className="text-sm font-medium">
                        Other Prize Tiers & Odds
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2 text-sm font-medium bg-muted/30 p-2 rounded-md">
                          <div>Prize Tier</div>
                          <div>Odds</div>
                        </div>
                        {oddsResult.additionalPrizes.map((prize, index) => (
                          <div
                            key={index}
                            className="grid grid-cols-2 gap-2 text-sm border-b pb-2"
                          >
                            <div>{prize.description}</div>
                            <div>{formatOdds(prize.odds)}</div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}
            </div>
          )}
        </div>

        <div className="p-4 rounded-md border mt-6 bg-muted/10">
          <div className="flex items-center gap-2 mb-2">
            <Ticket className="h-4 w-4 text-primary" />
            <h3 className="font-medium">About Lottery Odds</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            This calculator shows the mathematical probability of winning a
            lottery game. Odds are calculated using combinatorial mathematics.
            All lottery drawings are completely random, and each number
            combination has exactly the same chance of winning.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default LotteryOddsCalculator;
