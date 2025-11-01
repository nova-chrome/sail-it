import { put } from "@vercel/blob";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";
import { env } from "~/env";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Generate a unique filename to allow multiple uploads of the same image
    const extension = file.name.split(".").pop();
    const uniqueFilename = `${nanoid()}.${extension}`;

    const blob = await put(uniqueFilename, file, {
      access: "public",
      token: env.BLOB_READ_WRITE_TOKEN,
    });

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
