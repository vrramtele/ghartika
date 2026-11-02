import { NextResponse } from "next/server";
import { getSuppliers, createSupplier } from "@/lib/db";

export async function GET() {
  try {
    const suppliers = await getSuppliers();
    return NextResponse.json(suppliers);
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    return NextResponse.json({ error: "Failed to fetch suppliers" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.name) {
      return NextResponse.json({ error: "Supplier name is required" }, { status: 400 });
    }
    const supplier = await createSupplier(body);
    return NextResponse.json(supplier, { status: 201 });
  } catch (error) {
    console.error("Error creating supplier:", error);
    return NextResponse.json({ error: "Failed to create supplier" }, { status: 500 });
  }
}
