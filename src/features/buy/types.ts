/** A single image associated with a buy listing */
export type BuyImage = {
  id?: string;
  url: string;
  alt?: string | null;
};

/** You might receive either {url} objects or plain string URLs */
export type BuyImageLike = BuyImage | string;

/** Core buy listing returned by the API */
export type Buy = {
  id: string;
  slug: string;

  name: string;
  price: number;            // total price
  address: string;

  bed: number;
  bath: number;
  size: string;

  is_popular?: boolean;
  is_available?: boolean;

  description?: string | null;
  aidesc?: string[];        // AI description (read-only)
  lease_term?: number | null; // kept for parity, server may ignore
  latitude?: number | null;
  longitude?: number | null;

  amenities: string[];
  tags: string[];

  images: BuyImageLike[];
  videos?: string[];        // URLs from server
  /** Free-form labels or required docs */
  document_list: string[];
  /** Server may return URLs/IDs of stored docs */
  documents?: string[];

  lister_id?: string | null;
  buyer_id?: string | null;

  lister_name?: string | null;
  buyer_name?: string | null;

  listed_at?: string;       // ISO datetime (server field)
  created_at?: string;      // legacy
  updated_at?: string;      // legacy
};

/** Payload to create a new buy listing */
export type CreateBuyInput = {
  // required
  name: string;
  price: number;
  address: string;
  bed: number;
  bath: number;
  size: number | string;

  // optional
  description?: string | null;
  lease_term?: number | null; // parity; may be ignored by API
  latitude?: number | null;
  longitude?: number | null;

  amenities?: string[];
  tags?: string[];

  /** Labels for documents (not files) */
  document_list?: string[];

  /** Uploads or URL strings */
  images?: (File | Blob | string)[];
  documents?: (File | Blob | string)[];
  videos?: (File | Blob | string)[];
};

/** Payload to update an existing listing */
export type UpdateBuyInput = Partial<Omit<CreateBuyInput, "images" | "documents" | "videos">> & {
  /** files/URLs to append */
  images?: (File | Blob | string)[];
  documents?: (File | Blob | string)[];
  videos?: (File | Blob | string)[];

  /** IDs/URLs to remove (server expects repeated fields) */
  remove_images?: string[];
  remove_documents?: string[];
};
