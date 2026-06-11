export type CreateValuationInput = {
  itemId: string;
  inputSnapshot: object;
  aiPrompt: string;
  aiResponse: string;
  suggestedLow: number;
  suggestedHigh: number;
  inngestRunId: string;
  modelUsed: string;
};

export type AcceptValuationInput = {
  valuationId: string;
  acceptedValue: number;
  appraiserNote?: string;
};
