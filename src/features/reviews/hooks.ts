"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createReview as apiCreateReview, listReviewsForProperty } from "./api";
import type { Review, CreateReviewInput } from "./types";
import { reviewKeys } from "./keys";

/** Public: List reviews for a given property (no auth required by the spec) */
export function usePropertyReviews(
  propertyId: string | null | undefined,
  { skip = 0, limit = 100 }: { skip?: number; limit?: number } = {}
) {
  return useQuery<Review[]>({
    queryKey: reviewKeys.list(propertyId ?? "", skip, limit),
    enabled: !!propertyId,
    queryFn: () => listReviewsForProperty(propertyId as string, { skip, limit }),
    staleTime: 30_000,
    retry: 1,
  });
}

/** Create a review (auth required) */
export function useCreateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ["createReview"],
    mutationFn: (input: CreateReviewInput) => apiCreateReview(input),
    onSuccess: (_data, input) => {
      // Invalidate the default window
      qc.invalidateQueries({ queryKey: reviewKeys.list(input.rent_property_id, 0, 100) });

      // Broadly invalidate ALL review lists for this property (any skip/limit)
      qc.invalidateQueries({ queryKey: reviewKeys.property(input.rent_property_id), exact: false });
    },
  });
}
