import type { MenuItem } from "@/lib/menu";

export type DemoOrderLine = {
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type DemoOrder = {
  reference: string;
  items: DemoOrderLine[];
  totalTsh: number;
  specialInstructions: string;
  createdAt: string;
  status: "confirmed";
};

const STORAGE_KEY = "patisso-demo-orders-v1";

export function saveDemoOrder(order: DemoOrder) {
  try {
    const existing = loadDemoOrders();
    const next = [order, ...existing.filter((item) => item.reference !== order.reference)].slice(0, 30);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage may be unavailable; the in-session receipt still remains usable.
  }
}

export function loadDemoOrders(): DemoOrder[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((order): order is DemoOrder =>
      Boolean(order && typeof order === "object" &&
        typeof (order as DemoOrder).reference === "string" &&
        Array.isArray((order as DemoOrder).items) &&
        typeof (order as DemoOrder).totalTsh === "number")
    );
  } catch {
    return [];
  }
}

export function findDemoOrder(reference: string) {
  const normalized = reference.trim().toUpperCase();
  if (!normalized) return null;
  return loadDemoOrders().find((order) => order.reference.toUpperCase() === normalized) ?? null;
}
