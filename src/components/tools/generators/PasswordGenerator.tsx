import { useState, useEffect, useRef, useCallback } from "react";
import * as QRCode from "qrcode";
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
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Copy,
  RefreshCw,
  QrCode,
  Download,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Trash2,
  Save,
  AlertTriangle,
  Info,
  Loader2,
} from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { WORDLIST } from "./wordlist";

// ─── Constants ────────────────────────────────────────────────────────────────

const AMBIGUOUS = new Set("O0lI1|`\"'");
const LOWERCASE_CHARS = "abcdefghijklmnopqrstuvwxyz";
const UPPERCASE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const NUMBER_CHARS = "0123456789";
const SYMBOL_CHARS = "!@#$%^&*()_+~|}{[]:;?><,./-=";
const VOWELS = "aeiou";
const CONSONANTS = "bcdfghjklmnprstvwxyz";

interface PolicyPreset {
  name: string;
  length: number;
  upper: boolean;
  lower: boolean;
  numbers: boolean;
  symbols: boolean;
  excludeAmbiguous: boolean;
}

const POLICY_PRESETS: PolicyPreset[] = [
  { name: "WiFi Password", length: 12, upper: true, lower: true, numbers: true, symbols: false, excludeAmbiguous: true },
  { name: "Bank PIN", length: 6, upper: false, lower: false, numbers: true, symbols: false, excludeAmbiguous: false },
  { name: "API Key", length: 32, upper: true, lower: true, numbers: true, symbols: false, excludeAmbiguous: false },
  { name: "Master Password", length: 24, upper: true, lower: true, numbers: true, symbols: true, excludeAmbiguous: false },
  { name: "NIST Compliant", length: 15, upper: true, lower: true, numbers: true, symbols: false, excludeAmbiguous: true },
];

type Mode = "password" | "passphrase" | "pronounceable" | "pattern";
type HIBPStatus = "idle" | "checking" | "safe" | "breached" | "error";

interface SavedPreset {
  id: string;
  name: string;
  mode: Mode;
  length: number;
  upper: boolean;
  lower: boolean;
  numbers: boolean;
  symbols: boolean;
  excludeAmbiguous: boolean;
  minUpper: number;
  minLower: number;
  minNumbers: number;
  minSymbols: number;
  wordCount: number;
  wordSeparator: string;
  capitalizeWords: boolean;
  appendNumber: boolean;
  pronounceableLength: number;
  pattern: string;
}

// ─── CSPRNG helpers ───────────────────────────────────────────────────────────

/** Returns a uniformly distributed integer in [0, max) using rejection sampling to avoid modulo bias. */
function cryptoRandom(max: number): number {
  const limit = Math.floor(0x100000000 / max) * max;
  const buf = new Uint32Array(1);
  let val: number;
  do {
    crypto.getRandomValues(buf);
    val = buf[0];
  } while (val >= limit);
  return val % max;
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = cryptoRandom(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function filterAmbiguous(s: string): string {
  return s.split("").filter((c) => !AMBIGUOUS.has(c)).join("");
}

// ─── Entropy & strength helpers ───────────────────────────────────────────────

function calculateEntropy(charsetSize: number, length: number): number {
  if (charsetSize <= 1 || length <= 0) return 0;
  return length * Math.log2(charsetSize);
}

function formatCrackTime(bits: number, guessesPerSec: number): string {
  if (bits === 0) return "—";
  const seconds = Math.pow(2, bits) / guessesPerSec / 2; // avg: half keyspace
  if (seconds < 1) return "< 1 second";
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)}h`;
  if (seconds < 86400 * 30) return `${Math.round(seconds / 86400)}d`;
  if (seconds < 86400 * 365) return `${Math.round(seconds / (86400 * 30))} months`;
  const years = seconds / (86400 * 365.25);
  if (years < 1e6) return `${Math.round(years).toLocaleString()} years`;
  if (years < 1e9) return `${(years / 1e6).toFixed(1)}M years`;
  if (years < 1e12) return `${(years / 1e9).toFixed(1)}B years`;
  return "> 1 trillion years";
}

function strengthInfo(bits: number): { label: string; color: string; fraction: number } {
  if (bits < 40) return { label: "Weak", color: "bg-red-500", fraction: 0.15 };
  if (bits < 60) return { label: "Fair", color: "bg-orange-500", fraction: 0.4 };
  if (bits < 80) return { label: "Good", color: "bg-yellow-500", fraction: 0.7 };
  return { label: "Strong", color: "bg-green-500", fraction: 1 };
}

// ─── SHA-1 for HIBP k-anonymity ───────────────────────────────────────────────

async function sha1Hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-1", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

// ─── Component ────────────────────────────────────────────────────────────────

export const PasswordGenerator = () => {
  // ── Mode ─────────────────────────────────────────────────────────────────
  const [mode, setMode] = useState<Mode>("password");

  // ── Password mode ─────────────────────────────────────────────────────────
  const [length, setLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false);
  const [minUpper, setMinUpper] = useState(0);
  const [minLower, setMinLower] = useState(0);
  const [minNumbers, setMinNumbers] = useState(0);
  const [minSymbols, setMinSymbols] = useState(0);
  const [showMinReqs, setShowMinReqs] = useState(false);

  // ── Passphrase mode ───────────────────────────────────────────────────────
  const [wordCount, setWordCount] = useState(4);
  const [wordSeparator, setWordSeparator] = useState("-");
  const [capitalizeWords, setCapitalizeWords] = useState(false);
  const [appendNumber, setAppendNumber] = useState(false);

  // ── Pronounceable mode ────────────────────────────────────────────────────
  const [pronounceableLength, setPronounceable] = useState(12);

  // ── Pattern mode ──────────────────────────────────────────────────────────
  const [pattern, setPattern] = useState("LLLL-NNNN-LLLL");

  // ── Bulk ──────────────────────────────────────────────────────────────────
  const [bulkCount, setBulkCount] = useState(1);

  // ── Output ────────────────────────────────────────────────────────────────
  const [password, setPassword] = useState("");
  const [bulkPasswords, setBulkPasswords] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [bulkCopied, setBulkCopied] = useState(false);
  const [clipboardCountdown, setClipboardCountdown] = useState<number | null>(null);

  // ── HIBP ──────────────────────────────────────────────────────────────────
  const [hibpStatus, setHibpStatus] = useState<HIBPStatus>("idle");
  const [hibpCount, setHibpCount] = useState(0);

  // ── Presets ───────────────────────────────────────────────────────────────
  const [activePreset, setActivePreset] = useState("custom");
  const [savedPresets, setSavedPresets] = useLocalStorage<SavedPreset[]>("pw-gen-presets", []);
  const [savePresetName, setSavePresetName] = useState("");
  const [showSaveInput, setShowSaveInput] = useState(false);

  // ── UI ────────────────────────────────────────────────────────────────────
  const [showQR, setShowQR] = useState(false);
  const [showAttackTable, setShowAttackTable] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Generation helpers ────────────────────────────────────────────────────

  const buildCharset = useCallback(() => {
    let cs = "";
    if (includeLowercase) cs += LOWERCASE_CHARS;
    if (includeUppercase) cs += UPPERCASE_CHARS;
    if (includeNumbers) cs += NUMBER_CHARS;
    if (includeSymbols) cs += SYMBOL_CHARS;
    if (excludeAmbiguous) cs = filterAmbiguous(cs);
    return cs || LOWERCASE_CHARS;
  }, [includeLowercase, includeUppercase, includeNumbers, includeSymbols, excludeAmbiguous]);

  const generateSingle = useCallback((): string => {
    const charset = buildCharset();
    const lower = excludeAmbiguous ? filterAmbiguous(LOWERCASE_CHARS) : LOWERCASE_CHARS;
    const upper = excludeAmbiguous ? filterAmbiguous(UPPERCASE_CHARS) : UPPERCASE_CHARS;
    const nums = excludeAmbiguous ? filterAmbiguous(NUMBER_CHARS) : NUMBER_CHARS;

    const required: string[] = [];
    if (includeLowercase && minLower > 0)
      for (let i = 0; i < minLower; i++) required.push(lower[cryptoRandom(lower.length)]);
    if (includeUppercase && minUpper > 0)
      for (let i = 0; i < minUpper; i++) required.push(upper[cryptoRandom(upper.length)]);
    if (includeNumbers && minNumbers > 0)
      for (let i = 0; i < minNumbers; i++) required.push(nums[cryptoRandom(nums.length)]);
    if (includeSymbols && minSymbols > 0)
      for (let i = 0; i < minSymbols; i++) required.push(SYMBOL_CHARS[cryptoRandom(SYMBOL_CHARS.length)]);

    const remaining = Math.max(0, length - required.length);
    const random: string[] = [];
    for (let i = 0; i < remaining; i++) random.push(charset[cryptoRandom(charset.length)]);
    return shuffleArray([...required, ...random]).join("");
  }, [buildCharset, length, minLower, minUpper, minNumbers, minSymbols, includeLowercase, includeUppercase, includeNumbers, includeSymbols, excludeAmbiguous]);

  const generatePassphrase = useCallback((): string => {
    const words = Array.from({ length: wordCount }, () => {
      let word = WORDLIST[cryptoRandom(WORDLIST.length)];
      if (capitalizeWords) word = word.charAt(0).toUpperCase() + word.slice(1);
      return word;
    });
    const sep = wordSeparator === "none" ? "" : wordSeparator;
    let result = words.join(sep);
    if (appendNumber) result += String(cryptoRandom(90) + 10);
    return result;
  }, [wordCount, wordSeparator, capitalizeWords, appendNumber]);

  const generatePronounceable = useCallback((): string => {
    const chars: string[] = [];
    for (let i = 0; i < pronounceableLength; i++) {
      chars.push(i % 2 === 0
        ? CONSONANTS[cryptoRandom(CONSONANTS.length)]
        : VOWELS[cryptoRandom(VOWELS.length)]);
    }
    chars[0] = chars[0].toUpperCase();
    chars.push(String(cryptoRandom(10)));
    chars.push(SYMBOL_CHARS[cryptoRandom(SYMBOL_CHARS.length)]);
    return chars.join("");
  }, [pronounceableLength]);

  const generateFromPattern = useCallback((): string => {
    const lower = excludeAmbiguous ? filterAmbiguous(LOWERCASE_CHARS) : LOWERCASE_CHARS;
    const upper = excludeAmbiguous ? filterAmbiguous(UPPERCASE_CHARS) : UPPERCASE_CHARS;
    const nums = excludeAmbiguous ? filterAmbiguous(NUMBER_CHARS) : NUMBER_CHARS;
    const all = lower + upper + nums + SYMBOL_CHARS;
    return pattern.split("").map((c) => {
      switch (c) {
        case "L": return lower[cryptoRandom(lower.length)];
        case "U": return upper[cryptoRandom(upper.length)];
        case "N": return nums[cryptoRandom(nums.length)];
        case "S": return SYMBOL_CHARS[cryptoRandom(SYMBOL_CHARS.length)];
        case "*": return all[cryptoRandom(all.length)];
        default: return c;
      }
    }).join("");
  }, [pattern, excludeAmbiguous]);

  const generate = useCallback(() => {
    const gen = mode === "passphrase" ? generatePassphrase
      : mode === "pronounceable" ? generatePronounceable
      : mode === "pattern" ? generateFromPattern
      : generateSingle;
    const passwords = Array.from({ length: bulkCount }, gen);
    setPassword(passwords[0]);
    setBulkPasswords(passwords);
    setCopied(false);
    setHibpStatus("idle");
    if (timerRef.current) clearInterval(timerRef.current);
    setClipboardCountdown(null);
  }, [mode, bulkCount, generateSingle, generatePassphrase, generatePronounceable, generateFromPattern]);

  // ── Clipboard auto-clear ──────────────────────────────────────────────────

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const startClipboardTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setClipboardCountdown(30);
    timerRef.current = setInterval(() => {
      setClipboardCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timerRef.current!);
          navigator.clipboard.writeText("").catch(() => {});
          setCopied(false);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const copyToClipboard = () => {
    if (!password) return;
    navigator.clipboard.writeText(password).then(() => {
      setCopied(true);
      startClipboardTimer();
    }).catch(() => {});
  };

  const copyAll = () => {
    navigator.clipboard.writeText(bulkPasswords.join("\n")).then(() => {
      setBulkCopied(true);
      setTimeout(() => setBulkCopied(false), 2000);
    }).catch(() => {});
  };

  const downloadTxt = () => {
    const blob = new Blob([bulkPasswords.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "passwords.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── HIBP breach check ─────────────────────────────────────────────────────

  const checkHIBP = async () => {
    if (!password) return;
    setHibpStatus("checking");
    try {
      const hash = await sha1Hex(password);
      const prefix = hash.slice(0, 5);
      const suffix = hash.slice(5);
      const resp = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
      const text = await resp.text();
      const line = text.split("\r\n").find((l) => l.startsWith(suffix));
      if (line) {
        setHibpCount(parseInt(line.split(":")[1], 10));
        setHibpStatus("breached");
      } else {
        setHibpStatus("safe");
        setHibpCount(0);
      }
    } catch {
      setHibpStatus("error");
    }
  };

  // ── QR code ───────────────────────────────────────────────────────────────

  useEffect(() => {
    if (showQR && canvasRef.current && password) {
      QRCode.toCanvas(canvasRef.current, password, { width: 256, margin: 2 }).catch(() => {});
    }
  }, [showQR, password]);

  // ── Entropy ───────────────────────────────────────────────────────────────

  const entropy = (() => {
    if (!password) return 0;
    switch (mode) {
      case "passphrase":
        return calculateEntropy(WORDLIST.length, wordCount);
      case "pronounceable":
        return calculateEntropy(VOWELS.length + CONSONANTS.length, pronounceableLength)
          + Math.log2(10) + Math.log2(SYMBOL_CHARS.length);
      case "pattern": {
        const lower = excludeAmbiguous ? filterAmbiguous(LOWERCASE_CHARS).length : LOWERCASE_CHARS.length;
        const upper = excludeAmbiguous ? filterAmbiguous(UPPERCASE_CHARS).length : UPPERCASE_CHARS.length;
        const nums = excludeAmbiguous ? filterAmbiguous(NUMBER_CHARS).length : NUMBER_CHARS.length;
        let bits = 0;
        for (const c of pattern) {
          switch (c) {
            case "L": bits += Math.log2(lower); break;
            case "U": bits += Math.log2(upper); break;
            case "N": bits += Math.log2(nums); break;
            case "S": bits += Math.log2(SYMBOL_CHARS.length); break;
            case "*": bits += Math.log2(lower + upper + nums + SYMBOL_CHARS.length); break;
          }
        }
        return bits;
      }
      default:
        return calculateEntropy(buildCharset().length, length);
    }
  })();

  const strength = strengthInfo(entropy);
  const totalMins = minUpper + minLower + minNumbers + minSymbols;
  const minsExceedLength = totalMins > length;

  // ── Preset helpers ────────────────────────────────────────────────────────

  const applyPolicyPreset = (presetName: string) => {
    const p = POLICY_PRESETS.find((x) => x.name === presetName);
    if (!p) return;
    setMode("password");
    setLength(p.length);
    setIncludeUppercase(p.upper);
    setIncludeLowercase(p.lower);
    setIncludeNumbers(p.numbers);
    setIncludeSymbols(p.symbols);
    setExcludeAmbiguous(p.excludeAmbiguous);
    setActivePreset(presetName);
  };

  const applySavedPreset = (p: SavedPreset) => {
    setMode(p.mode);
    setLength(p.length);
    setIncludeUppercase(p.upper);
    setIncludeLowercase(p.lower);
    setIncludeNumbers(p.numbers);
    setIncludeSymbols(p.symbols);
    setExcludeAmbiguous(p.excludeAmbiguous);
    setMinUpper(p.minUpper);
    setMinLower(p.minLower);
    setMinNumbers(p.minNumbers);
    setMinSymbols(p.minSymbols);
    setWordCount(p.wordCount);
    setWordSeparator(p.wordSeparator);
    setCapitalizeWords(p.capitalizeWords);
    setAppendNumber(p.appendNumber);
    setPronounceable(p.pronounceableLength);
    setPattern(p.pattern);
    setActivePreset("custom");
  };

  const saveCurrentPreset = () => {
    if (!savePresetName.trim() || savedPresets.length >= 10) return;
    const newPreset: SavedPreset = {
      id: Date.now().toString(),
      name: savePresetName.trim(),
      mode, length,
      upper: includeUppercase, lower: includeLowercase,
      numbers: includeNumbers, symbols: includeSymbols,
      excludeAmbiguous, minUpper, minLower, minNumbers, minSymbols,
      wordCount, wordSeparator, capitalizeWords, appendNumber,
      pronounceableLength, pattern,
    };
    setSavedPresets([...savedPresets, newPreset]);
    setSavePresetName("");
    setShowSaveInput(false);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Password Generator</CardTitle>
        <CardDescription>
          Generate secure, random passwords using cryptographic randomness
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* ── Mode Tabs ─────────────────────────────────────────────────── */}
        <Tabs
          value={mode}
          onValueChange={(v) => {
            setMode(v as Mode);
            setPassword("");
            setBulkPasswords([]);
            setHibpStatus("idle");
          }}
        >
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="password">Password</TabsTrigger>
            <TabsTrigger value="passphrase">Passphrase</TabsTrigger>
            <TabsTrigger value="pronounceable">Pronounceable</TabsTrigger>
            <TabsTrigger value="pattern">Pattern</TabsTrigger>
          </TabsList>

          {/* ── Password settings ────────────────────────────────────── */}
          <TabsContent value="password" className="space-y-4 mt-4">
            <div className="flex items-center gap-3">
              <Label className="shrink-0 text-sm">Policy preset</Label>
              <Select value={activePreset} onValueChange={applyPolicyPreset}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Custom" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">Custom</SelectItem>
                  {POLICY_PRESETS.map((p) => (
                    <SelectItem key={p.name} value={p.name}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Password length</Label>
                <span className="text-sm font-mono font-medium tabular-nums">{length}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-5">8</span>
                <Slider
                  min={8} max={128} value={[length]}
                  onValueChange={([v]) => { setLength(v); setActivePreset("custom"); }}
                  className="flex-1"
                  aria-label="Password length"
                />
                <span className="text-xs text-muted-foreground w-8 text-right">128</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: "Uppercase (A-Z)", checked: includeUppercase, set: setIncludeUppercase, id: "uc" },
                { label: "Lowercase (a-z)", checked: includeLowercase, set: setIncludeLowercase, id: "lc" },
                { label: "Numbers (0-9)", checked: includeNumbers, set: setIncludeNumbers, id: "num" },
                { label: "Symbols (!@#…)", checked: includeSymbols, set: setIncludeSymbols, id: "sym" },
              ].map(({ label, checked, set, id }) => (
                <div key={id} className="flex items-center gap-2">
                  <Switch
                    id={id} checked={checked}
                    onCheckedChange={(v) => { set(v); setActivePreset("custom"); }}
                    aria-label={label}
                  />
                  <Label htmlFor={id} className="cursor-pointer">{label}</Label>
                </div>
              ))}
              <div className="flex items-center gap-2 sm:col-span-2">
                <Switch
                  id="excl-amb" checked={excludeAmbiguous}
                  onCheckedChange={(v) => { setExcludeAmbiguous(v); setActivePreset("custom"); }}
                  aria-label="Exclude ambiguous characters"
                />
                <Label htmlFor="excl-amb" className="cursor-pointer">
                  Exclude ambiguous characters (O, 0, l, I, 1)
                </Label>
              </div>
            </div>

            <Collapsible open={showMinReqs} onOpenChange={setShowMinReqs}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-full justify-between text-sm">
                  Minimum character requirements
                  {showMinReqs ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3 pt-3">
                {minsExceedLength && (
                  <p className="flex items-center gap-1.5 text-xs text-destructive">
                    <AlertTriangle className="h-3 w-3 shrink-0" />
                    Minimums exceed length — reduce them or increase length
                  </p>
                )}
                {[
                  { label: "Min uppercase", val: minUpper, set: setMinUpper, enabled: includeUppercase },
                  { label: "Min lowercase", val: minLower, set: setMinLower, enabled: includeLowercase },
                  { label: "Min numbers", val: minNumbers, set: setMinNumbers, enabled: includeNumbers },
                  { label: "Min symbols", val: minSymbols, set: setMinSymbols, enabled: includeSymbols },
                ].map(({ label, val, set, enabled }) => (
                  <div key={label} className="flex items-center gap-3">
                    <Label className="w-28 text-sm shrink-0 text-muted-foreground">{label}</Label>
                    <Slider
                      min={0} max={8} value={[val]}
                      onValueChange={([v]) => set(v)}
                      disabled={!enabled}
                      className="flex-1"
                      aria-label={label}
                    />
                    <span className="w-4 text-sm text-right tabular-nums">{val}</span>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>
          </TabsContent>

          {/* ── Passphrase settings ──────────────────────────────────── */}
          <TabsContent value="passphrase" className="space-y-4 mt-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Word count</Label>
                <span className="text-sm font-mono font-medium tabular-nums">{wordCount}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">3</span>
                <Slider
                  min={3} max={8} value={[wordCount]}
                  onValueChange={([v]) => setWordCount(v)}
                  className="flex-1"
                  aria-label="Word count"
                />
                <span className="text-xs text-muted-foreground">8</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Label className="shrink-0">Separator</Label>
              <Select value={wordSeparator} onValueChange={setWordSeparator}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="-">Hyphen ( - )</SelectItem>
                  <SelectItem value=" ">Space</SelectItem>
                  <SelectItem value=".">Dot ( . )</SelectItem>
                  <SelectItem value="_">Underscore ( _ )</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Switch id="cap-words" checked={capitalizeWords} onCheckedChange={setCapitalizeWords} aria-label="Capitalize words" />
                <Label htmlFor="cap-words" className="cursor-pointer">Capitalize each word</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch id="append-num" checked={appendNumber} onCheckedChange={setAppendNumber} aria-label="Append number" />
                <Label htmlFor="append-num" className="cursor-pointer">Append 2-digit number</Label>
              </div>
            </div>
          </TabsContent>

          {/* ── Pronounceable settings ───────────────────────────────── */}
          <TabsContent value="pronounceable" className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">
              Alternates consonants and vowels for readability. A digit and symbol are appended for policy compliance.
            </p>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Base length</Label>
                <span className="text-sm font-mono font-medium tabular-nums">{pronounceableLength}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">8</span>
                <Slider
                  min={8} max={24} value={[pronounceableLength]}
                  onValueChange={([v]) => setPronounceable(v)}
                  className="flex-1"
                  aria-label="Pronounceable password length"
                />
                <span className="text-xs text-muted-foreground">24</span>
              </div>
            </div>
          </TabsContent>

          {/* ── Pattern settings ─────────────────────────────────────── */}
          <TabsContent value="pattern" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="pattern-input">Pattern</Label>
              <Input
                id="pattern-input"
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                placeholder="e.g. LLLL-NNNN-LLLL"
                className="font-mono"
                aria-label="Password pattern"
              />
            </div>
            <div className="rounded-md border bg-muted/40 p-3 space-y-1.5">
              <p className="font-semibold text-sm mb-2">Pattern key</p>
              {[
                ["L", "random lowercase letter"],
                ["U", "random uppercase letter"],
                ["N", "random digit (0–9)"],
                ["S", "random symbol (!@#…)"],
                ["*", "any random character"],
                ["other", "used literally (e.g. - or /)"],
              ].map(([k, v]) => (
                <p key={k} className="text-xs">
                  <code className="bg-muted px-1 rounded font-mono">{k}</code>
                  <span className="text-muted-foreground ml-2">— {v}</span>
                </p>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* ── Bulk quantity ──────────────────────────────────────────────── */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>Quantity</Label>
            <span className="text-sm font-mono font-medium tabular-nums">{bulkCount}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">1</span>
            <Slider
              min={1} max={50} value={[bulkCount]}
              onValueChange={([v]) => setBulkCount(v)}
              className="flex-1"
              aria-label="Number of passwords to generate"
            />
            <span className="text-xs text-muted-foreground">50</span>
          </div>
        </div>

        <Separator />

        {/* ── Output area ───────────────────────────────────────────────── */}
        <div className="space-y-3">
          {/* Screen-reader live region */}
          <div aria-live="polite" className="sr-only">
            {password ? `New password generated` : ""}
          </div>

          <div className="flex items-center gap-2">
            <Input
              value={password}
              readOnly
              className="font-mono text-base flex-1"
              placeholder="Click Generate to create a password"
              aria-label="Generated password"
            />
            <Button
              variant="outline" size="icon"
              onClick={copyToClipboard}
              disabled={!password}
              title="Copy to clipboard"
              aria-label="Copy password to clipboard"
            >
              <Copy className="h-4 w-4" />
            </Button>

            {/* QR Code */}
            <Dialog open={showQR} onOpenChange={setShowQR}>
              <DialogTrigger asChild>
                <Button
                  variant="outline" size="icon"
                  disabled={!password}
                  title="Show QR code"
                  aria-label="Show QR code for this password"
                >
                  <QrCode className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                  <DialogTitle>QR Code</DialogTitle>
                </DialogHeader>
                <p className="text-sm text-muted-foreground">
                  Scan to transfer this password to another device.
                </p>
                <div className="flex justify-center py-2">
                  <canvas ref={canvasRef} />
                </div>
              </DialogContent>
            </Dialog>

            <Button
              variant="outline" size="icon"
              onClick={generate}
              title="Generate new password"
              aria-label="Generate a new password"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          {/* Clipboard feedback + auto-clear countdown */}
          {copied && (
            <div className="flex items-center justify-between rounded-md bg-green-50 dark:bg-green-950 px-3 py-2 text-sm text-green-800 dark:text-green-200">
              <span>Copied to clipboard!</span>
              {clipboardCountdown !== null && (
                <span className="text-xs opacity-70">
                  Clipboard clears in {clipboardCountdown}s
                </span>
              )}
            </div>
          )}

          {/* HIBP breach check */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline" size="sm"
              onClick={checkHIBP}
              disabled={!password || hibpStatus === "checking"}
              aria-label="Check if this password has appeared in a data breach"
            >
              {hibpStatus === "checking"
                ? <Loader2 className="h-3 w-3 animate-spin mr-1" />
                : <Shield className="h-3 w-3 mr-1" />}
              Check breach database
            </Button>
            {hibpStatus === "safe" && (
              <span className="flex items-center gap-1 text-xs text-green-700 dark:text-green-400">
                <ShieldCheck className="h-3 w-3" />
                Not found in known breaches
              </span>
            )}
            {hibpStatus === "breached" && (
              <span className="flex items-center gap-1 text-xs text-red-700 dark:text-red-400">
                <ShieldAlert className="h-3 w-3" />
                Found {hibpCount.toLocaleString()} times in breached databases
              </span>
            )}
            {hibpStatus === "error" && (
              <span className="text-xs text-muted-foreground">Check failed — network error?</span>
            )}
          </div>

          {/* Strength bar + entropy */}
          {password && (
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium">{strength.label}</span>
                <span className="text-muted-foreground tabular-nums">
                  {entropy.toFixed(1)} bits of entropy
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${strength.color}`}
                  style={{ width: `${Math.min(strength.fraction * 100, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* ── Generate button ───────────────────────────────────────────── */}
        <Button onClick={generate} className="w-full" size="lg">
          Generate {bulkCount > 1 ? `${bulkCount} Passwords` : "Password"}
        </Button>

        {/* ── Bulk password list ────────────────────────────────────────── */}
        {bulkCount > 1 && bulkPasswords.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Generated passwords</Label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={copyAll} aria-label="Copy all passwords">
                  <Copy className="h-3 w-3 mr-1" />
                  {bulkCopied ? "Copied!" : "Copy all"}
                </Button>
                <Button variant="outline" size="sm" onClick={downloadTxt} aria-label="Download as text file">
                  <Download className="h-3 w-3 mr-1" />
                  Download
                </Button>
              </div>
            </div>
            <ScrollArea className="h-48 rounded-md border p-2">
              <div className="space-y-1">
                {bulkPasswords.map((pw, i) => (
                  <div key={i} className="flex items-center gap-2 group py-0.5">
                    <span className="font-mono text-sm flex-1 truncate select-all">{pw}</span>
                    <Button
                      variant="ghost" size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 shrink-0 transition-opacity"
                      onClick={() => navigator.clipboard.writeText(pw)}
                      aria-label={`Copy password ${i + 1}`}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        <Separator />

        {/* ── Saved presets ─────────────────────────────────────────────── */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Saved settings</Label>
            <Button
              variant="ghost" size="sm"
              onClick={() => setShowSaveInput(!showSaveInput)}
              disabled={savedPresets.length >= 10}
              aria-label="Save current settings as a preset"
            >
              <Save className="h-3 w-3 mr-1" />
              Save current
            </Button>
          </div>

          {showSaveInput && (
            <div className="flex gap-2">
              <Input
                value={savePresetName}
                onChange={(e) => setSavePresetName(e.target.value)}
                placeholder="Preset name…"
                className="flex-1"
                onKeyDown={(e) => e.key === "Enter" && saveCurrentPreset()}
                aria-label="Name for saved preset"
              />
              <Button size="sm" onClick={saveCurrentPreset} disabled={!savePresetName.trim()}>
                Save
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowSaveInput(false)}>
                Cancel
              </Button>
            </div>
          )}

          {savedPresets.length > 0 ? (
            <div className="space-y-1">
              {savedPresets.map((preset) => (
                <div key={preset.id} className="flex items-center gap-2 rounded-md border px-3 py-1.5">
                  <span className="text-sm flex-1 truncate">{preset.name}</span>
                  <span className="text-xs text-muted-foreground capitalize shrink-0">{preset.mode}</span>
                  <Button variant="ghost" size="sm" className="h-7 shrink-0" onClick={() => applySavedPreset(preset)}>
                    Load
                  </Button>
                  <Button
                    variant="ghost" size="icon"
                    className="h-7 w-7 text-destructive shrink-0"
                    onClick={() => setSavedPresets(savedPresets.filter((p) => p.id !== preset.id))}
                    aria-label={`Delete preset "${preset.name}"`}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          ) : !showSaveInput ? (
            <p className="text-xs text-muted-foreground">No saved settings yet.</p>
          ) : null}
        </div>

        {/* ── Attack scenario analysis ──────────────────────────────────── */}
        <Collapsible open={showAttackTable} onOpenChange={setShowAttackTable}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-between">
              Attack scenario analysis
              {showAttackTable ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="rounded-md border mt-2 overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left px-3 py-2 font-medium">Scenario</th>
                    <th className="text-right px-3 py-2 font-medium">Speed</th>
                    <th className="text-right px-3 py-2 font-medium">Time to crack (avg)</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {[
                    { label: "Online (throttled)", speed: 100, unit: "100 / s" },
                    { label: "Offline (bcrypt)", speed: 10_000, unit: "10K / s" },
                    { label: "Offline (MD5, GPU cluster)", speed: 100_000_000_000, unit: "100B / s" },
                  ].map(({ label, speed, unit }) => (
                    <tr key={label}>
                      <td className="px-3 py-2">{label}</td>
                      <td className="px-3 py-2 text-right text-muted-foreground">{unit}</td>
                      <td className="px-3 py-2 text-right font-mono">
                        {password ? formatCrackTime(entropy, speed) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* ── How it works ──────────────────────────────────────────────── */}
        <Collapsible open={showHowItWorks} onOpenChange={setShowHowItWorks}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-between">
              <span className="flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5" />
                How it works
              </span>
              {showHowItWorks ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mt-2 space-y-4 rounded-md border p-4 text-sm text-muted-foreground">
              <div className="flex items-start gap-3">
                <ShieldCheck className="h-4 w-4 mt-0.5 text-green-600 shrink-0" />
                <div>
                  <p className="font-medium text-foreground">Cryptographically secure randomness</p>
                  <p className="mt-0.5">
                    Uses{" "}
                    <code className="text-xs bg-muted px-1 rounded">crypto.getRandomValues()</code>
                    {" "}(CSPRNG), not{" "}
                    <code className="text-xs bg-muted px-1 rounded">Math.random()</code>.
                    Rejection sampling prevents modulo bias.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="h-4 w-4 mt-0.5 text-blue-600 shrink-0" />
                <div>
                  <p className="font-medium text-foreground">Entropy formula</p>
                  <p className="mt-0.5">
                    Entropy = length × log₂(charset size). A 16-character password using all character types yields ~105 bits — sufficient to resist any brute-force attack.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Info className="h-4 w-4 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-foreground">Breach check uses k-anonymity</p>
                  <p className="mt-0.5">
                    Only the first 5 characters of the SHA-1 hash are sent to the Have I Been Pwned API. Your actual password never leaves your browser.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ShieldCheck className="h-4 w-4 mt-0.5 text-green-600 shrink-0" />
                <div>
                  <p className="font-medium text-foreground">Private by design</p>
                  <p className="mt-0.5">
                    All generation runs locally in your browser. No passwords are transmitted or stored on any server. Saved presets persist only in your browser's localStorage.
                  </p>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

      </CardContent>
    </Card>
  );
};
