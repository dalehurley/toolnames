import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Plus, Trash2 } from "lucide-react";

interface ColorStop {
  id: string;
  color: string;
  position: number;
}

type GradientType = "linear" | "radial" | "conic";
type LinearDirection = "to right" | "to left" | "to bottom" | "to top" | "to bottom right" | "to bottom left" | "to top right" | "to top left";

const DIRECTION_LABELS: Record<LinearDirection, string> = {
  "to right": "→ Right",
  "to left": "← Left",
  "to bottom": "↓ Down",
  "to top": "↑ Up",
  "to bottom right": "↘ Bottom Right",
  "to bottom left": "↙ Bottom Left",
  "to top right": "↗ Top Right",
  "to top left": "↖ Top Left",
};

const PRESETS = [
  { name: "Sunset", stops: [{ id: "1", color: "#ff6b6b", position: 0 }, { id: "2", color: "#feca57", position: 50 }, { id: "3", color: "#ff9ff3", position: 100 }], type: "linear" as GradientType, direction: "to right" as LinearDirection },
  { name: "Ocean", stops: [{ id: "1", color: "#0093E9", position: 0 }, { id: "2", color: "#80D0C7", position: 100 }], type: "linear" as GradientType, direction: "to bottom" as LinearDirection },
  { name: "Forest", stops: [{ id: "1", color: "#134E5E", position: 0 }, { id: "2", color: "#71B280", position: 100 }], type: "linear" as GradientType, direction: "to right" as LinearDirection },
  { name: "Aurora", stops: [{ id: "1", color: "#00C9FF", position: 0 }, { id: "2", color: "#92FE9D", position: 100 }], type: "linear" as GradientType, direction: "to bottom right" as LinearDirection },
  { name: "Candy", stops: [{ id: "1", color: "#FF6FD8", position: 0 }, { id: "2", color: "#3813C2", position: 100 }], type: "radial" as GradientType, direction: "to right" as LinearDirection },
  { name: "Fire", stops: [{ id: "1", color: "#f7971e", position: 0 }, { id: "2", color: "#ffd200", position: 50 }, { id: "3", color: "#f7971e", position: 100 }], type: "conic" as GradientType, direction: "to right" as LinearDirection },
];

export const CSSGradientGenerator = () => {
  const [gradientType, setGradientType] = useState<GradientType>("linear");
  const [direction, setDirection] = useState<LinearDirection>("to right");
  const [angle, setAngle] = useState(90);
  const [colorStops, setColorStops] = useState<ColorStop[]>([
    { id: "1", color: "#6366f1", position: 0 },
    { id: "2", color: "#8b5cf6", position: 100 },
  ]);
  const [copied, setCopied] = useState(false);
  const [radialShape, setRadialShape] = useState<"circle" | "ellipse">("circle");

  const getGradientCSS = useCallback(() => {
    const stops = [...colorStops].sort((a, b) => a.position - b.position);
    const stopsStr = stops.map(s => `${s.color} ${s.position}%`).join(", ");

    if (gradientType === "linear") {
      return `linear-gradient(${angle}deg, ${stopsStr})`;
    } else if (gradientType === "radial") {
      return `radial-gradient(${radialShape} at center, ${stopsStr})`;
    } else {
      return `conic-gradient(from ${angle}deg, ${stopsStr})`;
    }
  }, [colorStops, gradientType, angle, radialShape]);

  const cssValue = getGradientCSS();
  const fullCSS = `background: ${cssValue};`;

  const addColorStop = () => {
    const newId = Date.now().toString();
    const maxPos = Math.max(...colorStops.map(s => s.position));
    const minPos = Math.min(...colorStops.map(s => s.position));
    const midPos = Math.round((maxPos + minPos) / 2);
    setColorStops([...colorStops, { id: newId, color: "#10b981", position: midPos }]);
  };

  const removeColorStop = (id: string) => {
    if (colorStops.length <= 2) return;
    setColorStops(colorStops.filter(s => s.id !== id));
  };

  const updateStop = (id: string, field: "color" | "position", value: string | number) => {
    setColorStops(colorStops.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const copyCSS = () => {
    navigator.clipboard.writeText(fullCSS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setColorStops(preset.stops.map((s, i) => ({ ...s, id: String(i + 1) })));
    setGradientType(preset.type);
    if (preset.type === "linear") setDirection(preset.direction);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">CSS Gradient Generator</CardTitle>
          <CardDescription>Create beautiful CSS gradients with live preview and instant code export</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Live Preview */}
          <div
            className="w-full h-48 rounded-xl border shadow-inner"
            style={{ background: cssValue }}
          />

          {/* CSS Output */}
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-muted px-3 py-2 rounded-md text-sm font-mono overflow-x-auto">
              {fullCSS}
            </code>
            <Button variant="outline" size="icon" onClick={copyCSS} title="Copy CSS">
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          {copied && <p className="text-xs text-green-600">Copied to clipboard!</p>}

          <Tabs value={gradientType} onValueChange={(v) => setGradientType(v as GradientType)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="linear">Linear</TabsTrigger>
              <TabsTrigger value="radial">Radial</TabsTrigger>
              <TabsTrigger value="conic">Conic</TabsTrigger>
            </TabsList>

            <TabsContent value="linear" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Direction</Label>
                <div className="grid grid-cols-4 gap-2">
                  {(Object.entries(DIRECTION_LABELS) as [LinearDirection, string][]).map(([dir, label]) => (
                    <Button
                      key={dir}
                      variant={direction === dir ? "default" : "outline"}
                      size="sm"
                      onClick={() => { setDirection(dir); setAngle(dirToAngle(dir)); }}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Custom Angle: {angle}°</Label>
                <input
                  type="range" min="0" max="360" value={angle}
                  onChange={(e) => setAngle(Number(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </TabsContent>

            <TabsContent value="radial" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Shape</Label>
                <div className="flex gap-2">
                  {(["circle", "ellipse"] as const).map(shape => (
                    <Button
                      key={shape}
                      variant={radialShape === shape ? "default" : "outline"}
                      size="sm"
                      onClick={() => setRadialShape(shape)}
                    >
                      {shape.charAt(0).toUpperCase() + shape.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="conic" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Start Angle: {angle}°</Label>
                <input
                  type="range" min="0" max="360" value={angle}
                  onChange={(e) => setAngle(Number(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </TabsContent>
          </Tabs>

          {/* Color Stops */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base">Color Stops</Label>
              <Button variant="outline" size="sm" onClick={addColorStop}>
                <Plus className="h-4 w-4 mr-1" /> Add Stop
              </Button>
            </div>
            {[...colorStops].sort((a, b) => a.position - b.position).map((stop) => (
              <div key={stop.id} className="flex items-center gap-3">
                <input
                  type="color"
                  value={stop.color}
                  onChange={(e) => updateStop(stop.id, "color", e.target.value)}
                  className="h-10 w-14 cursor-pointer rounded border p-1"
                />
                <Input
                  value={stop.color}
                  onChange={(e) => updateStop(stop.id, "color", e.target.value)}
                  className="w-28 font-mono text-sm"
                />
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Position</span>
                    <span>{stop.position}%</span>
                  </div>
                  <input
                    type="range" min="0" max="100" value={stop.position}
                    onChange={(e) => updateStop(stop.id, "position", Number(e.target.value))}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <Button
                  variant="ghost" size="icon"
                  onClick={() => removeColorStop(stop.id)}
                  disabled={colorStops.length <= 2}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Presets */}
          <div className="space-y-2">
            <Label className="text-base">Presets</Label>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => applyPreset(preset)}
                  className="h-8 w-20 rounded-md border text-xs font-medium shadow-sm hover:opacity-90 transition-opacity"
                  style={{
                    background: `linear-gradient(to right, ${preset.stops.map(s => s.color).join(", ")})`
                  }}
                  title={preset.name}
                >
                  <span className="drop-shadow text-white">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Full CSS output */}
          <div className="space-y-2">
            <Label className="text-base">Full CSS</Label>
            <pre className="bg-muted p-4 rounded-md text-sm font-mono overflow-x-auto whitespace-pre-wrap">
{`.element {
  ${fullCSS}
  /* Fallback for older browsers */
  background-color: ${colorStops[0]?.color || "#6366f1"};
}`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

function dirToAngle(dir: LinearDirection): number {
  const map: Record<LinearDirection, number> = {
    "to right": 90,
    "to left": 270,
    "to bottom": 180,
    "to top": 0,
    "to bottom right": 135,
    "to bottom left": 225,
    "to top right": 45,
    "to top left": 315,
  };
  return map[dir] ?? 90;
}
