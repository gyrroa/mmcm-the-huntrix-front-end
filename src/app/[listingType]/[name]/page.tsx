'use client';

import { motion } from 'framer-motion';
import Image from "next/image";
import { useParams, useRouter } from 'next/navigation';
import propertyData from '@/data/properties.json';
import Button from "@/components/button";
import { useState } from 'react';

type Property = {
    slug: string;
    name: string;
    price: string;
    address: string;
    bed: string;
    bath: string;
    size: string;
    images: string[];
    isPopular?: boolean;
    description?: string;
    amenities?: string[];
};

type ListingType = 'rent' | 'buy';

export default function PropertyDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const listingType = params.listingType as ListingType;
    const slug = params.name as string;

    const listings: Property[] = propertyData[listingType];
    const property = listings.find((p) => p.slug === slug);
    const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);
    if (!property) {
        return (
            <div className="p-20 text-center">
                <h1 className="text-3xl font-bold text-[#3871C1]">Property Not Found</h1>
                <p className="mt-2 text-gray-500">{"We couldn’t locate the property you're looking for."}</p>
            </div>
        );
    }
    const openImageModal = (index: number) => setActiveImageIndex(index);
    const closeModal = () => setActiveImageIndex(null);
    const prevImage = () => setActiveImageIndex((prev) => (prev! > 0 ? prev! - 1 : property.images.length - 1));
    const nextImage = () => setActiveImageIndex((prev) => (prev! < property.images.length - 1 ? prev! + 1 : 0));
    const handleClick = (item: Property) => {
        const slug = item.name.toLowerCase().replace(/\s+/g, '-');
        router.push(`/${listingType}/${slug}`);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="min-h-screen bg-[#F4F7FC] text-[#002353] py-16 px-8 md:px-24"
        >            {/* Title */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
                <h1 className="text-3xl sm:text-4xl font-bold">{property.name}</h1>
                {property.isPopular && (
                    <div className="flex items-center gap-2 bg-[#3871C1] px-3 py-1 rounded-full shadow text-white text-sm font-medium">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path fillRule="evenodd" clipRule="evenodd" d="M4.00001 1.6001C4.21218 1.6001 4.41566 1.68438 4.56569 1.83441C4.71572 1.98444 4.80001 2.18792 4.80001 2.4001V3.2001H5.60001C5.81218 3.2001 6.01566 3.28438 6.16569 3.43441C6.31572 3.58444 6.40001 3.78792 6.40001 4.0001C6.40001 4.21227 6.31572 4.41575 6.16569 4.56578C6.01566 4.71581 5.81218 4.8001 5.60001 4.8001H4.80001V5.6001C4.80001 5.81227 4.71572 6.01575 4.56569 6.16578C4.41566 6.31581 4.21218 6.4001 4.00001 6.4001C3.78783 6.4001 3.58435 6.31581 3.43432 6.16578C3.28429 6.01575 3.20001 5.81227 3.20001 5.6001V4.8001H2.40001C2.18783 4.8001 1.98435 4.71581 1.83432 4.56578C1.68429 4.41575 1.60001 4.21227 1.60001 4.0001C1.60001 3.78792 1.68429 3.58444 1.83432 3.43441C1.98435 3.28438 2.18783 3.2001 2.40001 3.2001H3.20001V2.4001C3.20001 2.18792 3.28429 1.98444 3.43432 1.83441C3.58435 1.68438 3.78783 1.6001 4.00001 1.6001ZM4.00001 9.6001C4.21218 9.6001 4.41566 9.68438 4.56569 9.83441C4.71572 9.98444 4.80001 10.1879 4.80001 10.4001V11.2001H5.60001C5.81218 11.2001 6.01566 11.2844 6.16569 11.4344C6.31572 11.5844 6.40001 11.7879 6.40001 12.0001C6.40001 12.2123 6.31572 12.4158 6.16569 12.5658C6.01566 12.7158 5.81218 12.8001 5.60001 12.8001H4.80001V13.6001C4.80001 13.8123 4.71572 14.0158 4.56569 14.1658C4.41566 14.3158 4.21218 14.4001 4.00001 14.4001C3.78783 14.4001 3.58435 14.3158 3.43432 14.1658C3.28429 14.0158 3.20001 13.8123 3.20001 13.6001V12.8001H2.40001C2.18783 12.8001 1.98435 12.7158 1.83432 12.5658C1.68429 12.4158 1.60001 12.2123 1.60001 12.0001C1.60001 11.7879 1.68429 11.5844 1.83432 11.4344C1.98435 11.2844 2.18783 11.2001 2.40001 11.2001H3.20001V10.4001C3.20001 10.1879 3.28429 9.98444 3.43432 9.83441C3.58435 9.68438 3.78783 9.6001 4.00001 9.6001ZM9.60001 1.6001C9.77656 1.60004 9.94817 1.65839 10.0881 1.76605C10.228 1.87371 10.3284 2.02463 10.3736 2.1953L11.3168 5.7601L14 7.3073C14.1216 7.37751 14.2226 7.4785 14.2928 7.60011C14.363 7.72173 14.4 7.85967 14.4 8.0001C14.4 8.14052 14.363 8.27847 14.2928 8.40008C14.2226 8.52169 14.1216 8.62268 14 8.6929L11.3168 10.2409L10.3728 13.8049C10.3275 13.9754 10.2272 14.1262 10.0873 14.2337C9.94748 14.3413 9.77602 14.3996 9.59961 14.3996C9.42319 14.3996 9.25173 14.3413 9.11189 14.2337C8.97205 14.1262 8.87169 13.9754 8.82641 13.8049L7.88321 10.2401L5.20001 8.6929C5.0784 8.62268 4.97742 8.52169 4.90721 8.40008C4.837 8.27847 4.80004 8.14052 4.80004 8.0001C4.80004 7.85967 4.837 7.72173 4.90721 7.60011C4.97742 7.4785 5.0784 7.37751 5.20001 7.3073L7.88321 5.7593L8.82721 2.1953C8.87237 2.02476 8.97263 1.87394 9.1124 1.76629C9.25216 1.65865 9.42359 1.60022 9.60001 1.6001Z" fill="white" />
                        </svg>
                        Popular
                    </div>
                )}
                {/* Right: Tags */}
                <div className="flex flex-wrap gap-2">
                    {['Pet Friendly', 'Newly Renovated', 'Flood-Free Area'].map((tag, i) => (
                        <span
                            key={i}
                            className="text-[#3871C1] text-xs font-medium px-3 py-1 border border-[#C9DBEE] rounded-full"
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            </div>

            {/* Price & Address */}
            <p className="text-2xl font-semibold text-[#3871C1] mb-1">
                ₱{property.price}
                {listingType === 'rent' && (
                    <span className="text-base font-normal text-[#002353]/60"> /month</span>
                )}
            </p>
            <p className="text-sm text-[#5C7188] mb-6">{property.address}</p>

            {/* Image Gallery */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mb-10">
                {property.images.map((src, i) => (
                    <motion.div
                        key={i}
                        onClick={() => openImageModal(i)}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        className="relative aspect-video rounded-xl overflow-hidden shadow-md cursor-pointer"
                    >
                        <Image
                            src={src}
                            alt={`${property.name} image ${i + 1}`}
                            fill
                            className="object-cover"
                        />
                    </motion.div>
                ))}
            </div>
            {/* Description */}
            {property.description && (
                <div className="bg-white rounded-xl p-6 shadow mb-10">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-start mb-4 gap-4">
                        <h2 className="text-xl font-semibold text-[#002353]">Property Description</h2>

                        {/* Inline Features */}
                        <div className="flex gap-6 text-sm text-[#5C7188]">
                            <div className="flex items-center gap-2">
                                <Image src="/PropertySection/bed.svg" alt="Beds" width={20} height={20} />
                                <span>{property.bed} Beds</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Image src="/PropertySection/bath.svg" alt="Baths" width={20} height={20} />
                                <span>{property.bath} Baths</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Image src="/PropertySection/size.svg" alt="Size" width={20} height={20} />
                                <span>{property.size}</span>
                            </div>
                        </div>
                    </div>

                    <p className="text-sm text-[#5C7188] leading-relaxed tracking-wide">
                        {property.description}
                    </p>
                </div>
            )}

            {/* Map Embed */}
            <div className="mb-10 rounded-xl overflow-hidden shadow">
                <iframe
                    src={`https://www.google.com/maps?q=${encodeURIComponent(property.address)}&output=embed`}
                    width="100%"
                    height="300"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
            </div>
            {/* Amenities */}
            {property.amenities && (
                <div className="mb-10 ">
                    <h2 className="text-2xl font-semibold mb-2">Amenities</h2>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                        {property.amenities.map((amenity, i) => (
                            <li key={i}>{amenity}</li>
                        ))}
                    </ul>
                </div>
            )}
            {/* Nearby Places */}
            <div className="mb-10">
                <h2 className="text-2xl font-semibold mb-3">Nearby Places</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-[#5C7188]">
                    <div className="bg-white p-4 rounded-lg shadow">
                        <h3 className="font-semibold text-[#002353] mb-1">Schools</h3>
                        <ul className="list-disc list-inside space-y-1">
                            <li>ABC High School - 5 min walk</li>
                            <li>XYZ International School - 10 min drive</li>
                        </ul>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                        <h3 className="font-semibold text-[#002353] mb-1">Hospitals</h3>
                        <ul className="list-disc list-inside space-y-1">
                            <li>St. Jude Medical Center - 2.5 km</li>
                            <li>City Health Clinic - 1.2 km</li>
                        </ul>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                        <h3 className="font-semibold text-[#002353] mb-1">Transportation</h3>
                        <ul className="list-disc list-inside space-y-1">
                            <li>Bus Terminal - 8 min walk</li>
                            <li>MRT Station - 12 min drive</li>
                        </ul>
                    </div>
                </div>
            </div>
            {/* Similar Properties */}
            <div className="mb-16">
                <h2 className="text-2xl font-semibold mb-4">Similar Properties</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {listings
                        .filter((p) => p.slug !== property.slug)
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
                                        src={item.images[0]}
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
                                        {listingType === 'rent' && <span className="text-xs font-normal"> /month</span>}
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
                            <h2 className="text-lg sm:text-xl font-semibold text-[#002353]">
                                {"Interested in this property?"}
                            </h2>
                            <p className="text-sm text-[#5C7188]">
                                {"Schedule a visit or contact our agent — we're ready to assist you."}
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                            <Button>Contact via Email</Button>
                            <Button variant="quaternary">Schedule a Visit</Button>
                        </div>
                    </div>
                </div>
            </motion.div>


            {activeImageIndex !== null && (
                <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center transition-opacity"
                    onClick={closeModal}>
                    <div className="relative max-w-6xl w-full max-h-[90vh] mx-4"
                        onClick={(e) => e.stopPropagation()}>
                        {/* Large Image */}
                        <Image
                            src={property.images[activeImageIndex]}
                            alt={`Image ${activeImageIndex + 1}`}
                            width={1600}
                            height={1000}
                            className="rounded-xl object-cover h-[80vh] w-full shadow-2xl"
                            priority
                        />

                        {/* Close Button */}
                        <button
                            onClick={closeModal}
                            aria-label="Close modal"
                            className="absolute top-4 right-4 text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm p-2 rounded-full transition cursor-pointer"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" height="24" width="24" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        {/* Previous Button */}
                        <button
                            onClick={prevImage}
                            aria-label="Previous image"
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-full p-3 transition shadow-md cursor-pointer"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                className="w-6 h-6"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>

                        {/* Next Button */}
                        <button
                            onClick={nextImage}
                            aria-label="Next image"
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-full p-3 transition shadow-md cursor-pointer"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                className="w-6 h-6"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                        ›
                    </div>
                </div>
            )}
        </motion.div >
    );
}
