import { StorefrontsRepository } from "./storefronts.repository";

export const StorefrontsService = {
  async list() {
    return StorefrontsRepository.findAll();
  },
};
