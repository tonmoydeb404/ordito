import cronstrue from "cronstrue";

export type CronFieldKey =
  | "second"
  | "minute"
  | "hour"
  | "dayOfMonth"
  | "month"
  | "dayOfWeek";

export type CronFieldConfig = {
  key: CronFieldKey;
  label: string;
  min: number;
  max: number;
  /** Short display names, index-aligned starting at `min`. Only set for month/weekday. */
  names?: string[];
};

// 6-field format matching the Rust `cron` crate: sec min hour day month dow.
export const CRON_FIELD_CONFIGS: CronFieldConfig[] = [
  { key: "second", label: "Second", min: 0, max: 59 },
  { key: "minute", label: "Minute", min: 0, max: 59 },
  { key: "hour", label: "Hour", min: 0, max: 23 },
  { key: "dayOfMonth", label: "Day of month", min: 1, max: 31 },
  {
    key: "month",
    label: "Month",
    min: 1,
    max: 12,
    names: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
  },
  {
    // 1-based Quartz numbering matching the Rust `cron` crate: 1=Sun … 7=Sat
    key: "dayOfWeek",
    label: "Day of week",
    min: 1,
    max: 7,
    names: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  },
];

export type CronFieldState =
  | { type: "every" }
  | { type: "list"; values: number[] }
  // Fallback for anything the builder can't confidently round-trip (e.g. ranges "1-5" or steps "*/5").
  | { type: "custom"; raw: string };

export function parseField(
  token: string,
  config: CronFieldConfig,
): CronFieldState {
  if (token === "*") return { type: "every" };

  const parts = token.split(",");
  const values = parts.map((p) => Number(p));
  const isValidList =
    parts.length > 0 &&
    parts.every((p) => /^\d+$/.test(p)) &&
    values.every((v) => v >= config.min && v <= config.max);
  if (isValidList) {
    return { type: "list", values: [...new Set(values)].sort((a, b) => a - b) };
  }

  return { type: "custom", raw: token };
}

export function serializeField(state: CronFieldState): string {
  switch (state.type) {
    case "every":
      return "*";
    case "list":
      return state.values.length > 0
        ? [...new Set(state.values)].sort((a, b) => a - b).join(",")
        : "*";
    case "custom":
      return state.raw;
  }
}

/** Returns null when `expr` doesn't split into exactly 6 fields (caller should fall back to raw editing). */
export function parseCronExpression(expr: string): CronFieldState[] | null {
  const tokens = expr.trim().split(/\s+/).filter(Boolean);
  if (tokens.length !== 6) return null;
  return tokens.map((token, i) => parseField(token, CRON_FIELD_CONFIGS[i]));
}

export function buildCronExpression(states: CronFieldState[]): string {
  return states.map(serializeField).join(" ");
}

export function describeCron(
  expr: string,
): { ok: true; text: string } | { ok: false } {
  try {
    const text = cronstrue.toString(expr, {
      throwExceptionOnParseError: true,
      dayOfWeekStartIndexZero: false,
    });
    return { ok: true, text };
  } catch {
    return { ok: false };
  }
}
