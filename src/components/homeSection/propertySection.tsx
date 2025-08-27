'use client';

import PropertySelector from '../ui/home/PropertySelector';
import PropertyCard from '../ui/home/PropertyCard';
import Button from '../button';
import SellFeature from '../ui/home/SellFeature';
import { useScroll } from '@/context/ScrollContext';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useInView, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

import { useRentList } from '@/features/rent/hooks';
import { Rent } from '@/features/rent/types';
import { useBuyList } from '@/features/buy/hooks';
import { Buy } from '@/features/buy/types';

type ListingType = 'rent' | 'buy';

type ImageLike = string | { url?: string | null } | null | undefined;

function hasUrl(obj: unknown): obj is { url: string } {
  return typeof obj === 'object' && obj !== null && typeof (obj as { url?: unknown }).url === 'string';
}

function getFirstImageUrl(images: unknown): string | undefined {
  if (!Array.isArray(images) || images.length === 0) return undefined;
  const first = images[0] as ImageLike;
  if (typeof first === 'string') return first;
  if (hasUrl(first)) return first.url;
  return undefined;
}

function isPopularByTags(tags?: string[]): boolean {
  if (!tags || tags.length === 0) return false;
  const hot = new Set(['popular', 'featured', 'hot', 'trending', 'top']);
  return tags.some((t) => hot.has(t.toLowerCase()));
}

const PropertySection: React.FC = () => {
  const router = useRouter();
  const { propertySectionRef } = useScroll();

  const sectionRef = useRef<HTMLElement | null>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  const [selectedTab, setSelectedTab] = useState<'Rent' | 'Buy' | 'Sell'>('Rent');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (sectionRef.current) {
      propertySectionRef.current = sectionRef.current;
    }
  }, [propertySectionRef]);

  // Fetch both; we’ll pick based on tab
  const { data: rentData, isLoading: rentLoading, isError: rentError } = useRentList();
  const { data: buyData, isLoading: buyLoading, isError: buyError } = useBuyList();

  const tab: ListingType | 'sell' = selectedTab.toLowerCase() as ListingType | 'sell';

  const listings = useMemo<(Rent | Buy)[]>(() => {
    if (tab === 'rent') return rentData ?? [];
    if (tab === 'buy') return buyData ?? [];
    return [];
  }, [tab, rentData, buyData]);

  const isLoading = tab === 'rent' ? rentLoading : tab === 'buy' ? buyLoading : false;
  const isError = tab === 'rent' ? rentError : tab === 'buy' ? buyError : false;

  const filtered = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    if (!search) return listings;
    return listings.filter((item) => {
      const inName = item.name.toLowerCase().includes(search);
      const inAddr = item.address.toLowerCase().includes(search);
      const inDesc = (item.description ?? '').toLowerCase().includes(search);
      return inName || inAddr || inDesc;
    });
  }, [listings, searchTerm]);

  const topSix = filtered.slice(0, 6);
  const fallbackImage = 'https://via.placeholder.com/800x600?text=No+Image';

  const renderListings = () => {
    if (selectedTab === 'Sell') {
      return (
        <>
          <div className="col-span-full flex flex-col md:flex-row gap-[32px] w-full">
            <SellFeature
              key="valuation"
              image="/PropertySection/sell/value.svg"
              title="Know Your Home’s Value"
              description="Get a free, no-obligation property evaluation from local experts."
            />
            <SellFeature
              key="offer"
              image="/PropertySection/sell/offer.svg"
              title="Get an Instant Offer"
              description="Skip the hassle and receive a quick, fair offer directly."
            />
            <SellFeature
              key="list"
              image="/PropertySection/sell/list.svg"
              title="List Your Property"
              description="Reach thousands of buyers through our high-visibility platform."
            />
          </div>

          <div className="w-full flex justify-center mt-10 col-span-full">
            <Button variant="primary" onClick={() => router.push('/sell')}>
              Start Selling
            </Button>
          </div>
        </>
      );
    }

    if (isLoading) {
      return (
        <div className="col-span-full text-center text-[#5C7188] mt-6">
          <p className="text-lg font-medium">Loading listings…</p>
        </div>
      );
    }

    if (isError) {
      return (
        <div className="col-span-full text-center text-[#5C7188] mt-6">
          <p className="text-lg font-medium">We couldn’t load listings right now.</p>
          <p className="text-sm mt-1">Please try again in a moment.</p>
        </div>
      );
    }

    if (topSix.length === 0) {
      return (
        <div className="col-span-full text-center text-[#5C7188] mt-6">
          <p className="text-lg font-medium">No matching properties found.</p>
          <p className="text-sm mt-1">Try refining your search or check again later.</p>
        </div>
      );
    }

    return (
      <>
        {topSix.map((property) => (
          <PropertyCard
            key={property.slug}
            imageSrc={getFirstImageUrl((property as { images?: unknown }).images) ?? fallbackImage}
            name={property.name}
            price={property.price}
            isPopular={isPopularByTags(property.tags)}
            address={property.address}
            freq={property.freq}
            bed={property.bed}
            bath={property.bath}
            size={property.size}
            listingType={tab as ListingType}
            listedBy={property.lister_name ?? undefined}
            slug={property.slug}
          />
        ))}

        <div className="w-full flex justify-center mt-10 col-span-full">
          <Button
            onClick={() => router.push(`/browse/${tab}`)}
            className="inline-flex items-center justify-center gap-2 
             px-6 py-3 rounded-full font-semibold text-white 
             bg-gradient-to-r from-[#5AA6FF] via-[#3871C1] to-[#2D3E8B] 
             shadow-[0_8px_20px_rgba(56,113,193,0.35)] 
             hover:shadow-[0_10px_24px_rgba(56,113,193,0.5)] 
             hover:scale-[1.03] active:scale-[0.98] 
             transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-[#3871C1]/30"
          >
            Browse more properties
          </Button>
        </div>
      </>
    );
  };

  return (
    <motion.section
      ref={sectionRef}
      id="propertySection"
      className="
        text-[#002353] flex flex-col items-center text-center
        bg-gradient-to-b from-white to-[#D2E4FF] w-full
        min-h-screen lg:min-h-dvh
        pt-10 lg:pt-[80px]
        px-4 sm:px-6 md:px-10 lg:px-[160px]
        pb-16 lg:pb-[100px]
        gap-10 lg:gap-[64px]
      "
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {/* Title */}
      <div className="flex flex-col gap-[16px]">
        <h1 className="font-bold leading-[140%] text-[28px] sm:text-[32px] lg:text-[40px]">
          Based on your location
        </h1>
        <p className="opacity-70 font-normal text-[14px] sm:text-[16px]">
          Some of our picked properties near your location.
        </p>
      </div>

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-5 w-full">
        <PropertySelector
          activeTab={selectedTab}
          onChangeTab={(t) => setSelectedTab(t as 'Rent' | 'Buy' | 'Sell')}
        />

        {/* Search: full width on mobile, 352px on ≥sm */}
        <div className="flex items-center bg-white border-2 border-[#D2E4FF] rounded-lg px-4 py-4 sm:py-[20px] w-full sm:w-[352px]">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="25" viewBox="0 0 24 25" fill="none">
            <path
              d="M11.5 21.6488C16.7467 21.6488 21 17.3955 21 12.1488C21 6.9021 16.7467 2.6488 11.5 2.6488C6.25329 2.6488 2 6.9021 2 12.1488C2 17.3955 6.25329 21.6488 11.5 21.6488Z"
              stroke="#3871C1"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M22 22.6488L20 20.6488" stroke="#3871C1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <input
            type="text"
            placeholder="Search..."
            className="ml-4 bg-transparent focus:outline-none text-[#5C7188] placeholder-[#5C7188] text-[14px] sm:text-[16px] font-medium w-full opacity-50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Listings or Sell Feature */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-[32px] w-full">
        {renderListings()}
      </div>
    </motion.section>
  );
};

export default PropertySection;
