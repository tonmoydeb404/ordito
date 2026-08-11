import {
  CalendarClock,
  Command as CommandIcon,
  Folder,
  History,
  PanelLeftIcon,
  Plus,
  Search,
  Settings,
} from "lucide-react";
import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { IconPreview } from "@/components/icon-picker";
import { UpdateNotification } from "@/components/update-notification";
import { useModal } from "@/context/modal-context";
import { useOrdito } from "@/context/ordito-context";
import { brand } from "@/lib/brand";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from "@packages/ui/components/sidebar";

type NavItem = {
  path: string;
  label: string;
  icon: typeof CommandIcon;
};

const NAV_ITEMS: NavItem[] = [
  { path: "/schedules", label: "Schedule", icon: CalendarClock },
  { path: "/history", label: "History", icon: History },
];

export function AppSidebar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const {
    commands,
    groups,
    groupNameById,
    activeSchedules,
    pausedSchedules,
    filteredRuns,
  } = useOrdito();
  const sidebar = useSidebar();

  const { group, settings, command } = useModal();
  const activeGroupId = useMemo(() => {
    const match = pathname.match(/^\/groups\/([^/]+)$/);
    return match?.[1] ?? null;
  }, [pathname]);

  const commandCountByGroup = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const cmd of commands) {
      const name = groupNameById(cmd.groupId);
      counts[name] = (counts[name] ?? 0) + 1;
    }
    return counts;
  }, [commands, groupNameById]);

  const scheduleCount = activeSchedules.length + pausedSchedules.length;
  const runCount = filteredRuns.length;

  function handleNavClick(path: string) {
    navigate(path);
  }

  function handleGroupClick(groupId: string) {
    if (activeGroupId === groupId) {
      navigate("/");
    } else {
      navigate(`/groups/${groupId}`);
    }
  }

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="gap-3"
              tabIndex={-1}
              onClick={() => handleNavClick("/")}
            >
              <img
                src="/logo.svg"
                alt={`${brand.appName} logo`}
                style={{
                  maxHeight: sidebar.state === "expanded" ? 32 : 24,
                  marginLeft: sidebar.state === "expanded" ? 0 : 4,
                }}
              />
              <div className="grid flex-1 text-left leading-tight">
                <span className="text-[0.92rem] font-[760] text-ink">
                  {brand.appName}
                </span>
                <span className="text-[0.68rem] text-faint">
                  Command runner
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* Navigation */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Search"
                  onClick={() => command.open()}
                >
                  <Search />
                  <span>Search</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.path;
                const count =
                  item.path === "/schedules" ? scheduleCount : runCount;

                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => handleNavClick(item.path)}
                      tooltip={item.label}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                    <SidebarMenuBadge>{count}</SidebarMenuBadge>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Groups */}
        <SidebarGroup>
          <SidebarGroupLabel>Groups</SidebarGroupLabel>

          <SidebarGroupAction
            title="New group"
            onClick={() => group.create.open()}
          >
            <Plus />
            <span className="sr-only">New group</span>
          </SidebarGroupAction>

          <SidebarGroupContent>
            <SidebarMenu>
              {groups
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((group) => {
                  const isActive = activeGroupId === group.id;
                  const count = commandCountByGroup[group.name] ?? 0;

                  return (
                    <SidebarMenuItem key={group.id}>
                      <SidebarMenuButton
                        isActive={isActive}
                        onClick={() => handleGroupClick(group.id)}
                        tooltip={group.name}
                      >
                        {group.icon ? (
                          <IconPreview
                            iconKey={group.icon}
                            className="size-4"
                          />
                        ) : (
                          <Folder />
                        )}
                        <span>{group.name}</span>
                      </SidebarMenuButton>
                      <SidebarMenuBadge>{count}</SidebarMenuBadge>
                    </SidebarMenuItem>
                  );
                })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <UpdateNotification />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Toggle sidebar"
              onClick={() => sidebar.toggleSidebar()}
            >
              <PanelLeftIcon />
              <span>Toggle sidebar</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Settings"
              isActive={settings.isOpen}
              onClick={() => settings.open()}
            >
              <Settings />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
