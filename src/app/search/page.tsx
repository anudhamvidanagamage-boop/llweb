import Link from "next/link";
import { getActiveProducts, mapProductToCard } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const sp = await searchParams;
  const q = (sp.q || "").trim();
  const rows = await getActiveProducts();
  const matched = q
    ? rows
        .filter((r) => {
          const hay = `${r.name} ${r.sku} ${r.fabric} ${r.colours} ${r.occasions} ${r.category}`.toLowerCase();
          return hay.includes(q.toLowerCase());
        })
        .map(mapProductToCard)
    : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="border-b border-neutral-200 pb-6">
        <span className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">Search</span>
        <h1 className="mt-1 font-serif text-4xl">
          {q ? `Results for “${q}”` : "Search Sarees"}
        </h1>
        <p className="mt-2 text-sm text-neutral-600">{matched.length} matching sarees</p>
      </div>

      {matched.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-sm text-neutral-600">No sarees found matching your query.</p>
          <Link
            href="/shop"
            className="mt-5 inline-block border border-black px-6 py-2.5 text-xs uppercase tracking-widest hover:bg-black hover:text-white"
          >
            View Full Collection
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-4">
          {matched.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
