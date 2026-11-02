/**
 * @file src/lib/costing-engine.ts
 * Reusable Financial Calculation Engine for GharTika Product Cost & Profit Management.
 * Implements strict, normalized financial formulas and unit conversion logic.
 */

import type {
  MeasurementUnit,
  ProductCostConfig,
  ProductRecipe,
  ReadyProductCostDetails,
  RecipeIngredient,
  PackagingItem,
  OrderLineCostSnapshot,
  CartItem,
  Order,
} from "@/types";

// ── Unit Conversions ─────────────────────────────────────────────────────────

/**
 * Converts quantity from source unit to target unit.
 * Supports:
 * - Weight: g <-> kg (1 kg = 1,000 g)
 * - Volume: ml <-> l (1 l = 1,000 ml)
 * - Count: pcs <-> pcs
 */
export function convertMeasurement(
  quantity: number,
  fromUnit: MeasurementUnit,
  toUnit: MeasurementUnit
): number {
  if (fromUnit === toUnit) return quantity;

  // Weight conversions
  if (fromUnit === "kg" && toUnit === "g") return quantity * 1000;
  if (fromUnit === "g" && toUnit === "kg") return quantity / 1000;

  // Volume conversions
  if (fromUnit === "l" && toUnit === "ml") return quantity * 1000;
  if (fromUnit === "ml" && toUnit === "l") return quantity / 1000;

  // Incompatible or non-convertible (e.g. pcs with kg)
  return quantity;
}

/**
 * Calculates the unit cost for an ingredient based on the raw material purchase rate.
 * Example: Raw Material purchased at ₹450 per kg, recipe requires 250 g.
 * Base unit rate = 450 / 1000 = ₹0.45/g. Cost for 250 g = 250 * 0.45 = ₹112.50.
 */
export function calculateIngredientCost(
  rawMaterialPurchaseAmount: number,
  rawMaterialPurchaseQty: number,
  rawMaterialPurchaseUnit: MeasurementUnit,
  recipeQuantity: number,
  recipeUnit: MeasurementUnit
): number {
  if (rawMaterialPurchaseQty <= 0) return 0;

  // Standardize purchase quantity to the recipe unit
  const normalizedPurchaseQty = convertMeasurement(
    rawMaterialPurchaseQty,
    rawMaterialPurchaseUnit,
    recipeUnit
  );

  if (normalizedPurchaseQty <= 0) return 0;
  const costPerRecipeUnit = rawMaterialPurchaseAmount / normalizedPurchaseQty;
  return Math.round(costPerRecipeUnit * recipeQuantity * 100) / 100;
}

// ── Method A: Ready Product Cost Calculation ────────────────────────────────

export function calculateReadyProductCost(details: ReadyProductCostDetails): {
  totalUnitCost: number;
} {
  const baseCost = Math.max(0, Number(details.baseCost) || 0);
  const packagingCost = Math.max(0, Number(details.packagingCost) || 0);
  const directProcessingCost = Math.max(0, Number(details.directProcessingCost) || 0);
  const otherDirectCost = Math.max(0, Number(details.otherDirectCost) || 0);
  const variableCost = Math.max(0, Number(details.variableCost) || 0);

  const total = baseCost + packagingCost + directProcessingCost + otherDirectCost + variableCost;
  return {
    totalUnitCost: Math.round(total * 100) / 100,
  };
}

// ── Method B: Raw Material Recipe / Batch Cost Calculation ──────────────────

export interface RecipeCalculationResult {
  totalIngredientCost: number;
  totalPackagingCost: number;
  totalBatchCost: number;
  expectedOutputUnits: number;
  actualSaleableOutputUnits: number;
  costPerFinishedUnit: number;
}

export function calculateRecipeBatchCost(params: {
  ingredients: RecipeIngredient[];
  packagingItems: PackagingItem[];
  processingCharges: number;
  laborOverhead: number;
  otherDirectCosts: number;
  batchInputQuantity: number;
  batchInputUnit: MeasurementUnit;
  expectedWastagePercent: number;
  actualSaleableOutputUnits: number;
  variantGrams?: number; // finished packet size in grams (e.g. 250)
}): RecipeCalculationResult {
  const totalIngredientCost = params.ingredients.reduce(
    (sum, ing) => sum + (Number(ing.unitCost) || 0),
    0
  );

  const totalPackagingCost = params.packagingItems.reduce(
    (sum, item) => sum + (Number(item.unitCost) || 0) * (Number(item.quantity) || 1),
    0
  );

  const processingCharges = Math.max(0, Number(params.processingCharges) || 0);
  const laborOverhead = Math.max(0, Number(params.laborOverhead) || 0);
  const otherDirectCosts = Math.max(0, Number(params.otherDirectCosts) || 0);

  const totalBatchCost =
    totalIngredientCost +
    totalPackagingCost +
    processingCharges +
    laborOverhead +
    otherDirectCosts;

  // Theoretical output after wastage
  const wastageMultiplier = 1 - Math.min(100, Math.max(0, params.expectedWastagePercent)) / 100;
  const effectiveBatchGrams = convertMeasurement(
    params.batchInputQuantity,
    params.batchInputUnit,
    "g"
  ) * wastageMultiplier;

  const packetGrams = params.variantGrams && params.variantGrams > 0 ? params.variantGrams : 250;
  const expectedOutputUnits = Math.floor(effectiveBatchGrams / packetGrams);

  const finalOutputUnits =
    params.actualSaleableOutputUnits > 0
      ? params.actualSaleableOutputUnits
      : Math.max(1, expectedOutputUnits);

  const costPerFinishedUnit =
    finalOutputUnits > 0 ? Math.round((totalBatchCost / finalOutputUnits) * 100) / 100 : 0;

  return {
    totalIngredientCost: Math.round(totalIngredientCost * 100) / 100,
    totalPackagingCost: Math.round(totalPackagingCost * 100) / 100,
    totalBatchCost: Math.round(totalBatchCost * 100) / 100,
    expectedOutputUnits,
    actualSaleableOutputUnits: finalOutputUnits,
    costPerFinishedUnit,
  };
}

// ── Profit & Margin Engine ──────────────────────────────────────────────────

export interface ProfitMetrics {
  sellingPrice: number;
  unitCost: number;
  unitProfit: number;
  profitMarginPercent: number;
  markupPercent: number;
  breakEvenPrice: number;
  isCostMissing: boolean;
  status: "profitable" | "loss_making" | "break_even" | "cost_missing";
}

/**
 * Calculates unit profit, margin %, markup %, and break-even price.
 * Follows exact financial guidelines:
 * - Unit Profit = Selling Price - Unit Cost
 * - Profit Margin = (Unit Profit / Selling Price) * 100 (if Selling Price > 0)
 * - Markup Percentage = (Unit Profit / Unit Cost) * 100 (if Unit Cost > 0)
 * - If cost is undefined or 0, marks as isCostMissing to prevent fake zero-cost margins.
 */
export function calculateProfitMetrics(
  sellingPrice: number,
  unitCost?: number | null
): ProfitMetrics {
  const price = Math.max(0, Number(sellingPrice) || 0);
  const cost = unitCost !== undefined && unitCost !== null ? Number(unitCost) : null;

  if (cost === null || cost <= 0) {
    return {
      sellingPrice: price,
      unitCost: 0,
      unitProfit: 0,
      profitMarginPercent: 0,
      markupPercent: 0,
      breakEvenPrice: 0,
      isCostMissing: true,
      status: "cost_missing",
    };
  }

  const unitProfit = Math.round((price - cost) * 100) / 100;
  const profitMarginPercent =
    price > 0 ? Math.round(((unitProfit / price) * 100) * 100) / 100 : 0;
  const markupPercent =
    cost > 0 ? Math.round(((unitProfit / cost) * 100) * 100) / 100 : 0;

  let status: ProfitMetrics["status"] = "profitable";
  if (unitProfit < 0) status = "loss_making";
  else if (unitProfit === 0) status = "break_even";

  return {
    sellingPrice: price,
    unitCost: cost,
    unitProfit,
    profitMarginPercent,
    markupPercent,
    breakEvenPrice: cost,
    isCostMissing: false,
    status,
  };
}

// ── Order Line Item Cost Snapshot Generator ─────────────────────────────────

/**
 * Builds an immutable cost snapshot for an order line item at recognition event.
 */
export function createLineItemCostSnapshot(
  orderId: string,
  orderDate: string,
  item: CartItem,
  costConfig?: ProductCostConfig | null,
  allocatedDiscount = 0
): OrderLineCostSnapshot {
  const quantity = Math.max(1, item.quantity || 1);
  const unitSellingPrice = Number(item.price) || 0;
  const totalSale = unitSellingPrice * quantity;
  const netSale = Math.max(0, totalSale - allocatedDiscount);

  const hasCost = costConfig && costConfig.totalUnitCost > 0;
  const unitCost = hasCost ? costConfig.totalUnitCost : 0;
  const totalCOGS = unitCost * quantity;
  const costingMethod = costConfig ? costConfig.costingMethod : "ready_product";

  const unitProfit = hasCost ? (netSale / quantity) - unitCost : 0;
  const grossProfit = hasCost ? netSale - totalCOGS : 0;
  const marginPercent =
    netSale > 0 && hasCost ? Math.round(((grossProfit / netSale) * 100) * 100) / 100 : 0;
  const markupPercent =
    totalCOGS > 0 && hasCost ? Math.round(((grossProfit / totalCOGS) * 100) * 100) / 100 : 0;

  return {
    id: `snap_${orderId}_${item.id}_${Date.now()}`,
    orderId,
    orderDate,
    productId: item.id,
    productName: item.name,
    variantSize: item.weight || "250g",
    sku: costConfig?.sku || item.id,
    quantity,
    unitCost,
    totalCOGS: Math.round(totalCOGS * 100) / 100,
    costingMethod,
    recipeId: costConfig?.recipeId,
    unitSellingPrice,
    totalSale,
    allocatedDiscount,
    netSale: Math.round(netSale * 100) / 100,
    unitProfit: Math.round(unitProfit * 100) / 100,
    grossProfit: Math.round(grossProfit * 100) / 100,
    marginPercent,
    markupPercent,
    costStatus: hasCost ? "exact" : "cost_missing",
    snapshotTimestamp: new Date().toISOString(),
  };
}
