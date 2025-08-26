import type { Rent, CreateRentInput, UpdateRentInput } from "./types";
import { get, postFormUrlEncoded, sendFormData } from "@/lib/http";

/** Helpers for multipart payloads (images, videos, arrays, etc.) */
const toRentFormData = (payload: CreateRentInput | UpdateRentInput) => {
  const fd = new FormData();

  // required
  if ("name" in payload && payload.name != null) fd.append("name", String(payload.name));
  if ("price" in payload && payload.price != null) fd.append("price", String(payload.price));
  if ("address" in payload && payload.address != null) fd.append("address", String(payload.address));
  if ("bed" in payload && payload.bed != null) fd.append("bed", String(payload.bed));
  if ("bath" in payload && payload.bath != null) fd.append("bath", String(payload.bath));
  if ("size" in payload && payload.size != null) fd.append("size", String(payload.size));

  // optional
  if (payload.description != null) fd.append("description", payload.description);

  // lease_term (only present on one of the payload types)
  if ("lease_term" in payload && payload.lease_term != null) {
    fd.append("lease_term", String(payload.lease_term));
  }

  if (payload.latitude != null) fd.append("latitude", String(payload.latitude));
  if (payload.longitude != null) fd.append("longitude", String(payload.longitude));

  // arrays (repeat field keys)
  if (Array.isArray(payload.amenities)) {
    for (const a of payload.amenities) fd.append("amenities", a);
  }
  if (Array.isArray(payload.tags)) {
    for (const t of payload.tags) fd.append("tags", t);
  }

  // removals (update only)
  if ("remove_images" in payload && Array.isArray(payload.remove_images)) {
    for (const id of payload.remove_images) fd.append("remove_images", id);
  }

  // images: allow string URLs and File/Blob
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

  // videos: allow string URLs and File/Blob (only present on some payloads)
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
}) {
  return postFormUrlEncoded("/rent/pending", params, { auth: true, method: "POST" });
}

export function confirmRental(lister_tenant_id: string) {
  return postFormUrlEncoded("/rent/confirm", { lister_tenant_id }, { auth: true, method: "POST" });
}
