import CommandEditorHeader from "./command-editor-header";
import CommandForm from "./command-form";
import EnvironmentVariablesSection from "./environment-variables-section";
import OutputPanel from "./output-panel";
import { useCommandEditor } from "./use-command-editor";

interface CommandEditorProps {
  commandId: string;
}

export default function CommandEditor({ commandId }: CommandEditorProps) {
  const {
    editedCommand,
    setEditedCommand,
    envVars,
    newEnvVar,
    setNewEnvVar,
    output,
    isLoading,
    isUpdating,
    isDeleting,
    handleSave,
    handleExecute,
    handleDelete,
    addEnvVar,
    removeEnvVar,
    updateEnvVar,
    clearOutput,
    copyOutput,
  } = useCommandEditor(commandId);

  if (isLoading || !editedCommand) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading command...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <CommandEditorHeader
        title={editedCommand.title}
        onExecute={handleExecute}
        onSave={handleSave}
        onDelete={handleDelete}
        isUpdating={isUpdating}
        isDeleting={isDeleting}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 p-4 overflow-y-auto scrollbar-thin">
          <CommandForm command={editedCommand} onChange={setEditedCommand} />

          <div className="mt-4">
            <EnvironmentVariablesSection
              envVars={envVars}
              newEnvVar={newEnvVar}
              onNewEnvVarChange={setNewEnvVar}
              onAddEnvVar={addEnvVar}
              onRemoveEnvVar={removeEnvVar}
              onUpdateEnvVar={updateEnvVar}
            />
          </div>
        </div>

        <OutputPanel
          output={output}
          onClear={clearOutput}
          onCopy={copyOutput}
        />
      </div>
    </div>
  );
}
