'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import Button from '@/components/button';
import { useMemo, useState } from 'react';
import ReviewSection from '@/components/homeSection/reviewSection';
import ScheduleVisitModal from '@/components/ui/home/ScheduleVisitModal';
import { Rent } from '@/features/rent/types';
import { Buy } from '@/features/buy/types';
import { useRentList } from '@/features/rent/hooks';
import { useBuyList } from '@/features/buy/hooks';
import { useMe } from '@/features/auth/hooks';

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
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);
  const { data: me } = useMe();
  const currentUserName = (me?.first_name ?? '') + ' ' + (me?.last_name ?? '');
  const router = useRouter();
  const params = useParams();
  const listingType = (params.listingType as ListingType) ?? 'rent';
  const slug = params.name as string; // ← name is the slug

  const { data: rentData, isLoading: rentLoading, isError: rentError } = useRentList();
  const { data: buyData, isLoading: buyLoading, isError: buyError } = useBuyList();

  // pick the correct dataset for the current listingType
  const listings = useMemo<(Rent | Buy)[]>(() => {
    return (listingType === 'rent' ? rentData : buyData) ?? [];
  }, [listingType, rentData, buyData]);

  // while fetching the current dataset, show a friendly loading state
  if ((listingType === 'rent' && rentLoading) || (listingType === 'buy' && buyLoading)) {
    return (
      <div className="p-20 text-center">
        <h1 className="text-2xl font-semibold text-[#3871C1]">Loading property…</h1>
        <p className="mt-2 text-gray-500">Please wait a moment.</p>
      </div>
    );
  }
  // show an error if the relevant query failed
  if ((listingType === 'rent' && rentError) || (listingType === 'buy' && buyError)) {
    return (
      <div className="p-20 text-center">
        <h1 className="text-2xl font-semibold text-red-600">Couldn’t load properties</h1>
        <p className="mt-2 text-gray-500">Try refreshing the page.</p>
      </div>
    );
  }

  // find the property by slug (route param "name")
  const rawProperty = listings.find((p) => p.slug === slug);

  if (!rawProperty) {
    return (
      <div className="p-20 text-center">
        <h1 className="text-3xl font-bold text-[#3871C1]">Property Not Found</h1>
        <p className="mt-2 text-gray-500">We couldn’t locate the property you’re looking for.</p>
      </div>
    );
  }

  // Normalized fields across Rent | Buy (no hooks here → no conditional hooks)
  const images = pickImages(rawProperty);
  const isPopular = pickIsPopular(rawProperty);
  const documents = pickDocuments(rawProperty);
  const isRent = listingType === 'rent';

  const openImageModal = (index: number) => setActiveImageIndex(index);
  const closeModal = () => setActiveImageIndex(null);
  const prevImage = () => setActiveImageIndex((prev) => (prev! > 0 ? prev! - 1 : images.length - 1));
  const nextImage = () => setActiveImageIndex((prev) => (prev! < images.length - 1 ? prev! + 1 : 0));

  // IMPORTANT: use item.slug (you said name is the slug, but slug is already present)
  const handleClick = (item: Rent | Buy) => {
    router.push(`/${listingType}/${item.slug}`);
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
        ₱{rawProperty.price}
        {isRent && <span className="text-base font-normal text-[#002353]/60"> /month</span>}
      </p>
      <p className="text-sm text-[#5C7188] mb-6">{rawProperty.address}</p>

      {/* Image Gallery */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mb-10">
        {(images.length ? images : ['/placeholder.png']).map((src, i) => (
          <motion.div
            key={i}
            onClick={() => openImageModal(i)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ scale: 1.02 }}
            className="relative aspect-video rounded-xl overflow-hidden shadow-md cursor-pointer"
          >
            <Image src={src} alt={`${rawProperty.name} image ${i + 1}`} fill className="object-cover" />
          </motion.div>
        ))}
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
        slug={rawProperty.slug}
        isRent={isRent}
        propertyName={rawProperty.name}
        currentUserName={currentUserName}
      />

      {/* Similar Properties */}
      <div className="mb-16">
        <h2 className="text-2xl font-semibold mb-4">Similar Properties</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings
            .filter((p) => p.slug !== rawProperty.slug)
            .slice(0, 3)
            .map((item, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow overflow-hidden transition cursor-pointer"
                onClick={() => handleClick(item)}
              >
                <div className="relative aspect-video">
                  <Image
                    src={pickImages(item)[0] ?? '/placeholder.png'}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-[#002353]">{item.name}</h3>
                  <p className="text-sm text-[#5C7188] mb-1">{item.address}</p>
                  <p className="text-[#3871C1] font-medium text-sm">
                    ₱{item.price}
                    {isRent && <span className="text-xs font-normal"> /month</span>}
                  </p>
                </div>
              </motion.div>
            ))}
        </div>
      </div>

      {/* Floating Contact Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        className="fixed bottom-8 left-0 right-0 z-50 px-6"
      >
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
                    router.push(`/offers/new?property=${rawProperty.slug}`);
                  } else {
                    router.push(`/auth?login&redirect=/${listingType}/${rawProperty.slug}?action=offer`);
                  }
                }}
                title={me?.id ? undefined : 'Sign in required'}
                aria-label="Send an Offer"
              >
                Send an Offer
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
      </motion.div>

      <ScheduleVisitModal
        isOpen={showVisitModal}
        onClose={() => setShowVisitModal(false)}
        propertyName={rawProperty.name}
      />

      {/* Image Modal */}
      {activeImageIndex !== null && (
        <div
          className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center transition-opacity"
          onClick={closeModal}
        >
          <div className="relative max-w-6xl w-full max-h-[90vh] mx-4" onClick={(e) => e.stopPropagation()}>
            <Image
              src={images[activeImageIndex]}
              alt={`Image ${activeImageIndex + 1}`}
              width={1600}
              height={1000}
              className="rounded-xl object-cover h-[80vh] w-full shadow-2xl"
              priority
            />
            <button
              onClick={closeModal}
              aria-label="Close modal"
              className="absolute top-4 right-4 text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm p-2 rounded-full transition cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" height="24" width="24" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <button
              onClick={prevImage}
              aria-label="Previous image"
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-full p-3 transition shadow-md cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextImage}
              aria-label="Next image"
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-full p-3 transition shadow-md cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
