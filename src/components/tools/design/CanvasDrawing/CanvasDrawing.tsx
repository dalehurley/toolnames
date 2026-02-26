import {
  useRef,
  useEffect,
  useState,
  useCallback,
  type FC,
} from "react";
import {
  Canvas as FabricCanvas,
  Rect,
  Ellipse,
  Triangle,
  Line,
  IText,
  Path,
  FabricImage,
  PencilBrush,
  CircleBrush,
  Point,
  ActiveSelection,
  Group as FabricGroup,
  type FabricObject,
  type TPointerEventInfo,
  type TPointerEvent,
} from "fabric";
import { getStroke } from "perfect-freehand";
import rough from "roughjs";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  MousePointer2,
  Pencil,
  Eraser,
  Minus,
  ArrowRight,
  Square,
  Circle as CircleIcon,
  Triangle as TriangleIcon,
  Star,
  Type,
  ImageIcon,
  Hand,
  Undo2,
  Redo2,
  Trash2,
  Download,
  Upload,
  ZoomIn,
  ZoomOut,
  Grid3x3,
  ChevronDown,
  Bold,
  Italic,
  Copy,
  AlignStartVertical,
  AlignEndVertical,
  Hexagon,
  Spline,
  FileCode,
  Layers2,
  PenTool,
  FlipHorizontal2,
  FlipVertical2,
  Lock,
  Unlock,
  Wand2,
  Group,
  Ungroup,
} from "lucide-react";
import { toast } from "sonner";

// ─── Types ───────────────────────────────────────────────────────────────────

type DrawingTool =
  | "select"
  | "hand"
  | "pencil"
  | "pen"
  | "brush"
  | "eraser"
  | "line"
  | "arrow"
  | "rect"
  | "ellipse"
  | "triangle"
  | "polygon"
  | "star"
  | "text"
  | "image";

interface DrawingStyle {
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
  opacity: number;
  lineDash: "solid" | "dashed" | "dotted";
  hasFill: boolean;
  fontSize: number;
  fontFamily: string;
  fontWeight: "normal" | "bold";
  fontStyle: "normal" | "italic";
  cornerRadius: number;
  sides: number;
  arrowEnd: boolean;
  arrowStart: boolean;
  brushSize: number;
  roughness: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_STYLE: DrawingStyle = {
  strokeColor: "#3b82f6",
  fillColor: "#93c5fd",
  strokeWidth: 2,
  opacity: 100,
  lineDash: "solid",
  hasFill: false,
  fontSize: 20,
  fontFamily: "Arial",
  fontWeight: "normal",
  fontStyle: "normal",
  cornerRadius: 0,
  sides: 6,
  arrowEnd: true,
  arrowStart: false,
  brushSize: 12,
  roughness: 1.5,
};

const CANVAS_PRESETS = [
  { name: "Freeform  1200×800", width: 1200, height: 800 },
  { name: "HD  1920×1080", width: 1920, height: 1080 },
  { name: "4K  3840×2160", width: 3840, height: 2160 },
  { name: "A4 Portrait  794×1123", width: 794, height: 1123 },
  { name: "A4 Landscape  1123×794", width: 1123, height: 794 },
  { name: "Square  800×800", width: 800, height: 800 },
  { name: "Mobile  390×844", width: 390, height: 844 },
  { name: "Twitter Header  1500×500", width: 1500, height: 500 },
  { name: "Instagram Post  1080×1080", width: 1080, height: 1080 },
  { name: "YouTube Thumb  1280×720", width: 1280, height: 720 },
];

const FONT_FAMILIES = [
  "Arial",
  "Helvetica",
  "Georgia",
  "Times New Roman",
  "Courier New",
  "Verdana",
  "Comic Sans MS",
  "Impact",
  "Trebuchet MS",
  "Tahoma",
];

const COLOR_SWATCHES = [
  "#000000",
  "#374151",
  "#6b7280",
  "#d1d5db",
  "#ffffff",
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#14b8a6",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#f43f5e",
  "#dc2626",
  "#ea580c",
  "#ca8a04",
  "#16a34a",
  "#0891b2",
];

// ─── Utilities ────────────────────────────────────────────────────────────────

function getSvgPathFromStroke(pts: number[][]): string {
  if (!pts.length) return "";
  const d: (string | number)[] = ["M", pts[0][0], pts[0][1]];
  for (let i = 1; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[i + 1];
    d.push("Q", x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
  }
  if (pts.length > 1) {
    const last = pts[pts.length - 1];
    d.push("L", last[0], last[1]);
  }
  d.push("Z");
  return d.join(" ");
}

function buildArrowPath(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  sw: number,
  arrowStart: boolean,
  arrowEnd: boolean
): string {
  const size = Math.max(sw * 5, 14);
  const angle = Math.atan2(y2 - y1, x2 - x1);
  let d = `M ${x1} ${y1} L ${x2} ${y2}`;
  if (arrowEnd) {
    const a1 = angle + Math.PI * 0.75;
    const a2 = angle - Math.PI * 0.75;
    d += ` M ${x2} ${y2} L ${x2 + size * Math.cos(a1)} ${y2 + size * Math.sin(a1)}`;
    d += ` M ${x2} ${y2} L ${x2 + size * Math.cos(a2)} ${y2 + size * Math.sin(a2)}`;
  }
  if (arrowStart) {
    const ra = angle + Math.PI;
    const a1 = ra + Math.PI * 0.75;
    const a2 = ra - Math.PI * 0.75;
    d += ` M ${x1} ${y1} L ${x1 + size * Math.cos(a1)} ${y1 + size * Math.sin(a1)}`;
    d += ` M ${x1} ${y1} L ${x1 + size * Math.cos(a2)} ${y1 + size * Math.sin(a2)}`;
  }
  return d;
}

function buildPolygonPath(
  cx: number,
  cy: number,
  sides: number,
  radius: number
): string {
  if (radius < 1) return `M ${cx} ${cy} Z`;
  const pts: string[] = [];
  for (let i = 0; i < sides; i++) {
    const a = (i * 2 * Math.PI) / sides - Math.PI / 2;
    pts.push(`${cx + radius * Math.cos(a)} ${cy + radius * Math.sin(a)}`);
  }
  return `M ${pts.join(" L ")} Z`;
}

function buildStarPath(
  cx: number,
  cy: number,
  outerR: number,
  innerR: number
): string {
  if (outerR < 1) return `M ${cx} ${cy} Z`;
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const a = (i * Math.PI) / 5 - Math.PI / 2;
    pts.push(`${cx + r * Math.cos(a)} ${cy + r * Math.sin(a)}`);
  }
  return `M ${pts.join(" L ")} Z`;
}

// ─── Roughjs helpers ─────────────────────────────────────────────────────────

const roughGen = rough.generator();

function buildRoughRect(
  x: number, y: number, w: number, h: number, roughness: number
): string {
  const shape = roughGen.rectangle(x, y, w, h, { roughness, bowing: 0.5 });
  return roughGen.toPaths(shape).map((p) => p.d).join(" ");
}

function buildRoughEllipse(
  cx: number, cy: number, rx: number, ry: number, roughness: number
): string {
  const shape = roughGen.ellipse(cx, cy, rx * 2, ry * 2, { roughness, bowing: 0.5 });
  return roughGen.toPaths(shape).map((p) => p.d).join(" ");
}

function buildRoughLine(
  x1: number, y1: number, x2: number, y2: number, roughness: number
): string {
  const shape = roughGen.line(x1, y1, x2, y2, { roughness, bowing: 0.5 });
  return roughGen.toPaths(shape).map((p) => p.d).join(" ");
}

function getDashArray(
  dash: DrawingStyle["lineDash"],
  sw: number
): number[] | undefined {
  if (dash === "dashed") return [sw * 4, sw * 2];
  if (dash === "dotted") return [sw, sw * 2];
  return undefined;
}

function commonProps(s: DrawingStyle) {
  return {
    stroke: s.strokeColor,
    strokeWidth: s.strokeWidth,
    strokeDashArray: getDashArray(s.lineDash, s.strokeWidth),
    fill: s.hasFill ? s.fillColor : "transparent",
    opacity: s.opacity / 100,
    selectable: false,
    evented: false,
    strokeUniform: true,
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const ColorButton: FC<{
  color: string;
  label: string;
  onChange: (c: string) => void;
}> = ({ color, label, onChange }) => (
  <Popover>
    <PopoverTrigger asChild>
      <button
        className="flex items-center gap-2 w-full rounded-md px-2 py-1.5 hover:bg-muted text-sm text-left"
        title={label}
      >
        <span
          className="w-5 h-5 rounded border border-border shadow-sm flex-shrink-0"
          style={{ backgroundColor: color }}
        />
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="ml-auto text-xs font-mono text-muted-foreground">
          {color}
        </span>
      </button>
    </PopoverTrigger>
    <PopoverContent className="w-56 p-3 space-y-3">
      <div className="grid grid-cols-5 gap-1">
        {COLOR_SWATCHES.map((c) => (
          <button
            key={c}
            className="w-8 h-8 rounded border border-border hover:scale-110 transition-transform"
            style={{ backgroundColor: c }}
            onClick={() => onChange(c)}
          />
        ))}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={color}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded border cursor-pointer"
        />
        <Input
          value={color}
          onChange={(e) => {
            if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value))
              onChange(e.target.value);
          }}
          className="h-7 text-xs font-mono"
        />
      </div>
    </PopoverContent>
  </Popover>
);

const ToolBtn: FC<{
  tool: { id: DrawingTool; icon: React.ReactNode; label: string; shortcut?: string };
  active: boolean;
  onSelect: (t: DrawingTool) => void;
}> = ({ tool, active, onSelect }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Button
        variant={active ? "default" : "ghost"}
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => onSelect(tool.id)}
      >
        {tool.icon}
      </Button>
    </TooltipTrigger>
    <TooltipContent side="right" className="flex items-center gap-2">
      {tool.label}
      {tool.shortcut && (
        <Badge variant="secondary" className="text-xs h-4 px-1">
          {tool.shortcut}
        </Badge>
      )}
    </TooltipContent>
  </Tooltip>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export function CanvasDrawing() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<FabricCanvas | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Mutable refs (avoid stale closures in event handlers)
  const toolRef = useRef<DrawingTool>("select");
  const styleRef = useRef<DrawingStyle>(DEFAULT_STYLE);
  const bgColorRef = useRef("#ffffff");
  const isDownRef = useRef(false);
  const startPtRef = useRef<Point | null>(null);
  const tmpRef = useRef<FabricObject | null>(null);
  const pfPointsRef = useRef<[number, number, number][]>([]);
  const pfPathRef = useRef<Path | null>(null);
  const isPanRef = useRef(false);
  const lastPanRef = useRef({ x: 0, y: 0 });

  // History
  const histRef = useRef<string[]>([]);
  const histIdxRef = useRef(-1);

  // UI state
  const [activeTool, setActiveTool] = useState<DrawingTool>("select");
  const [style, setStyle] = useState<DrawingStyle>(DEFAULT_STYLE);
  const [bgColor, setBgColor] = useState("#ffffff");
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [canvasSize, setCanvasSize] = useState({ width: 1200, height: 800 });
  const [showGrid, setShowGrid] = useState(false);
  const [selCount, setSelCount] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [sketchMode, setSketchMode] = useState(false);
  const sketchModeRef = useRef(false);
  const [colorHistory, setColorHistory] = useState<string[]>([]);
  const [objProps, setObjProps] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  // ── History helpers ──────────────────────────────────────────────────────

  const pushHistory = useCallback((canvas: FabricCanvas) => {
    const snap = JSON.stringify(canvas.toJSON());
    const items = histRef.current.slice(0, histIdxRef.current + 1);
    items.push(snap);
    if (items.length > 60) items.shift();
    histRef.current = items;
    histIdxRef.current = items.length - 1;
    setCanUndo(histIdxRef.current > 0);
    setCanRedo(false);
  }, []);

  const undo = useCallback(async () => {
    if (histIdxRef.current <= 0 || !fabricRef.current) return;
    histIdxRef.current--;
    const snap = histRef.current[histIdxRef.current];
    await fabricRef.current.loadFromJSON(JSON.parse(snap));
    fabricRef.current.renderAll();
    setCanUndo(histIdxRef.current > 0);
    setCanRedo(true);
  }, []);

  const redo = useCallback(async () => {
    const max = histRef.current.length - 1;
    if (histIdxRef.current >= max || !fabricRef.current) return;
    histIdxRef.current++;
    const snap = histRef.current[histIdxRef.current];
    await fabricRef.current.loadFromJSON(JSON.parse(snap));
    fabricRef.current.renderAll();
    setCanUndo(true);
    setCanRedo(histIdxRef.current < max);
  }, []);

  // ── Canvas mode update ───────────────────────────────────────────────────

  const applyTool = useCallback((tool: DrawingTool) => {
    const cv = fabricRef.current;
    if (!cv) return;
    // Reset
    cv.isDrawingMode = false;
    cv.selection = false;
    cv.defaultCursor = "crosshair";
    cv.hoverCursor = "crosshair";
    cv.getObjects().forEach((o) => {
      o.selectable = tool === "select";
      o.evented = tool === "select";
    });

    switch (tool) {
      case "select":
        cv.selection = true;
        cv.defaultCursor = "default";
        cv.hoverCursor = "move";
        cv.getObjects().forEach((o) => {
          o.selectable = true;
          o.evented = true;
        });
        break;
      case "hand":
        cv.defaultCursor = "grab";
        cv.hoverCursor = "grab";
        break;
      case "brush":
        cv.isDrawingMode = true;
        cv.freeDrawingBrush = new CircleBrush(cv);
        cv.freeDrawingBrush.color = styleRef.current.strokeColor;
        cv.freeDrawingBrush.width = styleRef.current.brushSize;
        break;
      case "eraser":
        cv.isDrawingMode = true;
        cv.freeDrawingBrush = new PencilBrush(cv);
        cv.freeDrawingBrush.color = bgColorRef.current;
        cv.freeDrawingBrush.width = styleRef.current.brushSize * 2;
        break;
      case "text":
        cv.defaultCursor = "text";
        cv.hoverCursor = "text";
        break;
      case "image":
        cv.defaultCursor = "copy";
        break;
    }
    cv.renderAll();
  }, []);

  // ── Mouse event handlers ─────────────────────────────────────────────────

  const onMouseDown = useCallback(
    (opt: TPointerEventInfo<TPointerEvent>) => {
      const cv = fabricRef.current;
      if (!cv) return;
      const tool = toolRef.current;
      const s = styleRef.current;
      const pt = opt.scenePoint;

      isDownRef.current = true;

      if (tool === "hand") {
        isPanRef.current = true;
        lastPanRef.current = { x: (opt.e as MouseEvent).clientX, y: (opt.e as MouseEvent).clientY };
        cv.defaultCursor = "grabbing";
        return;
      }
      if (tool === "select" || cv.isDrawingMode) return;

      startPtRef.current = pt;

      const cp = commonProps(s);

      switch (tool) {
        case "pencil":
        case "pen": {
          pfPointsRef.current = [[pt.x, pt.y, 0.5]];
          const sp = getStroke(pfPointsRef.current, {
            size: s.strokeWidth * 3,
            smoothing: 0.5,
            thinning: tool === "pen" ? 0.7 : 0.3,
            streamline: 0.5,
          });
          const pd = getSvgPathFromStroke(sp);
          const path = new Path(pd, {
            fill: s.strokeColor,
            stroke: "transparent",
            strokeWidth: 0,
            opacity: s.opacity / 100,
            selectable: false,
            evented: false,
          });
          cv.add(path);
          pfPathRef.current = path;
          break;
        }

        case "line": {
          const line = new Line([pt.x, pt.y, pt.x, pt.y], {
            ...cp,
            fill: "transparent",
          });
          cv.add(line);
          tmpRef.current = line;
          break;
        }

        case "arrow": {
          const path = new Path(`M ${pt.x} ${pt.y} L ${pt.x} ${pt.y}`, {
            ...cp,
            fill: "transparent",
          });
          cv.add(path);
          tmpRef.current = path;
          break;
        }

        case "rect": {
          const rect = new Rect({
            ...cp,
            left: pt.x,
            top: pt.y,
            width: 0,
            height: 0,
            rx: s.cornerRadius,
            ry: s.cornerRadius,
          });
          cv.add(rect);
          tmpRef.current = rect;
          break;
        }

        case "ellipse": {
          const ellipse = new Ellipse({
            ...cp,
            left: pt.x,
            top: pt.y,
            rx: 0,
            ry: 0,
          });
          cv.add(ellipse);
          tmpRef.current = ellipse;
          break;
        }

        case "triangle": {
          const tri = new Triangle({
            ...cp,
            left: pt.x,
            top: pt.y,
            width: 0,
            height: 0,
          });
          cv.add(tri);
          tmpRef.current = tri;
          break;
        }

        case "polygon": {
          const path = new Path(`M ${pt.x} ${pt.y} Z`, {
            ...cp,
          });
          cv.add(path);
          tmpRef.current = path;
          break;
        }

        case "star": {
          const path = new Path(`M ${pt.x} ${pt.y} Z`, {
            ...cp,
          });
          cv.add(path);
          tmpRef.current = path;
          break;
        }

        case "text": {
          const text = new IText("Type here...", {
            left: pt.x,
            top: pt.y,
            fontSize: s.fontSize,
            fontFamily: s.fontFamily,
            fill: s.strokeColor,
            fontWeight: s.fontWeight,
            fontStyle: s.fontStyle,
            opacity: s.opacity / 100,
            selectable: true,
            evented: true,
          });
          cv.add(text);
          cv.setActiveObject(text);
          text.enterEditing();
          text.selectAll();
          cv.renderAll();
          pushHistory(cv);
          break;
        }

        case "image":
          triggerImageUpload();
          break;
      }
    },
    [pushHistory]
  );

  const onMouseMove = useCallback(
    (opt: TPointerEventInfo<TPointerEvent>) => {
      const cv = fabricRef.current;
      if (!cv || !isDownRef.current) return;
      const tool = toolRef.current;
      const s = styleRef.current;
      const pt = opt.scenePoint;

      if (isPanRef.current && tool === "hand") {
        const vpt = cv.viewportTransform!;
        const me = opt.e as MouseEvent;
        vpt[4] += me.clientX - lastPanRef.current.x;
        vpt[5] += me.clientY - lastPanRef.current.y;
        lastPanRef.current = { x: me.clientX, y: me.clientY };
        cv.requestRenderAll();
        return;
      }

      if (!startPtRef.current || cv.isDrawingMode) return;
      const sp = startPtRef.current;

      switch (tool) {
        case "pencil":
        case "pen": {
          const pressure = tool === "pen" ? 0.5 : 0.5;
          pfPointsRef.current.push([pt.x, pt.y, pressure]);
          const stroke = getStroke(pfPointsRef.current, {
            size: s.strokeWidth * 3,
            smoothing: 0.5,
            thinning: tool === "pen" ? 0.7 : 0.3,
            streamline: 0.5,
          });
          const pd = getSvgPathFromStroke(stroke);
          if (pfPathRef.current) cv.remove(pfPathRef.current);
          const path = new Path(pd, {
            fill: s.strokeColor,
            stroke: "transparent",
            strokeWidth: 0,
            opacity: s.opacity / 100,
            selectable: false,
            evented: false,
          });
          cv.add(path);
          pfPathRef.current = path;
          cv.renderAll();
          break;
        }

        case "line": {
          const line = tmpRef.current as Line;
          if (line) {
            line.set({ x2: pt.x, y2: pt.y });
            cv.renderAll();
          }
          break;
        }

        case "arrow": {
          if (tmpRef.current) cv.remove(tmpRef.current);
          const pd = buildArrowPath(
            sp.x, sp.y, pt.x, pt.y,
            s.strokeWidth, s.arrowStart, s.arrowEnd
          );
          const path = new Path(pd, {
            ...commonProps(s),
            fill: "transparent",
            strokeLineCap: "round",
            strokeLineJoin: "round",
          });
          cv.add(path);
          tmpRef.current = path;
          cv.renderAll();
          break;
        }

        case "rect": {
          const obj = tmpRef.current as Rect;
          if (obj) {
            const l = Math.min(sp.x, pt.x);
            const t = Math.min(sp.y, pt.y);
            const w = Math.abs(pt.x - sp.x);
            const h = Math.abs(pt.y - sp.y);
            obj.set({ left: l, top: t, width: w, height: h });
            obj.setCoords();
            cv.renderAll();
          }
          break;
        }

        case "ellipse": {
          const obj = tmpRef.current as Ellipse;
          if (obj) {
            const cx = (sp.x + pt.x) / 2;
            const cy = (sp.y + pt.y) / 2;
            const rx = Math.abs(pt.x - sp.x) / 2;
            const ry = Math.abs(pt.y - sp.y) / 2;
            obj.set({ left: cx - rx, top: cy - ry, rx, ry });
            obj.setCoords();
            cv.renderAll();
          }
          break;
        }

        case "triangle": {
          const obj = tmpRef.current as Triangle;
          if (obj) {
            const l = Math.min(sp.x, pt.x);
            const t = Math.min(sp.y, pt.y);
            const w = Math.abs(pt.x - sp.x);
            const h = Math.abs(pt.y - sp.y);
            obj.set({ left: l, top: t, width: w, height: h });
            obj.setCoords();
            cv.renderAll();
          }
          break;
        }

        case "polygon": {
          if (tmpRef.current) cv.remove(tmpRef.current);
          const cx = (sp.x + pt.x) / 2;
          const cy = (sp.y + pt.y) / 2;
          const r = Math.hypot(pt.x - sp.x, pt.y - sp.y) / 2;
          const pd = buildPolygonPath(cx, cy, s.sides, r);
          const poly = new Path(pd, { ...commonProps(s) });
          cv.add(poly);
          tmpRef.current = poly;
          cv.renderAll();
          break;
        }

        case "star": {
          if (tmpRef.current) cv.remove(tmpRef.current);
          const cx = (sp.x + pt.x) / 2;
          const cy = (sp.y + pt.y) / 2;
          const r = Math.hypot(pt.x - sp.x, pt.y - sp.y) / 2;
          const pd = buildStarPath(cx, cy, r, r * 0.45);
          const star = new Path(pd, { ...commonProps(s) });
          cv.add(star);
          tmpRef.current = star;
          cv.renderAll();
          break;
        }
      }
    },
    []
  );

  const onMouseUp = useCallback(() => {
    const cv = fabricRef.current;
    if (!cv) return;

    isPanRef.current = false;
    if (toolRef.current === "hand") {
      cv.defaultCursor = "grab";
    }

    isDownRef.current = false;
    startPtRef.current = null;

    // Finalize shape – optionally apply roughjs sketch mode
    if (tmpRef.current) {
      const shape = tmpRef.current;
      const tool = toolRef.current;
      const s = styleRef.current;

      if (sketchModeRef.current && ["rect", "ellipse", "triangle", "line"].includes(tool)) {
        const roughProps: Partial<FabricObject> = {
          stroke: s.strokeColor,
          strokeWidth: s.strokeWidth,
          fill: s.hasFill ? s.fillColor : "transparent",
          opacity: s.opacity / 100,
          strokeLineCap: "round",
          strokeLineJoin: "round",
          selectable: true,
          evented: true,
        };

        let roughPath: Path | null = null;

        if (tool === "rect" && shape instanceof Rect) {
          const pd = buildRoughRect(
            shape.left ?? 0, shape.top ?? 0,
            shape.width ?? 0, shape.height ?? 0,
            s.roughness
          );
          roughPath = new Path(pd, roughProps);
        } else if (tool === "ellipse" && shape instanceof Ellipse) {
          const cx = (shape.left ?? 0) + (shape.rx ?? 0);
          const cy = (shape.top ?? 0) + (shape.ry ?? 0);
          const pd = buildRoughEllipse(cx, cy, shape.rx ?? 0, shape.ry ?? 0, s.roughness);
          roughPath = new Path(pd, roughProps);
        } else if (tool === "line" && shape instanceof Line) {
          const pd = buildRoughLine(shape.x1 ?? 0, shape.y1 ?? 0, shape.x2 ?? 0, shape.y2 ?? 0, s.roughness);
          roughPath = new Path(pd, roughProps);
        } else if (tool === "triangle" && shape instanceof Triangle) {
          const pd = buildRoughRect(
            shape.left ?? 0, shape.top ?? 0,
            shape.width ?? 0, shape.height ?? 0,
            s.roughness * 1.5
          );
          roughPath = new Path(pd, roughProps);
        }

        if (roughPath) {
          cv.remove(shape);
          cv.add(roughPath);
          roughPath.setCoords();
        } else {
          shape.set({ selectable: true, evented: true });
          shape.setCoords();
        }
      } else {
        shape.set({ selectable: true, evented: true });
        shape.setCoords();
      }

      tmpRef.current = null;
      pushHistory(cv);
    }

    // Finalize freehand path
    if (pfPathRef.current) {
      pfPathRef.current.set({ selectable: true, evented: true });
      pfPathRef.current.setCoords();
      pfPathRef.current = null;
      pfPointsRef.current = [];
      pushHistory(cv);
    }

    cv.renderAll();
  }, [pushHistory]);

  const onWheel = useCallback((opt: TPointerEventInfo<WheelEvent>) => {
    const cv = fabricRef.current;
    if (!cv) return;
    opt.e.preventDefault();
    if (opt.e.ctrlKey || opt.e.metaKey) {
      let z = cv.getZoom() * (opt.e.deltaY > 0 ? 0.95 : 1.05);
      z = Math.max(0.05, Math.min(20, z));
      cv.zoomToPoint(new Point(opt.e.offsetX, opt.e.offsetY), z);
      setZoom(Math.round(z * 100));
    } else {
      const vpt = cv.viewportTransform!;
      if (opt.e.shiftKey) vpt[4] -= opt.e.deltaX || opt.e.deltaY;
      else vpt[5] -= opt.e.deltaY;
      cv.requestRenderAll();
    }
  }, []);

  const onSelectionCreated = useCallback(() => {
    const cv = fabricRef.current;
    if (!cv) return;
    const objs = cv.getActiveObjects();
    setSelCount(objs.length);
    // Sync style panel to first selected object's properties
    if (objs.length === 1) {
      const o = objs[0];
      const bbox = o.getBoundingRect();
      setObjProps({
        x: Math.round(o.left ?? 0),
        y: Math.round(o.top ?? 0),
        w: Math.round(bbox.width),
        h: Math.round(bbox.height),
      });
      setStyle((prev) => ({
        ...prev,
        strokeColor: (o.stroke as string) || prev.strokeColor,
        fillColor: typeof o.fill === "string" && o.fill !== "transparent" ? o.fill : prev.fillColor,
        strokeWidth: o.strokeWidth ?? prev.strokeWidth,
        opacity: Math.round((o.opacity ?? 1) * 100),
        hasFill: typeof o.fill === "string" && o.fill !== "transparent" && o.fill !== "",
      }));
    } else {
      setObjProps(null);
    }
  }, []);

  const onPathCreated = useCallback(() => {
    const cv = fabricRef.current;
    if (cv) pushHistory(cv);
  }, [pushHistory]);

  // ── Canvas init ───────────────────────────────────────────────────────────

  useEffect(() => {
    if (!canvasRef.current) return;

    const cv = new FabricCanvas(canvasRef.current, {
      width: 1200,
      height: 800,
      backgroundColor: "#ffffff",
      selection: true,
      preserveObjectStacking: true,
      stopContextMenu: true,
      fireRightClick: true,
    });

    fabricRef.current = cv;

    cv.on("mouse:down", onMouseDown);
    cv.on("mouse:move", onMouseMove);
    cv.on("mouse:up", onMouseUp);
    cv.on("mouse:wheel", onWheel);
    cv.on("selection:created", onSelectionCreated);
    cv.on("selection:updated", onSelectionCreated);
    cv.on("selection:cleared", () => setSelCount(0));
    cv.on("path:created", onPathCreated);
    cv.on("object:modified", () => pushHistory(cv));

    pushHistory(cv);

    return () => {
      cv.off("mouse:down");
      cv.off("mouse:move");
      cv.off("mouse:up");
      cv.off("mouse:wheel");
      cv.dispose();
    };
  }, [onMouseDown, onMouseMove, onMouseUp, onWheel, onSelectionCreated, onPathCreated, pushHistory]);

  // ── Sync toolRef/styleRef with state ─────────────────────────────────────

  useEffect(() => {
    toolRef.current = activeTool;
    applyTool(activeTool);
  }, [activeTool, applyTool]);

  useEffect(() => {
    sketchModeRef.current = sketchMode;
  }, [sketchMode]);

  useEffect(() => {
    styleRef.current = style;
    // Track color history
    setColorHistory((prev) => {
      if (prev[0] === style.strokeColor) return prev;
      return [style.strokeColor, ...prev.filter((c) => c !== style.strokeColor)].slice(0, 10);
    });
    // Live-update active selection
    const cv = fabricRef.current;
    if (!cv) return;
    const objs = cv.getActiveObjects();
    if (objs.length === 0) return;
    objs.forEach((o) => {
      o.set({
        stroke: style.strokeColor,
        strokeWidth: style.strokeWidth,
        opacity: style.opacity / 100,
        strokeDashArray: getDashArray(style.lineDash, style.strokeWidth) ?? null,
      } as Partial<FabricObject>);
      if ("fill" in o && o.type !== "path") {
        (o as Rect).set({ fill: style.hasFill ? style.fillColor : "transparent" });
      }
      if (o instanceof IText) {
        o.set({
          fill: style.strokeColor,
          fontSize: style.fontSize,
          fontFamily: style.fontFamily,
          fontWeight: style.fontWeight,
          fontStyle: style.fontStyle,
        });
      }
    });
    cv.renderAll();
  }, [style]);

  useEffect(() => {
    bgColorRef.current = bgColor;
    if (fabricRef.current) {
      fabricRef.current.backgroundColor = bgColor;
      fabricRef.current.renderAll();
    }
  }, [bgColor]);

  // ── Actions ────────────────────────────────────────────────────────────────

  const triggerImageUpload = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      const cv = fabricRef.current;
      if (!file || !cv) return;
      const url = URL.createObjectURL(file);
      const img = await FabricImage.fromURL(url);
      const maxW = cv.width! * 0.8;
      const maxH = cv.height! * 0.8;
      const scale = Math.min(1, maxW / (img.width || 1), maxH / (img.height || 1));
      img.set({
        left: (cv.width! - (img.width || 0) * scale) / 2,
        top: (cv.height! - (img.height || 0) * scale) / 2,
        scaleX: scale,
        scaleY: scale,
      });
      cv.add(img);
      cv.setActiveObject(img);
      cv.renderAll();
      pushHistory(cv);
      URL.revokeObjectURL(url);
    };
    input.click();
  }, [pushHistory]);

  const deleteSelected = useCallback(() => {
    const cv = fabricRef.current;
    if (!cv) return;
    const objs = cv.getActiveObjects();
    if (objs.length === 0) return;
    objs.forEach((o) => cv.remove(o));
    cv.discardActiveObject();
    cv.renderAll();
    pushHistory(cv);
  }, [pushHistory]);

  const duplicateSelected = useCallback(async () => {
    const cv = fabricRef.current;
    if (!cv) return;
    const active = cv.getActiveObject();
    if (!active) return;
    const cloned = await active.clone();
    cloned.set({ left: (cloned.left || 0) + 20, top: (cloned.top || 0) + 20 });
    cv.add(cloned);
    cv.setActiveObject(cloned);
    cv.renderAll();
    pushHistory(cv);
  }, [pushHistory]);

  const clearCanvas = useCallback(() => {
    const cv = fabricRef.current;
    if (!cv) return;
    cv.getObjects().forEach((o) => cv.remove(o));
    cv.discardActiveObject();
    cv.renderAll();
    pushHistory(cv);
    toast.success("Canvas cleared");
  }, [pushHistory]);

  const groupSelected = useCallback(() => {
    const cv = fabricRef.current;
    if (!cv) return;
    const objs = cv.getActiveObjects();
    if (objs.length < 2) return;
    cv.discardActiveObject();
    const group = new FabricGroup(objs);
    objs.forEach((o) => cv.remove(o));
    cv.add(group);
    cv.setActiveObject(group);
    cv.renderAll();
    pushHistory(cv);
  }, [pushHistory]);

  const ungroupSelected = useCallback(() => {
    const cv = fabricRef.current;
    if (!cv) return;
    const obj = cv.getActiveObject();
    if (!(obj instanceof FabricGroup)) return;
    // Manually ungroup by extracting objects
    const items = obj.getObjects();
    const groupLeft = obj.left ?? 0;
    const groupTop = obj.top ?? 0;
    cv.remove(obj);
    items.forEach((item) => {
      // Restore absolute position
      item.set({
        left: groupLeft + (item.left ?? 0),
        top: groupTop + (item.top ?? 0),
        selectable: true,
        evented: true,
      });
      item.setCoords();
      cv.add(item);
    });
    const sel = new ActiveSelection(items, { canvas: cv });
    cv.setActiveObject(sel);
    cv.renderAll();
    pushHistory(cv);
  }, [pushHistory]);

  const bringForward = useCallback(() => {
    const cv = fabricRef.current;
    const o = cv?.getActiveObject();
    if (o && cv) { cv.bringObjectForward(o); cv.renderAll(); pushHistory(cv); }
  }, [pushHistory]);

  const sendBackward = useCallback(() => {
    const cv = fabricRef.current;
    const o = cv?.getActiveObject();
    if (o && cv) { cv.sendObjectBackwards(o); cv.renderAll(); pushHistory(cv); }
  }, [pushHistory]);

  const bringToFront = useCallback(() => {
    const cv = fabricRef.current;
    const o = cv?.getActiveObject();
    if (o && cv) { cv.bringObjectToFront(o); cv.renderAll(); pushHistory(cv); }
  }, [pushHistory]);

  const sendToBack = useCallback(() => {
    const cv = fabricRef.current;
    const o = cv?.getActiveObject();
    if (o && cv) { cv.sendObjectToBack(o); cv.renderAll(); pushHistory(cv); }
  }, [pushHistory]);

  const flipSelected = useCallback((axis: "x" | "y") => {
    const cv = fabricRef.current;
    const o = cv?.getActiveObject();
    if (!o || !cv) return;
    if (axis === "x") o.set({ flipX: !o.flipX });
    else o.set({ flipY: !o.flipY });
    cv.renderAll();
    pushHistory(cv);
  }, [pushHistory]);

  const toggleLock = useCallback(() => {
    const cv = fabricRef.current;
    const objs = cv?.getActiveObjects();
    if (!objs || !cv) return;
    const locked = !isLocked;
    objs.forEach((o) => {
      o.set({
        lockMovementX: locked,
        lockMovementY: locked,
        lockRotation: locked,
        lockScalingX: locked,
        lockScalingY: locked,
      });
    });
    cv.renderAll();
    setIsLocked(locked);
  }, [isLocked]);

  const setZoomLevel = useCallback((pct: number) => {
    const cv = fabricRef.current;
    if (!cv) return;
    const z = Math.max(5, Math.min(1000, pct)) / 100;
    cv.setZoom(z);
    setZoom(Math.round(z * 100));
  }, []);

  const fitToWindow = useCallback(() => {
    const cv = fabricRef.current;
    const container = containerRef.current;
    if (!cv || !container) return;
    const cw = container.clientWidth - 64;
    const ch = container.clientHeight - 64;
    const z = Math.min(cw / cv.width!, ch / cv.height!);
    cv.setZoom(z);
    cv.viewportTransform![4] = (container.clientWidth - cv.width! * z) / 2;
    cv.viewportTransform![5] = (container.clientHeight - cv.height! * z) / 2;
    cv.requestRenderAll();
    setZoom(Math.round(z * 100));
  }, []);

  const exportCanvas = useCallback(
    (format: "png" | "jpg" | "svg" | "json") => {
      const cv = fabricRef.current;
      if (!cv) return;
      if (format === "svg") {
        const svg = cv.toSVG();
        const blob = new Blob([svg], { type: "image/svg+xml" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = "canvas.svg"; a.click();
        URL.revokeObjectURL(url);
      } else if (format === "json") {
        const blob = new Blob([JSON.stringify(cv.toJSON(), null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = "canvas.json"; a.click();
        URL.revokeObjectURL(url);
      } else {
        const url = cv.toDataURL({ format: format === "jpg" ? "jpeg" : "png", quality: 1, multiplier: 2 });
        const a = document.createElement("a");
        a.href = url; a.download = `canvas.${format}`; a.click();
      }
      toast.success(`Exported as ${format.toUpperCase()}`);
    },
    []
  );

  const importJSON = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,application/json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      const cv = fabricRef.current;
      if (!file || !cv) return;
      const text = await file.text();
      await cv.loadFromJSON(JSON.parse(text));
      cv.renderAll();
      pushHistory(cv);
      toast.success("Canvas loaded");
    };
    input.click();
  }, [pushHistory]);

  const resizeCanvas = useCallback((w: number, h: number) => {
    const cv = fabricRef.current;
    if (!cv) return;
    cv.setDimensions({ width: w, height: h });
    setCanvasSize({ width: w, height: h });
    cv.renderAll();
  }, []);

  // ── Keyboard shortcuts ────────────────────────────────────────────────────

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable) return;

      const ctrl = e.ctrlKey || e.metaKey;

      if (ctrl && !e.shiftKey && e.key === "z") { e.preventDefault(); undo(); return; }
      if (ctrl && (e.key === "y" || (e.shiftKey && e.key === "z"))) { e.preventDefault(); redo(); return; }
      if (ctrl && e.key === "a") {
        e.preventDefault();
        const cv = fabricRef.current;
        if (cv) {
          const allObjs = cv.getObjects();
          if (allObjs.length > 0) {
            const sel = new ActiveSelection(allObjs, { canvas: cv });
            cv.setActiveObject(sel);
          }
          cv.renderAll();
        }
        return;
      }
      if (ctrl && e.key === "d") { e.preventDefault(); duplicateSelected(); return; }
      if (e.key === "Delete" || e.key === "Backspace") { deleteSelected(); return; }

      if (!ctrl) {
        switch (e.key) {
          case "v": case "Escape": setActiveTool("select"); break;
          case "h": setActiveTool("hand"); break;
          case "p": setActiveTool("pencil"); break;
          case "q": setActiveTool("pen"); break;
          case "b": setActiveTool("brush"); break;
          case "e": setActiveTool("eraser"); break;
          case "l": setActiveTool("line"); break;
          case "a": setActiveTool("arrow"); break;
          case "r": setActiveTool("rect"); break;
          case "o": setActiveTool("ellipse"); break;
          case "t": setActiveTool("text"); break;
          case "i": setActiveTool("image"); break;
          case "+": case "=": setZoomLevel(zoom + 10); break;
          case "-": setZoomLevel(zoom - 10); break;
          case "0": setZoomLevel(100); break;
          case "f": fitToWindow(); break;
          case "g": setShowGrid((v) => !v); break;
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo, duplicateSelected, deleteSelected, setZoomLevel, fitToWindow, zoom]);

  // ── Toolbar definition ────────────────────────────────────────────────────

  const toolGroups: { tools: { id: DrawingTool; icon: React.ReactNode; label: string; shortcut?: string }[] }[] = [
    {
      tools: [
        { id: "select", icon: <MousePointer2 size={15} />, label: "Select / Move", shortcut: "V" },
        { id: "hand", icon: <Hand size={15} />, label: "Pan Canvas", shortcut: "H" },
      ],
    },
    {
      tools: [
        { id: "pencil", icon: <Pencil size={15} />, label: "Pencil (smooth)", shortcut: "P" },
        { id: "pen", icon: <PenTool size={15} />, label: "Pen (pressure)", shortcut: "Q" },
        { id: "brush", icon: <Spline size={15} />, label: "Brush", shortcut: "B" },
        { id: "eraser", icon: <Eraser size={15} />, label: "Eraser", shortcut: "E" },
      ],
    },
    {
      tools: [
        { id: "line", icon: <Minus size={15} />, label: "Line", shortcut: "L" },
        { id: "arrow", icon: <ArrowRight size={15} />, label: "Arrow", shortcut: "A" },
        { id: "rect", icon: <Square size={15} />, label: "Rectangle", shortcut: "R" },
        { id: "ellipse", icon: <CircleIcon size={15} />, label: "Ellipse", shortcut: "O" },
        { id: "triangle", icon: <TriangleIcon size={15} />, label: "Triangle" },
        { id: "polygon", icon: <Hexagon size={15} />, label: "Polygon" },
        { id: "star", icon: <Star size={15} />, label: "Star" },
      ],
    },
    {
      tools: [
        { id: "text", icon: <Type size={15} />, label: "Text", shortcut: "T" },
        { id: "image", icon: <ImageIcon size={15} />, label: "Insert Image", shortcut: "I" },
      ],
    },
  ];

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <TooltipProvider delayDuration={400}>
      <div className="flex flex-col bg-muted/20 select-none" style={{ height: "calc(100vh - 72px)", minHeight: 580 }}>

        {/* ── Top Bar ── */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-background border-b shrink-0 flex-wrap">

          {/* Canvas preset */}
          <Select
            value={`${canvasSize.width}x${canvasSize.height}`}
            onValueChange={(v) => {
              const p = CANVAS_PRESETS.find((p) => `${p.width}x${p.height}` === v);
              if (p) resizeCanvas(p.width, p.height);
            }}
          >
            <SelectTrigger className="h-7 w-52 text-xs">
              <SelectValue placeholder="Canvas size" />
            </SelectTrigger>
            <SelectContent>
              {CANVAS_PRESETS.map((p) => (
                <SelectItem key={p.name} value={`${p.width}x${p.height}`} className="text-xs">
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Separator orientation="vertical" className="h-5" />

          {/* Background */}
          <label className="flex items-center gap-1.5 cursor-pointer text-xs text-muted-foreground">
            BG
            <input
              type="color"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
              className="w-6 h-6 rounded border cursor-pointer"
            />
          </label>

          <Separator orientation="vertical" className="h-5" />

          {/* Grid */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={showGrid ? "default" : "ghost"}
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => setShowGrid((v) => !v)}
              >
                <Grid3x3 size={13} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Toggle Grid (G)</TooltipContent>
          </Tooltip>

          {/* Fit to window */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1" onClick={fitToWindow}>
                Fit (F)
              </Button>
            </TooltipTrigger>
            <TooltipContent>Fit canvas to window</TooltipContent>
          </Tooltip>

          {/* Sketch mode */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={sketchMode ? "default" : "ghost"}
                size="sm"
                className="h-7 gap-1 px-2 text-xs"
                onClick={() => setSketchMode((v) => !v)}
              >
                <Wand2 size={13} />
                {sketchMode ? "Sketch ON" : "Sketch"}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Sketch mode: shapes get a hand-drawn look</TooltipContent>
          </Tooltip>

          <div className="flex-1" />

          {/* Undo/Redo */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" disabled={!canUndo} onClick={undo}>
                <Undo2 size={13} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" disabled={!canRedo} onClick={redo}>
                <Redo2 size={13} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Redo (Ctrl+Y)</TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="h-5" />

          {/* Zoom */}
          <div className="flex items-center gap-0.5">
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setZoomLevel(zoom - 10)}>
              <ZoomOut size={13} />
            </Button>
            <button
              className="text-xs font-mono w-12 text-center hover:bg-muted rounded px-1 py-0.5"
              onClick={() => setZoomLevel(100)}
              title="Reset zoom (0)"
            >
              {zoom}%
            </button>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setZoomLevel(zoom + 10)}>
              <ZoomIn size={13} />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-5" />

          {/* Import */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                <Upload size={12} /> Import
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={triggerImageUpload}>
                <ImageIcon size={13} className="mr-2" /> Image file
              </DropdownMenuItem>
              <DropdownMenuItem onClick={importJSON}>
                <FileCode size={13} className="mr-2" /> JSON canvas
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Export */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="h-7 text-xs gap-1">
                <Download size={12} /> Export <ChevronDown size={11} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => exportCanvas("png")}>PNG (2×, lossless)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportCanvas("jpg")}>JPG (2×)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportCanvas("svg")}>SVG vector</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => exportCanvas("json")}>JSON (re-editable)</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* ── Body ── */}
        <div className="flex flex-1 overflow-hidden">

          {/* ── Left Toolbar ── */}
          <div className="flex flex-col items-center gap-0.5 py-2 px-1 bg-background border-r w-11 shrink-0 overflow-y-auto">
            {toolGroups.map((group, gi) => (
              <div key={gi} className="flex flex-col items-center gap-0.5 w-full">
                {gi > 0 && <Separator className="w-7 my-1" />}
                {group.tools.map((t) => (
                  <ToolBtn
                    key={t.id}
                    tool={t}
                    active={activeTool === t.id}
                    onSelect={(id) => {
                      if (id === "image") triggerImageUpload();
                      else setActiveTool(id);
                    }}
                  />
                ))}
              </div>
            ))}

            <div className="flex-1" />
            <Separator className="w-7 my-1" />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={clearCanvas}
                >
                  <Trash2 size={14} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Clear all</TooltipContent>
            </Tooltip>
          </div>

          {/* ── Canvas Area ── */}
          <div
            ref={containerRef}
            className="flex-1 overflow-auto relative"
            style={{
              backgroundImage: showGrid
                ? "radial-gradient(circle, hsl(var(--muted-foreground)/0.3) 1px, transparent 1px)"
                : "radial-gradient(circle, hsl(var(--muted-foreground)/0.1) 1px, transparent 1px)",
              backgroundSize: showGrid ? "20px 20px" : "40px 40px",
              backgroundColor: "hsl(var(--muted)/0.4)",
            }}
          >
            <div className="flex items-center justify-center p-12 min-h-full">
              <div
                className="shadow-2xl ring-1 ring-black/10"
                style={{ width: canvasSize.width, height: canvasSize.height }}
              >
                <canvas ref={canvasRef} />
              </div>
            </div>
          </div>

          {/* ── Right Panel ── */}
          <div className="w-60 bg-background border-l overflow-y-auto shrink-0">
            <div className="p-3 space-y-4">

              {/* ─ Active object info ─ */}
              {selCount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    {selCount} selected
                  </span>
                  <div className="flex gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={deleteSelected}>
                          <Trash2 size={12} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Delete</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={duplicateSelected}>
                          <Copy size={12} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Duplicate (Ctrl+D)</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={toggleLock}>
                          {isLocked ? <Lock size={12} /> : <Unlock size={12} />}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{isLocked ? "Unlock" : "Lock"}</TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              )}

              {/* ─ Colors ─ */}
              <div>
                <p className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wide">Colors</p>
                <ColorButton
                  color={style.strokeColor}
                  label="Stroke / text"
                  onChange={(c) => setStyle((s) => ({ ...s, strokeColor: c }))}
                />
                <div className="mt-1">
                  <label className="flex items-center gap-2 px-2 py-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={style.hasFill}
                      onChange={(e) => setStyle((s) => ({ ...s, hasFill: e.target.checked }))}
                      className="w-3 h-3"
                    />
                    <span className="text-xs text-muted-foreground">Fill shape</span>
                  </label>
                  {style.hasFill && (
                    <ColorButton
                      color={style.fillColor}
                      label="Fill color"
                      onChange={(c) => setStyle((s) => ({ ...s, fillColor: c }))}
                    />
                  )}
                </div>
              </div>

              <Separator />

              {/* ─ Stroke ─ */}
              <div>
                <p className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wide">Stroke</p>

                <div className="space-y-2">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <Label className="text-xs">Width</Label>
                      <span className="text-xs font-mono text-muted-foreground">{style.strokeWidth}px</span>
                    </div>
                    <Slider
                      min={1} max={50} step={1}
                      value={[style.strokeWidth]}
                      onValueChange={([v]) => setStyle((s) => ({ ...s, strokeWidth: v }))}
                    />
                  </div>

                  <div>
                    <Label className="text-xs mb-1 block">Style</Label>
                    <Select
                      value={style.lineDash}
                      onValueChange={(v) => setStyle((s) => ({ ...s, lineDash: v as DrawingStyle["lineDash"] }))}
                    >
                      <SelectTrigger className="h-7 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="solid" className="text-xs">——— Solid</SelectItem>
                        <SelectItem value="dashed" className="text-xs">- - - Dashed</SelectItem>
                        <SelectItem value="dotted" className="text-xs">· · · Dotted</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              {/* ─ Opacity ─ */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Opacity</Label>
                  <span className="text-xs font-mono text-muted-foreground">{style.opacity}%</span>
                </div>
                <Slider
                  min={0} max={100} step={1}
                  value={[style.opacity]}
                  onValueChange={([v]) => setStyle((s) => ({ ...s, opacity: v }))}
                />
              </div>

              {/* ─ Tool-specific ─ */}
              {(activeTool === "pencil" || activeTool === "pen" || activeTool === "brush" || activeTool === "eraser") && (
                <>
                  <Separator />
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Brush size</Label>
                      <span className="text-xs font-mono text-muted-foreground">{style.brushSize}px</span>
                    </div>
                    <Slider
                      min={1} max={80} step={1}
                      value={[style.brushSize]}
                      onValueChange={([v]) => {
                        setStyle((s) => ({ ...s, brushSize: v }));
                        const cv = fabricRef.current;
                        if (cv?.freeDrawingBrush) cv.freeDrawingBrush.width = v;
                      }}
                    />
                  </div>
                </>
              )}

              {activeTool === "rect" && (
                <>
                  <Separator />
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Corner radius</Label>
                      <span className="text-xs font-mono text-muted-foreground">{style.cornerRadius}px</span>
                    </div>
                    <Slider
                      min={0} max={100} step={1}
                      value={[style.cornerRadius]}
                      onValueChange={([v]) => setStyle((s) => ({ ...s, cornerRadius: v }))}
                    />
                  </div>
                </>
              )}

              {activeTool === "polygon" && (
                <>
                  <Separator />
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Sides</Label>
                      <span className="text-xs font-mono text-muted-foreground">{style.sides}</span>
                    </div>
                    <Slider
                      min={3} max={12} step={1}
                      value={[style.sides]}
                      onValueChange={([v]) => setStyle((s) => ({ ...s, sides: v }))}
                    />
                  </div>
                </>
              )}

              {activeTool === "arrow" && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wide">Arrowhead</p>
                    <div className="flex gap-2">
                      <label className="flex items-center gap-1 cursor-pointer text-xs">
                        <input
                          type="checkbox"
                          checked={style.arrowStart}
                          onChange={(e) => setStyle((s) => ({ ...s, arrowStart: e.target.checked }))}
                          className="w-3 h-3"
                        />
                        Start
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer text-xs">
                        <input
                          type="checkbox"
                          checked={style.arrowEnd}
                          onChange={(e) => setStyle((s) => ({ ...s, arrowEnd: e.target.checked }))}
                          className="w-3 h-3"
                        />
                        End
                      </label>
                    </div>
                  </div>
                </>
              )}

              {activeTool === "text" && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wide">Typography</p>
                    <div className="space-y-2">
                      <Select
                        value={style.fontFamily}
                        onValueChange={(v) => setStyle((s) => ({ ...s, fontFamily: v }))}
                      >
                        <SelectTrigger className="h-7 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FONT_FAMILIES.map((f) => (
                            <SelectItem key={f} value={f} className="text-xs" style={{ fontFamily: f }}>
                              {f}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <Label className="text-xs">Font size</Label>
                          <span className="text-xs font-mono text-muted-foreground">{style.fontSize}px</span>
                        </div>
                        <Slider
                          min={8} max={200} step={1}
                          value={[style.fontSize]}
                          onValueChange={([v]) => setStyle((s) => ({ ...s, fontSize: v }))}
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant={style.fontWeight === "bold" ? "default" : "outline"}
                          size="sm"
                          className="h-7 flex-1"
                          onClick={() => setStyle((s) => ({ ...s, fontWeight: s.fontWeight === "bold" ? "normal" : "bold" }))}
                        >
                          <Bold size={12} />
                        </Button>
                        <Button
                          variant={style.fontStyle === "italic" ? "default" : "outline"}
                          size="sm"
                          className="h-7 flex-1"
                          onClick={() => setStyle((s) => ({ ...s, fontStyle: s.fontStyle === "italic" ? "normal" : "italic" }))}
                        >
                          <Italic size={12} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* ─ Object properties ─ */}
              {objProps && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wide">Position & Size</p>
                    <div className="grid grid-cols-2 gap-1">
                      {[
                        { label: "X", value: objProps.x },
                        { label: "Y", value: objProps.y },
                        { label: "W", value: objProps.w },
                        { label: "H", value: objProps.h },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex items-center gap-1 bg-muted/50 rounded px-2 py-1">
                          <span className="text-xs text-muted-foreground w-3">{label}</span>
                          <span className="text-xs font-mono">{value}px</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* ─ Sketch roughness ─ */}
              {sketchMode && (
                <>
                  <Separator />
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Roughness</Label>
                      <span className="text-xs font-mono text-muted-foreground">{style.roughness.toFixed(1)}</span>
                    </div>
                    <Slider
                      min={0} max={5} step={0.1}
                      value={[style.roughness]}
                      onValueChange={([v]) => setStyle((s) => ({ ...s, roughness: v }))}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Affects new shapes when Sketch mode is on
                    </p>
                  </div>
                </>
              )}

              {/* ─ Arrange ─ */}
              {selCount > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wide">Arrange</p>
                    <div className="grid grid-cols-2 gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={bringToFront}>
                            <Layers2 size={11} className="mr-1" /> Front
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Bring to front</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={sendToBack}>
                            <Layers2 size={11} className="mr-1 opacity-40" /> Back
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Send to back</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={bringForward}>
                            <AlignEndVertical size={11} className="mr-1" /> Forward
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Bring forward</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={sendBackward}>
                            <AlignStartVertical size={11} className="mr-1" /> Backward
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Send backward</TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="grid grid-cols-2 gap-1 mt-1">
                      <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => flipSelected("x")}>
                        <FlipHorizontal2 size={11} className="mr-1" /> Flip H
                      </Button>
                      <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => flipSelected("y")}>
                        <FlipVertical2 size={11} className="mr-1" /> Flip V
                      </Button>
                    </div>
                    {selCount >= 2 && (
                      <div className="grid grid-cols-2 gap-1 mt-1">
                        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={groupSelected}>
                          <Group size={11} className="mr-1" /> Group
                        </Button>
                        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={ungroupSelected}>
                          <Ungroup size={11} className="mr-1" /> Ungroup
                        </Button>
                      </div>
                    )}
                    {selCount === 1 && (
                      <Button variant="outline" size="sm" className="h-7 text-xs w-full mt-1" onClick={ungroupSelected}>
                        <Ungroup size={11} className="mr-1" /> Ungroup
                      </Button>
                    )}
                  </div>
                </>
              )}

              {/* ─ Shortcuts ─ */}
              <Separator />
              <div>
                <p className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wide">Shortcuts</p>
                <div className="space-y-1 text-xs text-muted-foreground">
                  {[
                    ["V", "Select"],
                    ["H", "Pan"],
                    ["P", "Pencil"],
                    ["Q", "Pen"],
                    ["B", "Brush"],
                    ["E", "Eraser"],
                    ["R", "Rectangle"],
                    ["O", "Ellipse"],
                    ["L", "Line"],
                    ["A", "Arrow"],
                    ["T", "Text"],
                    ["Del", "Delete"],
                    ["Ctrl+Z", "Undo"],
                    ["Ctrl+D", "Duplicate"],
                    ["Ctrl+A", "Select all"],
                    ["F", "Fit to window"],
                    ["G", "Grid"],
                    ["0", "Reset zoom"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between">
                      <kbd className="bg-muted px-1 rounded text-xs font-mono">{k}</kbd>
                      <span>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Status Bar ── */}
        <div className="flex items-center gap-2 px-3 py-1 bg-background border-t text-xs text-muted-foreground shrink-0">
          <span className="shrink-0">
            {canvasSize.width} × {canvasSize.height}px
          </span>
          <span className="shrink-0">Zoom: {zoom}%</span>
          {selCount > 0 && (
            <span className="text-primary font-medium shrink-0">
              {selCount} object{selCount !== 1 ? "s" : ""} selected
            </span>
          )}
          {sketchMode && (
            <Badge variant="secondary" className="text-xs h-4 px-1 shrink-0">Sketch</Badge>
          )}

          {/* Color history */}
          {colorHistory.length > 0 && (
            <div className="flex items-center gap-1 mx-2">
              <span className="text-muted-foreground shrink-0">Recent:</span>
              {colorHistory.map((c, i) => (
                <Tooltip key={i}>
                  <TooltipTrigger asChild>
                    <button
                      className="w-4 h-4 rounded-sm border border-border hover:scale-125 transition-transform shrink-0"
                      style={{ backgroundColor: c }}
                      onClick={() => setStyle((s) => ({ ...s, strokeColor: c }))}
                    />
                  </TooltipTrigger>
                  <TooltipContent>{c}</TooltipContent>
                </Tooltip>
              ))}
            </div>
          )}

          <div className="flex-1" />
          <span className="hidden sm:block shrink-0">
            Ctrl+scroll to zoom · H to pan · Del to delete
          </span>
        </div>
      </div>
    </TooltipProvider>
  );
}
