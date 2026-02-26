import { FC, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { useDrag, useDrop } from "react-dnd";
import { FlexContainerProps, FlexItemProps } from "./types";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Smartphone, Tablet, Monitor } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

// FlexItem component with drag and resize functionality
interface FlexItemComponentProps {
  item: FlexItemProps;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onResize: (width: string, height: string) => void;
  onMove: (id: string, index: number) => void;
  showDimensions: boolean;
}

type DragItem = {
  id: string;
  index: number;
  type: string;
};

const FlexItem: FC<FlexItemComponentProps> = ({
  item,
  index,
  isSelected,
  onSelect,
  onMove,
  showDimensions,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [{ isDragging }, drag] = useDrag({
    type: "FLEX_ITEM",
    item: { id: item.id, index } as DragItem,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: "FLEX_ITEM",
    hover(item: DragItem) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Move the item
      onMove(item.id, hoverIndex);

      // Update the index for the dragged item
      item.index = hoverIndex;
    },
  });

  // Apply drag and drop to the same ref
  drag(drop(ref));

  const itemStyle: React.CSSProperties = {
    order: item.order,
    flexGrow: item.flexGrow,
    flexShrink: item.flexShrink,
    flexBasis: item.flexBasis,
    alignSelf: item.alignSelf,
    width: item.width,
    height: item.height,
    margin: item.margin,
    padding: item.padding,
    backgroundColor: item.backgroundColor,
    opacity: isDragging ? 0.5 : 1,
    cursor: "move",
    border: isSelected ? "2px solid #0284c7" : "1px solid #d1d5db",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    transition: "all 0.2s ease",
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();
  };

  return (
    <div
      ref={ref}
      className="flex-item"
      style={itemStyle}
      onClick={handleMouseDown}
      data-item-id={item.id}
    >
      <span className="text-xs opacity-75">Item {index + 1}</span>
      {showDimensions && (
        <div className="absolute bottom-0 right-0 text-xs bg-black/50 text-white px-1 rounded">
          {item.width || "auto"} × {item.height || "auto"}
        </div>
      )}
    </div>
  );
};

interface FlexboxCanvasProps {
  container: FlexContainerProps;
  items: FlexItemProps[];
  selectedItemId: string | null;
  onSelectItem: (id: string) => void;
  onItemResize: (id: string, width: string, height: string) => void;
  onItemMove: (id: string, newIndex: number) => void;
}

export const FlexboxCanvas: FC<FlexboxCanvasProps> = ({
  container,
  items,
  selectedItemId,
  onSelectItem,
  onItemResize,
  onItemMove,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewportSize, setViewportSize] = useState<
    "desktop" | "tablet" | "mobile"
  >("desktop");
  const [showGrid, setShowGrid] = useState(false);
  const [showDimensions, setShowDimensions] = useState(true);

  // Apply container styles dynamically
  const containerStyle: React.CSSProperties = {
    display: container.display,
    flexDirection: container.flexDirection,
    flexWrap: container.flexWrap,
    justifyContent: container.justifyContent,
    alignItems: container.alignItems,
    alignContent: container.alignContent,
    gap: container.gap,
    rowGap: container.rowGap,
    columnGap: container.columnGap,
    padding: container.padding || "1rem",
    backgroundColor: container.backgroundColor,
    width: container.width,
    height: container.height,
    minHeight: "300px",
    position: "relative",
    border: "1px dashed #9ca3af",
    borderRadius: "0.375rem",
    transition: "all 0.3s ease",
  };

  // Responsive preview styles
  const viewportStyles: Record<string, React.CSSProperties> = {
    desktop: { maxWidth: "100%", margin: "0 auto" },
    tablet: { maxWidth: "768px", margin: "0 auto" },
    mobile: { maxWidth: "375px", margin: "0 auto" },
  };

  // Clear selection when clicking on the container background
  const handleContainerClick = (e: React.MouseEvent) => {
    if (e.target === containerRef.current) {
      onSelectItem("");
    }
  };

  return (
    <Card className="p-4">
      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-lg font-medium">Visual Editor</h3>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="showDimensions"
              checked={showDimensions}
              onCheckedChange={setShowDimensions}
            />
            <Label htmlFor="showDimensions" className="text-sm">
              Dimensions
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="showGrid"
              checked={showGrid}
              onCheckedChange={setShowGrid}
            />
            <Label htmlFor="showGrid" className="text-sm">
              Grid
            </Label>
          </div>
          <Separator orientation="vertical" className="h-6" />
          <ToggleGroup
            type="single"
            value={viewportSize}
            onValueChange={(value) =>
              value && setViewportSize(value as "desktop" | "tablet" | "mobile")
            }
          >
            <ToggleGroupItem value="mobile" aria-label="Mobile View">
              <Smartphone className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="tablet" aria-label="Tablet View">
              <Tablet className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="desktop" aria-label="Desktop View">
              <Monitor className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      <div
        className="transition-all duration-300 ease-in-out"
        style={viewportStyles[viewportSize]}
      >
        <div
          ref={containerRef}
          className="flex-container relative"
          style={containerStyle}
          onClick={handleContainerClick}
        >
          {showGrid && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="w-full h-full bg-grid-pattern opacity-5"></div>
            </div>
          )}
          {items.map((item, index) => (
            <FlexItem
              key={item.id}
              item={item}
              index={index}
              isSelected={selectedItemId === item.id}
              onSelect={() => onSelectItem(item.id)}
              onResize={(width, height) => onItemResize(item.id, width, height)}
              onMove={onItemMove}
              showDimensions={showDimensions}
            />
          ))}
        </div>
      </div>

      <div className="mt-2 text-xs text-muted-foreground text-center">
        {viewportSize === "mobile"
          ? "Mobile (375px)"
          : viewportSize === "tablet"
          ? "Tablet (768px)"
          : "Desktop (Full Width)"}
      </div>
    </Card>
  );
};
