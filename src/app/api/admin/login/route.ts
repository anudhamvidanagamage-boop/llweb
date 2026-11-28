import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  checkLoginRateLimit,
  createSessionCookie,
  logAudit,
  verifyPassword,
  verifySameOrigin,
} from "@/lib/auth";

export async function POST(request: Request) {
  if (!verifySameOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  const ip = request.headers.get("x-forwarded-for") || "local";
  if (!checkLoginRateLimit(ip)) {
    return NextResponse.json(
      { error: "Too many login attempts. Please try again in 15 minutes." },
      { status: 429 }
    );
  }

  try {
    const { email, password } = await request.json();
    const user = await prisma.user.findUnique({
      where: { email: String(email || "").trim().toLowerCase() },
    });

    if (!user || !verifyPassword(String(password || ""), user.passwordHash)) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    await createSessionCookie(user);
    await logAudit({
      userId: user.id,
      action: "ADMIN_LOGIN",
      entityType: "User",
      entityId: user.id,
    });

    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch {
    return NextResponse.json({ error: "Login failed." }, { status: 500 });
  }
}
