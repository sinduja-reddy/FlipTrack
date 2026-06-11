"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";

const CATEGORIES = ["SNEAKERS", "VINYL", "TRADING_CARDS", "VINTAGE_ELECTRONICS"];
const STATUSES = ["PENDING_VALUATION", "AWAITING_APPROVAL", "IN_STOCK", "LISTED", "SOLD"];

type Storefront = { id: string; name: string; slug: string };

export function InventoryFilters({ storefronts }: { storefronts: Storefront[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  return (
    <div className="flex flex-wrap gap-3">
      <input
        type="search"
        placeholder="Search name, brand, SKU..."
        defaultValue={searchParams.get("q") ?? ""}
        onChange={(e) => updateFilter("q", e.target.value)}
        className="border rounded-md px-3 py-1.5 text-sm w-56 bg-white"
      />
      <select
        defaultValue={searchParams.get("storefront") ?? ""}
        onChange={(e) => updateFilter("storefront", e.target.value)}
        className="border rounded-md px-3 py-1.5 text-sm bg-white"
      >
        <option value="">All storefronts</option>
        {storefronts.map((s) => (
          <option key={s.id} value={s.slug}>{s.name}</option>
        ))}
      </select>
      <select
        defaultValue={searchParams.get("category") ?? ""}
        onChange={(e) => updateFilter("category", e.target.value)}
        className="border rounded-md px-3 py-1.5 text-sm bg-white"
      >
        <option value="">All categories</option>
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>{c.replace("_", " ")}</option>
        ))}
      </select>
      <select
        defaultValue={searchParams.get("status") ?? ""}
        onChange={(e) => updateFilter("status", e.target.value)}
        className="border rounded-md px-3 py-1.5 text-sm bg-white"
      >
        <option value="">All statuses</option>
        {STATUSES.map((s) => (
          <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
        ))}
      </select>
    </div>
  );
}
