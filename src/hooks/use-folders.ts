import { useCallback } from 'react';
import { toast } from 'sonner';
import { useFolderStore } from '@/store/folder-store';

export function useFolders() {
  const {
    currentPath,
    folders,
    breadcrumbs,
    isLoading,
    fetchFolders,
    navigateToFolder,
    createFolder: storeCreateFolder,
    deleteFolder: storeDeleteFolder,
  } = useFolderStore();
  
  const createFolder = useCallback(async (name: string) => {
    try {
      await storeCreateFolder(name);
      toast.success('Folder created successfully');
    } catch (error) {
      toast.error('Failed to create folder');
    }
  }, [storeCreateFolder]);
  
  const deleteFolder = useCallback(async (path: string) => {
    try {
      await storeDeleteFolder(path);
      toast.success('Folder deleted successfully');
    } catch (error) {
      toast.error('Failed to delete folder');
    }
  }, [storeDeleteFolder]);
  
  const getFoldersByParent = useCallback((parentPath: string) => 
    folders.filter(folder => folder.parent_path === parentPath)
  , [folders]);
  
  const getCurrentFolderChildren = useCallback(() => 
    getFoldersByParent(currentPath)
  , [getFoldersByParent, currentPath]);
  
  return {
    currentPath,
    folders,
    breadcrumbs,
    isLoading,
    fetchFolders,
    navigateToFolder,
    createFolder,
    deleteFolder,
    getFoldersByParent,
    getCurrentFolderChildren,
  };
}