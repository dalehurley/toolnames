import {
  format,
  addMinutes,
  differenceInMinutes,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
  getHours,
  getMinutes,
  setHours,
  setMinutes,
} from 'date-fns';
import { EnergyPattern } from '@/contexts/TimeBlockingContext';

/**
 * Parse a time string (HH:MM) into a Date object
 */
export const parseTimeString = (timeString: string, date: Date = new Date()): Date => {
  const [hours, minutes] = timeString.split(':').map(Number);
  return setMinutes(setHours(date, hours), minutes);
};

/**
 * Format a Date object to a time string (HH:MM)
 */
export const formatTimeString = (date: Date): string => {
  return format(date, 'HH:mm');
};

/**
 * Calculate the duration in minutes between two dates
 */
export const calculateDurationInMinutes = (start: Date, end: Date): number => {
  return differenceInMinutes(end, start);
};

/**
 * Format minutes to a human-readable duration (e.g., "1h 30m")
 */
export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours === 0) {
    return `${remainingMinutes}m`;
  } else if (remainingMinutes === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${remainingMinutes}m`;
  }
};

/**
 * Calculate time slots based on start time, end time, and increment
 */
export const calculateTimeSlots = (
  startTime: string,
  endTime: string,
  increment: number,
  date: Date
): Date[] => {
  const slots: Date[] = [];
  
  const start = parseTimeString(startTime, date);
  const end = parseTimeString(endTime, date);
  
  let current = start;
  while (current <= end) {
    slots.push(new Date(current));
    current = addMinutes(current, increment);
  }
  
  return slots;
};

/**
 * Get the date range based on the view type (day, week, month)
 */
export const getDateRangeForView = (date: Date, view: 'day' | 'week' | 'month') => {
  switch (view) {
    case 'day':
      return {
        start: startOfDay(date),
        end: endOfDay(date),
      };
    case 'week':
      return {
        start: startOfWeek(date, { weekStartsOn: 1 }), // Start on Monday
        end: endOfWeek(date, { weekStartsOn: 1 }),
      };
    case 'month':
      return {
        start: startOfMonth(date),
        end: endOfMonth(date),
      };
    default:
      return {
        start: startOfDay(date),
        end: endOfDay(date),
      };
  }
};

/**
 * Check if a date is within the range for the current view
 */
export const isDateInView = (date: Date, viewDate: Date, view: 'day' | 'week' | 'month'): boolean => {
  const range = getDateRangeForView(viewDate, view);
  return isWithinInterval(date, { start: range.start, end: range.end });
};

/**
 * Generate time labels for the timeline based on increment
 */
export const generateTimeLabels = (
  startTime: string,
  endTime: string,
  increment: number,
  date: Date
): string[] => {
  const slots = calculateTimeSlots(startTime, endTime, increment, date);
  return slots.map((slot) => format(slot, 'h:mm a'));
};

/**
 * Calculate position percentage for a time within the day
 */
export const calculateTimePosition = (
  time: Date,
  dayStartTime: string,
  dayEndTime: string,
  date: Date
): number => {
  const start = parseTimeString(dayStartTime, date);
  const end = parseTimeString(dayEndTime, date);
  const totalMinutes = differenceInMinutes(end, start);
  
  const minutesSinceStart = differenceInMinutes(time, start);
  
  return (minutesSinceStart / totalMinutes) * 100;
};

/**
 * Snap a time to the nearest increment
 */
export const snapTimeToIncrement = (time: Date, increment: number): Date => {
  const minutes = getMinutes(time);
  const hours = getHours(time);
  
  const roundedMinutes = Math.round(minutes / increment) * increment;
  
  return setMinutes(setHours(new Date(), hours), roundedMinutes);
};

/**
 * Generate data points for the energy curve visualization
 */
export const generateEnergyPoints = (
  energyPattern: EnergyPattern,
  dayStartTime: string,
  dayEndTime: string,
  date: Date
): { x: number; y: number }[] => {
  const points: { x: number; y: number }[] = [];
  
  energyPattern.timePoints.forEach((point) => {
    const time = parseTimeString(point.time, date);
    const position = calculateTimePosition(time, dayStartTime, dayEndTime, date);
    
    points.push({
      x: position,
      y: (point.level / 5) * 100, // Convert 1-5 scale to percentage
    });
  });
  
  return points;
}; 