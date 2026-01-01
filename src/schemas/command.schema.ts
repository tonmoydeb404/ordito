import { z } from "zod";

/**
 * Zod schemas for Command-related types
 */

// Simplified form schema for initial command creation (camelCase)
export const createCommandFormSchema = z.object({
  title: z.string().min(1, "Command name is required").trim(),
});

// Full DTO schema matching backend API
export const createCommandSchema = z.object({
  command_group_id: z.string().min(1, "Command group is required"),
  title: z.string().min(1, "Title is required").trim(),
  value: z.string().min(1, "Command value is required"),
  working_dir: z.string().min(1, "Working directory is required"),
  timeout: z.number().positive().optional(),
  run_in_background: z.boolean(),
  env_vars: z.string(), // JSON string
});

export const updateCommandSchema = z.object({
  id: z.string().min(1, "ID is required"),
  command_group_id: z.string().min(1, "Command group is required"),
  title: z.string().min(1, "Title is required").trim(),
  value: z.string().min(1, "Command value is required"),
  working_dir: z.string().min(1, "Working directory is required"),
  timeout: z.number().positive().optional(),
  run_in_background: z.boolean(),
  is_favourite: z.boolean(),
  env_vars: z.string(), // JSON string
});

export const commandResponseSchema = z.object({
  id: z.string(),
  command_group_id: z.string(),
  title: z.string(),
  value: z.string(),
  working_dir: z.string(),
  timeout: z.number().optional(),
  run_in_background: z.boolean(),
  is_favourite: z.boolean(),
  env_vars: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type CreateCommandFormData = z.infer<typeof createCommandFormSchema>;
export type CreateCommandDto = z.infer<typeof createCommandSchema>;
export type UpdateCommandFormData = z.infer<typeof updateCommandSchema>;
export type CommandResponseData = z.infer<typeof commandResponseSchema>;
