import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { v4 as uuidv4 } from "uuid";
import {
  Habit,
  HabitEntry,
  HabitStatistics,
  HabitAchievement,
  HabitData,
} from "@/types/habit";
import {
  calculateStatistics,
  checkForNewAchievements,
} from "@/utils/habitUtils";

// Context type definition
interface HabitContextType {
  // State
  habits: Habit[];
  entries: Record<string, HabitEntry[]>;
  statistics: Record<string, HabitStatistics>;
  achievements: HabitAchievement[];

  // Habit CRUD
  addHabit: (habit: Omit<Habit, "id" | "createdAt">) => Habit;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  archiveHabit: (id: string) => void;
  deleteHabit: (id: string) => void;

  // Entries management
  toggleHabitCompletion: (
    habitId: string,
    date: string,
    notes?: string
  ) => void;
  getEntriesForHabit: (habitId: string) => HabitEntry[];
  updateEntryNotes: (habitId: string, date: string, notes: string) => void;

  // Statistics and achievements
  getStatisticsForHabit: (habitId: string) => HabitStatistics | undefined;
  getAchievementsForHabit: (habitId: string) => HabitAchievement[];
  recalculateAllAchievements: () => boolean;

  // Data persistence
  exportData: () => string;
  importData: (jsonData: string) => boolean;
}

// Create context with a default value
const HabitContext = createContext<HabitContextType | undefined>(undefined);

// Props for the provider component
interface HabitProviderProps {
  children: ReactNode;
}

// Local storage key
const STORAGE_KEY = "habit-tracker-data";

export const HabitProvider: React.FC<HabitProviderProps> = ({ children }) => {
  // Initialize state
  const [habits, setHabits] = useState<Habit[]>([]);
  const [entries, setEntries] = useState<Record<string, HabitEntry[]>>({});
  const [statistics, setStatistics] = useState<Record<string, HabitStatistics>>(
    {}
  );
  const [achievements, setAchievements] = useState<HabitAchievement[]>([]);

  // Load data from localStorage on initial render
  useEffect(() => {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
      try {
        const parsedData: HabitData = JSON.parse(storedData);
        setHabits(parsedData.habits || []);
        setEntries(parsedData.entries || {});
        setStatistics(parsedData.statistics || {});
        setAchievements(parsedData.achievements || []);
      } catch (error) {
        console.error("Failed to parse stored habit data:", error);
      }
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    const data: HabitData = {
      habits,
      entries,
      statistics,
      achievements,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [habits, entries, statistics, achievements]);

  // Add a new habit
  const addHabit = (habitData: Omit<Habit, "id" | "createdAt">): Habit => {
    const newHabit: Habit = {
      id: uuidv4(),
      ...habitData,
      createdAt: new Date().toISOString(),
    };

    setHabits((prevHabits) => [...prevHabits, newHabit]);

    // Initialize entries for this habit
    setEntries((prevEntries) => ({
      ...prevEntries,
      [newHabit.id]: [],
    }));

    // Initialize statistics for this habit
    const newStats = calculateStatistics(newHabit, []);
    setStatistics((prevStats) => ({
      ...prevStats,
      [newHabit.id]: newStats,
    }));

    return newHabit;
  };

  // Update an existing habit
  const updateHabit = (id: string, updates: Partial<Habit>) => {
    setHabits((prevHabits) =>
      prevHabits.map((habit) =>
        habit.id === id ? { ...habit, ...updates } : habit
      )
    );

    // Recalculate statistics if frequency changed
    if (updates.frequency || updates.customDays) {
      const updatedHabit = habits.find((h) => h.id === id);
      if (updatedHabit) {
        const habitEntries = entries[id] || [];
        const updatedStats = calculateStatistics(
          { ...updatedHabit, ...updates },
          habitEntries
        );

        setStatistics((prevStats) => ({
          ...prevStats,
          [id]: updatedStats,
        }));
      }
    }
  };

  // Archive a habit (soft delete)
  const archiveHabit = (id: string) => {
    setHabits((prevHabits) =>
      prevHabits.map((habit) =>
        habit.id === id
          ? { ...habit, archivedAt: new Date().toISOString() }
          : habit
      )
    );
  };

  // Delete a habit and all related data
  const deleteHabit = (id: string) => {
    setHabits((prevHabits) => prevHabits.filter((habit) => habit.id !== id));

    // Remove entries, statistics, and achievements for this habit
    setEntries((prevEntries) => {
      const newEntries = { ...prevEntries };
      delete newEntries[id];
      return newEntries;
    });

    setStatistics((prevStats) => {
      const newStats = { ...prevStats };
      delete newStats[id];
      return newStats;
    });

    setAchievements((prevAchievements) =>
      prevAchievements.filter((achievement) => achievement.habitId !== id)
    );
  };

  // Toggle completion status for a habit on a specific date
  const toggleHabitCompletion = (
    habitId: string,
    date: string,
    notes?: string
  ) => {
    setEntries((prevEntries) => {
      const habitEntries = prevEntries[habitId] || [];
      const existingEntryIndex = habitEntries.findIndex(
        (entry) => entry.date === date
      );

      let newHabitEntries;

      if (existingEntryIndex >= 0) {
        // Toggle existing entry
        const existingEntry = habitEntries[existingEntryIndex];
        newHabitEntries = [
          ...habitEntries.slice(0, existingEntryIndex),
          {
            ...existingEntry,
            completed: !existingEntry.completed,
            notes: notes !== undefined ? notes : existingEntry.notes,
          },
          ...habitEntries.slice(existingEntryIndex + 1),
        ];
      } else {
        // Create new entry
        newHabitEntries = [
          ...habitEntries,
          { habitId, date, completed: true, notes },
        ];
      }

      return {
        ...prevEntries,
        [habitId]: newHabitEntries,
      };
    });

    // Update statistics
    const habit = habits.find((h) => h.id === habitId);
    if (habit) {
      const habitEntries = [...(entries[habitId] || [])];
      const existingEntryIndex = habitEntries.findIndex(
        (entry) => entry.date === date
      );

      if (existingEntryIndex >= 0) {
        // Toggle existing entry for statistics calculation
        habitEntries[existingEntryIndex] = {
          ...habitEntries[existingEntryIndex],
          completed: !habitEntries[existingEntryIndex].completed,
        };
      } else {
        // Add new entry for statistics calculation
        habitEntries.push({ habitId, date, completed: true });
      }

      const updatedStats = calculateStatistics(habit, habitEntries);

      setStatistics((prevStats) => ({
        ...prevStats,
        [habitId]: updatedStats,
      }));

      // Check for new achievements
      const newAchievements = checkForNewAchievements(
        habit,
        updatedStats,
        achievements.filter((a) => a.habitId === habitId)
      );

      if (newAchievements.length > 0) {
        console.log("New achievements earned:", newAchievements);
        setAchievements((prevAchievements) => [
          ...prevAchievements,
          ...newAchievements,
        ]);
      }
    }
  };

  // Recalculate all statistics and check for achievements
  const recalculateAllAchievements = () => {
    // First, recalculate all statistics
    const updatedStats: Record<string, HabitStatistics> = {};

    habits.forEach((habit) => {
      const habitEntries = entries[habit.id] || [];
      updatedStats[habit.id] = calculateStatistics(habit, habitEntries);
    });

    // Update statistics state
    setStatistics(updatedStats);

    // Check for new achievements for all habits
    let newAchievements: HabitAchievement[] = [];

    habits.forEach((habit) => {
      const habitStats = updatedStats[habit.id];
      if (habitStats) {
        const habitAchievements = achievements.filter(
          (a) => a.habitId === habit.id
        );
        const achievementsForHabit = checkForNewAchievements(
          habit,
          habitStats,
          habitAchievements
        );

        newAchievements = [...newAchievements, ...achievementsForHabit];
      }
    });

    // Update achievements state if new ones were found
    if (newAchievements.length > 0) {
      console.log(
        "New achievements found during recalculation:",
        newAchievements
      );
      setAchievements((prevAchievements) => [
        ...prevAchievements,
        ...newAchievements,
      ]);
    }

    return newAchievements.length > 0;
  };

  // Update notes for an entry
  const updateEntryNotes = (habitId: string, date: string, notes: string) => {
    setEntries((prevEntries) => {
      const habitEntries = prevEntries[habitId] || [];
      const existingEntryIndex = habitEntries.findIndex(
        (entry) => entry.date === date
      );

      if (existingEntryIndex >= 0) {
        // Update existing entry
        const newHabitEntries = [...habitEntries];
        newHabitEntries[existingEntryIndex] = {
          ...newHabitEntries[existingEntryIndex],
          notes,
        };

        return {
          ...prevEntries,
          [habitId]: newHabitEntries,
        };
      }

      // If no entry exists for this date, create one with completed=false
      return {
        ...prevEntries,
        [habitId]: [
          ...habitEntries,
          { habitId, date, completed: false, notes },
        ],
      };
    });
  };

  // Get all entries for a specific habit
  const getEntriesForHabit = (habitId: string): HabitEntry[] => {
    return entries[habitId] || [];
  };

  // Get statistics for a specific habit
  const getStatisticsForHabit = (
    habitId: string
  ): HabitStatistics | undefined => {
    return statistics[habitId];
  };

  // Get achievements for a specific habit
  const getAchievementsForHabit = (habitId: string): HabitAchievement[] => {
    return achievements.filter(
      (achievement) => achievement.habitId === habitId
    );
  };

  // Export all data as JSON
  const exportData = (): string => {
    const data: HabitData = {
      habits,
      entries,
      statistics,
      achievements,
    };

    return JSON.stringify(data);
  };

  // Import data from JSON
  const importData = (jsonData: string): boolean => {
    try {
      const data: HabitData = JSON.parse(jsonData);

      // Validate data structure
      if (!data.habits || !Array.isArray(data.habits)) {
        throw new Error("Invalid habits data");
      }

      // Set all state at once
      setHabits(data.habits);
      setEntries(data.entries || {});
      setStatistics(data.statistics || {});
      setAchievements(data.achievements || []);

      return true;
    } catch (error) {
      console.error("Failed to import habit data:", error);
      return false;
    }
  };

  // Create context value
  const contextValue: HabitContextType = {
    habits,
    entries,
    statistics,
    achievements,

    addHabit,
    updateHabit,
    archiveHabit,
    deleteHabit,

    toggleHabitCompletion,
    getEntriesForHabit,
    updateEntryNotes,

    getStatisticsForHabit,
    getAchievementsForHabit,
    recalculateAllAchievements,

    exportData,
    importData,
  };

  return (
    <HabitContext.Provider value={contextValue}>
      {children}
    </HabitContext.Provider>
  );
};

// Custom hook to use the habit context
export const useHabits = (): HabitContextType => {
  const context = useContext(HabitContext);
  if (context === undefined) {
    throw new Error("useHabits must be used within a HabitProvider");
  }
  return context;
};

export default HabitContext;
