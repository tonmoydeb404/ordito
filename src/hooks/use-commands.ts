import { useCallback } from 'react';
import { toast } from 'sonner';
import { useCommandStore } from '@/store/command-store';
import { useFolderStore } from '@/store/folder-store';
import { useExecutionStore } from '@/store/execution-store';
import type { Command, CreateCommandInput } from '@/types/command';

export function useCommands() {
  const {
    commands,
    isLoading,
    fetchCommands,
    createCommand: storeCreateCommand,
    updateCommand: storeUpdateCommand,
    deleteCommand: storeDeleteCommand,
    executeCommand: storeExecuteCommand,
    selectCommand,
    selectedCommand
  } = useCommandStore();
  
  const { currentPath } = useFolderStore();
  const { startExecution } = useExecutionStore();
  
  const createCommand = useCallback(async (input: CreateCommandInput) => {
    try {
      await storeCreateCommand({
        ...input,
        folder_path: currentPath
      });
      toast.success('Command created successfully');
    } catch (error) {
      toast.error('Failed to create command');
    }
  }, [storeCreateCommand, currentPath]);
  
  const executeCommand = useCallback(async (id: string) => {
    const command = commands.find(cmd => cmd.id === id);
    if (!command) {
      toast.error('Command not found');
      return;
    }
    
    try {
      startExecution(id, command.name);
      await storeExecuteCommand(id);
      toast.success(`"${command.name}" executed successfully`);
    } catch (error) {
      toast.error(`Failed to execute "${command.name}"`);
    }
  }, [commands, startExecution, storeExecuteCommand]);
  
  const updateCommand = useCallback(async (id: string, updates: Partial<Command>) => {
    try {
      await storeUpdateCommand(id, updates);
      toast.success('Command updated successfully');
    } catch (error) {
      toast.error('Failed to update command');
    }
  }, [storeUpdateCommand]);
  
  const deleteCommand = useCallback(async (id: string) => {
    try {
      await storeDeleteCommand(id);
      toast.success('Command deleted successfully');
    } catch (error) {
      toast.error('Failed to delete command');
    }
  }, [storeDeleteCommand]);
  
  const getCommandsByFolder = useCallback((folderPath: string) => 
    commands.filter(cmd => cmd.folder_path === folderPath)
  , [commands]);
  
  const getCurrentFolderCommands = useCallback(() => 
    getCommandsByFolder(currentPath)
  , [getCommandsByFolder, currentPath]);
  
  const searchCommands = useCallback((query: string) => {
    if (!query.trim()) return commands;
    
    const lowerQuery = query.toLowerCase();
    return commands.filter(cmd => 
      cmd.name.toLowerCase().includes(lowerQuery) ||
      cmd.description?.toLowerCase().includes(lowerQuery) ||
      cmd.script.toLowerCase().includes(lowerQuery) ||
      cmd.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }, [commands]);
  
  return {
    commands,
    selectedCommand,
    isLoading,
    fetchCommands,
    createCommand,
    updateCommand,
    deleteCommand,
    executeCommand,
    selectCommand,
    getCommandsByFolder,
    getCurrentFolderCommands,
    searchCommands,
  };
}