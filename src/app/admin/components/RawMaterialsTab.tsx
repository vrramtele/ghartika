"use client";

import { useState, useEffect } from "react";
import type { RawMaterial, MeasurementUnit } from "@/types";
import {
  Boxes, Plus, Edit2, Trash2, Save, X, AlertTriangle,
  Calendar, Truck, Scale, IndianRupee, Tag
} from "lucide-react";
import { C } from "./AdminShell";

const BLANK_RAW_MATERIAL = (): Omit<RawMaterial, "id" | "createdAt" | "updatedAt"> => ({
  name: "",
  sku: "",
  purchaseUnit: "kg",
  purchaseQuantity: 50,
  purchaseAmount: 5000,
  unitRate: 0.1, // ₹0.10 / gram
  supplier: "",
  purchaseDate: new Date().toISOString().slice(0, 10),
  additionalProcurementCosts: 0,
  batchNumber: "",
  stockQuantity: 50,
  stockUnit: "kg",
  expiryDate: "",
});

export function RawMaterialsTab() {
  const [materials, setMaterials] = useState<RawMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(BLANK_RAW_MATERIAL());
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const fetchMaterials = () => {
    setLoading(true);
    fetch("/api/costing/raw-materials")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setMaterials(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const openAdd = () => {
    setForm(BLANK_RAW_MATERIAL());
    setEditingId(null);
    setShowModal(true);
  };

  const openEdit = (item: RawMaterial) => {
    setForm({
      name: item.name,
      sku: item.sku,
      purchaseUnit: item.purchaseUnit,
      purchaseQuantity: item.purchaseQuantity,
      purchaseAmount: item.purchaseAmount,
      unitRate: item.unitRate,
      supplier: item.supplier || "",
      purchaseDate: item.purchaseDate || "",
      additionalProcurementCosts: item.additionalProcurementCosts || 0,
      batchNumber: item.batchNumber || "",
      stockQuantity: item.stockQuantity,
      stockUnit: item.stockUnit,
      expiryDate: item.expiryDate || "",
    });
    setEditingId(item.id);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      showToast("❌ Raw material name is required");
      return;
    }
    if (form.purchaseQuantity <= 0 || form.purchaseAmount < 0) {
      showToast("❌ Purchase quantity and amount must be positive");
      return;
    }

    setSaving(true);
    try {
      const isEdit = !!editingId;
      const res = await fetch(isEdit ? `/api/costing/raw-materials/${editingId}` : "/api/costing/raw-materials", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Failed to save raw material");
      showToast(isEdit ? "✅ Raw material updated" : "✅ Raw material added");
      setShowModal(false);
      fetchMaterials();
    } catch {
      showToast("❌ Failed to save raw material");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/costing/raw-materials/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setMaterials((prev) => prev.filter((m) => m.id !== id));
      setConfirmDelete(null);
      showToast("🗑 Raw material deleted");
    } catch {
      showToast("❌ Failed to delete");
    }
  };

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
            <Boxes style={{ width: 26, height: 26, color: C.red }} /> Raw Materials Inventory & Procurement
          </h2>
          <p style={{ color: C.muted, fontSize: 14, marginTop: 4 }}>
            Manage whole spices, rhizomes, seeds, and packaging supplies with automated unit rate calculations.
          </p>
        </div>
        <button
          onClick={openAdd}
          style={{
            display: "flex", alignItems: "center", gap: 8, background: C.red, color: "white",
            border: "none", borderRadius: 10, padding: "10px 18px", fontWeight: 700, fontSize: 13,
            cursor: "pointer", boxShadow: "0 4px 14px rgba(160,28,44,0.25)",
          }}
        >
          <Plus style={{ width: 16, height: 16 }} /> Add Raw Material
        </button>
      </div>

      {/* Raw Materials Table */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: C.muted }}>Loading raw materials...</div>
        ) : materials.length === 0 ? (
          <div style={{ padding: 60, textAlign: "center" }}>
            <Boxes style={{ width: 40, height: 40, color: C.border, margin: "0 auto 12px" }} />
            <h4 style={{ margin: 0, color: C.text, fontSize: 16 }}>No raw materials found</h4>
            <p style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>Click Add Raw Material to record your first procurement batch.</p>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: C.bg, borderBottom: `1px solid ${C.border}` }}>
                {["Material & SKU", "Purchase Rate", "Base Unit Cost", "Stock Remaining", "Supplier / Lot", "Date", "Actions"].map((h) => (
                  <th key={h} style={{ padding: "12px 14px", textAlign: "left", color: C.muted, fontWeight: 700, fontSize: 11, textTransform: "uppercase" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {materials.map((m) => (
                <tr key={m.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ padding: "14px" }}>
                    <div style={{ fontWeight: 700, color: C.text, fontSize: 14 }}>{m.name}</div>
                    <span style={{ fontSize: 11, color: C.muted, fontFamily: "monospace" }}>{m.sku}</span>
                  </td>
                  <td style={{ padding: "14px" }}>
                    <div style={{ fontWeight: 700, color: C.text }}>₹{m.purchaseAmount.toLocaleString("en-IN")}</div>
                    <span style={{ fontSize: 11, color: C.muted }}>for {m.purchaseQuantity} {m.purchaseUnit}</span>
                  </td>
                  <td style={{ padding: "14px" }}>
                    <div style={{ fontWeight: 800, color: C.red }}>
                      ₹{m.unitRate} / {m.purchaseUnit === "kg" ? "g" : m.purchaseUnit === "l" ? "ml" : m.purchaseUnit}
                    </div>
                    <span style={{ fontSize: 11, color: C.muted }}>
                      (₹{Math.round(m.purchaseAmount / m.purchaseQuantity)}/{m.purchaseUnit})
                    </span>
                  </td>
                  <td style={{ padding: "14px" }}>
                    <span style={{
                      padding: "3px 8px", borderRadius: 6, fontSize: 12, fontWeight: 700,
                      background: m.stockQuantity > 5 ? "#DCFCE7" : "#FEE2E2",
                      color: m.stockQuantity > 5 ? "#15803D" : "#991B1B",
                    }}>
                      {m.stockQuantity} {m.stockUnit}
                    </span>
                  </td>
                  <td style={{ padding: "14px" }}>
                    <div style={{ color: C.text, fontWeight: 600 }}>{m.supplier || "Direct Mandi"}</div>
                    {m.batchNumber && <span style={{ fontSize: 11, color: C.muted }}>Lot: {m.batchNumber}</span>}
                  </td>
                  <td style={{ padding: "14px", color: C.muted, fontSize: 12 }}>
                    {m.purchaseDate || "—"}
                  </td>
                  <td style={{ padding: "14px" }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        onClick={() => openEdit(m)}
                        style={{
                          padding: "6px 10px", borderRadius: 6, border: `1px solid ${C.border}`,
                          background: C.bg, color: C.text, cursor: "pointer",
                        }}
                      >
                        <Edit2 style={{ width: 13, height: 13 }} />
                      </button>
                      <button
                        onClick={() => setConfirmDelete(m.id)}
                        style={{
                          padding: "6px 10px", borderRadius: 6, border: "none",
                          background: "#FEE2E2", color: "#DC2626", cursor: "pointer",
                        }}
                      >
                        <Trash2 style={{ width: 13, height: 13 }} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 110,
          display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
        }}>
          <div style={{ background: C.surface, borderRadius: 16, padding: 24, maxWidth: 400, width: "100%", border: `1px solid ${C.border}` }}>
            <h4 style={{ margin: "0 0 10px", color: C.text, fontSize: 16, fontWeight: 800 }}>Confirm Deletion</h4>
            <p style={{ margin: "0 0 20px", fontSize: 13, color: C.muted }}>
              Are you sure you want to delete this raw material record?
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button onClick={() => setConfirmDelete(null)} style={{ padding: "8px 16px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg, cursor: "pointer" }}>Cancel</button>
              <button onClick={() => handleDelete(confirmDelete)} style={{ padding: "8px 18px", borderRadius: 8, border: "none", background: "#DC2626", color: "white", fontWeight: 700, cursor: "pointer" }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Add / Edit Raw Material */}
      {showModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100,
          display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
        }}>
          <div style={{
            background: C.surface, borderRadius: 20, width: "100%", maxWidth: 650,
            maxHeight: "90vh", overflowY: "auto", padding: 32, border: `1px solid ${C.border}`,
            boxShadow: "0 20px 50px rgba(0,0,0,0.2)", position: "relative",
          }}>
            <button
              onClick={() => setShowModal(false)}
              style={{ position: "absolute", top: 20, right: 20, background: "none", border: "none", cursor: "pointer", color: C.muted }}
            >
              <X style={{ width: 22, height: 22 }} />
            </button>

            <h3 style={{ fontSize: 20, fontWeight: 800, color: C.text, margin: "0 0 16px" }}>
              {editingId ? "Edit Raw Material" : "Add New Raw Material Procurement"}
            </h3>

            <form onSubmit={handleSave} style={{ display: "grid", gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: C.text, display: "block", marginBottom: 4 }}>
                  Material Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Salem Turmeric Rhizomes Grade A"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 14, boxSizing: "border-box" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: C.text, display: "block", marginBottom: 4 }}>
                    SKU / Material Code
                  </label>
                  <input
                    type="text"
                    placeholder="RM-TURM-01"
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 14, boxSizing: "border-box" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: C.text, display: "block", marginBottom: 4 }}>
                    Supplier / Mandi
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Kota Agro Mandi"
                    value={form.supplier || ""}
                    onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 14, boxSizing: "border-box" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: C.text, display: "block", marginBottom: 4 }}>
                    Purchase Qty *
                  </label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.01"
                    required
                    value={form.purchaseQuantity}
                    onChange={(e) => setForm({ ...form, purchaseQuantity: Number(e.target.value) })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 14, boxSizing: "border-box" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: C.text, display: "block", marginBottom: 4 }}>
                    Purchase Unit *
                  </label>
                  <select
                    value={form.purchaseUnit}
                    onChange={(e) => setForm({ ...form, purchaseUnit: e.target.value as MeasurementUnit, stockUnit: e.target.value as MeasurementUnit })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 14, boxSizing: "border-box", background: "white" }}
                  >
                    <option value="kg">Kilogram (kg)</option>
                    <option value="g">Gram (g)</option>
                    <option value="l">Litre (l)</option>
                    <option value="ml">Millilitre (ml)</option>
                    <option value="pcs">Pieces (pcs)</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: C.text, display: "block", marginBottom: 4 }}>
                    Total Amount (₹) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={form.purchaseAmount}
                    onChange={(e) => setForm({ ...form, purchaseAmount: Number(e.target.value) })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 14, boxSizing: "border-box", fontWeight: 700 }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: C.text, display: "block", marginBottom: 4 }}>
                    Stock Available
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.stockQuantity}
                    onChange={(e) => setForm({ ...form, stockQuantity: Number(e.target.value) })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 14, boxSizing: "border-box" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: C.text, display: "block", marginBottom: 4 }}>
                    Lot / Batch #
                  </label>
                  <input
                    type="text"
                    placeholder="BATCH-2026-01"
                    value={form.batchNumber || ""}
                    onChange={(e) => setForm({ ...form, batchNumber: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 14, boxSizing: "border-box" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: C.text, display: "block", marginBottom: 4 }}>
                    Purchase Date
                  </label>
                  <input
                    type="date"
                    value={form.purchaseDate || new Date().toISOString().slice(0, 10)}
                    onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 14, boxSizing: "border-box" }}
                  />
                </div>
              </div>

              {/* Calculated Rate Preview */}
              <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 10, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, color: "#166534", fontWeight: 600 }}>Effective Base Unit Rate:</span>
                <span style={{ fontSize: 15, fontWeight: 800, color: "#15803D" }}>
                  ₹{(form.purchaseQuantity > 0 ? (form.purchaseAmount / form.purchaseQuantity / (form.purchaseUnit === "kg" || form.purchaseUnit === "l" ? 1000 : 1)).toFixed(4) : "0")} / {form.purchaseUnit === "kg" ? "g" : form.purchaseUnit === "l" ? "ml" : form.purchaseUnit}
                </span>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ padding: "10px 18px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg, cursor: "pointer", fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    display: "flex", alignItems: "center", gap: 6, padding: "10px 22px",
                    borderRadius: 8, border: "none", background: C.red, color: "white",
                    fontWeight: 700, cursor: saving ? "not-allowed" : "pointer",
                  }}
                >
                  <Save style={{ width: 16, height: 16 }} />
                  {saving ? "Saving..." : "Save Raw Material"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
