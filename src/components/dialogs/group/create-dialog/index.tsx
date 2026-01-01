/**
 * Dialog component for creating new groups
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
import { createGroupFormSchema, type CreateGroupFormData } from "@/schemas";
import { useCreateGroupMutation } from "@/store/api/groups-api";
import type { GroupResponse } from "@/store/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { FolderPlus } from "lucide-react";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

interface CreateGroupDialogProps {
  groups: GroupResponse[];
}

export function CreateGroupDialog({ groups }: CreateGroupDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [createGroup] = useCreateGroupMutation();

  const methods = useForm<CreateGroupFormData>({
    resolver: zodResolver(createGroupFormSchema),
    defaultValues: {
      title: "",
      parentId: "none",
    },
  });

  const handleSubmit = async (data: CreateGroupFormData) => {
    try {
      await createGroup({
        title: data.title,
        parent_id: data.parentId === "none" ? undefined : data.parentId,
      }).unwrap();
      methods.reset();
      setIsOpen(false);
      toast.success("Group created successfully");
    } catch (error) {
      toast.error("Failed to create group");
    }
  };

  const selectOptions = [
    { label: "No parent", value: "none" },
    ...groups.map((group) => ({
      label: group.title,
      value: group.id,
    })),
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="px-3 py-2 text-xs w-full"
          data-testid="button-new-folder"
        >
          <FolderPlus className="w-3 h-3" />
          New Folder
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Folder</DialogTitle>
        </DialogHeader>
        <FormProvider {...methods}>
          <form
            onSubmit={methods.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormInputField
              name="title"
              label="Folder Name"
              placeholder="Enter folder name"
              required
            />
            <FormSelectField
              name="parentId"
              label="Parent Folder"
              options={selectOptions}
              placeholder="Select parent folder (optional)"
            />
            <div className="flex gap-2">
              <Button
                type="submit"
                className="flex-1"
                data-testid="button-create-folder"
              >
                Create
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                data-testid="button-cancel-folder"
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
