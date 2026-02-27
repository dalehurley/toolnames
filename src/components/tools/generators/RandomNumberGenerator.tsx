import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dices, Copy, RefreshCw, Check } from "lucide-react";

export const RandomNumberGenerator = () => {
  const [min, setMin] = useState("1");
  const [max, setMax] = useState("100");
  const [count, setCount] = useState("1");
  const [unique, setUnique] = useState(false);
  const [results, setResults] = useState<number[]>([]);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const generate = useCallback(() => {
    setError("");
    const minVal = parseInt(min, 10);
    const maxVal = parseInt(max, 10);
    const countVal = parseInt(count, 10);

    if (isNaN(minVal) || isNaN(maxVal) || isNaN(countVal)) {
      setError("Please enter valid numbers.");
      return;
    }
    if (minVal >= maxVal) {
      setError("Minimum must be less than maximum.");
      return;
    }
    if (countVal < 1 || countVal > 1000) {
      setError("Count must be between 1 and 1000.");
      return;
    }
    if (unique && countVal > maxVal - minVal + 1) {
      setError(
        `Cannot generate ${countVal} unique numbers in the range [${minVal}, ${maxVal}].`
      );
      return;
    }

    const nums: number[] = [];
    if (unique) {
      const pool = Array.from(
        { length: maxVal - minVal + 1 },
        (_, i) => i + minVal
      );
      for (let i = 0; i < countVal; i++) {
        const idx = Math.floor(Math.random() * (pool.length - i)) + i;
        [pool[i], pool[idx]] = [pool[idx], pool[i]];
        nums.push(pool[i]);
      }
    } else {
      for (let i = 0; i < countVal; i++) {
        nums.push(Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal);
      }
    }
    setResults(nums);
  }, [min, max, count, unique]);

  const copyToClipboard = useCallback(() => {
    if (results.length === 0) return;
    navigator.clipboard.writeText(results.join(", ")).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [results]);

  return (
    <div className="space-y-6 max-w-xl mx-auto p-4">
      <div className="text-center space-y-2">
        <div className="flex justify-center">
          <div className="bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 p-4 rounded-full">
            <Dices className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <h1 className="text-2xl font-bold">Random Number Generator</h1>
        <p className="text-muted-foreground">
          Generate one or more random numbers within any range.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor="rng-min">Minimum</Label>
            <Input
              id="rng-min"
              type="number"
              value={min}
              onChange={(e) => setMin(e.target.value)}
              placeholder="1"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="rng-max">Maximum</Label>
            <Input
              id="rng-max"
              type="number"
              value={max}
              onChange={(e) => setMax(e.target.value)}
              placeholder="100"
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="rng-count">How many numbers?</Label>
          <Input
            id="rng-count"
            type="number"
            min={1}
            max={1000}
            value={count}
            onChange={(e) => setCount(e.target.value)}
            placeholder="1"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            id="rng-unique"
            type="checkbox"
            checked={unique}
            onChange={(e) => setUnique(e.target.checked)}
            className="rounded border-slate-300"
          />
          <Label htmlFor="rng-unique" className="cursor-pointer">
            Generate unique numbers (no duplicates)
          </Label>
        </div>

        {error && (
          <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <Button
          onClick={generate}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
        >
          <Dices className="mr-2 h-4 w-4" />
          Generate
        </Button>
      </div>

      {results.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg">
              Result{results.length > 1 ? "s" : ""}
            </h2>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={generate}>
                <RefreshCw className="h-4 w-4 mr-1" />
                Re-roll
              </Button>
              <Button size="sm" variant="outline" onClick={copyToClipboard}>
                {copied ? (
                  <Check className="h-4 w-4 mr-1 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4 mr-1" />
                )}
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
          </div>

          {results.length === 1 ? (
            <div className="text-center">
              <span className="text-6xl font-bold bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
                {results[0]}
              </span>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {results.map((n, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-sm font-mono font-medium border border-blue-200 dark:border-blue-800"
                >
                  {n}
                </span>
              ))}
            </div>
          )}

          {results.length > 1 && (
            <div className="text-sm text-muted-foreground pt-2 border-t border-slate-100 dark:border-slate-700 grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="font-medium text-slate-700 dark:text-slate-300">
                  Min
                </div>
                <div>{Math.min(...results)}</div>
              </div>
              <div>
                <div className="font-medium text-slate-700 dark:text-slate-300">
                  Max
                </div>
                <div>{Math.max(...results)}</div>
              </div>
              <div>
                <div className="font-medium text-slate-700 dark:text-slate-300">
                  Sum
                </div>
                <div>{results.reduce((a, b) => a + b, 0)}</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
