import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Smartphone, RotateCcw, Activity } from "lucide-react";

interface OrientationData {
  alpha: number | null;
  beta: number | null;
  gamma: number | null;
}

interface MotionData {
  x: number | null;
  y: number | null;
  z: number | null;
}

export const DeviceOrientationVisualizer = () => {
  const [active, setActive] = useState(false);
  const [orientation, setOrientation] = useState<OrientationData>({ alpha: 0, beta: 0, gamma: 0 });
  const [motion, setMotion] = useState<MotionData>({ x: 0, y: 0, z: 0 });
  const [history, setHistory] = useState<number[][]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cubeCanvasRef = useRef<HTMLCanvasElement>(null);
  const historyRef = useRef<number[][]>([]);

  const drawGraph = (data: number[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "hsl(222 47% 8%)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const colors = ["hsl(142 71% 45%)", "hsl(199 89% 48%)", "hsl(346 100% 65%)"];
    const labels = ["Alpha (Z)", "Beta (X)", "Gamma (Y)"];
    historyRef.current.push(data);
    if (historyRef.current.length > canvas.width / 3) historyRef.current.shift();
    const h = historyRef.current;
    h[0]?.forEach((_, axis) => {
      ctx.beginPath();
      ctx.strokeStyle = colors[axis];
      ctx.lineWidth = 1.5;
      h.forEach((frame, i) => {
        const x = (i / (canvas.width / 3)) * canvas.width;
        const v = ((frame[axis] ?? 0) + 180) / 360;
        const y = canvas.height - v * canvas.height;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.fillStyle = colors[axis];
      ctx.font = "10px monospace";
      ctx.fillText(labels[axis], 4, 14 + axis * 14);
    });
  };

  const drawCube = (beta: number, gamma: number, alpha: number) => {
    const canvas = cubeCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const W = canvas.width, H = canvas.height;
    ctx.fillStyle = "hsl(222 47% 8%)";
    ctx.fillRect(0, 0, W, H);

    // Project 3D cube with rotation
    const bRad = ((beta ?? 0) * Math.PI) / 180;
    const gRad = ((gamma ?? 0) * Math.PI) / 180;
    const aRad = ((alpha ?? 0) * Math.PI) / 180;

    const project = (x: number, y: number, z: number): [number, number] => {
      // Rotate around Z (alpha)
      let nx = x * Math.cos(aRad) - y * Math.sin(aRad);
      let ny = x * Math.sin(aRad) + y * Math.cos(aRad);
      let nz = z;
      // Rotate around X (beta)
      let ny2 = ny * Math.cos(bRad) - nz * Math.sin(bRad);
      let nz2 = ny * Math.sin(bRad) + nz * Math.cos(bRad);
      // Rotate around Y (gamma)
      let nx3 = nx * Math.cos(gRad) + nz2 * Math.sin(gRad);
      let nz3 = -nx * Math.sin(gRad) + nz2 * Math.cos(gRad);
      const scale = 250 / (250 + nz3 + 120);
      return [W / 2 + nx3 * scale * 50, H / 2 + ny2 * scale * 50];
    };

    const s = 1;
    const vertices = [
      [-s, -s, -s], [s, -s, -s], [s, s, -s], [-s, s, -s],
      [-s, -s, s], [s, -s, s], [s, s, s], [-s, s, s],
    ].map(([x, y, z]) => project(x, y, z));

    const faces = [
      { idx: [0, 1, 2, 3], color: "hsl(142 71% 35%)" },
      { idx: [4, 5, 6, 7], color: "hsl(199 89% 38%)" },
      { idx: [0, 1, 5, 4], color: "hsl(346 100% 50%)" },
      { idx: [2, 3, 7, 6], color: "hsl(36 100% 50%)" },
      { idx: [0, 3, 7, 4], color: "hsl(270 70% 50%)" },
      { idx: [1, 2, 6, 5], color: "hsl(60 80% 50%)" },
    ];

    faces.forEach(({ idx, color }) => {
      ctx.beginPath();
      ctx.fillStyle = color + "99";
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      const [p0, p1, p2, p3] = idx.map(i => vertices[i]);
      ctx.moveTo(p0[0], p0[1]);
      ctx.lineTo(p1[0], p1[1]);
      ctx.lineTo(p2[0], p2[1]);
      ctx.lineTo(p3[0], p3[1]);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    });
  };

  useEffect(() => {
    if (!active) return;

    const onOrientation = (e: DeviceOrientationEvent) => {
      setOrientation({ alpha: e.alpha, beta: e.beta, gamma: e.gamma });
      drawCube(e.beta ?? 0, e.gamma ?? 0, e.alpha ?? 0);
      drawGraph([e.alpha ?? 0, e.beta ?? 0, e.gamma ?? 0]);
    };

    const onMotion = (e: DeviceMotionEvent) => {
      const a = e.acceleration;
      setMotion({ x: a?.x ?? 0, y: a?.y ?? 0, z: a?.z ?? 0 });
    };

    window.addEventListener("deviceorientation", onOrientation);
    window.addEventListener("devicemotion", onMotion);
    return () => {
      window.removeEventListener("deviceorientation", onOrientation);
      window.removeEventListener("devicemotion", onMotion);
    };
  }, [active]);

  const toggle = async () => {
    if (active) {
      setActive(false);
      historyRef.current = [];
      return;
    }
    // iOS 13+ requires permission
    const DevOrEvent = DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> };
    if (typeof DevOrEvent.requestPermission === "function") {
      const perm = await DevOrEvent.requestPermission();
      if (perm !== "granted") return;
    }
    setActive(true);
  };

  const fmt = (v: number | null) => v == null ? "–" : v.toFixed(2);

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Smartphone className="h-6 w-6 text-primary" />
          <div>
            <CardTitle className="text-2xl">Device Orientation & Motion</CardTitle>
            <CardDescription>Visualize your device's tilt, rotation, and acceleration in real-time</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-center gap-3">
          <Button onClick={toggle} variant={active ? "destructive" : "default"}>
            {active ? <><RotateCcw className="h-4 w-4 mr-2" />Stop</> : <><Activity className="h-4 w-4 mr-2" />Start Sensing</>}
          </Button>
          {active && <Badge className="bg-green-500 text-white animate-pulse">● Active</Badge>}
          {!active && <p className="text-sm text-muted-foreground">Works best on a mobile device. Tilt or move your phone!</p>}
        </div>

        {/* 3D Cube + stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-lg overflow-hidden border bg-[hsl(222_47%_8%)]">
            <canvas ref={cubeCanvasRef} width={300} height={240} className="w-full" />
          </div>

          <div className="space-y-3">
            <div className="text-sm font-medium">Orientation (DeviceOrientationEvent)</div>
            {[
              { label: "Alpha (Z-axis / compass)", value: fmt(orientation.alpha), unit: "°", hint: "0–360, direction you're facing" },
              { label: "Beta (X-axis / front-back tilt)", value: fmt(orientation.beta), unit: "°", hint: "-180 to 180" },
              { label: "Gamma (Y-axis / left-right tilt)", value: fmt(orientation.gamma), unit: "°", hint: "-90 to 90" },
            ].map(({ label, value, unit, hint }) => (
              <div key={label} className="border rounded p-2">
                <div className="text-xs text-muted-foreground">{label}</div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-primary">{value}</span>
                  <span className="text-sm text-muted-foreground">{unit}</span>
                </div>
                <div className="text-xs text-muted-foreground">{hint}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Acceleration graph */}
        <div>
          <div className="text-sm font-medium mb-2">Orientation History</div>
          <div className="rounded-lg overflow-hidden border bg-[hsl(222_47%_8%)]">
            <canvas ref={canvasRef} width={600} height={120} className="w-full" />
          </div>
        </div>

        {/* Motion data */}
        <div>
          <div className="text-sm font-medium mb-2">Linear Acceleration (DeviceMotionEvent)</div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { axis: "X", value: motion.x },
              { axis: "Y", value: motion.y },
              { axis: "Z", value: motion.z },
            ].map(({ axis, value }) => (
              <div key={axis} className="border rounded-lg p-3 text-center">
                <div className="text-xs text-muted-foreground">Axis {axis}</div>
                <div className="text-xl font-bold text-primary">{fmt(value)}</div>
                <div className="text-xs text-muted-foreground">m/s²</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-muted rounded-lg p-3 text-sm text-muted-foreground">
          <strong>Device Orientation & Motion API</strong> — Reads gyroscope and accelerometer sensors. All processing is local. iOS 13+ requires a user gesture to grant permission.
        </div>
      </CardContent>
    </Card>
  );
};
