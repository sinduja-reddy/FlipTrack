"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type Valuation = {
  suggestedLow: number;
  suggestedHigh: number;
  acceptedValue: number | null;
  appraiserNote: string | null;
  modelUsed: string;
  createdAt: string;
};

type Item = {
  id: string;
  sku: string;
  name: string;
  brand: string;
  model: string;
  condition: string;
  purchasePrice: number;
  status: string;
  storefront: { name: string; slug: string };
  valuations: Valuation[];
};

export default function IntakePendingPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [dots, setDots] = useState(".");

  // Animate waiting dots
  useEffect(() => {
    const t = setInterval(() => setDots((d) => (d.length >= 3 ? "." : d + ".")), 600);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    let es: EventSource | null = null;
    let cancelled = false;

    async function fetchItem() {
      try {
        const res = await fetch(`/api/items/${id}`);
        if (!res.ok || cancelled) return;
        const data: Item = await res.json();
        if (!cancelled) {
          setItem(data);
          setLoading(false);
        }
        // Already done before we even connected — no need for SSE
        if (data.status !== "PENDING_VALUATION") {
          es?.close();
        }
      } catch { /* network error — SSE still open */ }
    }

    // Subscribe first to avoid missing the event between fetch and subscribe
    es = new EventSource("/api/events/stream");
    es.onmessage = (e) => {
      const event = JSON.parse(e.data) as { eventName: string; payload: Record<string, unknown> };
      if (
        event.eventName === "valuation/completed" &&
        event.payload?.itemId === id
      ) {
        es?.close();
        fetchItem(); // fetch the full item now that valuation is saved
      }
    };
    es.onerror = () => es?.close();

    // Fetch initial state (handles page reload after valuation already finished)
    fetchItem();

    return () => {
      cancelled = true;
      es?.close();
    };
  }, [id]);

  const valuation = item?.valuations[0] ?? null;
  const isPending = !item || item.status === "PENDING_VALUATION";

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {isPending ? "Valuation in progress" : "Valuation ready"}
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          {isPending
            ? "AI is analysing market data for this item."
            : `${item!.name} · ${item!.sku}`}
        </p>
      </div>

      {/* Waiting state */}
      {isPending && (
        <div className="rounded-lg border bg-white p-8 flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center">
            <span className="text-2xl animate-spin inline-block">⟳</span>
          </div>
          <div>
            <p className="font-medium">Running AI valuation{dots}</p>
            <p className="text-sm text-muted-foreground mt-1">
              This usually takes 5–15 seconds. No need to refresh.
            </p>
          </div>
        </div>
      )}

      {/* Result state */}
      {!isPending && item && valuation && (
        <>
          <div className="rounded-lg border bg-white p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Suggested price range
              </span>
              <span className="text-xs text-muted-foreground">
                via {valuation.modelUsed}
              </span>
            </div>

            <div className="flex items-end gap-3">
              <p className="text-4xl font-bold">
                ${valuation.suggestedLow.toLocaleString()}
                <span className="text-2xl font-normal text-muted-foreground mx-2">–</span>
                ${valuation.suggestedHigh.toLocaleString()}
              </p>
            </div>

            <div className="text-xs text-muted-foreground bg-zinc-50 rounded p-3">
              Purchased for{" "}
              <span className="font-medium text-foreground">
                ${item.purchasePrice.toLocaleString()}
              </span>
              {" "}· Potential margin{" "}
              <span className="font-medium text-foreground">
                ${(valuation.suggestedLow - item.purchasePrice).toLocaleString()} –{" "}
                ${(valuation.suggestedHigh - item.purchasePrice).toLocaleString()}
              </span>
            </div>

            <hr />

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Item</p>
                <p className="font-medium">{item.name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Condition</p>
                <p className="font-medium">{item.condition}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Storefront</p>
                <p className="font-medium">{item.storefront.name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <p className="font-medium">{item.status.replace(/_/g, " ")}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Link
              href={`/inventory/${item.id}`}
              className="flex-1 text-center text-sm font-medium px-4 py-2 rounded-md bg-primary text-primary-foreground hover:opacity-90"
            >
              View full details
            </Link>
            <Link
              href="/intake"
              className="flex-1 text-center text-sm font-medium px-4 py-2 rounded-md border bg-white hover:bg-zinc-50"
            >
              Add another item
            </Link>
          </div>
        </>
      )}

      {/* Edge case: valuation missing even though status moved on */}
      {!isPending && item && !valuation && (
        <div className="rounded-lg border bg-white p-6 text-sm text-muted-foreground">
          Valuation data unavailable.{" "}
          <Link href={`/inventory/${item.id}`} className="underline">
            View item
          </Link>
        </div>
      )}
    </div>
  );
}
