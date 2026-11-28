import { NextResponse } from "next/server";
import { clearSessionCookie, verifySameOrigin } from "@/lib/auth";

export async function POST(request: Request) {
  if (!verifySameOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}
