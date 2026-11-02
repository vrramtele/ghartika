"use client";

import { useState, useEffect, useMemo } from "react";
import { useOrders } from "@/context/OrderContext";
import { useProducts } from "@/context/ProductContext";
import type { Order, OrderStatus } from "@/types";
import type { AdminTab } from "./components/AdminShell";
import { AdminShell, C, nm } from "./components/AdminShell";
import { DashboardTab } from "./components/DashboardTab";
import { OrdersTab } from "./components/OrdersTab";
import { ProductsTab } from "./components/ProductsTab";
import { CustomersTab } from "./components/CustomersTab";
import { CouponsTab } from "./components/CouponsTab";
import { AbandonedCartsTab } from "./components/AbandonedCartsTab";
import { ReviewsTab } from "./components/ReviewsTab";
import { StorefrontTab } from "./components/StorefrontTab";
import { InventoryTab } from "./components/InventoryTab";
import { ReportsTab } from "./components/ReportsTab";
import { StaffTab } from "./components/StaffTab";
import { CategoriesTab } from "./components/CategoriesTab";
import { MediaLibraryTab } from "./components/MediaLibraryTab";
import { SuppliersTab } from "./components/SuppliersTab";
import { FinanceTab } from "./components/FinanceTab";
import { SEOTab } from "./components/SEOTab";
import { NotificationsTab } from "./components/NotificationsTab";
import { SettingsTab } from "./components/SettingsTab";
import { HealthTab } from "./components/HealthTab";
import { CostingDashboardTab } from "./components/CostingDashboardTab";
import { ProductCostingTab } from "./components/ProductCostingTab";
import { RawMaterialsTab } from "./components/RawMaterialsTab";
import { RecipesProductionTab } from "./components/RecipesProductionTab";
import { CostHistoryTab } from "./components/CostHistoryTab";
import { ProfitReportsTab } from "./components/ProfitReportsTab";
import { CostingSettingsTab } from "./components/CostingSettingsTab";
import {
  Lock, Eye, EyeOff, AlertCircle, IndianRupee, TrendingUp,
  CheckCircle2, Banknote, CreditCard, MapPin, Award,
} from "lucide-react";

// ── Login Screen (Neumorphic) ─────────────────────────────────────────────────
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
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Galat password! Dobara try karo.");
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
    <div style={{ minHeight: "100vh", background: C.base, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-outfit), sans-serif", padding: 20 }}>
      <div style={{
        background: C.base,
        borderRadius: 28,
        padding: "48px 40px",
        width: "100%", maxWidth: 420,
        boxShadow: nm.raised,
        position: "relative",
        animation: shaking ? "shake 0.5s ease-in-out" : "none"
      }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 68, height: 68, borderRadius: 20,
            background: C.base,
            boxShadow: nm.raisedSm,
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 18px",
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 14,
              background: C.red,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 14px rgba(160,28,44,0.4)"
            }}>
              <Lock style={{ width: 22, height: 22, color: "white" }} />
            </div>
          </div>
          <h1 style={{ color: C.text, fontSize: 26, fontWeight: 900, margin: 0, letterSpacing: "-0.5px" }}>
            Ghartika <span style={{ color: C.red }}>Admin</span>
          </h1>
          <p style={{ color: C.muted, fontSize: 13, marginTop: 6, fontWeight: 500 }}>Secure Dashboard Access</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 24 }}>
            <label style={{ color: C.textSub, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 10 }}>
              Admin Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPwd ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                placeholder="••••••••"
                autoFocus
                style={{
                  width: "100%", padding: "15px 48px 15px 18px",
                  background: C.base,
                  boxShadow: error ? `inset 2px 2px 5px ${C.shadowDark}, inset -2px -2px 5px ${C.shadowLight}, 0 0 0 1.5px ${C.red}` : nm.inset,
                  border: "none",
                  borderRadius: 14,
                  color: C.text, fontSize: 15, outline: "none",
                  boxSizing: "border-box", fontFamily: "var(--font-outfit), sans-serif",
                  fontWeight: 600,
                }}
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                style={{
                  position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer", color: C.muted, padding: 4
                }}>
                {showPwd ? <EyeOff style={{ width: 18, height: 18 }} /> : <Eye style={{ width: 18, height: 18 }} />}
              </button>
            </div>
            {error && (
              <p style={{ color: C.red, fontSize: 12.5, marginTop: 10, display: "flex", alignItems: "center", gap: 6, fontWeight: 600 }}>
                <AlertCircle style={{ width: 14, height: 14 }} /> {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%", padding: 15,
              background: C.red,
              border: "none", borderRadius: 14,
              color: "white", fontSize: 15, fontWeight: 800,
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: "0 6px 20px rgba(160,28,44,0.35)",
              fontFamily: "var(--font-outfit), sans-serif",
              opacity: loading ? 0.75 : 1,
              transition: "all 0.15s ease",
            }}
          >
            {loading ? "Verifying..." : "Login to Panel"}
          </button>
        </form>
      </div>
      <style>{`@keyframes shake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-10px)} 40%,80%{transform:translateX(10px)} }`}</style>
    </div>
  );
}

// ── Analytics Tab (Enhanced with COD vs Online & Metrics) ────────────────────
function AnalyticsTab({ orders }: { orders: Order[] }) {
  const ALL_STATUSES: OrderStatus[] = ["Pending", "Confirmed", "Packed", "Shipped", "Delivered", "Cancelled", "Returned"];
  const STATUS_COLORS: Record<OrderStatus, string> = {
    Pending: "#b45309", Confirmed: "#1d4ed8", Packed: "#7c3aed",
    Shipped: "#0369a1", Delivered: "#15803d", Cancelled: "#b91c1c", Returned: "#9a3412",
  };

  const statusCounts = useMemo(() => {
    const c: Record<string, number> = {};
    ALL_STATUSES.forEach((s) => { c[s] = 0; });
    orders.forEach((o) => { c[o.status] = (c[o.status] || 0) + 1; });
    return c;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders]);

  const productRevenue = useMemo(() => {
    const map: Record<string, { name: string; quantity: number; revenue: number }> = {};
    orders.forEach((o) => o.items.forEach((item) => {
      if (!map[item.id]) map[item.id] = { name: item.name, quantity: 0, revenue: 0 };
      map[item.id].quantity += item.quantity;
      map[item.id].revenue += item.price * item.quantity;
    }));
    return Object.values(map).sort((a, b) => b.revenue - a.revenue);
  }, [orders]);

  // Top cities breakdown
  const cityBreakdown = useMemo(() => {
    const map: Record<string, { orders: number; revenue: number }> = {};
    orders.forEach((o) => {
      const city = o.customer.city?.trim() || "Unknown";
      if (!map[city]) map[city] = { orders: 0, revenue: 0 };
      map[city].orders += 1;
      map[city].revenue += o.total;
    });
    return Object.entries(map)
      .map(([city, data]) => ({ city, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6);
  }, [orders]);

  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
  const avgOrderValue = orders.length ? Math.round(totalRevenue / orders.length) : 0;
  const deliveredRevenue = orders.filter((o) => o.status === "Delivered").reduce((s, o) => s + o.total, 0);
  const codOrders = orders.filter((o) => (o.paymentMethod ?? "COD") === "COD").length;
  const onlineOrders = orders.filter((o) => o.paymentMethod === "Online").length;
  const codPercentage = orders.length ? Math.round((codOrders / orders.length) * 100) : 0;

  return (
    <div style={{ display: "grid", gap: 24 }}>
      {/* Top metrics cards — Pure Neumorphic */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 16 }}>
        {[
          { label: "Total Revenue", value: `₹${totalRevenue.toLocaleString("en-IN")}`, icon: <IndianRupee style={{ width: 17, height: 17 }} />, iconColor: C.red },
          { label: "Avg Order Value", value: `₹${avgOrderValue.toLocaleString("en-IN")}`, icon: <TrendingUp style={{ width: 17, height: 17 }} />, iconColor: "#16A34A" },
          { label: "Delivered Revenue", value: `₹${deliveredRevenue.toLocaleString("en-IN")}`, icon: <CheckCircle2 style={{ width: 17, height: 17 }} />, iconColor: "#15803D" },
          { label: "COD Orders", value: `${codOrders} (${codPercentage}%)`, icon: <Banknote style={{ width: 17, height: 17 }} />, iconColor: "#B45309" },
          { label: "Online Orders", value: `${onlineOrders} (${100 - codPercentage}%)`, icon: <CreditCard style={{ width: 17, height: 17 }} />, iconColor: "#1D4ED8" },
        ].map((card, i) => (
          <div
            key={i}
            style={{
              background: C.base,
              borderRadius: 18,
              padding: "20px 22px",
              boxShadow: nm.raised,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
              <p style={{ margin: 0, fontSize: 11.5, color: C.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>{card.label}</p>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: C.base,
                boxShadow: nm.raisedSm,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: card.iconColor, flexShrink: 0,
              }}>
                {card.icon}
              </div>
            </div>
            <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: C.text, letterSpacing: "-0.5px" }}>{card.value}</p>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Status breakdown */}
        <div style={{ background: C.base, borderRadius: 18, padding: 26, boxShadow: nm.raised }}>
          <h3 style={{ margin: "0 0 20px", fontSize: 15, fontWeight: 800, color: C.text }}>Order Status Breakdown</h3>
          {ALL_STATUSES.map((status) => {
            const count = statusCounts[status];
            const pct = orders.length ? (count / orders.length) * 100 : 0;
            return (
              <div key={status} style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{status}</span>
                  <span style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>{count} orders ({Math.round(pct)}%)</span>
                </div>
                {/* Neumorphic Inset Track */}
                <div style={{ height: 7, background: C.base, borderRadius: 99, boxShadow: nm.insetSm, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, borderRadius: 99, background: STATUS_COLORS[status], transition: "width 0.6s ease" }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Top Cities */}
        <div style={{ background: C.base, borderRadius: 18, padding: 26, boxShadow: nm.raised }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8, background: C.base,
              boxShadow: nm.raisedSm, display: "flex", alignItems: "center", justifyContent: "center", color: C.red
            }}>
              <MapPin style={{ width: 15, height: 15 }} />
            </div>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: C.text }}>Top Customer Cities</h3>
          </div>
          {cityBreakdown.length === 0 ? (
            <p style={{ color: C.muted, fontSize: 13 }}>Abhi tak koi city data nahi hai</p>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {cityBreakdown.map((item, idx) => (
                <div key={idx} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "10px 14px", borderRadius: 10, background: C.base, boxShadow: nm.raisedSm
                }}>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: 13.5, color: C.text }}>{item.city}</span>
                    <span style={{ marginLeft: 8, fontSize: 11.5, color: C.muted, fontWeight: 500 }}>{item.orders} orders</span>
                  </div>
                  <span style={{ fontWeight: 800, fontSize: 13.5, color: C.red }}>₹{item.revenue.toLocaleString("en-IN")}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Top Products table */}
      <div style={{ background: C.base, borderRadius: 18, padding: 26, boxShadow: nm.raised }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8, background: C.base,
            boxShadow: nm.raisedSm, display: "flex", alignItems: "center", justifyContent: "center", color: C.gold
          }}>
            <Award style={{ width: 16, height: 16 }} />
          </div>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: C.text }}>Top Selling Spices</h3>
        </div>

        <div style={{
          background: C.base,
          boxShadow: nm.inset,
          borderRadius: 14,
          padding: "8px 14px",
          overflowX: "auto"
        }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr>
                {["#", "Product", "Qty Sold", "Total Revenue"].map((h) => (
                  <th key={h} style={{ padding: "10px 14px", textAlign: "left", color: C.muted, fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {productRevenue.map((p, i) => (
                <tr key={i} style={{ borderTop: `1px solid rgba(200, 194, 186, 0.3)` }}>
                  <td style={{ padding: "12px 14px", fontWeight: 800, color: i === 0 ? C.red : C.muted }}>#{i + 1}</td>
                  <td style={{ padding: "12px 14px", fontWeight: 700, color: C.text, maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</td>
                  <td style={{ padding: "12px 14px", color: C.muted, fontWeight: 600 }}>{p.quantity} units</td>
                  <td style={{ padding: "12px 14px", fontWeight: 800, color: C.red }}>₹{p.revenue.toLocaleString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Main exported component ───────────────────────────────────────────────────
export default function AdminDashboard() {
  const { orders, isLoading: ordersLoading, refreshOrders, updateOrderStatus, patchOrder } = useOrders();
  const { products, isLoading: productsLoading, refreshProducts, addProduct, updateProduct, deleteProduct } = useProducts();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [pendingReviewsCount, setPendingReviewsCount] = useState(0);
  const [abandonedCount, setAbandonedCount] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  // Check auth cookie and background counts on mount
  useEffect(() => {
    setMounted(true);
    fetch("/api/admin/auth")
      .then((r) => r.json())
      .then((d) => {
        if (d.loggedIn) {
          setIsLoggedIn(true);
          refreshOrders();
          refreshProducts();
          fetchPendingCounts();
        }
      })
      .catch(() => {})
      .finally(() => setAuthChecking(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPendingCounts = () => {
    fetch("/api/reviews")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setPendingReviewsCount(data.filter((r) => r.status === "pending").length);
        }
      })
      .catch(() => {});

    fetch("/api/abandoned-carts")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAbandonedCount(data.filter((c) => !c.recovered).length);
        }
      })
      .catch(() => {});

    fetch("/api/notifications")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setUnreadNotifications(data.filter((n) => !n.isRead).length);
        }
      })
      .catch(() => {});
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    refreshOrders();
    refreshProducts();
    fetchPendingCounts();
  };

  const handleLogout = async () => {
    await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" }),
    });
    setIsLoggedIn(false);
  };

  const handleRefresh = async () => {
    await Promise.all([refreshOrders(), refreshProducts()]);
    fetchPendingCounts();
  };

  const handleBulkUpdate = async (ids: string[], status: OrderStatus) => {
    const res = await fetch("/api/orders/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids, status }),
    });
    if (!res.ok) throw new Error("Bulk update failed");
    await refreshOrders();
  };

  const handleDuplicate = async (id: string) => {
    const res = await fetch(`/api/products/${id}?action=duplicate`, { method: "POST" });
    if (!res.ok) throw new Error("Duplicate failed");
    await refreshProducts();
  };

  const lowStockCount = useMemo(
    () => products.filter((p) => p.stock !== undefined && p.lowStockThreshold !== undefined && p.stock <= p.lowStockThreshold).length,
    [products]
  );
  const pendingCount = useMemo(
    () => orders.filter((o) => o.status === "Pending").length,
    [orders]
  );

  // Loading / auth states
  if (!mounted || authChecking) {
    return (
      <div style={{ minHeight: "100vh", background: C.base, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-outfit), sans-serif" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <div style={{
            width: 54, height: 54, borderRadius: 16,
            background: C.base, boxShadow: nm.raisedSm,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <div style={{
              width: 24, height: 24,
              border: `2.5px solid ${C.shadowDark}`,
              borderTopColor: C.red,
              borderRadius: "50%",
              animation: "adminSpin 0.8s linear infinite"
            }} />
          </div>
          <span style={{ fontSize: 13, color: C.muted, fontWeight: 600 }}>Loading Ghartika Admin...</span>
          <style>{`@keyframes adminSpin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) return <LoginScreen onLogin={handleLogin} />;

  return (
    <AdminShell
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onLogout={handleLogout}
      onRefresh={handleRefresh}
      pendingCount={pendingCount}
      lowStockCount={lowStockCount}
      abandonedCount={abandonedCount}
      pendingReviewsCount={pendingReviewsCount}
      unreadNotifications={unreadNotifications}
    >
      {activeTab === "dashboard" && (
        <DashboardTab
          orders={orders}
          products={products}
          onNavTo={(tab) => setActiveTab(tab)}
        />
      )}

      {activeTab === "orders" && (
        <OrdersTab
          orders={orders}
          onStatusUpdate={updateOrderStatus}
          onPatch={patchOrder}
          onBulkUpdate={handleBulkUpdate}
          isLoading={ordersLoading}
        />
      )}

      {activeTab === "products" && (
        <ProductsTab
          products={products}
          onAdd={addProduct}
          onUpdate={updateProduct}
          onDelete={deleteProduct}
          onDuplicate={handleDuplicate}
          isLoading={productsLoading}
        />
      )}

      {activeTab === "inventory" && (
        <InventoryTab products={products} onRefreshProducts={refreshProducts} />
      )}

      {activeTab === "categories" && <CategoriesTab />}

      {activeTab === "customers" && <CustomersTab orders={orders} />}

      {activeTab === "coupons" && <CouponsTab />}

      {activeTab === "abandoned" && <AbandonedCartsTab />}

      {activeTab === "reviews" && <ReviewsTab />}

      {activeTab === "storefront" && <StorefrontTab />}

      {activeTab === "media" && <MediaLibraryTab />}

      {activeTab === "seo" && <SEOTab />}

      {activeTab === "suppliers" && <SuppliersTab />}

      {activeTab === "finance" && <FinanceTab orders={orders} />}

      {activeTab === "reports" && <ReportsTab orders={orders} products={products} />}

      {activeTab === "notifications" && (
        <NotificationsTab
          onNavigate={(tab) => setActiveTab(tab)}
          onRefreshBadge={fetchPendingCounts}
        />
      )}

      {activeTab === "staff" && <StaffTab />}

      {activeTab === "settings" && <SettingsTab />}

      {activeTab === "health" && <HealthTab />}

      {activeTab === "costing-dashboard" && (
        <CostingDashboardTab onNavTo={(tab) => setActiveTab(tab)} />
      )}

      {activeTab === "product-costing" && <ProductCostingTab />}

      {activeTab === "raw-materials" && <RawMaterialsTab />}

      {activeTab === "recipes-production" && <RecipesProductionTab />}

      {activeTab === "cost-history" && <CostHistoryTab />}

      {activeTab === "profit-reports" && <ProfitReportsTab />}

      {activeTab === "costing-settings" && <CostingSettingsTab />}

      {activeTab === "analytics" && <AnalyticsTab orders={orders} />}
    </AdminShell>
  );
}
