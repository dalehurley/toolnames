import React, { useState, useEffect } from "react";
import {
  TicketIcon,
  Rocket,
  Download,
  Plus,
  Minus,
  Info,
  Pencil,
} from "lucide-react";

// UI Components
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Lottery Shared Components
import { LotteryBall, NumberGrid } from "./shared";

// Lottery Types and Utils
import { LotteryConfig } from "./shared/LotteryTypes";

import {
  LOTTERY_CONFIGS,
  getLotteryConfigList,
  calculateCombinations,
} from "./shared/LotteryConfigurations";

import { generateRandomNumbers } from "./shared/LotteryUtils";

import { generateWheelingSystem } from "./shared/LotteryStatistics";

// Wheel types and descriptions
const wheelTypes = [
  {
    id: "full",
    name: "Full Wheel",
    description:
      "Creates all possible combinations of your selected numbers. Guarantees a jackpot if all your numbers contain the winning numbers.",
    maxNumbers: 15, // Limiting to prevent too many combinations
  },
  {
    id: "abbreviated",
    name: "Abbreviated Wheel",
    description:
      "Creates a reduced set of combinations that still provides good coverage. More cost-effective than full wheels.",
    maxNumbers: 20,
  },
  {
    id: "key",
    name: "Key Number Wheel",
    description:
      'Allows you to specify "key" numbers that appear in every combination, along with rotating secondary numbers.',
    maxNumbers: 20,
  },
];

const guaranteeDescriptions = {
  full: "Match all winning numbers and win the jackpot.",
  abbreviated:
    "Match at least N-1 numbers (where N is the draw size) to win a prize.",
  key: "Match all key numbers plus some secondary numbers to win a prize.",
};

const LotteryWheelGenerator: React.FC = () => {
  const [selectedConfig, setSelectedConfig] = useState<string>("powerball");
  const [lotteryConfig, setLotteryConfig] = useState<LotteryConfig>(
    LOTTERY_CONFIGS["powerball"]
  );
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [keyNumbers, setKeyNumbers] = useState<number[]>([]);
  const [wheelType, setWheelType] = useState<"full" | "abbreviated" | "key">(
    "abbreviated"
  );
  const [drawSize, setDrawSize] = useState<number>(5);
  const [combinations, setCombinations] = useState<number[][]>([]);
  const [maxCombinations, setMaxCombinations] = useState<number>(50);
  const [showWarning, setShowWarning] = useState<boolean>(false);
  const [totalCombinations, setTotalCombinations] = useState<number>(0);

  // Update lottery config when selection changes
  useEffect(() => {
    setLotteryConfig(LOTTERY_CONFIGS[selectedConfig]);
    // Reset selections when lottery type changes
    setSelectedNumbers([]);
    setKeyNumbers([]);
    setDrawSize(LOTTERY_CONFIGS[selectedConfig].mainNumbers.count);
  }, [selectedConfig]);

  // Calculate total possible combinations
  useEffect(() => {
    if (selectedNumbers.length === 0) return;

    let total = 0;

    if (wheelType === "full") {
      total = calculateCombinations(selectedNumbers.length, drawSize);
    } else if (wheelType === "abbreviated") {
      // Abbreviated wheels typically generate about 20% of the total combinations
      total = Math.ceil(
        calculateCombinations(selectedNumbers.length, drawSize) * 0.2
      );
    } else if (wheelType === "key") {
      if (keyNumbers.length >= drawSize) {
        total = 1; // Just one combination (all key numbers)
      } else {
        // Calculate combinations of non-key numbers for remaining spots
        const nonKeyCount = selectedNumbers.filter(
          (n) => !keyNumbers.includes(n)
        ).length;
        const remainingSpots = drawSize - keyNumbers.length;
        total = calculateCombinations(nonKeyCount, remainingSpots);
      }
    }

    setTotalCombinations(total);

    // Show warning if too many combinations
    if (total > 200) {
      setShowWarning(true);
    } else {
      setShowWarning(false);
    }
  }, [selectedNumbers, keyNumbers, wheelType, drawSize]);

  // Handle key number selection/deselection
  const toggleKeyNumber = (number: number) => {
    if (!selectedNumbers.includes(number)) return;

    if (keyNumbers.includes(number)) {
      // Remove from key numbers
      setKeyNumbers(keyNumbers.filter((n) => n !== number));
    } else {
      // Add to key numbers
      setKeyNumbers([...keyNumbers, number].sort((a, b) => a - b));
    }
  };

  // Generate random numbers
  const addRandomNumbers = () => {
    const maxToSelect =
      wheelTypes.find((w) => w.id === wheelType)?.maxNumbers || 10;
    const countToAdd = Math.min(maxToSelect - selectedNumbers.length, 5);

    if (countToAdd <= 0) return;

    const min = lotteryConfig.mainNumbers.min;
    const max = lotteryConfig.mainNumbers.max;

    // Generate random numbers not already selected
    const newNumbers = generateRandomNumbers(
      countToAdd,
      min,
      max,
      selectedNumbers // Exclude already selected numbers
    );

    setSelectedNumbers(
      [...selectedNumbers, ...newNumbers].sort((a, b) => a - b)
    );
  };

  // Clear all selections
  const clearSelections = () => {
    setSelectedNumbers([]);
    setKeyNumbers([]);
  };

  // Generate wheel combinations
  const generateWheel = () => {
    if (selectedNumbers.length < drawSize) return;

    const generatedCombinations = generateWheelingSystem(
      selectedNumbers,
      wheelType,
      drawSize,
      keyNumbers
    );

    // Limit combinations if too many
    if (generatedCombinations.length > maxCombinations) {
      setCombinations(generatedCombinations.slice(0, maxCombinations));
    } else {
      setCombinations(generatedCombinations);
    }
  };

  // Export wheel as CSV
  const exportWheel = () => {
    if (combinations.length === 0) return;

    const headers = Array.from(
      { length: drawSize },
      (_, i) => `Number ${i + 1}`
    ).join(",");

    const csvContent =
      `${headers}\n` + combinations.map((combo) => combo.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `lottery-wheel-${selectedConfig}-${wheelType}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export as printable tickets
  const exportPrintable = () => {
    if (combinations.length === 0) return;

    // Create a new window for printing
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const lotteryName = LOTTERY_CONFIGS[selectedConfig].name;
    const date = new Date().toLocaleDateString();

    // Create HTML content
    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Lottery Wheel - ${lotteryName}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { font-size: 18px; margin-bottom: 10px; }
          .info { font-size: 12px; margin-bottom: 20px; color: #666; }
          .ticket { 
            border: 1px solid #ccc; 
            padding: 10px; 
            margin-bottom: 10px;
            page-break-inside: avoid;
            border-radius: 5px;
          }
          .ticket-header { 
            font-weight: bold; 
            margin-bottom: 5px;
            font-size: 14px;
            border-bottom: 1px solid #eee;
            padding-bottom: 5px;
          }
          .numbers {
            display: flex;
            flex-wrap: wrap;
            gap: 5px;
          }
          .number {
            display: inline-block;
            width: 25px;
            height: 25px;
            line-height: 25px;
            text-align: center;
            border-radius: 50%;
            background-color: #f0f0f0;
            font-size: 12px;
          }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
            .page-break { page-break-after: always; }
          }
        </style>
      </head>
      <body>
        <div class="no-print">
          <button onclick="window.print()">Print Tickets</button>
          <hr>
        </div>
        <h1>Lottery Wheel - ${lotteryName}</h1>
        <div class="info">
          Generated on ${date} • Wheel type: ${
      wheelTypes.find((w) => w.id === wheelType)?.name || wheelType
    } • ${combinations.length} combinations
        </div>
    `;

    // Add tickets, 4 per page
    combinations.forEach((combo, index) => {
      if (index > 0 && index % 4 === 0) {
        htmlContent += '<div class="page-break"></div>';
      }

      htmlContent += `
        <div class="ticket">
          <div class="ticket-header">Combination #${index + 1}</div>
          <div class="numbers">
            ${combo.map((num) => `<div class="number">${num}</div>`).join("")}
          </div>
        </div>
      `;
    });

    htmlContent += `
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const getSelectedWheelType = () => {
    return wheelTypes.find((w) => w.id === wheelType) || wheelTypes[0];
  };

  const getMaxSelectableNumbers = () => {
    return getSelectedWheelType().maxNumbers;
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center">
          <TicketIcon className="mr-2 h-6 w-6 text-primary" />
          Lottery Wheeling System Generator
        </CardTitle>
        <CardDescription>
          Create mathematically-optimized wheeling systems to increase your odds
          of winning with multiple tickets. Wheels guarantee wins if your
          selected numbers contain the winning numbers.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="space-y-2 flex-1">
            <Label htmlFor="lotteryType">Lottery Type</Label>
            <Select value={selectedConfig} onValueChange={setSelectedConfig}>
              <SelectTrigger id="lotteryType">
                <SelectValue placeholder="Select a lottery type" />
              </SelectTrigger>
              <SelectContent>
                {getLotteryConfigList().map(({ id, name }) => (
                  <SelectItem key={id} value={id}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Standard draw: {lotteryConfig.mainNumbers.count} from{" "}
              {lotteryConfig.mainNumbers.min}-{lotteryConfig.mainNumbers.max}
            </p>
          </div>

          <div className="space-y-2 flex-1">
            <Label htmlFor="wheelType">Wheel Type</Label>
            <Select
              value={wheelType}
              onValueChange={(value) =>
                setWheelType(value as "full" | "abbreviated" | "key")
              }
            >
              <SelectTrigger id="wheelType">
                <SelectValue placeholder="Select wheel type" />
              </SelectTrigger>
              <SelectContent>
                {wheelTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {getSelectedWheelType().description}
            </p>
          </div>
        </div>

        <div className="bg-muted/30 p-4 rounded-md space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium flex items-center gap-2">
              Select Your Numbers
              <Badge
                variant={selectedNumbers.length > 0 ? "default" : "outline"}
              >
                {selectedNumbers.length}/{getMaxSelectableNumbers()} selected
              </Badge>
            </h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={addRandomNumbers}
                disabled={selectedNumbers.length >= getMaxSelectableNumbers()}
              >
                <Plus className="h-4 w-4 mr-1" />
                Random
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearSelections}
                disabled={selectedNumbers.length === 0}
              >
                <Minus className="h-4 w-4 mr-1" />
                Clear
              </Button>
            </div>
          </div>

          <div className="rounded-md border p-3 bg-background">
            <NumberGrid
              data={selectedNumbers.map((number) => ({
                number,
                frequency: 0,
                isHot: false,
                isCold: false,
                isOverdue: false,
              }))}
              rows={5}
              columns={Math.ceil(selectedNumbers.length / 5)}
            />
          </div>

          {wheelType === "key" && (
            <div className="space-y-2 border-t pt-4">
              <h3 className="text-sm font-medium flex items-center gap-2">
                Select Key Numbers
                <Badge variant={keyNumbers.length > 0 ? "default" : "outline"}>
                  {keyNumbers.length}/{drawSize} selected
                </Badge>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        Key numbers appear in every combination. <br />
                        Select from your chosen numbers.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </h3>

              <div className="flex flex-wrap gap-2">
                {selectedNumbers.map((number) => (
                  <LotteryBall
                    key={number}
                    number={number}
                    size="sm"
                    isSelected={keyNumbers.includes(number)}
                    onClick={() => toggleKeyNumber(number)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="space-y-2 flex-1">
              <div className="flex justify-between">
                <Label htmlFor="drawSize">Numbers Per Combination</Label>
                <span className="text-sm">{drawSize}</span>
              </div>
              <Slider
                id="drawSize"
                min={Math.min(2, lotteryConfig.mainNumbers.count)}
                max={Math.min(
                  selectedNumbers.length,
                  lotteryConfig.mainNumbers.count
                )}
                step={1}
                value={[drawSize]}
                onValueChange={(values) => setDrawSize(values[0])}
                disabled={selectedNumbers.length < 2}
              />
              <p className="text-xs text-muted-foreground">
                Standard draw uses {lotteryConfig.mainNumbers.count} numbers
              </p>
            </div>

            <div className="space-y-2 flex-1">
              <div className="flex justify-between">
                <Label htmlFor="maxCombinations">Max Combinations</Label>
                <span className="text-sm">{maxCombinations}</span>
              </div>
              <Slider
                id="maxCombinations"
                min={10}
                max={200}
                step={10}
                value={[maxCombinations]}
                onValueChange={(values) => setMaxCombinations(values[0])}
              />
              <p className="text-xs text-muted-foreground">
                Limit the number of combinations generated
              </p>
            </div>
          </div>

          {showWarning && (
            <div className="text-sm p-2 bg-yellow-100 text-yellow-800 rounded-md">
              Warning: Your selection will generate {totalCombinations}{" "}
              combinations. Consider reducing your numbers or increasing
              filtering.
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
            <div className="text-sm">
              <span className="font-medium">System guarantee: </span>
              <span className="text-muted-foreground">
                {guaranteeDescriptions[wheelType]}
              </span>
            </div>

            <Button
              onClick={generateWheel}
              disabled={
                selectedNumbers.length < drawSize ||
                (wheelType === "key" && keyNumbers.length > drawSize)
              }
              className="sm:w-auto w-full"
            >
              <Rocket className="h-4 w-4 mr-2" />
              Generate Wheel
            </Button>
          </div>
        </div>

        {combinations.length > 0 && (
          <div className="space-y-4 border-t pt-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Generated Combinations</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={exportWheel}>
                  <Download className="h-4 w-4 mr-1" />
                  Export CSV
                </Button>
                <Button variant="outline" size="sm" onClick={exportPrintable}>
                  <Pencil className="h-4 w-4 mr-1" />
                  Printable
                </Button>
              </div>
            </div>

            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">#</TableHead>
                    <TableHead>Combination</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {combinations.slice(0, 20).map((combo, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {combo.map((num, i) => (
                            <LotteryBall
                              key={i}
                              number={num}
                              size="sm"
                              isSelected={keyNumbers.includes(num)}
                            />
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {combinations.length > 20 && (
              <div className="text-center text-sm text-muted-foreground">
                Showing 20 of {combinations.length} combinations. Export CSV to
                view all.
              </div>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="border-t bg-muted/30 px-6 py-4 text-sm text-muted-foreground">
        Wheeling systems are mathematical techniques to guarantee wins when your
        selected numbers match the winning ones. Full wheels provide complete
        coverage while abbreviated wheels reduce cost with slightly lower
        guarantees.
      </CardFooter>
    </Card>
  );
};

export default LotteryWheelGenerator;
