"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { CopyButton } from "~/components/copy-button";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { useTRPC } from "~/lib/client/trpc/client";

export default function ListingPage() {
  const params = useParams();
  const router = useRouter();
  const listingId = params.id as string;

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  // Fetch listing data
  const {
    data: listing,
    isLoading: isLoadingListing,
    error: fetchError,
    refetch,
  } = useQuery(trpc.listings.getById.queryOptions({ id: listingId }));

  // Mutation for analyzing the listing
  const analyzeMutation = useMutation(
    trpc.listings.analyze.mutationOptions({
      onSuccess: () => {
        refetch();
        queryClient.invalidateQueries(trpc.listings.getAll.queryOptions());
      },
    })
  );

  // Check if analysis is needed and trigger it
  useEffect(() => {
    if (!listing) return;

    const needsAnalysis = listing.status === "pending";

    if (needsAnalysis && !analyzeMutation.isPending) {
      // Start AI analysis only if status is pending
      analyzeMutation.mutate({
        listingId: listing.id,
        imageUrls: listing.imageUrls, // Send all images for comprehensive analysis
        userContext: listing.userContext ?? undefined,
      });
    }
  }, [listing, analyzeMutation]);

  // Use the analyzed data if available, otherwise use the original listing data
  const displayListing = analyzeMutation.data ?? listing;

  const isAnalyzing =
    analyzeMutation.isPending || displayListing?.status === "analyzing";
  const error = fetchError?.message ?? analyzeMutation.error?.message;

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Error</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => router.push("/")}>Go Home</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isLoadingListing || !displayListing) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <Skeleton className="h-96 w-full mb-6" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Images Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Uploaded Images</CardTitle>
            {displayListing.userContext && (
              <CardDescription className="mt-2">
                <strong>Your Context:</strong> {displayListing.userContext}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {displayListing.imageUrls.map((url: string, index: number) => (
                <div
                  key={index}
                  className="aspect-square overflow-hidden rounded-lg bg-accent/50"
                >
                  <img
                    src={url}
                    alt={`Product view ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Listing Details Section */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <CardTitle>
                  {isAnalyzing ? (
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-8 w-3/4" />
                      <span className="text-sm text-muted-foreground">
                        (Analyzing...)
                      </span>
                    </div>
                  ) : (
                    displayListing.title
                  )}
                </CardTitle>
                {!isAnalyzing && displayListing.category && (
                  <CardDescription>
                    Category: {displayListing.category}
                  </CardDescription>
                )}
              </div>
              {!isAnalyzing && displayListing.title && (
                <CopyButton
                  content={displayListing.title}
                  label="Copy title"
                  successMessage="Title copied!"
                />
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {isAnalyzing ? (
              <>
                <div>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              </>
            ) : (
              <>
                {/* Description */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg">Description</h3>
                    {displayListing.description && (
                      <CopyButton
                        content={displayListing.description}
                        label="Copy description"
                        successMessage="Description copied!"
                      />
                    )}
                  </div>
                  <p className="text-muted-foreground whitespace-pre-line">
                    {displayListing.description}
                  </p>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {displayListing.condition && (
                    <div className="border rounded-lg p-4">
                      <p className="text-sm text-muted-foreground">Condition</p>
                      <p className="font-semibold">
                        {displayListing.condition}
                      </p>
                    </div>
                  )}
                  {displayListing.brand && (
                    <div className="border rounded-lg p-4">
                      <p className="text-sm text-muted-foreground">Brand</p>
                      <p className="font-semibold">{displayListing.brand}</p>
                    </div>
                  )}
                  {displayListing.size && (
                    <div className="border rounded-lg p-4">
                      <p className="text-sm text-muted-foreground">Size</p>
                      <p className="font-semibold">{displayListing.size}</p>
                    </div>
                  )}
                  {displayListing.color && (
                    <div className="border rounded-lg p-4">
                      <p className="text-sm text-muted-foreground">Color</p>
                      <p className="font-semibold">{displayListing.color}</p>
                    </div>
                  )}
                  {displayListing.material && (
                    <div className="border rounded-lg p-4">
                      <p className="text-sm text-muted-foreground">Material</p>
                      <p className="font-semibold">{displayListing.material}</p>
                    </div>
                  )}
                </div>

                {/* Pricing */}
                <div className="border-t pt-6">
                  <h3 className="font-semibold text-lg mb-4">Pricing</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {displayListing.estimatedOriginalPrice && (
                      <div className="border rounded-lg p-4">
                        <p className="text-sm text-muted-foreground">
                          Original Price (est.)
                        </p>
                        <p className="text-2xl font-bold">
                          ${displayListing.estimatedOriginalPrice}
                        </p>
                      </div>
                    )}
                    {displayListing.listingPrice && (
                      <div className="border rounded-lg p-4 bg-primary/5">
                        <p className="text-sm text-muted-foreground">
                          Suggested Listing Price
                        </p>
                        <p className="text-2xl font-bold text-primary">
                          ${displayListing.listingPrice}
                        </p>
                      </div>
                    )}
                  </div>
                  {displayListing.pricingRationale && (
                    <div className="mt-4 p-4 bg-accent/50 rounded-lg">
                      <p className="text-sm font-semibold mb-1">
                        Pricing Rationale
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {displayListing.pricingRationale}
                      </p>
                    </div>
                  )}
                </div>

                {/* Keywords */}
                {displayListing.keywords && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg">Keywords</h3>
                      <CopyButton
                        content={displayListing.keywords}
                        label="Copy keywords"
                        successMessage="Keywords copied!"
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {displayListing.keywords
                        .split(", ")
                        .map((keyword: string, index: number) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-accent rounded-full text-sm"
                          >
                            {keyword}
                          </span>
                        ))}
                    </div>
                  </div>
                )}

                {/* Original Product Link */}
                {displayListing.originalProductLink && (
                  <div className="border-t pt-6">
                    <h3 className="font-semibold text-lg mb-3">
                      Original Product
                    </h3>
                    <a
                      href={displayListing.originalProductLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                      View Original Product
                    </a>
                  </div>
                )}

                {/* Similar Product Links */}
                {displayListing.similarProductLinks &&
                  displayListing.similarProductLinks.length > 0 && (
                    <div className="border-t pt-6">
                      <h3 className="font-semibold text-lg mb-3">
                        Similar Products Online
                      </h3>
                      <div className="grid gap-3">
                        {displayListing.similarProductLinks.map(
                          (linkStr: string, index: number) => {
                            try {
                              const link = JSON.parse(linkStr);
                              return (
                                <a
                                  key={index}
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors group"
                                >
                                  <div className="flex-1">
                                    <p className="font-medium group-hover:text-primary transition-colors">
                                      {link.title}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      {link.platform}
                                    </p>
                                  </div>
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="text-muted-foreground group-hover:text-primary transition-colors"
                                  >
                                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                    <polyline points="15 3 21 3 21 9" />
                                    <line x1="10" y1="14" x2="21" y2="3" />
                                  </svg>
                                </a>
                              );
                            } catch {
                              return null;
                            }
                          }
                        )}
                      </div>
                    </div>
                  )}

                {/* Similar Items Search Terms */}
                {displayListing.similarItemsSearchTerms && (
                  <div className="border-t pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg">
                        Search Terms for Similar Items
                      </h3>
                      <CopyButton
                        content={displayListing.similarItemsSearchTerms}
                        label="Copy search terms"
                        successMessage="Search terms copied!"
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {displayListing.similarItemsSearchTerms
                        .split(", ")
                        .map((term: string, index: number) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-sm"
                          >
                            {term}
                          </span>
                        ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
