import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const createCommandSchema = z.object({
  name: z.string().min(1, "Name is required"),
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
  command: "",
  working_directory: "",
  group_id: "",
  tags: [],
  environment_variables: [],
};

interface Props {}

const CommandCreateModal = (_props: Props) => {
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
        form.setValue("working_directory", selected);
      }
    } catch (error) {
      console.error("Failed to open directory picker:", error);
      toast.error("Failed to open directory picker");
    }
  };

  const form = useForm({
    resolver: zodResolver(createCommandSchema),
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "environment_variables",
  });

  const currentTags = form.watch("tags");

  const onOpenChange = (value: boolean) => {
    dispatch(setCommandCreate(value));
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagsInput.trim()) {
      e.preventDefault();
      const newTags = [...(currentTags ?? []), tagsInput.trim()];
      form.setValue("tags", newTags);
      setTagsInput("");
    }
  };

  const handleRemoveTag = (index: number) => {
    const newTags = currentTags?.filter((_, i) => i !== index);
    form.setValue("tags", newTags);
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
      form.reset();
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to create command");
      console.error("Failed to create command:", error);
    }
  };

  const handleClose = () => {
    form.reset();
    setTagsInput("");
    onOpenChange(false);
  };

  return (
    <Sheet open={command.create} onOpenChange={handleClose}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Create New Command</SheetTitle>
          <SheetDescription>
            Add a new command to your collection
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col w-full h-full flex-1"
          >
            <div className="space-y-6 p-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Command name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="command"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Command *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., npm run dev" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="working_directory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Working Directory</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Path to execute command from"
                          className="flex-1"
                          {...field}
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
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="group_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Group</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value || ""}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a group (optional)" />
                        </SelectTrigger>
                        <SelectContent>
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
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                        {...form.register(`environment_variables.${index}.key`)}
                        placeholder="Variable name"
                      />
                      {form.formState.errors.environment_variables?.[index]
                        ?.key && (
                        <p className="text-xs text-red-500">
                          {
                            form.formState.errors.environment_variables[index]
                              ?.key?.message
                          }
                        </p>
                      )}
                    </div>

                    <div className="flex-1 space-y-1">
                      <Label htmlFor={`env-value-${index}`} className="text-xs">
                        Value
                      </Label>
                      <Input
                        id={`env-value-${index}`}
                        {...form.register(
                          `environment_variables.${index}.value`
                        )}
                        placeholder="Variable value"
                      />
                      {form.formState.errors.environment_variables?.[index]
                        ?.value && (
                        <p className="text-xs text-red-500">
                          {
                            form.formState.errors.environment_variables[index]
                              ?.value?.message
                          }
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
            </div>

            <SheetFooter className="gap-2 mt-auto">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Command"}
              </Button>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};

export default CommandCreateModal;
