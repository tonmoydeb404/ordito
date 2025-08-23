import { useState, useEffect } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { AppLayout } from '@/components/layout/app-layout';
import { CommandGrid } from '@/components/command/command-grid';
import { CommandForm } from '@/components/command/command-form';
import { CommandPalette } from '@/components/features/command-palette';
import { ThemeProvider } from '@/components/features/theme-provider';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { useCommands } from '@/hooks/use-commands';
import { useFolders } from '@/hooks/use-folders';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { Command, CreateCommandInput } from '@/types/command';

const App = () => {
  const [isCommandFormOpen, setIsCommandFormOpen] = useState(false);
  const [editingCommand, setEditingCommand] = useState<Command | undefined>();
  const [deletingCommandId, setDeletingCommandId] = useState<string | undefined>();
  
  const {
    commands,
    isLoading,
    fetchCommands,
    createCommand,
    updateCommand,
    deleteCommand,
    executeCommand,
    getCurrentFolderCommands,
  } = useCommands();
  
  const { fetchFolders, getCurrentFolderChildren } = useFolders();
  
  useKeyboardShortcuts({
    onOpenCommandPalette: () => {},
    onCreateCommand: () => setIsCommandFormOpen(true),
    onOpenSettings: () => {},
  });
  
  useEffect(() => {
    fetchCommands();
    fetchFolders();
  }, [fetchCommands, fetchFolders]);
  
  const currentFolderCommands = getCurrentFolderCommands();
  
  const handleCreateCommand = () => {
    setEditingCommand(undefined);
    setIsCommandFormOpen(true);
  };
  
  const handleEditCommand = (command: Command) => {
    setEditingCommand(command);
    setIsCommandFormOpen(true);
  };
  
  const handleDeleteCommand = (commandId: string) => {
    setDeletingCommandId(commandId);
  };
  
  const confirmDeleteCommand = async () => {
    if (deletingCommandId) {
      await deleteCommand(deletingCommandId);
      setDeletingCommandId(undefined);
    }
  };
  
  const handleDuplicateCommand = async (command: Command) => {
    const duplicatedCommand: CreateCommandInput = {
      name: `${command.name} (Copy)`,
      description: command.description,
      script: command.script,
      folder_path: command.folder_path,
      tags: command.tags,
    };
    await createCommand(duplicatedCommand);
  };
  
  const handleSubmitCommand = async (data: CreateCommandInput) => {
    if (editingCommand) {
      await updateCommand(editingCommand.id, data);
    } else {
      await createCommand(data);
    }
  };
  
  const deletingCommand = commands.find(cmd => cmd.id === deletingCommandId);
  
  return (
    <ThemeProvider defaultTheme="system" storageKey="ordito-ui-theme">
      <AppLayout
        onCreateCommand={handleCreateCommand}
        onOpenSettings={() => {}}
      >
        <CommandGrid
          commands={currentFolderCommands}
          onExecute={executeCommand}
          onEdit={handleEditCommand}
          onDelete={handleDeleteCommand}
          onDuplicate={handleDuplicateCommand}
          onCreateNew={handleCreateCommand}
          isLoading={isLoading}
        />
        
        <CommandForm
          open={isCommandFormOpen}
          onOpenChange={setIsCommandFormOpen}
          onSubmit={handleSubmitCommand}
          command={editingCommand}
          title={editingCommand ? 'Edit Command' : 'Create Command'}
          description={editingCommand ? 'Update the command details.' : 'Add a new command to execute.'}
        />
        
        <ConfirmationDialog
          open={!!deletingCommandId}
          onOpenChange={(open) => !open && setDeletingCommandId(undefined)}
          title="Delete Command"
          description={`Are you sure you want to delete "${deletingCommand?.name}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          variant="destructive"
          onConfirm={confirmDeleteCommand}
        />
        
        <CommandPalette onOpenSettings={() => {}} />
      </AppLayout>
      <Toaster />
    </ThemeProvider>
  );
};

export default App;
