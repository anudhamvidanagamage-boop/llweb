import Link from "next/link";
import { StoreSettings } from "@/lib/settings";

export function Footer({ settings }: { settings: StoreSettings }) {
  return (
    <footer className="border-t border-neutral-200 bg-white text-black no-print">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div className="space-y-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/logo-emblem.png"
              alt="Luxe Loomie Emblem"
              className="h-12 w-12 object-contain"
            />
            <p className="font-serif text-lg leading-relaxed">{settings.tagline}</p>
            <p className="text-xs leading-relaxed text-neutral-600">
              {settings.address}
              <br />
              {settings.openingHours}
              <br />
              WhatsApp / Call: {settings.phoneDisplay}
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-black">
              Collections
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-neutral-600">
              <li><Link href="/shop" className="hover:text-black">All Sarees</Link></li>
              <li><Link href="/shop?badge=HANDLOOM" className="hover:text-black">Sri Lankan Handloom</Link></li>
              <li><Link href="/shop?category=RAYON_HANDLOOM" className="hover:text-black">Rayon Handloom</Link></li>
              <li><Link href="/shop?category=FULL_COTTON" className="hover:text-black">Full Cotton</Link></li>
              <li><Link href="/shop?category=RAYON_PUNE" className="hover:text-black">Rayon Pune</Link></li>
              <li><Link href="/shop?category=COTTON_PUNE" className="hover:text-black">Cotton Pune</Link></li>
              <li><Link href="/shop?badge=IMPORTED" className="hover:text-black">Imported</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-black">
              House &amp; Care
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-neutral-600">
              <li><Link href="/story" className="hover:text-black">Our Story &amp; Craft</Link></li>
              <li><Link href="/care-faq" className="hover:text-black">Care Guide &amp; FAQ</Link></li>
              <li><Link href="/refer" className="hover:text-black">Refer a Friend &amp; Loyalty</Link></li>
              <li><Link href="/contact" className="hover:text-black">Contact &amp; Visit</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-black">
              Policies
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-neutral-600">
              <li><Link href="/policies/delivery" className="hover:text-black">Island-Wide Delivery</Link></li>
              <li><Link href="/policies/returns" className="hover:text-black">7-Day Returns &amp; Exchanges</Link></li>
              <li><Link href="/policies/privacy" className="hover:text-black">Privacy Policy</Link></li>
              <li><Link href="/policies/terms" className="hover:text-black">Terms of Service</Link></li>
            </ul>
            <div className="mt-6 border-t border-neutral-200 pt-4">
              <span className="text-[11px] uppercase tracking-widest text-neutral-500">
                Language: English (SI / TA coming soon)
              </span>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-neutral-200 pt-8 text-xs text-neutral-500 sm:flex-row sm:items-center">
          <p>&copy; {new Date().getFullYear()} {settings.storeName}. All rights reserved.</p>
          <p>Prices in LKR (VAT-exclusive unless stated).</p>
        </div>
      </div>
    </footer>
  );
}
