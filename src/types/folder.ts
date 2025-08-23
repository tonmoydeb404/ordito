export interface Folder {
  path: string;
  name: string;
  parent_path?: string;
  created_at: Date;
}

export interface FolderNavigationState {
  current_path: string;
  breadcrumbs: Array<{ name: string; path: string }>;
}

export type CreateFolderInput = Omit<Folder, 'created_at'>;