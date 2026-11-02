"use client";

import { useState, useEffect } from "react";
import type { StaffMember, StaffRole, ActivityLog } from "@/types";
import {
  Users, UserPlus, Shield, Trash2, Edit3, CheckCircle2,
  XCircle, Clock, Save, X, RefreshCw, Key,
} from "lucide-react";
import { C } from "./AdminShell";

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const ROLES: StaffRole[] = ["Owner", "Manager", "Packer", "Support"];

const ROLE_COLORS: Record<StaffRole, { bg: string; color: string }> = {
  Owner: { bg: "#fef3c7", color: "#b45309" },
  Manager: { bg: "#ede9fe", color: "#6d28d9" },
  Packer: { bg: "#dbeafe", color: "#1d4ed8" },
  Support: { bg: "#dcfce7", color: "#15803d" },
};

export function StaffTab() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingNew, setAddingNew] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<StaffRole>("Packer");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2200);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [resStaff, resAct] = await Promise.all([
        fetch("/api/staff"),
        fetch("/api/activity"),
      ]);
      if (resStaff.ok) setStaff(await resStaff.json());
      if (resAct.ok) setActivities(await resAct.json());
    } catch {
      showToast("Error loading staff data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setSaving(true);
    try {
      const res = await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), role }),
      });
      if (!res.ok) throw new Error("Failed to add staff");
      const created = await res.json();
      setStaff((prev) => [...prev, created]);
      setAddingNew(false);
      setName("");
      setEmail("");
      setRole("Packer");
      showToast("Team member added! 👤");
    } catch {
      showToast("Error adding member");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/staff/${id}`, { method: "DELETE" });
      if (res.ok) {
        setStaff((prev) => prev.filter((m) => m.id !== id));
        showToast("Member removed");
      }
    } catch {
      showToast("Failed to remove");
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

  return (
    <div style={{ display: "grid", gap: 24 }}>
      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, background: "#1a1008", color: "white", padding: "10px 20px", borderRadius: 10, fontSize: 13, fontWeight: 600, zIndex: 999, boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: C.text, display: "flex", alignItems: "center", gap: 8 }}>
            <Shield style={{ width: 20, height: 20, color: C.red }} /> Staff Roles & Activity Audit
          </h2>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: C.muted }}>
            Control team access levels (Owner, Manager, Packer, Support) and monitor audit trail
          </p>
        </div>

        <button
          onClick={() => setAddingNew(!addingNew)}
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", background: C.red, color: "white", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-outfit), sans-serif" }}
        >
          {addingNew ? <X style={{ width: 16, height: 16 }} /> : <UserPlus style={{ width: 16, height: 16 }} />}
          {addingNew ? "Cancel" : "Add Team Member"}
        </button>
      </div>

      {/* Add Staff Drawer/Form */}
      {addingNew && (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 22 }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: C.text }}>
            ✨ Add New Team Member
          </h3>
          <form onSubmit={handleAddStaff} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 12, alignItems: "end" }}>
            <div>
              <label style={lblStyle}>Full Name *</label>
              <input
                style={inpStyle}
                placeholder="Ramesh Kumar"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label style={lblStyle}>Email Address *</label>
              <input
                type="email"
                style={inpStyle}
                placeholder="ramesh@ghartika.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label style={lblStyle}>Role *</label>
              <select
                style={inpStyle}
                value={role}
                onChange={(e) => setRole(e.target.value as StaffRole)}
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={saving}
              style={{ padding: "10px 20px", background: C.red, color: "white", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer" }}
            >
              {saving ? "Saving..." : "Add Member"}
            </button>
          </form>
        </div>
      )}

      {/* Main Grid: Staff List + Activity Audit Trail */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 20 }}>
        {/* Team List */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 22 }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: C.text }}>
            👥 Team Members ({staff.length})
          </h3>

          <div style={{ display: "grid", gap: 10 }}>
            {staff.map((member) => {
              const colors = ROLE_COLORS[member.role] || { bg: "#f3f4f6", color: "#374151" };
              return (
                <div
                  key={member.id}
                  style={{
                    background: C.bg,
                    border: `1px solid ${C.border}`,
                    borderRadius: 14,
                    padding: "14px 16px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: "50%", background: C.red, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontWeight: 700, fontSize: 14, color: C.text }}>{member.name}</span>
                        <span style={{ fontSize: 10, background: colors.bg, color: colors.color, padding: "2px 7px", borderRadius: 99, fontWeight: 700 }}>
                          {member.role}
                        </span>
                      </div>
                      <p style={{ margin: "2px 0 0", fontSize: 12, color: C.muted }}>{member.email}</p>
                    </div>
                  </div>

                  {member.role !== "Owner" && (
                    <button
                      onClick={() => handleDelete(member.id)}
                      style={{ background: "none", border: "none", color: "#dc2626", cursor: "pointer", padding: 4 }}
                      title="Remove member"
                    >
                      <Trash2 style={{ width: 15, height: 15 }} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Audit Log Trail */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.text, display: "flex", alignItems: "center", gap: 6 }}>
              <Clock style={{ width: 16, height: 16, color: C.red }} /> Admin Activity Audit Trail
            </h3>
            <button
              onClick={loadData}
              style={{ background: "none", border: "none", cursor: "pointer", color: C.muted, padding: 4 }}
              title="Refresh activity"
            >
              <RefreshCw style={{ width: 14, height: 14 }} />
            </button>
          </div>

          {loading ? (
            <p style={{ color: C.muted, fontSize: 13, textAlign: "center", padding: 40 }}>Loading activities...</p>
          ) : activities.length === 0 ? (
            <p style={{ color: C.muted, fontSize: 13, textAlign: "center", padding: 40 }}>No activity recorded yet</p>
          ) : (
            <div style={{ display: "grid", gap: 8, maxHeight: 460, overflowY: "auto" }}>
              {activities.map((act) => (
                <div
                  key={act.id}
                  style={{
                    background: C.bg,
                    border: `1px solid ${C.border}`,
                    borderRadius: 12,
                    padding: "10px 14px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <span style={{ fontWeight: 700, fontSize: 13, color: C.text }}>{act.action}</span>
                    <p style={{ margin: "2px 0 0", fontSize: 12, color: C.muted }}>{act.details}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: 10, background: "#f3f4f6", padding: "2px 6px", borderRadius: 4, color: C.muted, fontWeight: 600 }}>{act.role || "Admin"}</span>
                    <p style={{ margin: "3px 0 0", fontSize: 10, color: C.muted }}>{fmtDate(act.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
