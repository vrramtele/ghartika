import { NextResponse } from "next/server";
import { getInventoryLogs, addInventoryLog, getProductById, updateProduct } from "@/lib/db";
import type { InventoryReason } from "@/types";

// GET /api/inventory/logs — List inventory logs (admin)
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const productId = url.searchParams.get("productId") || undefined;
    const logs = await getInventoryLogs(productId);
    return NextResponse.json(logs);
  } catch (error) {
    console.error("Error fetching inventory logs:", error);
    return NextResponse.json({ error: "Failed to fetch inventory logs" }, { status: 500 });
  }
}

// POST /api/inventory/logs — Restock or adjust stock with log (admin)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { productId, change, reason = "Restock", updatedBy = "Admin" } = body;

    if (!productId || typeof change !== "number" || change === 0) {
      return NextResponse.json(
        { error: "productId and non-zero change are required" },
        { status: 400 }
      );
    }

    const product = await getProductById(productId);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const previousStock = product.stock ?? 0;
    const newStock = Math.max(0, previousStock + change);

    // Update product stock in DB
    await updateProduct(productId, { stock: newStock });

    // Add audit log
    const log = await addInventoryLog({
      productId,
      productName: product.name,
      change,
      previousStock,
      newStock,
      reason: reason as InventoryReason,
      updatedBy: String(updatedBy).slice(0, 50),
    });

    return NextResponse.json({ log, product: { ...product, stock: newStock } }, { status: 201 });
  } catch (error) {
    console.error("Error updating inventory:", error);
    return NextResponse.json({ error: "Failed to update inventory" }, { status: 500 });
  }
}
