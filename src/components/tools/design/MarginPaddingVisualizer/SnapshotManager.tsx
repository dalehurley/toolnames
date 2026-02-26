import React, { useState } from "react";
import { useSpacing } from "./SpacingContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { format } from "date-fns";
import { Save, Upload, Trash2, Clock } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SpacingSnapshot } from "./types";

const SnapshotManager: React.FC = () => {
  const spacing = useSpacing();
  const [newSnapshotName, setNewSnapshotName] = useState("");
  const [newSnapshotDescription, setNewSnapshotDescription] = useState("");
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);

  const handleSaveSnapshot = () => {
    spacing.saveSnapshot(newSnapshotName, newSnapshotDescription);
    setNewSnapshotName("");
    setNewSnapshotDescription("");
    setSaveDialogOpen(false);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy h:mm a");
    } catch {
      return "Unknown date";
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">Snapshots</h2>

        <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="flex items-center">
              <Save className="h-4 w-4 mr-2" />
              Save Current
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save Current Configuration</DialogTitle>
              <DialogDescription>
                Save your current spacing configuration for future use.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="snapshot-name">Name</Label>
                <Input
                  id="snapshot-name"
                  placeholder="My spacing configuration"
                  value={newSnapshotName}
                  onChange={(e) => setNewSnapshotName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="snapshot-description">
                  Description (optional)
                </Label>
                <Textarea
                  id="snapshot-description"
                  placeholder="A brief description of this configuration"
                  value={newSnapshotDescription}
                  onChange={(e) => setNewSnapshotDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setSaveDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveSnapshot}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {spacing.snapshots.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <Clock className="h-12 w-12 mx-auto opacity-20 mb-2" />
          <p>No snapshots saved yet.</p>
          <p className="text-sm mt-1">
            Save your current configuration to quickly access it later.
          </p>
        </div>
      ) : (
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-3">
            {spacing.snapshots.map((snapshot: SpacingSnapshot) => (
              <Card
                key={snapshot.id}
                className="p-4 border hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{snapshot.name}</h3>
                    <p className="text-xs text-slate-500 flex items-center mt-1">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDate(snapshot.date)}
                    </p>
                    {snapshot.description && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                        {snapshot.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => spacing.loadSnapshot(snapshot.id)}
                          >
                            <Upload className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Load this snapshot</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Snapshot</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{snapshot.name}"?
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => spacing.deleteSnapshot(snapshot.id)}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                <div className="mt-3 p-2 bg-slate-50 dark:bg-slate-800 rounded text-xs grid grid-cols-2 gap-x-4 gap-y-1">
                  <div className="flex justify-between">
                    <span>Margin:</span>
                    <span className="font-mono">
                      {snapshot.state.marginTop || 0}
                      {snapshot.state.unit}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Padding:</span>
                    <span className="font-mono">
                      {snapshot.state.paddingTop || 0}
                      {snapshot.state.unit}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Border:</span>
                    <span className="font-mono">
                      {snapshot.state.borderWidth || 0}
                      {snapshot.state.unit}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Scale:</span>
                    <span className="font-mono">
                      {snapshot.state.scaleType || "linear"}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
    </Card>
  );
};

export default SnapshotManager;
