import Image from "next/image";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/data";
import { DEFAULT_PRODUCT_IMAGE, getSafeProductImage } from "@/lib/image";
import ProductDetailActions from "./product-actions";

export const revalidate = 60;

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug);
  if (!product) return notFound();
  const plainProduct = JSON.parse(JSON.stringify(product));

  return (
    <div className="section-shell py-10 sm:py-12 grid gap-8 lg:gap-10 lg:grid-cols-2">
      <div className="relative aspect-[4/5] min-h-[320px] sm:min-h-[420px] lg:min-h-[560px] overflow-hidden rounded-3xl shadow-soft bg-white">
        <Image
          src={getSafeProductImage(product.images?.[0], DEFAULT_PRODUCT_IMAGE)}
          alt={product.title}
          fill
          sizes="(min-width:1024px) 50vw, 100vw"
          className="object-cover"
          priority
        />
      </div>
      <div className="space-y-6">
        <div className="space-y-2">
          <p className="text-sm text-ink/60">New arrival</p>
          <h1 className="text-2xl sm:text-3xl font-semibold leading-tight">{product.title}</h1>
          <p className="text-base sm:text-lg text-ink/70">{product.description}</p>
        </div>
        <div className="text-2xl sm:text-3xl font-semibold">Rs {product.priceInINR.toLocaleString("en-IN")}</div>
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

