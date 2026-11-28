import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Our Story & Craft",
  description:
    "Discover Sri Lankan handloom heritage, our weaver partnerships, and Luxe Loomie's quality inspection promise.",
};

export default function StoryPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8 space-y-14">
      <header className="border-b border-neutral-200 pb-8">
        <span className="text-[11px] uppercase tracking-[0.22em] text-neutral-500">
          Our Story &amp; Craft
        </span>
        <h1 className="mt-2 font-serif text-4xl sm:text-5xl">
          Sri Lankan handloom elegance, curated with care.
        </h1>
        <p className="mt-4 text-base leading-relaxed text-neutral-600">
          Luxe Loomie brings Sri Lankan handloom craftsmanship and a carefully selected imported range together under one honest, refined house.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="font-serif text-3xl">Over 2,500 Years of Handloom Heritage</h2>
        <p className="text-sm leading-relaxed text-neutral-700">
          Handloom weaving in Sri Lanka is a living cottage craft practiced by skilled artisans across communities, including traditional weaving villages in Uva and Sabaragamuwa. Using rayon, cotton, and blended yarns, weavers create breathable, textured fabrics suited to Sri Lanka&apos;s climate.
        </p>
        <p className="text-sm leading-relaxed text-neutral-700">
          Our core range celebrates this heritage: Rayon Handloom, Full Cotton, Rayon Pune, Cotton Pune, and Embroidered handloom pieces. Alongside this, we curate a smaller selection of Imported sarees—always clearly labelled as imported—for occasions where customers seek distinct weaves or embellishments.
        </p>
      </section>

      <section className="border border-neutral-200 bg-neutral-50 p-8 space-y-5">
        <h2 className="font-serif text-3xl">Our Quality Promise</h2>
        <p className="text-sm text-neutral-700">
          Every saree—handloom or imported—is inspected at receipt and before dispatch. We check:
        </p>
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-sm text-neutral-800">
          <li className="border-l-2 border-black pl-3">
            <strong>Weave Consistency:</strong> Checked for even tension, clean selvedges, and zero snags or stains.
          </li>
          <li className="border-l-2 border-black pl-3">
            <strong>Colour Fastness:</strong> Rub-tested so colours stay true when worn and cared for properly.
          </li>
          <li className="border-l-2 border-black pl-3">
            <strong>Border &amp; Pallu Finish:</strong> Inspected for neat tassels, hems, and embroidery alignment.
          </li>
          <li className="border-l-2 border-black pl-3">
            <strong>Measurements:</strong> Verified at approximately 5.5 metres body length plus an unstitched blouse piece.
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="font-serif text-3xl">Weaver Partnerships</h2>
        <p className="text-sm leading-relaxed text-neutral-700">
          We work directly with vetted local weavers, cooperatives, and wholesalers. By paying on time, agreeing clear quality tolerances, and sharing customer feedback, we build long-term relationships that support Sri Lankan craft.
        </p>
        <div className="pt-4">
          <Link
            href="/shop"
            className="inline-block bg-black px-8 py-3.5 text-xs uppercase tracking-[0.2em] text-white hover:bg-neutral-800"
          >
            Explore the Collection
          </Link>
        </div>
      </section>
    </div>
  );
}
