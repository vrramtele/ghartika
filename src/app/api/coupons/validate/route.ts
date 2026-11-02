import { NextResponse } from "next/server";
import { getCouponByCode, getOrders } from "@/lib/db";

// POST /api/coupons/validate — Validate a coupon code at checkout (public)
export async function POST(req: Request) {
  try {
    const { code, cartTotal, customerPhone } = await req.json();

    if (!code || typeof code !== "string") {
      return NextResponse.json({ valid: false, message: "Please enter a coupon code" }, { status: 400 });
    }

    const coupon = await getCouponByCode(code);
    if (!coupon || !coupon.isActive) {
      return NextResponse.json({ valid: false, message: "Invalid or expired coupon code" }, { status: 400 });
    }

    // Expiry check
    if (coupon.expiresAt) {
      const expDate = new Date(coupon.expiresAt);
      if (Date.now() > expDate.getTime()) {
        return NextResponse.json({ valid: false, message: "This coupon has expired" }, { status: 400 });
      }
    }

    // Usage limit check
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json({ valid: false, message: "This coupon has reached its maximum usage limit" }, { status: 400 });
    }

    // Min cart value check
    const currentTotal = Number(cartTotal) || 0;
    if (coupon.minCartValue && currentTotal < coupon.minCartValue) {
      return NextResponse.json({
        valid: false,
        message: `Minimum order value of ₹${coupon.minCartValue.toLocaleString("en-IN")} required for this coupon`,
      }, { status: 400 });
    }

    // First order only check
    if (coupon.firstOrderOnly && customerPhone) {
      const orders = await getOrders();
      const hasPreviousOrder = orders.some((o) => o.customer.phone === customerPhone && o.status !== "Cancelled");
      if (hasPreviousOrder) {
        return NextResponse.json({
          valid: false,
          message: "This coupon is valid only on your first order",
        }, { status: 400 });
      }
    }

    // Calculate discount amount
    let discountAmount = 0;
    let isFreeShipping = false;

    if (coupon.type === "percentage") {
      const rawDiscount = Math.round((currentTotal * coupon.value) / 100);
      discountAmount = coupon.maxDiscount ? Math.min(rawDiscount, coupon.maxDiscount) : rawDiscount;
    } else if (coupon.type === "flat") {
      discountAmount = Math.min(coupon.value, currentTotal);
    } else if (coupon.type === "free_shipping") {
      isFreeShipping = true;
      discountAmount = 0; // handled as 0 shipping charge at checkout
    }

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      type: coupon.type,
      discountAmount,
      isFreeShipping,
      coupon,
      message: isFreeShipping
        ? "Free Shipping applied!"
        : `₹${discountAmount.toLocaleString("en-IN")} discount applied!`,
    });
  } catch (error) {
    console.error("Error validating coupon:", error);
    return NextResponse.json({ valid: false, message: "Error validating coupon" }, { status: 500 });
  }
}
