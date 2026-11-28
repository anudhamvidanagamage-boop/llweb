"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, Heart, ShoppingBag, Menu, X } from "lucide-react";
import { useStore } from "./StoreProvider";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { cartCount, wishlist, setCartOpen } = useStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Array<{ slug: string; name: string; priceLkr: number }>>([]);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(() => {
      fetch(`/api/products?q=${encodeURIComponent(query.trim())}&limit=5`)
        .then((r) => r.json())
        .then((d) => setSuggestions(d.products || []))
        .catch(() => {});
    }, 200);
    return () => clearTimeout(timer);
  }, [query]);

  if (pathname?.startsWith("/admin")) return null;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearchOpen(false);
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/95 backdrop-blur-sm no-print">
      {/* Top announcement bar */}
      <div className="bg-black px-4 py-1.5 text-center text-[11px] uppercase tracking-[0.18em] text-white">
        Sri Lankan Handloom &amp; Curated Imports &middot; Island-Wide Delivery
      </div>

      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation menu"
          className="p-1.5 text-black lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Unaltered Official Logo */}
        <Link href="/" className="flex items-center gap-1.5 sm:gap-2.5" aria-label="Luxe Loomie Home">
          <span className="relative h-12 w-12 shrink-0 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/logo-emblem.png"
              alt="Luxe Loomie Emblem"
              className="absolute left-1/2 top-1/2 h-[76px] w-[76px] max-w-none -translate-x-1/2 -translate-y-1/2 object-contain"
            />
          </span>
          <span className="relative h-12 w-[160px] shrink-0 overflow-hidden sm:w-[208px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/logo-wordmark.png"
              alt="LUXE LOOMIE"
              className="absolute left-1/2 top-1/2 h-[220px] w-[220px] max-w-none -translate-x-1/2 -translate-y-1/2 object-contain sm:h-[288px] sm:w-[288px]"
            />
          </span>
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden lg:flex items-center gap-8 text-xs uppercase tracking-[0.15em] text-neutral-700" aria-label="Primary">
          <Link href="/shop" className="hover:text-black transition-colors">
            Shop All
          </Link>
          <Link href="/shop?badge=HANDLOOM" className="hover:text-black transition-colors">
            Handloom
          </Link>
          <Link href="/shop?badge=IMPORTED" className="hover:text-black transition-colors">
            Imported
          </Link>
          <Link href="/story" className="hover:text-black transition-colors">
            Our Story
          </Link>
          <Link href="/care-faq" className="hover:text-black transition-colors">
            Care &amp; FAQ
          </Link>
          <Link href="/contact" className="hover:text-black transition-colors">
            Contact
          </Link>
        </nav>

        {/* Utility icons */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => setSearchOpen((v) => !v)}
            aria-label="Search sarees"
            className="p-1.5 text-black hover:text-neutral-600"
          >
            <Search className="h-4 w-4" />
          </button>

          <Link
            href="/wishlist"
            aria-label="Wishlist"
            className="relative p-1.5 text-black hover:text-neutral-600"
          >
            <Heart className="h-4 w-4" />
            {wishlist.length > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[10px] text-white">
                {wishlist.length}
              </span>
            )}
          </Link>

          <button
            onClick={() => setCartOpen(true)}
            aria-label="Open shopping bag"
            className="relative p-1.5 text-black hover:text-neutral-600"
          >
            <ShoppingBag className="h-4 w-4" />
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[10px] text-white">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Expandable Search Bar with Suggestions */}
      {searchOpen && (
        <div className="border-t border-neutral-200 bg-white px-4 py-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl">
            <form onSubmit={handleSearchSubmit} className="flex items-center border-b border-black pb-2">
              <Search className="h-4 w-4 text-neutral-500 mr-3" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by saree name, fabric, colour, or occasion..."
                autoFocus
                className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-400"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                aria-label="Close search"
                className="ml-2 text-neutral-500 hover:text-black"
              >
                <X className="h-4 w-4" />
              </button>
            </form>
            {suggestions.length > 0 && (
              <ul className="mt-3 divide-y divide-neutral-100">
                {suggestions.map((s) => (
                  <li key={s.slug}>
                    <Link
                      href={`/products/${s.slug}`}
                      className="flex items-center justify-between py-2 text-sm hover:bg-neutral-50 px-2"
                    >
                      <span>{s.name}</span>
                      <span className="text-xs text-neutral-500">LKR {s.priceLkr.toLocaleString("en-LK")}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex bg-black/40 lg:hidden" role="dialog" aria-modal="true" aria-label="Mobile menu">
          <div className="flex h-full w-72 flex-col bg-white p-6">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
              <span className="font-serif text-lg tracking-widest">LUXE LOOMIE</span>
              <button onClick={() => setMobileOpen(false)} aria-label="Close menu">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="mt-6 flex flex-col gap-4 text-sm uppercase tracking-widest">
              <Link href="/shop" className="py-1 border-b border-neutral-100">Shop All</Link>
              <Link href="/shop?badge=HANDLOOM" className="py-1 border-b border-neutral-100">Sri Lankan Handloom</Link>
              <Link href="/shop?badge=IMPORTED" className="py-1 border-b border-neutral-100">Imported Range</Link>
              <Link href="/story" className="py-1 border-b border-neutral-100">Our Story &amp; Craft</Link>
              <Link href="/care-faq" className="py-1 border-b border-neutral-100">Care Guide &amp; FAQ</Link>
              <Link href="/refer" className="py-1 border-b border-neutral-100">Refer &amp; Loyalty</Link>
              <Link href="/contact" className="py-1 border-b border-neutral-100">Contact</Link>
            </nav>
            <div className="mt-auto pt-6 text-xs text-neutral-500">
              <p>WhatsApp: 077 546 5623</p>
              <p className="mt-1">Daily, 9:00 AM – 7:00 PM</p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
