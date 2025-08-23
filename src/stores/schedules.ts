import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Schedule, SchedulesState, CreateScheduleRequest, UpdateScheduleRequest } from '../types';
import { ApiService } from '../services/api';

interface SchedulesActions {
  // Schedule actions
  loadSchedules: () => Promise<void>;
  createSchedule: (request: CreateScheduleRequest) => Promise<Schedule>;
  updateSchedule: (request: UpdateScheduleRequest) => Promise<Schedule>;
  deleteSchedule: (id: string) => Promise<void>;
  toggleSchedule: (id: string) => Promise<Schedule>;
  loadNextExecutions: (limit?: number) => Promise<void>;
  setSelectedSchedule: (schedule?: Schedule) => void;

  // Utility actions
  validateCronExpression: (expression: string) => Promise<boolean>;

  // State actions
  setLoading: (loading: boolean) => void;
  setError: (error?: string) => void;
  clearError: () => void;
}

const initialState: SchedulesState = {
  schedules: [],
  selectedSchedule: undefined,
  nextExecutions: [],
  isLoading: false,
  error: undefined,
};

export const useSchedulesStore = create<SchedulesState & SchedulesActions>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Schedule actions
      loadSchedules: async () => {
        set({ isLoading: true, error: undefined });
        try {
          const schedules = await ApiService.getSchedules();
          set({ schedules, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to load schedules',
            isLoading: false 
          });
        }
      },

      createSchedule: async (request: CreateScheduleRequest) => {
        set({ isLoading: true, error: undefined });
        try {
          const schedule = await ApiService.createSchedule(request);
          set(state => ({ 
            schedules: [...state.schedules, schedule],
            isLoading: false 
          }));
          return schedule;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to create schedule';
          set({ error: errorMessage, isLoading: false });
          throw new Error(errorMessage);
        }
      },

      updateSchedule: async (request: UpdateScheduleRequest) => {
        set({ isLoading: true, error: undefined });
        try {
          const updatedSchedule = await ApiService.updateSchedule(request);
          set(state => ({
            schedules: state.schedules.map(schedule => 
              schedule.id === request.id ? updatedSchedule : schedule
            ),
            selectedSchedule: state.selectedSchedule?.id === request.id ? updatedSchedule : state.selectedSchedule,
            isLoading: false
          }));
          return updatedSchedule;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update schedule';
          set({ error: errorMessage, isLoading: false });
          throw new Error(errorMessage);
        }
      },

      deleteSchedule: async (id: string) => {
        set({ isLoading: true, error: undefined });
        try {
          await ApiService.deleteSchedule(id);
          set(state => ({
            schedules: state.schedules.filter(schedule => schedule.id !== id),
            selectedSchedule: state.selectedSchedule?.id === id ? undefined : state.selectedSchedule,
            isLoading: false
          }));
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to delete schedule';
          set({ error: errorMessage, isLoading: false });
          throw new Error(errorMessage);
        }
      },

      toggleSchedule: async (id: string) => {
        set({ isLoading: true, error: undefined });
        try {
          const updatedSchedule = await ApiService.toggleSchedule(id);
          set(state => ({
            schedules: state.schedules.map(schedule => 
              schedule.id === id ? updatedSchedule : schedule
            ),
            selectedSchedule: state.selectedSchedule?.id === id ? updatedSchedule : state.selectedSchedule,
            isLoading: false
          }));
          return updatedSchedule;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to toggle schedule';
          set({ error: errorMessage, isLoading: false });
          throw new Error(errorMessage);
        }
      },

      loadNextExecutions: async (limit?: number) => {
        try {
          const nextExecutions = await ApiService.getNextScheduledExecutions(limit);
          set({ nextExecutions });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to load next executions'
          });
        }
      },

      setSelectedSchedule: (schedule?: Schedule) => {
        set({ selectedSchedule: schedule });
      },

      // Utility actions
      validateCronExpression: async (expression: string) => {
        try {
          return await ApiService.validateCronExpression(expression);
        } catch (error) {
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
    }),
    { name: 'schedules-store' }
  )
);