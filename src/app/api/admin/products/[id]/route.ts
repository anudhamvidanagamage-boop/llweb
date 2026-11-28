import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logAudit, requireAdmin, verifySameOrigin } from "@/lib/auth";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { images: { orderBy: { sortOrder: "asc" } } },
  });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ product });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!verifySameOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }
  let session;
  try {
    session = await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await request.json();
    const images = Array.isArray(body.images) ? body.images : [];

    const updated = await prisma.$transaction(async (tx) => {
      await tx.productImage.deleteMany({ where: { productId: id } });
      return tx.product.update({
        where: { id },
        data: {
          sku: String(body.sku || existing.sku),
          slug: String(body.slug || existing.slug),
          name: String(body.name || existing.name),
          category: String(body.category || existing.category),
          badge: String(body.badge || existing.badge),
          fabric: String(body.fabric ?? existing.fabric),
          weave: String(body.weave ?? existing.weave),
          origin: String(body.origin ?? existing.origin),
          length: String(body.length ?? existing.length),
          colours: JSON.stringify(Array.isArray(body.colours) ? body.colours : []),
          occasions: JSON.stringify(Array.isArray(body.occasions) ? body.occasions : []),
          shortDesc: String(body.shortDesc ?? existing.shortDesc),
          longDesc: String(body.longDesc ?? existing.longDesc),
          care: String(body.care ?? existing.care),
          priceLkr: Math.max(0, Math.round(Number(body.priceLkr) || 0)),
          compareAtLkr: body.compareAtLkr ? Math.round(Number(body.compareAtLkr)) : null,
          costLkr: Math.max(0, Math.round(Number(body.costLkr) || 0)),
          stock: Math.max(0, Math.round(Number(body.stock) || 0)),
          lowStockThreshold: Math.max(0, Math.round(Number(body.lowStockThreshold) || 3)),
          status: String(body.status || existing.status),
          isPreOrder: Boolean(body.isPreOrder),
          isNewArrival: Boolean(body.isNewArrival),
          publishAt: body.publishAt ? new Date(body.publishAt) : null,
          seoTitle: body.seoTitle ? String(body.seoTitle) : null,
          seoDesc: body.seoDesc ? String(body.seoDesc) : null,
          images: {
            create: images.map(
              (img: { url: string; altText?: string; isCover?: boolean }, idx: number) => ({
                url: img.url,
                altText: img.altText || String(body.name || existing.name),
                sortOrder: idx,
                isCover: Boolean(img.isCover ?? idx === 0),
              })
            ),
          },
        },
        include: { images: { orderBy: { sortOrder: "asc" } } },
      });
    });

    await logAudit({
      userId: session.userId,
      action: "PRODUCT_UPDATE",
      entityType: "Product",
      entityId: id,
      details: {
        priceChanged: existing.priceLkr !== updated.priceLkr ? [existing.priceLkr, updated.priceLkr] : undefined,
        stockChanged: existing.stock !== updated.stock ? [existing.stock, updated.stock] : undefined,
      },
    });

    return NextResponse.json({ product: updated });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Update failed" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!verifySameOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }
  let session;
  try {
    session = await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.product.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  await logAudit({
    userId: session.userId,
    action: "PRODUCT_SOFT_DELETE",
    entityType: "Product",
    entityId: id,
  });

  return NextResponse.json({ ok: true });
}
