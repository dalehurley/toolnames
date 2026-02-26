import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { patternPresets } from "@/utils/patternHelpers";
import { getThumbnailStyle } from "./PatternPreview";
import { PatternConfig } from "@/types/pattern";

interface PatternPresetGalleryProps {
  onSelectPreset: (presetId: string) => void;
}

// Type guard to ensure pattern config safety
const isValidPatternConfig = (config: unknown): config is PatternConfig => {
  const cfg = config as Record<string, unknown>;
  return (
    config !== null &&
    typeof config === "object" &&
    Array.isArray(cfg.colors) &&
    typeof cfg.size === "number" &&
    typeof cfg.spacing === "number" &&
    typeof cfg.opacity === "number"
  );
};

const PatternPresetGallery: React.FC<PatternPresetGalleryProps> = ({
  onSelectPreset,
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-base font-medium">Pattern Presets</h3>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="w-full flex flex-wrap h-auto py-1">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="stripes">Stripes</TabsTrigger>
          <TabsTrigger value="dots">Dots</TabsTrigger>
          <TabsTrigger value="grid">Grid</TabsTrigger>
          <TabsTrigger value="geometric">Geometric</TabsTrigger>
          <TabsTrigger value="waves">Waves</TabsTrigger>
          <TabsTrigger value="layered">Layered</TabsTrigger>
          <TabsTrigger value="special">Special</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {patternPresets.map((preset) => {
              // Validate and safely cast the config
              if (!isValidPatternConfig(preset.config)) return null;

              return (
                <Button
                  key={preset.id}
                  variant="outline"
                  className="h-auto py-3 flex flex-col items-center justify-center gap-1"
                  onClick={() => onSelectPreset(preset.id)}
                >
                  <div
                    className="w-full h-16 rounded border overflow-hidden"
                    style={getThumbnailStyle(preset.type, preset.config)}
                  />
                  <span className="text-xs font-medium">{preset.name}</span>
                </Button>
              );
            })}
          </div>
        </TabsContent>

        {[
          "stripes",
          "dots",
          "grid",
          "geometric",
          "waves",
          "layered",
          "special",
        ].map((category) => (
          <TabsContent key={category} value={category} className="mt-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {patternPresets
                .filter((preset) => preset.category === category)
                .map((preset) => {
                  // Validate and safely cast the config
                  if (!isValidPatternConfig(preset.config)) return null;

                  return (
                    <Button
                      key={preset.id}
                      variant="outline"
                      className="h-auto py-3 flex flex-col items-center justify-center gap-1"
                      onClick={() => onSelectPreset(preset.id)}
                    >
                      <div
                        className="w-full h-16 rounded border overflow-hidden"
                        style={getThumbnailStyle(preset.type, preset.config)}
                      />
                      <span className="text-xs font-medium">{preset.name}</span>
                    </Button>
                  );
                })}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default PatternPresetGallery;
