import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/data";
import ProductDetailActions from "./product-actions";

export const revalidate = 60;

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug);
  if (!product) return notFound();
  const plainProduct = JSON.parse(JSON.stringify(product));

  return (
    <div className="section-shell py-12 grid gap-10 lg:grid-cols-2">
      <div className="relative overflow-hidden rounded-3xl shadow-soft bg-white">
        <img
          src={
            product.images?.[0] ||
            "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1400&q=80"
          }
          alt={product.title}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="space-y-6">
        <div className="space-y-2">
          <p className="text-sm text-ink/60">New arrival</p>
          <h1 className="text-3xl font-semibold">{product.title}</h1>
          <p className="text-lg text-ink/70">{product.description}</p>
        </div>
        <div className="text-3xl font-semibold">₹{product.priceInINR.toLocaleString("en-IN")}</div>
        <ProductDetailActions product={plainProduct} />
        <div className="space-y-2 text-sm text-ink/70">
          <p>Fabric: breathable cotton blend</p>
          <p>Care: Machine wash cold, tumble dry low</p>
          <p>Delivery: 3-5 business days</p>
        </div>
      </div>
    </div>
  );
}
