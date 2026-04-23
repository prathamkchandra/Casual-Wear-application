"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { ProductDTO } from "@/types/shop";
import { DEFAULT_PRODUCT_IMAGE, getSafeProductImage } from "@/lib/image";

export default function ProductCard({ product }: { product: ProductDTO }) {
  const fallbackImage = DEFAULT_PRODUCT_IMAGE;
  const preferredImage = getSafeProductImage(product.images?.[0], fallbackImage);
  const [imageSrc, setImageSrc] = useState(preferredImage);

  useEffect(() => {
    setImageSrc(preferredImage);
  }, [preferredImage]);

  return (
    <Link
      href={`/product/${encodeURIComponent(product.slug)}`}
      className="group rounded-2xl bg-white shadow-soft overflow-hidden"
    >
      <div className="relative aspect-[4/5] overflow-hidden">
        <Image
          src={imageSrc}
          alt={product.title}
          fill
          sizes="(min-width:1024px) 320px, (min-width:640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          onError={() => {
            if (imageSrc !== fallbackImage) setImageSrc(fallbackImage);
          }}
        />
      </div>
      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base sm:text-lg font-semibold leading-tight line-clamp-2">{product.title}</h3>
          <span className="text-sm font-semibold text-accent">Rs {product.priceInINR.toLocaleString("en-IN")}</span>
        </div>
        <p className="text-sm text-ink/60 line-clamp-2">{product.description}</p>
        <div className="flex flex-wrap gap-2 text-xs text-ink/50">
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

