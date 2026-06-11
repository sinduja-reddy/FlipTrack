export type StorefrontSummary = {
  id: string;
  name: string;
  slug: string;
  category: string;
  createdAt: Date;
  _count: { items: number };
};
