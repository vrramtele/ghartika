import { NextResponse } from "next/server";
import { updateMediaFile, deleteMediaFile } from "@/lib/db";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updated = await updateMediaFile(id, body);
    if (!updated) {
      return NextResponse.json({ error: "Media file not found" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating media file:", error);
    return NextResponse.json({ error: "Failed to update media" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const deleted = await deleteMediaFile(id);
    if (!deleted) {
      return NextResponse.json({ error: "Media file not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting media file:", error);
    return NextResponse.json({ error: "Failed to delete media" }, { status: 500 });
  }
}
