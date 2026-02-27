import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, RefreshCw, Download, Zap } from "lucide-react";

interface NavTiming {
  dns: number;
  tcp: number;
  ssl: number;
  ttfb: number;
  download: number;
  domInteractive: number;
  domComplete: number;
  total: number;
}

interface ResourceEntry {
  name: string;
  type: string;
  duration: number;
  size: number;
  startTime: number;
}

interface FPSData { fps: number; ts: number; }

function getNavTiming(): NavTiming | null {
  const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
  if (!nav) return null;
  return {
    dns: nav.domainLookupEnd - nav.domainLookupStart,
    tcp: nav.connectEnd - nav.connectStart,
    ssl: nav.secureConnectionStart > 0 ? nav.connectEnd - nav.secureConnectionStart : 0,
    ttfb: nav.responseStart - nav.requestStart,
    download: nav.responseEnd - nav.responseStart,
    domInteractive: nav.domInteractive - nav.startTime,
    domComplete: nav.domComplete - nav.startTime,
    total: nav.loadEventEnd - nav.startTime,
  };
}

function getResources(): ResourceEntry[] {
  return performance.getEntriesByType("resource").map(e => {
    const r = e as PerformanceResourceTiming;
    return {
      name: r.name.split("/").pop()?.split("?")[0] ?? r.name,
      type: r.initiatorType,
      duration: Math.round(r.duration),
      size: r.transferSize ?? 0,
      startTime: Math.round(r.startTime),
    };
  }).sort((a, b) => b.duration - a.duration).slice(0, 30);
}

function formatMs(ms: number) {
  if (ms < 1) return "<1ms";
  return `${Math.round(ms)}ms`;
}

function formatBytes(b: number) {
  if (b === 0) return "–";
  if (b < 1024) return `${b}B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)}KB`;
  return `${(b / 1024 / 1024).toFixed(2)}MB`;
}

const TIMING_BAR_COLORS: Record<string, string> = {
  dns: "bg-purple-500",
  tcp: "bg-blue-500",
  ssl: "bg-cyan-500",
  ttfb: "bg-yellow-500",
  download: "bg-green-500",
};

const RESOURCE_COLORS: Record<string, string> = {
  script: "bg-yellow-400",
  link: "bg-blue-400",
  img: "bg-green-400",
  fetch: "bg-purple-400",
  xmlhttprequest: "bg-red-400",
  other: "bg-gray-400",
};

export const PerformanceMonitor = () => {
  const [navTiming, setNavTiming] = useState<NavTiming | null>(null);
  const [resources, setResources] = useState<ResourceEntry[]>([]);
  const [, setFpsData] = useState<FPSData[]>([]);
  const [currentFPS, setCurrentFPS] = useState(0);
  const [memory, setMemory] = useState<{ used: number; total: number; limit: number } | null>(null);
  const [measuring, setMeasuring] = useState(false);
  const fpsRef = useRef<number[]>([]);
  const rafRef = useRef<number>(0);
  const lastFrameRef = useRef(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const refresh = useCallback(() => {
    setNavTiming(getNavTiming());
    setResources(getResources());
    // Memory API (Chrome only)
    const mem = (performance as Performance & { memory?: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } }).memory;
    if (mem) {
      setMemory({
        used: mem.usedJSHeapSize,
        total: mem.totalJSHeapSize,
        limit: mem.jsHeapSizeLimit,
      });
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const measureFPS = useCallback(() => {
    const now = performance.now();
    if (lastFrameRef.current > 0) {
      const delta = now - lastFrameRef.current;
      const fps = Math.round(1000 / delta);
      fpsRef.current.push(fps);
      if (fpsRef.current.length > 60) fpsRef.current.shift();
      setCurrentFPS(fps);
      const avg = Math.round(fpsRef.current.reduce((a, b) => a + b, 0) / fpsRef.current.length);
      setFpsData(prev => [...prev.slice(-100), { fps: avg, ts: now }]);

      // Draw FPS graph
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d")!;
        const W = canvas.width, H = canvas.height;
        ctx.fillStyle = "hsl(222 47% 8%)";
        ctx.fillRect(0, 0, W, H);
        ctx.strokeStyle = fps >= 55 ? "hsl(142 71% 45%)" : fps >= 30 ? "hsl(36 100% 50%)" : "hsl(0 80% 55%)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        const data = fpsRef.current;
        data.forEach((f, i) => {
          const x = (i / 60) * W;
          const y = H - (f / 120) * H;
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        });
        ctx.stroke();
        ctx.fillStyle = "rgba(255,255,255,0.7)";
        ctx.font = "12px monospace";
        ctx.fillText(`${fps} FPS`, 8, 20);
      }
    }
    lastFrameRef.current = now;
    if (measuring) rafRef.current = requestAnimationFrame(measureFPS);
  }, [measuring]);

  useEffect(() => {
    if (measuring) {
      rafRef.current = requestAnimationFrame(measureFPS);
    } else {
      cancelAnimationFrame(rafRef.current);
    }
    return () => cancelAnimationFrame(rafRef.current);
  }, [measuring, measureFPS]);

  const exportReport = () => {
    const report = { navTiming, resources, memory, fps: currentFPS, timestamp: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `perf-report-${Date.now()}.json`; a.click();
    URL.revokeObjectURL(url);
  };

  const maxDuration = Math.max(...resources.map(r => r.duration), 1);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Activity className="h-6 w-6 text-primary" />
          <div>
            <CardTitle className="text-2xl">Performance Monitor</CardTitle>
            <CardDescription>Analyze page load timing, resource waterfall, FPS, and memory using the Performance API</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex gap-2 flex-wrap">
          <Button onClick={refresh} variant="outline"><RefreshCw className="h-4 w-4 mr-2" />Refresh</Button>
          <Button onClick={() => setMeasuring(m => !m)} variant={measuring ? "destructive" : "default"}>
            <Zap className="h-4 w-4 mr-2" />{measuring ? "Stop FPS Monitor" : "Start FPS Monitor"}
          </Button>
          <Button onClick={exportReport} variant="outline"><Download className="h-4 w-4 mr-2" />Export Report</Button>
        </div>

        <Tabs defaultValue="navigation">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="navigation">Navigation</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="fps">FPS</TabsTrigger>
            <TabsTrigger value="memory">Memory</TabsTrigger>
          </TabsList>

          <TabsContent value="navigation" className="mt-4 space-y-4">
            {navTiming ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: "Total Load", value: formatMs(navTiming.total), highlight: true },
                    { label: "TTFB", value: formatMs(navTiming.ttfb) },
                    { label: "DOM Interactive", value: formatMs(navTiming.domInteractive) },
                    { label: "DOM Complete", value: formatMs(navTiming.domComplete) },
                  ].map(({ label, value, highlight }) => (
                    <div key={label} className={`border rounded-lg p-3 text-center ${highlight ? "border-primary/50" : ""}`}>
                      <div className="text-xs text-muted-foreground">{label}</div>
                      <div className={`text-xl font-bold ${highlight ? "text-primary" : ""}`}>{value}</div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  {Object.entries(TIMING_BAR_COLORS).map(([key, color]) => {
                    const val = navTiming[key as keyof NavTiming];
                    const pct = Math.min(100, (val / navTiming.total) * 100);
                    return (
                      <div key={key} className="flex items-center gap-3">
                        <div className="w-16 text-xs text-muted-foreground capitalize">{key.toUpperCase()}</div>
                        <div className="flex-1 bg-muted rounded-full h-4 overflow-hidden">
                          <div className={`${color} h-4 rounded-full`} style={{ width: `${pct}%` }} />
                        </div>
                        <div className="w-16 text-xs text-right">{formatMs(val)}</div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Navigation timing not available.</p>
            )}
          </TabsContent>

          <TabsContent value="resources" className="mt-4">
            <div className="space-y-1 max-h-[400px] overflow-y-auto">
              {resources.map((r, i) => (
                <div key={i} className="flex items-center gap-2 text-xs py-1 border-b last:border-0">
                  <Badge variant="outline" className={`text-white text-[10px] px-1 ${RESOURCE_COLORS[r.type] || RESOURCE_COLORS.other}`}>
                    {r.type}
                  </Badge>
                  <div className="flex-1 truncate font-mono" title={r.name}>{r.name}</div>
                  <div className="w-32">
                    <div className="bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: `${(r.duration / maxDuration) * 100}%` }} />
                    </div>
                  </div>
                  <div className="w-14 text-right">{formatMs(r.duration)}</div>
                  <div className="w-14 text-right text-muted-foreground">{formatBytes(r.size)}</div>
                </div>
              ))}
              {resources.length === 0 && <p className="text-sm text-muted-foreground py-4 text-center">No resources found.</p>}
            </div>
          </TabsContent>

          <TabsContent value="fps" className="mt-4 space-y-4">
            <div className="flex items-center gap-4">
              <div className="border rounded-xl p-4 text-center w-36">
                <div className="text-xs text-muted-foreground">Current FPS</div>
                <div className={`text-4xl font-bold ${currentFPS >= 55 ? "text-green-500" : currentFPS >= 30 ? "text-yellow-500" : "text-red-500"}`}>
                  {measuring ? currentFPS : "–"}
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>Target: 60 FPS</p>
                <p>Green: ≥55fps · Yellow: ≥30fps · Red: &lt;30fps</p>
                {!measuring && <p className="text-primary">Click "Start FPS Monitor" above</p>}
              </div>
            </div>
            <div className="rounded-lg overflow-hidden border bg-[hsl(222_47%_8%)]">
              <canvas ref={canvasRef} width={700} height={120} className="w-full" />
            </div>
          </TabsContent>

          <TabsContent value="memory" className="mt-4 space-y-4">
            {memory ? (
              <>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "JS Heap Used", value: formatBytes(memory.used) },
                    { label: "JS Heap Total", value: formatBytes(memory.total) },
                    { label: "Heap Size Limit", value: formatBytes(memory.limit) },
                  ].map(({ label, value }) => (
                    <div key={label} className="border rounded-lg p-3 text-center">
                      <div className="text-xs text-muted-foreground">{label}</div>
                      <div className="text-xl font-bold text-primary">{value}</div>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">
                    Heap Usage: {Math.round((memory.used / memory.limit) * 100)}%
                  </div>
                  <div className="w-full bg-muted rounded-full h-4">
                    <div className="bg-primary h-4 rounded-full transition-all" style={{ width: `${(memory.used / memory.limit) * 100}%` }} />
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Memory API is only available in Chromium-based browsers.</p>
            )}
          </TabsContent>
        </Tabs>

        <div className="bg-muted rounded-lg p-3 text-sm text-muted-foreground">
          <strong>Performance API</strong> — Uses <code>PerformanceNavigationTiming</code>, <code>PerformanceResourceTiming</code>, <code>requestAnimationFrame</code>, and <code>performance.memory</code> for comprehensive metrics.
        </div>
      </CardContent>
    </Card>
  );
};
