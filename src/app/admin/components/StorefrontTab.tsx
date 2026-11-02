"use client";

import { useState, useEffect } from "react";
import type { StoreSettings } from "@/types";
import {
  Store, Save, RefreshCw, CheckCircle2, Megaphone,
  Truck, Phone, Sparkles,
} from "lucide-react";
import { C } from "./AdminShell";

export function StorefrontTab() {
  const [settings, setSettings] = useState<StoreSettings>({
    storeName: "GharTika Spices",
    announcementText: "🌿 100% Shuddh & Taaza Masale — Free delivery on orders above ₹499!",
    announcementActive: true,
    announcementLink: "/shop",
    heroHeadline: "Ghar Ka Asli Swaad",
    heroSubheadline: "Stone ground, pesticide-free pure Indian spices delivered fresh to your doorstep.",
    contactPhone: "+91 98765 43210",
    contactEmail: "support@ghartika.in",
    freeShippingThreshold: 499,
    enableCod: true,
    enableOnlinePayment: true,
    maintenanceMode: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2200);
  };

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data) setSettings(data);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error("Failed to save");
      showToast("Storefront settings updated! 🌿");
    } catch {
      showToast("Error saving settings");
    } finally {
      setSaving(false);
    }
  };

  const inpStyle: React.CSSProperties = {
    width: "100%", padding: "10px 14px", border: `1px solid ${C.border}`,
    borderRadius: 10, fontSize: 13, outline: "none", background: C.bg,
    color: C.text, fontFamily: "var(--font-outfit), sans-serif", boxSizing: "border-box",
  };
  const lblStyle: React.CSSProperties = {
    display: "block", fontSize: 11, fontWeight: 700, color: C.muted,
    marginBottom: 6, textTransform: "uppercase",
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: 60, color: C.muted }}>
        <RefreshCw style={{ width: 32, height: 32, margin: "0 auto 10px", animation: "adminSpin 0.8s linear infinite" }} />
        <p style={{ fontWeight: 600 }}>Loading storefront settings...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 760, display: "grid", gap: 20 }}>
      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, background: "#1a1008", color: "white", padding: "10px 20px", borderRadius: 10, fontSize: 13, fontWeight: 600, zIndex: 999, boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <div>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: C.text, display: "flex", alignItems: "center", gap: 8 }}>
          <Store style={{ width: 20, height: 20, color: C.red }} /> Storefront & Announcement Manager
        </h2>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: C.muted }}>
          Control live banners, announcement ticker, and delivery settings directly from here
        </p>
      </div>

      <form onSubmit={handleSave} style={{ display: "grid", gap: 18 }}>
        {/* Announcement Bar Section */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.text, display: "flex", alignItems: "center", gap: 6 }}>
              <Megaphone style={{ width: 16, height: 16, color: C.red }} /> Top Announcement Bar
            </h3>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: C.text, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={settings.announcementActive}
                onChange={(e) => setSettings({ ...settings, announcementActive: e.target.checked })}
              />
              Show on Website
            </label>
          </div>

          <div style={{ display: "grid", gap: 14 }}>
            <div>
              <label style={lblStyle}>Announcement Message</label>
              <input
                style={inpStyle}
                value={settings.announcementText}
                onChange={(e) => setSettings({ ...settings, announcementText: e.target.value })}
                placeholder="e.g. Free shipping on all spice orders above ₹499!"
              />
            </div>
            <div>
              <label style={lblStyle}>Click Link (optional)</label>
              <input
                style={inpStyle}
                value={settings.announcementLink ?? ""}
                onChange={(e) => setSettings({ ...settings, announcementLink: e.target.value })}
                placeholder="/shop"
              />
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: C.text, display: "flex", alignItems: "center", gap: 6 }}>
            <Sparkles style={{ width: 16, height: 16, color: C.gold }} /> Homepage Hero Banner
          </h3>
          <div style={{ display: "grid", gap: 14 }}>
            <div>
              <label style={lblStyle}>Main Headline</label>
              <input
                style={inpStyle}
                value={settings.heroHeadline}
                onChange={(e) => setSettings({ ...settings, heroHeadline: e.target.value })}
                placeholder="Ghar Ka Asli Swaad"
              />
            </div>
            <div>
              <label style={lblStyle}>Subheadline / Tagline</label>
              <textarea
                style={{ ...inpStyle, minHeight: 70, resize: "vertical" }}
                value={settings.heroSubheadline}
                onChange={(e) => setSettings({ ...settings, heroSubheadline: e.target.value })}
                placeholder="Short inspiring description of Ghartika spices..."
              />
            </div>
          </div>
        </div>

        {/* Shipping & Contact Settings */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: C.text, display: "flex", alignItems: "center", gap: 6 }}>
            <Truck style={{ width: 16, height: 16, color: "#0284c7" }} /> Shipping & Store Contact
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={lblStyle}>Free Shipping Threshold (₹)</label>
              <input
                style={inpStyle}
                type="number"
                min={0}
                value={settings.freeShippingThreshold}
                onChange={(e) => setSettings({ ...settings, freeShippingThreshold: Number(e.target.value) })}
              />
            </div>
            <div>
              <label style={lblStyle}>Support WhatsApp / Phone</label>
              <input
                style={inpStyle}
                value={settings.contactPhone}
                onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
              />
            </div>
            <div style={{ gridColumn: "span 2" }}>
              <label style={lblStyle}>Support Email Address</label>
              <input
                style={inpStyle}
                value={settings.contactEmail}
                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Business & Legal Information (GST / FSSAI) */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: C.text, display: "flex", alignItems: "center", gap: 6 }}>
            🏛️ Business Legal & Invoicing Info
          </h3>
          <p style={{ margin: "0 0 16px", fontSize: 12, color: C.muted }}>
            Yeh details automatically tax invoices aur packing slips par print hongi.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={lblStyle}>Store / Business Name</label>
              <input
                style={inpStyle}
                value={settings.storeName || ""}
                onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                placeholder="Ghartika Pure Spices"
              />
            </div>
            <div>
              <label style={lblStyle}>GSTIN Number (Tax ID)</label>
              <input
                style={inpStyle}
                value={settings.gstin || ""}
                onChange={(e) => setSettings({ ...settings, gstin: e.target.value.toUpperCase() })}
                placeholder="23AAAAA0000A1Z5"
              />
            </div>
            <div>
              <label style={lblStyle}>FSSAI License Number (Mandatory for Spices)</label>
              <input
                style={inpStyle}
                value={settings.fssaiNumber || ""}
                onChange={(e) => setSettings({ ...settings, fssaiNumber: e.target.value })}
                placeholder="10023043000123"
              />
            </div>
            <div>
              <label style={lblStyle}>Instagram Handle / URL</label>
              <input
                style={inpStyle}
                value={settings.instagramUrl || ""}
                onChange={(e) => setSettings({ ...settings, instagramUrl: e.target.value })}
                placeholder="https://instagram.com/ghartikaspices"
              />
            </div>
            <div style={{ gridColumn: "span 2" }}>
              <label style={lblStyle}>Registered Business Address</label>
              <textarea
                style={{ ...inpStyle, minHeight: 60 }}
                value={settings.registeredAddress || ""}
                onChange={(e) => setSettings({ ...settings, registeredAddress: e.target.value })}
                placeholder="12 Commercial Area, Indore, Madhya Pradesh — 452001"
              />
            </div>
          </div>
        </div>

        {/* Payment & Store Operations Toggles */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: C.text, display: "flex", alignItems: "center", gap: 6 }}>
            ⚙️ Payment Modes & Operations
          </h3>
          <div style={{ display: "grid", gap: 14 }}>
            <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", background: C.bg, padding: "12px 16px", borderRadius: 12, border: `1px solid ${C.border}` }}>
              <div>
                <span style={{ fontWeight: 700, fontSize: 13, color: C.text }}>Cash on Delivery (COD)</span>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: C.muted }}>Allow customers to pay cash upon order arrival</p>
              </div>
              <input
                type="checkbox"
                checked={settings.enableCod !== false}
                onChange={(e) => setSettings({ ...settings, enableCod: e.target.checked })}
              />
            </label>

            <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", background: C.bg, padding: "12px 16px", borderRadius: 12, border: `1px solid ${C.border}` }}>
              <div>
                <span style={{ fontWeight: 700, fontSize: 13, color: C.text }}>Online Payments (Razorpay UPI/Cards)</span>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: C.muted }}>Allow instantaneous digital payments</p>
              </div>
              <input
                type="checkbox"
                checked={settings.enableOnlinePayment !== false}
                onChange={(e) => setSettings({ ...settings, enableOnlinePayment: e.target.checked })}
              />
            </label>

            <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", background: settings.maintenanceMode ? "#fee2e2" : C.bg, padding: "12px 16px", borderRadius: 12, border: `1px solid ${settings.maintenanceMode ? "#fecaca" : C.border}` }}>
              <div>
                <span style={{ fontWeight: 700, fontSize: 13, color: settings.maintenanceMode ? "#dc2626" : C.text }}>Maintenance Mode</span>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: C.muted }}>Temporarily pause storefront checkouts for maintenance</p>
              </div>
              <input
                type="checkbox"
                checked={Boolean(settings.maintenanceMode)}
                onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
              />
            </label>
          </div>
        </div>

        {/* Save button */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 28px",
              background: C.red,
              color: "white",
              border: "none",
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 700,
              cursor: saving ? "not-allowed" : "pointer",
              boxShadow: "0 4px 14px rgba(160,28,44,0.3)",
              fontFamily: "var(--font-outfit), sans-serif",
            }}
          >
            <Save style={{ width: 16, height: 16 }} />
            {saving ? "Saving Changes..." : "Save Storefront Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
