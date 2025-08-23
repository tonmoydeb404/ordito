import AppLayout from "@/layout";
import GroupDetailsPage from "@/pages/groups/details";
import GroupsPage from "@/pages/groups/home";
import HomePage from "@/pages/home";
import paths from "@/router/paths";
import { Route, Routes } from "react-router";

type Props = {};

const App = (_props: Props) => {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path={paths.groups.root} element={<GroupsPage />} />
        <Route
          path={paths.groups.details(":id")}
          element={<GroupDetailsPage />}
        />
      </Route>
    </Routes>
  );
};

export default App;
