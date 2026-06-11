import { ItemsService } from "@/lib/items/items.service";
import { notFound } from "next/navigation";
import { NotFoundError } from "@/lib/errors";
import Link from "next/link";

export default async function ItemDetailPage({ params }: PageProps<"/inventory/[id]">) {
  const { id } = await params;

  let item;
  try {
    item = await ItemsService.getById(id);
  } catch (err) {
    if (err instanceof NotFoundError) notFound();
    throw err;
  }

  const latestValuation = item.valuations[0];

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/inventory" className="hover:underline">Inventory</Link>
        <span>/</span>
        <span className="text-foreground font-medium">{item.name}</span>
      </div>

      <div className="rounded-lg border bg-white p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold">{item.name}</h1>
            <p className="text-muted-foreground text-sm">{item.storefront.name} · {item.sku}</p>
          </div>
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-zinc-100 text-zinc-700">
            {item.status.replace(/_/g, " ")}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <Detail label="Brand" value={item.brand} />
          <Detail label="Model" value={item.model} />
          <Detail label="Condition" value={item.condition} />
          {item.size && <Detail label="Size" value={item.size} />}
          <Detail label="Category" value={item.category.replace(/_/g, " ")} />
          {item.subCategory && <Detail label="Sub-category" value={item.subCategory} />}
          <Detail label="Purchase price" value={`$${Number(item.purchasePrice).toLocaleString()}`} />
          <Detail label="Listed price" value={item.listedPrice ? `$${Number(item.listedPrice).toLocaleString()}` : "—"} />
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6 space-y-4">
        <h2 className="font-semibold">Latest Valuation</h2>
        {!latestValuation ? (
          <p className="text-sm text-muted-foreground">No valuation yet.</p>
        ) : (
          <div className="space-y-3 text-sm">
            <div className="flex gap-6">
              <Detail label="Suggested range" value={`$${Number(latestValuation.suggestedLow).toLocaleString()} – $${Number(latestValuation.suggestedHigh).toLocaleString()}`} />
              <Detail label="Accepted value" value={latestValuation.acceptedValue ? `$${Number(latestValuation.acceptedValue).toLocaleString()}` : "—"} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">AI response</p>
              <p className="text-sm bg-zinc-50 rounded-md p-3 border">{latestValuation.aiResponse}</p>
            </div>
            {latestValuation.appraiserNote && (
              <Detail label="Appraiser note" value={latestValuation.appraiserNote} />
            )}
            <p className="text-xs text-muted-foreground">
              Model: {latestValuation.modelUsed} · Run: {latestValuation.inngestRunId}
            </p>
          </div>
        )}
      </div>

      {item.valuations.length > 1 && (
        <div className="rounded-lg border bg-white p-6 space-y-3">
          <h2 className="font-semibold">Valuation History</h2>
          <div className="space-y-2">
            {item.valuations.map((v) => (
              <div key={v.id} className="flex items-center justify-between text-sm border-b pb-2 last:border-0">
                <span className="text-muted-foreground">{new Date(v.createdAt).toLocaleDateString()}</span>
                <span>${Number(v.suggestedLow).toLocaleString()} – ${Number(v.suggestedHigh).toLocaleString()}</span>
                <span>{v.acceptedValue ? `Accepted $${Number(v.acceptedValue).toLocaleString()}` : "Not accepted"}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
