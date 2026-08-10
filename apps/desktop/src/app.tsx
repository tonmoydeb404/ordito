import { AppSidebar } from "@/components/app-sidebar";
import { CommandListSkeleton } from "@/components/list-skeleton";
import { AppLayout } from "@/layouts/app-layout";
import { CommandsLayout } from "@/layouts/commands-layout";
import { SchedulesLayout } from "@/layouts/schedules-layout";
import { SidebarInset, SidebarProvider } from "@packages/ui/components/sidebar";
import { Toaster } from "@packages/ui/components/sonner";
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { ModalProvider } from "./context/modal-context";
import { OrditoProvider, useOrdito } from "./context/ordito-context";
import { HistoryScreen } from "./screens/history";
import { HomeScreen } from "./screens/home";

function LoadingShell() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="overflow-hidden">
        <div
          data-tauri-drag-region
          className="h-9 shrink-0 border-b border-border"
        />
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <section className="min-h-0 flex-1 overflow-auto scrollbar-thin p-4">
            <CommandListSkeleton />
          </section>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

function ErrorShell({ error }: { error: string }) {
  return (
    <main className="flex h-svh w-screen flex-col items-center justify-center gap-2 overflow-hidden px-6 text-center">
      <strong className="text-[0.88rem] text-danger">
        Something went wrong
      </strong>
      <span className="text-[0.76rem] text-muted-foreground">{error}</span>
    </main>
  );
}

function AppRoutes() {
  const { loading, error } = useOrdito();

  if (loading) return <LoadingShell />;
  if (error) return <ErrorShell error={error} />;

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomeScreen />} />

        <Route path="groups" element={<CommandsLayout />}>
          <Route path=":groupId" element={null} />
        </Route>

        <Route path="schedules" element={<SchedulesLayout />} />

        <Route path="history" element={<HistoryScreen />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <OrditoProvider>
      <ModalProvider>
        <HashRouter>
          <AppRoutes />
        </HashRouter>
        <Toaster position="bottom-right" />
      </ModalProvider>
    </OrditoProvider>
  );
}
