"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { formatNaira } from "@/lib/menu";
import type { DemoOrder, DemoOrderStatus } from "@/lib/demo-orders";

const statusCopy: Record<DemoOrderStatus, string> = {
  confirmed: "Your demo order is confirmed",
  completed: "Your demo order is complete",
  cancelled: "This demo order was cancelled",
};

export default function TrackDemoOrderPage() {
  const [reference, setReference] = useState("");
  const [token, setToken] = useState("");
  const [order, setOrder] = useState<DemoOrder | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [notice, setNotice] = useState("");
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | "unsupported">("default");
  const previousStatus = useRef<DemoOrderStatus | null>(null);

  const lookup = useCallback(async (ref: string, secret: string) => {
    setLoading(true);
    setMessage("");
    setOrder(null);
    previousStatus.current = null;
    try {
      const params = new URLSearchParams({ reference: ref, token: secret });
      const response = await fetch(`/api/orders/track?${params.toString()}`, { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "We couldn't find that order.");
      const nextOrder = result.order as DemoOrder;
      setOrder(nextOrder);
      previousStatus.current = nextOrder.status;
      setLastUpdated(new Date());
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Tracking is temporarily unavailable.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setNotificationPermission("Notification" in window ? Notification.permission : "unsupported");
    });
    return () => window.cancelAnimationFrame(frame);
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

  useEffect(() => {
    if (!order) return;
    let active = true;
    const params = new URLSearchParams({ reference: order.reference, token });
    const poll = async () => {
      try {
        const response = await fetch(`/api/orders/track?${params.toString()}`, { cache: "no-store" });
        if (!response.ok) return;
        const result = await response.json();
        const nextOrder = result.order as DemoOrder;
        if (!active || !nextOrder) return;
        const oldStatus = previousStatus.current;
        if (oldStatus && nextOrder.status !== oldStatus) {
          const text = statusCopy[nextOrder.status];
          setNotice(text);
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification("Pâtissö order update", { body: text });
          }
          previousStatus.current = nextOrder.status;
        }
        setOrder(nextOrder);
        setLastUpdated(new Date());
      } catch {
        // Keep the last confirmed view visible; the next polling cycle will retry.
      }
    };
    const timer = window.setInterval(poll, 10000);
    return () => { active = false; window.clearInterval(timer); };
  }, [order?.reference, token]);

  async function enableNotifications() {
    if (!("Notification" in window)) return;
    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
    if (permission === "granted") {
      setNotice("Notifications are enabled on this device while this tracking page is open.");
    } else if (permission === "denied") {
      setNotice("Browser notifications are blocked. Live updates will still appear on this page.");
    }
  }

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
            {notice && <p className="track-live-notice" role="status">{notice}</p>}
            <div className="track-status"><span className={"track-status-dot track-status-dot--" + order.status} /> {statusCopy[order.status]}</div>
            <div className="track-progress" aria-label={`Order status: ${order.status}`}>
              {(["confirmed", "completed"] as const).map((step, index) => {
                const reached = order.status === "completed" || (order.status === "confirmed" && step === "confirmed");
                const current = order.status === step;
                return <div className={"track-progress-step" + (reached ? " is-reached" : "") + (current ? " is-current" : "")} key={step}>
                  <span>{reached ? "✓" : index + 1}</span><b>{step === "confirmed" ? "Confirmed" : "Completed"}</b>
                </div>;
              })}
              {order.status === "cancelled" && <p className="track-cancelled-note">This order was cancelled.</p>}
            </div>
            <p className="track-created">Created {new Date(order.createdAt).toLocaleString()}</p>
            {lastUpdated && <p className="track-updated">Last checked {lastUpdated.toLocaleTimeString()} · refreshes automatically every 10 seconds</p>}
            {notificationPermission === "default" && <button className="track-notification-button" type="button" onClick={enableNotifications}>Enable browser notifications</button>}
            {notificationPermission === "granted" && <p className="track-notification-enabled">Browser notifications enabled for this page.</p>}
            {notificationPermission === "denied" && <p className="track-notification-enabled">Browser notifications are blocked; live page updates remain active.</p>}
            {notificationPermission === "unsupported" && <p className="track-notification-enabled">This browser does not support desktop notifications; live page updates remain active.</p>}
            <ul>
              {order.items.map((item) => <li key={item.name}><span>{item.name} × {item.quantity}<small>{formatNaira(item.unitPrice)} each</small></span><b>{formatNaira(item.lineTotal)}</b></li>)}
            </ul>
            <div className="track-total"><span>ORDER TOTAL</span><b>{formatNaira(order.totalNaira)}</b></div>
            {order.specialInstructions && <p className="track-note">Note: {order.specialInstructions}</p>}
            <p className="track-disclaimer">This is a centrally stored portfolio demo. It is not connected to a live restaurant, kitchen, payment or delivery service.</p>
          </section>
        )}
      </section>
    </main>
  );
}
