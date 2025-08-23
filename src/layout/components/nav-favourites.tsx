"use client";

import {
  IconDots,
  IconFolder,
  IconShare3,
  IconTrash,
} from "@tabler/icons-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { LucideFolder, LucideHeartCrack } from "lucide-react";
import { Link } from "react-router";
import { NavLink } from "../config";
import { useCommandsStore } from "@/stores/commands";
import { useEffect, useMemo } from "react";
import paths from "@/router/paths";

export function NavFavourites() {
  const { isMobile } = useSidebar();
  const { groups, loadGroups } = useCommandsStore();
  
  const favouriteGroups: Omit<NavLink, "icon">[] = useMemo(() => 
    groups
      .filter(group => group.is_favorite)
      .map(group => ({
        title: group.name,
        url: paths.groups.details(group.id),
      })),
    [groups]
  );

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Favourites</SidebarGroupLabel>
      {favouriteGroups?.length === 0 && (
        <div className="flex flex-col items-center justify-center border border-dashed min-h-[200px] rounded-lg">
          <LucideHeartCrack className="mb-2 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">No favourites yet</p>
        </div>
      )}
      {favouriteGroups?.length > 0 && (
        <SidebarMenu>
          {favouriteGroups.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <Link to={item.url}>
                  <LucideFolder />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuAction
                    showOnHover
                    className="data-[state=open]:bg-accent rounded-sm"
                  >
                    <IconDots />
                    <span className="sr-only">More</span>
                  </SidebarMenuAction>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-24 rounded-lg"
                  side={isMobile ? "bottom" : "right"}
                  align={isMobile ? "end" : "start"}
                >
                  <DropdownMenuItem>
                    <IconFolder />
                    <span>Open</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <IconShare3 />
                    <span>Share</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive">
                    <IconTrash />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      )}
    </SidebarGroup>
  );
}
