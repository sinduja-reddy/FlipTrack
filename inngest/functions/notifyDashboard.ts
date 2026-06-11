import { inngest } from "../client";

export const notifyDashboard = inngest.createFunction(
  { id: "notify-dashboard", triggers: [{ event: "valuation/completed" }] },
  async ({ event, step }) => {
    // TODO: implement in Day 4
    const { itemId } = event.data;
    return { itemId };
  }
);
