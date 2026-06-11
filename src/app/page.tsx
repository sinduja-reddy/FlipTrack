import { prisma } from "@/lib/prisma";
import Link from "next/link";

async function getStats() {
  const [total, awaitingApproval, inStock, listed, events] = await Promise.all([
    prisma.item.count(),
    prisma.item.count({ where: { status: "AWAITING_APPROVAL" } }),
    prisma.item.count({ where: { status: "IN_STOCK" } }),
    prisma.item.count({ where: { status: "LISTED" } }),
    prisma.eventLog.findMany({ orderBy: { createdAt: "desc" }, take: 12 }),
  ]);
  return { total, awaitingApproval, inStock, listed, events };
}

export default async function DashboardPage() {
  const { total, awaitingApproval, inStock, listed, events } = await getStats();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Overview across all storefronts.</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="Total items" value={total} />
        <KpiCard label="Awaiting approval" value={awaitingApproval} highlight={awaitingApproval > 0} />
        <KpiCard label="In stock" value={inStock} />
        <KpiCard label="Listed" value={listed} />
      </div>

      {/* Live event feed */}
      <div className="rounded-lg border bg-white">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <h2 className="font-semibold">Event feed</h2>
          <span className="text-xs text-muted-foreground">Last {events.length} events</span>
        </div>

        {events.length === 0 ? (
          <div className="px-5 py-8 text-sm text-muted-foreground text-center">
            No events yet. Add an item to see the event flow.
          </div>
        ) : (
          <ul className="divide-y">
            {events.map((e) => {
              const payload = e.payload as Record<string, unknown>;
              return (
                <li key={e.id} className="flex items-start gap-4 px-5 py-3">
                  <EventDot name={e.eventName} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-mono font-medium">{e.eventName}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {Object.entries(payload)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(" · ")}
                    </p>
                  </div>
                  <time className="text-xs text-muted-foreground shrink-0 pt-0.5">
                    {new Date(e.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </time>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Quick links */}
      <div className="flex gap-3">
        <Link
          href="/intake"
          className="text-sm font-medium px-4 py-2 rounded-md bg-primary text-primary-foreground hover:opacity-90"
        >
          Add item
        </Link>
        <Link
          href="/inventory"
          className="text-sm font-medium px-4 py-2 rounded-md border bg-white hover:bg-zinc-50"
        >
          View inventory
        </Link>
      </div>
    </div>
  );
}

function KpiCard({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className={`rounded-lg border bg-white p-5 space-y-1 ${highlight ? "border-amber-300 bg-amber-50" : ""}`}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-3xl font-bold tracking-tight">{value}</p>
    </div>
  );
}

function EventDot({ name }: { name: string }) {
  const color =
    name.includes("accepted") ? "bg-green-500" :
    name.includes("completed") ? "bg-blue-500" :
    name.includes("submitted") ? "bg-violet-500" :
    "bg-zinc-400";

  return <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${color}`} />;
}
