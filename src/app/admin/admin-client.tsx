"use client";

import React, { useState } from "react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type FormState = {
  name?: string;
  slug?: string;
  description?: string;
  heroImage?: string;
  title?: string;
  priceInINR?: number;
  categorySlug?: string;
  images?: string;
  sizes?: string;
  colors?: string;
  stock?: number;
};

export default function AdminClient() {
  const { data: categories, mutate: refetchCategories } = useSWR("/api/categories", fetcher);
  const { mutate: refetchProducts } = useSWR("/api/products", fetcher);
  const { data: orders, mutate: refetchOrders } = useSWR("/api/orders", fetcher);

  const [catState, setCatState] = useState<FormState>({});
  const [prodState, setProdState] = useState<FormState>({});
  const [message, setMessage] = useState<string | null>(null);

  const createCategory = async () => {
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(catState),
    });
    setMessage(res.ok ? "Category created" : "Error creating category");
    refetchCategories();
  };

  const createProduct = async () => {
    const payload = {
      ...prodState,
      priceInINR: Number(prodState.priceInINR),
      stock: Number(prodState.stock || 0),
      images: prodState.images?.split(",").map((s) => s.trim()),
      sizes: prodState.sizes?.split(",").map((s) => s.trim()),
      colors: prodState.colors?.split(",").map((s) => s.trim()),
    };
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setMessage(res.ok ? "Product created" : "Error creating product");
    refetchProducts();
  };

  return (
    <main className="section-shell py-12 space-y-10">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-ink/50">Admin</p>
        <h1 className="text-3xl font-semibold">Catalog control</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow-soft space-y-4">
          <h2 className="text-lg font-semibold">Add category</h2>
          <input
            placeholder="Name"
            className="w-full rounded-lg border border-ink/10 px-3 py-2"
            onChange={(e) => setCatState((s) => ({ ...s, name: e.target.value }))}
          />
          <input
            placeholder="Slug"
            className="w-full rounded-lg border border-ink/10 px-3 py-2"
            onChange={(e) => setCatState((s) => ({ ...s, slug: e.target.value }))}
          />
          <input
            placeholder="Description"
            className="w-full rounded-lg border border-ink/10 px-3 py-2"
            onChange={(e) => setCatState((s) => ({ ...s, description: e.target.value }))}
          />
          <input
            placeholder="Hero image URL"
            className="w-full rounded-lg border border-ink/10 px-3 py-2"
            onChange={(e) => setCatState((s) => ({ ...s, heroImage: e.target.value }))}
          />
          <button
            onClick={createCategory}
            className="rounded-full bg-ink text-white px-4 py-2 text-sm font-semibold hover:bg-coal"
          >
            Create category
          </button>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-soft space-y-4">
          <h2 className="text-lg font-semibold">Add product</h2>
          <input
            placeholder="Title"
            className="w-full rounded-lg border border-ink/10 px-3 py-2"
            onChange={(e) => setProdState((s) => ({ ...s, title: e.target.value }))}
          />
          <input
            placeholder="Slug"
            className="w-full rounded-lg border border-ink/10 px-3 py-2"
            onChange={(e) => setProdState((s) => ({ ...s, slug: e.target.value }))}
          />
          <input
            placeholder="Description"
            className="w-full rounded-lg border border-ink/10 px-3 py-2"
            onChange={(e) => setProdState((s) => ({ ...s, description: e.target.value }))}
          />
          <input
            type="number"
            placeholder="Price (INR)"
            className="w-full rounded-lg border border-ink/10 px-3 py-2"
            onChange={(e) => setProdState((s) => ({ ...s, priceInINR: Number(e.target.value) }))}
          />
          <input
            type="number"
            placeholder="Stock"
            className="w-full rounded-lg border border-ink/10 px-3 py-2"
            onChange={(e) => setProdState((s) => ({ ...s, stock: Number(e.target.value) }))}
          />
          <select
            className="w-full rounded-lg border border-ink/10 px-3 py-2"
            onChange={(e) => setProdState((s) => ({ ...s, categorySlug: e.target.value }))}
          >
            <option>Select category</option>
            {categories?.map((c: any) => (
              <option key={c._id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
          <input
            placeholder="Image URLs (comma separated)"
            className="w-full rounded-lg border border-ink/10 px-3 py-2"
            onChange={(e) => setProdState((s) => ({ ...s, images: e.target.value }))}
          />
          <input
            placeholder="Sizes (comma separated)"
            className="w-full rounded-lg border border-ink/10 px-3 py-2"
            onChange={(e) => setProdState((s) => ({ ...s, sizes: e.target.value }))}
          />
          <input
            placeholder="Colors (comma separated)"
            className="w-full rounded-lg border border-ink/10 px-3 py-2"
            onChange={(e) => setProdState((s) => ({ ...s, colors: e.target.value }))}
          />
          <button
            onClick={createProduct}
            className="rounded-full bg-ink text-white px-4 py-2 text-sm font-semibold hover:bg-coal"
          >
            Create product
          </button>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-soft space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Orders</h2>
          <button
            onClick={() => refetchOrders()}
            className="text-sm text-accent font-semibold"
          >
            Refresh
          </button>
        </div>
        <div className="space-y-3">
          {orders?.length ? (
            orders.map((order: any) => (
              <div
                key={order._id}
                className="rounded-xl border border-ink/10 p-4 flex items-center justify-between"
              >
                <div>
                  <p className="font-semibold">#{order._id.slice(-6)}</p>
                  <p className="text-sm text-ink/60">
                    {new Date(order.createdAt).toLocaleString()} · {order.items.length} items
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">₹{order.grandTotalINR.toLocaleString("en-IN")}</p>
                  <p className="text-xs uppercase tracking-[0.2em] text-ink/50">{order.status}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-ink/60 text-sm">No orders yet.</p>
          )}
        </div>
      </div>
      {message && <p className="text-sm text-accent">{message}</p>}
    </main>
  );
}
