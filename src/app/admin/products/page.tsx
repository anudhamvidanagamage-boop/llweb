import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminProductsClient } from "@/components/AdminProductsClient";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");

  const products = await prisma.product.findMany({
    include: { images: { orderBy: { sortOrder: "asc" } } },
    orderBy: { createdAt: "desc" },
  });

  return <AdminProductsClient initialProducts={JSON.parse(JSON.stringify(products))} />;
}
