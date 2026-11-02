"use client";

import { useState, useMemo, useRef } from "react";
import type { Product } from "@/types";
import {
  Plus, Trash2, Edit3, Save, X, Copy, Search, Filter,
  AlertTriangle, ToggleLeft, ToggleRight, ChevronDown, ChevronUp,
  RefreshCw,
} from "lucide-react";
import { C, nm } from "./AdminShell";

// ── Helpers ───────────────────────────────────────────────────────────────────

const CATEGORIES = ["Everyday Essentials", "Premium Blends", "Combos", "Gift Sets", "Other"];
const DEFAULT_GST = 5;
const DEFAULT_LOW_STOCK = 10;

function fmtINR(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}

type ProductFormData = Omit<Product, "id">;

const EMPTY_FORM: ProductFormData = {
  name: "", price: 0, originalPrice: undefined, weight: "", category: "Everyday Essentials",
  image: "/images/red-chili.jpg", description: "", badge: "",
  sku: "", stock: undefined, lowStockThreshold: DEFAULT_LOW_STOCK,
  gstPercent: DEFAULT_GST, isActive: true, isCombo: false,
};

// ── Form component ────────────────────────────────────────────────────────────

function ProductForm({
  form, setForm, onSave, onCancel, saving, title,
}: {
  form: ProductFormData;
  setForm: React.Dispatch<React.SetStateAction<ProductFormData>>;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
  title: string;
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const inp: React.CSSProperties = {
    width: "100%", padding: "10px 14px", border: "1px solid rgba(200, 184, 165, 0.4)",
    borderRadius: 12, fontSize: 13, outline: "none", background: C.base,
    boxShadow: nm.insetSm,
    color: C.text, fontFamily: "var(--font-outfit), sans-serif", boxSizing: "border-box",
  };
  const lbl: React.CSSProperties = { display: "block", fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.04em" };

  const set = (k: keyof ProductFormData, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div style={{ background: C.base, border: "1px solid rgba(253, 246, 237, 0.6)", borderRadius: 18, boxShadow: nm.raised, overflow: "hidden" }}>
      {/* Header */}
      <div style={{ background: C.bg, padding: "14px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.text }}>{title}</h3>
        <button onClick={onCancel} style={{ background: "none", border: "none", cursor: "pointer", color: C.muted, padding: 4 }}><X style={{ width: 18, height: 18 }} /></button>
      </div>

      <div style={{ padding: 20, display: "grid", gap: 14 }}>
        {/* Row 1 — Name */}
        <div>
          <label style={lbl}>Product Name *</label>
          <input style={inp} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Red Chilli Powder (Lal Mirchi)" />
        </div>

        {/* Row 2 — Price, MRP, Weight */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <div>
            <label style={lbl}>Price (₹) *</label>
            <input style={inp} type="number" min={0} value={form.price || ""} onChange={(e) => set("price", Number(e.target.value))} placeholder="150" />
          </div>
          <div>
            <label style={lbl}>MRP / Original ₹</label>
            <input style={inp} type="number" min={0} value={form.originalPrice ?? ""} onChange={(e) => set("originalPrice", e.target.value ? Number(e.target.value) : undefined)} placeholder="200 (optional)" />
          </div>
          <div>
            <label style={lbl}>Weight / Variant *</label>
            <input style={inp} value={form.weight} onChange={(e) => set("weight", e.target.value)} placeholder="250g" />
          </div>
        </div>

        {/* Row 3 — Category, Badge */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={lbl}>Category *</label>
            <select style={inp} value={form.category} onChange={(e) => set("category", e.target.value)}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Badge (optional)</label>
            <input style={inp} value={form.badge ?? ""} onChange={(e) => set("badge", e.target.value)} placeholder="🔥 Best Seller" />
          </div>
        </div>

        {/* Row 4 — Image */}
        <div>
          <label style={lbl}>Image URL *</label>
          <input style={inp} value={form.image ?? ""} onChange={(e) => set("image", e.target.value)} placeholder="/images/red-chili.jpg  or  https://res.cloudinary.com/..." />
          {form.image && (
            <img src={form.image} alt="preview" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              style={{ marginTop: 8, height: 60, width: 60, objectFit: "cover", borderRadius: 8, border: `1px solid ${C.border}` }} />
          )}
        </div>

        {/* Row 5 — Description */}
        <div>
          <label style={lbl}>Description *</label>
          <textarea style={{ ...inp, minHeight: 80, resize: "vertical" }} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Product description in Hindi/English..." />
        </div>

        {/* Advanced fields toggle */}
        <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: `1px solid ${C.border}`, borderRadius: 8, padding: "7px 12px", cursor: "pointer", color: C.muted, fontSize: 12, fontWeight: 600, fontFamily: "var(--font-outfit), sans-serif" }}>
          {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          {showAdvanced ? "Hide" : "Show"} Advanced Fields (SKU, Stock, GST)
        </button>

        {showAdvanced && (
          <div style={{ display: "grid", gap: 14, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
              <div>
                <label style={lbl}>SKU</label>
                <input style={inp} value={form.sku ?? ""} onChange={(e) => set("sku", e.target.value)} placeholder="GHR-RC-250" />
              </div>
              <div>
                <label style={lbl}>Stock (units)</label>
                <input style={inp} type="number" min={0} value={form.stock ?? ""} onChange={(e) => set("stock", e.target.value ? Number(e.target.value) : undefined)} placeholder="50" />
              </div>
              <div>
                <label style={lbl}>Low Stock Alert ≤</label>
                <input style={inp} type="number" min={0} value={form.lowStockThreshold ?? DEFAULT_LOW_STOCK} onChange={(e) => set("lowStockThreshold", Number(e.target.value))} placeholder="10" />
              </div>
              <div>
                <label style={lbl}>GST %</label>
                <input style={inp} type="number" min={0} max={28} value={form.gstPercent ?? DEFAULT_GST} onChange={(e) => set("gstPercent", Number(e.target.value))} placeholder="5" />
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <label style={{ ...lbl, marginBottom: 0 }}>Active on Store</label>
              <button type="button" onClick={() => set("isActive", !form.isActive)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: form.isActive ? "#16a34a" : C.muted }}>
                {form.isActive ? <ToggleRight style={{ width: 28, height: 28 }} /> : <ToggleLeft style={{ width: 28, height: 28 }} />}
              </button>
              <span style={{ fontSize: 13, color: form.isActive ? "#16a34a" : C.muted, fontWeight: 600 }}>{form.isActive ? "Active" : "Inactive (hidden from store)"}</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onCancel} style={{ padding: "9px 18px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-outfit), sans-serif" }}>
            <X style={{ width: 13, height: 13, display: "inline", marginRight: 5 }} />Cancel
          </button>
          <button onClick={onSave} disabled={saving || !form.name || !form.price || !form.weight || !form.description} style={{ padding: "9px 20px", background: C.red, border: "none", borderRadius: 8, color: "white", fontSize: 13, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer", fontFamily: "var(--font-outfit), sans-serif", opacity: saving ? 0.7 : 1 }}>
            <Save style={{ width: 13, height: 13, display: "inline", marginRight: 5 }} />{saving ? "Saving..." : "Save Product"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Product row ───────────────────────────────────────────────────────────────

function ProductRow({ product, onEdit, onDelete, onDuplicate, onToggleActive }: {
  product: Product;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onToggleActive: () => void;
}) {
  const isLowStock = product.stock !== undefined && product.lowStockThreshold !== undefined
    && product.stock <= product.lowStockThreshold;
  const isOutOfStock = product.stock !== undefined && product.stock === 0;

  return (
    <div style={{ background: C.base, border: "1px solid rgba(253, 246, 237, 0.6)", borderRadius: 16, boxShadow: nm.raisedSm, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14, transition: "transform 0.15s ease" }}>
      {/* Thumbnail */}
      <div style={{ width: 52, height: 52, borderRadius: 12, background: C.base, boxShadow: nm.insetSm, flexShrink: 0, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <img src={product.image} alt={product.name} onError={(e) => { (e.target as HTMLImageElement).src = ""; (e.target as HTMLImageElement).style.display = "none"; }}
          style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontWeight: 700, color: C.text, fontSize: 14 }}>{product.name}</span>
          {product.badge && (
            <span style={{ fontSize: 11, background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a", padding: "2px 8px", borderRadius: 99, fontWeight: 600 }}>{product.badge}</span>
          )}
          {!product.isActive && (
            <span style={{ fontSize: 11, background: "#fee2e2", color: "#b91c1c", border: "1px solid #fecaca", padding: "2px 8px", borderRadius: 99, fontWeight: 600 }}>Inactive</span>
          )}
          {isOutOfStock && (
            <span style={{ fontSize: 11, background: "#fee2e2", color: "#b91c1c", border: "1px solid #fecaca", padding: "2px 8px", borderRadius: 99, fontWeight: 600 }}>Out of Stock</span>
          )}
          {isLowStock && !isOutOfStock && (
            <span style={{ fontSize: 11, background: "#fff7ed", color: "#c2410c", border: "1px solid #fed7aa", padding: "2px 8px", borderRadius: 99, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 3 }}>
              <AlertTriangle style={{ width: 10, height: 10 }} /> Low Stock ({product.stock})
            </span>
          )}
        </div>
        <div style={{ display: "flex", gap: 14, marginTop: 4, flexWrap: "wrap", fontSize: 12, color: C.muted }}>
          <span>📦 {product.weight}</span>
          <span>🏷️ {product.category}</span>
          <span style={{ fontWeight: 700, color: C.red, fontSize: 13 }}>{fmtINR(product.price)}</span>
          {product.originalPrice && <span style={{ textDecoration: "line-through" }}>{fmtINR(product.originalPrice)}</span>}
          {product.sku && <span>SKU: {product.sku}</span>}
          {product.stock !== undefined && <span>Stock: <strong>{product.stock}</strong></span>}
          {product.gstPercent !== undefined && <span>GST: {product.gstPercent}%</span>}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
        {/* Toggle active */}
        <button onClick={onToggleActive} title={product.isActive ? "Deactivate" : "Activate"} style={{ padding: 7, background: product.isActive ? "#f0fdf4" : "#fef2f2", border: `1px solid ${product.isActive ? "#bbf7d0" : "#fecaca"}`, borderRadius: 8, cursor: "pointer", color: product.isActive ? "#16a34a" : "#dc2626" }}>
          {product.isActive ? <ToggleRight style={{ width: 15, height: 15 }} /> : <ToggleLeft style={{ width: 15, height: 15 }} />}
        </button>
        {/* Duplicate */}
        <button onClick={onDuplicate} title="Duplicate" style={{ padding: 7, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, cursor: "pointer", color: C.muted }}>
          <Copy style={{ width: 14, height: 14 }} />
        </button>
        {/* Edit */}
        <button onClick={onEdit} style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 12px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-outfit), sans-serif" }}>
          <Edit3 style={{ width: 12, height: 12 }} /> Edit
        </button>
        {/* Delete */}
        <button onClick={onDelete} style={{ padding: 7, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, cursor: "pointer", color: "#dc2626" }}>
          <Trash2 style={{ width: 14, height: 14 }} />
        </button>
      </div>
    </div>
  );
}

// ── Main Products Tab ─────────────────────────────────────────────────────────

interface Props {
  products: Product[];
  onAdd: (data: ProductFormData) => Promise<void>;
  onUpdate: (id: string, data: Partial<Product>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onDuplicate: (id: string) => Promise<void>;
  isLoading: boolean;
}

export function ProductsTab({ products, onAdd, onUpdate, onDelete, onDuplicate, isLoading }: Props) {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [showInactive, setShowInactive] = useState(true);
  const [addingNew, setAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [form, setForm] = useState<ProductFormData>({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2200); };

  const filtered = useMemo(() => products.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || (p.sku ?? "").toLowerCase().includes(q);
    const matchCat = catFilter === "All" || p.category === catFilter;
    const matchActive = showInactive || p.isActive !== false;
    return matchSearch && matchCat && matchActive;
  }), [products, search, catFilter, showInactive]);

  const lowStockProducts = products.filter((p) => p.stock !== undefined && p.lowStockThreshold !== undefined && p.stock <= p.lowStockThreshold);

  const handleAdd = async () => {
    setSaving(true);
    try { await onAdd(form); setAddingNew(false); setForm({ ...EMPTY_FORM }); showToast("Product added!"); }
    catch { showToast("Failed to add product"); }
    finally { setSaving(false); }
  };

  const handleEdit = (p: Product) => {
    setEditingId(p.id);
    setForm({ name: p.name, price: p.price, originalPrice: p.originalPrice, weight: p.weight, category: p.category, image: p.image ?? "", description: p.description, badge: p.badge ?? "", sku: p.sku ?? "", stock: p.stock, lowStockThreshold: p.lowStockThreshold ?? DEFAULT_LOW_STOCK, gstPercent: p.gstPercent ?? DEFAULT_GST, isActive: p.isActive !== false, isCombo: p.isCombo, comboItems: p.comboItems });
    setAddingNew(false);
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    setSaving(true);
    try { await onUpdate(editingId, form); setEditingId(null); showToast("Product updated!"); }
    catch { showToast("Failed to update product"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    try { await onDelete(id); setDeleteConfirm(null); showToast("Product deleted."); }
    catch { showToast("Failed to delete product"); }
  };

  const handleDuplicate = async (id: string) => {
    try { await onDuplicate(id); showToast("Product duplicated!"); }
    catch { showToast("Failed to duplicate"); }
  };

  const handleToggleActive = async (p: Product) => {
    try { await onUpdate(p.id, { isActive: !p.isActive }); showToast(p.isActive ? "Product deactivated" : "Product activated"); }
    catch { showToast("Failed to toggle"); }
  };

  const inputCls: React.CSSProperties = {
    padding: "10px 14px", border: "1px solid rgba(200, 184, 165, 0.4)", borderRadius: 12,
    fontSize: 13, outline: "none", background: C.base, color: C.text,
    boxShadow: nm.insetSm,
    fontFamily: "var(--font-outfit), sans-serif",
  };

  if (isLoading) {
    return <div style={{ textAlign: "center", padding: 80, color: C.muted }}><RefreshCw style={{ width: 36, height: 36, margin: "0 auto 12px", animation: "adminSpin 0.8s linear infinite" }} /><p style={{ fontWeight: 600 }}>Products load ho rahi hain...</p></div>;
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, background: "#1a1008", color: "white", padding: "10px 20px", borderRadius: 10, fontSize: 13, fontWeight: 600, zIndex: 999, boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}>{toast}</div>
      )}

      {/* Low stock alert banner */}
      {lowStockProducts.length > 0 && (
        <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
          <AlertTriangle style={{ width: 18, height: 18, color: "#c2410c", flexShrink: 0 }} />
          <span style={{ fontSize: 13, color: "#c2410c", fontWeight: 600 }}>
            {lowStockProducts.length} product{lowStockProducts.length > 1 ? "s" : ""} low on stock: {lowStockProducts.map((p) => `${p.name} (${p.stock} left)`).join(", ")}
          </span>
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: C.text }}>Products ({products.length})</h2>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: C.muted }}>
            {products.filter((p) => p.isActive !== false).length} active &nbsp;·&nbsp;
            {products.filter((p) => p.stock === 0).length} out of stock
          </p>
        </div>
        <button
          onClick={() => { setAddingNew(!addingNew); setEditingId(null); setForm({ ...EMPTY_FORM }); }}
          style={{
            display: "flex", alignItems: "center", gap: 8, padding: "11px 22px",
            background: `linear-gradient(135deg, ${C.red} 0%, ${C.redHover} 100%)`,
            border: "none", borderRadius: 12, color: "white", fontWeight: 700,
            cursor: "pointer", fontSize: 14, fontFamily: "var(--font-outfit), sans-serif",
            boxShadow: `4px 4px 10px ${C.shadowDark}, -3px -3px 8px ${C.shadowLight}, 0 4px 14px ${C.redGlow}`,
          }}
        >
          <Plus style={{ width: 16, height: 16, strokeWidth: 2.2 }} /> Add Product
        </button>
      </div>

      {/* Add form */}
      {addingNew && (
        <ProductForm form={form} setForm={setForm} onSave={handleAdd} onCancel={() => setAddingNew(false)} saving={saving} title="✨ New Product" />
      )}

      {/* Search + Filters */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <Search style={{ width: 15, height: 15, position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: C.muted }} />
          <input ref={searchRef} type="text" placeholder="Name, category, SKU..." value={search} onChange={(e) => setSearch(e.target.value)}
            style={{ ...inputCls, width: "100%", paddingLeft: 36, boxSizing: "border-box" }} />
        </div>
        <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} style={inputCls}>
          <option value="All">All Categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: C.muted, cursor: "pointer" }}>
          <input type="checkbox" checked={showInactive} onChange={(e) => setShowInactive(e.target.checked)} />
          Show Inactive
        </label>
      </div>

      {/* Products list */}
      {filtered.length === 0 ? (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 48, textAlign: "center", color: C.muted }}>
          <Filter style={{ width: 40, height: 40, margin: "0 auto 12px", opacity: 0.3 }} />
          <p style={{ fontWeight: 600, margin: 0 }}>Koi products nahi mili</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {filtered.map((p) =>
            editingId === p.id ? (
              <ProductForm key={p.id} form={form} setForm={setForm} onSave={handleSaveEdit} onCancel={() => setEditingId(null)} saving={saving} title={`✏️ Edit: ${p.name}`} />
            ) : deleteConfirm === p.id ? (
              <div key={p.id} style={{ background: "#fff0f0", border: "1px solid #fecaca", borderRadius: 14, padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}>
                <Trash2 style={{ width: 18, height: 18, color: "#dc2626", flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "#b91c1c" }}>"{p.name}" delete karo? Yeh undo nahi hoga.</span>
                <button onClick={() => handleDelete(p.id)} style={{ padding: "7px 14px", background: "#dc2626", border: "none", borderRadius: 8, color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-outfit), sans-serif" }}>Haan, Delete</button>
                <button onClick={() => setDeleteConfirm(null)} style={{ padding: "7px 14px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-outfit), sans-serif" }}>Cancel</button>
              </div>
            ) : (
              <ProductRow
                key={p.id}
                product={p}
                onEdit={() => handleEdit(p)}
                onDelete={() => setDeleteConfirm(p.id)}
                onDuplicate={() => handleDuplicate(p.id)}
                onToggleActive={() => handleToggleActive(p)}
              />
            )
          )}
        </div>
      )}
    </div>
  );
}
