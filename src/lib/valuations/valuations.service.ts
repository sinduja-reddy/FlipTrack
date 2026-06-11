import { NotFoundError } from "@/lib/errors";
import { ValuationsRepository } from "./valuations.repository";
import type { AcceptValuationInput } from "./valuations.types";

export const ValuationsService = {
  async list() {
    return ValuationsRepository.findAll();
  },

  async accept(input: AcceptValuationInput) {
    const updated = await ValuationsRepository.accept(input);
    if (!updated) throw new NotFoundError(`Valuation ${input.valuationId} not found`);
    return updated;
  },
};
