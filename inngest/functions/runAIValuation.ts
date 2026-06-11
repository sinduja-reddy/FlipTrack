import { inngest } from "../client";
import { openai } from "@/lib/openai";
import { buildValuationPrompt } from "@/lib/items/valuation-prompt";
import { ValuationsRepository } from "@/lib/valuations/valuations.repository";
import { ItemsRepository } from "@/lib/items/items.repository";
import { prisma } from "@/lib/prisma";

const MODEL = "gpt-4o-mini";

export const runAIValuation = inngest.createFunction(
  {
    id: "run-ai-valuation",
    triggers: [{ event: "item/intake.submitted" }],
    retries: 3,
  },
  async ({ event, step, runId }) => {
    const { itemId } = event.data;

    // Step 1 — fetch item from DB
    const item = await step.run("fetch-item", async () => {
      return ItemsRepository.findById(itemId);
    });

    if (!item) throw new Error(`Item ${itemId} not found`);

    // Step 2 — check not already valuated (idempotency)
    const alreadyDone = await step.run("check-idempotency", async () => {
      const existing = await prisma.valuation.findFirst({
        where: { itemId, inngestRunId: runId },
      });
      return !!existing;
    });

    if (alreadyDone) return { skipped: true, itemId };

    // Step 3 — build prompt + call OpenAI
    const aiResult = await step.run("call-openai", async () => {
      const prompt = buildValuationPrompt({
        category:    item.category,
        brand:       item.brand,
        model:       item.model,
        condition:   item.condition,
        size:        item.size,
        subCategory: item.subCategory,
      });

      const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });

      const content = response.choices[0].message.content ?? "{}";
      const parsed = JSON.parse(content) as {
        suggestedLow: number;
        suggestedHigh: number;
        reasoning: string;
      };

      return { prompt, content, parsed };
    });

    // Step 4 — save valuation to DB
    await step.run("save-valuation", async () => {
      await ValuationsRepository.create({
        itemId,
        inputSnapshot: {
          category:    item.category,
          brand:       item.brand,
          model:       item.model,
          condition:   item.condition,
          size:        item.size,
          subCategory: item.subCategory,
        },
        aiPrompt:     aiResult.prompt,
        aiResponse:   aiResult.parsed.reasoning,
        suggestedLow:  aiResult.parsed.suggestedLow,
        suggestedHigh: aiResult.parsed.suggestedHigh,
        inngestRunId:  runId,
        modelUsed:     MODEL,
      });
    });

    // Step 5 — update item status + log event
    await step.run("update-status", async () => {
      await ItemsRepository.updateStatus(itemId, "AWAITING_APPROVAL");
      await prisma.eventLog.create({
        data: {
          eventName: "valuation/completed",
          payload: {
            itemId,
            suggestedLow:  aiResult.parsed.suggestedLow,
            suggestedHigh: aiResult.parsed.suggestedHigh,
          },
        },
      });
    });

    // Step 6 — fire valuation/completed event for other handlers
    await step.run("fire-completed-event", async () => {
      await inngest.send({
        name: "valuation/completed",
        data: {
          itemId,
          suggestedLow:  aiResult.parsed.suggestedLow,
          suggestedHigh: aiResult.parsed.suggestedHigh,
        },
      });
    });

    return {
      itemId,
      suggestedLow:  aiResult.parsed.suggestedLow,
      suggestedHigh: aiResult.parsed.suggestedHigh,
    };
  }
);
