import { ValuationsService } from "@/lib/valuations/valuations.service";
import Link from "next/link";

export default async function ValuationsPage() {
  const valuations = await ValuationsService.list() as unknown as ValuationRow[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Valuations</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Full audit log of every AI appraisal.
        </p>
      </div>

      {valuations.length === 0 ? (
        <div className="rounded-lg border bg-white px-5 py-12 text-center text-sm text-muted-foreground">
          No valuations yet.{" "}
          <Link href="/intake" className="underline">Add an item</Link> to trigger one.
        </div>
      ) : (
        <div className="rounded-lg border bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-zinc-50 text-left text-xs text-muted-foreground">
                <th className="px-4 py-3 font-medium">Item</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">AI range</th>
                <th className="px-4 py-3 font-medium">Accepted</th>
                <th className="px-4 py-3 font-medium">Model</th>
                <th className="px-4 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {valuations.map((v) => (
                <tr key={v.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link
                      href={`/inventory/${v.item.id ?? ""}`}
                      className="font-medium hover:underline"
                    >
                      {v.item.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">{v.item.sku}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {v.item.category.replace(/_/g, " ")}
                  </td>
                  <td className="px-4 py-3 font-mono">
                    ${Number(v.suggestedLow).toLocaleString()} – ${Number(v.suggestedHigh).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    {v.acceptedValue ? (
                      <span className="font-medium text-green-700">
                        ${Number(v.acceptedValue).toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                    {v.modelUsed}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {new Date(v.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

type ValuationRow = {
  id: string;
  suggestedLow: unknown;
  suggestedHigh: unknown;
  acceptedValue: unknown;
  modelUsed: string;
  createdAt: Date;
  item: { id: string; name: string; sku: string; category: string };
};
