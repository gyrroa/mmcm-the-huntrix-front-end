import type { Buy, CreateBuyInput, UpdateBuyInput } from "./types";
import { get, postFormUrlEncoded, sendFormData } from "@/lib/http";

/** Helpers for multipart payloads (images, documents, videos, arrays, etc.) */
const toBuyFormData = (payload: CreateBuyInput | UpdateBuyInput) => {
  const fd = new FormData();

  // required
  if ("name" in payload && payload.name != null) fd.append("name", String(payload.name));
  if ("price" in payload && payload.price != null) fd.append("price", String(payload.price));
  if ("address" in payload && payload.address != null) fd.append("address", String(payload.address));
  if ("bed" in payload && payload.bed != null) fd.append("bed", String(payload.bed));
  if ("bath" in payload && payload.bath != null) fd.append("bath", String(payload.bath));
  if ("size" in payload && payload.size != null) fd.append("size", String(payload.size));

  // optional scalars
  if (payload.description != null) fd.append("description", payload.description);
  if (payload.latitude != null) fd.append("latitude", String(payload.latitude));
  if (payload.longitude != null) fd.append("longitude", String(payload.longitude));

  if ("lease_term" in payload && payload.lease_term != null) {
    // kept for parity; server may ignore on /buy
    fd.append("lease_term", String(payload.lease_term));
  }

  // arrays (repeat field keys)
  if (Array.isArray(payload.amenities)) {
    for (const a of payload.amenities) fd.append("amenities", a);
  }
  if (Array.isArray(payload.tags)) {
    for (const t of payload.tags) fd.append("tags", t);
  }
  if ("document_list" in payload && Array.isArray(payload.document_list)) {
    for (const d of payload.document_list) fd.append("document_list", d);
  }

  // removals (update only)
  if ("remove_images" in payload && Array.isArray(payload.remove_images)) {
    for (const id of payload.remove_images) fd.append("remove_images", id);
  }
  if ("remove_documents" in payload && Array.isArray(payload.remove_documents)) {
    for (const id of payload.remove_documents) fd.append("remove_documents", id);
  }

  // images: support File/Blob or string URLs
  if (Array.isArray(payload.images)) {
    payload.images.forEach((item, i) => {
      if (typeof item === "string") {
        fd.append("images", item);
      } else {
        const filename = (item as File).name ?? `image-${i + 1}.bin`;
        fd.append("images", item, filename);
      }
    });
  }

  // documents: support File/Blob or string URLs
  if ("documents" in payload && Array.isArray(payload.documents)) {
    payload.documents.forEach((item, i) => {
      if (typeof item === "string") {
        fd.append("documents", item);
      } else {
        const filename = (item as File).name ?? `document-${i + 1}.bin`;
        fd.append("documents", item, filename);
      }
    });
  }

  // videos: support File/Blob or string URLs
  if ("videos" in payload && Array.isArray(payload.videos)) {
    payload.videos.forEach((item, i) => {
      if (typeof item === "string") {
        fd.append("videos", item);
      } else {
        const filename = (item as File).name ?? `video-${i + 1}.bin`;
        fd.append("videos", item, filename);
      }
    });
  }

  return fd;
};

/** Public list */
export function listBuy(): Promise<Buy[]> {
  return get<Buy[]>("/buy");
}

/** Create */
export function createBuy(input: CreateBuyInput): Promise<Buy> {
  return sendFormData<Buy>("/buy", toBuyFormData(input), { auth: true, method: "POST" });
}

/** My listings (requires auth) */
export function listUserBuyListings(): Promise<Buy[]> {
  return get<Buy[]>("/buy/listings", { auth: true });
}

/** My purchases (requires auth) */
export function listUserPurchases(): Promise<Buy[]> {
  return get<Buy[]>("/buy/purchases", { auth: true });
}

/** Update */
export function updateBuy(slug: string, input: UpdateBuyInput): Promise<Buy> {
  return sendFormData<Buy>(`/buy/${encodeURIComponent(slug)}`, toBuyFormData(input), {
    auth: true,
    method: "PUT",
  });
}

/** Delete */
export function deleteBuy(slug: string): Promise<void> {
  return get<void>(`/buy/${encodeURIComponent(slug)}`, {
    auth: true,
    headers: { "X-HTTP-Method-Override": "DELETE" },
  });
}

/** Pending + confirm flows */
export function createPendingSale(params: {
  buy_id: string;
  lister_id: string;
  buyer_id: string;
}) {
  return postFormUrlEncoded("/buy/pending", params, { auth: true, method: "POST" });
}

export function confirmSale(lister_buyer_id: string) {
  return postFormUrlEncoded("/buy/confirm", { lister_buyer_id }, { auth: true, method: "POST" });
}
