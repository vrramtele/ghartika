import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { getStoreSettings, getProducts, getCouponByCode } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, items, couponCode } = body;

    let finalAmount = Number(amount);
    if (!finalAmount || finalAmount <= 0 || isNaN(finalAmount)) {
      return NextResponse.json({ error: "Valid positive amount is required" }, { status: 400 });
    }

    // ── Security: Anti-Tampering Server-Side Price Verification ──────────────
    if (items && Array.isArray(items) && items.length > 0) {
      const dbProducts = await getProducts().catch(() => []);
      const productMap = new Map(dbProducts.map((p) => [p.id, p]));
      let expectedSubtotal = 0;

      for (const item of items) {
        const prod = productMap.get(item.id);
        const realPrice = prod ? prod.price : item.price;
        expectedSubtotal += realPrice * (Number(item.quantity) || 1);
      }

      let discount = 0;
      if (couponCode && typeof couponCode === "string") {
        const coupon = await getCouponByCode(couponCode).catch(() => null);
        if (coupon && coupon.isActive) {
          if (coupon.type === "percentage") {
            discount = Math.round((expectedSubtotal * coupon.value) / 100);
            if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
          } else if (coupon.type === "flat") {
            discount = coupon.value;
          }
        }
      }

      const verifiedTotal = Math.max(0, expectedSubtotal - discount);
      // Enforce the server-verified total to prevent client-side price hacks
      if (Math.abs(finalAmount - verifiedTotal) > 1) {
        console.warn(`[Security] Price tampering detected: Client submitted ₹${finalAmount}, server enforced ₹${verifiedTotal}`);
        finalAmount = verifiedTotal;
      }
    }

    // Check database settings first, then environment variables
    const settings = await getStoreSettings().catch(() => null);
    const keyId = settings?.razorpayKeyId || process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";
    const keySecret = settings?.razorpayKeySecret || process.env.RAZORPAY_KEY_SECRET || "";

    // Initialize Razorpay instance
    const razorpay = new Razorpay({
      key_id: keyId || "rzp_test_placeholder_key",
      key_secret: keySecret || "placeholder_secret_key",
    });

    const options = {
      amount: Math.round(finalAmount * 100), // Razorpay amount is in paise (₹1 = 100 paise)
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`,
    };

    // If using placeholder keys, we mock the order creation
    if (!keyId || keyId === "rzp_test_placeholder_key") {
      return NextResponse.json({
        id: `mock_order_${Date.now()}`,
        amount: options.amount,
        currency: options.currency,
        receipt: options.receipt,
        status: "created",
        key_id: "rzp_test_placeholder_key",
      });
    }

    const order = await razorpay.orders.create(options);
    return NextResponse.json({
      ...order,
      key_id: keyId,
    });
  } catch (error) {
    console.error("Razorpay Error:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
