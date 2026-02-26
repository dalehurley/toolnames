import React from "react";
import { PatternConfig } from "@/types/pattern";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

interface StripeControlsProps {
  config: PatternConfig;
  onChange: (config: Partial<PatternConfig>) => void;
}

const StripeControls: React.FC<StripeControlsProps> = ({
  config,
  onChange,
}) => {
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
              Stripe Color
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
          <Label htmlFor="stripeWidth">Stripe Width</Label>
          <span className="text-sm text-muted-foreground">
            {config.stripeWidth}px
          </span>
        </div>
        <Slider
          id="stripeWidth"
          min={1}
          max={50}
          step={1}
          value={[(config.stripeWidth as number) || 10]}
          onValueChange={(values) => onChange({ stripeWidth: values[0] })}
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

      <div className="space-y-2">
        <Label>Direction</Label>
        <Tabs
          defaultValue={(config.direction as string) || "diagonal"}
          onValueChange={(value: string) =>
            onChange({
              direction: value as "horizontal" | "vertical" | "diagonal",
            })
          }
          className="w-full"
        >
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="horizontal">Horizontal</TabsTrigger>
            <TabsTrigger value="vertical">Vertical</TabsTrigger>
            <TabsTrigger value="diagonal">Diagonal</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {config.direction === "diagonal" && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="rotation">Rotation</Label>
            <span className="text-sm text-muted-foreground">
              {config.rotation}°
            </span>
          </div>
          <Slider
            id="rotation"
            min={0}
            max={360}
            step={5}
            value={[config.rotation]}
            onValueChange={(values) => onChange({ rotation: values[0] })}
          />
        </div>
      )}

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

export default StripeControls;
