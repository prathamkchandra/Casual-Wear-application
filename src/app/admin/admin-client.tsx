"use client";

import React, { useMemo, useState } from "react";
import useSWR from "swr";
import { normalizeSlug } from "@/lib/slug";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to load data");
  return res.json();
};

type Category = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  heroImage?: string;
};

type Product = {
  _id: string;
  title: string;
  slug: string;
  description: string;
  priceInINR: number;
  categoryId?: string;
  stock: number;
  sizes?: string[];
  colors?: string[];
  images?: string[];
};

type Order = {
  _id: string;
  createdAt: string;
  status: string;
  items: Array<{ qty: number }>;
  grandTotalINR: number;
};

type UserRow = {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
};

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

const emptyProductState: FormState = {
  title: "",
  slug: "",
  description: "",
  priceInINR: 0,
  categorySlug: "",
  images: "",
  sizes: "",
  colors: "",
  stock: 0,
};

export default function AdminClient() {
  const { data: categories = [], mutate: refetchCategories } = useSWR<Category[]>(
    "/api/categories",
    fetcher
  );
  const { data: products = [], mutate: refetchProducts } = useSWR<Product[]>(
    "/api/products",
    fetcher
  );
  const { data: orders = [], mutate: refetchOrders } = useSWR<Order[]>(
    "/api/orders",
    fetcher
  );
  const { data: users = [] } = useSWR<UserRow[]>("/api/users", fetcher);

  const [catState, setCatState] = useState<FormState>({});
  const [prodState, setProdState] = useState<FormState>(emptyProductState);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const stats = useMemo(
    () => ({
      products: products.length,
      orders: orders.length,
      customers: users.filter((u) => u.role === "user").length,
    }),
    [products, orders, users]
  );

  const createCategory = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(catState),
      });
      setMessage(res.ok ? "Category created." : "Could not create category.");
      if (res.ok) {
        setCatState({});
        refetchCategories();
      }
    } finally {
      setBusy(false);
    }
  };

  const saveProduct = async () => {
    const normalizedSlug = normalizeSlug(prodState.slug || "");
    if (!normalizedSlug) {
      setMessage("Product slug is required.");
      return;
    }

    setBusy(true);
    setMessage(null);
    try {
      const payload = {
        ...prodState,
        slug: normalizedSlug,
        priceInINR: Number(prodState.priceInINR || 0),
        stock: Number(prodState.stock || 0),
        images: (prodState.images || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        sizes: (prodState.sizes || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        colors: (prodState.colors || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };

      const endpoint = editingSlug ? `/api/products/${editingSlug}` : "/api/products";
      const method = editingSlug ? "PUT" : "POST";
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      setMessage(
        res.ok
          ? editingSlug
            ? "Product updated."
            : "Product created."
          : "Could not save product."
      );

      if (res.ok) {
        setProdState(emptyProductState);
        setEditingSlug(null);
        refetchProducts();
      }
    } finally {
      setBusy(false);
    }
  };

  const startEditProduct = (product: Product) => {
    setEditingSlug(product.slug);
    setProdState({
      title: product.title,
      slug: product.slug,
      description: product.description,
      priceInINR: product.priceInINR,
      stock: product.stock,
      images: (product.images || []).join(", "),
      sizes: (product.sizes || []).join(", "),
      colors: (product.colors || []).join(", "),
      categorySlug: categories.find((c) => c._id === product.categoryId)?.slug || "",
    });
    setMessage(`Editing ${product.title}`);
  };

  const cancelEdit = () => {
    setEditingSlug(null);
    setProdState(emptyProductState);
    setMessage(null);
  };

  const deleteProduct = async (slug: string) => {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/products/${slug}`, { method: "DELETE" });
      setMessage(res.ok ? "Product deleted." : "Could not delete product.");
      if (res.ok) {
        if (editingSlug === slug) cancelEdit();
        refetchProducts();
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="section-shell py-10 sm:py-12 space-y-8">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-ink/50">Admin panel</p>
        <h1 className="text-3xl font-semibold">Store management</h1>
        <p className="text-ink/70">
          Manage products, categories, customers, and incoming orders from one place.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl bg-white p-5 shadow-soft">
          <p className="text-sm text-ink/60">Products</p>
          <p className="mt-1 text-2xl font-semibold">{stats.products}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-soft">
          <p className="text-sm text-ink/60">Orders</p>
          <p className="mt-1 text-2xl font-semibold">{stats.orders}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-soft">
          <p className="text-sm text-ink/60">Customers</p>
          <p className="mt-1 text-2xl font-semibold">{stats.customers}</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_1fr]">
        <div className="rounded-2xl bg-white p-6 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {editingSlug ? "Edit product" : "Create product"}
            </h2>
            {editingSlug && (
              <button onClick={cancelEdit} className="text-sm text-ink/70 hover:text-accent">
                Cancel edit
              </button>
            )}
          </div>
          <input
            placeholder="Title"
            value={prodState.title || ""}
            className="w-full rounded-lg border border-ink/10 px-3 py-2"
            onChange={(e) => setProdState((s) => ({ ...s, title: e.target.value }))}
          />
          <input
            placeholder="Slug"
            value={prodState.slug || ""}
            className="w-full rounded-lg border border-ink/10 px-3 py-2"
            onChange={(e) =>
              setProdState((s) => ({ ...s, slug: normalizeSlug(e.target.value) }))
            }
          />
          <input
            placeholder="Description"
            value={prodState.description || ""}
            className="w-full rounded-lg border border-ink/10 px-3 py-2"
            onChange={(e) => setProdState((s) => ({ ...s, description: e.target.value }))}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="number"
              placeholder="Price (INR)"
              value={prodState.priceInINR || 0}
              className="w-full rounded-lg border border-ink/10 px-3 py-2"
              onChange={(e) =>
                setProdState((s) => ({ ...s, priceInINR: Number(e.target.value) }))
              }
            />
            <input
              type="number"
              placeholder="Stock"
              value={prodState.stock || 0}
              className="w-full rounded-lg border border-ink/10 px-3 py-2"
              onChange={(e) => setProdState((s) => ({ ...s, stock: Number(e.target.value) }))}
            />
          </div>
          <select
            value={prodState.categorySlug || ""}
            className="w-full rounded-lg border border-ink/10 px-3 py-2"
            onChange={(e) => setProdState((s) => ({ ...s, categorySlug: e.target.value }))}
          >
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c._id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
          <input
            placeholder="Image URLs (comma separated)"
            value={prodState.images || ""}
            className="w-full rounded-lg border border-ink/10 px-3 py-2"
            onChange={(e) => setProdState((s) => ({ ...s, images: e.target.value }))}
          />
          <input
            placeholder="Sizes (comma separated)"
            value={prodState.sizes || ""}
            className="w-full rounded-lg border border-ink/10 px-3 py-2"
            onChange={(e) => setProdState((s) => ({ ...s, sizes: e.target.value }))}
          />
          <input
            placeholder="Colors (comma separated)"
            value={prodState.colors || ""}
            className="w-full rounded-lg border border-ink/10 px-3 py-2"
            onChange={(e) => setProdState((s) => ({ ...s, colors: e.target.value }))}
          />
          <button
            disabled={busy}
            onClick={saveProduct}
            className="rounded-full bg-ink text-white px-4 py-2 text-sm font-semibold hover:bg-coal disabled:opacity-50"
          >
            {editingSlug ? "Update product" : "Create product"}
          </button>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-soft space-y-4">
          <h2 className="text-lg font-semibold">Create category</h2>
          <input
            placeholder="Name"
            value={catState.name || ""}
            className="w-full rounded-lg border border-ink/10 px-3 py-2"
            onChange={(e) => setCatState((s) => ({ ...s, name: e.target.value }))}
          />
          <input
            placeholder="Slug"
            value={catState.slug || ""}
            className="w-full rounded-lg border border-ink/10 px-3 py-2"
            onChange={(e) => setCatState((s) => ({ ...s, slug: e.target.value }))}
          />
          <input
            placeholder="Description"
            value={catState.description || ""}
            className="w-full rounded-lg border border-ink/10 px-3 py-2"
            onChange={(e) => setCatState((s) => ({ ...s, description: e.target.value }))}
          />
          <input
            placeholder="Hero image URL"
            value={catState.heroImage || ""}
            className="w-full rounded-lg border border-ink/10 px-3 py-2"
            onChange={(e) => setCatState((s) => ({ ...s, heroImage: e.target.value }))}
          />
          <button
            disabled={busy}
            onClick={createCategory}
            className="rounded-full bg-ink text-white px-4 py-2 text-sm font-semibold hover:bg-coal disabled:opacity-50"
          >
            Create category
          </button>
          <div className="space-y-2">
            <p className="text-sm font-semibold">Existing categories</p>
            {categories.length ? (
              categories.map((c) => (
                <p key={c._id} className="text-sm text-ink/70">
                  {c.name} ({c.slug})
                </p>
              ))
            ) : (
              <p className="text-sm text-ink/60">No categories yet.</p>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-soft space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Products listing</h2>
          <button onClick={() => refetchProducts()} className="text-sm text-accent font-semibold">
            Refresh
          </button>
        </div>
        <div className="space-y-3">
          {products.length ? (
            products.map((product) => (
              <div
                key={product._id}
                className="rounded-xl border border-ink/10 p-4 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-semibold">{product.title}</p>
                  <p className="text-sm text-ink/60 break-words">
                    {product.slug} | Rs {product.priceInINR.toLocaleString("en-IN")} | Stock{" "}
                    {product.stock}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => startEditProduct(product)}
                    className="rounded-full border border-ink/15 px-3 py-1.5 text-sm hover:border-accent hover:text-accent"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteProduct(product.slug)}
                    className="rounded-full border border-red-200 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-ink/60 text-sm">No products yet.</p>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Orders</h2>
            <button onClick={() => refetchOrders()} className="text-sm text-accent font-semibold">
              Refresh
            </button>
          </div>
          <div className="space-y-3">
            {orders.length ? (
              orders.map((order) => (
                <div
                  key={order._id}
                  className="rounded-xl border border-ink/10 p-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-semibold">#{order._id.slice(-6)}</p>
                    <p className="text-sm text-ink/60">
                      {new Date(order.createdAt).toLocaleString()} | {order.items.length} items
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">Rs {order.grandTotalINR.toLocaleString("en-IN")}</p>
                    <p className="text-xs uppercase tracking-[0.2em] text-ink/50">{order.status}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-ink/60 text-sm">No orders yet.</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-soft space-y-4">
          <h2 className="text-lg font-semibold">Customers</h2>
          <div className="space-y-3">
            {users.length ? (
              users
                .filter((user) => user.role === "user")
                .map((user) => (
                  <div
                    key={user._id}
                  className="rounded-xl border border-ink/10 p-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
                >
                    <div>
                      <p className="font-semibold">{user.name}</p>
                      <p className="text-sm text-ink/60">{user.email}</p>
                    </div>
                    <p className="text-xs uppercase tracking-[0.2em] text-ink/50">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))
            ) : (
              <p className="text-ink/60 text-sm">No customers found.</p>
            )}
          </div>
        </div>
      </div>

      {message && <p className="text-sm text-accent">{message}</p>}
    </main>
  );
}
