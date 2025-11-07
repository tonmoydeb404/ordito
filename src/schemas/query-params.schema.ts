import { z } from "zod";
import { logStatusSchema } from "./log.schema";

/**
 * Zod schemas for Query Parameter types
 */

export const listCommandsParamsSchema = z.object({
  group_id: z.string().optional(),
});

export const searchCommandsParamsSchema = z.object({
  query: z.string().min(1, "Search query is required"),
});

export const listSchedulesParamsSchema = z.object({
  command_id: z.string().optional(),
});

export const listLogsParamsSchema = z.object({
  command_id: z.string().optional(),
  status: logStatusSchema.optional(),
});

export const cleanupLogsParamsSchema = z.object({
  days: z.number().positive("Days must be positive"),
});

export type ListCommandsParams = z.infer<typeof listCommandsParamsSchema>;
export type SearchCommandsParams = z.infer<typeof searchCommandsParamsSchema>;
export type ListSchedulesParams = z.infer<typeof listSchedulesParamsSchema>;
export type ListLogsParams = z.infer<typeof listLogsParamsSchema>;
export type CleanupLogsParams = z.infer<typeof cleanupLogsParamsSchema>;
