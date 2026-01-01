export interface CronBuilderProps {
  defaultValue?: string;
  onChange?: (cronExpression: string) => void;
}

export const SECONDS = Array.from({ length: 60 }, (_, i) => i);
export const MINUTES = Array.from({ length: 60 }, (_, i) => i);
export const HOURS = Array.from({ length: 24 }, (_, i) => i);
export const DAYS_OF_MONTH = Array.from({ length: 31 }, (_, i) => i + 1);
export const MONTHS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];
export const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];
