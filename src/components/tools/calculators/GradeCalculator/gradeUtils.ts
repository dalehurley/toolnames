export interface Assignment {
  name: string;
  score: number;
  maxScore: number;
  weight: number;
  category?: string;
}

export interface Course {
  name: string;
  credits: number;
  grade: string;
}

export function calculateWeightedGrade(assignments: Assignment[]): number {
  let totalPoints = 0;
  let totalWeight = 0;

  assignments.forEach((assignment) => {
    const percentage = (assignment.score / assignment.maxScore) * 100;
    totalPoints += percentage * assignment.weight;
    totalWeight += assignment.weight;
  });

  return totalWeight > 0 ? totalPoints / totalWeight : 0;
}

export function calculateRequiredFinalScore(
  currentGrade: number,
  currentWeight: number,
  desiredGrade: number,
  finalWeight: number
): number {
  const currentContribution = currentGrade * (currentWeight / 100);
  const neededContribution = desiredGrade - currentContribution;
  return neededContribution / (finalWeight / 100);
}

export function calculateGPA(courses: Course[]): number {
  let totalPoints = 0;
  let totalCredits = 0;

  courses.forEach((course) => {
    const gradePoints = letterGradeToPoints(course.grade);
    totalPoints += gradePoints * course.credits;
    totalCredits += course.credits;
  });

  return totalCredits > 0 ? totalPoints / totalCredits : 0;
}

export function letterGradeToPoints(grade: string): number {
  const gradeMap: Record<string, number> = {
    "A+": 4.0,
    A: 4.0,
    "A-": 3.7,
    "B+": 3.3,
    B: 3.0,
    "B-": 2.7,
    "C+": 2.3,
    C: 2.0,
    "C-": 1.7,
    "D+": 1.3,
    D: 1.0,
    "D-": 0.7,
    F: 0.0,
  };
  return gradeMap[grade.toUpperCase()] || 0;
}

export function getLetterGrade(percentage: number): string {
  if (percentage >= 97) return "A+";
  if (percentage >= 93) return "A";
  if (percentage >= 90) return "A-";
  if (percentage >= 87) return "B+";
  if (percentage >= 83) return "B";
  if (percentage >= 80) return "B-";
  if (percentage >= 77) return "C+";
  if (percentage >= 73) return "C";
  if (percentage >= 70) return "C-";
  if (percentage >= 67) return "D+";
  if (percentage >= 63) return "D";
  if (percentage >= 60) return "D-";
  return "F";
}

export function getGradeColor(percentage: number): string {
  if (percentage >= 90) return "text-green-600";
  if (percentage >= 80) return "text-blue-600";
  if (percentage >= 70) return "text-yellow-600";
  if (percentage >= 60) return "text-orange-600";
  return "text-red-600";
}
