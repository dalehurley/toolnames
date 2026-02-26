export interface Habit {
  id: string;
  name: string;
  description?: string;
  category: string; // Work, Health, Learning, etc.
  color: string;
  icon?: string;
  frequency: 'daily' | 'weekly' | 'custom';
  customDays?: number[]; // 0-6 for days of week (0 = Sunday)
  createdAt: string; // ISO date string
  archivedAt?: string; // ISO date string
  target?: number; // Target number of completions per period
}

export interface HabitEntry {
  habitId: string;
  date: string; // ISO date string (YYYY-MM-DD)
  completed: boolean;
  notes?: string;
}

export interface HabitStatistics {
  habitId: string;
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  completionRate: number; // 0-1 percentage
  lastUpdated: string; // ISO date string
}

export interface HabitAchievement {
  id: string;
  habitId: string;
  type: 'streak' | 'completion' | 'consistency';
  milestone: number;
  earnedAt: string; // ISO date string
  description: string;
}

export type HabitData = {
  habits: Habit[];
  entries: Record<string, HabitEntry[]>;
  statistics: Record<string, HabitStatistics>;
  achievements: HabitAchievement[];
};

export const DEFAULT_HABIT_CATEGORIES = [
  'Health',
  'Work',
  'Learning',
  'Personal',
  'Social',
  'Hobby',
  'Other'
];

export const DEFAULT_HABIT_COLORS = [
  '#FF6B6B', // Vibrant Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#FFA45C', // Orange
  '#A17FE0', // Purple
  '#5CB85C', // Green
  '#FFBE0B', // Yellow
  '#9C27B0', // Deep Purple
  '#3F51B5', // Indigo
  '#E91E63', // Pink
]; 