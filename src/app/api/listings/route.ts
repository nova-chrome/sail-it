import { NextRequest, NextResponse } from "next/server";
import { db } from "~/lib/server/db/drizzle";
import { listings } from "~/lib/server/db/schema";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const { imageUrls, additionalContext } = await request.json();

    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
      return NextResponse.json(
        { error: "At least one image URL is required" },
        { status: 400 }
      );
    }

    // Create listing with minimal data - AI will fill in the rest later
    const [listing] = await db
      .insert(listings)
      .values({
        imageUrls,
        userContext: additionalContext || null,
        title: "Processing...",
        description: "AI is analyzing your images...",
      })
      .returning();

    return NextResponse.json(listing);
  } catch (error) {
    console.error("Create listing error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to create listing";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

