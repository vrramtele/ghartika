import { NextResponse } from "next/server";
import { getPurchaseOrders, createPurchaseOrder } from "@/lib/db";

export async function GET() {
  try {
    const orders = await getPurchaseOrders();
    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching purchase orders:", error);
    return NextResponse.json({ error: "Failed to fetch purchase orders" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.supplierId || !body.supplierName || !Array.isArray(body.items)) {
      return NextResponse.json({ error: "Supplier and items are required" }, { status: 400 });
    }
    const po = await createPurchaseOrder(body);
    return NextResponse.json(po, { status: 201 });
  } catch (error) {
    console.error("Error creating purchase order:", error);
    return NextResponse.json({ error: "Failed to create purchase order" }, { status: 500 });
  }
}
