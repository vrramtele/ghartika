import { NextResponse } from "next/server";
import { getOrderById, updateOrder, updateOrderStatus } from "@/lib/db";
import type { OrderStatus } from "@/types";

const VALID_STATUSES: OrderStatus[] = [
  "Pending", "Confirmed", "Packed", "Shipped", "Delivered", "Cancelled", "Returned",
];

// GET /api/orders/[id] — fetch single order (admin)
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = await getOrderById(id);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    return NextResponse.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}

// PATCH /api/orders/[id] — update order (status, shipping, notes, etc.)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    // If only updating status (simple flow)
    if (body.status && Object.keys(body).length === 1) {
      const { status } = body as { status: OrderStatus };
      if (!VALID_STATUSES.includes(status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
      const updated = await updateOrderStatus(id, status);
      if (!updated) return NextResponse.json({ error: "Order not found" }, { status: 404 });
      return NextResponse.json(updated);
    }

    // Full patch (shipping, notes, paymentStatus, etc.)
    const {
      status,
      courierName,
      trackingId,
      trackingUrl,
      adminNote,
      paymentStatus,
    } = body;

    // Validate status if provided
    if (status && !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const patch: Parameters<typeof updateOrder>[1] = {};
    if (status !== undefined) patch.status = status;
    if (courierName !== undefined) patch.courierName = String(courierName).slice(0, 100);
    if (trackingId !== undefined) patch.trackingId = String(trackingId).slice(0, 100);
    if (trackingUrl !== undefined) patch.trackingUrl = String(trackingUrl).slice(0, 500);
    if (adminNote !== undefined) patch.adminNote = String(adminNote).slice(0, 2000);
    if (paymentStatus !== undefined) patch.paymentStatus = paymentStatus;

    const updated = await updateOrder(id, patch);
    if (!updated) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
