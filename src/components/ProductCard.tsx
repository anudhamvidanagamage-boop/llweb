"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { formatLkr, getCategoryLabel } from "@/lib/constants";
import { useStore } from "./StoreProvider";

export interface ProductCardData {
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
  coverUrl: string | null;
  coverAlt: string;
}

export function ProductCard({ product }: { product: ProductCardData }) {
  const { toggleWishlist, isWishlisted } = useStore();
  const wishlisted = isWishlisted(product.id);
  const isSoldOut = product.status === "SOLD_OUT" || product.stock <= 0;

  return (
    <article className="group flex flex-col">
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-neutral-100 border border-neutral-200">
        <Link href={`/products/${product.slug}`} className="block h-full w-full">
          {product.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.coverUrl}
              alt={product.coverAlt || product.name}
              loading="lazy"
              className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center bg-neutral-900 text-neutral-300 p-6 text-center">
              <span className="font-serif text-lg tracking-wide text-white">Luxe Loomie</span>
              <span className="mt-2 text-[11px] uppercase tracking-widest text-neutral-400">
                Photo coming soon
              </span>
            </div>
          )}
        </Link>

        {/* Top-left badges */}
        <div className="pointer-events-none absolute left-2.5 top-2.5 flex flex-col gap-1.5">
          <span
            className={`px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest ${
              product.badge === "HANDLOOM"
                ? "bg-black text-white"
                : "bg-white text-black border border-black"
            }`}
          >
            {product.badge === "HANDLOOM" ? "Handloom" : "Imported"}
          </span>
          {product.isPreOrder && (
            <span className="bg-neutral-800 px-2 py-0.5 text-[10px] uppercase tracking-widest text-white">
              Pre-order
            </span>
          )}
          {isSoldOut && (
            <span className="bg-white/95 px-2 py-0.5 text-[10px] uppercase tracking-widest text-black border border-neutral-400">
              Sold Out
            </span>
          )}
        </div>

        {/* Wishlist button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product.id);
          }}
          aria-label={wishlisted ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
          className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center bg-white/90 text-black border border-neutral-200 hover:bg-black hover:text-white transition-colors"
        >
          <Heart className={`h-4 w-4 ${wishlisted ? "fill-current" : ""}`} />
        </button>
      </div>

      <div className="mt-3 flex flex-col gap-1">
        <span className="text-[11px] uppercase tracking-widest text-neutral-500">
          {getCategoryLabel(product.category)}
        </span>
        <Link
          href={`/products/${product.slug}`}
          className="font-serif text-lg leading-snug text-black hover:underline"
        >
          {product.name}
        </Link>
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-medium text-black">{formatLkr(product.priceLkr)}</span>
          {product.compareAtLkr && product.compareAtLkr > product.priceLkr && (
            <span className="text-xs text-neutral-400 line-through">
              {formatLkr(product.compareAtLkr)}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
