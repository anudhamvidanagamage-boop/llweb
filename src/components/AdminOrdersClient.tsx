"use client";

import React, { useMemo, useState } from "react";
import { Download, MessageCircle, Printer, X } from "lucide-react";
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  OrderStatus,
  buildWhatsAppUrl,
  formatLkr,
} from "@/lib/constants";

interface AdminOrder {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentMethod: string;
  slipUrl: string | null;
  slipStatus: string | null;
  subtotalLkr: number;
  deliveryFeeLkr: number;
  bundleDiscountLkr: number;
  totalLkr: number;
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingDistrict: string;
  courier: string | null;
  trackingNumber: string | null;
  internalNotes: string | null;
  createdAt: string;
  items: Array<{
    id: string;
    productName: string;
    sku: string;
    unitPriceLkr: number;
    quantity: number;
  }>;
}

export function AdminOrdersClient({
  initialOrders,
  storeAddress,
  storePhone,
}: {
  initialOrders: AdminOrder[];
  storeAddress: string;
  storePhone: string;
}) {
  const [orders, setOrders] = useState<AdminOrder[]>(initialOrders);
  const [statusFilter, setStatusFilter] = useState("");
  const [selected, setSelected] = useState<AdminOrder | null>(null);
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    return orders.filter((o) => !statusFilter || o.status === statusFilter);
  }, [orders, statusFilter]);

  const updateOrder = async (id: string, patch: Record<string, unknown>) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = await res.json();
      if (res.ok && data.order) {
        setOrders((prev) => prev.map((o) => (o.id === id ? data.order : o)));
        if (selected?.id === id) setSelected(data.order);
      }
    } finally {
      setSaving(false);
    }
  };

  const exportCsv = () => {
    const header = "OrderNumber,Date,Customer,Phone,District,Payment,Status,TotalLKR\n";
    const rows = filtered
      .map(
        (o) =>
          `"${o.orderNumber}","${o.createdAt.slice(0, 10)}","${o.shippingName}","${o.shippingPhone}","${o.shippingDistrict}","${o.paymentMethod}","${o.status}",${o.totalLkr}`
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `luxe-loomie-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const waTemplates = (o: AdminOrder) => [
    {
      label: "Order Received",
      text: `Hello ${o.shippingName}, thank you for your Luxe Loomie order ${o.orderNumber} (${formatLkr(
        o.totalLkr
      )}). We are reviewing it now and will update you shortly.`,
    },
    {
      label: "Payment Confirmed",
      text: `Hello ${o.shippingName}, we have confirmed your payment for order ${o.orderNumber}. Your saree is being prepared for dispatch within 24-48 hours.`,
    },
    {
      label: "Dispatched + Tracking",
      text: `Hello ${o.shippingName}, your Luxe Loomie order ${o.orderNumber} has been dispatched via ${
        o.courier || "our courier partner"
      }${o.trackingNumber ? ` (Tracking: ${o.trackingNumber})` : ""}.`,
    },
    {
      label: "Delivered + Care Tips",
      text: `Hello ${o.shippingName}, we hope you love your Luxe Loomie saree (${o.orderNumber})! Care tip: gentle cold hand wash separately or dry clean, and dry in shade. Thank you for choosing Sri Lankan handloom.`,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between no-print">
        <div>
          <h1 className="font-serif text-3xl">Orders</h1>
          <p className="text-xs text-neutral-500">
            Verify bank slips, update dispatch tracking, and message customers on WhatsApp.
          </p>
        </div>
        <button
          onClick={exportCsv}
          className="inline-flex items-center gap-2 border border-black bg-white px-4 py-2.5 text-xs uppercase tracking-widest hover:bg-neutral-100"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      {/* Status Filter */}
      <div className="flex flex-wrap gap-2 no-print">
        <button
          onClick={() => setStatusFilter("")}
          className={`border px-3 py-1.5 text-xs uppercase tracking-wider ${
            statusFilter === "" ? "border-black bg-black text-white" : "border-neutral-300 bg-white"
          }`}
        >
          All ({orders.length})
        </button>
        {ORDER_STATUSES.map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`border px-3 py-1.5 text-xs uppercase tracking-wider ${
              statusFilter === st ? "border-black bg-black text-white" : "border-neutral-300 bg-white"
            }`}
          >
            {ORDER_STATUS_LABELS[st]}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="border border-neutral-200 bg-white overflow-x-auto no-print">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-neutral-200 bg-neutral-50 uppercase tracking-wider text-neutral-500">
            <tr>
              <th className="p-3">Order</th>
              <th className="p-3">Customer</th>
              <th className="p-3">District</th>
              <th className="p-3">Payment</th>
              <th className="p-3">Total</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-neutral-500">
                  No orders found.
                </td>
              </tr>
            ) : (
              filtered.map((o) => (
                <tr key={o.id} className="hover:bg-neutral-50">
                  <td className="p-3">
                    <p className="font-medium text-black">{o.orderNumber}</p>
                    <p className="text-[11px] text-neutral-500">{o.createdAt.slice(0, 10)}</p>
                  </td>
                  <td className="p-3">
                    <p className="font-medium">{o.shippingName}</p>
                    <p className="text-[11px] text-neutral-500">{o.shippingPhone}</p>
                  </td>
                  <td className="p-3">{o.shippingDistrict}</td>
                  <td className="p-3">
                    {o.paymentMethod}
                    {o.slipStatus && (
                      <span className="ml-1 text-[10px] text-neutral-500">({o.slipStatus})</span>
                    )}
                  </td>
                  <td className="p-3 font-medium">{formatLkr(o.totalLkr)}</td>
                  <td className="p-3">
                    <span className="border border-neutral-300 px-2 py-0.5 text-[10px] uppercase tracking-wider">
                      {ORDER_STATUS_LABELS[o.status] || o.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button onClick={() => setSelected(o)} className="underline hover:text-neutral-600">
                      Manage
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Order Detail Modal (also supports Print Packing Slip) */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-6">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto border border-black bg-white p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-4 no-print">
              <div>
                <h2 className="font-serif text-2xl">{selected.orderNumber}</h2>
                <p className="text-xs text-neutral-500">
                  Placed {new Date(selected.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 border border-black px-3 py-1.5 text-xs uppercase tracking-widest"
                >
                  <Printer className="h-3.5 w-3.5" />
                  Print Slip
                </button>
                <button onClick={() => setSelected(null)} aria-label="Close order">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Printable Packing Slip & Delivery Label Header */}
            <div className="hidden print:block border-b border-black pb-4 mb-4">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="font-serif text-2xl">LUXE LOOMIE</h1>
                  <p className="text-xs">{storeAddress}</p>
                  <p className="text-xs">Tel: {storePhone}</p>
                </div>
                <div className="text-right text-xs">
                  <p className="font-bold">PACKING SLIP / DELIVERY LABEL</p>
                  <p>Order: {selected.orderNumber}</p>
                </div>
              </div>
            </div>

            {/* Customer & Delivery */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 border border-neutral-200 p-4 text-xs">
              <div>
                <h3 className="font-semibold uppercase tracking-wider text-neutral-500 mb-1">
                  Deliver To
                </h3>
                <p className="text-sm font-medium">{selected.shippingName}</p>
                <p>{selected.shippingPhone}</p>
                <p className="mt-1">{selected.shippingAddress}</p>
                <p className="font-medium">{selected.shippingDistrict} District</p>
              </div>
              <div>
                <h3 className="font-semibold uppercase tracking-wider text-neutral-500 mb-1">
                  Payment &amp; Status
                </h3>
                <p>Method: {selected.paymentMethod}</p>
                <p>Total: {formatLkr(selected.totalLkr)}</p>
                {selected.courier && <p>Courier: {selected.courier}</p>}
                {selected.trackingNumber && <p>Tracking: {selected.trackingNumber}</p>}
              </div>
            </div>

            {/* Items */}
            <table className="w-full border border-neutral-200 text-xs">
              <thead className="bg-neutral-50 border-b border-neutral-200 uppercase text-neutral-500">
                <tr>
                  <th className="p-2.5 text-left">Item</th>
                  <th className="p-2.5 text-left">SKU</th>
                  <th className="p-2.5 text-right">Qty</th>
                  <th className="p-2.5 text-right">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {selected.items.map((item) => (
                  <tr key={item.id}>
                    <td className="p-2.5">{item.productName}</td>
                    <td className="p-2.5">{item.sku}</td>
                    <td className="p-2.5 text-right">{item.quantity}</td>
                    <td className="p-2.5 text-right">{formatLkr(item.unitPriceLkr * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Admin Controls (Hidden when printing) */}
            <div className="space-y-4 no-print">
              {selected.slipUrl && (
                <div className="border border-neutral-200 p-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold uppercase tracking-wider">
                      Bank Transfer Slip ({selected.slipStatus})
                    </span>
                    <a href={selected.slipUrl} target="_blank" className="underline">
                      Open Full Slip
                    </a>
                  </div>
                  <div className="flex gap-2">
                    <button
                      disabled={saving}
                      onClick={() =>
                        updateOrder(selected.id, { slipStatus: "APPROVED", status: "PAID" })
                      }
                      className="bg-black px-4 py-1.5 text-white uppercase tracking-widest"
                    >
                      Approve &amp; Mark Paid
                    </button>
                    <button
                      disabled={saving}
                      onClick={() =>
                        updateOrder(selected.id, { slipStatus: "REJECTED", status: "PAYMENT_PENDING" })
                      }
                      className="border border-black px-4 py-1.5 uppercase tracking-widest"
                    >
                      Reject Slip
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 text-xs">
                <div>
                  <label className="block uppercase tracking-wider text-neutral-500 mb-1">
                    Order Status
                  </label>
                  <select
                    value={selected.status}
                    disabled={saving}
                    onChange={(e) => {
                      const next = e.target.value;
                      if (
                        (next === "CANCELLED" || next === "RETURNED") &&
                        !window.confirm("Cancelling/returning will restore item stock. Continue?")
                      ) {
                        return;
                      }
                      updateOrder(selected.id, { status: next });
                    }}
                    className="w-full border border-neutral-300 bg-white px-3 py-2 outline-none focus:border-black"
                  >
                    {ORDER_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {ORDER_STATUS_LABELS[st]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block uppercase tracking-wider text-neutral-500 mb-1">
                    Courier Partner
                  </label>
                  <input
                    type="text"
                    defaultValue={selected.courier || ""}
                    onBlur={(e) => updateOrder(selected.id, { courier: e.target.value })}
                    placeholder="e.g. PromptXP / Domex"
                    className="w-full border border-neutral-300 px-3 py-2 outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block uppercase tracking-wider text-neutral-500 mb-1">
                    Tracking Number
                  </label>
                  <input
                    type="text"
                    defaultValue={selected.trackingNumber || ""}
                    onBlur={(e) => updateOrder(selected.id, { trackingNumber: e.target.value })}
                    placeholder="Tracking code"
                    className="w-full border border-neutral-300 px-3 py-2 outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="text-xs">
                <label className="block uppercase tracking-wider text-neutral-500 mb-1">
                  Internal Notes
                </label>
                <textarea
                  rows={2}
                  defaultValue={selected.internalNotes || ""}
                  onBlur={(e) => updateOrder(selected.id, { internalNotes: e.target.value })}
                  className="w-full border border-neutral-300 px-3 py-2 outline-none focus:border-black"
                />
              </div>

              <div className="border-t border-neutral-200 pt-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider mb-2">
                  One-Click WhatsApp Updates
                </h3>
                <div className="flex flex-wrap gap-2">
                  {waTemplates(selected).map((tpl) => (
                    <a
                      key={tpl.label}
                      href={buildWhatsAppUrl(selected.shippingPhone, tpl.text)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 border border-black px-3 py-1.5 text-xs hover:bg-black hover:text-white transition-colors"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      {tpl.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
