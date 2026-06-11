import { NotFoundError } from "@/lib/errors";
import { ItemsRepository } from "./items.repository";
import { inngest } from "../../../inngest/client";
import type { ItemFilters, CreateItemInput } from "./items.types";

export const ItemsService = {
  async list(filters: ItemFilters) {
    return ItemsRepository.findMany(filters);
  },

  async getById(id: string) {
    const item = await ItemsRepository.findById(id);
    if (!item) throw new NotFoundError(`Item ${id} not found`);
    return item;
  },

  async create(input: CreateItemInput) {
    const item = await ItemsRepository.create(input);

    inngest
      .send({ name: "item/intake.submitted", data: { itemId: item.id, category: input.category } })
      .catch((err) => console.error("[inngest] failed to send event:", err));

    return item;
  },

  async updateStatus(id: string, status: string) {
    return ItemsRepository.updateStatus(id, status);
  },
};
