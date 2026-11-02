"use client";

import { useState, useEffect, useMemo } from "react";
import type { Coupon, CouponType } from "@/types";
import {
  Plus, Trash2, Edit3, Save, X, Copy, Check, Search,
  Tag, AlertCircle, ToggleLeft, ToggleRight, RefreshCw, Calendar,
  Percent, DollarSign, Truck, Sparkles,
} from "lucide-react";
import { C } from "./AdminShell";

function fmtINR(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button onClick={copy} title="Copy code" style={{ background: "none", border: "none", cursor: "pointer", color: copied ? "#16a34a" : C.muted, padding: "2px 4px", lineHeight: 1 }}>
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

type CouponFormData = {
  code: string;
  type: CouponType;
  value: number;
  minCartValue: number;
  maxDiscount?: number;
  usageLimit?: number;
  expiresAt?: string;
  isActive: boolean;
  firstOrderOnly: boolean;
};

const EMPTY_COUPON_FORM: CouponFormData = {
  code: "",
  type: "percentage",
  value: 10,
  minCartValue: 299,
  maxDiscount: 150,
  usageLimit: 100,
  expiresAt: "",
  isActive: true,
  firstOrderOnly: false,
};

export function CouponsTab() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [addingNew, setAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CouponFormData>({ ...EMPTY_COUPON_FORM });
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const fetchCoupons = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/coupons");
      if (res.ok) {
        const data = await res.json();
        setCoupons(data);
      }
    } catch {
      showToast("Coupons load karne mein error aayi");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const filteredCoupons = useMemo(() => {
    const q = search.toLowerCase();
    return coupons.filter((c) => !q || c.code.toLowerCase().includes(q));
  }, [coupons, search]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim()) {
      showToast("Coupon code daalna zaroori hai");
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        const res = await fetch(`/api/coupons/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error("Failed to update");
        showToast("Coupon update ho gaya!");
      } else {
        const res = await fetch("/api/coupons", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error("Failed to create");
        showToast("Naya coupon ban gaya! 🎉");
      }
      setAddingNew(false);
      setEditingId(null);
      setForm({ ...EMPTY_COUPON_FORM });
      await fetchCoupons();
    } catch {
      showToast("Error saving coupon");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (coupon: Coupon) => {
    try {
      const res = await fetch(`/api/coupons/${coupon.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !coupon.isActive }),
      });
      if (res.ok) {
        setCoupons((prev) =>
          prev.map((c) => (c.id === coupon.id ? { ...c, isActive: !c.isActive } : c))
        );
        showToast(coupon.isActive ? "Coupon deactivated" : "Coupon activated! ✅");
      }
    } catch {
      showToast("Failed to toggle status");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/coupons/${id}`, { method: "DELETE" });
      if (res.ok) {
        setCoupons((prev) => prev.filter((c) => c.id !== id));
        setDeleteConfirm(null);
        showToast("Coupon delete ho gaya");
      }
    } catch {
      showToast("Delete failed");
    }
  };

  const handleEditClick = (c: Coupon) => {
    setEditingId(c.id);
    setForm({
      code: c.code,
      type: c.type,
      value: c.value,
      minCartValue: c.minCartValue,
      maxDiscount: c.maxDiscount,
      usageLimit: c.usageLimit,
      expiresAt: c.expiresAt ? c.expiresAt.slice(0, 10) : "",
      isActive: c.isActive,
      firstOrderOnly: Boolean(c.firstOrderOnly),
    });
    setAddingNew(true);
  };

  const inpStyle: React.CSSProperties = {
    width: "100%", padding: "9px 12px", border: `1px solid ${C.border}`,
    borderRadius: 8, fontSize: 13, outline: "none", background: C.bg,
    color: C.text, fontFamily: "var(--font-outfit), sans-serif", boxSizing: "border-box",
  };
  const lblStyle: React.CSSProperties = {
    display: "block", fontSize: 11, fontWeight: 600, color: C.muted,
    marginBottom: 5, textTransform: "uppercase",
  };

  return (
    <div style={{ display: "grid", gap: 18 }}>
      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, background: "#1a1008", color: "white", padding: "10px 20px", borderRadius: 10, fontSize: 13, fontWeight: 600, zIndex: 999, boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: C.text, display: "flex", alignItems: "center", gap: 8 }}>
            <Tag style={{ width: 20, height: 20, color: C.red }} /> Coupons & Discounts ({coupons.length})
          </h2>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: C.muted }}>
            {coupons.filter((c) => c.isActive).length} active coupons · Instant checkout verification
          </p>
        </div>
        <button
          onClick={() => {
            if (addingNew) {
              setAddingNew(false);
              setEditingId(null);
            } else {
              setForm({ ...EMPTY_COUPON_FORM });
              setEditingId(null);
              setAddingNew(true);
            }
          }}
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", background: C.red, border: "none", borderRadius: 10, color: "white", fontWeight: 600, cursor: "pointer", fontSize: 14, fontFamily: "var(--font-outfit), sans-serif" }}
        >
          {addingNew ? <X style={{ width: 16, height: 16 }} /> : <Plus style={{ width: 16, height: 16 }} />}
          {addingNew ? "Close Form" : "Create Coupon"}
        </button>
      </div>

      {/* Coupon Form Modal/Drawer */}
      {addingNew && (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.05)" }}>
          <div style={{ background: C.bg, padding: "14px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.text }}>
              {editingId ? "✏️ Edit Coupon" : "✨ Create New Coupon"}
            </h3>
            <button onClick={() => { setAddingNew(false); setEditingId(null); }} style={{ background: "none", border: "none", cursor: "pointer", color: C.muted }}>
              <X style={{ width: 18, height: 18 }} />
            </button>
          </div>

          <form onSubmit={handleSave} style={{ padding: 20, display: "grid", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={lblStyle}>Coupon Code *</label>
                <input
                  style={{ ...inpStyle, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em" }}
                  placeholder="e.g. GHARTIKA10"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase().replace(/\s+/g, "") })}
                  required
                />
              </div>
              <div>
                <label style={lblStyle}>Discount Type *</label>
                <select
                  style={inpStyle}
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as CouponType })}
                >
                  <option value="percentage">Percentage Discount (% OFF)</option>
                  <option value="flat">Flat Discount (₹ Flat OFF)</option>
                  <option value="free_shipping">Free Shipping</option>
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: form.type === "percentage" ? "1fr 1fr 1fr" : "1fr 1fr", gap: 12 }}>
              {form.type !== "free_shipping" && (
                <div>
                  <label style={lblStyle}>{form.type === "percentage" ? "Discount Percentage (%)" : "Flat Amount (₹)"} *</label>
                  <input
                    style={inpStyle}
                    type="number"
                    min={1}
                    max={form.type === "percentage" ? 100 : undefined}
                    value={form.value || ""}
                    onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
                    required
                  />
                </div>
              )}
              {form.type === "percentage" && (
                <div>
                  <label style={lblStyle}>Max Discount Cap (₹ optional)</label>
                  <input
                    style={inpStyle}
                    type="number"
                    min={0}
                    placeholder="e.g. 200"
                    value={form.maxDiscount ?? ""}
                    onChange={(e) => setForm({ ...form, maxDiscount: e.target.value ? Number(e.target.value) : undefined })}
                  />
                </div>
              )}
              <div>
                <label style={lblStyle}>Min Cart Value (₹)</label>
                <input
                  style={inpStyle}
                  type="number"
                  min={0}
                  placeholder="0 for no minimum"
                  value={form.minCartValue || ""}
                  onChange={(e) => setForm({ ...form, minCartValue: Number(e.target.value) })}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={lblStyle}>Total Usage Limit</label>
                <input
                  style={inpStyle}
                  type="number"
                  min={1}
                  placeholder="Unlimited if empty"
                  value={form.usageLimit ?? ""}
                  onChange={(e) => setForm({ ...form, usageLimit: e.target.value ? Number(e.target.value) : undefined })}
                />
              </div>
              <div>
                <label style={lblStyle}>Expiry Date</label>
                <input
                  style={inpStyle}
                  type="date"
                  value={form.expiresAt ?? ""}
                  onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: 24, padding: "8px 0" }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: C.text, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={form.firstOrderOnly}
                  onChange={(e) => setForm({ ...form, firstOrderOnly: e.target.checked })}
                />
                First Order Only (Naye customers ke liye)
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: C.text, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                />
                Coupon is Active
              </label>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, borderTop: `1px solid ${C.border}`, paddingTop: 14 }}>
              <button
                type="button"
                onClick={() => { setAddingNew(false); setEditingId(null); }}
                style={{ padding: "8px 16px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", color: C.text }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 20px", background: C.red, border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, color: "white", cursor: saving ? "not-allowed" : "pointer" }}
              >
                <Save style={{ width: 14, height: 14 }} /> {saving ? "Saving..." : editingId ? "Update Coupon" : "Create Coupon"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div style={{ position: "relative" }}>
        <Search style={{ width: 15, height: 15, position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: C.muted }} />
        <input
          type="text"
          placeholder="Search coupons by code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ ...inpStyle, paddingLeft: 36, width: "100%", maxWidth: 360, background: C.surface }}
        />
      </div>

      {/* Coupons List */}
      {isLoading ? (
        <div style={{ textAlign: "center", padding: 60, color: C.muted }}>
          <RefreshCw style={{ width: 32, height: 32, margin: "0 auto 10px", animation: "adminSpin 0.8s linear infinite" }} />
          <p style={{ fontWeight: 600 }}>Coupons load ho rahe hain...</p>
        </div>
      ) : filteredCoupons.length === 0 ? (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 48, textAlign: "center", color: C.muted }}>
          <Tag style={{ width: 44, height: 44, margin: "0 auto 12px", opacity: 0.3 }} />
          <p style={{ fontWeight: 700, fontSize: 16, color: C.text, margin: 0 }}>Koi Coupon Nahi Mila</p>
          <p style={{ fontSize: 13, marginTop: 6 }}>Naya coupon banane ke liye "Create Coupon" button click karein.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {filteredCoupons.map((coupon) => {
            const isExpired = coupon.expiresAt ? Date.now() > new Date(coupon.expiresAt).getTime() : false;
            const isLimitReached = coupon.usageLimit ? coupon.usedCount >= coupon.usageLimit : false;

            return (
              <div
                key={coupon.id}
                style={{
                  background: C.surface,
                  border: `1px solid ${isExpired || !coupon.isActive ? "#fecaca" : C.border}`,
                  borderRadius: 16,
                  padding: "16px 20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 16,
                  flexWrap: "wrap",
                }}
              >
                {/* Left: Code + Badges */}
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: coupon.type === "free_shipping" ? "#e0f2fe" : coupon.type === "percentage" ? "#fef3c7" : "#dcfce7",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: coupon.type === "free_shipping" ? "#0284c7" : coupon.type === "percentage" ? "#b45309" : "#16a34a",
                    }}
                  >
                    {coupon.type === "free_shipping" ? <Truck className="w-5 h-5" /> : coupon.type === "percentage" ? <Percent className="w-5 h-5" /> : <DollarSign className="w-5 h-5" />}
                  </div>

                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 16, fontWeight: 800, color: C.text, letterSpacing: "0.05em" }}>
                        {coupon.code}
                      </span>
                      <CopyBtn text={coupon.code} />
                      {coupon.firstOrderOnly && (
                        <span style={{ fontSize: 10, background: "#ede9fe", color: "#6d28d9", border: "1px solid #ddd6fe", padding: "2px 6px", borderRadius: 99, fontWeight: 700 }}>
                          1st Order
                        </span>
                      )}
                      {isExpired ? (
                        <span style={{ fontSize: 11, background: "#fee2e2", color: "#dc2626", padding: "2px 8px", borderRadius: 99, fontWeight: 600 }}>Expired</span>
                      ) : isLimitReached ? (
                        <span style={{ fontSize: 11, background: "#fef3c7", color: "#b45309", padding: "2px 8px", borderRadius: 99, fontWeight: 600 }}>Limit Reached</span>
                      ) : !coupon.isActive ? (
                        <span style={{ fontSize: 11, background: "#f3f4f6", color: "#6b7280", padding: "2px 8px", borderRadius: 99, fontWeight: 600 }}>Inactive</span>
                      ) : (
                        <span style={{ fontSize: 11, background: "#dcfce7", color: "#15803d", padding: "2px 8px", borderRadius: 99, fontWeight: 600 }}>Active</span>
                      )}
                    </div>

                    <div style={{ display: "flex", gap: 14, marginTop: 4, fontSize: 12, color: C.muted, flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 700, color: C.red }}>
                        {coupon.type === "free_shipping"
                          ? "Free Shipping"
                          : coupon.type === "percentage"
                          ? `${coupon.value}% OFF${coupon.maxDiscount ? ` (Max ₹${coupon.maxDiscount})` : ""}`
                          : `₹${coupon.value} Flat OFF`}
                      </span>
                      <span>Min Order: {fmtINR(coupon.minCartValue)}</span>
                      <span>Used: <strong>{coupon.usedCount}</strong>{coupon.usageLimit ? ` / ${coupon.usageLimit}` : ""}</span>
                      {coupon.expiresAt && <span>Expires: {new Date(coupon.expiresAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>}
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button
                    onClick={() => handleToggleActive(coupon)}
                    title={coupon.isActive ? "Deactivate" : "Activate"}
                    style={{ padding: 6, background: coupon.isActive ? "#f0fdf4" : "#fef2f2", border: `1px solid ${coupon.isActive ? "#bbf7d0" : "#fecaca"}`, borderRadius: 8, cursor: "pointer", color: coupon.isActive ? "#16a34a" : "#dc2626" }}
                  >
                    {coupon.isActive ? <ToggleRight style={{ width: 16, height: 16 }} /> : <ToggleLeft style={{ width: 16, height: 16 }} />}
                  </button>

                  <button
                    onClick={() => handleEditClick(coupon)}
                    style={{ display: "flex", alignItems: "center", gap: 4, padding: "7px 12px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-outfit), sans-serif" }}
                  >
                    <Edit3 style={{ width: 12, height: 12 }} /> Edit
                  </button>

                  {deleteConfirm === coupon.id ? (
                    <div style={{ display: "flex", gap: 4 }}>
                      <button
                        onClick={() => handleDelete(coupon.id)}
                        style={{ padding: "6px 10px", background: "#dc2626", border: "none", borderRadius: 8, color: "white", fontSize: 11, fontWeight: 700, cursor: "pointer" }}
                      >
                        Delete?
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        style={{ padding: "6px 8px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 11, cursor: "pointer" }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(coupon.id)}
                      style={{ padding: 7, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, cursor: "pointer", color: "#dc2626" }}
                    >
                      <Trash2 style={{ width: 14, height: 14 }} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
