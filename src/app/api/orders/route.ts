import { NextResponse } from "next/server";
import { getOrders, createOrder, CustomerInfo, CartItem } from "@/lib/db";

// GET /api/orders — fetch all orders (admin)
export async function GET() {
  try {
    const orders = await getOrders();
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

    if (!customer || !items || !total || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Valid customer info and items are required" },
        { status: 400 }
      );
    }

    // Input sanitization & validation
    const cleanPhone = String(customer.phone || "").replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      return NextResponse.json(
        { error: "Valid 10-digit phone number is required" },
        { status: 400 }
      );
    }

    const cleanName = String(customer.name || "").trim();
    if (!cleanName || cleanName.length < 2) {
      return NextResponse.json(
        { error: "Valid customer name is required" },
        { status: 400 }
      );
    }

    const cleanCustomer: CustomerInfo = {
      name: cleanName.slice(0, 100),
      email: String(customer.email || "").trim().slice(0, 150),
      phone: cleanPhone.slice(0, 15),
      address: String(customer.address || "").trim().slice(0, 300),
      city: String(customer.city || "").trim().slice(0, 100),
      state: String(customer.state || "").trim().slice(0, 100),
      pincode: String(customer.pincode || "").replace(/\D/g, "").slice(0, 10),
    };

    const cleanTotal = Number(total);
    if (!cleanTotal || cleanTotal <= 0 || isNaN(cleanTotal)) {
      return NextResponse.json({ error: "Invalid order total" }, { status: 400 });
    }

    const order = await createOrder(
      cleanCustomer,
      items as CartItem[],
      cleanTotal,
      typeof razorpayOrderId === "string" ? razorpayOrderId.slice(0, 100) : undefined,
      typeof razorpayPaymentId === "string" ? razorpayPaymentId.slice(0, 100) : undefined
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
