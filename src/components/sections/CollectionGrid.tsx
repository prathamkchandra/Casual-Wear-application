import Link from "next/link";
import React from "react";
import { ICategory } from "@/models/Category";

export default function CollectionGrid({ categories }: { categories: ICategory[] }) {
  return (
    <section className="section-shell py-14">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-ink/50">Categories</p>
          <h2 className="text-2xl font-semibold">Explore the range</h2>
        </div>
        <Link href="/shop" className="text-sm font-semibold hover:text-accent">
          View all
        </Link>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => (
          <Link
            href={`/shop?category=${cat.slug}`}
            key={cat._id.toString()}
            className="group relative overflow-hidden rounded-2xl bg-white shadow-soft"
          >
            <div className="aspect-[4/5]">
              <img
                src={
                  cat.heroImage ||
                  "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80"
                }
                alt={cat.name}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <h3 className="text-lg font-semibold">{cat.name}</h3>
              <p className="text-sm text-white/80 line-clamp-2">{cat.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
