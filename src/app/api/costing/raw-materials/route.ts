import { NextResponse } from "next/server";
import { getRawMaterials, createRawMaterial } from "@/lib/db";

export async function GET() {
  try {
    const materials = await getRawMaterials();
    return NextResponse.json(materials);
  } catch (error) {
    console.error("Error fetching raw materials:", error);
    return NextResponse.json({ error: "Failed to fetch raw materials" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      sku,
      purchaseUnit,
      purchaseQuantity,
      purchaseAmount,
      supplier,
      purchaseDate,
      additionalProcurementCosts,
      batchNumber,
      stockQuantity,
      stockUnit,
      expiryDate,
    } = body;

    if (!name || !purchaseUnit || purchaseQuantity === undefined || purchaseAmount === undefined) {
      return NextResponse.json(
        { error: "name, purchaseUnit, purchaseQuantity, and purchaseAmount are required" },
        { status: 400 }
      );
    }

    const created = await createRawMaterial({
      name,
      sku: sku || `RM-${Date.now().toString().slice(-4)}`,
      purchaseUnit,
      purchaseQuantity: Number(purchaseQuantity) || 0,
      purchaseAmount: Number(purchaseAmount) || 0,
      unitRate: 0, // auto-calculated inside createRawMaterial
      supplier,
      purchaseDate: purchaseDate || new Date().toISOString().slice(0, 10),
      additionalProcurementCosts: Number(additionalProcurementCosts) || 0,
      batchNumber,
      stockQuantity: stockQuantity !== undefined ? Number(stockQuantity) : Number(purchaseQuantity) || 0,
      stockUnit: stockUnit || purchaseUnit,
      expiryDate,
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Error creating raw material:", error);
    return NextResponse.json({ error: "Failed to create raw material" }, { status: 500 });
  }
}
