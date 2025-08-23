import { useCallback } from 'react';
import { useExecutionStore } from '@/store/execution-store';

export function useExecution() {
  const {
    currentExecution,
    executionHistory,
    isExecuting,
    output,
    startExecution,
    appendOutput,
    completeExecution,
    clearOutput,
    getExecutionById,
  } = useExecutionStore();
  
  const getRecentExecutions = useCallback((limit: number = 10) => 
    executionHistory.slice(0, limit)
  , [executionHistory]);
  
  const getExecutionsByCommand = useCallback((commandId: string) => 
    executionHistory.filter(exec => exec.command_id === commandId)
  , [executionHistory]);
  
  return {
    currentExecution,
    executionHistory,
    isExecuting,
    output,
    startExecution,
    appendOutput,
    completeExecution,
    clearOutput,
    getExecutionById,
    getRecentExecutions,
    getExecutionsByCommand,
  };
}