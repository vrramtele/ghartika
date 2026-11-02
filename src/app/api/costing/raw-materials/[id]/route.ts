import { NextResponse } from "next/server";
import { updateRawMaterial, deleteRawMaterial } from "@/lib/db";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    // Recalculate unit rate if amount or quantity changed
    if (body.purchaseAmount !== undefined || body.purchaseQuantity !== undefined || body.purchaseUnit) {
      const amount = Number(body.purchaseAmount) || 0;
      const qty = Number(body.purchaseQuantity) || 1;
      let rate = qty > 0 ? amount / qty : 0;
      if (body.purchaseUnit === "kg" || body.purchaseUnit === "l") {
        rate = rate / 1000;
      }
      body.unitRate = Math.round(rate * 10000) / 10000;
    }

    const updated = await updateRawMaterial(id, body);
    if (!updated) {
      return NextResponse.json({ error: "Raw material not found" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating raw material:", error);
    return NextResponse.json({ error: "Failed to update raw material" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const deleted = await deleteRawMaterial(id);
    if (!deleted) {
      return NextResponse.json({ error: "Raw material not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting raw material:", error);
    return NextResponse.json({ error: "Failed to delete raw material" }, { status: 500 });
  }
}
