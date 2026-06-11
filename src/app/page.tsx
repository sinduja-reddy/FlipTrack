import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { EventFeed } from "@/components/event-feed";

async function getStats() {
  const [total, awaitingApproval, inStock, listed] = await Promise.all([
    prisma.item.count(),
    prisma.item.count({ where: { status: "AWAITING_APPROVAL" } }),
    prisma.item.count({ where: { status: "IN_STOCK" } }),
    prisma.item.count({ where: { status: "LISTED" } }),
  ]);
  return { total, awaitingApproval, inStock, listed };
}

export default async function DashboardPage() {
  const { total, awaitingApproval, inStock, listed } = await getStats();

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
      <EventFeed />

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

