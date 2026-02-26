import { ChangeEvent } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { PomodoroSettings } from "./usePomodoro";

interface SettingsProps {
  settings: PomodoroSettings;
  updateSettings: (newSettings: Partial<PomodoroSettings>) => void;
}

export const Settings = ({ settings, updateSettings }: SettingsProps) => {
  // Handle numeric input changes
  const handleNumericChange = (
    e: ChangeEvent<HTMLInputElement>,
    key: keyof PomodoroSettings
  ) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0) {
      updateSettings({ [key]: value });
    }
  };

  // Handle switch changes
  const handleSwitchChange = (
    checked: boolean,
    key: keyof PomodoroSettings
  ) => {
    updateSettings({ [key]: checked });
  };

  return (
    <Card className="border-none shadow-none">
      <CardContent className="p-0 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Duration Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Timer Durations</h3>

            <div className="space-y-2">
              <Label htmlFor="workDuration">Work Session (minutes)</Label>
              <Input
                id="workDuration"
                type="number"
                min="1"
                max="60"
                value={settings.workDuration}
                onChange={(e) => handleNumericChange(e, "workDuration")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shortBreakDuration">Short Break (minutes)</Label>
              <Input
                id="shortBreakDuration"
                type="number"
                min="1"
                max="30"
                value={settings.shortBreakDuration}
                onChange={(e) => handleNumericChange(e, "shortBreakDuration")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="longBreakDuration">Long Break (minutes)</Label>
              <Input
                id="longBreakDuration"
                type="number"
                min="1"
                max="60"
                value={settings.longBreakDuration}
                onChange={(e) => handleNumericChange(e, "longBreakDuration")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sessionsUntilLongBreak">
                Work Sessions Before Long Break
              </Label>
              <Input
                id="sessionsUntilLongBreak"
                type="number"
                min="1"
                max="10"
                value={settings.sessionsUntilLongBreak}
                onChange={(e) =>
                  handleNumericChange(e, "sessionsUntilLongBreak")
                }
              />
            </div>
          </div>

          {/* Behavior Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Behavior</h3>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="autoStartBreaks">Auto-start Breaks</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically start break timer when work session ends
                </p>
              </div>
              <Switch
                id="autoStartBreaks"
                checked={settings.autoStartBreaks}
                onCheckedChange={(checked) =>
                  handleSwitchChange(checked, "autoStartBreaks")
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="autoStartWork">Auto-start Work</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically start work timer when break ends
                </p>
              </div>
              <Switch
                id="autoStartWork"
                checked={settings.autoStartWork}
                onCheckedChange={(checked) =>
                  handleSwitchChange(checked, "autoStartWork")
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="soundEnabled">Sound Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Play a sound when timer completes
                </p>
              </div>
              <Switch
                id="soundEnabled"
                checked={settings.soundEnabled}
                onCheckedChange={(checked) =>
                  handleSwitchChange(checked, "soundEnabled")
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notificationsEnabled">
                  Browser Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Show browser notifications when timer completes
                </p>
              </div>
              <Switch
                id="notificationsEnabled"
                checked={settings.notificationsEnabled}
                onCheckedChange={(checked) =>
                  handleSwitchChange(checked, "notificationsEnabled")
                }
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
