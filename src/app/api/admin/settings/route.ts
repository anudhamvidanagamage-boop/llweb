import { NextResponse } from "next/server";
import { logAudit, requireAdmin, verifySameOrigin } from "@/lib/auth";
import { StoreSettings, updateStoreSetting } from "@/lib/settings";

export async function PUT(request: Request) {
  if (!verifySameOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }
  let session;
  try {
    session = await requireAdmin("OWNER");
  } catch (err) {
    const code = err instanceof Error && err.message === "FORBIDDEN" ? 403 : 401;
    return NextResponse.json({ error: "Owner access required" }, { status: code });
  }

  try {
    const updates = (await request.json()) as Partial<StoreSettings>;
    for (const [key, val] of Object.entries(updates)) {
      await updateStoreSetting(key as keyof StoreSettings, val as never);
    }

    await logAudit({
      userId: session.userId,
      action: "SETTINGS_UPDATE",
      entityType: "Setting",
      details: { keys: Object.keys(updates) },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not save settings" }, { status: 400 });
  }
}
