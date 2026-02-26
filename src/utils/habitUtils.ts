import { Habit, HabitEntry, HabitStatistics, HabitAchievement } from '@/types/habit';
import { v4 as uuidv4 } from 'uuid';

/**
 * Get a date string in YYYY-MM-DD format
 */
export const formatDateString = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

/**
 * Get today's date as a string in YYYY-MM-DD format
 */
export const getTodayString = (): string => {
  return formatDateString(new Date());
};

/**
 * Check if a specific date should be tracked based on habit frequency
 */
export const shouldTrackDate = (date: Date, frequency: Habit['frequency'], customDays?: number[]): boolean => {
  if (frequency === 'daily') {
    return true;
  }

  if (frequency === 'weekly') {
    // Track only weekdays (Monday-Friday)
    const day = date.getDay();
    return day >= 1 && day <= 5;
  }

  if (frequency === 'custom' && customDays && customDays.length > 0) {
    // Track only specified days of the week
    return customDays.includes(date.getDay());
  }

  return false;
};

/**
 * Get dates between two dates as string array
 */
export const getDatesBetween = (startDate: Date, endDate: Date): string[] => {
  const dates: string[] = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    dates.push(formatDateString(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
};

/**
 * Calculate current streak for a habit
 */
export const calculateStreak = (
  entries: HabitEntry[], 
  habit: Habit
): { current: number; longest: number } => {
  if (!entries || entries.length === 0) {
    return { current: 0, longest: 0 };
  }

  // Sort entries by date (newest first)
  const sortedEntries = [...entries].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  
  // Get all dates to check
  const today = new Date();
  const earliestDate = new Date(sortedEntries[sortedEntries.length - 1].date);
  
  // For current streak, check backwards from today
  const todayString = formatDateString(today);
  
  // Check if today is already accounted for
  const todayEntry = sortedEntries.find(entry => entry.date === todayString);
  
  // If today is completed, include it in the streak
  if (todayEntry && todayEntry.completed) {
    currentStreak = 1;
  }
  
  // Start checking yesterday
  let checkDate = new Date(today);
  checkDate.setDate(checkDate.getDate() - 1);
  
  while (checkDate >= earliestDate) {
    const dateString = formatDateString(checkDate);
    
    // Only check dates that should be tracked based on frequency
    if (shouldTrackDate(checkDate, habit.frequency, habit.customDays)) {
      const entry = sortedEntries.find(e => e.date === dateString);
      
      // If there's an entry and it's completed, add to streak
      if (entry && entry.completed) {
        if (currentStreak > 0 || dateString === todayString) {
          currentStreak++;
        }
      } else {
        // Break streak if a day is missed
        if (currentStreak > 0) {
          break;
        }
      }
    }
    
    // Move to previous day
    checkDate.setDate(checkDate.getDate() - 1);
  }
  
  // For longest streak, check all entries
  sortedEntries.forEach(entry => {
    if (entry.completed) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  });
  
  return { current: currentStreak, longest: longestStreak };
};

/**
 * Calculate completion rate for a period
 */
export const calculateCompletionRate = (
  entries: HabitEntry[],
  startDate: string,
  endDate: string,
  habit: Habit
): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Get all dates in the period that should be tracked
  const allDates = getDatesBetween(start, end).filter(dateStr => {
    const date = new Date(dateStr);
    return shouldTrackDate(date, habit.frequency, habit.customDays);
  });
  
  if (allDates.length === 0) {
    return 0;
  }
  
  // Count completed dates
  const completedDates = entries.filter(entry => 
    entry.completed && 
    allDates.includes(entry.date)
  ).length;
  
  return completedDates / allDates.length;
};

/**
 * Calculate statistics for a habit
 */
export const calculateStatistics = (
  habit: Habit, 
  entries: HabitEntry[]
): HabitStatistics => {
  // Calculate streaks
  const { current, longest } = calculateStreak(entries, habit);
  
  // Get completion rate for the last 30 days
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);
  
  const completionRate = calculateCompletionRate(
    entries,
    formatDateString(thirtyDaysAgo),
    formatDateString(today),
    habit
  );
  
  // Count total completions
  const totalCompletions = entries.filter(entry => entry.completed).length;
  
  return {
    habitId: habit.id,
    currentStreak: current,
    longestStreak: longest,
    totalCompletions,
    completionRate,
    lastUpdated: getTodayString()
  };
};

/**
 * Check for new achievements based on progress
 */
export const checkForNewAchievements = (
  habit: Habit,
  statistics: HabitStatistics,
  existingAchievements: HabitAchievement[]
): HabitAchievement[] => {
  const newAchievements: HabitAchievement[] = [];
  
  // Define milestone thresholds
  const streakMilestones = [3, 7, 14, 30, 60, 90, 180, 365];
  const completionMilestones = [10, 25, 50, 100, 250, 500, 1000];
  const consistencyMilestones = [25, 50, 75, 90, 95, 99];
  
  // Check streak milestones
  streakMilestones.forEach(milestone => {
    // Check if this milestone has already been achieved
    const achieved = existingAchievements.some(
      a => a.habitId === habit.id && a.type === 'streak' && a.milestone === milestone
    );
    
    // If not achieved and current streak exceeds milestone
    if (!achieved && statistics.currentStreak >= milestone) {
      newAchievements.push({
        id: uuidv4(),
        habitId: habit.id,
        type: 'streak',
        milestone,
        earnedAt: getTodayString(),
        description: `${milestone}-day streak for ${habit.name}`
      });
    }
  });
  
  // Check completion milestones
  completionMilestones.forEach(milestone => {
    const achieved = existingAchievements.some(
      a => a.habitId === habit.id && a.type === 'completion' && a.milestone === milestone
    );
    
    if (!achieved && statistics.totalCompletions >= milestone) {
      newAchievements.push({
        id: uuidv4(),
        habitId: habit.id,
        type: 'completion',
        milestone,
        earnedAt: getTodayString(),
        description: `Completed ${habit.name} ${milestone} times`
      });
    }
  });
  
  // Check consistency milestones (completion rate as percentage)
  const completionRatePercent = Math.round(statistics.completionRate * 100);
  consistencyMilestones.forEach(milestone => {
    const achieved = existingAchievements.some(
      a => a.habitId === habit.id && a.type === 'consistency' && a.milestone === milestone
    );
    
    // Only grant consistency achievements if there's a meaningful amount of entries
    const MIN_ENTRIES_FOR_CONSISTENCY = 10;
    const hasEnoughData = statistics.totalCompletions >= MIN_ENTRIES_FOR_CONSISTENCY;
    
    if (!achieved && hasEnoughData && completionRatePercent >= milestone) {
      newAchievements.push({
        id: uuidv4(),
        habitId: habit.id,
        type: 'consistency',
        milestone,
        earnedAt: getTodayString(),
        description: `${milestone}% consistency rate for ${habit.name}`
      });
    }
  });
  
  return newAchievements;
};

/**
 * Get entries for a specific habit in a date range
 */
export const getEntriesForDateRange = (
  entries: HabitEntry[],
  startDate: string,
  endDate: string
): HabitEntry[] => {
  return entries.filter(entry => {
    return entry.date >= startDate && entry.date <= endDate;
  });
};

/**
 * Get all dates that should be tracked in a given range
 */
export const getTrackableDates = (
  startDate: Date,
  endDate: Date,
  habit: Habit
): string[] => {
  return getDatesBetween(startDate, endDate).filter(dateStr => {
    const date = new Date(dateStr);
    return shouldTrackDate(date, habit.frequency, habit.customDays);
  });
}; 