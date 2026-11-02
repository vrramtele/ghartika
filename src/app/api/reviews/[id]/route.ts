import { NextResponse } from "next/server";
import { updateReviewStatus, deleteReview } from "@/lib/db";
import type { ReviewStatus } from "@/types";

// PATCH /api/reviews/[id] — Approve/Reject review or add merchant reply (admin)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, reply } = body;

    const validStatuses: ReviewStatus[] = ["pending", "approved", "rejected"];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid review status" }, { status: 400 });
    }

    const updated = await updateReviewStatus(
      id,
      status as ReviewStatus,
      reply !== undefined ? String(reply).slice(0, 1000) : undefined
    );

    if (!updated) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating review:", error);
    return NextResponse.json({ error: "Failed to update review" }, { status: 500 });
  }
}

// DELETE /api/reviews/[id] — Delete review (admin)
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await deleteReview(id);
    if (!deleted) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting review:", error);
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 });
  }
}
