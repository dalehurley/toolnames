import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { usePomodoro, SessionType } from "./usePomodoro";
import { Settings } from "./Settings";
import { Stats } from "./Stats";
import {
  Timer,
  SkipForward,
  RotateCcw,
  Coffee,
  Brain,
  Settings2,
  Pause,
  BarChart,
} from "lucide-react";

export const PomodoroTimer = () => {
  const [activeTab, setActiveTab] = useState<string>("timer");
  const pomodoro = usePomodoro();

  // Function to get the session color
  const getSessionColor = () => {
    switch (pomodoro.sessionType) {
      case "work":
        return "from-red-500 to-red-700";
      case "shortBreak":
        return "from-green-500 to-green-700";
      case "longBreak":
        return "from-blue-500 to-blue-700";
    }
  };

  // Function to get the session icon
  const getSessionIcon = () => {
    switch (pomodoro.sessionType) {
      case "work":
        return <Brain className="mr-2 h-5 w-5" />;
      case "shortBreak":
        return <Coffee className="mr-2 h-5 w-5" />;
      case "longBreak":
        return <Coffee className="mr-2 h-5 w-5" />;
    }
  };

  // Function to get the session label
  const getSessionLabel = () => {
    switch (pomodoro.sessionType) {
      case "work":
        return "Work Session";
      case "shortBreak":
        return "Short Break";
      case "longBreak":
        return "Long Break";
    }
  };

  // Function to handle session type change
  const handleSessionChange = (type: SessionType) => {
    pomodoro.changeSessionType(type);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl">Pomodoro Timer</CardTitle>
        <CardDescription>
          Boost your productivity with focused work sessions and regular breaks
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 w-full mb-6">
            <TabsTrigger value="timer" className="flex items-center">
              <Timer className="mr-2 h-4 w-4" />
              Timer
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center">
              <BarChart className="mr-2 h-4 w-4" />
              Stats
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center">
              <Settings2 className="mr-2 h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="timer" className="mt-0">
            <div className="flex flex-col items-center">
              {/* Session Type Selector */}
              <div className="flex space-x-2 mb-6">
                <Button
                  variant={
                    pomodoro.sessionType === "work" ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => handleSessionChange("work")}
                  className="flex items-center"
                >
                  <Brain className="mr-2 h-4 w-4" />
                  Work
                </Button>
                <Button
                  variant={
                    pomodoro.sessionType === "shortBreak"
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() => handleSessionChange("shortBreak")}
                  className="flex items-center"
                >
                  <Coffee className="mr-2 h-4 w-4" />
                  Short Break
                </Button>
                <Button
                  variant={
                    pomodoro.sessionType === "longBreak" ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => handleSessionChange("longBreak")}
                  className="flex items-center"
                >
                  <Coffee className="mr-2 h-4 w-4" />
                  Long Break
                </Button>
              </div>

              {/* Timer Circle */}
              <div className="relative w-72 h-72 mb-6">
                {/* SVG Circle Progress */}
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  {/* Background circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-gray-200 dark:text-gray-800"
                  />

                  {/* Progress circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray="282.7"
                    strokeDashoffset={282.7 - (282.7 * pomodoro.progress) / 100}
                    className={`text-gradient ${getSessionColor()} transform -rotate-90 origin-center`}
                  />
                </svg>

                {/* Timer Display */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-6xl font-bold mb-2">
                    {pomodoro.formattedTime}
                  </div>
                  <div className="flex items-center text-lg font-medium">
                    {getSessionIcon()}
                    {getSessionLabel()}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {pomodoro.completedSessions} completed
                  </div>
                </div>
              </div>

              {/* Timer Controls */}
              <div className="flex space-x-4 mb-8">
                {pomodoro.status === "running" ? (
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={pomodoro.pauseTimer}
                    className="flex items-center"
                  >
                    <Pause className="mr-2 h-5 w-5" />
                    Pause
                  </Button>
                ) : (
                  <Button
                    variant="default"
                    size="lg"
                    onClick={pomodoro.startTimer}
                    className="flex items-center"
                  >
                    <Timer className="mr-2 h-5 w-5" />
                    {pomodoro.status === "idle" ? "Start" : "Resume"}
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="lg"
                  onClick={pomodoro.resetTimer}
                  className="flex items-center"
                >
                  <RotateCcw className="mr-2 h-5 w-5" />
                  Reset
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={pomodoro.skipToNextSession}
                  className="flex items-center"
                >
                  <SkipForward className="mr-2 h-5 w-5" />
                  Skip
                </Button>
              </div>

              {/* Session Progress Indicator */}
              <div className="w-full mb-4">
                <Progress
                  value={pomodoro.progress}
                  className={`h-1.5 w-full ${getSessionColor()}`}
                />
              </div>

              {/* Session Information */}
              <div className="text-center text-sm text-muted-foreground">
                {pomodoro.sessionType === "work" ? (
                  <span>
                    Focus until it's time for a
                    {(pomodoro.completedSessions + 1) %
                      pomodoro.settings.sessionsUntilLongBreak ===
                    0
                      ? " long "
                      : " short "}
                    break
                  </span>
                ) : (
                  <span>
                    {pomodoro.sessionType === "shortBreak"
                      ? "Short break - relax briefly"
                      : "Long break - take time to recharge"}
                  </span>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="stats">
            <Stats
              completedSessions={pomodoro.completedSessions}
              resetStats={pomodoro.resetStats}
            />
          </TabsContent>

          <TabsContent value="settings">
            <Settings
              settings={pomodoro.settings}
              updateSettings={pomodoro.updateSettings}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
