"use client";

import { useState, useEffect, useMemo } from "react";
import type { AbandonedCart } from "@/types";
import {
  MessageCircle, CheckCircle2, Clock, IndianRupee,
  RefreshCw, Search, Phone, ExternalLink, AlertCircle,
  ShoppingBag,
} from "lucide-react";
import { C } from "./AdminShell";

function fmtINR(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AbandonedCartsTab() {
  const [carts, setCarts] = useState<AbandonedCart[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "recovered">("all");
  const [toast, setToast] = useState("");
  const [recoveringId, setRecoveringId] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const fetchCarts = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/abandoned-carts");
      if (res.ok) {
        const data = await res.json();
        setCarts(data);
      }
    } catch {
      showToast("Error loading abandoned carts");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCarts();
  }, []);

  const handleMarkRecovered = async (cart: AbandonedCart) => {
    try {
      setRecoveringId(cart.id);
      const res = await fetch(`/api/abandoned-carts/${cart.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: "Recovered via admin follow-up" }),
      });
      if (res.ok) {
        setCarts((prev) =>
          prev.map((c) => (c.id === cart.id ? { ...c, recovered: true } : c))
        );
        showToast("Cart marked as recovered! 🎉");
      }
    } catch {
      showToast("Failed to update status");
    } finally {
      setRecoveringId(null);
    }
  };

  const getWhatsAppLink = (cart: AbandonedCart) => {
    const rawPhone = cart.customer.phone.replace(/\D/g, "");
    const cleanPhone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;
    const customerName = cart.customer.name ? cart.customer.name.trim() : "ji";
    const itemsSummary = cart.items.map((i) => `${i.name} (${i.quantity}x)`).join(", ");

    const text = `Namaste ${customerName}! 🙏

Aapne Ghartika Spices par kuch masale cart mein add kiye the:
📦 ${itemsSummary}
💰 Total: ${fmtINR(cart.total)}

Kya checkout karte waqt koi pareshani aayi? Agar aapko order complete karne mein koi help chahiye ya discount coupon chahiye toh humein zaroor batayein!

- Ghartika Pure Spices
https://ghartika.in/cart`;

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return carts.filter((c) => {
      const matchSearch =
        !q ||
        (c.customer.name ?? "").toLowerCase().includes(q) ||
        c.customer.phone.includes(q) ||
        (c.customer.city ?? "").toLowerCase().includes(q);
      const matchFilter =
        filter === "all" ||
        (filter === "pending" && !c.recovered) ||
        (filter === "recovered" && c.recovered);
      return matchSearch && matchFilter;
    });
  }, [carts, search, filter]);

  const totalAbandoned = carts.length;
  const recoveredCount = carts.filter((c) => c.recovered).length;
  const pendingCount = totalAbandoned - recoveredCount;
  const potentialRevenue = carts
    .filter((c) => !c.recovered)
    .reduce((s, c) => s + c.total, 0);

  return (
    <div style={{ display: "grid", gap: 18 }}>
      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, background: "#1a1008", color: "white", padding: "10px 20px", borderRadius: 10, fontSize: 13, fontWeight: 600, zIndex: 999, boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}>
          {toast}
        </div>
      )}

      {/* Header & Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
        {[
          { label: "Abandoned Carts", value: totalAbandoned.toString(), icon: "🛒", color: C.text },
          { label: "Pending Recovery", value: pendingCount.toString(), icon: "⏳", color: "#b45309" },
          { label: "Recovered", value: recoveredCount.toString(), icon: "✅", color: "#16a34a" },
          { label: "Lost Revenue", value: fmtINR(potentialRevenue), icon: "💰", color: C.red },
        ].map((s, i) => (
          <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: "18px 20px" }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>{s.icon}</div>
            <p style={{ margin: 0, fontSize: 11, color: C.muted, fontWeight: 700, textTransform: "uppercase" }}>{s.label}</p>
            <p style={{ margin: "4px 0 0", fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
          <Search style={{ width: 15, height: 15, position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: C.muted }} />
          <input
            type="text"
            placeholder="Search by name, phone, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: "100%", padding: "10px 12px 10px 36px", border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 13, outline: "none", background: C.surface, color: C.text, fontFamily: "var(--font-outfit), sans-serif", boxSizing: "border-box" }}
          />
        </div>

        <div style={{ display: "flex", gap: 6 }}>
          {(["all", "pending", "recovered"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              style={{
                padding: "8px 14px",
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                border: filter === tab ? `1px solid ${C.red}` : `1px solid ${C.border}`,
                background: filter === tab ? C.red : C.surface,
                color: filter === tab ? "white" : C.text,
                textTransform: "capitalize",
                fontFamily: "var(--font-outfit), sans-serif",
              }}
            >
              {tab === "all" ? `All (${carts.length})` : tab === "pending" ? `Pending (${pendingCount})` : `Recovered (${recoveredCount})`}
            </button>
          ))}
        </div>
      </div>

      {/* Cart List */}
      {isLoading ? (
        <div style={{ textAlign: "center", padding: 60, color: C.muted }}>
          <RefreshCw style={{ width: 32, height: 32, margin: "0 auto 10px", animation: "adminSpin 0.8s linear infinite" }} />
          <p style={{ fontWeight: 600 }}>Loading abandoned carts...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 48, textAlign: "center", color: C.muted }}>
          <ShoppingBag style={{ width: 44, height: 44, margin: "0 auto 12px", opacity: 0.3 }} />
          <p style={{ fontWeight: 700, fontSize: 16, color: C.text, margin: 0 }}>Koi Abandoned Cart Nahi Hai</p>
          <p style={{ fontSize: 13, marginTop: 6 }}>Customers ke incomplete checkouts yahan display honge.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {filtered.map((cart) => (
            <div
              key={cart.id}
              style={{
                background: C.surface,
                border: `1px solid ${cart.recovered ? "#bbf7d0" : C.border}`,
                borderRadius: 16,
                padding: "18px 22px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 16,
                flexWrap: "wrap",
              }}
            >
              {/* Left Info */}
              <div style={{ flex: 1, minWidth: 240 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 15, fontWeight: 800, color: C.text }}>
                    {cart.customer.name || "Anonymous Customer"}
                  </span>
                  {cart.recovered ? (
                    <span style={{ fontSize: 11, background: "#dcfce7", color: "#15803d", border: "1px solid #bbf7d0", padding: "2px 8px", borderRadius: 99, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 }}>
                      <CheckCircle2 style={{ width: 12, height: 12 }} /> Recovered
                    </span>
                  ) : (
                    <span style={{ fontSize: 11, background: "#fef3c7", color: "#b45309", border: "1px solid #fde68a", padding: "2px 8px", borderRadius: 99, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 }}>
                      <Clock style={{ width: 12, height: 12 }} /> Needs Follow-up
                    </span>
                  )}
                </div>

                <p style={{ margin: "4px 0 0", fontSize: 13, color: C.muted }}>
                  📞 {cart.customer.phone} {cart.customer.city ? `· 📍 ${cart.customer.city}, ${cart.customer.state || ""}` : ""}
                </p>

                {/* Items preview */}
                <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                  {cart.items.map((item, idx) => (
                    <span
                      key={idx}
                      style={{
                        fontSize: 11,
                        background: C.bg,
                        border: `1px solid ${C.border}`,
                        padding: "3px 8px",
                        borderRadius: 6,
                        color: C.text,
                        fontWeight: 500,
                      }}
                    >
                      {item.name} × {item.quantity}
                    </span>
                  ))}
                </div>

                <p style={{ margin: "6px 0 0", fontSize: 11, color: C.muted }}>
                  Cart Abandoned: {fmtDate(cart.date)}
                </p>
              </div>

              {/* Total & Recovery Actions */}
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ textAlign: "right" }}>
                  <p style={{ margin: 0, fontSize: 20, fontWeight: 800, color: C.red }}>
                    {fmtINR(cart.total)}
                  </p>
                  <p style={{ margin: "2px 0 0", fontSize: 11, color: C.muted, textTransform: "uppercase" }}>
                    Cart Value
                  </p>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  {/* WhatsApp Click-to-Chat Button */}
                  <a
                    href={getWhatsAppLink(cart)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "9px 14px",
                      background: "#25D366",
                      color: "white",
                      borderRadius: 10,
                      fontWeight: 700,
                      fontSize: 13,
                      textDecoration: "none",
                      boxShadow: "0 2px 8px rgba(37,211,102,0.3)",
                    }}
                  >
                    <MessageCircle style={{ width: 16, height: 16 }} />
                    WhatsApp
                  </a>

                  {!cart.recovered && (
                    <button
                      onClick={() => handleMarkRecovered(cart)}
                      disabled={recoveringId === cart.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        padding: "9px 14px",
                        background: C.surface,
                        border: `1px solid ${C.border}`,
                        color: C.text,
                        borderRadius: 10,
                        fontWeight: 600,
                        fontSize: 13,
                        cursor: "pointer",
                        fontFamily: "var(--font-outfit), sans-serif",
                      }}
                    >
                      <CheckCircle2 style={{ width: 15, height: 15, color: "#16a34a" }} />
                      Recovered
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
