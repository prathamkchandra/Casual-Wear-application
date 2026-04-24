"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/components/cart/CartProvider";
import { useSession } from "next-auth/react";
import { DEFAULT_PRODUCT_IMAGE, getSafeProductImage } from "@/lib/image";

export default function CartPageClient() {
  const { items, total, updateQty, removeItem, clear } = useCart();
  const { data: session } = useSession();
  const [placing, setPlacing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error" | null>(null);

  const placeOrder = async () => {
    if (!session) {
      setMessage("Please login to place order.");
      setMessageType("error");
      return;
    }
    setPlacing(true);
    setMessage(null);
    setMessageType(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      if (res.ok) {
        clear();
        setMessage("Your order has been placed.");
        setMessageType("success");
      } else {
        setMessage("Could not place order.");
        setMessageType("error");
      }
    } catch {
      setMessage("Something went wrong.");
      setMessageType("error");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <main className="section-shell py-10 sm:py-12 space-y-8">
      <div className="space-y-2">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-ink/50">Cart</p>
        <h1 className="text-3xl sm:text-4xl font-bold">Your picks</h1>
      </div>
      {message && (
        <p
          className={`rounded-xl border px-4 py-3 text-base font-semibold ${
            messageType === "success"
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {message}
        </p>
      )}
      {items.length === 0 ? (
        <div className="rounded-2xl bg-white p-6 sm:p-8 text-center shadow-soft">
          <p className="text-base sm:text-lg font-medium text-ink/70">Your cart is empty.</p>
          <Link href="/shop" className="mt-4 inline-block rounded-full bg-ink px-4 py-2 text-base font-bold text-white">
            Shop products
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:gap-8 lg:grid-cols-[1.5fr_1fr]">
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={`${item.productId}-${item.size}-${item.color}`}
                className="rounded-2xl bg-white p-4 shadow-soft flex flex-col gap-4 sm:flex-row"
              >
                <div className="relative h-24 w-full sm:w-24 sm:min-w-24 overflow-hidden rounded-xl bg-sand">
                  <Image
                    src={getSafeProductImage(item.image, DEFAULT_PRODUCT_IMAGE)}
                    alt={item.name}
                    fill
                    sizes="(max-width:639px) 100vw, 96px"
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-lg font-bold line-clamp-2">{item.name}</h3>
                      <p className="text-base text-ink/60">
                        {item.size && `Size ${item.size}`}
                        {item.size && item.color ? " | " : ""}
                        {item.color && item.color}
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(item.productId, item.size, item.color)}
                      className="text-sm font-semibold text-ink/50 hover:text-accent"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <label className="text-base font-medium text-ink/60">Qty</label>
                      <input
                        type="number"
                        min={1}
                        value={item.qty}
                        onChange={(e) =>
                          updateQty(item.productId, Number(e.target.value), item.size, item.color)
                        }
                        className="w-16 rounded-lg border border-ink/10 px-2 py-1 text-center"
                      />
                    </div>
                    <div className="text-lg font-bold">Rs {(item.priceInINR * item.qty).toLocaleString("en-IN")}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-2xl bg-white p-5 sm:p-6 shadow-soft space-y-4 h-fit lg:sticky lg:top-24">
            <div className="flex justify-between text-base font-medium text-ink/70">
              <span>Subtotal</span>
              <span>Rs {total.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between text-base font-medium text-ink/70">
              <span>Shipping</span>
              <span>Included</span>
            </div>
            <div className="flex justify-between text-xl font-bold">
              <span>Total</span>
              <span>Rs {total.toLocaleString("en-IN")}</span>
            </div>
            {!session && (
              <p className="text-base text-ink/60">
                Login to save your cart and place the order.
              </p>
            )}
            <button
              onClick={placeOrder}
              disabled={placing || items.length === 0}
              className="w-full rounded-full bg-ink text-white py-3 text-base font-bold hover:bg-coal disabled:opacity-50"
            >
              Place order
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

