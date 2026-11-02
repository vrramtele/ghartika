"use client";

import { useState, useEffect, useMemo } from "react";
import type { ProductCostConfig, CostingMethod, ReadyProductCostDetails } from "@/types";
import {
  Calculator, Save, Edit2, History, AlertTriangle, CheckCircle2,
  Package, Plus, X, ArrowUpRight, Percent, IndianRupee, Layers, Check
} from "lucide-react";
import { C } from "./AdminShell";

interface ProductCostWithDetails extends ProductCostConfig {
  currentPrice?: number;
  category?: string;
  weight?: string;
}

const DEFAULT_READY_COST: ReadyProductCostDetails = {
  baseCost: 0,
  packagingCost: 0,
  directProcessingCost: 0,
  otherDirectCost: 0,
  variableCost: 0,
};

export function ProductCostingTab() {
  const [costs, setCosts] = useState<ProductCostWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingConfig, setEditingConfig] = useState<ProductCostWithDetails | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [changeReason, setChangeReason] = useState("Price adjustment");
  const [simulationQty, setSimulationQty] = useState(100);
  const [filterMethod, setFilterMethod] = useState<string>("all");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const fetchCosts = () => {
    setLoading(true);
    fetch("/api/costing/products")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setCosts(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCosts();
  }, []);

  const openEdit = (config: ProductCostWithDetails) => {
    setEditingConfig({
      ...config,
      readyProductCost: config.readyProductCost || {
        baseCost: config.totalUnitCost || 0,
        packagingCost: 0,
        directProcessingCost: 0,
        otherDirectCost: 0,
        variableCost: 0,
      },
    });
    setChangeReason("Periodic cost review");
  };

  // Live calculation of active editing item
  const liveCalc = useMemo(() => {
    if (!editingConfig) return null;

    let unitCost = 0;
    if (editingConfig.costingMethod === "ready_product") {
      const d = editingConfig.readyProductCost || DEFAULT_READY_COST;
      unitCost =
        Math.max(0, Number(d.baseCost) || 0) +
        Math.max(0, Number(d.packagingCost) || 0) +
        Math.max(0, Number(d.directProcessingCost) || 0) +
        Math.max(0, Number(d.otherDirectCost) || 0) +
        Math.max(0, Number(d.variableCost) || 0);
    } else if (editingConfig.costingMethod === "combo") {
      unitCost = (editingConfig.comboComponents || []).reduce(
        (sum, item) => sum + (Number(item.totalCost) || Number(item.unitCost) * Number(item.quantity) || 0),
        0
      );
    } else {
      unitCost = Math.max(0, Number(editingConfig.totalUnitCost) || 0);
    }

    const sellingPrice = Math.max(0, Number(editingConfig.sellingPrice) || 0);
    const unitProfit = Math.round((sellingPrice - unitCost) * 100) / 100;
    const marginPercent =
      sellingPrice > 0 && unitCost > 0
        ? Math.round(((unitProfit / sellingPrice) * 100) * 10) / 10
        : 0;
    const markupPercent =
      unitCost > 0 ? Math.round(((unitProfit / unitCost) * 100) * 10) / 10 : 0;
    const simulatedProfit = Math.round(unitProfit * simulationQty);

    return {
      unitCost: Math.round(unitCost * 100) / 100,
      sellingPrice,
      unitProfit,
      marginPercent,
      markupPercent,
      simulatedProfit,
    };
  }, [editingConfig, simulationQty]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingConfig || !liveCalc) return;

    if (liveCalc.unitCost < 0) {
      showToast("❌ Unit cost cannot be negative");
      return;
    }
    if (editingConfig.sellingPrice <= 0) {
      showToast("❌ Selling price must be greater than zero");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/costing/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editingConfig,
          totalUnitCost: liveCalc.unitCost,
          changeReason,
        }),
      });

      if (!res.ok) throw new Error("Save failed");
      showToast("✅ Product cost saved & recorded in history");
      setEditingConfig(null);
      fetchCosts();
    } catch {
      showToast("❌ Failed to save product cost");
    } finally {
      setSaving(false);
    }
  };

  const filteredCosts = costs.filter((c) => {
    if (filterMethod === "all") return true;
    return c.costingMethod === filterMethod;
  });

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
            <Calculator style={{ width: 26, height: 26, color: C.red }} /> Product Costing & Pricing
          </h2>
          <p style={{ color: C.muted, fontSize: 14, marginTop: 4 }}>
            Configure Ready Product vs Raw Material BOM costing, track profit margins and markups.
          </p>
        </div>

        {/* Filter buttons */}
        <div style={{ display: "flex", background: C.surface, padding: 3, borderRadius: 10, border: `1px solid ${C.border}`, gap: 2 }}>
          {[
            { id: "all", label: "All Items" },
            { id: "ready_product", label: "Ready Product" },
            { id: "raw_material", label: "Raw Material BOM" },
            { id: "combo", label: "Combos" },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setFilterMethod(m.id)}
              style={{
                padding: "6px 12px", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 600,
                background: filterMethod === m.id ? C.red : "transparent",
                color: filterMethod === m.id ? "white" : C.muted,
                cursor: "pointer", transition: "all 0.15s ease",
              }}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, overflow: "hidden", marginBottom: 30 }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: C.muted }}>Loading product costs...</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: C.bg, borderBottom: `1px solid ${C.border}` }}>
                {["Product & SKU", "Method", "Selling Price", "Total Unit Cost", "Unit Profit", "Margin %", "Markup %", "Status", "Actions"].map((h) => (
                  <th key={h} style={{ padding: "12px 14px", textAlign: "left", color: C.muted, fontWeight: 700, fontSize: 11, textTransform: "uppercase" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredCosts.map((c) => {
                const hasCost = c.totalUnitCost > 0;
                const unitProfit = hasCost ? c.sellingPrice - c.totalUnitCost : 0;
                const margin = hasCost && c.sellingPrice > 0 ? Math.round(((unitProfit / c.sellingPrice) * 100) * 10) / 10 : 0;
                const markup = hasCost && c.totalUnitCost > 0 ? Math.round(((unitProfit / c.totalUnitCost) * 100) * 10) / 10 : 0;

                return (
                  <tr key={c.productId} style={{ borderBottom: `1px solid ${C.border}` }}>
                    <td style={{ padding: "14px" }}>
                      <div style={{ fontWeight: 700, color: C.text, fontSize: 14 }}>{c.productName}</div>
                      <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
                        {c.variantSize} · SKU: <span style={{ fontFamily: "monospace" }}>{c.sku}</span>
                      </div>
                    </td>
                    <td style={{ padding: "14px" }}>
                      <span style={{
                        padding: "3px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700,
                        background: c.costingMethod === "ready_product" ? "rgba(160,28,44,0.08)" : c.costingMethod === "combo" ? "#FEF3C7" : "#E0F2FE",
                        color: c.costingMethod === "ready_product" ? C.red : c.costingMethod === "combo" ? "#B45309" : "#0284C7",
                      }}>
                        {c.costingMethod === "ready_product" ? "Ready Product" : c.costingMethod === "combo" ? "Combo" : "Raw Material BOM"}
                      </span>
                    </td>
                    <td style={{ padding: "14px", fontWeight: 700, color: C.text }}>
                      ₹{c.sellingPrice}
                    </td>
                    <td style={{ padding: "14px", fontWeight: 700, color: hasCost ? C.text : "#DC2626" }}>
                      {hasCost ? `₹${c.totalUnitCost}` : "Cost Missing"}
                    </td>
                    <td style={{ padding: "14px", fontWeight: 700, color: hasCost ? (unitProfit >= 0 ? "#16A34A" : "#DC2626") : C.muted }}>
                      {hasCost ? `₹${unitProfit}` : "—"}
                    </td>
                    <td style={{ padding: "14px", fontWeight: 700, color: hasCost ? (margin >= 30 ? "#16A34A" : "#D97706") : C.muted }}>
                      {hasCost ? `${margin}%` : "—"}
                    </td>
                    <td style={{ padding: "14px", fontWeight: 600, color: C.muted }}>
                      {hasCost ? `${markup}%` : "—"}
                    </td>
                    <td style={{ padding: "14px" }}>
                      <span style={{
                        padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700,
                        background: hasCost ? "#DCFCE7" : "#FEE2E2",
                        color: hasCost ? "#15803D" : "#991B1B",
                      }}>
                        {hasCost ? "CONFIGURED" : "COST MISSING"}
                      </span>
                    </td>
                    <td style={{ padding: "14px" }}>
                      <button
                        onClick={() => openEdit(c)}
                        style={{
                          display: "flex", alignItems: "center", gap: 6, padding: "6px 12px",
                          borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg,
                          color: C.text, fontWeight: 600, fontSize: 12, cursor: "pointer",
                        }}
                      >
                        <Edit2 style={{ width: 13, height: 13, color: C.red }} />
                        {hasCost ? "Edit Cost" : "Set Cost"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal / Drawer for Editing Cost */}
      {editingConfig && liveCalc && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100,
          display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
        }}>
          <div style={{
            background: C.surface, borderRadius: 20, width: "100%", maxWidth: 840,
            maxHeight: "90vh", overflowY: "auto", padding: 32, border: `1px solid ${C.border}`,
            boxShadow: "0 20px 50px rgba(0,0,0,0.2)", position: "relative",
          }}>
            <button
              onClick={() => setEditingConfig(null)}
              style={{ position: "absolute", top: 20, right: 20, background: "none", border: "none", cursor: "pointer", color: C.muted }}
            >
              <X style={{ width: 22, height: 22 }} />
            </button>

            <h3 style={{ fontSize: 20, fontWeight: 800, color: C.text, margin: "0 0 6px" }}>
              Product Costing: {editingConfig.productName}
            </h3>
            <p style={{ margin: "0 0 20px", fontSize: 13, color: C.muted }}>
              Variant: {editingConfig.variantSize} · SKU: {editingConfig.sku}
            </p>

            <form onSubmit={handleSave}>
              {/* Costing Method Tabs */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: C.text, display: "block", marginBottom: 8 }}>
                  Authoritative Costing Method
                </label>
                <div style={{ display: "flex", gap: 10 }}>
                  {[
                    { id: "ready_product", label: "Method A: Ready Product Cost" },
                    { id: "raw_material", label: "Method B: Raw Material BOM Recipe" },
                    { id: "combo", label: "Combo Product Sum" },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setEditingConfig({ ...editingConfig, costingMethod: m.id as CostingMethod })}
                      style={{
                        padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600,
                        border: `1px solid ${editingConfig.costingMethod === m.id ? C.red : C.border}`,
                        background: editingConfig.costingMethod === m.id ? "rgba(160,28,44,0.06)" : C.bg,
                        color: editingConfig.costingMethod === m.id ? C.red : C.text,
                        cursor: "pointer",
                      }}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Method A: Ready Product Form Fields */}
              {editingConfig.costingMethod === "ready_product" && (
                <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20, marginBottom: 20 }}>
                  <h4 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 700, color: C.text }}>
                    Unit Cost Breakdown (Per Unit)
                  </h4>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: C.text, display: "block", marginBottom: 4 }}>
                        Base Finished / Purchase Cost (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={editingConfig.readyProductCost?.baseCost ?? 0}
                        onChange={(e) =>
                          setEditingConfig({
                            ...editingConfig,
                            readyProductCost: {
                              ...(editingConfig.readyProductCost || DEFAULT_READY_COST),
                              baseCost: Number(e.target.value),
                            },
                          })
                        }
                        style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 14, boxSizing: "border-box" }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: C.text, display: "block", marginBottom: 4 }}>
                        Packaging Materials Cost (Pouch, Label, Carton) (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={editingConfig.readyProductCost?.packagingCost ?? 0}
                        onChange={(e) =>
                          setEditingConfig({
                            ...editingConfig,
                            readyProductCost: {
                              ...(editingConfig.readyProductCost || DEFAULT_READY_COST),
                              packagingCost: Number(e.target.value),
                            },
                          })
                        }
                        style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 14, boxSizing: "border-box" }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: C.text, display: "block", marginBottom: 4 }}>
                        Direct Processing / Grinding Cost (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={editingConfig.readyProductCost?.directProcessingCost ?? 0}
                        onChange={(e) =>
                          setEditingConfig({
                            ...editingConfig,
                            readyProductCost: {
                              ...(editingConfig.readyProductCost || DEFAULT_READY_COST),
                              directProcessingCost: Number(e.target.value),
                            },
                          })
                        }
                        style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 14, boxSizing: "border-box" }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: C.text, display: "block", marginBottom: 4 }}>
                        Other Direct Overheads (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={editingConfig.readyProductCost?.otherDirectCost ?? 0}
                        onChange={(e) =>
                          setEditingConfig({
                            ...editingConfig,
                            readyProductCost: {
                              ...(editingConfig.readyProductCost || DEFAULT_READY_COST),
                              otherDirectCost: Number(e.target.value),
                            },
                          })
                        }
                        style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 14, boxSizing: "border-box" }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Selling Price & Taxes */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 20 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: C.text, display: "block", marginBottom: 4 }}>
                    Selling Price (₹) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={editingConfig.sellingPrice}
                    onChange={(e) => setEditingConfig({ ...editingConfig, sellingPrice: Number(e.target.value) })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 14, boxSizing: "border-box", fontWeight: 700 }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: C.text, display: "block", marginBottom: 4 }}>
                    MRP (Optional) (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editingConfig.mrp || ""}
                    onChange={(e) => setEditingConfig({ ...editingConfig, mrp: Number(e.target.value) })}
                    placeholder="e.g. 180"
                    style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 14, boxSizing: "border-box" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: C.text, display: "block", marginBottom: 4 }}>
                    GST %
                  </label>
                  <select
                    value={editingConfig.gstPercent || 5}
                    onChange={(e) => setEditingConfig({ ...editingConfig, gstPercent: Number(e.target.value) })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 14, boxSizing: "border-box", background: "white" }}
                  >
                    <option value={0}>0% (Exempt)</option>
                    <option value={5}>5% (Standard for Spices HSN 0910)</option>
                    <option value={12}>12%</option>
                    <option value={18}>18%</option>
                  </select>
                </div>
              </div>

              {/* Audit reason & date */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: C.text, display: "block", marginBottom: 4 }}>
                    Effective Date
                  </label>
                  <input
                    type="date"
                    value={editingConfig.effectiveDate || new Date().toISOString().slice(0, 10)}
                    onChange={(e) => setEditingConfig({ ...editingConfig, effectiveDate: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 14, boxSizing: "border-box" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: C.text, display: "block", marginBottom: 4 }}>
                    Change Reason / Audit Note
                  </label>
                  <input
                    type="text"
                    value={changeReason}
                    onChange={(e) => setChangeReason(e.target.value)}
                    placeholder="e.g. Raw chilli mandi rate increased"
                    style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 14, boxSizing: "border-box" }}
                  />
                </div>
              </div>

              {/* Live Financial Metrics Banner */}
              <div style={{
                background: liveCalc.unitProfit >= 0 ? "#F0FDF4" : "#FEF2F2",
                border: `1px solid ${liveCalc.unitProfit >= 0 ? "#BBF7D0" : "#FECACA"}`,
                borderRadius: 14, padding: 18, marginBottom: 24,
                display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, textAlign: "center",
              }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase" }}>Total Unit Cost</div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: C.text, marginTop: 4 }}>₹{liveCalc.unitCost}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase" }}>Unit Profit</div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: liveCalc.unitProfit >= 0 ? "#16A34A" : "#DC2626", marginTop: 4 }}>
                    ₹{liveCalc.unitProfit}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase" }}>Margin %</div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: liveCalc.unitProfit >= 0 ? "#16A34A" : "#DC2626", marginTop: 4 }}>
                    {liveCalc.marginPercent}%
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase" }}>Markup %</div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: liveCalc.unitProfit >= 0 ? "#16A34A" : "#DC2626", marginTop: 4 }}>
                    {liveCalc.markupPercent}%
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
                <button
                  type="button"
                  onClick={() => setEditingConfig(null)}
                  style={{
                    padding: "10px 20px", borderRadius: 10, border: `1px solid ${C.border}`,
                    background: C.bg, color: C.text, fontWeight: 600, cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    display: "flex", alignItems: "center", gap: 6, padding: "10px 24px",
                    borderRadius: 10, border: "none", background: C.red, color: "white",
                    fontWeight: 700, cursor: saving ? "not-allowed" : "pointer",
                    boxShadow: "0 4px 14px rgba(160,28,44,0.25)",
                  }}
                >
                  <Save style={{ width: 16, height: 16 }} />
                  {saving ? "Saving..." : "Save Product Cost"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
