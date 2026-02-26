import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Smartphone, Play, Plus, Trash2, Zap } from "lucide-react";

interface PatternStep { duration: number; type: "vibrate" | "pause"; }

const PRESETS: { name: string; pattern: number[] }[] = [
  { name: "Single pulse", pattern: [200] },
  { name: "Double tap", pattern: [100, 50, 100] },
  { name: "SOS", pattern: [100, 100, 100, 100, 100, 300, 300, 100, 300, 100, 300, 300, 100, 100, 100, 100, 100] },
  { name: "Heartbeat", pattern: [150, 80, 150, 500] },
  { name: "Alert", pattern: [500, 200, 500, 200, 500] },
  { name: "Notification", pattern: [200, 100, 400] },
];

function parsePattern(steps: PatternStep[]): number[] {
  return steps.map(s => s.duration);
}

function renderPatternViz(steps: PatternStep[]) {
  const total = steps.reduce((s, step) => s + step.duration, 0) || 1;
  return steps.map((step, i) => ({
    ...step,
    widthPct: (step.duration / total) * 100,
    i,
  }));
}

export const VibrationTester = () => {
  const [supported] = useState("vibrate" in navigator);
  const [steps, setSteps] = useState<PatternStep[]>([
    { duration: 200, type: "vibrate" },
    { duration: 100, type: "pause" },
    { duration: 400, type: "vibrate" },
  ]);
  const [rawPattern, setRawPattern] = useState("");
  const [playing, setPlaying] = useState(false);
  const [repeatCount, setRepeatCount] = useState(1);

  const addStep = (type: "vibrate" | "pause") => {
    setSteps(prev => [...prev, { duration: 100, type }]);
  };

  const updateStep = (i: number, field: keyof PatternStep, value: string | number) => {
    setSteps(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: value } : s));
  };

  const removeStep = (i: number) => setSteps(prev => prev.filter((_, idx) => idx !== i));

  const vibrate = (pattern: number[], count = 1) => {
    if (!supported) return;
    const repeated = Array(count).fill(null).flatMap((_, i) =>
      i < count - 1 ? [...pattern, 300] : pattern
    );
    navigator.vibrate(repeated);
    setPlaying(true);
    const totalMs = repeated.reduce((s, v) => s + v, 0);
    setTimeout(() => setPlaying(false), totalMs + 100);
  };

  const vibrateBuilt = () => vibrate(parsePattern(steps), repeatCount);

  const vibrateRaw = () => {
    const nums = rawPattern.split(/[,\s]+/).map(n => parseInt(n)).filter(n => !isNaN(n) && n > 0);
    if (nums.length > 0) vibrate(nums);
  };

  const stop = () => { navigator.vibrate(0); setPlaying(false); };

  const loadPreset = (preset: typeof PRESETS[0]) => {
    setSteps(preset.pattern.map((dur, i) => ({ duration: dur, type: i % 2 === 0 ? "vibrate" : "pause" } as PatternStep)));
  };

  const viz = renderPatternViz(steps);
  const totalMs = steps.reduce((s, step) => s + step.duration, 0);

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Smartphone className="h-6 w-6 text-primary" />
          <div>
            <CardTitle className="text-2xl">Vibration Pattern Tester</CardTitle>
            <CardDescription>Design and test vibration patterns using the Vibration API</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {!supported ? (
          <div className="p-4 bg-yellow-50 text-yellow-700 rounded-lg text-sm">
            The Vibration API is not supported in this browser. Try Chrome on Android.
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Badge className="bg-green-500 text-white">Vibration API Supported</Badge>
            <p className="text-sm text-muted-foreground">Best experienced on a mobile device.</p>
          </div>
        )}

        {/* Presets */}
        <div className="space-y-2">
          <Label>Presets</Label>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map(p => (
              <Button key={p.name} variant="outline" size="sm" onClick={() => loadPreset(p)}>
                {p.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Builder */}
        <div className="space-y-3">
          <Label>Pattern Builder</Label>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {steps.map((step, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${step.type === "vibrate" ? "bg-primary" : "bg-muted-foreground"}`} />
                <Button size="sm" variant={step.type === "vibrate" ? "default" : "secondary"}
                  onClick={() => updateStep(i, "type", step.type === "vibrate" ? "pause" : "vibrate")}>
                  {step.type === "vibrate" ? "📳 Vibrate" : "⏸ Pause"}
                </Button>
                <Input type="number" min={1} max={5000} value={step.duration}
                  onChange={e => updateStep(i, "duration", parseInt(e.target.value) || 100)}
                  className="w-24" />
                <span className="text-xs text-muted-foreground">ms</span>
                <Button variant="ghost" size="sm" onClick={() => removeStep(i)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => addStep("vibrate")}>
              <Plus className="h-4 w-4 mr-1" />Vibrate
            </Button>
            <Button variant="outline" size="sm" onClick={() => addStep("pause")}>
              <Plus className="h-4 w-4 mr-1" />Pause
            </Button>
          </div>
        </div>

        {/* Visualization */}
        <div className="space-y-2">
          <Label>Visual Pattern ({totalMs}ms total)</Label>
          <div className="flex h-10 rounded-lg overflow-hidden border">
            {viz.map(({ type, widthPct, i }) => (
              <div key={i} className={`h-full transition-all ${type === "vibrate" ? "bg-primary" : "bg-muted"}`}
                style={{ width: `${widthPct}%` }}
                title={`${type}: ${steps[i].duration}ms`} />
            ))}
          </div>
        </div>

        {/* Repeat */}
        <div className="flex items-center gap-3">
          <Label>Repeat:</Label>
          <Input type="number" min={1} max={10} value={repeatCount}
            onChange={e => setRepeatCount(parseInt(e.target.value) || 1)} className="w-20" />
          <span className="text-sm text-muted-foreground">time(s)</span>
        </div>

        {/* Play / Stop */}
        <div className="flex gap-2">
          <Button onClick={vibrateBuilt} disabled={!supported || playing}>
            <Play className="h-4 w-4 mr-2" />{playing ? "Vibrating..." : "Play Pattern"}
          </Button>
          <Button variant="outline" onClick={stop} disabled={!playing}>Stop</Button>
        </div>

        {/* Raw input */}
        <div className="space-y-2 border-t pt-4">
          <Label>Raw Pattern Input</Label>
          <p className="text-xs text-muted-foreground">Enter comma-separated values in ms (odd = vibrate, even = pause)</p>
          <div className="flex gap-2">
            <Input value={rawPattern} onChange={e => setRawPattern(e.target.value)}
              placeholder="200, 100, 400, 100, 200" className="font-mono" />
            <Button variant="outline" onClick={vibrateRaw} disabled={!supported}>
              <Zap className="h-4 w-4 mr-2" />Run
            </Button>
          </div>
        </div>

        <div className="bg-muted rounded-lg p-3 text-sm text-muted-foreground">
          <strong>Vibration API</strong> — <code>navigator.vibrate(pattern)</code> accepts a single number or array of alternating vibrate/pause durations. Works on Android Chrome; iOS doesn't support this API.
        </div>
      </CardContent>
    </Card>
  );
};
