import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getStoreSettings } from "@/lib/settings";
import { AdminContentClient } from "@/components/AdminContentClient";

export const dynamic = "force-dynamic";

export default async function AdminContentPage() {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");
  if (user.role !== "OWNER") redirect("/admin");

  const settings = await getStoreSettings();
  return <AdminContentClient initialSettings={settings} />;
}
