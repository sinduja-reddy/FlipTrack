import { NotFoundError } from "@/lib/errors";
import { ValuationsRepository } from "./valuations.repository";
import { ItemsRepository } from "@/lib/items/items.repository";
import { prisma } from "@/lib/prisma";
import { inngest } from "../../../inngest/client";
import type { AcceptValuationInput } from "./valuations.types";

export const ValuationsService = {
  async list() {
    return ValuationsRepository.findAll();
  },

  async accept(input: AcceptValuationInput) {
    const updated = await ValuationsRepository.accept(input);
    if (!updated) throw new NotFoundError(`Valuation ${input.valuationId} not found`);

    await ItemsRepository.updateStatus(updated.itemId, "IN_STOCK");

    await prisma.eventLog.create({
      data: {
        eventName: "item/valuation.accepted",
        payload: {
          itemId: updated.itemId,
          valuationId: updated.id,
          acceptedValue: input.acceptedValue,
        },
      },
    });

    inngest
      .send({
        name: "item/valuation.accepted",
        data: { itemId: updated.itemId, acceptedValue: input.acceptedValue },
      })
      .catch((err) => console.error("[inngest] failed to send event:", err));

    return updated;
  },
};
