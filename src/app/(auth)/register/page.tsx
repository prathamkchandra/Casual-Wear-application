"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"user" | "admin">("user");
  const [adminKey, setAdminKey] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setIsError(false);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          adminKey: role === "admin" ? adminKey : undefined,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setMessage(
          role === "admin"
            ? "Admin account created. Please sign in."
            : "Customer account created. Please sign in."
        );
        setTimeout(() => router.push("/login"), 700);
      } else {
        setIsError(true);
        setMessage(data?.message || "Could not register.");
      }
    } catch {
      setIsError(true);
      setMessage("Could not reach server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="section-shell py-16 grid gap-10 lg:grid-cols-2 lg:items-center">
      <div className="space-y-4">
        <p className="text-xs uppercase tracking-[0.2em] text-ink/50">Create account</p>
        <h1 className="text-3xl font-semibold">Join the crew</h1>
        <p className="text-ink/70">
          Keep your cart synced and see your order history by creating an account.
        </p>
        <Link href="/login" className="text-sm font-semibold text-accent">
          Already have one? Login
        </Link>
      </div>
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl bg-white shadow-soft p-6 space-y-4"
      >
        <div className="space-y-1">
          <label className="text-sm font-semibold">Name</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-ink/10 px-3 py-2"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-semibold">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-ink/10 px-3 py-2"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-semibold">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-ink/10 px-3 py-2"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-semibold">Register as</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as "user" | "admin")}
            className="w-full rounded-lg border border-ink/10 px-3 py-2"
          >
            <option value="user">Customer</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        {role === "admin" && (
          <div className="space-y-1">
            <label className="text-sm font-semibold">Admin registration key</label>
            <input
              type="password"
              required
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              className="w-full rounded-lg border border-ink/10 px-3 py-2"
            />
          </div>
        )}
        {message && (
          <p className={`text-sm ${isError ? "text-red-600" : "text-accent"}`}>{message}</p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-ink text-white py-3 font-semibold hover:bg-coal disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create account"}
        </button>
      </form>
    </main>
  );
}
