/** A single image associated with a rent listing */
export type RentImage = {
  id?: string;
  url: string;
  alt?: string | null;
};

/** You might receive either {url} objects or plain string URLs */
export type RentImageLike = RentImage | string;

/** Core rent listing returned by the API */
export type Rent = {
  id: string;
  slug: string;

  name: string;
  price: number;      // e.g. monthly price
  address: string;

  bed: number;        // number of bedrooms
  bath: number;       // number of bathrooms
  size: string;

  is_popular?: boolean;
  is_available?: boolean;

  description?: string | null;
  aidesc?: string[];          // AI description (read-only)
  lease_term?: number | null; // e.g. months
  latitude?: number | null;
  longitude?: number | null;

  amenities: string[];
  tags: string[];

  images: RentImageLike[];
  videos?: string[];          // URLs from server

  lister_id?: string | null;
  tenant_id?: string | null;

  lister_name?: string | null;
  tenant_name?: string | null;

  listed_at?: string;         // ISO datetime (server field)
  created_at?: string;        // legacy
  updated_at?: string;        // legacy
};

/** Payload to create a new rent listing */
export type CreateRentInput = {
  // required
  name: string;
  price: number;
  address: string;
  bed: number;
  bath: number;
  size: number | string;

  // optional
  description?: string | null;
  lease_term?: number | null;
  latitude?: number | null;
  longitude?: number | null;

  /** amenity labels (server expects multiple `amenities` fields in form-data) */
  amenities?: string[];
  tags?: string[];

  /** uploads or URL strings */
  images?: (File | Blob | string)[];
  videos?: (File | Blob | string)[];
};

/** Payload to update an existing listing */
export type UpdateRentInput = Partial<Omit<CreateRentInput, "images" | "videos">> & {
  /** media to append */
  images?: (File | Blob | string)[];
  videos?: (File | Blob | string)[];

  /**
   * image IDs/URLs to remove (server expects multiple `remove_images` fields in form-data)
   * Keep as string[] to match server-side identifiers.
   */
  remove_images?: string[];
};

/** Create-pending rental params */
export type CreatePendingRentalInput = {
  rent_id: string;
  lister_id: string;
  tenant_id: string;
};

/** Confirm-rental params */
export type ConfirmRentalInput = {
  lister_tenant_id: string;
};
