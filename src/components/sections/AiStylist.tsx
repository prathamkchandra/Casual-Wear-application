"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { AiStylistResponseDTO } from "@/types/shop";

const promptPresets = [
  "Weekend outfit under INR 2500 in darker shades",
  "Relaxed office casual look with breathable fabric",
  "Streetwear vibe with oversized fit and neutral tones",
];

export default function AiStylist() {
  const [prompt, setPrompt] = useState(promptPresets[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<AiStylistResponseDTO | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/ai/stylist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = (await response.json()) as AiStylistResponseDTO | { message?: string };
      if (!response.ok) {
        setResult(null);
        setError(data?.message || "Could not get AI recommendations right now.");
        return;
      }

      setResult(data as AiStylistResponseDTO);
    } catch {
      setResult(null);
      setError("Network error while reaching stylist service.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section-shell py-10 sm:py-12">
      <div className="rounded-3xl border border-ink/10 bg-gradient-to-br from-white to-sand p-4 shadow-soft sm:p-6">
        <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr]">
          <div className="space-y-3">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-ink/50">AI Stylist</p>
            <h2 className="text-3xl font-bold sm:text-4xl">Describe your look, get instant picks</h2>
            <p className="text-base sm:text-lg text-ink/70">
              Ask in plain language like budget, color, fit, or occasion. If AI is unavailable,
              smart local matching is used automatically.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3 pt-1">
              <label htmlFor="ai-stylist-input" className="sr-only">
                Describe your outfit
              </label>
              <textarea
                id="ai-stylist-input"
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                rows={3}
                className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-base outline-none transition-colors focus:border-accent"
                placeholder="Try: minimal summer outfit under INR 2000 in blue tones"
              />
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-full bg-ink px-5 py-2.5 text-base font-bold text-white disabled:opacity-60"
                >
                  {loading ? "Finding styles..." : "Get AI picks"}
                </button>
                <p className="text-sm font-medium text-ink/55">
                  Powered by OpenAI when configured, with fallback safety.
                </p>
              </div>
            </form>

            <div className="flex flex-wrap gap-2 pt-1">
              {promptPresets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setPrompt(preset)}
                  className="rounded-full border border-ink/10 px-3 py-1 text-sm font-semibold text-ink/70 hover:border-accent/60 hover:text-accent"
                >
                  {preset}
                </button>
              ))}
            </div>

            {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
          </div>

          <div className="rounded-2xl border border-ink/10 bg-white p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <p className="text-base font-bold">Suggested products</p>
              {result?.source && (
                <span className="rounded-full bg-sand px-2 py-1 text-[11px] uppercase tracking-wider text-ink/65">
                  {result.source}
                </span>
              )}
            </div>

            {result?.message && <p className="mt-2 text-base text-ink/70">{result.message}</p>}
            {result?.warning && <p className="mt-2 text-xs text-amber-700">{result.warning}</p>}

            <div className="mt-4 space-y-3">
              {result?.recommendations?.length ? (
                result.recommendations.map((item) => (
                  <Link
                    href={`/product/${encodeURIComponent(item.slug)}`}
                    key={item.slug}
                    className="flex gap-3 rounded-xl border border-ink/10 p-2.5 transition-colors hover:border-accent/50"
                  >
                    <div className="relative h-16 w-14 overflow-hidden rounded-lg bg-sand">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-base font-bold text-ink">{item.title}</p>
                      <p className="text-sm font-semibold text-ink/60">INR {item.priceInINR.toLocaleString("en-IN")}</p>
                      <p className="line-clamp-2 text-sm text-ink/65">{item.reason}</p>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="rounded-xl border border-dashed border-ink/15 px-3 py-4 text-base text-ink/55">
                  Submit a style request to see recommended products.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
