import type { Metadata } from "next";
import { getActiveProducts, mapProductToCard } from "@/lib/products";
import { parseJsonArray } from "@/lib/constants";
import { ShopClient } from "@/components/ShopClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shop Sarees",
  description:
    "Browse Sri Lankan handloom sarees (Rayon, Full Cotton, Rayon Pune, Cotton Pune, Embroidered) and curated imported sarees.",
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; badge?: string; occasion?: string; sort?: string }>;
}) {
  const sp = await searchParams;
  const rows = await getActiveProducts();
  const products = rows.map((p) => ({
    ...mapProductToCard(p),
    colours: parseJsonArray(p.colours),
    occasions: parseJsonArray(p.occasions),
    createdAtMs: p.createdAt.getTime(),
  }));

  return (
    <ShopClient
      products={products}
      initialCategory={sp.category || ""}
      initialBadge={sp.badge || ""}
      initialOccasion={sp.occasion || ""}
      initialSort={sp.sort || "newest"}
    />
  );
}
