import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Palette,
  Copy,
  Save,
  Code,
  Shuffle,
  MoveHorizontal,
  Sun,
  Moon,
  Check,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ColorStop {
  id: string;
  name: string;
  hex: string;
  shade: number;
}

interface ColorPalette {
  id: string;
  name: string;
  colors: ColorStop[];
}

const defaultPalettes = [
  {
    id: "default",
    name: "Default",
    colors: [
      { id: "gray-50", name: "gray", hex: "#f9fafb", shade: 50 },
      { id: "gray-100", name: "gray", hex: "#f3f4f6", shade: 100 },
      { id: "gray-200", name: "gray", hex: "#e5e7eb", shade: 200 },
      { id: "gray-300", name: "gray", hex: "#d1d5db", shade: 300 },
      { id: "gray-400", name: "gray", hex: "#9ca3af", shade: 400 },
      { id: "gray-500", name: "gray", hex: "#6b7280", shade: 500 },
      { id: "gray-600", name: "gray", hex: "#4b5563", shade: 600 },
      { id: "gray-700", name: "gray", hex: "#374151", shade: 700 },
      { id: "gray-800", name: "gray", hex: "#1f2937", shade: 800 },
      { id: "gray-900", name: "gray", hex: "#111827", shade: 900 },
      { id: "gray-950", name: "gray", hex: "#030712", shade: 950 },
    ],
  },
  {
    id: "blue",
    name: "Blue",
    colors: [
      { id: "blue-50", name: "blue", hex: "#eff6ff", shade: 50 },
      { id: "blue-100", name: "blue", hex: "#dbeafe", shade: 100 },
      { id: "blue-200", name: "blue", hex: "#bfdbfe", shade: 200 },
      { id: "blue-300", name: "blue", hex: "#93c5fd", shade: 300 },
      { id: "blue-400", name: "blue", hex: "#60a5fa", shade: 400 },
      { id: "blue-500", name: "blue", hex: "#3b82f6", shade: 500 },
      { id: "blue-600", name: "blue", hex: "#2563eb", shade: 600 },
      { id: "blue-700", name: "blue", hex: "#1d4ed8", shade: 700 },
      { id: "blue-800", name: "blue", hex: "#1e40af", shade: 800 },
      { id: "blue-900", name: "blue", hex: "#1e3a8a", shade: 900 },
      { id: "blue-950", name: "blue", hex: "#172554", shade: 950 },
    ],
  },
  {
    id: "red",
    name: "Red",
    colors: [
      { id: "red-50", name: "red", hex: "#fef2f2", shade: 50 },
      { id: "red-100", name: "red", hex: "#fee2e2", shade: 100 },
      { id: "red-200", name: "red", hex: "#fecaca", shade: 200 },
      { id: "red-300", name: "red", hex: "#fca5a5", shade: 300 },
      { id: "red-400", name: "red", hex: "#f87171", shade: 400 },
      { id: "red-500", name: "red", hex: "#ef4444", shade: 500 },
      { id: "red-600", name: "red", hex: "#dc2626", shade: 600 },
      { id: "red-700", name: "red", hex: "#b91c1c", shade: 700 },
      { id: "red-800", name: "red", hex: "#991b1b", shade: 800 },
      { id: "red-900", name: "red", hex: "#7f1d1d", shade: 900 },
      { id: "red-950", name: "red", hex: "#450a0a", shade: 950 },
    ],
  },
  {
    id: "green",
    name: "Green",
    colors: [
      { id: "green-50", name: "green", hex: "#f0fdf4", shade: 50 },
      { id: "green-100", name: "green", hex: "#dcfce7", shade: 100 },
      { id: "green-200", name: "green", hex: "#bbf7d0", shade: 200 },
      { id: "green-300", name: "green", hex: "#86efac", shade: 300 },
      { id: "green-400", name: "green", hex: "#4ade80", shade: 400 },
      { id: "green-500", name: "green", hex: "#22c55e", shade: 500 },
      { id: "green-600", name: "green", hex: "#16a34a", shade: 600 },
      { id: "green-700", name: "green", hex: "#15803d", shade: 700 },
      { id: "green-800", name: "green", hex: "#166534", shade: 800 },
      { id: "green-900", name: "green", hex: "#14532d", shade: 900 },
      { id: "green-950", name: "green", hex: "#052e16", shade: 950 },
    ],
  },
  {
    id: "yellow",
    name: "Yellow",
    colors: [
      { id: "yellow-50", name: "yellow", hex: "#fefce8", shade: 50 },
      { id: "yellow-100", name: "yellow", hex: "#fef9c3", shade: 100 },
      { id: "yellow-200", name: "yellow", hex: "#fef08a", shade: 200 },
      { id: "yellow-300", name: "yellow", hex: "#fde047", shade: 300 },
      { id: "yellow-400", name: "yellow", hex: "#facc15", shade: 400 },
      { id: "yellow-500", name: "yellow", hex: "#eab308", shade: 500 },
      { id: "yellow-600", name: "yellow", hex: "#ca8a04", shade: 600 },
      { id: "yellow-700", name: "yellow", hex: "#a16207", shade: 700 },
      { id: "yellow-800", name: "yellow", hex: "#854d0e", shade: 800 },
      { id: "yellow-900", name: "yellow", hex: "#713f12", shade: 900 },
      { id: "yellow-950", name: "yellow", hex: "#422006", shade: 950 },
    ],
  },
  {
    id: "purple",
    name: "Purple",
    colors: [
      { id: "purple-50", name: "purple", hex: "#faf5ff", shade: 50 },
      { id: "purple-100", name: "purple", hex: "#f3e8ff", shade: 100 },
      { id: "purple-200", name: "purple", hex: "#e9d5ff", shade: 200 },
      { id: "purple-300", name: "purple", hex: "#d8b4fe", shade: 300 },
      { id: "purple-400", name: "purple", hex: "#c084fc", shade: 400 },
      { id: "purple-500", name: "purple", hex: "#a855f7", shade: 500 },
      { id: "purple-600", name: "purple", hex: "#9333ea", shade: 600 },
      { id: "purple-700", name: "purple", hex: "#7e22ce", shade: 700 },
      { id: "purple-800", name: "purple", hex: "#6b21a8", shade: 800 },
      { id: "purple-900", name: "purple", hex: "#581c87", shade: 900 },
      { id: "purple-950", name: "purple", hex: "#3b0764", shade: 950 },
    ],
  },
];

const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

// Color conversion utilities
const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

const componentToHex = (c: number): string => {
  const hex = c.toString(16);
  return hex.length === 1 ? "0" + hex : hex;
};

const rgbToHex = (r: number, g: number, b: number): string => {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
};

const hexToHsl = (hex: string): { h: number; s: number; l: number } => {
  const rgb = hexToRgb(hex);
  if (!rgb) return { h: 0, s: 0, l: 0 };

  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0,
    s = 0,
    l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }

    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
};

const hslToRgb = (
  h: number,
  s: number,
  l: number
): { r: number; g: number; b: number } => {
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0,
    g = 0,
    b = 0;

  if (0 <= h && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (60 <= h && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (120 <= h && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (180 <= h && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (240 <= h && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else if (300 <= h && h < 360) {
    r = c;
    g = 0;
    b = x;
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
};

const hslToHex = (h: number, s: number, l: number): string => {
  const rgb = hslToRgb(h, s, l);
  return rgbToHex(rgb.r, rgb.g, rgb.b);
};

// Calculate contrast ratio for accessibility
const getLuminance = (r: number, g: number, b: number): number => {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
};

// Check if a color is dark or light for text contrast
const isColorDark = (hex: string): boolean => {
  const rgb = hexToRgb(hex);
  if (!rgb) return false;

  const lum = getLuminance(rgb.r, rgb.g, rgb.b);
  return lum < 0.5;
};

// Generate a palette from a base color
const generateShadesFromBase = (
  baseColor: string,
  colorName: string
): ColorStop[] => {
  const baseHsl = hexToHsl(baseColor);

  // Create a palette with 11 shades (50-950)
  return shades.map((shade) => {
    // Adjust lightness based on shade number
    // Shade 500 is the base color
    let l = baseHsl.l;

    if (shade < 500) {
      // Lighter shades
      l = baseHsl.l + (100 - baseHsl.l) * ((500 - shade) / 450);
    } else if (shade > 500) {
      // Darker shades
      l = baseHsl.l * (1 - (shade - 500) / 450);
    }

    // Adjust saturation slightly
    let s = baseHsl.s;
    if (shade < 500) {
      // Lighter colors are less saturated
      s = Math.max(0, s - (500 - shade) / 20);
    } else if (shade > 500) {
      // Darker colors are more saturated
      s = Math.min(100, s + (shade - 500) / 25);
    }

    // Generate the color
    const hex = hslToHex(baseHsl.h, s, l);

    return {
      id: `${colorName}-${shade}`,
      name: colorName,
      hex: hex,
      shade: shade,
    };
  });
};

// Generate random color
const getRandomColor = (): string => {
  const h = Math.floor(Math.random() * 360);
  const s = 80 + Math.floor(Math.random() * 20); // Higher saturation for vibrant colors
  const l = 40 + Math.floor(Math.random() * 20); // Medium lightness for base color

  return hslToHex(h, s, l);
};

// Generate a complementary color
const getComplementaryColor = (hex: string): string => {
  const hsl = hexToHsl(hex);
  const h = (hsl.h + 180) % 360;
  return hslToHex(h, hsl.s, hsl.l);
};

export const ColorPaletteGenerator = () => {
  const [activeTab, setActiveTab] = useState("generator");
  const [currentPalette, setCurrentPalette] = useState<ColorPalette>(
    defaultPalettes[0]
  );
  const [baseColor, setBaseColor] = useState("#3b82f6"); // Default blue
  const [colorName, setColorName] = useState("custom");
  const [presetPalettes] = useState<ColorPalette[]>(defaultPalettes);
  const [tailwindCode, setTailwindCode] = useState("");
  const [codeDialogOpen, setCodeDialogOpen] = useState(false);
  const [themeMode, setThemeMode] = useState<"light" | "dark">("light");
  const [savedPalettes, setSavedPalettes] = useState<ColorPalette[]>([]);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [newPaletteName, setNewPaletteName] = useState("");
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  // Generate Tailwind config code
  useEffect(() => {
    generateTailwindConfig();
  }, [currentPalette]);

  const generateTailwindConfig = () => {
    // Group colors by name
    const colorGroups: { [key: string]: { [key: string]: string } } = {};

    currentPalette.colors.forEach((color) => {
      if (!colorGroups[color.name]) {
        colorGroups[color.name] = {};
      }
      colorGroups[color.name][color.shade] = color.hex;
    });

    let configCode = `// tailwind.config.js\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: {\n`;

    // Add each color group
    Object.entries(colorGroups).forEach(([name, shades], index, array) => {
      configCode += `        ${name}: {\n`;

      // Add each shade
      Object.entries(shades).forEach(([shade, hex], shadeIndex, shadeArray) => {
        configCode += `          '${shade}': '${hex}'${
          shadeIndex < shadeArray.length - 1 ? "," : ""
        }\n`;
      });

      configCode += `        }${index < array.length - 1 ? "," : ""}\n`;
    });

    configCode += `      }\n    }\n  }\n}`;

    setTailwindCode(configCode);
  };

  const handleBaseColorChange = (hex: string) => {
    setBaseColor(hex);
    const newPalette = {
      ...currentPalette,
      colors: generateShadesFromBase(hex, colorName),
    };
    setCurrentPalette(newPalette);
  };

  const handleColorNameChange = (name: string) => {
    setColorName(name);
    const newPalette = {
      ...currentPalette,
      colors: currentPalette.colors.map((color) => ({
        ...color,
        name: name,
        id: `${name}-${color.shade}`,
      })),
    };
    setCurrentPalette(newPalette);
  };

  const handleGenerateRandom = () => {
    const newBaseColor = getRandomColor();
    setBaseColor(newBaseColor);
    handleBaseColorChange(newBaseColor);
  };

  const handleGenerateComplementary = () => {
    const complementaryColor = getComplementaryColor(baseColor);

    // Create a palette with both colors
    const basePalette = generateShadesFromBase(baseColor, colorName);
    const complementaryPalette = generateShadesFromBase(
      complementaryColor,
      `${colorName}-complement`
    );

    setCurrentPalette({
      ...currentPalette,
      colors: [...basePalette, ...complementaryPalette],
    });
  };

  const handleSelectPreset = (paletteId: string) => {
    const selected = [...presetPalettes, ...savedPalettes].find(
      (p) => p.id === paletteId
    );
    if (selected) {
      setCurrentPalette(selected);

      // Update base color based on the 500 shade
      const baseColorStop = selected.colors.find((c) => c.shade === 500);
      if (baseColorStop) {
        setBaseColor(baseColorStop.hex);
        setColorName(baseColorStop.name);
      }
    }
  };

  const handleIndividualColorChange = (colorId: string, newHex: string) => {
    const newColors = currentPalette.colors.map((color) =>
      color.id === colorId ? { ...color, hex: newHex } : color
    );

    setCurrentPalette({
      ...currentPalette,
      colors: newColors,
    });
  };

  const handleSavePalette = () => {
    if (!newPaletteName) return;

    const newSavedPalette: ColorPalette = {
      id: `saved-${Date.now()}`,
      name: newPaletteName,
      colors: [...currentPalette.colors],
    };

    setSavedPalettes([...savedPalettes, newSavedPalette]);
    setNewPaletteName("");
    setSaveDialogOpen(false);
  };

  const handleCopyColor = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
    setTimeout(() => setCopiedColor(null), 1500);
  };

  const handleCopyConfig = () => {
    navigator.clipboard.writeText(tailwindCode);
  };

  const getTextColorClass = (backgroundColor: string) => {
    return isColorDark(backgroundColor) ? "text-white" : "text-black";
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-6 w-6 text-primary" />
          Color Palette Generator
        </CardTitle>
        <CardDescription>
          Create, customize and export color palettes for Tailwind CSS
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="generator">Generator</TabsTrigger>
            <TabsTrigger value="presets">Presets</TabsTrigger>
            <TabsTrigger value="saved">Saved</TabsTrigger>
          </TabsList>
        </Tabs>

        {activeTab === "generator" && (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="space-y-2">
                <Label htmlFor="baseColor">Base Color</Label>
                <div className="flex gap-2 items-center">
                  <div
                    className="w-12 h-12 rounded-md border overflow-hidden cursor-pointer"
                    style={{ backgroundColor: baseColor }}
                  >
                    <input
                      type="color"
                      id="baseColor"
                      value={baseColor}
                      onChange={(e) => handleBaseColorChange(e.target.value)}
                      className="w-16 h-16 cursor-pointer opacity-0"
                    />
                  </div>
                  <Input
                    type="text"
                    value={baseColor}
                    onChange={(e) => handleBaseColorChange(e.target.value)}
                    className="w-32 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="colorName">Color Name</Label>
                <Input
                  id="colorName"
                  type="text"
                  value={colorName}
                  onChange={(e) => handleColorNameChange(e.target.value)}
                  className="w-40"
                  placeholder="primary"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleGenerateRandom}>
                  <Shuffle className="h-4 w-4 mr-2" />
                  Random
                </Button>
                <Button variant="outline" onClick={handleGenerateComplementary}>
                  <MoveHorizontal className="h-4 w-4 mr-2" />
                  Complementary
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Preview Mode</Label>
                <div className="flex gap-2">
                  <Button
                    variant={themeMode === "light" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setThemeMode("light")}
                  >
                    <Sun className="h-4 w-4 mr-1" />
                    Light
                  </Button>
                  <Button
                    variant={themeMode === "dark" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setThemeMode("dark")}
                  >
                    <Moon className="h-4 w-4 mr-1" />
                    Dark
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Generated Palette</Label>
              <div
                className={`border rounded-lg p-4 ${
                  themeMode === "dark" ? "bg-gray-900" : "bg-white"
                }`}
              >
                <div className="flex flex-wrap gap-2">
                  {currentPalette.colors.map((color) => (
                    <TooltipProvider key={color.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="group">
                            <div
                              className={`w-16 h-20 rounded-md flex items-end justify-center cursor-pointer relative ${getTextColorClass(
                                color.hex
                              )}`}
                              style={{ backgroundColor: color.hex }}
                              onClick={() => handleCopyColor(color.hex)}
                            >
                              <div className="opacity-0 group-hover:opacity-100 absolute inset-0 bg-black/20 flex items-center justify-center transition-opacity">
                                <Copy className="h-4 w-4 text-white" />
                              </div>
                              {copiedColor === color.hex && (
                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                  <Check className="h-5 w-5 text-white" />
                                </div>
                              )}
                              <span className="p-1 text-xs font-medium">
                                {color.shade}
                              </span>
                            </div>
                            <div className="mt-1 text-center">
                              <input
                                type="text"
                                value={color.hex}
                                onChange={(e) =>
                                  handleIndividualColorChange(
                                    color.id,
                                    e.target.value
                                  )
                                }
                                className="w-full text-xs text-center font-mono bg-transparent"
                              />
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Click to copy: {color.hex}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Color Preview</Label>
              <div
                className={`border rounded-lg p-6 ${
                  themeMode === "dark" ? "bg-gray-900" : "bg-white"
                }`}
              >
                <div className="space-y-4">
                  {/* Preview UI elements */}
                  <div className="space-y-3">
                    <h3
                      className={`text-lg font-medium ${
                        themeMode === "dark" ? "text-white" : "text-black"
                      }`}
                    >
                      UI Elements Preview
                    </h3>

                    <div className="flex flex-wrap gap-2">
                      {/* Primary Button */}
                      <button
                        className={`px-4 py-2 rounded-md font-medium text-sm shadow-sm`}
                        style={{
                          backgroundColor: currentPalette.colors.find(
                            (c) => c.shade === 500
                          )?.hex,
                          color: getTextColorClass(
                            currentPalette.colors.find((c) => c.shade === 500)
                              ?.hex || "#000000"
                          ),
                        }}
                      >
                        Primary Button
                      </button>

                      {/* Secondary Button */}
                      <button
                        className={`px-4 py-2 rounded-md font-medium text-sm shadow-sm border`}
                        style={{
                          backgroundColor:
                            themeMode === "dark" ? "#1f2937" : "white",
                          borderColor: currentPalette.colors.find(
                            (c) => c.shade === 300
                          )?.hex,
                          color: currentPalette.colors.find(
                            (c) => c.shade === 700
                          )?.hex,
                        }}
                      >
                        Secondary Button
                      </button>

                      {/* Alert */}
                      <div
                        className="p-3 rounded-md border"
                        style={{
                          backgroundColor: currentPalette.colors.find(
                            (c) => c.shade === 100
                          )?.hex,
                          borderColor: currentPalette.colors.find(
                            (c) => c.shade === 300
                          )?.hex,
                          color: currentPalette.colors.find(
                            (c) => c.shade === 700
                          )?.hex,
                        }}
                      >
                        Alert message
                      </div>

                      {/* Badge */}
                      <Badge
                        style={{
                          backgroundColor: currentPalette.colors.find(
                            (c) => c.shade === 200
                          )?.hex,
                          color: currentPalette.colors.find(
                            (c) => c.shade === 800
                          )?.hex,
                        }}
                      >
                        Badge
                      </Badge>
                    </div>
                  </div>

                  <div className="pt-4">
                    <h3
                      className={`text-lg font-medium ${
                        themeMode === "dark" ? "text-white" : "text-black"
                      }`}
                    >
                      Accessibility
                    </h3>
                    <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Text on background */}
                      <div>
                        <h4 className="text-sm font-medium mb-2">
                          Text on background
                        </h4>
                        <div
                          className="p-4 rounded-md"
                          style={{
                            backgroundColor: currentPalette.colors.find(
                              (c) => c.shade === 100
                            )?.hex,
                          }}
                        >
                          <p
                            style={{
                              color: currentPalette.colors.find(
                                (c) => c.shade === 900
                              )?.hex,
                            }}
                          >
                            Text on light background
                          </p>
                        </div>
                      </div>

                      {/* Text on primary */}
                      <div>
                        <h4 className="text-sm font-medium mb-2">
                          Text on primary
                        </h4>
                        <div
                          className="p-4 rounded-md"
                          style={{
                            backgroundColor: currentPalette.colors.find(
                              (c) => c.shade === 600
                            )?.hex,
                          }}
                        >
                          <p className="text-white">Text on primary color</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => setSaveDialogOpen(true)}>
                <Save className="h-4 w-4 mr-2" />
                Save Palette
              </Button>

              <Button onClick={() => setCodeDialogOpen(true)}>
                <Code className="h-4 w-4 mr-2" />
                Generate Tailwind Config
              </Button>
            </div>
          </div>
        )}

        {activeTab === "presets" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Choose from one of the preset color palettes to get started.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {presetPalettes.map((palette) => (
                <div
                  key={palette.id}
                  className="border rounded-lg p-4 cursor-pointer hover:border-primary"
                  onClick={() => handleSelectPreset(palette.id)}
                >
                  <h3 className="font-medium mb-2">{palette.name}</h3>
                  <div className="flex flex-wrap gap-1">
                    {palette.colors
                      .filter((color) =>
                        [50, 200, 400, 500, 600, 800, 950].includes(color.shade)
                      )
                      .map((color) => (
                        <div
                          key={color.id}
                          className="w-8 h-8 rounded-md"
                          style={{ backgroundColor: color.hex }}
                        />
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "saved" && (
          <div className="space-y-4">
            {savedPalettes.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  You haven't saved any palettes yet.
                </p>
                <Button
                  variant="outline"
                  onClick={() => setActiveTab("generator")}
                  className="mt-4"
                >
                  Create Your First Palette
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedPalettes.map((palette) => (
                  <div key={palette.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{palette.name}</h3>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSelectPreset(palette.id)}
                        >
                          Load
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {palette.colors
                        .filter((color) =>
                          [50, 200, 400, 500, 600, 800, 950].includes(
                            color.shade
                          )
                        )
                        .map((color) => (
                          <div
                            key={color.id}
                            className="w-8 h-8 rounded-md"
                            style={{ backgroundColor: color.hex }}
                          />
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Save Dialog */}
        <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save Palette</DialogTitle>
              <DialogDescription>
                Give your palette a name to save it for later use.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="palette-name">Palette Name</Label>
              <Input
                id="palette-name"
                value={newPaletteName}
                onChange={(e) => setNewPaletteName(e.target.value)}
                placeholder="My Awesome Palette"
                className="mt-2"
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setSaveDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSavePalette} disabled={!newPaletteName}>
                Save Palette
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Tailwind Config Dialog */}
        <Dialog open={codeDialogOpen} onOpenChange={setCodeDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Tailwind CSS Configuration</DialogTitle>
              <DialogDescription>
                Copy this configuration to your tailwind.config.js file.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="bg-muted p-4 rounded-md relative">
                <pre className="text-sm font-mono whitespace-pre-wrap overflow-x-auto">
                  {tailwindCode}
                </pre>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={handleCopyConfig}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setCodeDialogOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>

      <CardFooter className="flex justify-between border-t p-4">
        <div className="text-sm text-muted-foreground">
          <p>
            All processing happens client-side - your palettes are stored in
            your browser.
          </p>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ColorPaletteGenerator;
