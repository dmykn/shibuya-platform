// src/app/page.tsx
import React from "react";

export default function Page() {
  if (typeof window !== "undefined") {
    window.location.href = "/home";
  }
  return <div>Redirecting...</div>;
}
