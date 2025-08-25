export const rentKeys = {
    all: ["rent"] as const,
    list: () => [...rentKeys.all, "list"] as const,
    myListings: () => [...rentKeys.all, "my-listings"] as const,
    myRentals: () => [...rentKeys.all, "my-rentals"] as const,
    detail: (slug: string) => [...rentKeys.all, "detail", slug] as const,
};
