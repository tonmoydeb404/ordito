import AppLayout from "@/layout";
import CommandsPage from "@/pages/commands";
import GroupDetailsPage from "@/pages/groups/details";
import GroupsPage from "@/pages/groups/home";
import HomePage from "@/pages/home";
import LogsPage from "@/pages/logs";
import SchedulesPage from "@/pages/schedules";
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
        <Route path={paths.commands} element={<CommandsPage />} />
        <Route path={paths.schedules} element={<SchedulesPage />} />
        <Route path={paths.logs} element={<LogsPage />} />
      </Route>
    </Routes>
  );
};

export default App;
