import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CustomizationOptions, ViewportSize } from "../hooks/useComponentState";
import { ComponentState } from "../hooks/useComponentStates";
import { getTemplateById } from "../utils/componentTemplates";
import { combineClasses } from "../hooks/useCodeGenerator";
import { MoonIcon, SunIcon, Smartphone, Tablet, Monitor } from "lucide-react";

interface DeviceFrame {
  name: string;
  icon: React.ReactNode;
  width: string;
  height: string;
  frameClasses: string;
  viewport: ViewportSize;
}

interface MultiDevicePreviewProps {
  componentType: string;
  customizationOptions: CustomizationOptions;
  activeState: ComponentState;
  getStateClasses?: (
    componentType: string,
    baseClasses: string,
    state: ComponentState
  ) => string;
}

export const MultiDevicePreview: React.FC<MultiDevicePreviewProps> = ({
  componentType,
  customizationOptions,
  activeState,
  getStateClasses,
}) => {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [showAllDevices, setShowAllDevices] = useState<boolean>(true);
  const [rotate, setRotate] = useState<boolean>(false);

  // Get the template for this component
  const template = getTemplateById(componentType);

  // Generate the Tailwind classes
  const baseClasses = combineClasses(customizationOptions, componentType);

  // If we have state-specific classes, apply them
  const finalClasses = getStateClasses
    ? getStateClasses(componentType, baseClasses, activeState)
    : baseClasses;

  // Define device frames
  const devices: DeviceFrame[] = [
    {
      name: "Mobile",
      icon: <Smartphone size={16} />,
      width: rotate ? "w-64" : "w-36",
      height: rotate ? "h-36" : "h-64",
      frameClasses: "border-8 border-gray-800 rounded-3xl",
      viewport: "mobile",
    },
    {
      name: "Tablet",
      icon: <Tablet size={16} />,
      width: rotate ? "w-96" : "w-64",
      height: rotate ? "h-64" : "h-80",
      frameClasses: "border-8 border-gray-800 rounded-xl",
      viewport: "tablet",
    },
    {
      name: "Desktop",
      icon: <Monitor size={16} />,
      width: "w-full",
      height: "h-64",
      frameClasses: "border-8 border-gray-800 rounded-md",
      viewport: "desktop",
    },
  ];

  // If not showing all devices, just show desktop
  const visibleDevices = showAllDevices
    ? devices
    : [devices.find((d) => d.viewport === "desktop")!];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-lg font-medium">Preview</div>
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="show-all-devices"
              checked={showAllDevices}
              onCheckedChange={setShowAllDevices}
            />
            <Label htmlFor="show-all-devices" className="text-sm">
              Show all devices
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="rotate-devices"
              checked={rotate}
              onCheckedChange={setRotate}
              disabled={!showAllDevices}
            />
            <Label
              htmlFor="rotate-devices"
              className={`text-sm ${!showAllDevices ? "text-gray-400" : ""}`}
            >
              Landscape mode
            </Label>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="text-xs flex items-center gap-1"
          >
            {theme === "light" ? <MoonIcon size={14} /> : <SunIcon size={14} />}
            {theme === "light" ? "Dark Mode" : "Light Mode"}
          </Button>
        </div>
      </div>

      <div
        className={`grid ${
          showAllDevices ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1"
        } gap-6`}
      >
        {visibleDevices.map((device) => (
          <div key={device.viewport} className="flex flex-col items-center">
            <div
              className={`${device.width} ${device.height} ${device.frameClasses} overflow-hidden relative`}
            >
              <div
                className={`w-full h-full transition-colors duration-300 ${
                  theme === "dark" ? "bg-gray-800" : "bg-gray-100"
                } flex items-center justify-center`}
              >
                {template ? (
                  <div
                    className={finalClasses}
                    dangerouslySetInnerHTML={{
                      __html: template.defaultContent,
                    }}
                  />
                ) : (
                  <div
                    className={`text-center ${
                      theme === "dark" ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    No template found
                  </div>
                )}
              </div>

              {/* Device browser UI elements */}
              <div className="absolute top-0 left-0 right-0 h-6 bg-gray-900 flex items-center justify-center">
                <div className="w-16 h-2 bg-gray-700 rounded-full"></div>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1 text-sm text-gray-600">
              {device.icon}
              <span>{device.name}</span>
              {device.viewport === "mobile" && (
                <span className="text-xs text-gray-400">(375px)</span>
              )}
              {device.viewport === "tablet" && (
                <span className="text-xs text-gray-400">(768px)</span>
              )}
              {device.viewport === "desktop" && (
                <span className="text-xs text-gray-400">(1200px+)</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* State indicator */}
      {activeState !== "default" && (
        <div className="mt-2 text-sm flex items-center justify-center p-2 bg-blue-50 text-blue-800 rounded-md">
          <span className="font-medium">Preview in {activeState} state</span>
        </div>
      )}
    </div>
  );
};
