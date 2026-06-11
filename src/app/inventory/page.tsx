import { ItemsService } from "@/lib/items/items.service";
import { StorefrontsService } from "@/lib/storefronts/storefronts.service";
import { InventoryFilters } from "@/components/inventory-filters";
import Link from "next/link";

const STATUS_COLOURS: Record<string, string> = {
  PENDING_VALUATION: "bg-yellow-100 text-yellow-800",
  AWAITING_APPROVAL: "bg-blue-100 text-blue-800",
  IN_STOCK:          "bg-green-100 text-green-800",
  LISTED:            "bg-purple-100 text-purple-800",
  SOLD:              "bg-zinc-100 text-zinc-600",
};

function str(v: string | string[] | undefined): string | undefined {
  if (!v) return undefined;
  return Array.isArray(v) ? v[0] : v;
}

export default async function InventoryPage({ searchParams }: PageProps<"/inventory">) {
  const sp = await searchParams;

  const filters = {
    storefront: str(sp.storefront),
    category:   str(sp.category),
    status:     str(sp.status),
    q:          str(sp.q),
  };

  const [items, storefronts] = await Promise.all([
    ItemsService.list(filters),
    StorefrontsService.list(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{items.length} items</p>
        </div>
        <Link
          href="/intake"
          className="bg-primary text-primary-foreground text-sm font-medium px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
        >
          + Add Item
        </Link>
      </div>

      <InventoryFilters storefronts={storefronts} />

      <div className="rounded-lg border bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b bg-zinc-50">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">SKU</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Item</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Storefront</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Condition</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Purchase</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Listed</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {items.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                  No items found.
                </td>
              </tr>
            )}
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-zinc-50 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{item.sku}</td>
                <td className="px-4 py-3">
                  <Link href={`/inventory/${item.id}`} className="font-medium hover:underline">
                    {item.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">{item.brand}</p>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{item.storefront.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{item.condition}</td>
                <td className="px-4 py-3">${Number(item.purchasePrice).toLocaleString()}</td>
                <td className="px-4 py-3">
                  {item.listedPrice ? `$${Number(item.listedPrice).toLocaleString()}` : "—"}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOURS[item.status]}`}>
                    {item.status.replace(/_/g, " ")}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
