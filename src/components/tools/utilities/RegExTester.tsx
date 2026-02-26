import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Copy,
  Info,
  BookOpen,
  ArrowRight,
  Brackets,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface RegexMatch {
  start: number;
  end: number;
  text: string;
  groups: string[];
}

interface CommonPattern {
  name: string;
  pattern: string;
  description: string;
  example: string;
}

// Collection of common regex patterns
const commonPatterns: CommonPattern[] = [
  {
    name: "Email Address",
    pattern: "^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$",
    description: "Validates an email address format",
    example: "user@example.com",
  },
  {
    name: "URL",
    pattern:
      "https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)",
    description: "Matches HTTP/HTTPS URLs",
    example: "https://www.example.com",
  },
  {
    name: "Phone Number (US)",
    pattern: "^(\\+\\d{1,2}\\s)?\\(?\\d{3}\\)?[\\s.-]?\\d{3}[\\s.-]?\\d{4}$",
    description: "Matches US phone number formats",
    example: "(123) 456-7890",
  },
  {
    name: "Date (YYYY-MM-DD)",
    pattern: "^\\d{4}-\\d{2}-\\d{2}$",
    description: "Matches dates in YYYY-MM-DD format",
    example: "2023-01-15",
  },
  {
    name: "Time (HH:MM:SS)",
    pattern: "^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$",
    description: "Matches time in 24-hour format",
    example: "14:30:45",
  },
  {
    name: "Credit Card Number",
    pattern:
      "^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\\d{3})\\d{11})$",
    description: "Validates common credit card formats (Visa, MC, Amex, etc.)",
    example: "4111111111111111",
  },
  {
    name: "Password Strength",
    pattern:
      "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
    description:
      "Password with at least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character",
    example: "Password1!",
  },
  {
    name: "IP Address",
    pattern:
      "^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$",
    description: "Matches IPv4 addresses",
    example: "192.168.1.1",
  },
  {
    name: "Hex Color Code",
    pattern: "^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$",
    description: "Matches hexadecimal color codes",
    example: "#FF5733",
  },
  {
    name: "Zip Code (US)",
    pattern: "^\\d{5}(-\\d{4})?$",
    description: "Matches US ZIP codes with optional +4",
    example: "12345-6789",
  },
  {
    name: "HTML Tag",
    pattern: "<(?:\"[^\"]*\"['\"]*|'[^']*'['\"]*|[^'\">])+>",
    description: "Matches HTML tags",
    example: '<div class="example">',
  },
  {
    name: "Username",
    pattern: "^[a-zA-Z0-9_-]{3,16}$",
    description: "Alphanumeric username (3-16 characters)",
    example: "user_name123",
  },
];

export const RegExTester = () => {
  const [regex, setRegex] = useState<string>(
    "([A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,4})"
  );
  const [testString, setTestString] = useState<string>(
    "Contact us at support@example.com or sales@company.co.uk for more information."
  );
  const [matches, setMatches] = useState<RegexMatch[]>([]);
  const [flags, setFlags] = useState({
    global: true,
    caseInsensitive: false,
    multiline: false,
    dotAll: false,
    unicode: false,
    sticky: false,
  });
  const [isValid, setIsValid] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("tester");
  const [cheatSheetOpen, setCheatSheetOpen] = useState<boolean>(false);

  // Test the regex against the input string
  useEffect(() => {
    testRegex();
  }, [regex, testString, flags]);

  const getFlagsString = (): string => {
    let flagsStr = "";
    if (flags.global) flagsStr += "g";
    if (flags.caseInsensitive) flagsStr += "i";
    if (flags.multiline) flagsStr += "m";
    if (flags.dotAll) flagsStr += "s";
    if (flags.unicode) flagsStr += "u";
    if (flags.sticky) flagsStr += "y";
    return flagsStr;
  };

  const testRegex = () => {
    setMatches([]);
    setIsValid(true);
    setErrorMessage("");

    if (!regex.trim()) {
      return;
    }

    try {
      const flagsStr = getFlagsString();
      const regexObj = new RegExp(regex, flagsStr);
      const newMatches: RegexMatch[] = [];

      if (flags.global) {
        let match;
        while ((match = regexObj.exec(testString)) !== null) {
          newMatches.push({
            start: match.index,
            end: match.index + match[0].length,
            text: match[0],
            groups: match.slice(1),
          });
        }
      } else {
        const match = regexObj.exec(testString);
        if (match) {
          newMatches.push({
            start: match.index,
            end: match.index + match[0].length,
            text: match[0],
            groups: match.slice(1),
          });
        }
      }

      setMatches(newMatches);
    } catch (e) {
      setIsValid(false);
      setErrorMessage((e as Error).message);
    }
  };

  const handleFlagChange = (flag: keyof typeof flags) => {
    setFlags({ ...flags, [flag]: !flags[flag] });
  };

  const highlightMatches = () => {
    if (!testString || !isValid || matches.length === 0) {
      return <pre className="whitespace-pre-wrap">{testString}</pre>;
    }

    let lastIndex = 0;
    const parts = [];

    // Sort matches by start index to handle potential overlaps
    const sortedMatches = [...matches].sort((a, b) => a.start - b.start);

    for (const match of sortedMatches) {
      if (lastIndex < match.start) {
        parts.push(
          <span key={`text-${lastIndex}`}>
            {testString.substring(lastIndex, match.start)}
          </span>
        );
      }

      parts.push(
        <span
          key={`match-${match.start}`}
          className="bg-green-200 dark:bg-green-900 rounded px-0.5"
        >
          {match.text}
        </span>
      );

      lastIndex = match.end;
    }

    if (lastIndex < testString.length) {
      parts.push(
        <span key={`text-${lastIndex}`}>{testString.substring(lastIndex)}</span>
      );
    }

    return <pre className="whitespace-pre-wrap">{parts}</pre>;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add toast notification here
  };

  const handlePatternSelect = (pattern: CommonPattern) => {
    setRegex(pattern.pattern);
    setTestString(pattern.example);
  };

  const regexCheatSheet = [
    {
      category: "Character Classes",
      items: [
        { pattern: ".", description: "Any character except newline" },
        { pattern: "\\w", description: "Word character [a-zA-Z0-9_]" },
        { pattern: "\\d", description: "Digit [0-9]" },
        { pattern: "\\s", description: "Whitespace character" },
        { pattern: "\\W", description: "Non-word character" },
        { pattern: "\\D", description: "Non-digit" },
        { pattern: "\\S", description: "Non-whitespace character" },
      ],
    },
    {
      category: "Anchors",
      items: [
        { pattern: "^", description: "Start of string or line" },
        { pattern: "$", description: "End of string or line" },
        { pattern: "\\b", description: "Word boundary" },
        { pattern: "\\B", description: "Non-word boundary" },
      ],
    },
    {
      category: "Quantifiers",
      items: [
        { pattern: "*", description: "0 or more" },
        { pattern: "+", description: "1 or more" },
        { pattern: "?", description: "0 or 1" },
        { pattern: "{n}", description: "Exactly n times" },
        { pattern: "{n,}", description: "n or more times" },
        { pattern: "{n,m}", description: "Between n and m times" },
      ],
    },
    {
      category: "Groups & Ranges",
      items: [
        { pattern: "[abc]", description: "Any character a, b, or c" },
        { pattern: "[^abc]", description: "Any character except a, b, or c" },
        { pattern: "[a-z]", description: "Any character from a to z" },
        { pattern: "(xyz)", description: "Capture group" },
        { pattern: "(?:xyz)", description: "Non-capturing group" },
        { pattern: "x|y", description: "Either x or y" },
      ],
    },
    {
      category: "Special Characters",
      items: [
        { pattern: "\\", description: "Escape character" },
        { pattern: "\\t", description: "Tab" },
        { pattern: "\\n", description: "Newline" },
        { pattern: "\\r", description: "Carriage return" },
      ],
    },
    {
      category: "Flags",
      items: [
        { pattern: "g", description: "Global search (find all matches)" },
        { pattern: "i", description: "Case-insensitive search" },
        { pattern: "m", description: "Multi-line search" },
        { pattern: "s", description: "Dot matches newlines" },
        { pattern: "u", description: "Unicode support" },
        { pattern: "y", description: "Sticky search" },
      ],
    },
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brackets className="h-6 w-6 text-primary" />
          Regular Expression Tester
        </CardTitle>
        <CardDescription>
          Build, test, and visualize regular expressions in real-time
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="tester">Regex Tester</TabsTrigger>
            <TabsTrigger value="patterns">Common Patterns</TabsTrigger>
          </TabsList>
        </Tabs>

        {activeTab === "tester" && (
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="regex">Regular Expression</Label>
                <div className="flex items-center space-x-2">
                  <Dialog
                    open={cheatSheetOpen}
                    onOpenChange={setCheatSheetOpen}
                  >
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <BookOpen className="h-4 w-4 mr-1" />
                        Cheat Sheet
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>
                          Regular Expression Cheat Sheet
                        </DialogTitle>
                        <DialogDescription>
                          A quick reference guide for common regex patterns and
                          syntax
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-6 py-4">
                        {regexCheatSheet.map((section, index) => (
                          <div key={index}>
                            <h3 className="font-medium text-lg mb-2">
                              {section.category}
                            </h3>
                            <div className="grid grid-cols-2 gap-2">
                              {section.items.map((item, itemIndex) => (
                                <div
                                  key={itemIndex}
                                  className="border rounded p-2 cursor-pointer hover:bg-muted"
                                  onClick={() => {
                                    const newRegex = regex + item.pattern;
                                    setRegex(newRegex);
                                    setCheatSheetOpen(false);
                                  }}
                                >
                                  <div className="font-mono bg-muted p-1 rounded text-sm mb-1">
                                    {item.pattern}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {item.description}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              <div className="flex">
                <TooltipProvider>
                  <div className="w-full relative">
                    <Input
                      id="regex"
                      value={regex}
                      onChange={(e) => setRegex(e.target.value)}
                      className={`font-mono pr-8 ${
                        !isValid ? "border-red-500" : ""
                      }`}
                      placeholder="Enter regular expression..."
                    />
                    <div className="absolute right-2 top-2">
                      {isValid ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <Tooltip>
                          <TooltipTrigger>
                            <XCircle className="h-4 w-4 text-red-500" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{errorMessage}</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </div>
                </TooltipProvider>
              </div>
              {!isValid && (
                <p className="text-sm text-red-500 mt-1">{errorMessage}</p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="flag-g"
                  checked={flags.global}
                  onCheckedChange={() => handleFlagChange("global")}
                />
                <Label htmlFor="flag-g">Global (g)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="flag-i"
                  checked={flags.caseInsensitive}
                  onCheckedChange={() => handleFlagChange("caseInsensitive")}
                />
                <Label htmlFor="flag-i">Case Insensitive (i)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="flag-m"
                  checked={flags.multiline}
                  onCheckedChange={() => handleFlagChange("multiline")}
                />
                <Label htmlFor="flag-m">Multiline (m)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="flag-s"
                  checked={flags.dotAll}
                  onCheckedChange={() => handleFlagChange("dotAll")}
                />
                <Label htmlFor="flag-s">Dot All (s)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="flag-u"
                  checked={flags.unicode}
                  onCheckedChange={() => handleFlagChange("unicode")}
                />
                <Label htmlFor="flag-u">Unicode (u)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="flag-y"
                  checked={flags.sticky}
                  onCheckedChange={() => handleFlagChange("sticky")}
                />
                <Label htmlFor="flag-y">Sticky (y)</Label>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="test-string">Test String</Label>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">
                    {matches.length}{" "}
                    {matches.length === 1 ? "match" : "matches"}
                  </Badge>
                </div>
              </div>
              <Textarea
                id="test-string"
                value={testString}
                onChange={(e) => setTestString(e.target.value)}
                className="min-h-[150px] font-mono"
                placeholder="Enter text to test against..."
              />
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Matches</h3>
              <div className="border rounded-md p-4 min-h-[100px] bg-muted/50">
                {highlightMatches()}
              </div>
            </div>

            {matches.length > 0 && (
              <div className="space-y-4">
                <Separator />
                <div>
                  <h3 className="text-sm font-medium mb-2">Capture Groups</h3>
                  <div className="space-y-2">
                    {matches.map((match, index) => (
                      <div
                        key={index}
                        className="border rounded p-3 bg-muted/30"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium">Match {index + 1}</h4>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(match.text)}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Copy match</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <div className="text-sm font-mono bg-background p-2 rounded mb-2">
                          {match.text}
                        </div>
                        {match.groups.length > 0 ? (
                          <div className="space-y-2">
                            <h5 className="text-sm font-medium">Groups:</h5>
                            {match.groups.map((group, groupIndex) => (
                              <div
                                key={groupIndex}
                                className="flex items-center gap-2"
                              >
                                <Badge variant="outline">
                                  {groupIndex + 1}
                                </Badge>
                                <code className="bg-muted p-1 rounded text-sm">
                                  {group}
                                </code>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            No capture groups
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "patterns" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Click on any pattern to use it in the tester. These are commonly
              used regular expressions for various validation tasks.
            </p>

            <div className="grid gap-4">
              {commonPatterns.map((pattern, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => handlePatternSelect(pattern)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">{pattern.name}</h3>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {pattern.description}
                  </p>
                  <div className="bg-muted p-2 rounded font-mono text-sm overflow-x-auto">
                    {pattern.pattern}
                  </div>
                  <div className="mt-2 text-sm">
                    <span className="font-medium">Example:</span>{" "}
                    {pattern.example}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between flex-wrap gap-4 border-t p-4">
        <div className="flex items-center text-sm text-muted-foreground">
          <Info className="h-4 w-4 mr-1" />
          <span>
            Complete regular expression: <code>/</code>
            <span className="font-mono">{regex}</span>
            <code>/</code>
            <span className="font-mono">{getFlagsString()}</span>
          </span>
        </div>
        <div>
          <Button
            variant="outline"
            onClick={() => copyToClipboard(`/${regex}/${getFlagsString()}`)}
          >
            <Copy className="h-4 w-4 mr-1" />
            Copy Regex
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default RegExTester;
