"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { formatNaira } from "@/lib/menu";
import type { DemoOrder, DemoOrderStatus } from "@/lib/demo-orders";

type Filter = "all" | DemoOrderStatus;
const filters: { value: Filter; label: string }[] = [
  { value: "all", label: "All orders" }, { value: "confirmed", label: "Confirmed" },
  { value: "completed", label: "Completed" }, { value: "cancelled", label: "Cancelled" },
];

export default function DemoConsolePage() {
  const [orders, setOrders] = useState<DemoOrder[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/orders", { cache: "no-store" });
      if (response.status === 401) { setAuthenticated(false); setReady(true); return; }
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Could not load orders.");
      setOrders(result.orders as DemoOrder[]);
      setAuthenticated(true);
      setReady(true);
      setNotice("");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not load orders.");
      setReady(true);
    }
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    void (async () => {
      const response = await fetch("/api/admin/session", { cache: "no-store" });
      if (response.ok) {
        const result = await response.json();
        setAuthenticated(true);
        setAdminEmail(result.email ?? "");
        await refresh();
        interval = setInterval(() => { if (document.visibilityState === "visible") void refresh(); }, 15000);
      } else {
        setAuthenticated(false);
        setReady(true);
      }
    })();
    return () => { if (interval) clearInterval(interval); };
  }, [refresh]);

  const visibleOrders = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return orders.filter((order) => (filter === "all" || order.status === filter) &&
      (!normalized || order.reference.toLowerCase().includes(normalized) ||
        order.items.some((item) => item.name.toLowerCase().includes(normalized))));
  }, [filter, orders, query]);

  const counts = useMemo(() => ({
    all: orders.length,
    confirmed: orders.filter((order) => order.status === "confirmed").length,
    completed: orders.filter((order) => order.status === "completed").length,
    cancelled: orders.filter((order) => order.status === "cancelled").length,
    value: orders.filter((order) => order.status !== "cancelled").reduce((sum, order) => sum + order.totalNaira, 0),
  }), [orders]);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setNotice("");
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Sign-in failed.");
      setAuthenticated(true);
      setAdminEmail(result.email ?? email);
      setPassword("");
      await refresh();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Sign-in failed.");
    } finally { setBusy(false); }
  }

  async function signOut() {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthenticated(false);
    setOrders([]);
  }

  async function changeStatus(reference: string, status: DemoOrderStatus) {
    setBusy(true);
    try {
      const response = await fetch("/api/admin/orders", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference, status }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Could not update order.");
      await refresh();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not update order.");
    } finally { setBusy(false); }
  }

  function exportOrders() {
    const rows = [["Reference", "Created", "Status", "Items", "Total ₦", "Special instructions"],
      ...visibleOrders.map((order) => [order.reference, order.createdAt, order.status,
        order.items.map((item) => `${item.name} x${item.quantity}`).join("; "),
        String(order.totalNaira), order.specialInstructions])];
    const csv = rows.map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = "patisso-demo-orders.csv";
    anchor.click(); URL.revokeObjectURL(url);
  }

  return (
    <main className="console-page">
      <header className="console-header">
        <Link className="wordmark" href="/">pâtissö<span>®</span></Link>
        <nav aria-label="Console navigation">
          <Link href="/">View website ↗</Link><Link href="/track">Order tracking ↗</Link>
          {authenticated && <button type="button" onClick={() => void signOut()}>Sign out</button>}
        </nav>
      </header>
      <section className="console-content">
        {!authenticated ? (
          <div className="console-login">
            <p className="voice-kicker">PÂTISSÖ · PRIVATE OPERATIONS</p>
            <h1>Admin <em>sign in.</em></h1>
            <p>Sign in with the authorised Supabase account to manage the central demo order queue.</p>
            <form className="track-form" onSubmit={signIn}>
              <label htmlFor="admin-email">ADMIN EMAIL</label>
              <input id="admin-email" type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required />
              <label htmlFor="admin-password">PASSWORD</label>
              <input id="admin-password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
              <button type="submit" disabled={busy}>{busy ? "Signing in…" : "Sign in ↗"}</button>
            </form>
            {notice && <p className="track-not-found" role="alert">{notice}</p>}
            <p className="track-disclaimer">Access is restricted to the admin email configured for this demo. Visitor orders cannot access this console.</p>
          </div>
        ) : (
          <>
            <div className="console-heading">
              <div><p className="voice-kicker">PÂTISSÖ · PRIVATE OPERATIONS</p><h1>Order <em>console.</em></h1>
                <p>Central demo orders · signed in as {adminEmail}</p></div>
              <button className="console-export" type="button" onClick={exportOrders} disabled={visibleOrders.length === 0}>Export CSV ↓</button>
            </div>
            <div className="console-notice" role="note">
              <strong>Portfolio demo operations</strong>
              <span>Orders sync through Supabase across devices. They are simulations only: no kitchen, payment, delivery or real fulfilment is connected.</span>
            </div>
            <div className="console-stats">
              <article><span>ALL DEMO ORDERS</span><b>{counts.all}</b></article>
              <article><span>AWAITING REVIEW</span><b>{counts.confirmed}</b></article>
              <article><span>COMPLETED</span><b>{counts.completed}</b></article>
              <article><span>DEMO VALUE · ₦</span><b>{counts.value.toLocaleString("en-NG")}</b></article>
            </div>
            <div className="console-toolbar">
              <div className="console-filters" aria-label="Filter orders">
                {filters.map((item) => <button key={item.value} type="button" className={filter === item.value ? "is-active" : ""} onClick={() => setFilter(item.value)}>
                  {item.label}<span>{item.value === "all" ? counts.all : counts[item.value]}</span></button>)}
              </div>
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search reference or item…" aria-label="Search orders" />
            </div>
            {notice && <p className="track-not-found" role="status">{notice}</p>}
            {!ready ? <p className="console-empty">Loading central orders…</p> : visibleOrders.length === 0 ? (
              <div className="console-empty"><h2>No demo orders yet.</h2><p>Start a voice call on the website and confirm a simulated order. It will appear here from any device.</p><Link href="/">Go to Pâtissö ↗</Link></div>
            ) : (
              <div className="console-orders">{visibleOrders.map((order) => <article className="console-order" key={order.reference}>
                <div className="console-order-top"><div><span>ORDER REFERENCE</span><h2>#{order.reference}</h2><small>{new Date(order.createdAt).toLocaleString()}</small></div>
                  <span className={"console-status console-status--" + order.status}>{order.status}</span></div>
                <ul>{order.items.map((item) => <li key={item.name}><span>{item.name} × {item.quantity}<small>{formatNaira(item.unitPrice)} each</small></span><b>{formatNaira(item.lineTotal)}</b></li>)}</ul>
                {order.specialInstructions && <p className="console-note">Visitor note: {order.specialInstructions}</p>}
                <div className="console-order-bottom"><span>DEMO TOTAL <b>{formatNaira(order.totalNaira)}</b></span><div>
                  {order.status !== "completed" && <button type="button" disabled={busy} onClick={() => void changeStatus(order.reference, "completed")}>Mark completed</button>}
                  {order.status !== "cancelled" && <button type="button" className="console-cancel" disabled={busy} onClick={() => void changeStatus(order.reference, "cancelled")}>Cancel demo</button>}
                  {order.status !== "confirmed" && <button type="button" className="console-reset" disabled={busy} onClick={() => void changeStatus(order.reference, "confirmed")}>Reopen</button>}
                </div></div>
              </article>)}</div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
