"use client";

import { useState, useEffect, useMemo } from "react";
import type {
  ProductRecipe,
  RawMaterial,
  Product,
  MeasurementUnit,
  RecipeIngredient,
  PackagingItem,
} from "@/types";
import {
  Scale, Plus, Edit2, Save, Trash2, CheckCircle2, AlertTriangle,
  Layers, Package, IndianRupee, ArrowRight, ShieldCheck, X
} from "lucide-react";
import { C } from "./AdminShell";
import { calculateRecipeBatchCost } from "@/lib/costing-engine";

export function RecipesProductionTab() {
  const [recipes, setRecipes] = useState<ProductRecipe[]>([]);
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProductId, setSelectedProductId] = useState<string>("p1");
  const [editingRecipe, setEditingRecipe] = useState<ProductRecipe | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [recsRes, rmsRes, prodsRes] = await Promise.all([
        fetch("/api/costing/recipes").then((r) => r.json()).catch(() => []),
        fetch("/api/costing/raw-materials").then((r) => r.json()).catch(() => []),
        fetch("/api/products").then((r) => r.json()).catch(() => []),
      ]);

      if (Array.isArray(recsRes)) setRecipes(recsRes);
      if (Array.isArray(rmsRes)) setRawMaterials(rmsRes);
      if (Array.isArray(prodsRes)) setProducts(prodsRes);
    } catch {}
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const activeProduct = products.find((p) => p.id === selectedProductId) || products[0];
  const activeRecipe = recipes.find((r) => r.productId === activeProduct?.id);

  // Initialize or edit recipe state
  useEffect(() => {
    if (!activeProduct) return;
    if (activeRecipe) {
      setEditingRecipe(activeRecipe);
    } else {
      // Setup blank recipe for the selected product
      const defaultIngredient = rawMaterials[0]
        ? [{
            rawMaterialId: rawMaterials[0].id,
            rawMaterialName: rawMaterials[0].name,
            quantity: 250,
            unit: "g" as MeasurementUnit,
            unitCost: Math.round(250 * (rawMaterials[0].unitRate || 0.2)),
          }]
        : [];

      setEditingRecipe({
        id: `rec_${Date.now()}`,
        productId: activeProduct.id,
        productName: activeProduct.name,
        variantSize: activeProduct.weight || "250g",
        ingredients: defaultIngredient,
        processingCharges: 8,
        laborOverhead: 4,
        packagingItems: [
          { name: "Food Grade 3-Layer Standup Pouch", unitCost: 8, quantity: 1 },
          { name: "Waterproof Vinyl Label (Front & Back)", unitCost: 3.5, quantity: 1 },
        ],
        packagingCost: 11.5,
        otherDirectCosts: 2,
        batchInputQuantity: 50,
        batchInputUnit: "kg",
        expectedWastagePercent: 4.5,
        actualSaleableOutputUnits: 190, // 50kg * 0.955 / 0.250kg = ~191
        totalBatchCost: 0,
        calculatedCostPerUnit: 0,
        version: 1,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  }, [activeProduct, activeRecipe, rawMaterials]);

  // Live recipe batch calculator
  const liveBatch = useMemo(() => {
    if (!editingRecipe) return null;
    return calculateRecipeBatchCost({
      ingredients: editingRecipe.ingredients || [],
      packagingItems: editingRecipe.packagingItems || [],
      processingCharges: editingRecipe.processingCharges || 0,
      laborOverhead: editingRecipe.laborOverhead || 0,
      otherDirectCosts: editingRecipe.otherDirectCosts || 0,
      batchInputQuantity: editingRecipe.batchInputQuantity || 50,
      batchInputUnit: editingRecipe.batchInputUnit || "kg",
      expectedWastagePercent: editingRecipe.expectedWastagePercent || 0,
      actualSaleableOutputUnits: editingRecipe.actualSaleableOutputUnits || 1,
      variantGrams: parseInt(editingRecipe.variantSize) || 250,
    });
  }, [editingRecipe]);

  const addIngredientRow = () => {
    if (!editingRecipe || !rawMaterials.length) return;
    const firstRM = rawMaterials[0];
    const newIng: RecipeIngredient = {
      rawMaterialId: firstRM.id,
      rawMaterialName: firstRM.name,
      quantity: 100,
      unit: "g",
      unitCost: Math.round(100 * firstRM.unitRate),
    };
    setEditingRecipe({
      ...editingRecipe,
      ingredients: [...editingRecipe.ingredients, newIng],
    });
  };

  const updateIngredient = (index: number, patch: Partial<RecipeIngredient>) => {
    if (!editingRecipe) return;
    const updated = [...editingRecipe.ingredients];
    const current = { ...updated[index], ...patch };

    // Update raw material name and rate if rawMaterialId changed
    if (patch.rawMaterialId) {
      const rm = rawMaterials.find((r) => r.id === patch.rawMaterialId);
      if (rm) {
        current.rawMaterialName = rm.name;
        current.unitCost = Math.round(current.quantity * rm.unitRate * 100) / 100;
      }
    } else if (patch.quantity) {
      const rm = rawMaterials.find((r) => r.id === current.rawMaterialId);
      if (rm) {
        current.unitCost = Math.round(Number(patch.quantity) * rm.unitRate * 100) / 100;
      }
    }

    updated[index] = current;
    setEditingRecipe({ ...editingRecipe, ingredients: updated });
  };

  const removeIngredient = (index: number) => {
    if (!editingRecipe) return;
    setEditingRecipe({
      ...editingRecipe,
      ingredients: editingRecipe.ingredients.filter((_, i) => i !== index),
    });
  };

  const addPackagingRow = () => {
    if (!editingRecipe) return;
    const newItem: PackagingItem = { name: "Shipping Box / Corrugated", unitCost: 5, quantity: 1 };
    setEditingRecipe({
      ...editingRecipe,
      packagingItems: [...editingRecipe.packagingItems, newItem],
    });
  };

  const updatePackaging = (index: number, patch: Partial<PackagingItem>) => {
    if (!editingRecipe) return;
    const updated = [...editingRecipe.packagingItems];
    updated[index] = { ...updated[index], ...patch };
    setEditingRecipe({ ...editingRecipe, packagingItems: updated });
  };

  const removePackaging = (index: number) => {
    if (!editingRecipe) return;
    setEditingRecipe({
      ...editingRecipe,
      packagingItems: editingRecipe.packagingItems.filter((_, i) => i !== index),
    });
  };

  const handleSaveRecipe = async (applyToProductCost = false) => {
    if (!editingRecipe || !liveBatch) return;

    setSaving(true);
    try {
      const payload = {
        ...editingRecipe,
        totalBatchCost: liveBatch.totalBatchCost,
        packagingCost: liveBatch.totalPackagingCost,
        actualSaleableOutputUnits: liveBatch.actualSaleableOutputUnits,
        calculatedCostPerUnit: liveBatch.costPerFinishedUnit,
        applyToProductCost,
        sellingPrice: activeProduct?.price || 0,
      };

      const res = await fetch("/api/costing/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save recipe");
      showToast(
        applyToProductCost
          ? `✅ Recipe approved & set active cost to ₹${liveBatch.costPerFinishedUnit}/unit`
          : "✅ Recipe saved successfully"
      );
      loadData();
    } catch {
      showToast("❌ Error saving recipe");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: 40, textAlign: "center", color: C.muted }}>Loading recipe manager...</div>;
  }

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", paddingBottom: 60 }}>
      {toast && (
        <div style={{
          position: "fixed", bottom: 24, right: 24, background: "#1A1008", color: "#FFF",
          padding: "12px 24px", borderRadius: 12, boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
          zIndex: 9999, fontSize: 14, fontWeight: 600,
        }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: C.text, margin: 0, display: "flex", alignItems: "center", gap: 10 }}>
            <Scale style={{ width: 26, height: 26, color: C.red }} /> Recipes & Production BOM Costing
          </h2>
          <p style={{ color: C.muted, fontSize: 14, marginTop: 4 }}>
            Method B: Compute finished product costs from raw spice ingredients, milling/processing charges, packaging, and wastage.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => handleSaveRecipe(false)}
            disabled={saving}
            style={{
              display: "flex", alignItems: "center", gap: 6, background: "white", color: C.text,
              border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 16px", fontWeight: 600, fontSize: 13,
              cursor: saving ? "not-allowed" : "pointer",
            }}
          >
            <Save style={{ width: 15, height: 15 }} /> Save Recipe Draft
          </button>
          <button
            onClick={() => handleSaveRecipe(true)}
            disabled={saving}
            style={{
              display: "flex", alignItems: "center", gap: 6, background: C.red, color: "white",
              border: "none", borderRadius: 10, padding: "10px 20px", fontWeight: 700, fontSize: 13,
              cursor: saving ? "not-allowed" : "pointer", boxShadow: "0 4px 14px rgba(160,28,44,0.25)",
            }}
          >
            <ShieldCheck style={{ width: 16, height: 16 }} /> Approve & Apply Active Cost
          </button>
        </div>
      </div>

      {/* Product Selection Tab Bar */}
      <div style={{
        background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "10px 16px",
        display: "flex", gap: 8, alignItems: "center", marginBottom: 24, overflowX: "auto",
      }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: C.muted, textTransform: "uppercase", marginRight: 6 }}>
          Finished Product:
        </span>
        {products.filter((p) => !p.isCombo).map((p) => {
          const isSelected = p.id === activeProduct?.id;
          return (
            <button
              key={p.id}
              onClick={() => setSelectedProductId(p.id)}
              style={{
                padding: "8px 14px", borderRadius: 8, fontSize: 13, fontWeight: isSelected ? 700 : 500,
                border: "none", whiteSpace: "nowrap", cursor: "pointer",
                background: isSelected ? C.red : C.bg,
                color: isSelected ? "white" : C.text,
                transition: "all 0.15s ease",
              }}
            >
              {p.name} ({p.weight})
            </button>
          );
        })}
      </div>

      {editingRecipe && liveBatch && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24 }}>
          {/* Left Column: BOM Ingredients & Costs */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Ingredients Table */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 22 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: 0 }}>
                    1. Raw Spice Ingredients (per unit formula)
                  </h3>
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: C.muted }}>
                    Unit costs pull automatically from your Raw Materials procurement database.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addIngredientRow}
                  style={{
                    display: "flex", alignItems: "center", gap: 4, padding: "6px 12px",
                    borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg,
                    fontSize: 12, fontWeight: 600, color: C.text, cursor: "pointer",
                  }}
                >
                  <Plus style={{ width: 14, height: 14, color: C.red }} /> Add Ingredient
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {editingRecipe.ingredients.map((ing, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "grid", gridTemplateColumns: "2fr 100px 90px 100px 36px", gap: 10,
                      alignItems: "center", background: C.bg, padding: "10px 12px", borderRadius: 10, border: `1px solid ${C.border}`,
                    }}
                  >
                    <div>
                      <select
                        value={ing.rawMaterialId}
                        onChange={(e) => updateIngredient(idx, { rawMaterialId: e.target.value })}
                        style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: `1px solid ${C.border}`, fontSize: 13, background: "white" }}
                      >
                        {rawMaterials.map((rm) => (
                          <option key={rm.id} value={rm.id}>
                            {rm.name} (₹{rm.unitRate}/{rm.purchaseUnit === "kg" ? "g" : rm.purchaseUnit})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <input
                        type="number"
                        min="1"
                        value={ing.quantity}
                        onChange={(e) => updateIngredient(idx, { quantity: Number(e.target.value) })}
                        style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: `1px solid ${C.border}`, fontSize: 13 }}
                      />
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: C.muted }}>
                      {ing.unit}
                    </div>
                    <div style={{ fontWeight: 800, color: C.text, fontSize: 14, textAlign: "right" }}>
                      ₹{ing.unitCost}
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={() => removeIngredient(idx)}
                        style={{ background: "none", border: "none", color: "#DC2626", cursor: "pointer", padding: 4 }}
                      >
                        <Trash2 style={{ width: 15, height: 15 }} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Packaging Items */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 22 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: 0 }}>
                    2. Packaging Supplies (per finished unit)
                  </h3>
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: C.muted }}>
                    Pouches, zipper bags, vinyl stickers, and safety carton costs.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addPackagingRow}
                  style={{
                    display: "flex", alignItems: "center", gap: 4, padding: "6px 12px",
                    borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg,
                    fontSize: 12, fontWeight: 600, color: C.text, cursor: "pointer",
                  }}
                >
                  <Plus style={{ width: 14, height: 14, color: C.red }} /> Add Material
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {editingRecipe.packagingItems.map((pkg, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "grid", gridTemplateColumns: "2fr 90px 100px 36px", gap: 10,
                      alignItems: "center", background: C.bg, padding: "10px 12px", borderRadius: 10, border: `1px solid ${C.border}`,
                    }}
                  >
                    <div>
                      <input
                        type="text"
                        value={pkg.name}
                        onChange={(e) => updatePackaging(idx, { name: e.target.value })}
                        style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: `1px solid ${C.border}`, fontSize: 13 }}
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={pkg.unitCost}
                        onChange={(e) => updatePackaging(idx, { unitCost: Number(e.target.value) })}
                        placeholder="₹ unit cost"
                        style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: `1px solid ${C.border}`, fontSize: 13 }}
                      />
                    </div>
                    <div style={{ fontWeight: 800, color: C.text, fontSize: 14, textAlign: "right" }}>
                      ₹{pkg.unitCost * pkg.quantity}
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={() => removePackaging(idx)}
                        style={{ background: "none", border: "none", color: "#DC2626", cursor: "pointer", padding: 4 }}
                      >
                        <Trash2 style={{ width: 15, height: 15 }} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Direct Processing, Labor & Wastage Configuration */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 22 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: "0 0 16px" }}>
                3. Production Overhead, Wastage & Output
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: C.text, display: "block", marginBottom: 4 }}>
                    Milling / Grinding Fee (₹/unit)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={editingRecipe.processingCharges}
                    onChange={(e) => setEditingRecipe({ ...editingRecipe, processingCharges: Number(e.target.value) })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, boxSizing: "border-box" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: C.text, display: "block", marginBottom: 4 }}>
                    Packing Labour (₹/unit)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={editingRecipe.laborOverhead}
                    onChange={(e) => setEditingRecipe({ ...editingRecipe, laborOverhead: Number(e.target.value) })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, boxSizing: "border-box" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: C.text, display: "block", marginBottom: 4 }}>
                    Production Wastage (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    step="0.1"
                    value={editingRecipe.expectedWastagePercent}
                    onChange={(e) => setEditingRecipe({ ...editingRecipe, expectedWastagePercent: Number(e.target.value) })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, boxSizing: "border-box" }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Batch Costing Summary */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{
              background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 22,
              position: "sticky", top: 20,
            }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: C.text, margin: "0 0 16px" }}>
                Calculated Finished Cost
              </h3>

              <div style={{
                background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 14, padding: 18,
                textAlign: "center", marginBottom: 20,
              }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#166534", textTransform: "uppercase" }}>
                  Unit Cost (Finished Packet)
                </span>
                <div style={{ fontSize: 32, fontWeight: 900, color: "#15803D", margin: "6px 0" }}>
                  ₹{liveBatch.costPerFinishedUnit}
                </div>
                <div style={{ fontSize: 12, color: "#166534" }}>
                  Selling Price: ₹{activeProduct.price} · Margin: {Math.round(((activeProduct.price - liveBatch.costPerFinishedUnit) / activeProduct.price) * 100)}%
                </div>
              </div>

              <div style={{ display: "grid", gap: 10, fontSize: 13, borderBottom: `1px solid ${C.border}`, paddingBottom: 16, marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: C.muted }}>Ingredient Cost:</span>
                  <span style={{ fontWeight: 700, color: C.text }}>₹{liveBatch.totalIngredientCost}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: C.muted }}>Packaging Cost:</span>
                  <span style={{ fontWeight: 700, color: C.text }}>₹{liveBatch.totalPackagingCost}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: C.muted }}>Milling & Labour:</span>
                  <span style={{ fontWeight: 700, color: C.text }}>
                    ₹{((editingRecipe.processingCharges || 0) + (editingRecipe.laborOverhead || 0))}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: C.muted }}>Wastage Allowance:</span>
                  <span style={{ fontWeight: 700, color: "#D97706" }}>{editingRecipe.expectedWastagePercent}%</span>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <button
                  type="button"
                  onClick={() => handleSaveRecipe(true)}
                  disabled={saving}
                  style={{
                    width: "100%", padding: "12px", borderRadius: 10, border: "none",
                    background: C.red, color: "white", fontWeight: 700, fontSize: 14,
                    cursor: saving ? "not-allowed" : "pointer", boxShadow: "0 4px 14px rgba(160,28,44,0.25)",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  }}
                >
                  <CheckCircle2 style={{ width: 16, height: 16 }} />
                  {saving ? "Updating..." : "Approve & Update Active Cost"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
