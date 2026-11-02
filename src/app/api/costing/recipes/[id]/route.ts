import { NextResponse } from "next/server";
import { updateProductRecipe, saveProductCost } from "@/lib/db";
import { calculateRecipeBatchCost } from "@/lib/costing-engine";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    // If calculation parameters are provided, recompute
    if (body.ingredients || body.batchInputQuantity || body.actualSaleableOutputUnits) {
      const calc = calculateRecipeBatchCost({
        ingredients: body.ingredients || [],
        packagingItems: body.packagingItems || [],
        processingCharges: Number(body.processingCharges) || 0,
        laborOverhead: Number(body.laborOverhead) || 0,
        otherDirectCosts: Number(body.otherDirectCosts) || 0,
        batchInputQuantity: Number(body.batchInputQuantity) || 100,
        batchInputUnit: body.batchInputUnit || "kg",
        expectedWastagePercent: Number(body.expectedWastagePercent) || 0,
        actualSaleableOutputUnits: Number(body.actualSaleableOutputUnits) || 0,
        variantGrams: Number(body.variantGrams) || 250,
      });

      body.totalBatchCost = calc.totalBatchCost;
      body.packagingCost = calc.totalPackagingCost;
      body.actualSaleableOutputUnits = calc.actualSaleableOutputUnits;
      body.calculatedCostPerUnit = calc.costPerFinishedUnit;
    }

    // Version increment on save
    if (body.incrementVersion) {
      body.version = (body.version || 1) + 1;
    }

    const updated = await updateProductRecipe(id, body);
    if (!updated) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    // If approved and applied
    if (body.applyToProductCost && updated.calculatedCostPerUnit > 0) {
      await saveProductCost(
        {
          productId: updated.productId,
          productName: updated.productName,
          variantSize: updated.variantSize,
          sku: `GT-${updated.productId.toUpperCase()}`,
          costingMethod: "raw_material",
          recipeId: updated.id,
          totalUnitCost: updated.calculatedCostPerUnit,
          sellingPrice: Number(body.sellingPrice) || 0,
          gstPercent: 5,
          effectiveDate: new Date().toISOString().slice(0, 10),
          costStatus: "configured",
          notes: `Approved recipe version ${updated.version}`,
        },
        body.changedBy || "Admin",
        `Recipe update applied (₹${updated.calculatedCostPerUnit}/unit)`
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating recipe:", error);
    return NextResponse.json({ error: "Failed to update recipe" }, { status: 500 });
  }
}
