// src/app/layout.tsx
import "../app/globals.css";
import React from "react";

export const metadata = {
  title: "شيبويا - Shibuya",
  description: "منصة شيبويا - تقييمات ومقالات الأنمي"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head />
      <body>
        {children}
      </body>
    </html>
  );
}
