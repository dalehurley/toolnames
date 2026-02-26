import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Copy, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Simple ASCII font definitions for 5x7 characters
const FONT_CHARS: Record<string, string[]> = {
  A: ["  #  ", " # # ", "#   #", "#####", "#   #", "#   #", "     "],
  B: ["#### ", "#   #", "#   #", "#### ", "#   #", "#   #", "#### "],
  C: [" ####", "#    ", "#    ", "#    ", "#    ", "#    ", " ####"],
  D: ["#### ", "#   #", "#   #", "#   #", "#   #", "#   #", "#### "],
  E: ["#####", "#    ", "#    ", "#####", "#    ", "#    ", "#####"],
  F: ["#####", "#    ", "#    ", "#####", "#    ", "#    ", "#    "],
  G: [" ####", "#    ", "#    ", "# ###", "#   #", "#   #", " ####"],
  H: ["#   #", "#   #", "#   #", "#####", "#   #", "#   #", "#   #"],
  I: ["#####", "  #  ", "  #  ", "  #  ", "  #  ", "  #  ", "#####"],
  J: ["#####", "    #", "    #", "    #", "#   #", "#   #", " ### "],
  K: ["#   #", "#  # ", "# #  ", "##   ", "# #  ", "#  # ", "#   #"],
  L: ["#    ", "#    ", "#    ", "#    ", "#    ", "#    ", "#####"],
  M: ["#   #", "## ##", "# # #", "#   #", "#   #", "#   #", "#   #"],
  N: ["#   #", "##  #", "# # #", "#  ##", "#   #", "#   #", "#   #"],
  O: [" ### ", "#   #", "#   #", "#   #", "#   #", "#   #", " ### "],
  P: ["#### ", "#   #", "#   #", "#### ", "#    ", "#    ", "#    "],
  Q: [" ### ", "#   #", "#   #", "#   #", "# # #", "#  # ", " ## #"],
  R: ["#### ", "#   #", "#   #", "#### ", "# #  ", "#  # ", "#   #"],
  S: [" ####", "#    ", "#    ", " ### ", "    #", "    #", "#### "],
  T: ["#####", "  #  ", "  #  ", "  #  ", "  #  ", "  #  ", "  #  "],
  U: ["#   #", "#   #", "#   #", "#   #", "#   #", "#   #", " ### "],
  V: ["#   #", "#   #", "#   #", "#   #", " # # ", " # # ", "  #  "],
  W: ["#   #", "#   #", "#   #", "# # #", "# # #", "## ##", "#   #"],
  X: ["#   #", " # # ", "  #  ", "  #  ", " # # ", " # # ", "#   #"],
  Y: ["#   #", " # # ", " # # ", "  #  ", "  #  ", "  #  ", "  #  "],
  Z: ["#####", "    #", "   # ", "  #  ", " #   ", "#    ", "#####"],
  "0": [" ### ", "#   #", "#  ##", "# # #", "##  #", "#   #", " ### "],
  "1": ["  #  ", " ##  ", "#  # ", "  #  ", "  #  ", "  #  ", "#####"],
  "2": [" ### ", "#   #", "    #", "   # ", "  #  ", " #   ", "#####"],
  "3": ["#####", "    #", "    #", " ### ", "    #", "    #", "#####"],
  "4": ["   # ", "  ## ", " # # ", "#  # ", "#####", "   # ", "   # "],
  "5": ["#####", "#    ", "#    ", "#### ", "    #", "    #", "#### "],
  "6": [" ### ", "#    ", "#    ", "#### ", "#   #", "#   #", " ### "],
  "7": ["#####", "   # ", "  #  ", " #   ", "#    ", "#    ", "#    "],
  "8": [" ### ", "#   #", "#   #", " ### ", "#   #", "#   #", " ### "],
  "9": [" ### ", "#   #", "#   #", " ####", "    #", "    #", " ### "],
  " ": ["     ", "     ", "     ", "     ", "     ", "     ", "     "],
  "!": ["  #  ", "  #  ", "  #  ", "  #  ", "  #  ", "     ", "  #  "],
  "?": [" ### ", "#   #", "    #", "   # ", "  #  ", "     ", "  #  "],
  ".": ["     ", "     ", "     ", "     ", "     ", "     ", "  #  "],
  ",": ["     ", "     ", "     ", "     ", "     ", "  #  ", " #   "],
};

const CHAR_SETS = {
  "Standard (#)": "#",
  "Blocks (█)": "█",
  "Dense (@)": "@",
  "Stars (*)": "*",
  "Plus (+)": "+",
  "Dots (·)": "·",
};

function textToAsciiArt(text: string, charSet: string): string {
  const upper = text.toUpperCase();
  const chars = upper.split("").filter(c => FONT_CHARS[c]);

  if (chars.length === 0) return "";

  const lines: string[] = [];
  for (let row = 0; row < 7; row++) {
    const line = chars.map(c => {
      const fontRow = FONT_CHARS[c][row] || "     ";
      return fontRow.replace(/#/g, charSet);
    }).join("  ");
    lines.push(line);
  }

  return lines.join("\n");
}

// Simple figlet-style banner art using a different approach
const BANNER_STYLES: Record<string, (text: string) => string> = {
  "Shadow": (text) => {
    const lines = text.split("").map(() => "█").join("█");
    return `▄${lines}▄\n█${text.split("").map(c => c === " " ? "   " : ` ${c} `).join("")}█\n▀${lines}▀`;
  },
  "Box": (text) => {
    const inner = ` ${text} `;
    const border = "─".repeat(inner.length);
    return `┌${border}┐\n│${inner}│\n└${border}┘`;
  },
  "Double Box": (text) => {
    const inner = ` ${text} `;
    const border = "═".repeat(inner.length);
    return `╔${border}╗\n║${inner}║\n╚${border}╝`;
  },
  "Stars": (text) => {
    const stars = "*".repeat(text.length + 4);
    return `${stars}\n* ${text} *\n${stars}`;
  },
};

export const AsciiArtGenerator = () => {
  const [input, setInput] = useState("HELLO");
  const [charSet, setCharSet] = useState("#");
  const [style, setStyle] = useState<"bigtext" | "banner">("bigtext");
  const [bannerStyle, setBannerStyle] = useState("Box");
  const [copied, setCopied] = useState(false);

  const asciiArt = useCallback(() => {
    if (style === "bigtext") {
      return textToAsciiArt(input, charSet);
    } else {
      return BANNER_STYLES[bannerStyle]?.(input) || input;
    }
  }, [input, charSet, style, bannerStyle])();

  const copy = () => {
    navigator.clipboard.writeText(asciiArt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const download = () => {
    const blob = new Blob([asciiArt], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ascii-art.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const charLimit = style === "bigtext" ? 12 : 30;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">ASCII Art Generator</CardTitle>
          <CardDescription>Convert text into ASCII art with multiple styles and character sets</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Input */}
          <div className="space-y-2">
            <Label htmlFor="ascii-input" className="text-base font-semibold">
              Input Text <span className="text-muted-foreground text-sm font-normal">({charLimit} chars max)</span>
            </Label>
            <Input
              id="ascii-input"
              value={input}
              onChange={(e) => setInput(e.target.value.slice(0, charLimit))}
              placeholder="Enter text..."
              className="text-lg"
            />
          </div>

          {/* Style */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">Art Style</Label>
            <div className="flex gap-2">
              <Button
                variant={style === "bigtext" ? "default" : "outline"}
                size="sm"
                onClick={() => setStyle("bigtext")}
              >
                Big Text
              </Button>
              <Button
                variant={style === "banner" ? "default" : "outline"}
                size="sm"
                onClick={() => setStyle("banner")}
              >
                Banner / Box
              </Button>
            </div>
          </div>

          {/* Character Set (Big Text mode) */}
          {style === "bigtext" && (
            <div className="space-y-2">
              <Label className="text-base font-semibold">Character Set</Label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(CHAR_SETS).map(([label, char]) => (
                  <Button
                    key={char}
                    variant={charSet === char ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCharSet(char)}
                    className="font-mono"
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Banner Style */}
          {style === "banner" && (
            <div className="space-y-2">
              <Label className="text-base font-semibold">Banner Style</Label>
              <div className="flex flex-wrap gap-2">
                {Object.keys(BANNER_STYLES).map(s => (
                  <Button
                    key={s}
                    variant={bannerStyle === s ? "default" : "outline"}
                    size="sm"
                    onClick={() => setBannerStyle(s)}
                  >
                    {s}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Output */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">ASCII Art Output</Label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={copy} disabled={!asciiArt}>
                  <Copy className="h-3 w-3 mr-1" /> Copy
                </Button>
                <Button variant="outline" size="sm" onClick={download} disabled={!asciiArt}>
                  <Download className="h-3 w-3 mr-1" /> Download
                </Button>
              </div>
            </div>
            <div className="relative">
              <pre className={`bg-muted/50 border rounded-lg p-4 overflow-x-auto font-mono leading-tight select-all ${style === "bigtext" ? "text-xs" : "text-base"}`}>
                {asciiArt || <span className="text-muted-foreground italic">Output will appear here...</span>}
              </pre>
            </div>
            {copied && <p className="text-xs text-green-600">Copied to clipboard!</p>}
          </div>

          {/* Supported Characters */}
          {style === "bigtext" && (
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Supported Characters</Label>
              <div className="flex flex-wrap gap-1">
                {Object.keys(FONT_CHARS).map(c => (
                  <Badge key={c} variant="outline" className="font-mono text-xs px-2 py-0">
                    {c === " " ? "SPACE" : c}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
