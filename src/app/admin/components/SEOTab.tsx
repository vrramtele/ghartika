"use client";

import { useState, useEffect } from "react";
import type { SEOPageMeta } from "@/types";
import {
  Globe, Search, CheckCircle2, AlertCircle, Save, ExternalLink,
  Share2, ShieldCheck, FileCode, Check
} from "lucide-react";
import { C } from "./AdminShell";

export function SEOTab() {
  const [pages, setPages] = useState<SEOPageMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPageId, setSelectedPageId] = useState<string>("home");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  useEffect(() => {
    fetch("/api/seo")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setPages(data);
          setSelectedPageId(data[0].id);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const activePage = pages.find((p) => p.id === selectedPageId) || pages[0];

  const updateActivePageField = (field: keyof SEOPageMeta, value: string) => {
    if (!activePage) return;
    setPages((prev) =>
      prev.map((p) => (p.id === activePage.id ? { ...p, [field]: value } : p))
    );
  };

  const handleSave = async () => {
    if (!activePage) return;
    setSaving(true);
    try {
      const res = await fetch("/api/seo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(activePage),
      });
      if (!res.ok) throw new Error("Save failed");
      showToast("✅ SEO metadata updated successfully");
    } catch {
      showToast("❌ Failed to save SEO metadata");
    } finally {
      setSaving(false);
    }
  };

  // SEO Score calculation
  const titleLen = activePage?.seoTitle?.length || 0;
  const descLen = activePage?.seoDescription?.length || 0;
  const titleScore = titleLen >= 30 && titleLen <= 65 ? 100 : titleLen > 0 ? 60 : 0;
  const descScore = descLen >= 120 && descLen <= 165 ? 100 : descLen > 0 ? 60 : 0;
  const canonicalScore = activePage?.canonicalUrl ? 100 : 50;
  const ogScore = activePage?.ogTitle && activePage?.ogImage ? 100 : 40;
  const overallScore = Math.round((titleScore * 0.35) + (descScore * 0.35) + (canonicalScore * 0.15) + (ogScore * 0.15));

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 300, color: C.muted }}>
        <p>Loading SEO Manager...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", paddingBottom: 60 }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 24, right: 24, background: "#1A1008", color: "#FFF",
          padding: "12px 24px", borderRadius: 12, boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
          zIndex: 9999, fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 8,
        }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: C.text, margin: 0, display: "flex", alignItems: "center", gap: 10 }}>
            <Globe style={{ width: 26, height: 26, color: C.red }} /> SEO & Metadata Manager
          </h2>
          <p style={{ color: C.muted, fontSize: 14, marginTop: 4 }}>
            Control Google search snippets, Open Graph social previews, canonical URLs and indexing robots.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              display: "flex", alignItems: "center", gap: 8, background: C.red, color: "white",
              border: "none", borderRadius: 10, padding: "10px 20px", fontWeight: 700, fontSize: 14,
              cursor: saving ? "not-allowed" : "pointer", boxShadow: "0 4px 14px rgba(160,28,44,0.25)",
            }}
          >
            <Save style={{ width: 16, height: 16 }} />
            {saving ? "Saving..." : "Save Meta Tags"}
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 24 }}>
        {/* Left Column: Page Selection */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 16 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: C.muted, textTransform: "uppercase", margin: "0 0 12px 8px" }}>
            Storefront Pages
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {pages.map((p) => {
              const isSelected = p.id === activePage?.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedPageId(p.id)}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "10px 14px", borderRadius: 10, border: "none", textAlign: "left",
                    background: isSelected ? "rgba(160,28,44,0.08)" : "transparent",
                    color: isSelected ? C.red : C.text,
                    fontWeight: isSelected ? 700 : 500,
                    cursor: "pointer", transition: "all 0.15s ease",
                  }}
                >
                  <span style={{ fontSize: 14 }}>{p.id.toUpperCase()} Page</span>
                  <span style={{ fontSize: 11, padding: "2px 6px", borderRadius: 6, background: isSelected ? C.red : C.border, color: isSelected ? "white" : C.muted }}>
                    {p.path}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Technical SEO Status */}
          <div style={{ marginTop: 24, paddingTop: 16, borderTop: `1px solid ${C.border}` }}>
            <h4 style={{ fontSize: 12, fontWeight: 700, color: C.muted, textTransform: "uppercase", margin: "0 0 10px" }}>
              Technical Signals
            </h4>
            <div style={{ display: "grid", gap: 8, fontSize: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: C.text }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <CheckCircle2 style={{ width: 14, height: 14, color: "#16a34a" }} /> Sitemap
                </span>
                <span style={{ color: C.muted }}>/sitemap.xml</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: C.text }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <CheckCircle2 style={{ width: 14, height: 14, color: "#16a34a" }} /> Robots
                </span>
                <span style={{ color: C.muted }}>/robots.txt</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: C.text }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <CheckCircle2 style={{ width: 14, height: 14, color: "#16a34a" }} /> Structured Data
                </span>
                <span style={{ color: "#16a34a", fontWeight: 600 }}>Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Editor & Previews */}
        {activePage && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* SEO Health Card */}
            <div style={{
              background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20,
              display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16,
            }}>
              <div>
                <span style={{ fontSize: 12, fontWeight: 700, color: C.muted, textTransform: "uppercase" }}>Optimization Score</span>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
                  <span style={{ fontSize: 32, fontWeight: 900, color: overallScore >= 80 ? "#16a34a" : overallScore >= 50 ? "#d97706" : C.red }}>
                    {overallScore}%
                  </span>
                  <span style={{ fontSize: 13, color: C.muted }}>
                    {overallScore >= 80 ? "✨ Search engines will love this snippet" : "⚠️ Needs title or description improvements"}
                  </span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 14, fontSize: 12 }}>
                <span style={{ color: titleLen >= 30 && titleLen <= 65 ? "#16a34a" : "#d97706" }}>
                  Title: {titleLen}/60 chars
                </span>
                <span style={{ color: descLen >= 120 && descLen <= 165 ? "#16a34a" : "#d97706" }}>
                  Meta Desc: {descLen}/160 chars
                </span>
              </div>
            </div>

            {/* Google SERP Preview */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                  <Search style={{ width: 16, height: 16, color: "#1d4ed8" }} /> Google Search Live Preview
                </h3>
                <div style={{ display: "flex", background: C.bg, padding: 2, borderRadius: 8, border: `1px solid ${C.border}` }}>
                  <button
                    onClick={() => setPreviewDevice("desktop")}
                    style={{
                      padding: "4px 10px", fontSize: 11, fontWeight: 600, border: "none", borderRadius: 6,
                      background: previewDevice === "desktop" ? C.surface : "transparent",
                      color: previewDevice === "desktop" ? C.text : C.muted, cursor: "pointer",
                    }}
                  >
                    Desktop
                  </button>
                  <button
                    onClick={() => setPreviewDevice("mobile")}
                    style={{
                      padding: "4px 10px", fontSize: 11, fontWeight: 600, border: "none", borderRadius: 6,
                      background: previewDevice === "mobile" ? C.surface : "transparent",
                      color: previewDevice === "mobile" ? C.text : C.muted, cursor: "pointer",
                    }}
                  >
                    Mobile
                  </button>
                </div>
              </div>

              {/* Snippet box */}
              <div style={{
                background: "#ffffff", border: "1px solid #dfe1e5", borderRadius: previewDevice === "mobile" ? 16 : 8,
                padding: 18, maxWidth: previewDevice === "mobile" ? 360 : 600, boxShadow: "0 1px 6px rgba(32,33,36,0.08)",
                fontFamily: "Arial, sans-serif",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <div style={{ width: 18, height: 18, borderRadius: "50%", background: C.red, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 9, fontWeight: 800 }}>
                    G
                  </div>
                  <div style={{ fontSize: 12, color: "#202124", lineHeight: "16px" }}>
                    <div style={{ fontWeight: 400 }}>GharTika Spices</div>
                    <div style={{ fontSize: 11, color: "#4d5156" }}>
                      {activePage.canonicalUrl || `https://ghartika.com${activePage.path}`}
                    </div>
                  </div>
                </div>
                <h4 style={{
                  color: "#1a0dab", fontSize: previewDevice === "mobile" ? 16 : 18, fontWeight: 400,
                  margin: "6px 0 4px", lineHeight: "1.3", cursor: "pointer",
                  textDecoration: "hover: underline",
                }}>
                  {activePage.seoTitle || "No title defined yet — please enter a page title"}
                </h4>
                <p style={{ color: "#4d5156", fontSize: 13, lineHeight: "1.5", margin: 0 }}>
                  {activePage.seoDescription || "Please add a meta description to control what potential buyers read when seeing GharTika in Google results."}
                </p>
              </div>
            </div>

            {/* Social Media Card Preview */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: "0 0 16px", display: "flex", alignItems: "center", gap: 8 }}>
                <Share2 style={{ width: 16, height: 16, color: "#10b981" }} /> Social Share Card (Open Graph)
              </h3>
              <div style={{
                maxWidth: 480, border: "1px solid #e1e8ed", borderRadius: 12, overflow: "hidden",
                background: "#F8FAFC", boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              }}>
                <div style={{
                  height: 180, background: activePage.ogImage ? `url(${activePage.ogImage}) center/cover no-repeat` : "#1A1008",
                  display: "flex", alignItems: "center", justifyContent: "center", color: "white", position: "relative"
                }}>
                  {!activePage.ogImage && (
                    <span style={{ fontSize: 14, opacity: 0.6 }}>No OG Banner Image Configured</span>
                  )}
                  <span style={{ position: "absolute", bottom: 8, right: 8, background: "rgba(0,0,0,0.6)", color: "white", fontSize: 10, padding: "2px 8px", borderRadius: 4 }}>
                    ghartika.com
                  </span>
                </div>
                <div style={{ padding: 14, background: "white" }}>
                  <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", fontWeight: 700 }}>ghartika.com</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginTop: 4 }}>
                    {activePage.ogTitle || activePage.seoTitle || "GharTika Spices"}
                  </div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 4, lineClamp: 2, overflow: "hidden" }}>
                    {activePage.ogDescription || activePage.seoDescription || "Pure stone-ground spices crafted for authentic Indian kitchens."}
                  </div>
                </div>
              </div>
            </div>

            {/* Meta Tags Form Fields */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: C.text, margin: "0 0 20px" }}>
                Edit Metadata for {activePage.path}
              </h3>
              <div style={{ display: "grid", gap: 16 }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: C.text }}>SEO Title Tag</label>
                    <span style={{ fontSize: 12, color: titleLen > 65 ? C.red : C.muted }}>{titleLen}/65 characters</span>
                  </div>
                  <input
                    type="text"
                    value={activePage.seoTitle || ""}
                    onChange={(e) => updateActivePageField("seoTitle", e.target.value)}
                    style={{
                      width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${C.border}`,
                      fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit"
                    }}
                  />
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Meta Description</label>
                    <span style={{ fontSize: 12, color: descLen > 165 ? C.red : C.muted }}>{descLen}/165 characters</span>
                  </div>
                  <textarea
                    rows={3}
                    value={activePage.seoDescription || ""}
                    onChange={(e) => updateActivePageField("seoDescription", e.target.value)}
                    style={{
                      width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${C.border}`,
                      fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit", resize: "vertical"
                    }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: C.text, display: "block", marginBottom: 6 }}>
                      Canonical URL
                    </label>
                    <input
                      type="url"
                      value={activePage.canonicalUrl || ""}
                      onChange={(e) => updateActivePageField("canonicalUrl", e.target.value)}
                      placeholder="https://ghartika.com/"
                      style={{
                        width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${C.border}`,
                        fontSize: 13, outline: "none", boxSizing: "border-box"
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: C.text, display: "block", marginBottom: 6 }}>
                      Robots Directive
                    </label>
                    <select
                      value={activePage.robotsDirective || "index,follow"}
                      onChange={(e) => updateActivePageField("robotsDirective", e.target.value)}
                      style={{
                        width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${C.border}`,
                        fontSize: 13, outline: "none", boxSizing: "border-box", background: "white"
                      }}
                    >
                      <option value="index,follow">index, follow (Normal indexing)</option>
                      <option value="noindex,nofollow">noindex, nofollow (Private/Admin)</option>
                      <option value="noindex,follow">noindex, follow (Category filters)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: C.text, display: "block", marginBottom: 6 }}>
                    Open Graph Banner Image URL
                  </label>
                  <input
                    type="text"
                    value={activePage.ogImage || ""}
                    onChange={(e) => updateActivePageField("ogImage", e.target.value)}
                    placeholder="/images/og-banner.jpg or https://res.cloudinary.com/..."
                    style={{
                      width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${C.border}`,
                      fontSize: 13, outline: "none", boxSizing: "border-box"
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
