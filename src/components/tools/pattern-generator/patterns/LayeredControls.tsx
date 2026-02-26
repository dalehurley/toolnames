import React, { useState } from "react";
import { LayerConfig, PatternConfig, PatternType } from "@/types/pattern";
import { createDefaultLayer } from "@/utils/patternHelpers";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus, Eye, EyeOff } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import StripeControls from "./StripeControls";
import DotControls from "./DotControls";
import GridControls from "./GridControls";
import GeometricControls from "./GeometricControls";
import WaveControls from "./WaveControls";

interface LayeredControlsProps {
  config: PatternConfig;
  onChange: (config: Partial<PatternConfig>) => void;
}

const blendModes = [
  "normal",
  "multiply",
  "screen",
  "overlay",
  "darken",
  "lighten",
  "color-dodge",
  "color-burn",
  "hard-light",
  "soft-light",
  "difference",
  "exclusion",
];

const LayeredControls: React.FC<LayeredControlsProps> = ({
  config,
  onChange,
}) => {
  const [activeLayerIndex, setActiveLayerIndex] = useState(0);
  const layers = config.layers || [createDefaultLayer("stripes")];

  const handleAddLayer = () => {
    const newLayers = [...layers, createDefaultLayer("dots")];
    onChange({ layers: newLayers });
    setActiveLayerIndex(newLayers.length - 1);
  };

  const handleDeleteLayer = (index: number) => {
    if (layers.length <= 1) return;

    const newLayers = [...layers];
    newLayers.splice(index, 1);
    onChange({ layers: newLayers });

    if (activeLayerIndex >= newLayers.length) {
      setActiveLayerIndex(newLayers.length - 1);
    }
  };

  const handleLayerTypeChange = (type: PatternType, index: number) => {
    const newLayers = [...layers];
    newLayers[index] = createDefaultLayer(type);
    onChange({ layers: newLayers });
  };

  const handleLayerConfigChange = (
    layerConfig: Partial<PatternConfig>,
    index: number
  ) => {
    const newLayers = [...layers];
    newLayers[index] = {
      ...newLayers[index],
      config: {
        ...newLayers[index].config,
        ...layerConfig,
      },
    };
    onChange({ layers: newLayers });
  };

  const handleLayerPropertyChange = (
    property: keyof LayerConfig,
    value: string | number | boolean,
    index: number
  ) => {
    const newLayers = [...layers];
    newLayers[index] = {
      ...newLayers[index],
      [property]: value,
    };
    onChange({ layers: newLayers });
  };

  const handleLayerVisibilityToggle = (index: number) => {
    const newLayers = [...layers];
    newLayers[index] = {
      ...newLayers[index],
      visible: !newLayers[index].visible,
    };
    onChange({ layers: newLayers });
  };

  const renderLayerControls = (layer: LayerConfig, index: number) => {
    if (index !== activeLayerIndex) return null;

    switch (layer.type) {
      case "stripes":
        return (
          <StripeControls
            config={layer.config}
            onChange={(cfg) => handleLayerConfigChange(cfg, index)}
          />
        );
      case "dots":
        return (
          <DotControls
            config={layer.config}
            onChange={(cfg) => handleLayerConfigChange(cfg, index)}
          />
        );
      case "grid":
        return (
          <GridControls
            config={layer.config}
            onChange={(cfg) => handleLayerConfigChange(cfg, index)}
          />
        );
      case "geometric":
        return (
          <GeometricControls
            config={layer.config}
            onChange={(cfg) => handleLayerConfigChange(cfg, index)}
          />
        );
      case "waves":
        return (
          <WaveControls
            config={layer.config}
            onChange={(cfg) => handleLayerConfigChange(cfg, index)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Layers</h3>
        <Button
          size="sm"
          variant="outline"
          onClick={handleAddLayer}
          disabled={layers.length >= 5}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Layer
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {layers.map((layer, index) => (
          <Button
            key={index}
            variant={activeLayerIndex === index ? "default" : "outline"}
            size="sm"
            className="flex items-center gap-1"
            onClick={() => setActiveLayerIndex(index)}
          >
            <span>Layer {index + 1}</span>
            {!layer.visible && <EyeOff className="h-3 w-3 ml-1 opacity-50" />}
          </Button>
        ))}
      </div>

      <Separator />

      {layers.map((layer, index) => (
        <div
          key={index}
          style={{ display: activeLayerIndex === index ? "block" : "none" }}
        >
          <Card className="mb-4">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  Layer {index + 1} Settings
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleLayerVisibilityToggle(index)}
                    title={layer.visible ? "Hide layer" : "Show layer"}
                  >
                    {layer.visible ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteLayer(index)}
                    disabled={layers.length <= 1}
                    title="Delete layer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor={`layer-type-${index}`}>Pattern Type</Label>
                    <Select
                      value={layer.type}
                      onValueChange={(value) =>
                        handleLayerTypeChange(value as PatternType, index)
                      }
                    >
                      <SelectTrigger id={`layer-type-${index}`}>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="stripes">Stripes</SelectItem>
                        <SelectItem value="dots">Dots</SelectItem>
                        <SelectItem value="grid">Grid</SelectItem>
                        <SelectItem value="geometric">Geometric</SelectItem>
                        <SelectItem value="waves">Waves</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor={`blend-mode-${index}`}>Blend Mode</Label>
                    <Select
                      value={layer.blendMode || "normal"}
                      onValueChange={(value) =>
                        handleLayerPropertyChange("blendMode", value, index)
                      }
                      disabled={index === 0}
                    >
                      <SelectTrigger id={`blend-mode-${index}`}>
                        <SelectValue placeholder="Blend mode" />
                      </SelectTrigger>
                      <SelectContent>
                        {blendModes.map((mode) => (
                          <SelectItem key={mode} value={mode}>
                            {mode.charAt(0).toUpperCase() + mode.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {index > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor={`layer-opacity-${index}`}>
                        Layer Opacity
                      </Label>
                      <span className="text-sm text-muted-foreground">
                        {layer.opacity}
                      </span>
                    </div>
                    <Slider
                      id={`layer-opacity-${index}`}
                      min={0.1}
                      max={1}
                      step={0.05}
                      value={[layer.opacity]}
                      onValueChange={(values) =>
                        handleLayerPropertyChange("opacity", values[0], index)
                      }
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="mt-4">{renderLayerControls(layer, index)}</div>
        </div>
      ))}
    </div>
  );
};

export default LayeredControls;
