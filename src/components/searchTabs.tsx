'use client'

import React, { useState } from "react";
const tabs = ["Rent", "Buy", "Sell"];

const SearchTabs: React.FC = () => {
    const [activeTab, setActiveTab] = useState("Rent");

    return (
        <div className="pt-[354px] absolute w-full max-w-[783px] mx-auto z-10">
            {/* Tabs Section */}
            <div className="w-[360px] bg-white rounded-t-[8px] overflow-hidden">
                <div className="flex">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`w-1/3 text-[16px] py-[15px] transition-all duration-150 ${activeTab === tab
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
            <div className="flex items-center justify-between gap-6 bg-white px-6 py-5 rounded-b-[8px] rounded-r-[8px] shadow border-t border-gray-200">
                {/* Left Fields */}
                <div className="flex items-center gap-6">
                    {/* Common field: Location */}
                    <div className="flex flex-col">
                        <span className="text-sm text-gray-500 font-medium">Location</span>
                        <span className="text-lg font-semibold text-[#002353]">Davao, Philippines</span>
                    </div>

                    {/* Conditional fields */}
                    {activeTab === "Rent" && (
                        <>
                            <div className="h-8 w-px bg-gray-200" />
                            <div className="flex flex-col">
                                <span className="text-sm text-gray-500 font-medium">When</span>
                                <span className="text-lg font-semibold text-[#002353] flex items-center gap-2">
                                    Select Move–in Date
                                </span>
                            </div>
                        </>
                    )}

                    {activeTab === "Buy" && (
                        <>
                            <div className="h-8 w-px bg-gray-200" />
                            <div className="flex flex-col">
                                <span className="text-sm text-gray-500 font-medium">Budget</span>
                                <span className="text-lg font-semibold text-[#002353]">₱5M - ₱15M</span>
                            </div>
                        </>
                    )}

                    {activeTab === "Sell" && (
                        <>
                            <div className="h-8 w-px bg-gray-200" />
                            <div className="flex flex-col">
                                <span className="text-sm text-gray-500 font-medium">Property</span>
                                <span className="text-lg font-semibold text-[#002353]">List your property</span>
                            </div>
                        </>
                    )}
                </div>

                {/* CTA Button */}
                <button className="bg-[#3871C1] hover:bg-[#2f5ea6] text-white text-sm font-semibold px-6 py-3 rounded-[8px]">
                    Browse Properties
                </button>
            </div>
        </div>
    );
};

export default SearchTabs;
