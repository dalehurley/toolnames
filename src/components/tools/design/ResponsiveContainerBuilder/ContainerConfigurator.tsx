import React from "react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ContainerConfig } from "./types";

interface ContainerConfiguratorProps {
  containerConfig: ContainerConfig;
  onConfigChange: (config: ContainerConfig) => void;
}

const ContainerConfigurator: React.FC<ContainerConfiguratorProps> = ({
  containerConfig,
  onConfigChange,
}) => {
  const handleConfigChange = (
    key: keyof ContainerConfig,
    value: string | boolean
  ) => {
    onConfigChange({
      ...containerConfig,
      [key]: value,
    });
  };

  return (
    <Card className="p-4">
      <h3 className="font-medium text-lg mb-4">Container Settings</h3>

      <div className="space-y-6">
        <div>
          <Label htmlFor="container-name">Container Name</Label>
          <Input
            id="container-name"
            value={containerConfig.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleConfigChange("name", e.target.value)
            }
            placeholder="e.g., container, wrapper, section"
          />
          <p className="text-sm text-muted-foreground mt-1">
            This will be used as the class name in the generated code.
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="center-container">Center Container</Label>
            <p className="text-sm text-muted-foreground">
              Apply auto margins on left and right sides
            </p>
          </div>
          <Switch
            id="center-container"
            checked={containerConfig.centerContainer}
            onCheckedChange={(checked: boolean) =>
              handleConfigChange("centerContainer", checked)
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="use-custom-properties">
              Use CSS Custom Properties
            </Label>
            <p className="text-sm text-muted-foreground">
              Generate code using CSS variables for easier theming
            </p>
          </div>
          <Switch
            id="use-custom-properties"
            checked={containerConfig.useCustomProperties}
            onCheckedChange={(checked: boolean) =>
              handleConfigChange("useCustomProperties", checked)
            }
          />
        </div>

        {containerConfig.useCustomProperties && (
          <div>
            <Label htmlFor="custom-property-prefix">
              Custom Property Prefix
            </Label>
            <Input
              id="custom-property-prefix"
              value={containerConfig.customPropertyPrefix}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleConfigChange("customPropertyPrefix", e.target.value)
              }
              placeholder="e.g., container"
            />
            <p className="text-sm text-muted-foreground mt-1">
              This will prefix all CSS variables, e.g., --container-width-sm
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ContainerConfigurator;
