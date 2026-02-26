import { useState, useEffect, useRef, useCallback } from "react";

// Types for Pomodoro Timer
export type TimerStatus = "idle" | "running" | "paused" | "completed";
export type SessionType = "work" | "shortBreak" | "longBreak";

export interface PomodoroSettings {
  workDuration: number; // in minutes
  shortBreakDuration: number; // in minutes
  longBreakDuration: number; // in minutes
  sessionsUntilLongBreak: number;
  autoStartBreaks: boolean;
  autoStartWork: boolean;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
}

export interface PomodoroStats {
  completedSessions: number;
  totalWorkTime: number; // in minutes
  currentStreak: number;
}

// Default settings for the Pomodoro timer
export const DEFAULT_SETTINGS: PomodoroSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  sessionsUntilLongBreak: 4,
  autoStartBreaks: true,
  autoStartWork: true,
  soundEnabled: true,
  notificationsEnabled: true,
};

export function usePomodoro(initialSettings = DEFAULT_SETTINGS) {
  // State for settings
  const [settings, setSettings] = useState<PomodoroSettings>(initialSettings);
  
  // Timer state
  const [status, setStatus] = useState<TimerStatus>("idle");
  const [sessionType, setSessionType] = useState<SessionType>("work");
  const [timeRemaining, setTimeRemaining] = useState<number>(settings.workDuration * 60);
  const [completedSessions, setCompletedSessions] = useState<number>(0);
  
  // References
  const timerRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Initialize audio on component mount
  useEffect(() => {
    // Create audio element with the provided bell.mp3 file
    audioRef.current = new Audio("/bell.mp3");
    
    // Set the audio to a short duration (we don't need the full 50 seconds)
    if (audioRef.current) {
      // Listen for the canplaythrough event to ensure audio is loaded
      audioRef.current.addEventListener('canplaythrough', () => {
        // Ready to play
        console.log("Audio file loaded and ready to play");
      });
      
      // Handle errors
      audioRef.current.addEventListener('error', (e) => {
        console.error("Error loading audio file:", e);
      });
    }
    
    // Request notification permission if needed
    if (settings.notificationsEnabled && "Notification" in window) {
      Notification.requestPermission();
    }
    
    // Cleanup on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      // Clean up audio element
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [settings.notificationsEnabled]);
  
  // Update timer when settings change
  useEffect(() => {
    if (status === "idle") {
      const duration = getDurationForSessionType(sessionType);
      setTimeRemaining(duration * 60);
    }
  }, [settings, sessionType, status]);
  
  // Get the duration in minutes for the current session type
  const getDurationForSessionType = useCallback((type: SessionType): number => {
    switch (type) {
      case "work":
        return settings.workDuration;
      case "shortBreak":
        return settings.shortBreakDuration;
      case "longBreak":
        return settings.longBreakDuration;
    }
  }, [settings]);
  
  // Timer tick function
  const tick = useCallback(() => {
    setTimeRemaining((prev) => {
      if (prev <= 1) {
        completeSession();
        return 0;
      }
      return prev - 1;
    });
  }, []);
  
  // Complete the current session
  const completeSession = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    setStatus("completed");
    
    // Play sound if enabled
    if (settings.soundEnabled && audioRef.current) {
      // Reset the audio to the beginning in case it was already played
      audioRef.current.currentTime = 0;
      // Play the audio file
      audioRef.current.play().catch((error) => console.error("Audio play error:", error));
      
      // Stop the audio after a short time (3 seconds)
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
      }, 3000);
    }
    
    // Show notification if enabled
    if (settings.notificationsEnabled && "Notification" in window && Notification.permission === "granted") {
      const notificationTitle = sessionType === "work" 
        ? "Work session completed!" 
        : "Break time over!";
      
      const notificationBody = sessionType === "work"
        ? "Time for a break!"
        : "Ready to get back to work?";
      
      new Notification(notificationTitle, {
        body: notificationBody,
        icon: "/favicon.ico"
      });
    }
    
    // Handle session completion logic
    if (sessionType === "work") {
      const newCompletedSessions = completedSessions + 1;
      setCompletedSessions(newCompletedSessions);
      
      // Determine next break type
      const isLongBreakDue = newCompletedSessions % settings.sessionsUntilLongBreak === 0;
      const nextSessionType = isLongBreakDue ? "longBreak" : "shortBreak";
      setSessionType(nextSessionType);
      
      // Auto-start break if enabled
      if (settings.autoStartBreaks) {
        const breakDuration = isLongBreakDue 
          ? settings.longBreakDuration 
          : settings.shortBreakDuration;
        
        setTimeRemaining(breakDuration * 60);
        setStatus("running");
        timerRef.current = window.setInterval(tick, 1000);
      } else {
        const breakDuration = isLongBreakDue 
          ? settings.longBreakDuration 
          : settings.shortBreakDuration;
          
        setTimeRemaining(breakDuration * 60);
        setStatus("idle");
      }
    } else {
      // Break is over, switch to work session
      setSessionType("work");
      
      // Auto-start work if enabled
      if (settings.autoStartWork) {
        setTimeRemaining(settings.workDuration * 60);
        setStatus("running");
        timerRef.current = window.setInterval(tick, 1000);
      } else {
        setTimeRemaining(settings.workDuration * 60);
        setStatus("idle");
      }
    }
  }, [
    completedSessions, 
    sessionType, 
    settings.autoStartBreaks, 
    settings.autoStartWork,
    settings.longBreakDuration,
    settings.shortBreakDuration,
    settings.sessionsUntilLongBreak,
    settings.soundEnabled,
    settings.notificationsEnabled,
    settings.workDuration,
    tick
  ]);
  
  // Start the timer
  const startTimer = useCallback(() => {
    if (status === "running") return;
    
    setStatus("running");
    timerRef.current = window.setInterval(tick, 1000);
  }, [status, tick]);
  
  // Pause the timer
  const pauseTimer = useCallback(() => {
    if (status !== "running") return;
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    setStatus("paused");
  }, [status]);
  
  // Reset the timer
  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    const duration = getDurationForSessionType(sessionType);
    setTimeRemaining(duration * 60);
    setStatus("idle");
  }, [getDurationForSessionType, sessionType]);
  
  // Skip to the next session
  const skipToNextSession = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    completeSession();
  }, [completeSession]);
  
  // Change session type manually
  const changeSessionType = useCallback((type: SessionType) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    setSessionType(type);
    const duration = getDurationForSessionType(type);
    setTimeRemaining(duration * 60);
    setStatus("idle");
  }, [getDurationForSessionType]);
  
  // Update settings
  const updateSettings = useCallback((newSettings: Partial<PomodoroSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);
  
  // Format time as MM:SS
  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, []);
  
  // Calculate progress percentage for visualization
  const calculateProgress = useCallback((): number => {
    const totalSeconds = getDurationForSessionType(sessionType) * 60;
    const progress = ((totalSeconds - timeRemaining) / totalSeconds) * 100;
    return Math.min(progress, 100);
  }, [getDurationForSessionType, sessionType, timeRemaining]);
  
  // Reset all stats
  const resetStats = useCallback(() => {
    setCompletedSessions(0);
  }, []);
  
  return {
    // State
    settings,
    status,
    sessionType,
    timeRemaining,
    completedSessions,
    
    // Computed values
    formattedTime: formatTime(timeRemaining),
    progress: calculateProgress(),
    
    // Actions
    startTimer,
    pauseTimer,
    resetTimer,
    skipToNextSession,
    changeSessionType,
    updateSettings,
    resetStats,
  };
} 