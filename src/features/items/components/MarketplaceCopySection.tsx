"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Copy, Check } from "lucide-react";
import type { Item } from "../types/item";

type MarketplaceCopySectionProps = {
  item: Item;
};

const marketplaces = [
  { name: "Facebook Marketplace", key: "facebook" },
  { name: "eBay", key: "ebay" },
  { name: "Poshmark", key: "poshmark" },
  { name: "OfferUp", key: "offerup" },
] as const;

export function MarketplaceCopySection({ item }: MarketplaceCopySectionProps) {
  const [copiedMarketplace, setCopiedMarketplace] = useState<string | null>(null);

  const formatPrice = (price: string | null) => {
    if (!price) return "N/A";
    return `$${parseFloat(price).toFixed(2)}`;
  };

  const generateListingText = (marketplace: string) => {
    const parts: string[] = [];
    
    parts.push(item.title);
    parts.push("");
    parts.push(item.description);
    parts.push("");
    
    // Add item details if available
    const details: string[] = [];
    if (item.category) details.push(`Category: ${item.category}`);
    if (item.condition) details.push(`Condition: ${item.condition}`);
    if (item.brand) details.push(`Brand: ${item.brand}`);
    if (item.size) details.push(`Size: ${item.size}`);
    if (item.color) details.push(`Color: ${item.color}`);
    if (item.material) details.push(`Material: ${item.material}`);
    
    if (details.length > 0) {
      parts.push("ITEM DETAILS:");
      details.forEach(detail => parts.push(detail));
      parts.push("");
    }
    
    // Add keywords if available
    if (item.keywords) {
      const keywords = item.keywords.split(", ").filter(Boolean);
      if (keywords.length > 0) {
        parts.push(`Tags: ${keywords.join(", ")}`);
        parts.push("");
      }
    }
    
    // Add pricing
    parts.push(`Price: ${formatPrice(item.listingPrice)}`);
    if (item.estimatedOriginalPrice) {
      parts.push(`Original Price: ${formatPrice(item.estimatedOriginalPrice)}`);
    }
    
    return parts.join("\n");
  };

  const copyListingText = async (marketplace: string) => {
    const text = generateListingText(marketplace);
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMarketplace(marketplace);
      setTimeout(() => setCopiedMarketplace(null), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Copy for Marketplaces</CardTitle>
        <CardDescription>
          One-click copy listing details formatted for each marketplace
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {marketplaces.map((marketplace) => (
            <Button
              key={marketplace.key}
              variant="outline"
              className="justify-start"
              onClick={() => copyListingText(marketplace.key)}
            >
              {copiedMarketplace === marketplace.key ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  {marketplace.name}
                </>
              )}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

