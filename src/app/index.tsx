import { Toaster } from "@/components/ui/sonner";
import AppProvider from "@/contexts/app/provider";
import ExecutionProvider from "@/contexts/execution/provider";
import ScheduleProvider from "@/contexts/schedule/provider";
import SearchProvider from "@/contexts/search/provider";
import GroupsSection from "./groups";
import HeaderSection from "./header";

type Props = {};

const App = (props: Props) => {
  return (
    <AppProvider>
      <SearchProvider>
        <ExecutionProvider>
          <ScheduleProvider>
            <HeaderSection />
            <GroupsSection />
            <Toaster />
          </ScheduleProvider>
        </ExecutionProvider>
      </SearchProvider>
    </AppProvider>
  );
};

export default App;
