import CollectionGrid from "@/components/sections/CollectionGrid";
import Hero from "@/components/sections/Hero";
import AiStylist from "@/components/sections/AiStylist";
import ProductCard from "@/components/product/ProductCard";
import { getCategories, getProducts } from "@/lib/data";

export const revalidate = 60;

export default async function Home() {
  const [categories, products] = await Promise.all([getCategories(), getProducts(6)]);

  return (
    <main>
      <Hero />
      <AiStylist />
      <CollectionGrid categories={categories.slice(0, 3)} />
      <section className="section-shell py-12 sm:py-14 space-y-6" id="lookbook">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-ink/50">Featured</p>
            <h2 className="text-3xl sm:text-4xl font-bold">Fresh arrivals</h2>
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product._id.toString()} product={product} />
          ))}
        </div>
      </section>
      <section className="section-shell py-12 sm:py-14">
        <div className="rounded-3xl bg-ink text-white px-5 py-8 sm:px-8 sm:py-12 shadow-soft grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div className="space-y-3">
            <p className="text-sm sm:text-base font-semibold text-white/80">Promise</p>
            <h3 className="text-3xl sm:text-4xl font-bold">Softer, lighter, longer lasting.</h3>
            <p className="text-base sm:text-lg font-medium text-white/80">
              Garments engineered for all-day wear with breathable fabrics, clean silhouettes,
              and subtle details. INR-first pricing, free exchanges.
            </p>
          </div>
          <div className="rounded-2xl bg-white/10 p-6 border border-white/10">
            <ul className="space-y-3 text-white/80 text-base font-medium">
              <li>- Tailored relaxed fits for Indian weather</li>
              <li>- Soft touch fabrics: cotton modal, terry, and linen blends</li>
              <li>- Built-in stretch waistbands and flatlock seams</li>
            </ul>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a
                href="/shop"
                className="rounded-full bg-white text-ink px-4 py-2 text-base font-bold text-center"
              >
                Shop now
              </a>
              <a
                href="/cart"
                className="rounded-full border border-white/50 px-4 py-2 text-base font-bold text-white hover:bg-white/10 text-center"
              >
                View cart
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
