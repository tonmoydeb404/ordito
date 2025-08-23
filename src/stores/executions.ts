import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { ApiService } from "../services/api";
import { CommandExecution, ExecutionsState } from "../types";

interface ExecutionsActions {
  // Execution actions
  loadRunningExecutions: () => Promise<void>;
  loadExecutionHistory: (limit?: number) => Promise<void>;
  getExecutionStatus: (executionId: string) => Promise<CommandExecution | null>;
  killExecution: (executionId: string) => Promise<void>;
  setSelectedExecution: (execution?: CommandExecution) => void;

  // Polling actions
  startPollingRunningExecutions: (intervalMs?: number) => void;
  stopPollingRunningExecutions: () => void;

  // State actions
  setLoading: (loading: boolean) => void;
  setError: (error?: string) => void;
  clearError: () => void;
}

const initialState: ExecutionsState = {
  runningExecutions: [],
  executionHistory: [],
  selectedExecution: undefined,
  isLoading: false,
  error: undefined,
};

let pollingInterval: NodeJS.Timeout | null = null;

export const useExecutionsStore = create<ExecutionsState & ExecutionsActions>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Execution actions
      loadRunningExecutions: async () => {
        set({ isLoading: true, error: undefined });
        try {
          const runningExecutions = await ApiService.getRunningExecutions();
          set({ runningExecutions, isLoading: false });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to load running executions",
            isLoading: false,
          });
        }
      },

      loadExecutionHistory: async (limit?: number) => {
        set({ isLoading: true, error: undefined });
        try {
          const executionHistory = await ApiService.getExecutionHistory(limit);
          set({ executionHistory, isLoading: false });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to load execution history",
            isLoading: false,
          });
        }
      },

      getExecutionStatus: async (executionId: string) => {
        try {
          const execution = await ApiService.getExecutionStatus(executionId);

          // Update the execution in running executions if it exists
          if (execution) {
            set((state) => ({
              runningExecutions: state.runningExecutions
                .map((exec) => (exec.id === executionId ? execution : exec))
                .filter((exec) => exec.is_running), // Remove completed executions
              executionHistory: execution.is_running
                ? state.executionHistory
                : [
                    execution,
                    ...state.executionHistory.filter(
                      (exec) => exec.id !== executionId
                    ),
                  ],
            }));
          }

          return execution;
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to get execution status";
          set({ error: errorMessage });
          throw new Error(errorMessage);
        }
      },

      killExecution: async (executionId: string) => {
        try {
          await ApiService.killExecution(executionId);

          // Remove from running executions
          set((state) => ({
            runningExecutions: state.runningExecutions.filter(
              (exec) => exec.id !== executionId
            ),
          }));

          // Refresh execution history to include the killed execution
          get().loadExecutionHistory();
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to kill execution";
          set({ error: errorMessage });
          throw new Error(errorMessage);
        }
      },

      setSelectedExecution: (execution?: CommandExecution) => {
        set({ selectedExecution: execution });
      },

      // Polling actions
      startPollingRunningExecutions: (intervalMs: number = 2000) => {
        // Clear existing interval
        if (pollingInterval) {
          clearInterval(pollingInterval);
        }

        // Start new polling interval
        pollingInterval = setInterval(async () => {
          try {
            const runningExecutions = await ApiService.getRunningExecutions();
            set({ runningExecutions });
          } catch (error) {
            console.error("Failed to poll running executions:", error);
          }
        }, intervalMs);
      },

      stopPollingRunningExecutions: () => {
        if (pollingInterval) {
          clearInterval(pollingInterval);
          pollingInterval = null;
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
    }),
    { name: "executions-store" }
  )
);
