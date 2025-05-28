import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TModalProps } from "@/hooks/use-modal";
import { TCommandGroup } from "@/types/command";
import { PlusIcon, TrashIcon } from "lucide-react";
import { useState } from "react";

type Props = TModalProps<TCommandGroup>;

function CreateCommandModal(props: Props) {
  const { close, data, isOpen } = props;
  const [commands, setCommands] = useState([{ label: "", cmd: "" }]);

  const handleAddCommand = () => {
    setCommands([...commands, { label: "", cmd: "" }]);
  };

  const handleRemoveCommand = (index: number) => {
    setCommands(commands.filter((_, i) => i !== index));
  };

  const handleCommandChange = (
    index: number,
    field: "label" | "cmd",
    value: string
  ) => {
    const updated = [...commands];
    updated[index][field] = value;
    setCommands(updated);
  };

  const handleCreate = () => {
    const filtered = commands.filter((c) => c.label.trim() && c.cmd.trim());
    console.log("Creating Commands:", filtered);
    // TODO: Submit logic
  };

  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Commands</DialogTitle>
          <DialogDescription>
            Define each command with a label and command string.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {commands.map((command, index) => (
            <div key={index} className="grid grid-cols-12 items-center gap-4">
              <Label className="col-span-1 text-right">Label</Label>
              <Input
                placeholder="e.g. Git Status"
                value={command.label}
                onChange={(e) =>
                  handleCommandChange(index, "label", e.target.value)
                }
                className="col-span-4"
              />
              <Label className="col-span-1 text-right">Command</Label>
              <Input
                placeholder="e.g. git status"
                value={command.cmd}
                onChange={(e) =>
                  handleCommandChange(index, "cmd", e.target.value)
                }
                className="col-span-5"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveCommand(index)}
                className="col-span-1"
              >
                <TrashIcon className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <Button
            variant="ghost"
            onClick={handleAddCommand}
            className="w-fit mt-2"
          >
            <PlusIcon className="mr-2 h-4 w-4" /> Add Another
          </Button>
        </div>

        <DialogFooter>
          <Button onClick={handleCreate}>Save Commands</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CreateCommandModal;
