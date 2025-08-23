import { Header } from './header';
import { OutputPanel } from './output-panel';

interface AppLayoutProps {
  children: React.ReactNode;
  onCreateCommand?: () => void;
  onOpenSettings?: () => void;
}

export function AppLayout({ children, onCreateCommand, onOpenSettings }: AppLayoutProps) {
  return (
    <div className="flex h-screen flex-col bg-background">
      <Header onCreateCommand={onCreateCommand} onOpenSettings={onOpenSettings} />
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
      <OutputPanel />
    </div>
  );
}