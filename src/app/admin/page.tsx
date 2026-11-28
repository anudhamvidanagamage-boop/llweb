import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminDashboardClient } from "@/components/AdminDashboardClient";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; from?: string; to?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");

  const sp = await searchParams;
  const range = sp.range || "30d";
  const now = new Date();
  let startDate = new Date(now);
  let endDate = new Date(now);

  if (range === "today") {
    startDate.setHours(0, 0, 0, 0);
  } else if (range === "7d") {
    startDate.setDate(now.getDate() - 7);
  } else if (range === "month") {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  } else if (range === "custom" && sp.from) {
    startDate = new Date(sp.from);
    if (sp.to) {
      endDate = new Date(sp.to);
      endDate.setHours(23, 59, 59, 999);
    }
  } else {
    startDate.setDate(now.getDate() - 30);
  }

  const [orders, products, events, customers] = await Promise.all([
    prisma.order.findMany({
      where: { createdAt: { gte: startDate, lte: endDate } },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.product.findMany({
      where: { deletedAt: null },
      include: { orderItems: true },
    }),
    prisma.event.findMany({
      where: { createdAt: { gte: startDate, lte: endDate } },
    }),
    prisma.customer.findMany({
      include: { orders: true },
    }),
  ]);

  const activeOrders = orders.filter(
    (o) => o.status !== "CANCELLED" && o.status !== "RETURNED"
  );
  const revenue = activeOrders.reduce((s, o) => s + o.totalLkr, 0);
  const orderCount = activeOrders.length;
  const sareesSold = activeOrders.reduce(
    (s, o) => s + o.items.reduce((is, i) => is + i.quantity, 0),
    0
  );
  const aov = orderCount > 0 ? Math.round(revenue / orderCount) : 0;

  const pageViews = events.filter((e) => e.type === "PAGE_VIEW").length;
  const productViews = events.filter((e) => e.type === "PRODUCT_VIEW").length;
  const addToCarts = events.filter((e) => e.type === "ADD_TO_CART").length;
  const checkouts = events.filter((e) => e.type === "CHECKOUT_START").length;
  const whatsappClicks = events.filter((e) => e.type === "WHATSAPP_CLICK").length;
  const conversionRate =
    pageViews > 0 ? Number(((orderCount / pageViews) * 100).toFixed(2)) : 0;

  const returningCustomers = customers.filter((c) => c.orders.length >= 2).length;
  const newCustomers = customers.filter((c) => c.orders.length === 1).length;

  // Revenue by day
  const dailyMap = new Map<string, { date: string; revenue: number; orders: number }>();
  for (const o of activeOrders) {
    const day = o.createdAt.toISOString().slice(0, 10);
    const cur = dailyMap.get(day) || { date: day, revenue: 0, orders: 0 };
    cur.revenue += o.totalLkr;
    cur.orders += 1;
    dailyMap.set(day, cur);
  }

  // Sales by category & Handloom vs Imported
  const catMap = new Map<string, number>();
  let handloomRev = 0;
  let importedRev = 0;
  const productSalesMap = new Map<
    string,
    { id: string; name: string; sku: string; units: number; revenue: number }
  >();

  for (const o of activeOrders) {
    for (const item of o.items) {
      const cat = item.product?.category || "OTHER";
      const lineRev = item.unitPriceLkr * item.quantity;
      catMap.set(cat, (catMap.get(cat) || 0) + lineRev);
      if (item.product?.badge === "IMPORTED") importedRev += lineRev;
      else handloomRev += lineRev;

      const ps = productSalesMap.get(item.productId) || {
        id: item.productId,
        name: item.productName,
        sku: item.sku,
        units: 0,
        revenue: 0,
      };
      ps.units += item.quantity;
      ps.revenue += lineRev;
      productSalesMap.set(item.productId, ps);
    }
  }

  const topProducts = Array.from(productSalesMap.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  const sixtyDaysAgo = new Date(now);
  sixtyDaysAgo.setDate(now.getDate() - 60);
  const slowMovers = products
    .filter((p) => p.createdAt <= sixtyDaysAgo && p.orderItems.length === 0)
    .map((p) => ({ id: p.id, name: p.name, sku: p.sku, stock: p.stock }));

  const lowStock = products
    .filter((p) => p.stock <= p.lowStockThreshold)
    .map((p) => ({ id: p.id, name: p.name, sku: p.sku, stock: p.stock }));

  // Most viewed & wishlisted
  const viewCounts = new Map<string, number>();
  const wishCounts = new Map<string, number>();
  const pageCounts = new Map<string, number>();
  const sourceCounts = new Map<string, number>();
  const deviceCounts = new Map<string, number>();

  for (const ev of events) {
    if (ev.type === "PRODUCT_VIEW" && ev.productId) {
      viewCounts.set(ev.productId, (viewCounts.get(ev.productId) || 0) + 1);
    }
    if (ev.type === "WISHLIST_ADD" && ev.productId) {
      wishCounts.set(ev.productId, (wishCounts.get(ev.productId) || 0) + 1);
    }
    if (ev.type === "PAGE_VIEW") {
      pageCounts.set(ev.path, (pageCounts.get(ev.path) || 0) + 1);
      const src = ev.source || "direct";
      sourceCounts.set(src, (sourceCounts.get(src) || 0) + 1);
      const dev = ev.device || "desktop";
      deviceCounts.set(dev, (deviceCounts.get(dev) || 0) + 1);
    }
  }

  const productLookup = new Map(products.map((p) => [p.id, p]));
  const mostViewed = Array.from(viewCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, count]) => ({ name: productLookup.get(id)?.name || id, count }));

  const mostWishlisted = Array.from(wishCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, count]) => ({ name: productLookup.get(id)?.name || id, count }));

  return (
    <AdminDashboardClient
      range={range}
      kpis={{
        revenue,
        orderCount,
        sareesSold,
        aov,
        conversionRate,
        newCustomers,
        returningCustomers,
        whatsappClicks,
      }}
      dailySeries={Array.from(dailyMap.values())}
      categorySales={Array.from(catMap.entries()).map(([category, amount]) => ({
        category,
        amount,
      }))}
      handloomShare={{ handloomRev, importedRev }}
      topProducts={topProducts}
      slowMovers={slowMovers}
      lowStock={lowStock}
      mostViewed={mostViewed}
      mostWishlisted={mostWishlisted}
      traffic={{
        visits: pageViews,
        topPages: Array.from(pageCounts.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 6)
          .map(([path, count]) => ({ path, count })),
        sources: Array.from(sourceCounts.entries()).map(([source, count]) => ({
          source,
          count,
        })),
        devices: Array.from(deviceCounts.entries()).map(([device, count]) => ({
          device,
          count,
        })),
      }}
      funnel={{ productViews, addToCarts, checkouts, paid: orderCount }}
    />
  );
}
