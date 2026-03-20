import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Download, Check } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type PatternTypeId =
  | "dots"
  | "grid"
  | "diagonal"
  | "hexagons"
  | "chevrons"
  | "topographic"
  | "waves"
  | "stars"
  | "triangles"
  | "brick"
  | "crosshatch"
  | "diamonds";

interface PatternConfig {
  patternType: PatternTypeId;
  fgColor: string;
  bgColor: string;
  size: number;
  strokeWidth: number;
  opacity: number;
  gap: number;
}

interface Preset {
  name: string;
  config: PatternConfig;
}

// ─── Pattern metadata ─────────────────────────────────────────────────────────

const PATTERN_TYPES: { id: PatternTypeId; label: string; emoji: string }[] = [
  { id: "dots",        label: "Polka Dots",     emoji: "⚫" },
  { id: "grid",        label: "Grid",           emoji: "▦" },
  { id: "diagonal",    label: "Diagonal Lines", emoji: "╱" },
  { id: "hexagons",    label: "Hexagons",       emoji: "⬡" },
  { id: "chevrons",    label: "Chevrons",       emoji: "❯" },
  { id: "topographic", label: "Topographic",    emoji: "◎" },
  { id: "waves",       label: "Waves",          emoji: "∿" },
  { id: "stars",       label: "Stars",          emoji: "✦" },
  { id: "triangles",   label: "Triangles",      emoji: "△" },
  { id: "brick",       label: "Brick",          emoji: "▬" },
  { id: "crosshatch",  label: "Cross-hatch",    emoji: "✕" },
  { id: "diamonds",    label: "Diamonds",       emoji: "◆" },
];

// ─── Presets ──────────────────────────────────────────────────────────────────

const PRESETS: Preset[] = [
  { name: "Blueprint",       config: { patternType: "grid",        fgColor: "#4a9eff", bgColor: "#0a2040", size: 40, strokeWidth: 1,   opacity: 0.6, gap: 0  } },
  { name: "Honeycomb",       config: { patternType: "hexagons",    fgColor: "#f59e0b", bgColor: "#fffbeb", size: 50, strokeWidth: 2,   opacity: 0.8, gap: 4  } },
  { name: "Topography",      config: { patternType: "topographic", fgColor: "#10b981", bgColor: "#f0fdf4", size: 60, strokeWidth: 1.5, opacity: 0.5, gap: 12 } },
  { name: "Carbon Fibre",    config: { patternType: "diagonal",    fgColor: "#374151", bgColor: "#111827", size: 20, strokeWidth: 3,   opacity: 0.9, gap: 0  } },
  { name: "Graph Paper",     config: { patternType: "grid",        fgColor: "#93c5fd", bgColor: "#ffffff", size: 30, strokeWidth: 0.5, opacity: 0.7, gap: 0  } },
  { name: "Polka Pop",       config: { patternType: "dots",        fgColor: "#ec4899", bgColor: "#fdf2f8", size: 30, strokeWidth: 2,   opacity: 1.0, gap: 10 } },
  { name: "Stars & Sky",     config: { patternType: "stars",       fgColor: "#fbbf24", bgColor: "#1e1b4b", size: 40, strokeWidth: 1.5, opacity: 0.9, gap: 8  } },
  { name: "Brick Wall",      config: { patternType: "brick",       fgColor: "#b45309", bgColor: "#fef3c7", size: 40, strokeWidth: 2,   opacity: 0.7, gap: 4  } },
  { name: "Denim",           config: { patternType: "diagonal",    fgColor: "#3b82f6", bgColor: "#1e40af", size: 14, strokeWidth: 2,   opacity: 0.5, gap: 0  } },
  { name: "Architect",       config: { patternType: "crosshatch",  fgColor: "#6b7280", bgColor: "#f9fafb", size: 24, strokeWidth: 0.8, opacity: 0.6, gap: 0  } },
  { name: "Chevron",         config: { patternType: "chevrons",    fgColor: "#7c3aed", bgColor: "#f5f3ff", size: 32, strokeWidth: 2.5, opacity: 0.8, gap: 0  } },
  { name: "Triangle Mosaic", config: { patternType: "triangles",   fgColor: "#f97316", bgColor: "#fff7ed", size: 48, strokeWidth: 1.5, opacity: 0.7, gap: 2  } },
  { name: "Diamond Grid",    config: { patternType: "diamonds",    fgColor: "#0ea5e9", bgColor: "#f0f9ff", size: 32, strokeWidth: 1.5, opacity: 0.7, gap: 6  } },
  { name: "Seigaiha",        config: { patternType: "topographic", fgColor: "#059669", bgColor: "#ecfdf5", size: 50, strokeWidth: 2,   opacity: 0.6, gap: 8  } },
  { name: "Houndstooth",     config: { patternType: "crosshatch",  fgColor: "#1f2937", bgColor: "#ffffff", size: 20, strokeWidth: 1,   opacity: 1.0, gap: 0  } },
  { name: "Waves Ocean",     config: { patternType: "waves",       fgColor: "#38bdf8", bgColor: "#0c4a6e", size: 48, strokeWidth: 2,   opacity: 0.8, gap: 4  } },
];

// ─── SVG pattern generators ───────────────────────────────────────────────────

function hexPoints(cx: number, cy: number, r: number): string {
  return Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 180) * (60 * i - 30);
    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
  }).join(" ");
}

function starPoints(cx: number, cy: number, outerR: number, innerR: number, points: number): string {
  const pts: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (Math.PI / points) * i - Math.PI / 2;
    pts.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
  }
  return pts.join(" ");
}

function buildPattern(cfg: PatternConfig): { patternTag: string; width: number; height: number } {
  const { patternType, fgColor, size, strokeWidth, gap } = cfg;
  const s = size;
  const sw = strokeWidth;
  const r = Math.max(2, s / 2 - gap);

  const stroke = `stroke="${fgColor}" stroke-width="${sw}" fill="none"`;
  const fill = `fill="${fgColor}"`;

  switch (patternType) {
    case "dots": {
      const dotR = Math.max(1, r / 2);
      return {
        width: s, height: s,
        patternTag: `<circle cx="${s / 2}" cy="${s / 2}" r="${dotR}" ${fill} opacity="${cfg.opacity}" />`,
      };
    }
    case "grid": {
      return {
        width: s, height: s,
        patternTag: `<path d="M ${s} 0 L 0 0 0 ${s}" ${stroke} opacity="${cfg.opacity}" />`,
      };
    }
    case "diagonal": {
      return {
        width: s, height: s,
        patternTag: `<line x1="0" y1="${s}" x2="${s}" y2="0" ${stroke} opacity="${cfg.opacity}" />
<line x1="${-s}" y1="${s}" x2="${0}" y2="0" ${stroke} opacity="${cfg.opacity}" />
<line x1="${s}" y1="${s * 2}" x2="${s * 2}" y2="${s}" ${stroke} opacity="${cfg.opacity}" />`,
      };
    }
    case "hexagons": {
      const hexR = s / 2 - gap / 2;
      const w = hexR * 2;
      const h = Math.sqrt(3) * hexR;
      const pts1 = hexPoints(w / 2, h / 2, hexR);
      const pts2 = hexPoints(w, h, hexR);
      return {
        width: w, height: h,
        patternTag: `<polygon points="${pts1}" ${stroke} opacity="${cfg.opacity}" />
<polygon points="${pts2}" ${stroke} opacity="${cfg.opacity}" />`,
      };
    }
    case "chevrons": {
      const h = s / 2;
      return {
        width: s, height: h,
        patternTag: `<polyline points="0,${h} ${s / 2},0 ${s},${h}" ${stroke} opacity="${cfg.opacity}" />`,
      };
    }
    case "topographic": {
      const rings: string[] = [];
      const step = Math.max(8, s / 5);
      for (let i = 1; i <= 4; i++) {
        rings.push(`<circle cx="${s / 2}" cy="${s / 2}" r="${step * i}" ${stroke} opacity="${cfg.opacity}" />`);
      }
      return { width: s, height: s, patternTag: rings.join("\n") };
    }
    case "waves": {
      const half = s / 2;
      const amp = Math.max(4, s / 6);
      return {
        width: s, height: s,
        patternTag: `<path d="M0,${half} C${s / 4},${half - amp} ${3 * s / 4},${half + amp} ${s},${half}" ${stroke} opacity="${cfg.opacity}" />`,
      };
    }
    case "stars": {
      const outerR = Math.max(4, s / 2 - gap);
      const innerR = outerR * 0.4;
      const pts = starPoints(s / 2, s / 2, outerR, innerR, 5);
      return {
        width: s, height: s,
        patternTag: `<polygon points="${pts}" ${stroke} opacity="${cfg.opacity}" />`,
      };
    }
    case "triangles": {
      const h2 = (s * Math.sqrt(3)) / 2;
      return {
        width: s, height: h2,
        patternTag: `<polygon points="${s / 2},0 0,${h2} ${s},${h2}" ${stroke} opacity="${cfg.opacity}" />
<polygon points="0,0 ${s / 2},${h2} ${s},0" stroke="${fgColor}" stroke-width="${sw}" fill="none" opacity="${cfg.opacity}" />`,
      };
    }
    case "brick": {
      const bH = s / 2;
      return {
        width: s, height: s,
        patternTag: `<rect x="${gap}" y="${gap}" width="${s - gap * 2}" height="${bH - gap * 2}" ${stroke} opacity="${cfg.opacity}" />
<rect x="${s / 2 + gap}" y="${bH + gap}" width="${s / 2 - gap * 2}" height="${bH - gap * 2}" ${stroke} opacity="${cfg.opacity}" />
<rect x="${gap - s / 2}" y="${bH + gap}" width="${s / 2 - gap * 2}" height="${bH - gap * 2}" ${stroke} opacity="${cfg.opacity}" />`,
      };
    }
    case "crosshatch": {
      return {
        width: s, height: s,
        patternTag: `<line x1="0" y1="${s}" x2="${s}" y2="0" ${stroke} opacity="${cfg.opacity}" />
<line x1="0" y1="0" x2="${s}" y2="${s}" ${stroke} opacity="${cfg.opacity}" />`,
      };
    }
    case "diamonds": {
      const half2 = s / 2;
      return {
        width: s, height: s,
        patternTag: `<polygon points="${half2},${gap} ${s - gap},${half2} ${half2},${s - gap} ${gap},${half2}" ${stroke} opacity="${cfg.opacity}" />`,
      };
    }
  }
}

function generateFullSVGString(cfg: PatternConfig): string {
  const { patternTag, width, height } = buildPattern(cfg);
  const pid = "p";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
  <defs>
    <pattern id="${pid}" x="0" y="0" width="${width}" height="${height}" patternUnits="userSpaceOnUse">
      ${patternTag}
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="${cfg.bgColor}" />
  <rect width="100%" height="100%" fill="url(#${pid})" />
</svg>`;
}

function svgToDataURI(svg: string): string {
  return "data:image/svg+xml," + encodeURIComponent(svg);
}

function generateCSSOutput(cfg: PatternConfig): string {
  const { patternTag, width, height } = buildPattern(cfg);
  const pid = "p";
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}'><defs><pattern id='${pid}' x='0' y='0' width='${width}' height='${height}' patternUnits='userSpaceOnUse'>${patternTag.replace(/"/g, "'")}</pattern></defs><rect width='${width}' height='${height}' fill='${cfg.bgColor}'/><rect width='${width}' height='${height}' fill='url(#${pid})'/></svg>`;
  const uri = "data:image/svg+xml," + encodeURIComponent(svg);
  return `.pattern-bg {
  background-color: ${cfg.bgColor};
  background-image: url("${uri}");
  background-repeat: repeat;
  background-size: ${width}px ${height}px;
}`;
}

function generateReactOutput(cfg: PatternConfig): string {
  const { patternTag, width, height } = buildPattern(cfg);
  const pid = "p";
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}'><defs><pattern id='${pid}' x='0' y='0' width='${width}' height='${height}' patternUnits='userSpaceOnUse'>${patternTag.replace(/"/g, "'")}</pattern></defs><rect width='${width}' height='${height}' fill='${cfg.bgColor}'/><rect width='${width}' height='${height}' fill='url(#${pid})'/></svg>`;
  const uri = "data:image/svg+xml," + encodeURIComponent(svg);
  return `export function PatternBackground({ children, className }) {
  return (
    <div
      className={className}
      style={{
        backgroundColor: "${cfg.bgColor}",
        backgroundImage: \`url("${uri}")\`,
        backgroundRepeat: "repeat",
        backgroundSize: "${width}px ${height}px",
      }}
    >
      {children}
    </div>
  );
}`;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULT_CONFIG: PatternConfig = {
  patternType: "dots",
  fgColor: "#6366f1",
  bgColor: "#f5f3ff",
  size: 40,
  strokeWidth: 1.5,
  opacity: 0.8,
  gap: 8,
};

// ─── Component ────────────────────────────────────────────────────────────────

export const SVGPatternGenerator = () => {
  const [cfg, setCfg] = useState<PatternConfig>(DEFAULT_CONFIG);
  const [exportTab, setExportTab] = useState<"svg" | "css" | "react">("svg");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const update = useCallback(<K extends keyof PatternConfig>(key: K, value: PatternConfig[K]) => {
    setCfg(prev => ({ ...prev, [key]: value }));
  }, []);

  const fullSVG = useMemo(() => generateFullSVGString(cfg), [cfg]);
  const cssOutput = useMemo(() => generateCSSOutput(cfg), [cfg]);
  const reactOutput = useMemo(() => generateReactOutput(cfg), [cfg]);
  const dataURI = useMemo(() => svgToDataURI(fullSVG), [fullSVG]);

  const exportCode = exportTab === "svg" ? fullSVG : exportTab === "css" ? cssOutput : reactOutput;

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const downloadSVG = () => {
    const blob = new Blob([fullSVG], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pattern-${cfg.patternType}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">SVG Background Pattern Generator</CardTitle>
          <CardDescription>
            Create seamless SVG background patterns — polka dots, hexagons, topographic lines, and more. Export as SVG, CSS, or React code.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">

          {/* Live Preview */}
          <div
            className="w-full h-56 rounded-xl border shadow-inner"
            style={{
              backgroundColor: cfg.bgColor,
              backgroundImage: `url("${dataURI}")`,
              backgroundRepeat: "repeat",
            }}
          />

          {/* Pattern Type Selector */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">Pattern Type</Label>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {PATTERN_TYPES.map(pt => (
                <button
                  key={pt.id}
                  onClick={() => update("patternType", pt.id)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg border text-xs font-medium transition-colors ${
                    cfg.patternType === pt.id
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/40 hover:bg-muted"
                  }`}
                >
                  <span className="text-lg leading-none">{pt.emoji}</span>
                  <span className="text-center leading-tight">{pt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Colours */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Colours</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={cfg.fgColor}
                  onChange={e => update("fgColor", e.target.value)}
                  className="h-10 w-14 cursor-pointer rounded border p-1"
                  title="Foreground colour"
                />
                <div className="flex-1">
                  <Label className="text-xs text-muted-foreground">Foreground</Label>
                  <input
                    type="text"
                    value={cfg.fgColor}
                    onChange={e => update("fgColor", e.target.value)}
                    className="w-full border rounded px-2 py-1 text-sm font-mono bg-background mt-1"
                    maxLength={9}
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={cfg.bgColor}
                  onChange={e => update("bgColor", e.target.value)}
                  className="h-10 w-14 cursor-pointer rounded border p-1"
                  title="Background colour"
                />
                <div className="flex-1">
                  <Label className="text-xs text-muted-foreground">Background</Label>
                  <input
                    type="text"
                    value={cfg.bgColor}
                    onChange={e => update("bgColor", e.target.value)}
                    className="w-full border rounded px-2 py-1 text-sm font-mono bg-background mt-1"
                    maxLength={9}
                  />
                </div>
              </div>
            </div>

            {/* Sliders */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Adjustments</Label>
              {[
                { key: "size" as const,        label: "Tile Size",    min: 10,  max: 120, step: 2,   unit: "px" },
                { key: "strokeWidth" as const, label: "Stroke Width", min: 0.5, max: 8,   step: 0.5, unit: "px" },
                { key: "opacity" as const,     label: "Opacity",      min: 0.1, max: 1.0, step: 0.05, unit: "" },
                { key: "gap" as const,         label: "Gap / Inset",  min: 0,   max: 30,  step: 1,   unit: "px" },
              ].map(({ key, label, min, max, step, unit }) => (
                <div key={key} className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{label}</span>
                    <span>{cfg[key]}{unit}</span>
                  </div>
                  <input
                    type="range"
                    min={min} max={max} step={step}
                    value={cfg[key] as number}
                    onChange={e => update(key, parseFloat(e.target.value))}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Presets */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">Presets</Label>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map(preset => {
                const { patternTag, width, height } = buildPattern(preset.config);
                const pid = "pp_" + preset.name.replace(/\s/g, "");
                const thumbSVG = `<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}'><defs><pattern id='${pid}' x='0' y='0' width='${width}' height='${height}' patternUnits='userSpaceOnUse'>${patternTag.replace(/"/g, "'")}</pattern></defs><rect width='${width}' height='${height}' fill='${preset.config.bgColor}'/><rect width='${width}' height='${height}' fill='url(#${pid})'/></svg>`;
                const thumbURI = "data:image/svg+xml," + encodeURIComponent(thumbSVG);
                return (
                  <button
                    key={preset.name}
                    onClick={() => setCfg(preset.config)}
                    title={preset.name}
                    className="h-14 w-20 rounded-lg border-2 border-transparent hover:border-primary transition-all overflow-hidden shadow-sm"
                    style={{
                      backgroundColor: preset.config.bgColor,
                      backgroundImage: `url("${thumbURI}")`,
                      backgroundRepeat: "repeat",
                    }}
                  >
                    <span className="block text-[10px] font-bold px-1 py-0.5 rounded bg-black/40 text-white leading-tight">
                      {preset.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Export */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Export</Label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => copy(exportCode, "export")}>
                  {copiedKey === "export" ? <Check className="h-4 w-4 mr-1 text-green-600" /> : <Copy className="h-4 w-4 mr-1" />}
                  {copiedKey === "export" ? "Copied!" : "Copy"}
                </Button>
                <Button variant="outline" size="sm" onClick={downloadSVG}>
                  <Download className="h-4 w-4 mr-1" />
                  Download SVG
                </Button>
              </div>
            </div>

            <Tabs value={exportTab} onValueChange={v => setExportTab(v as typeof exportTab)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="svg">SVG Markup</TabsTrigger>
                <TabsTrigger value="css">CSS</TabsTrigger>
                <TabsTrigger value="react">React</TabsTrigger>
              </TabsList>

              {(["svg", "css", "react"] as const).map(tab => (
                <TabsContent key={tab} value={tab}>
                  <pre className="bg-muted p-4 rounded-md text-xs font-mono overflow-x-auto whitespace-pre-wrap max-h-64 overflow-y-auto">
                    {tab === "svg" ? fullSVG : tab === "css" ? cssOutput : reactOutput}
                  </pre>
                </TabsContent>
              ))}
            </Tabs>
          </div>

        </CardContent>
      </Card>
    </div>
  );
};
