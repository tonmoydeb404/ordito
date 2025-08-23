import { Badge } from '@/components/ui/badge';
import { CommandStatus } from '@/types/command';
import { cn } from '@/lib/utils';

interface CommandStatusProps {
  status: CommandStatus;
  className?: string;
}

export function CommandStatusBadge({ status, className }: CommandStatusProps) {
  const getStatusConfig = (status: CommandStatus) => {
    switch (status) {
      case CommandStatus.IDLE:
        return {
          label: 'Idle',
          variant: 'secondary' as const,
          className: 'bg-slate-100 text-slate-800'
        };
      case CommandStatus.RUNNING:
        return {
          label: 'Running',
          variant: 'default' as const,
          className: 'bg-blue-100 text-blue-800 animate-pulse'
        };
      case CommandStatus.SUCCESS:
        return {
          label: 'Success',
          variant: 'default' as const,
          className: 'bg-green-100 text-green-800'
        };
      case CommandStatus.FAILED:
        return {
          label: 'Failed',
          variant: 'destructive' as const,
          className: 'bg-red-100 text-red-800'
        };
      default:
        return {
          label: 'Unknown',
          variant: 'secondary' as const,
          className: 'bg-slate-100 text-slate-800'
        };
    }
  };
  
  const config = getStatusConfig(status);
  
  return (
    <Badge 
      variant={config.variant}
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  );
}