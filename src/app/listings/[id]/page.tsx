"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { Listing } from "~/lib/server/db/schema";

export default function ListingPage() {
  const params = useParams();
  const router = useRouter();
  const listingId = params.id as string;

  const [listing, setListing] = useState<Listing | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAndAnalyzeListing() {
      try {
        // Fetch the listing
        const listingResponse = await fetch(`/api/listings/${listingId}`);
        if (!listingResponse.ok) {
          throw new Error("Failed to fetch listing");
        }
        const listingData = await listingResponse.json();
        setListing(listingData);

        // Check if listing has already been analyzed
        const isAlreadyAnalyzed =
          listingData.title &&
          listingData.title !== "Processing..." &&
          listingData.description &&
          listingData.description !== "AI is analyzing your images...";

        if (isAlreadyAnalyzed) {
          // Use existing analysis data
          setIsAnalyzing(false);
          return;
        }

        // Start AI analysis only if not already analyzed
        const analysisResponse = await fetch("/api/analyze", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            listingId: listingData.id,
            imageUrl: listingData.imageUrls[0], // Use first image for analysis
            userContext: listingData.userContext,
          }),
        });

        if (!analysisResponse.ok) {
          throw new Error("Failed to analyze listing");
        }

        const updatedListing = await analysisResponse.json();
        setListing(updatedListing);
        setIsAnalyzing(false);
      } catch (err) {
        console.error("Error:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
        setIsAnalyzing(false);
      }
    }

    fetchAndAnalyzeListing();
  }, [listingId]);

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

  if (!listing) {
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
        <div className="mb-6">
          <Button variant="outline" onClick={() => router.push("/")}>
            ← Back to Home
          </Button>
        </div>

        {/* Images Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Uploaded Images</CardTitle>
            {listing.userContext && (
              <CardDescription className="mt-2">
                <strong>Your Context:</strong> {listing.userContext}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {listing.imageUrls.map((url, index) => (
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
            <CardTitle>
              {isAnalyzing ? (
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-3/4" />
                  <span className="text-sm text-muted-foreground">
                    (Analyzing...)
                  </span>
                </div>
              ) : (
                listing.title
              )}
            </CardTitle>
            {!isAnalyzing && listing.category && (
              <CardDescription>Category: {listing.category}</CardDescription>
            )}
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
                  <h3 className="font-semibold text-lg mb-2">Description</h3>
                  <p className="text-muted-foreground whitespace-pre-line">
                    {listing.description}
                  </p>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {listing.condition && (
                    <div className="border rounded-lg p-4">
                      <p className="text-sm text-muted-foreground">Condition</p>
                      <p className="font-semibold">{listing.condition}</p>
                    </div>
                  )}
                  {listing.brand && (
                    <div className="border rounded-lg p-4">
                      <p className="text-sm text-muted-foreground">Brand</p>
                      <p className="font-semibold">{listing.brand}</p>
                    </div>
                  )}
                  {listing.size && (
                    <div className="border rounded-lg p-4">
                      <p className="text-sm text-muted-foreground">Size</p>
                      <p className="font-semibold">{listing.size}</p>
                    </div>
                  )}
                  {listing.color && (
                    <div className="border rounded-lg p-4">
                      <p className="text-sm text-muted-foreground">Color</p>
                      <p className="font-semibold">{listing.color}</p>
                    </div>
                  )}
                  {listing.material && (
                    <div className="border rounded-lg p-4">
                      <p className="text-sm text-muted-foreground">
                        Material
                      </p>
                      <p className="font-semibold">{listing.material}</p>
                    </div>
                  )}
                </div>

                {/* Pricing */}
                <div className="border-t pt-6">
                  <h3 className="font-semibold text-lg mb-4">Pricing</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {listing.estimatedOriginalPrice && (
                      <div className="border rounded-lg p-4">
                        <p className="text-sm text-muted-foreground">
                          Original Price (est.)
                        </p>
                        <p className="text-2xl font-bold">
                          ${listing.estimatedOriginalPrice}
                        </p>
                      </div>
                    )}
                    {listing.listingPrice && (
                      <div className="border rounded-lg p-4 bg-primary/5">
                        <p className="text-sm text-muted-foreground">
                          Suggested Listing Price
                        </p>
                        <p className="text-2xl font-bold text-primary">
                          ${listing.listingPrice}
                        </p>
                      </div>
                    )}
                  </div>
                  {listing.pricingRationale && (
                    <div className="mt-4 p-4 bg-accent/50 rounded-lg">
                      <p className="text-sm font-semibold mb-1">
                        Pricing Rationale
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {listing.pricingRationale}
                      </p>
                    </div>
                  )}
                </div>

                {/* Keywords */}
                {listing.keywords && (
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Keywords</h3>
                    <div className="flex flex-wrap gap-2">
                      {listing.keywords.split(", ").map((keyword, index) => (
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

                {/* Similar Items Search Terms */}
                {listing.similarItemsSearchTerms && (
                  <div>
                    <h3 className="font-semibold text-lg mb-2">
                      Search Terms for Similar Items
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {listing.similarItemsSearchTerms
                        .split(", ")
                        .map((term, index) => (
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

