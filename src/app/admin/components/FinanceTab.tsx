"use client";

import { useState, useEffect, useMemo } from "react";
import type { Expense, ExpenseCategory, Order } from "@/types";
import {
  Plus, Trash2, Edit2, Save, X, Download, TrendingUp,
  TrendingDown, AlertCircle, CheckCircle2, IndianRupee,
} from "lucide-react";
import { C } from "./AdminShell";

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "Procurement", "Packaging", "Shipping / Logistics", "Advertising",
  "Platform Fees", "Payment Gateway Fees", "Refunds", "Salaries", "Utilities", "Other",
];

function fmtINR(n: number) { return "₹" + n.toLocaleString("en-IN"); }
function fmtDate(iso: string) { return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }); }

const BLANK_EXPENSE = (): Omit<Expense, "id" | "createdAt"> => ({
  date: new Date().toISOString().slice(0, 10),
  category: "Procurement",
  description: "",
  amount: 0,
  vendor: "",
  invoiceNumber: "",
  notes: "",
  createdBy: "Admin",
});

interface Props {
  orders: Order[];
}

export function FinanceTab({ orders }: Props) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Expense, "id" | "createdAt">>(BLANK_EXPENSE());
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [filterMonth, setFilterMonth] = useState<string>(() => new Date().toISOString().slice(0, 7));
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2500); };

  useEffect(() => {
    fetch("/api/expenses")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setExpenses(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // ── Metrics ──────────────────────────────────────────────────────────────────

  const metrics = useMemo(() => {
    const deliveredOrders = orders.filter((o) => o.status !== "Cancelled" && o.status !== "Returned");
    const grossSales = deliveredOrders.reduce((s, o) => s + o.total, 0);

    // Refunded amount
    const totalRefunded = orders
      .filter((o) => o.status === "Returned")
      .reduce((s, o) => s + (o.refundAmount ?? o.total), 0);

    const netSales = grossSales - totalRefunded;

    // Expenses breakdown
    const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
    const expByCategory: Record<string, number> = {};
    for (const e of expenses) {
      expByCategory[e.category] = (expByCategory[e.category] || 0) + e.amount;
    }

    // Gross profit = Net sales minus Procurement cost only
    const procurementCost = expByCategory["Procurement"] || 0;
    const grossProfit = netSales - procurementCost;
    const grossMarginPct = netSales > 0 ? ((grossProfit / netSales) * 100).toFixed(1) : "0";

    // Contribution margin = Gross profit minus variable costs (Packaging + Shipping + Advertising)
    const variableCosts =
      (expByCategory["Packaging"] || 0) +
      (expByCategory["Shipping / Logistics"] || 0) +
      (expByCategory["Advertising"] || 0) +
      (expByCategory["Payment Gateway Fees"] || 0);
    const contributionMargin = grossProfit - variableCosts;

    // Operating profit = contribution margin minus fixed costs
    const fixedCosts = totalExpenses - procurementCost - variableCosts;
    const operatingProfit = contributionMargin - fixedCosts;

    return { grossSales, netSales, totalRefunded, totalExpenses, procurementCost, grossProfit, grossMarginPct, variableCosts, contributionMargin, operatingProfit, expByCategory };
  }, [orders, expenses]);

  // ── Filter expenses by month ──────────────────────────────────────────────────
  const filteredExpenses = useMemo(() => {
    if (!filterMonth) return expenses;
    return expenses.filter((e) => e.date.startsWith(filterMonth));
  }, [expenses, filterMonth]);

  const filteredTotal = filteredExpenses.reduce((s, e) => s + e.amount, 0);

  // ── Save ─────────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!form.description.trim()) { showToast("Description is required"); return; }
    if (!form.amount || form.amount <= 0) { showToast("Amount must be greater than 0"); return; }
    setSaving(true);
    try {
      const isEdit = !!editingId;
      const res = await fetch(isEdit ? `/api/expenses/${editingId}` : "/api/expenses", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Save failed");
      const saved: Expense = await res.json();
      setExpenses((prev) => isEdit ? prev.map((e) => e.id === saved.id ? saved : e) : [saved, ...prev]);
      setShowForm(false);
      setEditingId(null);
      setForm(BLANK_EXPENSE());
      showToast(isEdit ? "✅ Expense updated" : "✅ Expense added");
    } catch {
      showToast("❌ Failed to save expense");
    } finally { setSaving(false); }
  };

  const handleEdit = (expense: Expense) => {
    setEditingId(expense.id);
    setForm({ date: expense.date.slice(0, 10), category: expense.category, description: expense.description, amount: expense.amount, vendor: expense.vendor || "", invoiceNumber: expense.invoiceNumber || "", notes: expense.notes || "", createdBy: expense.createdBy });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/expenses/${id}`, { method: "DELETE" });
      setExpenses((prev) => prev.filter((e) => e.id !== id));
      showToast("🗑 Expense deleted");
    } catch { showToast("❌ Failed to delete"); }
    finally { setConfirmDelete(null); }
  };

  // ── CSV Export ────────────────────────────────────────────────────────────────

  const exportCSV = () => {
    const headers = ["ID", "Date", "Category", "Description", "Vendor", "Invoice No", "Amount (₹)", "Added By"];
    const rows = filteredExpenses.map((e) => [e.id, e.date, e.category, `"${e.description}"`, e.vendor || "", e.invoiceNumber || "", e.amount, e.createdBy]);
    const csv = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const a = document.createElement("a"); a.href = encodeURI(csv); a.download = `expenses-${filterMonth}.csv`; a.click();
  };

  const INPUT = { width: "100%", padding: "10px 14px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 14, outline: "none", boxSizing: "border-box" as const, fontFamily: "var(--font-outfit), sans-serif" };
  const LABEL = { fontSize: 12, fontWeight: 600 as const, color: C.muted, display: "block" as const, marginBottom: 5 };

  return (
    <div style={{ display: "grid", gap: 24 }}>

      {/* Toast */}
      {toast && <div style={{ position: "fixed", bottom: 24, right: 24, background: C.text, color: "white", padding: "12px 20px", borderRadius: 12, zIndex: 9999, fontSize: 14, fontWeight: 600, boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}>{toast}</div>}

      {/* Confirm Delete Dialog */}
      {confirmDelete && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 9000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: C.surface, borderRadius: 16, padding: 28, maxWidth: 380, width: "90%", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <h3 style={{ margin: "0 0 8px", color: C.text, fontSize: 18, fontWeight: 700 }}>Delete Expense?</h3>
            <p style={{ color: C.muted, fontSize: 14, margin: "0 0 20px" }}>This action cannot be undone.</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setConfirmDelete(null)} style={{ flex: 1, padding: "10px", border: `1px solid ${C.border}`, borderRadius: 10, background: C.bg, color: C.text, cursor: "pointer", fontWeight: 600, fontSize: 14 }}>Cancel</button>
              <button onClick={() => handleDelete(confirmDelete)} style={{ flex: 1, padding: "10px", border: "none", borderRadius: 10, background: "#dc2626", color: "white", cursor: "pointer", fontWeight: 700, fontSize: 14 }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: C.text }}>Finance & Expenses</h2>
          <p style={{ margin: "4px 0 0", color: C.muted, fontSize: 13 }}>Track expenses and understand your real profitability</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={exportCSV} style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", border: `1px solid ${C.border}`, borderRadius: 10, background: C.bg, color: C.text, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
            <Download style={{ width: 14, height: 14 }} /> Export CSV
          </button>
          <button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm(BLANK_EXPENSE()); }} style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", border: "none", borderRadius: 10, background: C.red, color: "white", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>
            <Plus style={{ width: 14, height: 14 }} /> Add Expense
          </button>
        </div>
      </div>

      {/* P&L Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
        {[
          { label: "Gross Sales", value: fmtINR(metrics.grossSales), icon: <IndianRupee style={{ width: 16, height: 16 }} />, color: "#16a34a", help: "All non-cancelled/returned orders" },
          { label: "Net Sales", value: fmtINR(metrics.netSales), icon: <TrendingUp style={{ width: 16, height: 16 }} />, color: "#0369a1", help: "After refunds/returns" },
          { label: "Total Expenses", value: fmtINR(metrics.totalExpenses), icon: <TrendingDown style={{ width: 16, height: 16 }} />, color: "#dc2626", help: "All recorded expenses" },
          { label: "Gross Profit", value: fmtINR(metrics.grossProfit), icon: <CheckCircle2 style={{ width: 16, height: 16 }} />, color: metrics.grossProfit >= 0 ? "#16a34a" : "#dc2626", help: `Net Sales minus Procurement (${metrics.grossMarginPct}% margin)` },
          { label: "Contribution Margin", value: fmtINR(metrics.contributionMargin), icon: <TrendingUp style={{ width: 16, height: 16 }} />, color: metrics.contributionMargin >= 0 ? "#7c3aed" : "#dc2626", help: "Gross profit minus variable costs (packaging, shipping, ads, fees)" },
          { label: "Operating Profit*", value: fmtINR(metrics.operatingProfit), icon: <AlertCircle style={{ width: 16, height: 16 }} />, color: metrics.operatingProfit >= 0 ? "#16a34a" : "#dc2626", help: "Estimated. Does NOT include unlisted overheads." },
        ].map((card, i) => (
          <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: "18px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <div style={{ color: card.color }}>{card.icon}</div>
              <span style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase" }}>{card.label}</span>
            </div>
            <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: card.color }}>{card.value}</p>
            <p style={{ margin: "4px 0 0", fontSize: 11, color: C.muted }}>{card.help}</p>
          </div>
        ))}
      </div>

      {/* Disclaimer */}
      <div style={{ background: "#fef3c7", border: "1px solid #fde68a", borderRadius: 12, padding: "12px 16px", fontSize: 13, color: "#92400e" }}>
        <strong>⚠️ Note:</strong> &quot;Operating Profit&quot; is an estimate. It excludes any expenses not yet recorded here. Product cost prices in the product editor are not yet included in these calculations.
      </div>

      {/* Expense Category Breakdown */}
      {Object.keys(metrics.expByCategory).length > 0 && (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
          <h3 style={{ margin: "0 0 18px", fontSize: 15, fontWeight: 700, color: C.text }}>Expense Breakdown by Category</h3>
          <div style={{ display: "grid", gap: 10 }}>
            {EXPENSE_CATEGORIES.filter((cat) => metrics.expByCategory[cat] > 0).map((cat) => {
              const amt = metrics.expByCategory[cat] || 0;
              const pct = metrics.totalExpenses > 0 ? (amt / metrics.totalExpenses) * 100 : 0;
              return (
                <div key={cat}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{cat}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: C.red }}>{fmtINR(amt)} <span style={{ fontSize: 11, color: C.muted, fontWeight: 400 }}>({Math.round(pct)}%)</span></span>
                  </div>
                  <div style={{ height: 6, background: C.bg, borderRadius: 99 }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: C.red, borderRadius: 99, transition: "width 0.5s ease" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.text }}>{editingId ? "Edit Expense" : "Add New Expense"}</h3>
            <button onClick={() => { setShowForm(false); setEditingId(null); }} style={{ background: "none", border: "none", cursor: "pointer", color: C.muted }}>
              <X style={{ width: 18, height: 18 }} />
            </button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
            <div>
              <label style={LABEL}>Date *</label>
              <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} style={INPUT} />
            </div>
            <div>
              <label style={LABEL}>Category *</label>
              <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as ExpenseCategory }))} style={INPUT}>
                {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={LABEL}>Description *</label>
              <input type="text" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="e.g. Red chilli procurement from Guntur mandi" style={INPUT} />
            </div>
            <div>
              <label style={LABEL}>Amount (₹) *</label>
              <input type="number" value={form.amount || ""} onChange={(e) => setForm((f) => ({ ...f, amount: parseFloat(e.target.value) || 0 }))} placeholder="0" min={0} style={INPUT} />
            </div>
            <div>
              <label style={LABEL}>Vendor / Supplier</label>
              <input type="text" value={form.vendor} onChange={(e) => setForm((f) => ({ ...f, vendor: e.target.value }))} placeholder="e.g. Sharma Masala Supplier" style={INPUT} />
            </div>
            <div>
              <label style={LABEL}>Invoice / Bill Number</label>
              <input type="text" value={form.invoiceNumber} onChange={(e) => setForm((f) => ({ ...f, invoiceNumber: e.target.value }))} placeholder="e.g. INV-2024-001" style={INPUT} />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={LABEL}>Notes (optional)</label>
              <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows={2} placeholder="Additional context..." style={{ ...INPUT, resize: "vertical" as const }} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <button onClick={() => { setShowForm(false); setEditingId(null); }} style={{ padding: "10px 20px", border: `1px solid ${C.border}`, borderRadius: 10, background: C.bg, color: C.text, cursor: "pointer", fontWeight: 600, fontSize: 14 }}>Cancel</button>
            <button onClick={handleSave} disabled={saving} style={{ padding: "10px 24px", border: "none", borderRadius: 10, background: C.red, color: "white", cursor: saving ? "not-allowed" : "pointer", fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 6, opacity: saving ? 0.8 : 1 }}>
              <Save style={{ width: 14, height: 14 }} /> {saving ? "Saving..." : editingId ? "Update Expense" : "Add Expense"}
            </button>
          </div>
        </div>
      )}

      {/* Expense Table */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.text }}>Expense Records</h3>
            <span style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 99, padding: "2px 10px", fontSize: 12, fontWeight: 600, color: C.muted }}>
              {fmtINR(filteredTotal)} for {filterMonth}
            </span>
          </div>
          <input type="month" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} style={{ padding: "7px 12px", border: `1px solid ${C.border}`, borderRadius: 10, background: C.bg, color: C.text, fontSize: 13, outline: "none" }} />
        </div>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: C.muted }}>Loading expenses...</div>
        ) : filteredExpenses.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: C.muted }}>
            <TrendingDown style={{ width: 40, height: 40, margin: "0 auto 12px", color: C.border }} />
            <p style={{ fontWeight: 600 }}>No expenses recorded for {filterMonth}</p>
            <p style={{ fontSize: 13 }}>Click "Add Expense" to start tracking your costs</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: C.bg }}>
                  {["Date", "Category", "Description", "Vendor", "Invoice", "Amount", "Actions"].map((h) => (
                    <th key={h} style={{ padding: "10px 16px", textAlign: "left", color: C.muted, fontWeight: 600, fontSize: 11, textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((expense) => (
                  <tr key={expense.id} style={{ borderTop: `1px solid ${C.border}` }}>
                    <td style={{ padding: "12px 16px", color: C.muted, whiteSpace: "nowrap" }}>{fmtDate(expense.date)}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 99, padding: "3px 10px", fontSize: 12, fontWeight: 600, color: C.text, whiteSpace: "nowrap" }}>{expense.category}</span>
                    </td>
                    <td style={{ padding: "12px 16px", fontWeight: 600, color: C.text, maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={expense.description}>{expense.description}</td>
                    <td style={{ padding: "12px 16px", color: C.muted }}>{expense.vendor || "—"}</td>
                    <td style={{ padding: "12px 16px", color: C.muted, fontFamily: "monospace" }}>{expense.invoiceNumber || "—"}</td>
                    <td style={{ padding: "12px 16px", fontWeight: 700, color: C.red, whiteSpace: "nowrap" }}>{fmtINR(expense.amount)}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => handleEdit(expense)} style={{ padding: "6px 10px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, cursor: "pointer", color: C.text, display: "flex", alignItems: "center" }}>
                          <Edit2 style={{ width: 13, height: 13 }} />
                        </button>
                        <button onClick={() => setConfirmDelete(expense.id)} style={{ padding: "6px 10px", background: "#fee2e2", border: "1px solid #fecaca", borderRadius: 8, cursor: "pointer", color: "#dc2626", display: "flex", alignItems: "center" }}>
                          <Trash2 style={{ width: 13, height: 13 }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
