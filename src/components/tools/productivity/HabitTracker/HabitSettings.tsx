import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useHabits } from "@/contexts/HabitContext";
import {
  Download,
  Upload,
  Trash,
  AlertTriangle,
  FileJson,
  Info,
  Medal,
  RefreshCw,
} from "lucide-react";

const HabitSettings: React.FC = () => {
  const {
    habits,
    entries,
    achievements,
    exportData,
    importData,
    recalculateAllAchievements,
  } = useHabits();

  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const [achievementSuccess, setAchievementSuccess] = useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Handle export data
  const handleExport = () => {
    const jsonData = exportData();
    const dataBlob = new Blob([jsonData], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `habit-tracker-export-${
      new Date().toISOString().split("T")[0]
    }.json`;
    link.click();

    URL.revokeObjectURL(url);
  };

  // Handle import button click
  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle file selection for import
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const fileData = e.target?.result as string;
        const success = importData(fileData);

        if (success) {
          setImportSuccess(true);
          setImportError(null);
        } else {
          setImportError(
            "Failed to import data. The file format might be invalid."
          );
        }
      } catch {
        setImportError("An error occurred while reading the file.");
      }

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Clear success message after a delay
      if (importSuccess) {
        setTimeout(() => setImportSuccess(false), 3000);
      }
    };

    reader.onerror = () => {
      setImportError("An error occurred while reading the file.");
    };

    reader.readAsText(file);
  };

  // Force check for achievements
  const handleCheckAchievements = () => {
    const foundNew = recalculateAllAchievements();
    setAchievementSuccess(true);

    // Clear success message after a delay
    setTimeout(() => setAchievementSuccess(false), 3000);

    return foundNew;
  };

  // Calculate stats for the data summary
  const totalHabits = habits.length;
  const activeHabits = habits.filter((h) => !h.archivedAt).length;
  const totalEntries = Object.values(entries).reduce(
    (sum, habitEntries) => sum + habitEntries.length,
    0
  );
  const completedEntries = Object.values(entries).reduce(
    (sum, habitEntries) =>
      sum + habitEntries.filter((entry) => entry.completed).length,
    0
  );
  const totalAchievements = achievements.length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Settings & Data Management</CardTitle>
          <CardDescription>
            Manage your habit tracking data and application settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Data Summary */}
          <div className="rounded-lg border p-4">
            <h3 className="text-lg font-medium mb-3 flex items-center">
              <Info className="h-5 w-5 mr-2 text-blue-500" />
              Data Summary
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Total Habits</p>
                <p className="font-medium text-lg">{totalHabits}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Active Habits</p>
                <p className="font-medium text-lg">{activeHabits}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Total Entries</p>
                <p className="font-medium text-lg">{totalEntries}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Completed Entries</p>
                <p className="font-medium text-lg">{completedEntries}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Achievements</p>
                <p className="font-medium text-lg">{totalAchievements}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Completion Rate</p>
                <p className="font-medium text-lg">
                  {totalEntries > 0
                    ? `${Math.round((completedEntries / totalEntries) * 100)}%`
                    : "0%"}
                </p>
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className="rounded-lg border p-4">
            <h3 className="text-lg font-medium mb-3 flex items-center">
              <Medal className="h-5 w-5 mr-2 text-amber-500" />
              Achievements
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Manage your achievements and milestones.
            </p>

            {achievementSuccess && (
              <div className="mb-4 p-3 rounded-md bg-green-500/10 text-green-600 dark:text-green-400 text-sm flex items-start">
                <Info className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>Checked for achievements!</span>
              </div>
            )}

            <Button
              variant="outline"
              onClick={handleCheckAchievements}
              className="flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Force Check Achievements
            </Button>
          </div>

          {/* Import/Export */}
          <div className="rounded-lg border p-4">
            <h3 className="text-lg font-medium mb-3 flex items-center">
              <FileJson className="h-5 w-5 mr-2 text-emerald-500" />
              Import & Export Data
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Backup your habit tracking data or restore from a previous backup.
            </p>

            {importError && (
              <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm flex items-start">
                <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>{importError}</span>
              </div>
            )}

            {importSuccess && (
              <div className="mb-4 p-3 rounded-md bg-green-500/10 text-green-600 dark:text-green-400 text-sm flex items-start">
                <Info className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>Data imported successfully!</span>
              </div>
            )}

            <div className="flex flex-wrap gap-4">
              <Button onClick={handleExport} className="flex items-center">
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>

              <Button
                variant="outline"
                onClick={handleImportClick}
                className="flex items-center"
              >
                <Upload className="h-4 w-4 mr-2" />
                Import Data
              </Button>

              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".json"
                onChange={handleFileChange}
              />
            </div>
          </div>

          {/* Reset Data */}
          <div className="rounded-lg border p-4 border-destructive/20">
            <h3 className="text-lg font-medium mb-3 flex items-center text-destructive">
              <Trash className="h-5 w-5 mr-2" />
              Reset Data
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Delete all habits, entries, and achievements. This action cannot
              be undone.
            </p>

            <Button
              variant="destructive"
              onClick={() => setIsResetConfirmOpen(true)}
              className="flex items-center"
            >
              <Trash className="h-4 w-4 mr-2" />
              Reset All Data
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog
        open={isResetConfirmOpen}
        onOpenChange={setIsResetConfirmOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all your habits, tracking data, and
              achievements. This action cannot be undone and your data will be
              lost forever.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => {
                // Reset all data (this would need to be implemented in the context)
                // resetAllData();
                setIsResetConfirmOpen(false);
              }}
            >
              Reset All Data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default HabitSettings;
