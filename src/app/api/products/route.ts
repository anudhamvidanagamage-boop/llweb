import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mapProductToCard } from "@/lib/products";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() || "";
  const ids = searchParams.get("ids")?.split(",").filter(Boolean) || [];
  const limit = Math.min(50, Number(searchParams.get("limit") || "50"));

  const now = new Date();
  const where: Record<string, unknown> = {
    deletedAt: null,
    status: { in: ["ACTIVE", "SOLD_OUT"] },
    OR: [{ publishAt: null }, { publishAt: { lte: now } }],
  };

  if (ids.length > 0) {
    where.id = { in: ids };
  }

  const rows = await prisma.product.findMany({
    where,
    include: { images: true },
    orderBy: [{ isNewArrival: "desc" }, { createdAt: "desc" }],
  });

  const filtered = q
    ? rows.filter((r) => {
        const hay = `${r.name} ${r.sku} ${r.fabric} ${r.colours} ${r.occasions} ${r.category}`.toLowerCase();
        return hay.includes(q.toLowerCase());
      })
    : rows;

  return NextResponse.json({
    products: filtered.slice(0, limit).map(mapProductToCard),
  });
}
