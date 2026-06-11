import { inngest } from "../client";

export const updateItemStatus = inngest.createFunction(
  { id: "update-item-status", triggers: [{ event: "valuation/completed" }] },
  async ({ event, step }) => {
    // TODO: implement in Day 4
    const { itemId } = event.data;
    return { itemId };
  }
);
