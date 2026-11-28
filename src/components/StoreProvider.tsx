"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { MessageCircle, X, ShoppingBag, Trash2, Plus, Minus } from "lucide-react";
import { buildWhatsAppUrl, formatLkr } from "@/lib/constants";

export interface CartItem {
  productId: string;
  sku: string;
  slug: string;
  name: string;
  priceLkr: number;
  imageUrl: string | null;
  badge: string;
  quantity: number;
  maxStock: number;
}

interface StoreContextValue {
  cart: CartItem[];
  wishlist: string[];
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  addToCart: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  updateQty: (productId: string, qty: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  trackEvent: (type: string, productId?: string) => void;
  cartCount: number;
  cartSubtotal: number;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

export function StoreProvider({
  children,
  whatsappNumber,
  bundleRule,
  ga4Id,
  metaPixelId,
}: {
  children: React.ReactNode;
  whatsappNumber: string;
  bundleRule: { enabled: boolean; minQty: number; discountPerSareeLkr: number; label: string };
  ga4Id?: string;
  metaPixelId?: string;
}) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [cookieChoice, setCookieChoice] = useState<"pending" | "accepted" | "declined">("accepted");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("ll_cart");
      if (savedCart) setCart(JSON.parse(savedCart));
      const savedWish = localStorage.getItem("ll_wishlist");
      if (savedWish) setWishlist(JSON.parse(savedWish));
      const consent = localStorage.getItem("ll_cookie_consent");
      if (!consent) setCookieChoice("pending");
      else setCookieChoice(consent === "accepted" ? "accepted" : "declined");
    } catch {
      // ignore storage errors
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem("ll_cart", JSON.stringify(cart));
    } catch {
      // ignore
    }
  }, [cart, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem("ll_wishlist", JSON.stringify(wishlist));
    } catch {
      // ignore
    }
  }, [wishlist, hydrated]);

  const trackEvent = useCallback(
    (type: string, productId?: string) => {
      if (isAdmin) return;
      try {
        let sessionId = sessionStorage.getItem("ll_sid");
        if (!sessionId) {
          sessionId = Math.random().toString(36).slice(2) + Date.now().toString(36);
          sessionStorage.setItem("ll_sid", sessionId);
        }
        const params = new URLSearchParams(window.location.search);
        fetch("/api/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type,
            path: window.location.pathname,
            productId,
            referrer: document.referrer,
            utmSource: params.get("utm_source") || undefined,
            sessionId,
          }),
          keepalive: true,
        }).catch(() => {});
      } catch {
        // ignore
      }
    },
    [isAdmin]
  );

  useEffect(() => {
    if (!isAdmin && hydrated) {
      trackEvent("PAGE_VIEW");
    }
  }, [pathname, isAdmin, hydrated, trackEvent]);

  const addToCart = useCallback(
    (item: Omit<CartItem, "quantity">, qty = 1) => {
      setCart((prev) => {
        const existing = prev.find((i) => i.productId === item.productId);
        if (existing) {
          return prev.map((i) =>
            i.productId === item.productId
              ? { ...i, quantity: Math.min(i.maxStock, i.quantity + qty) }
              : i
          );
        }
        return [...prev, { ...item, quantity: Math.min(item.maxStock, qty) }];
      });
      setCartOpen(true);
      trackEvent("ADD_TO_CART", item.productId);
    },
    [trackEvent]
  );

  const updateQty = useCallback((productId: string, qty: number) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((i) => i.productId !== productId));
      return;
    }
    setCart((prev) =>
      prev.map((i) =>
        i.productId === productId ? { ...i, quantity: Math.min(i.maxStock, qty) } : i
      )
    );
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const toggleWishlist = useCallback(
    (productId: string) => {
      setWishlist((prev) => {
        const exists = prev.includes(productId);
        if (!exists) trackEvent("WISHLIST_ADD", productId);
        return exists ? prev.filter((id) => id !== productId) : [...prev, productId];
      });
    },
    [trackEvent]
  );

  const isWishlisted = useCallback(
    (productId: string) => wishlist.includes(productId),
    [wishlist]
  );

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cart.reduce((acc, item) => acc + item.priceLkr * item.quantity, 0);
  const bundleDiscount =
    bundleRule.enabled && cartCount >= bundleRule.minQty
      ? cartCount * bundleRule.discountPerSareeLkr
      : 0;

  const handleCookie = (accept: boolean) => {
    localStorage.setItem("ll_cookie_consent", accept ? "accepted" : "declined");
    setCookieChoice(accept ? "accepted" : "declined");
  };

  return (
    <StoreContext.Provider
      value={{
        cart,
        wishlist,
        cartOpen,
        setCartOpen,
        addToCart,
        updateQty,
        removeFromCart,
        clearCart,
        toggleWishlist,
        isWishlisted,
        trackEvent,
        cartCount,
        cartSubtotal,
      }}
    >
      {children}

      {/* Slide-over Cart Drawer */}
      {!isAdmin && cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40" role="dialog" aria-modal="true" aria-label="Shopping bag">
          <div className="flex h-full w-full max-w-md flex-col bg-white text-black shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" />
                <h2 className="font-serif text-xl tracking-wide">Your Bag ({cartCount})</h2>
              </div>
              <button
                onClick={() => setCartOpen(false)}
                aria-label="Close bag"
                className="p-1 text-neutral-600 hover:text-black"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {cart.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <p className="text-sm text-neutral-600">Your bag is currently empty.</p>
                  <Link
                    href="/shop"
                    onClick={() => setCartOpen(false)}
                    className="mt-4 border border-black px-6 py-2.5 text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-colors"
                  >
                    Explore Sarees
                  </Link>
                </div>
              ) : (
                <ul className="divide-y divide-neutral-200">
                  {cart.map((item) => (
                    <li key={item.productId} className="flex gap-4 py-4">
                      <div className="h-24 w-20 shrink-0 bg-neutral-100 border border-neutral-200 overflow-hidden flex items-center justify-center">
                        {item.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-[10px] text-neutral-500 text-center px-1">Photo coming soon</span>
                        )}
                      </div>
                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <div className="flex justify-between gap-2">
                            <Link
                              href={`/products/${item.slug}`}
                              onClick={() => setCartOpen(false)}
                              className="text-sm font-medium leading-snug hover:underline"
                            >
                              {item.name}
                            </Link>
                            <button
                              onClick={() => removeFromCart(item.productId)}
                              aria-label={`Remove ${item.name}`}
                              className="text-neutral-400 hover:text-black"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          <p className="mt-0.5 text-xs text-neutral-500">{item.sku}</p>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center border border-neutral-300">
                            <button
                              onClick={() => updateQty(item.productId, item.quantity - 1)}
                              aria-label="Decrease quantity"
                              className="px-2 py-1 text-neutral-700 hover:bg-neutral-100"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="px-3 text-xs font-medium">{item.quantity}</span>
                            <button
                              onClick={() => updateQty(item.productId, item.quantity + 1)}
                              aria-label="Increase quantity"
                              className="px-2 py-1 text-neutral-700 hover:bg-neutral-100"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <span className="text-sm font-medium">{formatLkr(item.priceLkr * item.quantity)}</span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t border-neutral-200 bg-neutral-50 px-6 py-5 space-y-3">
                {bundleDiscount > 0 && (
                  <div className="flex justify-between text-xs text-neutral-700">
                    <span>Bundle Saving</span>
                    <span>− {formatLkr(bundleDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-semibold">
                  <span>Subtotal</span>
                  <span>{formatLkr(cartSubtotal - bundleDiscount)}</span>
                </div>
                <p className="text-xs text-neutral-500">
                  Island-wide delivery calculated at checkout. 7-day unworn exchange.
                </p>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <Link
                    href="/cart"
                    onClick={() => setCartOpen(false)}
                    className="border border-black py-3 text-center text-xs uppercase tracking-widest hover:bg-neutral-100"
                  >
                    View Bag
                  </Link>
                  <Link
                    href="/checkout"
                    onClick={() => setCartOpen(false)}
                    className="bg-black py-3 text-center text-xs uppercase tracking-widest text-white hover:bg-neutral-800"
                  >
                    Checkout
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating WhatsApp Button on Storefront */}
      {!isAdmin && (
        <a
          href={buildWhatsAppUrl(
            whatsappNumber,
            "Hello Luxe Loomie, I would like styling advice or help choosing a saree."
          )}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent("WHATSAPP_CLICK")}
          aria-label="Chat with Luxe Loomie on WhatsApp"
          className="fixed bottom-5 right-5 z-40 flex items-center gap-2 bg-black px-4 py-3 text-xs font-medium uppercase tracking-widest text-white shadow-lg border border-white/20 hover:bg-neutral-800 transition-colors"
        >
          <MessageCircle className="h-4 w-4" />
          <span className="hidden sm:inline">WhatsApp Us</span>
        </a>
      )}

      {/* Cookie Notice for GA4 & Meta Pixel Placeholders */}
      {!isAdmin && hydrated && cookieChoice === "pending" && (
        <div className="fixed bottom-4 left-4 right-4 sm:right-auto sm:max-w-sm z-40 border border-black bg-white p-4 shadow-xl">
          <p className="text-xs leading-relaxed text-neutral-700">
            We use essential cookies for your shopping bag and optional analytics to improve your experience.
            {(ga4Id || metaPixelId) ? "" : " (Analytics tags ready when configured.)"}
          </p>
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => handleCookie(true)}
              className="bg-black px-4 py-1.5 text-[11px] uppercase tracking-widest text-white hover:bg-neutral-800"
            >
              Accept
            </button>
            <button
              onClick={() => handleCookie(false)}
              className="border border-neutral-300 px-4 py-1.5 text-[11px] uppercase tracking-widest text-neutral-700 hover:border-black"
            >
              Decline
            </button>
          </div>
        </div>
      )}
    </StoreContext.Provider>
  );
}
