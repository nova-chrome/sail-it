"use client";

import { Check, Copy } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import type { Item } from "../types/item";

type ItemDetailsProps = {
  item: Item;
};

export function ItemDetails({ item }: ItemDetailsProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const formatPrice = (price: string | null) => {
    if (!price) return "N/A";
    return `$${parseFloat(price).toFixed(2)}`;
  };

  const formatKeywords = (keywords: string | null) => {
    if (!keywords) return [];
    return keywords.split(", ").filter(Boolean);
  };

  return (
    <div className="space-y-6">
      {item.imageUrl && (
        <div className="relative w-full h-96 rounded-lg overflow-hidden border">
          <Image
            src={item.imageUrl}
            alt={item.title}
            fill
            className="object-contain"
          />
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Title</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(item.title, "title")}
            >
              {copiedField === "title" ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </>
              )}
            </Button>
          </div>
          <CardDescription className="text-base">{item.title}</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Description</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(item.description, "description")}
            >
              {copiedField === "description" ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {item.description}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Item Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {item.category && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Category
                </p>
                <p className="text-sm font-semibold">{item.category}</p>
              </div>
            )}
            {item.condition && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Condition
                </p>
                <p className="text-sm font-semibold">{item.condition}</p>
              </div>
            )}
            {item.brand && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Brand
                </p>
                <p className="text-sm font-semibold">{item.brand}</p>
              </div>
            )}
            {item.size && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Size
                </p>
                <p className="text-sm font-semibold">{item.size}</p>
              </div>
            )}
            {item.color && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Color
                </p>
                <p className="text-sm font-semibold">{item.color}</p>
              </div>
            )}
            {item.material && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Material
                </p>
                <p className="text-sm font-semibold">{item.material}</p>
              </div>
            )}
          </div>

          {item.keywords && formatKeywords(item.keywords).length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm font-medium text-muted-foreground mb-2">
                Keywords
              </p>
              <div className="flex flex-wrap gap-2">
                {formatKeywords(item.keywords).map((keyword, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded-md"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pricing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Original Price
              </p>
              <p className="text-lg font-semibold">
                {formatPrice(item.estimatedOriginalPrice)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Listing Price
              </p>
              <p className="text-lg font-semibold text-primary">
                {formatPrice(item.listingPrice)}
              </p>
            </div>
          </div>

          {item.pricingRationale && (
            <div className="pt-4 border-t">
              <p className="text-sm font-medium text-muted-foreground mb-2">
                Why This Price?
              </p>
              <p className="text-sm text-foreground leading-relaxed">
                {item.pricingRationale}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {item.similarItemsSearchTerms && (
        <Card>
          <CardHeader>
            <CardTitle>Find Similar Items</CardTitle>
            <CardDescription>
              Search these terms on marketplaces to compare prices and see what
              similar items are selling for
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {item.similarItemsSearchTerms
                .split(", ")
                .filter(Boolean)
                .map((searchTerm, index) => (
                  <div key={index} className="space-y-2">
                    <p className="text-sm font-medium">{searchTerm}</p>
                    <div className="flex flex-wrap gap-2">
                      <a
                        href={`https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(
                          searchTerm
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                      >
                        Search on eBay ↗
                      </a>
                      <a
                        href={`https://www.facebook.com/marketplace/search/?query=${encodeURIComponent(
                          searchTerm
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                      >
                        Search on Facebook Marketplace ↗
                      </a>
                      <a
                        href={`https://offerup.com/search/?q=${encodeURIComponent(
                          searchTerm
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                      >
                        Search on OfferUp ↗
                      </a>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
