"use client";

import { differenceInDays, format, formatDistanceToNow } from "date-fns";
import { Eye, Loader2, MoreHorizontal, Package, Trash2 } from "lucide-react";

import { Badge } from "~/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "~/components/ui/sidebar";

type Listing = {
  id: string;
  title: string | null;
  status: "pending" | "analyzing" | "completed" | "failed";
  createdAt: Date;
};

function formatTimestamp(date: Date): string {
  const diffDays = differenceInDays(new Date(), date);

  // For dates older than 7 days, show the full date
  if (diffDays >= 7) {
    return format(date, "P");
  }

  // Otherwise, show relative time
  return formatDistanceToNow(date, { addSuffix: true });
}

export function NavListings({ listings }: { listings: Listing[] }) {
  const { isMobile } = useSidebar();

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden flex flex-col">
      <SidebarGroupLabel>Recent Listings</SidebarGroupLabel>
      <div className="overflow-y-auto flex-1 min-h-0 pr-1">
        <SidebarMenu className="gap-2">
          {listings.map((listing) => (
            <SidebarMenuItem key={listing.id}>
              <SidebarMenuButton asChild className="h-auto py-2">
                <a href={`/listings/${listing.id}`}>
                  <Package className="shrink-0" />
                  <div className="flex flex-col gap-1 overflow-hidden flex-1">
                    <span className="truncate">
                      {listing.title || "Untitled Listing"}
                    </span>
                    <div className="flex items-center gap-2">
                      {listing.status === "analyzing" && (
                        <Badge
                          variant="default"
                          className="text-xs flex items-center gap-1 w-fit"
                        >
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Analyzing
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground truncate">
                        {formatTimestamp(listing.createdAt)}
                      </span>
                    </div>
                  </div>
                </a>
              </SidebarMenuButton>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuAction showOnHover>
                    <MoreHorizontal />
                    <span className="sr-only">More</span>
                  </SidebarMenuAction>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-48"
                  side={isMobile ? "bottom" : "right"}
                  align={isMobile ? "end" : "start"}
                >
                  <DropdownMenuItem asChild>
                    <a href={`/listings/${listing.id}`}>
                      <Eye className="text-muted-foreground" />
                      <span>View Listing</span>
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Trash2 className="text-muted-foreground" />
                    <span>Delete Listing</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </div>
    </SidebarGroup>
  );
}
