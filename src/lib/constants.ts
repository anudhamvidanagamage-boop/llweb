export const PRODUCT_CATEGORIES = [
  { value: "RAYON_HANDLOOM", label: "Rayon Handloom", badge: "HANDLOOM", defaultPrice: 6500 },
  { value: "FULL_COTTON", label: "Full Cotton", badge: "HANDLOOM", defaultPrice: 7500 },
  { value: "RAYON_PUNE", label: "Rayon Pune", badge: "HANDLOOM", defaultPrice: 8500 },
  { value: "COTTON_PUNE", label: "Cotton Pune", badge: "HANDLOOM", defaultPrice: 9500 },
  { value: "EMBROIDERED", label: "Embroidered", badge: "HANDLOOM", defaultPrice: 14000 },
  { value: "IMPORTED", label: "Imported", badge: "IMPORTED", defaultPrice: 16000 },
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number]["value"];

export const OCCASIONS = [
  "Everyday",
  "Office",
  "Festive",
  "Wedding",
  "Gifting",
] as const;

export const ORDER_STATUSES = [
  "NEW",
  "PAYMENT_PENDING",
  "PAID",
  "PACKED",
  "DISPATCHED",
  "DELIVERED",
  "CANCELLED",
  "RETURNED",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  NEW: "New",
  PAYMENT_PENDING: "Payment Pending",
  PAID: "Paid",
  PACKED: "Packed",
  DISPATCHED: "Dispatched",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  RETURNED: "Returned",
};

export const SRI_LANKA_DISTRICTS = [
  "Colombo",
  "Gampaha",
  "Kalutara",
  "Kandy",
  "Matale",
  "Nuwara Eliya",
  "Galle",
  "Matara",
  "Hambantota",
  "Jaffna",
  "Kilinochchi",
  "Mannar",
  "Vavuniya",
  "Mullaitivu",
  "Batticaloa",
  "Ampara",
  "Trincomalee",
  "Kurunegala",
  "Puttalam",
  "Anuradhapura",
  "Polonnaruwa",
  "Badulla",
  "Monaragala",
  "Ratnapura",
  "Kegalle",
] as const;

export function getCategoryLabel(value: string): string {
  return PRODUCT_CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

export function formatLkr(amount: number): string {
  return `LKR ${amount.toLocaleString("en-LK")}`;
}

export function normalizeWhatsAppNumber(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("0") && digits.length === 10) {
    return `94${digits.slice(1)}`;
  }
  return digits;
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  const normalized = normalizeWhatsAppNumber(phone);
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

export function parseJsonArray(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
