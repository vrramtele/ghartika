import { NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount } = body;

    if (!amount) {
      return NextResponse.json({ error: "Amount is required" }, { status: 400 });
    }

    // Initialize Razorpay instance
    // Note: It's important to use environment variables for keys in production
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder_key",
      key_secret: process.env.RAZORPAY_KEY_SECRET || "placeholder_secret_key",
    });

    const options = {
      amount: amount * 100, // Razorpay amount is in paise (₹1 = 100 paise)
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`,
    };

    // If using placeholder keys, we mock the order creation
    if (process.env.RAZORPAY_KEY_ID === "rzp_test_placeholder_key") {
      return NextResponse.json({
        id: `mock_order_${Date.now()}`,
        amount: options.amount,
        currency: options.currency,
        receipt: options.receipt,
        status: "created",
      });
    }

    const order = await razorpay.orders.create(options);
    return NextResponse.json(order);
  } catch (error) {
    console.error("Razorpay Error:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
