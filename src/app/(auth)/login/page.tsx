"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (!res || res.error || !res.ok) {
        setError("Invalid email or password");
      } else {
        const sessionRes = await fetch("/api/auth/session");
        const session = await sessionRes.json();
        const role = session?.user?.role;
        const displayName = session?.user?.name || session?.user?.email?.split("@")[0] || "User";
        if (typeof window !== "undefined") {
          window.sessionStorage.setItem("cw_login_welcome", "1");
          window.sessionStorage.setItem("cw_login_name", displayName);
        }
        router.replace(role === "admin" ? "/admin" : "/");
      }
    } catch {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="section-shell py-10 sm:py-16 grid gap-8 lg:gap-10 lg:grid-cols-2 lg:items-center">
      <div className="space-y-4">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-ink/50">Welcome back</p>
        <h1 className="text-3xl sm:text-4xl font-bold">Sign in to continue</h1>
        <p className="text-base sm:text-lg text-ink/70">
          Save your cart, place orders, and access admin tools if you&apos;re on the team.
        </p>
        <Link href="/register" className="text-base font-bold text-accent">
          Need an account? Register
        </Link>
      </div>
      <form onSubmit={handleSubmit} className="rounded-2xl bg-white shadow-soft p-5 sm:p-6 space-y-4">
        <div className="space-y-1">
          <label className="text-base font-bold">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-ink/10 px-3 py-2 text-base"
          />
        </div>
        <div className="space-y-1">
          <label className="text-base font-bold">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-ink/10 px-3 py-2 text-base"
          />
        </div>
        {error && <p className="text-base font-semibold text-accent">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-ink text-white py-3 text-base font-bold hover:bg-coal disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </main>
  );
}
