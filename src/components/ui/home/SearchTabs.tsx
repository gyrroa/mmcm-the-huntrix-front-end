'use client';

import { useScroll } from "@/context/ScrollContext";
import Image from "next/image";
import React, { useEffect, useMemo, useRef, useState } from "react";

export const TABS = ['RENT', 'BUY', 'SELL'] as const;
export type Tab = (typeof TABS)[number];

type Option = { label: string; value: string };

const PROPERTY_TYPES: Option[] = [
    { label: "Any type", value: "" },
    { label: "Condominium", value: "condo" },
    { label: "House & Lot", value: "house" },
    { label: "Townhouse", value: "townhouse" },
    { label: "Apartment", value: "apartment" },
    { label: "Lot Only", value: "lot" },
    { label: "Commercial", value: "commercial" },
    { label: "Office", value: "office" },
];

const PRICE_RANGES_RENT: Option[] = [
    { label: "Any", value: "" },
    { label: "₱5k – ₱10k / mo", value: "5000-10000" },
    { label: "₱10k – ₱20k / mo", value: "10000-20000" },
    { label: "₱20k – ₱40k / mo", value: "20000-40000" },
    { label: "₱40k – ₱80k / mo", value: "40000-80000" },
    { label: "₱80k+ / mo", value: "80000-" },
];

const PRICE_RANGES_SALE: Option[] = [
    { label: "Any", value: "" },
    { label: "₱1M – ₱3M", value: "1000000-3000000" },
    { label: "₱3M – ₱5M", value: "3000000-5000000" },
    { label: "₱5M – ₱10M", value: "5000000-10000000" },
    { label: "₱10M – ₱20M", value: "10000000-20000000" },
    { label: "₱20M+", value: "20000000-" },
];

const SearchTabs: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>("RENT");
    const { propertySectionRef } = useScroll();

    // state that powers the existing labels (no visual style changes)
    const [locationText, setLocationText] = useState<string>("");
    const [coords, setCoords] = useState<{ lat: number | null; lng: number | null }>({ lat: null, lng: null });
    const [typeVal, setTypeVal] = useState<string>("");
    const [priceVal, setPriceVal] = useState<string>("");

    // popovers (overlay lists) & map modal visibility
    const [openType, setOpenType] = useState(false);
    const [openPrice, setOpenPrice] = useState(false);
    const [isMapOpen, setIsMapOpen] = useState(false);

    const priceOptions = useMemo(
        () => (activeTab === "RENT" ? PRICE_RANGES_RENT : PRICE_RANGES_SALE),
        [activeTab]
    );

    // close popovers on outside click
    const typeWrapRef = useRef<HTMLDivElement | null>(null);
    const priceWrapRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        const onDown = (e: MouseEvent) => {
            if (openType && typeWrapRef.current && !typeWrapRef.current.contains(e.target as Node)) setOpenType(false);
            if (openPrice && priceWrapRef.current && !priceWrapRef.current.contains(e.target as Node)) setOpenPrice(false);
        };
        document.addEventListener("mousedown", onDown);
        return () => document.removeEventListener("mousedown", onDown);
    }, [openType, openPrice]);

    const scrollToProperty = () => {
        // keep your existing behavior
        propertySectionRef.current?.scrollIntoView({ behavior: "smooth" });
        // pass values to router/store here if needed
        console.log({
            mode: activeTab,
            location: locationText,
            lat: coords.lat,
            lng: coords.lng,
            propertyType: typeVal,
            priceRange: priceVal,
        });
    };

    const tabShape: Record<string, string> = {
        RENT: "rounded-b-[20px] rounded-r-[20px] lg:rounded-r-[30px] lg:rounded-b-[30px] lg:rounded-l-none",
        SELL: "rounded-b-[20px] rounded-l-[20px] lg:rounded-r-[30px] lg:rounded-b-[30px] lg:rounded-l-[30px]",
        BUY: "rounded-[20px] lg:rounded-[30px]",
    };

    // reset price when switching rent/sale so labels stay correct (no UI change)
    useEffect(() => {
        setPriceVal("");
    }, [activeTab]);

    return (
        <div className="w-full max-w-[1170px] z-10">
            {/* Tabs (unchanged) */}
            <div className="lg:w-[360px] overflow-hidden">
                <div className="flex">
                    {(["RENT", "BUY", "SELL"] as const).map((tab) => (
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

            {/* Search Row (layout & classes preserved) */}
            <div
                className={`mt-0 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 lg:gap-8 transition-all duration-150 
        bg-white/80 backdrop-blur-[10px] px-4 sm:px-6 lg:px-[34px] py-4 sm:py-6
        shadow-[0_30px_60px_-15px_rgba(143,144,188,0.15),0_0_60px_#0023530D]
                    ${tabShape[activeTab]}
        `}
            >
                <div className="flex flex-col lg:flex-row lg:items-center gap-4 sm:gap-6 lg:gap-11 w-full lg:flex-1 min-w-0">
                    {/* Location (same button; just opens modal) */}
                    <div className="flex-1 min-w-0">
                        <span className="block text-[16px] sm:text-[22px] font-medium text-[#002353] leading-[150%]">Location</span>
                        <button
                            type="button"
                            onClick={() => setIsMapOpen(true)}
                            className="mt-1 w-full flex items-center justify-between text-left text-[15px] sm:text-[18px] font-normal text-[#00235380] leading-[145%] cursor-pointer"
                        >
                            <span className="truncate">{locationText || 'Select Your City'}</span>
                            <Image alt="location" src="/heroSection/location.svg" width={14} height={10} />
                        </button>
                    </div>

                    <div className="hidden lg:block h-14 w-[2px] bg-[#D2E4FF]" />

                    {/* Property Type (same button with popover) */}
                    <div className="flex-1 min-w-0">
                        <span className="block text-[16px] sm:text-[22px] font-medium text-[#002353] leading-[150%]">Property Type</span>
                        <div ref={typeWrapRef} className="relative">
                            <button
                                type="button"
                                onClick={() => setOpenType((s) => !s)}
                                className="mt-1 w-full flex items-center justify-between text-left text-[15px] sm:text-[18px] font-normal text-[#00235380] leading-[145%] cursor-pointer "
                            >
                                <span className="truncate">{(PROPERTY_TYPES.find(o => o.value === typeVal)?.label) || 'Choose Property Type'}</span>
                                <Image alt="drop-down" src="/heroSection/drop.svg" width={14} height={10} />
                            </button>

                            {openType && (
                                <ul
                                    role="listbox"
                                    className="absolute z-50 mt-2 w-full max-h-64 overflow-auto rounded-[12px] border border-[#D2E4FF] bg-white shadow-lg"
                                >
                                    {PROPERTY_TYPES.map((opt) => (
                                        <li
                                            key={opt.value || 'any'}
                                            role="option"
                                            aria-selected={typeVal === opt.value}
                                            className={`px-3 py-2 cursor-pointer text-[15px] ${typeVal === opt.value ? 'text-[#3871C1] font-semibold bg-[#F6FAFF]' : 'text-[#0B2B57] hover:bg-[#EDF3FF]'}`}
                                            onClick={() => {
                                                setTypeVal(opt.value);
                                                setOpenType(false);
                                            }}
                                        >
                                            {opt.label}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    <div className="hidden lg:block h-14 w-[2px] bg-[#D2E4FF]" />

                    {/* Price Range (same button with popover) */}
                    <div className="flex-1 min-w-0">
                        <span className="block text-[16px] sm:text-[22px] font-medium text-[#002353] leading-[150%]">Price Range</span>
                        <div ref={priceWrapRef} className="relative">
                            <button
                                type="button"
                                onClick={() => setOpenPrice((s) => !s)}
                                className="mt-1 w-full flex items-center justify-between text-left text-[15px] sm:text-[18px] font-normal text-[#00235380] leading-[145%] cursor-pointer"
                            >
                                <span className="truncate">{(priceOptions.find(o => o.value === priceVal)?.label) || 'Choose Price Range'}</span>
                                <Image alt="drop-down" src="/heroSection/drop.svg" width={14} height={10} />
                            </button>

                            {openPrice && (
                                <ul
                                    role="listbox"
                                    className="absolute z-50 mt-2 w-full max-h-64 overflow-auto rounded-[12px] border border-[#D2E4FF] bg-white shadow-lg"
                                >
                                    {priceOptions.map((opt) => (
                                        <li
                                            key={opt.value || 'any'}
                                            role="option"
                                            aria-selected={priceVal === opt.value}
                                            className={`px-3 py-2 cursor-pointer text-[15px] ${priceVal === opt.value ? 'text-[#3871C1] font-semibold bg-[#F6FAFF]' : 'text-[#0B2B57] hover:bg-[#EDF3FF]'}`}
                                            onClick={() => {
                                                setPriceVal(opt.value);
                                                setOpenPrice(false);
                                            }}
                                        >
                                            {opt.label}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>

                {/* CTA (unchanged) */}
                <button
                    onClick={scrollToProperty}
                    className="w-full lg:w-auto shrink-0 min-w-[56px] gap-[20px] bg-[#3871C1] hover:bg-[#2f5ea6] text-white text-sm font-semibold p-3 sm:p-4 rounded-[12px] lg:rounded-[15px] cursor-pointer flex items-center justify-center"
                    aria-label="Search"
                >
                    <Image alt="search" src="/heroSection/search.svg" width={25} height={25} className="w-[16px] h-[16px] lg:w-[25px] lg:h-[25px]" />
                    <p className="block lg:hidden text-[16px]">SEARCH</p>
                </button>
            </div>

            {/* Leaflet CSS */}
            <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />

            {/* Map Picker Modal */}
            {isMapOpen && (
                <LeafletMapPickerModal
                    open={isMapOpen}
                    onClose={() => setIsMapOpen(false)}
                    initialPosition={coords.lat && coords.lng ? { lat: coords.lat, lng: coords.lng } : undefined}
                    onSelect={({ address, lat, lng }) => {
                        setLocationText(address);
                        setCoords({ lat, lng });
                        setIsMapOpen(false);
                    }}
                />
            )}
        </div>
    );
};

export default SearchTabs;

/* ---------------- Leaflet modal (no extra UI in the row) ---------------- */

type LatLng = { lat: number; lng: number };
type LeafletNS = typeof import('leaflet');

const LeafletMapPickerModal: React.FC<{
    open: boolean;
    onClose: () => void;
    onSelect: (p: { address: string; lat: number; lng: number }) => void;
    initialPosition?: LatLng;
}> = ({ open, onClose, onSelect, initialPosition }) => {
    const mapEl = React.useRef<HTMLDivElement | null>(null);
    const mapRef = React.useRef<import('leaflet').Map | null>(null);
    const markerRef = React.useRef<import('leaflet').Marker | null>(null);
    const [Lmod, setLmod] = React.useState<LeafletNS | null>(null);
    const [pos, setPos] = React.useState<LatLng>(
        initialPosition || { lat: 14.5995, lng: 120.9842 } // Manila default
    );
    const [busy, setBusy] = React.useState(false);

    React.useEffect(() => {
        let alive = true;
        (async () => {
            const L = await import('leaflet');
            if (!alive) return;
            // @ts-expect-error private in types
            delete L.Icon.Default.prototype._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
                iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
            });
            setLmod(L);
        })();
        return () => { alive = false; };
    }, []);

    React.useEffect(() => {
        if (!open || !mapEl.current || !Lmod) return;
        const L = Lmod;
        const map = L.map(mapEl.current, {
            center: [pos.lat, pos.lng],
            zoom: 15,
            zoomControl: true,
            attributionControl: true,
        });
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);
        const marker = L.marker([pos.lat, pos.lng], { draggable: true }).addTo(map);
        map.on('click', (e: import('leaflet').LeafletMouseEvent) => {
            marker.setLatLng(e.latlng); setPos({ lat: e.latlng.lat, lng: e.latlng.lng });
        });
        marker.on('dragend', () => {
            const ll = marker.getLatLng(); setPos({ lat: ll.lat, lng: ll.lng });
        });
        mapRef.current = map; markerRef.current = marker;
        return () => { map.remove(); };
    }, [open, Lmod, pos.lat, pos.lng]);

    const confirm = async () => {
        setBusy(true);
        try {
            const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&lat=${pos.lat}&lon=${pos.lng}`;
            const res = await fetch(url, { headers: { Accept: 'application/json' } });
            const data: { display_name?: string } = await res.json();
            const address = data?.display_name || `${pos.lat.toFixed(6)}, ${pos.lng.toFixed(6)}`;
            onSelect({ address, lat: pos.lat, lng: pos.lng });
        } finally {
            setBusy(false);
        }
    };

    if (!open) return null;

    return (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-[1000] p-4 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="relative z-10 w-full max-w-3xl bg-white rounded-2xl border border-[#E3ECF9] shadow-xl overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-[#E3ECF9]">
                    <div className="text-lg font-semibold text-[#002353]">Select location</div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-3 py-1.5 rounded-lg border border-[#BFD3FF] bg-white text-[#0B2B57] text-sm font-semibold hover:bg-[#F5FAFF]"
                    >
                        Close
                    </button>
                </div>
                <div className="h-[60vh]"><div ref={mapEl} className="w-full h-full" /></div>
                <div className="p-4 flex items-center justify-end">
                    <button
                        type="button"
                        onClick={confirm}
                        disabled={busy}
                        className="px-4 py-2 rounded-lg bg-[#3871C1] text-white text-sm font-semibold disabled:opacity-60"
                    >
                        {busy ? 'Getting address…' : 'Use this location'}
                    </button>
                </div>
            </div>
        </div>
    );
};
