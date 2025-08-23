"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { LucideHelpCircle, LucideSearch, LucideSettings } from "lucide-react";

const items = [
  {
    title: "Settings",
    url: "#",
    icon: LucideSettings,
  },
  {
    title: "Get Help",
    url: "#",
    icon: LucideHelpCircle,
  },
  {
    title: "Search",
    url: "#",
    icon: LucideSearch,
  },
];

export function NavSecondary() {
  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <a href={item.url}>
                  <item.icon />
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
