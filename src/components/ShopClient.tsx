"use client";

import React, { useMemo, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { ProductCard, ProductCardData } from "./ProductCard";
import { OCCASIONS, PRODUCT_CATEGORIES } from "@/lib/constants";

export interface ShopProduct extends ProductCardData {
  colours: string[];
  occasions: string[];
  createdAtMs: number;
}

export function ShopClient({
  products,
  initialCategory = "",
  initialBadge = "",
  initialOccasion = "",
  initialSort = "newest",
}: {
  products: ShopProduct[];
  initialCategory?: string;
  initialBadge?: string;
  initialOccasion?: string;
  initialSort?: string;
}) {
  const [category, setCategory] = useState(initialCategory);
  const [badge, setBadge] = useState(initialBadge);
  const [occasion, setOccasion] = useState(initialOccasion);
  const [colour, setColour] = useState("");
  const [maxPrice, setMaxPrice] = useState<number>(20000);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState(initialSort);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const allColours = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => p.colours.forEach((c) => set.add(c)));
    return Array.from(set).sort();
  }, [products]);

  const filtered = useMemo(() => {
    return products
      .filter((p) => {
        if (category && p.category !== category) return false;
        if (badge && p.badge !== badge) return false;
        if (occasion && !p.occasions.includes(occasion)) return false;
        if (colour && !p.colours.includes(colour)) return false;
        if (p.priceLkr > maxPrice) return false;
        if (inStockOnly && (p.stock <= 0 || p.status === "SOLD_OUT")) return false;
        return true;
      })
      .sort((a, b) => {
        if (sort === "price-asc") return a.priceLkr - b.priceLkr;
        if (sort === "price-desc") return b.priceLkr - a.priceLkr;
        return b.createdAtMs - a.createdAtMs;
      });
  }, [products, category, badge, occasion, colour, maxPrice, inStockOnly, sort]);

  const clearFilters = () => {
    setCategory("");
    setBadge("");
    setOccasion("");
    setColour("");
    setMaxPrice(20000);
    setInStockOnly(false);
  };

  const FilterControls = () => (
    <div className="space-y-6 text-sm">
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-[0.18em]">Range</h3>
        <div className="mt-2.5 flex flex-col gap-2">
          {[
            { value: "", label: "All Ranges" },
            { value: "HANDLOOM", label: "Sri Lankan Handloom" },
            { value: "IMPORTED", label: "Imported" },
          ].map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 cursor-pointer text-neutral-700">
              <input
                type="radio"
                name="badge-filter"
                checked={badge === opt.value}
                onChange={() => setBadge(opt.value)}
                className="accent-black"
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-[0.18em]">Fabric &amp; Category</h3>
        <div className="mt-2.5 flex flex-col gap-2">
          <label className="flex items-center gap-2 cursor-pointer text-neutral-700">
            <input
              type="radio"
              name="cat-filter"
              checked={category === ""}
              onChange={() => setCategory("")}
              className="accent-black"
            />
            <span>All Fabrics</span>
          </label>
          {PRODUCT_CATEGORIES.map((c) => (
            <label key={c.value} className="flex items-center gap-2 cursor-pointer text-neutral-700">
              <input
                type="radio"
                name="cat-filter"
                checked={category === c.value}
                onChange={() => setCategory(c.value)}
                className="accent-black"
              />
              <span>{c.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-[0.18em]">Occasion</h3>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {OCCASIONS.map((occ) => (
            <button
              key={occ}
              type="button"
              onClick={() => setOccasion(occasion === occ ? "" : occ)}
              className={`border px-3 py-1 text-xs transition-colors ${
                occasion === occ
                  ? "border-black bg-black text-white"
                  : "border-neutral-300 text-neutral-700 hover:border-black"
              }`}
            >
              {occ}
            </button>
          ))}
        </div>
      </div>

      {allColours.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.18em]">Colour</h3>
          <select
            value={colour}
            onChange={(e) => setColour(e.target.value)}
            className="mt-2 w-full border border-neutral-300 bg-white px-3 py-2 text-xs outline-none focus:border-black"
          >
            <option value="">All Colours</option>
            {allColours.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <div className="flex justify-between text-xs">
          <span className="font-semibold uppercase tracking-[0.18em]">Max Price</span>
          <span>LKR {maxPrice.toLocaleString("en-LK")}</span>
        </div>
        <input
          type="range"
          min={5000}
          max={20000}
          step={500}
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="mt-2 w-full accent-black"
        />
      </div>

      <label className="flex items-center gap-2 cursor-pointer text-xs uppercase tracking-wider">
        <input
          type="checkbox"
          checked={inStockOnly}
          onChange={(e) => setInStockOnly(e.target.checked)}
          className="accent-black"
        />
        <span>In Stock Only</span>
      </label>

      <button
        type="button"
        onClick={clearFilters}
        className="w-full border border-neutral-300 py-2 text-xs uppercase tracking-widest hover:border-black"
      >
        Reset Filters
      </button>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="border-b border-neutral-200 pb-6">
        <span className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">Catalogue</span>
        <h1 className="mt-1 font-serif text-4xl">Saree Collection</h1>
        <p className="mt-2 max-w-2xl text-sm text-neutral-600">
          Curated Sri Lankan handloom sarees alongside selected imported pieces. Every saree is inspected before dispatch.
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 py-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="inline-flex items-center gap-2 border border-black px-4 py-2 text-xs uppercase tracking-widest lg:hidden"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filters
          </button>
          <span className="text-xs text-neutral-500">{filtered.length} sarees</span>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="sort-select" className="text-xs uppercase tracking-widest text-neutral-500">
            Sort:
          </label>
          <select
            id="sort-select"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="border border-neutral-300 bg-white px-3 py-1.5 text-xs outline-none focus:border-black"
          >
            <option value="newest">New Arrivals</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block lg:col-span-3 border-r border-neutral-200 pr-6">
          <FilterControls />
        </aside>

        {/* Product Grid */}
        <div className="lg:col-span-9">
          {filtered.length === 0 ? (
            <div className="border border-neutral-200 p-12 text-center">
              <p className="font-serif text-2xl">No sarees match your current filters.</p>
              <button
                type="button"
                onClick={clearFilters}
                className="mt-4 bg-black px-6 py-2.5 text-xs uppercase tracking-widest text-white"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex bg-black/40 lg:hidden" role="dialog" aria-modal="true" aria-label="Filter sarees">
          <div className="h-full w-80 max-w-full overflow-y-auto bg-white p-6">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-4 mb-6">
              <span className="font-serif text-xl">Filters</span>
              <button onClick={() => setDrawerOpen(false)} aria-label="Close filters">
                <X className="h-5 w-5" />
              </button>
            </div>
            <FilterControls />
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="mt-6 w-full bg-black py-3 text-xs uppercase tracking-widest text-white"
            >
              Show {filtered.length} Sarees
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
