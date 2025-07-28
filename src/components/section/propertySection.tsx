'use client';

import PropertySelector from "../PropertySelector";
import PropertyCard from "../PropertyCard";
import Button from "../button";
import { useScroll } from "@/context/ScrollContext";
import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { motion } from "framer-motion";
import Image from "next/image";
import SellFeature from "../SellFeature";

const PropertySection: React.FC = () => {
    const { propertySectionRef } = useScroll();
    const sectionRef = useRef(null);
    const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
    const [selectedTab, setSelectedTab] = useState('Rent');

    useEffect(() => {
        if (sectionRef.current) {
            propertySectionRef.current = sectionRef.current;
        }
    }, [propertySectionRef]);

    const renderListings = () => {
        if (selectedTab === 'Rent') {
            return (
                <>
                    <PropertyCard
                        key={`${selectedTab}-SanIsidro`}
                        imageSrc="PropertySection/rent/SanIsidro.svg"
                        name="San Isidro"
                        price={"25,000"}
                        isPopular={true}
                        address="152 Mabini Street, Brgy. San Isidro, Quezon City, NCR"
                        bed="3"
                        bath="2"
                        size="5x7 m²"
                        listingType="rent"
                    />
                    <PropertyCard
                        key={`${selectedTab}-PalmeraHights`}
                        imageSrc="PropertySection/rent/PalmeraHights.svg"
                        name="Palmera Heights"
                        price={"18,500"}
                        isPopular={true}
                        address="34 Sampaguita Drive, Palmera Heights Subdivision, Antipolo City, Rizal"
                        bed="4"
                        bath="2"
                        size="6x7.5 m²"
                        listingType="rent"
                    />
                    <PropertyCard
                        key={`${selectedTab}-VillaEncarnacion`}
                        imageSrc="PropertySection/rent/VillaEncarnacion.svg"
                        name="Villa Encarnacion"
                        price={"12,000"}
                        isPopular={true}
                        address="67 Narra Avenue, Villa Encarnacion, Iloilo City, Iloilo"
                        bed="4"
                        bath="2"
                        size="8x10 m²"
                        listingType="rent"
                    />
                    <PropertyCard
                        key={`${selectedTab}-BarangayMaligaya`}
                        imageSrc="PropertySection/rent/BarangayMaligaya.svg"
                        name="Barangay Maligaya"
                        price={"15,000"}
                        isPopular={false}
                        address="509 Tandang Sora Road, Brgy. Maligaya, Novaliches, Quezon City"
                        bed="4"
                        bath="2"
                        size="6x8 m²"
                        listingType="rent"
                    />
                    <PropertyCard
                        key={`${selectedTab}-SitioBaybayin`}
                        imageSrc="PropertySection/rent/SitioBaybayin.svg"
                        name="Sitio Baybayin"
                        price={"9,500"}
                        isPopular={false}
                        address="21 Coastal Road, Sitio Baybayin, Brgy. Poblacion, Lipa City, Batangas"
                        bed="2"
                        bath="1"
                        size="5x7.5 m²"
                        listingType="rent"
                    />
                    <PropertyCard
                        key={`${selectedTab}-BayanihanHills`}
                        imageSrc="PropertySection/rent/BayanihanHills.svg"
                        name="Bayanihan Hills"
                        price={"13,800"}
                        isPopular={false}
                        address="88 Katipunan Extension, Bayanihan Hills, Davao City, Davao del Sur"
                        bed="3"
                        bath="1"
                        size="5x7 m²"
                        listingType="rent"
                    />
                    <div className="w-full flex justify-center mt-10 col-span-3">
                        <Button variant="property">Browse more properties</Button>
                    </div>
                </>
            );
        } else if (selectedTab === 'Buy') {
            return (
                <>
                    <PropertyCard
                        key={`${selectedTab}-LagunaVista`}
                        imageSrc="PropertySection/buy/LagunaVista.svg"
                        name="Laguna Vista"
                        price={"2,750,000 – 3,200,000"}
                        isPopular={true}
                        address="Brgy. Calamba, Laguna"
                        bed="4"
                        bath="3"
                        size="10x12 m²"
                        listingType="buy"
                    />
                    <PropertyCard
                        key={`${selectedTab}-GreenfieldEstates`}
                        imageSrc="PropertySection/buy/GreenfieldEstates.svg"
                        name="Greenfield Estates"
                        price={"2,750,000"}
                        isPopular={true}
                        address="Santa Rosa, Laguna"
                        bed="3"
                        bath="2"
                        size="9x10 m²"
                        listingType="buy"
                    />
                    <PropertyCard
                        key={`${selectedTab}-MapleResidences`}
                        imageSrc="PropertySection/buy/MapleResidences.svg"
                        name="Maple Residences"
                        price={"3,750,000 - 4,100,000"}
                        isPopular={false}
                        address="Maple Ave., Pasig City"
                        bed="5"
                        bath="4"
                        size="12x14 m²"
                        listingType="buy"
                    />
                    <div className="w-full flex justify-center mt-10 col-span-3">
                        <Button variant="property">Browse more properties</Button>
                    </div>
                </>
            );
        } else if (selectedTab === 'Sell') {
            return (
                <>
                    <div className="col-span-full flex flex-col md:flex-row gap-[32px] w-full">
                        <SellFeature
                            key={"valuation"}
                            image="/PropertySection/sell/value.svg"
                            title="Know Your Home's Value"
                            description="Get a free, no-obligation property evaluation from local experts."
                        />
                        <SellFeature
                            key={"offer"}
                            image="/PropertySection/sell/offer.svg"
                            title="Get an Instant Offer"
                            description="Skip the hassle and receive a quick, fair offer directly."
                        />
                        <SellFeature
                            key={"list"}
                            image="/PropertySection/sell/list.svg"
                            title="List Your Property"
                            description="Reach thousands of buyers through our high-visibility platform."
                        />
                    </div>
                    
                    <div className="w-full flex justify-center mt-10 col-span-3">
                        <Button variant="primary">Start Selling</Button>
                    </div>
                </>
            );
        }
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
                <p className="opacity-70 text-[16px] font-normal">Some of our picked properties near you location.</p>
            </div>

            {/* Navigation */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-0g gap-5 justify-between w-full">
                <PropertySelector activeTab={selectedTab} onChangeTab={setSelectedTab} />
                <div className="flex items-center bg-[#F9FAFF] border-2 border-[#D2E4FF] rounded-lg px-4 py-[20px] w-[352px]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
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

            {/* Listings */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-[32px] w-full">
                {renderListings()}
            </div>
        </motion.section>
    );
};

export default PropertySection;
