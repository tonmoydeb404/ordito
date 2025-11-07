import { z } from "zod";

/**
 * Zod schemas for Log-related types
 */

export const logStatusSchema = z.enum([
  "success",
  "failed",
  "timeout",
  "cancelled",
  "running",
]);

export const logResponseSchema = z.object({
  id: z.string(),
  command_id: z.string(),
  command_schedule_id: z.string().optional(),
  status: logStatusSchema,
  exit_code: z.number().optional(),
  output: z.string().optional(),
  working_dir: z.string(),
  run_in_background: z.boolean(),
  timeout: z.number().optional(),
  env_vars: z.string(),
  started_at: z.string(),
  finished_at: z.string().optional(),
});

export const logStatsSchema = z.object({
  success: z.number(),
  failed: z.number(),
  timeout: z.number(),
  cancelled: z.number(),
  running: z.number(),
});

export type LogStatus = z.infer<typeof logStatusSchema>;
export type LogResponseData = z.infer<typeof logResponseSchema>;
export type LogStatsData = z.infer<typeof logStatsSchema>;
