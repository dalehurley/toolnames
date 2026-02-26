import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Copy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// English number to words
const ones = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
  "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
const tens = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
const scales = ["", "thousand", "million", "billion", "trillion", "quadrillion", "quintillion"];

function numberToWordsEN(n: number): string {
  if (n === 0) return "zero";
  if (n < 0) return "negative " + numberToWordsEN(-n);
  if (!isFinite(n)) return "infinity";

  let result = "";
  let num = Math.floor(Math.abs(n));

  if (num === 0) return "zero";

  let scaleIndex = 0;
  const parts: string[] = [];

  while (num > 0) {
    const chunk = num % 1000;
    if (chunk !== 0) {
      let chunkWords = chunkToWords(chunk);
      if (scales[scaleIndex]) chunkWords += " " + scales[scaleIndex];
      parts.unshift(chunkWords);
    }
    num = Math.floor(num / 1000);
    scaleIndex++;
  }

  result = parts.join(", ");

  // Handle decimal part
  const str = String(Math.abs(n));
  if (str.includes(".")) {
    const decPart = str.split(".")[1];
    result += " point";
    for (const digit of decPart) {
      result += " " + ones[parseInt(digit)];
    }
  }

  return result;
}

function chunkToWords(n: number): string {
  if (n === 0) return "";
  let result = "";

  const h = Math.floor(n / 100);
  const remainder = n % 100;

  if (h > 0) {
    result += ones[h] + " hundred";
    if (remainder > 0) result += " and ";
  }

  if (remainder > 0) {
    if (remainder < 20) {
      result += ones[remainder];
    } else {
      const t = Math.floor(remainder / 10);
      const o = remainder % 10;
      result += tens[t];
      if (o > 0) result += "-" + ones[o];
    }
  }

  return result;
}

// Ordinal
function toOrdinal(n: number): string {
  const words = numberToWordsEN(n);
  const lastWord = words.split(/[\s-]/).pop() || "";

  const irregulars: Record<string, string> = {
    one: "first", two: "second", three: "third", four: "fourth", five: "fifth",
    six: "sixth", seven: "seventh", eight: "eighth", nine: "ninth", ten: "tenth",
    eleven: "eleventh", twelve: "twelfth",
    thirteen: "thirteenth", fourteen: "fourteenth", fifteen: "fifteenth",
    sixteen: "sixteenth", seventeen: "seventeenth", eighteen: "eighteenth", nineteen: "nineteenth",
    twenty: "twentieth", thirty: "thirtieth", forty: "fortieth", fifty: "fiftieth",
    sixty: "sixtieth", seventy: "seventieth", eighty: "eightieth", ninety: "ninetieth",
    hundred: "hundredth", thousand: "thousandth", million: "millionth", billion: "billionth",
    zero: "zeroth",
  };

  if (irregulars[lastWord]) {
    const base = words.slice(0, words.lastIndexOf(lastWord));
    return base + irregulars[lastWord];
  }

  return words + "th";
}

// Roman numerals
function toRoman(n: number): string {
  if (n <= 0 || n > 3999 || !Number.isInteger(n)) return "—";
  const vals = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
  const syms = ["M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I"];
  let result = "";
  let num = n;
  for (let i = 0; i < vals.length; i++) {
    while (num >= vals[i]) {
      result += syms[i];
      num -= vals[i];
    }
  }
  return result;
}

// Currency
function toCurrency(n: number, currency = "USD"): string {
  const dollars = Math.floor(Math.abs(n));
  const cents = Math.round((Math.abs(n) - dollars) * 100);
  const prefix = n < 0 ? "negative " : "";

  const currencyMap: Record<string, { major: string; minor: string }> = {
    USD: { major: "dollar", minor: "cent" },
    EUR: { major: "euro", minor: "cent" },
    GBP: { major: "pound", minor: "penny" },
    JPY: { major: "yen", minor: "sen" },
    INR: { major: "rupee", minor: "paisa" },
  };

  const c = currencyMap[currency] || currencyMap.USD;
  let result = prefix + numberToWordsEN(dollars) + " " + c.major + (dollars !== 1 ? "s" : "");
  if (cents > 0) {
    result += " and " + numberToWordsEN(cents) + " " + c.minor + (cents !== 1 ? "s" : "");
  }
  return result.charAt(0).toUpperCase() + result.slice(1);
}

const EXAMPLES = [0, 1, 12, 100, 1000, 1234, 1000000, 1234567, 9876543210];

export const NumberToWords = () => {
  const [input, setInput] = useState("1234567");
  const [currency, setCurrency] = useState("USD");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const num = parseFloat(input.replace(/,/g, ""));
  const isValid = !isNaN(num) && isFinite(num);

  const words = isValid ? numberToWordsEN(num) : "";
  const ordinal = isValid && Number.isInteger(num) && num > 0 ? toOrdinal(num) : "";
  const roman = isValid && Number.isInteger(num) && num > 0 && num <= 3999 ? toRoman(num) : "";
  const currencyWords = isValid ? toCurrency(num, currency) : "";

  const copy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const formatted = isValid ? new Intl.NumberFormat("en-US").format(num) : "";

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Number to Words Converter</CardTitle>
          <CardDescription>Convert numbers to English words, ordinals, Roman numerals, and currency text</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Input */}
          <div className="space-y-2">
            <Label htmlFor="num-input" className="text-base font-semibold">Number Input</Label>
            <Input
              id="num-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter a number (e.g., 1234567)"
              className="text-xl font-mono"
            />
            {isValid && (
              <p className="text-sm text-muted-foreground">Formatted: <span className="font-mono">{formatted}</span></p>
            )}
            {!isValid && input && (
              <p className="text-sm text-red-500">Please enter a valid number</p>
            )}
          </div>

          {/* Quick Examples */}
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground">Examples:</span>
            {EXAMPLES.map(n => (
              <Button
                key={n}
                variant="outline"
                size="sm"
                className="font-mono text-xs h-7"
                onClick={() => setInput(String(n))}
              >
                {n.toLocaleString()}
              </Button>
            ))}
          </div>

          {isValid && (
            <>
              {/* Results */}
              {[
                { label: "Words", value: words, field: "words" },
                ...(ordinal ? [{ label: "Ordinal", value: ordinal, field: "ordinal" }] : []),
                ...(roman ? [{ label: "Roman Numerals", value: roman, field: "roman" }] : []),
              ].map(({ label, value, field }) => (
                <div key={field} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label className="font-semibold">{label}</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copy(value, field)}
                      className="h-7 px-2"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      {copiedField === field ? "Copied!" : "Copy"}
                    </Button>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-md font-medium leading-relaxed">
                    {value.charAt(0).toUpperCase() + value.slice(1)}
                  </div>
                </div>
              ))}

              <Separator />

              {/* Currency */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Currency (Check Writing)</Label>
                  <div className="flex gap-1">
                    {["USD", "EUR", "GBP", "JPY", "INR"].map(c => (
                      <Badge
                        key={c}
                        variant={currency === c ? "default" : "outline"}
                        className="cursor-pointer text-xs"
                        onClick={() => setCurrency(c)}
                      >
                        {c}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="flex-1 p-3 bg-muted/50 rounded-md font-medium leading-relaxed text-sm">
                    {currencyWords}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copy(currencyWords, "currency")}
                    className="h-9 px-2 shrink-0"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                {copiedField === "currency" && <p className="text-xs text-green-600">Copied!</p>}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
