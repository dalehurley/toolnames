import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Palette } from "lucide-react";

interface RGB {
  r: number;
  g: number;
  b: number;
}

interface HSL {
  h: number;
  s: number;
  l: number;
}

interface HSV {
  h: number;
  s: number;
  v: number;
}

interface CMYK {
  c: number;
  m: number;
  y: number;
  k: number;
}

export const ColorConverter = () => {
  const [hex, setHex] = useState<string>("#3b82f6");
  const [rgb, setRgb] = useState<RGB>({ r: 59, g: 130, b: 246 });
  const [hsl, setHsl] = useState<HSL>({ h: 217, s: 91, l: 60 });
  const [hsv, setHsv] = useState<HSV>({ h: 217, s: 76, v: 96 });
  const [cmyk, setCmyk] = useState<CMYK>({ c: 76, m: 47, y: 0, k: 4 });
  const [copied, setCopied] = useState<string | null>(null);

  // Convert HEX to RGB
  const hexToRgb = (hex: string): RGB | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return null;

    return {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    };
  };

  // Convert RGB to HEX
  const rgbToHex = (r: number, g: number, b: number): string => {
    return "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
  };

  // Convert RGB to HSL
  const rgbToHsl = (r: number, g: number, b: number): HSL => {
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

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  };

  // Convert RGB to HSV
  const rgbToHsv = (r: number, g: number, b: number): HSV => {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const d = max - min;
    let h = 0;

    if (max === min) {
      h = 0;
    } else {
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
      s: Math.round(max === 0 ? 0 : (d / max) * 100),
      v: Math.round(max * 100),
    };
  };

  // Convert RGB to CMYK
  const rgbToCmyk = (r: number, g: number, b: number): CMYK => {
    r /= 255;
    g /= 255;
    b /= 255;

    const k = 1 - Math.max(r, g, b);

    if (k === 1) {
      return { c: 0, m: 0, y: 0, k: 100 };
    }

    return {
      c: Math.round(((1 - r - k) / (1 - k)) * 100),
      m: Math.round(((1 - g - k) / (1 - k)) * 100),
      y: Math.round(((1 - b - k) / (1 - k)) * 100),
      k: Math.round(k * 100),
    };
  };

  // Update all values when HEX changes
  const updateFromHex = (hexValue: string) => {
    if (!/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.test(hexValue)) {
      return;
    }

    const rgbValue = hexToRgb(hexValue) || { r: 0, g: 0, b: 0 };
    const hslValue = rgbToHsl(rgbValue.r, rgbValue.g, rgbValue.b);
    const hsvValue = rgbToHsv(rgbValue.r, rgbValue.g, rgbValue.b);
    const cmykValue = rgbToCmyk(rgbValue.r, rgbValue.g, rgbValue.b);

    setRgb(rgbValue);
    setHsl(hslValue);
    setHsv(hsvValue);
    setCmyk(cmykValue);
  };

  // Update all values when RGB changes
  const updateFromRgb = () => {
    const hexValue = rgbToHex(rgb.r, rgb.g, rgb.b);
    const hslValue = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const hsvValue = rgbToHsv(rgb.r, rgb.g, rgb.b);
    const cmykValue = rgbToCmyk(rgb.r, rgb.g, rgb.b);

    setHex(hexValue);
    setHsl(hslValue);
    setHsv(hsvValue);
    setCmyk(cmykValue);
  };

  // Handle HEX input change
  const handleHexChange = (value: string) => {
    if (!value.startsWith("#")) {
      value = "#" + value;
    }

    setHex(value);

    if (/^#[0-9A-F]{6}$/i.test(value)) {
      updateFromHex(value);
    }
  };

  // Handle RGB input changes
  const handleRgbChange = (channel: "r" | "g" | "b", value: number) => {
    const newValue = Math.max(0, Math.min(255, value));
    const newRgb = { ...rgb, [channel]: newValue };
    setRgb(newRgb);
  };

  // Update color when RGB changes
  useEffect(() => {
    updateFromRgb();
  }, [rgb.r, rgb.g, rgb.b]);

  // Copy value to clipboard
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Color Format Converter</CardTitle>
        <CardDescription>
          Convert colors between HEX, RGB, HSL, HSV, and CMYK formats
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3 space-y-4">
            <div
              className="w-full aspect-square rounded-lg border overflow-hidden"
              style={{ backgroundColor: hex }}
            ></div>

            <div className="space-y-2">
              <Label htmlFor="hex">HEX Color</Label>
              <div className="flex gap-2">
                <Input
                  id="hex"
                  value={hex}
                  onChange={(e) => handleHexChange(e.target.value)}
                  placeholder="#RRGGBB"
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(hex, "HEX")}
                  title="Copy HEX"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="md:w-2/3">
            <Tabs defaultValue="rgb" className="w-full">
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="rgb">RGB</TabsTrigger>
                <TabsTrigger value="hsl">HSL</TabsTrigger>
                <TabsTrigger value="hsv">HSV</TabsTrigger>
                <TabsTrigger value="cmyk">CMYK</TabsTrigger>
              </TabsList>

              <TabsContent value="rgb" className="mt-4 space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rgb-r">Red</Label>
                    <Input
                      id="rgb-r"
                      type="number"
                      min="0"
                      max="255"
                      value={rgb.r}
                      onChange={(e) =>
                        handleRgbChange("r", parseInt(e.target.value || "0"))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rgb-g">Green</Label>
                    <Input
                      id="rgb-g"
                      type="number"
                      min="0"
                      max="255"
                      value={rgb.g}
                      onChange={(e) =>
                        handleRgbChange("g", parseInt(e.target.value || "0"))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rgb-b">Blue</Label>
                    <Input
                      id="rgb-b"
                      type="number"
                      min="0"
                      max="255"
                      value={rgb.b}
                      onChange={(e) =>
                        handleRgbChange("b", parseInt(e.target.value || "0"))
                      }
                    />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="font-mono">
                    rgb({rgb.r}, {rgb.g}, {rgb.b})
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      copyToClipboard(
                        `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
                        "RGB"
                      )
                    }
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="hsl" className="mt-4 space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hsl-h">Hue</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="hsl-h"
                        type="number"
                        min="0"
                        max="360"
                        value={hsl.h}
                        readOnly
                      />
                      <span>°</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hsl-s">Saturation</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="hsl-s"
                        type="number"
                        min="0"
                        max="100"
                        value={hsl.s}
                        readOnly
                      />
                      <span>%</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hsl-l">Lightness</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="hsl-l"
                        type="number"
                        min="0"
                        max="100"
                        value={hsl.l}
                        readOnly
                      />
                      <span>%</span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="font-mono">
                    hsl({hsl.h}, {hsl.s}%, {hsl.l}%)
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      copyToClipboard(
                        `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
                        "HSL"
                      )
                    }
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="hsv" className="mt-4 space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hsv-h">Hue</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="hsv-h"
                        type="number"
                        min="0"
                        max="360"
                        value={hsv.h}
                        readOnly
                      />
                      <span>°</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hsv-s">Saturation</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="hsv-s"
                        type="number"
                        min="0"
                        max="100"
                        value={hsv.s}
                        readOnly
                      />
                      <span>%</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hsv-v">Value</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="hsv-v"
                        type="number"
                        min="0"
                        max="100"
                        value={hsv.v}
                        readOnly
                      />
                      <span>%</span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="font-mono">
                    hsv({hsv.h}, {hsv.s}%, {hsv.v}%)
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      copyToClipboard(
                        `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`,
                        "HSV"
                      )
                    }
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="cmyk" className="mt-4 space-y-4">
                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cmyk-c">Cyan</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="cmyk-c"
                        type="number"
                        min="0"
                        max="100"
                        value={cmyk.c}
                        readOnly
                      />
                      <span>%</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cmyk-m">Magenta</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="cmyk-m"
                        type="number"
                        min="0"
                        max="100"
                        value={cmyk.m}
                        readOnly
                      />
                      <span>%</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cmyk-y">Yellow</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="cmyk-y"
                        type="number"
                        min="0"
                        max="100"
                        value={cmyk.y}
                        readOnly
                      />
                      <span>%</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cmyk-k">Key (Black)</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="cmyk-k"
                        type="number"
                        min="0"
                        max="100"
                        value={cmyk.k}
                        readOnly
                      />
                      <span>%</span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="font-mono">
                    cmyk({cmyk.c}%, {cmyk.m}%, {cmyk.y}%, {cmyk.k}%)
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      copyToClipboard(
                        `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`,
                        "CMYK"
                      )
                    }
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {copied && (
          <div className="bg-green-100 text-green-800 p-2 rounded-md text-sm mt-4">
            {copied} color code copied to clipboard!
          </div>
        )}

        <div className="bg-muted p-4 rounded-lg mt-4">
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            <h3 className="font-medium">Color Picker</h3>
          </div>
          <div className="mt-2">
            <input
              type="color"
              value={hex}
              onChange={(e) => handleHexChange(e.target.value)}
              className="w-full h-12 cursor-pointer"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
