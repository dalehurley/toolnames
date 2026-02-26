import { FC } from "react";
import { FlexContainerProps } from "./types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Tooltip content for flexbox properties
const flexboxTooltips = {
  display: {
    title: "Display",
    description:
      "Defines the element as a flex container and enables flexbox layout for its children.",
  },
  flexDirection: {
    title: "Flex Direction",
    description:
      "Establishes the main axis, defining the direction flex items are placed in the flex container.",
  },
  flexWrap: {
    title: "Flex Wrap",
    description:
      "Controls whether flex items are forced onto a single line or can wrap onto multiple lines.",
  },
  justifyContent: {
    title: "Justify Content",
    description:
      "Aligns flex items along the main axis of the current line of the flex container.",
  },
  alignItems: {
    title: "Align Items",
    description:
      "Aligns flex items along the cross axis of the current line of the flex container.",
  },
  alignContent: {
    title: "Align Content",
    description:
      "Aligns a flex container's lines within when there is extra space in the cross-axis.",
  },
  gap: {
    title: "Gap",
    description:
      "Controls spacing between flex items, both row and column gaps.",
  },
};

// Tooltip component for property explanations
const PropertyTooltip: FC<{ property: keyof typeof flexboxTooltips }> = ({
  property,
}) => {
  const tooltip = flexboxTooltips[property];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="h-5 w-5 ml-1 -mt-1">
            <Info className="h-4 w-4" />
            <span className="sr-only">Info about {tooltip.title}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div>
            <h4 className="font-medium">{tooltip.title}</h4>
            <p className="text-sm text-muted-foreground">
              {tooltip.description}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

interface FlexboxControlsProps {
  container: FlexContainerProps;
  onUpdateContainer: (props: Partial<FlexContainerProps>) => void;
  onAddItem: () => void;
}

export const FlexboxControls: FC<FlexboxControlsProps> = ({
  container,
  onUpdateContainer,
  onAddItem,
}) => {
  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Container Properties</h3>
        <Button variant="outline" size="sm" onClick={onAddItem}>
          <Plus className="mr-1 h-4 w-4" /> Add Item
        </Button>
      </div>

      <Tabs defaultValue="layout" className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="layout">Layout</TabsTrigger>
          <TabsTrigger value="alignment">Alignment</TabsTrigger>
          <TabsTrigger value="spacing">Spacing</TabsTrigger>
        </TabsList>

        <TabsContent value="layout">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <div className="flex items-center">
                <Label htmlFor="display">Display</Label>
                <PropertyTooltip property="display" />
              </div>
              <Select
                value={container.display}
                onValueChange={(value) =>
                  onUpdateContainer({
                    display: value as "flex" | "inline-flex",
                  })
                }
              >
                <SelectTrigger id="display">
                  <SelectValue placeholder="Select display" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flex">flex</SelectItem>
                  <SelectItem value="inline-flex">inline-flex</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center">
                <Label htmlFor="flexDirection">Flex Direction</Label>
                <PropertyTooltip property="flexDirection" />
              </div>
              <Select
                value={container.flexDirection}
                onValueChange={(value) =>
                  onUpdateContainer({
                    flexDirection: value as
                      | "row"
                      | "row-reverse"
                      | "column"
                      | "column-reverse",
                  })
                }
              >
                <SelectTrigger id="flexDirection">
                  <SelectValue placeholder="Select direction" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="row">row</SelectItem>
                  <SelectItem value="row-reverse">row-reverse</SelectItem>
                  <SelectItem value="column">column</SelectItem>
                  <SelectItem value="column-reverse">column-reverse</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center">
                <Label htmlFor="flexWrap">Flex Wrap</Label>
                <PropertyTooltip property="flexWrap" />
              </div>
              <Select
                value={container.flexWrap}
                onValueChange={(value) =>
                  onUpdateContainer({
                    flexWrap: value as "nowrap" | "wrap" | "wrap-reverse",
                  })
                }
              >
                <SelectTrigger id="flexWrap">
                  <SelectValue placeholder="Select wrap" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nowrap">nowrap</SelectItem>
                  <SelectItem value="wrap">wrap</SelectItem>
                  <SelectItem value="wrap-reverse">wrap-reverse</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="alignment">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <div className="flex items-center">
                <Label htmlFor="justifyContent">Justify Content</Label>
                <PropertyTooltip property="justifyContent" />
              </div>
              <Select
                value={container.justifyContent}
                onValueChange={(value) =>
                  onUpdateContainer({
                    justifyContent: value as
                      | "flex-start"
                      | "flex-end"
                      | "center"
                      | "space-between"
                      | "space-around"
                      | "space-evenly",
                  })
                }
              >
                <SelectTrigger id="justifyContent">
                  <SelectValue placeholder="Select justify content" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flex-start">flex-start</SelectItem>
                  <SelectItem value="flex-end">flex-end</SelectItem>
                  <SelectItem value="center">center</SelectItem>
                  <SelectItem value="space-between">space-between</SelectItem>
                  <SelectItem value="space-around">space-around</SelectItem>
                  <SelectItem value="space-evenly">space-evenly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center">
                <Label htmlFor="alignItems">Align Items</Label>
                <PropertyTooltip property="alignItems" />
              </div>
              <Select
                value={container.alignItems}
                onValueChange={(value) =>
                  onUpdateContainer({
                    alignItems: value as
                      | "stretch"
                      | "flex-start"
                      | "flex-end"
                      | "center"
                      | "baseline",
                  })
                }
              >
                <SelectTrigger id="alignItems">
                  <SelectValue placeholder="Select align items" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stretch">stretch</SelectItem>
                  <SelectItem value="flex-start">flex-start</SelectItem>
                  <SelectItem value="flex-end">flex-end</SelectItem>
                  <SelectItem value="center">center</SelectItem>
                  <SelectItem value="baseline">baseline</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center">
                <Label htmlFor="alignContent">Align Content</Label>
                <PropertyTooltip property="alignContent" />
              </div>
              <Select
                value={container.alignContent}
                onValueChange={(value) =>
                  onUpdateContainer({
                    alignContent: value as
                      | "normal"
                      | "flex-start"
                      | "flex-end"
                      | "center"
                      | "space-between"
                      | "space-around"
                      | "stretch",
                  })
                }
              >
                <SelectTrigger id="alignContent">
                  <SelectValue placeholder="Select align content" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">normal</SelectItem>
                  <SelectItem value="flex-start">flex-start</SelectItem>
                  <SelectItem value="flex-end">flex-end</SelectItem>
                  <SelectItem value="center">center</SelectItem>
                  <SelectItem value="space-between">space-between</SelectItem>
                  <SelectItem value="space-around">space-around</SelectItem>
                  <SelectItem value="stretch">stretch</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="spacing">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <div className="flex items-center">
                <Label htmlFor="gap">Gap</Label>
                <PropertyTooltip property="gap" />
              </div>
              <Input
                id="gap"
                type="text"
                value={container.gap}
                onChange={(e) => onUpdateContainer({ gap: e.target.value })}
                placeholder="e.g., 10px, 1rem"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="padding">Padding</Label>
              <Input
                id="padding"
                type="text"
                value={container.padding || ""}
                onChange={(e) => onUpdateContainer({ padding: e.target.value })}
                placeholder="e.g., 10px, 1rem 2rem"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="width">Width</Label>
                <Input
                  id="width"
                  type="text"
                  value={container.width || ""}
                  onChange={(e) => onUpdateContainer({ width: e.target.value })}
                  placeholder="e.g., 100%, 500px"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="height">Height</Label>
                <Input
                  id="height"
                  type="text"
                  value={container.height || ""}
                  onChange={(e) =>
                    onUpdateContainer({ height: e.target.value })
                  }
                  placeholder="e.g., 300px, auto"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="backgroundColor">Background Color</Label>
              <div className="flex gap-2">
                <Input
                  id="backgroundColor"
                  type="text"
                  value={container.backgroundColor || ""}
                  onChange={(e) =>
                    onUpdateContainer({ backgroundColor: e.target.value })
                  }
                  placeholder="e.g., #f5f5f5, lightgray"
                  className="flex-1"
                />
                <Input
                  type="color"
                  value={container.backgroundColor || "#f5f5f5"}
                  onChange={(e) =>
                    onUpdateContainer({ backgroundColor: e.target.value })
                  }
                  className="w-12 p-1 h-10"
                />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};
