"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import {
  BarChart2, ShoppingBag, Users, Package, TrendingUp,
  Store, LogOut, X, Menu, RefreshCw,
  Tag, Star, ShoppingCart, Boxes, FileText, Shield,
  Wallet, Image, Bell, Settings, Truck, Globe,
  ChevronRight, ChevronDown, Activity,
  LayoutDashboard, Calculator, History, FileSpreadsheet,
  SlidersHorizontal, Scale, ExternalLink, Search,
} from "lucide-react";

// ─── Pure Neumorphic Design System (Unified Canvas) ──────────────────────────
//
// In Pure Neumorphism, every element shares the exact same base tone.
// Light highlight comes from top-left (#FFFFFF), shadow goes to bottom-right.
//
export const C = {
  // Pure Neumorphic Unified Canvas
  base:        "#E9E5DF",   // Soft warm pearl canvas
  bg:          "#E9E5DF",
  surface:     "#E9E5DF",
  bgMuted:     "#DFD9D1",
  border:      "transparent",
  borderLight: "transparent",

  // Shadow tokens
  shadowDark:  "#C8C2BA",   // warm subtle dark shadow
  shadowLight: "#FFFFFF",   // pure bright highlight

  // Sidebar (pure neumorphic - unified with canvas)
  sideBase:    "#E9E5DF",
  sidebarBg:   "#E9E5DF",
  sidebarHover:"#DFD9D1",
  sidebarText: "#6E675F",

  // Brand Hero Accent (Ghartika signature Red #A01C2C)
  red:         "#A01C2C",
  redHover:    "#851624",
  redLight:    "#F6E7E9",
  redGlow:     "rgba(160, 28, 44, 0.25)",
  gold:        "#B8860B",

  // Typography
  text:        "#1A1410",   // deep warm charcoal for high readability
  textSub:     "#544C43",
  muted:       "#7D756C",

  // Status
  success:     "#15803D",
  warn:        "#B45309",
  info:        "#1D4ED8",
} as const;

// Pure Neumorphic dual shadows
export const nm = {
  raised:    `6px 6px 14px ${C.shadowDark}, -6px -6px 14px ${C.shadowLight}`,
  raisedSm:  `3px 3px 8px ${C.shadowDark}, -3px -3px 8px ${C.shadowLight}`,
  raisedLg:  `9px 9px 20px ${C.shadowDark}, -9px -9px 20px ${C.shadowLight}`,
  inset:     `inset 3px 3px 7px ${C.shadowDark}, inset -3px -3px 7px ${C.shadowLight}`,
  insetSm:   `inset 2px 2px 5px ${C.shadowDark}, inset -2px -2px 5px ${C.shadowLight}`,
  insetLg:   `inset 5px 5px 12px ${C.shadowDark}, inset -5px -5px 12px ${C.shadowLight}`,
  sideRaised:`4px 0 12px ${C.shadowDark}`,
  sideInset: `inset 3px 3px 7px ${C.shadowDark}, inset -3px -3px 7px ${C.shadowLight}`,
} as const;

export type AdminTab =
  | "dashboard" | "analytics" | "orders" | "products" | "inventory"
  | "categories" | "customers" | "coupons" | "abandoned" | "reviews"
  | "storefront" | "media" | "seo" | "suppliers" | "finance" | "reports"
  | "notifications" | "staff" | "settings" | "health"
  | "costing-dashboard" | "product-costing" | "raw-materials"
  | "recipes-production" | "cost-history" | "profit-reports" | "costing-settings";

interface NavItem { id: AdminTab; label: string; icon: ReactNode; badge?: number | null; }
interface NavGroup { label: string; items: NavItem[]; }

interface AdminShellProps {
  activeTab: AdminTab; onTabChange: (tab: AdminTab) => void;
  onLogout: () => void; onRefresh: () => Promise<void>;
  pendingCount: number; lowStockCount: number;
  abandonedCount?: number; pendingReviewsCount?: number;
  unreadNotifications?: number; children: ReactNode;
}

const ic = (n = 15) => ({ width: n, height: n, strokeWidth: 1.6 });

export function AdminShell({
  activeTab, onTabChange, onLogout, onRefresh,
  pendingCount, lowStockCount, abandonedCount, pendingReviewsCount,
  unreadNotifications, children,
}: AdminShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try { await onRefresh(); } finally { setRefreshing(false); }
  };

  const toggleGroup = (label: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      next.has(label) ? next.delete(label) : next.add(label);
      return next;
    });
  };

  const navGroups: NavGroup[] = [
    {
      label: "Overview",
      items: [
        { id: "dashboard",     label: "Dashboard",     icon: <LayoutDashboard {...ic()} /> },
        { id: "analytics",     label: "Analytics",     icon: <BarChart2 {...ic()} /> },
        { id: "notifications", label: "Notifications", icon: <Bell {...ic()} />, badge: unreadNotifications || null },
      ],
    },
    {
      label: "Commerce",
      items: [
        { id: "orders",     label: "Orders",     icon: <ShoppingBag {...ic()} />, badge: pendingCount || null },
        { id: "products",   label: "Products",   icon: <Package {...ic()} />,    badge: lowStockCount || null },
        { id: "inventory",  label: "Inventory",  icon: <Boxes {...ic()} /> },
        { id: "categories", label: "Categories", icon: <Tag {...ic()} /> },
      ],
    },
    {
      label: "Cost & Profit",
      items: [
        { id: "costing-dashboard",  label: "Costing Overview",  icon: <TrendingUp {...ic()} /> },
        { id: "product-costing",    label: "Product Costing",   icon: <Calculator {...ic()} /> },
        { id: "raw-materials",      label: "Raw Materials",     icon: <Boxes {...ic()} /> },
        { id: "recipes-production", label: "Recipes",           icon: <Scale {...ic()} /> },
        { id: "cost-history",       label: "Cost History",      icon: <History {...ic()} /> },
        { id: "profit-reports",     label: "Profit Reports",    icon: <FileSpreadsheet {...ic()} /> },
        { id: "costing-settings",   label: "Costing Settings",  icon: <SlidersHorizontal {...ic()} /> },
      ],
    },
    {
      label: "Customers",
      items: [
        { id: "customers", label: "Customers",       icon: <Users {...ic()} /> },
        { id: "coupons",   label: "Coupons",         icon: <Tag {...ic()} /> },
        { id: "abandoned", label: "Abandoned Carts", icon: <ShoppingCart {...ic()} />, badge: abandonedCount || null },
        { id: "reviews",   label: "Reviews",         icon: <Star {...ic()} />,         badge: pendingReviewsCount || null },
      ],
    },
    {
      label: "Content & SEO",
      items: [
        { id: "storefront", label: "Website",       icon: <Store {...ic()} /> },
        { id: "media",      label: "Media Library", icon: <Image {...ic()} /> },
        { id: "seo",        label: "SEO",           icon: <Globe {...ic()} /> },
      ],
    },
    {
      label: "Finance",
      items: [
        { id: "suppliers", label: "Suppliers", icon: <Truck {...ic()} /> },
        { id: "finance",   label: "Finance",   icon: <Wallet {...ic()} /> },
        { id: "reports",   label: "Reports",   icon: <FileText {...ic()} /> },
      ],
    },
    {
      label: "System",
      items: [
        { id: "staff",    label: "Users",         icon: <Shield {...ic()} /> },
        { id: "settings", label: "Settings",      icon: <Settings {...ic()} /> },
        { id: "health",   label: "System Health", icon: <Activity {...ic()} /> },
      ],
    },
  ];

  const tabLabel: Record<AdminTab, string> = {
    dashboard: "Dashboard", analytics: "Analytics", orders: "Orders",
    products: "Products", inventory: "Inventory", categories: "Categories",
    customers: "Customers", coupons: "Coupons & Promotions", abandoned: "Abandoned Carts",
    reviews: "Reviews", storefront: "Website Manager", media: "Media Library",
    seo: "SEO Manager", suppliers: "Suppliers", finance: "Finance",
    reports: "Reports", notifications: "Notifications", staff: "Users & Permissions",
    settings: "Settings", health: "System Health",
    "costing-dashboard": "Costing Dashboard", "product-costing": "Product Costing",
    "raw-materials": "Raw Materials", "recipes-production": "Recipes & Production",
    "cost-history": "Cost History", "profit-reports": "Profit Reports",
    "costing-settings": "Costing Settings",
  };

  const allItems = navGroups.flatMap((g) => g.items);
  const searchResults = search.length >= 2
    ? allItems.filter((i) => i.label.toLowerCase().includes(search.toLowerCase()))
    : [];

  return (
    <div style={{ minHeight: "100vh", background: C.base, display: "flex", fontFamily: "var(--font-outfit), sans-serif", color: C.text }}>
      {mobileOpen && (
        <div onClick={() => setMobileOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(30, 25, 20, 0.45)", backdropFilter: "blur(4px)", zIndex: 45 }} />
      )}

      {/* ── Sidebar (Pure Neumorphic Soft UI) ──────────────────────────────── */}
      <aside
        className={`admin-sidebar${mobileOpen ? " open" : ""}`}
        style={{
          width: 236,
          background: C.base,
          display: "flex", flexDirection: "column",
          position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 50,
          boxShadow: `5px 0 14px ${C.shadowDark}`,
        }}
      >
        {/* Logo header — Raised Neumorphic Badge */}
        <div style={{ padding: "20px 18px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: C.base,
              boxShadow: nm.raisedSm,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: `linear-gradient(135deg, ${C.red} 0%, ${C.redHover} 100%)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: `0 3px 8px ${C.redGlow}`,
              }}>
                <span style={{ color: "#fff", fontWeight: 900, fontSize: 14 }}>G</span>
              </div>
            </div>
            <div>
              <p style={{ margin: 0, color: C.text, fontWeight: 900, fontSize: 15, letterSpacing: "-0.3px", lineHeight: 1 }}>Ghartika</p>
              <p style={{ margin: "4px 0 0", color: C.muted, fontSize: 9.5, fontWeight: 700, letterSpacing: "0.08em" }}>ADMIN PANEL · v2</p>
            </div>
          </div>
          <button onClick={() => setMobileOpen(false)} className="admin-mobile-toggle"
            style={{ display: "none", background: "none", border: "none", cursor: "pointer", color: C.muted, padding: 4 }}>
            <X size={16} />
          </button>
        </div>

        {/* Inset dividing groove */}
        <div style={{ height: 3, margin: "0 16px 8px", background: C.base, boxShadow: nm.insetSm, borderRadius: 2 }} />

        {/* Navigation list */}
        <nav style={{ flex: 1, padding: "4px 10px", overflowY: "auto" }}>
          {navGroups.map((group) => {
            const collapsed = collapsedGroups.has(group.label);
            return (
              <div key={group.label} style={{ marginBottom: 4 }}>
                <button onClick={() => toggleGroup(group.label)}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "7px 10px 5px", background: "none", border: "none", cursor: "pointer",
                    color: C.muted, fontSize: 9.5, fontWeight: 800,
                    textTransform: "uppercase", letterSpacing: "0.09em",
                    fontFamily: "var(--font-outfit), sans-serif", marginTop: 8,
                  }}>
                  {group.label}
                  {collapsed ? <ChevronRight size={11} /> : <ChevronDown size={11} />}
                </button>
                {!collapsed && group.items.map((item) => {
                  const active = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => { onTabChange(item.id); setMobileOpen(false); }}
                      style={{
                        width: "100%", display: "flex", alignItems: "center", gap: 10,
                        padding: "9px 12px", borderRadius: 12, border: "none",
                        background: C.base,
                        boxShadow: active ? nm.inset : "none",
                        color: active ? C.red : C.sidebarText,
                        textAlign: "left", cursor: "pointer", fontSize: 13,
                        fontWeight: active ? 800 : 600,
                        fontFamily: "var(--font-outfit), sans-serif",
                        transition: "all 0.18s ease", marginBottom: 3,
                      }}
                      onMouseOver={(e) => {
                        if (!active) {
                          e.currentTarget.style.boxShadow = nm.raisedSm;
                          e.currentTarget.style.color = C.text;
                        }
                      }}
                      onMouseOut={(e) => {
                        if (!active) {
                          e.currentTarget.style.boxShadow = "none";
                          e.currentTarget.style.color = C.sidebarText;
                        }
                      }}
                    >
                      <span style={{ flexShrink: 0, color: active ? C.red : C.muted }}>{item.icon}</span>
                      <span style={{ flex: 1 }}>{item.label}</span>
                      {item.badge != null && item.badge > 0 && (
                        <span style={{
                          background: C.red, color: "#fff",
                          fontSize: 10, fontWeight: 800, borderRadius: 6,
                          padding: "2px 6px", minWidth: 18, textAlign: "center",
                          boxShadow: `0 2px 6px ${C.redGlow}`,
                        }}>
                          {item.badge > 99 ? "99+" : item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* Bottom dividing groove */}
        <div style={{ height: 3, margin: "0 16px 8px", background: C.base, boxShadow: nm.insetSm, borderRadius: 2 }} />

        {/* Footer links */}
        <div style={{ padding: "8px 10px 14px" }}>
          <a href="/" target="_blank" rel="noopener noreferrer"
            style={{
              display: "flex", alignItems: "center", gap: 8, padding: "8px 12px",
              borderRadius: 10, color: C.sidebarText, textDecoration: "none",
              fontSize: 12.5, fontWeight: 600, marginBottom: 4, transition: "all 0.15s",
            }}
            onMouseOver={(e) => { e.currentTarget.style.boxShadow = nm.raisedSm; e.currentTarget.style.color = C.text; }}
            onMouseOut={(e) => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.color = C.sidebarText; }}
          >
            <ExternalLink {...ic(13)} /> View Store
          </a>
          <button onClick={onLogout}
            style={{
              width: "100%", display: "flex", alignItems: "center", gap: 8,
              padding: "8px 12px", borderRadius: 10, border: "none",
              background: "transparent", color: C.red, cursor: "pointer",
              fontSize: 12.5, fontWeight: 700, fontFamily: "var(--font-outfit), sans-serif",
              transition: "all 0.15s",
            }}
            onMouseOver={(e) => { e.currentTarget.style.boxShadow = nm.insetSm; }}
            onMouseOut={(e) => { e.currentTarget.style.boxShadow = "none"; }}
          >
            <LogOut {...ic(13)} /> Log out
          </button>
        </div>
      </aside>

      {/* ── Main Content Area (Unified Neumorphic Canvas) ──────────────────── */}
      <div className="admin-main-wrap" style={{ flex: 1, marginLeft: 236, display: "flex", flexDirection: "column", minHeight: "100vh", background: C.base }}>

        {/* Top Header — Raised Neumorphic Strip */}
        <header style={{
          background: C.base,
          padding: "0 30px", height: 60,
          display: "flex", justifyContent: "space-between", alignItems: "center",
          position: "sticky", top: 0, zIndex: 40,
          boxShadow: `0 4px 12px ${C.shadowDark}`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="admin-mobile-toggle"
              style={{ display: "none", background: C.base, border: "none", borderRadius: 10, padding: "7px 8px", cursor: "pointer", color: C.muted, boxShadow: nm.raisedSm }}>
              <Menu size={16} />
            </button>
            <h1 style={{ margin: 0, fontSize: 16, fontWeight: 900, color: C.text, letterSpacing: "-0.2px" }}>{tabLabel[activeTab]}</h1>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Quick jump search button (Neumorphic Raised) */}
            <div style={{ position: "relative" }}>
              <button onClick={() => setShowSearch(!showSearch)}
                style={{
                  display: "flex", alignItems: "center", gap: 7, padding: "7px 14px",
                  background: C.base, border: "none", borderRadius: 10,
                  boxShadow: showSearch ? nm.insetSm : nm.raisedSm,
                  color: C.muted, fontSize: 12.5, fontWeight: 600, cursor: "pointer",
                  transition: "box-shadow 0.15s ease",
                }}>
                <Search {...ic(13)} />
                <span className="hidden-mobile">Quick jump</span>
              </button>
              {showSearch && (
                <div style={{
                  position: "absolute", right: 0, top: "calc(100% + 10px)",
                  background: C.base, borderRadius: 16,
                  boxShadow: nm.raisedLg, width: 270, zIndex: 100,
                  padding: 8,
                }}>
                  <div style={{ padding: "4px 4px 8px" }}>
                    <input autoFocus type="text" value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search sections..."
                      style={{
                        width: "100%", padding: "9px 12px", background: C.base,
                        border: "none", borderRadius: 10, boxShadow: nm.inset,
                        color: C.text, fontSize: 13, outline: "none", boxSizing: "border-box",
                        fontWeight: 600,
                      }}
                    />
                  </div>
                  {searchResults.length > 0 && (
                    <div style={{ padding: "2px" }}>
                      {searchResults.map((item) => (
                        <button key={item.id}
                          onClick={() => { onTabChange(item.id); setShowSearch(false); setSearch(""); }}
                          style={{
                            width: "100%", display: "flex", alignItems: "center", gap: 9,
                            padding: "8px 10px", borderRadius: 8, border: "none",
                            background: "transparent", color: C.text, cursor: "pointer",
                            textAlign: "left", fontSize: 13, fontWeight: 600,
                          }}
                          onMouseOver={(e) => { e.currentTarget.style.boxShadow = nm.raisedSm; }}
                          onMouseOut={(e) => { e.currentTarget.style.boxShadow = "none"; }}
                        >
                          <span style={{ color: C.red }}>{item.icon}</span> {item.label}
                        </button>
                      ))}
                    </div>
                  )}
                  {search.length >= 2 && searchResults.length === 0 && (
                    <div style={{ padding: "16px", textAlign: "center", color: C.muted, fontSize: 13 }}>No sections found</div>
                  )}
                </div>
              )}
            </div>

            {/* Notification bell (Neumorphic Raised) */}
            <button onClick={() => onTabChange("notifications")}
              style={{
                position: "relative", display: "flex", padding: "8px",
                background: C.base, border: "none", borderRadius: 10,
                boxShadow: nm.raisedSm, cursor: "pointer", color: C.muted,
              }}>
              <Bell {...ic(15)} />
              {(unreadNotifications ?? 0) > 0 && (
                <span style={{
                  position: "absolute", top: 6, right: 6, width: 7, height: 7,
                  borderRadius: "50%", background: C.red,
                  boxShadow: `0 0 4px ${C.red}`,
                }} />
              )}
            </button>

            {/* Refresh button (Neumorphic Raised) */}
            <button onClick={handleRefresh} disabled={refreshing}
              style={{
                display: "flex", alignItems: "center", gap: 6, padding: "7px 14px",
                background: C.base, border: "none", borderRadius: 10,
                boxShadow: refreshing ? nm.insetSm : nm.raisedSm,
                color: C.textSub, fontSize: 12.5, fontWeight: 600,
                cursor: refreshing ? "not-allowed" : "pointer",
                fontFamily: "var(--font-outfit), sans-serif",
                opacity: refreshing ? 0.7 : 1, transition: "box-shadow 0.15s ease",
              }}>
              <RefreshCw {...ic(13)} style={{ animation: refreshing ? "adminSpin 0.8s linear infinite" : "none" }} />
              <span className="hidden-mobile">{refreshing ? "Syncing..." : "Refresh"}</span>
            </button>

            {/* Admin Profile (Neumorphic Raised circular icon) */}
            <div onClick={() => onTabChange("staff")}
              style={{
                width: 36, height: 36, borderRadius: "50%",
                background: C.base, boxShadow: nm.raisedSm,
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer",
              }}
              title="Admin Account"
            >
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: `linear-gradient(135deg, ${C.red} 0%, ${C.redHover} 100%)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontWeight: 900, fontSize: 12,
                boxShadow: `0 2px 6px ${C.redGlow}`,
              }}>
                A
              </div>
            </div>
          </div>
        </header>

        {showSearch && <div onClick={() => { setShowSearch(false); setSearch(""); }} style={{ position: "fixed", inset: 0, zIndex: 39 }} />}

        {/* Tab content wrapper */}
        <main style={{ flex: 1, padding: "28px 32px", overflowY: "auto" }}>
          {children}
        </main>
      </div>

      <style>{`
        @keyframes adminSpin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .admin-sidebar { transform: translateX(-100%); transition: transform 0.25s ease; }
          .admin-sidebar.open { transform: translateX(0); }
          .admin-main-wrap { margin-left: 0 !important; }
          .admin-mobile-toggle { display: flex !important; }
          .hidden-mobile { display: none !important; }
        }
      `}</style>
    </div>
  );
}
