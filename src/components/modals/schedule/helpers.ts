export const MINUTES = Array.from({ length: 12 }, (_, i) => ({
  value: (i * 5).toString(),
  label: `${i * 5}`.padStart(2, "0"),
}));

export const HOURS = Array.from({ length: 24 }, (_, i) => ({
  value: i.toString(),
  label: `${i}:00 (${i === 0 ? "12" : i > 12 ? i - 12 : i}${
    i < 12 ? "AM" : "PM"
  })`,
}));

export const DAYS = Array.from({ length: 31 }, (_, i) => ({
  value: (i + 1).toString(),
  label: (i + 1).toString(),
}));

export const MONTHS = [
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

export const WEEKDAYS = [
  { value: "0", label: "Sunday" },
  { value: "1", label: "Monday" },
  { value: "2", label: "Tuesday" },
  { value: "3", label: "Wednesday" },
  { value: "4", label: "Thursday" },
  { value: "5", label: "Friday" },
  { value: "6", label: "Saturday" },
];

export function getCronDescription(cronString: string): string {
  const [second, minute, hour, dayOfMonth, month, dayOfWeek] = cronString
    .trim()
    .split(" ");

  const parts: string[] = [];

  if (second !== "*") {
    parts.push(`at second ${second}`);
  }

  if (minute !== "*") {
    const minuteLabel =
      MINUTES.find((m) => m.value === minute)?.label ?? minute;
    parts.push(`at minute ${minuteLabel}`);
  }

  if (hour !== "*") {
    const hourLabel =
      HOURS.find((h) => h.value === hour)?.label ?? `${hour}:00`;
    parts.push(`at ${hourLabel}`);
  }

  if (dayOfMonth !== "*") {
    const days = dayOfMonth.split(",");
    if (days.length === DAYS.length) {
      parts.push("every day of the month");
    } else {
      parts.push(`on day(s) ${days.join(", ")}`);
    }
  }

  if (month !== "*") {
    const months = month.split(",");
    if (months.length === MONTHS.length) {
      parts.push("every month");
    } else {
      const monthLabels = months
        .map((m) => MONTHS.find((month) => month.value === m)?.label)
        .filter(Boolean);
      parts.push(`in ${monthLabels.join(", ")}`);
    }
  }

  if (dayOfWeek !== "*") {
    const weekdays = dayOfWeek.split(",");
    if (weekdays.length === WEEKDAYS.length) {
      parts.push("every day of the week");
    } else {
      const weekdayLabels = weekdays
        .map((w) => WEEKDAYS.find((weekday) => weekday.value === w)?.label)
        .filter(Boolean);
      parts.push(`on ${weekdayLabels.join(", ")}`);
    }
  }

  if (parts.length === 0) {
    return "Runs every second";
  }

  return `Runs ${parts.join(" ")}`;
}
