"use client";

import React, { useEffect, useState } from "react";
import { Heart, MessageCircle, ShoppingBag, Truck, RefreshCw, ZoomIn } from "lucide-react";
import { buildWhatsAppUrl, formatLkr, getCategoryLabel } from "@/lib/constants";
import { useStore } from "./StoreProvider";

interface ProductDetailProps {
  product: {
    id: string;
    sku: string;
    slug: string;
    name: string;
    category: string;
    badge: string;
    fabric: string;
    weave: string;
    origin: string;
    length: string;
    colours: string[];
    occasions: string[];
    shortDesc: string;
    longDesc: string;
    care: string;
    priceLkr: number;
    compareAtLkr: number | null;
    stock: number;
    status: string;
    isPreOrder: boolean;
    images: Array<{ id: string; url: string; altText: string; isCover: boolean }>;
  };
  whatsappNumber: string;
  bundleLabel: string;
}

export function ProductDetailClient({ product, whatsappNumber, bundleLabel }: ProductDetailProps) {
  const { addToCart, toggleWishlist, isWishlisted, trackEvent } = useStore();
  const [activeIdx, setActiveIdx] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [qty, setQty] = useState(1);

  const wishlisted = isWishlisted(product.id);
  const isSoldOut = product.status === "SOLD_OUT" || product.stock <= 0;

  useEffect(() => {
    trackEvent("PRODUCT_VIEW", product.id);
  }, [product.id, trackEvent]);

  // Ensure minimum 4 gallery slots (real images + neutral "Photo coming soon" slots)
  const slots: Array<{ url: string | null; alt: string; label?: string }> = [
    ...product.images.map((img) => ({ url: img.url, alt: img.altText })),
  ];
  const fallbackLabels = ["Drape view", "Weave close-up", "Pallu detail", "Border finish"];
  while (slots.length < 4) {
    slots.push({
      url: null,
      alt: "Photo coming soon",
      label: fallbackLabels[slots.length] || "Photo coming soon",
    });
  }

  const activeSlot = slots[activeIdx] || slots[0];
  const productUrl =
    typeof window !== "undefined" ? `${window.location.origin}/products/${product.slug}` : `/products/${product.slug}`;

  const waOrderUrl = buildWhatsAppUrl(
    whatsappNumber,
    `Hello Luxe Loomie, I would like to order:\n• ${product.name}\n• Code: ${product.sku}\n• Price: ${formatLkr(product.priceLkr)}\n• Link: ${productUrl}`
  );

  const waNotifyUrl = buildWhatsAppUrl(
    whatsappNumber,
    `Hello Luxe Loomie, please notify me on WhatsApp when ${product.name} (${product.sku}) is restocked.`
  );

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
      {/* Gallery */}
      <div className="lg:col-span-7">
        <div
          className="relative aspect-[4/5] w-full overflow-hidden border border-neutral-200 bg-neutral-100 cursor-zoom-in"
          onClick={() => activeSlot.url && setZoomed((z) => !z)}
        >
          {activeSlot.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={activeSlot.url}
              alt={activeSlot.alt}
              className={`h-full w-full object-cover object-top transition-transform duration-300 ${
                zoomed ? "scale-150 cursor-zoom-out" : ""
              }`}
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center bg-neutral-900 text-neutral-300 p-8 text-center">
              <span className="font-serif text-2xl text-white">Luxe Loomie</span>
              <span className="mt-2 text-xs uppercase tracking-[0.2em] text-neutral-400">
                Photo coming soon
              </span>
              {activeSlot.label && (
                <span className="mt-1 text-[11px] text-neutral-500">({activeSlot.label})</span>
              )}
            </div>
          )}

          {activeSlot.url && (
            <div className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-1.5 bg-white/90 px-2.5 py-1 text-[10px] uppercase tracking-widest text-black border border-neutral-200">
              <ZoomIn className="h-3 w-3" />
              {zoomed ? "Click to reset" : "Click to zoom"}
            </div>
          )}
        </div>

        <div className="mt-3 grid grid-cols-4 gap-3">
          {slots.map((slot, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setActiveIdx(idx);
                setZoomed(false);
              }}
              className={`aspect-[4/5] overflow-hidden border ${
                activeIdx === idx ? "border-black ring-1 ring-black" : "border-neutral-200"
              } bg-neutral-100`}
            >
              {slot.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={slot.url} alt={slot.alt} className="h-full w-full object-cover object-top" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-neutral-900 p-2 text-center text-[10px] uppercase tracking-wider text-neutral-400">
                  Photo coming soon
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Product Info */}
      <div className="lg:col-span-5 flex flex-col">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] ${
              product.badge === "HANDLOOM"
                ? "bg-black text-white"
                : "border border-black bg-white text-black"
            }`}
          >
            {product.badge === "HANDLOOM" ? "Sri Lankan Handloom" : "Imported"}
          </span>
          <span className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
            {getCategoryLabel(product.category)}
          </span>
          {product.isPreOrder && (
            <span className="bg-neutral-800 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-white">
              Pre-order
            </span>
          )}
        </div>

        <h1 className="mt-3 font-serif text-3xl sm:text-4xl leading-tight">{product.name}</h1>
        <p className="mt-1 text-xs uppercase tracking-widest text-neutral-500">SKU: {product.sku}</p>

        <div className="mt-4 flex items-baseline gap-3">
          <span className="text-2xl font-semibold">{formatLkr(product.priceLkr)}</span>
          {product.compareAtLkr && product.compareAtLkr > product.priceLkr && (
            <span className="text-sm text-neutral-400 line-through">
              {formatLkr(product.compareAtLkr)}
            </span>
          )}
          <span className="text-xs text-neutral-500">VAT-exclusive</span>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-neutral-700">{product.shortDesc}</p>

        {/* Stock & Bundle note */}
        <div className="mt-5 flex items-center justify-between border-y border-neutral-200 py-3 text-xs">
          <span className="uppercase tracking-widest text-neutral-600">Availability</span>
          <span className="font-medium">
            {isSoldOut
              ? "Sold Out"
              : product.isPreOrder
              ? "Available for Pre-order"
              : `In Stock (${product.stock} available)`}
          </span>
        </div>

        {bundleLabel && (
          <p className="mt-3 bg-neutral-50 border border-neutral-200 px-3.5 py-2.5 text-xs text-neutral-700">
            {bundleLabel}
          </p>
        )}

        {/* Actions */}
        <div className="mt-6 space-y-3">
          {!isSoldOut ? (
            <>
              <div className="flex gap-3">
                <div className="flex items-center border border-black">
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    aria-label="Decrease quantity"
                    className="px-3.5 py-3 text-sm hover:bg-neutral-100"
                  >
                    −
                  </button>
                  <span className="px-4 text-sm font-medium">{qty}</span>
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                    aria-label="Increase quantity"
                    className="px-3.5 py-3 text-sm hover:bg-neutral-100"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    addToCart(
                      {
                        productId: product.id,
                        sku: product.sku,
                        slug: product.slug,
                        name: product.name,
                        priceLkr: product.priceLkr,
                        imageUrl: product.images[0]?.url ?? null,
                        badge: product.badge,
                        maxStock: product.stock,
                      },
                      qty
                    )
                  }
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-black px-6 py-3.5 text-xs font-medium uppercase tracking-[0.2em] text-white hover:bg-neutral-800 transition-colors"
                >
                  <ShoppingBag className="h-4 w-4" />
                  Add to Bag
                </button>

                <button
                  type="button"
                  onClick={() => toggleWishlist(product.id)}
                  aria-label="Save to wishlist"
                  className="border border-black px-4 flex items-center justify-center hover:bg-neutral-100"
                >
                  <Heart className={`h-4 w-4 ${wishlisted ? "fill-current" : ""}`} />
                </button>
              </div>

              <a
                href={waOrderUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent("WHATSAPP_CLICK", product.id)}
                className="flex w-full items-center justify-center gap-2 border border-black py-3.5 text-xs font-medium uppercase tracking-[0.2em] text-black hover:bg-black hover:text-white transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                Order on WhatsApp
              </a>
            </>
          ) : (
            <a
              href={waNotifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent("WHATSAPP_CLICK", product.id)}
              className="flex w-full items-center justify-center gap-2 bg-black py-3.5 text-xs font-medium uppercase tracking-[0.2em] text-white hover:bg-neutral-800 transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              Notify me on WhatsApp
            </a>
          )}
        </div>

        {/* Specifications */}
        <dl className="mt-8 divide-y divide-neutral-200 border-t border-neutral-200 text-sm">
          <div className="grid grid-cols-3 py-3">
            <dt className="text-xs uppercase tracking-wider text-neutral-500">Fabric</dt>
            <dd className="col-span-2 text-neutral-800">{product.fabric}</dd>
          </div>
          <div className="grid grid-cols-3 py-3">
            <dt className="text-xs uppercase tracking-wider text-neutral-500">Weave</dt>
            <dd className="col-span-2 text-neutral-800">{product.weave}</dd>
          </div>
          <div className="grid grid-cols-3 py-3">
            <dt className="text-xs uppercase tracking-wider text-neutral-500">Origin</dt>
            <dd className="col-span-2 text-neutral-800">{product.origin}</dd>
          </div>
          <div className="grid grid-cols-3 py-3">
            <dt className="text-xs uppercase tracking-wider text-neutral-500">Length</dt>
            <dd className="col-span-2 text-neutral-800">{product.length}</dd>
          </div>
          <div className="grid grid-cols-3 py-3">
            <dt className="text-xs uppercase tracking-wider text-neutral-500">Colours</dt>
            <dd className="col-span-2 text-neutral-800">{product.colours.join(", ")}</dd>
          </div>
          <div className="grid grid-cols-3 py-3">
            <dt className="text-xs uppercase tracking-wider text-neutral-500">Care</dt>
            <dd className="col-span-2 text-neutral-800">{product.care}</dd>
          </div>
        </dl>

        {/* Delivery & Exchange Summary */}
        <div className="mt-6 space-y-2.5 border border-neutral-200 bg-neutral-50 p-4 text-xs text-neutral-700">
          <div className="flex items-start gap-2.5">
            <Truck className="h-4 w-4 shrink-0 text-black mt-0.5" />
            <span>Island-wide courier delivery across Sri Lanka. Free delivery available.</span>
          </div>
          <div className="flex items-start gap-2.5">
            <RefreshCw className="h-4 w-4 shrink-0 text-black mt-0.5" />
            <span>Exchange within 7 days if unworn and tagged; full refund for defects.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
