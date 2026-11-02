import { NextResponse } from "next/server";
import { getMediaFiles, createMediaFile } from "@/lib/db";

export async function GET() {
  try {
    const files = await getMediaFiles();
    return NextResponse.json(files);
  } catch (error) {
    console.error("Error fetching media files:", error);
    return NextResponse.json({ error: "Failed to fetch media" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.url || !body.filename) {
      return NextResponse.json({ error: "URL and filename are required" }, { status: 400 });
    }
    const media = await createMediaFile({
      url: body.url,
      filename: body.filename,
      mimeType: body.mimeType || "image/jpeg",
      sizeBytes: body.sizeBytes || 0,
      altText: body.altText || "",
      uploadedBy: body.uploadedBy || "Admin",
      tags: body.tags || [],
    });
    return NextResponse.json(media, { status: 201 });
  } catch (error) {
    console.error("Error creating media record:", error);
    return NextResponse.json({ error: "Failed to create media" }, { status: 500 });
  }
}
