import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sun, SunDim, Battery, BatteryCharging, BatteryLow, BatteryMedium, Zap } from "lucide-react";

// TypeScript: extend Navigator for battery API
interface BatteryManager extends EventTarget {
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
  level: number;
  onchargingchange: (() => void) | null;
  onchargingtimechange: (() => void) | null;
  ondischargingtimechange: (() => void) | null;
  onlevelchange: (() => void) | null;
}
declare global {
  interface Navigator {
    getBattery?: () => Promise<BatteryManager>;
  }
}

function formatTime(seconds: number) {
  if (!isFinite(seconds)) return "Unknown";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export const ScreenWakeLock = () => {
  const [wakeLockActive, setWakeLockActive] = useState(false);
  const [wakeLockSupported] = useState("wakeLock" in navigator);
  const [battery, setBattery] = useState<BatteryManager | null>(null);
  const [batterySupported, setBatterySupported] = useState(true);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const [wakeDuration, setWakeDuration] = useState(0);
  const durationRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [, forceUpdate] = useState(0);

  // Load battery
  useEffect(() => {
    if (!navigator.getBattery) { setBatterySupported(false); return; }
    navigator.getBattery().then(batt => {
      setBattery(batt);
      const update = () => forceUpdate(n => n + 1);
      batt.onchargingchange = update;
      batt.onlevelchange = update;
      batt.ondischargingtimechange = update;
      batt.onchargingtimechange = update;
    }).catch(() => setBatterySupported(false));
  }, []);

  const requestWakeLock = async () => {
    if (!wakeLockSupported) return;
    try {
      wakeLockRef.current = await navigator.wakeLock.request("screen");
      setWakeLockActive(true);
      setWakeDuration(0);
      durationRef.current = setInterval(() => setWakeDuration(d => d + 1), 1000);
      wakeLockRef.current.addEventListener("release", () => {
        setWakeLockActive(false);
        if (durationRef.current) clearInterval(durationRef.current);
      });
    } catch (err) {
      console.error("Wake Lock error:", err);
    }
  };

  const releaseWakeLock = async () => {
    await wakeLockRef.current?.release();
    setWakeLockActive(false);
    if (durationRef.current) clearInterval(durationRef.current);
  };

  useEffect(() => {
    // Re-request on visibility change (browsers revoke on tab hide)
    const onVisChange = async () => {
      if (document.visibilityState === "visible" && wakeLockActive) {
        await requestWakeLock();
      }
    };
    document.addEventListener("visibilitychange", onVisChange);
    return () => document.removeEventListener("visibilitychange", onVisChange);
  }, [wakeLockActive]);

  useEffect(() => { return () => { if (durationRef.current) clearInterval(durationRef.current); }; }, []);

  const level = battery ? Math.round(battery.level * 100) : null;
  const BattIcon = !battery ? Battery :
    battery.charging ? BatteryCharging :
    (level ?? 100) <= 20 ? BatteryLow :
    (level ?? 100) <= 60 ? BatteryMedium : Battery;

  const chargeColor = !battery ? "" :
    battery.charging ? "text-green-500" :
    (level ?? 100) <= 20 ? "text-red-500" :
    (level ?? 100) <= 40 ? "text-yellow-500" : "text-green-500";

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Zap className="h-6 w-6 text-primary" />
          <div>
            <CardTitle className="text-2xl">Screen Wake Lock & Battery Monitor</CardTitle>
            <CardDescription>Keep your screen awake and monitor battery status in real time</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* Wake Lock Section */}
        <div className="border rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            {wakeLockActive ? <Sun className="h-5 w-5 text-yellow-400" /> : <SunDim className="h-5 w-5 text-muted-foreground" />}
            <h3 className="font-semibold text-lg">Screen Wake Lock</h3>
            {wakeLockActive && <Badge className="bg-yellow-500 text-black animate-pulse">ACTIVE</Badge>}
          </div>

          {!wakeLockSupported ? (
            <p className="text-sm text-muted-foreground">Screen Wake Lock API is not supported in this browser. Try Chrome or Edge.</p>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Prevent your screen from sleeping — ideal for presentations, recipes, music sheets, or media playback.
              </p>
              <div className="flex gap-3 items-center">
                {!wakeLockActive ? (
                  <Button onClick={requestWakeLock}>
                    <Sun className="h-4 w-4 mr-2" />Prevent Sleep
                  </Button>
                ) : (
                  <Button variant="outline" onClick={releaseWakeLock}>
                    <SunDim className="h-4 w-4 mr-2" />Allow Sleep
                  </Button>
                )}
                {wakeLockActive && (
                  <span className="text-sm text-muted-foreground">
                    Active for: {Math.floor(wakeDuration / 60)}m {wakeDuration % 60}s
                  </span>
                )}
              </div>
            </>
          )}
        </div>

        {/* Battery Section */}
        <div className="border rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <BattIcon className={`h-5 w-5 ${chargeColor}`} />
            <h3 className="font-semibold text-lg">Battery Status</h3>
          </div>

          {!batterySupported ? (
            <p className="text-sm text-muted-foreground">Battery Status API is not supported in this browser.</p>
          ) : !battery ? (
            <p className="text-sm text-muted-foreground">Loading battery info...</p>
          ) : (
            <div className="space-y-4">
              {/* Battery bar */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>{battery.charging ? "Charging..." : "Discharging"}</span>
                  <span className={`font-bold ${chargeColor}`}>{level}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-4 relative overflow-hidden">
                  <div
                    className={`h-4 rounded-full transition-all duration-1000 ${
                      battery.charging ? "bg-green-500" :
                      (level ?? 100) <= 20 ? "bg-red-500" :
                      (level ?? 100) <= 40 ? "bg-yellow-500" : "bg-green-500"
                    }`}
                    style={{ width: `${level}%` }}
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="border rounded-lg p-3 text-center">
                  <div className="text-xs text-muted-foreground">Status</div>
                  <div className={`font-bold ${chargeColor}`}>{battery.charging ? "⚡ Charging" : "🔋 Discharging"}</div>
                </div>
                <div className="border rounded-lg p-3 text-center">
                  <div className="text-xs text-muted-foreground">Level</div>
                  <div className="text-2xl font-bold text-primary">{level}%</div>
                </div>
                <div className="border rounded-lg p-3 text-center">
                  <div className="text-xs text-muted-foreground">Time to Full</div>
                  <div className="font-bold">{formatTime(battery.chargingTime)}</div>
                </div>
                <div className="border rounded-lg p-3 text-center">
                  <div className="text-xs text-muted-foreground">Time Remaining</div>
                  <div className="font-bold">{formatTime(battery.dischargingTime)}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-muted rounded-lg p-3 text-sm text-muted-foreground">
          <strong>Screen Wake Lock API</strong> + <strong>Battery Status API</strong> — Both APIs operate entirely in the browser without sending any data to external servers.
        </div>
      </CardContent>
    </Card>
  );
};
