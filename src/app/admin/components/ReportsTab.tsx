"use client";

import { useState } from "react";
import type { Order, Product } from "@/types";
import {
  FileText, Download, CheckCircle2, TrendingUp,
  Percent, DollarSign, Calendar, RefreshCw,
} from "lucide-react";
import { C } from "./AdminShell";

function fmtINR(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}

interface Props {
  orders: Order[];
  products: Product[];
}

export function ReportsTab({ orders, products }: Props) {
  const [downloading, setDownloading] = useState<string | null>(null);

  const downloadCSV = (filename: string, headers: string[], rows: (string | number)[][]) => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 1. GST Tax Filing Report (HSN 0910 Spices)
  const exportGSTReport = () => {
    setDownloading("gst");
    setTimeout(() => {
      const headers = [
        "Invoice / Order ID",
        "Invoice Date",
        "HSN Code",
        "Customer Name",
        "Customer State",
        "Place of Supply",
        "Taxable Value (Base ₹)",
        "CGST Rate",
        "CGST Amount (₹)",
        "SGST Rate",
        "SGST Amount (₹)",
        "IGST Rate",
        "IGST Amount (₹)",
        "Total GST (₹)",
        "Total Invoice Value (₹)",
      ];

      const rows = orders.map((o) => {
        const total = o.total;
        const taxableValue = Math.round(total / 1.05); // 5% GST for spices
        const totalTax = total - taxableValue;
        const state = (o.customer.state || "").trim().toLowerCase();
        const isIntrastate = state.includes("madhya pradesh") || state === "mp";

        const cgstAmt = isIntrastate ? Math.round(totalTax / 2) : 0;
        const sgstAmt = isIntrastate ? totalTax - cgstAmt : 0;
        const igstAmt = isIntrastate ? 0 : totalTax;

        return [
          `"${o.id}"`,
          `"${new Date(o.date).toISOString().slice(0, 10)}"`,
          `"0910"`,
          `"${o.customer.name}"`,
          `"${o.customer.state || "MP"}"`,
          isIntrastate ? `"Intrastate"` : `"Interstate"`,
          taxableValue,
          isIntrastate ? `"2.5%"` : `"0%"`,
          cgstAmt,
          isIntrastate ? `"2.5%"` : `"0%"`,
          sgstAmt,
          isIntrastate ? `"0%"` : `"5.0%"`,
          igstAmt,
          totalTax,
          total,
        ];
      });

      downloadCSV(`ghartika_gst_report_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
      setDownloading(null);
    }, 400);
  };

  // 2. Complete Sales Transactions Report
  const exportSalesReport = () => {
    setDownloading("sales");
    setTimeout(() => {
      const headers = [
        "Order ID",
        "Order Date",
        "Customer Name",
        "Phone",
        "Email",
        "City",
        "State",
        "Pincode",
        "Items Count",
        "Items Summary",
        "Payment Method",
        "Payment Status",
        "Order Status",
        "Courier Name",
        "Tracking ID",
        "Total Amount (₹)",
      ];

      const rows = orders.map((o) => {
        const itemsSummary = o.items.map((i) => `${i.name} (${i.weight} x ${i.quantity})`).join("; ");
        return [
          `"${o.id}"`,
          `"${new Date(o.date).toISOString().slice(0, 10)}"`,
          `"${o.customer.name}"`,
          `"${o.customer.phone}"`,
          `"${o.customer.email || ""}"`,
          `"${o.customer.city || ""}"`,
          `"${o.customer.state || ""}"`,
          `"${o.customer.pincode || ""}"`,
          o.items.length,
          `"${itemsSummary.replace(/"/g, '""')}"`,
          `"${o.paymentMethod ?? "COD"}"`,
          `"${o.paymentStatus ?? "Pending"}"`,
          `"${o.status}"`,
          `"${o.courierName || ""}"`,
          `"${o.trackingId || ""}"`,
          o.total,
        ];
      });

      downloadCSV(`ghartika_sales_report_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
      setDownloading(null);
    }, 400);
  };

  // 3. Inventory Stock & Valuation Report
  const exportInventoryReport = () => {
    setDownloading("inventory");
    setTimeout(() => {
      const headers = [
        "Product ID",
        "Product Name",
        "SKU",
        "Category",
        "Weight",
        "Current Stock (Units)",
        "Low Stock Threshold",
        "Selling Price (₹)",
        "MRP (₹)",
        "Total Stock Value (₹)",
        "Stock Status",
      ];

      const rows = products.map((p) => {
        const stock = p.stock ?? 0;
        const totalVal = stock * p.price;
        const status = stock === 0 ? "Out of Stock" : (p.lowStockThreshold && stock <= p.lowStockThreshold) ? "Low Stock" : "In Stock";
        return [
          `"${p.id}"`,
          `"${p.name}"`,
          `"${p.sku || ""}"`,
          `"${p.category}"`,
          `"${p.weight}"`,
          stock,
          p.lowStockThreshold ?? 10,
          p.price,
          p.originalPrice || p.price,
          totalVal,
          `"${status}"`,
        ];
      });

      downloadCSV(`ghartika_inventory_valuation_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
      setDownloading(null);
    }, 400);
  };

  return (
    <div style={{ display: "grid", gap: 24, maxWidth: 840 }}>
      {/* Header */}
      <div>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: C.text, display: "flex", alignItems: "center", gap: 8 }}>
          <FileText style={{ width: 20, height: 20, color: C.red }} /> Financial & Business Reports
        </h2>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: C.muted }}>
          Download clean, one-click CSV and Excel compatible reports for tax filing, sales auditing, and inventory valuation
        </p>
      </div>

      {/* Reports Cards Grid */}
      <div style={{ display: "grid", gap: 16 }}>
        {/* GST Report Card */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: "#fef3c7", color: "#b45309", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Percent className="w-6 h-6" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.text }}>
                GST Tax Filing Report (HSN 0910 — Spices)
              </h3>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: C.muted, maxWidth: 500 }}>
                Includes taxable base price, CGST (2.5%), SGST (2.5%), and IGST (5%) breakups formatted for monthly/quarterly CA returns.
              </p>
            </div>
          </div>
          <button
            onClick={exportGSTReport}
            disabled={downloading === "gst"}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", background: C.red, color: "white", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-outfit), sans-serif" }}
          >
            <Download style={{ width: 15, height: 15 }} />
            {downloading === "gst" ? "Exporting..." : "Download GST CSV"}
          </button>
        </div>

        {/* Sales Report Card */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: "#dcfce7", color: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.text }}>
                Complete Sales & Orders Audit Report
              </h3>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: C.muted, maxWidth: 500 }}>
                Line-by-line order list with customer details, item quantities, courier tracking details, payment methods, and net revenue.
              </p>
            </div>
          </div>
          <button
            onClick={exportSalesReport}
            disabled={downloading === "sales"}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", background: C.surface, border: `1px solid ${C.border}`, color: C.text, borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-outfit), sans-serif" }}
          >
            <Download style={{ width: 15, height: 15 }} />
            {downloading === "sales" ? "Exporting..." : "Download Sales CSV"}
          </button>
        </div>

        {/* Inventory Report Card */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: "#e0f2fe", color: "#0284c7", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.text }}>
                Inventory Valuation & Stock Status Report
              </h3>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: C.muted, maxWidth: 500 }}>
                Total asset value in spices stock, individual SKU breakdown, remaining units, and low-stock replenishment flags.
              </p>
            </div>
          </div>
          <button
            onClick={exportInventoryReport}
            disabled={downloading === "inventory"}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", background: C.surface, border: `1px solid ${C.border}`, color: C.text, borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-outfit), sans-serif" }}
          >
            <Download style={{ width: 15, height: 15 }} />
            {downloading === "inventory" ? "Exporting..." : "Download Stock CSV"}
          </button>
        </div>
      </div>
    </div>
  );
}
