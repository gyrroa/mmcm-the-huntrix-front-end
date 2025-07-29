'use client'

import { useScroll } from "@/context/ScrollContext";
import Image from "next/image";
import React, { useState } from "react";

const tabs = ["Rent", "Buy", "Sell"];

const SearchTabs: React.FC = () => {
    const [activeTab, setActiveTab] = useState("Rent");
    const { propertySectionRef } = useScroll();

    const [moveInDate, setMoveInDate] = useState("");
    const [budgetRange, setBudgetRange] = useState("₱5M - ₱15M");
    const [propertyTitle, setPropertyTitle] = useState("");

    const scrollToProperty = () => {
        propertySectionRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <div className="pt-[354px] absolute w-full max-w-[783px] mx-auto z-10">
            {/* Tabs */}
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
                <div className="flex items-center gap-6">
                    {/* Location (static) */}
                    <div className="flex flex-col gap-[4px]">
                        <span className="text-[16px] text-[#001619B2] font-normal leading-[150%]">Location</span>
                        <span className="text-lg font-bold text-[#002353] leading-[145%]">Davao, Philippines</span>
                    </div>

                    <div className="h-10 w-px bg-[#D2E4FF]" />

                    {activeTab === "Rent" && (
                        <div className="flex flex-col gap-[4px]">
                            <span className="text-[16px] text-[#001619B2] font-normal leading-[150%]">When</span>

                            <div className="relative flex items-center w-fit">
                                <input
                                    type="date"
                                    value={moveInDate}
                                    onChange={(e) => setMoveInDate(e.target.value)}
                                    className="bg-transparent outline-none appearance-none text-[#002353] text-[16px] font-bold pr-6
          [&::-webkit-calendar-picker-indicator]:opacity-0"
                                />
                                <Image
                                    src="/heroSection/calendar.svg"
                                    alt="Calendar Icon"
                                    width={16}
                                    height={16}
                                    className="absolute right-[25px] pointer-events-none cursor-pointer"
                                    style={{
                                        filter:
                                            "invert(57%) sepia(11%) saturate(366%) hue-rotate(202deg) brightness(93%) contrast(86%)",
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Buy */}
                    {activeTab === "Buy" && (
                        <div className="flex flex-col gap-[4px]">
                            <span className="text-[16px] text-[#001619B2] font-normal leading-[150%]">Budget</span>
                            <input
                                type="text"
                                value={budgetRange}
                                onChange={(e) => setBudgetRange(e.target.value)}
                                className="bg-transparent outline-none appearance-none text-[#002353] text-lg font-bold leading-[145%] w-[140px]"
                            />
                        </div>
                    )}

                    {/* Sell */}
                    {activeTab === "Sell" && (
                        <div className="flex flex-col gap-[4px]">
                            <span className="text-[16px] text-[#001619B2] font-normal leading-[150%]">Property</span>
                            <input
                                type="text"
                                value={propertyTitle}
                                onChange={(e) => setPropertyTitle(e.target.value)}
                                placeholder="List your property"
                                className="bg-transparent outline-none appearance-none text-[#002353] text-lg font-bold leading-[145%] w-[180px] placeholder:text-[#9AA6B2]"
                            />
                        </div>
                    )}
                </div>

                <div className="h-10 w-px bg-[#D2E4FF]" />

                {/* CTA */}
                <button
                    onClick={scrollToProperty}
                    className="bg-[#3871C1] hover:bg-[#2f5ea6] text-white text-sm font-semibold px-6 py-3 rounded-[8px] cursor-pointer"
                >
                    Browse Properties
                </button>
            </div>
        </div>
    );
};

export default SearchTabs;
