"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  Eye,
  Loader2,
  MoreHorizontal,
  Package,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { PropsWithChildren } from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";
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
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { isMobile } = useSidebar();

  const getAllListingsQuery = useQuery(trpc.listings.getAll.queryOptions());

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
          <ListingStates
            isLoading={getAllListingsQuery.isLoading}
            isEmpty={!getAllListingsQuery.data?.length}
            isError={getAllListingsQuery.isError}
            onRetry={() => getAllListingsQuery.refetch()}
          >
            {getAllListingsQuery.data?.map((listing) => (
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
            ))}
          </ListingStates>
        </SidebarMenu>
      </div>
    </SidebarGroup>
  );
}

interface ListingStatesProps {
  isLoading: boolean;
  isEmpty: boolean;
  isError: boolean;
  onRetry: () => void;
}

function ListingStates({
  children,
  isLoading,
  isEmpty,
  isError,
  onRetry,
}: PropsWithChildren<ListingStatesProps>) {
  if (isLoading) {
    return Array.from({ length: 3 }).map((_, index) => (
      <ListingSkeleton key={index} />
    ));
  }

  if (isError) {
    return (
      <Empty className="border border-destructive/20 animate-in fade-in-50 duration-500 md:p-8">
        <EmptyHeader className="max-w-xs gap-2.5">
          <EmptyMedia
            variant="icon"
            className="size-12 rounded-xl bg-destructive/10 text-destructive border-destructive/20 mb-3"
          >
            <AlertCircle />
          </EmptyMedia>
          <EmptyTitle className="text-base font-semibold">
            Failed to Load Listings
          </EmptyTitle>
          <EmptyDescription className="text-xs/relaxed">
            There was an error loading your listings. Please try again later.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button onClick={onRetry} variant="outline" size="sm">
            Retry
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  if (isEmpty) {
    return (
      <Empty className="border animate-in fade-in-50 duration-500 md:p-8">
        <EmptyHeader className="max-w-xs gap-2.5">
          <EmptyMedia
            variant="icon"
            className="size-12 rounded-xl bg-muted/60 text-muted-foreground border-border/50 mb-3"
          >
            <Package className="opacity-50" />
          </EmptyMedia>
          <EmptyTitle className="text-base font-semibold">
            No Listings Yet
          </EmptyTitle>
          <EmptyDescription className="text-xs/relaxed">
            Create your first listing to get started. Upload images and details
            to showcase your items.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return children;
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
