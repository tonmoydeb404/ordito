import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import brand from "@/config/brand";
import { NavFavourites } from "@/layout/components/nav-favourites";
import { NavMain } from "@/layout/components/nav-main";
import { NavSecondary } from "@/layout/components/nav-secondary";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader className="mb-5">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <img src={brand.logo} alt={brand.name} className="size-8" />
            <span className="text-2xl font-semibold">{brand.name}</span>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain />
        <NavFavourites />
      </SidebarContent>
      <SidebarFooter className="px-0">
        <NavSecondary />
      </SidebarFooter>
    </Sidebar>
  );
}
