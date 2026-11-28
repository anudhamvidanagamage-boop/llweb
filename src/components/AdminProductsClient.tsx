"use client";

import React, { useMemo, useState } from "react";
import {
  Plus,
  Upload,
  Copy,
  Trash2,
  RotateCcw,
  ExternalLink,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Star,
  Download,
  X,
} from "lucide-react";
import {
  OCCASIONS,
  PRODUCT_CATEGORIES,
  formatLkr,
  getCategoryLabel,
  parseJsonArray,
} from "@/lib/constants";

interface ProductImageItem {
  id?: string;
  url: string;
  altText: string;
  sortOrder: number;
  isCover: boolean;
}

interface AdminProduct {
  id: string;
  sku: string;
  slug: string;
  name: string;
  category: string;
  badge: string;
  fabric: string;
  weave: string;
  origin: string;
  length: string;
  colours: string;
  occasions: string;
  shortDesc: string;
  longDesc: string;
  care: string;
  priceLkr: number;
  compareAtLkr: number | null;
  costLkr: number;
  stock: number;
  lowStockThreshold: number;
  status: string;
  isPreOrder: boolean;
  isNewArrival: boolean;
  publishAt: string | null;
  deletedAt: string | null;
  seoTitle: string | null;
  seoDesc: string | null;
  images: ProductImageItem[];
}

export function AdminProductsClient({ initialProducts }: { initialProducts: AdminProduct[] }) {
  const [products, setProducts] = useState<AdminProduct[]>(initialProducts);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showDeleted, setShowDeleted] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [toast, setToast] = useState("");

  // Modal state
  const [editing, setEditing] = useState<Partial<AdminProduct> & {
    coloursArr: string[];
    occasionsArr: string[];
    images: ProductImageItem[];
  } | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // CSV Import modal
  const [csvOpen, setCsvOpen] = useState(false);
  const [csvText, setCsvText] = useState("");
  const [csvPreview, setCsvPreview] = useState<
    Array<{ rowNumber: number; valid: boolean; errors: string[]; data: { sku: string; name: string; priceLkr: number } }>
  >([]);

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  };

  const refreshProducts = async () => {
    const res = await fetch("/api/admin/products?includeDeleted=1");
    const data = await res.json();
    if (data.products) setProducts(data.products);
  };

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (!showDeleted && p.deletedAt) return false;
      if (showDeleted && !p.deletedAt) return false;
      if (catFilter && p.category !== catFilter) return false;
      if (statusFilter && p.status !== statusFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        if (!`${p.name} ${p.sku} ${p.fabric}`.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [products, showDeleted, catFilter, statusFilter, search]);

  const openNew = () => {
    setEditing({
      name: "",
      sku: `LL-${Date.now().toString().slice(-4)}`,
      slug: "",
      category: "RAYON_HANDLOOM",
      badge: "HANDLOOM",
      fabric: "",
      weave: "",
      origin: "Sri Lanka",
      length: "Approx. 5.5 m body + blouse piece",
      coloursArr: [],
      occasionsArr: ["Everyday"],
      shortDesc: "",
      longDesc: "",
      care: "Gentle cold hand wash separately. Dry in shade.",
      priceLkr: 6500,
      compareAtLkr: null,
      costLkr: 4000,
      stock: 5,
      lowStockThreshold: 3,
      status: "ACTIVE",
      isPreOrder: false,
      isNewArrival: true,
      publishAt: null,
      seoTitle: "",
      seoDesc: "",
      images: [],
    });
    setDirty(false);
  };

  const openEdit = (p: AdminProduct) => {
    setEditing({
      ...p,
      coloursArr: parseJsonArray(p.colours),
      occasionsArr: parseJsonArray(p.occasions),
      images: p.images || [],
    });
    setDirty(false);
  };

  const handleDuplicate = (p: AdminProduct) => {
    setEditing({
      ...p,
      id: undefined,
      name: `${p.name} (Copy)`,
      sku: `${p.sku}-COPY`,
      slug: "",
      status: "DRAFT",
      coloursArr: parseJsonArray(p.colours),
      occasionsArr: parseJsonArray(p.occasions),
      images: (p.images || []).map((img) => ({ ...img, id: undefined })),
    });
    setDirty(true);
  };

  const closeEditor = () => {
    if (dirty && !window.confirm("You have unsaved changes. Discard them?")) return;
    setEditing(null);
    setDirty(false);
  };

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || !editing) return;
    setUploading(true);
    try {
      const fd = new FormData();
      Array.from(files).forEach((f) => fd.append("files", f));
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      const nextImgs: ProductImageItem[] = [
        ...editing.images,
        ...data.files.map((f: { url: string; altText: string }, idx: number) => ({
          url: f.url,
          altText: f.altText || editing.name || "Luxe Loomie saree",
          sortOrder: editing.images.length + idx,
          isCover: editing.images.length === 0 && idx === 0,
        })),
      ];
      setEditing({ ...editing, images: nextImgs });
      setDirty(true);
      notify("Images converted to WebP and uploaded.");
    } catch (err) {
      notify(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (statusOverride?: string) => {
    if (!editing) return;
    setSaving(true);
    try {
      const payload = {
        ...editing,
        status: statusOverride || editing.status,
        colours: editing.coloursArr,
        occasions: editing.occasionsArr,
      };
      const isUpdate = Boolean(editing.id);
      const res = await fetch(
        isUpdate ? `/api/admin/products/${editing.id}` : "/api/admin/products",
        {
          method: isUpdate ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      await refreshProducts();
      setEditing(null);
      setDirty(false);
      notify(isUpdate ? "Product updated." : "Product created.");
    } catch (err) {
      notify(err instanceof Error ? err.message : "Could not save product.");
    } finally {
      setSaving(false);
    }
  };

  const handleSoftDelete = async (id: string, name: string) => {
    if (!window.confirm(`Move "${name}" to trash? You can restore it later.`)) return;
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    await refreshProducts();
    notify("Product moved to trash.");
  };

  const handleBulk = async (action: string, value?: string | number) => {
    if (selectedIds.length === 0) return;
    if (action === "hide" && !window.confirm(`Hide ${selectedIds.length} selected products?`)) return;
    await fetch("/api/admin/products", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: selectedIds, action, value }),
    });
    setSelectedIds([]);
    await refreshProducts();
    notify("Bulk update applied.");
  };

  const downloadCsvTemplate = () => {
    const template =
      "sku,name,category,fabric,weave,origin,priceLkr,costLkr,stock,colours,occasions,shortDesc,care\n" +
      'LL-RH-101,"Sample Ivory Handloom",RAYON_HANDLOOM,"Rayon Handloom","Plain weave","Sri Lanka",6500,4000,5,"Ivory|Peach","Office|Everyday","Soft drape handloom saree.","Cold hand wash"\n';
    const blob = new Blob([template], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "luxe-loomie-product-template.csv";
    a.click();
  };

  const marginPercent =
    editing && editing.priceLkr && editing.priceLkr > 0
      ? Math.round(((editing.priceLkr - (editing.costLkr || 0)) / editing.priceLkr) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 border border-black bg-black px-4 py-3 text-xs uppercase tracking-widest text-white shadow-lg">
          {toast}
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl">Products</h1>
          <p className="text-xs text-neutral-500">
            Manage sarees, WebP photography, margins (30% floor), and stock levels.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCsvOpen(true)}
            className="border border-black bg-white px-4 py-2.5 text-xs uppercase tracking-widest hover:bg-neutral-100"
          >
            Import CSV
          </button>
          <button
            onClick={openNew}
            className="inline-flex items-center gap-2 bg-black px-5 py-2.5 text-xs uppercase tracking-widest text-white hover:bg-neutral-800"
          >
            <Plus className="h-4 w-4" />
            Add Saree
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 gap-3 border border-neutral-200 bg-white p-4 sm:grid-cols-4">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, SKU, fabric..."
          className="border border-neutral-300 px-3 py-2 text-xs outline-none focus:border-black"
        />
        <select
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value)}
          className="border border-neutral-300 bg-white px-3 py-2 text-xs outline-none focus:border-black"
        >
          <option value="">All Categories</option>
          {PRODUCT_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-neutral-300 bg-white px-3 py-2 text-xs outline-none focus:border-black"
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="DRAFT">Draft</option>
          <option value="HIDDEN">Hidden</option>
          <option value="SOLD_OUT">Sold Out</option>
        </select>
        <label className="flex items-center gap-2 text-xs cursor-pointer">
          <input
            type="checkbox"
            checked={showDeleted}
            onChange={(e) => {
              setShowDeleted(e.target.checked);
              setSelectedIds([]);
            }}
            className="accent-black"
          />
          <span>Show Trash ({products.filter((p) => p.deletedAt).length})</span>
        </label>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 border border-black bg-white p-3 text-xs">
          <span className="font-medium mr-2">{selectedIds.length} selected:</span>
          {!showDeleted ? (
            <>
              <button onClick={() => handleBulk("activate")} className="border border-neutral-300 px-3 py-1 hover:border-black">
                Set Active
              </button>
              <button onClick={() => handleBulk("hide")} className="border border-neutral-300 px-3 py-1 hover:border-black">
                Hide
              </button>
              <button onClick={() => handleBulk("markNew")} className="border border-neutral-300 px-3 py-1 hover:border-black">
                Mark New
              </button>
              <button
                onClick={() => {
                  const pct = window.prompt("Adjust price by % (e.g. 5 or -5):", "5");
                  if (pct !== null) handleBulk("pricePercent", Number(pct));
                }}
                className="border border-neutral-300 px-3 py-1 hover:border-black"
              >
                Adjust Price %
              </button>
            </>
          ) : (
            <button onClick={() => handleBulk("restore")} className="border border-black px-3 py-1">
              Restore Selected
            </button>
          )}
        </div>
      )}

      {/* Product Table / Mobile Cards */}
      <div className="border border-neutral-200 bg-white overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-neutral-200 bg-neutral-50 uppercase tracking-wider text-neutral-500">
            <tr>
              <th className="p-3 w-8">
                <input
                  type="checkbox"
                  checked={filtered.length > 0 && selectedIds.length === filtered.length}
                  onChange={(e) =>
                    setSelectedIds(e.target.checked ? filtered.map((p) => p.id) : [])
                  }
                  className="accent-black"
                />
              </th>
              <th className="p-3">Saree</th>
              <th className="p-3">Category</th>
              <th className="p-3">Price</th>
              <th className="p-3">Margin</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {filtered.map((p) => {
              const margin = p.priceLkr > 0 ? Math.round(((p.priceLkr - p.costLkr) / p.priceLkr) * 100) : 0;
              const cover = p.images?.[0]?.url;
              return (
                <tr key={p.id} className="hover:bg-neutral-50">
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(p.id)}
                      onChange={(e) =>
                        setSelectedIds((prev) =>
                          e.target.checked ? [...prev, p.id] : prev.filter((id) => id !== p.id)
                        )
                      }
                      className="accent-black"
                    />
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-10 shrink-0 bg-neutral-100 border border-neutral-200 overflow-hidden flex items-center justify-center">
                        {cover ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={cover} alt={p.name} className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-[8px] text-neutral-400 text-center">None</span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-black">{p.name}</p>
                        <p className="text-[11px] text-neutral-500">
                          {p.sku} &middot; {p.badge}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">{getCategoryLabel(p.category)}</td>
                  <td className="p-3 font-medium">{formatLkr(p.priceLkr)}</td>
                  <td className="p-3">
                    <span className={margin < 30 ? "font-semibold underline" : "text-neutral-700"}>
                      {margin}%
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={p.stock <= p.lowStockThreshold ? "font-semibold" : ""}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="border border-neutral-300 px-2 py-0.5 text-[10px] uppercase tracking-wider">
                      {p.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button onClick={() => openEdit(p)} className="underline hover:text-neutral-600">
                        Edit
                      </button>
                      <button onClick={() => handleDuplicate(p)} title="Duplicate" className="text-neutral-500 hover:text-black">
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                      {!p.deletedAt ? (
                        <button
                          onClick={() => handleSoftDelete(p.id, p.name)}
                          title="Move to Trash"
                          className="text-neutral-500 hover:text-black"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={async () => {
                            await fetch("/api/admin/products", {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ ids: [p.id], action: "restore" }),
                            });
                            await refreshProducts();
                            notify("Restored.");
                          }}
                          title="Restore"
                          className="text-neutral-500 hover:text-black"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-6">
          <div className="flex max-h-[92vh] w-full max-w-4xl flex-col bg-white border border-black shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
              <h2 className="font-serif text-2xl">{editing.id ? "Edit Saree" : "New Saree"}</h2>
              <div className="flex items-center gap-3">
                {editing.slug && (
                  <a
                    href={`/products/${editing.slug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1 text-xs underline"
                  >
                    Preview <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                <button onClick={closeEditor} aria-label="Close editor">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm">
              {/* Basic Info */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs uppercase tracking-wider text-neutral-600 mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={editing.name || ""}
                    onChange={(e) => {
                      setEditing({ ...editing, name: e.target.value });
                      setDirty(true);
                    }}
                    className="w-full border border-neutral-300 px-3 py-2 outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-600 mb-1">
                    SKU *
                  </label>
                  <input
                    type="text"
                    value={editing.sku || ""}
                    onChange={(e) => {
                      setEditing({ ...editing, sku: e.target.value });
                      setDirty(true);
                    }}
                    className="w-full border border-neutral-300 px-3 py-2 outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-600 mb-1">
                    Category
                  </label>
                  <select
                    value={editing.category || "RAYON_HANDLOOM"}
                    onChange={(e) => {
                      const cat = e.target.value;
                      setEditing({
                        ...editing,
                        category: cat,
                        badge: cat === "IMPORTED" ? "IMPORTED" : "HANDLOOM",
                      });
                      setDirty(true);
                    }}
                    className="w-full border border-neutral-300 bg-white px-3 py-2 outline-none focus:border-black"
                  >
                    {PRODUCT_CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-600 mb-1">
                    Badge
                  </label>
                  <select
                    value={editing.badge || "HANDLOOM"}
                    onChange={(e) => {
                      setEditing({ ...editing, badge: e.target.value });
                      setDirty(true);
                    }}
                    className="w-full border border-neutral-300 bg-white px-3 py-2 outline-none focus:border-black"
                  >
                    <option value="HANDLOOM">Handloom</option>
                    <option value="IMPORTED">Imported</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-600 mb-1">
                    Status
                  </label>
                  <select
                    value={editing.status || "ACTIVE"}
                    onChange={(e) => {
                      setEditing({ ...editing, status: e.target.value });
                      setDirty(true);
                    }}
                    className="w-full border border-neutral-300 bg-white px-3 py-2 outline-none focus:border-black"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="DRAFT">Draft</option>
                    <option value="HIDDEN">Hidden</option>
                    <option value="SOLD_OUT">Sold Out</option>
                  </select>
                </div>
              </div>

              {/* Pricing & Margin */}
              <div className="border border-neutral-200 bg-neutral-50 p-4 space-y-3">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-neutral-600 mb-1">
                      Selling Price (LKR) *
                    </label>
                    <input
                      type="number"
                      value={editing.priceLkr ?? 0}
                      onChange={(e) => {
                        setEditing({ ...editing, priceLkr: Number(e.target.value) });
                        setDirty(true);
                      }}
                      className="w-full border border-neutral-300 bg-white px-3 py-2 outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-neutral-600 mb-1">
                      Compare-At (Optional)
                    </label>
                    <input
                      type="number"
                      value={editing.compareAtLkr ?? ""}
                      onChange={(e) => {
                        setEditing({
                          ...editing,
                          compareAtLkr: e.target.value ? Number(e.target.value) : null,
                        });
                        setDirty(true);
                      }}
                      className="w-full border border-neutral-300 bg-white px-3 py-2 outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-neutral-600 mb-1">
                      Cost Price (Admin Only) *
                    </label>
                    <input
                      type="number"
                      value={editing.costLkr ?? 0}
                      onChange={(e) => {
                        setEditing({ ...editing, costLkr: Number(e.target.value) });
                        setDirty(true);
                      }}
                      className="w-full border border-neutral-300 bg-white px-3 py-2 outline-none focus:border-black"
                    />
                  </div>
                  <div className="flex flex-col justify-center">
                    <span className="text-xs uppercase tracking-wider text-neutral-500">Gross Margin</span>
                    <span className="text-xl font-semibold">{marginPercent}%</span>
                  </div>
                </div>
                {marginPercent < 30 && (
                  <div className="flex items-center gap-2 border border-black bg-white px-3 py-2 text-xs">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>Warning: Margin is below the 30% floor margin target.</span>
                  </div>
                )}
              </div>

              {/* Stock & Flags */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-600 mb-1">
                    Stock Qty
                  </label>
                  <input
                    type="number"
                    value={editing.stock ?? 0}
                    onChange={(e) => {
                      setEditing({ ...editing, stock: Number(e.target.value) });
                      setDirty(true);
                    }}
                    className="w-full border border-neutral-300 px-3 py-2 outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-600 mb-1">
                    Low-Stock Alert
                  </label>
                  <input
                    type="number"
                    value={editing.lowStockThreshold ?? 3}
                    onChange={(e) => {
                      setEditing({ ...editing, lowStockThreshold: Number(e.target.value) });
                      setDirty(true);
                    }}
                    className="w-full border border-neutral-300 px-3 py-2 outline-none focus:border-black"
                  />
                </div>
                <label className="flex items-center gap-2 pt-5 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(editing.isNewArrival)}
                    onChange={(e) => {
                      setEditing({ ...editing, isNewArrival: e.target.checked });
                      setDirty(true);
                    }}
                    className="accent-black"
                  />
                  <span>New Arrival</span>
                </label>
                <label className="flex items-center gap-2 pt-5 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(editing.isPreOrder)}
                    onChange={(e) => {
                      setEditing({ ...editing, isPreOrder: e.target.checked });
                      setDirty(true);
                    }}
                    className="accent-black"
                  />
                  <span>Pre-order</span>
                </label>
              </div>

              {/* Specs */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-600 mb-1">Fabric</label>
                  <input
                    type="text"
                    value={editing.fabric || ""}
                    onChange={(e) => {
                      setEditing({ ...editing, fabric: e.target.value });
                      setDirty(true);
                    }}
                    className="w-full border border-neutral-300 px-3 py-2 outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-600 mb-1">Weave</label>
                  <input
                    type="text"
                    value={editing.weave || ""}
                    onChange={(e) => {
                      setEditing({ ...editing, weave: e.target.value });
                      setDirty(true);
                    }}
                    className="w-full border border-neutral-300 px-3 py-2 outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-600 mb-1">Origin</label>
                  <input
                    type="text"
                    value={editing.origin || ""}
                    onChange={(e) => {
                      setEditing({ ...editing, origin: e.target.value });
                      setDirty(true);
                    }}
                    className="w-full border border-neutral-300 px-3 py-2 outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-600 mb-1">Length</label>
                  <input
                    type="text"
                    value={editing.length || ""}
                    onChange={(e) => {
                      setEditing({ ...editing, length: e.target.value });
                      setDirty(true);
                    }}
                    className="w-full border border-neutral-300 px-3 py-2 outline-none focus:border-black"
                  />
                </div>
              </div>

              {/* Colours & Occasions */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-600 mb-1">
                    Colours (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={editing.coloursArr.join(", ")}
                    onChange={(e) => {
                      setEditing({
                        ...editing,
                        coloursArr: e.target.value
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean),
                      });
                      setDirty(true);
                    }}
                    className="w-full border border-neutral-300 px-3 py-2 outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-600 mb-1">
                    Occasions
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {OCCASIONS.map((occ) => {
                      const active = editing.occasionsArr.includes(occ);
                      return (
                        <button
                          key={occ}
                          type="button"
                          onClick={() => {
                            setEditing({
                              ...editing,
                              occasionsArr: active
                                ? editing.occasionsArr.filter((o) => o !== occ)
                                : [...editing.occasionsArr, occ],
                            });
                            setDirty(true);
                          }}
                          className={`border px-2.5 py-1 text-xs ${
                            active ? "border-black bg-black text-white" : "border-neutral-300"
                          }`}
                        >
                          {occ}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Descriptions & Care */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-600 mb-1">
                    Short Description (2-3 lines)
                  </label>
                  <textarea
                    rows={2}
                    value={editing.shortDesc || ""}
                    onChange={(e) => {
                      setEditing({ ...editing, shortDesc: e.target.value });
                      setDirty(true);
                    }}
                    className="w-full border border-neutral-300 px-3 py-2 outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-600 mb-1">
                    Care Instructions
                  </label>
                  <input
                    type="text"
                    value={editing.care || ""}
                    onChange={(e) => {
                      setEditing({ ...editing, care: e.target.value });
                      setDirty(true);
                    }}
                    className="w-full border border-neutral-300 px-3 py-2 outline-none focus:border-black"
                  />
                </div>
              </div>

              {/* Images */}
              <div className="border border-neutral-200 p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider">
                      Product Images (Auto-converted to WebP)
                    </h3>
                    <p className="text-xs text-neutral-500">
                      Recommended minimum 4 images including weave close-up.
                    </p>
                  </div>
                  <label className="inline-flex cursor-pointer items-center gap-2 bg-black px-4 py-2 text-xs uppercase tracking-widest text-white">
                    <Upload className="h-3.5 w-3.5" />
                    {uploading ? "Uploading..." : "Upload Photos"}
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e.target.files)}
                      className="hidden"
                    />
                  </label>
                </div>

                {editing.images.length < 4 && (
                  <div className="flex items-center gap-2 border border-neutral-300 bg-neutral-50 px-3 py-2 text-xs text-neutral-700">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>
                      Currently {editing.images.length} image(s). Business standard is at least 4 images per saree.
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {editing.images.map((img, idx) => (
                    <div key={idx} className="flex gap-3 border border-neutral-200 p-2.5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.url} alt={img.altText} className="h-20 w-16 object-cover bg-neutral-100" />
                      <div className="flex-1 space-y-1.5">
                        <input
                          type="text"
                          value={img.altText}
                          placeholder="Alt text"
                          onChange={(e) => {
                            const next = [...editing.images];
                            next[idx] = { ...next[idx], altText: e.target.value };
                            setEditing({ ...editing, images: next });
                            setDirty(true);
                          }}
                          className="w-full border border-neutral-300 px-2 py-1 text-xs"
                        />
                        <div className="flex items-center gap-2 text-[11px]">
                          <button
                            type="button"
                            onClick={() => {
                              const next = editing.images.map((im, i) => ({
                                ...im,
                                isCover: i === idx,
                              }));
                              setEditing({ ...editing, images: next });
                              setDirty(true);
                            }}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 border ${
                              img.isCover ? "border-black bg-black text-white" : "border-neutral-300"
                            }`}
                          >
                            <Star className="h-3 w-3" /> {img.isCover ? "Cover" : "Set Cover"}
                          </button>
                          {idx > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                const next = [...editing.images];
                                [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
                                setEditing({ ...editing, images: next });
                                setDirty(true);
                              }}
                              aria-label="Move up"
                            >
                              <ArrowUp className="h-3.5 w-3.5" />
                            </button>
                          )}
                          {idx < editing.images.length - 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const next = [...editing.images];
                                [next[idx + 1], next[idx]] = [next[idx], next[idx + 1]];
                                setEditing({ ...editing, images: next });
                                setDirty(true);
                              }}
                              aria-label="Move down"
                            >
                              <ArrowDown className="h-3.5 w-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setEditing({
                                ...editing,
                                images: editing.images.filter((_, i) => i !== idx),
                              });
                              setDirty(true);
                            }}
                            className="ml-auto text-neutral-500 hover:text-black"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SEO */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-600 mb-1">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    value={editing.slug || ""}
                    placeholder="auto-generated-from-name"
                    onChange={(e) => {
                      setEditing({ ...editing, slug: e.target.value });
                      setDirty(true);
                    }}
                    className="w-full border border-neutral-300 px-3 py-2 text-xs outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-600 mb-1">
                    SEO Title
                  </label>
                  <input
                    type="text"
                    value={editing.seoTitle || ""}
                    onChange={(e) => {
                      setEditing({ ...editing, seoTitle: e.target.value });
                      setDirty(true);
                    }}
                    className="w-full border border-neutral-300 px-3 py-2 text-xs outline-none focus:border-black"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3 border-t border-neutral-200 px-6 py-4 bg-neutral-50">
              <button
                type="button"
                onClick={closeEditor}
                className="border border-neutral-300 px-5 py-2.5 text-xs uppercase tracking-widest"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => handleSave("DRAFT")}
                className="border border-black bg-white px-5 py-2.5 text-xs uppercase tracking-widest"
              >
                Save as Draft
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => handleSave()}
                className="bg-black px-6 py-2.5 text-xs uppercase tracking-widest text-white hover:bg-neutral-800"
              >
                {saving ? "Saving..." : "Save Product"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      {csvOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl border border-black bg-white p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <h2 className="font-serif text-2xl">Bulk CSV Import</h2>
              <button onClick={() => setCsvOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-600">Upload or paste CSV rows matching the template.</span>
              <button onClick={downloadCsvTemplate} className="inline-flex items-center gap-1 underline">
                <Download className="h-3.5 w-3.5" /> Download Template
              </button>
            </div>
            <textarea
              rows={6}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder="Paste CSV content here..."
              className="w-full border border-neutral-300 p-3 font-mono text-xs outline-none focus:border-black"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={async () => {
                  const res = await fetch("/api/admin/products/import", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ csvText, dryRun: true }),
                  });
                  const data = await res.json();
                  if (data.preview) setCsvPreview(data.preview);
                }}
                className="border border-black px-4 py-2 text-xs uppercase tracking-widest"
              >
                Validate Preview
              </button>
              <button
                type="button"
                onClick={async () => {
                  const res = await fetch("/api/admin/products/import", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ csvText, dryRun: false }),
                  });
                  const data = await res.json();
                  if (res.ok) {
                    setCsvOpen(false);
                    setCsvPreview([]);
                    setCsvText("");
                    await refreshProducts();
                    notify(`Imported ${data.importedCount} product(s).`);
                  }
                }}
                className="bg-black px-5 py-2 text-xs uppercase tracking-widest text-white"
              >
                Import Valid Rows
              </button>
            </div>
            {csvPreview.length > 0 && (
              <div className="max-h-48 overflow-y-auto border border-neutral-200 text-xs">
                {csvPreview.map((r) => (
                  <div key={r.rowNumber} className="flex justify-between border-b border-neutral-100 p-2">
                    <span>
                      Row {r.rowNumber}: {r.data.sku} — {r.data.name}
                    </span>
                    <span className={r.valid ? "text-neutral-700" : "font-semibold underline"}>
                      {r.valid ? "Valid" : r.errors.join(", ")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
