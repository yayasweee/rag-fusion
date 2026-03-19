"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Item = {
  id: string;
  filename: string;
  mimetype: string;
  description?: string;
  tags?: string[];
  url?: string;
  createdAt: string;
  score?: number;
};

export default function GalleryPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await fetch("/api/items");
      const data = await res.json();
      setItems(data.items || []);
      setHasSearched(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      fetchItems();
      return;
    }

    setIsSearching(true);
    setHasSearched(true);
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, topK: 20 }),
      });
      const data = await res.json();
      setItems(data.results.map((r: any) => ({ ...r.item, score: r.score })));
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/items/${id}`, { method: "DELETE" });
    setItems(items.filter((item) => item.id !== id));
  };

  return (
    <div style={{ minHeight: "100vh", padding: "clamp(24px, 4vw, 48px)" }}>
      {/* header */}
      <header className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px", marginBottom: "40px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <Link href="/" className="btn-ghost" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              back
            </Link>
            <h1 style={{ fontSize: "22px", fontWeight: 600, letterSpacing: "-0.02em" }}>gallery</h1>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {hasSearched && (
              <button
                className="btn-ghost animate-fade-in"
                onClick={() => { setQuery(""); setHasSearched(false); fetchItems(); }}
              >
                clear
              </button>
            )}
            <Link href="/upload" className="btn-primary" style={{ textDecoration: "none", fontSize: "13px", padding: "8px 18px" }}>
              upload
            </Link>
          </div>
        </div>

        {/* search bar */}
        <form onSubmit={handleSearch} style={{ display: "flex", gap: "8px", maxWidth: "500px" }}>
          <div style={{ position: "relative", flex: 1 }}>
            <svg
              width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              className="input"
              style={{ paddingLeft: "36px" }}
              placeholder="search videos..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-primary" disabled={isSearching} style={{ padding: "10px 20px" }}>
            {isSearching ? "..." : "search"}
          </button>
        </form>

        {hasSearched && items.length > 0 && (
          <p className="animate-fade-in" style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
            {items.length} results for &quot;{query}&quot;
          </p>
        )}
      </header>

      {/* content */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", paddingTop: "120px" }}>
          <div style={{
            width: "24px", height: "24px",
            border: "2px solid var(--border)",
            borderTopColor: "var(--accent)",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }} />
        </div>
      ) : items.length === 0 ? (
        <div className="animate-fade-up" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", paddingTop: "120px", textAlign: "center" }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3, marginBottom: "20px" }}>
            <rect x="2" y="2" width="20" height="20" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M14.526 12.621L6 22h12.133A1.867 1.867 0 0020 20.133V18" />
          </svg>
          <p style={{ color: "var(--text-secondary)", fontSize: "15px", marginBottom: "8px" }}>
            {hasSearched ? "no results found" : "nothing here yet"}
          </p>
          {!hasSearched && (
            <Link href="/upload" style={{ color: "var(--accent)", fontSize: "13px", textDecoration: "none" }}>
              upload something
            </Link>
          )}
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: "16px",
        }}>
          {items.map((item, i) => (
            <div
              key={item.id}
              className={`card animate-fade-up stagger-${Math.min(i + 1, 5)}`}
              style={{ position: "relative" }}
            >
              {/* delete button */}
              <button
                onClick={() => handleDelete(item.id)}
                style={{
                  position: "absolute",
                  top: "8px",
                  right: "8px",
                  zIndex: 2,
                  width: "28px",
                  height: "28px",
                  borderRadius: "6px",
                  background: "rgba(0,0,0,0.6)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: 0,
                  transition: "opacity 0.2s, color 0.2s",
                }}
                className="delete-btn"
                onMouseEnter={(e) => { e.currentTarget.style.color = "var(--danger)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-secondary)"; }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                </svg>
              </button>

              {/* media */}
              <div style={{ aspectRatio: "9/16", background: "#000", overflow: "hidden", position: "relative" }}>
                {item.mimetype.startsWith("video/") ? (
                  <video
                    src={item.url || `/uploads/${item.filename}`}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    loop muted playsInline autoPlay
                  />
                ) : (
                  <img
                    src={item.url || `/uploads/${item.filename}`}
                    alt={item.filename}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    loading="lazy"
                  />
                )}

                {/* score overlay */}
                {item.score !== undefined && (
                  <div style={{
                    position: "absolute",
                    top: "8px",
                    left: "8px",
                    padding: "3px 8px",
                    borderRadius: "6px",
                    background: "rgba(0,0,0,0.6)",
                    backdropFilter: "blur(8px)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    fontSize: "11px",
                    fontFamily: "'Outfit', sans-serif",
                    fontWeight: 600,
                    color: "var(--accent)",
                  }}>
                    {(item.score * 100).toFixed(0)}%
                  </div>
                )}
              </div>

              {/* info */}
              <div style={{ padding: "14px 16px" }}>
                <p style={{
                  fontSize: "13px",
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  marginBottom: item.description || item.tags ? "8px" : 0,
                }}>
                  {item.filename}
                </p>

                {item.description && (
                  <p style={{
                    fontSize: "12px",
                    color: "var(--text-secondary)",
                    lineHeight: 1.5,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    marginBottom: item.tags?.length ? "10px" : 0,
                  }}>
                    {item.description}
                  </p>
                )}

                {item.tags && item.tags.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                    {item.tags.map((tag) => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .card:hover .delete-btn {
          opacity: 1 !important;
        }
      `}</style>
    </div>
  );
}
