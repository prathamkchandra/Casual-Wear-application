"use client";

import React, { useState } from "react";
import { ProductDTO } from "@/types/shop";
import { useCart } from "@/components/cart/CartProvider";
import { DEFAULT_PRODUCT_IMAGE, getSafeProductImage } from "@/lib/image";

export default function ProductDetailActions({ product }: { product: ProductDTO }) {
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [size, setSize] = useState(product.sizes?.[0]);
  const [color, setColor] = useState(product.colors?.[0]);

  const handleAdd = () => {
    addItem({
      productId: product._id,
      name: product.title,
      priceInINR: product.priceInINR,
      image: getSafeProductImage(product.images?.[0], DEFAULT_PRODUCT_IMAGE),
      size,
      color,
      qty,
    });
  };

  return (
    <div className="space-y-4">
      {(product.sizes?.length ?? 0) > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold">Size</p>
          <div className="flex gap-2">
            {(product.sizes ?? []).map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={`rounded-full border px-3 py-2 text-sm ${
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
          <p className="text-sm font-semibold">Color</p>
          <div className="flex gap-2">
            {(product.colors ?? []).map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`rounded-full border px-3 py-2 text-sm capitalize ${
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
        <label className="text-sm font-semibold">Qty</label>
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
        className="rounded-full bg-ink text-white px-6 py-3 text-sm font-semibold hover:bg-coal"
      >
        Add to cart
      </button>
    </div>
  );
}
