import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Copy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

const NAMED_SCALES = [
  { name: "Minor Second", ratio: 1.067, description: "Very subtle scale" },
  { name: "Major Second", ratio: 1.125, description: "Gentle progression" },
  { name: "Minor Third", ratio: 1.2, description: "Comfortable scale" },
  { name: "Major Third", ratio: 1.25, description: "Classic web scale" },
  { name: "Perfect Fourth", ratio: 1.333, description: "Strong contrast" },
  { name: "Augmented Fourth", ratio: 1.414, description: "Dramatic scale" },
  { name: "Perfect Fifth", ratio: 1.5, description: "Bold typographic scale" },
  { name: "Golden Ratio", ratio: 1.618, description: "Mathematically harmonious" },
  { name: "Major Sixth", ratio: 1.667, description: "Very bold scale" },
  { name: "Minor Seventh", ratio: 1.778, description: "Highly dramatic" },
  { name: "Major Seventh", ratio: 1.875, description: "Extreme scale" },
  { name: "Octave", ratio: 2.0, description: "Double each step" },
];

const STEP_NAMES = [
  "xs", "sm", "base", "lg", "xl", "2xl", "3xl", "4xl", "5xl", "6xl"
];

interface TypeStep {
  name: string;
  px: number;
  rem: number;
  ratio: number;
}

function generateScale(basePx: number, ratio: number, steps: { above: number; below: number }, rootPx: number): TypeStep[] {
  const result: TypeStep[] = [];

  for (let i = -steps.below; i <= steps.above; i++) {
    const px = basePx * Math.pow(ratio, i);
    result.push({
      name: STEP_NAMES[i + steps.below] || `step-${i}`,
      px: Math.round(px * 100) / 100,
      rem: Math.round((px / rootPx) * 1000) / 1000,
      ratio: i,
    });
  }

  return result;
}

type ExportFormat = "css" | "scss" | "tailwind" | "json";

function exportCSS(steps: TypeStep[], useRem: boolean): string {
  const vars = steps.map(s =>
    `  --font-size-${s.name}: ${useRem ? s.rem + "rem" : s.px + "px"};`
  ).join("\n");
  return `:root {\n${vars}\n}`;
}

function exportSCSS(steps: TypeStep[], useRem: boolean): string {
  return steps.map(s =>
    `$font-${s.name}: ${useRem ? s.rem + "rem" : s.px + "px"};`
  ).join("\n");
}

function exportTailwind(steps: TypeStep[], useRem: boolean): string {
  const entries = steps.map(s =>
    `    '${s.name}': ['${useRem ? s.rem + "rem" : s.px + "px"}', { lineHeight: '1.5' }]`
  ).join(",\n");
  return `// tailwind.config.js\ntheme: {\n  extend: {\n    fontSize: {\n${entries}\n    }\n  }\n}`;
}

function exportJSON(steps: TypeStep[], useRem: boolean): string {
  const obj = Object.fromEntries(steps.map(s => [s.name, useRem ? `${s.rem}rem` : `${s.px}px`]));
  return JSON.stringify(obj, null, 2);
}

const PREVIEW_TEXT = "The quick brown fox jumps over the lazy dog";

export const TypographyScaleGenerator = () => {
  const [basePx, setBasePx] = useState(16);
  const [rootPx, setRootPx] = useState(16);
  const [ratio, setRatio] = useState(1.25);
  const [customRatio, setCustomRatio] = useState("1.25");
  const [stepsAbove, setStepsAbove] = useState(6);
  const [stepsBelow, setStepsBelow] = useState(2);
  const [useRem, setUseRem] = useState(true);
  const [exportFormat, setExportFormat] = useState<ExportFormat>("css");
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  const selectedScale = NAMED_SCALES.find(s => Math.abs(s.ratio - ratio) < 0.001);

  const steps = useMemo(
    () => generateScale(basePx, ratio, { above: stepsAbove, below: stepsBelow }, rootPx),
    [basePx, ratio, stepsAbove, stepsBelow, rootPx]
  );

  const exportCode = useMemo(() => {
    switch (exportFormat) {
      case "css": return exportCSS(steps, useRem);
      case "scss": return exportSCSS(steps, useRem);
      case "tailwind": return exportTailwind(steps, useRem);
      case "json": return exportJSON(steps, useRem);
    }
  }, [steps, useRem, exportFormat]);

  const copy = () => {
    navigator.clipboard.writeText(exportCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const setScale = (r: number) => {
    setRatio(r);
    setCustomRatio(String(r));
  };

  const handleCustomRatio = (v: string) => {
    setCustomRatio(v);
    const n = parseFloat(v);
    if (n >= 1 && n <= 3) setRatio(n);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Typography Scale Generator</CardTitle>
          <CardDescription>Generate harmonious typographic scales for your design system with live preview and code export</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Settings */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-1">
              <Label>Base Size (px)</Label>
              <Input
                type="number" min="8" max="32"
                value={basePx}
                onChange={(e) => setBasePx(Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">Body text size</p>
            </div>
            <div className="space-y-1">
              <Label>Root Size (px)</Label>
              <Input
                type="number" min="8" max="32"
                value={rootPx}
                onChange={(e) => setRootPx(Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">Browser default (usually 16)</p>
            </div>
            <div className="space-y-1">
              <Label>Steps Above Base</Label>
              <Input
                type="number" min="1" max="10"
                value={stepsAbove}
                onChange={(e) => setStepsAbove(Number(e.target.value))}
              />
            </div>
            <div className="space-y-1">
              <Label>Steps Below Base</Label>
              <Input
                type="number" min="0" max="4"
                value={stepsBelow}
                onChange={(e) => setStepsBelow(Number(e.target.value))}
              />
            </div>
          </div>

          {/* Scale Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Scale Ratio: {ratio}</Label>
              <div className="flex items-center gap-2">
                <Label className="text-sm">Custom:</Label>
                <Input
                  type="number" min="1" max="3" step="0.001"
                  value={customRatio}
                  onChange={(e) => handleCustomRatio(e.target.value)}
                  className="w-24"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {NAMED_SCALES.map(s => (
                <button
                  key={s.name}
                  onClick={() => setScale(s.ratio)}
                  className={`text-left p-2 rounded-md border text-sm transition-colors ${selectedScale?.name === s.name ? "border-primary bg-primary/10" : "hover:bg-muted"}`}
                >
                  <div className="font-medium">{s.name}</div>
                  <div className="text-xs text-muted-foreground">{s.ratio} — {s.description}</div>
                </button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Unit Toggle */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch id="useRem" checked={useRem} onCheckedChange={setUseRem} />
              <Label htmlFor="useRem">Use rem values</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="showPreview" checked={showPreview} onCheckedChange={setShowPreview} />
              <Label htmlFor="showPreview">Show preview text</Label>
            </div>
          </div>

          {/* Scale Table */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">Generated Scale</Label>
            <div className="overflow-x-auto rounded-md border">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-2">Step</th>
                    <th className="text-right p-2">px</th>
                    <th className="text-right p-2">rem</th>
                    <th className="text-left p-2 pl-4">Preview</th>
                  </tr>
                </thead>
                <tbody>
                  {[...steps].reverse().map((step) => (
                    <tr key={step.name} className={`border-t ${step.ratio === 0 ? "bg-primary/5" : "hover:bg-muted/50"}`}>
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={step.ratio === 0 ? "default" : "outline"}
                            className="font-mono text-xs w-12 justify-center"
                          >
                            {step.name}
                          </Badge>
                          {step.ratio === 0 && <span className="text-xs text-muted-foreground">base</span>}
                        </div>
                      </td>
                      <td className="p-2 text-right font-mono">{step.px.toFixed(2)}</td>
                      <td className="p-2 text-right font-mono">{step.rem.toFixed(3)}</td>
                      <td className="p-2 pl-4 max-w-xs overflow-hidden">
                        {showPreview && (
                          <span
                            className="whitespace-nowrap overflow-hidden block"
                            style={{ fontSize: `${step.px}px`, lineHeight: 1.3 }}
                          >
                            {PREVIEW_TEXT}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Code Export */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Export Code</Label>
              <div className="flex gap-1">
                {(["css", "scss", "tailwind", "json"] as const).map(f => (
                  <Badge
                    key={f}
                    variant={exportFormat === f ? "default" : "outline"}
                    className="cursor-pointer uppercase"
                    onClick={() => setExportFormat(f)}
                  >
                    {f}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="relative">
              <pre className="bg-muted p-4 rounded-md text-xs font-mono overflow-x-auto whitespace-pre-wrap max-h-64">
                {exportCode}
              </pre>
              <Button
                variant="outline"
                size="sm"
                className="absolute top-2 right-2"
                onClick={copy}
              >
                <Copy className="h-3 w-3 mr-1" />
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
