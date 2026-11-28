import type { Metadata } from "next";
import { getStoreSettings } from "@/lib/settings";
import { CheckoutClient } from "@/components/CheckoutClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Guest checkout for Luxe Loomie Sri Lankan handloom and curated sarees.",
};

export default async function CheckoutPage() {
  const settings = await getStoreSettings();
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="border-b border-neutral-200 pb-6 mb-8">
        <span className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">Guest Checkout</span>
        <h1 className="mt-1 font-serif text-4xl">Complete Your Order</h1>
      </div>
      <CheckoutClient settings={settings} />
    </div>
  );
}
