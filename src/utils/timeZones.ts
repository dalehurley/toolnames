import { format, toZonedTime } from 'date-fns-tz';
import { getHours } from 'date-fns';

export interface TimeZone {
  id: string;         // IANA time zone ID (e.g., "America/New_York")
  name: string;       // Display name (e.g., "New York")
  offset: string;     // UTC offset (e.g., "UTC-05:00")
  emoji: string;      // Country flag emoji
  countryCode: string; // ISO country code
  coordinates: [number, number]; // Longitude, latitude for map
}

// Helper function to format time in a specific time zone
export const formatInTimeZone = (date: Date, timeZoneId: string, formatStr: string): string => {
  const zonedDate = toZonedTime(date, timeZoneId);
  return format(zonedDate, formatStr, { timeZone: timeZoneId });
};

// Check if a time is during business hours (9AM-5PM local time, weekday)
export const isBusinessHours = (date: Date, timeZoneId: string): boolean => {
  const zonedDate = toZonedTime(date, timeZoneId);
  const hours = getHours(zonedDate);
  const dayOfWeek = zonedDate.getDay();
  
  // Return true if it's a weekday (1-5) and between 9AM and 5PM
  return dayOfWeek >= 1 && dayOfWeek <= 5 && hours >= 9 && hours < 17;
};

// Major cities with their time zones
export const majorCities = [
  { id: 'new-york', name: 'New York', timeZoneId: 'America/New_York', coordinates: [-74.0060, 40.7128] },
  { id: 'london', name: 'London', timeZoneId: 'Europe/London', coordinates: [-0.1276, 51.5072] },
  { id: 'tokyo', name: 'Tokyo', timeZoneId: 'Asia/Tokyo', coordinates: [139.6917, 35.6895] },
  { id: 'sydney', name: 'Sydney', timeZoneId: 'Australia/Sydney', coordinates: [151.2093, -33.8688] },
  { id: 'los-angeles', name: 'Los Angeles', timeZoneId: 'America/Los_Angeles', coordinates: [-118.2437, 34.0522] },
  { id: 'paris', name: 'Paris', timeZoneId: 'Europe/Paris', coordinates: [2.3522, 48.8566] },
  { id: 'berlin', name: 'Berlin', timeZoneId: 'Europe/Berlin', coordinates: [13.4050, 52.5200] },
  { id: 'dubai', name: 'Dubai', timeZoneId: 'Asia/Dubai', coordinates: [55.2708, 25.2048] },
  { id: 'singapore', name: 'Singapore', timeZoneId: 'Asia/Singapore', coordinates: [103.8198, 1.3521] },
  { id: 'sao-paulo', name: 'São Paulo', timeZoneId: 'America/Sao_Paulo', coordinates: [-46.6333, -23.5505] },
  { id: 'hong-kong', name: 'Hong Kong', timeZoneId: 'Asia/Hong_Kong', coordinates: [114.1694, 22.3193] },
  { id: 'mumbai', name: 'Mumbai', timeZoneId: 'Asia/Kolkata', coordinates: [72.8777, 19.0760] },
];

// A curated list of common time zones
export const timeZoneData: TimeZone[] = [
  { id: 'America/New_York', name: 'New York', offset: 'UTC-05:00', emoji: '🇺🇸', countryCode: 'US', coordinates: [-74.0060, 40.7128] },
  { id: 'America/Los_Angeles', name: 'Los Angeles', offset: 'UTC-08:00', emoji: '🇺🇸', countryCode: 'US', coordinates: [-118.2437, 34.0522] },
  { id: 'America/Chicago', name: 'Chicago', offset: 'UTC-06:00', emoji: '🇺🇸', countryCode: 'US', coordinates: [-87.6298, 41.8781] },
  { id: 'America/Denver', name: 'Denver', offset: 'UTC-07:00', emoji: '🇺🇸', countryCode: 'US', coordinates: [-104.9903, 39.7392] },
  { id: 'Europe/London', name: 'London', offset: 'UTC+00:00', emoji: '🇬🇧', countryCode: 'GB', coordinates: [-0.1276, 51.5072] },
  { id: 'Europe/Paris', name: 'Paris', offset: 'UTC+01:00', emoji: '🇫🇷', countryCode: 'FR', coordinates: [2.3522, 48.8566] },
  { id: 'Europe/Berlin', name: 'Berlin', offset: 'UTC+01:00', emoji: '🇩🇪', countryCode: 'DE', coordinates: [13.4050, 52.5200] },
  { id: 'Europe/Moscow', name: 'Moscow', offset: 'UTC+03:00', emoji: '🇷🇺', countryCode: 'RU', coordinates: [37.6173, 55.7558] },
  { id: 'Asia/Tokyo', name: 'Tokyo', offset: 'UTC+09:00', emoji: '🇯🇵', countryCode: 'JP', coordinates: [139.6917, 35.6895] },
  { id: 'Asia/Shanghai', name: 'Shanghai', offset: 'UTC+08:00', emoji: '🇨🇳', countryCode: 'CN', coordinates: [121.4737, 31.2304] },
  { id: 'Asia/Dubai', name: 'Dubai', offset: 'UTC+04:00', emoji: '🇦🇪', countryCode: 'AE', coordinates: [55.2708, 25.2048] },
  { id: 'Asia/Singapore', name: 'Singapore', offset: 'UTC+08:00', emoji: '🇸🇬', countryCode: 'SG', coordinates: [103.8198, 1.3521] },
  { id: 'Asia/Hong_Kong', name: 'Hong Kong', offset: 'UTC+08:00', emoji: '🇭🇰', countryCode: 'HK', coordinates: [114.1694, 22.3193] },
  { id: 'Asia/Kolkata', name: 'Mumbai', offset: 'UTC+05:30', emoji: '🇮🇳', countryCode: 'IN', coordinates: [72.8777, 19.0760] },
  { id: 'Australia/Sydney', name: 'Sydney', offset: 'UTC+10:00', emoji: '🇦🇺', countryCode: 'AU', coordinates: [151.2093, -33.8688] },
  { id: 'Australia/Melbourne', name: 'Melbourne', offset: 'UTC+10:00', emoji: '🇦🇺', countryCode: 'AU', coordinates: [144.9631, -37.8136] },
  { id: 'Pacific/Auckland', name: 'Auckland', offset: 'UTC+12:00', emoji: '🇳🇿', countryCode: 'NZ', coordinates: [174.7633, -36.8485] },
  { id: 'America/Sao_Paulo', name: 'São Paulo', offset: 'UTC-03:00', emoji: '🇧🇷', countryCode: 'BR', coordinates: [-46.6333, -23.5505] },
  { id: 'Africa/Cairo', name: 'Cairo', offset: 'UTC+02:00', emoji: '🇪🇬', countryCode: 'EG', coordinates: [31.2357, 30.0444] },
  { id: 'Africa/Johannesburg', name: 'Johannesburg', offset: 'UTC+02:00', emoji: '🇿🇦', countryCode: 'ZA', coordinates: [28.0473, -26.2041] },
  { id: 'UTC', name: 'UTC', offset: 'UTC+00:00', emoji: '🌐', countryCode: '', coordinates: [0, 0] },
];

// Function to get time zone data by ID
export const getTimeZoneById = (id: string): TimeZone | undefined => {
  return timeZoneData.find(tz => tz.id === id);
};

// Function to get coordinates for a time zone
export const getCoordinatesForTimeZone = (timeZoneId: string): [number, number] => {
  const tz = getTimeZoneById(timeZoneId);
  return tz ? tz.coordinates : [0, 0];
};

// Interface for saved time zone groups
export interface SavedTimeZoneGroup {
  id: string;
  name: string;
  sourceTimeZone: string;
  destinationTimeZones: string[];
} 