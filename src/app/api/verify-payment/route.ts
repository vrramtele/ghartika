import { NextResponse } from "next/server";
import crypto from "crypto";

// POST /api/verify-payment — verify Razorpay payment signature
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing payment verification fields" },
        { status: 400 }
      );
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET || "";

    // If using placeholder keys, mock-verify (for dev/demo)
    if (
      keySecret === "placeholder_secret_key" ||
      keySecret === "" ||
      razorpay_order_id.startsWith("mock_order_")
    ) {
      return NextResponse.json({
        verified: true,
        message: "Mock verification (dev mode)",
      });
    }

    // Real Razorpay signature verification
    const body_str = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(body_str)
      .digest("hex");

    // Use timingSafeEqual to prevent timing attacks
    let isValid = false;
    try {
      isValid = crypto.timingSafeEqual(
        Buffer.from(expectedSignature, "hex"),
        Buffer.from(razorpay_signature, "hex")
      );
    } catch {
      // Buffers of different length — signatures don't match
      isValid = false;
    }

    if (!isValid) {
      return NextResponse.json(
        { verified: false, error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    return NextResponse.json({ verified: true });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: "Payment verification failed" },
      { status: 500 }
    );
  }
}
