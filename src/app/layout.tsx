import type { Metadata } from "next";
import { Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { getStoreSettings } from "@/lib/settings";
import { StoreProvider } from "@/components/StoreProvider";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Luxe Loomie | Sri Lankan Handloom & Curated Sarees",
    template: "%s | Luxe Loomie",
  },
  description:
    "Sri Lankan handloom elegance, curated with care. Buy quality-checked handloom and curated imported sarees online in Sri Lanka with island-wide delivery.",
  keywords: [
    "handloom sarees Sri Lanka",
    "buy sarees online Sri Lanka",
    "Sri Lankan handloom",
    "cotton sarees Sri Lanka",
    "Luxe Loomie",
  ],
  openGraph: {
    title: "Luxe Loomie | Sri Lankan Handloom & Curated Sarees",
    description:
      "Sri Lankan handloom elegance, curated with care. Quality-checked sarees delivered island-wide.",
    type: "website",
    locale: "en_LK",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getStoreSettings();

  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${plusJakarta.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-white text-black font-sans">
        <StoreProvider
          whatsappNumber={settings.whatsappNumber}
          bundleRule={settings.bundleRule}
          ga4Id={settings.analytics.ga4Id}
          metaPixelId={settings.analytics.metaPixelId}
        >
          <Header />
          <main className="flex-1">{children}</main>
          <Footer settings={settings} />
        </StoreProvider>
      </body>
    </html>
  );
}
