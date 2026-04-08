"use client";

import { SessionProvider } from "next-auth/react";
import CartProvider from "@/components/cart/CartProvider";
import React from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CartProvider>{children}</CartProvider>
    </SessionProvider>
  );
}
