import { z } from "zod";

/**
 * Zod schemas for Group-related types
 */

// Form schema with camelCase for form fields
export const createGroupFormSchema = z.object({
  title: z.string().min(1, "Folder name is required").trim(),
  parentId: z.string(),
});

// DTO schema matching backend API
export const createGroupSchema = z.object({
  title: z.string().min(1, "Folder name is required").trim(),
  parent_id: z.string().optional(),
});

export const updateGroupSchema = z.object({
  id: z.string().min(1, "ID is required"),
  title: z.string().min(1, "Folder name is required").trim(),
  parent_id: z.string().optional(),
});

export const groupResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  parent_id: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type CreateGroupFormData = z.infer<typeof createGroupFormSchema>;
export type CreateGroupDto = z.infer<typeof createGroupSchema>;
export type UpdateGroupFormData = z.infer<typeof updateGroupSchema>;
export type GroupResponseData = z.infer<typeof groupResponseSchema>;
