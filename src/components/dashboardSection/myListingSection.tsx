// MyListingsSection.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/dashboard/Card';
import { Badge } from '@/components/ui/dashboard/Badge';
import { Building2, Home, Key, MapPin, Calendar, LucideIcon } from 'lucide-react';
import { useMyBuyListings } from '@/features/buy/hooks';
import { useMyRentListings } from '@/features/rent/hooks';
// import ListingEditModal from '../ui/dashboard/ListingEditModal';


type ListingType = 'buy' | 'rent';
type FilterKey = 'all' | 'sell-buy' | 'sell-rent';
type SortKey = 'newest' | 'oldest' | 'price-desc' | 'price-asc';

const FILTERS: { key: FilterKey; label: string; icon?: LucideIcon }[] = [
    { key: 'all', label: 'All Listings', icon: Key },
    { key: 'sell-buy', label: 'My Buy Listings', icon: Building2 },
    { key: 'sell-rent', label: 'My Rent Listings', icon: Home },
];

const SORTS: { key: SortKey; label: string }[] = [
    { key: 'newest', label: 'Newest' },
    { key: 'oldest', label: 'Oldest' },
    { key: 'price-desc', label: 'Price: high → low' },
    { key: 'price-asc', label: 'Price: low → high' },
];

type Props = {
    title?: string;
    subtitle?: string;
    id?: string;
    pageSize?: number;
};

/** Internal row model used by the section */

type UnknownRecord = Record<string, unknown>;

export type ListingRow = {
    id: string;
    slug?: string;
    type: ListingType;
    name: string;
    address: string;
    image?: string;
    price: number;
    createdAt?: string; // ISO
    status: 'pending' | 'completed' | 'unavailable';
    raw?: UnknownRecord;
};



// --- styling helpers ---
const typeChip = (type: ListingType) => {
    switch (type) {
        case 'buy':
            return 'bg-[#E7F0FF] text-[#3871C1] border-[#CFE0FF]';
        case 'rent':
            return 'bg-[#E7F0FF] text-[#3871C1] border-[#CFE0FF]';
    }
};
const statusChip = (status: ListingRow['status']) => {
    switch (status) {
        case 'completed':
            return 'bg-[#E6F8F0] text-[#0B8F55] border-[#AEE5C9]';
        case 'pending':
            return 'bg-[#FFF7E6] text-[#C77800] border-[#FFD58A]';
        case 'unavailable':
            return 'bg-[#FFE9E9] text-[#D12B2B] border-[#FFB3B3]';
        default:
            return 'bg-[#ECF1F8] text-[#5C7188] border-[#E0E8F5]';
    }
};
const getTypeIcon = (type: ListingType) => {
    const Icon: LucideIcon = type === 'buy' ? Building2 : Home;
    return <Icon className="h-4 w-4" />;
};

// --- utils ---
const pad = (n: number) => String(n).padStart(2, '0');
const toLocalYMD = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseLocalDate = (isoDate?: string) => {
    if (!isoDate) return new Date();
    const d = new Date(isoDate);
    return Number.isNaN(d.valueOf()) ? new Date() : d;
};
const formatDate = (iso?: string) =>
    new Intl.DateTimeFormat('en-PH', { year: 'numeric', month: 'short', day: 'numeric' }).format(
        parseLocalDate(iso)
    );
const formatCurrencyPHP = (amount: number) =>
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(
        amount
    );
const firstImageUrl = (images?: unknown[]): string | undefined => {
    if (!Array.isArray(images) || images.length === 0) return undefined;
    const first = images[0];
    if (!first) return undefined;
    if (typeof first === 'string') return first;
    if (typeof (first as { url?: unknown }).url === 'string') {
        return (first as { url: string }).url;
    }
    if (typeof first === 'object' && first !== null && 'image' in first) {
        const img = (first as { image?: { url?: unknown } }).image;
        if (typeof img?.url === 'string') return img.url;
    }
    return undefined;
};

// --- mapping from API → rows ---
function mapBuyListing(b: UnknownRecord): ListingRow {
    const isCompleted = Boolean((b as { buyer_id?: unknown }).buyer_id);
    const isUnavailable = (b as { is_available?: boolean }).is_available === false;

    return {
        id: String((b as { id?: unknown })?.id ?? (b as { slug?: unknown })?.slug ?? crypto.randomUUID()),
        slug: (b as { slug?: string })?.slug,
        type: 'buy',
        name: (b as { name?: string })?.name ?? 'Untitled',
        address: (b as { address?: string })?.address ?? '',
        image: firstImageUrl((b as { images?: unknown[] })?.images),
        price: Number((b as { price?: unknown })?.price ?? 0),
        createdAt: (b as { created_at?: string })?.created_at ?? toLocalYMD(new Date()),
        status: isCompleted ? 'completed' : isUnavailable ? 'unavailable' : 'pending',
        raw: b,
    };
}

function mapRentListing(r: UnknownRecord): ListingRow {
    return {
        id: String((r as { id?: unknown })?.id ?? (r as { slug?: unknown })?.slug ?? crypto.randomUUID()),
        slug: (r as { slug?: string })?.slug,
        type: 'rent',
        name: (r as { name?: string })?.name ?? 'Untitled',
        address: (r as { address?: string })?.address ?? '',
        image: firstImageUrl((r as { images?: unknown[] })?.images),
        price: Number((r as { price?: unknown })?.price ?? 0),
        createdAt: (r as { created_at?: string })?.created_at ?? toLocalYMD(new Date()),
        status: 'pending',
        raw: r,
    };
}


// --- Component ---
const MyListingsSection: React.FC<Props> = ({
    title = 'My Listings',
    subtitle = 'Manage your buy and rent listings',
    id = 'myListingsSection',
    pageSize = 6,
}) => {
    const { data: buyListings = [], isLoading: loadingBuy, isError: errorBuy } = useMyBuyListings();
    const { data: rentListings = [], isLoading: loadingRent, isError: errorRent } = useMyRentListings();

    const rows = useMemo(() => {
        const buyRows = (buyListings ?? []).map(mapBuyListing);
        const rentRows = (rentListings ?? []).map(mapRentListing);
        return [...buyRows, ...rentRows];
    }, [buyListings, rentListings]);

    const [filter, setFilter] = useState<FilterKey>('all');
    const [sort, setSort] = useState<SortKey>('newest');

    const counts = useMemo(
        () => ({
            all: rows.length,
            buy: rows.filter((r) => r.type === 'buy').length,
            rent: rows.filter((r) => r.type === 'rent').length,
        }),
        [rows]
    );

    const filtered = useMemo(() => {
        switch (filter) {
            case 'sell-buy':
                return rows.filter((r) => r.type === 'buy');
            case 'sell-rent':
                return rows.filter((r) => r.type === 'rent');
            case 'all':
            default:
                return rows;
        }
    }, [rows, filter]);

    const sorted = useMemo(() => {
        const copy = [...filtered];
        switch (sort) {
            case 'oldest':
                copy.sort((a, b) => parseLocalDate(a.createdAt).getTime() - parseLocalDate(b.createdAt).getTime());
                break;
            case 'price-desc':
                copy.sort((a, b) => b.price - a.price);
                break;
            case 'price-asc':
                copy.sort((a, b) => a.price - b.price);
                break;
            case 'newest':
            default:
                copy.sort((a, b) => parseLocalDate(b.createdAt).getTime() - parseLocalDate(a.createdAt).getTime());
                break;
        }
        return copy;
    }, [filtered, sort]);

    // pagination
    const [page, setPage] = useState(1);
    const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
    useEffect(() => setPage(1), [filter, sort, pageSize, rows.length]);
    useEffect(() => setPage((p) => Math.min(p, totalPages)), [totalPages]);
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const pageItems = sorted.slice(start, end);

    const isLoading = loadingBuy || loadingRent;
    const isError = errorBuy || errorRent;

    // const [editOpen, setEditOpen] = useState(false);
    // const [selected, setSelected] = useState<ListingRow | null>(null);

    // const openEditor = (item: ListingRow) => {
    //     setSelected(item);
    //     setEditOpen(true);
    // };

    return (
        <motion.section
            id={id}
            className="text-[#002353] w-full bg-white pt-12 md:pt-[144px] pb-16 md:pb-20"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-[70px]">
                <div className="mb-6">
                    <h2 className="text-2xl md:text-3xl font-bold">{title}</h2>
                    <p className="text-sm md:text-base text-[#5C7188] mt-1">{subtitle}</p>
                </div>

                <Card className="p-6 sm:p-8 border border-[#E8EEF8] bg-white rounded-2xl sm:rounded-[30px] shadow-[4px_10px_30px_0_rgba(0,0,0,0.06)]">
                    {/* Filters + sort */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
                        <div className="flex flex-wrap gap-2">
                            {FILTERS.map(({ key, label, icon: Icon }) => {
                                const isActive = filter === key;
                                const countBadge = key === 'all' ? counts.all : key === 'sell-buy' ? counts.buy : counts.rent;
                                return (
                                    <button
                                        key={key}
                                        type="button"
                                        aria-pressed={isActive}
                                        onClick={() => setFilter(key)}
                                        className={`px-4 py-2 text-sm font-medium rounded-full transition border focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3871C1] ${isActive
                                            ? 'bg-[#3871C1] text-white border-[#3871C1] shadow-[0_8px_20px_rgba(56,113,193,0.3)]'
                                            : 'bg-white text-[#3871C1] border-[#CFE0FF] hover:bg-[#F5F8FF]'
                                            }`}
                                    >
                                        <span className="inline-flex items-center gap-2">
                                            {Icon ? <Icon className="h-4 w-4" /> : null}
                                            {label}
                                            <span className="text-[#3871C1] ml-1 inline-flex items-center justify-center min-w-[1.5rem] h-6 px-2 rounded-full text-xs border border-[#CFE0FF] bg-[#F5F8FF]">
                                                {countBadge}
                                            </span>
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="flex items-center gap-2 relative">
                            <label htmlFor="listingSort" className="text-sm text-[#5C7188]">
                                Sort:
                            </label>
                            <select
                                id="listingSort"
                                value={sort}
                                onChange={(e) => setSort(e.target.value as SortKey)}
                                className="text-sm rounded-full border border-[#CFE0FF] px-3 py-2 pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-[#3871C1] bg-white"
                            >
                                {SORTS.map((s) => (
                                    <option key={s.key} value={s.key}>
                                        {s.label}
                                    </option>
                                ))}
                            </select>
                            <svg
                                className="w-4 h-4 absolute top-1/2 right-3 -translate-y-1/2 pointer-events-none"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="#5C7188"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>
                    </div>

                    {/* Loading / Error */}
                    {isLoading && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={`skeleton-${i}`} className="h-40 rounded-2xl bg-[#F5F8FF] border border-[#E8EEF8] animate-pulse" />
                            ))}
                        </div>
                    )}

                    {isError && !isLoading && (
                        <div className="text-center py-10">
                            <Key className="h-12 w-12 text-[#D12B2B] mx-auto mb-2" />
                            <p className="text-[#D12B2B]">We couldn’t load your listings. Please retry.</p>
                        </div>
                    )}

                    {/* Grid */}
                    {!isLoading && !isError && (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {pageItems.map((item, i) => (
                                    <button
                                        key={item.id}
                                        className="text-left border border-[#E8EEF8] bg-white rounded-2xl overflow-hidden hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)] transition-all focus:outline-none focus:ring-2 focus:ring-[#3871C1]"
                                        aria-label={`Edit ${item.name}`}
                                    >
                                        {/* Image */}
                                        <div className="relative w-full h-40 bg-[#F5F8FF]">
                                            {item.image ? (
                                                <Image
                                                    src={item.image}
                                                    alt={item.name}
                                                    fill
                                                    className="object-cover"
                                                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                                                    priority={i < 3}
                                                />
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center text-[#9CB6D6]">
                                                    {getTypeIcon(item.type)}
                                                </div>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="p-4">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <h4 className="font-semibold truncate">{item.name}</h4>
                                                    <div className="flex items-center gap-1 mt-1">
                                                        <MapPin className="h-3.5 min-w-3.5 text-[#5C7188]" />
                                                        <p className="text-sm text-[#5C7188] truncate">{item.address}</p>
                                                    </div>
                                                </div>

                                                <div className="text-right flex-shrink-0">
                                                    <div className="font-semibold">{formatCurrencyPHP(item.price)}</div>
                                                    <div className="flex items-center gap-1 mt-1 justify-end text-xs text-[#5C7188]">
                                                        <Calendar className="h-3.5 w-3.5" />
                                                        <time dateTime={item.createdAt}>{formatDate(item.createdAt)}</time>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-3 flex items-center gap-2 font-normal">
                                                <Badge variant="outline" className={`${typeChip(item.type)} border rounded-md`}>
                                                    <span className="inline-flex items-center gap-1 py-1">
                                                        {getTypeIcon(item.type)}
                                                        <span className="capitalize">{item.type} listing</span>
                                                    </span>
                                                </Badge>
                                                <Badge variant="outline" className={`${statusChip(item.status)} border rounded-md py-1.5`}>
                                                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                                                </Badge>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {/* Empty state */}
                            {sorted.length === 0 && (
                                <div className="text-center py-12">
                                    <Key className="h-12 w-12 text-[#5C7188] mx-auto mb-2" />
                                    <p className="text-[#5C7188]">You don’t have any listings yet.</p>
                                </div>
                            )}

                            {/* Pagination */}
                            {sorted.length > 0 && (
                                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#E8EEF8] pt-4">
                                    <p className="text-sm text-[#5C7188]">
                                        Showing <span className="font-medium">{sorted.length === 0 ? 0 : start + 1}</span>–
                                        <span className="font-medium">{Math.min(end, sorted.length)}</span> of{' '}
                                        <span className="font-medium">{sorted.length}</span>
                                    </p>

                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                                            disabled={page === 1}
                                            className={`px-3 py-2 text-sm rounded-full border transition ${page === 1
                                                ? 'bg-[#F5F8FF] text-[#9CB6D6] border-[#E0E8F5] cursor-not-allowed'
                                                : 'bg-white text-[#3871C1] border-[#CFE0FF] hover:bg-[#F5F8FF]'
                                                }`}
                                            aria-label="Previous page"
                                        >
                                            Prev
                                        </button>

                                        <span className="text-sm text-[#5C7188]">
                                            Page <span className="font-medium">{page}</span> of{' '}
                                            <span className="font-medium">{totalPages}</span>
                                        </span>

                                        <button
                                            type="button"
                                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                            disabled={page === totalPages}
                                            className={`px-3 py-2 text-sm rounded-full border transition ${page === totalPages
                                                ? 'bg-[#F5F8FF] text-[#9CB6D6] border-[#E0E8F5] cursor-not-allowed'
                                                : 'bg-white text-[#3871C1] border-[#CFE0FF] hover:bg-[#F5F8FF]'
                                                }`}
                                            aria-label="Next page"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </Card>
            </div>

            {/* ⬇️ Modal */}
            {/* <ListingEditModal
                open={editOpen}
                onOpenChange={setEditOpen}
                listing={selected}
            // Optional: after successful edit/delete, you could close + rely on hooks' invalidations
            /> */}
        </motion.section>
    );
};

export default MyListingsSection;
