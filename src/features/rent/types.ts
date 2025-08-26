// rent/types.ts

/** A single image associated with a rent listing */
export type RentImage = {
    id: string;
    url: string;
    alt?: string | null;
};

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

    description?: string | null;
    lease_term?: number | null; // e.g. months
    latitude?: number | null;
    longitude?: number | null;

    amenities: string[];
    tags: string[];
    images: RentImage[];

    lister_id?: string | null;

    created_at?: string; // ISO datetime
    updated_at?: string; // ISO datetime
};

/** Payload to create a new rent listing */
export type CreateRentInput = {
    // required
    name: string;
    price: number;
    address: string;
    bed: number;
    bath: number;
    size: number;

    // optional
    description?: string | null;
    lease_term?: number | null;
    latitude?: number | null;
    longitude?: number | null;

    /** amenity labels (server expects multiple `amenities` fields in form-data) */
    amenities?: string[];
    tags?: string[];

    /** images to upload */
    images?: (File | Blob)[];
};

/** Payload to update an existing listing */
export type UpdateRentInput = Partial<Omit<CreateRentInput, "images">> & {
    /** images to append */
    images?: (File | Blob)[];

    /**
     * image IDs to remove (server expects multiple `remove_images` fields in form-data)
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
