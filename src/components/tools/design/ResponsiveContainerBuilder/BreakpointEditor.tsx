import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2 } from "lucide-react";
import { Breakpoint, ContainerConfig, EditorState } from "./types";

interface BreakpointEditorProps {
  containerConfig: ContainerConfig;
  editorState: EditorState;
  onEditorStateChange: (state: EditorState) => void;
  onAddBreakpoint: () => void;
  onUpdateBreakpoint: (id: string, updates: Partial<Breakpoint>) => void;
  onDeleteBreakpoint: (id: string) => void;
}

const BreakpointEditor: React.FC<BreakpointEditorProps> = ({
  containerConfig,
  editorState,
  onEditorStateChange,
  onAddBreakpoint,
  onUpdateBreakpoint,
  onDeleteBreakpoint,
}) => {
  const { breakpoints } = containerConfig;
  const { activeBreakpoint } = editorState;

  const activeBreakpointData = breakpoints.find(
    (bp) => bp.id === activeBreakpoint
  );

  if (!activeBreakpointData) {
    return <div>No breakpoint selected</div>;
  }

  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium text-lg">Breakpoints</h3>
        <Button
          onClick={onAddBreakpoint}
          size="sm"
          className="flex items-center gap-1"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Breakpoint</span>
        </Button>
      </div>

      {/* Visual breakpoint bar */}
      <div className="relative mb-6">
        <div className="h-8 bg-muted rounded-lg w-full relative">
          {breakpoints.map((bp) => {
            // Calculate position proportional to the width
            const start = (bp.minWidth / 2000) * 100;
            const end = bp.maxWidth ? (bp.maxWidth / 2000) * 100 : 100;
            const width = end - start;

            return (
              <div
                key={bp.id}
                className={`absolute h-full rounded-lg flex items-center justify-center text-xs font-medium ${
                  bp.id === activeBreakpoint
                    ? "bg-primary text-primary-foreground"
                    : "bg-primary/20 hover:bg-primary/30 cursor-pointer"
                }`}
                style={{
                  left: `${start}%`,
                  width: `${width}%`,
                }}
                onClick={() =>
                  onEditorStateChange({
                    ...editorState,
                    activeBreakpoint: bp.id,
                  })
                }
              >
                {bp.name}
              </div>
            );
          })}
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>0px</span>
          <span>500px</span>
          <span>1000px</span>
          <span>1500px</span>
          <span>2000px+</span>
        </div>
      </div>

      <div className="space-y-6 mb-6">
        {/* Breakpoint selector */}
        <div>
          <Label
            htmlFor="breakpoint-selector"
            className="flex items-center gap-2"
          >
            <span>Active Breakpoint</span>
            <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
              {breakpoints.length} total
            </span>
          </Label>
          <Select
            value={activeBreakpoint}
            onValueChange={(value: string) =>
              onEditorStateChange({
                ...editorState,
                activeBreakpoint: value,
              })
            }
          >
            <SelectTrigger id="breakpoint-selector" className="w-full">
              <SelectValue placeholder="Select breakpoint" />
            </SelectTrigger>
            <SelectContent>
              {breakpoints.map((bp) => (
                <SelectItem key={bp.id} value={bp.id}>
                  {bp.name} ({bp.minWidth}px
                  {bp.maxWidth ? ` - ${bp.maxWidth}px` : "+"})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Active breakpoint configuration */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="breakpoint-name">Breakpoint Name</Label>
            <Input
              id="breakpoint-name"
              value={activeBreakpointData.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onUpdateBreakpoint(activeBreakpoint, { name: e.target.value })
              }
              placeholder="e.g., Mobile, Tablet, Desktop"
            />
          </div>

          <div>
            <Label htmlFor="min-width">Min Width (px)</Label>
            <div className="flex space-x-4 items-center">
              <Slider
                id="min-width-slider"
                min={0}
                max={2000}
                step={1}
                value={[activeBreakpointData.minWidth]}
                onValueChange={(value: number[]) =>
                  onUpdateBreakpoint(activeBreakpoint, { minWidth: value[0] })
                }
                className="flex-1"
              />
              <Input
                id="min-width"
                type="number"
                value={activeBreakpointData.minWidth}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  onUpdateBreakpoint(activeBreakpoint, {
                    minWidth: parseInt(e.target.value) || 0,
                  })
                }
                className="w-20"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="is-fluid">Fluid Width</Label>
              <p className="text-xs text-muted-foreground">
                Container will stretch to fill available space
              </p>
            </div>
            <Switch
              id="is-fluid"
              checked={activeBreakpointData.isFluid}
              onCheckedChange={(checked: boolean) =>
                onUpdateBreakpoint(activeBreakpoint, { isFluid: checked })
              }
            />
          </div>

          {!activeBreakpointData.isFluid && (
            <div>
              <Label htmlFor="container-width">Container Width</Label>
              <Input
                id="container-width"
                value={
                  typeof activeBreakpointData.containerWidth === "number"
                    ? activeBreakpointData.containerWidth
                    : activeBreakpointData.containerWidth
                }
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const value = e.target.value;
                  const isNumeric = /^\d+$/.test(value);

                  onUpdateBreakpoint(activeBreakpoint, {
                    containerWidth: isNumeric ? `${value}px` : value,
                  });
                }}
                placeholder="e.g., 1200px, 85%, etc."
              />
              <p className="text-xs text-muted-foreground mt-1">
                Use px for fixed widths or % for percentage widths
              </p>
            </div>
          )}

          <div>
            <Label htmlFor="container-padding">Container Padding</Label>
            <Input
              id="container-padding"
              value={activeBreakpointData.containerPadding}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onUpdateBreakpoint(activeBreakpoint, {
                  containerPadding: e.target.value,
                })
              }
              placeholder="e.g., 1rem, 20px, etc."
            />
            <p className="text-xs text-muted-foreground mt-1">
              Padding applied to the left and right sides
            </p>
          </div>

          {activeBreakpointData.id !== "default" && (
            <Button
              variant="destructive"
              size="sm"
              className="w-full mt-4"
              onClick={() => onDeleteBreakpoint(activeBreakpoint)}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete Breakpoint
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default BreakpointEditor;
