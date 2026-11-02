"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { MediaFile } from "@/types";
import { Upload, Trash2, Edit2, Save, X, Image as ImageIcon, Copy, Check, Search, Filter } from "lucide-react";
import { C } from "./AdminShell";

function fmtBytes(b: number) {
  if (b < 1024) return b + " B";
  if (b < 1024 * 1024) return (b / 1024).toFixed(1) + " KB";
  return (b / 1024 / 1024).toFixed(2) + " MB";
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); };
  return (
    <button onClick={copy} style={{ background: "none", border: "none", cursor: "pointer", color: copied ? "#16a34a" : C.muted, padding: "2px 4px" }}>
      {copied ? <Check style={{ width: 14, height: 14 }} /> : <Copy style={{ width: 14, height: 14 }} />}
    </button>
  );
}

type ViewMode = "grid" | "list";

export function MediaLibraryTab() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [toast, setToast] = useState("");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [editingFile, setEditingFile] = useState<MediaFile | null>(null);
  const [altTextDraft, setAltTextDraft] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [filterMime, setFilterMime] = useState<string>("all");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2500); };

  useEffect(() => {
    fetch("/api/media")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setFiles(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // ── Upload ────────────────────────────────────────────────────────────────────

  const uploadFiles = useCallback(async (fileList: FileList | File[]) => {
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];
    const validFiles = Array.from(fileList).filter((f) => {
      if (!ALLOWED.includes(f.type)) { showToast(`❌ ${f.name}: unsupported type (JPEG/PNG/WebP/AVIF/GIF only)`); return false; }
      if (f.size > MAX_SIZE) { showToast(`❌ ${f.name}: file too large (max 10MB)`); return false; }
      return true;
    });
    if (!validFiles.length) return;

    setUploading(true); setUploadProgress(0);
    try {
      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i];
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/media/upload", { method: "POST", body: formData });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          showToast(`❌ ${file.name}: ${err.error || "Upload failed"}`);
        } else {
          const uploaded: MediaFile = await res.json();
          setFiles((prev) => [uploaded, ...prev]);
        }
        setUploadProgress(Math.round(((i + 1) / validFiles.length) * 100));
      }
      showToast(`✅ ${validFiles.length} file(s) uploaded`);
    } catch { showToast("❌ Upload failed"); }
    finally { setUploading(false); setUploadProgress(0); }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) uploadFiles(e.target.files);
    e.target.value = "";
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    if (e.dataTransfer.files) uploadFiles(e.dataTransfer.files);
  }, [uploadFiles]);

  // ── Alt text edit ─────────────────────────────────────────────────────────────

  const saveAltText = async () => {
    if (!editingFile) return;
    const res = await fetch(`/api/media/${editingFile.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ altText: altTextDraft }) });
    if (res.ok) {
      const updated: MediaFile = await res.json();
      setFiles((prev) => prev.map((f) => f.id === updated.id ? updated : f));
      setEditingFile(null); showToast("✅ Alt text saved");
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────────

  const handleDelete = async (id: string) => {
    await fetch(`/api/media/${id}`, { method: "DELETE" });
    setFiles((prev) => prev.filter((f) => f.id !== id));
    setConfirmDelete(null); showToast("🗑 File deleted");
  };

  const handleBulkDelete = async () => {
    for (const id of selectedFiles) {
      await fetch(`/api/media/${id}`, { method: "DELETE" });
    }
    setFiles((prev) => prev.filter((f) => !selectedFiles.has(f.id)));
    setSelectedFiles(new Set()); showToast(`🗑 ${selectedFiles.size} files deleted`);
  };

  // ── Filter ────────────────────────────────────────────────────────────────────

  const filtered = files.filter((f) => {
    const matchSearch = !search || f.filename.toLowerCase().includes(search.toLowerCase()) || (f.altText || "").toLowerCase().includes(search.toLowerCase());
    const matchMime = filterMime === "all" || f.mimeType.startsWith(filterMime);
    return matchSearch && matchMime;
  });

  const missingAlt = files.filter((f) => !f.altText || f.altText.trim() === "").length;

  return (
    <div style={{ display: "grid", gap: 24 }}>

      {toast && <div style={{ position: "fixed", bottom: 24, right: 24, background: C.text, color: "white", padding: "12px 20px", borderRadius: 12, zIndex: 9999, fontSize: 14, fontWeight: 600 }}>{toast}</div>}

      {/* Alt text editor modal */}
      {editingFile && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 9000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: C.surface, borderRadius: 16, padding: 28, maxWidth: 500, width: "90%", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
              <h3 style={{ margin: 0, color: C.text, fontSize: 17, fontWeight: 700 }}>Edit Alt Text</h3>
              <button onClick={() => setEditingFile(null)} style={{ background: "none", border: "none", cursor: "pointer", color: C.muted }}><X style={{ width: 18, height: 18 }} /></button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={editingFile.url} alt={editingFile.altText || ""} style={{ width: "100%", maxHeight: 200, objectFit: "contain", borderRadius: 10, background: C.bg, border: `1px solid ${C.border}`, marginBottom: 16 }} />
            <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, display: "block", marginBottom: 6 }}>Alt Text (for SEO & accessibility)</label>
            <input type="text" value={altTextDraft} onChange={(e) => setAltTextDraft(e.target.value)} placeholder="Describe the image for screen readers and search engines" style={{ width: "100%", padding: "10px 14px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
            <p style={{ fontSize: 11, color: C.muted, margin: "4px 0 16px" }}>File: {editingFile.filename} · {fmtBytes(editingFile.sizeBytes)}</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setEditingFile(null)} style={{ flex: 1, padding: "10px", border: `1px solid ${C.border}`, borderRadius: 10, background: C.bg, color: C.text, cursor: "pointer", fontWeight: 600 }}>Cancel</button>
              <button onClick={saveAltText} style={{ flex: 1, padding: "10px", border: "none", borderRadius: 10, background: C.red, color: "white", cursor: "pointer", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <Save style={{ width: 14, height: 14 }} /> Save
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 9000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: C.surface, borderRadius: 16, padding: 28, maxWidth: 380, width: "90%" }}>
            <h3 style={{ margin: "0 0 8px", color: C.text, fontSize: 18, fontWeight: 700 }}>Delete File?</h3>
            <p style={{ color: "#dc2626", fontSize: 13, margin: "0 0 20px" }}>The file will be removed from Cloudinary and cannot be recovered. Any products using this URL will have broken images.</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setConfirmDelete(null)} style={{ flex: 1, padding: "10px", border: `1px solid ${C.border}`, borderRadius: 10, background: C.bg, color: C.text, cursor: "pointer", fontWeight: 600 }}>Cancel</button>
              <button onClick={() => handleDelete(confirmDelete)} style={{ flex: 1, padding: "10px", border: "none", borderRadius: 10, background: "#dc2626", color: "white", cursor: "pointer", fontWeight: 700 }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: C.text }}>Media Library</h2>
          <p style={{ margin: "4px 0 0", color: C.muted, fontSize: 13 }}>{files.length} files · {missingAlt > 0 && <span style={{ color: "#dc2626", fontWeight: 600 }}>⚠️ {missingAlt} missing alt text</span>}</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {selectedFiles.size > 0 && (
            <button onClick={handleBulkDelete} style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", border: "1px solid #fecaca", borderRadius: 10, background: "#fee2e2", color: "#dc2626", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>
              <Trash2 style={{ width: 14, height: 14 }} /> Delete {selectedFiles.size} selected
            </button>
          )}
          <button onClick={() => fileInputRef.current?.click()} disabled={uploading} style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", border: "none", borderRadius: 10, background: C.red, color: "white", cursor: uploading ? "not-allowed" : "pointer", fontSize: 13, fontWeight: 700, opacity: uploading ? 0.8 : 1 }}>
            <Upload style={{ width: 14, height: 14 }} /> {uploading ? `Uploading ${uploadProgress}%...` : "Upload Images"}
          </button>
          <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleFileInput} style={{ display: "none" }} />
        </div>
      </div>

      {/* Drop Zone */}
      <div
        ref={dropZoneRef}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        style={{ border: `2px dashed ${isDragging ? C.red : C.border}`, borderRadius: 16, padding: 32, textAlign: "center", background: isDragging ? "#FDF5F5" : C.bg, transition: "all 0.2s ease", cursor: "pointer" }}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload style={{ width: 32, height: 32, color: isDragging ? C.red : C.muted, margin: "0 auto 12px" }} />
        <p style={{ margin: 0, fontWeight: 600, color: isDragging ? C.red : C.text }}>Drop images here or click to upload</p>
        <p style={{ margin: "4px 0 0", fontSize: 12, color: C.muted }}>JPEG, PNG, WebP, AVIF, GIF · Max 10MB each</p>
        {uploading && (
          <div style={{ marginTop: 16 }}>
            <div style={{ height: 6, background: C.border, borderRadius: 99, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${uploadProgress}%`, background: C.red, borderRadius: 99, transition: "width 0.3s ease" }} />
            </div>
            <p style={{ margin: "6px 0 0", fontSize: 12, color: C.muted }}>{uploadProgress}% uploaded</p>
          </div>
        )}
      </div>

      {/* Search & Filters */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
          <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 15, height: 15, color: C.muted }} />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by filename or alt text..." style={{ width: "100%", paddingLeft: 36, paddingRight: 14, paddingTop: 9, paddingBottom: 9, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Filter style={{ width: 15, height: 15, color: C.muted }} />
          <select value={filterMime} onChange={(e) => setFilterMime(e.target.value)} style={{ padding: "8px 12px", border: `1px solid ${C.border}`, borderRadius: 10, background: C.bg, color: C.text, fontSize: 13, outline: "none" }}>
            <option value="all">All types</option>
            <option value="image/jpeg">JPEG</option>
            <option value="image/png">PNG</option>
            <option value="image/webp">WebP</option>
          </select>
        </div>
        <div style={{ display: "flex", gap: 4, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, padding: 4 }}>
          {(["grid", "list"] as const).map((m) => (
            <button key={m} onClick={() => setViewMode(m)} style={{ padding: "6px 12px", borderRadius: 8, border: "none", background: viewMode === m ? C.surface : "transparent", color: viewMode === m ? C.text : C.muted, cursor: "pointer", fontSize: 12, fontWeight: viewMode === m ? 700 : 500 }}>
              {m === "grid" ? "⊞ Grid" : "☰ List"}
            </button>
          ))}
        </div>
      </div>

      {/* Missing alt text report */}
      {missingAlt > 0 && (
        <div style={{ background: "#fef3c7", border: "1px solid #fde68a", borderRadius: 12, padding: "12px 16px", fontSize: 13, color: "#92400e", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontWeight: 700 }}>⚠️ {missingAlt} images missing alt text.</span>
          <span>Alt text is important for SEO and accessibility. Click ✏️ on each image to add it.</span>
        </div>
      )}

      {/* File Grid */}
      {loading ? (
        <div style={{ padding: 40, textAlign: "center", color: C.muted }}>Loading media library...</div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: 40, textAlign: "center", color: C.muted }}>
          <ImageIcon style={{ width: 40, height: 40, margin: "0 auto 12px", color: C.border }} />
          <p style={{ fontWeight: 600 }}>{search ? "No files match your search" : "No files uploaded yet"}</p>
          <p style={{ fontSize: 13 }}>Upload product images, banners, and other media here</p>
        </div>
      ) : viewMode === "grid" ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14 }}>
          {filtered.map((file) => (
            <div key={file.id} style={{ background: C.surface, border: selectedFiles.has(file.id) ? `2px solid ${C.red}` : `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden", cursor: "pointer", transition: "transform 0.15s ease, box-shadow 0.15s ease" }}
              onClick={() => setSelectedFiles((prev) => { const next = new Set(prev); next.has(file.id) ? next.delete(file.id) : next.add(file.id); return next; })}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={file.url} alt={file.altText || file.filename} style={{ width: "100%", height: 130, objectFit: "cover", background: C.bg }} />
              <div style={{ padding: "10px 12px" }}>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={file.filename}>{file.filename}</p>
                <p style={{ margin: "2px 0 0", fontSize: 11, color: C.muted }}>{fmtBytes(file.sizeBytes)}</p>
                {!file.altText && <p style={{ margin: "4px 0 0", fontSize: 11, color: "#dc2626", fontWeight: 600 }}>⚠️ No alt text</p>}
                <div style={{ display: "flex", gap: 6, marginTop: 8 }} onClick={(e) => e.stopPropagation()}>
                  <CopyButton text={file.url} />
                  <button onClick={() => { setEditingFile(file); setAltTextDraft(file.altText || ""); }} style={{ background: "none", border: "none", cursor: "pointer", color: C.muted, padding: "2px 4px" }}>
                    <Edit2 style={{ width: 13, height: 13 }} />
                  </button>
                  <button onClick={() => setConfirmDelete(file.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#dc2626", padding: "2px 4px", marginLeft: "auto" }}>
                    <Trash2 style={{ width: 13, height: 13 }} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: C.bg }}>
                {["Preview", "Filename", "Alt Text", "Size", "Uploaded", "Actions"].map((h) => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", color: C.muted, fontWeight: 600, fontSize: 11, textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((file) => (
                <tr key={file.id} style={{ borderTop: `1px solid ${C.border}` }}>
                  <td style={{ padding: "10px 16px" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={file.url} alt={file.altText || ""} style={{ width: 56, height: 40, objectFit: "cover", borderRadius: 8, background: C.bg }} />
                  </td>
                  <td style={{ padding: "10px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontWeight: 600, color: C.text, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={file.filename}>{file.filename}</span>
                      <CopyButton text={file.url} />
                    </div>
                    <span style={{ fontSize: 11, color: C.muted }}>{file.mimeType}</span>
                  </td>
                  <td style={{ padding: "10px 16px", color: file.altText ? C.text : "#dc2626", fontSize: 12, maxWidth: 200 }}>
                    {file.altText || <span style={{ fontWeight: 600 }}>⚠️ Missing alt text</span>}
                  </td>
                  <td style={{ padding: "10px 16px", color: C.muted, whiteSpace: "nowrap" }}>{fmtBytes(file.sizeBytes)}</td>
                  <td style={{ padding: "10px 16px", color: C.muted, whiteSpace: "nowrap" }}>{fmtDate(file.uploadedAt)}</td>
                  <td style={{ padding: "10px 16px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => { setEditingFile(file); setAltTextDraft(file.altText || ""); }} style={{ padding: "5px 8px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, cursor: "pointer", color: C.text }}>
                        <Edit2 style={{ width: 13, height: 13 }} />
                      </button>
                      <button onClick={() => setConfirmDelete(file.id)} style={{ padding: "5px 8px", background: "#fee2e2", border: "1px solid #fecaca", borderRadius: 8, cursor: "pointer", color: "#dc2626" }}>
                        <Trash2 style={{ width: 13, height: 13 }} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
