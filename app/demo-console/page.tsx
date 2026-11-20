"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { formatTsh } from "@/lib/menu";
import { loadDemoOrders, updateDemoOrderStatus, type DemoOrder, type DemoOrderStatus } from "@/lib/demo-orders";

type Filter = "all" | DemoOrderStatus;

const filters: { value: Filter; label: string }[] = [
  { value: "all", label: "All orders" },
  { value: "confirmed", label: "Confirmed" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export default function DemoConsolePage() {
  const [orders, setOrders] = useState<DemoOrder[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [ready, setReady] = useState(false);

  const refresh = useCallback(() => {
    setOrders(loadDemoOrders());
    setReady(true);
  }, []);

  useEffect(() => {
    const initialFrame = window.requestAnimationFrame(refresh);
    const handleStorage = (event: StorageEvent) => {
      if (!event.key || event.key.startsWith("patisso-demo-orders-")) refresh();
    };
    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", refresh);
    return () => {
      window.cancelAnimationFrame(initialFrame);
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", refresh);
    };
  }, [refresh]);

  const visibleOrders = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesFilter = filter === "all" || order.status === filter;
      const matchesQuery = !normalized ||
        order.reference.toLowerCase().includes(normalized) ||
        order.items.some((item) => item.name.toLowerCase().includes(normalized));
      return matchesFilter && matchesQuery;
    });
  }, [filter, orders, query]);

  const counts = useMemo(() => ({
    all: orders.length,
    confirmed: orders.filter((order) => order.status === "confirmed").length,
    completed: orders.filter((order) => order.status === "completed").length,
    cancelled: orders.filter((order) => order.status === "cancelled").length,
    value: orders.filter((order) => order.status !== "cancelled").reduce((sum, order) => sum + order.totalTsh, 0),
  }), [orders]);

  function changeStatus(reference: string, status: DemoOrderStatus) {
    if (!updateDemoOrderStatus(reference, status)) return;
    refresh();
  }

  function exportOrders() {
    const rows = [
      ["Reference", "Created", "Status", "Items", "Total TSh", "Special instructions"],
      ...visibleOrders.map((order) => [
        order.reference,
        order.createdAt,
        order.status,
        order.items.map((item) => `${item.name} x${item.quantity}`).join("; "),
        String(order.totalTsh),
        order.specialInstructions,
      ]),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "patisso-demo-orders.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="console-page">
      <header className="console-header">
        <Link className="wordmark" href="/">pâtissö<span>®</span></Link>
        <nav aria-label="Console navigation">
          <Link href="/">View website ↗</Link>
          <Link href="/track">Order tracking ↗</Link>
        </nav>
      </header>
      <section className="console-content">
        <div className="console-heading">
          <div>
            <p className="voice-kicker">PÂTISSÖ · DEMO OPERATIONS</p>
            <h1>Order <em>console.</em></h1>
            <p>Review simulated orders created by the voice concierge in this browser.</p>
          </div>
          <button className="console-export" type="button" onClick={exportOrders} disabled={visibleOrders.length === 0}>Export CSV ↓</button>
        </div>
        <div className="console-notice" role="note">
          <strong>Local demo console</strong>
          <span>Orders are stored in this browser only. This is not a secured admin account or a shared database. Other devices and browsers cannot see these records.</span>
        </div>
        <div className="console-stats">
          <article><span>ALL DEMO ORDERS</span><b>{counts.all}</b></article>
          <article><span>AWAITING REVIEW</span><b>{counts.confirmed}</b></article>
          <article><span>COMPLETED</span><b>{counts.completed}</b></article>
          <article><span>DEMO VALUE · TSh</span><b>{counts.value.toLocaleString("en-TZ")}</b></article>
        </div>
        <div className="console-toolbar">
          <div className="console-filters" aria-label="Filter orders">
            {filters.map((item) => (
              <button key={item.value} type="button" className={filter === item.value ? "is-active" : ""} onClick={() => setFilter(item.value)}>
                {item.label}<span>{item.value === "all" ? counts.all : counts[item.value]}</span>
              </button>
            ))}
          </div>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search reference or item…" aria-label="Search orders" />
        </div>
        {!ready ? <p className="console-empty">Loading local orders…</p> : visibleOrders.length === 0 ? (
          <div className="console-empty">
            <h2>No demo orders here yet.</h2>
            <p>Start a voice call on the website, choose a few items and explicitly confirm the demo order. It will appear here when created in this browser.</p>
            <Link href="/">Go to Pâtissö ↗</Link>
          </div>
        ) : (
          <div className="console-orders">
            {visibleOrders.map((order) => (
              <article className="console-order" key={order.reference}>
                <div className="console-order-top">
                  <div><span>ORDER REFERENCE</span><h2>#{order.reference}</h2><small>{new Date(order.createdAt).toLocaleString()}</small></div>
                  <span className={"console-status console-status--" + order.status}>{order.status}</span>
                </div>
                <ul>
                  {order.items.map((item) => (
                    <li key={item.name}><span>{item.name} × {item.quantity}<small>{formatTsh(item.unitPrice)} each</small></span><b>{formatTsh(item.lineTotal)}</b></li>
                  ))}
                </ul>
                {order.specialInstructions && <p className="console-note">Visitor note: {order.specialInstructions}</p>}
                <div className="console-order-bottom">
                  <span>DEMO TOTAL <b>{formatTsh(order.totalTsh)}</b></span>
                  <div>
                    {order.status !== "completed" && <button type="button" onClick={() => changeStatus(order.reference, "completed")}>Mark completed</button>}
                    {order.status !== "cancelled" && <button type="button" className="console-cancel" onClick={() => changeStatus(order.reference, "cancelled")}>Cancel demo</button>}
                    {order.status !== "confirmed" && <button type="button" className="console-reset" onClick={() => changeStatus(order.reference, "confirmed")}>Reopen</button>}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
