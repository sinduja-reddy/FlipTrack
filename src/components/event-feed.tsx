"use client";

import { useEffect, useState } from "react";

type EventEntry = {
  id: string;
  eventName: string;
  payload: Record<string, unknown>;
  createdAt: string;
};

function EventDot({ name }: { name: string }) {
  const color =
    name.includes("accepted") ? "bg-green-500" :
    name.includes("completed") ? "bg-blue-500" :
    name.includes("submitted") ? "bg-violet-500" :
    "bg-zinc-400";
  return <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${color}`} />;
}

export function EventFeed() {
  const [events, setEvents] = useState<EventEntry[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const es = new EventSource("/api/events/stream");

    es.onopen = () => setConnected(true);

    es.onmessage = (e) => {
      const event = JSON.parse(e.data) as EventEntry;
      setEvents((prev) => {
        // prepend, deduplicate, cap at 12
        const deduped = prev.filter((x) => x.id !== event.id);
        return [event, ...deduped].slice(0, 12);
      });
    };

    es.onerror = () => {
      setConnected(false);
      es.close();
    };

    return () => es.close();
  }, []);

  return (
    <div className="rounded-lg border bg-white">
      <div className="px-5 py-4 border-b flex items-center justify-between">
        <h2 className="font-semibold">Event feed</h2>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${connected ? "bg-green-500" : "bg-zinc-300"}`} />
          <span className="text-xs text-muted-foreground">
            {connected ? "live" : "connecting…"}
          </span>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="px-5 py-8 text-sm text-muted-foreground text-center">
          No events yet. Add an item to see the event flow.
        </div>
      ) : (
        <ul className="divide-y">
          {events.map((e) => (
            <li key={e.id} className="flex items-start gap-4 px-5 py-3">
              <EventDot name={e.eventName} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-mono font-medium">{e.eventName}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {Object.entries(e.payload)
                    .map(([k, v]) => `${k}: ${v}`)
                    .join(" · ")}
                </p>
              </div>
              <time className="text-xs text-muted-foreground shrink-0 pt-0.5">
                {new Date(e.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </time>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
