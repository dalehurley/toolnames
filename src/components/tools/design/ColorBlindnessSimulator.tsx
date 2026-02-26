import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Upload, Eye } from "lucide-react";

type ColorBlindnessType = "normal" | "protanopia" | "deuteranopia" | "tritanopia" | "achromatopsia" | "protanomaly" | "deuteranomaly" | "tritanomaly";

interface FilterInfo {
  name: string;
  type: ColorBlindnessType;
  description: string;
  prevalence: string;
  svgFilter: string;
}

const FILTERS: FilterInfo[] = [
  {
    name: "Normal Vision",
    type: "normal",
    description: "Full color perception as experienced by most people",
    prevalence: "~95% of people",
    svgFilter: "",
  },
  {
    name: "Protanopia",
    type: "protanopia",
    description: "Red-blind: Cannot distinguish red from green. Red appears as dark brown.",
    prevalence: "~1% of males",
    svgFilter: `<feColorMatrix type="matrix" values="0.567,0.433,0,0,0 0.558,0.442,0,0,0 0,0.242,0.758,0,0 0,0,0,1,0"/>`,
  },
  {
    name: "Deuteranopia",
    type: "deuteranopia",
    description: "Green-blind: Cannot distinguish red from green. The most common form.",
    prevalence: "~1% of males",
    svgFilter: `<feColorMatrix type="matrix" values="0.625,0.375,0,0,0 0.7,0.3,0,0,0 0,0.3,0.7,0,0 0,0,0,1,0"/>`,
  },
  {
    name: "Tritanopia",
    type: "tritanopia",
    description: "Blue-blind: Cannot distinguish blue from green or yellow from violet.",
    prevalence: "~0.003% of people",
    svgFilter: `<feColorMatrix type="matrix" values="0.95,0.05,0,0,0 0,0.433,0.567,0,0 0,0.475,0.525,0,0 0,0,0,1,0"/>`,
  },
  {
    name: "Achromatopsia",
    type: "achromatopsia",
    description: "Complete color blindness: Can only see in shades of grey.",
    prevalence: "~0.003% of people",
    svgFilter: `<feColorMatrix type="saturate" values="0"/>`,
  },
  {
    name: "Protanomaly",
    type: "protanomaly",
    description: "Red-weak: Reduced sensitivity to red light. Red appears shifted toward green.",
    prevalence: "~1% of males",
    svgFilter: `<feColorMatrix type="matrix" values="0.817,0.183,0,0,0 0.333,0.667,0,0,0 0,0.125,0.875,0,0 0,0,0,1,0"/>`,
  },
  {
    name: "Deuteranomaly",
    type: "deuteranomaly",
    description: "Green-weak: Reduced sensitivity to green. Most common color vision deficiency.",
    prevalence: "~5% of males",
    svgFilter: `<feColorMatrix type="matrix" values="0.8,0.2,0,0,0 0.258,0.742,0,0,0 0,0.142,0.858,0,0 0,0,0,1,0"/>`,
  },
  {
    name: "Tritanomaly",
    type: "tritanomaly",
    description: "Blue-weak: Reduced sensitivity to blue light.",
    prevalence: "~0.01% of people",
    svgFilter: `<feColorMatrix type="matrix" values="0.967,0.033,0,0,0 0,0.733,0.267,0,0 0,0.183,0.817,0,0 0,0,0,1,0"/>`,
  },
];

const DEMO_COLORS = [
  { name: "Red", hex: "#ef4444" },
  { name: "Orange", hex: "#f97316" },
  { name: "Yellow", hex: "#eab308" },
  { name: "Green", hex: "#22c55e" },
  { name: "Teal", hex: "#14b8a6" },
  { name: "Blue", hex: "#3b82f6" },
  { name: "Violet", hex: "#8b5cf6" },
  { name: "Pink", hex: "#ec4899" },
];

export const ColorBlindnessSimulator = () => {
  const [selectedType, setSelectedType] = useState<ColorBlindnessType>("normal");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedFilter = FILTERS.find(f => f.type === selectedType)!;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImageUrl(url);
  };

  const filterId = `cbFilter_${selectedType}`;

  const svgDefs = selectedFilter.svgFilter ? `
    <svg xmlns="http://www.w3.org/2000/svg" style="position:absolute;width:0;height:0">
      <defs>
        <filter id="${filterId}">
          ${selectedFilter.svgFilter}
        </filter>
      </defs>
    </svg>
  ` : "";

  const filterStyle = selectedFilter.svgFilter
    ? { filter: `url(#${filterId})` }
    : {};

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {svgDefs && (
        <div dangerouslySetInnerHTML={{ __html: svgDefs }} />
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Color Blindness Simulator</CardTitle>
          <CardDescription>Simulate how colors appear to people with different types of color vision deficiencies</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Type Selector */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">Vision Type</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {FILTERS.map(f => (
                <button
                  key={f.type}
                  onClick={() => setSelectedType(f.type)}
                  className={`p-2 rounded-md border text-left transition-colors text-sm ${selectedType === f.type ? "border-primary bg-primary/10" : "hover:bg-muted"}`}
                >
                  <div className="font-medium truncate">{f.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{f.prevalence}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Selected Type Info */}
          <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg text-sm">
            <Eye className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <div>
              <span className="font-medium">{selectedFilter.name}:</span>{" "}
              {selectedFilter.description}
            </div>
          </div>

          {/* Color Swatches Demo */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Color Palette Preview</Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Normal Vision</p>
                <div className="grid grid-cols-4 gap-1">
                  {DEMO_COLORS.map(c => (
                    <div key={c.name} className="text-center">
                      <div className="h-12 rounded-md shadow-sm" style={{ backgroundColor: c.hex }} />
                      <p className="text-xs text-muted-foreground mt-1 truncate">{c.name}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">{selectedFilter.name}</p>
                <div className="grid grid-cols-4 gap-1" style={filterStyle}>
                  {DEMO_COLORS.map(c => (
                    <div key={c.name} className="text-center">
                      <div className="h-12 rounded-md shadow-sm" style={{ backgroundColor: c.hex }} />
                      <p className="text-xs text-muted-foreground mt-1 truncate">{c.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Test With Your Own Image</Label>
            <div
              className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Click to upload an image (PNG, JPG, WebP)</p>
              <p className="text-xs text-muted-foreground mt-1">Images are processed entirely in your browser</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>

          {imageUrl && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Label className="text-base font-semibold">Image Comparison</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCompareMode(m => !m)}
                >
                  {compareMode ? "Single View" : "Side by Side"}
                </Button>
              </div>
              {compareMode ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium mb-2 text-center">Normal Vision</p>
                    <img src={imageUrl} className="w-full rounded-lg" alt="Normal vision" />
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2 text-center">{selectedFilter.name}</p>
                    <img src={imageUrl} className="w-full rounded-lg" alt={`${selectedFilter.name} simulation`} style={filterStyle} />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground text-center">Viewing as: {selectedFilter.name}</p>
                  <img src={imageUrl} className="w-full rounded-lg" alt="Simulation" style={filterStyle} />
                </div>
              )}
            </div>
          )}

          {/* Statistics */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">Color Vision Deficiency Statistics</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              {[
                { stat: "~8% of males", desc: "have some form of color vision deficiency" },
                { stat: "~0.5% of females", desc: "have color vision deficiency" },
                { stat: "300 million", desc: "people worldwide are color blind" },
                { stat: "Deuteranomaly", desc: "is the most common type (~5% of males)" },
              ].map(({ stat, desc }) => (
                <div key={stat} className="flex gap-2 p-3 bg-muted/50 rounded-md">
                  <span className="font-bold text-primary shrink-0">{stat}</span>
                  <span className="text-muted-foreground">{desc}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
