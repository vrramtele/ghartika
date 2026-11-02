import { NextResponse } from "next/server";
import { bulkUpdateOrderStatus } from "@/lib/db";
import type { OrderStatus } from "@/types";

const VALID_STATUSES: OrderStatus[] = [
  "Pending", "Confirmed", "Packed", "Shipped", "Delivered", "Cancelled", "Returned",
];

// POST /api/orders/bulk — bulk update order statuses (admin)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { ids, status } = body as { ids: string[]; status: OrderStatus };

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "ids must be a non-empty array" },
        { status: 400 }
      );
    }
    if (ids.length > 100) {
      return NextResponse.json(
        { error: "Maximum 100 orders per bulk update" },
        { status: 400 }
      );
    }
    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Sanitize IDs
    const sanitizedIds = ids
      .filter((id) => typeof id === "string")
      .map((id) => id.trim().slice(0, 50));

    const result = await bulkUpdateOrderStatus(sanitizedIds, status);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error bulk updating orders:", error);
    return NextResponse.json({ error: "Bulk update failed" }, { status: 500 });
  }
}
