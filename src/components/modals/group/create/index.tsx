import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateCommandGroupMutation } from "@/store/api/commands-api";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const GroupCreateModal = ({ open, onOpenChange }: Props) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "#3B82F6",
    icon: "📁",
  });

  const [createGroup, { isLoading }] = useCreateCommandGroupMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      return;
    }

    try {
      await createGroup({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        color: formData.color,
        icon: formData.icon,
      }).unwrap();

      setFormData({
        name: "",
        description: "",
        color: "#3B82F6",
        icon: "📁",
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create group:", error);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: "",
      description: "",
      color: "#3B82F6",
      icon: "📁",
    });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <form onSubmit={handleSubmit} className="h-full flex flex-col">
          <SheetHeader>
            <SheetTitle>Create New Group</SheetTitle>
            <SheetDescription>
              Create a new group to organize your commands.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 space-y-4 p-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter group name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter group description (optional)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="icon">Icon</Label>
              <Input
                id="icon"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                placeholder="Enter emoji icon"
                maxLength={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="color"
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-16 h-10 p-1 rounded"
                />
                <Input
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  placeholder="#3B82F6"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <Label className="text-sm font-medium mb-2 block">Preview</Label>
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                  style={{ backgroundColor: formData.color + '20' }}
                >
                  {formData.icon || '📁'}
                </div>
                <div>
                  <div className="font-medium">{formData.name || 'Group Name'}</div>
                  <div className="text-sm text-muted-foreground">
                    {formData.description || 'Group description'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <SheetFooter className="gap-2">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !formData.name.trim()}>
              {isLoading ? "Creating..." : "Create Group"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default GroupCreateModal;
