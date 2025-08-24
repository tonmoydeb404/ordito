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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCreateCommandGroupMutation } from "@/store/api/commands-api";
import { useAppDispatch, useModalsSlice } from "@/store/hooks";
import { setGroupCreate } from "@/store/slices/modals-slice";
import { CreateGroupRequest } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const createGroupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  color: z.string().optional(),
  icon: z.string().optional(),
});

type CreateGroupForm = z.infer<typeof createGroupSchema>;

const defaultValues: CreateGroupForm = {
  name: "",
  color: "#3B82F6",
  icon: "📁",
};

interface Props {}

const GroupCreateModal = (_props: Props) => {
  const { group } = useModalsSlice();
  const dispatch = useAppDispatch();
  const [createGroup, { isLoading }] = useCreateCommandGroupMutation();

  const form = useForm<CreateGroupForm>({
    resolver: zodResolver(createGroupSchema),
    defaultValues,
  });

  const watchedValues = form.watch();

  const onOpenChange = (value: boolean) => {
    dispatch(setGroupCreate(value));
  };

  const onSubmit = async (data: CreateGroupForm) => {
    try {
      const request: CreateGroupRequest = {
        name: data.name,
        color: data.color,
        icon: data.icon,
      };

      await createGroup(request).unwrap();
      toast.success("Group created successfully");
      form.reset();
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to create group");
      console.error("Failed to create group:", error);
    }
  };

  const handleClose = () => {
    form.reset();
    onOpenChange(false);
  };

  return (
    <Sheet open={group.create} onOpenChange={handleClose}>
      <SheetContent side="right" className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Create New Group</SheetTitle>
          <SheetDescription>
            Create a new group to organize your commands
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full h-full flex-1 flex flex-col"
          >
            <div className="space-y-6 p-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter group name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Icon</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter emoji icon (e.g., 📁, ⚡, 🔧)"
                        maxLength={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Input
                          type="color"
                          className="w-16 h-10 p-1 rounded"
                          {...field}
                        />
                        <Input
                          placeholder="#3B82F6"
                          className="flex-1"
                          pattern="^#[0-9A-Fa-f]{6}$"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="p-4 border rounded-lg bg-muted/20">
                <Label className="text-sm font-medium mb-3 block">
                  Preview
                </Label>
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-xl border"
                    style={{
                      backgroundColor: watchedValues.color
                        ? watchedValues.color + "15"
                        : "#3B82F615",
                      borderColor: watchedValues.color || "#3B82F6",
                    }}
                  >
                    {watchedValues.icon || "📁"}
                  </div>
                  <div>
                    <div className="font-medium text-lg">
                      {watchedValues.name || "Group Name"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Command group
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <SheetFooter className="gap-2">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Group"}
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

export default GroupCreateModal;
