import { NextResponse } from "next/server";
import { getProductRecipes, createProductRecipe, saveProductCost } from "@/lib/db";
import { calculateRecipeBatchCost } from "@/lib/costing-engine";

export async function GET() {
  try {
    const recipes = await getProductRecipes();
    return NextResponse.json(recipes);
  } catch (error) {
    console.error("Error fetching recipes:", error);
    return NextResponse.json({ error: "Failed to fetch recipes" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      productId,
      productName,
      variantSize,
      ingredients,
      packagingItems,
      processingCharges,
      laborOverhead,
      otherDirectCosts,
      batchInputQuantity,
      batchInputUnit,
      expectedWastagePercent,
      actualSaleableOutputUnits,
      variantGrams,
      applyToProductCost = false, // if true, approves & pushes to ProductCostConfig
      sellingPrice,
      changedBy = "Admin",
      notes,
    } = body;

    if (!productId || !productName) {
      return NextResponse.json({ error: "productId and productName are required" }, { status: 400 });
    }

    const calc = calculateRecipeBatchCost({
      ingredients: ingredients || [],
      packagingItems: packagingItems || [],
      processingCharges: Number(processingCharges) || 0,
      laborOverhead: Number(laborOverhead) || 0,
      otherDirectCosts: Number(otherDirectCosts) || 0,
      batchInputQuantity: Number(batchInputQuantity) || 100,
      batchInputUnit: batchInputUnit || "kg",
      expectedWastagePercent: Number(expectedWastagePercent) || 0,
      actualSaleableOutputUnits: Number(actualSaleableOutputUnits) || 0,
      variantGrams: Number(variantGrams) || 250,
    });

    const newRecipe = await createProductRecipe({
      productId,
      productName,
      variantSize: variantSize || "250g",
      ingredients: ingredients || [],
      processingCharges: Number(processingCharges) || 0,
      laborOverhead: Number(laborOverhead) || 0,
      packagingItems: packagingItems || [],
      packagingCost: calc.totalPackagingCost,
      otherDirectCosts: Number(otherDirectCosts) || 0,
      batchInputQuantity: Number(batchInputQuantity) || 100,
      batchInputUnit: batchInputUnit || "kg",
      expectedWastagePercent: Number(expectedWastagePercent) || 0,
      actualSaleableOutputUnits: calc.actualSaleableOutputUnits,
      totalBatchCost: calc.totalBatchCost,
      calculatedCostPerUnit: calc.costPerFinishedUnit,
      version: 1,
      isActive: true,
      approvedAt: applyToProductCost ? new Date().toISOString() : undefined,
      approvedBy: applyToProductCost ? changedBy : undefined,
      notes,
    });

    // If user asked to apply directly to active product cost
    if (applyToProductCost && calc.costPerFinishedUnit > 0) {
      await saveProductCost(
        {
          productId,
          productName,
          variantSize: variantSize || "250g",
          sku: `GT-${productId.toUpperCase()}`,
          costingMethod: "raw_material",
          recipeId: newRecipe.id,
          totalUnitCost: calc.costPerFinishedUnit,
          sellingPrice: Number(sellingPrice) || 0,
          gstPercent: 5,
          effectiveDate: new Date().toISOString().slice(0, 10),
          costStatus: "configured",
          notes: `Calculated from Recipe version ${newRecipe.version}`,
        },
        changedBy,
        `Applied from recipe batch calculation (₹${calc.costPerFinishedUnit}/unit)`
      );
    }

    return NextResponse.json(newRecipe, { status: 201 });
  } catch (error) {
    console.error("Error creating product recipe:", error);
    return NextResponse.json({ error: "Failed to create recipe" }, { status: 500 });
  }
}
