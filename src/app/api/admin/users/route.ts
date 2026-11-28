import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, logAudit, requireAdmin, verifySameOrigin } from "@/lib/auth";

export async function POST(request: Request) {
  if (!verifySameOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }
  let session;
  try {
    session = await requireAdmin("OWNER");
  } catch {
    return NextResponse.json({ error: "Owner access required" }, { status: 403 });
  }

  try {
    const { name, email, password, role } = await request.json();
    if (!name?.trim() || !email?.trim() || !password || password.length < 8) {
      return NextResponse.json(
        { error: "Name, email, and password (min 8 chars) are required." },
        { status: 400 }
      );
    }

    const created = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        passwordHash: hashPassword(password),
        role: role === "OWNER" ? "OWNER" : "STAFF",
      },
      select: { id: true, name: true, email: true, role: true },
    });

    await logAudit({
      userId: session.userId,
      action: "ADMIN_USER_CREATE",
      entityType: "User",
      entityId: created.id,
      details: { email: created.email, role: created.role },
    });

    return NextResponse.json({ user: created }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Could not create user (email may already exist)." }, { status: 400 });
  }
}
