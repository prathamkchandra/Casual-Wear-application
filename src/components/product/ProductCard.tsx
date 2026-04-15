"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";
import { ProductDTO } from "@/types/shop";

export default function ProductCard({ product }: { product: ProductDTO }) {
  return (
    <Link
      href={`/product/${product.slug}`}
      className="group rounded-2xl bg-white shadow-soft overflow-hidden"
    >
      <div className="relative aspect-[4/5] overflow-hidden">
        <Image
          src={
            product.images?.[0] ||
            "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80"
          }
          alt={product.title}
          fill
          sizes="(min-width:1024px) 320px, (min-width:640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{product.title}</h3>
          <span className="text-sm font-semibold text-accent">
            ₹{product.priceInINR.toLocaleString("en-IN")}
          </span>
        </div>
        <p className="text-sm text-ink/60 line-clamp-2">{product.description}</p>
        <div className="flex gap-2 text-xs text-ink/50">
          {product.sizes?.slice(0, 3).map((size) => (
            <span
              key={size}
              className="rounded-full border border-ink/10 px-2 py-1"
            >
              {size}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
