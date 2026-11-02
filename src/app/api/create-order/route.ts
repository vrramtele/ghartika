import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { getStoreSettings } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount } = body;

    if (!amount) {
      return NextResponse.json({ error: "Amount is required" }, { status: 400 });
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
      amount: amount * 100, // Razorpay amount is in paise (₹1 = 100 paise)
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
