import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff, RefreshCw, Activity, Clock, Download, Upload } from "lucide-react";

// Extend Navigator for NetworkInformation API
interface NetworkInformation extends EventTarget {
  effectiveType: "slow-2g" | "2g" | "3g" | "4g";
  downlink: number;
  downlinkMax: number;
  rtt: number;
  saveData: boolean;
  type: string;
  onchange: (() => void) | null;
}
declare global {
  interface Navigator {
    connection?: NetworkInformation;
    mozConnection?: NetworkInformation;
    webkitConnection?: NetworkInformation;
  }
}

interface SpeedTest { timestamp: number; downloadMbps: number; latencyMs: number; }

export const NetworkInfoMonitor = () => {
  const [online, setOnline] = useState(navigator.onLine);
  const [connInfo, setConnInfo] = useState<NetworkInformation | null>(null);
  const [speedTests, setSpeedTests] = useState<SpeedTest[]>([]);
  const [testing, setTesting] = useState(false);
  const [latency, setLatency] = useState<number | null>(null);
  const [userAgent] = useState(navigator.userAgent);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const getConnection = useCallback((): NetworkInformation | null => {
    return navigator.connection || navigator.mozConnection || navigator.webkitConnection || null;
  }, []);

  useEffect(() => {
    const conn = getConnection();
    setConnInfo(conn);
    if (conn) {
      const update = () => setConnInfo({ ...conn });
      conn.onchange = update;
    }
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, [getConnection]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || speedTests.length === 0) return;
    const ctx = canvas.getContext("2d")!;
    const W = canvas.width, H = canvas.height;
    ctx.fillStyle = "hsl(222 47% 8%)";
    ctx.fillRect(0, 0, W, H);
    if (speedTests.length < 2) return;

    const maxDown = Math.max(...speedTests.map(s => s.downloadMbps), 1);
    ctx.strokeStyle = "hsl(142 71% 45%)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    speedTests.forEach((s, i) => {
      const x = (i / (speedTests.length - 1)) * W;
      const y = H - (s.downloadMbps / maxDown) * H * 0.9;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.font = "11px monospace";
    ctx.fillText(`${speedTests[speedTests.length - 1].downloadMbps.toFixed(2)} Mbps`, 8, 20);
  }, [speedTests]);

  const measureLatency = async () => {
    const start = performance.now();
    try {
      await fetch("https://www.google.com/favicon.ico?_=" + Date.now(), {
        method: "HEAD", mode: "no-cors", cache: "no-store",
      });
    } catch {}
    const end = performance.now();
    return Math.round(end - start);
  };

  const estimateDownload = async () => {
    // Download a small known-size resource and measure speed
    const url = "https://httpbin.org/bytes/102400?_=" + Date.now(); // 100KB
    const start = performance.now();
    try {
      const res = await fetch(url, { cache: "no-store" });
      const blob = await res.blob();
      const end = performance.now();
      const sizeBytes = blob.size;
      const durationSec = (end - start) / 1000;
      return (sizeBytes * 8) / (durationSec * 1_000_000); // Mbps
    } catch {
      return 0;
    }
  };

  const runSpeedTest = async () => {
    setTesting(true);
    const [lat, down] = await Promise.all([measureLatency(), estimateDownload()]);
    setLatency(lat);
    setSpeedTests(prev => [...prev.slice(-19), { timestamp: Date.now(), downloadMbps: down, latencyMs: lat }]);
    setTesting(false);
  };

  const effectiveTypeColor: Record<string, string> = {
    "slow-2g": "bg-red-500",
    "2g": "bg-orange-500",
    "3g": "bg-yellow-500",
    "4g": "bg-green-500",
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Wifi className="h-6 w-6 text-primary" />
          <div>
            <CardTitle className="text-2xl">Network Info Monitor</CardTitle>
            <CardDescription>Monitor connection type, speed, and latency using the Network Information API</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Online status */}
        <div className="flex items-center gap-3 p-3 border rounded-lg">
          {online ? <Wifi className="h-5 w-5 text-green-500" /> : <WifiOff className="h-5 w-5 text-red-500" />}
          <div>
            <div className={`font-semibold ${online ? "text-green-600" : "text-red-600"}`}>
              {online ? "Online" : "Offline"}
            </div>
            <div className="text-xs text-muted-foreground">navigator.onLine status</div>
          </div>
          {online && <Badge className="ml-auto bg-green-500 text-white">Connected</Badge>}
        </div>

        {/* Network Information API */}
        {connInfo ? (
          <div className="space-y-3">
            <h3 className="font-medium flex items-center gap-2"><Activity className="h-4 w-4" />Network Information API</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="border rounded-lg p-3 text-center">
                <div className="text-xs text-muted-foreground">Effective Type</div>
                <Badge className={`mt-1 text-white ${effectiveTypeColor[connInfo.effectiveType] || "bg-gray-500"}`}>
                  {connInfo.effectiveType?.toUpperCase()}
                </Badge>
              </div>
              <div className="border rounded-lg p-3 text-center">
                <div className="text-xs text-muted-foreground">Downlink</div>
                <div className="text-xl font-bold text-primary">{connInfo.downlink}</div>
                <div className="text-xs text-muted-foreground">Mbps</div>
              </div>
              <div className="border rounded-lg p-3 text-center">
                <div className="text-xs text-muted-foreground">RTT</div>
                <div className="text-xl font-bold text-primary">{connInfo.rtt}</div>
                <div className="text-xs text-muted-foreground">ms</div>
              </div>
              <div className="border rounded-lg p-3 text-center">
                <div className="text-xs text-muted-foreground">Data Saver</div>
                <div className="font-bold">{connInfo.saveData ? "ON" : "OFF"}</div>
              </div>
            </div>
            {connInfo.type && (
              <div className="text-sm text-muted-foreground">Connection type: <span className="font-medium">{connInfo.type}</span></div>
            )}
          </div>
        ) : (
          <div className="p-3 bg-muted rounded-lg text-sm text-muted-foreground">
            Network Information API is not available in this browser. Speed test below still works.
          </div>
        )}

        {/* Speed test */}
        <div className="space-y-3 border-t pt-4">
          <h3 className="font-medium flex items-center gap-2">
            <Download className="h-4 w-4" />Speed Test
          </h3>
          <div className="flex gap-3 flex-wrap items-center">
            <Button onClick={runSpeedTest} disabled={testing || !online}>
              <RefreshCw className={`h-4 w-4 mr-2 ${testing ? "animate-spin" : ""}`} />
              {testing ? "Testing..." : "Run Speed Test"}
            </Button>
            {latency !== null && (
              <div className="flex gap-4 text-sm">
                <span><Clock className="h-3 w-3 inline mr-1" />{latency}ms latency</span>
                {speedTests.length > 0 && (
                  <span><Download className="h-3 w-3 inline mr-1" />{speedTests[speedTests.length - 1].downloadMbps.toFixed(2)} Mbps</span>
                )}
              </div>
            )}
          </div>

          {/* Speed history chart */}
          {speedTests.length > 0 && (
            <div>
              <div className="text-sm text-muted-foreground mb-2">Download speed history</div>
              <div className="rounded-lg overflow-hidden border bg-[hsl(222_47%_8%)]">
                <canvas ref={canvasRef} width={600} height={100} className="w-full" />
              </div>
            </div>
          )}

          {/* Test history table */}
          {speedTests.length > 0 && (
            <div className="max-h-48 overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-background">
                  <tr className="border-b">
                    <th className="text-left py-1">Time</th>
                    <th className="text-right py-1">Download</th>
                    <th className="text-right py-1">Latency</th>
                  </tr>
                </thead>
                <tbody>
                  {[...speedTests].reverse().map(s => (
                    <tr key={s.timestamp} className="border-b last:border-0">
                      <td className="py-1 text-muted-foreground">{new Date(s.timestamp).toLocaleTimeString()}</td>
                      <td className="py-1 text-right font-mono">{s.downloadMbps.toFixed(2)} Mbps</td>
                      <td className="py-1 text-right font-mono">{s.latencyMs}ms</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* User agent */}
        <div className="border-t pt-3">
          <div className="text-xs text-muted-foreground font-mono bg-muted rounded p-2 break-all">
            <span className="font-semibold text-foreground">User Agent: </span>{userAgent}
          </div>
        </div>

        <div className="bg-muted rounded-lg p-3 text-sm text-muted-foreground">
          <strong>Network Information API</strong> — Provides hints about the user's connection type and quality. <code>navigator.onLine</code> tracks online/offline status. Speed test uses real HTTP requests.
        </div>
      </CardContent>
    </Card>
  );
};
