"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Download } from "lucide-react";
import { formatLkr, getCategoryLabel } from "@/lib/constants";

interface DashboardProps {
  range: string;
  kpis: {
    revenue: number;
    orderCount: number;
    sareesSold: number;
    aov: number;
    conversionRate: number;
    newCustomers: number;
    returningCustomers: number;
    whatsappClicks: number;
  };
  dailySeries: Array<{ date: string; revenue: number; orders: number }>;
  categorySales: Array<{ category: string; amount: number }>;
  handloomShare: { handloomRev: number; importedRev: number };
  topProducts: Array<{ id: string; name: string; sku: string; units: number; revenue: number }>;
  slowMovers: Array<{ id: string; name: string; sku: string; stock: number }>;
  lowStock: Array<{ id: string; name: string; sku: string; stock: number }>;
  mostViewed: Array<{ name: string; count: number }>;
  mostWishlisted: Array<{ name: string; count: number }>;
  traffic: {
    visits: number;
    topPages: Array<{ path: string; count: number }>;
    sources: Array<{ source: string; count: number }>;
    devices: Array<{ device: string; count: number }>;
  };
  funnel: { productViews: number; addToCarts: number; checkouts: number; paid: number };
}

function downloadCsv(filename: string, headers: string[], rows: Array<Array<string | number>>) {
  const csv = [
    headers.join(","),
    ...rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
}

export function AdminDashboardClient(props: DashboardProps) {
  const router = useRouter();
  const { kpis, dailySeries, categorySales, handloomShare, topProducts, slowMovers, lowStock, traffic, funnel } =
    props;

  const maxDaily = Math.max(1, ...dailySeries.map((d) => d.revenue));
  const totalShare = handloomShare.handloomRev + handloomShare.importedRev;
  const handloomPct = totalShare > 0 ? Math.round((handloomShare.handloomRev / totalShare) * 100) : 100;

  return (
    <div className="space-y-8">
      {/* Header & Date Filter */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl">Analytics Dashboard</h1>
          <p className="text-xs text-neutral-500">First-party store performance and inventory health.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { id: "today", label: "Today" },
            { id: "7d", label: "7 Days" },
            { id: "30d", label: "30 Days" },
            { id: "month", label: "This Month" },
          ].map((r) => (
            <button
              key={r.id}
              onClick={() => router.push(`/admin?range=${r.id}`)}
              className={`border px-3 py-1.5 text-xs uppercase tracking-widest ${
                props.range === r.id ? "border-black bg-black text-white" : "border-neutral-300 bg-white"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="border border-neutral-200 bg-white p-5">
          <span className="text-[11px] uppercase tracking-widest text-neutral-500">Revenue</span>
          <p className="mt-2 font-serif text-2xl sm:text-3xl">{formatLkr(kpis.revenue)}</p>
        </div>
        <div className="border border-neutral-200 bg-white p-5">
          <span className="text-[11px] uppercase tracking-widest text-neutral-500">Orders / Sarees</span>
          <p className="mt-2 font-serif text-2xl sm:text-3xl">
            {kpis.orderCount} / {kpis.sareesSold}
          </p>
        </div>
        <div className="border border-neutral-200 bg-white p-5">
          <span className="text-[11px] uppercase tracking-widest text-neutral-500">Avg Order Value</span>
          <p className="mt-2 font-serif text-2xl sm:text-3xl">{formatLkr(kpis.aov)}</p>
        </div>
        <div className="border border-neutral-200 bg-white p-5">
          <span className="text-[11px] uppercase tracking-widest text-neutral-500">Conversion Rate</span>
          <p className="mt-2 font-serif text-2xl sm:text-3xl">{kpis.conversionRate}%</p>
        </div>
        <div className="border border-neutral-200 bg-white p-5">
          <span className="text-[11px] uppercase tracking-widest text-neutral-500">New vs Returning</span>
          <p className="mt-2 font-serif text-2xl">
            {kpis.newCustomers} / {kpis.returningCustomers}
          </p>
        </div>
        <div className="border border-neutral-200 bg-white p-5">
          <span className="text-[11px] uppercase tracking-widest text-neutral-500">WhatsApp Clicks</span>
          <p className="mt-2 font-serif text-2xl">{kpis.whatsappClicks}</p>
        </div>
        <div className="border border-neutral-200 bg-white p-5">
          <span className="text-[11px] uppercase tracking-widest text-neutral-500">Store Visits</span>
          <p className="mt-2 font-serif text-2xl">{traffic.visits}</p>
        </div>
        <div className="border border-neutral-200 bg-white p-5">
          <span className="text-[11px] uppercase tracking-widest text-neutral-500">Handloom Share</span>
          <p className="mt-2 font-serif text-2xl">{handloomPct}%</p>
        </div>
      </div>

      {/* Revenue Over Time + Funnel */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="border border-neutral-200 bg-white p-6 lg:col-span-7">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-xl">Revenue Over Time</h2>
            <button
              onClick={() =>
                downloadCsv(
                  "revenue-series.csv",
                  ["Date", "Orders", "RevenueLKR"],
                  dailySeries.map((d) => [d.date, d.orders, d.revenue])
                )
              }
              className="inline-flex items-center gap-1 text-xs underline"
            >
              <Download className="h-3.5 w-3.5" /> CSV
            </button>
          </div>
          {dailySeries.length === 0 ? (
            <p className="py-12 text-center text-xs text-neutral-500">No orders in selected period.</p>
          ) : (
            <div className="flex h-44 items-end gap-2 border-b border-neutral-200 pt-4">
              {dailySeries.map((d) => (
                <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className="w-full max-w-[36px] bg-black transition-all"
                    style={{ height: `${Math.max(4, (d.revenue / maxDaily) * 140)}px` }}
                    title={`${d.date}: ${formatLkr(d.revenue)} (${d.orders} orders)`}
                  />
                  <span className="text-[10px] text-neutral-500">{d.date.slice(5)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border border-neutral-200 bg-white p-6 lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl">Conversion Funnel</h2>
            <button
              onClick={() =>
                downloadCsv(
                  "funnel.csv",
                  ["Stage", "Count"],
                  [
                    ["Product View", funnel.productViews],
                    ["Add to Cart", funnel.addToCarts],
                    ["Checkout Start", funnel.checkouts],
                    ["Orders Placed", funnel.paid],
                  ]
                )
              }
              className="inline-flex items-center gap-1 text-xs underline"
            >
              <Download className="h-3.5 w-3.5" /> CSV
            </button>
          </div>
          {[
            { label: "Product Views", val: funnel.productViews },
            { label: "Add to Bag", val: funnel.addToCarts },
            { label: "Checkout Started", val: funnel.checkouts },
            { label: "Orders Completed", val: funnel.paid },
          ].map((step) => {
            const maxF = Math.max(1, funnel.productViews);
            const pct = Math.min(100, Math.round((step.val / maxF) * 100));
            return (
              <div key={step.label} className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>{step.label}</span>
                  <span className="font-medium">{step.val}</span>
                </div>
                <div className="h-2 w-full bg-neutral-100">
                  <div className="h-2 bg-black" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Sales + Traffic */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="border border-neutral-200 bg-white p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl">Sales by Category</h2>
            <button
              onClick={() =>
                downloadCsv(
                  "sales-by-category.csv",
                  ["Category", "RevenueLKR"],
                  categorySales.map((c) => [getCategoryLabel(c.category), c.amount])
                )
              }
              className="inline-flex items-center gap-1 text-xs underline"
            >
              <Download className="h-3.5 w-3.5" /> CSV
            </button>
          </div>
          {categorySales.length === 0 ? (
            <p className="text-xs text-neutral-500">No category sales yet.</p>
          ) : (
            <ul className="divide-y divide-neutral-100 text-xs">
              {categorySales.map((c) => (
                <li key={c.category} className="flex justify-between py-2">
                  <span>{getCategoryLabel(c.category)}</span>
                  <span className="font-medium">{formatLkr(c.amount)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border border-neutral-200 bg-white p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl">Traffic Sources &amp; Devices</h2>
            <button
              onClick={() =>
                downloadCsv(
                  "traffic-sources.csv",
                  ["Source", "Visits"],
                  traffic.sources.map((s) => [s.source, s.count])
                )
              }
              className="inline-flex items-center gap-1 text-xs underline"
            >
              <Download className="h-3.5 w-3.5" /> CSV
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <h3 className="uppercase tracking-wider text-neutral-500 mb-2">Sources</h3>
              {traffic.sources.map((s) => (
                <div key={s.source} className="flex justify-between py-1">
                  <span className="capitalize">{s.source}</span>
                  <span>{s.count}</span>
                </div>
              ))}
            </div>
            <div>
              <h3 className="uppercase tracking-wider text-neutral-500 mb-2">Devices</h3>
              {traffic.devices.map((d) => (
                <div key={d.device} className="flex justify-between py-1">
                  <span className="capitalize">{d.device}</span>
                  <span>{d.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tables: Top 10, Low Stock, Slow Movers */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="border border-neutral-200 bg-white p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-serif text-xl">Top Products</h2>
            <button
              onClick={() =>
                downloadCsv(
                  "top-products.csv",
                  ["SKU", "Name", "Units", "RevenueLKR"],
                  topProducts.map((p) => [p.sku, p.name, p.units, p.revenue])
                )
              }
              className="inline-flex items-center gap-1 text-xs underline"
            >
              <Download className="h-3.5 w-3.5" /> CSV
            </button>
          </div>
          {topProducts.length === 0 ? (
            <p className="text-xs text-neutral-500">No sales recorded yet.</p>
          ) : (
            <ul className="divide-y divide-neutral-100 text-xs">
              {topProducts.map((p) => (
                <li key={p.id} className="flex justify-between py-2">
                  <span className="truncate pr-2">{p.name}</span>
                  <span className="shrink-0 font-medium">
                    {p.units}u &middot; {formatLkr(p.revenue)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border border-neutral-200 bg-white p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-serif text-xl">Low-Stock Alerts</h2>
            <button
              onClick={() =>
                downloadCsv(
                  "low-stock.csv",
                  ["SKU", "Name", "Stock"],
                  lowStock.map((p) => [p.sku, p.name, p.stock])
                )
              }
              className="inline-flex items-center gap-1 text-xs underline"
            >
              <Download className="h-3.5 w-3.5" /> CSV
            </button>
          </div>
          {lowStock.length === 0 ? (
            <p className="text-xs text-neutral-500">All sarees above threshold.</p>
          ) : (
            <ul className="divide-y divide-neutral-100 text-xs">
              {lowStock.map((p) => (
                <li key={p.id} className="flex justify-between py-2">
                  <span className="truncate pr-2">{p.name}</span>
                  <span className="font-semibold">{p.stock} left</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border border-neutral-200 bg-white p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-serif text-xl">Slow Movers (60d+)</h2>
            <button
              onClick={() =>
                downloadCsv(
                  "slow-movers.csv",
                  ["SKU", "Name", "Stock"],
                  slowMovers.map((p) => [p.sku, p.name, p.stock])
                )
              }
              className="inline-flex items-center gap-1 text-xs underline"
            >
              <Download className="h-3.5 w-3.5" /> CSV
            </button>
          </div>
          {slowMovers.length === 0 ? (
            <p className="text-xs text-neutral-500">No 60-day slow movers.</p>
          ) : (
            <ul className="divide-y divide-neutral-100 text-xs">
              {slowMovers.map((p) => (
                <li key={p.id} className="flex justify-between py-2">
                  <span className="truncate pr-2">{p.name}</span>
                  <span>{p.stock} in stock</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
