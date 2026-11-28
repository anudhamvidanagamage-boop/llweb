import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getStoreSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

const TITLES: Record<string, string> = {
  delivery: "Island-Wide Delivery Policy",
  returns: "Returns & Exchanges Policy",
  privacy: "Privacy Policy",
  terms: "Terms of Service",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ type: string }>;
}): Promise<Metadata> {
  const { type } = await params;
  return { title: TITLES[type] || "Policy" };
}

export default async function PolicyPage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;
  const title = TITLES[type];
  if (!title) notFound();

  const settings = await getStoreSettings();
  const body = settings.policies[type as keyof typeof settings.policies] || "";

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
      <span className="text-[11px] uppercase tracking-[0.22em] text-neutral-500">Store Policy</span>
      <h1 className="mt-2 font-serif text-4xl border-b border-neutral-200 pb-6">{title}</h1>
      <div className="mt-8 space-y-4 text-sm leading-relaxed text-neutral-700 whitespace-pre-line">
        {body}
      </div>
      <div className="mt-10 border-t border-neutral-200 pt-6 text-xs text-neutral-500">
        Questions? Contact us on WhatsApp at {settings.phoneDisplay} ({settings.openingHours}).
      </div>
    </div>
  );
}
