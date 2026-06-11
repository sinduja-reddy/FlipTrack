import { NotFoundError } from "@/lib/errors";
import { ItemsRepository } from "./items.repository";
import type { ItemFilters } from "./items.types";

export const ItemsService = {
  async list(filters: ItemFilters) {
    return ItemsRepository.findMany(filters);
  },

  async getById(id: string) {
    const item = await ItemsRepository.findById(id);
    if (!item) throw new NotFoundError(`Item ${id} not found`);
    return item;
  },
};
