import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logAudit, requireAdmin, verifySameOrigin } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!verifySameOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }
  let session;
  try {
    session = await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  const existing = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!existing) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const nextStatus = body.status ? String(body.status) : existing.status;

  const updated = await prisma.$transaction(async (tx) => {
    // Auto-restore stock if transitioning into CANCELLED or RETURNED from a non-cancelled state
    const wasCancelled = existing.status === "CANCELLED" || existing.status === "RETURNED";
    const willCancel = nextStatus === "CANCELLED" || nextStatus === "RETURNED";
    if (!wasCancelled && willCancel) {
      for (const item of existing.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { increment: item.quantity },
            status: "ACTIVE",
          },
        });
      }
    }

    return tx.order.update({
      where: { id },
      data: {
        status: nextStatus,
        slipStatus: body.slipStatus ?? existing.slipStatus,
        courier: body.courier !== undefined ? String(body.courier) : existing.courier,
        trackingNumber:
          body.trackingNumber !== undefined ? String(body.trackingNumber) : existing.trackingNumber,
        internalNotes:
          body.internalNotes !== undefined ? String(body.internalNotes) : existing.internalNotes,
      },
      include: { items: true, customer: true },
    });
  });

  await logAudit({
    userId: session.userId,
    action: "ORDER_UPDATE",
    entityType: "Order",
    entityId: id,
    details: {
      fromStatus: existing.status,
      toStatus: updated.status,
      slipStatus: updated.slipStatus,
    },
  });

  return NextResponse.json({ order: updated });
}
