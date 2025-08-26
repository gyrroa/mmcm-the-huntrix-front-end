// rent/api.ts
import type { Rent, CreateRentInput, UpdateRentInput } from "./types";
import { get, postFormUrlEncoded, sendFormData } from "@/lib/http";

/** Helpers for multipart payloads (images, arrays, etc.) */
const toRentFormData = (payload: CreateRentInput | UpdateRentInput) => {
  const fd = new FormData();

  // required
  fd.append("name", String(payload.name));
  fd.append("price", String(payload.price));
  fd.append("address", String(payload.address));
  fd.append("bed", String(payload.bed));
  fd.append("bath", String(payload.bath));
  fd.append("size", String(payload.size));

  // optional
  if (payload.description != null) fd.append("description", payload.description);
  if (payload.lease_term != null) fd.append("lease_term", String(payload.lease_term));
  if (payload.latitude != null) fd.append("latitude", String(payload.latitude));
  if (payload.longitude != null) fd.append("longitude", String(payload.longitude));

  // arrays
  if (Array.isArray(payload.amenities)) {
    for (const a of payload.amenities) fd.append("amenities", a);
  }
  // NEW: tags (server expects repeated "tags" fields)
  if (Array.isArray((payload as CreateRentInput).tags)) {
    for (const t of (payload as CreateRentInput).tags!) fd.append("tags", t);
  }

  if ("remove_images" in payload && Array.isArray((payload as UpdateRentInput).remove_images)) {
    for (const id of (payload as UpdateRentInput).remove_images!) fd.append("remove_images", id);
  }

  // files (add filename when payload provides a Blob without a name)
  if (Array.isArray(payload.images)) {
    payload.images.forEach((fileOrBlob, i) => {
      const filename = (fileOrBlob as File).name ?? `image-${i + 1}.bin`;
      fd.append("images", fileOrBlob, filename);
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
    headers: { "X-HTTP-Method-Override": "DELETE" }, // or use a direct DELETE call:
    // NOTE: If you prefer direct DELETE, you can add a small helper in http.ts.
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
