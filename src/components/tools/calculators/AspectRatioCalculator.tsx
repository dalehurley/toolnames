import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ArrowLeftRight, Monitor, Smartphone, Tv } from "lucide-react";

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function getAspectRatio(width: number, height: number): string {
  if (!width || !height) return "—";
  const d = gcd(Math.round(width), Math.round(height));
  return `${Math.round(width / d)}:${Math.round(height / d)}`;
}

const COMMON_RATIOS = [
  { label: "16:9", w: 16, h: 9, desc: "HD/Full HD/4K Video, YouTube, Most Monitors" },
  { label: "4:3", w: 4, h: 3, desc: "Old TV, VGA, iPad, old monitors" },
  { label: "1:1", w: 1, h: 1, desc: "Square, Instagram Post" },
  { label: "21:9", w: 21, h: 9, desc: "Ultrawide Monitor, Cinematic" },
  { label: "3:2", w: 3, h: 2, desc: "DSLR Camera, 35mm Film, Surface Laptop" },
  { label: "2:3", w: 2, h: 3, desc: "Portrait mode, Polaroid" },
  { label: "9:16", w: 9, h: 16, desc: "Vertical Video, TikTok, Instagram Stories" },
  { label: "4:5", w: 4, h: 5, desc: "Instagram Portrait, Print" },
  { label: "5:4", w: 5, h: 4, desc: "1280×1024 Monitor" },
  { label: "8:5", w: 8, h: 5, desc: "16:10 Widescreen Monitor" },
  { label: "2:1", w: 2, h: 1, desc: "Twitter Header, Panoramic" },
  { label: "1.85:1", w: 1.85, h: 1, desc: "US Theater Standard" },
  { label: "2.35:1", w: 2.35, h: 1, desc: "CinemaScope / Anamorphic" },
];

const PRESETS = [
  { name: "1920×1080 (1080p)", w: 1920, h: 1080, icon: Monitor },
  { name: "1280×720 (720p)", w: 1280, h: 720, icon: Monitor },
  { name: "3840×2160 (4K)", w: 3840, h: 2160, icon: Tv },
  { name: "2560×1440 (1440p)", w: 2560, h: 1440, icon: Monitor },
  { name: "1366×768 (Laptop)", w: 1366, h: 768, icon: Monitor },
  { name: "375×812 (iPhone X)", w: 375, h: 812, icon: Smartphone },
  { name: "1080×1080 (Instagram)", w: 1080, h: 1080, icon: Monitor },
  { name: "1080×1920 (Story)", w: 1080, h: 1920, icon: Smartphone },
];

export const AspectRatioCalculator = () => {
  const [width, setWidth] = useState<string>("1920");
  const [height, setHeight] = useState<string>("1080");
  const [targetWidth, setTargetWidth] = useState<string>("1280");
  const [targetHeight, setTargetHeight] = useState<string>("");

  const w = parseFloat(width) || 0;
  const h = parseFloat(height) || 0;
  const ratio = w && h ? w / h : 0;
  const ratioStr = getAspectRatio(w, h);

  const scaledHeight = targetWidth ? Math.round((parseFloat(targetWidth) || 0) / ratio) : 0;
  const scaledWidth = targetHeight ? Math.round((parseFloat(targetHeight) || 0) * ratio) : 0;

  const applyRatio = (rw: number, rh: number) => {
    const scale = w || 1920;
    setWidth(String(Math.round((scale / rw) * rw)));
    setHeight(String(Math.round((scale / rw) * rh)));
  };

  const swapDimensions = () => {
    setWidth(height);
    setHeight(width);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Aspect Ratio Calculator</CardTitle>
          <CardDescription>Calculate, convert, and scale image/video dimensions while maintaining aspect ratios</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Main Input */}
          <div className="grid grid-cols-2 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="width">Width (px)</Label>
              <Input
                id="width"
                type="number" min="1"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                placeholder="e.g. 1920"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height">Height (px)</Label>
              <Input
                id="height"
                type="number" min="1"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="e.g. 1080"
              />
            </div>
          </div>

          <div className="flex items-center justify-center">
            <Button variant="outline" size="sm" onClick={swapDimensions}>
              <ArrowLeftRight className="h-4 w-4 mr-1" /> Swap W/H
            </Button>
          </div>

          {/* Current Ratio Result */}
          {w > 0 && h > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-primary/10 rounded-lg p-4 text-center col-span-2 sm:col-span-1">
                <div className="text-3xl font-bold text-primary">{ratioStr}</div>
                <div className="text-xs text-muted-foreground mt-1">Aspect Ratio</div>
              </div>
              <div className="bg-muted rounded-lg p-4 text-center">
                <div className="text-2xl font-bold">{ratio.toFixed(4)}</div>
                <div className="text-xs text-muted-foreground mt-1">Decimal Ratio</div>
              </div>
              <div className="bg-muted rounded-lg p-4 text-center">
                <div className="text-2xl font-bold">{(w * h / 1000000).toFixed(2)}MP</div>
                <div className="text-xs text-muted-foreground mt-1">Megapixels</div>
              </div>
              <div className="bg-muted rounded-lg p-4 text-center">
                <div className="text-2xl font-bold">{(w / h).toFixed(2)}</div>
                <div className="text-xs text-muted-foreground mt-1">W/H Ratio</div>
              </div>
            </div>
          )}

          {/* Visual Preview */}
          {w > 0 && h > 0 && (
            <div className="space-y-2">
              <Label className="text-base font-semibold">Visual Preview</Label>
              <div className="flex items-center justify-center bg-muted/50 rounded-lg p-8 min-h-[160px]">
                <div
                  className="bg-primary/20 border-2 border-primary rounded flex items-center justify-center text-sm text-primary font-medium"
                  style={{
                    width: `${Math.min(300, 300 * (ratio > 1 ? 1 : ratio))}px`,
                    height: `${Math.min(200, 200 / (ratio < 1 ? 1 : ratio))}px`,
                    maxWidth: "300px",
                    maxHeight: "200px",
                  }}
                >
                  {w} × {h}
                </div>
              </div>
            </div>
          )}

          <Separator />

          {/* Scale Calculator */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Scale Dimensions</Label>
            <p className="text-sm text-muted-foreground">Enter a target width or height to calculate the other dimension while maintaining the aspect ratio</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Target Width → Height</Label>
                <div className="flex gap-2">
                  <Input
                    type="number" min="1"
                    value={targetWidth}
                    onChange={(e) => setTargetWidth(e.target.value)}
                    placeholder="Target width..."
                  />
                  <div className="flex items-center justify-center px-3 bg-muted rounded-md text-sm font-mono min-w-[80px] text-center">
                    {targetWidth && w && h ? `→ ${scaledHeight}px` : "→ ?"}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Target Height → Width</Label>
                <div className="flex gap-2">
                  <Input
                    type="number" min="1"
                    value={targetHeight}
                    onChange={(e) => setTargetHeight(e.target.value)}
                    placeholder="Target height..."
                  />
                  <div className="flex items-center justify-center px-3 bg-muted rounded-md text-sm font-mono min-w-[80px] text-center">
                    {targetHeight && w && h ? `→ ${scaledWidth}px` : "→ ?"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Common Presets */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Common Resolutions</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PRESETS.map(({ name, w: pw, h: ph, icon: Icon }) => (
                <button
                  key={name}
                  onClick={() => { setWidth(String(pw)); setHeight(String(ph)); }}
                  className="flex items-center gap-2 p-2 rounded-md border hover:bg-muted text-sm text-left transition-colors"
                >
                  <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="text-xs">{name}</span>
                </button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Common Ratios */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Common Aspect Ratios</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {COMMON_RATIOS.map(({ label, w: rw, h: rh, desc }) => {
                const isActive = ratioStr === label || Math.abs(ratio - rw / rh) < 0.01;
                return (
                  <button
                    key={label}
                    onClick={() => applyRatio(rw, rh)}
                    className={`flex items-center gap-3 p-3 rounded-md border text-left transition-colors ${isActive ? "border-primary bg-primary/5" : "hover:bg-muted"}`}
                  >
                    <Badge variant={isActive ? "default" : "secondary"} className="w-16 justify-center shrink-0">
                      {label}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{desc}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
