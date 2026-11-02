import { NextResponse } from "next/server";
import { markCartRecovered } from "@/lib/db";

// PATCH /api/abandoned-carts/[id] — Mark cart as recovered / add note (admin)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { note } = body;

    const updated = await markCartRecovered(id, note);
    if (!updated) {
      return NextResponse.json({ error: "Abandoned cart not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error marking cart recovered:", error);
    return NextResponse.json({ error: "Failed to update abandoned cart" }, { status: 500 });
  }
}
