import { createOpenAI } from "@ai-sdk/openai";
import { generateObject, UserContent } from "ai";
import z from "zod";

export const MARKETPLACE_PROMPT = `You are an expert at analyzing items for online marketplaces. Analyze the provided image and generate comprehensive listing information that includes ALL fields a seller would need.

Your goal is to provide complete, ready-to-use information so the seller doesn't have to think about what to fill out.

Guidelines:
- Title: Create a compelling, SEO-friendly title (60-80 characters) that includes brand/model if visible. Make it searchable and attractive.
- Description: Write a conversational, friendly description (150-300 words) in first-person as if you're the seller casually describing the item to a friend. Use natural language, contractions (I'm, it's, there's), and a personal tone like you'd use on Facebook Marketplace or OfferUp. Include:
  * Personal context if appropriate ("Used this in my home office for 2 years", "My kids outgrew this")
  * Honest condition description with any wear/defects mentioned naturally
  * Key details like dimensions, size, materials, brand/model
  * Why someone would love this item
  * Casual sign-off phrases like "Feel free to message with questions!" or "Cash or Venmo works!"
  * Avoid overly formal or retail-style language - write like a real person selling their stuff
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
- Product Count: Count the number of distinct products visible in the images. If there are multiple separate items being sold together, count each one.
- Original Product Link: If there is EXACTLY ONE product (productCount = 1) and you can identify the brand and model with confidence, provide a direct URL to where this exact product can be purchased new (e.g., manufacturer website, Amazon, major retailer). If there are multiple products (productCount > 1) or you cannot identify the product with certainty, set this to null. IMPORTANT: Only provide a link if productCount is exactly 1.
- Similar Product Links: Provide 3-5 actual URLs to similar products currently listed on online marketplaces. Include a variety of platforms (eBay, Poshmark, Mercari, Facebook Marketplace, etc.). For each link, provide:
  * A brief title describing the similar product
  * The actual URL to the listing
  * The platform name
  These should be real, existing marketplace listings that are comparable to the item being analyzed.

All prices must be numbers (not strings) in USD. Be realistic and competitive with current market values.
If userContext is provided, incorporate that information into your analysis.`;

const analysisSchema = z.object({
  title: z
    .string()
    .describe(
      "A compelling, SEO-friendly title (60-80 characters) that includes brand/model if visible"
    ),
  description: z
    .string()
    .describe(
      "A conversational, friendly description (150-300 words) written in first-person as if the seller is personally describing the item. Should sound natural and casual like posting to Facebook or OfferUp - use contractions, casual language, and personal touches while covering key details, condition, features, any flaws, and why someone would love it"
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
  productCount: z
    .number()
    .describe(
      "The number of distinct products visible in the image(s). Count carefully - if there are multiple separate items, count them all."
    ),
  originalProductLink: z
    .string()
    .nullable()
    .describe(
      "If productCount is exactly 1 and the product is identifiable (brand, model visible), provide a direct link to where this product can be purchased new online (e.g., manufacturer website, major retailer). Return null if productCount > 1 or if product cannot be identified with confidence."
    ),
  similarProductLinks: z
    .array(
      z.object({
        title: z.string().describe("Brief title of the similar product"),
        url: z.string().describe("URL to the similar product listing"),
        platform: z
          .string()
          .describe(
            "Platform name (e.g., 'eBay', 'Amazon', 'Poshmark', 'Facebook Marketplace')"
          ),
      })
    )
    .describe(
      "Array of 3-5 links to similar products currently listed online on marketplaces. Include a mix of platforms when possible."
    ),
});

export async function analyzeListingWithOpenAI(
  openai: ReturnType<typeof createOpenAI>,
  imageUrls: string[],
  userContext?: string
) {
  const prompt = userContext
    ? `${MARKETPLACE_PROMPT}\n\nAdditional context from the user: ${userContext}\n\nPlease incorporate this context into your analysis.`
    : MARKETPLACE_PROMPT;

  const content: UserContent = [
    { type: "text" as const, text: prompt },
    ...imageUrls.map((url) => ({ type: "image" as const, image: url })),
  ];

  const { object } = await generateObject({
    model: openai.chat("gpt-4o"),
    schema: analysisSchema,
    messages: [
      {
        role: "user",
        content,
      },
    ],
  });

  return object;
}
