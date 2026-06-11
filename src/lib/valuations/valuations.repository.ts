import { prisma } from "@/lib/prisma";
import type { CreateValuationInput, AcceptValuationInput } from "./valuations.types";

export const ValuationsRepository = {
  async create(input: CreateValuationInput) {
    return prisma.valuation.create({ data: input });
  },

  async accept({ valuationId, acceptedValue, appraiserNote }: AcceptValuationInput) {
    return prisma.valuation.update({
      where: { id: valuationId },
      data: { acceptedValue, appraiserNote },
    });
  },

  async findByItemId(itemId: string) {
    return prisma.valuation.findMany({
      where: { itemId },
      orderBy: { createdAt: "desc" },
    });
  },

  async findAll() {
    return prisma.valuation.findMany({
      orderBy: { createdAt: "desc" },
      include: { item: { select: { id: true, name: true, sku: true, category: true } } },
    });
  },
};
