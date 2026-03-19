import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "rag-fusion",
  description: "multimodal video/image search",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="noise-bg">
        <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
      </body>
    </html>
  );
}
