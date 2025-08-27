export const buyKeys = {
  root: ["buy"] as const,
  list: () => [...buyKeys.root, "list"] as const,
  myListings: () => [...buyKeys.root, "myListings"] as const,
  myPurchases: () => [...buyKeys.root, "myPurchases"] as const,
  detail: (slug: string) => [...buyKeys.root, "detail", slug] as const,
  pending: (buy_id: string) => [...buyKeys.root, "pending", buy_id] as const, // <-- add this
};