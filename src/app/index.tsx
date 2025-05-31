import { Toaster } from "@/components/ui/sonner";
import AppProvider from "@/contexts/app/provider";
import ExecutionProvider from "@/contexts/execution/provider";
import GroupsSection from "./groups";
import HeaderSection from "./header";

type Props = {};

const App = (props: Props) => {
  return (
    <AppProvider>
      <ExecutionProvider>
        <HeaderSection />
        <GroupsSection />
        <Toaster />
      </ExecutionProvider>
    </AppProvider>
  );
};

export default App;
