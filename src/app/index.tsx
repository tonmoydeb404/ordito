import { Toaster } from "@/components/ui/sonner";
import AppProvider from "@/context/app/provider";
import ExecutionProvider from "@/context/execution/provider";
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
