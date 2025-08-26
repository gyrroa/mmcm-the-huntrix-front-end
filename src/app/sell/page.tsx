'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    FaBed,
    FaBath,
    FaRulerCombined,
    FaHome,
    FaMapMarkerAlt,
    FaImages,
    FaCheckCircle,
    FaTimesCircle,
    FaMoneyBillWave,
    FaClipboardCheck,
    FaTags,
    FaCalendarAlt,
    FaListUl,
    FaVideo,
    FaInfoCircle,
} from 'react-icons/fa';
import Image from 'next/image';
import { useCreateRent } from '@/features/rent/hooks';
import { useMe } from '@/features/auth/hooks';
import { useRouter } from 'next/navigation';
import { useCreateBuy } from '@/features/buy/hooks';

const SectionTitle: React.FC<{ icon?: React.ReactNode; title: React.ReactNode }> = ({ icon, title }) => (
    <div className="flex items-center gap-2 text-lg font-semibold text-[#002353]">
        {icon && <span className="text-[#8091A8] text-[18px]">{icon}</span>}
        <span>{title}</span>
    </div>
);

const Card: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="bg-white/90 backdrop-blur border border-[#E3ECF9] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
        {children}
    </div>
);

// ---------- Types ----------
type ChecklistKeys =
    | 'titleDeed'
    | 'deedOfSale'
    | 'taxDec'
    | 'taxReceipts'
    | 'encumbranceCert'
    | 'birCar'
    | 'transferTaxClearance';

type BasePayload = {
    name: string;
    price: number;
    address: string;
    bed: number;
    bath: number;
    size: number;
    description: string | null;
    latitude: number | null;
    longitude: number | null;
    amenities: string[];
    tags: string[];
    images: File[];
    videos: File[];
};

type RentPayload = BasePayload & { lease_term: number };
type BuyPayload = BasePayload & { document_list: string[] };

// Hoisted so it's stable and not part of Hook deps
const checklistMeta: { id: ChecklistKeys; label: string; description: string }[] = [
    { id: 'titleDeed', label: 'Title Deed / Certificate of Title (TCT or CCT)', description: 'Proves legal ownership of the property.' },
    { id: 'deedOfSale', label: 'Deed of Absolute Sale (DOAS)', description: 'Indicates the transfer agreement between seller and buyer.' },
    { id: 'taxDec', label: 'Tax Declaration', description: 'Shows the assessed property value for tax purposes.' },
    { id: 'taxReceipts', label: 'Latest Property Tax Receipts', description: 'Verifies payment of real property taxes.' },
    { id: 'encumbranceCert', label: 'Encumbrance Certificate', description: 'Confirms the property has no existing liens or mortgages.' },
    { id: 'birCar', label: 'BIR Certificate Authorizing Registration (CAR)', description: 'Issued by BIR to allow transfer of property title.' },
    { id: 'transferTaxClearance', label: 'Transfer Tax Clearance from LGU', description: 'Certifies payment of transfer tax to the local government.' },
];

// ---------- Component ----------
const SellPage: React.FC = () => {
    const { data: me } = useMe(); // redirects to /auth?login on 401/403
    const isLoggedIn = !!me?.first_name
    const router = useRouter();

    const onSignIn = () => {
        router.push("/auth?login");
    }
    const onCreateAccount = () => {
        router.push("/auth?register");
    }
    const [checklist, setChecklist] = useState<Record<ChecklistKeys, boolean>>({
        titleDeed: false,
        deedOfSale: false,
        taxDec: false,
        taxReceipts: false,
        encumbranceCert: false,
        birCar: false,
        transferTaxClearance: false,
    });

    const [isDragging, setIsDragging] = useState(false);
    const [descCount, setDescCount] = useState(0);
    const DESC_LIMIT = 800;

    const [formData, setFormData] = useState({
        type: 'rent' as 'rent' | 'buy',
        title: '',
        address: '',
        price: '',
        frequency: 'monthly',
        size: '',
        bed: '',
        bath: '',
        description: '',
        amenities: [] as string[],
        images: [] as File[],
        tags: [] as string[],
        lat: null as number | null,
        lng: null as number | null,
        leaseTermMonths: '12',
        videos: [] as File[],
    });

    // accept & handle videos
    const acceptVideo = (f: File) =>
        ['video/mp4', 'video/webm', 'video/quicktime'].includes(f.type) && f.size <= 100 * 1024 * 1024; // ≤100MB

    const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const picked = Array.from(e.target.files || []).filter(acceptVideo);
        const next = [...formData.videos, ...picked].slice(0, 5); // cap to 5 videos (tweak as you like)
        setFormData((prev) => ({ ...prev, videos: next }));
    };

    // optional simple video previews
    const [videoPreviews, setVideoPreviews] = useState<string[]>([]);
    useEffect(() => {
        const urls = formData.videos.map((f) => URL.createObjectURL(f));
        setVideoPreviews(urls);
        return () => urls.forEach((u) => URL.revokeObjectURL(u));
    }, [formData.videos]);

    /* ---------- Property scoring (BUY & RENT) based on your spec ---------- */
    const isBuy = formData.type === 'buy';

    // spec constants
    const PHOTOS_TARGET = 5;
    const MIN_DESC = 200;

    // helpers
    const has = (v: unknown) => (typeof v === 'number' ? Number.isFinite(v) : !!String(v ?? '').trim());
    const textLen = (s: unknown) => String(s ?? '').trim().length;

    // Property Info points (BUY vs RENT)
    let propertyPts = 0;
    let propertyMax = 0;

    if (isBuy) {
        // BUY (Property Information – 30 pts)
        const W = { title: 2, address: 4, price: 4, saleType: 2, size: 6, bed: 4, bath: 3, desc: 5 };
        propertyMax = Object.values(W).reduce((a, b) => a + b, 0);

        // NOTE: sale type not in your form; keep 0 for now (add a dropdown later to grant W.saleType)
        const saleTypePresent = false;

        propertyPts += has(formData.title) ? W.title : 0;
        propertyPts += has(formData.address) ? W.address : 0;
        propertyPts += has(formData.price) ? W.price : 0;
        propertyPts += saleTypePresent ? W.saleType : 0;
        propertyPts += has(formData.size) ? W.size : 0;
        propertyPts += has(formData.bed) ? W.bed : 0;
        propertyPts += has(formData.bath) ? W.bath : 0;
        propertyPts += textLen(formData.description) >= MIN_DESC ? W.desc : textLen(formData.description) > 0 ? 3 : 0;
    } else {
        // RENT (Property Information – 35 pts)
        const W = { title: 2, address: 4, price: 5, lease: 3, size: 6, bed: 5, bath: 3, desc: 7 };
        propertyMax = Object.values(W).reduce((a, b) => a + b, 0);

        propertyPts += has(formData.title) ? W.title : 0;
        propertyPts += has(formData.address) ? W.address : 0;
        propertyPts += has(formData.price) ? W.price : 0;
        propertyPts += has(formData.leaseTermMonths) ? W.lease : 0;
        propertyPts += has(formData.size) ? W.size : 0;
        propertyPts += has(formData.bed) ? W.bed : 0;
        propertyPts += has(formData.bath) ? W.bath : 0;
        propertyPts += textLen(formData.description) >= MIN_DESC ? W.desc : textLen(formData.description) > 0 ? 4 : 0;
    }

    // Amenities & Tags (10 pts total)
    const amenitiesCount = formData.amenities.length;
    const tagsCount = formData.tags.length;
    const amenitiesPts = amenitiesCount >= 5 ? 6 : amenitiesCount > 0 ? 3 : 0;
    const tagsPts = tagsCount >= 5 ? 4 : tagsCount > 0 ? 2 : 0;
    const atPts = amenitiesPts + tagsPts;
    const atMax = 10;

    // Media Quality (30 pts): Photos 10, Video 20
    const photosFull = formData.images.length >= PHOTOS_TARGET;
    const photosPts = photosFull ? 10 : formData.images.length > 0 ? 5 : 0;

    // per spec
    const photosMax = 10;
    const videosMax = 20;
    const docsMax = isBuy ? 30 : 0;

    // Video: grant partial (10) if any video present; to grant full (20), measure duration ≥ 30s.
    const hasAnyVideo = formData.videos.length > 0;
    const videosPts = hasAnyVideo ? 10 : 0; // TODO: upgrade to 20 if ≥30s
    const mediaPts = photosPts + videosPts;
    const mediaMax = 30;

    // Extra section: BUY = Essential Documents (30 pts) / RENT = Reviews & Ratings (25 pts)
    let extraLabel = '';
    let extraPts = 0;
    let extraMax = 0;

    if (isBuy) {
        extraLabel = 'Essential Documents';
        extraMax = 30;
        // Map your checklist booleans to spec weights
        const docW = { titleDeed: 4.3, deedOfSale: 4.3, taxDec: 4.3, taxReceipts: 4.3, encumbranceCert: 4.3, birCar: 4.3, lgu: 4.2 };
        extraPts += checklist.titleDeed ? docW.titleDeed : 0;
        extraPts += checklist.deedOfSale ? docW.deedOfSale : 0;
        extraPts += checklist.taxDec ? docW.taxDec : 0;
        extraPts += checklist.taxReceipts ? docW.taxReceipts : 0;
        extraPts += checklist.encumbranceCert ? docW.encumbranceCert : 0;
        extraPts += checklist.birCar ? docW.birCar : 0;
        extraPts += checklist.transferTaxClearance ? docW.lgu : 0;
    } else {
        extraLabel = 'Reviews & Ratings';
        extraMax = 25;
        // On create form, reviews data is not available; keep 0 (scored after publish)
        extraPts = 0;
    }

    // Totals to 100 per spec
    const total = propertyPts + atPts + mediaPts + extraPts;
    const qualityScore = Math.round(total);
    const pct = Math.min(100, Math.max(0, qualityScore));

    // Expose for UI
    const sections = {
        property: { pts: propertyPts, max: propertyMax },
        at: { pts: atPts, max: atMax },
        media: { pts: mediaPts, max: mediaMax, details: { photosPts, videosPts, PHOTOS_TARGET } },
        extra: { label: extraLabel, pts: extraPts, max: extraMax },
    };
    const docsPts = isBuy ? (sections ? sections.extra.pts : extraPts) : 0;
    const [isMapOpen, setIsMapOpen] = useState(false);
    const [scoreInfoOpen, setScoreInfoOpen] = useState(false);

    // Safe local previews (avoid memory leaks)
    const [previews, setPreviews] = useState<string[]>([]);
    useEffect(() => {
        const urls = formData.images.map((f) => URL.createObjectURL(f));
        setPreviews(urls);
        return () => urls.forEach((u) => URL.revokeObjectURL(u));
    }, [formData.images]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (name === 'description') setDescCount(value.length);
    };

    const formatPeso = (raw: string) => {
        const digits = raw.replace(/[^\d]/g, '');
        if (!digits) return '';
        return new Intl.NumberFormat('en-PH').format(Number(digits));
    };

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatPeso(e.target.value);
        setFormData((prev) => ({ ...prev, price: formatted }));
    };

    const acceptImage = (f: File) =>
        ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(f.type) && f.size <= 10 * 1024 * 1024;

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const picked = Array.from(e.target.files || []).filter(acceptImage);
        const next = [...formData.images, ...picked].slice(0, 25);
        setFormData((prev) => ({ ...prev, images: next }));
    };

    const onDropFiles = useCallback(
        (files: FileList | null) => {
            if (!files) return;
            const picked = Array.from(files).filter(acceptImage);
            const next = [...formData.images, ...picked].slice(0, 25);
            setFormData((prev) => ({ ...prev, images: next }));
        },
        [formData.images]
    );

    const checklistProgress = useMemo(() => {
        const total = checklistMeta.length;
        const done = checklistMeta.filter((c) => checklist[c.id]).length;
        return { done, total, pct: Math.round((done / total) * 100) || 0 };
    }, [checklist]);

    const isValid = useMemo(() => {
        const stringMust = ['title', 'address', 'price', 'size'] as const;
        const stringsOk = stringMust.every(k => String(formData[k]).trim().length > 0);
        return stringsOk;
    }, [formData]);


    // limits for amenities
    const MAX_AMENITIES = 25;
    const MAX_AMENITY_LEN = 40;

    const normalizeAmenity = (s: string) => {
        const t = s.trim().replace(/\s+/g, ' ');
        if (!t) return '';
        return t.slice(0, MAX_AMENITY_LEN);
    };

    const [amenityInput, setAmenityInput] = useState('');

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmBusy, setConfirmBusy] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isValid) return;
        setConfirmOpen(true); // open confirmation first
    };

    // Builds payload once user confirms
    // Builds payload (typed)
    const toBasePayload = (): BasePayload => {
        const priceNumeric = Number(formData.price.replace(/[^\d]/g, "")) || 0;
        const sizeNumeric = Number(String(formData.size).replace(/[^\d.]/g, "")) || 0;
        const bedNum = Number(formData.bed) || 0;
        const bathNum = Number(formData.bath) || 0;

        return {
            name: formData.title.trim(),
            price: priceNumeric,
            address: formData.address.trim(),
            bed: bedNum,
            bath: bathNum,
            size: sizeNumeric,
            description: formData.description?.trim() || null,
            latitude: formData.lat ?? null,
            longitude: formData.lng ?? null,
            amenities: formData.amenities,
            tags: formData.tags,
            images: formData.images,
            videos: formData.videos,
        };
    };

    const buildRentPayload = (): RentPayload => ({
        ...toBasePayload(),
        lease_term: Math.max(1, Number(formData.leaseTermMonths) || 0),
    });

    const buildBuyPayload = (): BuyPayload => {
        const document_list = checklistMeta
            .filter(c => checklist[c.id])
            .map(c => c.label);

        return { ...toBasePayload(), document_list };
    };

    const clearForm = () => {
        setFormData({
            type: 'rent',
            title: '',
            address: '',
            price: '',
            frequency: 'monthly',
            size: '',
            bed: '',
            bath: '',
            description: '',
            amenities: [],
            images: [],
            tags: [],
            lat: null,
            lng: null,
            leaseTermMonths: '12',
            videos: [],
        });

        setChecklist({
            titleDeed: false,
            deedOfSale: false,
            taxDec: false,
            taxReceipts: false,
            encumbranceCert: false,
            birCar: false,
            transferTaxClearance: false,
        });

        setTagInput('');
        setDescCount(0);
    };

    const { mutateAsync: createRent } = useCreateRent();
    const { mutateAsync: createBuy } = useCreateBuy();

    const [successOpen, setSuccessOpen] = useState(false);

    const submitConfirmed = async () => {
        setConfirmBusy(true);
        try {
            if (formData.type === 'buy') {
                const payload = buildBuyPayload();
                await createBuy(payload);
            } else {
                const payload = buildRentPayload();
                await createRent(payload);
            }
            setConfirmOpen(false);
            clearForm();
            setSuccessOpen(true);
        } catch (err) {
            console.error('Submit failed', err);
            alert(normalizeErr(err));
        } finally {
            setConfirmBusy(false);
        }
    };

    function normalizeErr(e: unknown): string {
        if (typeof e === 'string') return e;
        if (e instanceof Error) return e.message;

        if (typeof e === 'object' && e !== null) {
            const obj = e as Record<string, unknown>;
            const data = (typeof obj.data === 'object' && obj.data !== null)
                ? (obj.data as Record<string, unknown>)
                : undefined;

            if (data && 'detail' in data) {
                const d = data.detail;
                if (typeof d === 'string') return d;
                try { return JSON.stringify(d); } catch { }
            }

            if (typeof obj.message === 'string') return obj.message;
            try { return JSON.stringify(obj); } catch { }
        }

        return 'Unknown error';
    }


    const toggleAllChecklist = (checked: boolean) => {
        const next: Record<ChecklistKeys, boolean> = { ...checklist };
        (Object.keys(next) as ChecklistKeys[]).forEach((k) => {
            next[k] = checked;
        });
        setChecklist(next);
    };

    /* ---------- Tags local state + helpers (NEW) ---------- */
    const [tagInput, setTagInput] = useState('');
    const MAX_TAGS = 25;
    const MAX_TAG_LEN = 40;
    const normalizeTag = (t: string) =>
        t
            .trim()
            .replace(/^\((.*)\)$/, '$1') // strip outer parentheses
            .replace(/\s+/g, ' ')
            .slice(0, MAX_TAG_LEN);

    return (
        <section className="relative min-h-screen pt-[30px] pb-24 px-6 text-[#002353] bg-gradient-to-b from-white to-[#D2E4FF]">
            {/* subtle backdrop pattern */}
            <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background:radial-gradient(circle_at_1px_1px,#0a3a821a_1px,transparent_0)] bg-[size:24px_24px]" />

            <div className="relative max-w-6xl mx-auto flex flex-col gap-8">
                {/* Header */}
                <div className="text-center flex flex-col gap-2 animate-fadeIn">
                    <h1 className="text-[40px] font-bold leading-[1.2] tracking-tight">Sell Your Property</h1>
                    <p className="text-[#5C7188] text-[16px] max-w-md mx-auto">
                        Create a stunning listing and get noticed by serious buyers.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col xl:flex-row gap-6 animate-fadeIn">
                    {/* Left column */}
                    <div className="flex-1 flex flex-col gap-6">
                        {/* Listing Type (SEGMENTED) */}
                        <div className="w-full">
                            <div className="bg-white border border-[#E3ECF9] rounded-2xl px-3 py-2 shadow-sm hover:shadow-md transition-shadow duration-200 w-fit mx-auto">
                                <div className="inline-flex items-center gap-1 rounded-[14px]">
                                    {/* For Rent */}
                                    <button
                                        type="button"
                                        aria-pressed={formData.type === 'rent'}
                                        onClick={() => setFormData((prev) => ({ ...prev, type: 'rent' }))}
                                        className={`px-4 py-2 rounded-[10px] cursor-pointer text-sm font-semibold transition-all outline-none focus-visible:ring-2 focus-visible:ring-[#3871C1] focus-visible:ring-offset-2 ${formData.type === 'rent'
                                            ? 'bg-[#3871C1] text-white shadow'
                                            : 'bg-white text-[#0B2B57] border border-[#BFD3FF] hover:bg-[#F5FAFF]'
                                            }`}
                                    >
                                        For Rent
                                    </button>

                                    {/* For Sale */}
                                    <button
                                        type="button"
                                        aria-pressed={formData.type === 'buy'}
                                        onClick={() => setFormData((prev) => ({ ...prev, type: 'buy' }))}
                                        className={`px-4 py-2 rounded-[10px] cursor-pointer text-sm font-semibold transition-all outline-none focus-visible:ring-2 focus-visible:ring-[#3871C1] focus-visible:ring-offset-2 ${formData.type === 'buy'
                                            ? 'bg-[#3871C1] text-white shadow'
                                            : 'bg-white text-[#0B2B57] border border-[#BFD3FF] hover:bg-[#F5FAFF]'
                                            }`}
                                    >
                                        For Sale
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Property Info */}
                        <Card>
                            <SectionTitle icon={<FaMapMarkerAlt />} title="Property Information" />

                            <div className="mt-4 space-y-6">
                                {/* Row 1: Title + Address */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <Field
                                        label="Title"
                                        name="title"
                                        icon={<FaHome />}
                                        placeholder="e.g. San Isidro Family Home"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                    />

                                    {/* Address + Pick on Map */}
                                    <div className="flex flex-col gap-1">
                                        <label htmlFor="address" className="text-sm font-medium text-[#001619B2]">
                                            Address
                                        </label>

                                        <div className="relative">
                                            <input
                                                id="address"
                                                type="text"
                                                name="address"
                                                value={formData.address}
                                                onChange={handleInputChange}
                                                placeholder="Full property address"
                                                className="w-full border border-[#D2E4FF] pl-10 pr-28 py-3 rounded-xl text-sm placeholder-[#9AA6B2] focus:outline-none focus:ring-2 focus:ring-[#3871C1] transition"
                                            />
                                            <span
                                                aria-hidden="true"
                                                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8091A8] text-[16px]"
                                            >
                                                <FaMapMarkerAlt />
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => setIsMapOpen(true)}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg border border-[#BFD3FF] bg-white text-[#0B2B57] text-xs font-semibold hover:bg-[#F5FAFF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3871C1]"
                                                aria-label="Pick address on map"
                                            >
                                                Pick on map
                                            </button>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <p className="text-xs text-[#8091A8]">Type an address or pick a location to auto-fill it.</p>

                                            {formData.lat && formData.lng && (
                                                <span className="mt-0.5 inline-flex items-center gap-2 rounded-md bg-[#F5FAFF] border border-[#D2E4FF] px-2 py-0.5 text-[11px] text-[#0B2B57]">
                                                    <span className="opacity-70">
                                                        <FaMapMarkerAlt />
                                                    </span>
                                                    {formData.lat.toFixed(5)}, {formData.lng.toFixed(5)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Row 2: Price (+ Frequency if rent) + Lease Term (rent only) */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {/* Price + Frequency */}
                                    <div className="flex flex-col gap-1">
                                        <label className="text-sm font-medium text-[#001619B2]">Price</label>

                                        <div className="flex items-center gap-2">
                                            <div className="relative w-full">
                                                <input
                                                    type="text"
                                                    inputMode="numeric"
                                                    name="price"
                                                    value={formData.price}
                                                    onChange={handlePriceChange}
                                                    placeholder={formData.type === 'rent' ? '15,000' : '3,500,000'}
                                                    className="w-full border border-[#D2E4FF] pl-9 pr-3 py-3 rounded-xl text-sm placeholder-[#9AA6B2] focus:outline-none focus:ring-2 focus:ring-[#3871C1] transition"
                                                    aria-label="Price in Philippine pesos"
                                                />
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8091A8] text-[15px] select-none">
                                                    ₱
                                                </span>
                                            </div>

                                            {formData.type === 'rent' && (
                                                <div className="relative w-[180px]">
                                                    <select
                                                        id="frequency"
                                                        name="frequency"
                                                        value={formData.frequency}
                                                        onChange={(e) =>
                                                            setFormData((prev) => ({ ...prev, frequency: e.target.value }))
                                                        }
                                                        className="font-medium w-full border border-[#D2E4FF] rounded-xl text-sm px-3 pr-9 py-3 text-[#002353] focus:ring-2 focus:ring-[#3871C1] focus:outline-none transition appearance-none bg-white"
                                                    >
                                                        <option value="monthly">monthly</option>
                                                        <option value="biweekly">bi-weekly</option>
                                                        <option value="weekly">weekly</option>
                                                        <option value="daily">daily</option>
                                                    </select>

                                                    {/* custom arrow */}
                                                    <svg
                                                        aria-hidden="true"
                                                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-70"
                                                        viewBox="0 0 20 20"
                                                        fill="none"
                                                    >
                                                        <path d="M5.5 7.5l4.5 4.5 4.5-4.5" stroke="#002353" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>

                                        <div className="text-xs text-[#8091A8] mt-1 flex items-center gap-1">
                                            <FaMoneyBillWave className="opacity-70" />
                                            Numbers only; commas added automatically.
                                        </div>
                                    </div>

                                    {/* Lease Term (only if renting) */}
                                    {formData.type === 'rent' && (
                                        <div className="flex flex-col gap-1">
                                            <label htmlFor="leaseTermMonths" className="text-sm font-medium text-[#001619B2]">
                                                Lease Term
                                            </label>

                                            <div className="relative w-full">
                                                <input
                                                    id="leaseTermMonths"
                                                    type="number"
                                                    min={1}
                                                    max={72}
                                                    name="leaseTermMonths"
                                                    value={formData.leaseTermMonths}
                                                    onChange={(e) => {
                                                        const v = e.target.value.replace(/[^\d]/g, '');
                                                        setFormData((prev) => ({ ...prev, leaseTermMonths: v }));
                                                    }}
                                                    placeholder="e.g. 12"
                                                    className="w-full border border-[#D2E4FF] pl-10 pr-3 py-3 rounded-xl text-sm placeholder-[#9AA6B2] focus:outline-none focus:ring-2 focus:ring-[#3871C1] transition"
                                                    aria-label="Lease term in months"
                                                />
                                                <span
                                                    aria-hidden="true"
                                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8091A8] text-[15px]"
                                                >
                                                    <FaCalendarAlt />
                                                </span>
                                            </div>

                                            <div className="text-xs text-[#8091A8] mt-1">
                                                Enter total lease length in months (e.g., <span className="font-medium">12</span>).
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Row 3: Size / Beds / Baths */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                    <Field
                                        label="Size"
                                        name="size"
                                        icon={<FaRulerCombined />}
                                        placeholder="e.g. 120 m²"
                                        value={formData.size}
                                        onChange={handleInputChange}
                                    />
                                    <Field
                                        label="Bedrooms"
                                        name="bed"
                                        type="number"
                                        icon={<FaBed />}
                                        placeholder="e.g. 3"
                                        value={formData.bed}
                                        onChange={handleInputChange}
                                    />
                                    <Field
                                        label="Bathrooms"
                                        name="bath"
                                        type="number"
                                        icon={<FaBath />}
                                        placeholder="e.g. 2"
                                        value={formData.bath}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                        </Card>

                        {/* Description */}
                        <Card>
                            {/* Description stays as-is */}
                            <SectionTitle icon={<FaHome />} title="Description & Amenities" />
                            <div className="flex flex-col gap-4 mt-4">
                                <div className="relative">
                                    <textarea
                                        name="description"
                                        rows={6}
                                        maxLength={DESC_LIMIT}
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        placeholder="Highlight the best features, nearby landmarks, and what makes this property unique..."
                                        className="w-full px-4 py-3 border border-[#D2E4FF] rounded-[12px] text-sm placeholder-[#9AA6B2] focus:ring-2 focus:ring-[#3871C1] focus:outline-none transition"
                                        aria-describedby="desc-help"
                                    />
                                    <div id="desc-help" className="absolute right-3 bottom-2 text-xs text-[#8b98ab]" aria-live="polite">
                                        {descCount}/{DESC_LIMIT}
                                    </div>
                                </div>
                            </div>

                            {/* Amenities (chip input, like Tags) */}
                            <div className="flex items-center justify-between gap-2 mt-6">
                                <SectionTitle icon={<FaListUl />} title="Amenities" />
                                <span className="text-xs text-[#5C7188]">
                                    {formData.amenities.length}/{MAX_AMENITIES}
                                </span>
                            </div>

                            <div className="mt-4 flex flex-col gap-3">
                                <div
                                    className={`border rounded-lg px-3 py-2 flex items-center gap-2 ${formData.amenities.length >= MAX_AMENITIES
                                        ? 'opacity-60 pointer-events-none'
                                        : 'border-[#D2E4FF] bg-[#F9FAFF] focus-within:ring-2 focus-within:ring-[#3871C1]'
                                        }`}
                                >
                                    <input
                                        type="text"
                                        inputMode="text"
                                        autoComplete="off"
                                        placeholder='Add an amenity (e.g. "Gated Community"), then press Enter'
                                        className="bg-transparent outline-none w-full text-sm placeholder:text-[#8CA1C6]"
                                        value={amenityInput}
                                        onChange={(e) => setAmenityInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (!amenityInput.trim()) return;
                                            if (e.key === 'Enter' || e.key === 'Tab' || e.key === ',') {
                                                e.preventDefault();
                                                const next = normalizeAmenity(amenityInput);
                                                if (!next) return;
                                                setFormData((p) => {
                                                    const existing = new Set(p.amenities.map((x) => x.toLowerCase()));
                                                    if (existing.has(next.toLowerCase()) || p.amenities.length >= MAX_AMENITIES) return p;
                                                    return { ...p, amenities: [...p.amenities, next] };
                                                });
                                                setAmenityInput('');
                                            }
                                        }}
                                        onPaste={(e) => {
                                            const text = e.clipboardData.getData('text');
                                            if (!text) return;
                                            const pieces = text.split(/[,;\n]/).map(normalizeAmenity).filter(Boolean);
                                            if (!pieces.length) return;
                                            e.preventDefault();
                                            setFormData((p) => {
                                                const out = [...p.amenities];
                                                const existing = new Set(out.map((x) => x.toLowerCase()));
                                                for (const a of pieces) {
                                                    if (out.length >= MAX_AMENITIES) break;
                                                    if (!existing.has(a.toLowerCase())) {
                                                        out.push(a);
                                                        existing.add(a.toLowerCase());
                                                    }
                                                }
                                                return { ...p, amenities: out };
                                            });
                                        }}
                                        aria-label="Add an amenity"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const next = normalizeAmenity(amenityInput);
                                            if (!next) return;
                                            setFormData((p) => {
                                                const existing = new Set(p.amenities.map((x) => x.toLowerCase()));
                                                if (existing.has(next.toLowerCase()) || p.amenities.length >= MAX_AMENITIES) return p;
                                                return { ...p, amenities: [...p.amenities, next] };
                                            });
                                            setAmenityInput('');
                                        }}
                                        className="text-xs font-medium px-2 py-1 rounded bg-[#EDF3FF] text-[#3871C1] hover:brightness-95"
                                        aria-label="Add amenity"
                                    >
                                        Add
                                    </button>
                                </div>

                                {formData.amenities.length > 0 && (
                                    <>
                                        <div className="flex items-center justify-between text-xs text-[#5C7188]">
                                            <span aria-live="polite">
                                                {formData.amenities.length} amenit{formData.amenities.length === 1 ? 'y' : 'ies'} added
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => setFormData((p) => ({ ...p, amenities: [] }))}
                                                className="underline underline-offset-2 hover:text-[#3871C1]"
                                                aria-label="Remove all amenities"
                                            >
                                                Clear all
                                            </button>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            {formData.amenities.map((amenity, i) => (
                                                <span
                                                    key={`${amenity}-${i}`}
                                                    className="inline-flex items-center gap-1 rounded-full border border-[#E3ECF9] bg-white px-3 py-1 text-xs"
                                                >
                                                    {amenity}
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setFormData((p) => ({
                                                                ...p,
                                                                amenities: p.amenities.filter((_, idx) => idx !== i),
                                                            }))
                                                        }
                                                        className="ml-1 -mr-1 w-4 h-4 leading-none text-[#002353]/80 hover:text-[#002353]"
                                                        aria-label={`Remove amenity ${amenity}`}
                                                        title="Remove"
                                                    >
                                                        ×
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    </>
                                )}

                                <p className="text-[11px] text-[#8CA1C6]">
                                    Tips: keep amenities short (max {MAX_AMENITY_LEN} chars). Paste a list separated by commas or new lines.
                                </p>
                            </div>
                        </Card>

                        {/* Tags (NEW) */}
                        <Card>
                            <div className="flex items-center justify-between gap-2">
                                <SectionTitle icon={<FaTags />} title="Tags" />
                                <span className="text-xs text-[#5C7188]">{formData.tags.length}/{MAX_TAGS}</span>
                            </div>

                            <div className="mt-4 flex flex-col gap-3">
                                <div
                                    className={`border rounded-lg px-3 py-2 flex items-center gap-2 ${formData.tags.length >= MAX_TAGS
                                        ? 'opacity-60 pointer-events-none'
                                        : 'border-[#D2E4FF] bg-[#F9FAFF] focus-within:ring-2 focus-within:ring-[#3871C1]'
                                        }`}
                                >
                                    <input
                                        type="text"
                                        inputMode="text"
                                        autoComplete="off"
                                        placeholder='Add a tag (e.g. "pet friendly"), then press Enter'
                                        className="bg-transparent outline-none w-full text-sm placeholder:text-[#8CA1C6]"
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (!tagInput.trim()) return;
                                            if (e.key === 'Enter' || e.key === 'Tab' || e.key === ',') {
                                                e.preventDefault();
                                                const next = normalizeTag(tagInput);
                                                if (!next) return;
                                                setFormData((p) => {
                                                    const existing = new Set(p.tags.map((x) => x.toLowerCase()));
                                                    if (existing.has(next.toLowerCase()) || p.tags.length >= MAX_TAGS) return p;
                                                    return { ...p, tags: [...p.tags, next] };
                                                });
                                                setTagInput('');
                                            }
                                        }}
                                        onPaste={(e) => {
                                            const text = e.clipboardData.getData('text');
                                            if (!text) return;
                                            const pieces = text.split(/[,;\n]/).map(normalizeTag).filter(Boolean);
                                            if (!pieces.length) return;
                                            e.preventDefault();
                                            setFormData((p) => {
                                                const out = [...p.tags];
                                                const existing = new Set(out.map((x) => x.toLowerCase()));
                                                for (const t of pieces) {
                                                    if (out.length >= MAX_TAGS) break;
                                                    if (!existing.has(t.toLowerCase())) {
                                                        out.push(t);
                                                        existing.add(t.toLowerCase());
                                                    }
                                                }
                                                return { ...p, tags: out };
                                            });
                                        }}
                                        aria-label="Add a tag"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const next = normalizeTag(tagInput);
                                            if (!next) return;
                                            setFormData((p) => {
                                                const existing = new Set(p.tags.map((x) => x.toLowerCase()));
                                                if (existing.has(next.toLowerCase()) || p.tags.length >= MAX_TAGS) return p;
                                                return { ...p, tags: [...p.tags, next] };
                                            });
                                            setTagInput('');
                                        }}
                                        className="text-xs font-medium px-2 py-1 rounded bg-[#EDF3FF] text-[#3871C1] hover:brightness-95"
                                        aria-label="Add tag"
                                    >
                                        Add
                                    </button>
                                </div>

                                {formData.tags.length > 0 && (
                                    <>
                                        <div className="flex items-center justify-between text-xs text-[#5C7188]">
                                            <span aria-live="polite">
                                                {formData.tags.length} tag{formData.tags.length !== 1 ? 's' : ''} added
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => setFormData((p) => ({ ...p, tags: [] }))}
                                                className="underline underline-offset-2 hover:text-[#3871C1]"
                                                aria-label="Remove all tags"
                                            >
                                                Clear all
                                            </button>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            {formData.tags.map((tag, i) => (
                                                <span
                                                    key={`${tag}-${i}`}
                                                    className="inline-flex items-center gap-1 rounded-full border border-[#E3ECF9] bg-white px-3 py-1 text-xs"
                                                >
                                                    {tag}
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setFormData((p) => ({
                                                                ...p,
                                                                tags: p.tags.filter((_, idx) => idx !== i),
                                                            }))
                                                        }
                                                        className="ml-1 -mr-1 w-4 h-4 leading-none text-[#002353]/80 hover:text-[#002353]"
                                                        aria-label={`Remove tag ${tag}`}
                                                        title="Remove"
                                                    >
                                                        ×
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    </>
                                )}

                                <p className="text-[11px] text-[#8CA1C6]">
                                    Tips: keep tags short (max {MAX_TAG_LEN} chars). Paste a list separated by commas or new lines.
                                </p>
                            </div>
                        </Card>

                        <Card>{/* Video (optional) */}
                            <div className="flex items-center justify-between gap-2">
                                <SectionTitle
                                    icon={<FaVideo />}
                                    title={
                                        <>
                                            <span>Video</span>
                                            <span className="ml-1 font-normal text-[#5C7188]">(optional)</span>
                                        </>
                                    }
                                />
                                <span className="inline-flex items-center rounded-full bg-[#EDF3FF] text-[#3871C1] text-xs font-medium px-3 py-1">
                                    Property listings with videos attract 4× more inquiries.
                                </span>
                            </div>

                            <label
                                htmlFor="video-upload"
                                className="mt-3 border-2 border-dashed rounded-xl py-6 px-6 flex flex-col items-center justify-center text-center text-sm cursor-pointer transition-all duration-150 border-[#D2E4FF] bg-[#F9FAFF] hover:bg-[#EDF3FF]"
                            >
                                <FaVideo className="text-xl mb-2 text-[#3871C1]" />
                                <span className="font-medium mb-1">Click to upload video</span>
                                <span className="text-xs text-[#8CA1C6]">MP4/WebM/MOV • Up to 100MB • Max 5</span>
                                <input id="video-upload" type="file" accept="video/mp4,video/webm,video/quicktime" multiple onChange={handleVideoChange} className="hidden" />
                            </label>

                            {formData.videos.length > 0 && (
                                <>
                                    <div className="flex items-center justify-between text-xs text-[#5C7188] mt-3">
                                        <span>{formData.videos.length} video{formData.videos.length > 1 ? 's' : ''} added</span>
                                        <button
                                            type="button"
                                            onClick={() => setFormData((p) => ({ ...p, videos: [] }))}
                                            className="underline underline-offset-2 hover:text-[#3871C1]"
                                            aria-label="Remove all videos"
                                        >
                                            Clear all
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
                                        {videoPreviews.map((src, idx) => (
                                            <div key={`vid-${idx}`} className="relative w-full aspect-video bg-white rounded-lg overflow-hidden border border-[#E3ECF9] group">
                                                <video src={src} controls className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            videos: prev.videos.filter((_, i) => i !== idx),
                                                        }))
                                                    }
                                                    className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-white/90 text-[#002353] text-base font-bold shadow-sm flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition"
                                                    title="Remove"
                                                    aria-label={`Remove video ${idx + 1}`}
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </Card>

                        {/* Images */}
                        <Card>
                            {/* header + badge (new) */}
                            <div className="flex items-center justify-between gap-2">
                                <SectionTitle icon={<FaImages />} title="Images" />
                            </div>

                            <div className="flex flex-col gap-4 mt-4">
                                <label
                                    htmlFor="image-upload"
                                    onDragOver={(e) => {
                                        e.preventDefault();
                                        setIsDragging(true);
                                    }}
                                    onDragLeave={() => setIsDragging(false)}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        setIsDragging(false);
                                        onDropFiles(e.dataTransfer.files);
                                    }}
                                    className={`border-2 border-dashed rounded-xl py-10 px-6 flex flex-col items-center justify-center text-center text-sm cursor-pointer transition-all duration-150 group ${isDragging ? 'border-[#3871C1] bg-[#EDF3FF]' : 'border-[#D2E4FF] bg-[#F9FAFF] hover:bg-[#EDF3FF]'
                                        }`}
                                >
                                    <FaImages className="text-2xl mb-2 text-[#3871C1] group-hover:scale-110 transition" />
                                    <span className="font-medium mb-1">Drag & drop or click to upload</span>
                                    <span className="text-xs text-[#8CA1C6]">Up to 10MB each • Max 25 media</span>
                                    <input id="image-upload" type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
                                </label>

                                {formData.images.length > 0 && (
                                    <>
                                        <div className="flex items-center justify-between text-xs text-[#5C7188]">
                                            <span>
                                                {formData.images.length} photo{formData.images.length > 1 ? 's' : ''} added
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => setFormData((p) => ({ ...p, images: [] }))}
                                                className="underline underline-offset-2 hover:text-[#3871C1]"
                                                aria-label="Remove all photos"
                                            >
                                                Clear all
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                                            {previews.map((src, index) => (
                                                <div
                                                    key={`${src}-${index}`}
                                                    className="relative w-full aspect-square bg-white rounded-lg overflow-hidden border border-[#E3ECF9] group"
                                                >
                                                    <Image
                                                        src={src}
                                                        alt={`preview-${index}`}
                                                        unoptimized
                                                        width={800}
                                                        height={800}
                                                        className="object-cover w-full h-full group-hover:scale-105 transition-transform"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setFormData((prev) => ({
                                                                ...prev,
                                                                images: prev.images.filter((_, i) => i !== index),
                                                            }))
                                                        }
                                                        className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-white/90 text-[#002353] text-base font-bold shadow-sm flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition"
                                                        title="Remove"
                                                        aria-label={`Remove photo ${index + 1}`}
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </Card>

                        {/* Documents Checklist */}
                        {formData.type === 'buy' && (<Card>
                            <div className="flex items-center justify-between gap-3">
                                <SectionTitle icon={<FaClipboardCheck />} title="Essential Property Documents" />
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => toggleAllChecklist(true)}
                                        className="px-4 py-2 rounded-xl border border-[#BFD3FF] bg-white text-[#0B2B57] font-semibold text-sm hover:bg-[#F5FAFF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3871C1] focus-visible:ring-offset-2"
                                    >
                                        Select all
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => toggleAllChecklist(false)}
                                        className="px-4 py-2 rounded-xl border border-[#BFD3FF] bg-white text-[#0B2B57] font-semibold text-sm hover:bg-[#F5FAFF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3871C1] focus-visible:ring-offset-2"
                                    >
                                        Clear
                                    </button>
                                </div>
                            </div>

                            <div className="mt-4">
                                {/* progress */}
                                <div className="mb-3">
                                    <div className="flex items-center justify-between text-xs text-[#5C7188] mb-1">
                                        <span>
                                            {checklistProgress.done}/{checklistProgress.total} completed
                                        </span>
                                        <span>{checklistProgress.pct}%</span>
                                    </div>
                                    <div className="h-2 w-full rounded-full bg-[#E3ECF9] overflow-hidden">
                                        <div className="h-full bg-[#3871C1] transition-all" style={{ width: `${checklistProgress.pct}%` }} />
                                    </div>
                                </div>

                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {checklistMeta.map((item) => {
                                        const checked = checklist[item.id];
                                        const toggle = () => setChecklist((prev) => ({ ...prev, [item.id]: !prev[item.id] }));
                                        return (
                                            <li
                                                key={item.id}
                                                onClick={toggle}
                                                className={`flex flex-col gap-1 border rounded-xl px-4 py-3 bg-white transition cursor-pointer hover:shadow-sm ${checked ? 'border-[#9CC0FF] bg-[#F1F6FF]' : 'border-[#E3ECF9]'
                                                    }`}
                                                role="checkbox"
                                                aria-checked={checked}
                                                tabIndex={0}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' || e.key === ' ') {
                                                        e.preventDefault();
                                                        toggle();
                                                    }
                                                }}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <label className="flex items-center gap-3 text-sm cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={checked}
                                                            onChange={toggle}
                                                            className="w-4 h-4 text-[#3871C1] accent-[#3871C1] cursor-pointer"
                                                            aria-label={item.label}
                                                        />
                                                        <span className="font-medium text-[#002353]">{item.label}</span>
                                                    </label>
                                                    {checked ? <FaCheckCircle className="text-[#2f7d32]" /> : <FaTimesCircle className="text-[#A7B5C6]" />}
                                                </div>
                                                <p className="text-xs text-[#60738a] pl-7">{item.description}</p>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        </Card>
                        )}
                    </div>

                    {/* Right column: Live summary + Submit */}
                    <aside className="xl:w-[340px] xl:sticky xl:top-[118px] xl:self-start gap-6 flex flex-col">
                        {isLoggedIn ? (
                            <Card>
                                <div className="flex items-center justify-between">
                                    <SectionTitle title="Listing Summary" />
                                    <span
                                        className={`text-xs font-semibold px-2 py-1 rounded-full ${formData.type === 'rent'
                                            ? 'bg-[#EAF2FF] text-[#1E4DB7]'
                                            : 'bg-[#E9FFF3] text-[#0E7A47]'
                                            }`}
                                    >
                                        {formData.type === 'rent' ? 'For Rent' : 'For Sale'}
                                    </span>
                                </div>

                                <div className="mt-4 space-y-3 text-sm">
                                    <SummaryRow label="Title" value={formData.title || '—'} />
                                    <SummaryRow label="Address" value={formData.address || '—'} />

                                    <SummaryRow
                                        label="Price"
                                        value={
                                            formData.price
                                                ? `₱ ${formData.price}${formData.type === 'rent'
                                                    ? ` / ${freqLabel(formData.frequency)}`
                                                    : ''
                                                }`
                                                : '—'
                                        }
                                    />
                                    {formData.type === 'rent' && (
                                        <SummaryRow
                                            label="Lease Term"
                                            value={formData.leaseTermMonths ? `${formData.leaseTermMonths} mo` : '—'}
                                        />
                                    )}

                                    <div className="grid grid-cols-3 gap-2">
                                        <Chip icon={<FaRulerCombined />} value={formData.size || '—'} />
                                        <Chip icon={<FaBed />} value={`${formData.bed || '—'} BR`} />
                                        <Chip icon={<FaBath />} value={`${formData.bath || '—'} BA`} />
                                    </div>

                                    {formData.amenities.length > 0 && (
                                        <div className="text-xs text-[#5C7188]">
                                            Amenities:{' '}
                                            <span className="text-[#002353] font-medium">
                                                {formData.amenities.slice(0, 3).join(', ')}
                                                {formData.amenities.length > 3 ? '…' : ''}
                                            </span>
                                        </div>
                                    )}

                                    {formData.tags.length > 0 && (
                                        <div className="text-xs text-[#5C7188]">
                                            Tags:{' '}
                                            <span className="text-[#002353] font-medium">
                                                {formData.tags.slice(0, 3).join(', ')}
                                                {formData.tags.length > 3 ? '…' : ''}
                                            </span>
                                        </div>
                                    )}

                                    {formData.type === 'buy' && (<div className="pt-2">
                                        <div className="text-xs text-[#5C7188] mb-1">Checklist</div>
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 flex-1 rounded-full bg-[#E3ECF9] overflow-hidden">
                                                <div
                                                    className="h-full bg-[#3871C1] transition-all"
                                                    style={{ width: `${checklistProgress.pct}%` }}
                                                />
                                            </div>
                                            <span className="text-xs text-[#5C7188] w-10 text-right">
                                                {checklistProgress.pct}%
                                            </span>
                                        </div>
                                    </div>
                                    )}
                                </div>

                                <div className="pt-5 flex flex-col items-center">
                                    <button
                                        type="submit"
                                        disabled={!isValid}
                                        aria-disabled={!isValid}
                                        className={`group relative inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-semibold transition-all
    ${isValid
                                                ? 'text-white bg-gradient-to-r from-[#5AA6FF] via-[#3871C1] to-[#2D3E8B] shadow-[0_10px_20px_rgba(56,113,193,0.35)] hover:shadow-[0_12px_24px_rgba(56,113,193,0.5)] focus:outline-none focus:ring-4 focus:ring-[#3871C1]/30 active:translate-y-[1px]'
                                                : 'text-[#8CA3BF] bg-[#EAF1FC] cursor-not-allowed border border-[#D2E4FF] shadow-none'}
  `}
                                        title={isValid ? undefined : 'Please complete the required fields'}
                                    >
                                        {/* sheen on hover (when enabled) */}
                                        {isValid && (
                                            <span
                                                className="pointer-events-none absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
                                                aria-hidden="true"
                                            />
                                        )}

                                        {/* Icon changes with state */}
                                        {isValid ? (
                                            <svg className="relative h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                                <path d="M4 12l16-8-6 16-2-6-8-2z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                                            </svg>
                                        ) : (
                                            <svg className="relative h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                                <path d="M12 9v4m0 4h.01M12 3l9 18H3L12 3z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        )}

                                        <span className="relative">
                                            {isValid ? 'Submit Property Listing' : 'Complete required fields'}
                                        </span>
                                    </button>

                                    {!isValid && (
                                        <p className="mt-2 text-xs text-[#8b98ab] text-center" aria-live="polite">
                                            Add <span className="font-medium">Title</span>,{' '}
                                            <span className="font-medium">Address</span>,{' '}
                                            <span className="font-medium">Price</span>, and{' '}
                                            <span className="font-medium">Size</span> to enable submission.
                                        </p>
                                    )}
                                </div>
                            </Card>
                        ) : (
                            // ----- ALT for not logged in -----
                            <Card>
                                <div className="flex items-center justify-between">
                                    <SectionTitle title="Listing Summary" />
                                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-[#FFF4E5] text-[#B75E1E]">
                                        Guest
                                    </span>
                                </div>

                                <div className="mt-4 space-y-3 text-sm">
                                    <p className="text-xs text-[#5C7188]">
                                        Sign in to save your progress and submit your property.
                                    </p>

                                    <SummaryRow label="Title" value={formData.title || '—'} />
                                    <SummaryRow label="Address" value={formData.address || '—'} />
                                    <SummaryRow
                                        label="Price"
                                        value={
                                            formData.price
                                                ? `₱ ${formData.price}${formData.type === 'rent'
                                                    ? ` / ${freqLabel(formData.frequency)}`
                                                    : ''
                                                }`
                                                : '—'
                                        }
                                    />
                                    {formData.type === 'rent' && (
                                        <SummaryRow
                                            label="Lease Term"
                                            value={formData.leaseTermMonths ? `${formData.leaseTermMonths} mo` : '—'}
                                        />
                                    )}

                                    <div className="grid grid-cols-3 gap-2 opacity-60">
                                        <Chip icon={<FaRulerCombined />} value={formData.size || '—'} />
                                        <Chip icon={<FaBed />} value={`${formData.bed || '—'} BR`} />
                                        <Chip icon={<FaBath />} value={`${formData.bath || '—'} BA`} />
                                    </div>

                                    {formData.tags?.length > 0 && (
                                        <div className="text-xs text-[#5C7188]">
                                            Tags:{' '}
                                            <span className="text-[#002353] font-medium">
                                                {formData.tags.slice(0, 3).join(', ')}
                                                {formData.tags.length > 3 ? '…' : ''}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-5 flex flex-col items-center">
                                    {/* wire these up to your auth handlers */}
                                    <button
                                        type="button"
                                        onClick={onSignIn}
                                        aria-label="Sign in to continue"
                                        className="
    group relative inline-flex items-center justify-center gap-2
    rounded-xl px-5 py-3 font-semibold text-white
    bg-gradient-to-r from-[#5AA6FF] via-[#3871C1] to-[#2D3E8B]
    shadow-[0_10px_20px_rgba(56,113,193,0.35)]
    transition-all duration-200
    hover:shadow-[0_12px_24px_rgba(56,113,193,0.5)]
    focus:outline-none focus:ring-4 focus:ring-[#3871C1]/30
    active:translate-y-[1px]
    w-full sm:w-auto
  "
                                    >
                                        {/* subtle hover sheen */}
                                        <span
                                            aria-hidden="true"
                                            className="pointer-events-none absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
                                        />
                                        {/* lock icon */}
                                        <svg className="relative h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                            <rect x="4" y="10" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="1.6" />
                                            <path d="M8 10V8a4 4 0 1 1 8 0v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                                        </svg>
                                        <span className="relative">Sign in to continue</span>
                                    </button>

                                    <button
                                        type="button"
                                        className="mt-2 text-xs text-[#1E4DB7] hover:underline"
                                        onClick={onCreateAccount}
                                    >
                                        Create an account
                                    </button>
                                    <p className="mt-2 text-xs text-[#8b98ab] text-center" aria-live="polite">
                                        You’ll need an account to submit a property. Your current inputs will remain on this page.
                                    </p>
                                </div>
                            </Card>
                        )}
                        {/* Property Score */}
                        <Card>
                            <div className="flex items-center justify-between">
                                <SectionTitle icon={<FaCheckCircle />} title="Property Score" />
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-[#002353]">{qualityScore}/100</span>
                                    <button
                                        type="button"
                                        onClick={() => setScoreInfoOpen(true)}
                                        className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-[#E3ECF9] text-[#3871C1] hover:bg-[#F5F8FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3871C1]"
                                        title="How scoring works"
                                        aria-label="How scoring works"
                                    >
                                        <FaInfoCircle />
                                    </button>
                                </div>
                            </div>

                            <div className="mt-3 w-full">
                                {/* prettier progress with thresholds */}
                                <div className="h-3 w-full rounded-full bg-[#EAF2FF] border border-[#D8E6FF] overflow-hidden">
                                    <div
                                        role="progressbar"
                                        aria-valuemin={0}
                                        aria-valuemax={100}
                                        aria-valuenow={pct}
                                        className="h-full transition-[width] duration-500 ease-out rounded-full"
                                        style={{
                                            width: `${pct}%`,
                                            background:
                                                pct < 40
                                                    ? 'linear-gradient(90deg,#ef5350,#d32f2f)'
                                                    : pct < 70
                                                        ? 'linear-gradient(90deg,#ffd54f,#f9a825)'
                                                        : 'linear-gradient(90deg,#5AA6FF,#3871C1,#2D3E8B)',
                                        }}
                                    />
                                </div>
                            </div>

                            {/* compact stat chips with micro-bars */}
                            <div className="mt-4 grid grid-cols-1 gap-2">
                                {/* Photos */}
                                <div className="flex items-center justify-between rounded-xl border border-[#E3ECF9] bg-white px-3 py-2">
                                    <div className="flex items-center gap-2 text-sm">
                                        <FaImages className="text-[#3871C1]" />
                                        <span>Photos</span>
                                        <span className="text-xs text-[#5C7188]">(≥{PHOTOS_TARGET})</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-24 h-1.5 bg-[#EAF2FF] rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full bg-[#3871C1]"
                                                style={{
                                                    width: `${Math.max(0, Math.min(100, (photosPts / Math.max(1, photosMax)) * 100))}%`,
                                                }}
                                            />
                                        </div>
                                        <span className="text-sm font-medium">
                                            {Math.round(photosPts)}/{photosMax}
                                        </span>
                                    </div>
                                </div>

                                {/* Video */}
                                <div className="flex items-center justify-between rounded-xl border border-[#E3ECF9] bg-white px-3 py-2">
                                    <div className="flex items-center gap-2 text-sm">
                                        <FaVideo className="text-[#3871C1]" />
                                        <span>Video</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-24 h-1.5 bg-[#EAF2FF] rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full bg-[#3871C1]"
                                                style={{
                                                    width: `${Math.max(0, Math.min(100, (videosPts / Math.max(1, videosMax)) * 100))}%`,
                                                }}
                                            />
                                        </div>
                                        <span className="text-sm font-medium">
                                            {Math.round(videosPts)}/{videosMax}
                                        </span>
                                    </div>
                                </div>

                                {/* Documents (buy only) */}
                                {formData.type === 'buy' && (
                                    <div className="flex items-center justify-between rounded-xl border border-[#E3ECF9] bg-white px-3 py-2">
                                        <div className="flex items-center gap-2 text-sm">
                                            <FaClipboardCheck className="text-[#3871C1]" />
                                            <span>Documents</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-24 h-1.5 bg-[#EAF2FF] rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full bg-[#3871C1]"
                                                    style={{
                                                        width: `${Math.max(0, Math.min(100, (docsPts / Math.max(1, docsMax)) * 100))}%`,
                                                    }}
                                                />
                                            </div>
                                            <span className="text-sm font-medium">
                                                {Math.round(docsPts)}/{docsMax}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Guidance */}
                            <p className="mt-3 text-xs text-[#8b98ab] text-center">
                                Add<span className="font-medium">≥ {PHOTOS_TARGET} photos</span> and <span className="font-medium">1 video</span>
                                {formData.type === 'buy' && <>; complete <span className="font-medium">all documents</span></>}.
                                <br className="hidden sm:block" />
                                <button
                                    type="button"
                                    onClick={() => setScoreInfoOpen(true)}
                                    className="mt-1 underline text-[#3871C1] hover:text-[#2D3E8B]"
                                >
                                    See how the score is calculated
                                </button>
                            </p>
                        </Card>


                    </aside>

                </form>
            </div>

            {/* Leaflet CSS (free maps) */}
            <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />

            {/* Map Picker Modal */}
            {isMapOpen && (
                <LeafletMapPickerModal
                    open={isMapOpen}
                    onClose={() => setIsMapOpen(false)}
                    initialPosition={formData.lat && formData.lng ? { lat: formData.lat, lng: formData.lng } : undefined}
                    onSelect={({ address, lat, lng }) => {
                        setFormData((prev) => ({ ...prev, address, lat, lng }));
                        setIsMapOpen(false);
                    }}
                />
            )}

            {confirmOpen && (
                <ConfirmationDialog
                    open={confirmOpen}
                    onCancel={() => setConfirmOpen(false)}
                    onConfirm={submitConfirmed}
                    busy={confirmBusy}
                    data={{
                        type: formData.type,
                        title: formData.title,
                        address: formData.address,
                        price: formData.price,
                        frequency: formData.frequency,
                        size: formData.size,
                        bed: formData.bed,
                        bath: formData.bath,
                        leaseTermMonths: formData.leaseTermMonths,
                        tags: formData.tags,
                        amenities: formData.amenities,
                    }}
                />
            )}
            {successOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/30"
                        onClick={() => setSuccessOpen(false)}
                        aria-hidden="true"
                    />
                    <div
                        role="dialog"
                        aria-modal="true"
                        className="relative bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-xl border border-[#E3ECF9]"
                    >
                        <svg
                            className="w-16 h-16 text-green-500 mx-auto mb-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <h2 className="text-xl font-bold mb-2">Listing Submitted!</h2>
                        <p className="text-gray-600 mb-6">
                            Your property listing has been successfully submitted.
                        </p>
                        <button
                            onClick={() => setSuccessOpen(false)}
                            className="px-6 py-2 rounded-lg bg-[#3871C1] text-white hover:bg-[#2f5ea6] transition-colors"
                            autoFocus
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}
            {scoreInfoOpen && (
                <ScoreInfoModal
                    open={scoreInfoOpen}
                    onClose={() => setScoreInfoOpen(false)}
                    initialTab={formData.type}
                />
            )}
        </section>
    );
};

export default SellPage;

/* ---------- Helpers ---------- */
const freqLabel = (f: string) =>
    f === 'monthly' ? 'month' : f === 'biweekly' ? 'bi-week' : f === 'weekly' ? 'week' : 'day';

const SummaryRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div className="flex items-center justify-between">
        <span className="text-[#5C7188]">{label}</span>
        <span className="font-medium text-[#002353] max-w-[60%] text-right truncate">{value}</span>
    </div>
);

const Chip: React.FC<{ icon?: React.ReactNode; value: string }> = ({ icon, value }) => (
    <div className="flex items-center gap-2 px-2 py-1 rounded-lg border border-[#E3ECF9] text-[#002353]">
        <span className="text-[#8091A8]">{icon}</span>
        <span className="text-sm">{value}</span>
    </div>
);

/* ---------- Reusable UI ---------- */
interface FieldProps {
    label: string;
    name: string;
    value: string;
    placeholder?: string;
    type?: string;
    icon?: React.ReactNode;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Field: React.FC<FieldProps> = ({ label, name, value, onChange, icon, placeholder, type = 'text' }) => (
    <div className="flex flex-col gap-1 group">
        <label htmlFor={name} className="text-sm font-medium text-[#001619B2]">
            {label}
        </label>
        <div className="relative">
            <input
                id={name}
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full border border-[#D2E4FF] pl-10 pr-3 py-3 rounded-xl text-sm placeholder-[#9AA6B2] focus:outline-none focus:ring-2 focus:ring-[#3871C1] transition"
            />
            {icon && (
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8091A8] text-[16px] group-focus-within:scale-110 transition-transform">
                    {icon}
                </span>
            )}
        </div>
    </div>
);
const ConfirmationDialog: React.FC<{
    open: boolean;
    busy?: boolean;
    onCancel: () => void;
    onConfirm: () => void;
    data: {
        type: 'rent' | 'buy';
        title: string;
        address: string;
        price: string;
        frequency: string;
        size: string;
        bed: string;
        bath: string;
        leaseTermMonths: string;
        tags: string[];
        amenities: string[];
    };
}> = ({ open, busy, onCancel, onConfirm, data }) => {
    if (!open) return null;

    return (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-[1000] p-4 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
            <div className="relative z-10 w-full max-w-lg bg-white rounded-2xl border border-[#E3ECF9] shadow-xl overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-[#E3ECF9]">
                    <div className="flex items-center gap-2 text-lg font-semibold text-[#002353]">
                        <span>Confirm Listing Details</span>
                    </div>
                </div>

                <div className="p-4 text-sm text-[#002353] space-y-2">
                    <Row name="Type" value={data.type === 'rent' ? 'For Rent' : 'For Sale'} />
                    <Row name="Title" value={data.title || '—'} />
                    <Row name="Address" value={data.address || '—'} />
                    <Row name="Price" value={data.price ? `₱ ${data.price}${data.type === 'rent' ? ` / ${freqLabel(data.frequency)}` : ''}` : '—'} />
                    <Row name="Size" value={data.size || '—'} />
                    <Row name="Bedrooms" value={data.bed || '—'} />
                    <Row name="Bathrooms" value={data.bath || '—'} />
                    {data.type === 'rent' && <Row name="Lease Term" value={data.leaseTermMonths ? `${data.leaseTermMonths} months` : '—'} />}
                    {data.tags.length > 0 && <Row name="Tags" value={data.tags.join(', ')} />}
                    {data.amenities.length > 0 && <Row name="Amenities" value={data.amenities.join(', ')} />}
                    <p className="text-xs text-[#5C7188] pt-2">
                        Review these details. You can still go back and edit before submitting.
                    </p>
                </div>

                <div className="p-4 flex items-center justify-end gap-2 border-t border-[#E3ECF9]">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 rounded-lg border cursor-pointer border-[#BFD3FF] bg-white text-[#0B2B57] text-sm font-semibold hover:bg-[#F5FAFF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3871C1]"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={busy}
                        className="px-4 py-2 rounded-lg bg-[#3871C1] cursor-pointer text-white text-sm font-semibold shadow hover:shadow-md disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3871C1] focus-visible:ring-offset-2"
                    >
                        {busy ? 'Submitting…' : 'Confirm & Submit'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const Row: React.FC<{ name: string; value: string }> = ({ name, value }) => (
    <div className="flex items-start justify-between gap-3">
        <span className="text-[#5C7188] min-w-[110px]">{name}</span>
        <span className="font-medium text-right flex-1">{value}</span>
    </div>
);

/* ---------- Map Picker Modal ---------- */
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
    const [pos, setPos] = React.useState<LatLng>(initialPosition || { lat: 14.5995, lng: 120.9842 }); // Manila default
    const [busy, setBusy] = React.useState(false);

    // Load Leaflet only on client to avoid SSR issues
    React.useEffect(() => {
        let alive = true;
        (async () => {
            const L = (await import('leaflet')) as LeafletNS;
            if (!alive) return;
            // Fix default marker icons when bundling
            delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
                iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
            });
            setLmod(L);
        })();
        return () => {
            alive = false;
        };
    }, []);

    React.useEffect(() => {
        if (!open || !mapEl.current || !Lmod) return;
        const L = Lmod;
        const map = L.map(mapEl.current, { center: [pos.lat, pos.lng], zoom: 15, zoomControl: true, attributionControl: true });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);

        const marker = L.marker([pos.lat, pos.lng], { draggable: true }).addTo(map);

        map.on('click', (e: import('leaflet').LeafletMouseEvent) => {
            marker.setLatLng(e.latlng);
            setPos({ lat: e.latlng.lat, lng: e.latlng.lng });
        });

        marker.on('dragend', () => {
            const ll = marker.getLatLng();
            setPos({ lat: ll.lat, lng: ll.lng });
        });

        mapRef.current = map;
        markerRef.current = marker;

        return () => {
            map.remove();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, Lmod]);

    const confirm = async () => {
        // Nominatim free reverse geocode — no key needed
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
                    <div className="flex items-center gap-2 text-lg font-semibold text-[#002353]">
                        <span className="text-[#8091A8] text-[18px]">📍</span>
                        <span>Select location</span>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-3 py-1.5 rounded-lg border border-[#BFD3FF] bg-white text-[#0B2B57] text-sm font-semibold hover:bg-[#F5FAFF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3871C1]"
                    >
                        Close
                    </button>
                </div>

                <div className="h-[60vh]">
                    <div ref={mapEl} className="w-full h-full" />
                </div>

                <div className="p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                    <div className="text-sm text-[#5C7188]">
                        Drag the pin or click the map. Current: <span className="font-medium">{pos.lat.toFixed(5)}, {pos.lng.toFixed(5)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={confirm}
                            disabled={busy}
                            className="px-4 py-2 rounded-lg bg-[#3871C1] text-white text-sm font-semibold shadow hover:shadow-md disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3871C1] focus-visible:ring-offset-2"
                        >
                            {busy ? 'Getting address…' : 'Use this location'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ---------- Scoring Info Modal (responsive) ---------- */
const ScoreInfoModal: React.FC<{
    open: boolean;
    onClose: () => void;
    initialTab: 'rent' | 'buy';
}> = ({ open, onClose, initialTab }) => {
    const [tab, setTab] = useState<'rent' | 'buy'>(initialTab);

    if (!open) return null;

    return (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-[1100] p-0 sm:p-4 flex items-end sm:items-center justify-center">
            {/* overlay */}
            <button
                className="absolute inset-0 bg-black/40"
                onClick={onClose}
                aria-label="Close"
            />
            {/* panel: bottom sheet on mobile, card on desktop */}
            <div className="relative z-10 w-full sm:max-w-3xl bg-white rounded-t-2xl sm:rounded-2xl border border-[#E3ECF9] shadow-xl overflow-hidden h-[85vh] sm:h-auto sm:max-h-[80vh] flex flex-col">
                {/* Header (sticky) */}
                <div className="sticky top-0 z-10 bg-white border-b border-[#E3ECF9]">
                    <div className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-2 text-base sm:text-lg font-semibold text-[#002353]">
                            <FaInfoCircle className="text-[#3871C1]" />
                            <span>How the Property Score works</span>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-3 py-2 rounded-lg border border-[#BFD3FF] bg-white text-[#0B2B57] text-sm font-semibold hover:bg-[#F5FAFF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3871C1]"
                        >
                            Close
                        </button>
                    </div>

                    {/* Tabs (full-width on mobile, compact on desktop) */}
                    <div className="px-4 pb-3">
                        <div className="flex sm:inline-flex w-full sm:w-auto rounded-lg border border-[#E3ECF9] bg-[#F7FAFF] p-1 gap-1">
                            <button
                                type="button"
                                onClick={() => setTab('rent')}
                                className={`flex-1 sm:flex-none px-3 py-2 text-sm rounded-md transition ${tab === 'rent'
                                    ? 'bg-white border border-[#D2E4FF] text-[#002353] font-semibold'
                                    : 'text-[#5C7188] hover:text-[#002353]'}`}
                            >
                                For Rent
                            </button>
                            <button
                                type="button"
                                onClick={() => setTab('buy')}
                                className={`flex-1 sm:flex-none px-3 py-2 text-sm rounded-md transition ${tab === 'buy'
                                    ? 'bg-white border border-[#D2E4FF] text-[#002353] font-semibold'
                                    : 'text-[#5C7188] hover:text-[#002353]'}`}
                            >
                                For Sale
                            </button>
                        </div>
                    </div>
                </div>

                {/* Body (scrollable) */}
                <div className="p-3 sm:p-4 overflow-y-auto flex-1">
                    {tab === 'rent' ? <RentScoreTable /> : <BuyScoreTable />}
                    <p className="text-[11px] sm:text-xs text-[#8CA1C6] mt-3">
                        Notes: Description partial credit applies if text is below 200 characters. Photo partial credit applies if fewer than 5 photos or low quality. Video partial credit applies if quality is poor or duration is under 30 seconds.
                    </p>
                </div>
            </div>
        </div>
    );
};

/* ---------- Responsive table helpers ---------- */
const T = ({ children }: { children: React.ReactNode }) => (
    <div className="overflow-x-auto -mx-1 sm:mx-0">
        <table className="min-w-[640px] sm:min-w-0 w-full text-xs sm:text-sm border border-[#E3ECF9] rounded-lg overflow-hidden">
            {children}
        </table>
    </div>
);

const TH = ({ children }: { children: React.ReactNode }) => (
    <th className="bg-[#F5F8FF] text-[#0B2B57] font-semibold text-left px-3 py-2 border-b border-[#E3ECF9] whitespace-nowrap">
        {children}
    </th>
);

const TD = ({ children }: { children: React.ReactNode }) => (
    <td className="px-3 py-2 border-b border-[#EAF2FF] align-top">
        {children}
    </td>
);

const SectionHead = ({ title, points }: { title: string; points: number }) => (
    <tr>
        <td colSpan={3} className="bg-[#FAFCFF] text-[#002353] font-semibold px-3 py-2 border-b border-[#E3ECF9]">
            {title} <span className="text-[#5C7188] font-normal">({points} pts)</span>
        </td>
    </tr>
);

/* ---- RENT table ---- */
const RentScoreTable: React.FC = () => (
    <div className="space-y-4">
        <T>
            <thead>
                <tr>
                    <TH>Item</TH>
                    <TH>Full Points</TH>
                    <TH>If Not Met</TH>
                </tr>
            </thead>
            <tbody>
                <SectionHead title="Property Information" points={35} />
                <tr><TD>Title</TD><TD>2</TD><TD>0 if missing</TD></tr>
                <tr><TD>Address</TD><TD>4</TD><TD>0 if missing</TD></tr>
                <tr><TD>Price (monthly)</TD><TD>5</TD><TD>0 if missing</TD></tr>
                <tr><TD>Lease Term</TD><TD>3</TD><TD>0 if missing</TD></tr>
                <tr><TD>Size (sqm / floor area)</TD><TD>6</TD><TD>0 if missing</TD></tr>
                <tr><TD>Bedrooms</TD><TD>5</TD><TD>0 if missing</TD></tr>
                <tr><TD>Bathrooms</TD><TD>3</TD><TD>0 if missing</TD></tr>
                <tr><TD>Description (≥200 chars)</TD><TD>7</TD><TD>4 if &lt;200, 0 if missing</TD></tr>

                <SectionHead title="Amenities & Tags" points={10} />
                <tr><TD>Amenities (min. 5)</TD><TD>6</TD><TD>3 if &lt;5, 0 if none</TD></tr>
                <tr><TD>Tags / Keywords (min. 5)</TD><TD>4</TD><TD>2 if &lt;5, 0 if none</TD></tr>

                <SectionHead title="Media Quality" points={30} />
                <tr><TD>Photos (≥5 clear, HD)</TD><TD>10</TD><TD>5 if &lt;5 or low-quality, 0 if none</TD></tr>
                <tr><TD>Video (walk-through / drone)</TD><TD>20</TD><TD>10 if poor / &lt;30s, 0 if none</TD></tr>

                <SectionHead title="Reviews & Ratings" points={25} />
                <tr><TD>Number of Reviews (min. 5)</TD><TD>10</TD><TD>5 if 1–4, 0 if none</TD></tr>
                <tr><TD>Average Rating (1–5 stars)</TD><TD>10</TD><TD>5 if &lt;4★, 0 if &lt;3★</TD></tr>
                <tr><TD>Verified Reviewer</TD><TD>5</TD><TD>0 if not verified</TD></tr>
            </tbody>
        </T>
    </div>
);

/* ---- BUY table ---- */
const BuyScoreTable: React.FC = () => (
    <div className="space-y-4">
        <T>
            <thead>
                <tr>
                    <TH>Item</TH>
                    <TH>Full Points</TH>
                    <TH>If Not Met</TH>
                </tr>
            </thead>
            <tbody>
                <SectionHead title="Property Information" points={30} />
                <tr><TD>Title</TD><TD>2</TD><TD>—</TD></tr>
                <tr><TD>Address</TD><TD>4</TD><TD>—</TD></tr>
                <tr><TD>Price</TD><TD>4</TD><TD>—</TD></tr>
                <tr><TD>Lease Term / Sale Type</TD><TD>2</TD><TD>—</TD></tr>
                <tr><TD>Size (sqm / lot/floor area)</TD><TD>6</TD><TD>—</TD></tr>
                <tr><TD>Bedrooms</TD><TD>4</TD><TD>—</TD></tr>
                <tr><TD>Bathrooms</TD><TD>3</TD><TD>—</TD></tr>
                <tr><TD>Description (≥200 chars)</TD><TD>5</TD><TD>3 if &lt;200, 0 if missing</TD></tr>

                <SectionHead title="Amenities & Tags" points={10} />
                <tr><TD>Amenities (min. 5)</TD><TD>6</TD><TD>3 if &lt;5, 0 if none</TD></tr>
                <tr><TD>Tags / Keywords (min. 5)</TD><TD>4</TD><TD>2 if &lt;5, 0 if none</TD></tr>

                <SectionHead title="Media Quality" points={30} />
                <tr><TD>Photos (≥5 clear, HD)</TD><TD>10</TD><TD>5 if &lt;5 or low-quality, 0 if none</TD></tr>
                <tr><TD>Video (walk-through / drone)</TD><TD>20</TD><TD>10 if poor / &lt;30s, 0 if none</TD></tr>

                <SectionHead title="Essential Documents" points={30} />
                <tr><TD>Title Deed / TCT or CCT</TD><TD>4.3</TD><TD>0 if missing</TD></tr>
                <tr><TD>Deed of Absolute Sale (DOAS)</TD><TD>4.3</TD><TD>0 if missing</TD></tr>
                <tr><TD>Tax Declaration</TD><TD>4.3</TD><TD>0 if missing</TD></tr>
                <tr><TD>Latest Property Tax Receipts</TD><TD>4.3</TD><TD>0 if missing</TD></tr>
                <tr><TD>Encumbrance Certificate</TD><TD>4.3</TD><TD>0 if missing</TD></tr>
                <tr><TD>BIR Certificate Authorizing Registration (CAR)</TD><TD>4.3</TD><TD>0 if missing</TD></tr>
                <tr><TD>Transfer Tax Clearance (LGU)</TD><TD>4.2</TD><TD>0 if missing</TD></tr>
            </tbody>
        </T>
    </div>
);
