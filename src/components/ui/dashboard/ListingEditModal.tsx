'use client';

import * as React from 'react';
import { X, Trash2, Save, Tag, List, ImageIcon, MapPin } from 'lucide-react';

// hooks & types (adjust to your paths)
import { useUpdateBuy, useDeleteBuy } from '@/features/buy/hooks';
import { useUpdateRent, useDeleteRent } from '@/features/rent/hooks';
import type { UpdateBuyInput } from '@/features/buy/types';
import type { UpdateRentInput } from '@/features/rent/types';
import { ListingRow } from '@/components/dashboardSection/myListingSection';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listing: ListingRow | null;
};

function Field(props: {
  label: string;
  name: string;
  value: string;
  placeholder?: string;
  type?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const { label, name, value, placeholder, type = 'text', onChange } = props;
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-sm font-medium text-[#001619B2]">{label}</label>
      <input
        id={name}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full border border-[#D2E4FF] px-3 py-3 rounded-xl text-sm placeholder-[#9AA6B2] focus:outline-none focus:ring-2 focus:ring-[#3871C1] transition"
      />
    </div>
  );
}

function ChipInput(props: {
  value: string;
  onChange: (v: string) => void;
  onAdd: (v: string) => void;
  placeholder: string;
}) {
  const { value, onChange, onAdd, placeholder } = props;
  return (
    <div className="border rounded-lg px-3 py-2 flex items-center gap-2 border-[#D2E4FF] bg-[#F9FAFF] focus-within:ring-2 focus-within:ring-[#3871C1]">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (!value.trim()) return;
          if (e.key === 'Enter' || e.key === 'Tab' || e.key === ',') {
            e.preventDefault();
            onAdd(value);
          }
        }}
        className="bg-transparent outline-none w-full text-sm placeholder:text-[#8CA1C6]"
        placeholder={placeholder}
      />
      <button
        type="button"
        onClick={() => value.trim() && onAdd(value)}
        className="text-xs font-medium px-2 py-1 rounded bg-[#EDF3FF] text-[#3871C1] hover:brightness-95"
      >
        Add
      </button>
    </div>
  );
}

function Chips(props: { items: string[]; onRemove: (index: number) => void }) {
  const { items, onRemove } = props;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((txt, i) => (
        <span
          key={`${txt}-${i}`}
          className="inline-flex items-center gap-1 rounded-full border border-[#E3ECF9] bg-white px-3 py-1 text-xs"
        >
          {txt}
          <button
            type="button"
            onClick={() => onRemove(i)}
            className="ml-1 -mr-1 w-4 h-4 leading-none text-[#002353]/80 hover:text-[#002353]"
            aria-label={`Remove ${txt}`}
            title="Remove"
          >
            ×
          </button>
        </span>
      ))}
    </div>
  );
}

export default function ListingEditModal({ open, onOpenChange, listing }: Props) {
  const [container, setContainer] = React.useState<HTMLElement | null>(null);

  // base fields
  const [name, setName] = React.useState('');
  const [price, setPrice] = React.useState<string>('0');
  const [address, setAddress] = React.useState('');
  const [description, setDescription] = React.useState('');

  // structure/meta
  const [size, setSize] = React.useState<string>(''); // rent API expects string
  const [bed, setBed] = React.useState<string>('');
  const [bath, setBath] = React.useState<string>('');

  // rent-only
  const [leaseTerm, setLeaseTerm] = React.useState<string>(''); // months
  const [lat, setLat] = React.useState<number | undefined>(undefined);
  const [lng, setLng] = React.useState<number | undefined>(undefined);

  // arrays
  const [tags, setTags] = React.useState<string[]>([]);
  const [amenities, setAmenities] = React.useState<string[]>([]);
  const [tagInput, setTagInput] = React.useState('');
  const [amenityInput, setAmenityInput] = React.useState('');

  // images
  const [newFiles, setNewFiles] = React.useState<File[]>([]);
  const [removeIds, setRemoveIds] = React.useState<string[]>([]);

  // map modal
  const [mapOpen, setMapOpen] = React.useState(false);

  // mutations
  const updateBuy = useUpdateBuy();
  const updateRent = useUpdateRent();
  const deleteBuy = useDeleteBuy();
  const deleteRent = useDeleteRent();

  const isSaving = updateBuy.isPending || updateRent.isPending;
  const isDeleting = deleteBuy.isPending || deleteRent.isPending;
  const errorMsg =
    (updateBuy.error as { message?: string })?.message ||
    (updateRent.error as { message?: string })?.message ||
    (deleteBuy.error as { message?: string })?.message ||
    (deleteRent.error as { message?: string })?.message;


  React.useEffect(() => {
    setContainer(document.body);
  }, []);

  React.useEffect(() => {
    if (!listing) return;
    const raw = listing.raw ?? {};
    setName(listing.name ?? '');
    setPrice(String(listing.price ?? 0));
    setAddress(listing.address ?? '');
    setDescription(String(raw.description ?? ''));
    setSize(String(raw.size ?? ''));
    setBed(String(raw.bed ?? ''));
    setBath(String(raw.bath ?? ''));
    setLeaseTerm(String(raw.lease_term ?? ''));
    setLat(typeof raw.latitude === 'number' ? raw.latitude : undefined);
    setLng(typeof raw.longitude === 'number' ? raw.longitude : undefined);
    setTags(Array.isArray(raw.tags) ? raw.tags : []);
    setAmenities(Array.isArray(raw.amenities) ? raw.amenities : []);
    setNewFiles([]);
    setRemoveIds([]);
  }, [listing]);

  const close = () => onOpenChange(false);
  const addTag = (val: string) => {
    const t = val.trim();
    if (!t) return;
    setTags((prev) => (prev.some((x) => x.toLowerCase() === t.toLowerCase()) ? prev : [...prev, t]));
    setTagInput('');
  };
  const addAmenity = (val: string) => {
    const a = val.trim();
    if (!a) return;
    setAmenities((prev) => (prev.some((x) => x.toLowerCase() === a.toLowerCase()) ? prev : [...prev, a]));
    setAmenityInput('');
  };
  const toggleRemoveId = (id: string) => {
    setRemoveIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };
  const onFilesPicked = (files: FileList | null) => {
    if (!files) return;
    setNewFiles((prev) => [...prev, ...Array.from(files)]);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!listing?.slug) return;

    const priceNum = Number(price) || 0;
    const bedNum = bed !== '' ? Number(bed) : undefined;
    const bathNum = bath !== '' ? Number(bath) : undefined;

    try {
      if (listing.type === 'buy') {
        const sizeVal: number | string | undefined =
          size === '' ? undefined : Number.isFinite(Number(size)) ? Number(size) : size;

        const input: UpdateBuyInput = {
          name: name?.trim() || undefined,
          price: priceNum || undefined,
          address: address?.trim() || undefined,
          description: description?.trim() || undefined,
          size: sizeVal,
          bed: bedNum,
          bath: bathNum,
          tags,
          amenities,
        };
        await updateBuy.mutateAsync({ slug: listing.slug, input });
      } else {
        // RENT: matches your PUT spec (multipart handled in api helper)
        const leaseNum = leaseTerm !== '' ? Math.max(1, Number(leaseTerm) || 0) : undefined;

        const input: UpdateRentInput = {
          name: name?.trim() || undefined,
          price: priceNum || undefined,
          address: address?.trim() || undefined,
          description: description?.trim() || undefined,

          // your client types define size as number; server expects string — ok (FormData stringifies)
          size: size === '' ? undefined : Number(size) || size,

          bed: bedNum,
          bath: bathNum,
          lease_term: leaseNum,

          latitude: typeof lat === 'number' ? lat : undefined,
          longitude: typeof lng === 'number' ? lng : undefined,

          tags,
          amenities,

          images: newFiles.length ? newFiles : undefined,
          remove_images: removeIds.length ? removeIds : undefined,
        };
        await updateRent.mutateAsync({ slug: listing.slug, input });
      }
      close();
    } catch (err) {
      // errors surface below; optional toast here
      console.error(err);
    }
  };

  const onDelete = async () => {
    if (!listing?.slug) return;
    const ok = window.confirm('Delete this listing? This cannot be undone.');
    if (!ok) return;
    try {
      if (listing.type === 'buy') await deleteBuy.mutateAsync(listing.slug);
      else await deleteRent.mutateAsync(listing.slug);
      close();
    } catch (err) {
      console.error(err);
    }
  };

  if (!open || !container || !listing) return null;

  const title = `Edit ${listing.type === 'buy' ? 'Buy' : 'Rent'} Listing`;
  const rentImages: { id?: string | number; url?: string }[] =
    listing.type === 'rent' && Array.isArray(listing.raw?.images)
      ? (listing.raw.images as { id?: string | number; url?: string }[])
      : [];

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-[1px] z-[1000]" onClick={close} />
      <div role="dialog" aria-modal="true" className="fixed inset-0 z-[1001] flex items-center justify-center p-4">
        <div className="w-full max-w-2xl rounded-2xl bg-white/95 backdrop-blur border border-[#E3ECF9] shadow-xl overflow-hidden">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 p-5 border-b border-[#E3ECF9]">
            <div>
              <h3 className="text-lg sm:text-xl font-semibold text-[#002353]">{title}</h3>
              <p className="text-sm text-[#5C7188] mt-0.5">{listing.name}</p>
            </div>
            <button
              onClick={close}
              className="p-2 rounded-lg border border-transparent hover:border-[#E3ECF9] hover:bg-[#F7FAFF] focus:outline-none focus:ring-2 focus:ring-[#3871C1]"
              aria-label="Close"
            >
              <X className="h-5 w-5 text-[#5C7188]" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="p-5 space-y-5">
            {/* Row: Title / Address */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field
                label="Title"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Listing title"
              />

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-[#001619B2]">Address</label>
                <div className="flex gap-2">
                  <input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Street, City, Province"
                    className="flex-1 border border-[#D2E4FF] px-3 py-3 rounded-xl text-sm placeholder-[#9AA6B2] focus:outline-none focus:ring-2 focus:ring-[#3871C1]"
                  />
                  {/* Always show Map button */}
                  <button
                    type="button"
                    onClick={() => setMapOpen(true)}
                    className="px-3 py-2 rounded-xl border border-[#CFE0FF] text-[#3871C1] hover:bg-[#F5F8FF] whitespace-nowrap inline-flex items-center gap-1"
                    title="Pick on map"
                  >
                    <MapPin className="h-4 w-4" />
                  </button>
                </div>

                {/* Show coords if set */}
                {(typeof lat === 'number' && typeof lng === 'number') ? (
                  <p className="text-xs text-[#5C7188] mt-1">
                    Lat/Lng: {lat.toFixed(6)}, {lng.toFixed(6)}
                  </p>
                ) : (
                  <p className="text-xs text-[#5C7188] mt-1">No coordinates set</p>
                )}
              </div>
            </div>

            {/* Row: Price / Lease term (rent) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-[#001619B2]">Price</label>
                <div className="relative">
                  <input
                    value={price}
                    onChange={(e) => setPrice(e.target.value.replace(/[^\d]/g, ''))}
                    inputMode="numeric"
                    className="w-full border border-[#D2E4FF] pl-9 pr-3 py-3 rounded-xl text-sm placeholder-[#9AA6B2] focus:outline-none focus:ring-2 focus:ring-[#3871C1] transition"
                    placeholder={listing.type === 'rent' ? '15,000' : '3,500,000'}
                    aria-label="Price in PHP"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8091A8]">₱</span>
                </div>
              </div>

              {listing.type === 'rent' && (
                <Field
                  label="Lease Term (months)"
                  name="lease_term"
                  value={leaseTerm}
                  onChange={(e) => setLeaseTerm(e.target.value.replace(/[^\d]/g, ''))}
                  placeholder="e.g. 12"
                  type="number"
                />
              )}
            </div>

            {/* Row: Size / Bed / Bath */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field
                label={listing.type === 'rent' ? 'Size (string)' : 'Size'}
                name="size"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                placeholder={listing.type === 'rent' ? 'e.g. 120 m² or 120' : 'e.g. 120 or 120 m²'}
              />
              <Field
                label="Bedrooms"
                name="bed"
                value={bed}
                onChange={(e) => setBed(e.target.value.replace(/[^\d]/g, ''))}
                placeholder="e.g. 3"
                type="number"
              />
              <Field
                label="Bathrooms"
                name="bath"
                value={bath}
                onChange={(e) => setBath(e.target.value.replace(/[^\d]/g, ''))}
                placeholder="e.g. 2"
                type="number"
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-medium text-[#001619B2]">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="mt-1 w-full rounded-xl border border-[#CFE0FF] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#3871C1] text-sm"
                placeholder="Optional notes about the property…"
              />
            </div>

            {/* Tags */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm font-medium text-[#001619B2]">
                <Tag className="h-4 w-4 text-[#8091A8]" />
                <span>Tags</span>
              </div>
              <span className="text-xs text-[#5C7188]">{tags.length}/25</span>
            </div>
            <ChipInput value={tagInput} onChange={setTagInput} onAdd={addTag} placeholder='Add a tag (e.g. "pet friendly"), then press Enter' />
            {!!tags.length && <Chips items={tags} onRemove={(i) => setTags((p) => p.filter((_, idx) => idx !== i))} />}

            {/* Amenities */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm font-medium text-[#001619B2]">
                <List className="h-4 w-4 text-[#8091A8]" />
                <span>Amenities</span>
              </div>
              <span className="text-xs text-[#5C7188]">{amenities.length}/25</span>
            </div>
            <ChipInput value={amenityInput} onChange={setAmenityInput} onAdd={addAmenity} placeholder='Add an amenity (e.g. "Gated Community"), then press Enter' />
            {!!amenities.length && <Chips items={amenities} onRemove={(i) => setAmenities((p) => p.filter((_, idx) => idx !== i))} />}

            {/* Images (append & remove for RENT) */}
            {listing.type === 'rent' && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-[#001619B2]">
                  <ImageIcon className="h-4 w-4 text-[#8091A8]" />
                  <span>Images</span>
                </div>

                {rentImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-3">
                    {rentImages.map((img) => {
                      const id = String(img?.id ?? '');
                      const url = String(img?.url ?? '');
                      if (!url) return null;
                      const marked = !!id && removeIds.includes(id);
                      return (
                        <label
                          key={id || url}
                          className={`relative block rounded-xl overflow-hidden border ${marked ? 'border-[#FFB3B3]' : 'border-[#E3ECF9]'}`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt="" className="w-full h-24 object-cover" />
                          {id && (
                            <input
                              type="checkbox"
                              checked={marked}
                              onChange={() => toggleRemoveId(id)}
                              className="absolute top-2 left-2 h-4 w-4"
                              aria-label="Mark for removal"
                            />
                          )}
                          {marked && <div className="absolute inset-0 bg-[#FF0000]/10 pointer-events-none" />}
                        </label>
                      );
                    })}
                  </div>
                )}

                <div className="flex items-center justify-between gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => onFilesPicked(e.target.files)}
                    className="block w-full text-sm file:mr-3 file:rounded-lg file:border file:border-[#CFE0FF] file:px-3 file:py-2 file:bg-[#F5F8FF] file:text-[#3871C1] file:hover:bg-[#EDF3FF]"
                  />
                  {newFiles.length > 0 && (
                    <span className="text-xs text-[#5C7188]">{newFiles.length} file(s) selected</span>
                  )}
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="text-sm text-[#D12B2B] bg-[#FFE9E9] border border-[#FFB3B3] rounded-xl px-3 py-2">
                {String(errorMsg)}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={onDelete}
                disabled={isDeleting || isSaving}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#FFD1D1] text-[#D12B2B] hover:bg-[#FFF0F0] disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={close}
                  className="px-4 py-2 rounded-xl border border-[#CFE0FF] text-[#3871C1] hover:bg-[#F5F8FF]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving || isDeleting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white bg-gradient-to-r from-[#5AA6FF] via-[#3871C1] to-[#2D3E8B] shadow-[0_10px_20px_rgba(56,113,193,0.35)] hover:shadow-[0_12px_24px_rgba(56,113,193,0.5)] disabled:opacity-50 focus:outline-none focus:ring-4 focus:ring-[#3871C1]/30"
                >
                  <Save className="h-4 w-4" />
                  Save changes
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Map Picker Modal (no external imports; uses dynamic import inside) */}
      <LeafletMapPickerModal
        open={mapOpen}
        onClose={() => setMapOpen(false)}
        initialPosition={typeof lat === 'number' && typeof lng === 'number' ? { lat, lng } : undefined}
        onSelect={({ address: addr, lat: a, lng: b }) => {
          setAddress(addr);
          setLat(a);
          setLng(b);
          setMapOpen(false);
        }}
      />
    </>
  );
}

/* ---------- Map Picker Modal ---------- */
type LatLng = { lat: number; lng: number };
type LeafletNS = typeof import('leaflet');

const LeafletMapPickerModal: React.FC<{
  open: boolean;
  onClose: () => void;
  onSelect: (p: { address: string; lat: number; lng: number }) => void;
  initialPosition?: LatLng;
}> = ({ open, onClose, onSelect, initialPosition }) => {
  const mapEl = React.useRef<HTMLDivElement | null>(null);
  const mapRef = React.useRef<import('leaflet').Map | null>(null);
  const markerRef = React.useRef<import('leaflet').Marker | null>(null);

  const [Lmod, setLmod] = React.useState<LeafletNS | null>(null);
  const [pos, setPos] = React.useState<LatLng>(initialPosition || { lat: 14.5995, lng: 120.9842 }); // Manila default
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    const id = 'leaflet-css';
    if (!document.getElementById(id)) {
      const link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    if (initialPosition) {
      setPos(initialPosition);
      // also move existing marker/map if already created
      if (markerRef.current && mapRef.current) {
        markerRef.current.setLatLng(initialPosition);
        mapRef.current.setView(initialPosition, mapRef.current.getZoom());
      }
    }
  }, [open, initialPosition]);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      const L = (await import('leaflet')) as LeafletNS;
      if (!alive) return;
      // Fix default marker icons when bundling
      delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });
      setLmod(L);
    })();
    return () => {
      alive = false;
    };
  }, []);

  React.useEffect(() => {
    if (!open || !mapEl.current || !Lmod) return;
    const L = Lmod;
    const map = L.map(mapEl.current, { center: [pos.lat, pos.lng], zoom: 15, zoomControl: true, attributionControl: true });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    const marker = L.marker([pos.lat, pos.lng], { draggable: true }).addTo(map);

    map.on('click', (e: import('leaflet').LeafletMouseEvent) => {
      marker.setLatLng(e.latlng);
      setPos({ lat: e.latlng.lat, lng: e.latlng.lng });
    });

    marker.on('dragend', () => {
      const ll = marker.getLatLng();
      setPos({ lat: ll.lat, lng: ll.lng });
    });

    mapRef.current = map;
    markerRef.current = marker;

    return () => {
      map.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, Lmod]);

  const confirm = async () => {
    // Nominatim free reverse geocode — no key needed
    setBusy(true);
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&lat=${pos.lat}&lon=${pos.lng}`;
      const res = await fetch(url, { headers: { Accept: 'application/json' } });
      const data: { display_name?: string } = await res.json();
      const address = data?.display_name || `${pos.lat.toFixed(6)}, ${pos.lng.toFixed(6)}`;
      onSelect({ address, lat: pos.lat, lng: pos.lng });
    } finally {
      setBusy(false);
    }
  };

  if (!open) return null;

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-[1100] p-4 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-[1101] w-full max-w-3xl bg-white rounded-2xl border border-[#E3ECF9] shadow-xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-[#E3ECF9]">
          <div className="flex items-center gap-2 text-lg font-semibold text-[#002353]">
            <span className="text-[#8091A8] text-[18px]">📍</span>
            <span>Select location</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-[#BFD3FF] bg-white text-[#0B2B57] text-sm font-semibold hover:bg-[#F5FAFF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3871C1]"
          >
            Close
          </button>
        </div>

        <div className="h-[60vh]">
          <div ref={mapEl} className="w-full h-full" />
        </div>

        <div className="p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="text-sm text-[#5C7188]">
            Drag the pin or click the map. Current: <span className="font-medium">{pos.lat.toFixed(5)}, {pos.lng.toFixed(5)}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={confirm}
              disabled={busy}
              className="px-4 py-2 rounded-lg bg-[#3871C1] text-white text-sm font-semibold shadow hover:shadow-md disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3871C1] focus-visible:ring-offset-2"
            >
              {busy ? 'Getting address…' : 'Use this location'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
