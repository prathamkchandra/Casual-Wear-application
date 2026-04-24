"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useCart } from "@/components/cart/CartProvider";
import React, { useEffect, useState } from "react";

const publicLinks = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { items } = useCart();
  const count = items.reduce((sum, item) => sum + item.qty, 0);
  const role = (session?.user as any)?.role;
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = role === "admin"
    ? [...publicLinks, { href: "/admin", label: "Admin" }]
    : session
      ? [...publicLinks, { href: "/cart", label: "Cart" }, { href: "/orders", label: "Orders" }]
      : [...publicLinks, { href: "/cart", label: "Cart" }];

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-20 bg-sand/90 backdrop-blur border-b border-black/5">
      <div className="section-shell flex items-center justify-between py-3 md:py-4">
        <Link href="/" className="text-2xl sm:text-[1.7rem] font-bold tracking-tight">
          casual<span className="text-accent">.wear</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-base font-semibold">
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
                <span className="absolute -top-2 -right-3 text-xs font-bold rounded-full bg-accent text-white px-2 py-0.5">
                  {count}
                </span>
              )}
            </Link>
          ))}
          <Link
            href="/shop"
            aria-label="Search products"
            className={`inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-black/10 text-ink/80 transition-colors ${
              pathname === "/shop" ? "text-accent" : "text-ink/80"
            } hover:text-accent`}
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="6.5" />
              <path d="M16 16l4 4" />
            </svg>
          </Link>
          {session ? (
            <>
              <button
                onClick={() => signOut()}
                className="rounded-full border border-ink/10 px-3 py-1 text-sm font-semibold hover:border-accent hover:text-accent"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-full border border-ink/10 px-3 py-1 text-sm font-semibold hover:border-accent hover:text-accent"
            >
              Login
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <Link
            href="/shop"
            aria-label="Search products"
            className={`inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-black/10 text-ink/80 transition-colors ${
              pathname === "/shop" ? "text-accent" : "text-ink/80"
            } hover:text-accent`}
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="6.5" />
              <path d="M16 16l4 4" />
            </svg>
          </Link>
          <button
            type="button"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpen((v) => !v)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-black/10 text-ink/80 hover:text-accent"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {mobileOpen ? (
                <>
                  <path d="M6 6l12 12" />
                  <path d="M18 6l-12 12" />
                </>
              ) : (
                <>
                  <path d="M4 7h16" />
                  <path d="M4 12h16" />
                  <path d="M4 17h16" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-black/5 bg-sand px-4 py-3">
          <nav className="flex flex-col gap-2 text-base font-semibold">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-xl px-3 py-2 ${
                  pathname === link.href ? "bg-accent/10 text-accent" : "text-ink/80"
                } hover:text-accent`}
              >
                {link.label}
                {link.href === "/cart" && count > 0 ? ` (${count})` : ""}
              </Link>
            ))}
            {session ? (
              <button
                onClick={() => signOut()}
                className="rounded-xl border border-ink/10 px-3 py-2 text-left font-semibold hover:border-accent hover:text-accent"
              >
                Logout
              </button>
            ) : (
              <Link
                href="/login"
                className="rounded-xl border border-ink/10 px-3 py-2 font-semibold hover:border-accent hover:text-accent"
              >
                Login
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
