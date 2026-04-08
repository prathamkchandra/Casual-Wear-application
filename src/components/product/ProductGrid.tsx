"use client";

import React, { useMemo, useState } from "react";
import { ProductDTO, CategoryDTO } from "@/types/shop";
import { useSearchParams, useRouter } from "next/navigation";
import ProductCard from "./ProductCard";

type PriceBand = "all" | "under2k" | "2to4" | "above4";

export default function ProductGrid({
  products,
  categories,
}: {
  products: ProductDTO[];
  categories: CategoryDTO[];
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialCategory = searchParams.get("category") || "all";
  const [category, setCategory] = useState(initialCategory);
  const [price, setPrice] = useState<PriceBand>("all");

  const filtered = useMemo(() => {
    const selectedCatId =
      category === "all"
        ? null
        : categories.find((c) => c.slug === category)?._id?.toString();
    return products.filter((p) => {
      const okCategory =
        category === "all"
          ? true
          : String((p as any).categoryId) === selectedCatId;
      const okPrice =
        price === "all"
          ? true
          : price === "under2k"
          ? p.priceInINR < 2000
          : price === "2to4"
          ? p.priceInINR >= 2000 && p.priceInINR <= 4000
          : p.priceInINR > 4000;
      return okCategory && okPrice;
    });
  }, [category, price, products, categories]);

  const handleCategory = (value: string) => {
    setCategory(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") params.delete("category");
    else params.set("category", value);
    router.replace(`/shop?${params.toString()}`);
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
      <aside className="rounded-2xl bg-white shadow-soft p-4 space-y-4 h-fit">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-ink/50">Category</p>
          <div className="mt-2 space-y-2">
            <FilterButton
              active={category === "all"}
              onClick={() => handleCategory("all")}
              label="All"
            />
            {categories.map((cat) => (
              <FilterButton
                key={cat.slug}
                active={category === cat.slug}
                onClick={() => handleCategory(cat.slug)}
                label={cat.name}
              />
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-ink/50">Price</p>
          <div className="mt-2 space-y-2">
            <FilterButton active={price === "all"} onClick={() => setPrice("all")} label="All" />
            <FilterButton
              active={price === "under2k"}
              onClick={() => setPrice("under2k")}
              label="Under ₹2k"
            />
            <FilterButton
              active={price === "2to4"}
              onClick={() => setPrice("2to4")}
              label="₹2k - ₹4k"
            />
            <FilterButton
              active={price === "above4"}
              onClick={() => setPrice("above4")}
              label="Above ₹4k"
            />
          </div>
        </div>
      </aside>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((product) => (
          <ProductCard key={product._id.toString()} product={product} />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center text-ink/60">
            Nothing matches these filters.
          </div>
        )}
      </div>
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-full border px-3 py-2 text-left text-sm transition-colors ${
        active
          ? "border-accent bg-accent/10 text-accent"
          : "border-ink/10 text-ink/70 hover:border-accent/70 hover:text-accent"
      }`}
    >
      {label}
    </button>
  );
}
