"use client";

import React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function Footer() {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;

  return (
    <footer className="border-t border-black/5 bg-white/60">
      <div className="container mx-auto max-w-6xl px-4 py-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between text-sm text-ink/70">
        <p>Copyright {new Date().getFullYear()} casual.wear | crafted for learning.</p>
        <div className="flex gap-4">
          <Link href="/shop" className="hover:text-accent">
            Shop
          </Link>
          {role === "admin" ? (
            <Link href="/admin" className="hover:text-accent">
              Admin panel
            </Link>
          ) : session ? (
            <>
              <Link href="/cart" className="hover:text-accent">
                Cart
              </Link>
              <Link href="/orders" className="hover:text-accent">
                Orders
              </Link>
            </>
          ) : (
            <Link href="/cart" className="hover:text-accent">
              Cart
            </Link>
          )}
        </div>
      </div>
    </footer>
  );
}
