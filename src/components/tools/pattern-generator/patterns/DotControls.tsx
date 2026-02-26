import React from "react";
import { PatternConfig } from "@/types/pattern";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";

interface DotControlsProps {
  config: PatternConfig;
  onChange: (config: Partial<PatternConfig>) => void;
}

const DotControls: React.FC<DotControlsProps> = ({ config, onChange }) => {
  const handleColorChange = (index: number, value: string) => {
    const newColors = [...config.colors];
    newColors[index] = value;
    onChange({ colors: newColors });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Label>Colors</Label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="color1" className="text-xs mb-1.5 block">
              Dot Color
            </Label>
            <div className="flex gap-2">
              <div
                className="w-10 h-10 rounded border"
                style={{ backgroundColor: config.colors[0] }}
              />
              <Input
                id="color1"
                type="color"
                value={config.colors[0]}
                onChange={(e) => handleColorChange(0, e.target.value)}
                className="w-full"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="color2" className="text-xs mb-1.5 block">
              Background Color
            </Label>
            <div className="flex gap-2">
              <div
                className="w-10 h-10 rounded border"
                style={{ backgroundColor: config.colors[1] || "transparent" }}
              />
              <Input
                id="color2"
                type="color"
                value={config.colors[1] || "#ffffff"}
                onChange={(e) => handleColorChange(1, e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="dotRadius">Dot Radius</Label>
          <span className="text-sm text-muted-foreground">
            {config.dotRadius}px
          </span>
        </div>
        <Slider
          id="dotRadius"
          min={1}
          max={30}
          step={1}
          value={[(config.dotRadius as number) || 5]}
          onValueChange={(values) => onChange({ dotRadius: values[0] })}
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="size">Size</Label>
          <span className="text-sm text-muted-foreground">{config.size}px</span>
        </div>
        <Slider
          id="size"
          min={5}
          max={100}
          step={1}
          value={[config.size]}
          onValueChange={(values) => onChange({ size: values[0] })}
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="spacing">Spacing</Label>
          <span className="text-sm text-muted-foreground">
            {config.spacing}px
          </span>
        </div>
        <Slider
          id="spacing"
          min={0}
          max={50}
          step={1}
          value={[config.spacing]}
          onValueChange={(values) => onChange({ spacing: values[0] })}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="staggered">Staggered Pattern</Label>
          <p className="text-sm text-muted-foreground">
            Offset every other row of dots
          </p>
        </div>
        <Switch
          id="staggered"
          checked={(config.staggered as boolean) || false}
          onCheckedChange={(checked) => onChange({ staggered: checked })}
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="opacity">Opacity</Label>
          <span className="text-sm text-muted-foreground">
            {config.opacity}
          </span>
        </div>
        <Slider
          id="opacity"
          min={0.1}
          max={1}
          step={0.05}
          value={[config.opacity]}
          onValueChange={(values) => onChange({ opacity: values[0] })}
        />
      </div>
    </div>
  );
};

export default DotControls;
