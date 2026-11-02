"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import type { Order, OrderStatus } from "@/types";
import { ALL_ORDER_STATUSES } from "@/types";
import {
  Search, Filter, Copy, Check, ChevronDown, ChevronUp,
  Phone, Mail, MapPin, Clock, Truck, Package, Users,
  CheckCircle2, XCircle, RefreshCw, AlertCircle, Printer,
  ExternalLink, StickyNote, ChevronRight, RotateCcw,
} from "lucide-react";
import { C, nm } from "./AdminShell";

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_CFG: Record<OrderStatus, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  Pending:   { label: "Pending",   color: "#b45309", bg: "#fef3c7", border: "#fde68a", icon: <Clock className="w-3 h-3" /> },
  Confirmed: { label: "Confirmed", color: "#1d4ed8", bg: "#dbeafe", border: "#bfdbfe", icon: <CheckCircle2 className="w-3 h-3" /> },
  Packed:    { label: "Packed",    color: "#7c3aed", bg: "#ede9fe", border: "#ddd6fe", icon: <Package className="w-3 h-3" /> },
  Shipped:   { label: "Shipped",   color: "#0369a1", bg: "#e0f2fe", border: "#bae6fd", icon: <Truck className="w-3 h-3" /> },
  Delivered: { label: "Delivered", color: "#15803d", bg: "#dcfce7", border: "#bbf7d0", icon: <CheckCircle2 className="w-3 h-3" /> },
  Cancelled: { label: "Cancelled", color: "#b91c1c", bg: "#fee2e2", border: "#fecaca", icon: <XCircle className="w-3 h-3" /> },
  Returned:  { label: "Returned",  color: "#9a3412", bg: "#ffedd5", border: "#fed7aa", icon: <RotateCcw className="w-3 h-3" /> },
};

function StatusBadge({ status }: { status: OrderStatus }) {
  const c = STATUS_CFG[status];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 99, fontSize: 12, fontWeight: 600, color: c.color, background: c.bg, border: `1px solid ${c.border}` }}>
      {c.icon} {c.label}
    </span>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

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
    <button onClick={copy} title="Copy" style={{ background: "none", border: "none", cursor: "pointer", color: copied ? "#16a34a" : C.muted, padding: "2px 4px", lineHeight: 1 }}>
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

// ── Invoice/Packing slip print ────────────────────────────────────────────────

function printInvoice(order: Order) {
  const gstRate = 0.05; // 5% GST for spices (HSN 0910)
  const subTotal = Math.round(order.total / 1.05); // back-calculate pre-GST
  const gstAmt = order.total - subTotal;

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Invoice — ${order.id}</title>
  <style>
    body { font-family: Arial, sans-serif; color: #111; padding: 32px; font-size: 13px; }
    h1 { color: #A01C2C; margin: 0 0 4px; font-size: 22px; }
    .row { display: flex; justify-content: space-between; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    th { background: #f5f0e8; padding: 8px 12px; text-align: left; font-size: 12px; text-transform: uppercase; color: #666; }
    td { padding: 10px 12px; border-top: 1px solid #eee; }
    .total-row td { font-weight: bold; background: #fef3c7; }
    .box { border: 1px solid #ddd; border-radius: 8px; padding: 12px 16px; margin-bottom: 12px; }
    .footer { margin-top: 32px; font-size: 11px; color: #999; text-align: center; border-top: 1px solid #eee; padding-top: 12px; }
    @media print { body { padding: 0; } }
  </style></head><body>
  <div class="row" style="margin-bottom:24px;align-items:flex-start">
    <div>
      <h1>🌶️ Ghartika Spices</h1>
      <p style="margin:0;color:#666">GSTIN: [Add your GSTIN] | ghartika.in</p>
      <p style="margin:0;color:#666">support@ghartika.in | +91-XXXXXXXXXX</p>
    </div>
    <div style="text-align:right">
      <p style="margin:0;font-weight:bold;font-size:16px">TAX INVOICE</p>
      <p style="margin:4px 0 0;color:#666;font-size:12px">Order: <strong>${order.id}</strong></p>
      <p style="margin:2px 0 0;color:#666;font-size:12px">Date: ${fmtDate(order.date)}</p>
      <p style="margin:2px 0 0;color:#666;font-size:12px">Payment: ${order.paymentMethod ?? "COD"} — ${order.paymentStatus ?? "Pending"}</p>
    </div>
  </div>
  <div class="row" style="gap:16px;margin-bottom:20px">
    <div class="box" style="flex:1">
      <strong>Bill To / Ship To</strong><br/>
      ${order.customer.name}<br/>
      ${order.customer.phone}${order.customer.email ? " | " + order.customer.email : ""}<br/>
      ${order.customer.address},<br/>
      ${order.customer.city}, ${order.customer.state} — ${order.customer.pincode}
    </div>
    ${order.courierName ? `<div class="box" style="flex:1"><strong>Shipping</strong><br/>Courier: ${order.courierName}<br/>Tracking: ${order.trackingId ?? "—"}${order.trackingUrl ? `<br/><a href="${order.trackingUrl}">${order.trackingUrl}</a>` : ""}</div>` : ""}
  </div>
  <table>
    <thead><tr><th>#</th><th>Product</th><th>Weight</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead>
    <tbody>
      ${order.items.map((item, i) => `<tr><td>${i + 1}</td><td>${item.name}</td><td>${item.weight}</td><td>${item.quantity}</td><td>${fmtINR(item.price)}</td><td>${fmtINR(item.price * item.quantity)}</td></tr>`).join("")}
    </tbody>
    <tfoot>
      <tr><td colspan="5" style="text-align:right;padding:10px 12px;border-top:1px solid #ddd">Subtotal (excl. GST)</td><td style="padding:10px 12px;border-top:1px solid #ddd">${fmtINR(subTotal)}</td></tr>
      <tr><td colspan="5" style="text-align:right;padding:10px 12px">GST @ ${Math.round(gstRate * 100)}% (HSN 0910)</td><td style="padding:10px 12px">${fmtINR(gstAmt)}</td></tr>
      <tr class="total-row"><td colspan="5" style="text-align:right;padding:10px 12px">Grand Total</td><td style="padding:10px 12px">${fmtINR(order.total)}</td></tr>
    </tfoot>
  </table>
  <div class="footer">This is a computer-generated invoice. Thank you for choosing Ghartika Spices! | ghartika.in</div>
  </body></html>`;

  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 400);
}

function printPackingSlip(order: Order) {
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Packing Slip — ${order.id}</title>
  <style>
    body { font-family: Arial, sans-serif; color: #111; padding: 24px; font-size: 13px; }
    h2 { color: #A01C2C; margin: 0 0 16px; }
    .box { border: 2px dashed #ccc; border-radius: 8px; padding: 12px 16px; margin-bottom: 16px; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #f5f0e8; padding: 8px; text-align: left; font-size: 12px; }
    td { padding: 8px; border-top: 1px solid #eee; }
    @media print { body { padding: 0; } }
  </style></head><body>
  <h2>🌶️ Ghartika Spices — PACKING SLIP</h2>
  <div style="display:flex;gap:12px;margin-bottom:16px">
    <div class="box" style="flex:1"><strong>Order ID:</strong> ${order.id}<br/><strong>Date:</strong> ${fmtDate(order.date)}<br/><strong>Payment:</strong> ${order.paymentMethod ?? "COD"}</div>
    <div class="box" style="flex:2"><strong>Ship To:</strong><br/>${order.customer.name}<br/>${order.customer.phone}<br/>${order.customer.address}, ${order.customer.city}, ${order.customer.state} — ${order.customer.pincode}</div>
  </div>
  <table>
    <thead><tr><th>Product</th><th>Weight / Variant</th><th>Qty</th><th>✓ Packed?</th></tr></thead>
    <tbody>
      ${order.items.map((item) => `<tr><td><strong>${item.name}</strong></td><td>${item.weight}</td><td><strong>${item.quantity}</strong></td><td style="width:80px;text-align:center">□</td></tr>`).join("")}
    </tbody>
  </table>
  <div style="margin-top:16px;padding:12px;background:#fef3c7;border-radius:8px;font-size:12px">
    <strong>Total Items: ${order.items.reduce((s, i) => s + i.quantity, 0)}</strong> &nbsp;|&nbsp; <strong>Order Total: ${fmtINR(order.total)}</strong>
    ${order.adminNote ? `<br/>⚠️ Note: ${order.adminNote}` : ""}
  </div>
  </body></html>`;

  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 400);
}

// ── Order detail panel ────────────────────────────────────────────────────────

function OrderDetail({
  order,
  onStatusUpdate,
  onPatch,
}: {
  order: Order;
  onStatusUpdate: (id: string, status: OrderStatus) => Promise<void>;
  onPatch: (id: string, patch: Partial<Order>) => Promise<void>;
}) {
  const [savingStatus, setSavingStatus] = useState(false);
  const [shipping, setShipping] = useState({ courier: order.courierName ?? "", trackingId: order.trackingId ?? "", trackingUrl: order.trackingUrl ?? "" });
  const [savingShipping, setSavingShipping] = useState(false);
  const [note, setNote] = useState(order.adminNote ?? "");
  const [savingNote, setSavingNote] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2200); };

  const handleStatus = async (status: OrderStatus) => {
    setSavingStatus(true);
    try { await onStatusUpdate(order.id, status); showToast(`Status → ${status}`); }
    catch { showToast("Failed to update status"); }
    finally { setSavingStatus(false); }
  };

  const handleSaveShipping = async () => {
    setSavingShipping(true);
    try {
      await onPatch(order.id, { courierName: shipping.courier, trackingId: shipping.trackingId, trackingUrl: shipping.trackingUrl });
      showToast("Shipping info saved!");
    } catch { showToast("Failed to save shipping"); }
    finally { setSavingShipping(false); }
  };

  const handleSaveNote = async () => {
    setSavingNote(true);
    try { await onPatch(order.id, { adminNote: note }); showToast("Note saved!"); }
    catch { showToast("Failed to save note"); }
    finally { setSavingNote(false); }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "9px 12px", border: `1px solid ${C.border}`, borderRadius: 8,
    fontSize: 13, outline: "none", background: C.bg, color: C.text,
    fontFamily: "var(--font-outfit), sans-serif", boxSizing: "border-box",
  };

  return (
    <div style={{ display: "grid", gap: 16, padding: "20px 20px 24px" }}>
      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, background: "#1a1008", color: "white", padding: "10px 20px", borderRadius: 10, fontSize: 13, fontWeight: 600, zIndex: 999, boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}>
          {toast}
        </div>
      )}

      {/* Customer + Items */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Customer */}
        <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 }}>
          <h4 style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 700, color: C.text, display: "flex", alignItems: "center", gap: 6 }}>
            <Users style={{ width: 14, height: 14, color: C.red }} /> Customer Details
          </h4>
          <div style={{ display: "grid", gap: 7, fontSize: 13 }}>
            <p style={{ margin: 0, fontWeight: 700, color: C.text }}>{order.customer.name}</p>
            <p style={{ margin: 0, color: C.muted, display: "flex", alignItems: "center", gap: 6 }}><Phone style={{ width: 12, height: 12 }} />{order.customer.phone}</p>
            {order.customer.email && <p style={{ margin: 0, color: C.muted, display: "flex", alignItems: "center", gap: 6 }}><Mail style={{ width: 12, height: 12 }} />{order.customer.email}</p>}
            <p style={{ margin: 0, color: C.muted, display: "flex", alignItems: "flex-start", gap: 6 }}>
              <MapPin style={{ width: 12, height: 12, flexShrink: 0, marginTop: 2 }} />
              <span>{order.customer.address}, {order.customer.city}, {order.customer.state} — <strong>{order.customer.pincode}</strong></span>
            </p>
          </div>
          {/* Payment */}
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.border}`, display: "flex", flexWrap: "wrap", gap: 16, fontSize: 12 }}>
            <span style={{ color: C.muted }}>Method: <strong style={{ color: C.text }}>{order.paymentMethod ?? "COD"}</strong></span>
            <span style={{ color: C.muted }}>Status: <strong style={{ color: order.paymentStatus === "Paid" ? "#15803d" : C.text }}>{order.paymentStatus ?? "Pending"}</strong></span>
            {order.razorpayPaymentId && (
              <span style={{ color: C.muted }}>
                Txn/UTR: <strong style={{ color: C.red, fontFamily: "monospace" }}>{order.razorpayPaymentId}</strong>
              </span>
            )}
          </div>
        </div>

        {/* Items */}
        <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 }}>
          <h4 style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 700, color: C.text, display: "flex", alignItems: "center", gap: 6 }}>
            <Package style={{ width: 14, height: 14, color: C.red }} /> Items ({order.items.reduce((s, i) => s + i.quantity, 0)} units)
          </h4>
          <div style={{ display: "grid", gap: 8 }}>
            {order.items.map((item, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span style={{ color: C.text }}>{item.name} <span style={{ color: C.muted }}>({item.weight}) × {item.quantity}</span></span>
                <span style={{ fontWeight: 700, color: C.text }}>{fmtINR(item.price * item.quantity)}</span>
              </div>
            ))}
            <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 8, display: "flex", justifyContent: "space-between", fontWeight: 700 }}>
              <span style={{ color: C.text }}>Total</span>
              <span style={{ color: C.red }}>{fmtINR(order.total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Status Flow */}
      <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 }}>
        <h4 style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 700, color: C.text }}>Update Status</h4>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {ALL_ORDER_STATUSES.map((status) => {
            const cfg = STATUS_CFG[status];
            const isActive = order.status === status;
            return (
              <button
                key={status}
                onClick={() => handleStatus(status)}
                disabled={savingStatus || isActive}
                style={{
                  display: "flex", alignItems: "center", gap: 5, padding: "7px 14px",
                  borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: isActive || savingStatus ? "default" : "pointer",
                  background: isActive ? cfg.bg : C.surface,
                  color: isActive ? cfg.color : C.muted,
                  border: isActive ? `2px solid ${cfg.border}` : `1px solid ${C.border}`,
                  fontFamily: "var(--font-outfit), sans-serif", opacity: savingStatus && !isActive ? 0.6 : 1,
                }}
              >
                {cfg.icon} {cfg.label}
                {isActive && <Check className="w-3 h-3" />}
              </button>
            );
          })}
        </div>

        {/* Status timeline */}
        {order.statusHistory && order.statusHistory.length > 1 && (
          <div style={{ marginTop: 16, display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
            {order.statusHistory.map((h, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                <div>
                  <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: STATUS_CFG[h.status].color }}>{h.status}</p>
                  <p style={{ margin: 0, fontSize: 10, color: C.muted }}>{new Date(h.timestamp).toLocaleDateString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
                </div>
                {i < order.statusHistory!.length - 1 && <ChevronRight style={{ width: 14, height: 14, color: C.border, flexShrink: 0 }} />}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Shipping + Notes */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Shipping */}
        <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 }}>
          <h4 style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 700, color: C.text, display: "flex", alignItems: "center", gap: 6 }}>
            <Truck style={{ width: 14, height: 14, color: C.red }} /> Shipping / Tracking
          </h4>
          <div style={{ display: "grid", gap: 10 }}>
            {[
              { label: "Courier Name", key: "courier", placeholder: "Delhivery / India Post..." },
              { label: "Tracking ID", key: "trackingId", placeholder: "1234567890" },
              { label: "Tracking URL", key: "trackingUrl", placeholder: "https://track.delhivery.com/..." },
            ].map(({ label, key, placeholder }) => (
              <div key={key}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: C.muted, marginBottom: 4, textTransform: "uppercase" }}>{label}</label>
                <input
                  style={inputStyle}
                  value={shipping[key as keyof typeof shipping]}
                  onChange={(e) => setShipping((s) => ({ ...s, [key]: e.target.value }))}
                  placeholder={placeholder}
                />
              </div>
            ))}
          </div>
          {order.trackingUrl && (
            <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 8, fontSize: 12, color: C.red, fontWeight: 600 }}>
              <ExternalLink className="w-3 h-3" /> Track Shipment
            </a>
          )}
          <button
            onClick={handleSaveShipping}
            disabled={savingShipping}
            style={{ marginTop: 12, width: "100%", padding: "8px", background: C.red, border: "none", borderRadius: 8, color: "white", fontSize: 13, fontWeight: 600, cursor: savingShipping ? "not-allowed" : "pointer", fontFamily: "var(--font-outfit), sans-serif" }}
          >
            {savingShipping ? "Saving..." : "Save Shipping Info"}
          </button>
        </div>

        {/* Admin Note */}
        <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 }}>
          <h4 style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 700, color: C.text, display: "flex", alignItems: "center", gap: 6 }}>
            <StickyNote style={{ width: 14, height: 14, color: C.red }} /> Admin Note <span style={{ fontSize: 10, color: C.muted, fontWeight: 400 }}>(not visible to customer)</span>
          </h4>
          <textarea
            style={{ ...inputStyle, minHeight: 110, resize: "vertical" }}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Customer called — wants delivery before Diwali..."
          />
          <button
            onClick={handleSaveNote}
            disabled={savingNote}
            style={{ marginTop: 10, width: "100%", padding: "8px", background: C.red, border: "none", borderRadius: 8, color: "white", fontSize: 13, fontWeight: 600, cursor: savingNote ? "not-allowed" : "pointer", fontFamily: "var(--font-outfit), sans-serif" }}
          >
            {savingNote ? "Saving..." : "Save Note"}
          </button>
        </div>
      </div>

      {/* Print & Refund actions */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => printInvoice(order)}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 18px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-outfit), sans-serif" }}
          >
            <Printer style={{ width: 14, height: 14 }} /> Print GST Invoice
          </button>
          <button
            onClick={() => printPackingSlip(order)}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 18px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-outfit), sans-serif" }}
          >
            <Package style={{ width: 14, height: 14 }} /> Print Packing Slip
          </button>
        </div>

        {/* Refund action */}
        <div>
          {order.paymentStatus === "Refunded" ? (
            <span style={{ fontSize: 12, background: "#ede9fe", color: "#6d28d9", border: "1px solid #ddd6fe", padding: "6px 14px", borderRadius: 8, fontWeight: 700 }}>
              Refunded (₹{order.total})
            </span>
          ) : (
            <button
              onClick={async () => {
                if (!confirm(`Are you sure you want to refund ₹${order.total} for order ${order.id}?`)) return;
                try {
                  const res = await fetch(`/api/orders/${order.id}/refund`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ reason: "Admin Refund via Dashboard" }),
                  });
                  if (!res.ok) throw new Error("Refund failed");
                  await onPatch(order.id, { paymentStatus: "Refunded" });
                  showToast(`Order ${order.id} refunded successfully! 💸`);
                } catch {
                  showToast("Failed to process refund");
                }
              }}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, color: "#dc2626", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-outfit), sans-serif" }}
            >
              Refund Order ({fmtINR(order.total)})
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Orders Tab ───────────────────────────────────────────────────────────

interface Props {
  orders: Order[];
  onStatusUpdate: (id: string, status: OrderStatus) => Promise<void>;
  onPatch: (id: string, patch: Partial<Order>) => Promise<void>;
  onBulkUpdate: (ids: string[], status: OrderStatus) => Promise<void>;
  isLoading: boolean;
}

const ITEMS_PER_PAGE = 20;

export function OrdersTab({ orders, onStatusUpdate, onPatch, onBulkUpdate, isLoading }: Props) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "All">("All");
  const [paymentFilter, setPaymentFilter] = useState<"All" | "COD" | "Online">("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<OrderStatus>("Confirmed");
  const [bulkLoading, setBulkLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        o.id.toLowerCase().includes(q) ||
        o.customer.name.toLowerCase().includes(q) ||
        o.customer.phone.includes(q) ||
        o.customer.pincode?.includes(q);
      const matchStatus = statusFilter === "All" || o.status === statusFilter;
      const matchPayment = paymentFilter === "All" || (o.paymentMethod ?? "COD") === paymentFilter;
      const matchFrom = !dateFrom || new Date(o.date) >= new Date(dateFrom);
      const matchTo = !dateTo || new Date(o.date) <= new Date(dateTo + "T23:59:59");
      return matchSearch && matchStatus && matchPayment && matchFrom && matchTo;
    });
  }, [orders, search, statusFilter, paymentFilter, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const allPageSelected = paginated.length > 0 && paginated.every((o) => selected.has(o.id));

  const toggleSelect = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = () => {
    if (allPageSelected) {
      setSelected((prev) => { const n = new Set(prev); paginated.forEach((o) => n.delete(o.id)); return n; });
    } else {
      setSelected((prev) => { const n = new Set(prev); paginated.forEach((o) => n.add(o.id)); return n; });
    }
  };

  const handleBulkUpdate = async () => {
    if (selected.size === 0) return;
    setBulkLoading(true);
    try {
      await onBulkUpdate(Array.from(selected), bulkStatus);
      setSelected(new Set());
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkPrint = () => {
    const toPrint = orders.filter((o) => selected.has(o.id));
    toPrint.forEach((o, i) => setTimeout(() => printInvoice(o), i * 600));
  };

  const inputCls: React.CSSProperties = {
    padding: "10px 14px", border: "1px solid rgba(200, 184, 165, 0.4)", borderRadius: 12,
    fontSize: 13, outline: "none", background: C.base, color: C.text,
    fontFamily: "var(--font-outfit), sans-serif",
    boxShadow: nm.insetSm,
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: 80, color: C.muted }}>
        <RefreshCw style={{ width: 36, height: 36, margin: "0 auto 12px", animation: "adminSpin 0.8s linear infinite" }} />
        <p style={{ fontWeight: 600 }}>Orders load ho rahi hain...</p>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      {/* Search + Filters row */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {/* Search */}
        <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
          <Search style={{ width: 15, height: 15, position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: C.muted }} />
          <input
            ref={searchRef}
            type="text"
            placeholder="Name, phone, order ID, pincode..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            style={{ ...inputCls, width: "100%", paddingLeft: 36, boxSizing: "border-box" }}
          />
        </div>
        {/* Status filter */}
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value as OrderStatus | "All"); setPage(1); }} style={inputCls}>
          <option value="All">All Statuses</option>
          {ALL_ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        {/* Payment filter */}
        <select value={paymentFilter} onChange={(e) => { setPaymentFilter(e.target.value as "All" | "COD" | "Online"); setPage(1); }} style={inputCls}>
          <option value="All">COD + Online</option>
          <option value="COD">COD Only</option>
          <option value="Online">Online Only</option>
        </select>
        {/* More filters toggle */}
        <button onClick={() => setShowFilters(!showFilters)} style={{ ...inputCls, display: "flex", alignItems: "center", gap: 6, cursor: "pointer", border: showFilters ? `1px solid ${C.red}` : `1px solid ${C.border}`, background: showFilters ? "#fff0f0" : C.surface, color: showFilters ? C.red : C.text }}>
          <Filter style={{ width: 14, height: 14 }} /> Filters
        </button>
      </div>

      {/* Date range filters */}
      {showFilters && (
        <div style={{ display: "flex", gap: 10, alignItems: "center", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 16px" }}>
          <span style={{ fontSize: 13, color: C.muted, fontWeight: 600 }}>Date Range:</span>
          <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} style={inputCls} />
          <span style={{ color: C.muted }}>to</span>
          <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }} style={inputCls} />
          {(dateFrom || dateTo) && (
            <button onClick={() => { setDateFrom(""); setDateTo(""); }} style={{ fontSize: 12, color: C.red, fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}>Clear</button>
          )}
        </div>
      )}

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 12, padding: "12px 16px" }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#c2410c" }}>{selected.size} selected</span>
          <select value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value as OrderStatus)} style={{ ...inputCls, background: "white" }}>
            {ALL_ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button onClick={handleBulkUpdate} disabled={bulkLoading} style={{ padding: "8px 16px", background: C.red, border: "none", borderRadius: 8, color: "white", fontSize: 13, fontWeight: 600, cursor: bulkLoading ? "not-allowed" : "pointer", fontFamily: "var(--font-outfit), sans-serif" }}>
            {bulkLoading ? "Updating..." : `Update ${selected.size} Orders`}
          </button>
          <button onClick={handleBulkPrint} style={{ padding: "8px 16px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-outfit), sans-serif", display: "flex", alignItems: "center", gap: 6 }}>
            <Printer style={{ width: 13, height: 13 }} /> Print Invoices
          </button>
          <button onClick={() => setSelected(new Set())} style={{ marginLeft: "auto", fontSize: 12, color: C.muted, background: "none", border: "none", cursor: "pointer" }}>Clear</button>
        </div>
      )}

      {/* Stats row */}
      <div style={{ display: "flex", gap: 12, fontSize: 13, color: C.muted }}>
        <span><strong style={{ color: C.text }}>{filtered.length}</strong> orders {search || statusFilter !== "All" ? "(filtered)" : "total"}</span>
        {filtered.length > 0 && <span>• Total: <strong style={{ color: C.red }}>₹{filtered.reduce((s, o) => s + o.total, 0).toLocaleString("en-IN")}</strong></span>}
        {totalPages > 1 && <span>• Page {page}/{totalPages}</span>}
      </div>

      {/* Orders list */}
      {filtered.length === 0 ? (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 48, textAlign: "center", color: C.muted }}>
          <AlertCircle style={{ width: 40, height: 40, margin: "0 auto 12px", opacity: 0.3 }} />
          <p style={{ fontWeight: 600, margin: 0 }}>Koi orders nahi mili</p>
          <p style={{ fontSize: 13, margin: "6px 0 0" }}>Search ya filter change karo</p>
        </div>
      ) : (
        <>
          {/* Select-all header */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, paddingLeft: 4 }}>
            <input type="checkbox" checked={allPageSelected} onChange={toggleSelectAll} style={{ width: 15, height: 15, cursor: "pointer" }} />
            <span style={{ fontSize: 12, color: C.muted }}>Select all on this page</span>
          </div>

          {paginated.map((order) => (
            <div
              key={order.id}
              style={{
                background: C.base,
                border: expandedId === order.id ? `1.5px solid ${C.red}` : `1px solid rgba(253, 246, 237, 0.6)`,
                borderRadius: 16,
                overflow: "hidden",
                transition: "all 0.2s ease",
                boxShadow: expandedId === order.id ? nm.raised : nm.raisedSm,
              }}
            >
              {/* Row header */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px" }}>
                <input
                  type="checkbox"
                  checked={selected.has(order.id)}
                  onChange={() => toggleSelect(order.id)}
                  onClick={(e) => e.stopPropagation()}
                  style={{ width: 15, height: 15, cursor: "pointer", flexShrink: 0 }}
                />
                <div
                  role="button"
                  tabIndex={0}
                  style={{ flex: 1, display: "grid", gridTemplateColumns: "minmax(200px,1fr) 160px 90px 110px 32px", gap: 12, alignItems: "center", background: "none", border: "none", cursor: "pointer", textAlign: "left", fontFamily: "var(--font-outfit), sans-serif", padding: 0 }}
                  onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setExpandedId(expandedId === order.id ? null : order.id); }}
                >
                  {/* Order ID + Customer */}
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontFamily: "monospace", fontSize: 11, color: C.muted, userSelect: "text" }}>{order.id}</span>
                      <CopyBtn text={order.id} />
                    </div>
                    <p style={{ margin: "3px 0 0", fontWeight: 700, color: C.text, fontSize: 14 }}>{order.customer.name}</p>
                    <p style={{ margin: "2px 0 0", fontSize: 11, color: C.muted }}>{order.customer.phone} · {fmtDate(order.date)}</p>
                  </div>
                  {/* Payment */}
                  <div>
                    <span style={{ fontSize: 11, color: C.muted }}>
                      {order.paymentMethod ?? "COD"} &nbsp;
                      <span style={{ color: order.paymentStatus === "Paid" ? "#15803d" : "#b45309", fontWeight: 600 }}>
                        {order.paymentStatus ?? "Pending"}
                      </span>
                    </span>
                    {order.courierName && <p style={{ margin: "3px 0 0", fontSize: 11, color: C.muted }}>🚚 {order.courierName} {order.trackingId ? `· ${order.trackingId}` : ""}</p>}
                  </div>
                  {/* Total */}
                  <p style={{ margin: 0, fontWeight: 800, color: C.red, fontSize: 15 }}>{fmtINR(order.total)}</p>
                  {/* Status */}
                  <StatusBadge status={order.status} />
                  {/* Chevron */}
                  {expandedId === order.id ? <ChevronUp style={{ width: 16, height: 16, color: C.muted }} /> : <ChevronDown style={{ width: 16, height: 16, color: C.muted }} />}
                </div>
              </div>

              {/* Expanded detail */}
              {expandedId === order.id && (
                <div style={{ borderTop: `1px solid ${C.border}` }}>
                  <OrderDetail order={order} onStatusUpdate={onStatusUpdate} onPatch={onPatch} />
                </div>
              )}
            </div>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 8 }}>
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} style={{ padding: "7px 14px", border: `1px solid ${C.border}`, borderRadius: 8, background: C.surface, color: C.text, cursor: page === 1 ? "not-allowed" : "pointer", fontSize: 13, fontWeight: 600, fontFamily: "var(--font-outfit), sans-serif" }}>← Prev</button>
              {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                const p = totalPages <= 7 ? i + 1 : page <= 4 ? i + 1 : page >= totalPages - 3 ? totalPages - 6 + i : page - 3 + i;
                return (
                  <button key={p} onClick={() => setPage(p)} style={{ padding: "7px 12px", border: `1px solid ${p === page ? C.red : C.border}`, borderRadius: 8, background: p === page ? C.red : C.surface, color: p === page ? "white" : C.text, cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "var(--font-outfit), sans-serif" }}>{p}</button>
                );
              })}
              <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} style={{ padding: "7px 14px", border: `1px solid ${C.border}`, borderRadius: 8, background: C.surface, color: C.text, cursor: page === totalPages ? "not-allowed" : "pointer", fontSize: 13, fontWeight: 600, fontFamily: "var(--font-outfit), sans-serif" }}>Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
