"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    if (res.ok) setMessage("Registered! You can now log in.");
    else setMessage("Could not register.");
    setLoading(false);
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
        {message && <p className="text-sm text-accent">{message}</p>}
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
