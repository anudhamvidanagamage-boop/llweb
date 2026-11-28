"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import type { StoreSettings } from "@/lib/settings";

interface AuditEntry {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  detailsJson: string | null;
  createdAt: string;
  user: { name: string; email: string } | null;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export function AdminSettingsClient({
  initialSettings,
  users,
  auditLogs,
}: {
  initialSettings: StoreSettings;
  users: AdminUser[];
  auditLogs: AuditEntry[];
}) {
  const [whatsappNumber, setWhatsappNumber] = useState(initialSettings.whatsappNumber);
  const [phoneDisplay, setPhoneDisplay] = useState(initialSettings.phoneDisplay);
  const [email, setEmail] = useState(initialSettings.email);
  const [address, setAddress] = useState(initialSettings.address);
  const [openingHours, setOpeningHours] = useState(initialSettings.openingHours);
  const [deliveryFeeLkr, setDeliveryFeeLkr] = useState(initialSettings.deliveryFeeLkr);
  const [freeDeliveryThresholdLkr, setFreeDeliveryThresholdLkr] = useState(
    initialSettings.freeDeliveryThresholdLkr
  );
  const [codEnabled, setCodEnabled] = useState(initialSettings.codEnabled);
  const [bankDetails, setBankDetails] = useState(initialSettings.bankDetails);
  const [bundleRule, setBundleRule] = useState(initialSettings.bundleRule);
  const [lowStockThreshold, setLowStockThreshold] = useState(initialSettings.lowStockThreshold);

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  // New user form
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [newRole, setNewRole] = useState("STAFF");
  const [userMsg, setUserMsg] = useState("");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          whatsappNumber,
          phoneDisplay,
          email,
          address,
          openingHours,
          deliveryFeeLkr,
          freeDeliveryThresholdLkr,
          codEnabled,
          bankDetails,
          bundleRule,
          lowStockThreshold,
        }),
      });
      if (!res.ok) throw new Error();
      setMsg("Settings saved successfully.");
    } catch {
      setMsg("Could not save settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateUser = async () => {
    setUserMsg("");
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, email: newEmail, password: newPwd, role: newRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setUserMsg(`User ${data.user.email} created as ${data.user.role}.`);
      setNewName("");
      setNewEmail("");
      setNewPwd("");
    } catch (err) {
      setUserMsg(err instanceof Error ? err.message : "Could not create user.");
    }
  };

  return (
    <div className="max-w-5xl space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl">Settings &amp; Audit</h1>
          <p className="text-xs text-neutral-500">
            Manage store contact, delivery, payment, bundle rules, and admin users. All changes are logged.
          </p>
        </div>
      </div>

      {/* Store Settings Form */}
      <form onSubmit={handleSave} className="space-y-8">
        <section className="border border-neutral-200 bg-white p-6 space-y-4 text-sm">
          <h2 className="font-serif text-2xl border-b border-neutral-200 pb-2">Contact &amp; Location</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-1">
                WhatsApp Number
              </label>
              <input
                type="text"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className="w-full border border-neutral-300 px-3 py-2 outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-1">
                Display Phone
              </label>
              <input
                type="text"
                value={phoneDisplay}
                onChange={(e) => setPhoneDisplay(e.target.value)}
                className="w-full border border-neutral-300 px-3 py-2 outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-neutral-300 px-3 py-2 outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-1">
                Opening Hours
              </label>
              <input
                type="text"
                value={openingHours}
                onChange={(e) => setOpeningHours(e.target.value)}
                className="w-full border border-neutral-300 px-3 py-2 outline-none focus:border-black"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-1">Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full border border-neutral-300 px-3 py-2 outline-none focus:border-black"
            />
          </div>
        </section>

        <section className="border border-neutral-200 bg-white p-6 space-y-4 text-sm">
          <h2 className="font-serif text-2xl border-b border-neutral-200 pb-2">Delivery &amp; Payment</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-1">
                Delivery Fee (LKR)
              </label>
              <input
                type="number"
                value={deliveryFeeLkr}
                onChange={(e) => setDeliveryFeeLkr(Number(e.target.value))}
                className="w-full border border-neutral-300 px-3 py-2 outline-none focus:border-black"
              />
              <p className="mt-1 text-xs text-neutral-500">Set to 0 for free delivery.</p>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-1">
                Free Delivery Above (LKR)
              </label>
              <input
                type="number"
                value={freeDeliveryThresholdLkr}
                onChange={(e) => setFreeDeliveryThresholdLkr(Number(e.target.value))}
                className="w-full border border-neutral-300 px-3 py-2 outline-none focus:border-black"
              />
            </div>
            <div className="flex flex-col gap-3 pt-5">
              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={codEnabled}
                  onChange={(e) => setCodEnabled(e.target.checked)}
                  className="accent-black"
                />
                <span>Cash on Delivery enabled</span>
              </label>
              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-1">
                  Low-Stock Threshold
                </label>
                <input
                  type="number"
                  value={lowStockThreshold}
                  onChange={(e) => setLowStockThreshold(Number(e.target.value))}
                  className="w-full border border-neutral-300 px-3 py-2 outline-none focus:border-black"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2">
            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-1">
                Bank Name
              </label>
              <input
                type="text"
                value={bankDetails.bankName}
                onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                className="w-full border border-neutral-300 px-3 py-2 outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-1">
                Branch
              </label>
              <input
                type="text"
                value={bankDetails.branch}
                onChange={(e) => setBankDetails({ ...bankDetails, branch: e.target.value })}
                className="w-full border border-neutral-300 px-3 py-2 outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-1">
                Account Name
              </label>
              <input
                type="text"
                value={bankDetails.accountName}
                onChange={(e) => setBankDetails({ ...bankDetails, accountName: e.target.value })}
                className="w-full border border-neutral-300 px-3 py-2 outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-1">
                Account Number
              </label>
              <input
                type="text"
                value={bankDetails.accountNumber}
                onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                className="w-full border border-neutral-300 px-3 py-2 outline-none focus:border-black"
              />
            </div>
          </div>
        </section>

        <section className="border border-neutral-200 bg-white p-6 space-y-4 text-sm">
          <h2 className="font-serif text-2xl border-b border-neutral-200 pb-2">Bundle Rule</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <label className="flex items-center gap-2 text-xs cursor-pointer pt-5">
              <input
                type="checkbox"
                checked={bundleRule.enabled}
                onChange={(e) => setBundleRule({ ...bundleRule, enabled: e.target.checked })}
                className="accent-black"
              />
              <span>Bundle Pricing Enabled</span>
            </label>
            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-1">
                Min Qty for Bundle
              </label>
              <input
                type="number"
                value={bundleRule.minQty}
                onChange={(e) => setBundleRule({ ...bundleRule, minQty: Number(e.target.value) })}
                className="w-full border border-neutral-300 px-3 py-2 outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-1">
                Discount per Saree (LKR)
              </label>
              <input
                type="number"
                value={bundleRule.discountPerSareeLkr}
                onChange={(e) =>
                  setBundleRule({ ...bundleRule, discountPerSareeLkr: Number(e.target.value) })
                }
                className="w-full border border-neutral-300 px-3 py-2 outline-none focus:border-black"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-1">
              Display Label
            </label>
            <input
              type="text"
              value={bundleRule.label}
              onChange={(e) => setBundleRule({ ...bundleRule, label: e.target.value })}
              className="w-full border border-neutral-300 px-3 py-2 outline-none focus:border-black"
            />
          </div>
        </section>

        {msg && <p className="border border-black bg-white p-3 text-xs">{msg}</p>}

        <button
          type="submit"
          disabled={saving}
          className="bg-black px-8 py-3 text-xs uppercase tracking-[0.2em] text-white hover:bg-neutral-800 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save All Settings"}
        </button>
      </form>

      {/* Admin Users */}
      <section className="border border-neutral-200 bg-white p-6 space-y-4 text-sm">
        <h2 className="font-serif text-2xl border-b border-neutral-200 pb-2">Admin Users</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="border-b border-neutral-200 bg-neutral-50 uppercase tracking-wider text-neutral-500">
              <tr>
                <th className="p-2.5">Name</th>
                <th className="p-2.5">Email</th>
                <th className="p-2.5">Role</th>
                <th className="p-2.5">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="p-2.5 font-medium">{u.name}</td>
                  <td className="p-2.5">{u.email}</td>
                  <td className="p-2.5">{u.role}</td>
                  <td className="p-2.5">{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="border-t border-neutral-200 pt-4 space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider">Create New Admin User</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Full name"
              className="border border-neutral-300 px-3 py-2 text-xs outline-none focus:border-black"
            />
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="Email"
              className="border border-neutral-300 px-3 py-2 text-xs outline-none focus:border-black"
            />
            <input
              type="password"
              value={newPwd}
              onChange={(e) => setNewPwd(e.target.value)}
              placeholder="Password (8+ chars)"
              className="border border-neutral-300 px-3 py-2 text-xs outline-none focus:border-black"
            />
            <div className="flex gap-2">
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="border border-neutral-300 bg-white px-3 py-2 text-xs outline-none focus:border-black"
              >
                <option value="STAFF">Staff</option>
                <option value="OWNER">Owner</option>
              </select>
              <button
                type="button"
                onClick={handleCreateUser}
                className="inline-flex items-center gap-1 bg-black px-4 py-2 text-xs uppercase tracking-widest text-white"
              >
                <Plus className="h-3.5 w-3.5" /> Add
              </button>
            </div>
          </div>
          {userMsg && <p className="text-xs">{userMsg}</p>}
        </div>
      </section>

      {/* Audit Log */}
      <section className="border border-neutral-200 bg-white p-6 space-y-4">
        <h2 className="font-serif text-2xl border-b border-neutral-200 pb-2">Audit Log (Last 50)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="border-b border-neutral-200 bg-neutral-50 uppercase tracking-wider text-neutral-500">
              <tr>
                <th className="p-2.5">When</th>
                <th className="p-2.5">Who</th>
                <th className="p-2.5">Action</th>
                <th className="p-2.5">Entity</th>
                <th className="p-2.5">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-neutral-500">
                    No audit entries yet.
                  </td>
                </tr>
              ) : (
                auditLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="p-2.5 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="p-2.5">{log.user?.name || "System"}</td>
                    <td className="p-2.5 font-medium">{log.action}</td>
                    <td className="p-2.5">
                      {log.entityType}
                      {log.entityId ? ` (${log.entityId.slice(0, 8)}...)` : ""}
                    </td>
                    <td className="p-2.5 max-w-xs truncate text-neutral-500">
                      {log.detailsJson || "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
