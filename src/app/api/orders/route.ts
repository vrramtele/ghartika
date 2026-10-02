import { NextResponse } from "next/server";
import { getOrders, createOrder, CustomerInfo, CartItem } from "@/lib/db";

// GET /api/orders — fetch all orders (admin)
export async function GET() {
  try {
    const orders = getOrders();
    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

// POST /api/orders — place a new order
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { customer, items, total, razorpayOrderId, razorpayPaymentId } = body;

    if (!customer || !items || !total) {
      return NextResponse.json(
        { error: "customer, items, and total are required" },
        { status: 400 }
      );
    }

    const order = createOrder(
      customer as CustomerInfo,
      items as CartItem[],
      total,
      razorpayOrderId,
      razorpayPaymentId
    );

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
