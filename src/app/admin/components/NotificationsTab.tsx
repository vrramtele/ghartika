"use client";

import { useState, useEffect } from "react";
import type { AdminNotification, NotificationType } from "@/types";
import {
  Bell, CheckCheck, Package, ShoppingBag, Star, AlertTriangle,
  Info, ExternalLink, RefreshCw, Send, Trash2, Filter
} from "lucide-react";
import { C, AdminTab } from "./AdminShell";

interface Props {
  onNavigate?: (tab: AdminTab) => void;
  onRefreshBadge?: () => void;
}

export function NotificationsTab({ onNavigate, onRefreshBadge }: Props) {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("all");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [toast, setToast] = useState("");
  const [triggering, setTriggering] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const fetchNotifs = () => {
    setLoading(true);
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setNotifications(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const markRead = async (id: string) => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      if (onRefreshBadge) onRefreshBadge();
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_all_read" }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      showToast("✅ All marked as read");
      if (onRefreshBadge) onRefreshBadge();
    } catch {
      showToast("❌ Failed to update");
    }
  };

  const sendTestAlert = async () => {
    setTriggering(true);
    try {
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "system_alert",
          title: "System Diagnostic Test",
          message: "All operational notifications and webhooks are firing normally.",
          link: "health",
        }),
      });
      if (res.ok) {
        showToast("🔔 Test alert generated");
        fetchNotifs();
        if (onRefreshBadge) onRefreshBadge();
      }
    } catch {
      showToast("❌ Failed to trigger alert");
    } finally {
      setTriggering(false);
    }
  };

  const filteredNotifs = notifications.filter((n) => {
    if (unreadOnly && n.isRead) return false;
    if (filterType !== "all" && n.type !== filterType) return false;
    return true;
  });

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case "new_order":
        return <ShoppingBag style={{ width: 18, height: 18, color: "#16a34a" }} />;
      case "low_stock":
        return <Package style={{ width: 18, height: 18, color: "#d97706" }} />;
      case "new_review":
        return <Star style={{ width: 18, height: 18, color: "#eab308" }} />;
      case "abandoned_cart":
        return <ShoppingBag style={{ width: 18, height: 18, color: "#ef4444" }} />;
      default:
        return <AlertTriangle style={{ width: 18, height: 18, color: C.red }} />;
    }
  };

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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: C.text, margin: 0, display: "flex", alignItems: "center", gap: 10 }}>
            <Bell style={{ width: 26, height: 26, color: C.red }} /> Notifications & Alerts Center
          </h2>
          <p style={{ color: C.muted, fontSize: 14, marginTop: 4 }}>
            Real-time feed of new orders, stock alerts, reviews, and store events.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={sendTestAlert}
            disabled={triggering}
            style={{
              display: "flex", alignItems: "center", gap: 6, background: "white", color: C.text,
              border: `1px solid ${C.border}`, borderRadius: 10, padding: "9px 14px", fontWeight: 600, fontSize: 13,
              cursor: triggering ? "not-allowed" : "pointer",
            }}
          >
            <Send style={{ width: 14, height: 14, color: C.muted }} /> Test Alert
          </button>
          <button
            onClick={markAllRead}
            style={{
              display: "flex", alignItems: "center", gap: 6, background: C.red, color: "white",
              border: "none", borderRadius: 10, padding: "9px 16px", fontWeight: 600, fontSize: 13,
              cursor: "pointer",
            }}
          >
            <CheckCheck style={{ width: 16, height: 16 }} /> Mark All Read
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div style={{
        background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "12px 16px",
        display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12,
      }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: C.muted, textTransform: "uppercase", marginRight: 4 }}>
            Filter:
          </span>
          {["all", "new_order", "low_stock", "new_review", "abandoned_cart", "system_alert"].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              style={{
                padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: "none",
                background: filterType === type ? C.red : C.bg,
                color: filterType === type ? "white" : C.text,
                cursor: "pointer",
              }}
            >
              {type === "all" ? "All Alerts" : type.replace("_", " ").toUpperCase()}
            </button>
          ))}
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: C.text, cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={unreadOnly}
            onChange={(e) => setUnreadOnly(e.target.checked)}
            style={{ accentColor: C.red, width: 16, height: 16 }}
          />
          Unread only
        </label>
      </div>

      {/* Notifications List */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: C.muted }}>Loading notifications...</div>
        ) : filteredNotifs.length === 0 ? (
          <div style={{ padding: 60, textAlign: "center" }}>
            <Bell style={{ width: 40, height: 40, color: C.border, margin: "0 auto 12px" }} />
            <h4 style={{ margin: 0, color: C.text, fontSize: 16 }}>No notifications found</h4>
            <p style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>You are completely caught up!</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {filteredNotifs.map((n, idx) => (
              <div
                key={n.id || idx}
                style={{
                  display: "flex", alignItems: "flex-start", justifyContent: "space-between",
                  padding: "16px 20px", borderBottom: `1px solid ${C.border}`,
                  background: n.isRead ? "transparent" : "rgba(160,28,44,0.02)",
                  transition: "background 0.15s ease",
                }}
              >
                <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, background: C.bg,
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    marginTop: 2,
                  }}>
                    {getIcon(n.type)}
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontWeight: 700, fontSize: 14, color: C.text }}>
                        {n.title}
                      </span>
                      {!n.isRead && (
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: C.red }} />
                      )}
                    </div>
                    <p style={{ margin: "4px 0 6px", fontSize: 13, color: C.muted, lineHeight: 1.4 }}>
                      {n.message}
                    </p>
                    <span style={{ fontSize: 11, color: C.muted }}>
                      {new Date(n.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
                      })}
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {n.link && onNavigate && (
                    <button
                      onClick={() => onNavigate(n.link as AdminTab)}
                      style={{
                        display: "flex", alignItems: "center", gap: 4, padding: "6px 10px",
                        borderRadius: 6, border: `1px solid ${C.border}`, background: C.bg,
                        fontSize: 12, fontWeight: 600, color: C.text, cursor: "pointer",
                      }}
                    >
                      View <ExternalLink style={{ width: 12, height: 12 }} />
                    </button>
                  )}
                  {!n.isRead && (
                    <button
                      onClick={() => markRead(n.id)}
                      title="Mark as read"
                      style={{
                        padding: "6px 10px", borderRadius: 6, border: "none",
                        background: "rgba(160,28,44,0.08)", color: C.red,
                        fontSize: 12, fontWeight: 600, cursor: "pointer",
                      }}
                    >
                      Mark read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
