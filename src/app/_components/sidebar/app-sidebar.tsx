"use client";

import { Command } from "lucide-react";
import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar";
import { NavUser } from "./nav-user";
import { NavChats } from "./nav-chats";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  chats: [
    {
      id: "1",
      title: "How to implement authentication",
      url: "#",
      timestamp: "2 hours ago",
    },
    {
      id: "2",
      title: "Database schema design discussion",
      url: "#",
      timestamp: "Yesterday",
    },
    {
      id: "3",
      title: "React state management best practices",
      url: "#",
      timestamp: "2 days ago",
    },
    {
      id: "4",
      title: "API integration troubleshooting",
      url: "#",
      timestamp: "3 days ago",
    },
    {
      id: "5",
      title: "TypeScript generics explained",
      url: "#",
      timestamp: "1 week ago",
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Acme Inc</span>
                  <span className="truncate text-xs">Enterprise</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavChats chats={data.chats} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
