import { useCallback } from 'react';
import { toast } from 'sonner';
import { useSettingsStore } from '@/store/settings-store';
import { AppSettings } from '@/types/settings';

export function useSettings() {
  const {
    settings,
    updateSettings: storeUpdateSettings,
    resetSettings: storeResetSettings,
  } = useSettingsStore();
  
  const updateSettings = useCallback(async (updates: Partial<AppSettings>) => {
    try {
      storeUpdateSettings(updates);
      toast.success('Settings updated successfully');
    } catch (error) {
      toast.error('Failed to update settings');
    }
  }, [storeUpdateSettings]);
  
  const resetSettings = useCallback(async () => {
    try {
      storeResetSettings();
      toast.success('Settings reset to defaults');
    } catch (error) {
      toast.error('Failed to reset settings');
    }
  }, [storeResetSettings]);
  
  const toggleTheme = useCallback(() => {
    const newTheme = settings.theme === 'light' ? 'dark' : 'light';
    updateSettings({ theme: newTheme });
  }, [settings.theme, updateSettings]);
  
  return {
    settings,
    updateSettings,
    resetSettings,
    toggleTheme,
  };
}