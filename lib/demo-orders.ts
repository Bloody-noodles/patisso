export type DemoOrderStatus = "confirmed" | "completed" | "cancelled";

export type DemoOrderLine = {
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type DemoOrder = {
  reference: string;
  items: DemoOrderLine[];
  totalNaira: number;
  specialInstructions: string;
  createdAt: string;
  status: DemoOrderStatus;
};

const STORAGE_KEY = "patisso-demo-orders-v3";

function isDemoOrder(value: unknown): value is DemoOrder {
  if (!value || typeof value !== "object") return false;
  const order = value as Partial<DemoOrder>;
  return typeof order.reference === "string" &&
    Array.isArray(order.items) &&
    order.items.every((line) => Boolean(line && typeof line.name === "string" &&
      Number.isInteger(line.quantity) && line.quantity > 0 &&
      Number.isFinite(line.unitPrice) && line.unitPrice >= 0 &&
      Number.isFinite(line.lineTotal) && line.lineTotal >= 0)) &&
    typeof order.totalNaira === "number" && Number.isFinite(order.totalNaira) &&
    typeof order.specialInstructions === "string" &&
    typeof order.createdAt === "string" &&
    ["confirmed", "completed", "cancelled"].includes(order.status ?? "");
}

export function saveDemoOrder(order: DemoOrder): boolean {
  try {
    const existing = loadDemoOrders();
    const next = [order, ...existing.filter((item) => item.reference !== order.reference)].slice(0, 100);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return true;
  } catch {
    return false;
  }
}

export function loadDemoOrders(): DemoOrder[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(isDemoOrder).slice(0, 100);
    }
    const legacyRaw = window.localStorage.getItem("patisso-demo-orders-v1");
    if (!legacyRaw) return [];
    const legacy: unknown = JSON.parse(legacyRaw);
    if (!Array.isArray(legacy)) return [];
    const migrated = legacy.map((value) => value && typeof value === "object"
      ? { ...(value as Record<string, unknown>), status: (value as Record<string, unknown>).status ?? "confirmed" }
      : value).filter(isDemoOrder).slice(0, 100);
    if (migrated.length > 0) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
    return migrated;
  } catch {
    return [];
  }
}

export function findDemoOrder(reference: string) {
  const normalized = reference.trim().toUpperCase();
  if (!normalized) return null;
  return loadDemoOrders().find((order) => order.reference.toUpperCase() === normalized) ?? null;
}

export function updateDemoOrderStatus(reference: string, status: DemoOrderStatus): boolean {
  try {
    const orders = loadDemoOrders();
    const target = orders.find((order) => order.reference === reference);
    if (!target) return false;
    target.status = status;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    return true;
  } catch {
    return false;
  }
}
