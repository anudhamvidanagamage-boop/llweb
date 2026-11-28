"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useStore } from "@/components/StoreProvider";
import { ProductCard, ProductCardData } from "@/components/ProductCard";

export default function WishlistPage() {
  const { wishlist } = useStore();
  const [products, setProducts] = useState<ProductCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (wishlist.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }
    fetch(`/api/products?ids=${encodeURIComponent(wishlist.join(","))}`)
      .then((r) => r.json())
      .then((d) => setProducts(d.products || []))
      .finally(() => setLoading(false));
  }, [wishlist]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="border-b border-neutral-200 pb-6">
        <span className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">Saved Pieces</span>
        <h1 className="mt-1 font-serif text-4xl">Your Wishlist</h1>
      </div>

      {loading ? (
        <p className="py-12 text-sm text-neutral-500">Loading saved sarees...</p>
      ) : products.length === 0 ? (
        <div className="py-16 text-center">
          <p className="font-serif text-2xl">No sarees saved yet.</p>
          <p className="mt-2 text-sm text-neutral-600">
            Tap the heart icon on any saree to save it here for later.
          </p>
          <Link
            href="/shop"
            className="mt-6 inline-block bg-black px-8 py-3 text-xs uppercase tracking-widest text-white"
          >
            Browse Collection
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
