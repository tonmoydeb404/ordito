import AppLayout from "@/layout";
import HomePage from "@/pages/home";
import { Route, Routes } from "react-router";

type Props = {};

const App = (_props: Props) => {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
      </Route>
    </Routes>
  );
};

export default App;
