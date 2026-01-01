import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";
import { EnvVar } from "../types";

interface EnvironmentVariablesSectionProps {
  envVars: EnvVar[];
  newEnvVar: EnvVar;
  onNewEnvVarChange: (envVar: EnvVar) => void;
  onAddEnvVar: () => void;
  onRemoveEnvVar: (index: number) => void;
  onUpdateEnvVar: (
    index: number,
    field: "name" | "value",
    value: string
  ) => void;
}

export default function EnvironmentVariablesSection({
  envVars,
  newEnvVar,
  onNewEnvVarChange,
  onAddEnvVar,
  onRemoveEnvVar,
  onUpdateEnvVar,
}: EnvironmentVariablesSectionProps) {
  return (
    <div>
      <Label>Environment Variables</Label>
      <div className="space-y-2 mt-2">
        {envVars.map((envVar, index) => (
          <div key={index} className="flex gap-2">
            <Input
              value={envVar.name}
              onChange={(e) => onUpdateEnvVar(index, "name", e.target.value)}
              placeholder="Variable name"
              className="flex-1"
              data-testid={`input-env-name-${index}`}
            />
            <Input
              value={envVar.value}
              onChange={(e) => onUpdateEnvVar(index, "value", e.target.value)}
              placeholder="Value"
              className="flex-1"
              data-testid={`input-env-value-${index}`}
            />
            <Button
              size="icon"
              variant="outline"
              onClick={() => onRemoveEnvVar(index)}
              className="px-3"
              data-testid={`button-remove-env-${index}`}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        ))}

        <div className="flex gap-2">
          <Input
            value={newEnvVar.name}
            onChange={(e) =>
              onNewEnvVarChange({ ...newEnvVar, name: e.target.value })
            }
            placeholder="Variable name"
            className="flex-1"
            data-testid="input-new-env-name"
          />
          <Input
            value={newEnvVar.value}
            onChange={(e) =>
              onNewEnvVarChange({ ...newEnvVar, value: e.target.value })
            }
            placeholder="Value"
            className="flex-1"
            data-testid="input-new-env-value"
          />
          <Button
            size="icon"
            className="px-3 bg-primary hover:bg-primary/80 text-primary-foreground"
            onClick={onAddEnvVar}
            data-testid="button-add-env"
          >
            <Plus className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
