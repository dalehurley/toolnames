import React, { useState, useEffect, useCallback } from "react";
import { Palette, Copy, Eye, Check, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Color theory functions
const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
};

const rgbToHex = (r: number, g: number, b: number): string => {
  return "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
};

const rgbToHsl = (
  r: number,
  g: number,
  b: number
): { h: number; s: number; l: number } => {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

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

  return { h: h * 360, s: s * 100, l: l * 100 };
};

const hslToRgb = (
  h: number,
  s: number,
  l: number
): { r: number; g: number; b: number } => {
  h /= 360;
  s /= 100;
  l /= 100;
  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
};

// Calculate contrast ratio
const getLuminance = (hex: string): number => {
  const { r, g, b } = hexToRgb(hex);
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
};

const getContrastRatio = (hex1: string, hex2: string): number => {
  const lum1 = getLuminance(hex1);
  const lum2 = getLuminance(hex2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
};

// Color theory utilities
const getComplementaryColor = (hex: string): string => {
  const { r, g, b } = hexToRgb(hex);
  const { h, s, l } = rgbToHsl(r, g, b);
  const newH = (h + 180) % 360;
  const rgb = hslToRgb(newH, s, l);
  return rgbToHex(rgb.r, rgb.g, rgb.b);
};

const getAnalogousColors = (hex: string, count = 2): string[] => {
  const { r, g, b } = hexToRgb(hex);
  const { h, s, l } = rgbToHsl(r, g, b);
  const colors: string[] = [];
  const step = 30;

  for (let i = 1; i <= count; i++) {
    const newH1 = (h + step * i) % 360;
    const newH2 = (h - step * i + 360) % 360;
    const rgb1 = hslToRgb(newH1, s, l);
    const rgb2 = hslToRgb(newH2, s, l);
    colors.push(rgbToHex(rgb1.r, rgb1.g, rgb1.b));
    colors.push(rgbToHex(rgb2.r, rgb2.g, rgb2.b));
  }

  return colors;
};

const getTriadicColors = (hex: string): string[] => {
  const { r, g, b } = hexToRgb(hex);
  const { h, s, l } = rgbToHsl(r, g, b);
  const colors: string[] = [];

  const color1 = hslToRgb((h + 120) % 360, s, l);
  const color2 = hslToRgb((h + 240) % 360, s, l);
  colors.push(rgbToHex(color1.r, color1.g, color1.b));
  colors.push(rgbToHex(color2.r, color2.g, color2.b));

  return colors;
};

const getSplitComplementaryColors = (hex: string): string[] => {
  const { r, g, b } = hexToRgb(hex);
  const { h, s, l } = rgbToHsl(r, g, b);
  const colors: string[] = [];

  const color1 = hslToRgb((h + 150) % 360, s, l);
  const color2 = hslToRgb((h + 210) % 360, s, l);
  colors.push(rgbToHex(color1.r, color1.g, color1.b));
  colors.push(rgbToHex(color2.r, color2.g, color2.b));

  return colors;
};

const getTetradicColors = (hex: string): string[] => {
  const { r, g, b } = hexToRgb(hex);
  const { h, s, l } = rgbToHsl(r, g, b);
  const colors: string[] = [];

  const color1 = hslToRgb((h + 90) % 360, s, l);
  const color2 = hslToRgb((h + 180) % 360, s, l);
  const color3 = hslToRgb((h + 270) % 360, s, l);
  colors.push(rgbToHex(color1.r, color1.g, color1.b));
  colors.push(rgbToHex(color2.r, color2.g, color2.b));
  colors.push(rgbToHex(color3.r, color3.g, color3.b));

  return colors;
};

const getMonochromaticColors = (hex: string, count = 4): string[] => {
  const { r, g, b } = hexToRgb(hex);
  const { h, s, l } = rgbToHsl(r, g, b);
  const colors: string[] = [];

  // Create variations with different lightness levels
  for (let i = 1; i <= count; i++) {
    const newL = Math.max(0, Math.min(100, l - 40 + (i * 80) / (count + 1)));
    const rgb = hslToRgb(h, s, newL);
    colors.push(rgbToHex(rgb.r, rgb.g, rgb.b));
  }

  return colors;
};

// Add the Tailwind shades generator function after the existing color theory functions
const generateTailwindShades = (hex: string): Record<number, string> => {
  const { r, g, b } = hexToRgb(hex);
  const { h, s, l } = rgbToHsl(r, g, b);

  // Generate shades from 50 to 950
  const shades: Record<number, string> = {};
  const shadeValues = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

  // Adjust lightness to create shades
  // 500 is the base color
  shadeValues.forEach((shade) => {
    let newL: number;

    if (shade === 500) {
      // Base color stays as is
      newL = l;
    } else if (shade < 500) {
      // Lighter shades
      newL = l + (100 - l) * (1 - shade / 500);
    } else {
      // Darker shades
      newL = l * (1 - (shade - 500) / 500);
    }

    // Ensure lightness is within bounds
    newL = Math.max(0, Math.min(100, newL));

    const rgb = hslToRgb(h, s, newL);
    shades[shade] = rgbToHex(rgb.r, rgb.g, rgb.b);
  });

  return shades;
};

// Define color harmony types
type ColorHarmony =
  | "complementary"
  | "analogous"
  | "triadic"
  | "split-complementary"
  | "tetradic"
  | "monochromatic"
  | "custom";

// Define color palette type
interface ColorPalette {
  primary: string;
  colors: string[];
  harmony: ColorHarmony;
}

// Props and state for SavedPalettes component
interface SavedPalettesProps {
  palettes: ColorPalette[];
  onSelect: (palette: ColorPalette) => void;
  onDelete: (index: number) => void;
}

// SavedPalettes component
const SavedPalettes: React.FC<SavedPalettesProps> = ({
  palettes,
  onSelect,
  onDelete,
}) => {
  if (palettes.length === 0) {
    return (
      <div className="text-center p-4 text-gray-500">
        No saved palettes yet. Create and save a palette to see it here.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 max-h-[300px] overflow-y-auto p-2">
      {palettes.map((palette, index) => (
        <div key={index} className="flex flex-col p-2 border rounded-md">
          <div className="flex mb-2">
            {[palette.primary, ...palette.colors].map((color, colorIndex) => (
              <div
                key={colorIndex}
                className="w-8 h-8 rounded-md mr-1"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs">{palette.harmony}</span>
            <div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => onSelect(palette)}
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-red-500"
                onClick={() => onDelete(index)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 6h18"></path>
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                </svg>
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Main component
export const ColorPaletteExplorer: React.FC = () => {
  // Base state
  const [baseColor, setBaseColor] = useState<string>("#4169E1"); // Royal Blue as default
  const [harmonyType, setHarmonyType] = useState<ColorHarmony>("complementary");
  const [palette, setPalette] = useState<string[]>([]);
  const [savedPalettes, setSavedPalettes] = useState<ColorPalette[]>([]);
  const [activeTab, setActiveTab] = useState<string>("generator");
  const [copied, setCopied] = useState<string | null>(null);
  const [exportFormat, setExportFormat] = useState<string>("tailwind");
  const [showTailwindShades, setShowTailwindShades] = useState<boolean>(true);

  // Get palette based on harmony type
  const generatePalette = useCallback(() => {
    let colors: string[] = [];

    switch (harmonyType) {
      case "complementary":
        colors = [getComplementaryColor(baseColor)];
        break;
      case "analogous":
        colors = getAnalogousColors(baseColor, 1);
        break;
      case "triadic":
        colors = getTriadicColors(baseColor);
        break;
      case "split-complementary":
        colors = getSplitComplementaryColors(baseColor);
        break;
      case "tetradic":
        colors = getTetradicColors(baseColor);
        break;
      case "monochromatic":
        colors = getMonochromaticColors(baseColor);
        break;
      case "custom":
        // Keep current palette for custom mode
        return;
    }

    setPalette(colors);
  }, [baseColor, harmonyType]);

  // Generate palette when dependencies change
  useEffect(() => {
    generatePalette();
  }, [baseColor, harmonyType, generatePalette]);

  // Load saved palettes from local storage
  useEffect(() => {
    const saved = localStorage.getItem("savedColorPalettes");
    if (saved) {
      try {
        setSavedPalettes(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved palettes", e);
      }
    }
  }, []);

  // Save palettes to local storage when updated
  useEffect(() => {
    localStorage.setItem("savedColorPalettes", JSON.stringify(savedPalettes));
  }, [savedPalettes]);

  // Reset copied state after showing feedback
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  // Generate export code based on format
  const generateExportCode = (): string => {
    const allColors = [baseColor, ...palette];
    const colorNames = [
      "primary",
      "secondary",
      "tertiary",
      "quaternary",
      "quinary",
    ];

    switch (exportFormat) {
      case "css":
        return `:root {\n${allColors
          .map(
            (color, i) =>
              `  --color-${colorNames[i] || `color-${i + 1}`}: ${color};`
          )
          .join("\n")}\n}`;

      case "tailwind":
        // Enhanced tailwind export with shades if enabled
        if (showTailwindShades) {
          let config = `// tailwind.config.js\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: {\n`;

          // Add each color with its shades
          allColors.forEach((color, i) => {
            const name = colorNames[i] || `color${i + 1}`;
            const shades = generateTailwindShades(color);

            config += `        ${name}: {\n`;
            config += `          DEFAULT: '${color}',\n`;

            // Add each shade
            Object.entries(shades).forEach(([shade, value]) => {
              config += `          ${shade}: '${value}',\n`;
            });

            config += `        },\n`;
          });

          config += `      }\n    }\n  }\n}`;
          return config;
        } else {
          // Original tailwind export without shades
          return `// tailwind.config.js\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: {\n${allColors
            .map(
              (color, i) =>
                `        ${colorNames[i] || `color${i + 1}`}: '${color}',`
            )
            .join("\n")}\n      }\n    }\n  }\n}`;
        }

      case "scss":
        return `// _colors.scss\n${allColors
          .map((color, i) => `$${colorNames[i] || `color-${i + 1}`}: ${color};`)
          .join("\n")}`;

      case "js":
        return `// colors.js\nexport const colors = {\n${allColors
          .map(
            (color, i) => `  ${colorNames[i] || `color${i + 1}`}: '${color}',`
          )
          .join("\n")}\n};`;

      default:
        return "";
    }
  };

  // Copy color or export code to clipboard
  const copyToClipboard = (text: string, type: string = "color") => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(type);
    });
  };

  // Save current palette
  const savePalette = () => {
    const newPalette: ColorPalette = {
      primary: baseColor,
      colors: palette,
      harmony: harmonyType,
    };

    setSavedPalettes((prev) => [...prev, newPalette]);
  };

  // Load a saved palette
  const loadPalette = (palette: ColorPalette) => {
    setBaseColor(palette.primary);
    setPalette(palette.colors);
    setHarmonyType(palette.harmony);
  };

  // Delete a saved palette
  const deletePalette = (index: number) => {
    setSavedPalettes((prev) => prev.filter((_, i) => i !== index));
  };

  // Function to update a custom palette color
  const updateCustomColor = (index: number, color: string) => {
    if (harmonyType === "custom") {
      setPalette((prev) => {
        const newPalette = [...prev];
        newPalette[index] = color;
        return newPalette;
      });
    }
  };

  // Add a color to custom palette
  const addCustomColor = () => {
    if (harmonyType === "custom") {
      setPalette((prev) => [...prev, "#FFFFFF"]);
    }
  };

  // Remove a color from custom palette
  const removeCustomColor = (index: number) => {
    if (harmonyType === "custom") {
      setPalette((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // Switch to custom mode
  const enableCustomMode = () => {
    if (harmonyType !== "custom") {
      setHarmonyType("custom");
      // Keep current palette as starting point for custom mode
    }
  };

  // Check contrast for accessibility
  const getAccessibilityStatus = (color1: string, color2: string) => {
    const ratio = getContrastRatio(color1, color2);
    if (ratio >= 7) {
      return { pass: true, ratio, level: "AAA" };
    } else if (ratio >= 4.5) {
      return { pass: true, ratio, level: "AA" };
    }
    return { pass: false, ratio, level: "Fail" };
  };

  // UI example components
  const renderUIExamples = () => {
    const allColors = [baseColor, ...palette];

    return (
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 mt-4">
        <Card className="p-4 shadow-sm border">
          <h3
            className="text-lg font-medium mb-3"
            style={{ color: allColors[0] }}
          >
            UI Examples with Primary
          </h3>
          <div className="flex flex-col gap-3">
            <Button
              style={{ backgroundColor: allColors[0], color: "#fff" }}
              className="w-full"
            >
              Primary Button
            </Button>

            <div
              className="p-3 rounded-md flex items-center gap-2"
              style={{ backgroundColor: allColors[0], color: "#fff" }}
            >
              <Info size={18} />
              <span>Primary Background Alert</span>
            </div>

            <div
              className="border rounded-md p-3"
              style={{ borderColor: allColors[0] }}
            >
              <p style={{ color: allColors[0] }}>
                Primary color text and border
              </p>
            </div>
          </div>
        </Card>

        {palette.length > 0 && (
          <Card className="p-4 shadow-sm border">
            <h3
              className="text-lg font-medium mb-3"
              style={{ color: allColors[1] }}
            >
              UI Examples with Secondary
            </h3>
            <div className="flex flex-col gap-3">
              <Button
                style={{ backgroundColor: allColors[1], color: "#fff" }}
                className="w-full"
              >
                Secondary Button
              </Button>

              <div
                className="p-3 rounded-md flex items-center gap-2"
                style={{ backgroundColor: allColors[1], color: "#fff" }}
              >
                <Info size={18} />
                <span>Secondary Background Alert</span>
              </div>

              <div
                className="border rounded-md p-3"
                style={{ borderColor: allColors[1] }}
              >
                <p style={{ color: allColors[1] }}>
                  Secondary color text and border
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    );
  };

  // Add a new function to render Tailwind shades previews
  const renderTailwindShades = (color: string, colorName: string) => {
    const shades = generateTailwindShades(color);

    return (
      <div className="mt-4">
        <h3 className="text-md font-medium mb-2">
          Tailwind Shades for {colorName}
        </h3>
        <div className="grid grid-cols-11 gap-1">
          {Object.entries(shades).map(([shade, value]) => (
            <div key={shade} className="flex flex-col items-center">
              <div
                className="w-full h-8 rounded-md mb-1"
                style={{ backgroundColor: value }}
              />
              <span className="text-xs">{shade}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Palette size={24} />
        Interactive Color Palette Explorer
      </h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4 grid w-full grid-cols-3">
          <TabsTrigger value="generator">Palette Generator</TabsTrigger>
          <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
        </TabsList>

        {/* Palette Generator Tab */}
        <TabsContent value="generator" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Color Controls */}
            <Card className="p-4 shadow-sm border md:col-span-1">
              <h2 className="text-lg font-medium mb-3">Base Color</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="base-color">Select Base Color</Label>
                  <div className="flex mt-1.5 gap-2">
                    <div
                      className="w-10 h-10 rounded-md border"
                      style={{ backgroundColor: baseColor }}
                    />
                    <Input
                      id="base-color"
                      type="color"
                      value={baseColor}
                      onChange={(e) => setBaseColor(e.target.value)}
                      className="w-full h-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="harmony-type">Harmony Type</Label>
                  <Select
                    value={harmonyType}
                    onValueChange={(value) =>
                      setHarmonyType(value as ColorHarmony)
                    }
                  >
                    <SelectTrigger id="harmony-type" className="w-full mt-1.5">
                      <SelectValue placeholder="Select harmony" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="complementary">
                        Complementary
                      </SelectItem>
                      <SelectItem value="analogous">Analogous</SelectItem>
                      <SelectItem value="triadic">Triadic</SelectItem>
                      <SelectItem value="split-complementary">
                        Split Complementary
                      </SelectItem>
                      <SelectItem value="tetradic">Tetradic</SelectItem>
                      <SelectItem value="monochromatic">
                        Monochromatic
                      </SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {harmonyType === "custom" ? (
                  <div>
                    <Label>Custom Colors</Label>
                    <div className="space-y-2 mt-1.5">
                      {palette.map((color, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <div
                            className="w-8 h-8 rounded-md border"
                            style={{ backgroundColor: color }}
                          />
                          <Input
                            type="color"
                            value={color}
                            onChange={(e) =>
                              updateCustomColor(index, e.target.value)
                            }
                            className="w-full h-8"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => removeCustomColor(index)}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M18 6L6 18"></path>
                              <path d="M6 6l12 12"></path>
                            </svg>
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={addCustomColor}
                      >
                        Add Color
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={enableCustomMode}
                  >
                    Customize Palette
                  </Button>
                )}

                <div className="pt-2">
                  <Button className="w-full" onClick={savePalette}>
                    Save Palette
                  </Button>
                </div>
              </div>
            </Card>

            {/* Palette Display */}
            <Card className="p-4 shadow-sm border md:col-span-2">
              <h2 className="text-lg font-medium mb-3">Color Palette</h2>

              <div className="flex flex-col gap-3">
                {/* Base Color */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 rounded-md border">
                  <div
                    className="w-full sm:w-20 h-14 rounded-md"
                    style={{ backgroundColor: baseColor }}
                  />
                  <div className="flex-grow">
                    <h3 className="font-medium">Primary</h3>
                    <div className="flex mt-1 gap-2">
                      <div className="text-sm text-gray-600">{baseColor}</div>
                      <button
                        className="text-gray-500 hover:text-gray-700 text-sm"
                        onClick={() => copyToClipboard(baseColor)}
                      >
                        {copied === baseColor ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Generated Colors */}
                {palette.map((color, index) => (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 rounded-md border"
                  >
                    <div
                      className="w-full sm:w-20 h-14 rounded-md"
                      style={{ backgroundColor: color }}
                    />
                    <div className="flex-grow">
                      <h3 className="font-medium">
                        {index === 0
                          ? "Secondary"
                          : index === 1
                          ? "Tertiary"
                          : index === 2
                          ? "Quaternary"
                          : index === 3
                          ? "Quinary"
                          : `Color ${index + 2}`}
                      </h3>
                      <div className="flex mt-1 gap-2">
                        <div className="text-sm text-gray-600">{color}</div>
                        <button
                          className="text-gray-500 hover:text-gray-700 text-sm"
                          onClick={() => copyToClipboard(color)}
                        >
                          {copied === color ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {palette.length === 0 && (
                  <div className="text-center p-4 text-gray-500">
                    No colors generated. Select a different harmony type or
                    customize your palette.
                  </div>
                )}
              </div>
            </Card>

            {/* Saved Palettes */}
            <Card className="p-4 shadow-sm border md:col-span-3">
              <h2 className="text-lg font-medium mb-3">Saved Palettes</h2>
              <SavedPalettes
                palettes={savedPalettes}
                onSelect={loadPalette}
                onDelete={deletePalette}
              />
            </Card>
          </div>

          {/* UI Examples */}
          {renderUIExamples()}
        </TabsContent>

        {/* Accessibility Tab */}
        <TabsContent value="accessibility" className="space-y-4">
          <Card className="p-4 shadow-sm border">
            <h2 className="text-lg font-medium mb-3">Contrast Checker</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-md font-medium mb-2">Text on Primary</h3>
                {["#FFFFFF", "#000000", ...palette].map((color, index) => {
                  const { pass, ratio, level } = getAccessibilityStatus(
                    baseColor,
                    color
                  );
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 my-2 rounded-md"
                      style={{ backgroundColor: baseColor }}
                    >
                      <span style={{ color }}>Sample Text {color}</span>
                      <div
                        className={`px-2 py-1 rounded text-xs ${
                          pass
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {ratio.toFixed(2)} - {level}
                      </div>
                    </div>
                  );
                })}
              </div>

              {palette.length > 0 && (
                <div>
                  <h3 className="text-md font-medium mb-2">
                    Text on Secondary
                  </h3>
                  {["#FFFFFF", "#000000", baseColor, ...palette.slice(1)].map(
                    (color, index) => {
                      const { pass, ratio, level } = getAccessibilityStatus(
                        palette[0],
                        color
                      );
                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 my-2 rounded-md"
                          style={{ backgroundColor: palette[0] }}
                        >
                          <span style={{ color }}>Sample Text {color}</span>
                          <div
                            className={`px-2 py-1 rounded text-xs ${
                              pass
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {ratio.toFixed(2)} - {level}
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              )}
            </div>

            <div className="mt-4">
              <Alert className="bg-blue-50">
                <AlertDescription className="text-sm">
                  <strong>WCAG 2.1 Guidelines:</strong>
                  <ul className="list-disc list-inside mt-1">
                    <li>
                      AA: Contrast ratio of at least 4.5:1 for normal text
                    </li>
                    <li>AAA: Contrast ratio of at least 7:1 for normal text</li>
                    <li>
                      AA: Contrast ratio of at least 3:1 for large text (18pt+)
                    </li>
                    <li>
                      AAA: Contrast ratio of at least 4.5:1 for large text
                      (18pt+)
                    </li>
                  </ul>
                </AlertDescription>
              </Alert>
            </div>
          </Card>
        </TabsContent>

        {/* Export Tab */}
        <TabsContent value="export" className="space-y-4">
          <Card className="p-4 shadow-sm border">
            <h2 className="text-lg font-medium mb-3">Export Palette</h2>

            <div className="mb-4">
              <Label htmlFor="export-format">Format</Label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger id="export-format" className="w-full mt-1.5">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tailwind">Tailwind Config</SelectItem>
                  <SelectItem value="css">CSS Variables</SelectItem>
                  <SelectItem value="scss">SCSS Variables</SelectItem>
                  <SelectItem value="js">JavaScript Object</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {exportFormat === "tailwind" && (
              <div className="mb-4 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="tailwind-shades"
                  checked={showTailwindShades}
                  onChange={(e) => setShowTailwindShades(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="tailwind-shades">
                  Include Tailwind shades (50-950)
                </Label>
              </div>
            )}

            <div className="bg-gray-100 p-4 rounded-md">
              <div className="flex justify-between items-center mb-2">
                <Label>Generated Code</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8"
                  onClick={() => copyToClipboard(generateExportCode(), "code")}
                >
                  {copied === "code" ? (
                    <span className="flex items-center gap-1 text-green-600">
                      <Check className="w-4 h-4" /> Copied
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <Copy className="w-4 h-4" /> Copy
                    </span>
                  )}
                </Button>
              </div>
              <pre className="whitespace-pre-wrap text-sm font-mono p-2 bg-white rounded border overflow-x-auto">
                {generateExportCode()}
              </pre>
            </div>
          </Card>

          {/* Add Tailwind Shades Preview for each color */}
          {exportFormat === "tailwind" && showTailwindShades && (
            <Card className="p-4 shadow-sm border">
              <h2 className="text-lg font-medium mb-3">
                Tailwind Shades Preview
              </h2>
              <div className="space-y-6">
                {renderTailwindShades(baseColor, "Primary")}
                {palette.map((color, index) => (
                  <div key={index}>
                    {renderTailwindShades(
                      color,
                      index === 0
                        ? "Secondary"
                        : index === 1
                        ? "Tertiary"
                        : index === 2
                        ? "Quaternary"
                        : index === 3
                        ? "Quinary"
                        : `Color ${index + 2}`
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
