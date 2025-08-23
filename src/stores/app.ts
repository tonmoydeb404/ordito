import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { AppConfig, AppSettings, AppInfo, AppState, Theme, LogLevel } from '../types';
import { ApiService } from '../services/api';

interface AppActions {
  // Config actions
  importConfig: (configJson: string) => Promise<void>;
  exportConfig: () => Promise<string>;
  loadAppInfo: () => Promise<void>;

  // Settings actions
  updateTheme: (theme: Theme) => void;
  updateLogLevel: (logLevel: LogLevel) => void;
  updateAutoStart: (autoStart: boolean) => void;
  updateMinimizeToTray: (minimizeToTray: boolean) => void;
  updateShowNotifications: (showNotifications: boolean) => void;

  // State actions
  setLoading: (loading: boolean) => void;
  setError: (error?: string) => void;
  clearError: () => void;
  initializeApp: () => Promise<void>;
}

const defaultSettings: AppSettings = {
  auto_start: false,
  minimize_to_tray: true,
  show_notifications: true,
  theme: Theme.System,
  log_level: LogLevel.Info,
};

const initialState: AppState = {
  config: {
    commands: [],
    groups: [],
    schedules: [],
    settings: defaultSettings,
    version: '0.1.0',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  settings: defaultSettings,
  appInfo: undefined,
  isLoading: false,
  error: undefined,
};

export const useAppStore = create<AppState & AppActions>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // Config actions
        importConfig: async (configJson: string) => {
          set({ isLoading: true, error: undefined });
          try {
            await ApiService.importConfig(configJson);
            const config: AppConfig = JSON.parse(configJson);
            set({ 
              config,
              settings: config.settings,
              isLoading: false 
            });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to import configuration';
            set({ error: errorMessage, isLoading: false });
            throw new Error(errorMessage);
          }
        },

        exportConfig: async () => {
          set({ isLoading: true, error: undefined });
          try {
            const configJson = await ApiService.exportConfig();
            set({ isLoading: false });
            return configJson;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to export configuration';
            set({ error: errorMessage, isLoading: false });
            throw new Error(errorMessage);
          }
        },

        loadAppInfo: async () => {
          try {
            const appInfo = await ApiService.getAppInfo();
            set({ appInfo });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to load app info';
            set({ error: errorMessage });
          }
        },

        // Settings actions
        updateTheme: (theme: Theme) => {
          set(state => ({
            settings: { ...state.settings, theme },
            config: {
              ...state.config,
              settings: { ...state.config.settings, theme },
              updated_at: new Date().toISOString(),
            }
          }));
        },

        updateLogLevel: (logLevel: LogLevel) => {
          set(state => ({
            settings: { ...state.settings, log_level: logLevel },
            config: {
              ...state.config,
              settings: { ...state.config.settings, log_level: logLevel },
              updated_at: new Date().toISOString(),
            }
          }));
        },

        updateAutoStart: (autoStart: boolean) => {
          set(state => ({
            settings: { ...state.settings, auto_start: autoStart },
            config: {
              ...state.config,
              settings: { ...state.config.settings, auto_start: autoStart },
              updated_at: new Date().toISOString(),
            }
          }));
        },

        updateMinimizeToTray: (minimizeToTray: boolean) => {
          set(state => ({
            settings: { ...state.settings, minimize_to_tray: minimizeToTray },
            config: {
              ...state.config,
              settings: { ...state.config.settings, minimize_to_tray: minimizeToTray },
              updated_at: new Date().toISOString(),
            }
          }));
        },

        updateShowNotifications: (showNotifications: boolean) => {
          set(state => ({
            settings: { ...state.settings, show_notifications: showNotifications },
            config: {
              ...state.config,
              settings: { ...state.config.settings, show_notifications: showNotifications },
              updated_at: new Date().toISOString(),
            }
          }));
        },

        // State actions
        setLoading: (loading: boolean) => {
          set({ isLoading: loading });
        },

        setError: (error?: string) => {
          set({ error });
        },

        clearError: () => {
          set({ error: undefined });
        },

        initializeApp: async () => {
          set({ isLoading: true, error: undefined });
          try {
            await get().loadAppInfo();
            set({ isLoading: false });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to initialize app';
            set({ error: errorMessage, isLoading: false });
          }
        },
      }),
      {
        name: 'app-store',
        partialize: (state) => ({ 
          settings: state.settings,
          config: state.config 
        }),
      }
    ),
    { name: 'app-store' }
  )
);