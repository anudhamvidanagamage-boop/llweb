import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ALLOWED_TYPES = new Set([
  "PAGE_VIEW",
  "PRODUCT_VIEW",
  "ADD_TO_CART",
  "CHECKOUT_START",
  "ORDER_PAID",
  "WHATSAPP_CLICK",
  "WISHLIST_ADD",
]);

function detectDevice(ua: string): string {
  const lower = ua.toLowerCase();
  if (/ipad|tablet|playbook|silk/.test(lower)) return "tablet";
  if (/mobile|iphone|ipod|android/.test(lower)) return "mobile";
  return "desktop";
}

function detectSource(referrer: string, utmSource?: string): string {
  if (utmSource) {
    const s = utmSource.toLowerCase();
    if (s.includes("fb") || s.includes("facebook")) return "facebook";
    if (s.includes("ig") || s.includes("instagram")) return "instagram";
    if (s.includes("tiktok")) return "tiktok";
    if (s.includes("whatsapp") || s.includes("wa")) return "whatsapp";
    if (s.includes("google") || s.includes("search")) return "search";
  }
  const ref = referrer.toLowerCase();
  if (ref.includes("facebook.com") || ref.includes("fb.com")) return "facebook";
  if (ref.includes("instagram.com")) return "instagram";
  if (ref.includes("tiktok.com")) return "tiktok";
  if (ref.includes("whatsapp.com") || ref.includes("wa.me")) return "whatsapp";
  if (ref.includes("google.") || ref.includes("bing.") || ref.includes("yahoo.")) return "search";
  return "direct";
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const type = String(body.type || "");
    if (!ALLOWED_TYPES.has(type)) {
      return NextResponse.json({ error: "Invalid event type" }, { status: 400 });
    }

    const ua = request.headers.get("user-agent") || "";
    const referrer = String(body.referrer || request.headers.get("referer") || "");
    const path = String(body.path || "/").slice(0, 200);
    const productId = body.productId ? String(body.productId) : null;
    const sessionId = body.sessionId ? String(body.sessionId).slice(0, 64) : null;

    await prisma.event.create({
      data: {
        type,
        path,
        productId,
        source: detectSource(referrer, body.utmSource),
        device: detectDevice(ua),
        sessionId,
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
