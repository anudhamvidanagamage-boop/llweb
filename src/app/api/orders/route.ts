import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStoreSettings } from "@/lib/settings";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      phone,
      email,
      address,
      district,
      paymentMethod,
      slipUrl,
      optInWhatsApp,
      items,
    } = body as {
      name: string;
      phone: string;
      email?: string;
      address: string;
      district: string;
      paymentMethod: "BANK_TRANSFER" | "COD" | "CARD_LINK";
      slipUrl?: string;
      optInWhatsApp?: boolean;
      items: Array<{ productId: string; quantity: number }>;
    };

    if (!name?.trim() || !phone?.trim() || !address?.trim() || !district?.trim()) {
      return NextResponse.json({ error: "Please complete all delivery fields." }, { status: 400 });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Your bag is empty." }, { status: 400 });
    }

    const settings = await getStoreSettings();
    if (paymentMethod === "COD" && !settings.codEnabled) {
      return NextResponse.json({ error: "Cash on delivery is currently unavailable." }, { status: 400 });
    }
    if (paymentMethod === "BANK_TRANSFER" && !slipUrl) {
      return NextResponse.json({ error: "Please upload your bank transfer slip." }, { status: 400 });
    }

    const orderResult = await prisma.$transaction(async (tx) => {
      let subtotalLkr = 0;
      let totalQty = 0;
      const lineItems: Array<{
        productId: string;
        productName: string;
        sku: string;
        unitPriceLkr: number;
        quantity: number;
      }> = [];

      for (const reqItem of items) {
        const product = await tx.product.findUnique({ where: { id: reqItem.productId } });
        if (!product || product.deletedAt) {
          throw new Error("A selected saree is no longer available.");
        }
        const qty = Math.max(1, Math.floor(Number(reqItem.quantity) || 1));
        if (product.stock < qty) {
          throw new Error(`Insufficient stock for ${product.name}. Only ${product.stock} left.`);
        }
        subtotalLkr += product.priceLkr * qty;
        totalQty += qty;
        lineItems.push({
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          unitPriceLkr: product.priceLkr,
          quantity: qty,
        });

        const newStock = product.stock - qty;
        await tx.product.update({
          where: { id: product.id },
          data: {
            stock: newStock,
            status: newStock <= 0 ? "SOLD_OUT" : product.status,
          },
        });
      }

      const bundleDiscountLkr =
        settings.bundleRule.enabled && totalQty >= settings.bundleRule.minQty
          ? totalQty * settings.bundleRule.discountPerSareeLkr
          : 0;

      const afterDiscount = Math.max(0, subtotalLkr - bundleDiscountLkr);
      const deliveryFeeLkr =
        settings.deliveryFeeLkr === 0 ||
        (settings.freeDeliveryThresholdLkr > 0 && afterDiscount >= settings.freeDeliveryThresholdLkr)
          ? 0
          : settings.deliveryFeeLkr;

      const totalLkr = afterDiscount + deliveryFeeLkr;

      const customer = await tx.customer.upsert({
        where: { phone: phone.trim() },
        update: {
          name: name.trim(),
          email: email?.trim() || undefined,
          address: address.trim(),
          district: district.trim(),
          optInWhatsApp: Boolean(optInWhatsApp),
        },
        create: {
          name: name.trim(),
          phone: phone.trim(),
          email: email?.trim() || null,
          address: address.trim(),
          district: district.trim(),
          optInWhatsApp: Boolean(optInWhatsApp),
        },
      });

      const orderNumber = `LL-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

      const createdOrder = await tx.order.create({
        data: {
          orderNumber,
          customerId: customer.id,
          status: paymentMethod === "BANK_TRANSFER" ? "PAYMENT_PENDING" : "NEW",
          paymentMethod,
          slipUrl: slipUrl || null,
          slipStatus: paymentMethod === "BANK_TRANSFER" ? "PENDING" : null,
          subtotalLkr,
          deliveryFeeLkr,
          bundleDiscountLkr,
          totalLkr,
          shippingName: name.trim(),
          shippingPhone: phone.trim(),
          shippingAddress: address.trim(),
          shippingDistrict: district.trim(),
          items: {
            create: lineItems,
          },
        },
        include: { items: true },
      });

      return createdOrder;
    });

    return NextResponse.json({ order: orderResult }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not place order.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
