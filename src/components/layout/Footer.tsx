"use client";

import React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function Footer() {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16">
      <section className="bg-[#857b76] text-[#f4efe9]">
        <div className="section-shell px-4 py-12 lg:py-16 space-y-10">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_1.3fr]">
            <div className="space-y-5">
              <div className="leading-none">
                <p className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight">casual</p>
                <p className="text-4xl sm:text-5xl lg:text-6xl font-semibold -mt-1 sm:-mt-2">wear</p>
              </div>
              <p className="text-lg sm:text-xl font-medium text-[#f4efe9]/90">Streetwear that actually keeps up.</p>
              <div className="flex items-center gap-3">
                <SocialLink label="Instagram" href="https://instagram.com">
                  <path d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4Z" />
                  <circle cx="12" cy="12" r="3.2" />
                  <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
                </SocialLink>
                <SocialLink label="YouTube" href="https://youtube.com">
                  <path d="M21.5 8.2c-.2-1.6-1.4-2.8-3-3C16.4 5 14.2 5 12 5s-4.4 0-6.5.2c-1.6.2-2.8 1.4-3 3C2.3 9.6 2.3 11 2.3 12.4s0 2.8.2 4.2c.2 1.6 1.4 2.8 3 3 2.1.2 4.3.2 6.5.2s4.4 0 6.5-.2c1.6-.2 2.8-1.4 3-3 .2-1.4.2-2.8.2-4.2s0-2.8-.2-4.2Z" />
                  <path d="m10 9 6 3.5-6 3.5V9Z" fill="currentColor" stroke="none" />
                </SocialLink>
                <SocialLink label="LinkedIn" href="https://linkedin.com">
                  <path d="M7.2 9.4V20M7.2 6.2a1.3 1.3 0 1 1 0 2.6 1.3 1.3 0 0 1 0-2.6ZM11 20v-6c0-1.8 1.2-3 2.8-3s2.7 1.2 2.7 3v6M3 3h18v18H3z" />
                </SocialLink>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-2xl sm:text-3xl font-bold uppercase tracking-[0.08em]">Shop</h3>
              <div className="space-y-2 text-lg sm:text-xl font-medium text-[#f4efe9]/90">
                <Link href="/shop" className="block hover:text-white">
                  New Arrivals
                </Link>
                <Link href="/shop?category=street" className="block hover:text-white">
                  Street
                </Link>
                <Link href="/shop?category=essentials" className="block hover:text-white">
                  Essentials
                </Link>
                <Link href="/shop?category=lounge" className="block hover:text-white">
                  Lounge
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-2xl sm:text-3xl font-bold uppercase tracking-[0.08em]">Help</h3>
              <div className="space-y-2 text-lg sm:text-xl font-medium text-[#f4efe9]/90">
                {role === "admin" ? (
                  <Link href="/admin" className="block hover:text-white">
                    Admin Panel
                  </Link>
                ) : session ? (
                  <>
                    <Link href="/cart" className="block hover:text-white">
                      Cart
                    </Link>
                    <Link href="/orders" className="block hover:text-white">
                      Orders
                    </Link>
                  </>
                ) : (
                  <Link href="/cart" className="block hover:text-white">
                    Cart
                  </Link>
                )}
                <a href="#" className="block hover:text-white">
                  Shipping & Delivery
                </a>
                <a href="#" className="block hover:text-white">
                  Returns & Exchanges
                </a>
                <a href="#" className="block hover:text-white">
                  Privacy Policy
                </a>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-2xl sm:text-3xl font-bold uppercase tracking-[0.08em]">Contact Us</h3>
              <div className="space-y-3 text-lg sm:text-xl font-medium text-[#f4efe9]/90">
                <p>For order related queries</p>
                <a href="tel:+918697009000" className="block hover:text-white">
                  +91 86970 09000
                </a>
                <p>For feedback and partnership</p>
                <a href="tel:+919988426000" className="block hover:text-white">
                  +91 99884 26000
                </a>
                <p className="text-base sm:text-lg font-medium text-[#f4efe9]/75">Mon-Fri (10 AM - 6 PM)</p>
              </div>
            </div>
          </div>

          <div className="border-t border-[#f4efe9]/30 pt-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between text-sm sm:text-base font-medium text-[#f4efe9]/80">
            <p>Copyright (c) {year}, casual.wear. All rights reserved.</p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <a href="#" className="hover:text-white">
                About Us
              </a>
              <a href="#" className="hover:text-white">
                Contact us
              </a>
              <a href="#" className="hover:text-white">
                Blogs
              </a>
            </div>
          </div>
        </div>
      </section>
    </footer>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className="h-10 w-10 rounded-full border border-[#f4efe9]/45 inline-flex items-center justify-center text-[#f4efe9]/90 hover:text-white hover:border-white transition-colors"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
      >
        {children}
      </svg>
    </a>
  );
}


