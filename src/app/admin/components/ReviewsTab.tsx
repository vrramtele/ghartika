"use client";

import { useState, useEffect, useMemo } from "react";
import type { Review, ReviewStatus } from "@/types";
import {
  Star, Check, X, MessageSquare, Trash2, Search,
  RefreshCw, CheckCircle2, XCircle, Clock,
} from "lucide-react";
import { C } from "./AdminShell";

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function ReviewsTab() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | ReviewStatus>("all");
  const [search, setSearch] = useState("");
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2200);
  };

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/reviews");
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch {
      showToast("Error loading reviews");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleUpdateStatus = async (id: string, status: ReviewStatus) => {
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setReviews((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status } : r))
        );
        showToast(status === "approved" ? "Review approved! ⭐" : "Review rejected");
      }
    } catch {
      showToast("Failed to update status");
    }
  };

  const handleSendReply = async (id: string) => {
    if (!replyText.trim()) return;
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply: replyText.trim() }),
      });
      if (res.ok) {
        setReviews((prev) =>
          prev.map((r) => (r.id === id ? { ...r, reply: replyText.trim() } : r))
        );
        setReplyingId(null);
        setReplyText("");
        showToast("Reply published! 💬");
      }
    } catch {
      showToast("Failed to post reply");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/reviews/${id}`, { method: "DELETE" });
      if (res.ok) {
        setReviews((prev) => prev.filter((r) => r.id !== id));
        showToast("Review deleted");
      }
    } catch {
      showToast("Delete failed");
    }
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return reviews.filter((r) => {
      const matchSearch =
        !q ||
        r.customerName.toLowerCase().includes(q) ||
        r.productName.toLowerCase().includes(q) ||
        r.comment.toLowerCase().includes(q);
      const matchStatus = filter === "all" || r.status === filter;
      return matchSearch && matchStatus;
    });
  }, [reviews, search, filter]);

  const pendingCount = reviews.filter((r) => r.status === "pending").length;

  return (
    <div style={{ display: "grid", gap: 18 }}>
      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, background: "#1a1008", color: "white", padding: "10px 20px", borderRadius: 10, fontSize: 13, fontWeight: 600, zIndex: 999, boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: C.text, display: "flex", alignItems: "center", gap: 8 }}>
            <Star style={{ width: 20, height: 20, color: "#eab308" }} /> Customer Reviews & Ratings ({reviews.length})
          </h2>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: C.muted }}>
            {pendingCount > 0 ? `⚠️ ${pendingCount} reviews waiting for moderation` : "All customer reviews are up to date"}
          </p>
        </div>

        {/* Filter Pills */}
        <div style={{ display: "flex", gap: 6 }}>
          {(["all", "pending", "approved", "rejected"] as const).map((tab) => (
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
              {tab === "all" ? `All (${reviews.length})` : tab === "pending" ? `Pending (${pendingCount})` : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div style={{ position: "relative" }}>
        <Search style={{ width: 15, height: 15, position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: C.muted }} />
        <input
          type="text"
          placeholder="Search by customer name, product, or comment..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: "100%", padding: "10px 12px 10px 36px", border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 13, outline: "none", background: C.surface, color: C.text, fontFamily: "var(--font-outfit), sans-serif", boxSizing: "border-box" }}
        />
      </div>

      {/* Reviews List */}
      {isLoading ? (
        <div style={{ textAlign: "center", padding: 60, color: C.muted }}>
          <RefreshCw style={{ width: 32, height: 32, margin: "0 auto 10px", animation: "adminSpin 0.8s linear infinite" }} />
          <p style={{ fontWeight: 600 }}>Loading customer reviews...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 48, textAlign: "center", color: C.muted }}>
          <Star style={{ width: 44, height: 44, margin: "0 auto 12px", opacity: 0.3 }} />
          <p style={{ fontWeight: 700, fontSize: 16, color: C.text, margin: 0 }}>Koi Review Nahi Mila</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {filtered.map((rev) => (
            <div
              key={rev.id}
              style={{
                background: C.surface,
                border: `1px solid ${rev.status === "pending" ? "#fde68a" : C.border}`,
                borderRadius: 16,
                padding: "18px 22px",
                display: "grid",
                gap: 12,
              }}
            >
              {/* Top row */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontWeight: 800, fontSize: 15, color: C.text }}>{rev.customerName}</span>
                    {rev.customerPhone && <span style={{ fontSize: 12, color: C.muted }}>· {rev.customerPhone}</span>}
                    {rev.status === "approved" ? (
                      <span style={{ fontSize: 11, background: "#dcfce7", color: "#15803d", padding: "2px 8px", borderRadius: 99, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 }}>
                        <CheckCircle2 style={{ width: 12, height: 12 }} /> Approved
                      </span>
                    ) : rev.status === "rejected" ? (
                      <span style={{ fontSize: 11, background: "#fee2e2", color: "#dc2626", padding: "2px 8px", borderRadius: 99, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 }}>
                        <XCircle style={{ width: 12, height: 12 }} /> Rejected
                      </span>
                    ) : (
                      <span style={{ fontSize: 11, background: "#fef3c7", color: "#b45309", padding: "2px 8px", borderRadius: 99, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 }}>
                        <Clock style={{ width: 12, height: 12 }} /> Needs Review
                      </span>
                    )}
                  </div>
                  <p style={{ margin: "3px 0 0", fontSize: 12, color: C.red, fontWeight: 600 }}>
                    Product: {rev.productName} · {fmtDate(rev.date)}
                  </p>
                </div>

                {/* Stars */}
                <div style={{ display: "flex", gap: 2 }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      style={{
                        width: 16,
                        height: 16,
                        fill: star <= rev.rating ? "#f59e0b" : "none",
                        color: star <= rev.rating ? "#f59e0b" : "#d1d5db",
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Comment */}
              <p style={{ margin: 0, fontSize: 14, color: C.text, lineHeight: 1.5 }}>
                "{rev.comment}"
              </p>

              {/* Existing Reply */}
              {rev.reply && (
                <div style={{ background: "#fef8f0", borderLeft: `3px solid ${C.red}`, padding: "8px 12px", borderRadius: "0 8px 8px 0" }}>
                  <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: C.red, textTransform: "uppercase" }}>Ghartika Response:</p>
                  <p style={{ margin: "2px 0 0", fontSize: 13, color: C.text }}>{rev.reply}</p>
                </div>
              )}

              {/* Reply Box if active */}
              {replyingId === rev.id && (
                <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                  <input
                    type="text"
                    placeholder="Write a public reply to the customer..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    style={{ flex: 1, padding: "8px 12px", border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, outline: "none" }}
                  />
                  <button
                    onClick={() => handleSendReply(rev.id)}
                    style={{ padding: "8px 14px", background: C.red, color: "white", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                  >
                    Post Reply
                  </button>
                  <button
                    onClick={() => { setReplyingId(null); setReplyText(""); }}
                    style={{ padding: "8px 12px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12, cursor: "pointer" }}
                  >
                    Cancel
                  </button>
                </div>
              )}

              {/* Actions row */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: `1px solid ${C.border}`, paddingTop: 10 }}>
                <div style={{ display: "flex", gap: 8 }}>
                  {rev.status !== "approved" && (
                    <button
                      onClick={() => handleUpdateStatus(rev.id, "approved")}
                      style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 12px", background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#16a34a", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                    >
                      <Check style={{ width: 14, height: 14 }} /> Approve
                    </button>
                  )}
                  {rev.status !== "rejected" && (
                    <button
                      onClick={() => handleUpdateStatus(rev.id, "rejected")}
                      style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 12px", background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                    >
                      <X style={{ width: 14, height: 14 }} /> Reject
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setReplyingId(replyingId === rev.id ? null : rev.id);
                      setReplyText(rev.reply || "");
                    }}
                    style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 12px", background: C.bg, border: `1px solid ${C.border}`, color: C.text, borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                  >
                    <MessageSquare style={{ width: 13, height: 13 }} /> {rev.reply ? "Edit Reply" : "Reply"}
                  </button>
                </div>

                <button
                  onClick={() => handleDelete(rev.id)}
                  style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", padding: 4 }}
                  title="Delete review"
                >
                  <Trash2 style={{ width: 14, height: 14 }} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
