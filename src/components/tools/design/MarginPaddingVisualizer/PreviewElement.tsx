import React, { useState } from "react";
import { useSpacing } from "./SpacingContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TabsContent, TabsList, TabsTrigger, Tabs } from "@/components/ui/tabs";
import { Monitor, Smartphone, Tablet, Laptop } from "lucide-react";

// Define screen size presets for responsive preview
const SCREEN_SIZES = {
  mobile: { width: 320, height: 568, label: "Mobile", icon: Smartphone },
  tablet: { width: 768, height: 1024, label: "Tablet", icon: Tablet },
  laptop: { width: 1366, height: 768, label: "Laptop", icon: Laptop },
  desktop: { width: 1920, height: 1080, label: "Desktop", icon: Monitor },
};

const PreviewElement: React.FC = () => {
  const spacing = useSpacing();
  const [viewportSize, setViewportSize] =
    useState<keyof typeof SCREEN_SIZES>("laptop");
  const [customContent, setCustomContent] = useState(spacing.previewContent);

  // Helper to convert numeric values to CSS values with units
  const toCssValue = (value: number) => {
    return `${value}${spacing.unit}`;
  };

  // Handle content update
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCustomContent(e.target.value);
    spacing.setSpacing("previewContent", e.target.value);
  };

  // Dynamic styles for the preview element
  const previewStyles = {
    margin: `${toCssValue(spacing.marginTop)} ${toCssValue(
      spacing.marginRight
    )} ${toCssValue(spacing.marginBottom)} ${toCssValue(spacing.marginLeft)}`,
    padding: `${toCssValue(spacing.paddingTop)} ${toCssValue(
      spacing.paddingRight
    )} ${toCssValue(spacing.paddingBottom)} ${toCssValue(spacing.paddingLeft)}`,
    border: `${toCssValue(spacing.borderWidth)} solid #94a3b8`,
    boxSizing: "border-box" as const,
  };

  // Get the correct element type based on the setting
  const getElementByType = () => {
    switch (spacing.previewElementType) {
      case "button":
        return (
          <Button className="w-full" style={previewStyles}>
            {spacing.previewContent}
          </Button>
        );
      case "card":
        return (
          <Card className="w-full p-4" style={previewStyles}>
            {spacing.previewContent}
          </Card>
        );
      case "text":
        return <p style={previewStyles}>{spacing.previewContent}</p>;
      default:
        return (
          <div
            className={`bg-slate-100 dark:bg-slate-800 w-full rounded-md`}
            style={previewStyles}
          >
            {spacing.previewContent}
          </div>
        );
    }
  };

  // Calculate scaled viewport size and CSS
  const currentScreenSize = SCREEN_SIZES[viewportSize];
  const scale = 0.5; // Scale down the viewport to fit in the preview
  const scaledWidth = currentScreenSize.width * scale;
  const scaledHeight = currentScreenSize.height * scale;

  const viewportStyle = {
    width: `${scaledWidth}px`,
    height: `${scaledHeight}px`,
    transform: `scale(${scale})`,
    transformOrigin: "top left",
    overflow: "hidden",
    border: "1px solid #cbd5e1",
    borderRadius: "4px",
    backgroundColor: spacing.previewMode === "light" ? "#ffffff" : "#0f172a",
    color: spacing.previewMode === "light" ? "#0f172a" : "#f8fafc",
  };

  const containerStyle = {
    width: `${scaledWidth}px`,
    height: `${scaledHeight}px`,
    overflow: "hidden",
  };

  return (
    <Card className="p-6">
      <h2 className="text-lg font-medium mb-4">Preview</h2>

      <Tabs defaultValue="standard" className="mb-4">
        <TabsList>
          <TabsTrigger value="standard">Standard</TabsTrigger>
          <TabsTrigger value="responsive">Responsive</TabsTrigger>
        </TabsList>

        <TabsContent value="standard" className="mt-2">
          <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-md mb-4 flex justify-center">
            {getElementByType()}
          </div>
        </TabsContent>

        <TabsContent value="responsive" className="mt-2">
          <div className="flex justify-center mb-4">
            <div className="flex space-x-2 justify-center">
              {Object.entries(SCREEN_SIZES).map(([key, size]) => {
                const Icon = size.icon;
                return (
                  <Button
                    key={key}
                    variant={viewportSize === key ? "default" : "outline"}
                    size="sm"
                    onClick={() =>
                      setViewportSize(key as keyof typeof SCREEN_SIZES)
                    }
                    className="flex items-center"
                  >
                    <Icon className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">{size.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-center">
            <div style={containerStyle}>
              <div style={viewportStyle} className="flex justify-center p-4">
                {getElementByType()}
              </div>
            </div>
          </div>

          <div className="mt-2 text-center text-xs text-slate-500">
            {currentScreenSize.width} × {currentScreenSize.height}
          </div>
        </TabsContent>
      </Tabs>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="element-type">Element Type</Label>
            <Select
              defaultValue={spacing.previewElementType}
              onValueChange={(value) =>
                spacing.updatePreviewElementType(
                  value as "div" | "button" | "card" | "text"
                )
              }
            >
              <SelectTrigger id="element-type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="div">Div</SelectItem>
                <SelectItem value="button">Button</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="text">Text</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="preview-mode">Theme Mode</Label>
            <Select
              defaultValue={spacing.previewMode}
              onValueChange={(value) => {
                spacing.setSpacing("previewMode", value as "light" | "dark");
              }}
            >
              <SelectTrigger id="preview-mode">
                <SelectValue placeholder="Select mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="preview-content">Content</Label>
          <Textarea
            id="preview-content"
            value={customContent}
            onChange={handleContentChange}
            className="resize-none"
            rows={2}
          />
        </div>
      </div>
    </Card>
  );
};

export default PreviewElement;
