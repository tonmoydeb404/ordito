import { Settings, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/features/theme-toggle';

interface HeaderProps {
  onCreateCommand?: () => void;
  onOpenSettings?: () => void;
}

export function Header({ onCreateCommand, onOpenSettings }: HeaderProps) {
  return (
    <header className="border-b bg-card px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold">Ordito</h1>
          <nav className="text-sm text-muted-foreground">
            Home
          </nav>
        </div>
        
        <div className="flex items-center gap-2">
          <Input
            type="search"
            placeholder="Search commands..."
            className="w-64"
          />
          <Button variant="outline" size="sm" onClick={onCreateCommand}>
            <Plus className="h-4 w-4 mr-2" />
            New Command
          </Button>
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={onOpenSettings}>
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}