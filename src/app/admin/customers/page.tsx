import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatLkr } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");

  const customers = await prisma.customer.findMany({
    include: { orders: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl">Customers</h1>
        <p className="text-xs text-neutral-500">
          Customer directory with order history, total spend, repeat buyer status, and opt-ins.
        </p>
      </div>

      <div className="border border-neutral-200 bg-white overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-neutral-200 bg-neutral-50 uppercase tracking-wider text-neutral-500">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Phone</th>
              <th className="p-3">District</th>
              <th className="p-3">Orders</th>
              <th className="p-3">Total Spend</th>
              <th className="p-3">Repeat</th>
              <th className="p-3">Opt-in</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {customers.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-neutral-500">
                  No customers recorded yet.
                </td>
              </tr>
            ) : (
              customers.map((c) => {
                const validOrders = c.orders.filter(
                  (o) => o.status !== "CANCELLED" && o.status !== "RETURNED"
                );
                const spend = validOrders.reduce((s, o) => s + o.totalLkr, 0);
                const isRepeat = validOrders.length >= 2;
                return (
                  <tr key={c.id} className="hover:bg-neutral-50">
                    <td className="p-3 font-medium">{c.name}</td>
                    <td className="p-3">{c.phone}</td>
                    <td className="p-3">{c.district || "—"}</td>
                    <td className="p-3">{validOrders.length}</td>
                    <td className="p-3 font-medium">{formatLkr(spend)}</td>
                    <td className="p-3">
                      {isRepeat ? (
                        <span className="bg-black px-2 py-0.5 text-[10px] uppercase tracking-wider text-white">
                          Repeat
                        </span>
                      ) : (
                        <span className="text-neutral-400">New</span>
                      )}
                    </td>
                    <td className="p-3">
                      {c.optInWhatsApp ? "WhatsApp " : ""}
                      {c.optInEmail ? "Email" : ""}
                      {!c.optInWhatsApp && !c.optInEmail ? "None" : ""}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
