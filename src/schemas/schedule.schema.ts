import { z } from "zod";

/**
 * Zod schemas for Schedule-related types
 */

export const createScheduleSchema = z.object({
  command_id: z.string().min(1, "Command is required"),
  cron_expression: z
    .string()
    .min(1, "Cron expression is required")
    .regex(
      /^(\*|([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])|\*\/([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])) (\*|([0-9]|1[0-9]|2[0-3])|\*\/([0-9]|1[0-9]|2[0-3])) (\*|([1-9]|1[0-9]|2[0-9]|3[0-1])|\*\/([1-9]|1[0-9]|2[0-9]|3[0-1])) (\*|([1-9]|1[0-2])|\*\/([1-9]|1[0-2])) (\*|([0-6])|\*\/([0-6]))$/,
      "Invalid cron expression"
    ),
  show_notification: z.boolean(),
});

export const updateScheduleSchema = z.object({
  id: z.string().min(1, "ID is required"),
  command_id: z.string().min(1, "Command is required"),
  cron_expression: z
    .string()
    .min(1, "Cron expression is required")
    .regex(
      /^(\*|([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])|\*\/([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])) (\*|([0-9]|1[0-9]|2[0-3])|\*\/([0-9]|1[0-9]|2[0-3])) (\*|([1-9]|1[0-9]|2[0-9]|3[0-1])|\*\/([1-9]|1[0-9]|2[0-9]|3[0-1])) (\*|([1-9]|1[0-2])|\*\/([1-9]|1[0-2])) (\*|([0-6])|\*\/([0-6]))$/,
      "Invalid cron expression"
    ),
  show_notification: z.boolean(),
});

export const scheduleResponseSchema = z.object({
  id: z.string(),
  command_id: z.string(),
  cron_expression: z.string(),
  show_notification: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type CreateScheduleFormData = z.infer<typeof createScheduleSchema>;
export type UpdateScheduleFormData = z.infer<typeof updateScheduleSchema>;
export type ScheduleResponseData = z.infer<typeof scheduleResponseSchema>;
