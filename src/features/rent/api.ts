// features/rent/api.ts
import type { Rent, CreateRentInput, UpdateRentInput, PendingRental } from "./types";
import { get, postFormUrlEncoded, sendFormData } from "@/lib/http";

/** Helpers for multipart payloads (images, videos, arrays, etc.) */
const isFileLike = (x: unknown): x is File | Blob => {
  if (typeof File !== "undefined" && x instanceof File) return true;
  if (typeof Blob !== "undefined" && x instanceof Blob) return true;
  return false;
};

/** Generic key guard: avoids `any` while letting us safely index */
const hasKey = <K extends string>(
  obj: unknown,
  key: K
): obj is Record<K, unknown> => typeof obj === "object" && obj !== null && key in obj;

const toRentFormData = (payload: CreateRentInput | UpdateRentInput) => {
  const fd = new FormData();

  // ---- required on CREATE (/rent) ----
  if ("name" in payload && payload.name != null) fd.append("name", String(payload.name));
  if ("price" in payload && payload.price != null) fd.append("price", String(payload.price));
  if ("address" in payload && payload.address != null) fd.append("address", String(payload.address));
  if ("bed" in payload && payload.bed != null) fd.append("bed", String(payload.bed));
  if ("bath" in payload && payload.bath != null) fd.append("bath", String(payload.bath));
  if ("size" in payload && payload.size != null) fd.append("size", String(payload.size));

  // optional fields that only exist on one side of the union
  if (hasKey(payload, "freq") && payload.freq != null) {
    fd.append("freq", String(payload.freq));
  }
  if (hasKey(payload, "property_score") && payload.property_score != null) {
    fd.append("property_score", String(payload.property_score));
  }

  // ---- optional scalars ----
  if (payload.description != null) fd.append("description", payload.description || "");
  if ("lease_term" in payload && payload.lease_term != null) fd.append("lease_term", String(payload.lease_term));
  if (payload.latitude != null) fd.append("latitude", String(payload.latitude));
  if (payload.longitude != null) fd.append("longitude", String(payload.longitude));

  // ---- arrays of strings (repeat field) ----
  if (Array.isArray(payload.amenities)) {
    for (const a of payload.amenities) if (a) fd.append("amenities", a);
  }
  if (Array.isArray(payload.tags)) {
    for (const t of payload.tags) if (t) fd.append("tags", t);
  }

  // ---- removals for UPDATE ----
  if ("remove_images" in payload && Array.isArray(payload.remove_images)) {
    for (const id of payload.remove_images) if (id) fd.append("remove_images", id);
  }

  // ---- files: ONLY append real File/Blob, ignore strings/URLs ----
  if (Array.isArray(payload.images)) {
    payload.images.forEach((item, i) => {
      if (isFileLike(item)) {
        const name = (item as File).name ?? `image-${i + 1}`;
        fd.append("images", item, name);
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

export function listRent(): Promise<Rent[]> {
  return get<Rent[]>("/rent");
}

export function createRent(input: CreateRentInput): Promise<Rent> {
  return sendFormData<Rent>("/rent", toRentFormData(input), { auth: true, method: "POST" });
}

export function listUserRentListings(): Promise<Rent[]> {
  return get<Rent[]>("/rent/listings", { auth: true });
}

export function listUserRentals(): Promise<Rent[]> {
  return get<Rent[]>("/rent/rentals", { auth: true });
}

export function updateRent(slug: string, input: UpdateRentInput): Promise<Rent> {
  return sendFormData<Rent>(`/rent/${encodeURIComponent(slug)}`, toRentFormData(input), {
    auth: true,
    method: "PUT",
  });
}

export function deleteRent(slug: string): Promise<void> {
  // using URL-encoded with no body is fine; or just raw send with method DELETE
  return get<void>(`/rent/${encodeURIComponent(slug)}`, {
    auth: true,
    headers: { "X-HTTP-Method-Override": "DELETE" },
  });
}

/** Pending + confirm flows */
export function createPendingRental(params: {
  rent_id: string;
  lister_id: string;
  tenant_id: string;
  message: string;
}) {
  return postFormUrlEncoded("/rent/pending", params, { auth: true, method: "POST" });
}

export function confirmRental(lister_tenant_id: string) {
  return postFormUrlEncoded("/rent/confirm", { lister_tenant_id }, { auth: true, method: "POST" });
}

export function listPendingRent(rent_id: string): Promise<PendingRental[]> {
  return get<PendingRental[]>(`/rent/pending/${encodeURIComponent(rent_id)}`, { auth: true });
}
