"use client";

import { useMemo, useState, useEffect } from "react";
import type { Order, Product } from "@/types";
import {
  IndianRupee, ShoppingCart, Users, AlertCircle,
  TrendingUp, Package, ShoppingBag, ArrowUpRight,
} from "lucide-react";
import { C, nm } from "./AdminShell";
import type { AdminTab } from "./AdminShell";

function fmtINR(n: number) { return "₹" + Math.round(n).toLocaleString("en-IN"); }
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

const ic = (size = 16) => ({ width: size, height: size, strokeWidth: 1.6 });

type DayRange = 7 | 30 | 90;

interface Props { orders: Order[]; products: Product[]; onNavTo: (tab: AdminTab) => void; }

const STATUS_CONFIG: Record<string, { bg: string; color: string }> = {
  Pending:   { bg: "#FEF3C7", color: "#92400E" },
  Confirmed: { bg: "#DBEAFE", color: "#1E40AF" },
  Packed:    { bg: "#EDE9FE", color: "#5B21B6" },
  Shipped:   { bg: "#E0F2FE", color: "#075985" },
  Delivered: { bg: "#DCFCE7", color: "#14532D" },
  Cancelled: { bg: "#FEE2E2", color: "#7F1D1D" },
  Returned:  { bg: "#FEF9C3", color: "#713F12" },
};

export function DashboardTab({ orders, products, onNavTo }: Props) {
  const [chartDays, setChartDays] = useState<DayRange>(30);
  const [costingSummary, setCostingSummary] = useState<{
    estimatedGrossProfit: number; overallGrossMargin: number;
    totalCOGS: number; missingCount: number;
  } | null>(null);

  useEffect(() => {
    fetch("/api/costing/dashboard?range=30days")
      .then((r) => r.json())
      .then((d) => {
        if (d && !d.error) setCostingSummary({
          estimatedGrossProfit: d.estimatedGrossProfit,
          overallGrossMargin: d.overallGrossMargin,
          totalCOGS: d.totalCOGS,
          missingCount: d.productsMissingCost?.length || 0,
        });
      })
      .catch(() => {});
  }, []);

  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const todayOrders = orders.filter((o) => o.date.startsWith(todayStr));
  const todayRevenue = todayOrders.reduce((s, o) => s + o.total, 0);
  const monthOrders = orders.filter((o) => new Date(o.date) >= monthStart);
  const monthRevenue = monthOrders.reduce((s, o) => s + o.total, 0);
  const prevMonthRev = orders
    .filter((o) => new Date(o.date) >= prevMonthStart && new Date(o.date) < monthStart)
    .reduce((s, o) => s + o.total, 0);
  const growth = prevMonthRev > 0 ? ((monthRevenue - prevMonthRev) / prevMonthRev) * 100 : null;
  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
  const totalCustomers = new Set(orders.map((o) => o.customer.phone)).size;
  const pendingOrders = orders.filter((o) => o.status === "Pending");
  const lowStock = products.filter((p) => p.stock !== undefined && p.lowStockThreshold !== undefined && p.stock <= p.lowStockThreshold);

  const newCustomers = useMemo(() => {
    const s = new Set<string>();
    monthOrders.forEach((o) => s.add(o.customer.phone));
    return s.size;
  }, [monthOrders]);

  const chartData = useMemo(() => {
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - chartDays);
    const map: Record<string, number> = {};
    orders.filter((o) => new Date(o.date) >= cutoff).forEach((o) => {
      const d = o.date.slice(0, 10); map[d] = (map[d] || 0) + o.total;
    });
    const result: { date: string; revenue: number }[] = [];
    for (let i = chartDays - 1; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      result.push({ date: key, revenue: map[key] || 0 });
    }
    return result;
  }, [orders, chartDays]);
  const maxRev = Math.max(...chartData.map((d) => d.revenue), 1);

  const topProducts = useMemo(() => {
    const map: Record<string, { name: string; qty: number; revenue: number }> = {};
    orders.forEach((o) => o.items.forEach((item) => {
      if (!map[item.id]) map[item.id] = { name: item.name, qty: 0, revenue: 0 };
      map[item.id].qty += item.quantity;
      map[item.id].revenue += item.price * item.quantity;
    }));
    return Object.values(map).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }, [orders]);
  const maxTopRev = topProducts[0]?.revenue || 1;

  const stats = [
    { label: "Today's Revenue", value: fmtINR(todayRevenue), sub: `${todayOrders.length} orders today`, icon: <IndianRupee {...ic()} />, iconColor: C.red },
    { label: "This Month", value: fmtINR(monthRevenue), sub: growth !== null ? `${growth >= 0 ? "+" : ""}${Math.round(growth)}% vs last mo` : `${monthOrders.length} orders`, icon: <TrendingUp {...ic()} />, iconColor: "#16A34A" },
    { label: "Total Revenue", value: fmtINR(totalRevenue), sub: `${orders.length} orders`, icon: <ShoppingCart {...ic()} />, iconColor: C.gold },
    { label: "Pending", value: String(pendingOrders.length), sub: pendingOrders.length > 0 ? "Action required" : "All clear", icon: <AlertCircle {...ic()} />, iconColor: "#D97706", onClick: () => onNavTo("orders") },
    { label: "Customers", value: String(totalCustomers), sub: `+${newCustomers} this month`, icon: <Users {...ic()} />, iconColor: "#4F46E5", onClick: () => onNavTo("customers") },
    { label: "Low Stock", value: String(lowStock.length), sub: lowStock.length > 0 ? "Restock needed" : "Sufficient", icon: <Package {...ic()} />, iconColor: lowStock.length > 0 ? C.red : "#16A34A", onClick: () => onNavTo("inventory") },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* ── Neumorphic Stat Cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 18 }}>
        {stats.map((s, i) => (
          <div
            key={i}
            onClick={s.onClick}
            style={{
              background: C.base,
              borderRadius: 16,
              padding: "20px 22px",
              boxShadow: nm.raised,
              cursor: s.onClick ? "pointer" : "default",
              transition: "all 0.2s ease",
            }}
            onMouseOver={(e) => {
              if (s.onClick) {
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
              }
            }}
            onMouseOut={(e) => {
              if (s.onClick) {
                (e.currentTarget as HTMLDivElement).style.transform = "none";
              }
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <p style={{ margin: 0, fontSize: 11.5, color: C.muted, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase" }}>{s.label}</p>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: C.base,
                boxShadow: nm.raisedSm,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: s.iconColor, flexShrink: 0,
              }}>
                {s.icon}
              </div>
            </div>
            <p style={{ margin: "0 0 6px", fontSize: 24, fontWeight: 800, color: C.text, letterSpacing: "-0.5px" }}>{s.value}</p>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <p style={{ margin: 0, fontSize: 11.5, color: C.muted, fontWeight: 500 }}>{s.sub}</p>
              {s.onClick && <ArrowUpRight size={13} style={{ color: C.muted, marginLeft: "auto", strokeWidth: 2 }} />}
            </div>
          </div>
        ))}
      </div>

      {/* ── Neumorphic Gross Profit Banner ── */}
      {costingSummary && (
        <div
          onClick={() => onNavTo("costing-dashboard")}
          style={{
            background: C.base,
            borderRadius: 18,
            padding: "22px 28px",
            cursor: "pointer",
            boxShadow: nm.raised,
            display: "flex", alignItems: "center", gap: 32, flexWrap: "wrap",
            border: `1px solid rgba(253, 246, 237, 0.4)`,
          }}
        >
          <div>
            <p style={{ margin: 0, fontSize: 11, color: C.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Gross Profit (30d)</p>
            <p style={{ margin: "4px 0 0", fontSize: 22, fontWeight: 800, color: C.text }}>{fmtINR(costingSummary.estimatedGrossProfit)}</p>
          </div>
          <div style={{ width: 2, height: 36, background: C.shadowDark, opacity: 0.35, borderRadius: 2 }} />
          <div>
            <p style={{ margin: 0, fontSize: 11, color: C.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Gross Margin</p>
            <p style={{ margin: "4px 0 0", fontSize: 22, fontWeight: 800, color: costingSummary.overallGrossMargin >= 30 ? "#16A34A" : C.gold }}>
              {costingSummary.overallGrossMargin}%
            </p>
          </div>
          <div style={{ width: 2, height: 36, background: C.shadowDark, opacity: 0.35, borderRadius: 2 }} />
          <div>
            <p style={{ margin: 0, fontSize: 11, color: C.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>COGS</p>
            <p style={{ margin: "4px 0 0", fontSize: 22, fontWeight: 800, color: C.text }}>{fmtINR(costingSummary.totalCOGS)}</p>
          </div>
          {costingSummary.missingCount > 0 && (
            <div style={{
              marginLeft: "auto",
              background: C.base,
              boxShadow: nm.insetSm,
              borderRadius: 10,
              padding: "8px 14px",
              display: "flex", alignItems: "center", gap: 6
            }}>
              <AlertCircle size={14} style={{ color: C.red }} />
              <p style={{ margin: 0, fontSize: 12, color: C.red, fontWeight: 700 }}>{costingSummary.missingCount} products missing cost</p>
            </div>
          )}
          <div style={{
            marginLeft: costingSummary.missingCount > 0 ? 0 : "auto",
            width: 32, height: 32, borderRadius: 10,
            background: C.base, boxShadow: nm.raisedSm,
            display: "flex", alignItems: "center", justifyContent: "center", color: C.red
          }}>
            <ArrowUpRight size={15} style={{ strokeWidth: 2 }} />
          </div>
        </div>
      )}

      {/* ── Neumorphic Revenue Chart ── */}
      <div style={{ background: C.base, borderRadius: 18, padding: "22px 28px", boxShadow: nm.raised }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: C.text }}>Revenue Performance</h3>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: C.muted }}>Daily order totals</p>
          </div>
          <div style={{
            display: "flex", background: C.base, padding: 4, borderRadius: 12,
            boxShadow: nm.insetSm, gap: 4,
          }}>
            {([7, 30, 90] as DayRange[]).map((d) => (
              <button
                key={d}
                onClick={() => setChartDays(d)}
                style={{
                  padding: "5px 12px", borderRadius: 8, border: "none",
                  background: chartDays === d ? C.base : "transparent",
                  color: chartDays === d ? C.red : C.muted,
                  fontSize: 12, fontWeight: chartDays === d ? 800 : 500,
                  cursor: "pointer", fontFamily: "var(--font-outfit), sans-serif",
                  boxShadow: chartDays === d ? nm.raisedSm : "none",
                  transition: "all 0.15s ease",
                }}>
                {d}d
              </button>
            ))}
          </div>
        </div>

        {/* Chart Tray (Inset container) */}
        <div style={{
          background: C.base,
          boxShadow: nm.inset,
          borderRadius: 14,
          padding: "16px 14px 10px",
          display: "flex", alignItems: "flex-end",
          gap: chartDays === 90 ? 2 : 4,
          height: 130,
        }}>
          {chartData.map((d, i) => {
            const h = Math.max((d.revenue / maxRev) * 100, d.revenue > 0 ? 5 : 2);
            return (
              <div
                key={i}
                title={`${d.date}: ${fmtINR(d.revenue)}`}
                style={{
                  flex: 1, display: "flex", flexDirection: "column",
                  alignItems: "center", height: "100%", justifyContent: "flex-end", gap: 4,
                }}
              >
                <div style={{
                  width: "100%",
                  borderRadius: "4px 4px 0 0",
                  height: `${h}%`,
                  background: d.date === todayStr ? C.red : d.revenue > 0 ? "rgba(160,28,44,0.35)" : "rgba(200,184,165,0.4)",
                  boxShadow: d.revenue > 0 ? `0 -1px 3px rgba(160,28,44,0.3)` : "none",
                  transition: "height 0.4s ease",
                }} />
                {(chartDays === 7 || (chartDays === 30 && i % 6 === 0)) && (
                  <span style={{ fontSize: 9, color: C.muted, whiteSpace: "nowrap", fontWeight: 600 }}>
                    {new Date(d.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Bottom Grid ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 20 }}>

        {/* Top Selling Spices (Raised Card) */}
        <div style={{ background: C.base, borderRadius: 18, padding: "22px 26px", boxShadow: nm.raised }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: C.text }}>Top Selling Spices</h3>
            <button
              onClick={() => onNavTo("products")}
              style={{
                display: "flex", alignItems: "center", gap: 4, fontSize: 12,
                color: C.red, fontWeight: 700, background: "none", border: "none",
                cursor: "pointer", fontFamily: "var(--font-outfit), sans-serif",
              }}>
              View all <ArrowUpRight size={13} strokeWidth={2} />
            </button>
          </div>

          {topProducts.length === 0 ? (
            <p style={{ color: C.muted, fontSize: 13, textAlign: "center", padding: "24px 0" }}>No sales data yet</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {topProducts.map((p, i) => (
                <div key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 0 }}>
                      <div style={{
                        width: 20, height: 20, borderRadius: 6,
                        background: C.base, boxShadow: nm.raisedSm,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 10.5, fontWeight: 800, color: i === 0 ? C.red : C.muted, flexShrink: 0
                      }}>
                        {i + 1}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {p.name}
                      </span>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 800, color: C.text, flexShrink: 0, marginLeft: 8 }}>{fmtINR(p.revenue)}</span>
                  </div>

                  {/* Inset progress track */}
                  <div style={{ height: 6, background: C.base, borderRadius: 99, boxShadow: nm.insetSm, overflow: "hidden" }}>
                    <div style={{
                      height: "100%",
                      width: `${(p.revenue / maxTopRev) * 100}%`,
                      background: i === 0 ? `linear-gradient(90deg, ${C.redHover}, ${C.red})` : C.shadowDark,
                      borderRadius: 99,
                      transition: "width 0.5s ease"
                    }} />
                  </div>
                  <p style={{ margin: "5px 0 0", fontSize: 11, color: C.muted, fontWeight: 500 }}>{p.qty} units sold</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Recent Orders */}
          <div style={{ background: C.base, borderRadius: 18, padding: "22px 26px", boxShadow: nm.raised, flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: C.text }}>Recent Orders</h3>
              <button
                onClick={() => onNavTo("orders")}
                style={{
                  display: "flex", alignItems: "center", gap: 4, fontSize: 12,
                  color: C.red, fontWeight: 700, background: "none", border: "none",
                  cursor: "pointer", fontFamily: "var(--font-outfit), sans-serif",
                }}>
                View all <ArrowUpRight size={13} strokeWidth={2} />
              </button>
            </div>

            {orders.length === 0 ? (
              <p style={{ color: C.muted, fontSize: 13, textAlign: "center", padding: "16px 0" }}>No orders recorded yet</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {orders.slice(0, 4).map((o) => {
                  const cfg = STATUS_CONFIG[o.status] || STATUS_CONFIG.Pending;
                  return (
                    <div key={o.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 9,
                        background: C.base, boxShadow: nm.raisedSm,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 12, fontWeight: 800, color: C.red, flexShrink: 0,
                      }}>
                        {o.customer.name.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: C.text }}>{o.customer.name}</p>
                        <p style={{ margin: 0, fontSize: 11, color: C.muted }}>{fmtDate(o.date)}</p>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3 }}>
                        <span style={{ fontSize: 13, fontWeight: 800, color: C.text }}>{fmtINR(o.total)}</span>
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 6,
                          background: cfg.bg, color: cfg.color
                        }}>
                          {o.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Low Stock Warning */}
          {lowStock.length > 0 && (
            <div style={{
              background: C.base,
              borderRadius: 18,
              padding: "18px 22px",
              boxShadow: nm.raised,
              borderLeft: `4px solid ${C.red}`,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <Package size={14} style={{ color: C.red, strokeWidth: 2 }} />
                  <h3 style={{ margin: 0, fontSize: 13.5, fontWeight: 800, color: C.text }}>Low Stock Alert</h3>
                </div>
                <button
                  onClick={() => onNavTo("inventory")}
                  style={{
                    fontSize: 11.5, color: C.red, fontWeight: 700,
                    background: "none", border: "none", cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 3,
                    fontFamily: "var(--font-outfit), sans-serif"
                  }}>
                  Manage <ArrowUpRight size={11} strokeWidth={2} />
                </button>
              </div>
              {lowStock.slice(0, 3).map((p) => (
                <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
                  <span style={{ fontSize: 12, color: C.text, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "70%" }}>
                    {p.name}
                  </span>
                  <span style={{
                    fontSize: 11, fontWeight: 800, color: C.red,
                    background: C.base, boxShadow: nm.insetSm,
                    padding: "2px 8px", borderRadius: 6, flexShrink: 0
                  }}>
                    {p.stock} left
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Pending Orders (Inset Container) ── */}
      {pendingOrders.length > 0 && (
        <div style={{ background: C.base, borderRadius: 18, padding: "20px 24px", boxShadow: nm.raised, overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: C.base, boxShadow: nm.raisedSm,
                display: "flex", alignItems: "center", justifyContent: "center", color: C.red
              }}>
                <ShoppingBag size={14} style={{ strokeWidth: 2 }} />
              </div>
              <h3 style={{ margin: 0, fontSize: 14.5, fontWeight: 800, color: C.text }}>Pending Orders</h3>
              <span style={{
                fontSize: 11, fontWeight: 800,
                background: C.base, boxShadow: nm.insetSm,
                color: C.red, padding: "2px 8px", borderRadius: 6
              }}>
                {pendingOrders.length}
              </span>
            </div>
            <button
              onClick={() => onNavTo("orders")}
              style={{
                fontSize: 12, color: C.red, fontWeight: 700, background: "none",
                border: "none", cursor: "pointer", display: "flex", alignItems: "center",
                gap: 4, fontFamily: "var(--font-outfit), sans-serif"
              }}>
              Manage all <ArrowUpRight size={12} strokeWidth={2} />
            </button>
          </div>

          <div style={{
            background: C.base,
            boxShadow: nm.inset,
            borderRadius: 14,
            overflowX: "auto",
            padding: "8px 12px",
          }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr>
                  {["Customer", "Phone", "Amount", "Date", "Payment"].map((h) => (
                    <th key={h} style={{ padding: "10px 14px", textAlign: "left", color: C.muted, fontWeight: 700, fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pendingOrders.slice(0, 8).map((o) => (
                  <tr key={o.id} style={{ borderTop: `1px solid rgba(200, 184, 165, 0.3)` }}>
                    <td style={{ padding: "12px 14px", fontWeight: 700, color: C.text }}>{o.customer.name}</td>
                    <td style={{ padding: "12px 14px", color: C.muted, fontSize: 12, fontFamily: "monospace" }}>{o.customer.phone}</td>
                    <td style={{ padding: "12px 14px", fontWeight: 800, color: C.text }}>{fmtINR(o.total)}</td>
                    <td style={{ padding: "12px 14px", color: C.muted, fontSize: 12 }}>{fmtDate(o.date)}</td>
                    <td style={{ padding: "12px 14px" }}>
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 6,
                        background: o.paymentMethod === "Online" ? "#DCFCE7" : "#FEF3C7",
                        color: o.paymentMethod === "Online" ? "#14532D" : "#92400E",
                      }}>
                        {o.paymentMethod ?? "COD"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
