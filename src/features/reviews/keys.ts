export const reviewKeys = {
  all: ["reviews"] as const,

  /** Group all queries for a specific property */
  property: (propertyId: string) => [...reviewKeys.all, "property", propertyId] as const,

  /** List queries for a property + pagination window */
  list: (propertyId: string, skip = 0, limit = 100) =>
    [...reviewKeys.property(propertyId), "list", { skip, limit }] as const,
};
