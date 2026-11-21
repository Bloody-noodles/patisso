"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { formatTsh } from "@/lib/menu";
import type { DemoOrder } from "@/lib/demo-orders";

export default function TrackDemoOrderPage() {
  const [reference, setReference] = useState("");
  const [token, setToken] = useState("");
  const [order, setOrder] = useState<DemoOrder | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const lookup = useCallback(async (ref: string, secret: string) => {
    setLoading(true);
    setMessage("");
    setOrder(null);
    try {
      const params = new URLSearchParams({ reference: ref, token: secret });
      const response = await fetch(`/api/orders/track?${params.toString()}`, { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "We couldn't find that order.");
      setOrder(result.order as DemoOrder);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Tracking is temporarily unavailable.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get("reference") ?? "";
      const secret = params.get("token") ?? "";
      if (ref && secret) {
        setReference(ref);
        setToken(secret);
        void lookup(ref, secret);
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [lookup]);

  function trackOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void lookup(reference.trim().toUpperCase(), token.trim());
  }

  return (
    <main className="track-page">
      <header className="track-header">
        <Link className="wordmark" href="/">pâtissö<span>®</span></Link>
        <Link className="track-back" href="/">Back to the menu ↗</Link>
      </header>
      <section className="track-content">
        <p className="voice-kicker">THE PÂTISSÖ TABLE</p>
        <h1>Follow your<br /><em>demo order.</em></h1>
        <p className="track-intro">Use the private tracking link from your demo receipt. The link contains a unique access key for this order.</p>
        <form className="track-form" onSubmit={trackOrder}>
          <label htmlFor="order-reference">ORDER REFERENCE</label>
          <input id="order-reference" value={reference} onChange={(event) => setReference(event.target.value)} placeholder="e.g. A1B2C3D4" required autoComplete="off" />
          <label htmlFor="tracking-token">PRIVATE TRACKING KEY</label>
          <input id="tracking-token" value={token} onChange={(event) => setToken(event.target.value)} placeholder="Paste the key from your private tracking link" required autoComplete="off" />
          <button type="submit" disabled={loading}>{loading ? "Checking…" : "Find demo order ↗"}</button>
        </form>
        {message && <p className="track-not-found" role="status">{message}</p>}
        {order && (
          <section className="track-receipt" aria-live="polite">
            <div className="track-receipt-top"><span>DEMO ORDER FOUND</span><b>#{order.reference}</b></div>
            <div className="track-status"><span className={"track-status-dot track-status-dot--" + order.status} /> {order.status === "confirmed" ? "Demo order confirmed" : order.status === "completed" ? "Demo order marked complete" : "Demo order cancelled"}</div>
            <p className="track-created">Created {new Date(order.createdAt).toLocaleString()}</p>
            <ul>
              {order.items.map((item) => <li key={item.name}><span>{item.name} × {item.quantity}<small>{formatTsh(item.unitPrice)} each</small></span><b>{formatTsh(item.lineTotal)}</b></li>)}
            </ul>
            <div className="track-total"><span>ORDER TOTAL</span><b>{formatTsh(order.totalTsh)}</b></div>
            {order.specialInstructions && <p className="track-note">Note: {order.specialInstructions}</p>}
            <p className="track-disclaimer">This is a centrally stored portfolio demo. It is not connected to a live restaurant, kitchen, payment or delivery service.</p>
          </section>
        )}
      </section>
    </main>
  );
}
