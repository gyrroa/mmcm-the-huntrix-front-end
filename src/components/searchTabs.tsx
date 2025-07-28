'use client'

import { useScroll } from "@/context/ScrollContext";
import Image from "next/image";
import React, { useState } from "react";
const tabs = ["Rent", "Buy", "Sell"];

const SearchTabs: React.FC = () => {
    const [activeTab, setActiveTab] = useState("Rent");
    const { propertySectionRef } = useScroll();

    const scrollToProperty = () => {
        propertySectionRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    return (
        <div className="pt-[354px] absolute w-full max-w-[783px] mx-auto z-10 ">
            {/* Tabs Section */}
            <div className="w-[360px] bg-white rounded-t-[8px] overflow-hidden">
                <div className="flex">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`w-1/3 text-[16px] py-[15px] transition-all duration-150 cursor-pointer ${activeTab === tab
                                ? 'text-[#3871C1] border-b-[3px] border-[#3871C1] font-semibold'
                                : 'text-[#002353] border-b-[3px] border-transparent'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Search Row */}
            <div className="flex items-center justify-between gap-6 bg-white px-6 py-5 rounded-b-[8px] rounded-r-[8px] border-t border-gray-200 shadow-[0_0_60px_#0023530D]">
                {/* Left Fields */}
                <div className="flex items-center gap-6">
                    {/* Common field: Location */}
                    <div className="flex flex-col gap-[4px]">
                        <span className="text-[16px] text-[#001619B2] font-normal leading-[150%]">Location</span>
                        <span className="text-lg font-bold text-[#002353] leading-[145%]">Davao, Philippines</span>
                    </div>
                    {/* Conditional fields */}
                    {activeTab === "Rent" && (
                        <>
                            <div className="h-10 w-px bg-[#D2E4FF]" />
                            <div className="flex flex-col gap-[4px]">
                                <span className="text-[16px] text-[#001619B2] font-normal leading-[150%]">When</span>
                                <span className="text-lg font-bold text-[#002353] leading-[145%] flex gap-[12px]">Select Move-in Date
                                    <Image
                                        src="/heroSection/calendar.svg"
                                        alt="Calendar Icon"
                                        width={12}
                                        height={12}
                                        className="inline-block ml-1"
                                    />
                                </span>
                            </div>
                        </>
                    )}

                    {activeTab === "Buy" && (
                        <>
                            <div className="h-10 w-px bg-[#D2E4FF]" />
                            <div className="flex flex-col gap-[4px]">
                                <span className="text-[16px] text-[#001619B2] font-normal leading-[150%]">Budget</span>
                                <span className="text-lg font-bold text-[#002353] leading-[145%] flex gap-[12px]">₱5M - ₱15M</span>
                            </div>
                        </>
                    )}

                    {activeTab === "Sell" && (
                        <>
                            <div className="h-10 w-px bg-[#D2E4FF]" />
                            <div className="flex flex-col gap-[4px]">
                                <span className="text-[16px] text-[#001619B2] font-normal leading-[150%]">Property</span>
                                <span className="text-lg font-bold text-[#002353] leading-[145%] flex gap-[12px]">List your property</span>
                            </div>
                        </>
                    )}
                </div>
                <div className="h-10 w-px bg-[#D2E4FF]" />
                {/* CTA Button */}
                <button
                    onClick={scrollToProperty}
                    className="bg-[#3871C1] hover:bg-[#2f5ea6] text-white text-sm font-semibold px-6 py-3 rounded-[8px] cursor-pointer">
                    Browse Properties
                </button>
            </div>
        </div>
    );
};

export default SearchTabs;
