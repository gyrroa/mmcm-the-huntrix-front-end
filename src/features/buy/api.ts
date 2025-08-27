// src/features/buy/api.ts
import type { Buy, CreateBuyInput, PendingSale, UpdateBuyInput } from "./types";
import { get, postFormUrlEncoded, sendFormData } from "@/lib/http";

/** Helpers for multipart payloads (images, documents, videos, arrays, etc.) */
const isFileLike = (x: unknown): x is File | Blob => {
  if (typeof File !== "undefined" && x instanceof File) return true;
  if (typeof Blob !== "undefined" && x instanceof Blob) return true;
  return false;
};

/** Generic key guard to avoid `any` when probing union members */
const hasKey = <K extends string>(obj: unknown, key: K): obj is Record<K, unknown> =>
  typeof obj === "object" && obj !== null && key in obj;

const toBuyFormData = (payload: CreateBuyInput | UpdateBuyInput) => {
  const fd = new FormData();

  // ---- required scalars ----
  if ("name" in payload && payload.name != null) fd.append("name", String(payload.name));
  if ("price" in payload && payload.price != null) fd.append("price", String(payload.price));
  if ("address" in payload && payload.address != null) fd.append("address", String(payload.address));
  if ("bed" in payload && payload.bed != null) fd.append("bed", String(payload.bed));
  if ("bath" in payload && payload.bath != null) fd.append("bath", String(payload.bath));
  if ("size" in payload && payload.size != null) fd.append("size", String(payload.size));

  // exists only on some union members -> use guard (no `any`)
  if (hasKey(payload, "property_score") && payload.property_score != null) {
    fd.append("property_score", String(payload.property_score));
  }
  // NOTE: don't append freq for /buy unless your backend explicitly expects it.

  // ---- optional scalars ----
  if (payload.description != null) fd.append("description", payload.description || "");
  if (payload.latitude != null) fd.append("latitude", String(payload.latitude));
  if (payload.longitude != null) fd.append("longitude", String(payload.longitude));

  // ---- string arrays (repeat field) ----
  if (Array.isArray(payload.amenities)) for (const a of payload.amenities) if (a) fd.append("amenities", a);
  if (Array.isArray(payload.tags)) for (const t of payload.tags) if (t) fd.append("tags", t);
  if ("document_list" in payload && Array.isArray(payload.document_list)) {
    for (const d of payload.document_list) if (d) fd.append("document_list", d);
  }

  // ---- removals (update only) ----
  if ("remove_images" in payload && Array.isArray(payload.remove_images)) {
    for (const id of payload.remove_images) if (id) fd.append("remove_images", id);
  }
  if ("remove_documents" in payload && Array.isArray(payload.remove_documents)) {
    for (const id of payload.remove_documents) if (id) fd.append("remove_documents", id);
  }

  // ---- media: ONLY append real File/Blob; ignore strings/URLs ----
  if (Array.isArray(payload.images)) {
    payload.images.forEach((item, i) => {
      if (isFileLike(item)) {
        const name = (item as File).name ?? `image-${i + 1}`;
        fd.append("images", item, name);
      }
    });
  }
  if ("documents" in payload && Array.isArray(payload.documents)) {
    payload.documents.forEach((item, i) => {
      if (isFileLike(item)) {
        const name = (item as File).name ?? `document-${i + 1}`;
        fd.append("documents", item, name);
      }
    });
  }
  if ("videos" in payload && Array.isArray(payload.videos)) {
    payload.videos.forEach((item, i) => {
      if (isFileLike(item)) {
        const name = (item as File).name ?? `video-${i + 1}`;
        fd.append("videos", item, name);
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
  message: string;
}) {
  return postFormUrlEncoded("/buy/pending", params, { auth: true, method: "POST" });
}

export function confirmSale(lister_buyer_id: string) {
  return postFormUrlEncoded("/buy/confirm", { lister_buyer_id }, { auth: true, method: "POST" });
}

export function listPendingBuy(buy_id: string): Promise<PendingSale[]> {
  return get<PendingSale[]>(`/buy/pending/${encodeURIComponent(buy_id)}`, { auth: true });
}
