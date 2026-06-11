import { prisma } from "@/lib/prisma";
import type { StorefrontSummary } from "./storefronts.types";

export const StorefrontsRepository = {
  async findAll(): Promise<StorefrontSummary[]> {
    return prisma.storefront.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { items: true } } },
    }) as unknown as StorefrontSummary[];
  },

  async findBySlug(slug: string) {
    return prisma.storefront.findUnique({ where: { slug } });
  },
};
