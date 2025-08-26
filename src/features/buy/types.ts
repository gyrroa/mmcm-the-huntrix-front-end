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
  lease_term?: number | null; // usually 0 for buy, kept for parity
  latitude?: number | null;
  longitude?: number | null;

  amenities: string[];
  tags: string[];

  images: BuyImageLike[];
  /** Free-form labels or required docs */
  document_list: string[];
  /** Server may return URLs/IDs of stored docs */
  documents: string[];

  lister_id?: string | null;
  buyer_id?: string | null;

  created_at?: string; // ISO datetime
  updated_at?: string; // ISO datetime
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
  latitude?: number | null;
  longitude?: number | null;

  amenities?: string[];
  tags?: string[];

  /** Labels for documents (not files) */
  document_list?: string[];

  /** Uploads or URL strings */
  images?: (File | Blob | string)[];
  documents?: (File | Blob | string)[];
};

/** Payload to update an existing listing */
export type UpdateBuyInput = Partial<Omit<CreateBuyInput, "images" | "documents">> & {
  /** files/URLs to append */
  images?: (File | Blob | string)[];
  documents?: (File | Blob | string)[];

  /** IDs/URLs to remove (server expects repeated fields) */
  remove_images?: string[];
  remove_documents?: string[];
};
