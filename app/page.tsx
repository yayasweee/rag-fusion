import Link from "next/link";

export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        position: "relative",
      }}
    >
      {/* ambient glow */}
      <div
        style={{
          position: "absolute",
          top: "30%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "600px",
          height: "400px",
          background: "radial-gradient(ellipse, rgba(232,115,74,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div className="animate-fade-up" style={{ textAlign: "center", maxWidth: "520px" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 14px",
            borderRadius: "100px",
            border: "1px solid var(--border)",
            background: "var(--bg-raised)",
            marginBottom: "32px",
            fontSize: "12px",
            color: "var(--text-secondary)",
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 500,
            letterSpacing: "0.04em",
          }}
        >
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--accent)" }} />
          EMBEDDING BASED VIDEO SEARCH
        </div>

        <h1
          style={{
            fontSize: "clamp(2.5rem, 6vw, 4rem)",
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
            marginBottom: "20px",
          }}
        >
          rag<span style={{ color: "var(--accent)" }}>-</span>fusion
        </h1>

        <p
          className="animate-fade-up stagger-2"
          style={{
            color: "var(--text-secondary)",
            fontSize: "16px",
            lineHeight: 1.6,
            marginBottom: "48px",
          }}
        >
          upload videos and images, find them with natural language
        </p>

        <div className="animate-fade-up stagger-3" style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <Link href="/upload" className="btn-primary" style={{ textDecoration: "none" }}>
            Upload
          </Link>
          <Link href="/gallery" className="btn-ghost" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px" }}>
            Gallery
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      {/* bottom fade hint */}
      <div
        className="animate-fade-in stagger-5"
        style={{
          position: "absolute",
          bottom: "40px",
          color: "var(--text-secondary)",
          fontSize: "12px",
          fontFamily: "'Outfit', sans-serif",
          letterSpacing: "0.06em",
          opacity: 0.5,
        }}
      >
        multimodal search powered by gemini-embedding-2
      </div>
    </main>
  );
}
