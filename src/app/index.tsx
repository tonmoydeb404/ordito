import AppView from "@/views";
import { StoreProvider } from "../store";

type Props = {};

const App = (props: Props) => {
  return (
    <StoreProvider>
      <AppView />
    </StoreProvider>
  );
};

export default App;
