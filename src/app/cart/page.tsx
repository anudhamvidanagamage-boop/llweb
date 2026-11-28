"use client";

import React from "react";
import Link from "next/link";
import { Minus, Plus, Trash2, ArrowRight } from "lucide-react";
import { useStore } from "@/components/StoreProvider";
import { formatLkr } from "@/lib/constants";

export default function CartPage() {
  const { cart, cartCount, cartSubtotal, updateQty, removeFromCart } = useStore();
  const bundleDiscount = cartCount >= 2 ? cartCount * 500 : 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="border-b border-neutral-200 pb-6">
        <span className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">Shopping Bag</span>
        <h1 className="mt-1 font-serif text-4xl">Your Bag ({cartCount})</h1>
      </div>

      {cart.length === 0 ? (
        <div className="py-16 text-center">
          <p className="font-serif text-2xl">Your shopping bag is empty.</p>
          <Link
            href="/shop"
            className="mt-6 inline-block bg-black px-8 py-3.5 text-xs uppercase tracking-[0.2em] text-white"
          >
            Shop Sarees
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-12">
          <ul className="divide-y divide-neutral-200 lg:col-span-8">
            {cart.map((item) => (
              <li key={item.productId} className="flex gap-5 py-6">
                <div className="h-32 w-24 shrink-0 border border-neutral-200 bg-neutral-100 overflow-hidden flex items-center justify-center">
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-[10px] text-neutral-500 text-center px-1">Photo coming soon</span>
                  )}
                </div>
                <div className="flex flex-1 flex-col justify-between">
                  <div className="flex justify-between gap-4">
                    <div>
                      <Link href={`/products/${item.slug}`} className="font-serif text-xl hover:underline">
                        {item.name}
                      </Link>
                      <p className="mt-1 text-xs uppercase tracking-widest text-neutral-500">{item.sku}</p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      aria-label={`Remove ${item.name}`}
                      className="text-neutral-400 hover:text-black"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between pt-4">
                    <div className="flex items-center border border-neutral-300">
                      <button
                        onClick={() => updateQty(item.productId, item.quantity - 1)}
                        className="px-3 py-1.5 hover:bg-neutral-100"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="px-4 text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQty(item.productId, item.quantity + 1)}
                        className="px-3 py-1.5 hover:bg-neutral-100"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <span className="text-base font-medium">{formatLkr(item.priceLkr * item.quantity)}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="lg:col-span-4">
            <div className="border border-neutral-200 bg-neutral-50 p-6 space-y-4">
              <h2 className="font-serif text-2xl">Order Summary</h2>
              <div className="space-y-2 border-b border-neutral-200 pb-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Subtotal</span>
                  <span>{formatLkr(cartSubtotal)}</span>
                </div>
                {bundleDiscount > 0 && (
                  <div className="flex justify-between text-neutral-700">
                    <span>Two-Saree Bundle Saving</span>
                    <span>− {formatLkr(bundleDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-neutral-600">Island-wide Delivery</span>
                  <span>Calculated at checkout</span>
                </div>
              </div>
              <div className="flex justify-between text-base font-semibold">
                <span>Estimated Total</span>
                <span>{formatLkr(cartSubtotal - bundleDiscount)}</span>
              </div>
              <Link
                href="/checkout"
                className="flex w-full items-center justify-center gap-2 bg-black py-3.5 text-xs font-medium uppercase tracking-[0.2em] text-white hover:bg-neutral-800"
              >
                Proceed to Checkout
                <ArrowRight className="h-4 w-4" />
              </Link>
              <p className="text-xs leading-relaxed text-neutral-500">
                7-day exchange if unworn and tagged. Full refund for defects.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
