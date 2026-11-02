"use client";

import { useState, useEffect } from "react";
import type { Supplier, PurchaseOrder, PurchaseOrderItem } from "@/types";
import { Plus, Trash2, Edit2, Save, X, Truck, ShoppingBag, Package, CheckCircle2 } from "lucide-react";
import { C } from "./AdminShell";

function fmtINR(n: number) { return "₹" + n.toLocaleString("en-IN"); }
function fmtDate(iso: string) { return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }); }

const PO_STATUS_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  draft: { bg: "#f3f4f6", color: "#6b7280", border: "#d1d5db" },
  ordered: { bg: "#dbeafe", color: "#1d4ed8", border: "#bfdbfe" },
  partially_received: { bg: "#fef3c7", color: "#b45309", border: "#fde68a" },
  received: { bg: "#dcfce7", color: "#16a34a", border: "#bbf7d0" },
  cancelled: { bg: "#fee2e2", color: "#dc2626", border: "#fecaca" },
};

const BLANK_SUPPLIER = (): Omit<Supplier, "id" | "createdAt"> => ({
  name: "", contactPerson: "", phone: "", email: "", address: "", gstin: "", notes: "", isActive: true,
});

type ActiveView = "suppliers" | "purchase_orders";

export function SuppliersTab() {
  const [view, setView] = useState<ActiveView>("suppliers");
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSupplierForm, setShowSupplierForm] = useState(false);
  const [editingSupplierId, setEditingSupplierId] = useState<string | null>(null);
  const [supplierForm, setSupplierForm] = useState<Omit<Supplier, "id" | "createdAt">>(BLANK_SUPPLIER());
  const [showPOForm, setShowPOForm] = useState(false);
  const [poForm, setPOForm] = useState<Partial<Omit<PurchaseOrder, "id" | "createdAt">>>({
    supplierId: "", supplierName: "", status: "draft", items: [], totalAmount: 0, orderDate: new Date().toISOString().slice(0, 10), createdBy: "Admin",
  });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<{ type: "supplier" | "po"; id: string } | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2500); };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetch("/api/suppliers").then((r) => r.json()), fetch("/api/purchase-orders").then((r) => r.json())])
      .then(([sups, pos]) => {
        if (Array.isArray(sups)) setSuppliers(sups);
        if (Array.isArray(pos)) setPurchaseOrders(pos);
      }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  // ── Suppliers ────────────────────────────────────────────────────────────────

  const handleSupplierSave = async () => {
    if (!supplierForm.name.trim()) { showToast("Supplier name is required"); return; }
    setSaving(true);
    try {
      const isEdit = !!editingSupplierId;
      const res = await fetch(isEdit ? `/api/suppliers/${editingSupplierId}` : "/api/suppliers", {
        method: isEdit ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(supplierForm),
      });
      if (!res.ok) throw new Error();
      const saved: Supplier = await res.json();
      setSuppliers((prev) => isEdit ? prev.map((s) => s.id === saved.id ? saved : s) : [saved, ...prev]);
      setShowSupplierForm(false); setEditingSupplierId(null); setSupplierForm(BLANK_SUPPLIER());
      showToast(isEdit ? "✅ Supplier updated" : "✅ Supplier added");
    } catch { showToast("❌ Save failed"); } finally { setSaving(false); }
  };

  const handleDeleteSupplier = async (id: string) => {
    await fetch(`/api/suppliers/${id}`, { method: "DELETE" });
    setSuppliers((prev) => prev.filter((s) => s.id !== id));
    setConfirmDelete(null); showToast("🗑 Supplier deleted");
  };

  // ── Purchase Orders ───────────────────────────────────────────────────────────

  const addPOItem = () => {
    const newItem: PurchaseOrderItem = { productId: "", productName: "", quantity: 1, unitCost: 0 };
    setPOForm((f) => ({ ...f, items: [...(f.items || []), newItem] }));
  };

  const updatePOItem = (idx: number, patch: Partial<PurchaseOrderItem>) => {
    setPOForm((f) => {
      const items = [...(f.items || [])];
      items[idx] = { ...items[idx], ...patch };
      const totalAmount = items.reduce((s, i) => s + i.quantity * i.unitCost, 0);
      return { ...f, items, totalAmount };
    });
  };

  const handlePOSave = async () => {
    if (!poForm.supplierId) { showToast("Please select a supplier"); return; }
    if (!poForm.items?.length) { showToast("Add at least one item"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/purchase-orders", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(poForm),
      });
      if (!res.ok) throw new Error();
      const saved: PurchaseOrder = await res.json();
      setPurchaseOrders((prev) => [saved, ...prev]);
      setShowPOForm(false);
      setPOForm({ supplierId: "", supplierName: "", status: "draft", items: [], totalAmount: 0, orderDate: new Date().toISOString().slice(0, 10), createdBy: "Admin" });
      showToast("✅ Purchase order created");
    } catch { showToast("❌ Save failed"); } finally { setSaving(false); }
  };

  const handleUpdatePOStatus = async (id: string, status: string) => {
    const res = await fetch(`/api/purchase-orders/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status, ...(status === "received" ? { receivedDate: new Date().toISOString() } : {}) }) });
    if (res.ok) {
      const updated: PurchaseOrder = await res.json();
      setPurchaseOrders((prev) => prev.map((p) => p.id === updated.id ? updated : p));
      showToast(`✅ Status updated to "${status}"`);
    }
  };

  const INPUT = { width: "100%", padding: "10px 14px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 14, outline: "none", boxSizing: "border-box" as const, fontFamily: "var(--font-outfit), sans-serif" };
  const LABEL = { fontSize: 12, fontWeight: 600 as const, color: C.muted, display: "block" as const, marginBottom: 5 };

  return (
    <div style={{ display: "grid", gap: 24 }}>
      {toast && <div style={{ position: "fixed", bottom: 24, right: 24, background: C.text, color: "white", padding: "12px 20px", borderRadius: 12, zIndex: 9999, fontSize: 14, fontWeight: 600 }}>{toast}</div>}

      {confirmDelete && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 9000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: C.surface, borderRadius: 16, padding: 28, maxWidth: 380, width: "90%" }}>
            <h3 style={{ margin: "0 0 8px", color: C.text, fontSize: 18, fontWeight: 700 }}>Confirm Delete?</h3>
            <p style={{ color: C.muted, fontSize: 14, margin: "0 0 20px" }}>This action cannot be undone.</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setConfirmDelete(null)} style={{ flex: 1, padding: "10px", border: `1px solid ${C.border}`, borderRadius: 10, background: C.bg, color: C.text, cursor: "pointer", fontWeight: 600 }}>Cancel</button>
              <button onClick={() => confirmDelete.type === "supplier" ? handleDeleteSupplier(confirmDelete.id) : null} style={{ flex: 1, padding: "10px", border: "none", borderRadius: 10, background: "#dc2626", color: "white", cursor: "pointer", fontWeight: 700 }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: C.text }}>Suppliers & Purchases</h2>
          <p style={{ margin: "4px 0 0", color: C.muted, fontSize: 13 }}>Manage your suppliers and track purchase orders & batch details</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => { setShowSupplierForm(true); setView("suppliers"); }} style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", border: `1px solid ${C.border}`, borderRadius: 10, background: C.bg, color: C.text, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
            <Plus style={{ width: 14, height: 14 }} /> Add Supplier
          </button>
          <button onClick={() => { setShowPOForm(true); setView("purchase_orders"); }} style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", border: "none", borderRadius: 10, background: C.red, color: "white", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>
            <ShoppingBag style={{ width: 14, height: 14 }} /> New Purchase Order
          </button>
        </div>
      </div>

      {/* Tab switcher */}
      <div style={{ display: "flex", gap: 4, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, padding: 4, width: "fit-content" }}>
        {(["suppliers", "purchase_orders"] as const).map((v) => (
          <button key={v} onClick={() => setView(v)} style={{ padding: "8px 18px", borderRadius: 9, border: "none", background: view === v ? C.surface : "transparent", color: view === v ? C.text : C.muted, cursor: "pointer", fontSize: 13, fontWeight: view === v ? 700 : 500, boxShadow: view === v ? "0 1px 4px rgba(0,0,0,0.08)" : "none", fontFamily: "var(--font-outfit), sans-serif" }}>
            {v === "suppliers" ? `Suppliers (${suppliers.length})` : `Purchase Orders (${purchaseOrders.length})`}
          </button>
        ))}
      </div>

      {/* Supplier Form */}
      {showSupplierForm && (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.text }}>{editingSupplierId ? "Edit Supplier" : "Add Supplier"}</h3>
            <button onClick={() => { setShowSupplierForm(false); setEditingSupplierId(null); }} style={{ background: "none", border: "none", cursor: "pointer", color: C.muted }}><X style={{ width: 18, height: 18 }} /></button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
            {[
              { key: "name", label: "Supplier Name *", placeholder: "e.g. Sharma Masala Supplier" },
              { key: "contactPerson", label: "Contact Person", placeholder: "e.g. Ramesh Sharma" },
              { key: "phone", label: "Phone", placeholder: "+91 98765 43210" },
              { key: "email", label: "Email", placeholder: "supplier@example.com" },
              { key: "gstin", label: "GSTIN", placeholder: "22AAAAA0000A1Z5" },
              { key: "invoiceNumber", label: "Default Invoice Prefix", placeholder: "INV-" },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label style={LABEL}>{label}</label>
                <input type="text" value={(supplierForm as unknown as Record<string, string>)[key] || ""} onChange={(e) => setSupplierForm((f) => ({ ...f, [key]: e.target.value }))} placeholder={placeholder} style={INPUT} />
              </div>
            ))}
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={LABEL}>Address</label>
              <textarea value={supplierForm.address || ""} onChange={(e) => setSupplierForm((f) => ({ ...f, address: e.target.value }))} rows={2} placeholder="Full address..." style={{ ...INPUT, resize: "vertical" as const }} />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={LABEL}>Notes</label>
              <textarea value={supplierForm.notes || ""} onChange={(e) => setSupplierForm((f) => ({ ...f, notes: e.target.value }))} rows={2} style={{ ...INPUT, resize: "vertical" as const }} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <button onClick={() => { setShowSupplierForm(false); setEditingSupplierId(null); }} style={{ padding: "10px 20px", border: `1px solid ${C.border}`, borderRadius: 10, background: C.bg, color: C.text, cursor: "pointer", fontWeight: 600 }}>Cancel</button>
            <button onClick={handleSupplierSave} disabled={saving} style={{ padding: "10px 24px", border: "none", borderRadius: 10, background: C.red, color: "white", cursor: saving ? "not-allowed" : "pointer", fontWeight: 700, display: "flex", alignItems: "center", gap: 6, opacity: saving ? 0.8 : 1 }}>
              <Save style={{ width: 14, height: 14 }} /> {saving ? "Saving..." : editingSupplierId ? "Update" : "Add Supplier"}
            </button>
          </div>
        </div>
      )}

      {/* PO Form */}
      {showPOForm && (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.text }}>New Purchase Order</h3>
            <button onClick={() => setShowPOForm(false)} style={{ background: "none", border: "none", cursor: "pointer", color: C.muted }}><X style={{ width: 18, height: 18 }} /></button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 20 }}>
            <div>
              <label style={LABEL}>Supplier *</label>
              <select value={poForm.supplierId} onChange={(e) => {
                const sup = suppliers.find((s) => s.id === e.target.value);
                setPOForm((f) => ({ ...f, supplierId: e.target.value, supplierName: sup?.name || "" }));
              }} style={INPUT}>
                <option value="">— Select Supplier —</option>
                {suppliers.filter((s) => s.isActive).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label style={LABEL}>Order Date</label>
              <input type="date" value={poForm.orderDate || ""} onChange={(e) => setPOForm((f) => ({ ...f, orderDate: e.target.value }))} style={INPUT} />
            </div>
            <div>
              <label style={LABEL}>Expected Delivery</label>
              <input type="date" value={poForm.expectedDate || ""} onChange={(e) => setPOForm((f) => ({ ...f, expectedDate: e.target.value }))} style={INPUT} />
            </div>
            <div>
              <label style={LABEL}>Invoice Number</label>
              <input type="text" value={poForm.invoiceNumber || ""} onChange={(e) => setPOForm((f) => ({ ...f, invoiceNumber: e.target.value }))} placeholder="Supplier invoice no." style={INPUT} />
            </div>
          </div>

          {/* PO Items */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <label style={LABEL}>Items *</label>
              <button onClick={addPOItem} style={{ fontSize: 12, color: C.red, fontWeight: 600, background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                <Plus style={{ width: 12, height: 12 }} /> Add Item
              </button>
            </div>
            {(poForm.items || []).map((item, idx) => (
              <div key={idx} style={{ display: "grid", gridTemplateColumns: "1fr 100px 120px 120px 120px 40px", gap: 8, marginBottom: 8, alignItems: "center" }}>
                <input type="text" value={item.productName} onChange={(e) => updatePOItem(idx, { productName: e.target.value })} placeholder="Product / spice name" style={INPUT} />
                <input type="number" value={item.quantity} onChange={(e) => updatePOItem(idx, { quantity: parseInt(e.target.value) || 1 })} min={1} style={INPUT} placeholder="Qty" />
                <input type="number" value={item.unitCost || ""} onChange={(e) => updatePOItem(idx, { unitCost: parseFloat(e.target.value) || 0 })} min={0} style={INPUT} placeholder="Unit cost ₹" />
                <input type="text" value={item.batchNumber || ""} onChange={(e) => updatePOItem(idx, { batchNumber: e.target.value })} style={INPUT} placeholder="Batch no." />
                <input type="date" value={item.expiryDate || ""} onChange={(e) => updatePOItem(idx, { expiryDate: e.target.value })} style={INPUT} title="Best before / Expiry date" />
                <button onClick={() => setPOForm((f) => ({ ...f, items: (f.items || []).filter((_, i) => i !== idx) }))} style={{ background: "#fee2e2", border: "1px solid #fecaca", borderRadius: 8, cursor: "pointer", color: "#dc2626", padding: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <X style={{ width: 12, height: 12 }} />
                </button>
              </div>
            ))}
            {(poForm.items || []).length === 0 && <p style={{ color: C.muted, fontSize: 13 }}>Click "Add Item" to add products to this order</p>}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.text }}>Total: {fmtINR(poForm.totalAmount || 0)}</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowPOForm(false)} style={{ padding: "10px 20px", border: `1px solid ${C.border}`, borderRadius: 10, background: C.bg, color: C.text, cursor: "pointer", fontWeight: 600 }}>Cancel</button>
              <button onClick={handlePOSave} disabled={saving} style={{ padding: "10px 24px", border: "none", borderRadius: 10, background: C.red, color: "white", cursor: saving ? "not-allowed" : "pointer", fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                <Save style={{ width: 14, height: 14 }} /> {saving ? "Saving..." : "Create Order"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUPPLIERS VIEW */}
      {view === "suppliers" && (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}` }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.text }}>Supplier Directory ({suppliers.length})</h3>
          </div>
          {loading ? <div style={{ padding: 40, textAlign: "center", color: C.muted }}>Loading...</div> :
           suppliers.length === 0 ? <div style={{ padding: 40, textAlign: "center", color: C.muted }}><Truck style={{ width: 40, height: 40, margin: "0 auto 12px", color: C.border }} /><p style={{ fontWeight: 600 }}>No suppliers yet</p></div> :
           <div>{suppliers.map((s, idx) => (
            <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", borderBottom: idx < suppliers.length - 1 ? `1px solid ${C.border}` : "none" }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: C.bg, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, color: C.red, flexShrink: 0 }}>
                {s.name.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{s.name}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 99, background: s.isActive ? "#dcfce7" : "#fee2e2", color: s.isActive ? "#16a34a" : "#dc2626", border: `1px solid ${s.isActive ? "#bbf7d0" : "#fecaca"}` }}>{s.isActive ? "Active" : "Inactive"}</span>
                </div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>
                  {s.contactPerson && <span>{s.contactPerson} · </span>}{s.phone && <span>{s.phone} · </span>}{s.email && <span>{s.email}</span>}
                </div>
                {s.gstin && <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>GSTIN: {s.gstin}</div>}
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => { setEditingSupplierId(s.id); setSupplierForm({ name: s.name, contactPerson: s.contactPerson || "", phone: s.phone || "", email: s.email || "", address: s.address || "", gstin: s.gstin || "", notes: s.notes || "", isActive: s.isActive }); setShowSupplierForm(true); }} style={{ padding: "6px 10px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, cursor: "pointer", color: C.text }}><Edit2 style={{ width: 14, height: 14 }} /></button>
                <button onClick={() => setConfirmDelete({ type: "supplier", id: s.id })} style={{ padding: "6px 10px", background: "#fee2e2", border: "1px solid #fecaca", borderRadius: 8, cursor: "pointer", color: "#dc2626" }}><Trash2 style={{ width: 14, height: 14 }} /></button>
              </div>
            </div>
          ))}</div>}
        </div>
      )}

      {/* PURCHASE ORDERS VIEW */}
      {view === "purchase_orders" && (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}` }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.text }}>Purchase Orders ({purchaseOrders.length})</h3>
          </div>
          {loading ? <div style={{ padding: 40, textAlign: "center", color: C.muted }}>Loading...</div> :
           purchaseOrders.length === 0 ? <div style={{ padding: 40, textAlign: "center", color: C.muted }}><Package style={{ width: 40, height: 40, margin: "0 auto 12px", color: C.border }} /><p style={{ fontWeight: 600 }}>No purchase orders yet</p></div> :
           <div style={{ overflowX: "auto" }}>
             <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
               <thead>
                 <tr style={{ background: C.bg }}>
                   {["PO ID", "Supplier", "Order Date", "Items", "Total", "Status", "Actions"].map((h) => (
                     <th key={h} style={{ padding: "10px 16px", textAlign: "left", color: C.muted, fontWeight: 600, fontSize: 11, textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                   ))}
                 </tr>
               </thead>
               <tbody>
                 {purchaseOrders.map((po) => {
                   const sc = PO_STATUS_COLORS[po.status] || PO_STATUS_COLORS.draft;
                   return (
                     <tr key={po.id} style={{ borderTop: `1px solid ${C.border}` }}>
                       <td style={{ padding: "12px 16px", fontFamily: "monospace", fontSize: 12, color: C.muted }}>{po.id.slice(-8)}</td>
                       <td style={{ padding: "12px 16px", fontWeight: 600, color: C.text }}>{po.supplierName}</td>
                       <td style={{ padding: "12px 16px", color: C.muted, whiteSpace: "nowrap" }}>{fmtDate(po.orderDate)}</td>
                       <td style={{ padding: "12px 16px", color: C.muted }}>{po.items.length} items</td>
                       <td style={{ padding: "12px 16px", fontWeight: 700, color: C.red }}>{fmtINR(po.totalAmount)}</td>
                       <td style={{ padding: "12px 16px" }}>
                         <span style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`, borderRadius: 99, padding: "3px 10px", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}>
                           {po.status.replace("_", " ")}
                         </span>
                       </td>
                       <td style={{ padding: "12px 16px" }}>
                         {po.status === "draft" && <button onClick={() => handleUpdatePOStatus(po.id, "ordered")} style={{ fontSize: 12, color: "#1d4ed8", fontWeight: 600, background: "#dbeafe", border: "1px solid #bfdbfe", borderRadius: 8, padding: "4px 10px", cursor: "pointer" }}>Mark Ordered</button>}
                         {po.status === "ordered" && <button onClick={() => handleUpdatePOStatus(po.id, "received")} style={{ fontSize: 12, color: "#16a34a", fontWeight: 600, background: "#dcfce7", border: "1px solid #bbf7d0", borderRadius: 8, padding: "4px 10px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}><CheckCircle2 style={{ width: 12, height: 12 }} /> Received</button>}
                         {po.status === "received" && <span style={{ color: C.muted, fontSize: 12 }}>Received {po.receivedDate ? fmtDate(po.receivedDate) : ""}</span>}
                       </td>
                     </tr>
                   );
                 })}
               </tbody>
             </table>
           </div>}
        </div>
      )}
    </div>
  );
}
