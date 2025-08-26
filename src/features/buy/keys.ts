export const buyKeys = {
  all: ["buy"] as const,
  list: () => [...buyKeys.all, "list"] as const,
  myListings: () => [...buyKeys.all, "my-listings"] as const,
  myPurchases: () => [...buyKeys.all, "my-purchases"] as const,
  detail: (slug: string) => [...buyKeys.all, "detail", slug] as const,
};
