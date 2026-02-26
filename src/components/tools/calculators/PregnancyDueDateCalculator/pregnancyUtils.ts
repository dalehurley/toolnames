import { addDays, differenceInDays, isValid, parseISO, startOfDay } from "date-fns";

export const TOTAL_WEEKS = 40;
export const TOTAL_DAYS = 280;

export interface Milestone {
  week: number;
  event: string;
  detail: string;
}

export const milestoneCatalog: Milestone[] = [
  { week: 4, event: "Implantation begins", detail: "Fertilized egg attaches to uterus." },
  { week: 6, event: "First heartbeat detectable", detail: "Heartbeat may be visible on ultrasound." },
  { week: 8, event: "Major organs forming", detail: "Brain, heart, and lungs continue developing." },
  { week: 12, event: "End of first trimester", detail: "Risk of miscarriage drops significantly." },
  { week: 16, event: "Movement may be felt", detail: "Some feel quickening around this time." },
  { week: 20, event: "Anatomy scan", detail: "Mid-pregnancy ultrasound is commonly scheduled." },
  { week: 24, event: "Viability milestone", detail: "Baby has a chance of survival with medical care." },
  { week: 27, event: "End of second trimester", detail: "Third trimester begins soon." },
  { week: 32, event: "Rapid brain growth", detail: "Baby gains fat and practices breathing." },
  { week: 37, event: "Full term", detail: "Baby is considered early term." },
  { week: 40, event: "Estimated due date", detail: "Baby can arrive any day." },
];

const developmentNotes = [
  { week: 4, note: "Neural tube forms and implantation completes." },
  { week: 6, note: "Heartbeat is detectable and limb buds appear." },
  { week: 8, note: "Facial features and fingers begin to form." },
  { week: 12, note: "Reflexes start and major organs are in place." },
  { week: 16, note: "Bones harden and baby may begin to move." },
  { week: 20, note: "Hearing develops and growth accelerates." },
  { week: 24, note: "Lungs practice breathing and taste buds form." },
  { week: 28, note: "Eyes open and brain growth surges." },
  { week: 32, note: "Baby gains weight and practices breathing rhythms." },
  { week: 36, note: "Baby settles lower and prepares for birth." },
  { week: 40, note: "Baby is full term and ready to meet you." },
];

const symptomsByTrimester = {
  1: [
    "Fatigue and nausea are common.",
    "Breast tenderness and mood changes.",
    "Frequent urination may increase.",
  ],
  2: [
    "Energy often improves.",
    "Backaches and stretching sensations.",
    "Baby movements become noticeable.",
  ],
  3: [
    "Shortness of breath and heartburn.",
    "Frequent bathroom trips and swelling.",
    "Braxton Hicks contractions may appear.",
  ],
};

export const appointmentSuggestions = [
  { weekRange: "8-12", note: "Initial prenatal visit and dating ultrasound." },
  { weekRange: "16-20", note: "Quad screen or anatomy scan (around week 20)." },
  { weekRange: "24-28", note: "Gestational diabetes screening." },
  { weekRange: "28-32", note: "Rhogam shot if needed and growth checks." },
  { weekRange: "36-40", note: "Weekly check-ins and birth planning." },
];

export const parseInputDate = (value: string): Date | null => {
  if (!value) return null;
  const parsed = parseISO(value);
  return isValid(parsed) ? startOfDay(parsed) : null;
};

export const calculateDueDate = (lmpDate: Date): Date => addDays(lmpDate, TOTAL_DAYS);

export const calculateCurrentWeek = (lmpDate: Date, currentDate: Date = new Date()) => {
  const normalizedCurrent = startOfDay(currentDate);
  const daysDiff = differenceInDays(normalizedCurrent, startOfDay(lmpDate));
  if (daysDiff < 0) {
    return { week: 0, day: 0, daysDiff };
  }

  const week = Math.min(Math.floor(daysDiff / 7) + 1, TOTAL_WEEKS);
  const day = Math.min((daysDiff % 7) + 1, 7);
  return { week, day, daysDiff };
};

export const getTrimester = (week: number) => {
  if (week <= 0) return 0;
  if (week < 13) return 1;
  if (week < 27) return 2;
  return 3;
};

export const getFetalDevelopment = (week: number) => {
  if (week <= 0) return "Pregnancy has not started yet.";
  const note = [...developmentNotes].reverse().find((item) => week >= item.week);
  return note ? note.note : "Early development begins this week.";
};

export const getSymptomsByTrimester = (trimester: number) =>
  symptomsByTrimester[trimester as keyof typeof symptomsByTrimester] ?? [];

export const getMilestones = () => milestoneCatalog;
