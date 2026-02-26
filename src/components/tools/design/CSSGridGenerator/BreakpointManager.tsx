import { FC, useState } from "react";
import { GridState, Breakpoint, BreakpointDefinition } from "./types";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Trash2,
  Laptop,
  Smartphone,
  Monitor,
  Plus as PlusIcon,
  Settings,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface BreakpointManagerProps {
  breakpoints: Breakpoint[];
  activeBreakpoint: string;
  gridState: GridState;
  onSetActiveBreakpoint: (id: string) => void;
  onUpdateBreakpointGridState: (
    breakpointId: string,
    newState: Partial<GridState>
  ) => void;
  onAddBreakpoint: (breakpoint: BreakpointDefinition) => void;
  onRemoveBreakpoint: (breakpointId: string) => void;
}

export const BreakpointManager: FC<BreakpointManagerProps> = ({
  breakpoints,
  activeBreakpoint,
  gridState,
  onSetActiveBreakpoint,
  onAddBreakpoint,
  onRemoveBreakpoint,
}) => {
  const [showAddBreakpointDialog, setShowAddBreakpointDialog] = useState(false);
  const [newBreakpointName, setNewBreakpointName] = useState("");
  const [newBreakpointWidth, setNewBreakpointWidth] = useState(768);

  // Sort breakpoints by minWidth for display
  const sortedBreakpoints = [...breakpoints].sort(
    (a, b) => a.minWidth - b.minWidth
  );

  // Get the active breakpoint's preview frame width
  const activeBreakpointWidth =
    breakpoints.find((bp) => bp.id === activeBreakpoint)?.minWidth || 1024;

  // Handle adding a new breakpoint
  const handleAddBreakpoint = () => {
    if (!newBreakpointName.trim()) {
      toast.error("Please enter a breakpoint name");
      return;
    }

    if (newBreakpointWidth <= 0) {
      toast.error("Width must be greater than 0");
      return;
    }

    // Check for duplicate names
    if (
      breakpoints.some(
        (bp) => bp.name.toLowerCase() === newBreakpointName.toLowerCase()
      )
    ) {
      toast.error("A breakpoint with this name already exists");
      return;
    }

    // Check for duplicate widths
    if (breakpoints.some((bp) => bp.minWidth === newBreakpointWidth)) {
      toast.error("A breakpoint with this width already exists");
      return;
    }

    // Create the new breakpoint
    onAddBreakpoint({
      id: newBreakpointName.toLowerCase().replace(/\s+/g, "-"),
      name: newBreakpointName,
      minWidth: newBreakpointWidth,
    });

    // Reset the form and close dialog
    setNewBreakpointName("");
    setNewBreakpointWidth(768);
    setShowAddBreakpointDialog(false);

    toast.success(`Added breakpoint: ${newBreakpointName}`);
  };

  // Get icon for breakpoint
  const getBreakpointIcon = (width: number) => {
    if (width < 640) return <Smartphone className="h-4 w-4" />;
    if (width < 1024) return <Laptop className="h-4 w-4" />;
    return <Monitor className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold">Responsive Breakpoints</h3>
          <p className="text-sm text-gray-500">
            Manage how your grid responds at different screen sizes
          </p>
        </div>

        <Dialog
          open={showAddBreakpointDialog}
          onOpenChange={setShowAddBreakpointDialog}
        >
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="h-9">
              <PlusIcon className="h-4 w-4 mr-1" />
              <span>Add Breakpoint</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Breakpoint</DialogTitle>
              <DialogDescription>
                Define a new responsive breakpoint for your grid
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="breakpoint-name">Breakpoint Name</Label>
                <Input
                  id="breakpoint-name"
                  placeholder="e.g., Tablet, Large Mobile"
                  value={newBreakpointName}
                  onChange={(e) => setNewBreakpointName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="breakpoint-width">Min Width (px)</Label>
                <Input
                  id="breakpoint-width"
                  type="number"
                  min={1}
                  placeholder="e.g., 768"
                  value={newBreakpointWidth}
                  onChange={(e) =>
                    setNewBreakpointWidth(parseInt(e.target.value) || 0)
                  }
                />
                <p className="text-xs text-gray-500 mt-1">
                  This breakpoint will apply to screens with at least this width
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowAddBreakpointDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleAddBreakpoint}>Add Breakpoint</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-4">
        <div className="mb-4">
          <h4 className="text-sm font-semibold mb-2">Select Breakpoint</h4>
          <div className="flex flex-wrap gap-2">
            {sortedBreakpoints.map((bp) => (
              <Button
                key={bp.id}
                variant={activeBreakpoint === bp.id ? "default" : "outline"}
                size="sm"
                className="h-9"
                onClick={() => onSetActiveBreakpoint(bp.id)}
              >
                {getBreakpointIcon(bp.minWidth)}
                <span className="ml-1">{bp.name}</span>
                <span className="text-xs ml-1.5 opacity-70">
                  {bp.minWidth}px+
                </span>
              </Button>
            ))}
          </div>
        </div>

        <div className="border-t pt-4">
          <h4 className="text-sm font-semibold mb-2">Breakpoint Preview</h4>

          <div className="flex justify-center items-center border rounded-md p-4 bg-gray-50 dark:bg-gray-900 overflow-auto">
            <div
              className="border border-blue-500 rounded-md bg-white dark:bg-gray-800 transition-all duration-300 flex flex-col items-center justify-center p-4 overflow-hidden"
              style={{
                width: `${Math.min(activeBreakpointWidth, 1200)}px`,
                maxWidth: "100%",
                height: "400px",
              }}
            >
              <div className="text-sm font-medium mb-2">
                {breakpoints.find((bp) => bp.id === activeBreakpoint)?.name}{" "}
                View
              </div>

              <div className="w-full h-full flex-1 overflow-hidden">
                <div
                  className="grid h-full w-full border border-dashed border-gray-300 dark:border-gray-700 rounded"
                  style={{
                    gridTemplateColumns: gridState.columns
                      .map((col) => col.size)
                      .join(" "),
                    gridTemplateRows: gridState.rows
                      .map((row) => row.size)
                      .join(" "),
                    gap: `${gridState.gaps.row} ${gridState.gaps.column}`,
                  }}
                >
                  {/* Grid preview cells */}
                  {gridState.areas.map((area) => (
                    <div
                      key={area.id}
                      style={{
                        gridRowStart: area.startRow + 1,
                        gridRowEnd: area.endRow + 1,
                        gridColumnStart: area.startColumn + 1,
                        gridColumnEnd: area.endColumn + 1,
                        backgroundColor: "rgba(99, 102, 241, 0.1)",
                        border: "1px solid rgba(99, 102, 241, 0.5)",
                        borderRadius: "0.25rem",
                        padding: "0.5rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.75rem",
                      }}
                    >
                      {area.name}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Current width:{" "}
              <span className="font-medium">{activeBreakpointWidth}px+</span>
            </div>

            {activeBreakpoint !== "desktop" && (
              <Button
                variant="outline"
                size="sm"
                className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                onClick={() => {
                  onRemoveBreakpoint(activeBreakpoint);
                  toast.success("Breakpoint removed");
                }}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                <span>Remove Breakpoint</span>
              </Button>
            )}
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="mb-4">
          <h4 className="text-sm font-semibold">Responsive Behavior</h4>
          <p className="text-xs text-gray-500 mt-1">
            Changes made to a breakpoint will only apply at that breakpoint.
            Each breakpoint inherits from larger breakpoints unless overridden.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          {sortedBreakpoints.map((bp) => (
            <div
              key={bp.id}
              className="flex items-center p-2 border rounded-md"
            >
              <div className="mr-2">{getBreakpointIcon(bp.minWidth)}</div>
              <div className="flex-1">
                <div className="font-medium text-sm">{bp.name}</div>
                <div className="text-xs text-gray-500">
                  Min width: {bp.minWidth}px
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSetActiveBreakpoint(bp.id)}
                className="ml-auto"
              >
                <Settings className="h-4 w-4 mr-1" />
                <span className="sr-only">Configure</span>
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
