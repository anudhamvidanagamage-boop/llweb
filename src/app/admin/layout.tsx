import type { Metadata } from "next";
import { getSessionUser } from "@/lib/auth";
import { AdminShell } from "@/components/AdminShell";

export const metadata: Metadata = {
  title: "Admin Portal | Luxe Loomie",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();

  if (!user) {
    return <div className="min-h-screen bg-neutral-50 text-black">{children}</div>;
  }

  return <AdminShell user={user}>{children}</AdminShell>;
}
