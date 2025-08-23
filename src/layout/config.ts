import paths from "@/router/paths";
import {
  LucideCalendar,
  LucideFileText,
  LucideFolder,
  LucideLayoutDashboard,
  LucideProps,
  LucideTerminalSquare,
} from "lucide-react";
import { ForwardRefExoticComponent, RefAttributes, useMemo } from "react";

export type LucideIcon = ForwardRefExoticComponent<
  Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
>;

export type NavLink = {
  title: string;
  url: string;
  icon: LucideIcon;
};

export const useNavLinks = () => {
  const links = useMemo<NavLink[]>(
    () => [
      { title: "Dashboard", url: paths.root, icon: LucideLayoutDashboard },
      { title: "Groups", url: paths.groups.root, icon: LucideFolder },
      { title: "Commands", url: paths.commands, icon: LucideTerminalSquare },
      { title: "Schedules", url: paths.schedules, icon: LucideCalendar },
      { title: "Logs", url: paths.logs, icon: LucideFileText },
    ],
    []
  );

  return links;
};
