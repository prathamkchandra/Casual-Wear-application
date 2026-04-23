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
  const initialQuery = searchParams.get("q") || "";
  const [category, setCategory] = useState(initialCategory);
  const [price, setPrice] = useState<PriceBand>("all");
  const [query, setQuery] = useState(initialQuery);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const selectedCatId =
      category === "all"
        ? null
        : categories.find((c) => c.slug === category)?._id?.toString();

    return products.filter((p) => {
      const okCategory =
        category === "all"
          ? true
          : String((p as ProductDTO).categoryId) === selectedCatId;
      const okPrice =
        price === "all"
          ? true
          : price === "under2k"
          ? p.priceInINR < 2000
          : price === "2to4"
          ? p.priceInINR >= 2000 && p.priceInINR <= 4000
          : p.priceInINR > 4000;
      const searchableText = [
        p.title,
        p.description,
        ...(p.tags ?? []),
        ...(p.colors ?? []),
        ...(p.sizes ?? []),
      ]
        .join(" ")
        .toLowerCase();
      const okQuery = normalizedQuery ? searchableText.includes(normalizedQuery) : true;

      return okCategory && okPrice && okQuery;
    });
  }, [category, price, query, products, categories]);

  const handleCategory = (value: string) => {
    setCategory(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") params.delete("category");
    else params.set("category", value);
    router.replace(`/shop?${params.toString()}`);
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      <section className="rounded-2xl bg-white shadow-soft p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs uppercase tracking-[0.2em] text-ink/50">Search Products</p>
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="text-xs text-ink/60 hover:text-accent"
            >
              Clear
            </button>
          )}
        </div>
        <div className="mt-2">
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, tag, color..."
            className="w-full rounded-full border border-ink/15 px-4 py-3 text-sm focus:border-accent focus:outline-none"
          />
        </div>
      </section>

      <div className="grid grid-cols-1 gap-5 lg:gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="rounded-2xl bg-white shadow-soft p-4 space-y-4 h-fit lg:sticky lg:top-24">
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
                label="Under Rs 2k"
              />
              <FilterButton
                active={price === "2to4"}
                onClick={() => setPrice("2to4")}
                label="Rs 2k - Rs 4k"
              />
              <FilterButton
                active={price === "above4"}
                onClick={() => setPrice("above4")}
                label="Above Rs 4k"
              />
            </div>
          </div>
        </aside>

        <div className="space-y-4">
          <p className="text-sm text-ink/60">{filtered.length} products</p>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((product) => (
              <ProductCard key={product._id.toString()} product={product} />
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full text-center text-ink/60">Nothing matches these filters.</div>
            )}
          </div>
        </div>
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
