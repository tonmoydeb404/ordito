import { Toaster } from "@/components/ui/sonner";
import AppProvider from "@/contexts/app/provider";
import ExecutionProvider from "@/contexts/execution/provider";
import SearchProvider from "@/contexts/search/provider";
import GroupsSection from "./groups";
import HeaderSection from "./header";

type Props = {};

const App = (props: Props) => {
  return (
    <AppProvider>
      <SearchProvider>
        <ExecutionProvider>
          <HeaderSection />
          <GroupsSection />
          <Toaster />
        </ExecutionProvider>
      </SearchProvider>
    </AppProvider>
  );
};

export default App;
