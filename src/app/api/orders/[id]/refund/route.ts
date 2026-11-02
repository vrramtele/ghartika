import { NextResponse } from "next/server";
import { getOrderById, updateOrder, logActivity } from "@/lib/db";

// POST /api/orders/[id]/refund — Initiate refund for online/paid order (admin)
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { reason = "Customer Request", amount } = body;

    const order = await getOrderById(id);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.paymentStatus === "Refunded") {
      return NextResponse.json({ error: "Order is already refunded" }, { status: 400 });
    }

    const refundAmount = amount ? Number(amount) : order.total;

    // Razorpay refund integration if live keys present and payment ID exists
    let gatewayRefundId: string | undefined;
    if (
      process.env.RAZORPAY_KEY_ID &&
      process.env.RAZORPAY_KEY_SECRET &&
      order.razorpayPaymentId &&
      order.razorpayPaymentId !== "COD"
    ) {
      try {
        const auth = Buffer.from(
          `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`
        ).toString("base64");

        const rzpRes = await fetch(
          `https://api.razorpay.com/v1/payments/${order.razorpayPaymentId}/refund`,
          {
            method: "POST",
            headers: {
              Authorization: `Basic ${auth}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              amount: refundAmount * 100, // paise
              notes: { reason },
            }),
          }
        );

        if (rzpRes.ok) {
          const rzpData = await rzpRes.json();
          gatewayRefundId = rzpData.id;
        }
      } catch (rzpErr) {
        console.warn("Razorpay API refund call skipped/failed, proceeding with manual mark:", rzpErr);
      }
    }

    // Update order status in DB
    const updatedHistory = [
      ...(order.statusHistory || []),
      {
        status: order.status,
        timestamp: new Date().toISOString(),
        note: `Refund initiated: ₹${refundAmount} (${reason})${gatewayRefundId ? ` [Razorpay: ${gatewayRefundId}]` : ""}`,
      },
    ];

    const updated = await updateOrder(id, {
      paymentStatus: "Refunded",
      adminNote: `${order.adminNote ? order.adminNote + " | " : ""}REFUND: ₹${refundAmount} (${reason})`,
      statusHistory: updatedHistory,
    });

    await logActivity("Refund Initiated", `Order ${id} refunded ₹${refundAmount} - ${reason}`);

    return NextResponse.json({ success: true, order: updated, gatewayRefundId });
  } catch (error) {
    console.error("Error processing refund:", error);
    return NextResponse.json({ error: "Failed to process refund" }, { status: 500 });
  }
}
