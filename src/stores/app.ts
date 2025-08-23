import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { ApiService } from "../services/api";
import { NotificationService } from "../services/notifications";
import {
  AppConfig,
  AppSettings,
  AppState,
  LogLevel,
  NotificationSettings,
  Theme,
} from "../types";

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
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;

  // Notification actions
  sendTestNotification: (title?: string, body?: string) => Promise<boolean>;
  checkNotificationPermission: () => Promise<boolean>;
  requestNotificationPermission: () => Promise<boolean>;

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
  notification_settings: {
    schedule_success: true,
    schedule_failure: true,
    schedule_warnings: true,
    execution_success: false,
    execution_failure: true,
    system_alerts: true,
  },
  theme: Theme.System,
  log_level: LogLevel.Info,
};

const initialState: AppState = {
  config: {
    commands: [],
    groups: [],
    schedules: [],
    settings: defaultSettings,
    version: "0.1.0",
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
              isLoading: false,
            });
          } catch (error) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : "Failed to import configuration";
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
            const errorMessage =
              error instanceof Error
                ? error.message
                : "Failed to export configuration";
            set({ error: errorMessage, isLoading: false });
            throw new Error(errorMessage);
          }
        },

        loadAppInfo: async () => {
          try {
            const appInfo = await ApiService.getAppInfo();
            set({ appInfo });
          } catch (error) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : "Failed to load app info";
            set({ error: errorMessage });
          }
        },

        // Settings actions
        updateTheme: (theme: Theme) => {
          set((state) => ({
            settings: { ...state.settings, theme },
            config: {
              ...state.config,
              settings: { ...state.config.settings, theme },
              updated_at: new Date().toISOString(),
            },
          }));
        },

        updateLogLevel: (logLevel: LogLevel) => {
          set((state) => ({
            settings: { ...state.settings, log_level: logLevel },
            config: {
              ...state.config,
              settings: { ...state.config.settings, log_level: logLevel },
              updated_at: new Date().toISOString(),
            },
          }));
        },

        updateAutoStart: (autoStart: boolean) => {
          set((state) => ({
            settings: { ...state.settings, auto_start: autoStart },
            config: {
              ...state.config,
              settings: { ...state.config.settings, auto_start: autoStart },
              updated_at: new Date().toISOString(),
            },
          }));
        },

        updateMinimizeToTray: (minimizeToTray: boolean) => {
          set((state) => ({
            settings: { ...state.settings, minimize_to_tray: minimizeToTray },
            config: {
              ...state.config,
              settings: {
                ...state.config.settings,
                minimize_to_tray: minimizeToTray,
              },
              updated_at: new Date().toISOString(),
            },
          }));
        },

        updateShowNotifications: (showNotifications: boolean) => {
          set((state) => ({
            settings: {
              ...state.settings,
              show_notifications: showNotifications,
            },
            config: {
              ...state.config,
              settings: {
                ...state.config.settings,
                show_notifications: showNotifications,
              },
              updated_at: new Date().toISOString(),
            },
          }));
        },

        updateNotificationSettings: (
          notificationSettings: Partial<NotificationSettings>
        ) => {
          set((state) => {
            const updatedNotificationSettings = {
              ...state.settings.notification_settings,
              ...notificationSettings,
            };

            // Update the notification service settings
            NotificationService.getInstance().updateSettings(
              updatedNotificationSettings
            );

            return {
              settings: {
                ...state.settings,
                notification_settings: updatedNotificationSettings,
              },
              config: {
                ...state.config,
                settings: {
                  ...state.config.settings,
                  notification_settings: updatedNotificationSettings,
                },
                updated_at: new Date().toISOString(),
              },
            };
          });
        },

        // Notification actions
        sendTestNotification: async (title?: string, body?: string) => {
          try {
            return await NotificationService.getInstance().sendTestNotification(
              title,
              body
            );
          } catch (error) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : "Failed to send test notification";
            set({ error: errorMessage });
            return false;
          }
        },

        checkNotificationPermission: async () => {
          try {
            return await ApiService.checkNotificationPermission();
          } catch (error) {
            console.error("Failed to check notification permission:", error);
            return false;
          }
        },

        requestNotificationPermission: async () => {
          try {
            return await NotificationService.getInstance().requestPermission();
          } catch (error) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : "Failed to request notification permission";
            set({ error: errorMessage });
            return false;
          }
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
            const errorMessage =
              error instanceof Error
                ? error.message
                : "Failed to initialize app";
            set({ error: errorMessage, isLoading: false });
          }
        },
      }),
      {
        name: "app-store",
        partialize: (state) => ({
          settings: state.settings,
          config: state.config,
        }),
      }
    ),
    { name: "app-store" }
  )
);
