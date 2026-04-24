"use client";

import React, { useEffect, useState } from "react";

export default function LoginWelcomeToast() {
  const [name, setName] = useState("User");
  const [expiresAt, setExpiresAt] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const shouldShow = window.sessionStorage.getItem("cw_login_welcome");
    if (shouldShow !== "1") return;

    const storedName = window.sessionStorage.getItem("cw_login_name");
    setName(storedName || "User");
    setExpiresAt(Date.now() + 3500);
    window.sessionStorage.removeItem("cw_login_welcome");
    window.sessionStorage.removeItem("cw_login_name");
  }, []);

  useEffect(() => {
    if (!expiresAt) return;

    const remaining = Math.max(0, expiresAt - Date.now());
    const timeoutId = window.setTimeout(() => setExpiresAt(null), remaining);
    const safetyInterval = window.setInterval(() => {
      if (Date.now() >= expiresAt) {
        setExpiresAt(null);
      }
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
      window.clearInterval(safetyInterval);
    };
  }, [expiresAt]);

  if (!expiresAt) return null;

  return (
    <div className="fixed left-1/2 top-20 z-50 w-[min(92vw,440px)] -translate-x-1/2 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 shadow-soft">
      <p className="text-sm font-semibold text-green-700">Welcome, {name}!</p>
      <p className="text-sm text-green-700/90">You are logged in successfully.</p>
    </div>
  );
}
