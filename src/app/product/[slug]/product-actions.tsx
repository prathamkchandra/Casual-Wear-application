"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { ProductDTO } from "@/types/shop";
import { useCart } from "@/components/cart/CartProvider";
import { DEFAULT_PRODUCT_IMAGE, getSafeProductImage } from "@/lib/image";

export default function ProductDetailActions({ product }: { product: ProductDTO }) {
  const { addItem } = useCart();
  const { status } = useSession();
  const [qty, setQty] = useState(1);
  const [size, setSize] = useState(product.sizes?.[0]);
  const [color, setColor] = useState(product.colors?.[0]);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const hideTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (hideTimerRef.current !== null) {
        window.clearTimeout(hideTimerRef.current);
      }
    };
  }, []);

  const handleAdd = () => {
    if (status !== "authenticated") {
      setFeedback({
        type: "error",
        text: "Please create an account for shopping.",
      });
      if (hideTimerRef.current !== null) {
        window.clearTimeout(hideTimerRef.current);
      }
      hideTimerRef.current = window.setTimeout(() => {
        setFeedback(null);
      }, 2500);
      return;
    }

    addItem({
      productId: product._id,
      name: product.title,
      priceInINR: product.priceInINR,
      image: getSafeProductImage(product.images?.[0], DEFAULT_PRODUCT_IMAGE),
      size,
      color,
      qty,
    });
    setFeedback({
      type: "success",
      text: "Item added to cart.",
    });
    if (hideTimerRef.current !== null) {
      window.clearTimeout(hideTimerRef.current);
    }
    hideTimerRef.current = window.setTimeout(() => {
      setFeedback(null);
    }, 2500);
  };

  return (
    <div className="space-y-4">
      {(product.sizes?.length ?? 0) > 0 && (
        <div className="space-y-2">
          <p className="text-base font-bold">Size</p>
          <div className="flex gap-2">
            {(product.sizes ?? []).map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={`rounded-full border px-3 py-2 text-base font-semibold ${
                  size === s
                    ? "border-ink bg-ink text-white"
                    : "border-ink/10 text-ink/70 hover:border-ink/40"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {(product.colors?.length ?? 0) > 0 && (
        <div className="space-y-2">
          <p className="text-base font-bold">Color</p>
          <div className="flex gap-2">
            {(product.colors ?? []).map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`rounded-full border px-3 py-2 text-base font-semibold capitalize ${
                  color === c
                    ? "border-ink bg-ink text-white"
                    : "border-ink/10 text-ink/70 hover:border-ink/40"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-4">
        <label className="text-base font-bold">Qty</label>
        <input
          type="number"
          min={1}
          value={qty}
          onChange={(e) => setQty(Number(e.target.value))}
          className="w-16 rounded-lg border border-ink/10 px-2 py-2 text-center"
        />
      </div>

      <button
        onClick={handleAdd}
        className="rounded-full bg-ink text-white px-6 py-3 text-base font-bold hover:bg-coal"
      >
        Add to cart
      </button>
      {feedback && (
        <p
          className={`rounded-xl border px-3 py-2 text-sm font-semibold ${
            feedback.type === "success"
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {feedback.text}
        </p>
      )}
    </div>
  );
}
