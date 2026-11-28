import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle2, Sparkles, MessageCircle, ShieldCheck } from "lucide-react";
import { getStoreSettings } from "@/lib/settings";
import { getActiveProducts, mapProductToCard } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";
import { OCCASIONS, PRODUCT_CATEGORIES } from "@/lib/constants";
import { OptInForm } from "@/components/OptInForm";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [settings, allProducts] = await Promise.all([
    getStoreSettings(),
    getActiveProducts(),
  ]);

  const newArrivals = allProducts.filter((p) => p.isNewArrival).slice(0, 4).map(mapProductToCard);
  const stripPhotos = allProducts
    .filter((p) => p.images.length > 0)
    .slice(0, 5)
    .map((p) => ({
      slug: p.slug,
      name: p.name,
      url: p.images[0].url,
    }));

  return (
    <div className="bg-white text-black">
      {/* 1. Hero Section */}
      <section className="relative isolate h-[80svh] overflow-hidden border-b border-neutral-200 md:h-[85vh] md:max-h-[820px] md:min-h-[560px]">
        <div className="luxe-hero-image-frame absolute inset-0">
          <Image
            src="/uploads/products/hero.jpg"
            alt="Woman in an elegant blue saree standing in a sunlit architectural interior"
            fill
            priority
            sizes="100vw"
            className="luxe-hero-image object-cover object-[70%_bottom] max-md:object-[72%_center]"
          />
        </div>
        <div className="luxe-hero-overlay absolute inset-0" />
        <div className="relative z-10 mx-auto flex h-full max-w-7xl items-end px-4 pb-8 sm:px-6 md:items-center md:pb-0 lg:px-8">
          <div className="luxe-hero-copy max-w-[680px] text-white">
            <span className="luxe-hero-reveal luxe-hero-reveal-1 luxe-hero-eyebrow block text-[12px] font-medium uppercase tracking-[0.25em] text-white/80">
              {settings.homepageBanner.eyebrow}
            </span>
            <h1 className="luxe-hero-reveal luxe-hero-reveal-2 mt-3 font-serif text-[clamp(2.5rem,5.5vw,5rem)] font-normal leading-[1.08] tracking-tight text-white">
              {settings.homepageBanner.headline}
            </h1>
            <p className="luxe-hero-reveal luxe-hero-reveal-3 mt-4 max-w-[440px] text-base leading-[1.6] text-white/90 sm:text-lg">
              {settings.homepageBanner.subheadline}
            </p>
            <div className="luxe-hero-reveal luxe-hero-reveal-4 mt-6 flex flex-col gap-3 lg:flex-row lg:items-center">
              <Link
                href={settings.homepageBanner.ctaHref}
                className="inline-flex h-[52px] items-center justify-center gap-2 border border-white bg-white px-7 text-xs font-medium uppercase tracking-[0.2em] text-black transition-colors hover:bg-black hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              >
                {settings.homepageBanner.ctaLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/shop?badge=HANDLOOM"
                className="inline-flex h-[52px] items-center justify-center border border-white bg-transparent px-7 text-xs font-medium uppercase tracking-[0.2em] text-white transition-colors hover:bg-white hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              >
                Explore Handloom
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Seasonal Banner Slot */}
      {settings.seasonalBanner.enabled && (
        <section className="border-b border-neutral-200 bg-neutral-50">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-4 py-5 sm:flex-row sm:items-center sm:px-6 lg:px-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black">
                {settings.seasonalBanner.title}
              </p>
              <p className="mt-0.5 text-sm text-neutral-600">{settings.seasonalBanner.subtitle}</p>
            </div>
            <Link
              href={settings.seasonalBanner.ctaHref}
              className="shrink-0 border border-black px-5 py-2 text-[11px] font-medium uppercase tracking-widest transition-colors hover:bg-black hover:text-white sm:mr-24 md:mr-44"
            >
              {settings.seasonalBanner.ctaLabel}
            </Link>
          </div>
        </section>
      )}

      {/* 2. Shop by Occasion */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between border-b border-neutral-200 pb-4">
          <div>
            <span className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">Curated Edits</span>
            <h2 className="mt-1 font-serif text-3xl">Shop by Occasion</h2>
          </div>
          <Link href="/shop" className="text-xs uppercase tracking-widest underline hover:text-neutral-600">
            View All
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {OCCASIONS.map((occasion) => (
            <Link
              key={occasion}
              href={`/shop?occasion=${encodeURIComponent(occasion)}`}
              className="group flex flex-col justify-between border border-neutral-200 bg-white p-5 hover:border-black transition-colors"
            >
              <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-400">Occasion</span>
              <div className="mt-8 flex items-center justify-between">
                <span className="font-serif text-xl">{occasion}</span>
                <ArrowRight className="h-4 w-4 text-neutral-400 group-hover:text-black transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. New Arrivals */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between border-b border-neutral-200 pb-4">
          <div>
            <span className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">Freshly Inspected</span>
            <h2 className="mt-1 font-serif text-3xl">New Arrivals</h2>
          </div>
          <Link href="/shop?sort=newest" className="text-xs uppercase tracking-widest underline hover:text-neutral-600">
            Shop New
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 lg:grid-cols-4">
          {newArrivals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 4. Shop by Fabric */}
      <section className="border-y border-neutral-200 bg-neutral-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-xl">
            <span className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">Six Core Ranges</span>
            <h2 className="mt-1 font-serif text-3xl">Shop by Fabric</h2>
            <p className="mt-2 text-sm text-neutral-600">
              Our collection centres on Sri Lankan handloom, complemented by a small, clearly labelled imported range.
            </p>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PRODUCT_CATEGORIES.map((cat) => (
              <Link
                key={cat.value}
                href={`/shop?category=${cat.value}`}
                className="flex items-center justify-between border border-neutral-200 bg-white p-6 hover:border-black transition-colors"
              >
                <div>
                  <span className="text-[10px] uppercase tracking-[0.18em] text-neutral-500">
                    {cat.badge === "HANDLOOM" ? "Sri Lankan Handloom" : "Imported"}
                  </span>
                  <h3 className="mt-1 font-serif text-2xl">{cat.label}</h3>
                  <p className="mt-1 text-xs text-neutral-500">From LKR {cat.defaultPrice.toLocaleString("en-LK")}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-neutral-400" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Why Luxe Loomie */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-xl">
          <span className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">Our Standard</span>
          <h2 className="mt-1 font-serif text-3xl">Why Luxe Loomie</h2>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="border border-neutral-200 p-6">
            <Sparkles className="h-5 w-5 text-black" />
            <h3 className="mt-4 font-serif text-xl">Thoughtful Curation</h3>
            <p className="mt-2 text-sm leading-relaxed text-neutral-600">
              Fewer, better sarees chosen for natural drape, refined colourways, and clean border and pallu finish.
            </p>
          </div>
          <div className="border border-neutral-200 p-6">
            <CheckCircle2 className="h-5 w-5 text-black" />
            <h3 className="mt-4 font-serif text-xl">Authentic Handloom</h3>
            <p className="mt-2 text-sm leading-relaxed text-neutral-600">
              Fibre, weave, and origin described truthfully. Imported pieces are always clearly labelled as imported.
            </p>
          </div>
          <div className="border border-neutral-200 p-6">
            <MessageCircle className="h-5 w-5 text-black" />
            <h3 className="mt-4 font-serif text-xl">Personal Service</h3>
            <p className="mt-2 text-sm leading-relaxed text-neutral-600">
              Honest styling advice and quick replies on WhatsApp, plus easy 7-day exchanges on unworn tagged sarees.
            </p>
          </div>
          <div className="border border-neutral-200 p-6">
            <ShieldCheck className="h-5 w-5 text-black" />
            <h3 className="mt-4 font-serif text-xl">Honest Quality Checks</h3>
            <p className="mt-2 text-sm leading-relaxed text-neutral-600">
              Every saree is checked for weave consistency, colour fastness, snags, and ~5.5 m length plus blouse piece.
            </p>
          </div>
        </div>
      </section>

      {/* 6. Weaver / Craft Teaser */}
      <section className="bg-black text-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 lg:grid-cols-12">
          <div className="px-4 py-16 sm:px-6 lg:col-span-7 lg:px-12 lg:py-20 flex flex-col justify-center">
            <span className="text-[11px] uppercase tracking-[0.22em] text-neutral-400">
              Sri Lankan Craftsmanship
            </span>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl">
              Honouring over 2,500 years of Sri Lankan handloom heritage.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-neutral-300">
              We partner with vetted Sri Lankan handloom producers and cooperatives, paying on time and inspecting every piece with care before it reaches your wardrobe.
            </p>
            <div className="mt-8">
              <Link
                href="/story"
                className="inline-flex items-center gap-2 border border-white px-7 py-3 text-xs uppercase tracking-[0.2em] text-white hover:bg-white hover:text-black transition-colors"
              >
                Read Our Story
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className="relative aspect-[4/5] lg:aspect-auto lg:col-span-5 overflow-hidden bg-neutral-900">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/uploads/products/emerald-woven-rayon.webp"
              alt="Emerald green Sri Lankan handloom saree"
              loading="lazy"
              className="h-full w-full object-cover object-top"
            />
          </div>
        </div>
      </section>

      {/* 7. Social Strip */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <span className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">
              Instagram &amp; TikTok &middot; [PLACEHOLDER: @luxeloomie]
            </span>
            <h2 className="mt-1 font-serif text-3xl">In Natural Light</h2>
          </div>
          <p className="text-xs text-neutral-500">True-colour photography without heavy filters.</p>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {stripPhotos.map((item) => (
            <Link
              key={item.slug}
              href={`/products/${item.slug}`}
              className="aspect-[4/5] overflow-hidden border border-neutral-200 bg-neutral-100"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.url}
                alt={item.name}
                loading="lazy"
                className="h-full w-full object-cover object-top hover:scale-105 transition-transform duration-500"
              />
            </Link>
          ))}
        </div>
      </section>

      {/* 8. Testimonials ([PLACEHOLDER]) */}
      <section className="border-y border-neutral-200 bg-neutral-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <span className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">
            Customer Notes
          </span>
          <h2 className="mt-1 font-serif text-3xl">Worn Across Sri Lanka</h2>
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            {[1, 2, 3].map((idx) => (
              <div key={idx} className="border border-neutral-200 bg-white p-6">
                <p className="font-serif text-lg italic leading-relaxed text-neutral-700">
                  &ldquo;[PLACEHOLDER: Customer review #{idx} — to be added from verified WhatsApp and store feedback.]&rdquo;
                </p>
                <p className="mt-4 text-xs uppercase tracking-widest text-neutral-500">
                  [PLACEHOLDER: Customer Name, City]
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. Newsletter / WhatsApp Opt-in */}
      <section className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <span className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">Stay Informed</span>
        <h2 className="mt-2 font-serif text-3xl">Receive New Arrival Edits</h2>
        <p className="mx-auto mt-2 max-w-lg text-sm text-neutral-600">
          Opt in for quiet updates when new handloom lots and seasonal collections arrive. No spam.
        </p>
        <div className="text-left">
          <OptInForm />
        </div>
      </section>
    </div>
  );
}
