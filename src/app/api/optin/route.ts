import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body.name || "Guest").trim();
    const phone = String(body.phone || "").trim();
    const email = body.email ? String(body.email).trim() : null;

    if (!phone && !email) {
      return NextResponse.json(
        { error: "Please provide a WhatsApp number or email address." },
        { status: 400 }
      );
    }

    const lookupPhone = phone || `email:${email}`;
    await prisma.customer.upsert({
      where: { phone: lookupPhone },
      update: {
        name: name || undefined,
        email: email || undefined,
        optInWhatsApp: Boolean(phone),
        optInEmail: Boolean(email),
      },
      create: {
        name: name || "Subscriber",
        phone: lookupPhone,
        email,
        optInWhatsApp: Boolean(phone),
        optInEmail: Boolean(email),
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not save your preference." }, { status: 500 });
  }
}
