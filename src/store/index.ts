import { configureStore } from "@reduxjs/toolkit";
import { appApi } from "./api/app-api";
import { commandsApi } from "./api/commands-api";
import { executionsApi } from "./api/executions-api";
import { schedulesApi } from "./api/schedules-api";
import { modalsSlice } from "./slices/modals-slice";

export const store = configureStore({
  reducer: {
    [modalsSlice.name]: modalsSlice.reducer,
    [commandsApi.reducerPath]: commandsApi.reducer,
    [schedulesApi.reducerPath]: schedulesApi.reducer,
    [executionsApi.reducerPath]: executionsApi.reducer,
    [appApi.reducerPath]: appApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(commandsApi.middleware)
      .concat(schedulesApi.middleware)
      .concat(executionsApi.middleware)
      .concat(appApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
