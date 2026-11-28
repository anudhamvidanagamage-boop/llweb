import type { Metadata } from "next";
import { getStoreSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Care Guide & FAQ",
  description: "How to wash, iron, and store Sri Lankan handloom cotton, rayon, and embroidered sarees, plus frequently asked questions.",
};

export default async function CareFaqPage() {
  const settings = await getStoreSettings();

  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8 space-y-14">
      <header className="border-b border-neutral-200 pb-8">
        <span className="text-[11px] uppercase tracking-[0.22em] text-neutral-500">Garment Care</span>
        <h1 className="mt-2 font-serif text-4xl">Saree Care Guide &amp; FAQ</h1>
        <p className="mt-3 text-sm text-neutral-600">
          Simple care keeps handloom fibres supple and colours vibrant for years.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="border border-neutral-200 p-6">
          <h2 className="font-serif text-2xl">Full Cotton &amp; Cotton Pune</h2>
          <p className="mt-3 text-sm leading-relaxed text-neutral-600">
            Gentle hand wash separately in cold water with mild detergent. Do not soak for long or wring tightly. Dry in shade and warm iron on reverse.
          </p>
        </div>
        <div className="border border-neutral-200 p-6">
          <h2 className="font-serif text-2xl">Rayon &amp; Rayon Pune</h2>
          <p className="mt-3 text-sm leading-relaxed text-neutral-600">
            Cold hand wash with mild soap or dry clean. Dry flat or on a padded hanger in shade to preserve the fluid drape.
          </p>
        </div>
        <div className="border border-neutral-200 p-6">
          <h2 className="font-serif text-2xl">Embroidered &amp; Imported</h2>
          <p className="mt-3 text-sm leading-relaxed text-neutral-600">
            Dry clean recommended. Store folded with acid-free tissue or breathable cotton wrap away from direct sunlight.
          </p>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="font-serif text-3xl border-b border-neutral-200 pb-3">Frequently Asked Questions</h2>
        <div className="divide-y divide-neutral-200">
          {settings.faqs.map((faq, idx) => (
            <div key={idx} className="py-5">
              <h3 className="font-serif text-xl text-black">{faq.question}</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
