import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Copy, Play, Pause } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Keyframe {
  id: string;
  stop: number; // 0-100%
  properties: Record<string, string>;
}

type EasingType = "linear" | "ease" | "ease-in" | "ease-out" | "ease-in-out" | "cubic-bezier(0.68,-0.55,0.27,1.55)";

const ANIMATION_PRESETS = [
  {
    name: "Fade In",
    keyframes: [
      { id: "1", stop: 0, properties: { opacity: "0" } },
      { id: "2", stop: 100, properties: { opacity: "1" } },
    ],
    duration: "1s", easing: "ease-in-out" as EasingType,
  },
  {
    name: "Slide In Left",
    keyframes: [
      { id: "1", stop: 0, properties: { transform: "translateX(-100%)", opacity: "0" } },
      { id: "2", stop: 100, properties: { transform: "translateX(0)", opacity: "1" } },
    ],
    duration: "0.5s", easing: "ease-out" as EasingType,
  },
  {
    name: "Bounce",
    keyframes: [
      { id: "1", stop: 0, properties: { transform: "translateY(0)" } },
      { id: "2", stop: 50, properties: { transform: "translateY(-30px)" } },
      { id: "3", stop: 100, properties: { transform: "translateY(0)" } },
    ],
    duration: "0.8s", easing: "cubic-bezier(0.68,-0.55,0.27,1.55)" as EasingType,
  },
  {
    name: "Spin",
    keyframes: [
      { id: "1", stop: 0, properties: { transform: "rotate(0deg)" } },
      { id: "2", stop: 100, properties: { transform: "rotate(360deg)" } },
    ],
    duration: "1s", easing: "linear" as EasingType,
  },
  {
    name: "Scale Pulse",
    keyframes: [
      { id: "1", stop: 0, properties: { transform: "scale(1)" } },
      { id: "2", stop: 50, properties: { transform: "scale(1.2)" } },
      { id: "3", stop: 100, properties: { transform: "scale(1)" } },
    ],
    duration: "1s", easing: "ease-in-out" as EasingType,
  },
  {
    name: "Shake",
    keyframes: [
      { id: "1", stop: 0, properties: { transform: "translateX(0)" } },
      { id: "2", stop: 25, properties: { transform: "translateX(-10px)" } },
      { id: "3", stop: 50, properties: { transform: "translateX(10px)" } },
      { id: "4", stop: 75, properties: { transform: "translateX(-10px)" } },
      { id: "5", stop: 100, properties: { transform: "translateX(0)" } },
    ],
    duration: "0.5s", easing: "ease-in-out" as EasingType,
  },
  {
    name: "Flip",
    keyframes: [
      { id: "1", stop: 0, properties: { transform: "rotateY(0deg)" } },
      { id: "2", stop: 100, properties: { transform: "rotateY(180deg)" } },
    ],
    duration: "0.6s", easing: "ease-in-out" as EasingType,
  },
  {
    name: "Glow",
    keyframes: [
      { id: "1", stop: 0, properties: { "box-shadow": "0 0 5px #6366f1" } },
      { id: "2", stop: 50, properties: { "box-shadow": "0 0 20px #6366f1, 0 0 40px #8b5cf6" } },
      { id: "3", stop: 100, properties: { "box-shadow": "0 0 5px #6366f1" } },
    ],
    duration: "2s", easing: "ease-in-out" as EasingType,
  },
];

const CSS_PROPERTIES = [
  "opacity", "transform", "background-color", "color", "border-color",
  "width", "height", "top", "left", "margin", "padding",
  "box-shadow", "border-radius", "font-size", "letter-spacing",
];

function generateCSSCode(name: string, keyframes: Keyframe[], duration: string, easing: string, delay: string, iterationCount: string, direction: string): string {
  const kfSorted = [...keyframes].sort((a, b) => a.stop - b.stop);
  const kfCSS = kfSorted.map(kf => {
    const props = Object.entries(kf.properties)
      .filter(([, v]) => v.trim())
      .map(([k, v]) => `    ${k}: ${v};`)
      .join("\n");
    return `  ${kf.stop}% {\n${props}\n  }`;
  }).join("\n\n");

  return `@keyframes ${name} {\n${kfCSS}\n}\n\n.animated-element {\n  animation-name: ${name};\n  animation-duration: ${duration};\n  animation-timing-function: ${easing};\n  animation-delay: ${delay};\n  animation-iteration-count: ${iterationCount};\n  animation-direction: ${direction};\n  animation-fill-mode: both;\n}`;
}

export const CSSAnimationGenerator = () => {
  const [preset, setPreset] = useState(ANIMATION_PRESETS[0]);
  const [animName, setAnimName] = useState("myAnimation");
  const [keyframes, setKeyframes] = useState<Keyframe[]>(ANIMATION_PRESETS[0].keyframes);
  const [duration, setDuration] = useState("1s");
  const [easing, setEasing] = useState<string>("ease-in-out");
  const [delay, setDelay] = useState("0s");
  const [iterationCount, setIterationCount] = useState("infinite");
  const [direction, setDirection] = useState("normal");
  const [isPlaying, setIsPlaying] = useState(true);
  const [copied, setCopied] = useState(false);

  const cssCode = generateCSSCode(animName, keyframes, duration, easing, delay, iterationCount, direction);

  const applyPreset = (p: typeof ANIMATION_PRESETS[0]) => {
    setPreset(p);
    setKeyframes(p.keyframes.map((kf, i) => ({ ...kf, id: String(i + 1) })));
    setDuration(p.duration);
    setEasing(p.easing);
  };

  const copy = () => {
    navigator.clipboard.writeText(cssCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const addKeyframe = () => {
    const newStop = keyframes.length > 0 ? Math.round((keyframes[keyframes.length - 1].stop + 100) / 2) : 50;
    setKeyframes([...keyframes, { id: Date.now().toString(), stop: Math.min(99, newStop), properties: {} }]);
  };

  const removeKeyframe = (id: string) => {
    if (keyframes.length <= 2) return;
    setKeyframes(kfs => kfs.filter(kf => kf.id !== id));
  };

  const updateKeyframeStop = (id: string, stop: number) => {
    setKeyframes(kfs => kfs.map(kf => kf.id === id ? { ...kf, stop } : kf));
  };

  const updateKeyframeProperty = (id: string, prop: string, value: string) => {
    setKeyframes(kfs => kfs.map(kf =>
      kf.id === id ? { ...kf, properties: { ...kf.properties, [prop]: value } } : kf
    ));
  };

  const addProperty = (id: string, prop: string) => {
    const kf = keyframes.find(k => k.id === id);
    if (kf && !kf.properties[prop]) {
      updateKeyframeProperty(id, prop, "");
    }
  };

  const inlineStyle = {
    animationName: animName,
    animationDuration: duration,
    animationTimingFunction: easing,
    animationDelay: delay,
    animationIterationCount: iterationCount,
    animationDirection: direction,
    animationFillMode: "both",
    animationPlayState: isPlaying ? "running" : "paused",
  };

  // Build inline keyframe style for preview
  const kfString = [...keyframes].sort((a, b) => a.stop - b.stop)
    .map(kf => `${kf.stop}% { ${Object.entries(kf.properties).filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join("; ")} }`)
    .join(" ");

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">CSS Animation Generator</CardTitle>
          <CardDescription>Create and preview CSS keyframe animations with live code export</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Presets */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">Animation Presets</Label>
            <div className="flex flex-wrap gap-2">
              {ANIMATION_PRESETS.map(p => (
                <Button
                  key={p.name}
                  variant={preset.name === p.name ? "default" : "outline"}
                  size="sm"
                  onClick={() => applyPreset(p)}
                >
                  {p.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Live Preview</Label>
              <Button variant="outline" size="sm" onClick={() => setIsPlaying(p => !p)}>
                {isPlaying ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
                {isPlaying ? "Pause" : "Play"}
              </Button>
            </div>
            <div className="flex items-center justify-center bg-muted/50 rounded-xl border h-48">
              <style>{`
                @keyframes ${animName} { ${kfString} }
              `}</style>
              <div
                style={inlineStyle as React.CSSProperties}
                className="w-20 h-20 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg flex items-center justify-center text-white text-xs font-bold"
              >
                Preview
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label>Name</Label>
              <Input value={animName} onChange={(e) => setAnimName(e.target.value)} className="font-mono text-sm" />
            </div>
            <div className="space-y-1">
              <Label>Duration</Label>
              <Input value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="1s" className="font-mono text-sm" />
            </div>
            <div className="space-y-1">
              <Label>Delay</Label>
              <Input value={delay} onChange={(e) => setDelay(e.target.value)} placeholder="0s" className="font-mono text-sm" />
            </div>
            <div className="space-y-1">
              <Label>Iterations</Label>
              <Input value={iterationCount} onChange={(e) => setIterationCount(e.target.value)} placeholder="infinite" className="font-mono text-sm" />
            </div>
            <div className="space-y-1">
              <Label>Direction</Label>
              <select
                value={direction}
                onChange={(e) => setDirection(e.target.value)}
                className="w-full h-9 px-3 text-sm border rounded-md bg-background"
              >
                {["normal", "reverse", "alternate", "alternate-reverse"].map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label>Easing</Label>
              <select
                value={easing}
                onChange={(e) => setEasing(e.target.value)}
                className="w-full h-9 px-3 text-sm border rounded-md bg-background"
              >
                {["linear", "ease", "ease-in", "ease-out", "ease-in-out", "cubic-bezier(0.68,-0.55,0.27,1.55)"].map(e => (
                  <option key={e} value={e}>{e}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Keyframes Editor */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Keyframes</Label>
              <Button variant="outline" size="sm" onClick={addKeyframe}>+ Add Keyframe</Button>
            </div>
            <div className="space-y-3">
              {[...keyframes].sort((a, b) => a.stop - b.stop).map((kf) => (
                <div key={kf.id} className="border rounded-lg p-3 space-y-3 bg-muted/20">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="w-16 justify-center font-mono">{kf.stop}%</Badge>
                    <input
                      type="range" min="0" max="100" value={kf.stop}
                      onChange={(e) => updateKeyframeStop(kf.id, Number(e.target.value))}
                      className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                    />
                    <Button
                      variant="ghost" size="sm"
                      onClick={() => removeKeyframe(kf.id)}
                      disabled={keyframes.length <= 2}
                      className="text-muted-foreground hover:text-destructive h-7"
                    >
                      ×
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {Object.entries(kf.properties).map(([prop, value]) => (
                      <div key={prop} className="flex gap-2">
                        <span className="text-xs font-mono text-muted-foreground w-32 shrink-0 pt-2">{prop}:</span>
                        <Input
                          value={value}
                          onChange={(e) => updateKeyframeProperty(kf.id, prop, e.target.value)}
                          className="text-xs font-mono h-8"
                        />
                      </div>
                    ))}
                    <select
                      onChange={(e) => { addProperty(kf.id, e.target.value); e.target.value = ""; }}
                      className="h-8 px-2 text-xs border rounded-md bg-background text-muted-foreground"
                      defaultValue=""
                    >
                      <option value="">+ Add property...</option>
                      {CSS_PROPERTIES.filter(p => !kf.properties[p]).map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CSS Output */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Generated CSS</Label>
              <Button variant="outline" size="sm" onClick={copy}>
                <Copy className="h-3 w-3 mr-1" /> Copy
              </Button>
            </div>
            <pre className="bg-muted p-4 rounded-md text-sm font-mono overflow-x-auto whitespace-pre-wrap text-sm">
              {cssCode}
            </pre>
            {copied && <p className="text-xs text-green-600">Copied!</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
