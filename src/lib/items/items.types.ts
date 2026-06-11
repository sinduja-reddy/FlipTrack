export type CreateItemInput = {
  storefrontId: string;
  sku: string;
  name: string;
  category: string;
  subCategory?: string;
  brand: string;
  model: string;
  condition: string;
  size?: string;
  purchasePrice: number;
};

export type ItemFilters = {
  storefront?: string; // storefront slug
  category?: string;
  status?: string;
  q?: string;
};

export type ItemSummary = {
  id: string;
  sku: string;
  name: string;
  brand: string;
  condition: string;
  purchasePrice: unknown;
  listedPrice: unknown;
  status: string;
  storefront: { name: string; slug: string };
  valuations: {
    suggestedLow: unknown;
    suggestedHigh: unknown;
    acceptedValue: unknown;
  }[];
};

export type ItemDetail = {
  id: string;
  sku: string;
  name: string;
  brand: string;
  model: string;
  condition: string;
  size: string | null;
  category: string;
  subCategory: string | null;
  purchasePrice: unknown;
  listedPrice: unknown;
  status: string;
  storefront: { id: string; name: string; slug: string; category: string };
  valuations: {
    id: string;
    suggestedLow: unknown;
    suggestedHigh: unknown;
    acceptedValue: unknown;
    aiResponse: string;
    appraiserNote: string | null;
    inngestRunId: string;
    modelUsed: string;
    createdAt: Date;
  }[];
  transactions: {
    id: string;
    type: string;
    salePrice: unknown;
    notes: string | null;
    createdAt: Date;
  }[];
};
