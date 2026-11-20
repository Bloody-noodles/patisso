"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { formatTsh } from "@/lib/menu";
import { findDemoOrder, type DemoOrder } from "@/lib/demo-orders";

export default function TrackDemoOrderPage() {
  const [reference, setReference] = useState("");
  const [order, setOrder] = useState<DemoOrder | null>(null);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const refreshOrder = () => {
      if (reference.trim()) setOrder(findDemoOrder(reference));
    };
    window.addEventListener("storage", refreshOrder);
    return () => window.removeEventListener("storage", refreshOrder);
  }, [reference]);

  function trackOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setOrder(findDemoOrder(reference));
    setSearched(true);
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
        <p className="track-intro">Enter the reference shown on your demo receipt to view the order saved in this browser.</p>
        <form className="track-form" onSubmit={trackOrder}>
          <label htmlFor="order-reference">ORDER REFERENCE</label>
          <input id="order-reference" value={reference} onChange={(event) => setReference(event.target.value)} placeholder="e.g. A1B2C3D4" required autoComplete="off" />
          <button type="submit">Find demo order ↗</button>
        </form>
        {searched && !order && <p className="track-not-found" role="status">We couldn't find that reference in this browser. Check the code or use the same browser where you created the demo order.</p>}
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
            <p className="track-disclaimer">This is a browser-saved portfolio demo. It is not connected to a live restaurant, kitchen, payment or delivery service. Demo tracking is available only in the browser and device where the order was created.</p>
          </section>
        )}
      </section>
    </main>
  );
}
