"use client";

import { useState, useEffect, useMemo } from "react";
import type { Product, InventoryLog, InventoryReason } from "@/types";
import {
  Boxes, AlertTriangle, Plus, Minus, RefreshCw,
  Search, ArrowUpRight, ArrowDownRight, History, Package,
  Save, X, Check,
} from "lucide-react";
import { C } from "./AdminShell";

function fmtINR(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const REASONS: InventoryReason[] = [
  "Restock",
  "Order Placed",
  "Damaged / Waste",
  "Manual Correction",
  "Return Restocked",
];

interface Props {
  products: Product[];
  onRefreshProducts: () => Promise<void>;
}

export function InventoryTab({ products, onRefreshProducts }: Props) {
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [stockChange, setStockChange] = useState<number>(10);
  const [reason, setReason] = useState<InventoryReason>("Restock");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2200);
  };

  const fetchLogs = async () => {
    try {
      setLoadingLogs(true);
      const res = await fetch("/api/inventory/logs");
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch {
      showToast("Error loading logs");
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || stockChange === 0) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/inventory/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedProduct.id,
          change: Number(stockChange),
          reason,
          updatedBy: "Admin",
        }),
      });

      if (!res.ok) throw new Error("Failed to adjust stock");

      await onRefreshProducts();
      await fetchLogs();
      setSelectedProduct(null);
      showToast(`Stock updated for ${selectedProduct.name}! 📦`);
    } catch {
      showToast("Error updating stock");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = useMemo(() => {
    const q = search.toLowerCase();
    return products.filter(
      (p) =>
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.sku ?? "").toLowerCase().includes(q)
    );
  }, [products, search]);

  const lowStockProducts = products.filter(
    (p) => p.stock !== undefined && p.lowStockThreshold !== undefined && p.stock <= p.lowStockThreshold
  );

  const totalUnits = products.reduce((s, p) => s + (p.stock || 0), 0);
  const totalValuation = products.reduce((s, p) => s + (p.stock || 0) * p.price, 0);

  return (
    <div style={{ display: "grid", gap: 20 }}>
      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, background: "#1a1008", color: "white", padding: "10px 20px", borderRadius: 10, fontSize: 13, fontWeight: 600, zIndex: 999, boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}>
          {toast}
        </div>
      )}

      {/* Top Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
        {[
          { label: "Total Units in Stock", value: totalUnits.toLocaleString("en-IN"), icon: "📦" },
          { label: "Inventory Valuation", value: fmtINR(totalValuation), icon: "💰" },
          { label: "Low Stock Items", value: lowStockProducts.length.toString(), icon: "⚠️", color: lowStockProducts.length ? "#c2410c" : C.text },
          { label: "Total Products", value: products.length.toString(), icon: "🏷️" },
        ].map((s, i) => (
          <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: "18px 20px" }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>{s.icon}</div>
            <p style={{ margin: 0, fontSize: 11, color: C.muted, fontWeight: 700, textTransform: "uppercase" }}>{s.label}</p>
            <p style={{ margin: "4px 0 0", fontSize: 22, fontWeight: 800, color: s.color || C.text }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Low Stock Warning Banner */}
      {lowStockProducts.length > 0 && (
        <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 14, padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}>
          <AlertTriangle style={{ width: 20, height: 20, color: "#c2410c", flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#c2410c" }}>
              {lowStockProducts.length} spice{lowStockProducts.length > 1 ? "s" : ""} below low-stock threshold:
            </p>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: "#9a3412" }}>
              {lowStockProducts.map((p) => `${p.name} (${p.stock} left)`).join(", ")}
            </p>
          </div>
        </div>
      )}

      {/* Restock Modal Drawer */}
      {selectedProduct && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 20, maxWidth: 440, width: "100%", padding: 28, boxShadow: "0 10px 40px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: C.text }}>
                Adjust Stock: {selectedProduct.name}
              </h3>
              <button onClick={() => setSelectedProduct(null)} style={{ background: "none", border: "none", cursor: "pointer", color: C.muted, padding: 4 }}>
                <X style={{ width: 20, height: 20 }} />
              </button>
            </div>

            <p style={{ margin: "0 0 16px", fontSize: 13, color: C.muted }}>
              Current Stock: <strong style={{ color: C.text }}>{selectedProduct.stock ?? 0} units</strong>
            </p>

            <form onSubmit={handleAdjustStock} style={{ display: "grid", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", marginBottom: 6 }}>
                  Stock Quantity Change (+ to add, - to deduct)
                </label>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input
                    type="number"
                    value={stockChange}
                    onChange={(e) => setStockChange(Number(e.target.value))}
                    required
                    style={{ flex: 1, padding: "10px 14px", border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 16, fontWeight: 700, outline: "none", background: C.bg }}
                  />
                  <div style={{ display: "flex", gap: 4 }}>
                    <button type="button" onClick={() => setStockChange(25)} style={{ padding: "8px 10px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12, cursor: "pointer" }}>+25</button>
                    <button type="button" onClick={() => setStockChange(50)} style={{ padding: "8px 10px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12, cursor: "pointer" }}>+50</button>
                    <button type="button" onClick={() => setStockChange(100)} style={{ padding: "8px 10px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12, cursor: "pointer" }}>+100</button>
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", marginBottom: 6 }}>
                  Adjustment Reason
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value as InventoryReason)}
                  style={{ width: "100%", padding: "10px 14px", border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 13, outline: "none", background: C.bg }}
                >
                  {REASONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  style={{ padding: "10px 16px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{ padding: "10px 20px", background: C.red, color: "white", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: isSubmitting ? "not-allowed" : "pointer" }}
                >
                  {isSubmitting ? "Updating..." : "Save Stock Adjustment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Grid: Products Table + Live Audit Log */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 20 }}>
        {/* Products Stock Table */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.text }}>
              📦 Current Inventory ({products.length})
            </h3>
            <input
              type="text"
              placeholder="Filter spices..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ padding: "7px 12px", border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12, outline: "none", background: C.bg }}
            />
          </div>

          <div style={{ display: "grid", gap: 8, maxHeight: 520, overflowY: "auto" }}>
            {filteredProducts.map((p) => {
              const isLow = p.stock !== undefined && p.lowStockThreshold !== undefined && p.stock <= p.lowStockThreshold;
              return (
                <div
                  key={p.id}
                  style={{
                    background: C.bg,
                    border: `1px solid ${isLow ? "#fed7aa" : C.border}`,
                    borderRadius: 12,
                    padding: "12px 14px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontWeight: 700, fontSize: 13, color: C.text }}>{p.name}</span>
                      {isLow && (
                        <span style={{ fontSize: 10, background: "#fff7ed", color: "#c2410c", padding: "1px 6px", borderRadius: 99, fontWeight: 700 }}>
                          Low Stock
                        </span>
                      )}
                    </div>
                    <p style={{ margin: "2px 0 0", fontSize: 11, color: C.muted }}>
                      {p.weight} · {fmtINR(p.price)} {p.sku ? `· SKU: ${p.sku}` : ""}
                    </p>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: 16, fontWeight: 800, color: isLow ? "#c2410c" : C.text }}>
                        {p.stock ?? 0}
                      </span>
                      <span style={{ fontSize: 11, color: C.muted, marginLeft: 3 }}>units</span>
                    </div>

                    <button
                      onClick={() => { setSelectedProduct(p); setStockChange(25); }}
                      style={{ padding: "6px 12px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: "pointer", color: C.red }}
                    >
                      Restock
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Audit Log Timeline */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.text, display: "flex", alignItems: "center", gap: 6 }}>
              <History style={{ width: 16, height: 16, color: C.red }} /> Live Stock Movement Log
            </h3>
            <button
              onClick={fetchLogs}
              style={{ background: "none", border: "none", cursor: "pointer", color: C.muted, padding: 4 }}
              title="Refresh logs"
            >
              <RefreshCw style={{ width: 14, height: 14 }} />
            </button>
          </div>

          {loadingLogs ? (
            <p style={{ color: C.muted, fontSize: 13, textAlign: "center", padding: 40 }}>Loading history...</p>
          ) : logs.length === 0 ? (
            <p style={{ color: C.muted, fontSize: 13, textAlign: "center", padding: 40 }}>Koi movement log nahi hai</p>
          ) : (
            <div style={{ display: "grid", gap: 8, maxHeight: 520, overflowY: "auto" }}>
              {logs.map((log) => (
                <div
                  key={log.id}
                  style={{
                    background: C.bg,
                    border: `1px solid ${C.border}`,
                    borderRadius: 12,
                    padding: "10px 14px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <span style={{ fontWeight: 700, fontSize: 13, color: C.text }}>{log.productName}</span>
                    <p style={{ margin: "2px 0 0", fontSize: 11, color: C.muted }}>
                      {log.reason} · {fmtDate(log.date)} by {log.updatedBy}
                    </p>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 800,
                        color: log.change > 0 ? "#16a34a" : "#dc2626",
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        justifyContent: "flex-end",
                      }}
                    >
                      {log.change > 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                      {log.change > 0 ? `+${log.change}` : log.change}
                    </span>
                    <span style={{ fontSize: 10, color: C.muted }}>
                      ({log.previousStock} ➔ {log.newStock})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
