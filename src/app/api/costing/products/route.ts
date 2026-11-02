import { NextResponse } from "next/server";
import { getProductCosts, saveProductCost, getProducts } from "@/lib/db";
import { calculateReadyProductCost } from "@/lib/costing-engine";
import type { ProductCostConfig } from "@/types";

export async function GET() {
  try {
    const [costs, products] = await Promise.all([getProductCosts(), getProducts()]);
    const costMap = new Map(costs.map((c) => [c.productId, c]));

    // Join with storefront products so all products are available for costing
    const enriched = products.map((p) => {
      const existing = costMap.get(p.id);
      if (existing) {
        return {
          ...existing,
          currentPrice: p.price,
          category: p.category,
          weight: p.weight,
        };
      }
      return {
        id: `cost_${p.id}`,
        productId: p.id,
        productName: p.name,
        variantSize: p.weight || "250g",
        sku: p.sku || `GT-${p.id.toUpperCase()}`,
        costingMethod: p.isCombo ? "combo" : "ready_product",
        totalUnitCost: p.costPrice || 0,
        sellingPrice: p.price,
        gstPercent: p.gstPercent || 5,
        effectiveDate: new Date().toISOString().slice(0, 10),
        costStatus: p.costPrice && p.costPrice > 0 ? "configured" : "cost_missing",
        currentPrice: p.price,
        category: p.category,
        weight: p.weight,
        updatedAt: new Date().toISOString(),
        updatedBy: "System",
      };
    });

    return NextResponse.json(enriched);
  } catch (error) {
    console.error("Error fetching product costs:", error);
    return NextResponse.json({ error: "Failed to fetch product costs" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      productId,
      productName,
      variantSize,
      sku,
      costingMethod,
      readyProductCost,
      recipeId,
      comboComponents,
      sellingPrice,
      mrp,
      gstPercent,
      effectiveDate,
      notes,
      changedBy = "Admin",
      changeReason = "Updated via Product Costing",
    } = body;

    if (!productId || !productName) {
      return NextResponse.json({ error: "productId and productName are required" }, { status: 400 });
    }

    let calculatedTotalCost = 0;

    if (costingMethod === "ready_product" && readyProductCost) {
      const res = calculateReadyProductCost(readyProductCost);
      calculatedTotalCost = res.totalUnitCost;
    } else if (costingMethod === "combo" && Array.isArray(comboComponents)) {
      calculatedTotalCost = comboComponents.reduce(
        (sum, item) => sum + (Number(item.totalCost) || Number(item.unitCost) * Number(item.quantity) || 0),
        0
      );
    } else {
      calculatedTotalCost = Math.max(0, Number(body.totalUnitCost) || 0);
    }

    const saved = await saveProductCost(
      {
        productId,
        productName,
        variantSize: variantSize || "250g",
        sku: sku || `GT-${productId.toUpperCase()}`,
        costingMethod: costingMethod || "ready_product",
        readyProductCost,
        recipeId,
        comboComponents,
        totalUnitCost: Math.round(calculatedTotalCost * 100) / 100,
        sellingPrice: Math.max(0, Number(sellingPrice) || 0),
        mrp: mrp ? Math.max(0, Number(mrp)) : undefined,
        gstPercent: Number(gstPercent) || 5,
        effectiveDate: effectiveDate || new Date().toISOString().slice(0, 10),
        costStatus: calculatedTotalCost > 0 ? "configured" : "cost_missing",
        notes,
      },
      changedBy,
      changeReason
    );

    return NextResponse.json(saved, { status: 200 });
  } catch (error) {
    console.error("Error saving product cost:", error);
    return NextResponse.json({ error: "Failed to save product cost" }, { status: 500 });
  }
}
