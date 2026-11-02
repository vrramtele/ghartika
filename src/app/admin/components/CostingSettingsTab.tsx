"use client";

import { useState, useEffect } from "react";
import type { CostingSettings } from "@/types";
import { SlidersHorizontal, Save, ShieldCheck, CheckCircle2, Percent, IndianRupee, Truck } from "lucide-react";
import { C } from "./AdminShell";

const DEFAULT_SETTINGS: CostingSettings = {
  defaultWastagePercent: 5,
  defaultGstPercent: 5,
  costRecognitionEvent: "on_order_placed",
  includePackagingInCOGS: true,
  paymentGatewayFeePercent: 2.0,
  avgShippingCostPerOrder: 45,
  currency: "INR",
};

export function CostingSettingsTab() {
  const [settings, setSettings] = useState<CostingSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  useEffect(() => {
    fetch("/api/costing/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data && typeof data === "object") setSettings((prev) => ({ ...prev, ...data }));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/costing/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error("Failed to save settings");
      showToast("✅ Costing settings updated");
    } catch {
      showToast("❌ Error saving settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: 40, textAlign: "center", color: C.muted }}>Loading costing configuration...</div>;
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", paddingBottom: 60 }}>
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
            <SlidersHorizontal style={{ width: 26, height: 26, color: C.red }} /> Cost Recognition & Calculation Settings
          </h2>
          <p style={{ color: C.muted, fontSize: 14, marginTop: 4 }}>
            Control inventory recognition milestones, default wastage allocations, and payment gateway expense splits.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            display: "flex", alignItems: "center", gap: 6, background: C.red, color: "white",
            border: "none", borderRadius: 10, padding: "10px 20px", fontWeight: 700, fontSize: 13,
            cursor: saving ? "not-allowed" : "pointer", boxShadow: "0 4px 14px rgba(160,28,44,0.25)",
          }}
        >
          <Save style={{ width: 16, height: 16 }} />
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>

      <form onSubmit={handleSave} style={{ display: "grid", gap: 24 }}>
        {/* Cost Recognition Event */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: C.text, margin: "0 0 8px" }}>
            Inventory Cost Recognition Milestone
          </h3>
          <p style={{ color: C.muted, fontSize: 13, margin: "0 0 16px" }}>
            When an order reaches this lifecycle event, an immutable cost snapshot is permanently recorded for each line item.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              { id: "on_order_placed", title: "On Order Placed (Default)", desc: "Locks COGS at the exact moment customer places the order." },
              { id: "on_order_confirmed", title: "On Order Confirmed", desc: "Recognizes COGS when payment or COD is verified by store." },
              { id: "on_order_shipped", title: "On Order Shipped", desc: "Recognizes COGS when parcel is handed over to courier." },
              { id: "on_order_delivered", title: "On Order Delivered", desc: "Recognizes COGS strictly upon successful delivery." },
            ].map((opt) => {
              const selected = settings.costRecognitionEvent === opt.id;
              return (
                <div
                  key={opt.id}
                  onClick={() => setSettings({ ...settings, costRecognitionEvent: opt.id as any })}
                  style={{
                    padding: 16, borderRadius: 12, border: `1px solid ${selected ? C.red : C.border}`,
                    background: selected ? "rgba(160,28,44,0.04)" : C.bg, cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 700, fontSize: 14, color: selected ? C.red : C.text }}>
                      {opt.title}
                    </span>
                    {selected && <CheckCircle2 style={{ width: 16, height: 16, color: C.red }} />}
                  </div>
                  <p style={{ margin: "6px 0 0", fontSize: 12, color: C.muted }}>
                    {opt.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Financial Allocations */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: C.text, margin: "0 0 16px" }}>
            Financial Overheads & Variable Selling Costs
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: C.text, display: "block", marginBottom: 6 }}>
                Payment Gateway Fee (%)
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={settings.paymentGatewayFeePercent}
                onChange={(e) => setSettings({ ...settings, paymentGatewayFeePercent: Number(e.target.value) })}
                style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 14, boxSizing: "border-box" }}
              />
              <span style={{ fontSize: 11, color: C.muted, marginTop: 4, display: "block" }}>
                Deducted from gross profit to compute Contribution Profit (~2.0% for Razorpay).
              </span>
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: C.text, display: "block", marginBottom: 6 }}>
                Default Production Wastage Allowance (%)
              </label>
              <input
                type="number"
                min="0"
                max="50"
                step="0.5"
                value={settings.defaultWastagePercent}
                onChange={(e) => setSettings({ ...settings, defaultWastagePercent: Number(e.target.value) })}
                style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 14, boxSizing: "border-box" }}
              />
              <span style={{ fontSize: 11, color: C.muted, marginTop: 4, display: "block" }}>
                Pre-filled when creating new raw spice recipes / milling batches.
              </span>
            </div>
          </div>
        </div>

        {/* Packaging Inclusion */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: 0 }}>
                Include Packaging Material Supplies in COGS
              </h3>
              <p style={{ color: C.muted, fontSize: 13, margin: "4px 0 0" }}>
                When enabled, pouches, labels, and cartons are bundled into the authoritative unit cost.
              </p>
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700, color: C.text, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={settings.includePackagingInCOGS !== false}
                onChange={(e) => setSettings({ ...settings, includePackagingInCOGS: e.target.checked })}
                style={{ accentColor: C.red, width: 18, height: 18 }}
              />
              {settings.includePackagingInCOGS ? "Enabled" : "Disabled"}
            </label>
          </div>
        </div>
      </form>
    </div>
  );
}
