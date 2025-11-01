import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import { NextRequest, NextResponse } from "next/server";
import { env } from "~/env";

export const runtime = "nodejs";

const openai = createOpenAI({
  apiKey: env.OPEN_AI_API_KEY,
});

const CONTEXT_SUGGESTION_PROMPT = `You are an expert at analyzing items for online marketplaces. Look at this image and provide a brief, factual description based ONLY on what you can actually see in the image.

Your response should be 2-4 sentences that describe:
- What the item specifically is (be as specific as possible about type, style, appearance)
- Observable features, materials, colors, and design elements you can see
- Visible condition details (scratches, wear, cleanliness, etc.)

CRITICAL RULES:
- Only state facts about what is visible in the image
- Do NOT include placeholders like "[brand name]" or "[add details]"
- Do NOT suggest what the user should add or do
- Do NOT use phrases like "you may want to mention" or "consider adding"
- Do NOT leave gaps for the user to fill in
- Write in a complete, ready-to-use way as if you're describing the item directly

If you cannot determine something from the image, simply don't mention it. Only include concrete observations.`;

async function suggestContextFromImage(imageUrl: string) {
  const { text } = await generateText({
    model: openai.chat("gpt-4o-mini"),
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: CONTEXT_SUGGESTION_PROMPT },
          { type: "image", image: imageUrl },
        ],
      },
    ],
  });

  return text;
}

export async function POST(request: NextRequest) {
  try {
    const { imageUrl } = await request.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Image URL is required" },
        { status: 400 }
      );
    }

    // Generate context suggestion
    const suggestion = await suggestContextFromImage(imageUrl);

    return NextResponse.json({ suggestion });
  } catch (error) {
    console.error("Context suggestion error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to generate context suggestion";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

