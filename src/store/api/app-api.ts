import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { ApiService } from "../../services/api";
import { AppInfo } from "../../types";

export const appApi = createApi({
  reducerPath: "appApi",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["AppInfo", "Config", "NotificationPermission"],
  endpoints: (builder) => ({
    // Config endpoints
    importConfig: builder.mutation<void, string>({
      queryFn: async (configJson) => {
        try {
          await ApiService.importConfig(configJson);
          return { data: undefined };
        } catch (error) {
          return { error: { status: "FETCH_ERROR", error: String(error) } };
        }
      },
      invalidatesTags: ["Config"],
    }),

    exportConfig: builder.query<string, void>({
      queryFn: async () => {
        try {
          const data = await ApiService.exportConfig();
          return { data };
        } catch (error) {
          return { error: { status: "FETCH_ERROR", error: String(error) } };
        }
      },
      providesTags: ["Config"],
    }),

    // App info endpoints
    getAppInfo: builder.query<AppInfo, void>({
      queryFn: async () => {
        try {
          const data = await ApiService.getAppInfo();
          return { data };
        } catch (error) {
          return { error: { status: "FETCH_ERROR", error: String(error) } };
        }
      },
      providesTags: ["AppInfo"],
    }),

    // Notification endpoints
    sendTestNotification: builder.mutation<
      void,
      { title?: string; body?: string }
    >({
      queryFn: async ({ title, body }) => {
        try {
          await ApiService.sendTestNotification(title || "Test", body || "Test notification");
          return { data: undefined };
        } catch (error) {
          return { error: { status: "FETCH_ERROR", error: String(error) } };
        }
      },
    }),

    checkNotificationPermission: builder.query<boolean, void>({
      queryFn: async () => {
        try {
          const data = await ApiService.checkNotificationPermission();
          return { data };
        } catch (error) {
          return { error: { status: "FETCH_ERROR", error: String(error) } };
        }
      },
      providesTags: ["NotificationPermission"],
    }),

    requestNotificationPermission: builder.mutation<void, void>({
      queryFn: async () => {
        try {
          await ApiService.requestNotificationPermission();
          return { data: undefined };
        } catch (error) {
          return { error: { status: "FETCH_ERROR", error: String(error) } };
        }
      },
      invalidatesTags: ["NotificationPermission"],
    }),
  }),
});

export const {
  useImportConfigMutation,
  useExportConfigQuery,
  useLazyExportConfigQuery,
  useGetAppInfoQuery,
  useSendTestNotificationMutation,
  useCheckNotificationPermissionQuery,
  useRequestNotificationPermissionMutation,
} = appApi;