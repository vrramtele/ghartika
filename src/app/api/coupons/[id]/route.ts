import { NextResponse } from "next/server";
import { updateCoupon, deleteCoupon } from "@/lib/db";

// PATCH /api/coupons/[id] — Update coupon fields (admin)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const allowed = [
      "code",
      "type",
      "value",
      "minCartValue",
      "maxDiscount",
      "usageLimit",
      "expiresAt",
      "isActive",
      "firstOrderOnly",
    ];

    const patch: Record<string, unknown> = {};
    for (const key of allowed) {
      if (key in body) patch[key] = body[key];
    }

    if (patch.value !== undefined) patch.value = Number(patch.value);
    if (patch.minCartValue !== undefined) patch.minCartValue = Number(patch.minCartValue);
    if (patch.maxDiscount !== undefined) patch.maxDiscount = patch.maxDiscount ? Number(patch.maxDiscount) : undefined;
    if (patch.usageLimit !== undefined) patch.usageLimit = patch.usageLimit ? Number(patch.usageLimit) : undefined;
    if (patch.code && typeof patch.code === "string") patch.code = patch.code.trim().toUpperCase();

    const updated = await updateCoupon(id, patch);
    if (!updated) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating coupon:", error);
    return NextResponse.json({ error: "Failed to update coupon" }, { status: 500 });
  }
}

// DELETE /api/coupons/[id] — Delete coupon (admin)
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await deleteCoupon(id);
    if (!deleted) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting coupon:", error);
    return NextResponse.json({ error: "Failed to delete coupon" }, { status: 500 });
  }
}
