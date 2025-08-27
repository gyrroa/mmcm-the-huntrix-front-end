'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import Button from '@/components/button';
import { useEffect, useMemo, useRef, useState } from 'react';
import ReviewSection from '@/components/homeSection/reviewSection';
import ScheduleVisitModal from '@/components/ui/home/ScheduleVisitModal';
import { Rent } from '@/features/rent/types';
import { Buy } from '@/features/buy/types';
import { useRentList } from '@/features/rent/hooks';
import { useBuyList } from '@/features/buy/hooks';
import { useMe } from '@/features/auth/hooks';
import SendOfferModal from '@/components/ui/home/SendOffer';
import { UserIcon } from 'lucide-react';
import PropertyCard from '@/components/ui/home/PropertyCard';

type ListingType = 'rent' | 'buy';

/** ---------- helpers (no `any`) ---------- */
type MaybeImages = { images?: unknown };
type MaybePopularA = { isPopular?: unknown };
type MaybePopularB = { is_popular?: unknown };
type MaybeDocs = { document_list?: unknown; documents?: unknown };

function pickImages(p: Rent | Buy): string[] {
  const imgs = (p as MaybeImages).images;
  return Array.isArray(imgs)
    ? (imgs as unknown[]).filter((x): x is string => typeof x === 'string' && x.trim().length > 0)
    : [];
}

function pickIsPopular(p: Rent | Buy): boolean {
  const a = (p as MaybePopularA).isPopular;
  const b = (p as MaybePopularB).is_popular;
  return Boolean((typeof a === 'boolean' ? a : undefined) ?? (typeof b === 'boolean' ? b : undefined) ?? false);
}

function pickDocuments(p: Rent | Buy): string[] {
  const src = (p as MaybeDocs).document_list ?? (p as MaybeDocs).documents;
  if (Array.isArray(src)) {
    return (src as unknown[])
      .map(String)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  if (typeof src === 'string') {
    return src
      .split(/[,;\n]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

export default function PropertyDetailsPage() {
  // --- STATE/REFS: keep all hooks before any conditional return ---
  const touchStartXRef = useRef<number | null>(null);
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const isPanningRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  // moved up from below (must be before any early return)
  const [loadedMap, setLoadedMap] = useState<Record<number, boolean>>({});
  const markLoaded = (i: number) => setLoadedMap((m) => ({ ...m, [i]: true }));

  // we can't depend on `images` (defined later), so track its count in a ref
  const imagesCountRef = useRef(0);

  // Keyboard handlers (single effect). No references to functions/vars defined later.
  useEffect(() => {
    if (activeImageIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveImageIndex(null);
        return;
      }
      if (e.key === 'ArrowLeft') {
        setActiveImageIndex((prev) => {
          if (prev === null) return prev;
          const len = imagesCountRef.current || 0;
          if (len === 0) return prev;
          return prev > 0 ? prev - 1 : len - 1;
        });
        return;
      }
      if (e.key === 'ArrowRight') {
        setActiveImageIndex((prev) => {
          if (prev === null) return prev;
          const len = imagesCountRef.current || 0;
          if (len === 0) return prev;
          return prev < len - 1 ? prev + 1 : 0;
        });
      }
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [activeImageIndex]);

  // Focus the close button when modal opens (single effect)
  useEffect(() => {
    if (activeImageIndex !== null) closeBtnRef.current?.focus();
  }, [activeImageIndex]);

  // Reset zoom when image changes/closes
  useEffect(() => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  }, [activeImageIndex]);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await containerRef.current?.requestFullscreen?.();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch { }
  };

  // --- DATA HOOKS ---
  const { data: me } = useMe();
  const currentUserName = (me?.first_name ?? '') + ' ' + (me?.last_name ?? '');
  const router = useRouter();
  const params = useParams();
  const listingType = (params.listingType as ListingType) ?? 'rent';
  const slug = params.name as string;

  const { data: rentData, isLoading: rentLoading, isError: rentError } = useRentList();
  const { data: buyData, isLoading: buyLoading, isError: buyError } = useBuyList();

  // --- MEMOS ---
  const listings = useMemo<(Rent | Buy)[]>(() => {
    return (listingType === 'rent' ? rentData : buyData) ?? [];
  }, [listingType, rentData, buyData]);

  // --- EARLY RETURNS (safe now because all hooks are above) ---
  if ((listingType === 'rent' && rentLoading) || (listingType === 'buy' && buyLoading)) {
    return (
      <div className="p-20 text-center">
        <h1 className="text-2xl font-semibold text-[#3871C1]">Loading property…</h1>
        <p className="mt-2 text-gray-500">Please wait a moment.</p>
      </div>
    );
  }
  if ((listingType === 'rent' && rentError) || (listingType === 'buy' && buyError)) {
    return (
      <div className="p-20 text-center">
        <h1 className="text-2xl font-semibold text-red-600">Couldn’t load properties</h1>
        <p className="mt-2 text-gray-500">Try refreshing the page.</p>
      </div>
    );
  }

  const rawProperty = listings.find((p) => p.slug === slug);
  if (!rawProperty) {
    return (
      <div className="p-20 text-center">
        <h1 className="text-3xl font-bold text-[#3871C1]">Property Not Found</h1>
        <p className="mt-2 text-gray-500">We couldn’t locate the property you’re looking for.</p>
      </div>
    );
  }

  // --- NORMALIZED FIELDS ---
  const images = pickImages(rawProperty);
  const hasRealImages = images.length > 0;
  const gallerySources = hasRealImages ? images : ['/placeholder.png'];

  imagesCountRef.current = hasRealImages ? images.length : 0; // keep ref in sync
  const isPopular = pickIsPopular(rawProperty);
  const documents = pickDocuments(rawProperty);
  const isRent = listingType === 'rent';

  // --- NON-HOOK HELPERS ---
  const openImageModal = (index: number) => {
    if (!hasRealImages) return; // don't open when only placeholder
    setActiveImageIndex(index);
  };
  const closeModal = () => setActiveImageIndex(null);
  const prevImage = () =>
    setActiveImageIndex((prev) => (prev! > 0 ? prev! - 1 : images.length - 1));
  const nextImage = () =>
    setActiveImageIndex((prev) => (prev! < images.length - 1 ? prev! + 1 : 0));

  const formatPricePH = (value: number | string): string => {
    const n = typeof value === 'number' ? value : Number(String(value).replace(/[^\d.-]/g, ''));
    if (!Number.isFinite(n)) return '';
    return new Intl.NumberFormat('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="min-h-screen bg-[#F4F7FC] text-[#002353] py-16 px-8 md:px-24"
    >
      {/* Title */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <h1 className="text-3xl sm:text-4xl font-bold">{rawProperty.name}</h1>
        {isPopular && (
          <div className="flex items-center gap-2 bg-[#3871C1] px-3 py-1 rounded-full shadow text-white text-sm font-medium">
            {/* star icon */}
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M7.999 1.6a.8.8 0 0 1 .76.57l.944 3.565 2.683 1.547a.8.8 0 0 1 0 1.396l-2.683 1.548-.944 3.564a.8.8 0 0 1-1.52 0L6.535 10.23l-2.683-1.548a.8.8 0 0 1 0-1.396l2.683-1.547.944-3.565A.8.8 0 0 1 8 1.6z"
                fill="white"
              />
            </svg>
            Popular
          </div>
        )}
        {/* Right: Tags */}
        {(rawProperty.tags?.length ?? 0) > 0 && (
          <div className="flex flex-wrap gap-2">
            {rawProperty.tags!.map((tag, i) => (
              <span
                key={i}
                className="text-[#3871C1] text-xs font-medium px-3 py-1 border border-[#C9DBEE] rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Price & Address */}
      <p className="text-2xl font-semibold text-[#3871C1] mb-1">
        ₱{formatPricePH(rawProperty.price)}
        {isRent && <span className="text-base font-normal text-[#002353]/60"> / {rawProperty.freq}</span>}
      </p>
      <p className="text-sm text-[#5C7188] mb-6">{rawProperty.address}</p>
      {rawProperty.lister_name && (
        <div className="flex items-center gap-2 text-xs sm:text-sm text-[#5C7188] mb-6">
          <UserIcon className="h-4 w-4 text-[#3871C1]" />
          <span>
            Listed by <span className="font-semibold text-[#002353]">{rawProperty.lister_name}</span>
          </span>
        </div>
      )}
      {/* Image Gallery */}
      <div className="mb-10">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {gallerySources.slice(0, 3).map((src, i, arr) => {
            const showOverlay = i === arr.length - 1 && images.length > arr.length;
            const clickable = hasRealImages;

            return (
              <button
                key={i}
                type="button"
                onClick={clickable ? () => openImageModal(i) : undefined}
                disabled={!clickable}
                aria-disabled={!clickable}
                aria-label={
                  clickable
                    ? `Open photo ${i + 1} of ${images.length}`
                    : 'No photos available'
                }
                className={`group relative aspect-[4/3] rounded-xl overflow-hidden shadow focus:outline-none
            ${clickable ? 'focus-visible:ring-2 focus-visible:ring-[#3871C1] cursor-pointer'
                    : 'cursor-default'}`}
              >
                <div className={`absolute inset-0 ${loadedMap[i] ? '' : 'bg-gray-200 animate-pulse'}`} />
                <Image
                  src={src}
                  alt={`${rawProperty.name} photo ${i + 1}`}
                  fill
                  sizes="(min-width:1280px) 33vw, (min-width:768px) 33vw, 50vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  onLoadingComplete={() => markLoaded(i)}
                  loading={i < 3 ? 'eager' : 'lazy'}
                  draggable={false}
                />
                {i === 0 && images.length > 0 && (
                  <span className="absolute left-2 top-2 text-xs font-medium bg-black/50 text-white px-2 py-1 rounded">
                    {images.length} {images.length === 1 ? 'photo' : 'photos'}
                  </span>
                )}
                {showOverlay && (
                  <div className="absolute inset-0 bg-black/40 text-white flex items-center justify-center">
                    <span className="text-sm sm:text-base font-medium">
                      View all photos (+{images.length - arr.length})
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
      {/* Description */}
      {rawProperty.description && (
        <div className="bg-white rounded-xl p-6 shadow mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-start mb-4 gap-4">
            <h2 className="text-xl font-semibold text-[#002353]">Property Description</h2>

            {/* Inline Features */}
            <div className="flex gap-6 text-sm text-[#5C7188]">
              <div className="flex items-center gap-2">
                <Image src="/PropertySection/bed.svg" alt="Beds" width={20} height={20} />
                <span>{rawProperty.bed} Beds</span>
              </div>
              <div className="flex items-center gap-2">
                <Image src="/PropertySection/bath.svg" alt="Baths" width={20} height={20} />
                <span>{rawProperty.bath} Baths</span>
              </div>
              <div className="flex items-center gap-2">
                <Image src="/PropertySection/size.svg" alt="Size" width={20} height={20} />
                <span>{rawProperty.size}</span>
              </div>
            </div>
          </div>

          <p className="text-sm text-[#5C7188] leading-relaxed tracking-wide">{rawProperty.description}</p>
        </div>
      )}

      {/* Map Embed */}
      <div className="mb-10 rounded-xl overflow-hidden shadow">
        <iframe
          src={`https://www.google.com/maps?q=${encodeURIComponent(rawProperty.address)}&output=embed`}
          width="100%"
          height="300"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>

      {/* Amenities / Documents */}
      {(rawProperty.amenities?.length || documents.length) && (
        <div className="mb-10 grid grid-cols-1 md:grid-cols-2 gap-8">
          {rawProperty.amenities?.length ? (
            <div>
              <h2 className="text-2xl font-semibold mb-2">Amenities</h2>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                {rawProperty.amenities!.map((amenity, i) => (
                  <li key={i}>{amenity}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {documents.length ? (
            <div>
              <h2 className="text-2xl font-semibold mb-2">Available Documents</h2>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                {documents.map((doc, i) => (
                  <li key={i}>{doc}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      )}

      {/* Reviews */}
      <ReviewSection
        propertyId={rawProperty.id}
        slug={rawProperty.slug}
        isRent={isRent}
        propertyName={rawProperty.name}
        currentUserName={currentUserName}
        currentUserId={me?.id}
      />

      {/* Similar Properties */}
      {listings.filter((p) => p.slug !== rawProperty.slug).length > 0 && (
        <div className="mb-16">
          <h2 className="text-2xl font-semibold mb-4">Similar Properties</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings
              .filter((p) => p.slug !== rawProperty.slug)
              .slice(0, 3)
              .map((item, index) => (
                <PropertyCard
                  key={item.slug ?? index}
                  imageSrc={pickImages(item)[0] ?? "/logo.svg"}
                  price={item.price}
                  name={item.name}
                  isPopular={pickIsPopular(item)}
                  address={item.address}
                  freq={listingType === "rent" ? (item as Rent).freq : ""}
                  bed={item.bed}
                  bath={item.bath}
                  size={String(item.size)}
                  listingType={listingType}
                  listedBy={item.listed_by}
                  slug={item.slug}
                />
              ))}
          </div>
        </div>
      )}

      {/* Floating Contact Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        className="fixed bottom-8 left-0 right-0 z-50 px-6"
      >
        {rawProperty.lister_id === me?.id ? (
          <div className="bg-white/50 backdrop-blur-sm shadow rounded-2xl px-6 py-5 w-fit mx-auto border border-gray-200 flex justify-center">
            <button
              onClick={() => router.push("/dashboard#myListingsSection")}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#5AA6FF] via-[#3871C1] to-[#2D3E8B] text-white font-semibold shadow-md hover:shadow-lg transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18" />
              </svg>
              Go to My Listings
            </button>
          </div>
        ) : (
          <div className="bg-white/50 backdrop-blur-sm shadow rounded-2xl px-6 py-5 max-w-4xl mx-auto border border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-center sm:text-left">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-[#002353]">Interested in this property?</h2>
                <p className="text-sm text-[#5C7188]">
                  Send an offer or schedule a visit — we’re ready to assist you.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                {/* Send Offer (auth-gated) */}
                <Button
                  onClick={() => {
                    if (me?.id) {
                      setShowOfferModal(true);
                    } else {
                      router.push(`/auth?login&redirect=/${listingType}/${rawProperty.slug}?action=offer`);
                    }
                  }}
                  title={me?.id ? undefined : 'Sign in required'}
                  aria-label="Send an Offer"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#5AA6FF] via-[#3871C1] to-[#2D3E8B] text-white font-semibold shadow-md hover:shadow-lg transition"
                >
                  Purchase
                </Button>

                {/* Schedule a Visit (auth-gated) */}
                <Button
                  variant="quaternary"
                  onClick={() => {
                    if (me?.id) {
                      setShowVisitModal(true);
                    } else {
                      router.push(`/auth?login&redirect=/${listingType}/${rawProperty.slug}?action=visit`);
                    }
                  }}
                  title={me?.id ? undefined : 'Sign in required'}
                  aria-label="Schedule a Visit"
                >
                  Schedule a Visit
                </Button>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      <ScheduleVisitModal
        isOpen={showVisitModal}
        onClose={() => setShowVisitModal(false)}
        propertyName={rawProperty.name}
      />

      {/* Image Modal */}
      {activeImageIndex !== null && (
        <div
          className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-label={`Photos of ${rawProperty.name}`}
          onClick={closeModal}
        >
          <motion.div
            ref={containerRef}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="relative w-[92vw] max-w-6xl outline-none"
            onClick={(e) => e.stopPropagation()}
          >
            {/* --- Focus trap sentinels --- */}
            <span tabIndex={0} onFocus={() => closeBtnRef.current?.focus()} />

            {/* Top bar (gradient) */}
            <div className="pointer-events-none absolute left-0 right-0 top-0 z-20 bg-gradient-to-b from-black/60 to-transparent">
              <div className="pointer-events-auto flex items-center justify-between p-3">
                <span className="text-white/90 text-sm px-2 py-1 rounded bg-black/30">
                  {activeImageIndex + 1} / {images.length}
                </span>
                <div className="flex items-center gap-2">
                  {/* Fullscreen */}
                  <button
                    onClick={toggleFullscreen}
                    className="text-white bg-white/10 hover:bg-white/20 p-2 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                    title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                  >
                    {/* square ↔ fullscreen icons */}
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path stroke="currentColor" strokeWidth="2" d="M8 3H4v4M16 3h4v4M8 21H4v-4M16 21h4v-4" />
                    </svg>
                  </button>

                  {/* Zoom toggle */}
                  <button
                    onClick={() => setZoom((z) => (z === 1 ? 1.75 : 1))}
                    className="text-white bg-white/10 hover:bg-white/20 p-2 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    aria-label={zoom === 1 ? 'Zoom in' : 'Zoom out'}
                    title={zoom === 1 ? 'Zoom in' : 'Zoom out'}
                  >
                    {zoom === 1 ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path stroke="currentColor" strokeWidth="2" d="M11 4v6M8 7h6M21 21l-5.2-5.2" />
                        <circle cx="10" cy="10" r="6" stroke="currentColor" strokeWidth="2" />
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path stroke="currentColor" strokeWidth="2" d="M8 10h6M21 21l-5.2-5.2" />
                        <circle cx="10" cy="10" r="6" stroke="currentColor" strokeWidth="2" />
                      </svg>
                    )}
                  </button>

                  {/* Download original */}
                  <a
                    href={images[activeImageIndex]}
                    download
                    target="_blank"
                    rel="noreferrer"
                    className="text-white bg-white/10 hover:bg-white/20 p-2 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    aria-label="Download image"
                    title="Download"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path stroke="currentColor" strokeWidth="2" d="M12 3v12m0 0l-4-4m4 4 4-4M4 21h16" />
                    </svg>
                  </a>

                  {/* Close */}
                  <button
                    ref={closeBtnRef}
                    onClick={closeModal}
                    className="text-white bg-white/10 hover:bg-white/20 p-2 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    aria-label="Close"
                    title="Close"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Image stage with zoom/pan/swipe + side fades */}
            <div
              className="relative h-[76vh] sm:h-[78vh] w-full overflow-hidden rounded-xl bg-black select-none"
              onDoubleClick={() => setZoom((z) => (z === 1 ? 1.75 : 1))}
              onPointerDown={(e) => {
                if (zoom === 1) return;
                isPanningRef.current = true;
                (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
                lastPointRef.current = { x: e.clientX, y: e.clientY };
              }}
              onPointerMove={(e) => {
                if (!isPanningRef.current || zoom === 1 || !lastPointRef.current) return;
                const dx = e.clientX - lastPointRef.current.x;
                const dy = e.clientY - lastPointRef.current.y;
                lastPointRef.current = { x: e.clientX, y: e.clientY };
                setOffset((o) => ({ x: o.x + dx, y: o.y + dy }));
              }}
              onPointerUp={(e) => {
                isPanningRef.current = false;
                lastPointRef.current = null;
                (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
              }}
              onWheel={(e) => {
                if (!e.ctrlKey && !e.metaKey) return;
                e.preventDefault();
                setZoom((z) => {
                  const next = Math.min(3, Math.max(1, z + (e.deltaY < 0 ? 0.15 : -0.15)));
                  if (next === 1) setOffset({ x: 0, y: 0 });
                  return next;
                });
              }}
              onTouchStart={(e) => {
                touchStartXRef.current = e.touches[0].clientX;
              }}
              onTouchEnd={(e) => {
                const startX = touchStartXRef.current ?? 0;
                const delta = e.changedTouches[0].clientX - startX;

                if (Math.abs(delta) > 50 && zoom === 1) {
                  if (delta < 0) {
                    nextImage();
                  } else {
                    prevImage();
                  }
                }

                touchStartXRef.current = null;
              }}

              style={{ cursor: zoom === 1 ? 'default' : 'grab' }}
            >
              {/* Subtle side fades so arrows are readable */}
              <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-black/60 to-transparent" />
              <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-black/60 to-transparent" />

              {/* Cross-fade between images */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeImageIndex}
                  initial={{ opacity: 0.6 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0.4 }}
                  transition={{ duration: 0.18 }}
                  className="absolute inset-0 will-change-transform"
                  style={{
                    transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${zoom})`,
                    transition: zoom === 1 ? 'transform 150ms ease-out' : undefined,
                  }}
                >
                  <Image
                    src={images[activeImageIndex]}
                    alt={`Photo ${activeImageIndex + 1} of ${rawProperty.name}`}
                    fill
                    sizes="(min-width:1280px) 1024px, 92vw"
                    className="object-contain"
                    priority
                    draggable={false}
                  />
                </motion.div>
              </AnimatePresence>

              {/* Prev / Next */}
              <button
                onClick={prevImage}
                aria-label="Previous image"
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={nextImage}
                aria-label="Next image"
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Caption band */}
              {(rawProperty.aidesc?.[activeImageIndex] || rawProperty.address) && (
                <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent">
                  <div className="pointer-events-auto p-3 flex items-start justify-between gap-3">
                    <p className="text-white/90 text-xl leading-snug line-clamp-2">
                      {rawProperty.aidesc?.[activeImageIndex] ?? rawProperty.address}
                    </p>

                    {!!rawProperty.aidesc?.[activeImageIndex] && (
                      <span className="shrink-0 inline-flex items-center justify-center gap-1 text-white/90 px-3 py-1 rounded text-xl leading-none">
                        <svg
                          className="block h-[1em] w-[1em] shrink-0"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                          fill="currentColor"
                        >
                          <path d="M12 2l2.1 4.26 4.7.68-3.4 3.31.8 4.75L12 13.77 7.8 15 8.6 10.25 5.2 6.94l4.7-.68L12 2z" />
                        </svg>
                        <span className="italic">Caption is AI generated</span>
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto px-1 pb-1">
                {images.map((thumb, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImageIndex(i)}
                    className={`relative h-16 w-24 shrink-0 rounded-md overflow-hidden border
                ${i === activeImageIndex ? 'border-white' : 'border-white/20'}
                focus:outline-none focus-visible:ring-2 focus-visible:ring-white`}
                    aria-label={`Go to photo ${i + 1}`}
                  >
                    <Image src={thumb} alt="" fill sizes="96px" className="object-cover" draggable={false} />
                  </button>
                ))}
              </div>
            )}

            {/* Preload neighbors for instant nav */}
            {images.length > 1 && (
              <>
                <Image src={images[(activeImageIndex + 1) % images.length]} alt="" width={1} height={1} className="hidden" priority />
                <Image src={images[(activeImageIndex - 1 + images.length) % images.length]} alt="" width={1} height={1} className="hidden" priority />
              </>
            )}

            {/* --- Focus trap sentinel --- */}
            <span tabIndex={0} onFocus={() => closeBtnRef.current?.focus()} />
          </motion.div>
        </div>
      )}
      <SendOfferModal
        isOpen={showOfferModal}
        onClose={() => setShowOfferModal(false)}
        property={{
          listingType: listingType,
          name: rawProperty.name,
          rentId: rawProperty.id,
          freq: rawProperty.freq,
          listerId: rawProperty.lister_id ?? "",
          tenantId: me?.id ?? "",
          address: rawProperty.address,
          price: rawProperty.price,
          image: hasRealImages ? images[0] : "/logo.svg", // <-- fallback
        }}
      />
    </motion.div>
  );
}
