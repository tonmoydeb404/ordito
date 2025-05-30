import { Toaster } from "@/components/ui/sonner";
import { AppProvider } from "@/context";
import GroupsSection from "./groups";
import HeaderSection from "./header";

type Props = {};

const App = (props: Props) => {
  return (
    <AppProvider>
      <HeaderSection />
      <GroupsSection />
      <Toaster />
    </AppProvider>
  );
};

export default App;
