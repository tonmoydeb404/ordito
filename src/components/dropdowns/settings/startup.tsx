import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useStartupOperations } from "@/contexts/hooks";
import { LucideLoader2, LucidePower, LucidePowerOff } from "lucide-react";
import { useEffect } from "react";

interface Props {
  disabled?: boolean;
}

export const Startup = ({ disabled }: Props) => {
  const { toggleStartup, checkStartupStatus, isStartupEnabled, loading } =
    useStartupOperations();

  // Check startup status on component mount
  useEffect(() => {
    checkStartupStatus();
  }, [checkStartupStatus]);

  const handleStartupToggle = async () => {
    await toggleStartup();
  };

  const getStartupIcon = () => {
    if (loading) {
      return <LucideLoader2 className="mr-2 h-4 w-4 animate-spin" />;
    }
    return isStartupEnabled ? (
      <LucidePowerOff className="mr-2 h-4 w-4" />
    ) : (
      <LucidePower className="mr-2 h-4 w-4" />
    );
  };

  const getStartupText = () => {
    if (isStartupEnabled === null) return "Check Startup Status";
    return isStartupEnabled ? "Disable Startup" : "Enable Startup";
  };

  const isDisabled = disabled || loading || isStartupEnabled === null;

  return (
    <DropdownMenuItem onClick={handleStartupToggle} disabled={isDisabled}>
      {getStartupIcon()}
      {getStartupText()}
    </DropdownMenuItem>
  );
};
