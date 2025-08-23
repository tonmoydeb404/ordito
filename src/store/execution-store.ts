import { create } from 'zustand';
import { CommandExecution } from '@/types/execution';
import { CommandStatus } from '@/types/command';
import { generateId } from '@/lib/utils';

interface ExecutionStore {
  currentExecution?: CommandExecution;
  executionHistory: CommandExecution[];
  isExecuting: boolean;
  output: string[];
  startExecution: (commandId: string, commandName: string) => void;
  appendOutput: (line: string) => void;
  completeExecution: (exitCode: number) => void;
  clearOutput: () => void;
  getExecutionById: (id: string) => CommandExecution | undefined;
}

export const useExecutionStore = create<ExecutionStore>((set, get) => ({
  currentExecution: undefined,
  executionHistory: [],
  isExecuting: false,
  output: [],
  
  startExecution: (commandId, commandName) => {
    const execution: CommandExecution = {
      id: generateId(),
      command_id: commandId,
      command_name: commandName,
      status: CommandStatus.RUNNING,
      output: '',
      start_time: new Date(),
      exit_code: undefined,
    };
    
    set({
      currentExecution: execution,
      isExecuting: true,
      output: [`Starting execution of "${commandName}"...`],
    });
  },
  
  appendOutput: (line) => {
    set(state => ({
      output: [...state.output, line],
      currentExecution: state.currentExecution ? {
        ...state.currentExecution,
        output: state.currentExecution.output + line + '\n'
      } : undefined
    }));
  },
  
  completeExecution: (exitCode) => {
    const { currentExecution } = get();
    if (!currentExecution) return;
    
    const completedExecution: CommandExecution = {
      ...currentExecution,
      status: exitCode === 0 ? CommandStatus.SUCCESS : CommandStatus.FAILED,
      end_time: new Date(),
      exit_code: exitCode,
    };
    
    set(state => ({
      currentExecution: undefined,
      isExecuting: false,
      executionHistory: [completedExecution, ...state.executionHistory.slice(0, 49)],
      output: [...state.output, `Process exited with code ${exitCode}`],
    }));
  },
  
  clearOutput: () => {
    set({ output: [] });
  },
  
  getExecutionById: (id) => {
    const { executionHistory, currentExecution } = get();
    return currentExecution?.id === id 
      ? currentExecution 
      : executionHistory.find(exec => exec.id === id);
  },
}));