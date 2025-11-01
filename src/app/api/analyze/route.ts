import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { env } from "~/env";
import { db } from "~/lib/server/db/drizzle";
import { listings } from "~/lib/server/db/schema";

export const runtime = "nodejs";

const openai = createOpenAI({
  apiKey: env.OPEN_AI_API_KEY,
});

const analysisSchema = z.object({
  title: z
    .string()
    .describe(
      "A compelling, SEO-friendly title (60-80 characters) that includes brand/model if visible"
    ),
  description: z
    .string()
    .describe(
      "A detailed description (150-300 words) that highlights key features, condition, dimensions, materials, any defects, and why someone would want it"
    ),
  category: z
    .string()
    .describe(
      "Primary category for marketplace listing (e.g., 'Electronics', 'Furniture', 'Clothing', 'Home & Garden', 'Sports & Outdoors', 'Toys & Games', 'Books', 'Automotive', etc.)"
    ),
  condition: z
    .enum(["New", "Like New", "Excellent", "Good", "Fair", "Poor"])
    .describe("Condition of the item"),
  brand: z
    .string()
    .nullable()
    .describe("Brand name if visible or identifiable, otherwise null"),
  size: z
    .string()
    .nullable()
    .describe(
      "Size information (e.g., 'Large', '42x30x24 inches', 'Size 10', 'Queen', etc.) or null if not applicable"
    ),
  color: z
    .string()
    .nullable()
    .describe("Primary color(s) of the item or null if not applicable"),
  material: z
    .string()
    .nullable()
    .describe(
      "Main material(s) used (e.g., 'Wood', 'Metal', 'Cotton', 'Plastic', 'Leather', etc.) or null if not identifiable"
    ),
  keywords: z
    .array(z.string())
    .describe(
      "Array of 5-10 relevant keywords/tags for search optimization (e.g., ['vintage', 'retro', 'wooden', 'handmade', 'antique'])"
    ),
  estimatedOriginalPrice: z
    .number()
    .nullable()
    .describe(
      "Estimated original retail price as a number (or null if unknown)"
    ),
  listingPrice: z
    .number()
    .describe(
      "Recommended listing price as a number (typically 30-70% of original depending on condition)"
    ),
  pricingRationale: z
    .string()
    .describe(
      "Detailed explanation (2-3 sentences) of why this listing price was selected, including factors like condition, market demand, comparable sales, and pricing strategy"
    ),
  similarItemsSearchTerms: z
    .array(z.string())
    .describe(
      "Array of 3-5 search terms or queries that could be used to find similar items on marketplaces (e.g., ['vintage leather jacket', 'nike air max size 10', 'wooden dining table 6 chairs'])"
    ),
});

const MARKETPLACE_PROMPT = `You are an expert at analyzing items for online marketplaces. Analyze the provided image and generate comprehensive listing information that includes ALL fields a seller would need.

Your goal is to provide complete, ready-to-use information so the seller doesn't have to think about what to fill out.

Guidelines:
- Title: Create a compelling, SEO-friendly title (60-80 characters) that includes brand/model if visible. Make it searchable and attractive.
- Description: Write a detailed description (150-300 words) that mentions:
  * Exact condition and any wear/defects
  * Dimensions and size details
  * Materials and construction
  * Brand/model information if visible
  * Why someone would want this item
  * Any notable features or history
- Category: Choose the most appropriate marketplace category from common options (Electronics, Furniture, Clothing & Accessories, Home & Garden, Sports & Outdoors, Toys & Games, Books & Media, Automotive Parts, Tools, Collectibles, etc.)
- Condition: Assess honestly (New, Like New, Excellent, Good, Fair, or Poor)
- Brand: Identify brand if visible on the item, packaging, or labels
- Size: Provide specific size information (dimensions, clothing size, etc.) or null if not applicable
- Color: Identify primary color(s) visible in the image
- Material: Identify main material(s) if visible or infer from item type
- Keywords: Generate 5-10 relevant search keywords/tags that buyers might search for
- Estimated Original Price: Provide estimated original retail price as a NUMBER, or null if truly unknown
- Listing Price: Provide realistic listing price as a NUMBER (typically 30-70% of original depending on condition)
- Pricing Rationale: Explain why this price was selected (2-3 sentences). Consider:
  * Condition and wear level
  * Current market demand for similar items
  * Typical resale value for this type of item
  * Competitive pricing strategy
- Similar Items Search Terms: Provide 3-5 specific search queries that would find similar items on marketplaces like eBay, Facebook Marketplace, etc. Make them specific enough to be useful (include brand, model, size, or other distinguishing features)

All prices must be numbers (not strings) in USD. Be realistic and competitive with current market values.
If userContext is provided, incorporate that information into your analysis.`;

async function analyzeImageWithOpenAI(imageUrl: string, userContext?: string) {
  const prompt = userContext
    ? `${MARKETPLACE_PROMPT}\n\nAdditional context from the user: ${userContext}\n\nPlease incorporate this context into your analysis.`
    : MARKETPLACE_PROMPT;

  const { object } = await generateObject({
    model: openai.chat("gpt-4o-mini"),
    schema: analysisSchema,
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          { type: "image", image: imageUrl },
        ],
      },
    ],
  });

  return object;
}

export async function POST(request: NextRequest) {
  try {
    const { listingId, imageUrl, userContext } = await request.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Image URL is required" },
        { status: 400 }
      );
    }

    if (!listingId) {
      return NextResponse.json(
        { error: "Listing ID is required" },
        { status: 400 }
      );
    }

    // Analyze image with OpenAI
    const analysis = await analyzeImageWithOpenAI(imageUrl, userContext);

    // Update the existing listing
    const [updatedListing] = await db
      .update(listings)
      .set({
        title: analysis.title,
        description: analysis.description,
        category: analysis.category,
        condition: analysis.condition,
        brand: analysis.brand,
        size: analysis.size,
        color: analysis.color,
        material: analysis.material,
        keywords: analysis.keywords.join(", "),
        estimatedOriginalPrice:
          analysis.estimatedOriginalPrice?.toString() ?? null,
        listingPrice: analysis.listingPrice.toString(),
        pricingRationale: analysis.pricingRationale,
        similarItemsSearchTerms: analysis.similarItemsSearchTerms.join(", "),
        updatedAt: new Date(),
      })
      .where(eq(listings.id, listingId))
      .returning();

    if (!updatedListing) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedListing);
  } catch (error) {
    console.error("Analysis error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to analyze image";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
