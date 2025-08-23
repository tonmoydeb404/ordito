import { create } from 'zustand';
import { Command, CommandStatus } from '@/types/command';
import { generateId, delay } from '@/lib/utils';
import { DUMMY_COMMANDS } from '@/lib/dummy-data';

interface CommandStore {
  commands: Command[];
  selectedCommand?: Command;
  isLoading: boolean;
  fetchCommands: () => Promise<void>;
  createCommand: (command: Omit<Command, 'id' | 'created_at' | 'updated_at' | 'status' | 'execution_count'>) => Promise<void>;
  updateCommand: (id: string, updates: Partial<Command>) => Promise<void>;
  deleteCommand: (id: string) => Promise<void>;
  selectCommand: (id: string) => void;
  executeCommand: (id: string) => Promise<void>;
}

export const useCommandStore = create<CommandStore>((set, get) => ({
  commands: [],
  selectedCommand: undefined,
  isLoading: false,
  
  fetchCommands: async () => {
    set({ isLoading: true });
    await delay(500);
    set({ commands: DUMMY_COMMANDS, isLoading: false });
  },
  
  createCommand: async (commandInput) => {
    const newCommand: Command = {
      ...commandInput,
      id: generateId(),
      status: CommandStatus.IDLE,
      created_at: new Date(),
      updated_at: new Date(),
      execution_count: 0,
    };
    
    await delay(200);
    set(state => ({ 
      commands: [...state.commands, newCommand] 
    }));
  },
  
  updateCommand: async (id, updates) => {
    await delay(200);
    set(state => ({
      commands: state.commands.map(cmd => 
        cmd.id === id 
          ? { ...cmd, ...updates, updated_at: new Date() } 
          : cmd
      ),
      selectedCommand: state.selectedCommand?.id === id 
        ? { ...state.selectedCommand, ...updates, updated_at: new Date() }
        : state.selectedCommand
    }));
  },
  
  deleteCommand: async (id) => {
    await delay(200);
    set(state => ({
      commands: state.commands.filter(cmd => cmd.id !== id),
      selectedCommand: state.selectedCommand?.id === id ? undefined : state.selectedCommand
    }));
  },
  
  selectCommand: (id) => {
    const command = get().commands.find(cmd => cmd.id === id);
    set({ selectedCommand: command });
  },
  
  executeCommand: async (id) => {
    set(state => ({
      commands: state.commands.map(cmd => 
        cmd.id === id 
          ? { 
              ...cmd, 
              status: CommandStatus.RUNNING,
              last_executed: new Date(),
              execution_count: cmd.execution_count + 1
            }
          : cmd
      )
    }));
    
    await delay(2000);
    
    const success = Math.random() > 0.3;
    
    set(state => ({
      commands: state.commands.map(cmd => 
        cmd.id === id 
          ? { 
              ...cmd, 
              status: success ? CommandStatus.SUCCESS : CommandStatus.FAILED,
            }
          : cmd
      )
    }));
  },
}));