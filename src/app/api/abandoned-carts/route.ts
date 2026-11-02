import { NextResponse } from "next/server";
import { getAbandonedCarts, saveAbandonedCart } from "@/lib/db";

// GET /api/abandoned-carts — Fetch all abandoned carts (admin)
export async function GET() {
  try {
    const carts = await getAbandonedCarts();
    return NextResponse.json(carts);
  } catch (error) {
    console.error("Error fetching abandoned carts:", error);
    return NextResponse.json({ error: "Failed to fetch abandoned carts" }, { status: 500 });
  }
}

// POST /api/abandoned-carts — Save partial cart when customer fills contact/phone (public checkout hook)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { customer, items, total } = body;

    if (!customer?.phone || typeof customer.phone !== "string" || customer.phone.trim().length < 10) {
      return NextResponse.json({ error: "Valid phone number is required" }, { status: 400 });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Items array is required" }, { status: 400 });
    }

    const saved = await saveAbandonedCart({
      customer: {
        name: customer.name?.slice(0, 100),
        phone: customer.phone.trim().slice(0, 15),
        email: customer.email?.slice(0, 100),
        address: customer.address?.slice(0, 250),
        city: customer.city?.slice(0, 100),
        state: customer.state?.slice(0, 100),
        pincode: customer.pincode?.slice(0, 10),
      },
      items,
      total: Number(total) || 0,
    });

    return NextResponse.json(saved, { status: 201 });
  } catch (error) {
    console.error("Error saving abandoned cart:", error);
    return NextResponse.json({ error: "Failed to save cart snapshot" }, { status: 500 });
  }
}
