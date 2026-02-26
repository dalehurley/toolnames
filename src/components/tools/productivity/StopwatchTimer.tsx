import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Play, Pause, Square, Flag, Trash2, Download } from "lucide-react";

interface Lap {
  id: number;
  lapTime: number; // ms for this lap
  totalTime: number; // total ms at this lap
}

function formatMs(ms: number): string {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const cs = Math.floor((ms % 1000) / 10);
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(cs).padStart(2, "0")}`;
  }
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(cs).padStart(2, "0")}`;
}

export const StopwatchTimer = () => {
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState<Lap[]>([]);
  const startTimeRef = useRef<number>(0);
  const accumulatedRef = useRef<number>(0);
  const rafRef = useRef<number>(0);

  const tick = useCallback(() => {
    setElapsed(accumulatedRef.current + (Date.now() - startTimeRef.current));
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const start = () => {
    startTimeRef.current = Date.now();
    setIsRunning(true);
    rafRef.current = requestAnimationFrame(tick);
  };

  const pause = () => {
    cancelAnimationFrame(rafRef.current);
    accumulatedRef.current += Date.now() - startTimeRef.current;
    setIsRunning(false);
  };

  const reset = () => {
    cancelAnimationFrame(rafRef.current);
    accumulatedRef.current = 0;
    setElapsed(0);
    setIsRunning(false);
    setLaps([]);
  };

  const recordLap = () => {
    const total = elapsed;
    const prevTotal = laps.length > 0 ? laps[laps.length - 1].totalTime : 0;
    setLaps(prev => [...prev, {
      id: prev.length + 1,
      lapTime: total - prevTotal,
      totalTime: total,
    }]);
  };

  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const exportLaps = () => {
    const csv = "Lap,Lap Time,Total Time\n" +
      laps.map(l => `${l.id},${formatMs(l.lapTime)},${formatMs(l.totalTime)}`).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "lap-times.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Find best/worst lap
  const lapTimes = laps.map(l => l.lapTime);
  const bestLap = lapTimes.length > 0 ? Math.min(...lapTimes) : null;
  const worstLap = lapTimes.length > 0 ? Math.max(...lapTimes) : null;
  const avgLap = lapTimes.length > 0 ? lapTimes.reduce((a, b) => a + b, 0) / lapTimes.length : null;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Stopwatch & Lap Timer</CardTitle>
          <CardDescription>Precision stopwatch with multi-lap tracking, stats, and CSV export</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Display */}
          <div className="text-center py-8">
            <div className={`font-mono text-7xl font-bold tracking-tighter transition-colors ${isRunning ? "text-primary" : "text-foreground"}`}>
              {formatMs(elapsed)}
            </div>
            {laps.length > 0 && (
              <div className="text-sm text-muted-foreground mt-2 font-mono">
                Current lap: {formatMs(elapsed - laps[laps.length - 1].totalTime)}
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-3">
            {!isRunning ? (
              <Button size="lg" onClick={start} className="w-28">
                <Play className="h-5 w-5 mr-2" /> {elapsed > 0 ? "Resume" : "Start"}
              </Button>
            ) : (
              <Button size="lg" variant="outline" onClick={pause} className="w-28">
                <Pause className="h-5 w-5 mr-2" /> Pause
              </Button>
            )}
            <Button
              size="lg"
              variant="outline"
              onClick={recordLap}
              disabled={!isRunning}
              className="w-28"
            >
              <Flag className="h-5 w-5 mr-2" /> Lap
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={reset}
              disabled={isRunning}
              className="w-28"
            >
              <Square className="h-5 w-5 mr-2" /> Reset
            </Button>
          </div>

          {/* Stats */}
          {laps.length > 0 && (
            <>
              <Separator />
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
                  <div className="text-xs text-green-700 dark:text-green-400 font-medium">Best Lap</div>
                  <div className="font-mono font-bold text-green-700 dark:text-green-400 mt-1">
                    {bestLap !== null ? formatMs(bestLap) : "—"}
                  </div>
                </div>
                <div className="bg-muted rounded-lg p-3 text-center">
                  <div className="text-xs text-muted-foreground font-medium">Average</div>
                  <div className="font-mono font-bold mt-1">
                    {avgLap !== null ? formatMs(avgLap) : "—"}
                  </div>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 text-center">
                  <div className="text-xs text-red-700 dark:text-red-400 font-medium">Worst Lap</div>
                  <div className="font-mono font-bold text-red-700 dark:text-red-400 mt-1">
                    {worstLap !== null ? formatMs(worstLap) : "—"}
                  </div>
                </div>
              </div>

              {/* Lap List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Lap Times</Label>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={exportLaps}>
                      <Download className="h-3 w-3 mr-1" /> Export CSV
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setLaps([])} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="max-h-64 overflow-y-auto rounded-md border">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-muted">
                      <tr>
                        <th className="text-left p-2">Lap</th>
                        <th className="text-right p-2">Lap Time</th>
                        <th className="text-right p-2">Total</th>
                        <th className="text-center p-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...laps].reverse().map((lap) => {
                        const isBest = lap.lapTime === bestLap && lapTimes.length > 1;
                        const isWorst = lap.lapTime === worstLap && lapTimes.length > 1;
                        return (
                          <tr key={lap.id} className="border-t hover:bg-muted/50">
                            <td className="p-2 font-medium">#{lap.id}</td>
                            <td className="p-2 text-right font-mono">
                              <span className={isBest ? "text-green-600" : isWorst ? "text-red-600" : ""}>
                                {formatMs(lap.lapTime)}
                              </span>
                            </td>
                            <td className="p-2 text-right font-mono text-muted-foreground">
                              {formatMs(lap.totalTime)}
                            </td>
                            <td className="p-2 text-center">
                              {isBest && <Badge className="bg-green-100 text-green-700 text-xs">Best</Badge>}
                              {isWorst && <Badge className="bg-red-100 text-red-700 text-xs">Worst</Badge>}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
