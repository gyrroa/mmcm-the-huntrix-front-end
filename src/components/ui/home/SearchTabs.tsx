'use client';

import { useScroll } from "@/context/ScrollContext";
import Image from "next/image";
import React, { useState } from "react";

const tabs = ["RENT", "BUY", "SELL"] as const;
type Tab = typeof tabs[number];

const SearchTabs: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>("RENT");
    const { propertySectionRef } = useScroll();

    const scrollToProperty = () => {
        propertySectionRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const tabShape: Record<string, string> = {
        RENT: "rounded-b-[20px] rounded-r-[20px] lg:rounded-r-[30px] lg:rounded-b-[30px] lg:rounded-l-none",
        SELL: "rounded-b-[20px] rounded-l-[20px] lg:rounded-r-[30px] lg:rounded-b-[30px] lg:rounded-l-[30px]",
        BUY: "rounded-[20px] lg:rounded-[30px]",
    };

    return (
        <div className="w-full max-w-[1170px] z-10">
            {/* Tabs */}
            <div className="lg:w-[360px] overflow-hidden">
                <div className="flex">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`w-1/2 text-[18px] rounded-t-[15px] font-normal py-[15px] transition-all duration-150 cursor-pointer tracking-[2.8px] ${activeTab === tab
                                ? 'text-[#3871C1] bg-white/80 backdrop-blur-[10px] '
                                : 'text-[#002353]'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Search Row */}
            <div
                className={`mt-0 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 lg:gap-8 transition-all duration-150 
        bg-white/80 backdrop-blur-[10px] px-4 sm:px-6 lg:px-[34px] py-4 sm:py-6
        shadow-[0_30px_60px_-15px_rgba(143,144,188,0.15),0_0_60px_#0023530D]
                    ${tabShape[activeTab]}
        `}
            >
                <div className="flex flex-col lg:flex-row lg:items-center gap-4 sm:gap-6 lg:gap-11 w-full">
                    {/* Location */}
                    <div className="flex-1 min-w-0">
                        <span className="block text-[16px] sm:text-[22px] font-medium text-[#002353] leading-[150%]">Location</span>
                        <button
                            type="button"
                            className="mt-1 w-full flex items-center justify-between text-left text-[15px] sm:text-[18px] font-normal text-[#00235380] leading-[145%]"
                        >
                            <span className="truncate">Select Your City</span>
                            <Image alt="location" src="/heroSection/location.svg" width={14} height={10} />
                        </button>
                    </div>

                    <div className="hidden lg:block h-14 w-[2px] bg-[#D2E4FF]" />

                    {/* Property Type */}
                    <div className="flex-1 min-w-0">
                        <span className="block text-[16px] sm:text-[22px] font-medium text-[#002353] leading-[150%]">Property Type</span>
                        <button
                            type="button"
                            className="mt-1 w-full flex items-center justify-between text-left text-[15px] sm:text-[18px] font-normal text-[#00235380] leading-[145%]"
                        >
                            <span className="truncate">Choose Property Type</span>
                            <Image alt="drop-down" src="/heroSection/drop.svg" width={14} height={10} />
                        </button>
                    </div>

                    <div className="hidden lg:block h-14 w-[2px] bg-[#D2E4FF]" />

                    {/* Price Range */}
                    <div className="flex-1 min-w-0">
                        <span className="block text-[16px] sm:text-[22px] font-medium text-[#002353] leading-[150%]">Price Range</span>
                        <button
                            type="button"
                            className="mt-1 w-full flex items-center justify-between text-left text-[15px] sm:text-[18px] font-normal text-[#00235380] leading-[145%]"
                        >
                            <span className="truncate">Choose Price Range</span>
                            <Image alt="drop-down" src="/heroSection/drop.svg" width={14} height={10} />
                        </button>
                    </div>
                </div>

                {/* CTA */}
                <button
                    onClick={scrollToProperty}
                    className="w-full lg:w-auto gap-[20px] bg-[#3871C1] hover:bg-[#2f5ea6] text-white text-sm font-semibold p-3 sm:p-4 rounded-[12px] lg:rounded-[15px] cursor-pointer flex items-center justify-center"
                    aria-label="Search"
                >
                    <Image alt="search" src="/heroSection/search.svg" width={25} height={25} className="w-[16px] h-[16px] lg:w-[25px] lg:h-[25px]"/>
                    <p className="block lg:hidden text-[16px]">SEARCH</p>
                </button>
            </div>
        </div>
    );
};

export default SearchTabs;
