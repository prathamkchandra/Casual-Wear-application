import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-black/5 bg-white/60">
      <div className="container mx-auto max-w-6xl px-4 py-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between text-sm text-ink/70">
        <p>© {new Date().getFullYear()} casual.wear — crafted for learning.</p>
        <div className="flex gap-4">
          <Link href="/shop" className="hover:text-accent">
            Shop
          </Link>
          <Link href="/cart" className="hover:text-accent">
            Cart
          </Link>
          <Link href="/admin" className="hover:text-accent">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
