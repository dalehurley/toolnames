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
import { Separator } from "@/components/ui/separator";
import { Copy, RefreshCw } from "lucide-react";

export const PasswordGenerator = () => {
  const [password, setPassword] = useState<string>("");
  const [length, setLength] = useState<number>(16);
  const [includeUppercase, setIncludeUppercase] = useState<boolean>(true);
  const [includeLowercase, setIncludeLowercase] = useState<boolean>(true);
  const [includeNumbers, setIncludeNumbers] = useState<boolean>(true);
  const [includeSymbols, setIncludeSymbols] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  const generatePassword = () => {
    let charset = "";
    if (includeLowercase) charset += "abcdefghijklmnopqrstuvwxyz";
    if (includeUppercase) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (includeNumbers) charset += "0123456789";
    if (includeSymbols) charset += "!@#$%^&*()_+~`|}{[]:;?><,./-=";

    // Ensure at least one character set is selected
    if (charset === "") {
      setIncludeLowercase(true);
      charset = "abcdefghijklmnopqrstuvwxyz";
    }

    let result = "";
    const charactersLength = charset.length;
    for (let i = 0; i < length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charactersLength));
    }

    setPassword(result);
    setCopied(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Password Generator</CardTitle>
        <CardDescription>
          Generate secure, random passwords with customizable options
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center space-x-2">
          <Input
            value={password}
            readOnly
            className="font-mono text-lg"
            placeholder="Your password will appear here"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={copyToClipboard}
            disabled={!password}
            title="Copy to clipboard"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={generatePassword}
            title="Generate new password"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {copied && (
          <div className="bg-green-100 text-green-800 px-4 py-2 rounded-md text-sm">
            Password copied to clipboard!
          </div>
        )}

        <Separator />

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="passwordLength">Password Length: {length}</Label>
            <div className="flex items-center space-x-2">
              <span className="text-sm">8</span>
              <input
                id="passwordLength"
                type="range"
                min="8"
                max="64"
                value={length}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setLength(parseInt(e.target.value))
                }
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-sm">64</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="uppercase"
                checked={includeUppercase}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setIncludeUppercase(e.target.checked)
                }
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="uppercase">Include Uppercase Letters (A-Z)</Label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="lowercase"
                checked={includeLowercase}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setIncludeLowercase(e.target.checked)
                }
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="lowercase">Include Lowercase Letters (a-z)</Label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="numbers"
                checked={includeNumbers}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setIncludeNumbers(e.target.checked)
                }
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="numbers">Include Numbers (0-9)</Label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="symbols"
                checked={includeSymbols}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setIncludeSymbols(e.target.checked)
                }
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="symbols">Include Symbols (!@#$%^&*)</Label>
            </div>
          </div>

          <Button onClick={generatePassword} className="w-full">
            Generate Password
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
