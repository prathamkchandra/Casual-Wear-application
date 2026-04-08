import Link from "next/link";
import React from "react";

export default function Hero() {
  return (
    <section className="section-shell grid gap-10 py-16 lg:grid-cols-2 lg:items-center">
      <div className="space-y-6">
        <p className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-accent shadow-sm">
          New drop · Lounge & Street
        </p>
        <h1 className="text-4xl leading-tight font-semibold md:text-5xl">
          Effortless casuals built for long days and late nights.
        </h1>
        <p className="text-ink/70 text-lg">
          Blend of breathable fabrics, relaxed cuts, and confident palettes. Curate your
          daily rotation with pieces that move with you.
        </p>
        <div className="flex gap-3">
          <Link
            href="/shop"
            className="rounded-full bg-ink text-white px-5 py-3 text-sm font-semibold hover:bg-coal"
          >
            Shop collection
          </Link>
          <Link
            href="#lookbook"
            className="rounded-full border border-ink/10 px-5 py-3 text-sm font-semibold hover:border-accent hover:text-accent"
          >
            View lookbook
          </Link>
        </div>
        <div className="flex items-center gap-6 pt-4 text-sm text-ink/60">
          <span>Free exchanges</span>
          <span className="h-4 w-px bg-ink/10" />
          <span>Made for India · INR pricing</span>
        </div>
      </div>
      <div className="relative">
        <div className="absolute inset-4 rounded-2xl bg-accent/10 blur-3xl" />
        <div className="relative overflow-hidden rounded-3xl shadow-soft bg-white">
          <img
            src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1400&q=80"
            alt="Casual wear model"
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}
