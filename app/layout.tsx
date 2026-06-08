import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Генератор TikTok-профілю",
  description: "Упакуй профіль який продає — за 2 хвилини",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk">
      <body className="min-h-screen" style={{ backgroundColor: "#0A0A0A" }}>
        {children}
      </body>
    </html>
  );
}
