"use client";

import { useState, useEffect } from "react";
import type { CostHistoryRecord, Product } from "@/types";
import { History, Download, Filter, Search, ArrowUpRight, ArrowDownRight, User } from "lucide-react";
import { C } from "./AdminShell";

export function CostHistoryTab() {
  const [history, setHistory] = useState<CostHistoryRecord[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<string>("all");

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/costing/history").then((r) => r.json()),
      fetch("/api/products").then((r) => r.json()),
    ])
      .then(([histData, prodData]) => {
        if (Array.isArray(histData)) setHistory(histData);
        if (Array.isArray(prodData)) setProducts(prodData);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = history.filter((h) => {
    if (selectedProduct === "all") return true;
    return h.productId === selectedProduct;
  });

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", paddingBottom: 60 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: C.text, margin: 0, display: "flex", alignItems: "center", gap: 10 }}>
            <History style={{ width: 26, height: 26, color: C.red }} /> Cost Revision History & Audit Log
          </h2>
          <p style={{ color: C.muted, fontSize: 14, marginTop: 4 }}>
            Immutable chronological audit log of all unit cost revisions, recipe adjustments, and change reasons.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <a
            href="/api/costing/reports?type=history&format=csv"
            download
            style={{
              display: "flex", alignItems: "center", gap: 6, background: "white", color: C.text,
              border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 16px", fontWeight: 600, fontSize: 13,
              textDecoration: "none", cursor: "pointer",
            }}
          >
            <Download style={{ width: 15, height: 15, color: C.muted }} /> Export Audit Log CSV
          </a>
        </div>
      </div>

      {/* Filter Bar */}
      <div style={{
        background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "12px 18px",
        display: "flex", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap",
      }}>
        <Filter style={{ width: 16, height: 16, color: C.muted }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Filter Product:</span>
        <select
          value={selectedProduct}
          onChange={(e) => setSelectedProduct(e.target.value)}
          style={{ padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, background: "white" }}
        >
          <option value="all">All Products ({history.length} events)</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* History Table */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: C.muted }}>Loading cost history...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 60, textAlign: "center" }}>
            <History style={{ width: 40, height: 40, color: C.border, margin: "0 auto 12px" }} />
            <h4 style={{ margin: 0, color: C.text, fontSize: 16 }}>No cost revisions recorded yet</h4>
            <p style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>
              Any edits to Ready Product costs or approved recipes will be permanently audited here.
            </p>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: C.bg, borderBottom: `1px solid ${C.border}` }}>
                {["Timestamp", "Product & Variant", "Method", "Previous Cost", "New Cost", "Selling Price", "Change Reason", "Audited By"].map((h) => (
                  <th key={h} style={{ padding: "12px 14px", textAlign: "left", color: C.muted, fontWeight: 700, fontSize: 11, textTransform: "uppercase" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => {
                const diff = item.newUnitCost - item.previousUnitCost;
                const isIncrease = diff > 0;
                return (
                  <tr key={item.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                    <td style={{ padding: "14px", color: C.muted, fontSize: 12 }}>
                      {new Date(item.timestamp).toLocaleString("en-IN", {
                        day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
                      })}
                    </td>
                    <td style={{ padding: "14px" }}>
                      <div style={{ fontWeight: 700, color: C.text }}>{item.productName}</div>
                      <span style={{ fontSize: 11, color: C.muted }}>{item.variantSize}</span>
                    </td>
                    <td style={{ padding: "14px" }}>
                      <span style={{
                        padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700,
                        background: "rgba(160,28,44,0.08)", color: C.red,
                      }}>
                        {item.costingMethod === "ready_product" ? "Ready Product" : item.costingMethod === "combo" ? "Combo" : "Recipe BOM"}
                      </span>
                    </td>
                    <td style={{ padding: "14px", color: C.muted }}>
                      ₹{item.previousUnitCost}
                    </td>
                    <td style={{ padding: "14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 800, color: C.text }}>
                        ₹{item.newUnitCost}
                        {item.previousUnitCost > 0 && (
                          <span style={{
                            fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center",
                            color: isIncrease ? "#DC2626" : "#16A34A",
                          }}>
                            {isIncrease ? <ArrowUpRight style={{ width: 12, height: 12 }} /> : <ArrowDownRight style={{ width: 12, height: 12 }} />}
                            {isIncrease ? `+₹${diff.toFixed(1)}` : `-₹${Math.abs(diff).toFixed(1)}`}
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: "14px", fontWeight: 700, color: C.text }}>
                      ₹{item.sellingPrice}
                    </td>
                    <td style={{ padding: "14px", color: C.text, maxWidth: 220 }}>
                      {item.changeReason || "Standard cost update"}
                    </td>
                    <td style={{ padding: "14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, color: C.muted, fontSize: 12 }}>
                        <User style={{ width: 12, height: 12 }} /> {item.changedBy}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
