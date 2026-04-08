"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useCart } from "@/components/cart/CartProvider";
import React from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/cart", label: "Cart" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { items } = useCart();
  const count = items.reduce((sum, item) => sum + item.qty, 0);

  return (
    <header className="sticky top-0 z-20 bg-sand/90 backdrop-blur border-b border-black/5">
      <div className="container mx-auto max-w-6xl flex items-center justify-between py-4 px-4">
        <Link href="/" className="text-xl font-semibold tracking-tight">
          casual<span className="text-accent">.wear</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative ${
                pathname === link.href ? "text-accent" : "text-ink/80"
              } hover:text-accent`}
            >
              {link.label}
              {link.href === "/cart" && count > 0 && (
                <span className="absolute -top-2 -right-3 text-[11px] rounded-full bg-accent text-white px-2 py-0.5">
                  {count}
                </span>
              )}
            </Link>
          ))}
          {session ? (
            <>
              {(session.user as any)?.role === "admin" && (
                <Link href="/admin" className="hover:text-accent text-ink/80">
                  Admin
                </Link>
              )}
              <button
                onClick={() => signOut()}
                className="rounded-full border border-ink/10 px-3 py-1 hover:border-accent hover:text-accent"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-full border border-ink/10 px-3 py-1 hover:border-accent hover:text-accent"
            >
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
