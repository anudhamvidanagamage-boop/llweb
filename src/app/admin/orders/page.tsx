import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStoreSettings } from "@/lib/settings";
import { AdminOrdersClient } from "@/components/AdminOrdersClient";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");

  const [orders, settings] = await Promise.all([
    prisma.order.findMany({
      include: { items: true, customer: true },
      orderBy: { createdAt: "desc" },
    }),
    getStoreSettings(),
  ]);

  return (
    <AdminOrdersClient
      initialOrders={JSON.parse(JSON.stringify(orders))}
      storeAddress={settings.address}
      storePhone={settings.phoneDisplay}
    />
  );
}
