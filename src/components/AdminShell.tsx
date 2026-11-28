"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Package,
  ShoppingCart,
  Users,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
} from "lucide-react";

export function AdminShell({
  user,
  children,
}: {
  user: { name: string; email: string; role: "OWNER" | "STAFF" };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: BarChart3, ownerOnly: false },
    { href: "/admin/products", label: "Products", icon: Package, ownerOnly: false },
    { href: "/admin/orders", label: "Orders", icon: ShoppingCart, ownerOnly: false },
    { href: "/admin/customers", label: "Customers", icon: Users, ownerOnly: false },
    { href: "/admin/content", label: "Content & Banners", icon: FileText, ownerOnly: true },
    { href: "/admin/settings", label: "Settings & Audit", icon: Settings, ownerOnly: true },
  ].filter((item) => !item.ownerOnly || user.role === "OWNER");

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  const NavContent = () => (
    <div className="flex h-full flex-col justify-between p-5">
      <div>
        <div className="border-b border-neutral-200 pb-4">
          <span className="font-serif text-xl tracking-widest">LUXE LOOMIE</span>
          <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-neutral-500">
            Admin Portal &middot; {user.role}
          </p>
        </div>

        <nav className="mt-6 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === "/admin" ? pathname === "/admin" : pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 text-xs uppercase tracking-widest transition-colors ${
                  active
                    ? "bg-black text-white"
                    : "text-neutral-700 hover:bg-neutral-100 hover:text-black"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="space-y-3 border-t border-neutral-200 pt-4 text-xs">
        <div>
          <p className="font-medium text-black">{user.name}</p>
          <p className="text-neutral-500 truncate">{user.email}</p>
        </div>
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2 text-neutral-600 hover:text-black"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          View Storefront
        </Link>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2 border border-neutral-300 px-3 py-2 text-xs uppercase tracking-widest hover:border-black"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-50 text-black flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <div className="flex items-center justify-between border-b border-neutral-200 bg-white px-4 py-3 lg:hidden no-print">
        <span className="font-serif text-lg tracking-widest">LUXE LOOMIE ADMIN</span>
        <button onClick={() => setOpen(true)} aria-label="Open admin menu" className="p-1">
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 border-r border-neutral-200 bg-white no-print">
        <div className="sticky top-0 h-screen">
          <NavContent />
        </div>
      </aside>

      {/* Mobile Drawer */}
      {open && (
        <div className="fixed inset-0 z-50 flex bg-black/40 lg:hidden no-print">
          <div className="relative h-full w-64 bg-white">
            <button
              onClick={() => setOpen(false)}
              aria-label="Close admin menu"
              className="absolute right-3 top-3 p-1"
            >
              <X className="h-5 w-5" />
            </button>
            <NavContent />
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">{children}</main>
    </div>
  );
}
