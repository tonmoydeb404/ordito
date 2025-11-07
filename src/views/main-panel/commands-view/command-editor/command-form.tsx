"use client";

import React from "react";
import {
  FormInputField,
  FormSwitchField,
  FormTextareaField,
} from "@/lib/react-hook-form";
import { updateCommandSchema } from "@/schemas/command.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import type { UpdateCommandFormData } from "@/schemas/command.schema";
import type { CommandResponse } from "@/store/types";

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
      } as CommandResponse);
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

        <div className="grid grid-cols-2 gap-4">
          <FormInputField<UpdateCommandFormData>
            name="working_dir"
            label="Working Directory"
            placeholder="~/projects/my-app"
            data-testid="input-working-directory"
          />
          <FormInputField<UpdateCommandFormData>
            name="timeout"
            label="Timeout (seconds)"
            type="number"
            data-testid="input-timeout"
            encode={(v) => (v ? parseInt(v, 10) : 30)}
            decode={(v) => String(v)}
          />
        </div>

        <div className="flex items-center gap-4">
          <FormSwitchField<UpdateCommandFormData>
            name="run_in_background"
            label="Run in Background"
            orientation="horizontal"
            data-testid="checkbox-run-background"
          />
          <FormSwitchField<UpdateCommandFormData>
            name="is_favourite"
            label="Add to Favorites"
            orientation="horizontal"
            data-testid="checkbox-favorite"
          />
        </div>
      </div>
    </FormProvider>
  );
}
