import Image from "next/image";
import Link from "next/link";
import React from "react";
import { CategoryDTO } from "@/types/shop";

export default function CollectionGrid({ categories }: { categories: CategoryDTO[] }) {
  return (
    <section className="section-shell py-12 sm:py-14">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
            <div className="relative aspect-[4/5]">
              <Image
                src={
                  cat.heroImage ||
                  "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80"
                }
                alt={cat.name}
                fill
                sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
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

