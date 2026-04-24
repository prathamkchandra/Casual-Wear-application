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
                
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-2xl sm:text-3xl font-bold uppercase tracking-[0.08em]">Contact Us</h3>
              <div className="space-y-3 text-lg sm:text-xl font-medium text-[#f4efe9]/90">
                <p>For order related queries</p>
                <a href="tel:+918697009000" className="block hover:text-white">
                  +91 9353962945
                </a>
            
                <p className="text-base sm:text-lg font-medium text-[#f4efe9]/75">Mon-Fri (10 AM - 6 PM)</p>
              </div>
            </div>
          </div>

          <div className="border-t border-[#f4efe9]/30 pt-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between text-sm sm:text-base font-medium text-[#f4efe9]/80">
            <p>Copyright © {year}, casual.wear. All rights reserved.</p>
            
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

