'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import PropertyCard from '@/components/ui/home/PropertyCard';
import { useRentList } from '@/features/rent/hooks';
import { Rent } from '@/features/rent/types';
import { useBuyList } from '@/features/buy/hooks';
import { Buy } from '@/features/buy/types';

type ListingType = 'rent' | 'buy';

export default function BrowsePropertiesPage() {
    const router = useRouter();
    const params = useParams();
    const listingType = (params.listingType as ListingType) ?? 'rent';

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedBedrooms, setSelectedBedrooms] = useState(''); // '' | '1' | ... | '5'
    const [selectedBathrooms, setSelectedBathrooms] = useState('');
    const [showPopularOnly, setShowPopularOnly] = useState(false);

    // fetch both; we'll pick based on route
    const { data: rentData, isLoading: rentLoading, isError: rentError } = useRentList();
    const { data: buyData, isLoading: buyLoading, isError: buyError } = useBuyList();

    // route guard
    useEffect(() => {
        if (!['rent', 'buy'].includes(listingType)) router.push('/');
    }, [listingType, router]);

    // popularity derived from tags
    const isPopularByTags = (tags: string[] = []) => {
        const hotTags = new Set(['popular', 'featured', 'hot', 'trending', 'top']);
        return tags.some(t => hotTags.has(t.toLowerCase()));
    };

    // choose the right dataset then split using lease_term
    const listings = useMemo<Rent[] | Buy[]>(() => {
        return (listingType === 'rent' ? rentData : buyData) ?? [];
    }, [listingType, rentData, buyData]);

    // filtering
    const filteredListings = useMemo(() => {
        const search = searchTerm.trim().toLowerCase();

        return listings.filter((item) => {
            const matchesSearch = !search ||
                item.name.toLowerCase().includes(search) ||
                item.address.toLowerCase().includes(search) ||
                (item.description?.toLowerCase().includes(search) ?? false);

            const matchesBedroom =
                selectedBedrooms === '' ||
                (selectedBedrooms === '5' ? item.bed >= 5 : item.bed === Number(selectedBedrooms));

            const matchesBathroom =
                selectedBathrooms === '' ||
                (selectedBathrooms === '5' ? item.bath >= 5 : item.bath === Number(selectedBathrooms));

            const matchesPopular = !showPopularOnly || isPopularByTags(item.tags);

            return matchesSearch && matchesBedroom && matchesBathroom && matchesPopular;
        });
    }, [listings, searchTerm, selectedBedrooms, selectedBathrooms, showPopularOnly]);


    const isLoading = listingType === 'rent' ? rentLoading : buyLoading;
    const isError = listingType === 'rent' ? rentError : buyError;

    const fallbackImage =
        'https://via.placeholder.com/800x600?text=No+Image';

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="min-h-screen px-6 sm:px-24 py-5 pb-20 bg-gradient-to-b from-white to-[#D2E4FF] text-[#002353]"
        >
            <div className="flex flex-col gap-4 items-center text-center mb-10">
                <h1 className="text-[36px] sm:text-[40px] font-bold leading-snug">
                    {listingType === 'rent' ? 'Browse Rentals' : 'Browse Properties for Sale'}
                </h1>
                <p className="text-[16px] text-[#5C7188]">
                    Explore listings tailored to your needs and location.
                </p>
            </div>

            {/* Search bar */}
            <div className="flex justify-center mb-5">
                <div className="flex items-center bg-[#F9FAFF] border-2 border-[#D2E4FF] rounded-lg px-4 py-[16px] w-full max-w-xl">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none">
                        <path d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z" stroke="#3871C1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M22 22L20 20" stroke="#3871C1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search for property name, address..."
                        className="ml-4 bg-transparent focus:outline-none text-[#5C7188] placeholder-[#5C7188] text-[16px] font-medium w-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap justify-center gap-4 mb-10">
                {/* Bedrooms Filter */}
                <div className="relative w-[200px]">
                    <select
                        value={selectedBedrooms}
                        onChange={(e) => setSelectedBedrooms(e.target.value)}
                        className="appearance-none w-full bg-[#F9FAFF] border-2 border-[#D2E4FF] hover:border-[#3871C1] text-[#5C7188] text-[15px] font-medium px-4 py-3 pr-10 rounded-lg focus:outline-none transition"
                    >
                        <option value="">All Bedrooms</option>
                        <option value="1">1 Bedroom</option>
                        <option value="2">2 Bedrooms</option>
                        <option value="3">3 Bedrooms</option>
                        <option value="4">4 Bedrooms</option>
                        <option value="5">5+ Bedrooms</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                        <svg className="w-4 h-4 text-[#3871C1]" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M7 7l3-3 3 3m0 6l-3 3-3-3" stroke="currentColor" strokeWidth="1.5" fill="none" />
                        </svg>
                    </div>
                </div>

                {/* Bathrooms Filter */}
                <div className="relative w-[200px]">
                    <select
                        value={selectedBathrooms}
                        onChange={(e) => setSelectedBathrooms(e.target.value)}
                        className="appearance-none w-full bg-[#F9FAFF] border-2 border-[#D2E4FF] hover:border-[#3871C1] text-[#5C7188] text-[15px] font-medium px-4 py-3 pr-10 rounded-lg focus:outline-none transition"
                    >
                        <option value="">All Bathrooms</option>
                        <option value="1">1 Bathroom</option>
                        <option value="2">2 Bathrooms</option>
                        <option value="3">3 Bathrooms</option>
                        <option value="4">4 Bathrooms</option>
                        <option value="5">5+ Bathrooms</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                        <svg className="w-4 h-4 text-[#3871C1]" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M7 7l3-3 3 3m0 6l-3 3-3-3" stroke="currentColor" strokeWidth="1.5" fill="none" />
                        </svg>
                    </div>
                </div>

                {/* Popular Checkbox (derived from tags) */}
                <label className="flex items-center gap-3 px-4 py-2 border-2 border-[#D2E4FF] bg-[#F9FAFF] rounded-lg text-sm text-[#5C7188] cursor-pointer transition hover:border-[#3871C1]">
                    <div className="relative w-5 h-5">
                        <input
                            type="checkbox"
                            checked={showPopularOnly}
                            onChange={(e) => setShowPopularOnly(e.target.checked)}
                            className="appearance-none w-5 h-5 rounded-md border border-[#C9DBEE] checked:bg-[#3871C1] checked:border-[#3871C1] transition-all duration-200"
                        />
                        {showPopularOnly && (
                            <svg className="absolute top-0 left-0 w-5 h-5 pointer-events-none" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        )}
                    </div>
                    <span className="text-[15px]">Popular only</span>
                </label>
            </div>

            {/* States */}
            {isLoading ? (
                <div className="text-center mt-20 text-[#5C7188]">
                    <p className="text-lg font-medium">Loading listings…</p>
                </div>
            ) : isError ? (
                <div className="text-center mt-20 text-[#5C7188]">
                    <p className="text-lg font-medium">We couldn’t load listings right now.</p>
                    <p className="text-sm mt-1">Please try again in a moment.</p>
                </div>
            ) : filteredListings.length === 0 ? (
                <div className="text-center mt-20 text-[#5C7188]">
                    <div className="mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto" width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="#C0CFE7" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405M6 6h.01M6 12h.01M6 18h.01M9 6h12M9 12h6M9 18h3" />
                        </svg>
                    </div>
                    <p className="text-lg font-medium">No matching properties found.</p>
                    <p className="text-sm mt-1">Try refining your search or check again later.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[32px]">
                    {filteredListings.map((property) => (
                        <PropertyCard
                            key={property.slug}
                            imageSrc={
                                (property.images && property.images.length > 0
                                    ? (typeof property.images[0] === 'string'
                                        ? property.images[0]
                                        : property.images[0]?.url)
                                    : undefined) ?? fallbackImage
                            }
                            name={property.name}
                            price={property.price}
                            // derive popularity for the card (if the component supports it)
                            isPopular={isPopularByTags(property.tags)}
                            address={property.address}
                            bed={property.bed}
                            bath={property.bath}
                            size={property.size}
                            listingType={listingType}
                        />
                    ))}
                </div>
            )}
        </motion.div>
    );
}
