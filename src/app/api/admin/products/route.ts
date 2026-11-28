import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logAudit, requireAdmin, verifySameOrigin } from "@/lib/auth";
import { slugify } from "@/lib/constants";

export async function GET(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const includeDeleted = searchParams.get("includeDeleted") === "1";

  const products = await prisma.product.findMany({
    where: includeDeleted ? {} : { deletedAt: null },
    include: { images: { orderBy: { sortOrder: "asc" } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ products });
}

export async function POST(request: Request) {
  if (!verifySameOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }
  let session;
  try {
    session = await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const name = String(body.name || "").trim();
    if (!name) {
      return NextResponse.json({ error: "Product name is required" }, { status: 400 });
    }

    const sku =
      String(body.sku || "").trim() ||
      `LL-${Date.now().toString().slice(-5)}-${Math.floor(10 + Math.random() * 90)}`;
    const baseSlug = slugify(String(body.slug || name)) || `saree-${Date.now()}`;
    const existingSlug = await prisma.product.findUnique({ where: { slug: baseSlug } });
    const slug = existingSlug ? `${baseSlug}-${Date.now().toString().slice(-4)}` : baseSlug;

    const images = Array.isArray(body.images) ? body.images : [];

    const created = await prisma.product.create({
      data: {
        sku,
        slug,
        name,
        category: String(body.category || "RAYON_HANDLOOM"),
        badge: String(body.badge || "HANDLOOM"),
        fabric: String(body.fabric || ""),
        weave: String(body.weave || ""),
        origin: String(body.origin || "Sri Lanka"),
        length: String(body.length || "Approx. 5.5 m body + blouse piece"),
        colours: JSON.stringify(Array.isArray(body.colours) ? body.colours : []),
        occasions: JSON.stringify(Array.isArray(body.occasions) ? body.occasions : []),
        shortDesc: String(body.shortDesc || ""),
        longDesc: String(body.longDesc || ""),
        care: String(body.care || ""),
        priceLkr: Math.max(0, Math.round(Number(body.priceLkr) || 0)),
        compareAtLkr: body.compareAtLkr ? Math.round(Number(body.compareAtLkr)) : null,
        costLkr: Math.max(0, Math.round(Number(body.costLkr) || 0)),
        stock: Math.max(0, Math.round(Number(body.stock) || 0)),
        lowStockThreshold: Math.max(0, Math.round(Number(body.lowStockThreshold) || 3)),
        status: String(body.status || "ACTIVE"),
        isPreOrder: Boolean(body.isPreOrder),
        isNewArrival: Boolean(body.isNewArrival),
        publishAt: body.publishAt ? new Date(body.publishAt) : null,
        seoTitle: body.seoTitle ? String(body.seoTitle) : null,
        seoDesc: body.seoDesc ? String(body.seoDesc) : null,
        images: {
          create: images.map(
            (img: { url: string; altText?: string; isCover?: boolean }, idx: number) => ({
              url: img.url,
              altText: img.altText || name,
              sortOrder: idx,
              isCover: Boolean(img.isCover ?? idx === 0),
            })
          ),
        },
      },
      include: { images: true },
    });

    await logAudit({
      userId: session.userId,
      action: "PRODUCT_CREATE",
      entityType: "Product",
      entityId: created.id,
      details: { sku: created.sku, priceLkr: created.priceLkr, stock: created.stock },
    });

    return NextResponse.json({ product: created }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not create product" },
      { status: 400 }
    );
  }
}

export async function PATCH(request: Request) {
  if (!verifySameOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }
  let session;
  try {
    session = await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { ids, action, value } = (await request.json()) as {
      ids: string[];
      action: "hide" | "activate" | "markNew" | "category" | "pricePercent" | "restore";
      value?: string | number;
    };

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "No products selected" }, { status: 400 });
    }

    if (action === "hide") {
      await prisma.product.updateMany({ where: { id: { in: ids } }, data: { status: "HIDDEN" } });
    } else if (action === "activate") {
      await prisma.product.updateMany({ where: { id: { in: ids } }, data: { status: "ACTIVE" } });
    } else if (action === "markNew") {
      await prisma.product.updateMany({ where: { id: { in: ids } }, data: { isNewArrival: true } });
    } else if (action === "category" && typeof value === "string") {
      await prisma.product.updateMany({
        where: { id: { in: ids } },
        data: {
          category: value,
          badge: value === "IMPORTED" ? "IMPORTED" : "HANDLOOM",
        },
      });
    } else if (action === "restore") {
      await prisma.product.updateMany({ where: { id: { in: ids } }, data: { deletedAt: null } });
    } else if (action === "pricePercent") {
      const pct = Number(value) || 0;
      const rows = await prisma.product.findMany({ where: { id: { in: ids } } });
      for (const r of rows) {
        const nextPrice = Math.max(100, Math.round((r.priceLkr * (1 + pct / 100)) / 50) * 50);
        await prisma.product.update({ where: { id: r.id }, data: { priceLkr: nextPrice } });
      }
    }

    await logAudit({
      userId: session.userId,
      action: `PRODUCT_BULK_${action.toUpperCase()}`,
      entityType: "Product",
      details: { ids, value },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Bulk update failed" }, { status: 500 });
  }
}
