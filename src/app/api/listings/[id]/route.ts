import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "~/lib/server/db/drizzle";
import { listings } from "~/lib/server/db/schema";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [listing] = await db
      .select()
      .from(listings)
      .where(eq(listings.id, id))
      .limit(1);

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    return NextResponse.json(listing);
  } catch (error) {
    console.error("Fetch listing error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch listing";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
