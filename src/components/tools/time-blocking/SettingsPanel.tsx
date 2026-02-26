import React, { useEffect, useState } from "react";
import { UserSettings, EnergyPattern } from "@/contexts/TimeBlockingContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings2, Battery, Bell } from "lucide-react";

interface SettingsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: UserSettings;
  energyPattern: EnergyPattern;
  onSettingsUpdate: (settings: Partial<UserSettings>) => void;
  onEnergyPatternUpdate: (pattern: EnergyPattern) => void;
}

const timeOptions = [
  "00:00",
  "00:30",
  "01:00",
  "01:30",
  "02:00",
  "02:30",
  "03:00",
  "03:30",
  "04:00",
  "04:30",
  "05:00",
  "05:30",
  "06:00",
  "06:30",
  "07:00",
  "07:30",
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
  "19:30",
  "20:00",
  "20:30",
  "21:00",
  "21:30",
  "22:00",
  "22:30",
  "23:00",
  "23:30",
];

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  open,
  onOpenChange,
  settings,
  energyPattern,
  onSettingsUpdate,
  onEnergyPatternUpdate,
}) => {
  const [localSettings, setLocalSettings] = useState<UserSettings>(settings);
  const [localEnergyPattern, setLocalEnergyPattern] =
    useState<EnergyPattern>(energyPattern);
  const [activeTab, setActiveTab] = useState("general");

  // Update local state when props change
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  useEffect(() => {
    setLocalEnergyPattern(energyPattern);
  }, [energyPattern]);

  const handleSave = () => {
    onSettingsUpdate(localSettings);
    onEnergyPatternUpdate(localEnergyPattern);
    onOpenChange(false);
  };

  const updateEnergyLevel = (time: string, level: number) => {
    const updatedTimePoints = localEnergyPattern.timePoints.map((point) => {
      if (point.time === time) {
        return { ...point, level };
      }
      return point;
    });

    setLocalEnergyPattern({
      ...localEnergyPattern,
      timePoints: updatedTimePoints,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Settings2 className="mr-2 h-5 w-5" />
            Calendar Settings
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="energy">Energy Levels</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="pt-4 pb-2">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dayStartTime">Day Start Time</Label>
                  <Select
                    value={localSettings.dayStartTime}
                    onValueChange={(value) =>
                      setLocalSettings({
                        ...localSettings,
                        dayStartTime: value,
                      })
                    }
                  >
                    <SelectTrigger id="dayStartTime">
                      <SelectValue placeholder="Select start time" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeOptions.map((time) => (
                        <SelectItem key={`start-${time}`} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dayEndTime">Day End Time</Label>
                  <Select
                    value={localSettings.dayEndTime}
                    onValueChange={(value) =>
                      setLocalSettings({
                        ...localSettings,
                        dayEndTime: value,
                      })
                    }
                  >
                    <SelectTrigger id="dayEndTime">
                      <SelectValue placeholder="Select end time" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeOptions.map((time) => (
                        <SelectItem key={`end-${time}`} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeIncrement">Time Increment</Label>
                <Select
                  value={localSettings.timeIncrement.toString()}
                  onValueChange={(value) =>
                    setLocalSettings({
                      ...localSettings,
                      timeIncrement: parseInt(value) as 5 | 15 | 30 | 60,
                    })
                  }
                >
                  <SelectTrigger id="timeIncrement">
                    <SelectValue placeholder="Select time increment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 minutes</SelectItem>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">60 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="defaultView">Default View</Label>
                <Select
                  value={localSettings.defaultView}
                  onValueChange={(value) =>
                    setLocalSettings({
                      ...localSettings,
                      defaultView: value as "day" | "week" | "month",
                    })
                  }
                >
                  <SelectTrigger id="defaultView">
                    <SelectValue placeholder="Select default view" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Day</SelectItem>
                    <SelectItem value="week">Week</SelectItem>
                    <SelectItem value="month">Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <div className="flex-1">
                  <Label
                    htmlFor="showEnergyLevel"
                    className="flex items-center cursor-pointer"
                  >
                    <Battery className="mr-2 h-4 w-4" />
                    Show Energy Level Overlay
                  </Label>
                  <div className="text-sm text-gray-500 mt-1">
                    Displays your energy pattern as a curve on the timeline
                  </div>
                </div>
                <Switch
                  id="showEnergyLevel"
                  checked={localSettings.showEnergyLevel}
                  onCheckedChange={(checked) =>
                    setLocalSettings({
                      ...localSettings,
                      showEnergyLevel: checked,
                    })
                  }
                />
              </div>

              <div className="flex items-center space-x-2">
                <div className="flex-1">
                  <Label
                    htmlFor="enableNotifications"
                    className="flex items-center cursor-pointer"
                  >
                    <Bell className="mr-2 h-4 w-4" />
                    Enable Block Notifications
                  </Label>
                  <div className="text-sm text-gray-500 mt-1">
                    Receive notifications when a block is about to start
                  </div>
                </div>
                <Switch
                  id="enableNotifications"
                  checked={localSettings.enableNotifications}
                  onCheckedChange={(checked) =>
                    setLocalSettings({
                      ...localSettings,
                      enableNotifications: checked,
                    })
                  }
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="energy" className="pt-4 pb-2">
            <div className="space-y-4">
              <div className="text-sm text-gray-500">
                Set your typical energy levels throughout the day. This helps
                optimize task scheduling based on when you're most productive.
              </div>

              <div className="h-40 relative mb-8">
                <svg width="100%" height="100%" className="energy-chart">
                  {/* Background grid */}
                  <line
                    x1="0"
                    y1="0"
                    x2="100%"
                    y2="0"
                    stroke="#eee"
                    strokeWidth="1"
                  />
                  <line
                    x1="0"
                    y1="25%"
                    x2="100%"
                    y2="25%"
                    stroke="#eee"
                    strokeWidth="1"
                  />
                  <line
                    x1="0"
                    y1="50%"
                    x2="100%"
                    y2="50%"
                    stroke="#eee"
                    strokeWidth="1"
                  />
                  <line
                    x1="0"
                    y1="75%"
                    x2="100%"
                    y2="75%"
                    stroke="#eee"
                    strokeWidth="1"
                  />
                  <line
                    x1="0"
                    y1="100%"
                    x2="100%"
                    y2="100%"
                    stroke="#eee"
                    strokeWidth="1"
                  />

                  {/* Energy curve */}
                  {localEnergyPattern.timePoints.length > 1 && (
                    <polyline
                      points={localEnergyPattern.timePoints
                        .map((point, index) => {
                          const x =
                            (index /
                              (localEnergyPattern.timePoints.length - 1)) *
                            100;
                          const y = 100 - ((point.level - 1) / 4) * 100;
                          return `${x},${y}`;
                        })
                        .join(" ")}
                      fill="none"
                      stroke="url(#energyGradient)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}

                  <defs>
                    <linearGradient
                      id="energyGradient"
                      x1="0"
                      y1="1"
                      x2="0"
                      y2="0"
                    >
                      <stop offset="0%" stopColor="#ef4444" />
                      <stop offset="50%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                  </defs>

                  {/* Energy level points */}
                  {localEnergyPattern.timePoints.map((point, index) => {
                    const x =
                      (index / (localEnergyPattern.timePoints.length - 1)) *
                      100;
                    const y = 100 - ((point.level - 1) / 4) * 100;
                    return (
                      <circle
                        key={point.time}
                        cx={`${x}%`}
                        cy={`${y}%`}
                        r="6"
                        fill="white"
                        stroke="url(#energyGradient)"
                        strokeWidth="2"
                      />
                    );
                  })}
                </svg>

                <div className="absolute left-0 text-xs text-gray-500">Low</div>
                <div className="absolute right-0 text-xs text-gray-500">
                  High
                </div>
              </div>

              <div className="space-y-3">
                {localEnergyPattern.timePoints.map((point) => (
                  <div key={point.time} className="flex items-center space-x-4">
                    <div className="w-16 text-sm">{point.time}</div>
                    <div className="flex-1">
                      <input
                        type="range"
                        min="1"
                        max="5"
                        value={point.level}
                        onChange={(e) =>
                          updateEnergyLevel(
                            point.time,
                            parseInt(e.target.value)
                          )
                        }
                        className="w-full"
                      />
                    </div>
                    <div className="w-16 text-sm text-gray-500">
                      {point.level === 1 && "Very Low"}
                      {point.level === 2 && "Low"}
                      {point.level === 3 && "Medium"}
                      {point.level === 4 && "High"}
                      {point.level === 5 && "Very High"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsPanel;
