"use client";

import { useState, useMemo } from "react";
import type { Order } from "@/types";
import {
  Users, Search, Download, Star, Phone, Mail, MapPin,
  ShoppingBag, X, ChevronRight, FileText,
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

interface CustomerRecord {
  phone: string;
  name: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  orders: Order[];
  totalSpent: number;
  lastOrderDate: string;
  isVIP: boolean;
  isRepeat: boolean;
}

export function CustomersTab({ orders }: { orders: Order[] }) {
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRecord | null>(null);
  const [filterType, setFilterType] = useState<"all" | "vip" | "repeat">("all");

  const customers: CustomerRecord[] = useMemo(() => {
    const map: Record<string, CustomerRecord> = {};

    for (const order of orders) {
      const key = order.customer.phone;
      if (!map[key]) {
        map[key] = {
          phone: order.customer.phone,
          name: order.customer.name,
          email: order.customer.email,
          address: order.customer.address,
          city: order.customer.city,
          state: order.customer.state,
          pincode: order.customer.pincode,
          orders: [],
          totalSpent: 0,
          lastOrderDate: order.date,
          isVIP: false,
          isRepeat: false,
        };
      }
      map[key].orders.push(order);
      map[key].totalSpent += order.total;
      if (order.date > map[key].lastOrderDate) {
        map[key].lastOrderDate = order.date;
      }
    }

    const list = Object.values(map).map((c) => ({
      ...c,
      isRepeat: c.orders.length > 1,
      isVIP: c.totalSpent >= 2000 || c.orders.length >= 3,
    }));

    return list.sort((a, b) => b.totalSpent - a.totalSpent);
  }, [orders]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return customers.filter((c) => {
      const matchSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        (c.email ?? "").toLowerCase().includes(q) ||
        (c.city ?? "").toLowerCase().includes(q);
      const matchFilter =
        filterType === "all" ||
        (filterType === "vip" && c.isVIP) ||
        (filterType === "repeat" && c.isRepeat);
      return matchSearch && matchFilter;
    });
  }, [customers, search, filterType]);

  const exportCSV = () => {
    const headers = ["Name", "Phone", "Email", "City", "State", "Pincode", "Total Orders", "Total Spent (INR)", "Last Order Date", "Is VIP"];
    const rows = filtered.map((c) => [
      `"${c.name}"`,
      `"${c.phone}"`,
      `"${c.email || ""}"`,
      `"${c.city || ""}"`,
      `"${c.state || ""}"`,
      `"${c.pincode || ""}"`,
      c.orders.length,
      c.totalSpent,
      `"${c.lastOrderDate}"`,
      c.isVIP ? "YES" : "NO",
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ghartika_customers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalCustomers = customers.length;
  const repeatCount = customers.filter((c) => c.isRepeat).length;
  const vipCount = customers.filter((c) => c.isVIP).length;
  const avgSpend = totalCustomers ? Math.round(customers.reduce((s, c) => s + c.totalSpent, 0) / totalCustomers) : 0;

  return (
    <div style={{ display: "grid", gap: 18 }}>
      {/* Top Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
        {[
          { label: "Total Customers", value: totalCustomers.toString(), icon: "👥" },
          { label: "Repeat Buyers", value: repeatCount.toString(), icon: "⭐" },
          { label: "VIP Customers", value: vipCount.toString(), icon: "👑" },
          { label: "Avg Spend / Customer", value: fmtINR(avgSpend), icon: "💰" },
        ].map((s, i) => (
          <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: "18px 20px" }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>{s.icon}</div>
            <p style={{ margin: 0, fontSize: 11, color: C.muted, fontWeight: 700, textTransform: "uppercase" }}>{s.label}</p>
            <p style={{ margin: "4px 0 0", fontSize: 22, fontWeight: 800, color: C.text }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search & Actions Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
          <Search style={{ width: 15, height: 15, position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: C.muted }} />
          <input
            type="text"
            placeholder="Search by customer name, phone, email, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: "100%", padding: "10px 12px 10px 36px", border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 13, outline: "none", background: C.surface, color: C.text, fontFamily: "var(--font-outfit), sans-serif", boxSizing: "border-box" }}
          />
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ display: "flex", gap: 6 }}>
            {(["all", "repeat", "vip"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilterType(tab)}
                style={{
                  padding: "8px 14px",
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  border: filterType === tab ? `1px solid ${C.red}` : `1px solid ${C.border}`,
                  background: filterType === tab ? C.red : C.surface,
                  color: filterType === tab ? "white" : C.text,
                  textTransform: "uppercase",
                  fontFamily: "var(--font-outfit), sans-serif",
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          <button
            onClick={exportCSV}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "9px 16px",
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 600,
              color: C.text,
              cursor: "pointer",
              fontFamily: "var(--font-outfit), sans-serif",
            }}
          >
            <Download style={{ width: 15, height: 15 }} /> Export CSV
          </button>
        </div>
      </div>

      {/* Customer List */}
      <div style={{ display: "grid", gap: 10 }}>
        {filtered.map((customer, idx) => (
          <div
            key={idx}
            onClick={() => setSelectedCustomer(customer)}
            style={{
              background: C.surface,
              border: `1px solid ${customer.isVIP ? "#fed7aa" : C.border}`,
              borderRadius: 16,
              padding: "16px 20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              cursor: "pointer",
              transition: "transform 0.15s ease",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: customer.isVIP ? "#f59e0b" : C.red,
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: 16,
                  flexShrink: 0,
                }}
              >
                {customer.name.charAt(0).toUpperCase()}
              </div>

              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontWeight: 800, fontSize: 15, color: C.text }}>
                    {customer.name}
                  </span>
                  {customer.isVIP && (
                    <span style={{ fontSize: 10, background: "#fef3c7", color: "#b45309", border: "1px solid #fde68a", padding: "2px 7px", borderRadius: 99, fontWeight: 700 }}>
                      👑 VIP Customer
                    </span>
                  )}
                  {customer.isRepeat && !customer.isVIP && (
                    <span style={{ fontSize: 10, background: "#ede9fe", color: "#6d28d9", border: "1px solid #ddd6fe", padding: "2px 7px", borderRadius: 99, fontWeight: 600 }}>
                      ⭐ Repeat
                    </span>
                  )}
                </div>

                <p style={{ margin: "3px 0 0", fontSize: 12, color: C.muted }}>
                  📞 {customer.phone} {customer.email ? `· ✉️ ${customer.email}` : ""} {customer.city ? `· 📍 ${customer.city}, ${customer.state || ""}` : ""}
                </p>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
              <div style={{ textAlign: "right" }}>
                <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: C.red }}>
                  {fmtINR(customer.totalSpent)}
                </p>
                <p style={{ margin: "2px 0 0", fontSize: 11, color: C.muted }}>
                  {customer.orders.length} order{customer.orders.length > 1 ? "s" : ""}
                </p>
              </div>
              <ChevronRight style={{ width: 18, height: 18, color: C.muted }} />
            </div>
          </div>
        ))}
      </div>

      {/* Customer Detail Drawer Modal */}
      {selectedCustomer && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", justifyContent: "flex-end" }}>
          <div style={{ width: "100%", maxWidth: 460, background: C.surface, height: "100%", padding: 28, overflowY: "auto", boxSizing: "border-box", display: "grid", alignContent: "start", gap: 20 }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: C.text }}>Customer Profile</h3>
              <button onClick={() => setSelectedCustomer(null)} style={{ background: "none", border: "none", cursor: "pointer", color: C.muted, padding: 4 }}>
                <X style={{ width: 20, height: 20 }} />
              </button>
            </div>

            {/* Profile Card */}
            <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 50, height: 50, borderRadius: "50%", background: selectedCustomer.isVIP ? "#f59e0b" : C.red, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 20 }}>
                  {selectedCustomer.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: C.text }}>{selectedCustomer.name}</h4>
                  <p style={{ margin: "2px 0 0", fontSize: 13, color: C.muted }}>{selectedCustomer.phone}</p>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 16, borderTop: `1px solid ${C.border}`, paddingTop: 14 }}>
                <div>
                  <span style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", fontWeight: 700 }}>Total Spent</span>
                  <p style={{ margin: "2px 0 0", fontSize: 18, fontWeight: 800, color: C.red }}>{fmtINR(selectedCustomer.totalSpent)}</p>
                </div>
                <div>
                  <span style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", fontWeight: 700 }}>Total Orders</span>
                  <p style={{ margin: "2px 0 0", fontSize: 18, fontWeight: 800, color: C.text }}>{selectedCustomer.orders.length}</p>
                </div>
              </div>

              {selectedCustomer.address && (
                <div style={{ marginTop: 12, fontSize: 12, color: C.muted, borderTop: `1px solid ${C.border}`, paddingTop: 10 }}>
                  <p style={{ margin: 0, fontWeight: 600, color: C.text }}>Delivery Address:</p>
                  <p style={{ margin: "3px 0 0" }}>{selectedCustomer.address}</p>
                  <p style={{ margin: "2px 0 0" }}>{selectedCustomer.city}, {selectedCustomer.state} — {selectedCustomer.pincode}</p>
                </div>
              )}
            </div>

            {/* Order History */}
            <div>
              <h4 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700, color: C.text }}>
                Order History ({selectedCustomer.orders.length})
              </h4>
              <div style={{ display: "grid", gap: 10 }}>
                {selectedCustomer.orders.map((ord) => (
                  <div key={ord.id} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, padding: "12px 14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{ord.id}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: "#e0f2fe", color: "#0369a1" }}>{ord.status}</span>
                    </div>
                    <p style={{ margin: "4px 0 0", fontSize: 11, color: C.muted }}>{fmtDate(ord.date)}</p>
                    <div style={{ margin: "6px 0", fontSize: 12, color: C.text }}>
                      {ord.items.map((it) => `${it.name} (${it.quantity}x)`).join(", ")}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: `1px solid ${C.border}`, paddingTop: 6, marginTop: 6 }}>
                      <span style={{ fontSize: 11, color: C.muted }}>{ord.paymentMethod ?? "COD"}</span>
                      <span style={{ fontSize: 13, fontWeight: 800, color: C.red }}>{fmtINR(ord.total)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
