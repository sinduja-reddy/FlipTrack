import { inngest } from "../client";

export const runAIValuation = inngest.createFunction(
  { id: "run-ai-valuation", triggers: [{ event: "item/intake.submitted" }] },
  async ({ event, step }) => {
    // TODO: implement in Day 3
    const { itemId } = event.data;
    return { itemId };
  }
);
