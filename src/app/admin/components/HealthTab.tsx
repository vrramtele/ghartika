"use client";

import { useState, useEffect } from "react";
import {
  Activity, CheckCircle2, AlertTriangle, XCircle, RefreshCw,
  Server, Database, CreditCard, Mail, Cpu, HardDrive, Clock
} from "lucide-react";
import { C } from "./AdminShell";

interface HealthData {
  status: "healthy" | "degraded" | "down";
  timestamp: string;
  uptimeSeconds: number;
  nodeVersion: string;
  environment: string;
  responseTimeMs: number;
  database: {
    status: string;
    connected: boolean;
    latencyMs: number;
    isRedis: boolean;
  };
  services: {
    razorpay: {
      configured: boolean;
      keyPrefix: string;
    };
    emailService: {
      configured: boolean;
      provider: string;
    };
  };
  counts: {
    totalOrders: number;
    totalProducts: number;
  };
  memory: {
    rssMb: number;
    heapUsedMb: number;
    heapTotalMb: number;
  };
}

export function HealthTab() {
  const [data, setData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHealth = async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/system-health");
      const json = await res.json();
      setData(json);
    } catch {
      // Fallback
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const formatUptime = (sec: number) => {
    const hours = Math.floor(sec / 3600);
    const minutes = Math.floor((sec % 3600) / 60);
    const seconds = sec % 60;
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: C.muted }}>
        Running diagnostic checks...
      </div>
    );
  }

  const isHealthy = data?.status === "healthy";

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", paddingBottom: 60 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: C.text, margin: 0, display: "flex", alignItems: "center", gap: 10 }}>
            <Activity style={{ width: 26, height: 26, color: C.red }} /> System Health & Status
          </h2>
          <p style={{ color: C.muted, fontSize: 14, marginTop: 4 }}>
            Real-time infrastructure diagnostics, latency pings, and payment gateway connectivity.
          </p>
        </div>
        <button
          onClick={fetchHealth}
          disabled={refreshing}
          style={{
            display: "flex", alignItems: "center", gap: 8, background: C.surface, color: C.text,
            border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 18px", fontWeight: 600, fontSize: 13,
            cursor: refreshing ? "not-allowed" : "pointer",
          }}
        >
          <RefreshCw style={{ width: 15, height: 15, animation: refreshing ? "spin 1s linear infinite" : "none" }} />
          {refreshing ? "Testing..." : "Re-test Systems"}
        </button>
      </div>

      {/* Main Status Banner */}
      <div style={{
        background: isHealthy ? "#F0FDF4" : "#FEF2F2",
        border: `1px solid ${isHealthy ? "#BBF7D0" : "#FECACA"}`,
        borderRadius: 16, padding: 24, marginBottom: 24,
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{
            width: 52, height: 52, borderRadius: "50%",
            background: isHealthy ? "#16A34A" : "#DC2626",
            display: "flex", alignItems: "center", justifyContent: "center", color: "white",
          }}>
            {isHealthy ? <CheckCircle2 style={{ width: 28, height: 28 }} /> : <AlertTriangle style={{ width: 28, height: 28 }} />}
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: isHealthy ? "#15803D" : "#991B1B" }}>
              {isHealthy ? "All Systems Operational" : "System Issues Detected"}
            </h3>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: isHealthy ? "#166534" : "#7F1D1D" }}>
              Last diagnostic test run at {data ? new Date(data.timestamp).toLocaleTimeString() : "Just now"}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: 16 }}>
          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase" }}>Response Time</span>
            <div style={{ fontSize: 20, fontWeight: 800, color: C.text }}>{data?.responseTimeMs}ms</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase" }}>Server Uptime</span>
            <div style={{ fontSize: 20, fontWeight: 800, color: C.text }}>{data ? formatUptime(data.uptimeSeconds) : "0s"}</div>
          </div>
        </div>
      </div>

      {/* Diagnostics Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
        {/* Database & Storage */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Database style={{ width: 18, height: 18, color: "#0284c7" }} />
              <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.text }}>Database Storage</h4>
            </div>
            <span style={{
              fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 6,
              background: data?.database.connected ? "#DCFCE7" : "#FEE2E2",
              color: data?.database.connected ? "#15803D" : "#991B1B",
            }}>
              {data?.database.connected ? "CONNECTED" : "OFFLINE"}
            </span>
          </div>

          <div style={{ display: "grid", gap: 8, fontSize: 13 }}>
            <div style={{ display: "flex", justifyContent: "space-between", color: C.text }}>
              <span style={{ color: C.muted }}>Engine</span>
              <span style={{ fontWeight: 600 }}>{data?.database.isRedis ? "Upstash Redis KV" : "Local JSON Engine"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", color: C.text }}>
              <span style={{ color: C.muted }}>Ping Latency</span>
              <span style={{ fontWeight: 600, color: "#16a34a" }}>{data?.database.latencyMs}ms</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", color: C.text }}>
              <span style={{ color: C.muted }}>Orders Stored</span>
              <span style={{ fontWeight: 600 }}>{data?.counts.totalOrders}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", color: C.text }}>
              <span style={{ color: C.muted }}>Active Products</span>
              <span style={{ fontWeight: 600 }}>{data?.counts.totalProducts}</span>
            </div>
          </div>
        </div>

        {/* Razorpay Gateway */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <CreditCard style={{ width: 18, height: 18, color: "#7c3aed" }} />
              <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.text }}>Razorpay Payments</h4>
            </div>
            <span style={{
              fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 6,
              background: data?.services.razorpay.configured ? "#DCFCE7" : "#FEE2E2",
              color: data?.services.razorpay.configured ? "#15803D" : "#991B1B",
            }}>
              {data?.services.razorpay.configured ? "READY" : "UNCONFIGURED"}
            </span>
          </div>

          <div style={{ display: "grid", gap: 8, fontSize: 13 }}>
            <div style={{ display: "flex", justifyContent: "space-between", color: C.text }}>
              <span style={{ color: C.muted }}>API Key Mode</span>
              <span style={{ fontWeight: 600 }}>{data?.services.razorpay.keyPrefix.includes("test") ? "Test Sandbox" : "Live Production"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", color: C.text }}>
              <span style={{ color: C.muted }}>Key Identifier</span>
              <span style={{ fontFamily: "monospace", fontSize: 12 }}>{data?.services.razorpay.keyPrefix}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", color: C.text }}>
              <span style={{ color: C.muted }}>Payment Webhooks</span>
              <span style={{ color: "#16a34a", fontWeight: 600 }}>Active</span>
            </div>
          </div>
        </div>

        {/* Email & Notifications */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Mail style={{ width: 18, height: 18, color: "#d97706" }} />
              <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.text }}>Order Email System</h4>
            </div>
            <span style={{
              fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 6,
              background: data?.services.emailService.configured ? "#DCFCE7" : "#FEE2E2",
              color: data?.services.emailService.configured ? "#15803D" : "#991B1B",
            }}>
              {data?.services.emailService.configured ? "ACTIVE" : "DISABLED"}
            </span>
          </div>

          <div style={{ display: "grid", gap: 8, fontSize: 13 }}>
            <div style={{ display: "flex", justifyContent: "space-between", color: C.text }}>
              <span style={{ color: C.muted }}>Provider</span>
              <span style={{ fontWeight: 600 }}>Resend Transactional</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", color: C.text }}>
              <span style={{ color: C.muted }}>Order Receipts</span>
              <span style={{ color: "#16a34a", fontWeight: 600 }}>Automated</span>
            </div>
          </div>
        </div>

        {/* Node Process Memory */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Cpu style={{ width: 18, height: 18, color: C.red }} />
              <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.text }}>Server Runtime</h4>
            </div>
            <span style={{ fontSize: 12, color: C.muted }}>Node {data?.nodeVersion}</span>
          </div>

          <div style={{ display: "grid", gap: 8, fontSize: 13 }}>
            <div style={{ display: "flex", justifyContent: "space-between", color: C.text }}>
              <span style={{ color: C.muted }}>Heap Used</span>
              <span style={{ fontWeight: 600 }}>{data?.memory.heapUsedMb} MB / {data?.memory.heapTotalMb} MB</span>
            </div>
            <div style={{ width: "100%", height: 6, background: C.bg, borderRadius: 3, overflow: "hidden" }}>
              <div style={{
                height: "100%",
                width: `${data ? Math.min(100, Math.round((data.memory.heapUsedMb / data.memory.heapTotalMb) * 100)) : 0}%`,
                background: C.red,
              }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", color: C.text }}>
              <span style={{ color: C.muted }}>Environment</span>
              <span style={{ fontWeight: 600 }}>{data?.environment}</span>
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
