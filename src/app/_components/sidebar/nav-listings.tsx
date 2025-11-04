"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, Loader2, MoreHorizontal, Trash2 } from "lucide-react";
import Link from "next/link";
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
import { Skeleton } from "~/components/ui/skeleton";
import { useTRPC } from "~/lib/client/trpc/client";
import { formatTimestamp } from "~/utils/format-timestamp";

export function NavListings() {
  const { isMobile } = useSidebar();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: listings = [], isLoading } = useQuery(
    trpc.listings.getAll.queryOptions()
  );

  const deleteMutation = useMutation(
    trpc.listings.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.listings.getAll.queryOptions());
      },
    })
  );

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden flex flex-col">
      <SidebarGroupLabel>Recent Listings</SidebarGroupLabel>
      <div className="overflow-y-auto flex-1 min-h-0 pr-1">
        <SidebarMenu className="gap-2">
          {isLoading ? (
            <>
              <ListingSkeleton />
              <ListingSkeleton />
              <ListingSkeleton />
            </>
          ) : (
            listings.map((listing) => (
              <SidebarMenuItem key={listing.id}>
                <SidebarMenuButton asChild className="h-auto py-2">
                  <Link href={`/listings/${listing.id}`}>
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
                  </Link>
                </SidebarMenuButton>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuAction className="top-1/2! -translate-y-1/2">
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
                    <DropdownMenuItem
                      onClick={() => deleteMutation.mutate({ id: listing.id })}
                    >
                      <Trash2 className="text-muted-foreground" />
                      <span>Delete Listing</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            ))
          )}
        </SidebarMenu>
      </div>
    </SidebarGroup>
  );
}

function ListingSkeleton() {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton className="h-auto py-2">
        <div className="flex flex-col gap-1 overflow-hidden flex-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
