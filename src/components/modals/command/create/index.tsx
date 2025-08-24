import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  useCreateCommandMutation,
  useGetCommandGroupsQuery,
} from "@/store/api/commands-api";
import { useAppDispatch, useModalsSlice } from "@/store/hooks";
import { setCommandCreate } from "@/store/slices/modals-slice";
import { CreateCommandRequest, EnvironmentVariable } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { open } from "@tauri-apps/plugin-dialog";
import { FolderIcon, PlusIcon, XIcon } from "lucide-react";
import { ReactNode, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const createCommandSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  command: z.string().min(1, "Command is required"),
  working_directory: z.string().optional(),
  group_id: z.string().optional(),
  tags: z.array(z.string()).default([]),
  environment_variables: z
    .array(
      z.object({
        key: z.string().min(1, "Key is required"),
        value: z.string().min(1, "Value is required"),
      })
    )
    .default([]),
});

type CreateCommandForm = z.infer<typeof createCommandSchema>;

const defaultValues: CreateCommandForm = {
  name: "",
  description: "",
  command: "",
  working_directory: "",
  group_id: "",
  tags: [],
  environment_variables: [],
};

interface CommandCreateModalProps {
  trigger: ReactNode;
}

export function CommandCreateModal({ trigger }: CommandCreateModalProps) {
  const { command } = useModalsSlice();
  const dispatch = useAppDispatch();
  const [createCommand, { isLoading }] = useCreateCommandMutation();
  const { data: groups = [] } = useGetCommandGroupsQuery();
  const [tagsInput, setTagsInput] = useState("");

  const handleDirectoryPicker = async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
      });
      if (selected && typeof selected === "string") {
        setValue("working_directory", selected);
      }
    } catch (error) {
      console.error("Failed to open directory picker:", error);
      toast.error("Failed to open directory picker");
    }
  };

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(createCommandSchema),
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "environment_variables",
  });

  const currentTags = watch("tags");

  const onOpenChange = (value: boolean) => {
    dispatch(setCommandCreate(value));
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagsInput.trim()) {
      e.preventDefault();
      const newTags = [...(currentTags ?? []), tagsInput.trim()];
      setValue("tags", newTags);
      setTagsInput("");
    }
  };

  const handleRemoveTag = (index: number) => {
    const newTags = currentTags?.filter((_, i) => i !== index);
    setValue("tags", newTags);
  };

  const onSubmit = async (data: CreateCommandForm) => {
    try {
      const request: CreateCommandRequest = {
        ...data,
        environment_variables:
          data.environment_variables as EnvironmentVariable[],
      };

      await createCommand(request).unwrap();
      toast.success("Command created successfully");
      reset();
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to create command");
      console.error("Failed to create command:", error);
    }
  };

  const handleClose = () => {
    reset();
    setTagsInput("");
    onOpenChange(false);
  };

  console.log({ groups });

  return (
    <Sheet open={command.create} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Create New Command</SheetTitle>
          <SheetDescription>
            Add a new command to your collection
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Command name"
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              {...register("description")}
              placeholder="Brief description of the command"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="command">Command *</Label>
            <Input
              id="command"
              {...register("command")}
              placeholder="e.g., npm run dev"
              aria-invalid={!!errors.command}
            />
            {errors.command && (
              <p className="text-sm text-red-500">{errors.command.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="working_directory">Working Directory</Label>
            <div className="flex gap-2">
              <Input
                id="working_directory"
                {...register("working_directory")}
                placeholder="Path to execute command from"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleDirectoryPicker}
                className="shrink-0"
              >
                <FolderIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="group_id">Group</Label>
            <Select
              value={watch("group_id") || ""}
              onValueChange={(value) => setValue("group_id", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a group (optional)" />
              </SelectTrigger>
              <SelectContent>
                {/* <SelectItem value="">No group</SelectItem> */}
                {groups.map((group) => {
                  if (!group.id) return null;
                  return (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <Input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="Type a tag and press Enter"
            />
            {Array.isArray(currentTags) && currentTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {currentTags.map((tag, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 bg-secondary px-2 py-1 rounded-md text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(index)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <XIcon className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Environment Variables</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ key: "", value: "" })}
              >
                <PlusIcon className="h-4 w-4" />
                Add Variable
              </Button>
            </div>

            {fields.map((field, index) => (
              <div key={field.id} className="flex items-end gap-2">
                <div className="flex-1 space-y-1">
                  <Label htmlFor={`env-key-${index}`} className="text-xs">
                    Key
                  </Label>
                  <Input
                    id={`env-key-${index}`}
                    {...register(`environment_variables.${index}.key`)}
                    placeholder="Variable name"
                    aria-invalid={!!errors.environment_variables?.[index]?.key}
                  />
                  {errors.environment_variables?.[index]?.key && (
                    <p className="text-xs text-red-500">
                      {errors.environment_variables[index]?.key?.message}
                    </p>
                  )}
                </div>

                <div className="flex-1 space-y-1">
                  <Label htmlFor={`env-value-${index}`} className="text-xs">
                    Value
                  </Label>
                  <Input
                    id={`env-value-${index}`}
                    {...register(`environment_variables.${index}.value`)}
                    placeholder="Variable value"
                    aria-invalid={
                      !!errors.environment_variables?.[index]?.value
                    }
                  />
                  {errors.environment_variables?.[index]?.value && (
                    <p className="text-xs text-red-500">
                      {errors.environment_variables[index]?.value?.message}
                    </p>
                  )}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => remove(index)}
                  className="h-9"
                >
                  <XIcon className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <SheetFooter className="gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Command"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
