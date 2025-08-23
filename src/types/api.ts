export interface TauriResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export type Result<T> = { success: true; data: T } | { success: false; error: string };