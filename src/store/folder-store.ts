import { create } from 'zustand';
import { Folder } from '@/types/folder';
import { delay } from '@/lib/utils';
import { DUMMY_FOLDERS } from '@/lib/dummy-data';

interface FolderStore {
  currentPath: string;
  folders: Folder[];
  breadcrumbs: Array<{ name: string; path: string }>;
  isLoading: boolean;
  fetchFolders: () => Promise<void>;
  navigateToFolder: (path: string) => void;
  createFolder: (name: string) => Promise<void>;
  deleteFolder: (path: string) => Promise<void>;
}

const generateBreadcrumbs = (path: string): Array<{ name: string; path: string }> => {
  if (path === '/') return [{ name: 'Home', path: '/' }];
  
  const parts = path.split('/').filter(Boolean);
  const breadcrumbs = [{ name: 'Home', path: '/' }];
  
  let currentPath = '';
  parts.forEach(part => {
    currentPath += `/${part}`;
    breadcrumbs.push({
      name: part.charAt(0).toUpperCase() + part.slice(1),
      path: currentPath
    });
  });
  
  return breadcrumbs;
};

export const useFolderStore = create<FolderStore>((set, get) => ({
  currentPath: '/',
  folders: [],
  breadcrumbs: [{ name: 'Home', path: '/' }],
  isLoading: false,
  
  fetchFolders: async () => {
    set({ isLoading: true });
    await delay(300);
    set({ folders: DUMMY_FOLDERS, isLoading: false });
  },
  
  navigateToFolder: (path) => {
    set({
      currentPath: path,
      breadcrumbs: generateBreadcrumbs(path)
    });
  },
  
  createFolder: async (name) => {
    const { currentPath } = get();
    const newPath = currentPath === '/' ? `/${name}` : `${currentPath}/${name}`;
    
    const newFolder: Folder = {
      path: newPath,
      name,
      parent_path: currentPath === '/' ? undefined : currentPath,
      created_at: new Date(),
    };
    
    await delay(200);
    set(state => ({
      folders: [...state.folders, newFolder]
    }));
  },
  
  deleteFolder: async (path) => {
    await delay(200);
    set(state => ({
      folders: state.folders.filter(folder => !folder.path.startsWith(path))
    }));
  },
}));