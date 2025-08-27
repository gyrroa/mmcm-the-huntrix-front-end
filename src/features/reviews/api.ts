import { get, postFormUrlEncoded } from "@/lib/http";
import type { Review, CreateReviewInput } from "./types";

/** POST /reviews/ (x-www-form-urlencoded) */
export function createReview(input: CreateReviewInput): Promise<Review> {
  // Server expects form-urlencoded; create typically requires auth
  return postFormUrlEncoded<Review>("/reviews/", input, { auth: true, method: "POST" });
}

/** GET /reviews/property/{property_id}?skip=&limit= */
export function listReviewsForProperty(
  propertyId: string,
  opts?: { skip?: number; limit?: number }
): Promise<Review[]> {
  const params = new URLSearchParams();
  if (opts?.skip != null) params.set("skip", String(opts.skip));
  if (opts?.limit != null) params.set("limit", String(opts.limit));
  const qs = params.toString();
  const path = `/reviews/property/${encodeURIComponent(propertyId)}${qs ? `?${qs}` : ""}`;
  return get<Review[]>(path);
}
