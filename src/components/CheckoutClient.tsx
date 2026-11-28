"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, MessageCircle, Upload } from "lucide-react";
import { useStore } from "./StoreProvider";
import { buildWhatsAppUrl, formatLkr, SRI_LANKA_DISTRICTS } from "@/lib/constants";
import type { StoreSettings } from "@/lib/settings";

export function CheckoutClient({ settings }: { settings: StoreSettings }) {
  const { cart, cartCount, cartSubtotal, clearCart, trackEvent } = useStore();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [district, setDistrict] = useState("Colombo");
  const [paymentMethod, setPaymentMethod] = useState<"BANK_TRANSFER" | "COD" | "CARD_LINK">(
    "BANK_TRANSFER"
  );
  const [optInWhatsApp, setOptInWhatsApp] = useState(true);
  const [slipUrl, setSlipUrl] = useState("");
  const [uploadingSlip, setUploadingSlip] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [confirmedOrder, setConfirmedOrder] = useState<{
    orderNumber: string;
    totalLkr: number;
    items: Array<{ productName: string; sku: string; quantity: number }>;
  } | null>(null);

  useEffect(() => {
    if (cart.length > 0) {
      trackEvent("CHECKOUT_START");
    }
  }, [cart.length, trackEvent]);

  const bundleDiscount =
    settings.bundleRule.enabled && cartCount >= settings.bundleRule.minQty
      ? cartCount * settings.bundleRule.discountPerSareeLkr
      : 0;
  const afterDiscount = Math.max(0, cartSubtotal - bundleDiscount);
  const deliveryFee =
    settings.deliveryFeeLkr === 0 ||
    (settings.freeDeliveryThresholdLkr > 0 && afterDiscount >= settings.freeDeliveryThresholdLkr)
      ? 0
      : settings.deliveryFeeLkr;
  const total = afterDiscount + deliveryFee;

  const handleSlipUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingSlip(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/uploads/slip", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setSlipUrl(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not upload slip");
    } finally {
      setUploadingSlip(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (paymentMethod === "BANK_TRANSFER" && !slipUrl) {
      setError("Please upload your bank transfer slip to complete your order.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          email,
          address,
          district,
          paymentMethod,
          slipUrl: paymentMethod === "BANK_TRANSFER" ? slipUrl : undefined,
          optInWhatsApp,
          items: cart.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Order could not be placed");

      trackEvent("ORDER_PAID");
      setConfirmedOrder(data.order);
      clearCart();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit order");
    } finally {
      setSubmitting(false);
    }
  };

  if (confirmedOrder) {
    const waText = `Hello Luxe Loomie, I just placed order ${confirmedOrder.orderNumber} (${formatLkr(
      confirmedOrder.totalLkr
    )}).\nItems:\n${confirmedOrder.items
      .map((i) => `• ${i.productName} (${i.sku}) x ${i.quantity}`)
      .join("\n")}\nName: ${name}\nDistrict: ${district}`;

    return (
      <div className="mx-auto max-w-2xl border border-black bg-white p-8 sm:p-12 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-black" />
        <span className="mt-4 block text-[11px] uppercase tracking-[0.22em] text-neutral-500">
          Order Received
        </span>
        <h1 className="mt-2 font-serif text-4xl">Thank You, {name}</h1>
        <p className="mt-3 text-sm text-neutral-600">
          Your order reference is <strong className="text-black">{confirmedOrder.orderNumber}</strong>.
          We dispatch within 24 to 48 hours after confirmation.
        </p>
        <div className="mt-6 border-y border-neutral-200 py-4 text-sm">
          <div className="flex justify-between font-medium">
            <span>Order Total</span>
            <span>{formatLkr(confirmedOrder.totalLkr)}</span>
          </div>
        </div>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <a
            href={buildWhatsAppUrl(settings.whatsappNumber, waText)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-black px-7 py-3.5 text-xs uppercase tracking-[0.2em] text-white hover:bg-neutral-800"
          >
            <MessageCircle className="h-4 w-4" />
            Send Confirmation on WhatsApp
          </a>
          <Link
            href="/shop"
            className="inline-flex items-center justify-center border border-black px-7 py-3.5 text-xs uppercase tracking-[0.2em] hover:bg-neutral-100"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="font-serif text-2xl">Your bag is empty.</p>
        <Link
          href="/shop"
          className="mt-6 inline-block bg-black px-8 py-3 text-xs uppercase tracking-widest text-white"
        >
          Shop Sarees
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-10 lg:grid-cols-12">
      {/* Left: Delivery & Payment */}
      <div className="space-y-8 lg:col-span-7">
        <section className="space-y-4">
          <h2 className="font-serif text-2xl border-b border-neutral-200 pb-2">1. Delivery Details</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-600 mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-neutral-300 px-3.5 py-2.5 text-sm outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-600 mb-1.5">
                Phone / WhatsApp *
              </label>
              <input
                type="tel"
                required
                placeholder="077..."
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border border-neutral-300 px-3.5 py-2.5 text-sm outline-none focus:border-black"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-neutral-600 mb-1.5">
              Email (optional)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-neutral-300 px-3.5 py-2.5 text-sm outline-none focus:border-black"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-neutral-600 mb-1.5">
              Delivery Address *
            </label>
            <textarea
              required
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full border border-neutral-300 px-3.5 py-2.5 text-sm outline-none focus:border-black"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-neutral-600 mb-1.5">
              District *
            </label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full border border-neutral-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-black"
            >
              {SRI_LANKA_DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-2.5 text-xs text-neutral-700 cursor-pointer">
            <input
              type="checkbox"
              checked={optInWhatsApp}
              onChange={(e) => setOptInWhatsApp(e.target.checked)}
              className="accent-black"
            />
            <span>Send me order updates and new arrival edits on WhatsApp</span>
          </label>
        </section>

        <section className="space-y-4">
          <h2 className="font-serif text-2xl border-b border-neutral-200 pb-2">2. Payment Method</h2>

          <div className="space-y-3">
            <label className="flex items-start gap-3 border border-neutral-300 p-4 cursor-pointer has-[:checked]:border-black has-[:checked]:bg-neutral-50">
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === "BANK_TRANSFER"}
                onChange={() => setPaymentMethod("BANK_TRANSFER")}
                className="mt-1 accent-black"
              />
              <div className="flex-1">
                <span className="text-sm font-medium">Bank Transfer (Upload Slip)</span>
                <div className="mt-2 space-y-1 text-xs text-neutral-600">
                  <p>Bank: {settings.bankDetails.bankName} ({settings.bankDetails.branch})</p>
                  <p>Account Name: {settings.bankDetails.accountName}</p>
                  <p>Account Number: {settings.bankDetails.accountNumber}</p>
                </div>
                {paymentMethod === "BANK_TRANSFER" && (
                  <div className="mt-3">
                    <label className="inline-flex cursor-pointer items-center gap-2 border border-black bg-white px-4 py-2 text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-colors">
                      <Upload className="h-3.5 w-3.5" />
                      {uploadingSlip ? "Uploading..." : slipUrl ? "Slip Uploaded (Replace)" : "Upload Transfer Slip *"}
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleSlipUpload}
                        className="hidden"
                      />
                    </label>
                    {slipUrl && (
                      <p className="mt-1.5 text-xs text-neutral-700">Slip attached successfully.</p>
                    )}
                  </div>
                )}
              </div>
            </label>

            {settings.codEnabled && (
              <label className="flex items-start gap-3 border border-neutral-300 p-4 cursor-pointer has-[:checked]:border-black has-[:checked]:bg-neutral-50">
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "COD"}
                  onChange={() => setPaymentMethod("COD")}
                  className="mt-1 accent-black"
                />
                <div>
                  <span className="text-sm font-medium">Cash on Delivery</span>
                  <p className="mt-0.5 text-xs text-neutral-600">
                    Pay in cash to the courier upon delivery anywhere in Sri Lanka.
                  </p>
                </div>
              </label>
            )}

            {settings.cardLinkEnabled && (
              <label className="flex items-start gap-3 border border-neutral-300 p-4 cursor-pointer has-[:checked]:border-black has-[:checked]:bg-neutral-50">
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "CARD_LINK"}
                  onChange={() => setPaymentMethod("CARD_LINK")}
                  className="mt-1 accent-black"
                />
                <div>
                  <span className="text-sm font-medium">Card / Bank Payment Link</span>
                  <p className="mt-0.5 text-xs text-neutral-600">{settings.cardLinkNote}</p>
                </div>
              </label>
            )}
          </div>
        </section>

        {error && (
          <div className="border border-black bg-neutral-100 p-3 text-xs font-medium text-black">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || uploadingSlip}
          className="w-full bg-black py-4 text-xs font-medium uppercase tracking-[0.2em] text-white hover:bg-neutral-800 disabled:opacity-50"
        >
          {submitting ? "Placing Order..." : `Place Order · ${formatLkr(total)}`}
        </button>
      </div>

      {/* Right: Summary & Policies */}
      <aside className="lg:col-span-5">
        <div className="border border-neutral-200 bg-neutral-50 p-6 space-y-5">
          <h2 className="font-serif text-2xl">Order Summary</h2>
          <ul className="divide-y divide-neutral-200">
            {cart.map((item) => (
              <li key={item.productId} className="flex justify-between py-3 text-sm">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-xs text-neutral-500">
                    {item.sku} &times; {item.quantity}
                  </p>
                </div>
                <span>{formatLkr(item.priceLkr * item.quantity)}</span>
              </li>
            ))}
          </ul>

          <div className="space-y-2 border-t border-neutral-200 pt-4 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-600">Subtotal</span>
              <span>{formatLkr(cartSubtotal)}</span>
            </div>
            {bundleDiscount > 0 && (
              <div className="flex justify-between">
                <span className="text-neutral-600">Bundle Discount</span>
                <span>− {formatLkr(bundleDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-neutral-600">Island-Wide Delivery</span>
              <span>{deliveryFee === 0 ? "Free" : formatLkr(deliveryFee)}</span>
            </div>
            <div className="flex justify-between border-t border-neutral-200 pt-3 text-base font-semibold">
              <span>Total (VAT-exclusive)</span>
              <span>{formatLkr(total)}</span>
            </div>
          </div>

          <div className="border-t border-neutral-200 pt-4 text-xs leading-relaxed text-neutral-600 space-y-1.5">
            <p>
              <strong className="text-black">Delivery:</strong>{" "}
              {deliveryFee === 0
                ? "Complimentary island-wide courier delivery."
                : `${formatLkr(settings.deliveryFeeLkr)} flat rate (free above ${formatLkr(
                    settings.freeDeliveryThresholdLkr
                  )}).`}
            </p>
            <p>
              <strong className="text-black">Exchange Policy:</strong> Exchange within 7 days if unworn
              and tagged; full refund for defects.
            </p>
          </div>
        </div>
      </aside>
    </form>
  );
}
