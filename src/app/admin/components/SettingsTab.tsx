"use client";

import { useState, useEffect } from "react";
import type { StoreSettings } from "@/types";
import {
  Settings, Save, Shield, Truck, CreditCard, Phone, Mail,
  AlertTriangle, Download, CheckCircle2, Lock, Store, QrCode, Eye, EyeOff, Zap, ExternalLink
} from "lucide-react";
import { C } from "./AdminShell";

const DEFAULT_SETTINGS: StoreSettings = {
  storeName: "GharTika Spices",
  gstin: "23AAAAA0000A1Z5",
  fssaiNumber: "10021051000123",
  registeredAddress: "GharTika Spices, Plot 14, Industrial Area, Indore, MP - 452001",
  announcementText: "🌿 Free Shipping on all orders above ₹499 | Authentic Stone-Ground Spices",
  announcementActive: true,
  announcementLink: "/#shop",
  heroHeadline: "Pure, Authentic Indian Spices",
  heroSubheadline: "Stone-ground with love. Delivered fresh to your kitchen.",
  contactPhone: "+91 98765 43210",
  contactEmail: "care@ghartika.com",
  freeShippingThreshold: 499,
  enableCod: true,
  enableOnlinePayment: true,
  enableUpiQr: true,
  upiId: "rytvishal@okicici",
  upiName: "Ghartika Spices",
  razorpayKeyId: "",
  razorpayKeySecret: "",
  maintenanceMode: false,
  instagramUrl: "https://instagram.com/ghartikaspices",
  whatsappSupport: "919876543210",
};

export function SettingsTab() {
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [toast, setToast] = useState("");
  const [exporting, setExporting] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data && typeof data === "object") {
          setSettings((prev) => ({ ...prev, ...data }));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (field: keyof StoreSettings, value: unknown) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error("Failed to save");
      showToast("✅ Settings updated successfully");
    } catch {
      showToast("❌ Error saving settings");
    } finally {
      setSaving(false);
    }
  };

  const handleExportBackup = async () => {
    setExporting(true);
    try {
      const [ordersRes, prodsRes] = await Promise.all([
        fetch("/api/orders").then((r) => r.json()).catch(() => []),
        fetch("/api/products").then((r) => r.json()).catch(() => []),
      ]);

      const backupData = {
        exportDate: new Date().toISOString(),
        store: settings.storeName,
        orders: ordersRes,
        products: prodsRes,
        settings,
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ghartika-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast("📦 Backup downloaded");
    } catch {
      showToast("❌ Export failed");
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: C.muted }}>
        Loading store settings...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", paddingBottom: 60 }}>
      {toast && (
        <div style={{
          position: "fixed", bottom: 24, right: 24, background: "#1A1008", color: "#FFF",
          padding: "12px 24px", borderRadius: 12, boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
          zIndex: 9999, fontSize: 14, fontWeight: 600,
        }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: C.text, margin: 0, display: "flex", alignItems: "center", gap: 10 }}>
            <Settings style={{ width: 26, height: 26, color: C.red }} /> Store Settings & Preferences
          </h2>
          <p style={{ color: C.muted, fontSize: 14, marginTop: 4 }}>
            Configure store business details, payment options, shipping rules, and backup your store data.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={handleExportBackup}
            disabled={exporting}
            style={{
              display: "flex", alignItems: "center", gap: 6, background: "white", color: C.text,
              border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 16px", fontWeight: 600, fontSize: 13,
              cursor: exporting ? "not-allowed" : "pointer",
            }}
          >
            <Download style={{ width: 15, height: 15, color: C.muted }} />
            {exporting ? "Exporting..." : "Export Store Backup"}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              display: "flex", alignItems: "center", gap: 8, background: C.red, color: "white",
              border: "none", borderRadius: 10, padding: "10px 22px", fontWeight: 700, fontSize: 14,
              cursor: saving ? "not-allowed" : "pointer", boxShadow: "0 4px 14px rgba(160,28,44,0.25)",
            }}
          >
            <Save style={{ width: 16, height: 16 }} />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} style={{ display: "grid", gap: 24 }}>
        {/* Business & Legal Credentials */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: C.text, margin: "0 0 16px", display: "flex", alignItems: "center", gap: 8 }}>
            <Store style={{ width: 18, height: 18, color: C.red }} /> Business Identification & Legal
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: C.text, display: "block", marginBottom: 6 }}>
                Store Brand Name
              </label>
              <input
                type="text"
                value={settings.storeName || ""}
                onChange={(e) => handleChange("storeName", e.target.value)}
                style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 14, boxSizing: "border-box" }}
              />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: C.text, display: "block", marginBottom: 6 }}>
                GSTIN (Tax Identification)
              </label>
              <input
                type="text"
                value={settings.gstin || ""}
                onChange={(e) => handleChange("gstin", e.target.value)}
                placeholder="23AAAAA0000A1Z5"
                style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 14, boxSizing: "border-box" }}
              />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: C.text, display: "block", marginBottom: 6 }}>
                FSSAI License Number
              </label>
              <input
                type="text"
                value={settings.fssaiNumber || ""}
                onChange={(e) => handleChange("fssaiNumber", e.target.value)}
                placeholder="14-digit FSSAI Number"
                style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 14, boxSizing: "border-box" }}
              />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: C.text, display: "block", marginBottom: 6 }}>
                Registered Business Address
              </label>
              <input
                type="text"
                value={settings.registeredAddress || ""}
                onChange={(e) => handleChange("registeredAddress", e.target.value)}
                style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 14, boxSizing: "border-box" }}
              />
            </div>
          </div>
        </div>

        {/* Shipping & Payment Options */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: C.text, margin: "0 0 16px", display: "flex", alignItems: "center", gap: 8 }}>
            <Truck style={{ width: 18, height: 18, color: "#1d4ed8" }} /> Payment & Checkout Policies
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: C.text, display: "block", marginBottom: 6 }}>
                Free Shipping Threshold (₹)
              </label>
              <input
                type="number"
                value={settings.freeShippingThreshold || 499}
                onChange={(e) => handleChange("freeShippingThreshold", Number(e.target.value))}
                style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 14, boxSizing: "border-box" }}
              />
              <span style={{ fontSize: 11, color: C.muted, marginTop: 4, display: "block" }}>
                Orders above this amount qualify for zero delivery fee.
              </span>
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: C.text, display: "block", marginBottom: 10 }}>
                Payment Methods Supported
              </label>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: C.text, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={settings.enableCod !== false}
                    onChange={(e) => handleChange("enableCod", e.target.checked)}
                    style={{ accentColor: C.red, width: 16, height: 16 }}
                  />
                  Enable Cash on Delivery (COD)
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: C.text, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={settings.enableOnlinePayment !== false}
                    onChange={(e) => handleChange("enableOnlinePayment", e.target.checked)}
                    style={{ accentColor: C.red, width: 16, height: 16 }}
                  />
                  Enable Razorpay (Cards, NetBanking, Wallets, Auto-UPI)
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: C.text, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={settings.enableUpiQr !== false}
                    onChange={(e) => handleChange("enableUpiQr", e.target.checked)}
                    style={{ accentColor: C.red, width: 16, height: 16 }}
                  />
                  Enable Direct UPI Scan & Pay (0% Fee, Direct to Bank QR)
                </label>
              </div>
            </div>
          </div>

          {/* Razorpay Gateway Keys Configuration */}
          <div style={{ marginTop: 20, paddingTop: 20, borderTop: `1px solid ${C.border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <CreditCard style={{ width: 18, height: 18, color: C.red }} />
                <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Razorpay Payment Gateway API Keys</span>
              </div>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20,
                background: settings.razorpayKeyId?.startsWith("rzp_live_") ? "#DCFCE7" : "#FEF3C7",
                color: settings.razorpayKeyId?.startsWith("rzp_live_") ? "#15803D" : "#B45309",
                display: "inline-flex", alignItems: "center", gap: 5,
              }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: settings.razorpayKeyId?.startsWith("rzp_live_") ? "#16A34A" : "#D97706" }} />
                {settings.razorpayKeyId?.startsWith("rzp_live_") ? "LIVE MODE ACTIVE" : "TEST / DEV MODE"}
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: C.text, display: "block", marginBottom: 6 }}>
                  Razorpay Key ID
                </label>
                <input
                  type="text"
                  placeholder="rzp_live_xxxxxxxxxxxx or rzp_test_xxxxxxxxxxxx"
                  value={settings.razorpayKeyId || ""}
                  onChange={(e) => handleChange("razorpayKeyId", e.target.value.trim())}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 13, boxSizing: "border-box", fontFamily: "monospace" }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: C.text, display: "block", marginBottom: 6 }}>
                  Razorpay Key Secret
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showSecret ? "text" : "password"}
                    placeholder="Enter your Razorpay Key Secret"
                    value={settings.razorpayKeySecret || ""}
                    onChange={(e) => handleChange("razorpayKeySecret", e.target.value.trim())}
                    style={{ width: "100%", padding: "10px 40px 10px 14px", borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 13, boxSizing: "border-box", fontFamily: "monospace" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: C.muted }}
                  >
                    {showSecret ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
                  </button>
                </div>
              </div>
            </div>
            <p style={{ fontSize: 11, color: C.muted, marginTop: 8, margin: "8px 0 0" }}>
              💡 Keys can be found in <a href="https://dashboard.razorpay.com/app/keys" target="_blank" rel="noreferrer" style={{ color: C.red, textDecoration: "underline" }}>Razorpay Dashboard &gt; Account &amp; Settings &gt; API Keys</a>. Once you paste live keys here and click Save Settings, the store immediately switches to live payments.
            </p>
          </div>

          {/* Direct UPI Scan & Pay Configuration */}
          <div style={{ marginTop: 20, paddingTop: 20, borderTop: `1px solid ${C.border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <QrCode style={{ width: 18, height: 18, color: "#16a34a" }} />
                <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Direct UPI QR &amp; VPA Configuration</span>
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, color: "#16a34a", background: "#DCFCE7", padding: "3px 8px", borderRadius: 6 }}>
                0% Gateway Fee • Direct to Bank
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: C.text, display: "block", marginBottom: 6 }}>
                  Store UPI ID (VPA)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 9876543210@ybl, ghartika@okaxis, or name@paytm"
                  value={settings.upiId || ""}
                  onChange={(e) => handleChange("upiId", e.target.value.trim())}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 13, boxSizing: "border-box", fontFamily: "monospace" }}
                />
                <span style={{ fontSize: 11, color: C.muted, marginTop: 4, display: "block" }}>
                  Customer QR scan karega toh paise sidhe is UPI ID se jude bank account me jayenge.
                </span>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: C.text, display: "block", marginBottom: 6 }}>
                  Payee Display Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. GharTika Spices"
                  value={settings.upiName || ""}
                  onChange={(e) => handleChange("upiName", e.target.value)}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 13, boxSizing: "border-box" }}
                />
                <span style={{ fontSize: 11, color: C.muted, marginTop: 4, display: "block" }}>
                  Google Pay ya PhonePe me customer ko ye business name dikhega.
                </span>
              </div>
            </div>

            {settings.upiId && (
              <div style={{ marginTop: 14, padding: 12, borderRadius: 10, background: "#F8F7F4", border: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 16 }}>
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(`upi://pay?pa=${settings.upiId}&pn=${encodeURIComponent(settings.upiName || "Ghartika Spices")}&cu=INR`)}`}
                  alt="UPI QR Preview"
                  style={{ width: 80, height: 80, borderRadius: 8, background: "#FFF", padding: 4, border: `1px solid ${C.border}` }}
                />
                <div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: C.text }}>Live UPI QR Preview Active</p>
                  <p style={{ margin: "4px 0 0", fontSize: 12, color: C.muted }}>
                    UPI ID: <strong>{settings.upiId}</strong> ({settings.upiName || "Ghartika Spices"})
                  </p>
                  <p style={{ margin: "4px 0 0", fontSize: 11, color: "#16a34a", fontWeight: 600 }}>
                    ✓ Customers can scan this QR directly from GPay, PhonePe, Paytm, or BHIM.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Contact & Support */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: C.text, margin: "0 0 16px", display: "flex", alignItems: "center", gap: 8 }}>
            <Phone style={{ width: 18, height: 18, color: "#16a34a" }} /> Customer Contact & Social
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: C.text, display: "block", marginBottom: 6 }}>
                Customer Care Phone
              </label>
              <input
                type="text"
                value={settings.contactPhone || ""}
                onChange={(e) => handleChange("contactPhone", e.target.value)}
                style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 14, boxSizing: "border-box" }}
              />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: C.text, display: "block", marginBottom: 6 }}>
                Customer Care Email
              </label>
              <input
                type="email"
                value={settings.contactEmail || ""}
                onChange={(e) => handleChange("contactEmail", e.target.value)}
                style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 14, boxSizing: "border-box" }}
              />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: C.text, display: "block", marginBottom: 6 }}>
                WhatsApp Support Number (with country code, no +)
              </label>
              <input
                type="text"
                value={settings.whatsappSupport || ""}
                onChange={(e) => handleChange("whatsappSupport", e.target.value)}
                placeholder="919876543210"
                style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 14, boxSizing: "border-box" }}
              />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: C.text, display: "block", marginBottom: 6 }}>
                Instagram Profile URL
              </label>
              <input
                type="url"
                value={settings.instagramUrl || ""}
                onChange={(e) => handleChange("instagramUrl", e.target.value)}
                placeholder="https://instagram.com/ghartikaspices"
                style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 14, boxSizing: "border-box" }}
              />
            </div>
          </div>
        </div>

        {/* Maintenance Mode Alert */}
        <div style={{
          background: settings.maintenanceMode ? "#FEF2F2" : C.surface,
          border: `1px solid ${settings.maintenanceMode ? "#FCA5A5" : C.border}`,
          borderRadius: 16, padding: 24,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: settings.maintenanceMode ? "#B91C1C" : C.text, margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                <AlertTriangle style={{ width: 18, height: 18, color: settings.maintenanceMode ? "#B91C1C" : "#D97706" }} />
                Store Maintenance Mode
              </h3>
              <p style={{ color: C.muted, fontSize: 13, margin: "4px 0 0" }}>
                When enabled, visitors will see a friendly &apos;Under Maintenance&apos; notice and will not be able to place new orders.
              </p>
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700, color: settings.maintenanceMode ? "#B91C1C" : C.text, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={settings.maintenanceMode || false}
                onChange={(e) => handleChange("maintenanceMode", e.target.checked)}
                style={{ accentColor: C.red, width: 18, height: 18 }}
              />
              {settings.maintenanceMode ? "Enabled (STORE OFFLINE)" : "Disabled (STORE LIVE)"}
            </label>
          </div>
        </div>
      </form>
    </div>
  );
}
