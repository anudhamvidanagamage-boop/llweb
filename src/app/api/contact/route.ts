import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body.name || "").trim();
    const phone = String(body.phone || "").trim();
    const message = String(body.message || "").trim();

    if (!name || !phone || !message) {
      return NextResponse.json({ error: "Please fill in your name, phone, and message." }, { status: 400 });
    }

    await prisma.auditLog.create({
      data: {
        action: "CONTACT_ENQUIRY",
        entityType: "Enquiry",
        detailsJson: JSON.stringify({ name, phone, email: body.email || "", message }),
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not send enquiry." }, { status: 500 });
  }
}
