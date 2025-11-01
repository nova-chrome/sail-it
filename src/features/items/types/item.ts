export type Item = {
  id: string;
  imageUrl: string;
  title: string;
  description: string;
  category: string | null;
  condition: string | null;
  brand: string | null;
  size: string | null;
  color: string | null;
  material: string | null;
  keywords: string | null;
  estimatedOriginalPrice: string | null;
  listingPrice: string;
  pricingRationale: string | null;
  similarItemsSearchTerms: string | null;
  userContext: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
};

