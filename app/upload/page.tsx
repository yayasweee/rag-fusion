"use client";

import { useState, useRef } from "react";
import Link from "next/link";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    setFile(f);
    setMessage(null);
    if (f.type.startsWith("image/")) {
      setPreview(URL.createObjectURL(f));
    } else if (f.type.startsWith("video/")) {
      setPreview(URL.createObjectURL(f));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsLoading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("description", description);
    formData.append("tags", tags);

    try {
      const res = await fetch("/api/embed", { method: "POST", body: formData });
      const data = await res.json();

      if (res.ok) {
        setMessage({ text: "embedded successfully", ok: true });
        setFile(null);
        setPreview(null);
        setDescription("");
        setTags("");
      } else {
        setMessage({ text: data.error || "upload failed", ok: false });
      }
    } catch {
      setMessage({ text: "something went wrong", ok: false });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", padding: "clamp(24px, 4vw, 48px)" }}>
      {/* nav */}
      <nav className="animate-fade-in" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "48px" }}>
        <Link href="/" className="btn-ghost" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          back
        </Link>
        <Link href="/gallery" className="btn-ghost" style={{ textDecoration: "none" }}>
          gallery
        </Link>
      </nav>

      <div style={{ maxWidth: "480px", margin: "0 auto" }}>
        <h1 className="animate-fade-up" style={{ fontSize: "28px", fontWeight: 600, letterSpacing: "-0.02em", marginBottom: "8px" }}>
          upload
        </h1>
        <p className="animate-fade-up stagger-1" style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "36px" }}>
          add media to make it searchable
        </p>

        <form onSubmit={handleSubmit}>
          {/* drop zone */}
          <div
            className="animate-fade-up stagger-2"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
            }}
            style={{
              position: "relative",
              border: "2px dashed var(--border)",
              borderRadius: "var(--radius)",
              padding: file ? "0" : "48px 24px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.2s",
              background: file ? "var(--bg-raised)" : "transparent",
              overflow: "hidden",
              minHeight: file ? "auto" : "200px",
            }}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/*,video/*"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              style={{ display: "none" }}
              disabled={isLoading}
            />

            {file && preview ? (
              <div style={{ width: "100%", position: "relative" }}>
                {file.type.startsWith("video/") ? (
                  <video
                    src={preview}
                    style={{ width: "100%", maxHeight: "300px", objectFit: "cover", display: "block" }}
                    muted
                    autoPlay
                    loop
                    playsInline
                  />
                ) : (
                  <img
                    src={preview}
                    alt=""
                    style={{ width: "100%", maxHeight: "300px", objectFit: "cover", display: "block" }}
                  />
                )}
                <div style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: "12px 16px",
                  background: "linear-gradient(transparent, rgba(0,0,0,0.8))",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}>
                  <span style={{ fontSize: "13px", fontFamily: "'Outfit', sans-serif", fontWeight: 500 }}>{file.name}</span>
                  <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                    {(file.size / 1024 / 1024).toFixed(1)} MB
                  </span>
                </div>
              </div>
            ) : (
              <>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: "16px", opacity: 0.5 }}>
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                </svg>
                <span style={{ fontSize: "14px", fontFamily: "'Outfit', sans-serif", fontWeight: 500, color: "var(--text-secondary)" }}>
                  drop a file or click to browse
                </span>
                <span style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "6px", opacity: 0.6 }}>
                  mp4, webm, jpg, png
                </span>
              </>
            )}
          </div>

          {/* fields */}
          <div className="animate-fade-up stagger-3" style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "20px" }}>
            <input
              className="input"
              placeholder="description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
            />
            <input
              className="input"
              placeholder="tags, comma separated (optional)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            className="btn-primary animate-fade-up stagger-4"
            disabled={!file || isLoading}
            style={{ width: "100%", marginTop: "20px", padding: "12px", fontSize: "14px" }}
          >
            {isLoading ? (
              <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 1s linear infinite" }}>
                  <path d="M21 12a9 9 0 11-6.219-8.56" />
                </svg>
                embedding...
              </span>
            ) : (
              "upload & embed"
            )}
          </button>

          {message && (
            <p
              className="animate-fade-in"
              style={{
                marginTop: "16px",
                fontSize: "13px",
                textAlign: "center",
                color: message.ok ? "var(--success)" : "var(--danger)",
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              {message.text}
            </p>
          )}
        </form>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
