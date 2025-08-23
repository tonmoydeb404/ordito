import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Command, CommandGroup, CommandsState, CreateCommandRequest, UpdateCommandRequest, CreateGroupRequest, UpdateGroupRequest } from '../types';
import { ApiService } from '../services/api';

interface CommandsActions {
  // Command actions
  loadCommands: () => Promise<void>;
  createCommand: (request: CreateCommandRequest) => Promise<Command>;
  updateCommand: (request: UpdateCommandRequest) => Promise<Command>;
  deleteCommand: (id: string) => Promise<void>;
  executeCommand: (id: string, detached?: boolean) => Promise<string>;
  searchCommands: (query: string) => Promise<void>;
  getFavoriteCommands: () => Promise<void>;
  getCommandsByGroup: (groupId?: string) => Promise<void>;
  setSelectedCommand: (command?: Command) => void;
  setSearchQuery: (query: string) => void;

  // Group actions
  loadGroups: () => Promise<void>;
  createGroup: (request: CreateGroupRequest) => Promise<CommandGroup>;
  updateGroup: (request: UpdateGroupRequest) => Promise<CommandGroup>;
  deleteGroup: (id: string) => Promise<void>;
  executeGroup: (id: string, detached?: boolean) => Promise<string[]>;
  setSelectedGroup: (group?: CommandGroup) => void;

  // State actions
  setLoading: (loading: boolean) => void;
  setError: (error?: string) => void;
  clearError: () => void;
}

const initialState: CommandsState = {
  commands: [],
  groups: [],
  selectedCommand: undefined,
  selectedGroup: undefined,
  searchQuery: '',
  isLoading: false,
  error: undefined,
};

export const useCommandsStore = create<CommandsState & CommandsActions>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Command actions
      loadCommands: async () => {
        set({ isLoading: true, error: undefined });
        try {
          const commands = await ApiService.getCommands();
          set({ commands, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to load commands',
            isLoading: false 
          });
        }
      },

      createCommand: async (request: CreateCommandRequest) => {
        set({ isLoading: true, error: undefined });
        try {
          const command = await ApiService.createCommand(request);
          set(state => ({ 
            commands: [...state.commands, command],
            isLoading: false 
          }));
          return command;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to create command';
          set({ error: errorMessage, isLoading: false });
          throw new Error(errorMessage);
        }
      },

      updateCommand: async (request: UpdateCommandRequest) => {
        set({ isLoading: true, error: undefined });
        try {
          const updatedCommand = await ApiService.updateCommand(request);
          set(state => ({
            commands: state.commands.map(cmd => 
              cmd.id === request.id ? updatedCommand : cmd
            ),
            selectedCommand: state.selectedCommand?.id === request.id ? updatedCommand : state.selectedCommand,
            isLoading: false
          }));
          return updatedCommand;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update command';
          set({ error: errorMessage, isLoading: false });
          throw new Error(errorMessage);
        }
      },

      deleteCommand: async (id: string) => {
        set({ isLoading: true, error: undefined });
        try {
          await ApiService.deleteCommand(id);
          set(state => ({
            commands: state.commands.filter(cmd => cmd.id !== id),
            selectedCommand: state.selectedCommand?.id === id ? undefined : state.selectedCommand,
            isLoading: false
          }));
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to delete command';
          set({ error: errorMessage, isLoading: false });
          throw new Error(errorMessage);
        }
      },

      executeCommand: async (id: string, detached?: boolean) => {
        try {
          const executionId = await ApiService.executeCommand(id, detached);
          
          // Update execution count
          set(state => ({
            commands: state.commands.map(cmd => 
              cmd.id === id ? { 
                ...cmd, 
                execution_count: cmd.execution_count + 1,
                last_executed: new Date().toISOString()
              } : cmd
            )
          }));
          
          return executionId;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to execute command';
          set({ error: errorMessage });
          throw new Error(errorMessage);
        }
      },

      searchCommands: async (query: string) => {
        set({ isLoading: true, error: undefined, searchQuery: query });
        try {
          const commands = query ? await ApiService.searchCommands(query) : await ApiService.getCommands();
          set({ commands, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to search commands',
            isLoading: false 
          });
        }
      },

      getFavoriteCommands: async () => {
        set({ isLoading: true, error: undefined });
        try {
          const commands = await ApiService.getFavoriteCommands();
          set({ commands, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to load favorite commands',
            isLoading: false 
          });
        }
      },

      getCommandsByGroup: async (groupId?: string) => {
        set({ isLoading: true, error: undefined });
        try {
          const commands = await ApiService.getCommandsByGroup(groupId);
          set({ commands, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to load commands by group',
            isLoading: false 
          });
        }
      },

      setSelectedCommand: (command?: Command) => {
        set({ selectedCommand: command });
      },

      setSearchQuery: (query: string) => {
        set({ searchQuery: query });
      },

      // Group actions
      loadGroups: async () => {
        set({ isLoading: true, error: undefined });
        try {
          const groups = await ApiService.getCommandGroups();
          set({ groups, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to load groups',
            isLoading: false 
          });
        }
      },

      createGroup: async (request: CreateGroupRequest) => {
        set({ isLoading: true, error: undefined });
        try {
          const group = await ApiService.createCommandGroup(request);
          set(state => ({ 
            groups: [...state.groups, group],
            isLoading: false 
          }));
          return group;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to create group';
          set({ error: errorMessage, isLoading: false });
          throw new Error(errorMessage);
        }
      },

      updateGroup: async (request: UpdateGroupRequest) => {
        set({ isLoading: true, error: undefined });
        try {
          const updatedGroup = await ApiService.updateCommandGroup(request);
          set(state => ({
            groups: state.groups.map(group => 
              group.id === request.id ? updatedGroup : group
            ),
            selectedGroup: state.selectedGroup?.id === request.id ? updatedGroup : state.selectedGroup,
            isLoading: false
          }));
          return updatedGroup;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update group';
          set({ error: errorMessage, isLoading: false });
          throw new Error(errorMessage);
        }
      },

      deleteGroup: async (id: string) => {
        set({ isLoading: true, error: undefined });
        try {
          await ApiService.deleteCommandGroup(id);
          set(state => ({
            groups: state.groups.filter(group => group.id !== id),
            selectedGroup: state.selectedGroup?.id === id ? undefined : state.selectedGroup,
            isLoading: false
          }));
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to delete group';
          set({ error: errorMessage, isLoading: false });
          throw new Error(errorMessage);
        }
      },

      executeGroup: async (id: string, detached?: boolean) => {
        try {
          const executionIds = await ApiService.executeCommandGroup(id, detached);
          return executionIds;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to execute group';
          set({ error: errorMessage });
          throw new Error(errorMessage);
        }
      },

      setSelectedGroup: (group?: CommandGroup) => {
        set({ selectedGroup: group });
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
    { name: 'commands-store' }
  )
);