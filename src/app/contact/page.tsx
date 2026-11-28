import type { Metadata } from "next";
import { MapPin, Phone, Clock, Mail, MessageCircle } from "lucide-react";
import { getStoreSettings } from "@/lib/settings";
import { buildWhatsAppUrl } from "@/lib/constants";
import { ContactForm } from "@/components/ContactForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Visit Luxe Loomie in Divulapitiya, Sri Lanka or message us on WhatsApp for saree styling and orders.",
};

export default async function ContactPage() {
  const settings = await getStoreSettings();

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="border-b border-neutral-200 pb-6 mb-10">
        <span className="text-[11px] uppercase tracking-[0.22em] text-neutral-500">Get in Touch</span>
        <h1 className="mt-1 font-serif text-4xl">Contact &amp; Boutique</h1>
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-5">
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-widest">Boutique Address</h2>
              <p className="mt-1 text-sm text-neutral-700">{settings.address}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-widest">Opening Hours</h2>
              <p className="mt-1 text-sm text-neutral-700">{settings.openingHours}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Phone className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-widest">WhatsApp &amp; Phone</h2>
              <p className="mt-1 text-sm text-neutral-700">{settings.phoneDisplay}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-widest">Email</h2>
              <p className="mt-1 text-sm text-neutral-700">{settings.email} [PLACEHOLDER]</p>
            </div>
          </div>

          <a
            href={buildWhatsAppUrl(settings.whatsappNumber, "Hello Luxe Loomie, I have an enquiry.")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-black px-6 py-3 text-xs uppercase tracking-[0.18em] text-white hover:bg-neutral-800"
          >
            <MessageCircle className="h-4 w-4" />
            Message on WhatsApp
          </a>

          <div className="border border-neutral-200 bg-neutral-100 p-8 text-center text-xs text-neutral-500">
            [PLACEHOLDER: Embedded Google Map for 71, Kurunegakataa Road, Divulapitiya, Sri Lanka]
          </div>
        </div>

        <div className="lg:col-span-7">
          <h2 className="font-serif text-2xl mb-4">Send an Enquiry</h2>
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
