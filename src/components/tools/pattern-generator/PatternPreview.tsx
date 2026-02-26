import React, { useEffect, useState } from "react";
import { PatternType, PatternConfig } from "@/types/pattern";
import { generatePatternCSS } from "@/utils/patternHelpers";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

interface PatternPreviewProps {
  type: PatternType;
  config: PatternConfig;
}

// Function to generate styles for pattern thumbnails
export const getThumbnailStyle = (
  type: PatternType,
  config: PatternConfig
): React.CSSProperties => {
  // Special handling for layered patterns
  if (type === "layered" && config.layers && config.layers.length > 0) {
    // Use the first visible layer for the thumbnail background
    const visibleLayers = config.layers.filter((layer) => layer.visible);
    if (visibleLayers.length > 0) {
      const baseLayer = visibleLayers[0];
      const css = generatePatternCSS(baseLayer.type, baseLayer.config);

      const style: React.CSSProperties = {
        backgroundColor: baseLayer.config.colors[1] || "transparent",
        opacity: config.opacity,
      };

      // Extract background-image if present
      const bgImageMatch = css.match(/background-image:\s+([^;]+);/);
      if (bgImageMatch?.[1]) {
        style.backgroundImage = bgImageMatch[1];
      }

      // If there are multiple layers, add an indicator
      if (visibleLayers.length > 1) {
        // Add a subtle border to indicate multiple layers
        style.boxShadow = "inset 0 0 0 2px rgba(99, 102, 241, 0.4)";
      }

      return style;
    }
  }

  // Regular pattern handling
  const css = generatePatternCSS(type, config);
  const style: React.CSSProperties = {
    backgroundColor: config.colors[1] || "transparent",
    opacity: config.opacity,
  };

  // Extract background-image if present
  const bgImageMatch = css.match(/background-image:\s+([^;]+);/);
  if (bgImageMatch?.[1]) {
    style.backgroundImage = bgImageMatch[1];
  }

  return style;
};

const PatternPreview: React.FC<PatternPreviewProps> = ({ type, config }) => {
  const [previewSize, setPreviewSize] = useState(300);
  const [css, setCss] = useState("");

  useEffect(() => {
    // For layered patterns, ensure layers are properly initialized
    if (type === "layered" && config.layers) {
      // Make sure each layer has visible property set
      const validatedLayers = config.layers.map((layer) => ({
        ...layer,
        visible: layer.visible ?? true,
        opacity: layer.opacity ?? 1,
        blendMode: layer.blendMode ?? "normal",
      }));

      // Update config with validated layers if needed
      if (JSON.stringify(validatedLayers) !== JSON.stringify(config.layers)) {
        const newConfig = {
          ...config,
          layers: validatedLayers,
        };
        const generatedCSS = generatePatternCSS(type, newConfig);
        setCss(generatedCSS);
        return;
      }
    }

    const generatedCSS = generatePatternCSS(type, config);
    setCss(generatedCSS);
  }, [type, config]);

  // Determine background size based on pattern type and config
  const getPreviewStyle = () => {
    const style: Record<string, string> = {};
    const cssLines = css.split(";").filter((line) => line.trim() !== "");

    cssLines.forEach((line) => {
      const [property, value] = line.split(":").map((part) => part.trim());
      if (property && value) {
        // Convert CSS property to camelCase for React
        const camelCaseProp = property.replace(/-([a-z])/g, (g) =>
          g[1].toUpperCase()
        );
        style[camelCaseProp] = value;
      }
    });

    return style;
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-center">
        <div
          className="pattern-preview border rounded-lg overflow-hidden"
          style={{
            width: `${previewSize}px`,
            height: `${previewSize}px`,
            ...getPreviewStyle(),
          }}
        />
      </div>

      {/* Show layer indicator for layered patterns */}
      {type === "layered" && config.layers && config.layers.length > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          <span>
            Layered pattern with {config.layers.filter((l) => l.visible).length}{" "}
            visible layers
          </span>
        </div>
      )}

      <div className="w-full space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="preview-size">Preview Size</Label>
          <span className="text-sm text-muted-foreground">{previewSize}px</span>
        </div>
        <Slider
          id="preview-size"
          min={100}
          max={500}
          step={10}
          value={[previewSize]}
          onValueChange={(values) => setPreviewSize(values[0])}
        />
      </div>
    </div>
  );
};

export default PatternPreview;
