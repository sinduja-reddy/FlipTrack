import { prisma } from "@/lib/prisma";
import type { ItemFilters, ItemSummary, ItemDetail } from "./items.types";

function buildWhere(filters: ItemFilters) {
  const { storefront, category, status, q } = filters;
  return {
    ...(storefront && { storefront: { slug: storefront } }),
    ...(category && { category: category as never }),
    ...(status && { status: status as never }),
    ...(q && {
      OR: [
        { name: { contains: q, mode: "insensitive" as const } },
        { brand: { contains: q, mode: "insensitive" as const } },
        { sku: { contains: q, mode: "insensitive" as const } },
      ],
    }),
  };
}

export const ItemsRepository = {
  async findMany(filters: ItemFilters): Promise<ItemSummary[]> {
    return prisma.item.findMany({
      where: buildWhere(filters),
      include: {
        storefront: { select: { name: true, slug: true } },
        valuations: { orderBy: { createdAt: "desc" }, take: 1 },
      },
      orderBy: { createdAt: "desc" },
    }) as unknown as ItemSummary[];
  },

  async findById(id: string): Promise<ItemDetail | null> {
    return prisma.item.findUnique({
      where: { id },
      include: {
        storefront: true,
        valuations: { orderBy: { createdAt: "desc" } },
        transactions: { orderBy: { createdAt: "desc" } },
      },
    }) as unknown as ItemDetail | null;
  },

  async count(filters: ItemFilters): Promise<number> {
    return prisma.item.count({ where: buildWhere(filters) });
  },
};
