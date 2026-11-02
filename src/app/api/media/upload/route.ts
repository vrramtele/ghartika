import { NextResponse } from "next/server";
import { createMediaFile } from "@/lib/db";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save to public/uploads directory
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const filePath = path.join(uploadsDir, safeName);
    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${safeName}`;

    const media = await createMediaFile({
      url: publicUrl,
      filename: file.name,
      mimeType: file.type || "image/jpeg",
      sizeBytes: file.size,
      altText: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
      uploadedBy: "Admin",
      tags: ["upload"],
    });

    return NextResponse.json(media, { status: 201 });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json({ error: "File upload failed" }, { status: 500 });
  }
}
