import { useState } from "react";
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
import { Copy, RefreshCw, Check, AlertTriangle } from "lucide-react";
import { Separator } from "@/components/ui/separator";

type Base = "binary" | "octal" | "decimal" | "hexadecimal";

interface BaseInfo {
  label: string;
  radix: number;
  placeholder: string;
  pattern: RegExp;
  maxLength?: number;
}

export const NumberBaseConverter = () => {
  const [binary, setBinary] = useState<string>("");
  const [octal, setOctal] = useState<string>("");
  const [decimal, setDecimal] = useState<string>("");
  const [hexadecimal, setHexadecimal] = useState<string>("");
  const [activeInput, setActiveInput] = useState<Base>("decimal");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const baseInfo: Record<Base, BaseInfo> = {
    binary: {
      label: "Binary (Base 2)",
      radix: 2,
      placeholder: "e.g., 10101010",
      pattern: /^[01]*$/,
      maxLength: 32,
    },
    octal: {
      label: "Octal (Base 8)",
      radix: 8,
      placeholder: "e.g., 252",
      pattern: /^[0-7]*$/,
      maxLength: 11,
    },
    decimal: {
      label: "Decimal (Base 10)",
      radix: 10,
      placeholder: "e.g., 170",
      pattern: /^[0-9]*$/,
      maxLength: 10,
    },
    hexadecimal: {
      label: "Hexadecimal (Base 16)",
      radix: 16,
      placeholder: "e.g., AA",
      pattern: /^[0-9A-Fa-f]*$/,
      maxLength: 8,
    },
  };

  const handleInputChange = (base: Base, value: string) => {
    setError(null);

    // Check if value matches the pattern for this base
    if (value && !baseInfo[base].pattern.test(value)) {
      return;
    }

    // Update state for this base
    switch (base) {
      case "binary":
        setBinary(value);
        break;
      case "octal":
        setOctal(value);
        break;
      case "decimal":
        setDecimal(value);
        break;
      case "hexadecimal":
        setHexadecimal(value.toUpperCase());
        break;
    }

    setActiveInput(base);

    // If the value is empty, clear all other fields
    if (!value) {
      if (base !== "binary") setBinary("");
      if (base !== "octal") setOctal("");
      if (base !== "decimal") setDecimal("");
      if (base !== "hexadecimal") setHexadecimal("");
      return;
    }

    try {
      // Convert to decimal
      const decimalValue = parseInt(value, baseInfo[base].radix);

      // Check if the number is too large
      if (decimalValue > 4294967295) {
        // 2^32 - 1, max 32-bit unsigned integer
        setError("Number is too large for conversion");
        return;
      }

      // Convert from decimal to all other bases
      if (base !== "binary") {
        setBinary(decimalValue.toString(2));
      }
      if (base !== "octal") {
        setOctal(decimalValue.toString(8));
      }
      if (base !== "decimal") {
        setDecimal(decimalValue.toString(10));
      }
      if (base !== "hexadecimal") {
        setHexadecimal(decimalValue.toString(16).toUpperCase());
      }
    } catch {
      setError("Invalid conversion");
    }
  };

  const copyToClipboard = (base: Base) => {
    let value = "";
    switch (base) {
      case "binary":
        value = binary;
        break;
      case "octal":
        value = octal;
        break;
      case "decimal":
        value = decimal;
        break;
      case "hexadecimal":
        value = hexadecimal;
        break;
    }

    if (value) {
      navigator.clipboard.writeText(value);
      setCopied(base);
      setTimeout(() => setCopied(null), 2000);
    }
  };

  const clearAll = () => {
    setBinary("");
    setOctal("");
    setDecimal("");
    setHexadecimal("");
    setError(null);
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Number Base Converter</CardTitle>
        <CardDescription>
          Convert between binary, octal, decimal, and hexadecimal number systems
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <div className="bg-red-100 text-red-800 p-3 rounded-md flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-4">
          {(["binary", "octal", "decimal", "hexadecimal"] as Base[]).map(
            (base) => (
              <div key={base} className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor={base}>{baseInfo[base].label}</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(base)}
                    disabled={!eval(base)}
                    className="h-7 px-2"
                  >
                    {copied === base ? (
                      <Check className="h-4 w-4 mr-1" />
                    ) : (
                      <Copy className="h-4 w-4 mr-1" />
                    )}
                    {copied === base ? "Copied" : "Copy"}
                  </Button>
                </div>
                <div className="flex">
                  <Input
                    id={base}
                    value={eval(base)}
                    onChange={(e) => handleInputChange(base, e.target.value)}
                    placeholder={baseInfo[base].placeholder}
                    maxLength={baseInfo[base].maxLength}
                    className={`font-mono ${
                      activeInput === base ? "border-primary" : ""
                    }`}
                  />
                </div>
              </div>
            )
          )}
        </div>

        <div className="flex justify-center">
          <Button variant="outline" onClick={clearAll}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        </div>

        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-medium mb-2">Number Bases Explained</h3>
            <ul className="text-sm space-y-1 list-disc pl-4 text-muted-foreground">
              <li>
                <strong>Binary (Base 2):</strong> Uses only 0 and 1. Used in
                computer systems.
              </li>
              <li>
                <strong>Octal (Base 8):</strong> Uses digits 0-7. Used in some
                programming contexts.
              </li>
              <li>
                <strong>Decimal (Base 10):</strong> Standard system using digits
                0-9.
              </li>
              <li>
                <strong>Hexadecimal (Base 16):</strong> Uses digits 0-9 and
                letters A-F. Common in programming.
              </li>
            </ul>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-medium mb-2">Common Uses</h3>
            <ul className="text-sm space-y-1 list-disc pl-4 text-muted-foreground">
              <li>
                <strong>Binary:</strong> Computer memory, digital logic
              </li>
              <li>
                <strong>Octal:</strong> File permissions in Unix/Linux
              </li>
              <li>
                <strong>Decimal:</strong> Everyday counting and arithmetic
              </li>
              <li>
                <strong>Hexadecimal:</strong> Colors in HTML/CSS, memory
                addresses
              </li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
