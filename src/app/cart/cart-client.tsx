"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/cart/CartProvider";
import { useSession, signIn } from "next-auth/react";

export default function CartPageClient() {
  const { items, total, updateQty, removeItem, clear } = useCart();
  const { data: session, status } = useSession();
  const [placing, setPlacing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const placeOrder = async () => {
    if (!session) {
      signIn();
      return;
    }
    setPlacing(true);
    setMessage(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      if (res.ok) {
        clear();
        setMessage("Order placed! (demo only).");
      } else {
        setMessage("Could not place order.");
      }
    } catch (err) {
      setMessage("Something went wrong.");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <main className="section-shell py-12 space-y-8">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-ink/50">Cart</p>
        <h1 className="text-3xl font-semibold">Your picks</h1>
      </div>
      {items.length === 0 ? (
        <div className="rounded-2xl bg-white p-8 text-center shadow-soft">
          <p className="text-ink/70">Your cart is empty.</p>
          <Link href="/shop" className="mt-4 inline-block rounded-full bg-ink px-4 py-2 text-white">
            Shop products
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={`${item.productId}-${item.size}-${item.color}`}
                className="rounded-2xl bg-white p-4 shadow-soft flex gap-4"
              >
                <div className="h-24 w-24 overflow-hidden rounded-xl bg-sand">
                  <img
                    src={
                      item.image ||
                      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80"
                    }
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-sm text-ink/60">
                        {item.size && `Size ${item.size}`} {item.color && `· ${item.color}`}
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(item.productId, item.size, item.color)}
                      className="text-sm text-ink/50 hover:text-accent"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <label className="text-sm text-ink/60">Qty</label>
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
                    <div className="font-semibold">
                      ₹{(item.priceInINR * item.qty).toLocaleString("en-IN")}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-soft space-y-4 h-fit">
            <div className="flex justify-between text-sm text-ink/70">
              <span>Subtotal</span>
              <span>₹{total.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between text-sm text-ink/70">
              <span>Shipping</span>
              <span>Included</span>
            </div>
            <div className="flex justify-between text-lg font-semibold">
              <span>Total</span>
              <span>₹{total.toLocaleString("en-IN")}</span>
            </div>
            {!session && (
              <p className="text-sm text-ink/60">
                Login to save your cart and place the order.
              </p>
            )}
            <button
              onClick={placeOrder}
              disabled={placing || items.length === 0}
              className="w-full rounded-full bg-ink text-white py-3 font-semibold hover:bg-coal disabled:opacity-50"
            >
              {session ? "Place order" : "Login to checkout"}
            </button>
            {message && <p className="text-sm text-accent">{message}</p>}
          </div>
        </div>
      )}
    </main>
  );
}
