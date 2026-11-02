import { NextResponse } from "next/server";
import { getProductById, updateProduct, deleteProduct, duplicateProduct } from "@/lib/db";

// GET /api/products/[id]
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await getProductById(id);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

// PATCH /api/products/[id] — update product fields
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    // Sanitize / whitelist allowed fields
    const allowed = [
      "name", "price", "originalPrice", "weight", "category", "image", "images",
      "badge", "description", "isCombo", "comboItems", "sku", "stock",
      "lowStockThreshold", "gstPercent", "isActive",
    ];
    const patch: Record<string, unknown> = {};
    for (const key of allowed) {
      if (key in body) {
        patch[key] = body[key];
      }
    }

    if (patch.price !== undefined) patch.price = Number(patch.price);
    if (patch.originalPrice !== undefined) patch.originalPrice = Number(patch.originalPrice);
    if (patch.stock !== undefined) patch.stock = Number(patch.stock);
    if (patch.lowStockThreshold !== undefined) patch.lowStockThreshold = Number(patch.lowStockThreshold);
    if (patch.gstPercent !== undefined) patch.gstPercent = Number(patch.gstPercent);

    const updated = await updateProduct(id, patch);
    if (!updated) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

// DELETE /api/products/[id]
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await deleteProduct(id);
    if (!deleted) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}

// POST /api/products/[id]?action=duplicate
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const url = new URL(req.url);
    if (url.searchParams.get("action") === "duplicate") {
      const duplicated = await duplicateProduct(id);
      if (!duplicated) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
      }
      return NextResponse.json(duplicated, { status: 201 });
    }
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("Error duplicating product:", error);
    return NextResponse.json({ error: "Failed to duplicate product" }, { status: 500 });
  }
}
