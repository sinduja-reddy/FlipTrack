export type ValuationInput = {
  category: string;
  brand: string;
  model: string;
  condition: string;
  size?: string | null;
  subCategory?: string | null;
};

const CATEGORY_CONTEXT: Record<string, string> = {
  SNEAKERS: `
You are a sneaker resale expert with deep knowledge of StockX, GOAT, and eBay markets.
Key value drivers: brand, model, colorway, size (US 9-11 most liquid), condition (deadstock vs worn), original box.
Reference StockX last sale prices and typical bid/ask spreads.`,

  VINYL: `
You are a vinyl record valuation expert familiar with Discogs marketplace pricing.
Key value drivers: artist, album, pressing year, country of origin, label, vinyl grade (M/NM/VG+/VG/G), sleeve condition.
Reference Discogs market data and recent sales.`,

  TRADING_CARDS: `
You are a trading card grading and valuation expert familiar with PSA, BGS, CGC grading and recent auction results.
Key value drivers: card name, set, year, grade (PSA 9/10, BGS 9.5), recent comparable sales on eBay and PWCC.`,

  VINTAGE_ELECTRONICS: `
You are a vintage electronics collector and resale expert.
Key value drivers: brand, model, year, working condition, original accessories/packaging, collector demand.
Reference eBay sold listings and collector community pricing.`,
};

export function buildValuationPrompt(input: ValuationInput): string {
  const context = CATEGORY_CONTEXT[input.category] ?? "";

  return `${context}

Item to value:
- Category: ${input.category.replace(/_/g, " ")}
${input.subCategory ? `- Sub-category: ${input.subCategory}` : ""}
- Brand: ${input.brand}
- Model: ${input.model}
- Condition: ${input.condition}
${input.size ? `- Size: ${input.size}` : ""}

Provide a realistic market valuation with:
1. A suggested price range (low and high) in USD
2. A brief explanation of the key value drivers for this specific item
3. Any condition or market factors that significantly affect the price

Respond in this exact JSON format:
{
  "suggestedLow": <number>,
  "suggestedHigh": <number>,
  "reasoning": "<2-3 sentence explanation>"
}`;
}
