"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp, IndianRupee, AlertTriangle,
  CheckCircle2, RefreshCw, Package, Percent, Calculator,
  ArrowRight, TrendingDown, Activity, ShieldAlert,
} from "lucide-react";
import { C, nm, AdminTab } from "./AdminShell";

interface DashboardData {
  range: string;
  totalOrdersCount: number;
  totalGrossSales: number;
  totalCOGS: number;
  estimatedGrossProfit: number;
  overallGrossMargin: number;
  estimatedContributionProfit: number;
  gatewayFees: number;
  missingCostOrderLinesCount: number;
  chartData: { date: string; sales: number; cogs: number; profit: number }[];
  mostProfitable: {
    productId: string; productName: string; unitsSold: number;
    revenue: number; cogs: number; grossProfit: number; marginPercent: number;
  }[];
  highRevLowMargin: {
    productId: string; productName: string; unitsSold: number;
    revenue: number; grossProfit: number; marginPercent: number;
  }[];
  lossMaking: {
    productId: string; productName: string;
    revenue: number; cogs: number; grossProfit: number;
  }[];
  productsMissingCost: { id: string; name: string; price: number; weight: string; category: string; }[];
  configuredProductsCount: number;
  totalProductsCount: number;
}

interface Props { onNavTo?: (tab: AdminTab) => void; }

function fmtINR(n: number) { return "₹" + Math.round(n).toLocaleString("en-IN"); }

const ic = (size = 15) => ({ width: size, height: size, strokeWidth: 1.6 });

function MarginPill({ pct }: { pct: number }) {
  const good = pct >= 40, warn = pct >= 20;
  return (
    <span style={{
      fontSize: 11, fontWeight: 800, padding: "3px 8px", borderRadius: 6,
      background: C.base,
      boxShadow: nm.insetSm,
      color: good ? "#16A34A" : warn ? "#D97706" : C.red,
    }}>
      {pct}% margin
    </span>
  );
}

const RANGES = [
  { id: "today", label: "Today" }, { id: "yesterday", label: "Yesterday" },
  { id: "7days", label: "7 Days" }, { id: "30days", label: "30 Days" },
  { id: "this_month", label: "Month" }, { id: "all", label: "All Time" },
];

export function CostingDashboardTab({ onNavTo }: Props) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("30days");
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = (r = range) => {
    setRefreshing(true);
    fetch(`/api/costing/dashboard?range=${r}`)
      .then((res) => res.json())
      .then((d) => { if (d && !d.error) setData(d); })
      .catch(() => {})
      .finally(() => { setLoading(false); setRefreshing(false); });
  };

  useEffect(() => { fetchDashboard(range); }, [range]);

  if (loading) {
    return (
      <div style={{ padding: 60, textAlign: "center" }}>
        <div style={{
          width: 38, height: 38, borderRadius: "50%",
          background: C.base, boxShadow: nm.raisedSm,
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 14px"
        }}>
          <div style={{
            width: 18, height: 18, border: `2px solid ${C.shadowDark}`,
            borderTopColor: C.red, borderRadius: "50%",
            animation: "nmSpin 0.8s linear infinite"
          }} />
        </div>
        <p style={{ color: C.muted, fontSize: 13, margin: 0, fontWeight: 600 }}>Loading costing dashboard...</p>
        <style>{`@keyframes nmSpin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const maxChartVal = data?.chartData?.length
    ? Math.max(...data.chartData.map((d) => Math.max(d.sales, d.cogs)), 1) : 1;

  const coveragePct = data && data.totalProductsCount > 0
    ? Math.round((data.configuredProductsCount / data.totalProductsCount) * 100) : 100;

  const missingCount = data?.productsMissingCost?.length || 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 14 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: C.text, margin: 0 }}>Costing & Margin Overview</h2>
          <p style={{ color: C.muted, fontSize: 13, margin: "3px 0 0" }}>COGS, contribution profit, and product-level margin analytics</p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Neumorphic Segmented Control */}
          <div style={{
            display: "flex", background: C.base, padding: 4, borderRadius: 12,
            boxShadow: nm.insetSm, gap: 4,
          }}>
            {RANGES.map((r) => (
              <button
                key={r.id}
                onClick={() => setRange(r.id)}
                style={{
                  padding: "6px 12px", border: "none", borderRadius: 8,
                  fontSize: 12, fontWeight: range === r.id ? 800 : 500,
                  background: range === r.id ? C.base : "transparent",
                  color: range === r.id ? C.red : C.muted,
                  cursor: "pointer", fontFamily: "var(--font-outfit), sans-serif",
                  boxShadow: range === r.id ? nm.raisedSm : "none",
                  transition: "all 0.15s ease",
                }}>
                {r.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => fetchDashboard(range)}
            disabled={refreshing}
            style={{
              width: 36, height: 36, borderRadius: 10, border: "none",
              background: C.base, boxShadow: nm.raisedSm,
              cursor: refreshing ? "not-allowed" : "pointer",
              color: C.muted, display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.15s",
            }}
            title="Refresh"
          >
            <RefreshCw {...ic(13)} style={{ animation: refreshing ? "nmSpin 1s linear infinite" : "none" }} />
          </button>
        </div>
      </div>

      {/* ── KPI Cards (Neumorphic Raised) ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 18 }}>
        {/* Gross Sales */}
        <div style={{ background: C.base, borderRadius: 18, padding: "22px", boxShadow: nm.raised }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
            <p style={{ margin: 0, fontSize: 11, color: C.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Gross Sales</p>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: C.base, boxShadow: nm.raisedSm,
              display: "flex", alignItems: "center", justifyContent: "center", color: "#16A34A"
            }}>
              <IndianRupee {...ic(15)} />
            </div>
          </div>
          <p style={{ margin: "0 0 5px", fontSize: 26, fontWeight: 800, color: C.text, letterSpacing: "-0.5px" }}>{fmtINR(data?.totalGrossSales || 0)}</p>
          <p style={{ margin: 0, fontSize: 12, color: C.muted, fontWeight: 500 }}>{data?.totalOrdersCount || 0} orders recorded</p>
        </div>

        {/* COGS */}
        <div style={{ background: C.base, borderRadius: 18, padding: "22px", boxShadow: nm.raised }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
            <p style={{ margin: 0, fontSize: 11, color: C.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Cost of Goods (COGS)</p>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: C.base, boxShadow: nm.raisedSm,
              display: "flex", alignItems: "center", justifyContent: "center", color: C.red
            }}>
              <Package {...ic(15)} />
            </div>
          </div>
          <p style={{ margin: "0 0 5px", fontSize: 26, fontWeight: 800, color: C.text, letterSpacing: "-0.5px" }}>{fmtINR(data?.totalCOGS || 0)}</p>
          <p style={{ margin: 0, fontSize: 12, color: C.muted, fontWeight: 500 }}>Ingredients & packaging</p>
        </div>

        {/* Gross Profit Hero Card */}
        <div style={{
          background: C.base, borderRadius: 18, padding: "22px",
          boxShadow: nm.raised,
          border: `1.5px solid rgba(160, 28, 44, 0.25)`,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
            <p style={{ margin: 0, fontSize: 11, color: C.red, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em" }}>Gross Profit</p>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: C.base, boxShadow: nm.raisedSm,
              display: "flex", alignItems: "center", justifyContent: "center", color: C.red
            }}>
              <TrendingUp {...ic(15)} />
            </div>
          </div>
          <p style={{ margin: "0 0 6px", fontSize: 26, fontWeight: 900, color: C.red, letterSpacing: "-0.5px" }}>{fmtINR(data?.estimatedGrossProfit || 0)}</p>
          <span style={{
            fontSize: 12, fontWeight: 800,
            color: (data?.overallGrossMargin || 0) >= 30 ? "#16A34A" : C.gold,
          }}>
            {data?.overallGrossMargin || 0}% overall margin
          </span>
        </div>

        {/* Contribution Profit */}
        <div style={{ background: C.base, borderRadius: 18, padding: "22px", boxShadow: nm.raised }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
            <p style={{ margin: 0, fontSize: 11, color: C.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Contribution Profit</p>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: C.base, boxShadow: nm.raisedSm,
              display: "flex", alignItems: "center", justifyContent: "center", color: C.gold
            }}>
              <Percent {...ic(15)} />
            </div>
          </div>
          <p style={{ margin: "0 0 5px", fontSize: 26, fontWeight: 800, color: C.text, letterSpacing: "-0.5px" }}>{fmtINR(data?.estimatedContributionProfit || 0)}</p>
          <p style={{ margin: 0, fontSize: 12, color: C.muted, fontWeight: 500 }}>After {fmtINR(data?.gatewayFees || 0)} gateway fees</p>
        </div>
      </div>

      {/* ── Cost Coverage Tracker ── */}
      <div style={{ background: C.base, borderRadius: 18, padding: "18px 24px", boxShadow: nm.raised }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: C.base, boxShadow: nm.raisedSm,
              display: "flex", alignItems: "center", justifyContent: "center", color: C.red
            }}>
              <Calculator {...ic(13)} />
            </div>
            <span style={{ fontSize: 13.5, fontWeight: 700, color: C.text }}>Product Cost Coverage</span>
            <span style={{ fontSize: 13, color: C.muted }}>·</span>
            <span style={{ fontSize: 13.5, fontWeight: 800, color: C.text }}>
              {data?.configuredProductsCount} / {data?.totalProductsCount} configured
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {missingCount > 0
              ? <AlertTriangle {...ic(13)} style={{ color: C.red }} />
              : <CheckCircle2 {...ic(13)} style={{ color: "#16A34A" }} />}
            <span style={{ fontSize: 12, fontWeight: 800, color: missingCount > 0 ? C.red : "#16A34A" }}>
              {coveragePct}% ready
            </span>
            {onNavTo && missingCount > 0 && (
              <button
                onClick={() => onNavTo("product-costing")}
                style={{
                  display: "flex", alignItems: "center", gap: 3,
                  background: "none", border: "none", color: C.red,
                  fontWeight: 800, fontSize: 12, cursor: "pointer", marginLeft: 6
                }}>
                Configure <ArrowRight {...ic(12)} />
              </button>
            )}
          </div>
        </div>

        {/* Inset progress track */}
        <div style={{ height: 8, background: C.base, borderRadius: 99, boxShadow: nm.insetSm, overflow: "hidden" }}>
          <div style={{
            height: "100%", width: `${coveragePct}%`, borderRadius: 99,
            background: coveragePct === 100 ? "#16A34A" : coveragePct > 70 ? C.gold : C.red,
            transition: "width 0.6s ease",
          }} />
        </div>
      </div>

      {/* ── Revenue vs COGS Visual Chart ── */}
      <div style={{ background: C.base, borderRadius: 18, padding: "22px 28px", boxShadow: nm.raised }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: C.text, margin: 0 }}>Revenue vs COGS Trend</h3>
            <p style={{ margin: "3px 0 0", fontSize: 12, color: C.muted }}>Daily net sales compared to product cost of goods</p>
          </div>
          <div style={{ display: "flex", gap: 14, fontSize: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: "#16A34A" }} />
              <span style={{ color: C.muted, fontWeight: 600 }}>Sales</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: C.red }} />
              <span style={{ color: C.muted, fontWeight: 600 }}>COGS</span>
            </div>
          </div>
        </div>

        {/* Inset Chart Tray */}
        <div style={{
          background: C.base,
          boxShadow: nm.inset,
          borderRadius: 14,
          padding: "16px 14px 10px",
          display: "flex", alignItems: "flex-end",
          height: 140, gap: 6,
        }}>
          {data?.chartData && data.chartData.length > 0 ? (
            data.chartData.map((d, i) => {
              const sh = Math.min(100, Math.round((d.sales / maxChartVal) * 100));
              const ch = Math.min(100, Math.round((d.cogs / maxChartVal) * 100));
              return (
                <div
                  key={i}
                  title={`${d.date} · Sales: ${fmtINR(d.sales)} · COGS: ${fmtINR(d.cogs)}`}
                  style={{
                    flex: 1, display: "flex", flexDirection: "column",
                    alignItems: "center", height: "100%", justifyContent: "flex-end", gap: 4
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 2, width: "100%", height: "100%", justifyContent: "center" }}>
                    <div style={{ width: "42%", height: `${Math.max(sh, 4)}%`, background: "#16A34A", borderRadius: "3px 3px 0 0" }} />
                    <div style={{ width: "42%", height: `${Math.max(ch, 4)}%`, background: C.red, borderRadius: "3px 3px 0 0" }} />
                  </div>
                  <span style={{ fontSize: 9, color: C.muted, whiteSpace: "nowrap", fontWeight: 600 }}>{d.date.slice(5)}</span>
                </div>
              );
            })
          ) : (
            <div style={{ width: "100%", textAlign: "center", padding: "40px 0", color: C.muted, fontSize: 13 }}>
              No cost data found for this period.
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom Grid ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

        {/* Top Profit Generators */}
        <div style={{ background: C.base, borderRadius: 18, padding: "22px 26px", boxShadow: nm.raised }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: C.text, margin: "0 0 18px", display: "flex", alignItems: "center", gap: 8 }}>
            <Activity {...ic(14)} style={{ color: C.red }} />
            Top Profit Generators
          </h3>
          {data?.mostProfitable && data.mostProfitable.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {data.mostProfitable.map((p, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "12px 14px", borderRadius: 12, background: C.base,
                    boxShadow: nm.raisedSm,
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 13.5, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {p.productName}
                    </div>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>
                      {p.unitsSold} sold · {fmtINR(p.revenue)} · COGS {fmtINR(p.cogs)}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, marginLeft: 12, flexShrink: 0 }}>
                    <span style={{ fontWeight: 800, fontSize: 14, color: "#16A34A" }}>+{fmtINR(p.grossProfit)}</span>
                    <MarginPill pct={p.marginPercent} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: C.muted, fontSize: 13, textAlign: "center", padding: "24px 0" }}>No profit data yet.</p>
          )}
        </div>

        {/* Missing Cost Alert Card */}
        <div style={{ background: C.base, borderRadius: 18, padding: "22px 26px", boxShadow: nm.raised }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: missingCount > 0 ? C.red : C.text, margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
              {missingCount > 0
                ? <ShieldAlert {...ic(15)} style={{ color: C.red }} />
                : <CheckCircle2 {...ic(15)} style={{ color: "#16A34A" }} />}
              {missingCount > 0 ? `${missingCount} Products Missing Cost` : "100% Costs Configured"}
            </h3>
            {onNavTo && (
              <button
                onClick={() => onNavTo("product-costing")}
                style={{
                  display: "flex", alignItems: "center", gap: 4, background: "none",
                  border: "none", color: C.red, fontWeight: 800, fontSize: 12, cursor: "pointer"
                }}>
                Configure <ArrowRight {...ic(12)} />
              </button>
            )}
          </div>

          {missingCount > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <p style={{ margin: "0 0 6px", fontSize: 12, color: C.muted }}>
                These products do not have verified ingredient/ready cost data:
              </p>
              {data?.productsMissingCost.map((p) => (
                <div
                  key={p.id}
                  style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "10px 14px", borderRadius: 10, background: C.base,
                    boxShadow: nm.insetSm,
                  }}
                >
                  <div>
                    <span style={{ fontWeight: 700, fontSize: 13, color: C.text }}>{p.name}</span>
                    <span style={{ marginLeft: 6, fontSize: 11, color: C.muted }}>({p.weight})</span>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 800, color: C.red }}>
                    Price ₹{p.price} · Cost Missing
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "32px 0" }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: C.base, boxShadow: nm.raisedSm,
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 12px", color: "#16A34A"
              }}>
                <CheckCircle2 size={24} style={{ strokeWidth: 2 }} />
              </div>
              <p style={{ color: C.text, fontSize: 13.5, fontWeight: 700, margin: "0 0 4px" }}>Everything is configured</p>
              <p style={{ color: C.muted, fontSize: 12, margin: 0 }}>All catalog items have authoritative cost profiles.</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Loss-Making Products Alert (Neumorphic Inset Tray) ── */}
      {data?.lossMaking && data.lossMaking.length > 0 && (
        <div style={{
          background: C.base, borderRadius: 18, padding: "20px 24px",
          boxShadow: nm.raised, borderLeft: `4px solid ${C.red}`
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <TrendingDown {...ic(16)} style={{ color: C.red }} />
            <h3 style={{ margin: 0, fontSize: 14.5, fontWeight: 800, color: C.text }}>Loss-Making Products Detected</h3>
            <span style={{
              fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 6,
              background: C.base, boxShadow: nm.insetSm, color: C.red
            }}>
              {data.lossMaking.length}
            </span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
            {data.lossMaking.map((p) => (
              <div
                key={p.productId}
                style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "12px 16px", background: C.base, borderRadius: 12,
                  boxShadow: nm.raisedSm,
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{p.productName}</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: C.red }}>{fmtINR(p.grossProfit)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
