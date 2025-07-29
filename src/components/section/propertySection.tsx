'use client';

import PropertySelector from "../PropertySelector";
import PropertyCard from "../PropertyCard";
import Button from "../button";
import SellFeature from "../SellFeature";
import { useScroll } from "@/context/ScrollContext";
import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { motion } from "framer-motion";
import propertyData from '@/data/properties.json';
import { useRouter } from "next/navigation";

type ListingType = 'rent' | 'buy';

const PropertySection: React.FC = () => {
    const router = useRouter();
    const { propertySectionRef } = useScroll();
    const sectionRef = useRef(null);
    const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
    const [selectedTab, setSelectedTab] = useState<'Rent' | 'Buy' | 'Sell'>('Rent');

    useEffect(() => {
        if (sectionRef.current) {
            propertySectionRef.current = sectionRef.current;
        }
    }, [propertySectionRef]);

    const renderListings = () => {
        if (selectedTab === 'Sell') {
            return (
                <>
                    <div className="col-span-full flex flex-col md:flex-row gap-[32px] w-full">
                        <SellFeature
                            key="valuation"
                            image="/PropertySection/sell/value.svg"
                            title="Know Your Home's Value"
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

                    <div className="w-full flex justify-center mt-10 col-span-3">
                        <Button variant="primary" onClick={() => router.push("sell")}>Start Selling</Button>
                    </div>
                </>
            );
        }

        const tab = selectedTab.toLowerCase() as ListingType;
        const listings = propertyData[tab];

        return (
            <>
                {listings.map((property) => (
                    <PropertyCard
                        key={property.slug}
                        imageSrc={property.images[0]}
                        name={property.name}
                        price={property.price}
                        isPopular={property.isPopular}
                        address={property.address}
                        bed={property.bed}
                        bath={property.bath}
                        size={property.size}
                        listingType={tab}
                    />
                ))}
                <div className="w-full flex justify-center mt-10 col-span-3">
                    <Button
                        variant="property"
                        onClick={() => router.push(`/browse/${selectedTab.toLowerCase()}`)}
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
            className="text-[#002353] flex flex-col pt-[80px] px-[160px] pb-[100px] gap-[64px] bg-gradient-to-b from-white to-[#D2E4FF] min-h-dvh w-full text-center items-center"
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: "easeOut" }}
        >
            {/* Title */}
            <div className="flex flex-col gap-[16px]">
                <h1 className="font-bold text-[40px] leading-[140%]">Based on your location</h1>
                <p className="opacity-70 text-[16px] font-normal">Some of our picked properties near your location.</p>
            </div>

            {/* Navigation */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-5 justify-between w-full">
                <PropertySelector activeTab={selectedTab} onChangeTab={(tab) => setSelectedTab(tab as 'Rent' | 'Buy' | 'Sell')} />
                <div className="flex items-center bg-[#F9FAFF] border-2 border-[#D2E4FF] rounded-lg px-4 py-[20px] w-[352px]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none">
                        <path d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z" stroke="#3871C1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M22 22L20 20" stroke="#3871C1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search..."
                        className="ml-4 bg-transparent focus:outline-none text-[#5C7188] placeholder-[#5C7188] text-[16px] font-medium w-full opacity-50"
                    />
                </div>
            </div>

            {/* Listings or Sell Feature */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-[32px] w-full">
                {renderListings()}
            </div>
        </motion.section>
    );
};

export default PropertySection;
