import { Suspense } from "react";
import ProductGrid from "@/components/product/ProductGrid";
import { getCategories, getProducts } from "@/lib/data";

export const revalidate = 60;

export default async function ShopPage() {
  const [productsRaw, categoriesRaw] = await Promise.all([getProducts(), getCategories()]);
  const products = JSON.parse(JSON.stringify(productsRaw));
  const categories = JSON.parse(JSON.stringify(categoriesRaw));

  return (
    <main className="section-shell py-10 sm:py-14 space-y-8">
      <div className="space-y-2">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-ink/50">Shop</p>
        <h1 className="text-3xl sm:text-4xl font-bold">Choose your fit</h1>
        <p className="text-base sm:text-lg font-medium text-ink/70">
          Filter by category and price to build your casual rotation.
        </p>
      </div>
      <Suspense fallback={<p className="text-base text-ink/60">Loading products...</p>}>
        <ProductGrid products={products} categories={categories} />
      </Suspense>
    </main>
  );
}
