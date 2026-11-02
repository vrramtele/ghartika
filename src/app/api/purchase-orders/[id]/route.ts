import { NextResponse } from "next/server";
import { updatePurchaseOrder } from "@/lib/db";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updated = await updatePurchaseOrder(id, body);
    if (!updated) {
      return NextResponse.json({ error: "Purchase order not found" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating purchase order:", error);
    return NextResponse.json({ error: "Failed to update purchase order" }, { status: 500 });
  }
}
