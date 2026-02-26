import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Palette, Copy, RefreshCw, Plus } from "lucide-react";
import { toast } from "sonner";
import { TokenCategory } from "../hooks/designSystem.types";

type HarmonyType =
  | "analogous"
  | "complementary"
  | "triadic"
  | "tetradic"
  | "monochromatic";
type ScaleStrength = "subtle" | "moderate" | "strong";
type ColorScale = { name: string; value: string }[];

interface ColorPaletteGeneratorProps {
  onAddToken: (
    name: string,
    value: string,
    category: TokenCategory,
    description?: string
  ) => string | null;
  activeThemeId: string | null;
}

export const ColorPaletteGenerator: React.FC<ColorPaletteGeneratorProps> = ({
  onAddToken,
  activeThemeId,
}) => {
  // Base color state
  const [baseColor, setBaseColor] = useState("#3B82F6");
  const [colorName, setColorName] = useState("primary");
  const [colorDescription, setColorDescription] = useState("");

  // Color scale state
  const [scaleStrength, setScaleStrength] = useState<ScaleStrength>("moderate");
  const [scaleColors, setScaleColors] = useState<ColorScale>([]);

  // Harmony state
  const [harmonyType, setHarmonyType] = useState<HarmonyType>("analogous");
  const [harmonyColors, setHarmonyColors] = useState<string[]>([]);

  // Contrast checker
  const [textColor, setTextColor] = useState("#FFFFFF");
  const [contrastRatio, setContrastRatio] = useState(0);
  const [isPassing, setIsPassing] = useState(false);

  // Generate color scale when base color changes
  useEffect(() => {
    generateColorScale();
  }, [baseColor, scaleStrength]);

  // Generate harmony colors when base color or harmony type changes
  useEffect(() => {
    generateHarmonyColors();
  }, [baseColor, harmonyType]);

  // Calculate contrast when base color or text color changes
  useEffect(() => {
    calculateContrast();
  }, [baseColor, textColor]);

  // Convert hex to RGB
  const hexToRgb = (
    hex: string
  ): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  };

  // Convert RGB to HSL
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
    const l = (max + min) / 2;

    let h = 0,
      s = 0;

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

  // Convert HSL to RGB
  const hslToRgb = (h: number, s: number, l: number) => {
    h /= 360;
    s /= 100;
    l /= 100;
    let r, g, b;

    if (s === 0) {
      r = g = b = l;
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

  // Convert RGB to hex
  const rgbToHex = (r: number, g: number, b: number) => {
    return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
  };

  // Generate a color scale from the base color
  const generateColorScale = () => {
    const rgb = hexToRgb(baseColor);
    if (!rgb) return;

    const { h, s } = rgbToHsl(rgb.r, rgb.g, rgb.b);

    // Define lightness values based on strength
    const lightnessValues: Record<ScaleStrength, number[]> = {
      subtle: [95, 90, 80, 70, 60, 50, 40, 30, 20],
      moderate: [98, 90, 75, 60, 50, 40, 30, 20, 10],
      strong: [99, 90, 70, 55, 45, 35, 25, 15, 5],
    };

    const selectedLightness = lightnessValues[scaleStrength];

    // Generate the scale
    const scale: ColorScale = selectedLightness.map((lightness, index) => {
      const newRgb = hslToRgb(h, s, lightness);
      const hex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
      return {
        name: `${index + 1}00`,
        value: hex,
      };
    });

    setScaleColors(scale);
  };

  // Generate harmony colors based on the selected harmony type
  const generateHarmonyColors = () => {
    const rgb = hexToRgb(baseColor);
    if (!rgb) return;

    const { h, s, l } = rgbToHsl(rgb.r, rgb.g, rgb.b);
    let harmonies: number[] = [];

    // Calculate harmony hues
    switch (harmonyType) {
      case "complementary":
        harmonies = [(h + 180) % 360];
        break;
      case "analogous":
        harmonies = [(h + 30) % 360, (h + 330) % 360];
        break;
      case "triadic":
        harmonies = [(h + 120) % 360, (h + 240) % 360];
        break;
      case "tetradic":
        harmonies = [(h + 90) % 360, (h + 180) % 360, (h + 270) % 360];
        break;
      case "monochromatic":
        // For monochromatic, we'll vary the saturation instead of hue
        harmonies = [h, h, h];
        break;
    }

    // Generate harmony colors
    const colors = harmonies.map((hue, index) => {
      // For monochromatic, adjust saturation and lightness
      let newS = s;
      let newL = l;

      if (harmonyType === "monochromatic") {
        newS = Math.max(20, s - 20 * (index + 1));
        newL = Math.min(80, l + 10 * (index + 1));
      }

      const newRgb = hslToRgb(hue, newS, newL);
      return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
    });

    setHarmonyColors([baseColor, ...colors]);
  };

  // Calculate contrast ratio between background and text
  const calculateContrast = () => {
    const bgRgb = hexToRgb(baseColor);
    const textRgb = hexToRgb(textColor);

    if (!bgRgb || !textRgb) return;

    // Calculate relative luminance
    const getLuminance = (rgb: { r: number; g: number; b: number }) => {
      const { r, g, b } = rgb;
      const a = [r, g, b].map((v) => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      });
      return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
    };

    const bgLuminance = getLuminance(bgRgb);
    const textLuminance = getLuminance(textRgb);

    // Calculate contrast ratio
    const ratio =
      bgLuminance > textLuminance
        ? (bgLuminance + 0.05) / (textLuminance + 0.05)
        : (textLuminance + 0.05) / (bgLuminance + 0.05);

    setContrastRatio(ratio);

    // Check if it passes WCAG AA (4.5:1 for normal text, 3:1 for large text)
    setIsPassing(ratio >= 4.5);
  };

  // Copy color to clipboard
  const copyToClipboard = (hex: string) => {
    navigator.clipboard.writeText(hex);
    toast.success("Color copied to clipboard");
  };

  // Add a single color token
  const addSingleColorToken = (colorValue: string, suffix: string = "") => {
    if (!activeThemeId) {
      toast.error("No active theme selected");
      return;
    }

    const name = suffix ? `${colorName}-${suffix}` : colorName;
    const description =
      colorDescription || `${colorName} color${suffix ? ` (${suffix})` : ""}`;

    try {
      onAddToken(name, colorValue, "color", description);
      toast.success("Color token added", {
        description: `Added ${name} to your design system`,
      });
    } catch {
      toast.error("Failed to add color token");
    }
  };

  // Add all scale colors as tokens
  const addScaleAsTokens = () => {
    if (!activeThemeId) {
      toast.error("No active theme selected");
      return;
    }

    try {
      scaleColors.forEach((color) => {
        onAddToken(
          `${colorName}-${color.name}`,
          color.value,
          "color",
          `${colorName} ${color.name} shade`
        );
      });

      toast.success("Color scale added", {
        description: `Added ${colorName} scale to your design system`,
      });
    } catch {
      toast.error("Failed to add color scale");
    }
  };

  // Add harmony colors as tokens
  const addHarmonyAsTokens = () => {
    if (!activeThemeId) {
      toast.error("No active theme selected");
      return;
    }

    try {
      const harmonyNames = {
        complementary: ["base", "complement"],
        analogous: ["base", "analog1", "analog2"],
        triadic: ["base", "triad1", "triad2"],
        tetradic: ["base", "tetrad1", "tetrad2", "tetrad3"],
        monochromatic: ["base", "mono1", "mono2", "mono3"],
      };

      const names = harmonyNames[harmonyType];

      harmonyColors.forEach((color, index) => {
        if (index < names.length) {
          onAddToken(
            `${colorName}-${names[index]}`,
            color,
            "color",
            `${colorName} ${harmonyType} harmony - ${names[index]}`
          );
        }
      });

      toast.success("Harmony colors added", {
        description: `Added ${colorName} ${harmonyType} harmony to your design system`,
      });
    } catch {
      toast.error("Failed to add harmony colors");
    }
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Palette size={18} />
          <span>Advanced Color Palette Generator</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Base color selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <Label htmlFor="base-color">Base Color</Label>
            <div className="flex space-x-2">
              <div className="flex-shrink-0">
                <input
                  type="color"
                  id="base-color"
                  value={baseColor}
                  onChange={(e) => setBaseColor(e.target.value)}
                  className="h-10 w-10 border rounded"
                />
              </div>
              <Input
                value={baseColor}
                onChange={(e) => setBaseColor(e.target.value)}
                className="flex-1"
              />
            </div>

            <Label htmlFor="color-name">Token Name</Label>
            <Input
              id="color-name"
              placeholder="primary"
              value={colorName}
              onChange={(e) => setColorName(e.target.value)}
            />

            <Label htmlFor="color-description">Description (Optional)</Label>
            <Input
              id="color-description"
              placeholder="Primary brand color"
              value={colorDescription}
              onChange={(e) => setColorDescription(e.target.value)}
            />

            <Button
              onClick={() => addSingleColorToken(baseColor)}
              disabled={!activeThemeId || !colorName}
              className="w-full mt-2 flex items-center gap-2"
            >
              <Plus size={16} />
              <span>Add Base Color as Token</span>
            </Button>
          </div>

          <div className="space-y-4">
            <div
              className="w-full h-32 rounded-md flex items-center justify-center"
              style={{
                backgroundColor: baseColor,
                color: contrastRatio >= 4.5 ? "#ffffff" : "#000000",
              }}
            >
              <div className="text-center">
                <div className="text-xl font-semibold">{colorName}</div>
                <div className="text-sm">{baseColor}</div>
              </div>
            </div>

            {/* Color contrast checker */}
            <div className="space-y-2 border p-3 rounded-md">
              <div className="text-sm font-medium">Contrast Checker</div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="text-color" className="text-xs">
                    Text Color
                  </Label>
                  <div className="flex space-x-1">
                    <div className="flex-shrink-0">
                      <input
                        type="color"
                        id="text-color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="h-8 w-8 border rounded"
                      />
                    </div>
                    <Input
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="flex-1 h-8 text-xs"
                      size={8}
                    />
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <div className="text-2xl font-bold">
                    {contrastRatio.toFixed(2)}
                  </div>
                  <div
                    className={`text-xs ${
                      isPassing ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {isPassing ? "WCAG AA Pass" : "WCAG AA Fail"}
                  </div>
                </div>
              </div>

              <div
                className="mt-2 p-2 rounded text-center"
                style={{ backgroundColor: baseColor, color: textColor }}
              >
                Sample Text
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="scale" className="w-full mt-6">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="scale">Color Scale</TabsTrigger>
            <TabsTrigger value="harmony">Color Harmony</TabsTrigger>
          </TabsList>

          <TabsContent value="scale" className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between mb-1">
                <Label>Scale Strength</Label>
                <div className="text-sm font-medium">{scaleStrength}</div>
              </div>

              <Select
                value={scaleStrength}
                onValueChange={(value: ScaleStrength) =>
                  setScaleStrength(value)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select scale strength" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="subtle">Subtle</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="strong">Strong</SelectItem>
                </SelectContent>
              </Select>

              <Button
                onClick={generateColorScale}
                variant="outline"
                size="sm"
                className="flex items-center gap-1.5"
              >
                <RefreshCw size={14} />
                <span>Regenerate Scale</span>
              </Button>
            </div>

            {/* Color scale display */}
            <div className="grid grid-cols-9 gap-1 mt-4">
              {scaleColors.map((color, index) => (
                <div key={index} className="space-y-1">
                  <div
                    className="w-full aspect-square rounded cursor-pointer relative group"
                    style={{ backgroundColor: color.value }}
                    onClick={() => copyToClipboard(color.value)}
                  >
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/20 rounded transition-opacity">
                      <Copy size={14} className="text-white" />
                    </div>
                  </div>
                  <div className="text-xs text-center">{color.name}</div>
                </div>
              ))}
            </div>

            <Button
              onClick={addScaleAsTokens}
              disabled={
                !activeThemeId || !colorName || scaleColors.length === 0
              }
              className="w-full mt-2"
            >
              Add Complete Scale as Tokens
            </Button>
          </TabsContent>

          <TabsContent value="harmony" className="space-y-4">
            <div className="space-y-2">
              <Label>Harmony Type</Label>
              <Select
                value={harmonyType}
                onValueChange={(value: HarmonyType) => setHarmonyType(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select harmony type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="analogous">Analogous</SelectItem>
                  <SelectItem value="complementary">Complementary</SelectItem>
                  <SelectItem value="triadic">Triadic</SelectItem>
                  <SelectItem value="tetradic">Tetradic</SelectItem>
                  <SelectItem value="monochromatic">Monochromatic</SelectItem>
                </SelectContent>
              </Select>

              <Button
                onClick={generateHarmonyColors}
                variant="outline"
                size="sm"
                className="flex items-center gap-1.5"
              >
                <RefreshCw size={14} />
                <span>Regenerate Harmony</span>
              </Button>
            </div>

            {/* Harmony colors display */}
            <div className="flex flex-col space-y-3 mt-4">
              {harmonyColors.map((color, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div
                    className="w-12 h-12 rounded cursor-pointer relative group flex-shrink-0"
                    style={{ backgroundColor: color }}
                    onClick={() => copyToClipboard(color)}
                  >
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/20 rounded transition-opacity">
                      <Copy size={14} className="text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">
                      {index === 0 ? "Base" : `Harmony ${index}`}
                    </div>
                    <div className="text-xs text-gray-500">{color}</div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      addSingleColorToken(
                        color,
                        index === 0 ? "" : `harmony-${index}`
                      )
                    }
                    disabled={!activeThemeId || !colorName}
                    className="h-8 w-8 p-0"
                  >
                    <Plus size={16} />
                    <span className="sr-only">Add Token</span>
                  </Button>
                </div>
              ))}
            </div>

            <Button
              onClick={addHarmonyAsTokens}
              disabled={
                !activeThemeId || !colorName || harmonyColors.length === 0
              }
              className="w-full mt-2"
            >
              Add All Harmony Colors as Tokens
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
