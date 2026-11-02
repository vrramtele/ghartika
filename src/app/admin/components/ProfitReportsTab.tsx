"use client";

import { useState, useEffect } from "react";
import {
  FileSpreadsheet, Download, Filter, Search, IndianRupee,
  Calendar, CheckCircle2, AlertTriangle, ArrowUpRight
} from "lucide-react";
import { C } from "./AdminShell";

type ReportView = "products" | "orders";

export function ProfitReportsTab() {
  const [view, setView] = useState<ReportView>("products");
  const [productData, setProductData] = useState<any[]>([]);
  const [orderData, setOrderData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prods, ords] = await Promise.all([
        fetch("/api/costing/reports?type=products").then((r) => r.json()).catch(() => []),
        fetch("/api/costing/reports?type=orders").then((r) => r.json()).catch(() => []),
      ]);
      if (Array.isArray(prods)) setProductData(prods);
      if (Array.isArray(ords)) setOrderData(ords);
    } catch {}
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredProducts = productData.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase())
  );

  const filteredOrders = orderData.filter((o) =>
    o.orderId.toLowerCase().includes(search.toLowerCase()) ||
    o.customerName.toLowerCase().includes(search.toLowerCase()) ||
    o.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", paddingBottom: 60 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: C.text, margin: 0, display: "flex", alignItems: "center", gap: 10 }}>
            <FileSpreadsheet style={{ width: 26, height: 26, color: C.red }} /> Profitability Reports & Exports
          </h2>
          <p style={{ color: C.muted, fontSize: 14, marginTop: 4 }}>
            Multi-dimensional financial reporting by product margins, order-level COGS, and CSV export.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <a
            href={`/api/costing/reports?type=${view}&format=csv`}
            download
            style={{
              display: "flex", alignItems: "center", gap: 6, background: C.red, color: "white",
              border: "none", borderRadius: 10, padding: "10px 18px", fontWeight: 700, fontSize: 13,
              textDecoration: "none", cursor: "pointer", boxShadow: "0 4px 14px rgba(160,28,44,0.25)",
            }}
          >
            <Download style={{ width: 16, height: 16 }} /> Export {view === "products" ? "Product" : "Order"} CSV
          </a>
        </div>
      </div>

      {/* View Switcher & Search Bar */}
      <div style={{
        background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "12px 18px",
        display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12,
      }}>
        <div style={{ display: "flex", background: C.bg, padding: 3, borderRadius: 10, border: `1px solid ${C.border}`, gap: 2 }}>
          <button
            onClick={() => setView("products")}
            style={{
              padding: "7px 16px", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700,
              background: view === "products" ? C.red : "transparent",
              color: view === "products" ? "white" : C.muted, cursor: "pointer",
            }}
          >
            Product-Wise Profitability
          </button>
          <button
            onClick={() => setView("orders")}
            style={{
              padding: "7px 16px", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700,
              background: view === "orders" ? C.red : "transparent",
              color: view === "orders" ? "white" : C.muted, cursor: "pointer",
            }}
          >
            Order-Wise Profitability & COGS
          </button>
        </div>

        <div style={{ position: "relative", minWidth: 260 }}>
          <Search style={{ width: 15, height: 15, color: C.muted, position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            placeholder={`Search ${view === "products" ? "product or category" : "order, customer, city"}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%", padding: "8px 12px 8px 36px", borderRadius: 8, border: `1px solid ${C.border}`,
              fontSize: 13, outline: "none", boxSizing: "border-box", background: "white",
            }}
          />
        </div>
      </div>

      {/* Main Table Content */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: C.muted }}>Generating profitability report...</div>
        ) : view === "products" ? (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: C.bg, borderBottom: `1px solid ${C.border}` }}>
                {["Product & Category", "Method", "Selling Price", "Unit Cost", "Unit Profit", "Margin %", "Markup %", "Units Sold", "Total Sales", "Gross Profit"].map((h) => (
                  <th key={h} style={{ padding: "12px 14px", textAlign: "left", color: C.muted, fontWeight: 700, fontSize: 11, textTransform: "uppercase" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => {
                const hasCost = p.unitCost > 0;
                return (
                  <tr key={p.productId} style={{ borderBottom: `1px solid ${C.border}` }}>
                    <td style={{ padding: "14px" }}>
                      <div style={{ fontWeight: 700, color: C.text, fontSize: 14 }}>{p.name}</div>
                      <span style={{ fontSize: 11, color: C.muted }}>{p.category} · {p.weight}</span>
                    </td>
                    <td style={{ padding: "14px" }}>
                      <span style={{
                        padding: "2px 6px", borderRadius: 4, fontSize: 11, fontWeight: 700,
                        background: "rgba(160,28,44,0.08)", color: C.red,
                      }}>
                        {p.costingMethod === "ready_product" ? "Ready" : p.costingMethod === "combo" ? "Combo" : "BOM"}
                      </span>
                    </td>
                    <td style={{ padding: "14px", fontWeight: 700, color: C.text }}>
                      ₹{p.sellingPrice}
                    </td>
                    <td style={{ padding: "14px", fontWeight: 700, color: hasCost ? C.text : "#DC2626" }}>
                      {hasCost ? `₹${p.unitCost}` : "Missing"}
                    </td>
                    <td style={{ padding: "14px", fontWeight: 700, color: hasCost ? (p.unitProfit >= 0 ? "#16A34A" : "#DC2626") : C.muted }}>
                      {hasCost ? `₹${p.unitProfit}` : "—"}
                    </td>
                    <td style={{ padding: "14px", fontWeight: 700, color: hasCost ? (p.marginPercent >= 30 ? "#16A34A" : "#D97706") : C.muted }}>
                      {hasCost ? `${p.marginPercent}%` : "—"}
                    </td>
                    <td style={{ padding: "14px", color: C.muted }}>
                      {hasCost ? `${p.markupPercent}%` : "—"}
                    </td>
                    <td style={{ padding: "14px", fontWeight: 700, color: C.text }}>
                      {p.unitsSold}
                    </td>
                    <td style={{ padding: "14px", fontWeight: 700, color: C.text }}>
                      ₹{p.totalRevenue.toLocaleString("en-IN")}
                    </td>
                    <td style={{ padding: "14px", fontWeight: 800, color: p.grossProfit >= 0 ? "#16A34A" : "#DC2626" }}>
                      {hasCost ? `₹${p.grossProfit.toLocaleString("en-IN")}` : "Cost Missing"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: C.bg, borderBottom: `1px solid ${C.border}` }}>
                {["Order ID", "Date", "Customer", "City", "Items", "Revenue", "COGS", "Gross Profit", "Margin %", "Status"].map((h) => (
                  <th key={h} style={{ padding: "12px 14px", textAlign: "left", color: C.muted, fontWeight: 700, fontSize: 11, textTransform: "uppercase" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((o) => (
                <tr key={o.orderId} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ padding: "14px", fontWeight: 700, fontFamily: "monospace", color: C.text }}>
                    {o.orderId}
                  </td>
                  <td style={{ padding: "14px", color: C.muted, fontSize: 12 }}>
                    {o.date.slice(0, 10)}
                  </td>
                  <td style={{ padding: "14px", fontWeight: 600, color: C.text }}>
                    {o.customerName}
                  </td>
                  <td style={{ padding: "14px", color: C.muted }}>
                    {o.city}
                  </td>
                  <td style={{ padding: "14px", fontWeight: 600, color: C.text }}>
                    {o.itemsCount} pcs
                  </td>
                  <td style={{ padding: "14px", fontWeight: 700, color: C.text }}>
                    ₹{o.totalRevenue.toLocaleString("en-IN")}
                  </td>
                  <td style={{ padding: "14px", fontWeight: 600, color: C.muted }}>
                    {o.hasMissingCost ? "Incomplete Cost" : `₹${o.totalCOGS.toLocaleString("en-IN")}`}
                  </td>
                  <td style={{ padding: "14px", fontWeight: 800, color: o.grossProfit >= 0 ? "#16A34A" : "#DC2626" }}>
                    {o.hasMissingCost ? "Estimated" : `₹${o.grossProfit.toLocaleString("en-IN")}`}
                  </td>
                  <td style={{ padding: "14px", fontWeight: 700, color: o.marginPercent >= 30 ? "#16A34A" : "#D97706" }}>
                    {o.marginPercent}%
                  </td>
                  <td style={{ padding: "14px" }}>
                    <span style={{
                      padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700,
                      background: o.status === "Delivered" ? "#DCFCE7" : o.status === "Cancelled" ? "#FEE2E2" : "#FEF3C7",
                      color: o.status === "Delivered" ? "#15803D" : o.status === "Cancelled" ? "#991B1B" : "#B45309",
                    }}>
                      {o.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
