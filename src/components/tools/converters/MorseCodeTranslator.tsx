import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Volume2, ArrowLeftRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const MORSE_MAP: Record<string, string> = {
  A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.", G: "--.",
  H: "....", I: "..", J: ".---", K: "-.-", L: ".-..", M: "--", N: "-.",
  O: "---", P: ".--.", Q: "--.-", R: ".-.", S: "...", T: "-", U: "..-",
  V: "...-", W: ".--", X: "-..-", Y: "-.--", Z: "--..",
  "0": "-----", "1": ".----", "2": "..---", "3": "...--", "4": "....-",
  "5": ".....", "6": "-....", "7": "--...", "8": "---..", "9": "----.",
  ".": ".-.-.-", ",": "--..--", "?": "..--..", "'": ".----.", "!": "-.-.--",
  "/": "-..-.", "(": "-.--.", ")": "-.--.-", "&": ".-...", ":": "---...",
  ";": "-.-.-.", "=": "-...-", "+": ".-.-.", "-": "-....-", "_": "..--.-",
  '"': ".-..-.", "$": "...-..-", "@": ".--.-.", " ": "/",
};

const REVERSE_MORSE_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(MORSE_MAP).map(([k, v]) => [v, k])
);

function textToMorse(text: string): string {
  return text
    .toUpperCase()
    .split("")
    .map(char => MORSE_MAP[char] ?? "")
    .filter(code => code !== "")
    .join(" ");
}

function morseToText(morse: string): string {
  return morse
    .split(" / ")
    .map(word =>
      word
        .split(" ")
        .map(code => REVERSE_MORSE_MAP[code] ?? "?")
        .join("")
    )
    .join(" ");
}

// Web Audio API Morse beeper
function playMorse(morse: string, wpm: number = 20): void {
  const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
  if (!AudioContext) return;

  const ctx = new AudioContext();
  const dotDuration = 60 / (50 * wpm); // in seconds

  let t = ctx.currentTime + 0.1;
  const freq = 700;

  for (const symbol of morse) {
    if (symbol === ".") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.3, t);
      osc.start(t);
      osc.stop(t + dotDuration);
      t += dotDuration * 1.5;
    } else if (symbol === "-") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.3, t);
      osc.start(t);
      osc.stop(t + dotDuration * 3);
      t += dotDuration * 4.5;
    } else if (symbol === " ") {
      t += dotDuration * 2;
    } else if (symbol === "/") {
      t += dotDuration * 4;
    }
  }
}

const SAMPLE_PHRASES = ["Hello World", "SOS", "The quick brown fox", "Morse Code"];

export const MorseCodeTranslator = () => {
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [input, setInput] = useState("Hello World");
  const [copied, setCopied] = useState(false);
  const [wpm, setWpm] = useState(15);

  const output = useCallback(() => {
    if (mode === "encode") return textToMorse(input);
    return morseToText(input);
  }, [mode, input])();

  const swap = () => {
    setMode(m => m === "encode" ? "decode" : "encode");
    setInput(output);
  };

  const copy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const play = () => {
    const morse = mode === "encode" ? output : input;
    playMorse(morse, wpm);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Morse Code Translator</CardTitle>
          <CardDescription>Encode text to Morse code or decode Morse code back to text — with audio playback</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mode Toggle */}
          <div className="flex items-center gap-3">
            <Badge variant={mode === "encode" ? "default" : "outline"} className="cursor-pointer text-sm px-3 py-1" onClick={() => setMode("encode")}>
              Text → Morse
            </Badge>
            <Button variant="ghost" size="sm" onClick={swap} title="Swap">
              <ArrowLeftRight className="h-4 w-4" />
            </Button>
            <Badge variant={mode === "decode" ? "default" : "outline"} className="cursor-pointer text-sm px-3 py-1" onClick={() => setMode("decode")}>
              Morse → Text
            </Badge>
          </div>

          {/* Input */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">
              {mode === "encode" ? "Text Input" : "Morse Code Input"}
            </Label>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className={`min-h-[120px] ${mode === "decode" ? "font-mono tracking-wider" : ""}`}
              placeholder={mode === "encode"
                ? "Enter text to convert to Morse code..."
                : "Enter Morse code (use spaces between letters, / between words)..."
              }
            />
            {mode === "decode" && (
              <p className="text-xs text-muted-foreground">
                Use spaces between letters, slash (/) between words. Example: <code className="bg-muted px-1 rounded">.... . .-.. .-.. --- / .-- --- .-. .-.. -..</code>
              </p>
            )}
          </div>

          {/* Sample Phrases */}
          {mode === "encode" && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-muted-foreground">Try:</span>
              {SAMPLE_PHRASES.map(phrase => (
                <Button key={phrase} variant="outline" size="sm" onClick={() => setInput(phrase)}>
                  {phrase}
                </Button>
              ))}
            </div>
          )}

          {/* Output */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">
                {mode === "encode" ? "Morse Code Output" : "Decoded Text"}
              </Label>
              <div className="flex items-center gap-2">
                {mode === "encode" && (
                  <Button variant="outline" size="sm" onClick={play} title="Play audio">
                    <Volume2 className="h-4 w-4 mr-1" /> Play
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={copy} disabled={!output}>
                  <Copy className="h-4 w-4 mr-1" /> Copy
                </Button>
              </div>
            </div>
            <div className={`min-h-[120px] p-3 rounded-md bg-muted/50 border ${mode === "encode" ? "font-mono tracking-wider" : ""} text-sm break-all`}>
              {output || <span className="text-muted-foreground italic">Output will appear here...</span>}
            </div>
            {copied && <p className="text-xs text-green-600">Copied!</p>}
          </div>

          {/* Audio WPM slider */}
          {mode === "encode" && (
            <div className="space-y-2">
              <Label className="text-sm">Playback Speed: {wpm} WPM</Label>
              <input
                type="range" min="5" max="40" value={wpm}
                onChange={(e) => setWpm(Number(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>5 WPM (Slow)</span>
                <span>40 WPM (Fast)</span>
              </div>
            </div>
          )}

          <Separator />

          {/* Morse Code Reference */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Morse Code Reference</Label>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
              {Object.entries(MORSE_MAP).filter(([k]) => k !== " ").map(([char, code]) => (
                <div key={char} className="text-center p-2 rounded-md border bg-muted/30 hover:bg-muted cursor-pointer" onClick={() => mode === "encode" && setInput(p => p + char)}>
                  <div className="font-bold text-sm">{char}</div>
                  <div className="font-mono text-xs text-muted-foreground mt-1">{code}</div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
