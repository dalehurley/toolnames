import { FC } from "react";
import { FlexItemProps } from "./types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

interface FlexboxItemControlsProps {
  item: FlexItemProps;
  onUpdateItem: (props: Partial<FlexItemProps>) => void;
  onRemoveItem: () => void;
}

export const FlexboxItemControls: FC<FlexboxItemControlsProps> = ({
  item,
  onUpdateItem,
  onRemoveItem,
}) => {
  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Item Properties</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={onRemoveItem}
          className="text-destructive"
        >
          <Trash2 className="mr-1 h-4 w-4" /> Remove Item
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <Label htmlFor="order">Order</Label>
          <div className="flex gap-4 items-center">
            <Slider
              id="order"
              min={0}
              max={10}
              step={1}
              value={[item.order || 0]}
              onValueChange={(value) => onUpdateItem({ order: value[0] })}
              className="flex-1"
            />
            <span className="text-sm w-8 text-center">{item.order || 0}</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="flexGrow">Flex Grow</Label>
          <div className="flex gap-4 items-center">
            <Slider
              id="flexGrow"
              min={0}
              max={5}
              step={1}
              value={[item.flexGrow || 0]}
              onValueChange={(value) => onUpdateItem({ flexGrow: value[0] })}
              className="flex-1"
            />
            <span className="text-sm w-8 text-center">
              {item.flexGrow || 0}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="flexShrink">Flex Shrink</Label>
          <div className="flex gap-4 items-center">
            <Slider
              id="flexShrink"
              min={0}
              max={5}
              step={1}
              value={[item.flexShrink || 1]}
              onValueChange={(value) => onUpdateItem({ flexShrink: value[0] })}
              className="flex-1"
            />
            <span className="text-sm w-8 text-center">
              {item.flexShrink || 1}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="flexBasis">Flex Basis</Label>
          <Input
            id="flexBasis"
            type="text"
            value={item.flexBasis || "auto"}
            onChange={(e) => onUpdateItem({ flexBasis: e.target.value })}
            placeholder="e.g., auto, 100px, 50%"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="alignSelf">Align Self</Label>
          <Select
            value={item.alignSelf || "auto"}
            onValueChange={(value) =>
              onUpdateItem({
                alignSelf: value as
                  | "auto"
                  | "flex-start"
                  | "flex-end"
                  | "center"
                  | "baseline"
                  | "stretch",
              })
            }
          >
            <SelectTrigger id="alignSelf">
              <SelectValue placeholder="Select align self" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">auto</SelectItem>
              <SelectItem value="flex-start">flex-start</SelectItem>
              <SelectItem value="flex-end">flex-end</SelectItem>
              <SelectItem value="center">center</SelectItem>
              <SelectItem value="baseline">baseline</SelectItem>
              <SelectItem value="stretch">stretch</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="itemWidth">Width</Label>
            <Input
              id="itemWidth"
              type="text"
              value={item.width || ""}
              onChange={(e) => onUpdateItem({ width: e.target.value })}
              placeholder="e.g., 100px, 50%"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="itemHeight">Height</Label>
            <Input
              id="itemHeight"
              type="text"
              value={item.height || ""}
              onChange={(e) => onUpdateItem({ height: e.target.value })}
              placeholder="e.g., 100px, auto"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="margin">Margin</Label>
          <Input
            id="margin"
            type="text"
            value={item.margin || ""}
            onChange={(e) => onUpdateItem({ margin: e.target.value })}
            placeholder="e.g., 10px, 1rem 2rem"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="padding">Padding</Label>
          <Input
            id="padding"
            type="text"
            value={item.padding || ""}
            onChange={(e) => onUpdateItem({ padding: e.target.value })}
            placeholder="e.g., 10px, 1rem 2rem"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="itemBgColor">Background Color</Label>
          <div className="flex gap-2">
            <Input
              id="itemBgColor"
              type="text"
              value={item.backgroundColor}
              onChange={(e) =>
                onUpdateItem({ backgroundColor: e.target.value })
              }
              placeholder="e.g., #f5f5f5, lightgray"
              className="flex-1"
            />
            <Input
              type="color"
              value={item.backgroundColor}
              onChange={(e) =>
                onUpdateItem({ backgroundColor: e.target.value })
              }
              className="w-12 p-1 h-10"
            />
          </div>
        </div>
      </div>
    </Card>
  );
};
