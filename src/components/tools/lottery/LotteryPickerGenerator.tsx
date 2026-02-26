import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import {
  Ticket,
  RefreshCw,
  Save,
  Share2,
  ArrowRight,
  HelpCircle,
  Flame,
  ClockIcon,
  Settings,
  Dices,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Lottery Shared Components
import { LotteryBall, NumberGrid, FrequencyChart } from "./shared";

// Lottery Types and Utils
import {
  LotteryConfig,
  LotteryDraw,
  SavedNumberSet,
  NumberFrequency,
} from "./shared/LotteryTypes";

import {
  LOTTERY_CONFIGS,
  getLotteryConfigList,
} from "./shared/LotteryConfigurations";

import {
  generateRandomNumbers,
  generateStrategyNumbers,
} from "./shared/LotteryUtils";

// Add import for demo data
import {
  getLotteryDemoData,
  getLotteryDemoDataSync,
  calculateFrequencyFromDraws,
} from "./shared/LotteryDemoData";

const MOCK_FREQUENCY_DATA: NumberFrequency[] = Array.from(
  { length: 50 },
  (_, i) => ({
    number: i + 1,
    frequency: Math.floor(Math.random() * 40) + 1,
    isHot: Math.random() > 0.8,
    isCold: Math.random() > 0.8 && Math.random() < 0.4,
    isOverdue: Math.random() > 0.8,
  })
);

const LotteryPickerGenerator: React.FC = () => {
  const [activeTab, setActiveTab] = useState("generator");

  // These are kept for data structure compatibility but aren't currently used in the UI
  const [frequencyData] = useState<NumberFrequency[]>(MOCK_FREQUENCY_DATA);

  // Add state for hot/cold/overdue numbers
  const [hotNumbers, setHotNumbers] = useState<number[]>([]);
  const [coldNumbers, setColdNumbers] = useState<number[]>([]);
  const [overdueNumbers, setOverdueNumbers] = useState<number[]>([]);

  // Configure lottery settings
  const [selectedConfig, setSelectedConfig] = useState<string>("powerball");
  const [customConfig, setCustomConfig] = useState<LotteryConfig>({
    name: "Custom",
    mainNumbers: {
      count: 5,
      min: 1,
      max: 50,
    },
  });
  const [isCustom, setIsCustom] = useState<boolean>(false);

  // Remove only truly unused state variables
  // const [frequency, setFrequency] = useState<"count" | "percentage">("count");
  // const [isLoading, setIsLoading] = useState<boolean>(false);
  // const [bonusHotNumbers, setBonusHotNumbers] = useState<number[]>([]);
  // const [bonusColdNumbers, setBonusColdNumbers] = useState<number[]>([]);
  // const [bonusOverdueNumbers, setBonusOverdueNumbers] = useState<number[]>([]);

  const [mainNumbers, setMainNumbers] = useState<number[]>([]);
  const [bonusNumbers, setBonusNumbers] = useState<number[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [usesStrategy, setUsesStrategy] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState<
    "random" | "balanced" | "hot-cold" | "pattern"
  >("random");
  const [use3D, setUse3D] = useState(false);

  const [savedSets, setSavedSets] = useState<SavedNumberSet[]>([]);

  // Load saved numbers from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("lottery-saved-numbers");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setSavedSets(
            parsed.map((set) => ({
              ...set,
              date: new Date(set.date),
            }))
          );
        }
      } catch (e) {
        console.error("Failed to parse saved lottery numbers", e);
      }
    }
  }, []);

  // Save to localStorage when savedSets changes
  useEffect(() => {
    if (savedSets.length > 0) {
      localStorage.setItem("lottery-saved-numbers", JSON.stringify(savedSets));
    }
  }, [savedSets]);

  // Handle confetti effect
  useEffect(() => {
    if (showConfetti) {
      const end = Date.now() + 1000;
      const colors = ["#bb0000", "#ffffff"];

      (function frame() {
        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors,
        });
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        } else {
          setShowConfetti(false);
        }
      })();
    }
  }, [showConfetti]);

  // Update frequency data when lottery type changes
  useEffect(() => {
    const config = isCustom ? customConfig : LOTTERY_CONFIGS[selectedConfig];

    // Generate random hot/cold/overdue numbers
    generateHotColdNumbers(config);
  }, [selectedConfig, isCustom, selectedStrategy]);

  // Update the useEffect for hot & cold analysis
  useEffect(() => {
    // Skip if not using hot & cold or balanced strategy
    if (selectedStrategy !== "hot-cold" && selectedStrategy !== "balanced")
      return;

    const fetchAnalysisData = async () => {
      try {
        // Make sure we have a valid config
        if (!selectedConfig || !LOTTERY_CONFIGS[selectedConfig]) {
          console.error(`Invalid lottery configuration: ${selectedConfig}`);
          return;
        }

        // Get the configuration
        const config = LOTTERY_CONFIGS[selectedConfig];

        // Start with demo data for immediate display
        const initialData = getLotteryDemoDataSync(selectedConfig);

        // Generate hot and cold numbers based on data
        if (initialData.length > 0) {
          generateHotColdFromData(initialData, config);
        } else {
          // Fall back to generated numbers if no data
          generateHotColdNumbers(config);
        }

        // Try to fetch real data
        try {
          // First await the promise
          const realData = await getLotteryDemoData(selectedConfig);

          // Then check the result
          if (realData && realData.length > 0) {
            // Use real data for analysis
            generateHotColdFromData(realData, config);
          } else {
            // Use generated numbers if no data
            generateHotColdNumbers(config);
          }
        } catch (fetchError) {
          console.error("Error fetching lottery data:", fetchError);
        }
      } catch (error) {
        console.error("Error loading lottery data for analysis:", error);
      }
    };

    fetchAnalysisData();
  }, [selectedConfig, selectedStrategy]);

  // Generate hot and cold numbers from lottery data
  const generateHotColdFromData = (
    drawsData: LotteryDraw[],
    config: LotteryConfig
  ) => {
    if (!config || !config.mainNumbers) {
      console.error("Invalid configuration for hot and cold analysis");
      return;
    }

    // Calculate main number frequency
    const mainFreq = calculateFrequencyFromDraws(
      drawsData,
      config.mainNumbers.min,
      config.mainNumbers.max,
      false
    );

    // Update hot, cold, and overdue numbers
    setHotNumbers(mainFreq.filter((n) => n.isHot).map((n) => n.number));
    setColdNumbers(mainFreq.filter((n) => n.isCold).map((n) => n.number));
    setOverdueNumbers(mainFreq.filter((n) => n.isOverdue).map((n) => n.number));

    // Calculate bonus number frequency if applicable
    if (config.bonusNumbers) {
      // We're not using the bonus frequency data anymore
      // const bonusFreq = calculateFrequencyFromDraws(
      //   drawsData,
      //   config.bonusNumbers.min,
      //   config.bonusNumbers.max,
      //   true
      // );
    }
  };

  // Updated version that's actually used in the component
  const generateHotColdNumbers = (config: LotteryConfig) => {
    // Generate random sets for demo purposes
    const mainCounts = config.mainNumbers.max - config.mainNumbers.min + 1;

    // Create 20% hot numbers
    const hotCount = Math.max(3, Math.floor(mainCounts * 0.2));
    const hotNumbers: number[] = [];

    while (hotNumbers.length < hotCount) {
      const num =
        Math.floor(Math.random() * mainCounts) + config.mainNumbers.min;
      if (!hotNumbers.includes(num)) {
        hotNumbers.push(num);
      }
    }

    // Create 20% cold numbers (that aren't hot)
    const coldCount = Math.max(3, Math.floor(mainCounts * 0.2));
    const coldNumbers: number[] = [];

    while (coldNumbers.length < coldCount) {
      const num =
        Math.floor(Math.random() * mainCounts) + config.mainNumbers.min;
      if (!hotNumbers.includes(num) && !coldNumbers.includes(num)) {
        coldNumbers.push(num);
      }
    }

    // Create 10% overdue numbers (that aren't hot or cold)
    const overdueCount = Math.max(2, Math.floor(mainCounts * 0.1));
    const overdueNumbers: number[] = [];

    while (overdueNumbers.length < overdueCount) {
      const num =
        Math.floor(Math.random() * mainCounts) + config.mainNumbers.min;
      if (
        !hotNumbers.includes(num) &&
        !coldNumbers.includes(num) &&
        !overdueNumbers.includes(num)
      ) {
        overdueNumbers.push(num);
      }
    }

    setHotNumbers(hotNumbers);
    setColdNumbers(coldNumbers);
    setOverdueNumbers(overdueNumbers);

    // If we have bonus numbers, do the same for them
    if (config.bonusNumbers) {
      const bonusCounts = config.bonusNumbers.max - config.bonusNumbers.min + 1;

      // Create hot bonus numbers
      const hotBonusCount = Math.max(1, Math.floor(bonusCounts * 0.2));
      const hotBonusNumbers: number[] = [];

      while (hotBonusNumbers.length < hotBonusCount) {
        const num =
          Math.floor(Math.random() * bonusCounts) + config.bonusNumbers.min;
        if (!hotBonusNumbers.includes(num)) {
          hotBonusNumbers.push(num);
        }
      }

      // Create cold bonus numbers
      const coldBonusCount = Math.max(1, Math.floor(bonusCounts * 0.2));
      const coldBonusNumbers: number[] = [];

      while (coldBonusNumbers.length < coldBonusCount) {
        const num =
          Math.floor(Math.random() * bonusCounts) + config.bonusNumbers.min;
        if (!hotBonusNumbers.includes(num) && !coldBonusNumbers.includes(num)) {
          coldBonusNumbers.push(num);
        }
      }

      // Create overdue bonus numbers
      const overdueBonusCount = Math.max(1, Math.floor(bonusCounts * 0.1));
      const overdueBonusNumbers: number[] = [];

      while (overdueBonusNumbers.length < overdueBonusCount) {
        const num =
          Math.floor(Math.random() * bonusCounts) + config.bonusNumbers.min;
        if (
          !hotBonusNumbers.includes(num) &&
          !coldBonusNumbers.includes(num) &&
          !overdueBonusNumbers.includes(num)
        ) {
          overdueBonusNumbers.push(num);
        }
      }

      // Store these for strategy generation
      // setBonusHotNumbers(hotBonusNumbers);
      // setBonusColdNumbers(coldBonusNumbers);
      // setBonusOverdueNumbers(overdueBonusNumbers);
    }
  };

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

  const generateNumbers = () => {
    // Start the generation animation
    setIsGenerating(true);
    setMainNumbers([]);
    setBonusNumbers([]);

    // Add a slight delay for the animation effect
    setTimeout(() => {
      const config = isCustom ? customConfig : LOTTERY_CONFIGS[selectedConfig];
      let main: number[] = [];
      let bonus: number[] = [];

      if (usesStrategy && selectedStrategy !== "random") {
        // Use strategy-based generation
        const result = generateStrategyNumbers(
          config,
          selectedStrategy,
          hotNumbers,
          coldNumbers
        );
        main = result.main;
        bonus = result.bonus;
      } else {
        // Use standard random generation
        main = generateRandomNumbers(
          config.mainNumbers.count,
          config.mainNumbers.min,
          config.mainNumbers.max
        );

        // Generate bonus numbers if applicable
        if (config.bonusNumbers) {
          bonus = generateRandomNumbers(
            config.bonusNumbers.count,
            config.bonusNumbers.min,
            config.bonusNumbers.max
          );
        }
      }

      // Set the numbers with a staggered effect
      setMainNumbers(main);

      if (bonus.length > 0) {
        setTimeout(() => {
          setBonusNumbers(bonus);
          setIsGenerating(false);
          setShowConfetti(true);
        }, 300);
      } else {
        setIsGenerating(false);
        setShowConfetti(true);
      }
    }, 500);
  };

  const clearNumbers = () => {
    setMainNumbers([]);
    setBonusNumbers([]);
  };

  const saveCurrentNumbers = () => {
    if (mainNumbers.length === 0) return;

    setSavedSets([
      ...savedSets,
      {
        main: [...mainNumbers],
        bonus: [...bonusNumbers],
        config: selectedConfig,
        date: new Date(),
      },
    ]);
  };

  const deleteSavedSet = (index: number) => {
    const newSets = [...savedSets];
    newSets.splice(index, 1);
    setSavedSets(newSets);
    if (newSets.length === 0) {
      localStorage.removeItem("lottery-saved-numbers");
    }
  };

  const getLotteryDisplayName = () => {
    const config = isCustom ? customConfig : LOTTERY_CONFIGS[selectedConfig];
    return config.name;
  };

  const copyNumbersToClipboard = () => {
    if (mainNumbers.length === 0) return;

    let text = `${getLotteryDisplayName()} Numbers: ${mainNumbers.join(", ")}`;

    if (bonusNumbers.length > 0) {
      text += ` | Bonus: ${bonusNumbers.join(", ")}`;
    }

    navigator.clipboard.writeText(text);
  };

  const renderStrategyInfo = () => {
    switch (selectedStrategy) {
      case "balanced":
        return "Generates a balanced mix of even/odd and high/low numbers";
      case "hot-cold":
        return "Uses frequently drawn numbers (hot) combined with rarely drawn ones (cold)";
      case "pattern":
        return "Creates patterns like consecutive pairs or evenly spaced numbers";
      default:
        return "Completely random number generation";
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center">
          <Dices className="mr-2 h-6 w-6 text-primary" />
          Ultimate Lottery Number Generator
        </CardTitle>
        <CardDescription>
          Generate random numbers for popular lottery games or create your own
          custom formats. Use strategies based on statistical analysis, save
          your favorites, and track your lucky numbers!
        </CardDescription>
      </CardHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="px-6">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger
              value="generator"
              className="flex items-center justify-center"
            >
              <Ticket className="h-4 w-4 mr-2" />
              Generator
            </TabsTrigger>
            <TabsTrigger
              value="stats"
              className="flex items-center justify-center"
            >
              <Flame className="h-4 w-4 mr-2" />
              Hot & Cold
            </TabsTrigger>
            <TabsTrigger
              value="saved"
              className="flex items-center justify-center"
            >
              <Save className="h-4 w-4 mr-2" />
              Saved Numbers
            </TabsTrigger>
            <TabsTrigger
              value="help"
              className="flex items-center justify-center"
            >
              <HelpCircle className="h-4 w-4 mr-2" />
              Tips & Help
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="generator" className="mt-0">
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="lotteryType">Lottery Type</Label>
                <Select
                  value={selectedConfig}
                  onValueChange={handleConfigChange}
                >
                  <SelectTrigger id="lotteryType" className="w-full">
                    <SelectValue placeholder="Select a lottery type" />
                  </SelectTrigger>
                  <SelectContent>
                    {getLotteryConfigList().map(({ id, name }) => (
                      <SelectItem key={id} value={id}>
                        {name}
                      </SelectItem>
                    ))}
                    <SelectItem value="custom">Custom</SelectItem>
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

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasBonusNumbers"
                      checked={!!customConfig.bonusNumbers}
                      onCheckedChange={() => toggleBonusNumbers()}
                    />
                    <Label htmlFor="hasBonusNumbers">
                      Include Bonus Numbers
                    </Label>
                  </div>

                  {customConfig.bonusNumbers && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">
                        Bonus Numbers
                      </h4>
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

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="strategies">
                  <AccordionTrigger className="text-sm font-medium">
                    <Settings className="h-4 w-4 mr-2" />
                    Generation Strategies
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pb-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="useStrategy"
                        checked={usesStrategy}
                        onCheckedChange={(checked) =>
                          setUsesStrategy(checked === true)
                        }
                      />
                      <Label htmlFor="useStrategy">
                        Use strategy instead of pure randomness
                      </Label>
                    </div>

                    {usesStrategy && (
                      <div className="space-y-2 pt-2">
                        <Label htmlFor="strategy">Strategy Type</Label>
                        <Select
                          value={selectedStrategy}
                          onValueChange={(value) =>
                            setSelectedStrategy(
                              value as
                                | "random"
                                | "balanced"
                                | "hot-cold"
                                | "pattern"
                            )
                          }
                          disabled={!usesStrategy}
                        >
                          <SelectTrigger id="strategy">
                            <SelectValue placeholder="Select a strategy" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="random">Random</SelectItem>
                            <SelectItem value="balanced">Balanced</SelectItem>
                            <SelectItem value="hot-cold">Hot & Cold</SelectItem>
                            <SelectItem value="pattern">
                              Pattern-based
                            </SelectItem>
                          </SelectContent>
                        </Select>

                        <p className="text-sm text-muted-foreground mt-2">
                          {renderStrategyInfo()}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center space-x-2 pt-2">
                      <Checkbox
                        id="use3D"
                        checked={use3D}
                        onCheckedChange={(checked) =>
                          setUse3D(checked === true)
                        }
                      />
                      <Label htmlFor="use3D">Use 3D ball animation</Label>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <div className="flex justify-center space-x-4 pt-2">
                <Button
                  onClick={generateNumbers}
                  disabled={isGenerating}
                  className="relative overflow-hidden"
                  size="lg"
                >
                  {isGenerating ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Ticket className="h-4 w-4 mr-2" />
                  )}
                  Generate Lucky Numbers
                  {isGenerating && (
                    <div className="absolute inset-0 bg-primary/10" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={clearNumbers}
                  disabled={
                    mainNumbers.length === 0 && bonusNumbers.length === 0
                  }
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              </div>
            </div>

            {(mainNumbers.length > 0 || bonusNumbers.length > 0) && (
              <div className="space-y-4 pt-4">
                <div className="p-6 border rounded-lg bg-muted/30">
                  <h3 className="font-medium mb-3 text-lg text-center">
                    Your {getLotteryDisplayName()} Numbers
                  </h3>

                  <div className="space-y-6">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2 text-center">
                        Main Numbers:
                      </p>
                      <div className="flex flex-wrap gap-3 justify-center">
                        {mainNumbers.map((number, index) => (
                          <LotteryBall
                            key={index}
                            number={number}
                            size="lg"
                            type="main"
                            isHot={hotNumbers.includes(number)}
                            isCold={coldNumbers.includes(number)}
                            isOverdue={overdueNumbers.includes(number)}
                            animationDelay={index * 0.1}
                            is3D={use3D}
                          />
                        ))}
                      </div>
                    </div>

                    {bonusNumbers.length > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2 text-center">
                          Bonus Numbers:
                        </p>
                        <div className="flex flex-wrap gap-3 justify-center">
                          {bonusNumbers.map((number, index) => (
                            <LotteryBall
                              key={index}
                              number={number}
                              size="lg"
                              type="bonus"
                              animationDelay={
                                index * 0.1 + mainNumbers.length * 0.1
                              }
                              is3D={use3D}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-center space-x-3 mt-6">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={saveCurrentNumbers}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={copyNumbersToClipboard}
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </TabsContent>

        <TabsContent value="stats" className="mt-0">
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-2">
              <h3 className="font-medium text-lg">Hot & Cold Analysis</h3>
              <div className="bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 p-3 rounded-md text-sm mb-4">
                <strong>Note:</strong> This analysis uses simulated lottery data
                for demonstration purposes. The hot and cold numbers shown are
                not based on actual lottery results.
              </div>
              <p className="text-sm text-muted-foreground">
                See which numbers are drawn frequently (hot) or rarely (cold).
                Use this data to inform your number selection.
              </p>
            </div>

            <div className="border rounded-md p-4 bg-muted/10">
              <div className="flex flex-wrap gap-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <span>Hot Numbers</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                  <span>Cold Numbers</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                  <span>Overdue</span>
                </div>
              </div>

              <div className="mt-4 space-y-6">
                <div>
                  <h4 className="text-sm font-medium mb-3">Number Grid</h4>
                  <div className="overflow-x-auto">
                    <NumberGrid data={frequencyData} rows={5} columns={10} />
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-3">Frequency Chart</h4>
                  <FrequencyChart data={frequencyData} height={250} />
                </div>
              </div>
            </div>

            <div className="flex justify-center mt-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => {
                        setUsesStrategy(true);
                        setSelectedStrategy("hot-cold");
                        setActiveTab("generator");
                      }}
                    >
                      <Flame className="h-4 w-4 mr-2" />
                      Use Hot & Cold Strategy
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Generate numbers using hot and cold analysis</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardContent>
        </TabsContent>

        <TabsContent value="saved" className="mt-0">
          <CardContent className="pt-6">
            <h3 className="font-medium text-lg mb-4">
              Your Saved Lucky Numbers
            </h3>

            {savedSets.length === 0 ? (
              <div className="text-center p-6 border rounded-md">
                <p className="text-muted-foreground">
                  You haven't saved any numbers yet
                </p>
                <Button
                  variant="link"
                  onClick={() => setActiveTab("generator")}
                  className="mt-2"
                >
                  Generate some lucky numbers
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {savedSets.map((set, index) => (
                  <div key={index} className="p-4 border rounded-md">
                    <div className="flex justify-between mb-2">
                      <div>
                        <span className="font-medium">
                          {LOTTERY_CONFIGS[set.config]?.name || "Custom"}
                        </span>
                        <span className="text-sm text-muted-foreground ml-2">
                          {set.date.toLocaleDateString()}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteSavedSet(index)}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-2">
                      {set.main.map((number, i) => (
                        <LotteryBall
                          key={i}
                          number={number}
                          size="sm"
                          type="main"
                        />
                      ))}

                      {set.bonus.length > 0 && (
                        <>
                          <div className="flex items-center mx-1">
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          </div>

                          {set.bonus.map((number, i) => (
                            <LotteryBall
                              key={i}
                              number={number}
                              size="sm"
                              type="bonus"
                            />
                          ))}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </TabsContent>

        <TabsContent value="help" className="mt-0">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-lg mb-2">
                  Lottery Game Information
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Select from popular lottery formats or create a custom number
                  range.
                </p>

                <div className="space-y-3">
                  {getLotteryConfigList().map(({ id, name }) => {
                    const config = LOTTERY_CONFIGS[id];
                    return (
                      <div key={id} className="p-3 border rounded-md">
                        <h4 className="font-medium">{name}</h4>
                        <p className="text-sm">
                          Main: {config.mainNumbers.count} numbers from{" "}
                          {config.mainNumbers.min}-{config.mainNumbers.max}
                          {config.bonusNumbers && (
                            <>
                              {" "}
                              | Bonus: {config.bonusNumbers.count} from{" "}
                              {config.bonusNumbers.min}-
                              {config.bonusNumbers.max}
                            </>
                          )}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6">
                <h3 className="font-medium text-lg mb-2">
                  Generation Strategies
                </h3>
                <div className="space-y-3">
                  <div className="p-3 border rounded-md">
                    <div className="flex items-center">
                      <div className="mr-2 p-1 bg-muted rounded-full">
                        <Dices className="h-4 w-4" />
                      </div>
                      <h4 className="font-medium">Random</h4>
                    </div>
                    <p className="text-sm mt-1">
                      Generate truly random numbers with equal probability for
                      each number.
                    </p>
                  </div>

                  <div className="p-3 border rounded-md">
                    <div className="flex items-center">
                      <div className="mr-2 p-1 bg-muted rounded-full">
                        <Settings className="h-4 w-4" />
                      </div>
                      <h4 className="font-medium">Balanced</h4>
                    </div>
                    <p className="text-sm mt-1">
                      Creates a balanced mix of even/odd numbers and high/low
                      numbers.
                    </p>
                  </div>

                  <div className="p-3 border rounded-md">
                    <div className="flex items-center">
                      <div className="mr-2 p-1 bg-muted rounded-full">
                        <Flame className="h-4 w-4" />
                      </div>
                      <h4 className="font-medium">Hot & Cold</h4>
                    </div>
                    <p className="text-sm mt-1">
                      Combines frequently drawn numbers with rarely drawn ones
                      for a balanced approach.
                    </p>
                  </div>

                  <div className="p-3 border rounded-md">
                    <div className="flex items-center">
                      <div className="mr-2 p-1 bg-muted rounded-full">
                        <ClockIcon className="h-4 w-4" />
                      </div>
                      <h4 className="font-medium">Pattern-based</h4>
                    </div>
                    <p className="text-sm mt-1">
                      Creates patterns like consecutive pairs or evenly spaced
                      numbers.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="font-medium text-lg mb-2">Tips</h3>
                <ul className="list-disc pl-5 space-y-2 text-sm">
                  <li>
                    The generator uses a cryptographically strong random number
                    algorithm
                  </li>
                  <li>
                    You can save multiple sets of numbers to compare or track
                  </li>
                  <li>
                    Create custom configurations for any lottery game worldwide
                  </li>
                  <li>
                    Use the Copy button to share your numbers with friends
                  </li>
                  <li>
                    No generation strategy can guarantee a win - lotteries are
                    games of chance
                  </li>
                  <li>
                    Hot and cold numbers are based on historical frequencies,
                    but past results don't guarantee future draws
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </TabsContent>
      </Tabs>

      <CardFooter className="border-t bg-muted/30 px-6 py-4 mt-2 text-sm text-muted-foreground">
        Numbers are generated randomly using JavaScript's secure random
        algorithm. All processing happens in your browser - no data is sent to
        any server.
      </CardFooter>
    </Card>
  );
};

export default LotteryPickerGenerator;
