"use client";

import { Button } from "@/components/ui/button";
import {
  FormInputField,
  FormSwitchField,
  FormTextareaField,
} from "@/lib/react-hook-form";
import type { UpdateCommandFormData } from "@/schemas/command.schema";
import { updateCommandSchema } from "@/schemas/command.schema";
import type { CommandResponse } from "@/store/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { open } from "@tauri-apps/plugin-dialog";
import { FolderOpen } from "lucide-react";
import React from "react";
import { FormProvider, useForm } from "react-hook-form";

interface CommandFormProps {
  command: CommandResponse;
  onChange: (command: CommandResponse) => void;
}

export default function CommandForm({ command, onChange }: CommandFormProps) {
  const methods = useForm<UpdateCommandFormData>({
    resolver: zodResolver(updateCommandSchema),
    defaultValues: {
      id: command.id,
      command_group_id: command.command_group_id,
      title: command.title,
      value: command.value,
      working_dir: command.working_dir,
      timeout: command.timeout || 30,
      run_in_background: command.run_in_background || false,
      is_favourite: command.is_favourite || false,
      env_vars: command.env_vars || "{}",
    },
    mode: "onChange",
  });

  // Watch for form changes and propagate to parent
  React.useEffect(() => {
    const subscription = methods.watch((formData) => {
      onChange({
        ...command,
        ...formData,
      });
    });
    return () => subscription.unsubscribe();
  }, [command, onChange, methods]);

  return (
    <FormProvider {...methods}>
      <div className="space-y-4 max-w-2xl">
        <FormInputField<UpdateCommandFormData>
          name="title"
          label="Command Title"
          data-testid="input-command-name-edit"
        />

        <FormTextareaField<UpdateCommandFormData>
          name="value"
          label="Command"
          rows={4}
          className="font-mono text-sm syntax-highlight"
          data-testid="textarea-command-script"
        />

        <FormInputField<UpdateCommandFormData>
          name="working_dir"
          label="Working Directory"
          placeholder="~/projects/my-app"
          data-testid="input-working-directory"
          rightAction={
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={async () => {
                const selected = await open({ directory: true });
                if (selected && typeof selected === "string") {
                  methods.setValue("working_dir", selected);
                }
              }}
            >
              <FolderOpen className="h-4 w-4" />
            </Button>
          }
        />

        <FormInputField<UpdateCommandFormData>
          name="timeout"
          label="Timeout (seconds)"
          type="number"
          data-testid="input-timeout"
          encode={(v) => (v ? parseInt(v, 10) : 30)}
          decode={(v) => String(v)}
        />

        <div className="flex items-center gap-4 py-2">
          <FormSwitchField<UpdateCommandFormData>
            name="run_in_background"
            label="Run in Background"
            orientation="horizontal"
            data-testid="checkbox-run-background"
            className="flex-row-reverse"
          />
          <FormSwitchField<UpdateCommandFormData>
            name="is_favourite"
            label="Add to Favorites"
            orientation="horizontal"
            data-testid="checkbox-favorite"
            className="flex-row-reverse"
          />
        </div>
      </div>
    </FormProvider>
  );
}
