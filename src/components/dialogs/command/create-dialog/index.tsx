/**
 * Dialog component for creating new commands
 */

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { FormInputField, FormSelectField } from "@/lib/react-hook-form";
import { createCommandFormSchema, type CreateCommandFormData } from "@/schemas";
import { useCreateCommandMutation } from "@/store/api/commands-api";
import type { GroupResponse } from "@/store/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { homeDir } from "@tauri-apps/api/path";
import { Plus } from "lucide-react";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

interface CreateCommandDialogProps {
  groups: GroupResponse[];
}

export function CreateCommandDialog({ groups }: CreateCommandDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [createCommand] = useCreateCommandMutation();

  const methods = useForm<CreateCommandFormData>({
    resolver: zodResolver(createCommandFormSchema),
    defaultValues: {
      title: "",
      folderId: "none",
    },
  });

  const handleSubmit = async (data: CreateCommandFormData) => {
    try {
      const homePath = await homeDir();
      await createCommand({
        title: data.title,
        value: 'echo "Hello World"', // Default script
        command_group_id: data.folderId === "none" ? "" : data.folderId,
        working_dir: homePath,
        run_in_background: false,
        env_vars: "{}",
      }).unwrap();
      methods.reset();
      setIsOpen(false);
      toast.success("Command created successfully");
    } catch (error) {
      console.log("Create command error:", error);
      toast.error("Failed to create command");
    }
  };

  const selectOptions = [
    { label: "No folder", value: "none" },
    ...groups.map((group) => ({
      label: group.title,
      value: group.id,
    })),
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="flex-1 bg-primary hover:bg-primary/80 text-primary-foreground text-xs font-medium"
          data-testid="button-new-command"
        >
          <Plus className="w-3 h-3 mr-1" />
          New Command
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Command</DialogTitle>
        </DialogHeader>
        <FormProvider {...methods}>
          <form
            onSubmit={methods.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormInputField
              name="title"
              label="Command Name"
              placeholder="Enter command name"
              required
            />
            <FormSelectField
              name="folderId"
              label="Folder"
              options={selectOptions}
              placeholder="Select folder (optional)"
            />
            <div className="flex gap-2">
              <Button
                type="submit"
                className="flex-1"
                data-testid="button-create-command"
              >
                Create
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                data-testid="button-cancel-command"
              >
                Cancel
              </Button>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
