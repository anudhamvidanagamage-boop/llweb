import type { Metadata } from "next";
import Link from "next/link";
import { getStoreSettings } from "@/lib/settings";
import { buildWhatsAppUrl } from "@/lib/constants";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Refer a Friend & Loyalty",
  description: "Learn about the Luxe Loomie loyalty stamp card and referral programme.",
};

export default async function ReferPage() {
  const settings = await getStoreSettings();

  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8 space-y-12">
      <header className="border-b border-neutral-200 pb-6">
        <span className="text-[11px] uppercase tracking-[0.22em] text-neutral-500">
          Community &amp; Privileges
        </span>
        <h1 className="mt-2 font-serif text-4xl">Refer a Friend &amp; Loyalty Card</h1>
      </header>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="border border-black p-8 space-y-4">
          <span className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">Loyalty Card</span>
          <h2 className="font-serif text-3xl">Every {settings.loyaltyRule.sareesForReward}th Saree</h2>
          <p className="text-sm leading-relaxed text-neutral-700">
            {settings.loyaltyRule.rewardDescription}
          </p>
          <p className="text-xs text-neutral-500">
            Stamps are tracked automatically against your phone number in-store and on WhatsApp orders.
          </p>
        </div>

        <div className="border border-neutral-200 bg-neutral-50 p-8 space-y-4">
          <span className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">Refer a Friend</span>
          <h2 className="font-serif text-3xl">Share Luxe Loomie</h2>
          <p className="text-sm leading-relaxed text-neutral-700">
            Introduce a friend to Luxe Loomie. When she places her first order and mentions your name and phone number, both of you receive a thank-you voucher on your next saree.
          </p>
          <a
            href={buildWhatsAppUrl(
              settings.whatsappNumber,
              "Hello Luxe Loomie, I would like to refer a friend for a saree!"
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block border border-black px-6 py-2.5 text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-colors"
          >
            Refer via WhatsApp
          </a>
        </div>
      </div>

      <div className="text-center pt-4">
        <Link href="/shop" className="text-xs uppercase tracking-widest underline">
          Return to Shop
        </Link>
      </div>
    </div>
  );
}
