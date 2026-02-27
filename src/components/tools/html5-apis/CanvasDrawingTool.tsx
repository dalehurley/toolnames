import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Paintbrush, Eraser, Trash2, Download, Undo2, Square, Circle, Minus, Type as TypeIcon } from "lucide-react";

type Tool = "pen" | "eraser" | "line" | "rect" | "circle" | "fill" | "text";
type DrawState = { imageData: ImageData };

const PRESET_COLORS = [
  "#000000", "#ffffff", "#ef4444", "#f97316", "#eab308",
  "#22c55e", "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899",
];

export const CanvasDrawingTool = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<Tool>("pen");
  const [color, setColor] = useState("#000000");
  const [lineWidth, setLineWidth] = useState(4);
  const [opacity, setOpacity] = useState(100);
  const [drawing, setDrawing] = useState(false);
  const [history, setHistory] = useState<DrawState[]>([]);
  const [textInput, setTextInput] = useState("");
  const startRef = useRef({ x: 0, y: 0 });
  const snapshotRef = useRef<ImageData | null>(null);

  const getCtx = () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    return ctx;
  };

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const saveState = useCallback(() => {
    const ctx = getCtx();
    const imageData = ctx.getImageData(0, 0, canvasRef.current!.width, canvasRef.current!.height);
    setHistory(h => [...h.slice(-19), { imageData }]);
  }, []);

  const onMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    const pos = getPos(e);
    saveState();
    const ctx = getCtx();
    snapshotRef.current = ctx.getImageData(0, 0, canvasRef.current!.width, canvasRef.current!.height);
    startRef.current = pos;

    if (tool === "text") {
      const text = textInput || "Hello";
      ctx.globalAlpha = opacity / 100;
      ctx.fillStyle = color;
      ctx.font = `${lineWidth * 4}px sans-serif`;
      ctx.fillText(text, pos.x, pos.y);
      ctx.globalAlpha = 1;
      return;
    }

    if (tool === "fill") {
      floodFill(ctx, Math.round(pos.x), Math.round(pos.y), color);
      return;
    }

    setDrawing(true);
    if (tool === "pen" || tool === "eraser") {
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    }
  };

  const onMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing) return;
    const pos = getPos(e);
    const ctx = getCtx();

    if (tool === "pen") {
      ctx.globalAlpha = opacity / 100;
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      ctx.globalAlpha = 1;
    } else if (tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = lineWidth * 3;
      ctx.lineCap = "round";
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      ctx.globalCompositeOperation = "source-over";
    } else if (snapshotRef.current) {
      ctx.putImageData(snapshotRef.current, 0, 0);
      ctx.globalAlpha = opacity / 100;
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.fillStyle = color + "44";
      const { x: sx, y: sy } = startRef.current;
      if (tool === "line") {
        ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(pos.x, pos.y); ctx.stroke();
      } else if (tool === "rect") {
        ctx.strokeRect(sx, sy, pos.x - sx, pos.y - sy);
        ctx.fillRect(sx, sy, pos.x - sx, pos.y - sy);
      } else if (tool === "circle") {
        const rx = Math.abs(pos.x - sx) / 2, ry = Math.abs(pos.y - sy) / 2;
        const cx = sx + (pos.x - sx) / 2, cy = sy + (pos.y - sy) / 2;
        ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        ctx.stroke(); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
  };

  const onMouseUp = () => setDrawing(false);

  const undo = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    getCtx().putImageData(prev.imageData, 0, 0);
    setHistory(h => h.slice(0, -1));
  };

  const clearCanvas = () => {
    saveState();
    const ctx = getCtx();
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
  };

  const download = () => {
    const canvas = canvasRef.current!;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a"); a.href = url; a.download = `drawing-${Date.now()}.png`; a.click();
  };

  function floodFill(ctx: CanvasRenderingContext2D, x: number, y: number, fillColorHex: string) {
    const canvas = canvasRef.current!;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const idx = (y * canvas.width + x) * 4;
    const targetR = data[idx], targetG = data[idx + 1], targetB = data[idx + 2], targetA = data[idx + 3];
    const fill = parseInt(fillColorHex.slice(1), 16);
    const fR = (fill >> 16) & 0xff, fG = (fill >> 8) & 0xff, fB = fill & 0xff;
    if (targetR === fR && targetG === fG && targetB === fB) return;
    const stack = [[x, y]];
    while (stack.length) {
      const [cx, cy] = stack.pop()!;
      const ci = (cy * canvas.width + cx) * 4;
      if (cx < 0 || cy < 0 || cx >= canvas.width || cy >= canvas.height) continue;
      if (data[ci] !== targetR || data[ci + 1] !== targetG || data[ci + 2] !== targetB || data[ci + 3] !== targetA) continue;
      data[ci] = fR; data[ci + 1] = fG; data[ci + 2] = fB; data[ci + 3] = 255;
      stack.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
    }
    ctx.putImageData(imageData, 0, 0);
  }

  const tools: { id: Tool; icon: React.ReactNode; label: string }[] = [
    { id: "pen", icon: <Paintbrush className="h-4 w-4" />, label: "Pen" },
    { id: "eraser", icon: <Eraser className="h-4 w-4" />, label: "Eraser" },
    { id: "line", icon: <Minus className="h-4 w-4" />, label: "Line" },
    { id: "rect", icon: <Square className="h-4 w-4" />, label: "Rectangle" },
    { id: "circle", icon: <Circle className="h-4 w-4" />, label: "Ellipse" },
    { id: "fill", icon: <span className="text-base">🪣</span>, label: "Fill" },
    { id: "text", icon: <TypeIcon className="h-4 w-4" />, label: "Text" },
  ];

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Paintbrush className="h-6 w-6 text-primary" />
          <div>
            <CardTitle className="text-2xl">Canvas Drawing Tool</CardTitle>
            <CardDescription>Draw, sketch, and export artwork using the HTML5 Canvas 2D API</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Toolbar */}
        <div className="flex flex-wrap gap-2 items-center p-2 bg-muted rounded-lg">
          {tools.map(t => (
            <Button key={t.id} size="sm" variant={tool === t.id ? "default" : "outline"}
              onClick={() => setTool(t.id)} title={t.label}>
              {t.icon}
            </Button>
          ))}
          <div className="h-6 w-px bg-border mx-1" />
          {tool === "text" && (
            <input value={textInput} onChange={e => setTextInput(e.target.value)}
              placeholder="Text..." className="border rounded px-2 py-1 text-sm w-24" />
          )}
          <input type="color" value={color} onChange={e => setColor(e.target.value)}
            className="h-8 w-8 rounded cursor-pointer border" title="Color" />
          <div className="h-6 w-px bg-border mx-1" />
          <Button size="sm" variant="outline" onClick={undo} disabled={history.length === 0}>
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={clearCanvas}><Trash2 className="h-4 w-4" /></Button>
          <Button size="sm" variant="outline" onClick={download}><Download className="h-4 w-4" /></Button>
        </div>

        {/* Quick colors */}
        <div className="flex gap-1 flex-wrap">
          {PRESET_COLORS.map(c => (
            <button key={c} onClick={() => setColor(c)}
              className={`h-6 w-6 rounded-full border-2 transition-transform hover:scale-110 ${color === c ? "border-primary scale-110" : "border-transparent"}`}
              style={{ backgroundColor: c }} />
          ))}
        </div>

        {/* Sliders */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Size: {lineWidth}px</label>
            <Slider min={1} max={50} value={[lineWidth]} onValueChange={([v]) => setLineWidth(v)} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Opacity: {opacity}%</label>
            <Slider min={5} max={100} value={[opacity]} onValueChange={([v]) => setOpacity(v)} />
          </div>
        </div>

        {/* Canvas */}
        <div className="rounded-lg overflow-hidden border cursor-crosshair select-none">
          <canvas
            ref={canvasRef}
            width={800}
            height={500}
            className="w-full touch-none"
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            onTouchStart={onMouseDown}
            onTouchMove={onMouseMove}
            onTouchEnd={onMouseUp}
          />
        </div>

        <div className="bg-muted rounded-lg p-3 text-sm text-muted-foreground">
          <strong>Canvas 2D API</strong> — Full drawing surface using HTML5 Canvas. Supports touch input. Export to PNG with the download button. All drawing is client-side.
        </div>
      </CardContent>
    </Card>
  );
};
