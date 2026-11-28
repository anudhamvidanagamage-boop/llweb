import { prisma } from "./prisma";
import { ProductCardData } from "@/components/ProductCard";

export function mapProductToCard(p: {
  id: string;
  slug: string;
  name: string;
  category: string;
  badge: string;
  priceLkr: number;
  compareAtLkr: number | null;
  stock: number;
  status: string;
  isPreOrder: boolean;
  isNewArrival: boolean;
  images: Array<{ url: string; altText: string; isCover: boolean; sortOrder: number }>;
}): ProductCardData {
  const sorted = [...p.images].sort((a, b) => {
    if (a.isCover && !b.isCover) return -1;
    if (!a.isCover && b.isCover) return 1;
    return a.sortOrder - b.sortOrder;
  });
  const cover = sorted[0] ?? null;
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    category: p.category,
    badge: p.badge,
    priceLkr: p.priceLkr,
    compareAtLkr: p.compareAtLkr,
    stock: p.stock,
    status: p.status,
    isPreOrder: p.isPreOrder,
    isNewArrival: p.isNewArrival,
    coverUrl: cover?.url ?? null,
    coverAlt: cover?.altText ?? p.name,
  };
}

export async function getActiveProducts() {
  const now = new Date();
  const rows = await prisma.product.findMany({
    where: {
      deletedAt: null,
      status: { in: ["ACTIVE", "SOLD_OUT"] },
      OR: [{ publishAt: null }, { publishAt: { lte: now } }],
    },
    include: {
      images: true,
    },
    orderBy: [{ isNewArrival: "desc" }, { createdAt: "desc" }],
  });
  return rows;
}
