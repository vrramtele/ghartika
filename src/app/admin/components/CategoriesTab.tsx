"use client";

import { useState, useEffect, useMemo } from "react";
import type { Category } from "@/types";
import { Plus, Trash2, Edit2, Save, X, Tag, ChevronUp, ChevronDown, ToggleLeft, ToggleRight } from "lucide-react";
import { C } from "./AdminShell";

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const BLANK = (): Omit<Category, "id" | "createdAt"> => ({
  name: "",
  slug: "",
  description: "",
  isActive: true,
  sortOrder: 1,
  image: "",
});

export function CategoriesTab() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Category, "id" | "createdAt">>(BLANK());
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2500); };

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setCategories(data.sort((a: Category, b: Category) => a.sortOrder - b.sortOrder)); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!form.name.trim()) { showToast("Category name is required"); return; }
    const finalSlug = form.slug || slugify(form.name);
    setSaving(true);
    try {
      const isEdit = !!editingId;
      const res = await fetch(isEdit ? `/api/categories/${editingId}` : "/api/categories", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, slug: finalSlug }),
      });
      if (!res.ok) throw new Error("Save failed");
      const saved: Category = await res.json();
      setCategories((prev) => {
        const next = isEdit ? prev.map((c) => c.id === saved.id ? saved : c) : [...prev, saved];
        return next.sort((a, b) => a.sortOrder - b.sortOrder);
      });
      setShowForm(false); setEditingId(null); setForm(BLANK());
      showToast(isEdit ? "✅ Category updated" : "✅ Category created");
    } catch { showToast("❌ Failed to save"); }
    finally { setSaving(false); }
  };

  const handleEdit = (cat: Category) => {
    setEditingId(cat.id);
    setForm({ name: cat.name, slug: cat.slug, description: cat.description || "", isActive: cat.isActive, sortOrder: cat.sortOrder, image: cat.image || "" });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/categories/${id}`, { method: "DELETE" });
      setCategories((prev) => prev.filter((c) => c.id !== id));
      showToast("🗑 Category deleted");
    } catch { showToast("❌ Failed to delete"); }
    finally { setConfirmDelete(null); }
  };

  const toggleActive = async (cat: Category) => {
    const res = await fetch(`/api/categories/${cat.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !cat.isActive }) });
    if (res.ok) { const updated: Category = await res.json(); setCategories((prev) => prev.map((c) => c.id === updated.id ? updated : c)); }
  };

  const moveOrder = async (cat: Category, dir: "up" | "down") => {
    const sorted = [...categories].sort((a, b) => a.sortOrder - b.sortOrder);
    const idx = sorted.findIndex((c) => c.id === cat.id);
    const swapIdx = dir === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const swapCat = sorted[swapIdx];
    const [newOrder, swapOrder] = [swapCat.sortOrder, cat.sortOrder];
    await Promise.all([
      fetch(`/api/categories/${cat.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sortOrder: newOrder }) }),
      fetch(`/api/categories/${swapCat.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sortOrder: swapOrder }) }),
    ]);
    setCategories((prev) => prev.map((c) => c.id === cat.id ? { ...c, sortOrder: newOrder } : c.id === swapCat.id ? { ...c, sortOrder: swapOrder } : c).sort((a, b) => a.sortOrder - b.sortOrder));
  };

  // Auto-generate slug when name changes (only in add mode)
  const handleNameChange = (name: string) => {
    setForm((f) => ({ ...f, name, ...(!editingId ? { slug: slugify(name) } : {}) }));
  };

  const INPUT = { width: "100%", padding: "10px 14px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 14, outline: "none", boxSizing: "border-box" as const, fontFamily: "var(--font-outfit), sans-serif" };
  const LABEL = { fontSize: 12, fontWeight: 600 as const, color: C.muted, display: "block" as const, marginBottom: 5 };

  const sorted = useMemo(() => [...categories].sort((a, b) => a.sortOrder - b.sortOrder), [categories]);

  return (
    <div style={{ display: "grid", gap: 24 }}>

      {toast && <div style={{ position: "fixed", bottom: 24, right: 24, background: C.text, color: "white", padding: "12px 20px", borderRadius: 12, zIndex: 9999, fontSize: 14, fontWeight: 600, boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}>{toast}</div>}

      {confirmDelete && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 9000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: C.surface, borderRadius: 16, padding: 28, maxWidth: 380, width: "90%", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <h3 style={{ margin: "0 0 8px", color: C.text, fontSize: 18, fontWeight: 700 }}>Delete Category?</h3>
            <p style={{ color: C.muted, fontSize: 14, margin: "0 0 4px" }}>Products in this category will remain but will no longer be associated.</p>
            <p style={{ color: "#dc2626", fontSize: 13, margin: "0 0 20px" }}>This cannot be undone.</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setConfirmDelete(null)} style={{ flex: 1, padding: "10px", border: `1px solid ${C.border}`, borderRadius: 10, background: C.bg, color: C.text, cursor: "pointer", fontWeight: 600 }}>Cancel</button>
              <button onClick={() => handleDelete(confirmDelete)} style={{ flex: 1, padding: "10px", border: "none", borderRadius: 10, background: "#dc2626", color: "white", cursor: "pointer", fontWeight: 700 }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: C.text }}>Categories & Collections</h2>
          <p style={{ margin: "4px 0 0", color: C.muted, fontSize: 13 }}>Organise your products into groups for easy browsing</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm(BLANK()); }} style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", border: "none", borderRadius: 10, background: C.red, color: "white", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>
          <Plus style={{ width: 14, height: 14 }} /> New Category
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.text }}>{editingId ? "Edit Category" : "New Category"}</h3>
            <button onClick={() => { setShowForm(false); setEditingId(null); }} style={{ background: "none", border: "none", cursor: "pointer", color: C.muted }}><X style={{ width: 18, height: 18 }} /></button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
            <div>
              <label style={LABEL}>Category Name *</label>
              <input type="text" value={form.name} onChange={(e) => handleNameChange(e.target.value)} placeholder="e.g. Whole Spices" style={INPUT} />
            </div>
            <div>
              <label style={LABEL}>URL Slug *</label>
              <input type="text" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: slugify(e.target.value) }))} placeholder="e.g. whole-spices" style={INPUT} />
              <p style={{ fontSize: 11, color: C.muted, margin: "4px 0 0" }}>Auto-generated from name. Used in URLs.</p>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={LABEL}>Description (optional)</label>
              <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={2} placeholder="Brief description for this category..." style={{ ...INPUT, resize: "vertical" as const }} />
            </div>
            <div>
              <label style={LABEL}>Sort Order</label>
              <input type="number" value={form.sortOrder} onChange={(e) => setForm((f) => ({ ...f, sortOrder: parseInt(e.target.value) || 1 }))} min={1} style={INPUT} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 20 }}>
              <label style={{ ...LABEL, marginBottom: 0 }}>Active</label>
              <button onClick={() => setForm((f) => ({ ...f, isActive: !f.isActive }))} style={{ background: "none", border: "none", cursor: "pointer", color: form.isActive ? "#16a34a" : C.muted }}>
                {form.isActive ? <ToggleRight style={{ width: 28, height: 28 }} /> : <ToggleLeft style={{ width: 28, height: 28 }} />}
              </button>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <button onClick={() => { setShowForm(false); setEditingId(null); }} style={{ padding: "10px 20px", border: `1px solid ${C.border}`, borderRadius: 10, background: C.bg, color: C.text, cursor: "pointer", fontWeight: 600 }}>Cancel</button>
            <button onClick={handleSave} disabled={saving} style={{ padding: "10px 24px", border: "none", borderRadius: 10, background: C.red, color: "white", cursor: saving ? "not-allowed" : "pointer", fontWeight: 700, display: "flex", alignItems: "center", gap: 6, opacity: saving ? 0.8 : 1 }}>
              <Save style={{ width: 14, height: 14 }} /> {saving ? "Saving..." : editingId ? "Update" : "Create Category"}
            </button>
          </div>
        </div>
      )}

      {/* Category List */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}` }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.text }}>All Categories ({categories.length})</h3>
        </div>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: C.muted }}>Loading categories...</div>
        ) : sorted.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: C.muted }}>
            <Tag style={{ width: 40, height: 40, margin: "0 auto 12px", color: C.border }} />
            <p style={{ fontWeight: 600 }}>No categories yet</p>
            <p style={{ fontSize: 13 }}>Create your first category to organise products</p>
          </div>
        ) : (
          <div>
            {sorted.map((cat, idx) => (
              <div key={cat.id} style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", borderBottom: idx < sorted.length - 1 ? `1px solid ${C.border}` : "none" }}>
                {/* Reorder buttons */}
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <button onClick={() => moveOrder(cat, "up")} disabled={idx === 0} style={{ background: "none", border: "none", cursor: idx === 0 ? "not-allowed" : "pointer", color: idx === 0 ? C.border : C.muted, padding: 2 }}>
                    <ChevronUp style={{ width: 14, height: 14 }} />
                  </button>
                  <button onClick={() => moveOrder(cat, "down")} disabled={idx === sorted.length - 1} style={{ background: "none", border: "none", cursor: idx === sorted.length - 1 ? "not-allowed" : "pointer", color: idx === sorted.length - 1 ? C.border : C.muted, padding: 2 }}>
                    <ChevronDown style={{ width: 14, height: 14 }} />
                  </button>
                </div>

                {/* Category icon */}
                <div style={{ width: 44, height: 44, borderRadius: 12, background: C.bg, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Tag style={{ width: 18, height: 18, color: C.red }} />
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{cat.name}</span>
                    <span style={{ fontSize: 11, color: C.muted, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 99, padding: "2px 8px" }}>/{cat.slug}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 99, background: cat.isActive ? "#dcfce7" : "#fee2e2", color: cat.isActive ? "#16a34a" : "#dc2626", border: `1px solid ${cat.isActive ? "#bbf7d0" : "#fecaca"}` }}>
                      {cat.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  {cat.description && <p style={{ margin: "3px 0 0", fontSize: 13, color: C.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cat.description}</p>}
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  <button onClick={() => toggleActive(cat)} style={{ padding: "6px 10px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, cursor: "pointer", color: cat.isActive ? "#16a34a" : C.muted }}>
                    {cat.isActive ? <ToggleRight style={{ width: 16, height: 16 }} /> : <ToggleLeft style={{ width: 16, height: 16 }} />}
                  </button>
                  <button onClick={() => handleEdit(cat)} style={{ padding: "6px 10px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, cursor: "pointer", color: C.text }}>
                    <Edit2 style={{ width: 14, height: 14 }} />
                  </button>
                  <button onClick={() => setConfirmDelete(cat.id)} style={{ padding: "6px 10px", background: "#fee2e2", border: "1px solid #fecaca", borderRadius: 8, cursor: "pointer", color: "#dc2626" }}>
                    <Trash2 style={{ width: 14, height: 14 }} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
