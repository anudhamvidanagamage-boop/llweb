import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getStoreSettings } from "@/lib/settings";
import { getActiveProducts, mapProductToCard } from "@/lib/products";
import { parseJsonArray } from "@/lib/constants";
import { ProductDetailClient } from "@/components/ProductDetailClient";
import { ProductCard } from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) return { title: "Saree Not Found" };
  return {
    title: product.seoTitle || product.name,
    description: product.seoDesc || product.shortDesc,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [product, settings, allActive] = await Promise.all([
    prisma.product.findFirst({
      where: { slug, deletedAt: null },
      include: { images: { orderBy: { sortOrder: "asc" } } },
    }),
    getStoreSettings(),
    getActiveProducts(),
  ]);

  if (!product || (product.status !== "ACTIVE" && product.status !== "SOLD_OUT")) {
    notFound();
  }

  const related = allActive
    .filter((p) => p.id !== product.id)
    .slice(0, 4)
    .map(mapProductToCard);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.sku,
    description: product.shortDesc,
    brand: { "@type": "Brand", name: "Luxe Loomie" },
    offers: {
      "@type": "Offer",
      priceCurrency: "LKR",
      price: product.priceLkr,
      availability:
        product.stock > 0 && product.status === "ACTIVE"
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <ProductDetailClient
        product={{
          ...product,
          colours: parseJsonArray(product.colours),
          occasions: parseJsonArray(product.occasions),
        }}
        whatsappNumber={settings.whatsappNumber}
        bundleLabel={settings.bundleRule.enabled ? settings.bundleRule.label : ""}
      />

      {/* Complete the look */}
      {related.length > 0 && (
        <section className="mt-20 border-t border-neutral-200 pt-12">
          <span className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">
            Curated Pairings
          </span>
          <h2 className="mt-1 font-serif text-3xl">Complete the Look</h2>
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
