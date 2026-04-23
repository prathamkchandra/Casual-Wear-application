import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function Hero() {
  return (
    <section className="section-shell grid gap-6 lg:gap-10 py-12 sm:py-14 lg:py-20 lg:grid-cols-2 lg:items-center">
      <div className="space-y-6">
        <p className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-accent shadow-sm">
          New drop - Lounge & Street
        </p>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl md:text-5xl">
          Effortless casuals built for long days and late nights.
        </h1>
        <p className="text-ink/70 text-base sm:text-lg">
          Blend of breathable fabrics, relaxed cuts, and confident palettes. Curate your
          daily rotation with pieces that move with you.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link
            href="/shop"
            className="rounded-full bg-ink text-white px-5 py-3 text-sm font-semibold hover:bg-coal text-center"
          >
            Shop collection
          </Link>
          <Link
            href="#lookbook"
            className="rounded-full border border-ink/10 px-5 py-3 text-sm font-semibold hover:border-accent hover:text-accent text-center"
          >
            View lookbook
          </Link>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2 text-sm text-ink/60">
          <span>Free exchanges</span>
          <span className="hidden sm:inline h-4 w-px bg-ink/10" />
          <span>Made for India - INR pricing</span>
        </div>
      </div>
      <div className="relative h-72 sm:h-96 lg:h-full lg:min-h-[520px]">
        <div className="absolute inset-4 rounded-2xl bg-accent/10 blur-3xl" />
        <div className="relative overflow-hidden rounded-3xl shadow-soft bg-white h-full">
          <Image
            src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1400&q=80"
            alt="Casual wear model"
            fill
            sizes="(min-width:1024px) 50vw, 100vw"
            className="object-cover"
            priority
          />
        </div>
      </div>
    </section>
  );
}

