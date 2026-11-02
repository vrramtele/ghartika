import { NextResponse } from "next/server";
import { getSEOPages, updateSEOPages } from "@/lib/db";

export async function GET() {
  try {
    const pages = await getSEOPages();
    return NextResponse.json(pages);
  } catch (error) {
    console.error("Error fetching SEO pages:", error);
    return NextResponse.json({ error: "Failed to fetch SEO pages" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, ...data } = body;
    if (!id) {
      return NextResponse.json({ error: "Page ID is required" }, { status: 400 });
    }
    const updated = await updateSEOPages(id, data);
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating SEO meta:", error);
    return NextResponse.json({ error: "Failed to update SEO" }, { status: 500 });
  }
}
