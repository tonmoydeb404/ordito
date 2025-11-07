import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppView from "@/views";
import { StoreProvider } from "../store";

type Props = {};

const App = (props: Props) => {
  return (
    <StoreProvider>
      <TooltipProvider>
        <AppView />
        <Toaster />
      </TooltipProvider>
    </StoreProvider>
  );
};

export default App;
