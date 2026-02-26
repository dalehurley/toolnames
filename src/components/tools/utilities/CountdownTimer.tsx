import React, { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Plus,
  X,
  Clock,
  ChefHat,
  BookOpen,
  Dumbbell,
  Coffee,
  Timer,
} from "lucide-react";

interface CountdownState {
  id: string;
  label: string;
  totalSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
  isCompleted: boolean;
  color: string;
}

interface PresetTimer {
  label: string;
  minutes: number;
  seconds?: number;
  icon: React.ReactNode;
  color: string;
  category: string;
}

const PRESET_TIMERS: PresetTimer[] = [
  // Quick presets
  {
    label: "1 Minute",
    minutes: 1,
    icon: <Timer className="h-4 w-4" />,
    color: "bg-blue-500",
    category: "quick",
  },
  {
    label: "5 Minutes",
    minutes: 5,
    icon: <Timer className="h-4 w-4" />,
    color: "bg-green-500",
    category: "quick",
  },
  {
    label: "10 Minutes",
    minutes: 10,
    icon: <Timer className="h-4 w-4" />,
    color: "bg-yellow-500",
    category: "quick",
  },
  {
    label: "15 Minutes",
    minutes: 15,
    icon: <Timer className="h-4 w-4" />,
    color: "bg-orange-500",
    category: "quick",
  },
  {
    label: "30 Minutes",
    minutes: 30,
    icon: <Timer className="h-4 w-4" />,
    color: "bg-red-500",
    category: "quick",
  },
  {
    label: "1 Hour",
    minutes: 60,
    icon: <Timer className="h-4 w-4" />,
    color: "bg-purple-500",
    category: "quick",
  },

  // Cooking presets
  {
    label: "Soft Boiled Egg",
    minutes: 4,
    icon: <ChefHat className="h-4 w-4" />,
    color: "bg-amber-500",
    category: "cooking",
  },
  {
    label: "Hard Boiled Egg",
    minutes: 8,
    icon: <ChefHat className="h-4 w-4" />,
    color: "bg-amber-600",
    category: "cooking",
  },
  {
    label: "Perfect Tea",
    minutes: 3,
    icon: <Coffee className="h-4 w-4" />,
    color: "bg-green-600",
    category: "cooking",
  },
  {
    label: "Coffee Brew",
    minutes: 4,
    icon: <Coffee className="h-4 w-4" />,
    color: "bg-brown-600",
    category: "cooking",
  },
  {
    label: "Pizza",
    minutes: 12,
    icon: <ChefHat className="h-4 w-4" />,
    color: "bg-red-600",
    category: "cooking",
  },
  {
    label: "Pasta",
    minutes: 8,
    icon: <ChefHat className="h-4 w-4" />,
    color: "bg-yellow-600",
    category: "cooking",
  },

  // Study presets
  {
    label: "Pomodoro Focus",
    minutes: 25,
    icon: <BookOpen className="h-4 w-4" />,
    color: "bg-indigo-500",
    category: "study",
  },
  {
    label: "Short Break",
    minutes: 5,
    icon: <Coffee className="h-4 w-4" />,
    color: "bg-green-500",
    category: "study",
  },
  {
    label: "Long Break",
    minutes: 15,
    icon: <Coffee className="h-4 w-4" />,
    color: "bg-blue-500",
    category: "study",
  },
  {
    label: "Deep Work",
    minutes: 90,
    icon: <BookOpen className="h-4 w-4" />,
    color: "bg-purple-600",
    category: "study",
  },

  // Workout presets
  {
    label: "HIIT Round",
    minutes: 0,
    seconds: 30,
    icon: <Dumbbell className="h-4 w-4" />,
    color: "bg-red-500",
    category: "workout",
  },
  {
    label: "Rest Period",
    minutes: 1,
    icon: <Coffee className="h-4 w-4" />,
    color: "bg-blue-400",
    category: "workout",
  },
  {
    label: "Plank",
    minutes: 2,
    icon: <Dumbbell className="h-4 w-4" />,
    color: "bg-orange-500",
    category: "workout",
  },
  {
    label: "Cardio",
    minutes: 20,
    icon: <Dumbbell className="h-4 w-4" />,
    color: "bg-red-600",
    category: "workout",
  },
];

const SOUND_OPTIONS = [
  { id: "bell", name: "Bell", file: "/bell.mp3" },
  { id: "beep", name: "Beep", file: "/beep.wav" },
  { id: "chime", name: "Chime", file: "/chime.wav" },
  { id: "ding", name: "Ding", file: "/ding.wav" },
];

export function CountdownTimer() {
  const [timers, setTimers] = useState<CountdownState[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedSound, setSelectedSound] = useState("bell");
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // Custom timer inputs
  const [customHours, setCustomHours] = useState("");
  const [customMinutes, setCustomMinutes] = useState("");
  const [customSeconds, setCustomSeconds] = useState("");
  const [customLabel, setCustomLabel] = useState("");

  const intervalRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Request notification permission on mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().then((permission) => {
        setNotificationsEnabled(permission === "granted");
      });
    } else {
      setNotificationsEnabled(Notification.permission === "granted");
    }

    // Initialize audio
    audioRef.current = new Audio();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Timer tick function
  useEffect(() => {
    intervalRef.current = window.setInterval(() => {
      setTimers((prevTimers) => {
        return prevTimers.map((timer) => {
          if (timer.isRunning && timer.remainingSeconds > 0) {
            const newRemaining = timer.remainingSeconds - 1;

            if (newRemaining === 0) {
              // Timer completed
              handleTimerComplete(timer);
              return {
                ...timer,
                remainingSeconds: 0,
                isRunning: false,
                isCompleted: true,
              };
            }

            return {
              ...timer,
              remainingSeconds: newRemaining,
            };
          }
          return timer;
        });
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const handleTimerComplete = useCallback(
    (timer: CountdownState) => {
      // Play sound
      if (soundEnabled && audioRef.current) {
        const soundFile = SOUND_OPTIONS.find((s) => s.id === selectedSound);
        if (soundFile) {
          audioRef.current.src = soundFile.file;
          audioRef.current.play().catch(console.error);
        }
      }

      // Show notification
      if (notificationsEnabled && "Notification" in window) {
        new Notification(`Timer Completed: ${timer.label}`, {
          body: "Your countdown timer has finished!",
          icon: "/favicon.ico",
        });
      }
    },
    [soundEnabled, selectedSound, notificationsEnabled]
  );

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const calculateProgress = (timer: CountdownState): number => {
    return (
      ((timer.totalSeconds - timer.remainingSeconds) / timer.totalSeconds) * 100
    );
  };

  const createTimer = (
    label: string,
    totalSeconds: number,
    color: string = "bg-blue-500"
  ) => {
    const newTimer: CountdownState = {
      id: Date.now().toString(),
      label,
      totalSeconds,
      remainingSeconds: totalSeconds,
      isRunning: true,
      isCompleted: false,
      color,
    };

    setTimers((prev) => [...prev, newTimer]);
  };

  const createCustomTimer = () => {
    const hours = parseInt(customHours) || 0;
    const minutes = parseInt(customMinutes) || 0;
    const seconds = parseInt(customSeconds) || 0;
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;

    if (totalSeconds > 0) {
      const label =
        customLabel ||
        `${hours ? `${hours}h ` : ""}${minutes ? `${minutes}m ` : ""}${
          seconds ? `${seconds}s` : ""
        }`.trim();
      createTimer(label, totalSeconds, "bg-indigo-500");

      // Reset inputs
      setCustomHours("");
      setCustomMinutes("");
      setCustomSeconds("");
      setCustomLabel("");
    }
  };

  const toggleTimer = (id: string) => {
    setTimers((prev) =>
      prev.map((timer) =>
        timer.id === id
          ? { ...timer, isRunning: !timer.isRunning, isCompleted: false }
          : timer
      )
    );
  };

  const resetTimer = (id: string) => {
    setTimers((prev) =>
      prev.map((timer) =>
        timer.id === id
          ? {
              ...timer,
              remainingSeconds: timer.totalSeconds,
              isRunning: false,
              isCompleted: false,
            }
          : timer
      )
    );
  };

  const removeTimer = (id: string) => {
    setTimers((prev) => prev.filter((timer) => timer.id !== id));
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const groupedPresets = PRESET_TIMERS.reduce((acc, preset) => {
    if (!acc[preset.category]) {
      acc[preset.category] = [];
    }
    acc[preset.category].push(preset);
    return acc;
  }, {} as Record<string, PresetTimer[]>);

  if (isFullscreen && timers.length > 0) {
    const activeTimer = timers.find((t) => t.isRunning) || timers[0];

    return (
      <div className="fixed inset-0 bg-black text-white flex flex-col items-center justify-center z-50">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleFullscreen}
          className="absolute top-4 right-4 text-white hover:bg-white/20"
        >
          <Minimize2 className="h-5 w-5" />
        </Button>

        <div className="text-center">
          <h1 className="text-2xl mb-4 text-white/80">{activeTimer.label}</h1>

          <div className="relative w-80 h-80 mb-8">
            <svg
              className="w-full h-full transform -rotate-90"
              viewBox="0 0 120 120"
            >
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="8"
              />
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="white"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 50}`}
                strokeDashoffset={`${
                  2 * Math.PI * 50 * (1 - calculateProgress(activeTimer) / 100)
                }`}
                className="transition-all duration-1000 ease-in-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-6xl font-mono font-bold">
                {formatTime(activeTimer.remainingSeconds)}
              </span>
            </div>
          </div>

          <div className="flex space-x-4">
            <Button
              variant="outline"
              size="lg"
              onClick={() => toggleTimer(activeTimer.id)}
              className="text-white border-white hover:bg-white/20"
            >
              {activeTimer.isRunning ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6" />
              )}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => resetTimer(activeTimer.id)}
              className="text-white border-white hover:bg-white/20"
            >
              <RotateCcw className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Active Timers */}
      {timers.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Active Timers</h2>
          <div className="grid gap-4">
            {timers.map((timer) => (
              <Card
                key={timer.id}
                className={`${
                  timer.isCompleted ? "bg-green-50 border-green-200" : ""
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-3 h-3 rounded-full ${timer.color}`}
                      ></div>
                      <div>
                        <h3 className="font-medium">{timer.label}</h3>
                        <div className="text-2xl font-mono font-bold">
                          {formatTime(timer.remainingSeconds)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleTimer(timer.id)}
                        disabled={timer.isCompleted}
                      >
                        {timer.isRunning ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => resetTimer(timer.id)}
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeTimer(timer.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="mt-3">
                    <Progress
                      value={calculateProgress(timer)}
                      className="h-2"
                    />
                  </div>

                  {timer.isCompleted && (
                    <div className="mt-2 text-green-600 font-medium flex items-center">
                      <span className="animate-pulse">✓ Timer completed!</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Clock className="h-6 w-6 mr-2" />
              Countdown Timer
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSoundEnabled(!soundEnabled)}
              >
                {soundEnabled ? (
                  <Volume2 className="h-4 w-4" />
                ) : (
                  <VolumeX className="h-4 w-4" />
                )}
              </Button>
              {timers.length > 0 && (
                <Button variant="outline" size="sm" onClick={toggleFullscreen}>
                  <Maximize2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="presets" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="presets">Quick Presets</TabsTrigger>
              <TabsTrigger value="custom">Custom Timer</TabsTrigger>
            </TabsList>

            <TabsContent value="presets" className="space-y-6">
              {Object.entries(groupedPresets).map(([category, presets]) => (
                <div key={category}>
                  <h3 className="text-lg font-semibold mb-3 capitalize flex items-center">
                    {category === "quick" && <Timer className="h-5 w-5 mr-2" />}
                    {category === "cooking" && (
                      <ChefHat className="h-5 w-5 mr-2" />
                    )}
                    {category === "study" && (
                      <BookOpen className="h-5 w-5 mr-2" />
                    )}
                    {category === "workout" && (
                      <Dumbbell className="h-5 w-5 mr-2" />
                    )}
                    {category} Timers
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {presets.map((preset) => (
                      <Button
                        key={preset.label}
                        variant="outline"
                        className="h-auto p-4 flex flex-col items-center space-y-2"
                        onClick={() => {
                          const totalSeconds =
                            preset.minutes * 60 + (preset.seconds || 0);
                          createTimer(preset.label, totalSeconds, preset.color);
                        }}
                      >
                        <div
                          className={`rounded-full p-2 ${preset.color} text-white`}
                        >
                          {preset.icon}
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-sm">
                            {preset.label}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {preset.minutes > 0 && `${preset.minutes}m`}
                            {preset.seconds && ` ${preset.seconds}s`}
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="custom" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="timer-label">Timer Label (Optional)</Label>
                    <Input
                      id="timer-label"
                      placeholder="e.g., Coffee break, Meeting"
                      value={customLabel}
                      onChange={(e) => setCustomLabel(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label htmlFor="hours">Hours</Label>
                      <Input
                        id="hours"
                        type="number"
                        min="0"
                        max="23"
                        placeholder="0"
                        value={customHours}
                        onChange={(e) => setCustomHours(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="minutes">Minutes</Label>
                      <Input
                        id="minutes"
                        type="number"
                        min="0"
                        max="59"
                        placeholder="0"
                        value={customMinutes}
                        onChange={(e) => setCustomMinutes(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="seconds">Seconds</Label>
                      <Input
                        id="seconds"
                        type="number"
                        min="0"
                        max="59"
                        placeholder="0"
                        value={customSeconds}
                        onChange={(e) => setCustomSeconds(e.target.value)}
                      />
                    </div>
                  </div>

                  <Button onClick={createCustomTimer} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Timer
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Sound Alert</Label>
                    <Select
                      value={selectedSound}
                      onValueChange={setSelectedSound}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SOUND_OPTIONS.map((sound) => (
                          <SelectItem key={sound.id} value={sound.id}>
                            {sound.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Sound Notifications</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSoundEnabled(!soundEnabled)}
                      >
                        {soundEnabled ? (
                          <Volume2 className="h-4 w-4" />
                        ) : (
                          <VolumeX className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>Browser Notifications</Label>
                      <Badge
                        variant={notificationsEnabled ? "default" : "secondary"}
                      >
                        {notificationsEnabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle>How to Use</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Quick Presets</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Choose from popular timer durations</li>
                <li>• Cooking times for common foods</li>
                <li>• Study sessions and breaks</li>
                <li>• Workout intervals</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Features</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Multiple simultaneous timers</li>
                <li>• Fullscreen mode for visibility</li>
                <li>• Audio and browser notifications</li>
                <li>• Works in background tabs</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
