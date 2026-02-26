import React, { useRef } from "react";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { ContainerConfig, EditorState } from "./types";
import { generateContainerStyles } from "@/utils/containerCodeGenerator";

interface ResponsivePreviewProps {
  containerConfig: ContainerConfig;
  editorState: EditorState;
  onWidthChange: (width: number) => void;
}

const ResponsivePreview: React.FC<ResponsivePreviewProps> = ({
  containerConfig,
  editorState,
  onWidthChange,
}) => {
  const { previewWidth, showGrid } = editorState;
  const previewRef = useRef<HTMLDivElement>(null);

  // Generate container styles for preview
  const containerStyles = generateContainerStyles(
    containerConfig,
    previewWidth
  );

  // Preset device width options
  const devicePresets = [
    { name: "Mobile S", width: 320 },
    { name: "Mobile M", width: 375 },
    { name: "Mobile L", width: 425 },
    { name: "Tablet", width: 768 },
    { name: "Laptop", width: 1024 },
    { name: "Desktop", width: 1440 },
  ];

  // Find active breakpoint based on current preview width
  const activeBreakpoint = containerConfig.breakpoints.find(
    (bp) =>
      previewWidth >= bp.minWidth &&
      (!bp.maxWidth || previewWidth <= bp.maxWidth)
  );

  return (
    <Card className="p-4">
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <span className="font-medium">{previewWidth}px</span>
            {activeBreakpoint && (
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                {activeBreakpoint.name} Breakpoint
              </span>
            )}
          </div>
          <div className="flex flex-wrap justify-end gap-1">
            {devicePresets.map((device) => (
              <button
                key={device.name}
                className={`text-xs px-2 py-1 rounded ${
                  previewWidth === device.width
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80"
                }`}
                onClick={() => onWidthChange(device.width)}
                title={`${device.name} - ${device.width}px`}
              >
                {device.name}
              </button>
            ))}
          </div>
        </div>

        <Slider
          value={[previewWidth]}
          min={320}
          max={1920}
          step={1}
          onValueChange={(values) => onWidthChange(values[0])}
          className="my-4"
        />
      </div>

      <div
        className="relative border rounded-lg overflow-hidden bg-background"
        style={{ height: "400px" }}
      >
        {/* Viewport size indicator */}
        <div className="absolute top-2 left-2 z-10 bg-background/80 backdrop-blur-sm text-xs px-2 py-1 rounded-md border">
          Viewport: {previewWidth}px
        </div>

        {/* Container size indicator */}
        <div className="absolute bottom-2 right-2 z-10 bg-background/80 backdrop-blur-sm text-xs px-2 py-1 rounded-md border">
          Container:{" "}
          {typeof containerStyles.width === "number"
            ? `${containerStyles.width}px (Fixed)`
            : `${containerStyles.width} (Fluid)`}
        </div>

        <div
          className="h-full overflow-auto"
          style={{ width: `${previewWidth}px`, maxWidth: "100%" }}
        >
          {/* Grid overlay */}
          {showGrid && (
            <div className="absolute inset-0 grid-cols-2 grid-rows-4 grid z-10 pointer-events-none">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="border border-primary/10 flex items-center justify-center"
                >
                  <span className="text-[10px] bg-background/50 text-muted-foreground px-1 rounded">
                    Grid {i + 1}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Preview container */}
          <div
            ref={previewRef}
            className="border-2 border-dashed border-primary/30 mx-auto bg-primary/5 h-full flex items-center justify-center"
            style={containerStyles}
          >
            <div className="p-6 text-center">
              <div className="text-lg font-medium mb-2">
                .{containerConfig.name}
              </div>
              <div className="text-sm text-muted-foreground">
                {typeof containerStyles.width === "number"
                  ? `Fixed width: ${containerStyles.width}px`
                  : `Fluid width: ${containerStyles.width}`}
                <br />
                Padding: {containerStyles.padding}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ResponsivePreview;
