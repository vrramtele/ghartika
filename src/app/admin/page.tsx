"use client";

import { useState, useMemo, useEffect } from "react";
import { useOrders, OrderStatus } from "@/context/OrderContext";
import { Product } from "@/data/products";
import { useProducts } from "@/context/ProductContext";
import {
  Package, ShoppingBag, Users, TrendingUp,
  ChevronDown, ChevronUp, Search, Filter,
  Phone, Mail, MapPin, Clock, CheckCircle2,
  Truck, XCircle, AlertCircle, BarChart2,
  ArrowUpRight, RefreshCw, LogOut, Lock,
  Eye, EyeOff, Store, Plus, Trash2, Edit3,
  Save, X, IndianRupee, ShoppingCart
} from "lucide-react";

// ── Constants ──────────────────────────────────────────────────────────────────
const ADMIN_PASSWORD = "admin123";

// Website Theme Colors
const BRAND_RED = "#A01C2C";
const BRAND_RED_HOVER = "#7B1521";
const BRAND_GOLD = "#B8860B";
const BG_MAIN = "#FEFCF8";
const BG_SURFACE = "#FFFFFF";
const TEXT_PRIMARY = "#1A1008";
const TEXT_MUTED = "#9A8570";
const BORDER_COLOR = "#E8DDD0";

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  Pending:    { label: "Pending",    color: "#b45309", bg: "#fef3c7", border: "#fde68a", icon: <Clock className="w-3.5 h-3.5" /> },
  Processing: { label: "Processing", color: "#1d4ed8", bg: "#dbeafe", border: "#bfdbfe", icon: <RefreshCw className="w-3.5 h-3.5" /> },
  Shipped:    { label: "Shipped",    color: "#6d28d9", bg: "#ede9fe", border: "#ddd6fe", icon: <Truck className="w-3.5 h-3.5" /> },
  Delivered:  { label: "Delivered",  color: "#15803d", bg: "#dcfce7", border: "#bbf7d0", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  Cancelled:  { label: "Cancelled",  color: "#b91c1c", bg: "#fee2e2", border: "#fecaca", icon: <XCircle className="w-3.5 h-3.5" /> },
};

const ALL_STATUSES: OrderStatus[] = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

// ── Sub-components ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: OrderStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "6px",
      padding: "4px 10px", borderRadius: "99px", fontSize: "12px",
      fontWeight: 600, color: cfg.color, backgroundColor: cfg.bg,
      border: `1px solid ${cfg.border}`
    }}>
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

// ── Login Screen ───────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [shaking, setShaking] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", password }),
      });
      if (res.ok) {
        onLogin();
      } else {
        setError("Galat password! Dobara try karo.");
        setShaking(true);
        setTimeout(() => setShaking(false), 600);
        setPassword("");
      }
    } catch {
      setError("Server error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: BG_MAIN,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "var(--font-outfit), sans-serif",
    }}>
      <div style={{
        background: BG_SURFACE,
        border: `1px solid ${BORDER_COLOR}`,
        borderRadius: "24px",
        padding: "48px",
        width: "100%",
        maxWidth: "420px",
        boxShadow: "0 10px 40px rgba(160,28,44,0.08)",
        position: "relative",
        animation: shaking ? "shake 0.5s ease-in-out" : "none",
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{
            width: "64px", height: "64px", borderRadius: "16px",
            background: BRAND_RED,
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px",
            boxShadow: `0 8px 24px rgba(160,28,44,0.2)`,
          }}>
            <Lock style={{ width: "28px", height: "28px", color: "white" }} />
          </div>
          <h1 style={{ color: TEXT_PRIMARY, fontSize: "28px", fontWeight: 800, margin: 0 }}>
            Ghartika
            <span style={{ color: BRAND_RED, marginLeft: "6px" }}>Admin</span>
          </h1>
          <p style={{ color: TEXT_MUTED, fontSize: "14px", marginTop: "6px" }}>
            Secure Dashboard Login
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <label style={{ color: TEXT_PRIMARY, fontSize: "13px", fontWeight: 600, display: "block", marginBottom: "8px" }}>
              Admin Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPwd ? "text" : "password"}
                value={password}
                onChange={e => { setPassword(e.target.value); setError(""); }}
                placeholder="••••••••"
                autoFocus
                style={{
                  width: "100%",
                  padding: "14px 48px 14px 16px",
                  background: BG_MAIN,
                  border: error ? `1px solid ${BRAND_RED}` : `1px solid ${BORDER_COLOR}`,
                  borderRadius: "12px",
                  color: TEXT_PRIMARY,
                  fontSize: "15px",
                  outline: "none",
                  boxSizing: "border-box",
                  fontFamily: "var(--font-outfit), sans-serif",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                style={{
                  position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer", color: TEXT_MUTED, padding: 0,
                }}
              >
                {showPwd ? <EyeOff style={{ width: "18px", height: "18px" }} /> : <Eye style={{ width: "18px", height: "18px" }} />}
              </button>
            </div>
            {error && (
              <p style={{ color: BRAND_RED, fontSize: "13px", marginTop: "8px", display: "flex", alignItems: "center", gap: "6px", fontWeight: 500 }}>
                <AlertCircle style={{ width: "14px", height: "14px" }} /> {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              background: loading ? BRAND_RED_HOVER : BRAND_RED,
              border: "none",
              borderRadius: "12px",
              color: "white",
              fontSize: "15px",
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: `0 4px 15px rgba(160,28,44,0.3)`,
              transition: "background 0.2s, transform 0.1s",
              fontFamily: "var(--font-outfit), sans-serif",
              opacity: loading ? 0.8 : 1,
            }}
            onMouseOver={e => { if (!loading) (e.target as HTMLButtonElement).style.background = BRAND_RED_HOVER; }}
            onMouseOut={e => { if (!loading) (e.target as HTMLButtonElement).style.background = BRAND_RED; }}
          >
            {loading ? "Logging in..." : "Login to Dashboard"}
          </button>
        </form>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-10px); }
          40%, 80% { transform: translateX(10px); }
        }
      `}</style>
    </div>
  );
}

// ── Products Manager ────────────────────────────────────────────────────────────
function ProductsTab() {
  const { products: prods, addProduct, updateProduct, deleteProduct } = useProducts();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const emptyProduct: Omit<Product, "id"> = {
    name: "", price: 0, weight: "", category: "Everyday Essentials",
    image: "/images/red-chili.jpg", description: "", badge: "",
  };
  const [form, setForm] = useState<Omit<Product, "id">>(emptyProduct);

  const handleEdit = (p: Product) => {
    setEditingId(p.id);
    setForm({ name: p.name, price: p.price, weight: p.weight, category: p.category, image: p.image, description: p.description, badge: p.badge || "" });
    setShowAdd(false);
  };

  const handleSave = async (id: string) => {
    await updateProduct(id, form);
    setEditingId(null);
  };

  const handleAdd = async () => {
    await addProduct(form);
    setShowAdd(false);
    setForm(emptyProduct);
  };

  const handleDelete = async (id: string) => {
    await deleteProduct(id);
    setDeleteConfirm(null);
  };

  const categories = ["Everyday Essentials", "Premium Blends", "Combos"];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 700, color: TEXT_PRIMARY }}>Products Inventory</h2>
          <p style={{ margin: "4px 0 0", color: TEXT_MUTED, fontSize: "14px" }}>{prods.length} products total</p>
        </div>
        <button
          onClick={() => { setShowAdd(!showAdd); setEditingId(null); setForm(emptyProduct); }}
          style={{
            display: "flex", alignItems: "center", gap: "8px",
            padding: "10px 20px", background: BRAND_RED,
            border: "none", borderRadius: "10px", color: "white", fontWeight: 600,
            cursor: "pointer", fontSize: "14px", fontFamily: "var(--font-outfit), sans-serif",
          }}
        >
          <Plus style={{ width: "16px", height: "16px" }} />
          Add Product
        </button>
      </div>

      {showAdd && (
        <div style={{
          background: BG_MAIN, border: `1px solid ${BRAND_RED}`, borderRadius: "16px", padding: "24px", marginBottom: "20px",
        }}>
          <h3 style={{ margin: "0 0 16px", fontSize: "16px", fontWeight: 700, color: TEXT_PRIMARY }}>
            ✨ New Product
          </h3>
          <ProductForm form={form} setForm={setForm} categories={categories} />
          <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
            <button onClick={handleAdd} style={btnStyle("green")}>
              <Save style={{ width: "14px", height: "14px" }} /> Save
            </button>
            <button onClick={() => setShowAdd(false)} style={btnStyle("gray")}>
              <X style={{ width: "14px", height: "14px" }} /> Cancel
            </button>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gap: "12px" }}>
        {prods.map(p => (
          <div key={p.id} style={{
            background: BG_SURFACE, border: `1px solid ${BORDER_COLOR}`, borderRadius: "16px",
            overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
          }}>
            {editingId === p.id ? (
              <div style={{ padding: "20px" }}>
                <h4 style={{ margin: "0 0 16px", fontSize: "15px", fontWeight: 600, color: TEXT_PRIMARY }}>
                  ✏️ Edit: {p.name}
                </h4>
                <ProductForm form={form} setForm={setForm} categories={categories} />
                <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
                  <button onClick={() => handleSave(p.id)} style={btnStyle("green")}>
                    <Save style={{ width: "14px", height: "14px" }} /> Save
                  </button>
                  <button onClick={() => setEditingId(null)} style={btnStyle("gray")}>
                    <X style={{ width: "14px", height: "14px" }} /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: "16px", padding: "16px 20px" }}>
                <div style={{
                  width: "52px", height: "52px", borderRadius: "12px",
                  background: BG_MAIN, border: `1px solid ${BORDER_COLOR}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "24px", flexShrink: 0,
                }}>
                  🌶️
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 700, color: TEXT_PRIMARY, fontSize: "15px" }}>{p.name}</span>
                    {p.badge && (
                      <span style={{ fontSize: "11px", background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a", padding: "2px 8px", borderRadius: "99px", fontWeight: 600 }}>
                        {p.badge}
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: "16px", marginTop: "4px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "13px", color: TEXT_MUTED }}>📦 {p.weight}</span>
                    <span style={{ fontSize: "13px", color: TEXT_MUTED }}>🏷️ {p.category}</span>
                    <span style={{ fontSize: "14px", fontWeight: 700, color: BRAND_RED }}>₹{p.price}</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={() => handleEdit(p)} style={btnStyle("gray")}>
                    <Edit3 style={{ width: "13px", height: "13px" }} /> Edit
                  </button>
                  {deleteConfirm === p.id ? (
                    <>
                      <button onClick={() => handleDelete(p.id)} style={btnStyle("red")}>Confirm?</button>
                      <button onClick={() => setDeleteConfirm(null)} style={btnStyle("gray")}>
                        <X style={{ width: "14px", height: "14px" }} />
                      </button>
                    </>
                  ) : (
                    <button onClick={() => setDeleteConfirm(p.id)} style={{ padding: "8px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", cursor: "pointer", fontFamily: "var(--font-outfit), sans-serif" }}>
                      <Trash2 style={{ width: "14px", height: "14px", color: "#dc2626" }} />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ProductForm({ form, setForm, categories }: {
  form: Omit<Product, "id">;
  setForm: React.Dispatch<React.SetStateAction<Omit<Product, "id">>>;
  categories: string[];
}) {
  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 12px", border: `1px solid ${BORDER_COLOR}`,
    borderRadius: "8px", fontSize: "14px", outline: "none",
    fontFamily: "var(--font-outfit), sans-serif", boxSizing: "border-box",
    color: TEXT_PRIMARY, background: BG_MAIN,
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
      <div style={{ gridColumn: "1 / -1" }}>
        <label style={labelStyle}>Product Name</label>
        <input style={inputStyle} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Red Chilli Powder" />
      </div>
      <div>
        <label style={labelStyle}>Price (₹)</label>
        <input style={inputStyle} type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: +e.target.value }))} placeholder="150" />
      </div>
      <div>
        <label style={labelStyle}>Weight</label>
        <input style={inputStyle} value={form.weight} onChange={e => setForm(f => ({ ...f, weight: e.target.value }))} placeholder="250g" />
      </div>
      <div>
        <label style={labelStyle}>Category</label>
        <select style={inputStyle} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div>
        <label style={labelStyle}>Badge (optional)</label>
        <input style={inputStyle} value={form.badge || ""} onChange={e => setForm(f => ({ ...f, badge: e.target.value }))} placeholder="🔥 Best Seller" />
      </div>
      <div style={{ gridColumn: "1 / -1" }}>
        <label style={labelStyle}>Description</label>
        <textarea
          style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }}
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          placeholder="Product description..."
        />
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: "12px", fontWeight: 600, color: TEXT_MUTED,
  marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px",
};

function btnStyle(variant: "green" | "gray" | "red"): React.CSSProperties {
  const variants = {
    green: { background: "#dcfce7", border: "1px solid #86efac", color: "#15803d" },
    gray:  { background: BG_MAIN, border: `1px solid ${BORDER_COLOR}`, color: TEXT_PRIMARY },
    red:   { background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626" },
  };
  return {
    display: "flex", alignItems: "center", gap: "6px",
    padding: "9px 16px", borderRadius: "8px",
    fontSize: "13px", fontWeight: 600, cursor: "pointer",
    fontFamily: "var(--font-outfit), sans-serif",
    ...variants[variant],
  };
}

// ── Analytics Tab ──────────────────────────────────────────────────────────────
function AnalyticsTab({ orders }: { orders: ReturnType<typeof useOrders>["orders"] }) {
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    ALL_STATUSES.forEach(s => { counts[s] = 0; });
    orders.forEach(o => { counts[o.status] = (counts[o.status] || 0) + 1; });
    return counts;
  }, [orders]);

  const productRevenue = useMemo(() => {
    const map: Record<string, { name: string; quantity: number; revenue: number }> = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        if (!map[item.id]) map[item.id] = { name: item.name, quantity: 0, revenue: 0 };
        map[item.id].quantity += item.quantity;
        map[item.id].revenue += item.price * item.quantity;
      });
    });
    return Object.values(map).sort((a, b) => b.revenue - a.revenue);
  }, [orders]);

  const dailyRevenue = useMemo(() => {
    const map: Record<string, number> = {};
    orders.forEach(o => {
      const date = new Date(o.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
      map[date] = (map[date] || 0) + o.total;
    });
    return Object.entries(map).slice(-7).map(([date, revenue]) => ({ date, revenue }));
  }, [orders]);

  const maxRevenue = Math.max(...dailyRevenue.map(d => d.revenue), 1);
  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
  const avgOrderValue = orders.length ? Math.round(totalRevenue / orders.length) : 0;
  const deliveredRevenue = orders.filter(o => o.status === "Delivered").reduce((s, o) => s + o.total, 0);

  return (
    <div style={{ display: "grid", gap: "20px" }}>
      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" }}>
        {[
          { label: "Total Revenue", value: `₹${totalRevenue.toLocaleString("en-IN")}`, icon: "💰", color: BRAND_RED },
          { label: "Avg Order", value: `₹${avgOrderValue}`, icon: "📊", color: BRAND_GOLD },
          { label: "Delivered", value: `₹${deliveredRevenue.toLocaleString("en-IN")}`, icon: "✅", color: "#15803d" },
          { label: "Pending", value: statusCounts["Pending"].toString(), icon: "⏳", color: "#b45309" },
        ].map((card, i) => (
          <div key={i} style={{
            background: BG_SURFACE, border: `1px solid ${BORDER_COLOR}`, borderRadius: "16px",
            padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
          }}>
            <div style={{ fontSize: "28px", marginBottom: "8px" }}>{card.icon}</div>
            <p style={{ margin: 0, fontSize: "13px", color: TEXT_MUTED, fontWeight: 600 }}>{card.label}</p>
            <p style={{ margin: "4px 0 0", fontSize: "22px", fontWeight: 800, color: card.color }}>{card.value}</p>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        {/* Order Status Distribution */}
        <div style={{ background: BG_SURFACE, border: `1px solid ${BORDER_COLOR}`, borderRadius: "16px", padding: "24px" }}>
          <h3 style={{ margin: "0 0 20px", fontSize: "16px", fontWeight: 700, color: TEXT_PRIMARY }}>Order Status</h3>
          {ALL_STATUSES.map(status => {
            const count = statusCounts[status];
            const pct = orders.length ? (count / orders.length) * 100 : 0;
            return (
              <div key={status} style={{ marginBottom: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: TEXT_PRIMARY }}>{status}</span>
                  <span style={{ fontSize: "13px", color: TEXT_MUTED }}>{count} orders</span>
                </div>
                <div style={{ height: "8px", background: BG_MAIN, borderRadius: "99px", overflow: "hidden" }}>
                  <div style={{
                    height: "100%", width: `${pct}%`, borderRadius: "99px",
                    background: STATUS_CONFIG[status].color, transition: "width 0.6s ease",
                  }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Revenue Bar Chart */}
        <div style={{ background: BG_SURFACE, border: `1px solid ${BORDER_COLOR}`, borderRadius: "16px", padding: "24px" }}>
          <h3 style={{ margin: "0 0 20px", fontSize: "16px", fontWeight: 700, color: TEXT_PRIMARY }}>Daily Revenue</h3>
          {dailyRevenue.length === 0 ? (
            <div style={{ textAlign: "center", color: TEXT_MUTED, fontSize: "14px", marginTop: "40px" }}>
              <BarChart2 style={{ width: "40px", height: "40px", margin: "0 auto 8px", opacity: 0.3 }} />
              <p>Koi data nahi abhi</p>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", height: "140px", padding: "0 0 8px" }}>
              {dailyRevenue.map((d, i) => (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                  <div style={{ fontSize: "10px", color: TEXT_MUTED, fontWeight: 600 }}>
                    ₹{d.revenue > 999 ? Math.round(d.revenue / 1000) + "k" : d.revenue}
                  </div>
                  <div style={{
                    width: "100%", borderRadius: "6px 6px 0 0",
                    height: `${(d.revenue / maxRevenue) * 100}px`,
                    background: BRAND_RED, minHeight: "4px",
                    transition: "height 0.5s ease",
                  }} />
                  <div style={{ fontSize: "10px", color: TEXT_MUTED, textAlign: "center", whiteSpace: "nowrap" }}>{d.date}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Top Products */}
      <div style={{ background: BG_SURFACE, border: `1px solid ${BORDER_COLOR}`, borderRadius: "16px", padding: "24px" }}>
        <h3 style={{ margin: "0 0 20px", fontSize: "16px", fontWeight: 700, color: TEXT_PRIMARY }}>🏆 Top Products</h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
            <thead>
              <tr style={{ background: BG_MAIN }}>
                {["Rank", "Product", "Qty Sold", "Revenue"].map(h => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", color: TEXT_MUTED, fontWeight: 600, fontSize: "12px", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {productRevenue.map((p, i) => (
                <tr key={i} style={{ borderTop: `1px solid ${BORDER_COLOR}` }}>
                  <td style={{ padding: "12px 16px", fontWeight: 700, color: i === 0 ? BRAND_GOLD : TEXT_MUTED }}>#{i + 1}</td>
                  <td style={{ padding: "12px 16px", fontWeight: 600, color: TEXT_PRIMARY }}>{p.name}</td>
                  <td style={{ padding: "12px 16px", color: TEXT_MUTED }}>{p.quantity} units</td>
                  <td style={{ padding: "12px 16px", fontWeight: 700, color: BRAND_RED }}>₹{p.revenue.toLocaleString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { orders, updateOrderStatus, isLoading: ordersLoading } = useOrders();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "All">("All");

  // Fix hydration mismatch + check JWT cookie via API
  useEffect(() => {
    setMounted(true);
    fetch("/api/admin/auth")
      .then((r) => r.json())
      .then((d) => { if (d.loggedIn) setIsLoggedIn(true); })
      .catch(() => {});
  }, []);

  if (!mounted) return null; // Avoid rendering until hydrated

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = async () => {
    await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" }),
    });
    setIsLoggedIn(false);
  };

  const handleStatusUpdate = async (orderId: string, status: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, status);
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Status update failed. Please try again.");
    }
  };

  if (!isLoggedIn) return <LoginScreen onLogin={handleLogin} />;

  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
  const totalCustomers = new Set(orders.map(o => o.customer.phone)).size;
  const pendingOrders = orders.filter(o => o.status === "Pending").length;

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      !searchQuery ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.phone.includes(searchQuery);
    const matchesStatus = statusFilter === "All" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const customers = (() => {
    const map: Record<string, { info: typeof orders[0]["customer"]; orders: typeof orders; totalSpent: number }> = {};
    for (const order of orders) {
      const key = order.customer.phone;
      if (!map[key]) map[key] = { info: order.customer, orders: [], totalSpent: 0 };
      map[key].orders.push(order);
      map[key].totalSpent += order.total;
    }
    return Object.values(map);
  })();

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
  });

  const navItems = [
    { id: "dashboard", label: "Dashboard",  icon: <BarChart2 className="w-4 h-4" />,    badge: null },
    { id: "analytics", label: "Analytics",  icon: <TrendingUp className="w-4 h-4" />,   badge: null },
    { id: "orders",    label: "Orders",     icon: <ShoppingBag className="w-4 h-4" />,  badge: pendingOrders > 0 ? pendingOrders : null },
    { id: "customers", label: "Customers",  icon: <Users className="w-4 h-4" />,        badge: null },
    { id: "products",  label: "Products",   icon: <Package className="w-4 h-4" />,      badge: null },
  ];

  const tabLabels: Record<string, string> = {
    dashboard: "Dashboard", analytics: "Analytics",
    orders: "Orders", customers: "Customers", products: "Products",
  };

  return (
    <div style={{ minHeight: "100vh", background: BG_MAIN, display: "flex", fontFamily: "var(--font-outfit), sans-serif" }}>
      {/* ── Sidebar ── */}
      <aside style={{
        width: "240px", background: BG_SURFACE, borderRight: `1px solid ${BORDER_COLOR}`,
        display: "flex", flexDirection: "column", position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 50,
      }}>
        {/* Logo */}
        <div style={{ padding: "24px 20px", borderBottom: `1px solid ${BORDER_COLOR}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              width: "38px", height: "38px", borderRadius: "10px", background: BRAND_RED,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <span style={{ color: "white", fontWeight: 800, fontSize: "16px" }}>G</span>
            </div>
            <div>
              <p style={{ margin: 0, color: TEXT_PRIMARY, fontWeight: 800, fontSize: "16px", lineHeight: 1 }}>Ghartika</p>
              <p style={{ margin: "3px 0 0", color: TEXT_MUTED, fontSize: "11px" }}>Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: "12px 10px", overflowY: "auto" }}>
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: "10px",
                padding: "10px 14px", borderRadius: "10px", border: "none",
                background: activeTab === item.id ? BG_MAIN : "transparent",
                color: activeTab === item.id ? BRAND_RED : TEXT_MUTED,
                textAlign: "left", cursor: "pointer", fontSize: "14px", fontWeight: 600,
                marginBottom: "2px", transition: "all 0.15s ease",
                fontFamily: "var(--font-outfit), sans-serif",
              }}
              onMouseOver={e => {
                if (activeTab !== item.id) {
                  (e.currentTarget as HTMLButtonElement).style.background = BG_MAIN;
                  (e.currentTarget as HTMLButtonElement).style.color = TEXT_PRIMARY;
                }
              }}
              onMouseOut={e => {
                if (activeTab !== item.id) {
                  (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                  (e.currentTarget as HTMLButtonElement).style.color = TEXT_MUTED;
                }
              }}
            >
              {item.icon}
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge && (
                <span style={{
                  background: BRAND_RED, color: "white", fontSize: "11px", fontWeight: 700,
                  borderRadius: "99px", padding: "1px 7px", minWidth: "20px", textAlign: "center",
                }}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Footer links */}
        <div style={{ padding: "12px 10px", borderTop: `1px solid ${BORDER_COLOR}` }}>
          <a
            href="/"
            style={{
              display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px",
              borderRadius: "10px", color: TEXT_MUTED, textDecoration: "none",
              fontSize: "13px", fontWeight: 500, transition: "all 0.15s", marginBottom: "4px",
            }}
          >
            <Store style={{ width: "16px", height: "16px" }} />
            View Store
            <ArrowUpRight style={{ width: "12px", height: "12px", marginLeft: "auto" }} />
          </a>
          <button
            onClick={handleLogout}
            style={{
              width: "100%", display: "flex", alignItems: "center", gap: "10px",
              padding: "10px 14px", borderRadius: "10px", border: "none",
              background: "transparent", color: BRAND_RED,
              cursor: "pointer", fontSize: "13px", fontWeight: 500,
              fontFamily: "var(--font-outfit), sans-serif",
            }}
          >
            <LogOut style={{ width: "16px", height: "16px" }} />
            Logout
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div style={{ flex: 1, marginLeft: "240px", display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        {/* Top Header */}
        <header style={{
          background: BG_SURFACE, borderBottom: `1px solid ${BORDER_COLOR}`,
          padding: "16px 32px", display: "flex", justifyContent: "space-between", alignItems: "center",
          position: "sticky", top: 0, zIndex: 40,
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 800, color: TEXT_PRIMARY }}>
              {tabLabels[activeTab]}
            </h1>
            <p style={{ margin: "2px 0 0", color: TEXT_MUTED, fontSize: "13px" }}>
              Ghartika Spices Admin — {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              padding: "6px 14px", background: "#f0fdf4", border: "1px solid #bbf7d0",
              borderRadius: "99px", fontSize: "13px", fontWeight: 600, color: "#16a34a",
              display: "flex", alignItems: "center", gap: "6px",
            }}>
              <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#22c55e" }} /> Live
            </div>
            <div style={{
              width: "36px", height: "36px", borderRadius: "99px",
              background: BRAND_RED, display: "flex", alignItems: "center", justifyContent: "center",
              color: "white", fontWeight: 800, fontSize: "14px", cursor: "pointer",
            }}>
              A
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, padding: "28px 32px", overflowY: "auto" }}>
          {/* ── DASHBOARD TAB ── */}
          {activeTab === "dashboard" && (
            <div style={{ display: "grid", gap: "24px" }}>
              {/* Stat Cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
                {[
                  { label: "Total Revenue",   value: `₹${totalRevenue.toLocaleString("en-IN")}`, icon: <IndianRupee />, color: BRAND_RED, bg: BG_MAIN },
                  { label: "Total Orders",    value: orders.length.toString(),                     icon: <ShoppingCart />, color: BRAND_GOLD, bg: BG_MAIN },
                  { label: "Pending Orders",  value: pendingOrders.toString(),                     icon: <AlertCircle />, color: "#b45309", bg: BG_MAIN },
                  { label: "Customers",       value: totalCustomers.toString(),                    icon: <Users />,        color: "#6d28d9", bg: BG_MAIN },
                ].map((s, i) => (
                  <div key={i} style={{
                    background: BG_SURFACE, border: `1px solid ${BORDER_COLOR}`, borderRadius: "16px",
                    padding: "20px 24px", display: "flex", alignItems: "center", gap: "16px",
                  }}>
                    <div style={{
                      width: "44px", height: "44px", borderRadius: "12px",
                      background: s.bg, color: s.color, border: `1px solid ${BORDER_COLOR}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      {s.icon}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: "12px", color: TEXT_MUTED, fontWeight: 600, textTransform: "uppercase" }}>{s.label}</p>
                      <p style={{ margin: "4px 0 0", fontSize: "24px", fontWeight: 800, color: TEXT_PRIMARY }}>{s.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent Orders Table */}
              <div style={{ background: BG_SURFACE, border: `1px solid ${BORDER_COLOR}`, borderRadius: "16px", overflow: "hidden" }}>
                <div style={{ padding: "20px 24px", borderBottom: `1px solid ${BORDER_COLOR}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: TEXT_PRIMARY }}>Recent Orders</h3>
                  <button onClick={() => setActiveTab("orders")} style={{
                    display: "flex", alignItems: "center", gap: "6px", fontSize: "13px",
                    color: BRAND_RED, fontWeight: 600, background: "none", border: "none",
                    cursor: "pointer", fontFamily: "var(--font-outfit), sans-serif",
                  }}>
                    Sab Dekho <ArrowUpRight style={{ width: "14px", height: "14px" }} />
                  </button>
                </div>
                {orders.length === 0 ? (
                  <div style={{ padding: "48px", textAlign: "center", color: TEXT_MUTED }}>
                    <ShoppingBag style={{ width: "48px", height: "48px", margin: "0 auto 12px", opacity: 0.3 }} />
                    <p style={{ fontWeight: 600, margin: 0 }}>Koi orders nahi abhi</p>
                  </div>
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                      <thead>
                        <tr style={{ background: BG_MAIN }}>
                          {["Order ID", "Customer", "Date", "Total", "Status"].map(h => (
                            <th key={h} style={{ padding: "12px 20px", textAlign: "left", color: TEXT_MUTED, fontWeight: 600, fontSize: "12px", textTransform: "uppercase" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {orders.slice(0, 5).map(order => (
                          <tr key={order.id} style={{ borderTop: `1px solid ${BORDER_COLOR}` }}>
                            <td style={{ padding: "14px 20px", fontFamily: "monospace", fontSize: "12px", color: TEXT_MUTED }}>{order.id.slice(0, 16)}…</td>
                            <td style={{ padding: "14px 20px", fontWeight: 600, color: TEXT_PRIMARY }}>{order.customer.name}</td>
                            <td style={{ padding: "14px 20px", color: TEXT_MUTED, fontSize: "12px" }}>{formatDate(order.date)}</td>
                            <td style={{ padding: "14px 20px", fontWeight: 700, color: BRAND_RED }}>₹{order.total}</td>
                            <td style={{ padding: "14px 20px" }}><StatusBadge status={order.status} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── ANALYTICS TAB ── */}
          {activeTab === "analytics" && <AnalyticsTab orders={orders} />}

          {/* ── ORDERS TAB ── */}
          {activeTab === "orders" && (
            <div style={{ display: "grid", gap: "16px" }}>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <div style={{ position: "relative", flex: 1, minWidth: "220px" }}>
                  <Search style={{ width: "16px", height: "16px", position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: TEXT_MUTED }} />
                  <input
                    type="text"
                    placeholder="Name, phone, ya order ID..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{
                      width: "100%", padding: "10px 12px 10px 38px",
                      border: `1px solid ${BORDER_COLOR}`, borderRadius: "10px",
                      fontSize: "14px", outline: "none", background: BG_SURFACE,
                      fontFamily: "var(--font-outfit), sans-serif", color: TEXT_PRIMARY,
                      boxSizing: "border-box",
                    }}
                  />
                </div>
                <div style={{ position: "relative" }}>
                  <Filter style={{ width: "14px", height: "14px", position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: TEXT_MUTED }} />
                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value as OrderStatus | "All")}
                    style={{
                      padding: "10px 12px 10px 32px",
                      border: `1px solid ${BORDER_COLOR}`, borderRadius: "10px",
                      fontSize: "14px", outline: "none", background: BG_SURFACE,
                      cursor: "pointer", fontFamily: "var(--font-outfit), sans-serif", color: TEXT_PRIMARY,
                    }}
                  >
                    <option value="All">Sab Status</option>
                    {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {filteredOrders.length === 0 ? (
                <div style={{ background: BG_SURFACE, border: `1px solid ${BORDER_COLOR}`, borderRadius: "16px", padding: "48px", textAlign: "center", color: TEXT_MUTED }}>
                  <ShoppingBag style={{ width: "48px", height: "48px", margin: "0 auto 12px", opacity: 0.3 }} />
                  <p style={{ fontWeight: 600, margin: 0 }}>Koi orders nahi mili</p>
                </div>
              ) : (
                filteredOrders.map(order => (
                  <div key={order.id} style={{ background: BG_SURFACE, border: `1px solid ${BORDER_COLOR}`, borderRadius: "16px", overflow: "hidden" }}>
                    <button
                      style={{
                        width: "100%", padding: "16px 20px", display: "flex", alignItems: "center", gap: "16px",
                        background: "none", border: "none", cursor: "pointer", textAlign: "left",
                        fontFamily: "var(--font-outfit), sans-serif",
                      }}
                      onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                      onMouseOver={e => (e.currentTarget as HTMLButtonElement).style.background = BG_MAIN}
                      onMouseOut={e => (e.currentTarget as HTMLButtonElement).style.background = "transparent"}
                    >
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 100px 120px", gap: "12px", flex: 1, alignItems: "center" }}>
                        <div>
                          <p style={{ margin: 0, fontSize: "11px", color: TEXT_MUTED, textTransform: "uppercase" }}>Order ID</p>
                          <p style={{ margin: "3px 0 0", fontFamily: "monospace", fontSize: "12px", color: TEXT_PRIMARY }}>{order.id.slice(0, 16)}…</p>
                        </div>
                        <div>
                          <p style={{ margin: 0, fontSize: "11px", color: TEXT_MUTED, textTransform: "uppercase" }}>Customer</p>
                          <p style={{ margin: "3px 0 0", fontWeight: 700, color: TEXT_PRIMARY, fontSize: "14px" }}>{order.customer.name}</p>
                        </div>
                        <div>
                          <p style={{ margin: 0, fontSize: "11px", color: TEXT_MUTED, textTransform: "uppercase" }}>Total</p>
                          <p style={{ margin: "3px 0 0", fontWeight: 700, color: BRAND_RED, fontSize: "15px" }}>₹{order.total}</p>
                        </div>
                        <div>
                          <p style={{ margin: 0, fontSize: "11px", color: TEXT_MUTED, textTransform: "uppercase", marginBottom: "3px" }}>Status</p>
                          <StatusBadge status={order.status} />
                        </div>
                      </div>
                      {expandedOrder === order.id ? <ChevronUp style={{ width: "18px", height: "18px", color: TEXT_MUTED }} /> : <ChevronDown style={{ width: "18px", height: "18px", color: TEXT_MUTED }} />}
                    </button>

                    {expandedOrder === order.id && (
                      <div style={{ borderTop: `1px solid ${BORDER_COLOR}`, padding: "20px", display: "grid", gap: "16px" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                          <div style={{ background: BG_MAIN, border: `1px solid ${BORDER_COLOR}`, borderRadius: "12px", padding: "16px" }}>
                            <h4 style={{ margin: "0 0 12px", fontSize: "13px", fontWeight: 700, color: TEXT_PRIMARY, display: "flex", alignItems: "center", gap: "6px" }}>
                              <Users style={{ width: "14px", height: "14px", color: BRAND_RED }} /> Customer Details
                            </h4>
                            <div style={{ display: "grid", gap: "8px", fontSize: "13px" }}>
                              <p style={{ margin: 0, fontWeight: 700, color: TEXT_PRIMARY }}>{order.customer.name}</p>
                              <p style={{ margin: 0, color: TEXT_MUTED, display: "flex", alignItems: "center", gap: "6px" }}><Phone style={{ width: "12px", height: "12px" }} /> {order.customer.phone}</p>
                              {order.customer.email && <p style={{ margin: 0, color: TEXT_MUTED, display: "flex", alignItems: "center", gap: "6px" }}><Mail style={{ width: "12px", height: "12px" }} /> {order.customer.email}</p>}
                              <p style={{ margin: 0, color: TEXT_MUTED, display: "flex", alignItems: "flex-start", gap: "6px" }}><MapPin style={{ width: "12px", height: "12px", flexShrink: 0, marginTop: "2px" }} /><span>{order.customer.address}, {order.customer.city}, {order.customer.state} — {order.customer.pincode}</span></p>
                            </div>
                          </div>

                          <div style={{ background: BG_MAIN, border: `1px solid ${BORDER_COLOR}`, borderRadius: "12px", padding: "16px" }}>
                            <h4 style={{ margin: "0 0 12px", fontSize: "13px", fontWeight: 700, color: TEXT_PRIMARY, display: "flex", alignItems: "center", gap: "6px" }}>
                              <Package style={{ width: "14px", height: "14px", color: BRAND_RED }} /> Items
                            </h4>
                            <div style={{ display: "grid", gap: "8px" }}>
                              {order.items.map(item => (
                                <div key={item.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                                  <span style={{ color: TEXT_PRIMARY }}>{item.name} <span style={{ color: TEXT_MUTED }}>({item.weight}) × {item.quantity}</span></span>
                                  <span style={{ fontWeight: 700, color: TEXT_PRIMARY }}>₹{item.price * item.quantity}</span>
                                </div>
                              ))}
                              <div style={{ borderTop: `1px solid ${BORDER_COLOR}`, paddingTop: "8px", display: "flex", justifyContent: "space-between", fontWeight: 700 }}>
                                <span style={{ color: TEXT_PRIMARY }}>Total</span>
                                <span style={{ color: BRAND_RED }}>₹{order.total}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                          <span style={{ fontSize: "13px", fontWeight: 600, color: TEXT_PRIMARY }}>Update Status:</span>
                          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                            {ALL_STATUSES.map(status => {
                              const cfg = STATUS_CONFIG[status];
                              const isActive = order.status === status;
                              return (
                                <button
                                  key={status}
                                  onClick={() => handleStatusUpdate(order.id, status)}
                                  style={{
                                    padding: "6px 14px", borderRadius: "99px", fontSize: "12px", fontWeight: 600,
                                    cursor: "pointer", fontFamily: "var(--font-outfit), sans-serif",
                                    background: isActive ? cfg.bg : BG_SURFACE,
                                    color: isActive ? cfg.color : TEXT_MUTED,
                                    border: isActive ? `1px solid ${cfg.border}` : `1px solid ${BORDER_COLOR}`,
                                  }}
                                >
                                  {status}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* ── CUSTOMERS TAB ── */}
          {activeTab === "customers" && (
            <div style={{ display: "grid", gap: "16px" }}>
              {customers.length === 0 ? (
                <div style={{ background: BG_SURFACE, border: `1px solid ${BORDER_COLOR}`, borderRadius: "16px", padding: "48px", textAlign: "center", color: TEXT_MUTED }}>
                  <Users style={{ width: "48px", height: "48px", margin: "0 auto 12px", opacity: 0.3 }} />
                  <p style={{ fontWeight: 600, margin: 0 }}>Koi customers nahi abhi</p>
                </div>
              ) : (
                customers.map((customer, i) => (
                  <div key={i} style={{ background: BG_SURFACE, border: `1px solid ${BORDER_COLOR}`, borderRadius: "16px", padding: "20px 24px" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "16px", flexWrap: "wrap" }}>
                      <div style={{
                        width: "52px", height: "52px", borderRadius: "50%", background: BRAND_RED,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "white", fontWeight: 800, fontSize: "20px", flexShrink: 0,
                      }}>
                        {customer.info.name.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontWeight: 800, fontSize: "16px", color: TEXT_PRIMARY }}>{customer.info.name}</p>
                        <div style={{ display: "flex", gap: "16px", marginTop: "6px", flexWrap: "wrap" }}>
                          <span style={{ fontSize: "13px", color: TEXT_MUTED, display: "flex", alignItems: "center", gap: "5px" }}><Phone style={{ width: "12px", height: "12px" }} /> {customer.info.phone}</span>
                          {customer.info.email && <span style={{ fontSize: "13px", color: TEXT_MUTED, display: "flex", alignItems: "center", gap: "5px" }}><Mail style={{ width: "12px", height: "12px" }} /> {customer.info.email}</span>}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "24px" }}>
                        <div style={{ textAlign: "center" }}>
                          <p style={{ margin: 0, fontSize: "24px", fontWeight: 800, color: TEXT_PRIMARY }}>{customer.orders.length}</p>
                          <p style={{ margin: "2px 0 0", fontSize: "11px", color: TEXT_MUTED, fontWeight: 500, textTransform: "uppercase" }}>Orders</p>
                        </div>
                        <div style={{ textAlign: "center" }}>
                          <p style={{ margin: 0, fontSize: "24px", fontWeight: 800, color: BRAND_RED }}>₹{customer.totalSpent}</p>
                          <p style={{ margin: "2px 0 0", fontSize: "11px", color: TEXT_MUTED, fontWeight: 500, textTransform: "uppercase" }}>Spent</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ── PRODUCTS TAB ── */}
          {activeTab === "products" && <ProductsTab />}

        </main>
      </div>
    </div>
  );
}
