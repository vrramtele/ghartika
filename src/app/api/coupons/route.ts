import { NextResponse } from "next/server";
import { getCoupons, createCoupon } from "@/lib/db";
import type { CouponType } from "@/types";

// GET /api/coupons — List all coupons (admin)
export async function GET() {
  try {
    const coupons = await getCoupons();
    return NextResponse.json(coupons);
  } catch (error) {
    console.error("Error fetching coupons:", error);
    return NextResponse.json({ error: "Failed to fetch coupons" }, { status: 500 });
  }
}

// POST /api/coupons — Create a new coupon (admin)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      code,
      type,
      value,
      minCartValue = 0,
      maxDiscount,
      usageLimit,
      expiresAt,
      isActive = true,
      firstOrderOnly = false,
    } = body;

    if (!code || typeof code !== "string" || code.trim().length === 0) {
      return NextResponse.json({ error: "Valid coupon code is required" }, { status: 400 });
    }

    const validTypes: CouponType[] = ["percentage", "flat", "free_shipping"];
    if (!type || !validTypes.includes(type)) {
      return NextResponse.json({ error: "Invalid coupon type (percentage, flat, free_shipping)" }, { status: 400 });
    }

    if (type !== "free_shipping" && (typeof value !== "number" || value <= 0)) {
      return NextResponse.json({ error: "Discount value must be greater than 0" }, { status: 400 });
    }

    if (type === "percentage" && value > 100) {
      return NextResponse.json({ error: "Percentage discount cannot exceed 100%" }, { status: 400 });
    }

    const newCoupon = await createCoupon({
      code: code.trim().toUpperCase(),
      type,
      value: type === "free_shipping" ? 0 : Number(value),
      minCartValue: Number(minCartValue) || 0,
      maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
      usageLimit: usageLimit ? Number(usageLimit) : undefined,
      expiresAt: expiresAt || undefined,
      isActive: Boolean(isActive),
      firstOrderOnly: Boolean(firstOrderOnly),
    });

    return NextResponse.json(newCoupon, { status: 201 });
  } catch (error) {
    console.error("Error creating coupon:", error);
    return NextResponse.json({ error: "Failed to create coupon" }, { status: 500 });
  }
}
