import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppSettings } from '@/types/settings';

interface SettingsStore {
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;
  resetSettings: () => void;
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  auto_save: true,
  show_execution_time: true,
  default_shell: 'bash',
  enable_notifications: true,
  max_output_lines: 1000,
  command_timeout: 30000,
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      settings: DEFAULT_SETTINGS,
      
      updateSettings: (updates) => {
        set(state => ({
          settings: { ...state.settings, ...updates }
        }));
      },
      
      resetSettings: () => {
        set({ settings: DEFAULT_SETTINGS });
      },
    }),
    {
      name: 'ordito-settings',
    }
  )
);